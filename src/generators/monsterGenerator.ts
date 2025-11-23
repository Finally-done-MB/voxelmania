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

export function generateMonster(): VoxelObjectData {
  const palette = getRandomPalette();
  const builder = new VoxelBuilder(palette);

  // Base Blob
  const centerX = 0;
  const centerY = randomRange(2, 5);
  const centerZ = 0;
  const baseSize = randomRange(4, 8);

  // Main Body
  builder.addBox(centerX - baseSize/2, centerY, centerZ - baseSize/2, baseSize, baseSize, baseSize, palette.primary);

  // Random Mutations (Asymmetrical)
  const mutationCount = randomRange(3, 8);
  for(let i=0; i<mutationCount; i++) {
    const w = randomRange(2, 4);
    const h = randomRange(2, 4);
    const d = randomRange(2, 4);
    
    const x = centerX + randomRange(-baseSize, baseSize);
    const y = centerY + randomRange(-baseSize/2, baseSize);
    const z = centerZ + randomRange(-baseSize, baseSize);
    
    const color = Math.random() > 0.5 ? palette.secondary : palette.accent;
    
    builder.addBox(x, y, z, w, h, d, color);
  }

  // Eyes (Random locations)
  const eyeCount = randomRange(1, 5);
  for(let i=0; i<eyeCount; i++) {
     const x = centerX + randomRange(-baseSize/2, baseSize/2);
     const y = centerY + randomRange(0, baseSize/2);
     const z = centerZ + baseSize/2 + 1; // Front-ish
     builder.addBox(x, y, z, 1, 1, 1, '#FFFFFF');
     builder.addBox(x, y, z+1, 1, 1, 1, '#000000'); // Pupil
  }

  return {
    id: crypto.randomUUID(),
    name: `Monster ${Math.floor(Math.random() * 1000)}`,
    category: 'monster',
    createdAt: Date.now(),
    voxels: builder.voxels
  };
}
