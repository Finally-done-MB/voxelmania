export interface Voxel {
  id: string;
  x: number;
  y: number;
  z: number;
  color: string;
}

export interface VoxelObjectData {
  id: string;
  name: string;
  category: 'robot' | 'spaceship' | 'animal' | 'monster';
  voxels: Voxel[];
  createdAt: number;
}

export type GeneratorCategory = VoxelObjectData['category'];
