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
  
  setCurrentObject: (object: VoxelObjectData) => void;
  toggleAutoRotation: () => void;
  setScrapped: (scrapped: boolean, mode?: 'explode' | 'crumble') => void;
  toggleMute: () => void;
  toggleSfxMute: () => void;
  setExporting: (exporting: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentObject: null,
  isAutoRotating: true,
  isScrapped: false,
  scrapMode: null,
  isMuted: false, // Music ON by default
  isSfxMuted: false, // SFX ON by default
  isExporting: false,

  setCurrentObject: (object) => set({ 
    currentObject: object, 
    isScrapped: false, 
    scrapMode: null,
    isAutoRotating: true // Always start rotating when new object is generated
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
}));
