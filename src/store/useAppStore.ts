import { create } from 'zustand';
import type { VoxelObjectData } from '../types';

interface AppState {
  currentObject: VoxelObjectData | null;
  isAutoRotating: boolean;
  isScrapped: boolean; // New state for physics
  scrapMode: 'explode' | 'crumble' | null;
  isMuted: boolean;
  
  setCurrentObject: (object: VoxelObjectData) => void;
  toggleAutoRotation: () => void;
  setScrapped: (scrapped: boolean, mode?: 'explode' | 'crumble') => void;
  toggleMute: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentObject: null,
  isAutoRotating: true,
  isScrapped: false,
  scrapMode: null,
  isMuted: true, // Default to muted to respect autoplay policies

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
}));
