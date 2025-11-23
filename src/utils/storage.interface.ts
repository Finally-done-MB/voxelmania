import type { VoxelObjectData } from '../types';

/**
 * Storage interface for blueprint persistence
 * Allows for different implementations (localStorage, IndexedDB, API, etc.)
 * Follows Dependency Inversion Principle
 */
export interface IStorage {
  save(blueprint: VoxelObjectData): void;
  getAll(): VoxelObjectData[];
  delete(id: string): void;
  update(id: string, updates: Partial<VoxelObjectData>): void;
  getById(id: string): VoxelObjectData | null;
}
