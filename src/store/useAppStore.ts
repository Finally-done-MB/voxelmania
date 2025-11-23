import { create } from 'zustand';
import type { VoxelObjectData } from '../types';

interface AppState {
  currentObject: VoxelObjectData | null;
  isAutoRotating: boolean;
  isScrapped: boolean; // New state for physics
  scrapMode: 'explode' | 'crumble' | null;
  isMuted: boolean;
  isSfxMuted: boolean;
  isExporting: boolean; // Hide floor grid during export
  savedItems: VoxelObjectData[]; // Gallery items
  
  setCurrentObject: (object: VoxelObjectData) => void;
  updateCurrentObjectName: (name: string) => void;
  toggleAutoRotation: () => void;
  setScrapped: (scrapped: boolean, mode?: 'explode' | 'crumble') => void;
  toggleMute: () => void;
  toggleSfxMute: () => void;
  setExporting: (exporting: boolean) => void;
  setSavedItems: (items: VoxelObjectData[]) => void;
  refreshSavedItems: () => void; // Helper to reload from storage
}

export const useAppStore = create<AppState>((set) => ({
  currentObject: null,
  isAutoRotating: true,
  isScrapped: false,
  scrapMode: null,
  isMuted: true, // Music starts muted (muted autoplay)
  isSfxMuted: false, // SFX ON by default
  isExporting: false,
  savedItems: [],

  setCurrentObject: (object) => set({ 
    currentObject: object, 
    isScrapped: false, 
    scrapMode: null,
    isAutoRotating: true // Always start rotating when new object is generated
  }),
  
  updateCurrentObjectName: (name) => set((state) => {
    if (!state.currentObject) return state;
    return {
      currentObject: {
        ...state.currentObject,
        name: name.trim() || state.currentObject.name
      }
    };
  }),
  
  toggleAutoRotation: () => set((state) => ({ isAutoRotating: !state.isAutoRotating })),
  
  setScrapped: (scrapped, mode) => set({ 
    isScrapped: scrapped, 
    scrapMode: mode || null,
    isAutoRotating: !scrapped // Stop rotation when scrapped
  }),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleSfxMute: () => set((state) => ({ isSfxMuted: !state.isSfxMuted })),
  setExporting: (exporting) => set({ isExporting: exporting }),
  setSavedItems: (items) => set({ savedItems: items }),
  refreshSavedItems: () => {
    // Dynamically import to avoid circular dependency
    import('../utils/storage').then(({ getSavedBlueprints }) => {
      set({ savedItems: getSavedBlueprints() });
    });
  },
}));
