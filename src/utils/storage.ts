import type { VoxelObjectData } from '../types';

const STORAGE_KEY = 'voxel_forge_blueprints';

export function saveBlueprint(object: VoxelObjectData) {
  const existing = getSavedBlueprints();
  const updated = [...existing, object];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getSavedBlueprints(): VoxelObjectData[] {
  const data = localStorage.getItem(STORAGE_KEY);
  const blueprints = data ? JSON.parse(data) : [];
  // Sort by createdAt descending (newest first)
  return blueprints.sort((a: VoxelObjectData, b: VoxelObjectData) => 
    (b.createdAt || 0) - (a.createdAt || 0)
  );
}

export function deleteBlueprint(blueprintId: string) {
  const existing = getSavedBlueprints();
  const updated = existing.filter(item => item.id !== blueprintId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function toggleFavorite(blueprintId: string) {
  const existing = getSavedBlueprints();
  const updated = existing.map(item => 
    item.id === blueprintId 
      ? { ...item, isFavorite: !item.isFavorite }
      : item
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function getFavoriteBlueprints(): VoxelObjectData[] {
  // getSavedBlueprints already sorts by date, so favorites will be sorted too
  return getSavedBlueprints().filter(item => item.isFavorite);
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
