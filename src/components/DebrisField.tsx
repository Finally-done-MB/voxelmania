import { useMemo, useEffect, useRef, useState } from 'react';
import { InstancedRigidBodies, RapierRigidBody } from '@react-three/rapier';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Voxel } from '../types';
import { addCollisionEvent, processCollisionQueue, checkGroundImpact, startDebrisAmbient, stopDebrisAmbient, playClickImpactSound } from '../utils/audio';
import { useAppStore } from '../store/useAppStore';

interface DebrisFieldProps {
  voxels: Voxel[];
  mode: 'explode' | 'crumble';
}

export function DebrisField({ voxels, mode }: DebrisFieldProps) {
  const rigidBodies = useRef<RapierRigidBody[]>(null);
  const { isSfxMuted } = useAppStore();
  const { camera, raycaster, gl } = useThree();
  const [clickPoint, setClickPoint] = useState<THREE.Vector3 | null>(null);
  
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
  
  // Handle click interactions to apply forces
  useEffect(() => {
    let isDragging = false;
    let mouseDownTime = 0;
    let mouseDownPos: { x: number; y: number } | null = null;
    const DRAG_THRESHOLD = 5; // pixels
    const CLICK_TIME_THRESHOLD = 200; // ms
    
    const handleMouseDown = (event: MouseEvent) => {
      isDragging = false;
      mouseDownTime = performance.now();
      mouseDownPos = { x: event.clientX, y: event.clientY };
    };
    
    const handleMouseMove = (event: MouseEvent) => {
      if (mouseDownPos) {
        const dx = event.clientX - mouseDownPos.x;
        const dy = event.clientY - mouseDownPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > DRAG_THRESHOLD) {
          isDragging = true;
        }
      }
    };
    
    const handleMouseUp = () => {
      mouseDownPos = null;
    };
    
    const handleClick = (event: MouseEvent) => {
      // Only apply force if it was a quick click, not a drag
      const clickDuration = performance.now() - mouseDownTime;
      if (isDragging || clickDuration > CLICK_TIME_THRESHOLD) {
        return;
      }
      
      if (!rigidBodies.current || rigidBodies.current.length === 0) return;
      
      // Get mouse position in normalized device coordinates (-1 to +1)
      const rect = gl.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Raycast from camera through mouse position
      raycaster.setFromCamera(mouse, camera);
      
      // First, try to find intersection with particles themselves
      // We'll check particles and find the closest one, or use a plane intersection
      const rayOrigin = raycaster.ray.origin;
      const rayDirection = raycaster.ray.direction.clone().normalize();
      
      // Find intersection with ground plane (y = -4.5) as fallback
      const groundY = -4.5;
      const t = (groundY - rayOrigin.y) / rayDirection.y;
      let worldPoint: THREE.Vector3;
      
      if (t > 0 && t < 100) {
        // Intersection with ground plane
        worldPoint = rayOrigin.clone().add(rayDirection.multiplyScalar(t));
      } else {
        // If no ground intersection, use a point along the ray at reasonable distance
        worldPoint = rayOrigin.clone().add(rayDirection.multiplyScalar(20));
      }
      
      // Also check for closest particle to the ray for better accuracy
      let closestParticle: { index: number; distance: number; point: THREE.Vector3 } | null = null;
      
      rigidBodies.current.forEach((api, i) => {
        if (!api || !api.isValid()) return;
        
        try {
          const translation = api.translation();
          const particlePos = new THREE.Vector3(translation.x, translation.y, translation.z);
          
          // Distance from ray to particle
          const toParticle = particlePos.clone().sub(rayOrigin);
          const projectionLength = toParticle.dot(rayDirection);
          const projection = rayDirection.clone().multiplyScalar(projectionLength);
          const closestPointOnRay = rayOrigin.clone().add(projection);
          const distanceToRay = particlePos.distanceTo(closestPointOnRay);
          
          // If particle is close to ray and in front of camera
          if (distanceToRay < 2 && projectionLength > 0 && projectionLength < 50) {
            if (!closestParticle || distanceToRay < closestParticle.distance) {
              closestParticle = {
                index: i,
                distance: distanceToRay,
                point: particlePos.clone()
              };
            }
          }
        } catch (e) {
          // Ignore errors
        }
      });
      
      // Use closest particle point if found, otherwise use plane intersection
      if (closestParticle) {
        worldPoint = closestParticle.point;
      }
      
      setClickPoint(worldPoint.clone());
      
      // Find particles within radius of click point
      const impactRadius = 3; // Radius of impact
      const impactForce = 125; // Force magnitude (increased from 25)
      let affectedCount = 0;
      
      rigidBodies.current.forEach((api, i) => {
        if (!api || !api.isValid()) return;
        
        try {
          const translation = api.translation();
          const particlePos = new THREE.Vector3(translation.x, translation.y, translation.z);
          const distance = particlePos.distanceTo(worldPoint);
          
          if (distance < impactRadius) {
            // Calculate direction from click point to particle
            const direction = particlePos.clone().sub(worldPoint).normalize();
            
            // Apply force based on distance (closer = stronger)
            const distanceFactor = 1 - (distance / impactRadius);
            const force = impactForce * distanceFactor;
            
            // Get current velocity
            const linvel = api.linvel();
            const currentVel = new THREE.Vector3(linvel.x, linvel.y, linvel.z);
            
            // Add impulse in the direction away from click point
            const impulse = direction.multiplyScalar(force);
            const newVel = currentVel.add(impulse);
            
            api.setLinvel({ x: newVel.x, y: newVel.y, z: newVel.z }, true);
            api.wakeUp();
            
            affectedCount++;
          }
        } catch (e) {
          // Ignore errors
        }
      });
      
      // Play sound effect if particles were affected
      if (affectedCount > 0 && !isSfxMuted) {
        // Play low-pitched "pew" or "bam" sound for click impact
        playClickImpactSound();
      }
      
      // Clear click point after a short delay (for potential visual feedback)
      setTimeout(() => setClickPoint(null), 100);
    };
    
    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('mouseup', handleMouseUp);
    gl.domElement.addEventListener('click', handleClick);
    
    return () => {
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('mouseup', handleMouseUp);
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [rigidBodies, camera, raycaster, gl, isSfxMuted]);

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
