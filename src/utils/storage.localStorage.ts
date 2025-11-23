import type { VoxelObjectData } from '../types';
import type { IStorage } from './storage.interface';

const STORAGE_KEY = 'voxel_forge_blueprints';

/**
 * LocalStorage implementation of IStorage
 * Follows Single Responsibility Principle
 */
export class LocalStorageAdapter implements IStorage {
  private storageKey: string;

  constructor(storageKey: string = STORAGE_KEY) {
    this.storageKey = storageKey;
  }

  private getStorage(): VoxelObjectData[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private setStorage(blueprints: VoxelObjectData[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(blueprints));
  }

  save(blueprint: VoxelObjectData): void {
    const existing = this.getAll();
    // Check if blueprint with same seed already exists (prevent duplicates)
    const isDuplicate = existing.some(item => 
      item.seed === blueprint.seed && 
      item.category === blueprint.category &&
      item.voxels.length === blueprint.voxels.length
    );
    
    if (isDuplicate) {
      console.log('Blueprint already saved (same seed)');
      return; // Don't save duplicates
    }
    
    const updated = [...existing, blueprint];
    this.setStorage(updated);
  }

  getAll(): VoxelObjectData[] {
    const blueprints = this.getStorage();
    // Sort by createdAt descending (newest first)
    return blueprints.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  delete(id: string): void {
    const existing = this.getAll();
    const updated = existing.filter(item => item.id !== id);
    this.setStorage(updated);
  }

  update(id: string, updates: Partial<VoxelObjectData>): void {
    const existing = this.getAll();
    const updated = existing.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    this.setStorage(updated);
  }

  getById(id: string): VoxelObjectData | null {
    const all = this.getAll();
    return all.find(item => item.id === id) || null;
  }
}
