import { describe, it, expect } from 'vitest';
import { generateRobot } from './robotGenerator';
import { generateAnimal } from './animalGenerator';
import { generateSpaceship } from './spaceshipGenerator';
import { generateMonster } from './monsterGenerator';

describe('Generators', () => {
  describe('seed reproducibility', () => {
    it('should generate same robot with same seed', () => {
      const seed = 12345;
      const robot1 = generateRobot(seed);
      const robot2 = generateRobot(seed);
      
      expect(robot1.seed).toBe(seed);
      expect(robot2.seed).toBe(seed);
      expect(robot1.voxels.length).toBe(robot2.voxels.length);
      
      // Check that voxel positions match
      const positions1 = robot1.voxels.map(v => `${v.x},${v.y},${v.z}`).sort();
      const positions2 = robot2.voxels.map(v => `${v.x},${v.y},${v.z}`).sort();
      expect(positions1).toEqual(positions2);
    });

    it('should generate different robots with different seeds', () => {
      const robot1 = generateRobot(12345);
      const robot2 = generateRobot(54321);
      
      expect(robot1.seed).not.toBe(robot2.seed);
      // They might have same number of voxels by chance, but positions should differ
      const positions1 = robot1.voxels.map(v => `${v.x},${v.y},${v.z}`).sort();
      const positions2 = robot2.voxels.map(v => `${v.x},${v.y},${v.z}`).sort();
      expect(positions1).not.toEqual(positions2);
    });

    it('should generate same animal with same seed', () => {
      const seed = 12345;
      const animal1 = generateAnimal(seed);
      const animal2 = generateAnimal(seed);
      
      expect(animal1.seed).toBe(seed);
      expect(animal2.seed).toBe(seed);
      expect(animal1.voxels.length).toBe(animal2.voxels.length);
    });

    it('should generate same spaceship with same seed', () => {
      const seed = 12345;
      const ship1 = generateSpaceship(seed);
      const ship2 = generateSpaceship(seed);
      
      expect(ship1.seed).toBe(seed);
      expect(ship2.seed).toBe(seed);
      expect(ship1.voxels.length).toBe(ship2.voxels.length);
    });

    it('should generate same monster with same seed', () => {
      const seed = 12345;
      const monster1 = generateMonster(seed);
      const monster2 = generateMonster(seed);
      
      expect(monster1.seed).toBe(seed);
      expect(monster2.seed).toBe(seed);
      expect(monster1.voxels.length).toBe(monster2.voxels.length);
    });
  });

  describe('generator output validation', () => {
    it('should generate valid robot object', () => {
      const robot = generateRobot();
      
      expect(robot).toHaveProperty('id');
      expect(robot).toHaveProperty('name');
      expect(robot).toHaveProperty('category', 'robot');
      expect(robot).toHaveProperty('voxels');
      expect(robot).toHaveProperty('createdAt');
      expect(robot).toHaveProperty('seed');
      expect(Array.isArray(robot.voxels)).toBe(true);
      expect(robot.voxels.length).toBeGreaterThan(0);
    });

    it('should generate valid animal object', () => {
      const animal = generateAnimal();
      
      expect(animal.category).toBe('animal');
      expect(Array.isArray(animal.voxels)).toBe(true);
      expect(animal.voxels.length).toBeGreaterThan(0);
    });

    it('should generate valid spaceship object', () => {
      const spaceship = generateSpaceship();
      
      expect(spaceship.category).toBe('spaceship');
      expect(Array.isArray(spaceship.voxels)).toBe(true);
      expect(spaceship.voxels.length).toBeGreaterThan(0);
    });

    it('should generate valid monster object', () => {
      const monster = generateMonster();
      
      expect(monster.category).toBe('monster');
      expect(Array.isArray(monster.voxels)).toBe(true);
      expect(monster.voxels.length).toBeGreaterThan(0);
    });
  });
});
