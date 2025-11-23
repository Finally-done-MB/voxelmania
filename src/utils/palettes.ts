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
  }
];

export function getRandomPalette(): Palette {
  return ROBOT_PALETTES[Math.floor(Math.random() * ROBOT_PALETTES.length)];
}
