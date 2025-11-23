import { useMemo, useEffect, useRef } from 'react';
import { InstancedRigidBodies, RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Voxel } from '../types';
import { addCollisionEvent, processCollisionQueue, checkGroundImpact, startDebrisAmbient, stopDebrisAmbient } from '../utils/audio';
import { useAppStore } from '../store/useAppStore';

interface DebrisFieldProps {
  voxels: Voxel[];
  mode: 'explode' | 'crumble';
}

export function DebrisField({ voxels, mode }: DebrisFieldProps) {
  const rigidBodies = useRef<RapierRigidBody[]>(null);
  const { isSfxMuted } = useAppStore();
  
  // Track previous positions and velocities for impact detection
  const previousPositions = useRef<Map<number, THREE.Vector3>>(new Map());
  const previousVelocities = useRef<Map<number, THREE.Vector3>>(new Map());
  const hasHitGround = useRef<Set<number>>(new Set()); // Track which particles have already hit ground

  const instances = useMemo(() => {
    return voxels.map((voxel) => ({
      key: voxel.id,
      position: [voxel.x, voxel.y, voxel.z] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
    }));
  }, [voxels]);

  const colors = useMemo(() => {
    return new Float32Array(
      voxels.flatMap((v) => new THREE.Color(v.color).toArray())
    );
  }, [voxels]);
  
  // Reset tracking when voxels change
  useEffect(() => {
    previousPositions.current.clear();
    previousVelocities.current.clear();
    hasHitGround.current.clear();
  }, [voxels.length]);
  
  // Start/stop ambient debris texture
  useEffect(() => {
    if (isSfxMuted) {
      stopDebrisAmbient();
    } else {
      startDebrisAmbient(mode === 'explode');
    }
    
    return () => {
      stopDebrisAmbient();
    };
  }, [isSfxMuted, mode]);

  useEffect(() => {
    if (!rigidBodies.current || rigidBodies.current.length === 0) return;

    // Small delay to ensure bodies are fully initialized
    const timeoutId = setTimeout(() => {
      if (!rigidBodies.current) return;

      // Calculate center of mass approx
      const centerX = voxels.reduce((acc, v) => acc + v.x, 0) / voxels.length;
      const centerY = voxels.reduce((acc, v) => acc + v.y, 0) / voxels.length;
      const centerZ = voxels.reduce((acc, v) => acc + v.z, 0) / voxels.length;
      const center = new THREE.Vector3(centerX, centerY, centerZ);

      // Apply forces
      rigidBodies.current.forEach((api, i) => {
        if (!api) return;
        
        // Wake up the body
        api.wakeUp();

        if (mode === 'explode') {
          const voxel = voxels[i];
          const pos = new THREE.Vector3(voxel.x, voxel.y, voxel.z);
          
          // Calculate pure radial direction from explosion center
          const toVoxel = pos.clone().sub(center);
          const distance = toVoxel.length();
          
          // Get radial direction
          let direction = toVoxel.clone();
          if (distance > 0.001) {
            direction.normalize();
          } else {
            // If voxel is at center, use random direction
            direction.set(
              Math.random() - 0.5,
              Math.random() - 0.5,
              Math.random() - 0.5
            ).normalize();
          }
          
          // Add randomness to direction
          direction.x += (Math.random() - 0.5) * 0.3;
          direction.y += (Math.random() - 0.5) * 0.3;
          direction.z += (Math.random() - 0.5) * 0.3;
          direction.normalize();
          
          // EXPLOSION: Set velocity directly for immediate effect
          // Velocity in m/s - Reduced to 50% of original power
          const baseSpeed = 40 + Math.random() * 20; // 40-60 m/s (50% of original 80-120)
          const distanceFactor = Math.max(0.6, 1 - distance / 20);
          const speed = baseSpeed * distanceFactor;
          
          const velocity = direction.multiplyScalar(speed);
          
          // Set velocity directly - this is more immediate than impulse
          api.setLinvel({ x: velocity.x, y: velocity.y, z: velocity.z }, true);
          
          // Reduced spinning (50% of original)
          api.setAngvel(
            { 
              x: (Math.random() - 0.5) * 5, 
              y: (Math.random() - 0.5) * 5, 
              z: (Math.random() - 0.5) * 5 
            },
            true
          );
        } else {
          // Crumble: Just slight nudge to wake physics and let gravity work
          api.setLinvel({ 
            x: (Math.random() - 0.5) * 0.5, 
            y: Math.random() * 1, // Slight pop up
            z: (Math.random() - 0.5) * 0.5 
          }, true);
        }
      });
    }, 50); // 50ms delay

    return () => clearTimeout(timeoutId);
  }, [mode, voxels]);

  // Collision detection and ground impact detection using useFrame
  useFrame((_, delta) => {
    if (!rigidBodies.current) {
      processCollisionQueue(isSfxMuted, delta); // Still process queue to clear it
      return;
    }

    const currentTime = performance.now();

    // Check each particle for collisions and ground impacts
    rigidBodies.current.forEach((api, i) => {
      if (!api || !api.isValid()) return;

      try {
        const translation = api.translation();
        const linvel = api.linvel();
        const currentPos = new THREE.Vector3(translation.x, translation.y, translation.z);
        const currentVel = new THREE.Vector3(linvel.x, linvel.y, linvel.z);
        const velocity = currentVel.length();
        
        const particleId = `particle-${i}`;
        const prevPos = previousPositions.current.get(i);
        const prevVel = previousVelocities.current.get(i);

        // Check for ground impact
        if (!hasHitGround.current.has(i) && checkGroundImpact(currentPos.y)) {
          // Check if particle was above ground in previous frame
          if (prevPos && prevPos.y > -4.5) {
            // Calculate impact velocity (how fast it was falling)
            const impactVelocity = Math.abs(prevVel ? prevVel.y : velocity);
            if (impactVelocity > 0.5) {
              addCollisionEvent(impactVelocity, true, particleId);
              hasHitGround.current.add(i);
            }
          }
        }

        // Check for particle-to-particle collisions using Rapier's contact pairs
        // We'll use velocity changes as a proxy for collisions
        if (prevVel && prevPos) {
          const velocityChange = currentVel.clone().sub(prevVel);
          const velocityChangeMagnitude = velocityChange.length();
          
          // If velocity changed significantly and particle is moving, likely a collision
          if (velocityChangeMagnitude > 2 && velocity > 1) {
            // Check if this is a collision (not just gravity)
            const gravityComponent = Math.abs(velocityChange.y);
            const horizontalChange = Math.sqrt(velocityChange.x ** 2 + velocityChange.z ** 2);
            
            // If horizontal velocity changed significantly, it's likely a collision
            if (horizontalChange > 1.5 || (velocityChangeMagnitude > 3 && gravityComponent < velocityChangeMagnitude * 0.7)) {
              // Use the magnitude of velocity change as collision velocity
              const collisionVelocity = Math.min(velocityChangeMagnitude, velocity);
              addCollisionEvent(collisionVelocity, false, `${particleId}-collision-${currentTime}`);
            }
          }
        }

        // Update tracking
        previousPositions.current.set(i, currentPos.clone());
        previousVelocities.current.set(i, currentVel.clone());
      } catch (e) {
        // Ignore errors from invalid bodies
      }
    });

    // Process collision queue every frame (pass mute state and delta time)
    processCollisionQueue(isSfxMuted, delta);
  });

  return (
    <InstancedRigidBodies
      ref={rigidBodies}
      instances={instances}
      colliders="cuboid"
      restitution={0.4}
      friction={0.3}
      linearDamping={0.1}
      angularDamping={0.1}
    >
      <instancedMesh args={[undefined, undefined, voxels.length]} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.95, 0.95]} /> {/* Slightly smaller to avoid immediate overlap */}
        <meshStandardMaterial roughness={0.5} metalness={0.2} />
        <instancedBufferAttribute attach="instanceColor" args={[colors, 3]} />
      </instancedMesh>
    </InstancedRigidBodies>
  );
}
