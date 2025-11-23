export interface Palette {
  primary: string;
  secondary: string;
  accent: string;
  detail: string;
  dark: string;
}

export const ROBOT_PALETTES: Palette[] = [
  { // Industrial
    primary: '#F2C94C', // Yellow
    secondary: '#333333', // Dark Grey
    accent: '#EB5757', // Red
    detail: '#BDBDBD', // Silver
    dark: '#1A1A1A'
  },
  { // Sci-Fi Blue
    primary: '#2F80ED', // Blue
    secondary: '#E0E0E0', // White
    accent: '#56CCF2', // Cyan
    detail: '#828282', // Grey
    dark: '#1F2937'
  },
  { // Military
    primary: '#4B5320', // Army Green
    secondary: '#8B4513', // Brown
    accent: '#F2994A', // Orange
    detail: '#555555', // Metal
    dark: '#222222'
  },
  { // Neon Punk
    primary: '#FF00FF', // Magenta
    secondary: '#2D2D2D', // Black
    accent: '#00FFFF', // Cyan
    detail: '#FFFF00', // Yellow
    dark: '#000000'
  },
  { // Chrome
    primary: '#C0C0C0', // Silver
    secondary: '#808080', // Grey
    accent: '#FFD700', // Gold
    detail: '#FFFFFF', // White
    dark: '#404040'
  },
  { // Rust
    primary: '#8B4513', // Brown
    secondary: '#A0522D', // Sienna
    accent: '#FF4500', // Orange Red
    detail: '#CD853F', // Peru
    dark: '#654321'
  }
];

export const ANIMAL_PALETTES: Palette[] = [
  { // Natural Brown
    primary: '#8B4513', // Saddle Brown
    secondary: '#A0522D', // Sienna
    accent: '#D2691E', // Chocolate
    detail: '#CD853F', // Peru
    dark: '#654321'
  },
  { // Grey Fur
    primary: '#808080', // Grey
    secondary: '#A9A9A9', // Dark Grey
    accent: '#D3D3D3', // Light Grey
    detail: '#696969', // Dim Grey
    dark: '#2F2F2F'
  },
  { // Golden
    primary: '#FFD700', // Gold
    secondary: '#FFA500', // Orange
    accent: '#FF8C00', // Dark Orange
    detail: '#FFE4B5', // Moccasin
    dark: '#B8860B'
  },
  { // White/Black
    primary: '#F5F5F5', // White Smoke
    secondary: '#D3D3D3', // Light Grey
    accent: '#000000', // Black
    detail: '#A9A9A9', // Dark Grey
    dark: '#2F2F2F'
  },
  { // Orange/Red
    primary: '#FF6347', // Tomato
    secondary: '#FF4500', // Orange Red
    accent: '#DC143C', // Crimson
    detail: '#FFA500', // Orange
    dark: '#8B0000'
  },
  { // Green
    primary: '#228B22', // Forest Green
    secondary: '#32CD32', // Lime Green
    accent: '#00FF00', // Green
    detail: '#90EE90', // Light Green
    dark: '#006400'
  },
  { // Blue
    primary: '#4169E1', // Royal Blue
    secondary: '#1E90FF', // Dodger Blue
    accent: '#00BFFF', // Deep Sky Blue
    detail: '#87CEEB', // Sky Blue
    dark: '#00008B'
  }
];

export const MONSTER_PALETTES: Palette[] = [
  { // Dark Purple
    primary: '#4B0082', // Indigo
    secondary: '#800080', // Purple
    accent: '#FF00FF', // Magenta
    detail: '#9370DB', // Medium Purple
    dark: '#000000'
  },
  { // Dark Green
    primary: '#2F4F2F', // Dark Slate Grey
    secondary: '#006400', // Dark Green
    accent: '#00FF00', // Green
    detail: '#32CD32', // Lime Green
    dark: '#000000'
  },
  { // Blood Red
    primary: '#8B0000', // Dark Red
    secondary: '#DC143C', // Crimson
    accent: '#FF0000', // Red
    detail: '#FF6347', // Tomato
    dark: '#000000'
  },
  { // Eerie Black
    primary: '#1C1C1C', // Almost Black
    secondary: '#2F2F2F', // Dark Grey
    accent: '#FF00FF', // Magenta
    detail: '#4B0082', // Indigo
    dark: '#000000'
  },
  { // Toxic Yellow
    primary: '#9ACD32', // Yellow Green
    secondary: '#ADFF2F', // Green Yellow
    accent: '#FFFF00', // Yellow
    detail: '#FFD700', // Gold
    dark: '#2F2F2F'
  },
  { // Glowing Blue
    primary: '#00008B', // Dark Blue
    secondary: '#0000CD', // Medium Blue
    accent: '#00FFFF', // Cyan
    detail: '#87CEEB', // Sky Blue
    dark: '#000000'
  }
];

export const SPACESHIP_PALETTES: Palette[] = [
  { // Metallic Silver
    primary: '#C0C0C0', // Silver
    secondary: '#808080', // Grey
    accent: '#FFD700', // Gold
    detail: '#FFFFFF', // White
    dark: '#404040'
  },
  { // Tech Blue
    primary: '#1E3A8A', // Dark Blue
    secondary: '#3B82F6', // Blue
    accent: '#00FFFF', // Cyan
    detail: '#93C5FD', // Light Blue
    dark: '#0F172A'
  },
  { // Military Grey
    primary: '#4B5563', // Grey
    secondary: '#6B7280', // Grey
    accent: '#F59E0B', // Amber
    detail: '#9CA3AF', // Grey
    dark: '#1F2937'
  },
  { // Dark Tech
    primary: '#1F2937', // Dark Grey
    secondary: '#374151', // Grey
    accent: '#10B981', // Emerald
    detail: '#6B7280', // Grey
    dark: '#000000'
  },
  { // White/Blue
    primary: '#FFFFFF', // White
    secondary: '#E5E7EB', // Light Grey
    accent: '#3B82F6', // Blue
    detail: '#9CA3AF', // Grey
    dark: '#374151'
  },
  { // Orange/Black
    primary: '#1F2937', // Dark Grey
    secondary: '#374151', // Grey
    accent: '#F97316', // Orange
    detail: '#FB923C', // Light Orange
    dark: '#000000'
  }
];

import { randomChoice } from './seededRNG';

export function getRandomPalette(category?: 'robot' | 'animal' | 'monster' | 'spaceship'): Palette {
  if (category === 'animal') {
    return randomChoice(ANIMAL_PALETTES);
  } else if (category === 'monster') {
    return randomChoice(MONSTER_PALETTES);
  } else if (category === 'spaceship') {
    return randomChoice(SPACESHIP_PALETTES);
  } else {
    return randomChoice(ROBOT_PALETTES);
  }
}
