import type { VoxelObjectData } from '../types';
import { getRandomPalette, type Palette } from '../utils/palettes';

// Reuse the builder logic - probably should have extracted it to a shared file
// Copying for speed now, but would refactor in real world
class VoxelBuilder {
  voxels: any[] = [];
  palette: Palette;

  constructor(palette: Palette) {
    this.palette = palette;
  }

  addVoxel(x: number, y: number, z: number, color: string) {
    this.voxels.push({ id: `${x}-${y}-${z}`, x, y, z, color });
  }

  addBox(startX: number, startY: number, startZ: number, w: number, h: number, d: number, color: string) {
    for (let x = startX; x < startX + w; x++) {
      for (let y = startY; y < startY + h; y++) {
        for (let z = startZ; z < startZ + d; z++) {
          this.addVoxel(x, y, z, color);
        }
      }
    }
  }
  
  addSymmetricBox(startX: number, startY: number, startZ: number, w: number, h: number, d: number, color: string, axisX = 0) {
      this.addBox(startX, startY, startZ, w, h, d, color);
      const mirrorStartX = axisX - (startX + w - axisX); 
      this.addBox(mirrorStartX, startY, startZ, w, h, d, color);
  }
}

function randomRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateSpaceship(): VoxelObjectData {
  const palette = getRandomPalette();
  const builder = new VoxelBuilder(palette);

  // --- Fuselage ---
  const fuselageLen = randomRange(10, 20);
  const fuselageWidth = randomRange(3, 5);
  const fuselageHeight = randomRange(2, 4);
  
  // Center the fuselage
  const fX = -fuselageWidth / 2;
  const fY = 5; // Lift it up
  const fZ = -fuselageLen / 2;

  builder.addBox(fX, fY, fZ, fuselageWidth, fuselageHeight, fuselageLen, palette.primary);

  // --- Cockpit ---
  const cockpitZ = fZ + fuselageLen - randomRange(4, 8);
  builder.addBox(fX + 1, fY + fuselageHeight, cockpitZ, fuselageWidth - 2, 1, 3, palette.accent);

  // --- Wings ---
  const wingSpan = randomRange(6, 12);
  const wingWidth = randomRange(4, 8);
  const wingZ = fZ + randomRange(2, 5);
  
  // Left Wing
  builder.addBox(fX - wingSpan, fY, wingZ, wingSpan, 1, wingWidth, palette.secondary);
  // Right Wing
  builder.addBox(fX + fuselageWidth, fY, wingZ, wingSpan, 1, wingWidth, palette.secondary);

  // Wing Details (Guns/Tips)
  builder.addBox(fX - wingSpan - 1, fY, wingZ, 1, 1, wingWidth, palette.detail);
  builder.addBox(fX + fuselageWidth + wingSpan, fY, wingZ, 1, 1, wingWidth, palette.detail);


  // --- Engines ---
  const engineZ = fZ - 2;
  
  // Main Thrusters
  builder.addBox(fX, fY + 1, engineZ, 1, 1, 2, palette.accent);
  builder.addBox(fX + fuselageWidth - 1, fY + 1, engineZ, 1, 1, 2, palette.accent);

  return {
    id: crypto.randomUUID(),
    name: `Ship ${Math.floor(Math.random() * 1000)}`,
    category: 'spaceship',
    createdAt: Date.now(),
    voxels: builder.voxels
  };
}
