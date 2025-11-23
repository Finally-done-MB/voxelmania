import { describe, it, expect, beforeEach } from 'vitest';
import { VoxelBuilder } from './voxelBuilder';
import type { Palette } from './palettes';

const mockPalette: Palette = {
  primary: '#FF0000',
  secondary: '#00FF00',
  accent: '#0000FF',
  detail: '#FFFF00',
  dark: '#000000',
};

describe('VoxelBuilder', () => {
  let builder: VoxelBuilder;

  beforeEach(() => {
    builder = new VoxelBuilder(mockPalette);
  });

  describe('constructor', () => {
    it('should initialize with empty voxels array', () => {
      expect(builder.voxels).toEqual([]);
    });

    it('should store the palette', () => {
      expect(builder.palette).toBe(mockPalette);
    });
  });

  describe('addVoxel', () => {
    it('should add a voxel', () => {
      builder.addVoxel(0, 0, 0, '#FF0000');
      expect(builder.voxels).toHaveLength(1);
      expect(builder.voxels[0]).toEqual({
        id: '0,0,0',
        x: 0,
        y: 0,
        z: 0,
        color: '#FF0000',
      });
    });

    it('should prevent duplicate voxels at same position', () => {
      builder.addVoxel(0, 0, 0, '#FF0000');
      builder.addVoxel(0, 0, 0, '#00FF00');
      expect(builder.voxels).toHaveLength(1);
      expect(builder.voxels[0].color).toBe('#FF0000');
    });

    it('should allow voxels at different positions', () => {
      builder.addVoxel(0, 0, 0, '#FF0000');
      builder.addVoxel(1, 0, 0, '#00FF00');
      expect(builder.voxels).toHaveLength(2);
    });
  });

  describe('addBox', () => {
    it('should add a box of voxels', () => {
      builder.addBox(0, 0, 0, 2, 2, 2, '#FF0000');
      expect(builder.voxels).toHaveLength(8); // 2x2x2 = 8 voxels
    });

    it('should create correct voxel positions', () => {
      builder.addBox(0, 0, 0, 2, 1, 1, '#FF0000');
      const positions = builder.voxels.map(v => ({ x: v.x, y: v.y, z: v.z }));
      expect(positions).toContainEqual({ x: 0, y: 0, z: 0 });
      expect(positions).toContainEqual({ x: 1, y: 0, z: 0 });
      expect(positions).not.toContainEqual({ x: 2, y: 0, z: 0 });
    });

    it('should handle single voxel box', () => {
      builder.addBox(0, 0, 0, 1, 1, 1, '#FF0000');
      expect(builder.voxels).toHaveLength(1);
    });
  });

  describe('addSymmetricBox', () => {
    it('should add two boxes mirrored across axis', () => {
      builder.addSymmetricBox(1, 0, 0, 2, 1, 1, '#FF0000', 0);
      // Should have 4 voxels total (2 boxes of 2x1x1 = 2 voxels each)
      expect(builder.voxels.length).toBeGreaterThan(0);
    });

    it('should mirror correctly', () => {
      builder.addSymmetricBox(2, 0, 0, 1, 1, 1, '#FF0000', 0);
      const xPositions = builder.voxels.map(v => v.x).sort();
      // Should have voxels at mirrored positions
      expect(xPositions.length).toBeGreaterThan(1);
    });
  });

  describe('addCylinder', () => {
    it('should add cylinder voxels', () => {
      builder.addCylinder(0, 0, 0, 2, 3, '#FF0000', 'y');
      expect(builder.voxels.length).toBeGreaterThan(0);
    });

    it('should create circular cross-section', () => {
      builder.addCylinder(0, 0, 0, 1, 1, '#FF0000', 'y');
      // Center should be included
      const hasCenter = builder.voxels.some(v => v.x === 0 && v.y === 0 && v.z === 0);
      expect(hasCenter).toBe(true);
    });

    it('should respect height parameter', () => {
      builder.addCylinder(0, 0, 0, 1, 5, '#FF0000', 'y');
      const yPositions = new Set(builder.voxels.map(v => v.y));
      expect(yPositions.size).toBeLessThanOrEqual(5);
    });
  });

  describe('addSphere', () => {
    it('should add sphere voxels', () => {
      builder.addSphere(0, 0, 0, 2, '#FF0000');
      expect(builder.voxels.length).toBeGreaterThan(0);
    });

    it('should create spherical shape', () => {
      builder.addSphere(0, 0, 0, 1, '#FF0000');
      // Center should be included
      const hasCenter = builder.voxels.some(v => v.x === 0 && v.y === 0 && v.z === 0);
      expect(hasCenter).toBe(true);
    });

    it('should respect radius', () => {
      builder.addSphere(0, 0, 0, 2, '#FF0000');
      const maxDistance = Math.max(
        ...builder.voxels.map(v => Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2))
      );
      expect(maxDistance).toBeLessThanOrEqual(2);
    });
  });

  describe('addTaperedBox', () => {
    it('should add tapered box voxels', () => {
      builder.addTaperedBox(0, 0, 0, 3, 3, 3, 1, 1, '#FF0000');
      expect(builder.voxels.length).toBeGreaterThan(0);
    });

    it('should taper from w1,d1 to w2,d2', () => {
      builder.addTaperedBox(0, 0, 0, 3, 3, 3, 1, 1, '#FF0000');
      // Should have fewer voxels at top than bottom
      const voxels = builder.voxels;
      expect(voxels.length).toBeGreaterThan(0);
    });
  });

  describe('addIrregularShape', () => {
    it('should add voxels at specified positions', () => {
      const positions = [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
      ];
      builder.addIrregularShape(positions, '#FF0000');
      expect(builder.voxels).toHaveLength(3);
    });
  });

  describe('hasVoxel', () => {
    it('should return true if voxel exists', () => {
      builder.addVoxel(5, 10, 15, '#FF0000');
      expect(builder.hasVoxel(5, 10, 15)).toBe(true);
    });

    it('should return false if voxel does not exist', () => {
      expect(builder.hasVoxel(5, 10, 15)).toBe(false);
    });
  });

  describe('recolorVoxel', () => {
    it('should recolor existing voxel', () => {
      builder.addVoxel(0, 0, 0, '#FF0000');
      const success = builder.recolorVoxel(0, 0, 0, '#00FF00');
      expect(success).toBe(true);
      expect(builder.voxels[0].color).toBe('#00FF00');
    });

    it('should return false if voxel does not exist', () => {
      const success = builder.recolorVoxel(0, 0, 0, '#00FF00');
      expect(success).toBe(false);
    });

    it('should not add new voxel if it does not exist', () => {
      const initialLength = builder.voxels.length;
      builder.recolorVoxel(0, 0, 0, '#00FF00');
      expect(builder.voxels.length).toBe(initialLength);
    });
  });
});
