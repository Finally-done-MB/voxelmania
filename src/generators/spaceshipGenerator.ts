import type { VoxelObjectData } from '../types';
import { getRandomPalette, type Palette } from '../utils/palettes';
import { VoxelBuilder, randomRange, randomChoice, randomBoolean, setSeed, generateSeed } from '../utils/voxelBuilder';
import { addShipDecorativeDetails, addCoatOfArmsToWing } from '../utils/components';

export function generateSpaceship(seed?: number): VoxelObjectData {
  // Set seed if provided, otherwise generate new one
  const actualSeed = seed !== undefined ? seed : generateSeed();
  setSeed(actualSeed);
  
  const palette = getRandomPalette('spaceship');
  const builder = new VoxelBuilder(palette);

  // 10+ ship types with varied shapes - not all have wings
  const shipType = randomChoice([
    'fighter',      // Delta wing fighter
    'freighter',    // Large cargo with wings
    'explorer',     // Bi-wing explorer
    'destroyer',    // Large with wings
    'oval',         // Egg/spherical - NO WINGS
    'saucer',       // Flying saucer - NO WINGS
    'triangular',   // Wedge/pyramid - NO WINGS
    'cylindrical',  // Long tube - NO WINGS
    'xwing',        // X-wing style
    'tiefighter',   // TIE fighter style
    'stardestroyer', // Star Destroyer style
    'ornithopter',  // Insect-like with articulated wings
    'corvette'      // Medium varied
  ]);

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
    case 'oval':
      generateOvalShip(builder, palette);
      break;
    case 'saucer':
      generateSaucerShip(builder, palette);
      break;
    case 'triangular':
      generateTriangularShip(builder, palette);
      break;
    case 'cylindrical':
      generateCylindricalShip(builder, palette);
      break;
    case 'xwing':
      generateXWing(builder, palette);
      break;
    case 'tiefighter':
      generateTIEFighter(builder, palette);
      break;
    case 'stardestroyer':
      generateStarDestroyer(builder, palette);
      break;
    case 'ornithopter':
      generateOrnithopter(builder, palette);
      break;
    case 'corvette':
      generateCorvette(builder, palette);
      break;
  }

  return {
    id: crypto.randomUUID(),
    name: `Ship ${randomRange(1, 999)}`,
    category: 'spaceship',
    createdAt: Date.now(),
    voxels: builder.voxels,
    seed: actualSeed
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
  
  // Coat of arms on wings
  addCoatOfArmsToWing(builder, fX - wingSpan, fY, wingZ, wingSpan, 3, palette);
  addCoatOfArmsToWing(builder, fX + fuselageWidth, fY, wingZ, wingSpan, 3, palette);

  // Engines
  builder.addBox(fX, fY + 1, fZ - 2, 1, 1, 2, palette.accent);
  builder.addBox(fX + fuselageWidth - 1, fY + 1, fZ - 2, 1, 1, 2, palette.accent);
  builder.addVoxel(fX, fY + 1, fZ - 3, '#FF0000');
  builder.addVoxel(fX + fuselageWidth - 1, fY + 1, fZ - 3, '#FF0000');
  
  // Decorative details
  addShipDecorativeDetails(builder, 0, fY, fZ + fuselageLen/2, fuselageWidth, fuselageLen, fuselageHeight, palette);
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
  
  // Coat of arms on wings
  addCoatOfArmsToWing(builder, fX - wingSpan, fY, wingZ, wingSpan, 6, palette);
  addCoatOfArmsToWing(builder, fX + fuselageWidth, fY, wingZ, wingSpan, 6, palette);

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
  
  // Decorative details
  addShipDecorativeDetails(builder, 0, fY, fZ + fuselageLen/2, fuselageWidth, fuselageLen, fuselageHeight, palette);
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
  
  // Coat of arms on wings - ALWAYS decorate all wings
  addCoatOfArmsToWing(builder, fX - wingSpan, fY, wingZ1, wingSpan, 4, palette);
  addCoatOfArmsToWing(builder, fX + fuselageWidth, fY, wingZ1, wingSpan, 4, palette);
  addCoatOfArmsToWing(builder, fX - wingSpan, fY, wingZ2, wingSpan, 4, palette);
  addCoatOfArmsToWing(builder, fX + fuselageWidth, fY, wingZ2, wingSpan, 4, palette);

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
  
  // Decorative details
  addShipDecorativeDetails(builder, 0, fY, fZ + fuselageLen/2, fuselageWidth, fuselageLen, fuselageHeight, palette);
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
  const wingHeight = 2; // Destroyer wings are 2 voxels high
  builder.addBox(fX - wingSpan, fY, wingZ, wingSpan, wingHeight, 8, palette.secondary);
  builder.addBox(fX + fuselageWidth, fY, wingZ, wingSpan, wingHeight, 8, palette.secondary);
  
  // Coat of arms on wings - always on top surface
  addCoatOfArmsToWing(builder, fX - wingSpan, fY, wingZ, wingSpan, 8, palette, wingHeight);
  addCoatOfArmsToWing(builder, fX + fuselageWidth, fY, wingZ, wingSpan, 8, palette, wingHeight);

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
  
  // Decorative details
  addShipDecorativeDetails(builder, 0, fY, fZ + fuselageLen/2, fuselageWidth, fuselageLen, fuselageHeight, palette);
}

function generateOvalShip(builder: VoxelBuilder, palette: Palette) {
  // Egg/spherical ship - NO WINGS
  const size = randomRange(6, 10);
  const centerY = 5;
  
  // Main oval body
  builder.addSphere(0, centerY, 0, size, palette.primary);
  
  // Possibly rotating ring sections
  if (randomBoolean(0.5)) {
    builder.addCylinder(0, centerY, 0, size + 1, 1, palette.secondary, 'y');
    builder.addCylinder(0, centerY, 0, size + 1, 1, palette.secondary, 'z');
  }
  
  // Cockpit dome
  builder.addSphere(0, centerY + size - 2, size/2, 2, palette.accent);
  builder.addVoxel(0, centerY + size - 1, size/2 + 2, '#00FFFF');
  
  // Engines (multiple small ones around the back)
  const engineCount = randomRange(4, 8);
  for (let i = 0; i < engineCount; i++) {
    const angle = (i / engineCount) * Math.PI * 2;
    const engineX = Math.round(Math.cos(angle) * (size - 1));
    const engineZ = Math.round(Math.sin(angle) * (size - 1));
    builder.addVoxel(engineX, centerY, -size + engineZ, palette.accent);
    builder.addVoxel(engineX, centerY, -size - 1 + engineZ, '#FF0000');
  }
  
  // Sensor arrays (small protrusions)
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const sensorX = Math.round(Math.cos(angle) * (size + 1));
    const sensorZ = Math.round(Math.sin(angle) * (size + 1));
    builder.addVoxel(sensorX, centerY + 1, sensorZ, palette.detail);
  }
  
  // Decorative details
  addShipDecorativeDetails(builder, 0, centerY, 0, size * 2, size * 2, size, palette);
}

function generateSaucerShip(builder: VoxelBuilder, palette: Palette) {
  // Classic flying saucer - NO WINGS
  const radius = randomRange(6, 10);
  const height = randomRange(2, 4);
  const centerY = 5;
  
  // Main disc (flat saucer)
  builder.addCylinder(0, centerY, 0, radius, height, palette.primary, 'y');
  
  // Central dome
  const domeHeight = randomRange(2, 4);
  builder.addCylinder(0, centerY + height, 0, radius * 0.6, domeHeight, palette.accent, 'y');
  builder.addSphere(0, centerY + height + domeHeight - 1, 0, radius * 0.4, palette.accent);
  
  // Cockpit in dome
  builder.addVoxel(0, centerY + height + domeHeight, 0, '#00FFFF');
  
  // Multiple decks (rings)
  for (let i = 0; i < 3; i++) {
    const deckY = centerY - height + i * 2;
    builder.addCylinder(0, deckY, 0, radius - i, 1, palette.secondary, 'y');
  }
  
  // Engines around the rim
  const engineCount = randomRange(6, 10);
  for (let i = 0; i < engineCount; i++) {
    const angle = (i / engineCount) * Math.PI * 2;
    const engineX = Math.round(Math.cos(angle) * (radius - 1));
    const engineZ = Math.round(Math.sin(angle) * (radius - 1));
    builder.addVoxel(engineX, centerY, engineZ, palette.accent);
    builder.addVoxel(engineX, centerY - 1, engineZ, '#FF0000');
  }
  
  // Lights around rim
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const lightX = Math.round(Math.cos(angle) * radius);
    const lightZ = Math.round(Math.sin(angle) * radius);
    builder.addVoxel(lightX, centerY + height, lightZ, '#FFFF00');
  }
  
  // Decorative details
  addShipDecorativeDetails(builder, 0, centerY, 0, radius * 2, radius * 2, height, palette);
}

function generateTriangularShip(builder: VoxelBuilder, palette: Palette) {
  // Wedge/pyramid shape - NO WINGS (may have small fins)
  const length = randomRange(12, 18);
  const width = randomRange(6, 10);
  const height = randomRange(4, 6);
  const centerY = 5;
  
  // Main triangular body (wedge)
  for (let z = 0; z < length; z++) {
    const t = z / length; // 0 to 1
    const currentWidth = Math.floor(width * (1 - t * 0.3)); // Tapers to back
    const currentHeight = Math.floor(height * (1 - t * 0.2));
    builder.addBox(-currentWidth/2, centerY, -length/2 + z, currentWidth, currentHeight, 1, palette.primary);
  }
  
  // Small fins (not full wings)
  if (randomBoolean(0.5)) {
    const finSize = 2;
    builder.addBox(-width/2 - finSize, centerY, -length/2 + length/3, finSize, 2, 3, palette.secondary);
    builder.addBox(width/2, centerY, -length/2 + length/3, finSize, 2, 3, palette.secondary);
  }
  
  // Cockpit at front
  builder.addBox(-2, centerY + height, length/2 - 2, 4, 2, 3, palette.accent);
  builder.addVoxel(0, centerY + height + 1, length/2, '#00FFFF');
  
  // Engines at back
  const engineCount = randomRange(3, 5);
  const engineSpacing = width / (engineCount + 1);
  for (let i = 0; i < engineCount; i++) {
    const engineX = -width/2 + (i + 1) * engineSpacing;
    builder.addBox(engineX - 1, centerY, -length/2 - 2, 2, 2, 3, palette.accent);
    builder.addVoxel(engineX, centerY + 1, -length/2 - 3, '#FF0000');
  }
  
  // Weapon mounts on sides
  builder.addBox(-width/2 - 1, centerY + 1, length/4, 1, 2, 2, palette.accent);
  builder.addBox(width/2, centerY + 1, length/4, 1, 2, 2, palette.accent);
  
  // Decorative details
  addShipDecorativeDetails(builder, 0, centerY, 0, width, length, height, palette);
}

function generateCylindricalShip(builder: VoxelBuilder, palette: Palette) {
  // Long tube-shaped ship - NO WINGS
  const length = randomRange(15, 25);
  const radius = randomRange(3, 5);
  const centerY = 5;
  
  // Main cylindrical body
  builder.addCylinder(0, centerY, 0, radius, length, palette.primary, 'z');
  
  // Possibly rotating sections
  if (randomBoolean(0.5)) {
    const sectionZ = randomRange(-length/3, length/3);
    builder.addCylinder(0, centerY, sectionZ, radius + 1, 3, palette.secondary, 'z');
  }
  
  // Cockpit at front
  builder.addCylinder(0, centerY, length/2 - 2, radius + 1, 2, palette.accent, 'z');
  builder.addVoxel(0, centerY, length/2, '#00FFFF');
  
  // Engines at back (end-mounted)
  const engineCount = randomRange(4, 6);
  for (let i = 0; i < engineCount; i++) {
    const angle = (i / engineCount) * Math.PI * 2;
    const engineX = Math.round(Math.cos(angle) * (radius - 1));
    const engineY = centerY + Math.round(Math.sin(angle) * (radius - 1));
    builder.addVoxel(engineX, engineY, -length/2 - 1, palette.accent);
    builder.addVoxel(engineX, engineY, -length/2 - 2, '#FF0000');
  }
  
  // Docking ports along sides
  for (let i = 0; i < 3; i++) {
    const portZ = -length/3 + i * (length/3);
    builder.addBox(radius, centerY - 1, portZ, 1, 2, 2, palette.detail);
    builder.addBox(-radius - 1, centerY - 1, portZ, 1, 2, 2, palette.detail);
  }
  
  // Sensor arrays
  builder.addBox(0, centerY + radius + 1, 0, 2, 2, 3, palette.accent);
  
  // Decorative details
  addShipDecorativeDetails(builder, 0, centerY, 0, radius * 2, length, radius * 2, palette);
}

function generateXWing(builder: VoxelBuilder, palette: Palette) {
  // X-wing style - four wings in X pattern
  const fuselageLen = randomRange(8, 12);
  const fuselageWidth = 2;
  const fuselageHeight = 2;
  const fY = 5;
  const fZ = -fuselageLen / 2;
  
  // Central fuselage
  builder.addBox(-fuselageWidth/2, fY, fZ, fuselageWidth, fuselageHeight, fuselageLen, palette.primary);
  
  // Cockpit
  builder.addBox(-1, fY + fuselageHeight, fZ + fuselageLen - 3, 2, 1, 3, palette.accent);
  builder.addVoxel(0, fY + fuselageHeight + 1, fZ + fuselageLen - 1, '#00FFFF');
  
  // Four wings in X pattern
  const wingLength = randomRange(4, 6);
  const wingWidth = 1;
  const wingZ = fZ + fuselageLen/2;
  
  // Top-left wing
  builder.addBox(-fuselageWidth/2 - wingLength, fY, wingZ - wingLength, wingLength, wingWidth, wingLength, palette.secondary);
  // Top-right wing
  builder.addBox(fuselageWidth/2, fY, wingZ - wingLength, wingLength, wingWidth, wingLength, palette.secondary);
  // Bottom-left wing
  builder.addBox(-fuselageWidth/2 - wingLength, fY, wingZ, wingLength, wingWidth, wingLength, palette.secondary);
  // Bottom-right wing
  builder.addBox(fuselageWidth/2, fY, wingZ, wingLength, wingWidth, wingLength, palette.secondary);
  
  // Coat of arms on wings - ALWAYS decorate all 4 wings
  addCoatOfArmsToWing(builder, -fuselageWidth/2 - wingLength, fY, wingZ - wingLength, wingLength, wingLength, palette);
  addCoatOfArmsToWing(builder, fuselageWidth/2, fY, wingZ - wingLength, wingLength, wingLength, palette);
  addCoatOfArmsToWing(builder, -fuselageWidth/2 - wingLength, fY, wingZ, wingLength, wingLength, palette);
  addCoatOfArmsToWing(builder, fuselageWidth/2, fY, wingZ, wingLength, wingLength, palette);
  
  // Weapons on wing tips
  builder.addVoxel(-fuselageWidth/2 - wingLength - 1, fY, wingZ - wingLength, palette.accent);
  builder.addVoxel(fuselageWidth/2 + wingLength, fY, wingZ - wingLength, palette.accent);
  builder.addVoxel(-fuselageWidth/2 - wingLength - 1, fY, wingZ + wingLength, palette.accent);
  builder.addVoxel(fuselageWidth/2 + wingLength, fY, wingZ + wingLength, palette.accent);
  
  // Engines
  builder.addBox(-1, fY + 1, fZ - 2, 1, 1, 2, palette.accent);
  builder.addBox(1, fY + 1, fZ - 2, 1, 1, 2, palette.accent);
  builder.addVoxel(-1, fY + 1, fZ - 3, '#FF0000');
  builder.addVoxel(1, fY + 1, fZ - 3, '#FF0000');
  
  // Decorative details
  addShipDecorativeDetails(builder, 0, fY, fZ + fuselageLen/2, fuselageWidth, fuselageLen, fuselageHeight, palette);
}

function generateTIEFighter(builder: VoxelBuilder, palette: Palette) {
  // TIE fighter style - hexagonal body with side panels
  const bodySize = randomRange(3, 5);
  const panelSize = randomRange(4, 6);
  const centerY = 5;
  
  // Hexagonal central body
  builder.addSphere(0, centerY, 0, bodySize, palette.primary);
  
  // Side panels (left and right)
  builder.addCylinder(-bodySize - panelSize/2, centerY, 0, panelSize/2, 1, palette.secondary, 'z');
  builder.addCylinder(bodySize + panelSize/2, centerY, 0, panelSize/2, 1, palette.secondary, 'z');
  
  // Panel details
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const detailX = -bodySize - panelSize/2 + Math.round(Math.cos(angle) * panelSize/4);
    const detailZ = Math.round(Math.sin(angle) * panelSize/4);
    builder.addVoxel(detailX, centerY, detailZ, palette.detail);
  }
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const detailX = bodySize + panelSize/2 + Math.round(Math.cos(angle) * panelSize/4);
    const detailZ = Math.round(Math.sin(angle) * panelSize/4);
    builder.addVoxel(detailX, centerY, detailZ, palette.detail);
  }
  
  // Central cockpit
  builder.addVoxel(0, centerY, bodySize, '#00FFFF');
  builder.addVoxel(0, centerY, bodySize + 1, '#000000');
  
  // Wing struts
  builder.addBox(-bodySize - 1, centerY, 0, 1, 1, 1, palette.detail);
  builder.addBox(bodySize, centerY, 0, 1, 1, 1, palette.detail);
  
  // Engines (back of body)
  builder.addVoxel(0, centerY, -bodySize, palette.accent);
  builder.addVoxel(0, centerY, -bodySize - 1, '#FF0000');
  
  // Decorative details
  addShipDecorativeDetails(builder, 0, centerY, 0, bodySize * 2, bodySize * 2, bodySize, palette);
}

function generateStarDestroyer(builder: VoxelBuilder, palette: Palette) {
  // Star Destroyer style - large triangular wedge
  const length = randomRange(25, 35);
  const frontWidth = randomRange(12, 18);
  const height = randomRange(6, 10);
  const centerY = 5;
  
  // Main triangular wedge
  for (let z = 0; z < length; z++) {
    const t = z / length;
    const currentWidth = Math.floor(frontWidth * (1 - t * 0.8)); // Tapers significantly
    const currentHeight = Math.floor(height * (1 - t * 0.3));
    builder.addBox(-currentWidth/2, centerY, -length/2 + z, currentWidth, currentHeight, 1, palette.primary);
  }
  
  // Bridge tower
  const towerHeight = randomRange(4, 6);
  const towerWidth = randomRange(3, 5);
  const towerZ = length/2 - randomRange(4, 6);
  builder.addBox(-towerWidth/2, centerY + height, towerZ, towerWidth, towerHeight, 3, palette.accent);
  builder.addVoxel(0, centerY + height + towerHeight, towerZ + 1, '#00FFFF');
  
  // Multiple engine arrays (back)
  const engineRows = randomRange(3, 5);
  const enginesPerRow = randomRange(4, 6);
  for (let row = 0; row < engineRows; row++) {
    for (let i = 0; i < enginesPerRow; i++) {
      const engineX = -frontWidth/4 + (i / (enginesPerRow - 1)) * (frontWidth/2);
      const engineY = centerY + row * 2;
      builder.addBox(engineX - 1, engineY, -length/2 - 2, 2, 2, 3, palette.accent);
      builder.addVoxel(engineX, engineY + 1, -length/2 - 3, '#FF0000');
    }
  }
  
  // Weapon turrets along sides
  const turretCount = randomRange(6, 10);
  for (let i = 0; i < turretCount; i++) {
    const turretZ = -length/2 + 3 + i * 4;
    const turretWidth = Math.floor(frontWidth * (1 - (turretZ + length/2) / length * 0.8));
    builder.addCylinder(-turretWidth/2, centerY + height, turretZ, 1, 2, palette.accent, 'y');
    builder.addCylinder(turretWidth/2, centerY + height, turretZ, 1, 2, palette.accent, 'y');
    builder.addVoxel(-turretWidth/2, centerY + height + 2, turretZ, '#FFFF00');
    builder.addVoxel(turretWidth/2, centerY + height + 2, turretZ, '#FFFF00');
  }
  
  // Hangar bay (front underside)
  builder.addBox(-frontWidth/4, centerY - 2, length/2 - 4, frontWidth/2, 2, 4, palette.secondary);
  
  // Decorative details
  addShipDecorativeDetails(builder, 0, centerY, 0, frontWidth, length, height, palette);
}

function generateOrnithopter(builder: VoxelBuilder, palette: Palette) {
  // Insect-like with articulated wing structures
  const bodyLen = randomRange(8, 12);
  const bodyWidth = randomRange(3, 5);
  const bodyHeight = randomRange(2, 4);
  const centerY = 5;
  
  // Main body (insect-like)
  builder.addBox(-bodyWidth/2, centerY, -bodyLen/2, bodyWidth, bodyHeight, bodyLen, palette.primary);
  
  // Articulated wings (4 wings like an insect)
  const wingLength = randomRange(5, 8);
  const wingWidth = 1;
  
  // Front left wing
  for (let i = 0; i < wingLength; i++) {
    const angle = i * 0.3;
    const wingX = -bodyWidth/2 - Math.round(Math.cos(angle) * i);
    const wingY = centerY + Math.round(Math.sin(angle) * i);
    const wingZ = bodyLen/4;
    builder.addBox(wingX, wingY, wingZ, wingWidth, 1, 2, palette.secondary);
  }
  
  // Front right wing
  for (let i = 0; i < wingLength; i++) {
    const angle = i * 0.3;
    const wingX = bodyWidth/2 + Math.round(Math.cos(angle) * i);
    const wingY = centerY + Math.round(Math.sin(angle) * i);
    const wingZ = bodyLen/4;
    builder.addBox(wingX, wingY, wingZ, wingWidth, 1, 2, palette.secondary);
  }
  
  // Back left wing
  for (let i = 0; i < wingLength; i++) {
    const angle = i * 0.3;
    const wingX = -bodyWidth/2 - Math.round(Math.cos(angle) * i);
    const wingY = centerY + Math.round(Math.sin(angle) * i);
    const wingZ = -bodyLen/4;
    builder.addBox(wingX, wingY, wingZ, wingWidth, 1, 2, palette.secondary);
  }
  
  // Back right wing
  for (let i = 0; i < wingLength; i++) {
    const angle = i * 0.3;
    const wingX = bodyWidth/2 + Math.round(Math.cos(angle) * i);
    const wingY = centerY + Math.round(Math.sin(angle) * i);
    const wingZ = -bodyLen/4;
    builder.addBox(wingX, wingY, wingZ, wingWidth, 1, 2, palette.secondary);
  }
  
  // Coat of arms on all wings - ALWAYS decorate all 4 wings
  // Front left wing (approximate center position)
  const frontLeftWingX = -bodyWidth/2 - wingLength/2;
  const frontLeftWingY = centerY + Math.round(Math.sin(wingLength * 0.3) * wingLength/2);
  addCoatOfArmsToWing(builder, frontLeftWingX, frontLeftWingY, bodyLen/4, wingLength, 2, palette);
  
  // Front right wing
  const frontRightWingX = bodyWidth/2 + wingLength/2;
  const frontRightWingY = centerY + Math.round(Math.sin(wingLength * 0.3) * wingLength/2);
  addCoatOfArmsToWing(builder, frontRightWingX, frontRightWingY, bodyLen/4, wingLength, 2, palette);
  
  // Back left wing
  const backLeftWingX = -bodyWidth/2 - wingLength/2;
  const backLeftWingY = centerY + Math.round(Math.sin(wingLength * 0.3) * wingLength/2);
  addCoatOfArmsToWing(builder, backLeftWingX, backLeftWingY, -bodyLen/4, wingLength, 2, palette);
  
  // Back right wing
  const backRightWingX = bodyWidth/2 + wingLength/2;
  const backRightWingY = centerY + Math.round(Math.sin(wingLength * 0.3) * wingLength/2);
  addCoatOfArmsToWing(builder, backRightWingX, backRightWingY, -bodyLen/4, wingLength, 2, palette);
  
  // Cockpit
  builder.addBox(-1, centerY + bodyHeight, bodyLen/2 - 2, 2, 1, 3, palette.accent);
  builder.addVoxel(0, centerY + bodyHeight + 1, bodyLen/2 - 1, '#00FFFF');
  
  // Legs (landing gear, insect-like)
  for (let i = 0; i < 6; i++) {
    const legZ = -bodyLen/2 + i * 2;
    const legX = i % 2 === 0 ? -bodyWidth/2 : bodyWidth/2;
    builder.addBox(legX, centerY - 3, legZ, 1, 3, 1, palette.detail);
  }
  
  // Engines
  builder.addBox(-1, centerY, -bodyLen/2 - 2, 1, 1, 2, palette.accent);
  builder.addBox(1, centerY, -bodyLen/2 - 2, 1, 1, 2, palette.accent);
  builder.addVoxel(-1, centerY, -bodyLen/2 - 3, '#FF0000');
  builder.addVoxel(1, centerY, -bodyLen/2 - 3, '#FF0000');
  
  // Decorative details
  addShipDecorativeDetails(builder, 0, centerY, 0, bodyWidth, bodyLen, bodyHeight, palette);
}

function generateCorvette(builder: VoxelBuilder, palette: Palette) {
  // Medium-sized with varied configurations
  const config = randomRange(0, 2);
  
  if (config === 0) {
    // Sleek corvette - minimal wings
    const fuselageLen = randomRange(12, 16);
    const fuselageWidth = randomRange(4, 6);
    const fuselageHeight = randomRange(3, 5);
    const fY = 5;
    const fZ = -fuselageLen / 2;
    
    builder.addBox(-fuselageWidth/2, fY, fZ, fuselageWidth, fuselageHeight, fuselageLen, palette.primary);
    
    // Small fins only
    builder.addBox(-fuselageWidth/2 - 1, fY, fZ + fuselageLen/3, 1, 2, 2, palette.secondary);
    builder.addBox(fuselageWidth/2, fY, fZ + fuselageLen/3, 1, 2, 2, palette.secondary);
    
    // Cockpit
    builder.addBox(-2, fY + fuselageHeight, fZ + fuselageLen - 4, 4, 2, 4, palette.accent);
    
    // Engines
    builder.addBox(-1, fY + 1, fZ - 2, 2, 2, 3, palette.accent);
    builder.addVoxel(0, fY + 2, fZ - 3, '#FF0000');
    
    // Decorative details
    addShipDecorativeDetails(builder, 0, fY, fZ + fuselageLen/2, fuselageWidth, fuselageLen, fuselageHeight, palette);
  } else if (config === 1) {
    // Blocky corvette - no wings
    const length = randomRange(10, 14);
    const width = randomRange(5, 7);
    const height = randomRange(4, 6);
    const centerY = 5;
    
    builder.addBox(-width/2, centerY, -length/2, width, height, length, palette.primary);
    
    // Multiple weapon mounts
    for (let i = 0; i < 4; i++) {
      const mountZ = -length/2 + 2 + i * 3;
      builder.addBox(-width/2 - 1, centerY + 1, mountZ, 1, 2, 2, palette.accent);
      builder.addBox(width/2, centerY + 1, mountZ, 1, 2, 2, palette.accent);
    }
    
    // Cockpit
    builder.addBox(-2, centerY + height, length/2 - 2, 4, 2, 3, palette.accent);
    
    // Engines
    builder.addBox(-1, centerY, -length/2 - 2, 2, 2, 3, palette.accent);
    
    // Decorative details
    addShipDecorativeDetails(builder, 0, centerY, 0, width, length, height, palette);
  } else {
    // Curved corvette - organic shape
    const size = randomRange(6, 9);
    const centerY = 5;
    
    builder.addSphere(0, centerY, 0, size, palette.primary);
    
    // Extended sections
    builder.addBox(-size/2, centerY, size/2, size, size/2, 3, palette.primary);
    builder.addBox(-size/2, centerY, -size/2 - 3, size, size/2, 3, palette.primary);
    
    // Cockpit
    builder.addSphere(0, centerY + size - 1, size/2 + 2, 2, palette.accent);
    
    // Engines
    builder.addVoxel(-2, centerY, -size/2 - 3, palette.accent);
    builder.addVoxel(2, centerY, -size/2 - 3, palette.accent);
    
    // Decorative details
    addShipDecorativeDetails(builder, 0, centerY, 0, size * 2, size * 2, size, palette);
  }
}
