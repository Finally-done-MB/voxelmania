import type { Voxel, VoxelObjectData } from '../types';
import { getRandomPalette, type Palette } from '../utils/palettes';

class VoxelBuilder {
  voxels: Voxel[] = [];
  palette: Palette;

  constructor(palette: Palette) {
    this.palette = palette;
  }

  addVoxel(x: number, y: number, z: number, color: string) {
    // check if exists? simple generator might not need it if math is clean
    this.voxels.push({
      id: `${x}-${y}-${z}`,
      x, y, z, color
    });
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
      // Mirror across X
      const mirrorStartX = axisX - (startX + w - axisX); 
      this.addBox(mirrorStartX, startY, startZ, w, h, d, color);
  }
}

function randomRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRobot(): VoxelObjectData {
  const palette = getRandomPalette();
  const builder = new VoxelBuilder(palette);

  // --- Legs ---
  const legHeight = randomRange(4, 8);
  const legWidth = randomRange(2, 3);
  const legSpacing = randomRange(1, 3);
  
  // Left Leg
  builder.addBox(-legSpacing - legWidth, 0, -1, legWidth, legHeight, 3, palette.secondary);
  // Right Leg
  builder.addBox(legSpacing, 0, -1, legWidth, legHeight, 3, palette.secondary);

  // Feet
  builder.addBox(-legSpacing - legWidth, 0, 0, legWidth, 1, 4, palette.dark);
  builder.addBox(legSpacing, 0, 0, legWidth, 1, 4, palette.dark);


  // --- Torso ---
  const torsoY = legHeight;
  const torsoWidth = (legSpacing + legWidth) * 2 + randomRange(0, 2);
  const torsoHeight = randomRange(5, 9);
  const torsoDepth = randomRange(3, 5);
  const torsoX = -torsoWidth / 2;
  const torsoZ = -torsoDepth / 2;

  builder.addBox(torsoX, torsoY, torsoZ, torsoWidth, torsoHeight, torsoDepth, palette.primary);
  
  // Torso Details (Core)
  builder.addBox(torsoX + 2, torsoY + 2, torsoZ - 1, torsoWidth - 4, torsoHeight - 4, 1, palette.accent);


  // --- Head ---
  const headWidth = randomRange(3, torsoWidth - 2);
  const headHeight = randomRange(3, 5);
  const headDepth = randomRange(3, 5);
  const headY = torsoY + torsoHeight;
  const headX = -headWidth / 2;
  const headZ = -headDepth / 2;

  // Neck
  builder.addBox(-1, headY - 1, -1, 2, 1, 2, palette.detail);
  
  // Head Base
  builder.addBox(headX, headY, headZ, headWidth, headHeight, headDepth, palette.primary);
  
  // Eyes
  builder.addBox(headX + 1, headY + 2, headZ + headDepth, headWidth - 2, 1, 1, palette.accent);


  // --- Arms ---
  const armWidth = 2;
  const armHeight = randomRange(4, torsoHeight);
  const armY = torsoY + torsoHeight - 2;
  
  // Left Arm
  builder.addBox(torsoX - armWidth - 1, armY - armHeight, -1, armWidth, armHeight, 3, palette.secondary);
  // Right Arm
  builder.addBox(torsoX + torsoWidth + 1, armY - armHeight, -1, armWidth, armHeight, 3, palette.secondary);

  // Shoulders
  builder.addBox(torsoX - armWidth - 2, armY, -2, armWidth + 2, 2, 5, palette.detail);
  builder.addBox(torsoX + torsoWidth, armY, -2, armWidth + 2, 2, 5, palette.detail);


  return {
    id: crypto.randomUUID(),
    name: `Robot ${Math.floor(Math.random() * 1000)}`,
    category: 'robot',
    createdAt: Date.now(),
    voxels: builder.voxels
  };
}
