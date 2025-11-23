import type { VoxelObjectData } from '../types';
import { LocalStorageAdapter } from './storage.localStorage';
import type { IStorage } from './storage.interface';

// Default storage instance (can be swapped for testing or different implementations)
let storageInstance: IStorage = new LocalStorageAdapter();

/**
 * Set storage implementation (useful for testing or different backends)
 * Follows Dependency Inversion Principle
 */
export function setStorage(storage: IStorage): void {
  storageInstance = storage;
}

/**
 * Get current storage instance
 */
export function getStorage(): IStorage {
  return storageInstance;
}

// Legacy function exports for backward compatibility
export function saveBlueprint(object: VoxelObjectData) {
  storageInstance.save(object);
}

export function getSavedBlueprints(): VoxelObjectData[] {
  return storageInstance.getAll();
}

export function deleteBlueprint(blueprintId: string) {
  storageInstance.delete(blueprintId);
}

export function toggleFavorite(blueprintId: string) {
  const blueprint = storageInstance.getById(blueprintId);
  if (!blueprint) return [];
  
  storageInstance.update(blueprintId, {
    isFavorite: !blueprint.isFavorite,
  });
  
  return storageInstance.getAll();
}

export function getFavoriteBlueprints(): VoxelObjectData[] {
  return storageInstance.getAll().filter(item => item.isFavorite);
}

export function exportBlueprint(object: VoxelObjectData) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(object));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `${object.name.replace(/\s+/g, '_')}.json`);
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export function importBlueprint(file: File): Promise<VoxelObjectData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        // Basic validation
        if (data.voxels && Array.isArray(data.voxels)) {
            resolve(data);
        } else {
            reject(new Error("Invalid blueprint file"));
        }
      } catch (e) {
        reject(e);
      }
    };
    reader.readAsText(file);
  });
}
