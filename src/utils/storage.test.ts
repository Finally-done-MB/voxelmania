import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageAdapter } from './storage.localStorage';
import { setStorage, getStorage, saveBlueprint, getSavedBlueprints, deleteBlueprint, toggleFavorite, getFavoriteBlueprints } from './storage';
import type { VoxelObjectData } from '../types';
import type { IStorage } from './storage.interface';

const mockBlueprint: VoxelObjectData = {
  id: 'test-1',
  name: 'Test Robot',
  category: 'robot',
  voxels: [],
  createdAt: Date.now(),
  seed: 12345,
};

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    adapter = new LocalStorageAdapter('test_key');
  });

  describe('save', () => {
    it('should save a blueprint', () => {
      adapter.save(mockBlueprint);
      const all = adapter.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe('test-1');
    });

    it('should append to existing blueprints', () => {
      adapter.save(mockBlueprint);
      const blueprint2: VoxelObjectData = { ...mockBlueprint, id: 'test-2', name: 'Test 2' };
      adapter.save(blueprint2);
      
      const all = adapter.getAll();
      expect(all).toHaveLength(2);
    });
  });

  describe('getAll', () => {
    it('should return empty array when no blueprints exist', () => {
      expect(adapter.getAll()).toEqual([]);
    });

    it('should sort by createdAt descending', () => {
      const old: VoxelObjectData = { ...mockBlueprint, id: 'old', createdAt: 1000 };
      const new_: VoxelObjectData = { ...mockBlueprint, id: 'new', createdAt: 2000 };
      
      adapter.save(old);
      adapter.save(new_);
      
      const all = adapter.getAll();
      expect(all[0].id).toBe('new');
      expect(all[1].id).toBe('old');
    });
  });

  describe('delete', () => {
    it('should delete a blueprint by id', () => {
      adapter.save(mockBlueprint);
      adapter.delete('test-1');
      expect(adapter.getAll()).toHaveLength(0);
    });

    it('should not delete other blueprints', () => {
      adapter.save(mockBlueprint);
      const blueprint2: VoxelObjectData = { ...mockBlueprint, id: 'test-2' };
      adapter.save(blueprint2);
      
      adapter.delete('test-1');
      const all = adapter.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe('test-2');
    });
  });

  describe('update', () => {
    it('should update a blueprint', () => {
      adapter.save(mockBlueprint);
      adapter.update('test-1', { name: 'Updated Name' });
      
      const updated = adapter.getById('test-1');
      expect(updated?.name).toBe('Updated Name');
    });

    it('should not update non-existent blueprint', () => {
      adapter.update('non-existent', { name: 'Updated' });
      expect(adapter.getById('non-existent')).toBeNull();
    });
  });

  describe('getById', () => {
    it('should return blueprint by id', () => {
      adapter.save(mockBlueprint);
      const found = adapter.getById('test-1');
      expect(found?.id).toBe('test-1');
    });

    it('should return null if not found', () => {
      expect(adapter.getById('non-existent')).toBeNull();
    });
  });
});

describe('storage functions', () => {
  let mockStorage: IStorage;
  let storageMethods: {
    save: ReturnType<typeof vi.fn>;
    getAll: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    storageMethods = {
      save: vi.fn(),
      getAll: vi.fn().mockReturnValue([]),
      delete: vi.fn(),
      update: vi.fn(),
      getById: vi.fn().mockReturnValue(null),
    };
    
    mockStorage = storageMethods as unknown as IStorage;
    setStorage(mockStorage);
  });

  describe('saveBlueprint', () => {
    it('should call storage save', () => {
      saveBlueprint(mockBlueprint);
      expect(storageMethods.save).toHaveBeenCalledWith(mockBlueprint);
    });
  });

  describe('getSavedBlueprints', () => {
    it('should call storage getAll', () => {
      getSavedBlueprints();
      expect(storageMethods.getAll).toHaveBeenCalled();
    });
  });

  describe('deleteBlueprint', () => {
    it('should call storage delete', () => {
      deleteBlueprint('test-1');
      expect(storageMethods.delete).toHaveBeenCalledWith('test-1');
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite status', () => {
      const blueprint: VoxelObjectData = { ...mockBlueprint, isFavorite: false };
      storageMethods.getById.mockReturnValue(blueprint);
      
      toggleFavorite('test-1');
      
      expect(storageMethods.getById).toHaveBeenCalledWith('test-1');
      expect(storageMethods.update).toHaveBeenCalledWith('test-1', { isFavorite: true });
    });

    it('should return empty array if blueprint not found', () => {
      storageMethods.getById.mockReturnValue(null);
      const result = toggleFavorite('non-existent');
      expect(result).toEqual([]);
    });
  });

  describe('getFavoriteBlueprints', () => {
    it('should filter favorites', () => {
      const favorites: VoxelObjectData[] = [
        { ...mockBlueprint, id: '1', isFavorite: true },
        { ...mockBlueprint, id: '2', isFavorite: false },
        { ...mockBlueprint, id: '3', isFavorite: true },
      ];
      storageMethods.getAll.mockReturnValue(favorites);
      
      const result = getFavoriteBlueprints();
      expect(result).toHaveLength(2);
      expect(result.every(b => b.isFavorite)).toBe(true);
    });
  });
});
