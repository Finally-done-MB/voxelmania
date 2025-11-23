import type { Voxel } from '../types';
import type { Palette } from './palettes';

export class VoxelBuilder {
  voxels: Voxel[] = [];
  private voxelSet: Set<string> = new Set();
  palette: Palette;

  constructor(palette: Palette) {
    this.palette = palette;
  }

  private getVoxelKey(x: number, y: number, z: number): string {
    return `${x},${y},${z}`;
  }

  addVoxel(x: number, y: number, z: number, color: string) {
    const key = this.getVoxelKey(x, y, z);
    if (this.voxelSet.has(key)) return; // Prevent duplicates
    
    this.voxelSet.add(key);
    this.voxels.push({
      id: key,
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
    // Mirror across X axis
    const mirrorStartX = axisX - (startX + w - axisX); 
    this.addBox(mirrorStartX, startY, startZ, w, h, d, color);
  }

  addCylinder(centerX: number, centerY: number, centerZ: number, radius: number, height: number, color: string, axis: 'x' | 'y' | 'z' = 'y') {
    const radiusSq = radius * radius;
    
    for (let h = 0; h < height; h++) {
      for (let r1 = -radius; r1 <= radius; r1++) {
        for (let r2 = -radius; r2 <= radius; r2++) {
          const distSq = r1 * r1 + r2 * r2;
          if (distSq <= radiusSq) {
            if (axis === 'y') {
              this.addVoxel(centerX + r1, centerY + h, centerZ + r2, color);
            } else if (axis === 'x') {
              this.addVoxel(centerX + h, centerY + r1, centerZ + r2, color);
            } else { // z
              this.addVoxel(centerX + r1, centerY + r2, centerZ + h, color);
            }
          }
        }
      }
    }
  }

  addSphere(centerX: number, centerY: number, centerZ: number, radius: number, color: string) {
    const radiusSq = radius * radius;
    
    for (let x = -radius; x <= radius; x++) {
      for (let y = -radius; y <= radius; y++) {
        for (let z = -radius; z <= radius; z++) {
          const distSq = x * x + y * y + z * z;
          if (distSq <= radiusSq) {
            this.addVoxel(centerX + x, centerY + y, centerZ + z, color);
          }
        }
      }
    }
  }

  addTaperedBox(startX: number, startY: number, startZ: number, w1: number, h: number, d1: number, w2: number, d2: number, color: string) {
    for (let y = 0; y < h; y++) {
      const t = y / (h - 1 || 1); // 0 to 1
      const w = Math.floor(w1 + (w2 - w1) * t);
      const d = Math.floor(d1 + (d2 - d1) * t);
      const offsetX = Math.floor((w1 - w) / 2);
      const offsetZ = Math.floor((d1 - d) / 2);
      
      for (let x = 0; x < w; x++) {
        for (let z = 0; z < d; z++) {
          this.addVoxel(startX + offsetX + x, startY + y, startZ + offsetZ + z, color);
        }
      }
    }
  }

  addIrregularShape(positions: Array<{x: number, y: number, z: number}>, color: string) {
    for (const pos of positions) {
      this.addVoxel(pos.x, pos.y, pos.z, color);
    }
  }

  hasVoxel(x: number, y: number, z: number): boolean {
    const key = this.getVoxelKey(x, y, z);
    return this.voxelSet.has(key);
  }

  recolorVoxel(x: number, y: number, z: number, newColor: string): boolean {
    // Only recolor if voxel exists
    const key = this.getVoxelKey(x, y, z);
    if (!this.voxelSet.has(key)) return false;
    
    // Find and update the voxel
    const voxel = this.voxels.find(v => v.id === key);
    if (voxel) {
      voxel.color = newColor;
      return true;
    }
    return false;
  }
}

export function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomChoice<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function randomBoolean(probability: number = 0.5): boolean {
  return Math.random() < probability;
}
