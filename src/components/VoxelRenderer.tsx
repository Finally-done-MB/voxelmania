import { useLayoutEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import type { Voxel } from '../types';

interface VoxelRendererProps {
  voxels: Voxel[];
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const roundedBoxGeometry = new THREE.BoxGeometry(1, 1, 1);

export function VoxelRenderer({ voxels, position = [0, 0, 0], rotation = [0, 0, 0] }: VoxelRendererProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Create a dummy object for position/rotation calculations
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    // Update instance count
    meshRef.current.count = voxels.length;

    voxels.forEach((voxel, i) => {
      dummy.position.set(voxel.x, voxel.y, voxel.z);
      dummy.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, new THREE.Color(voxel.color));
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

  }, [voxels, dummy]);

  return (
    <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : new THREE.Euler(0, 0, 0)}>
      <instancedMesh
        ref={meshRef}
        args={[roundedBoxGeometry, undefined, voxels.length]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial 
          roughness={0.5} 
          metalness={0.2}
        />
      </instancedMesh>
    </group>
  );
}
