import type { VoxelObjectData } from '../types';
import { getRandomPalette, type Palette } from '../utils/palettes';
import { VoxelBuilder, randomRange, randomChoice } from '../utils/voxelBuilder';

export function generateSpaceship(): VoxelObjectData {
  const palette = getRandomPalette('spaceship');
  const builder = new VoxelBuilder(palette);

  const shipType = randomChoice(['fighter', 'freighter', 'explorer', 'destroyer']);

  switch (shipType) {
    case 'fighter':
      generateFighter(builder, palette);
      break;
    case 'freighter':
      generateFreighter(builder, palette);
      break;
    case 'explorer':
      generateExplorer(builder, palette);
      break;
    case 'destroyer':
      generateDestroyer(builder, palette);
      break;
  }

  return {
    id: crypto.randomUUID(),
    name: `Ship ${Math.floor(Math.random() * 1000)}`,
    category: 'spaceship',
    createdAt: Date.now(),
    voxels: builder.voxels
  };
}

function generateFighter(builder: VoxelBuilder, palette: Palette) {
  // Small, agile fighter
  const fuselageLen = randomRange(8, 12);
  const fuselageWidth = randomRange(2, 3);
  const fuselageHeight = randomRange(2, 3);
  
  const fX = -fuselageWidth / 2;
  const fY = 5;
  const fZ = -fuselageLen / 2;

  builder.addBox(fX, fY, fZ, fuselageWidth, fuselageHeight, fuselageLen, palette.primary);

  // Cockpit
  const cockpitZ = fZ + fuselageLen - randomRange(3, 5);
  builder.addBox(fX + 1, fY + fuselageHeight, cockpitZ, fuselageWidth - 2, 1, 3, palette.accent);
  builder.addVoxel(fX + fuselageWidth/2, fY + fuselageHeight + 1, cockpitZ + 1, '#00FFFF');

  // Delta wings
  const wingSpan = randomRange(4, 8);
  const wingZ = fZ + randomRange(2, 4);
  builder.addTaperedBox(fX - wingSpan, fY, wingZ, wingSpan, 1, 3, 1, 1, palette.secondary);
  builder.addTaperedBox(fX + fuselageWidth, fY, wingZ, wingSpan, 1, 3, 1, 1, palette.secondary);

  // Wing tips (weapons)
  builder.addBox(fX - wingSpan - 1, fY, wingZ, 1, 1, 2, palette.accent);
  builder.addBox(fX + fuselageWidth + wingSpan, fY, wingZ, 1, 1, 2, palette.accent);

  // Engines
  builder.addBox(fX, fY + 1, fZ - 2, 1, 1, 2, palette.accent);
  builder.addBox(fX + fuselageWidth - 1, fY + 1, fZ - 2, 1, 1, 2, palette.accent);
  builder.addVoxel(fX, fY + 1, fZ - 3, '#FF0000');
  builder.addVoxel(fX + fuselageWidth - 1, fY + 1, fZ - 3, '#FF0000');
}

function generateFreighter(builder: VoxelBuilder, palette: Palette) {
  // Large cargo ship
  const fuselageLen = randomRange(18, 25);
  const fuselageWidth = randomRange(5, 8);
  const fuselageHeight = randomRange(4, 6);
  
  const fX = -fuselageWidth / 2;
  const fY = 5;
  const fZ = -fuselageLen / 2;

  builder.addBox(fX, fY, fZ, fuselageWidth, fuselageHeight, fuselageLen, palette.primary);

  // Cargo bays
  const bayCount = randomRange(3, 5);
  const baySpacing = fuselageLen / (bayCount + 1);
  for (let i = 0; i < bayCount; i++) {
    const bayZ = fZ + (i + 1) * baySpacing;
    builder.addBox(fX + 1, fY - 2, bayZ, fuselageWidth - 2, 2, 3, palette.secondary);
    // Cargo bay doors
    builder.addBox(fX + 1, fY - 2, bayZ, fuselageWidth - 2, 1, 1, palette.detail);
  }

  // Cockpit
  builder.addBox(fX + 1, fY + fuselageHeight, fZ + fuselageLen - 4, fuselageWidth - 2, 2, 4, palette.accent);

  // Wings (swept)
  const wingSpan = randomRange(8, 12);
  const wingZ = fZ + randomRange(5, 8);
  builder.addBox(fX - wingSpan, fY, wingZ, wingSpan, 1, 6, palette.secondary);
  builder.addBox(fX + fuselageWidth, fY, wingZ, wingSpan, 1, 6, palette.secondary);

  // Multiple engines
  const engineCount = randomRange(4, 6);
  const engineSpacing = fuselageWidth / (engineCount + 1);
  for (let i = 0; i < engineCount; i++) {
    const engineX = fX + (i + 1) * engineSpacing;
    builder.addBox(engineX - 1, fY + 1, fZ - 3, 2, 2, 3, palette.accent);
    builder.addVoxel(engineX, fY + 1, fZ - 4, '#FF0000');
  }

  // Docking ports
  builder.addBox(fX - 1, fY + 1, fZ + fuselageLen/2, 1, 2, 2, palette.detail);
  builder.addBox(fX + fuselageWidth, fY + 1, fZ + fuselageLen/2, 1, 2, 2, palette.detail);
}

function generateExplorer(builder: VoxelBuilder, palette: Palette) {
  // Medium detailed explorer
  const fuselageLen = randomRange(12, 18);
  const fuselageWidth = randomRange(4, 6);
  const fuselageHeight = randomRange(3, 5);
  
  const fX = -fuselageWidth / 2;
  const fY = 5;
  const fZ = -fuselageLen / 2;

  builder.addBox(fX, fY, fZ, fuselageWidth, fuselageHeight, fuselageLen, palette.primary);

  // Hull details (panels)
  for (let i = 0; i < 6; i++) {
    const panelZ = fZ + i * 3;
    builder.addBox(fX + 1, fY + fuselageHeight, panelZ, fuselageWidth - 2, 1, 2, palette.secondary);
  }

  // Windows
  for (let i = 0; i < 4; i++) {
    const windowZ = fZ + 2 + i * 4;
    builder.addVoxel(fX + fuselageWidth/2, fY + fuselageHeight - 1, windowZ, '#00FFFF');
  }

  // Cockpit
  builder.addBox(fX + 1, fY + fuselageHeight, fZ + fuselageLen - 5, fuselageWidth - 2, 2, 5, palette.accent);
  builder.addVoxel(fX + fuselageWidth/2, fY + fuselageHeight + 1, fZ + fuselageLen - 2, '#00FFFF');

  // Sensor arrays
  builder.addBox(fX - 2, fY + 1, fZ + fuselageLen/2, 1, 2, 3, palette.accent);
  builder.addBox(fX + fuselageWidth + 1, fY + 1, fZ + fuselageLen/2, 1, 2, 3, palette.accent);
  
  // Communication dish
  builder.addCylinder(fX + fuselageWidth/2, fY + fuselageHeight + 2, fZ + fuselageLen/2, 2, 1, palette.detail, 'y');

  // Wings (bi-wing)
  const wingSpan = randomRange(5, 8);
  const wingZ1 = fZ + randomRange(3, 5);
  const wingZ2 = fZ + randomRange(8, 10);
  
  builder.addBox(fX - wingSpan, fY, wingZ1, wingSpan, 1, 4, palette.secondary);
  builder.addBox(fX + fuselageWidth, fY, wingZ1, wingSpan, 1, 4, palette.secondary);
  builder.addBox(fX - wingSpan, fY, wingZ2, wingSpan, 1, 4, palette.secondary);
  builder.addBox(fX + fuselageWidth, fY, wingZ2, wingSpan, 1, 4, palette.secondary);

  // Engines (ion drives)
  builder.addBox(fX, fY + 1, fZ - 2, 1, 1, 3, palette.accent);
  builder.addBox(fX + fuselageWidth - 1, fY + 1, fZ - 2, 1, 1, 3, palette.accent);
  builder.addVoxel(fX, fY + 1, fZ - 3, '#00FFFF');
  builder.addVoxel(fX + fuselageWidth - 1, fY + 1, fZ - 3, '#00FFFF');

  // Landing gear
  builder.addBox(fX - 1, fY - 2, fZ + 2, 1, 2, 1, palette.detail);
  builder.addBox(fX + fuselageWidth, fY - 2, fZ + 2, 1, 2, 1, palette.detail);
  builder.addBox(fX - 1, fY - 2, fZ + fuselageLen - 3, 1, 2, 1, palette.detail);
  builder.addBox(fX + fuselageWidth, fY - 2, fZ + fuselageLen - 3, 1, 2, 1, palette.detail);
}

function generateDestroyer(builder: VoxelBuilder, palette: Palette) {
  // Large weapon-heavy ship
  const fuselageLen = randomRange(20, 28);
  const fuselageWidth = randomRange(6, 10);
  const fuselageHeight = randomRange(5, 7);
  
  const fX = -fuselageWidth / 2;
  const fY = 5;
  const fZ = -fuselageLen / 2;

  builder.addBox(fX, fY, fZ, fuselageWidth, fuselageHeight, fuselageLen, palette.primary);

  // Armor plating
  for (let i = 0; i < 8; i++) {
    const plateZ = fZ + i * 3;
    builder.addBox(fX - 1, fY + fuselageHeight, plateZ, fuselageWidth + 2, 1, 2, palette.secondary);
  }

  // Cockpit
  builder.addBox(fX + 2, fY + fuselageHeight, fZ + fuselageLen - 6, fuselageWidth - 4, 2, 6, palette.accent);

  // Weapon systems
  // Forward cannons
  builder.addBox(fX + 1, fY + 2, fZ + fuselageLen - 2, 2, 2, 3, palette.accent);
  builder.addBox(fX + fuselageWidth - 3, fY + 2, fZ + fuselageLen - 2, 2, 2, 3, palette.accent);
  builder.addVoxel(fX + 2, fY + 2, fZ + fuselageLen + 1, '#FF0000');
  builder.addVoxel(fX + fuselageWidth - 2, fY + 2, fZ + fuselageLen + 1, '#FF0000');

  // Missile pods
  const podCount = randomRange(4, 6);
  const podSpacing = fuselageLen / (podCount + 1);
  for (let i = 0; i < podCount; i++) {
    const podZ = fZ + (i + 1) * podSpacing;
    builder.addBox(fX - 2, fY + 1, podZ, 2, 2, 2, palette.accent);
    builder.addBox(fX + fuselageWidth, fY + 1, podZ, 2, 2, 2, palette.accent);
  }

  // Laser turrets
  for (let i = 0; i < 3; i++) {
    const turretZ = fZ + 3 + i * 6;
    builder.addCylinder(fX + fuselageWidth/2, fY + fuselageHeight + 1, turretZ, 1, 2, palette.accent, 'y');
    builder.addVoxel(fX + fuselageWidth/2, fY + fuselageHeight + 3, turretZ, '#FFFF00');
  }

  // Large wings
  const wingSpan = randomRange(10, 14);
  const wingZ = fZ + randomRange(6, 10);
  builder.addBox(fX - wingSpan, fY, wingZ, wingSpan, 2, 8, palette.secondary);
  builder.addBox(fX + fuselageWidth, fY, wingZ, wingSpan, 2, 8, palette.secondary);

  // Multiple large engines (plasma)
  const engineCount = randomRange(6, 8);
  const engineSpacing = fuselageWidth / (engineCount + 1);
  for (let i = 0; i < engineCount; i++) {
    const engineX = fX + (i + 1) * engineSpacing;
    builder.addBox(engineX - 1, fY + 1, fZ - 4, 2, 3, 4, palette.accent);
    builder.addVoxel(engineX, fY + 2, fZ - 5, '#FF00FF');
  }

  // Sensor arrays
  builder.addBox(fX - 3, fY + 2, fZ + fuselageLen/2, 2, 3, 4, palette.accent);
  builder.addBox(fX + fuselageWidth + 1, fY + 2, fZ + fuselageLen/2, 2, 3, 4, palette.accent);
}
