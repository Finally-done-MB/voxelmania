import { useMemo, useEffect, useRef } from 'react';
import { InstancedRigidBodies, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import type { Voxel } from '../types';

interface DebrisFieldProps {
  voxels: Voxel[];
  mode: 'explode' | 'crumble';
}

export function DebrisField({ voxels, mode }: DebrisFieldProps) {
  const rigidBodies = useRef<RapierRigidBody[]>(null);

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
