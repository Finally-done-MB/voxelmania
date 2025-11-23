import type { VoxelObjectData } from '../types';
import { getRandomPalette, type Palette } from '../utils/palettes';

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
}

function randomRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateAnimal(): VoxelObjectData {
  const palette = getRandomPalette();
  const builder = new VoxelBuilder(palette);

  // --- Body ---
  const bodyLen = randomRange(6, 10);
  const bodyWidth = randomRange(3, 5);
  const bodyHeight = randomRange(3, 5);
  const legHeight = randomRange(3, 6);
  
  const bodyY = legHeight;
  const bodyX = -bodyWidth / 2;
  const bodyZ = -bodyLen / 2;

  builder.addBox(bodyX, bodyY, bodyZ, bodyWidth, bodyHeight, bodyLen, palette.primary);

  // --- Legs (4) ---
  const legW = 1;
  // Front Left
  builder.addBox(bodyX, 0, bodyZ + bodyLen - 2, legW, legHeight, legW, palette.secondary);
  // Front Right
  builder.addBox(bodyX + bodyWidth - 1, 0, bodyZ + bodyLen - 2, legW, legHeight, legW, palette.secondary);
  // Back Left
  builder.addBox(bodyX, 0, bodyZ, legW, legHeight, legW, palette.secondary);
  // Back Right
  builder.addBox(bodyX + bodyWidth - 1, 0, bodyZ, legW, legHeight, legW, palette.secondary);


  // --- Head ---
  const headSize = randomRange(3, 4);
  const headY = bodyY + bodyHeight - 1;
  const headZ = bodyZ + bodyLen;
  
  // Neck
  builder.addBox(bodyX + 1, bodyY + 1, bodyZ + bodyLen - 1, bodyWidth - 2, 2, 2, palette.primary);
  
  // Head
  builder.addBox(-headSize/2, headY + 1, headZ + 1, headSize, headSize, headSize, palette.primary);

  // Ears
  builder.addBox(-headSize/2, headY + headSize + 1, headZ + 2, 1, 1, 1, palette.detail);
  builder.addBox(headSize/2 - 1, headY + headSize + 1, headZ + 2, 1, 1, 1, palette.detail);

  // Tail
  builder.addBox(-0.5, bodyY + bodyHeight - 1, bodyZ - 2, 1, 1, 2, palette.secondary);

  return {
    id: crypto.randomUUID(),
    name: `Critter ${Math.floor(Math.random() * 1000)}`,
    category: 'animal',
    createdAt: Date.now(),
    voxels: builder.voxels
  };
}
