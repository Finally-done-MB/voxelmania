import type { VoxelObjectData } from '../types';

/**
 * Generator interface for creating voxel objects
 * Follows Open/Closed Principle - open for extension, closed for modification
 */
export interface IGenerator {
  /**
   * Generate a voxel object
   * @param seed Optional seed for reproducible generation
   * @returns Generated voxel object data
   */
  generate(seed?: number): VoxelObjectData;
}

/**
 * Base generator class with common functionality
 * Follows Single Responsibility Principle
 */
export abstract class BaseGenerator implements IGenerator {
  abstract generate(seed?: number): VoxelObjectData;

  /**
   * Create a VoxelObjectData object with common fields
   */
  protected createVoxelObjectData(
    name: string,
    category: VoxelObjectData['category'],
    voxels: VoxelObjectData['voxels'],
    seed?: number
  ): VoxelObjectData {
    return {
      id: `${category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      category,
      voxels,
      createdAt: Date.now(),
      seed,
    };
  }
}
