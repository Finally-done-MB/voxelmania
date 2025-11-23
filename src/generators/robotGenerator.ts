import type { VoxelObjectData } from '../types';
import { getRandomPalette } from '../utils/palettes';
import { VoxelBuilder, randomRange, randomChoice, randomBoolean, setSeed, generateSeed } from '../utils/voxelBuilder';
import {
  generateHand,
  generateElbow,
  generateWeapon,
  generateTool,
  generateRobotHead,
  generateRobotTorso,
  generateRobotLeg,
  generateBackTool,
  generateHeadTool,
  generateShoulderTool,
  generateChestTool,
  generateHipTool
} from '../utils/components';

export function generateRobot(seed?: number): VoxelObjectData {
  // Set seed if provided, otherwise generate new one
  const actualSeed = seed !== undefined ? seed : generateSeed();
  setSeed(actualSeed);
  
  const palette = getRandomPalette('robot');
  const builder = new VoxelBuilder(palette);

  // Randomize proportions
  const isTall = randomBoolean(0.3);
  const isWide = randomBoolean(0.2);
  const isThin = randomBoolean(0.2);

  // --- Legs ---
  const legHeight = isTall ? randomRange(8, 12) : randomRange(4, 8);
  const legWidth = isWide ? randomRange(3, 4) : randomRange(2, 3);
  const legSpacing = randomRange(1, 3);
  
  const leftLegX = -legSpacing - legWidth;
  const rightLegX = legSpacing;
  const legZ = -1;
  
  // Left Leg (detailed)
  generateRobotLeg(builder, 'left', leftLegX + legWidth/2, 0, legZ + legWidth/2, legHeight, palette);
  // Right Leg (detailed)
  generateRobotLeg(builder, 'right', rightLegX + legWidth/2, 0, legZ + legWidth/2, legHeight, palette);

  // --- Torso ---
  const torsoY = legHeight;
  const torsoWidth = (legSpacing + legWidth) * 2 + (isWide ? randomRange(2, 4) : randomRange(0, 2));
  const torsoHeight = isTall ? randomRange(7, 11) : randomRange(5, 9);
  const torsoDepth = isThin ? randomRange(2, 4) : randomRange(3, 5);
  const torsoX = 0;
  const torsoZ = 0;

  generateRobotTorso(builder, torsoX, torsoY, torsoZ, torsoWidth, torsoHeight, torsoDepth, palette);

  // --- Head ---
  const headY = torsoY + torsoHeight;
  const headX = 0;
  const headZ = 0;

  // Neck
  builder.addBox(-1, headY - 1, -1, 2, 1, 2, palette.detail);
  
  // Varied head types
  const headType = randomChoice(['humanoid', 'sensor', 'visor', 'antenna']);
  generateRobotHead(builder, headType, headX, headY, headZ, palette);

  // --- Arms with detailed joints ---
  const armWidth = 2;
  const upperArmLength = randomRange(3, 5);
  const forearmLength = randomRange(3, 5);
  const totalArmLength = upperArmLength + forearmLength;
  const armY = torsoY + torsoHeight - 2;
  
  // Left Arm
  const leftArmX = -torsoWidth/2 - armWidth - 1;
  // Upper arm
  builder.addBox(leftArmX, armY - upperArmLength, -1, armWidth, upperArmLength, 3, palette.secondary);
  // Elbow
  generateElbow(builder, 'left', leftArmX + armWidth/2, armY - upperArmLength, 0, palette);
  // Forearm
  builder.addBox(leftArmX, armY - upperArmLength - forearmLength - 1, -1, armWidth, forearmLength, 3, palette.secondary);
  // Wrist
  builder.addBox(leftArmX - 1, armY - totalArmLength - 1, -1, armWidth + 2, 1, 3, palette.detail);
  
  // Right Arm
  const rightArmX = torsoWidth/2 + 1;
  // Upper arm
  builder.addBox(rightArmX, armY - upperArmLength, -1, armWidth, upperArmLength, 3, palette.secondary);
  // Elbow
  generateElbow(builder, 'right', rightArmX + armWidth/2, armY - upperArmLength, 0, palette);
  // Forearm
  builder.addBox(rightArmX, armY - upperArmLength - forearmLength - 1, -1, armWidth, forearmLength, 3, palette.secondary);
  // Wrist
  builder.addBox(rightArmX - 1, armY - totalArmLength - 1, -1, armWidth + 2, 1, 3, palette.detail);

  // Shoulders
  builder.addBox(leftArmX - 2, armY, -2, armWidth + 2, 2, 5, palette.detail);
  builder.addBox(rightArmX, armY, -2, armWidth + 2, 2, 5, palette.detail);

  // --- Tools/Weapons - Flexible attachment system ---
  const handY = armY - totalArmLength - 1;
  const handZ = 0;
  
  // 60% chance: Tools replace hands, 40% chance: Tools are in addition to hands
  const toolsReplaceHands = randomBoolean(0.6);
  
  if (toolsReplaceHands) {
    // Tools replace hands (original behavior)
    const hasLeftTool = randomBoolean(0.7);
    const hasRightTool = randomBoolean(0.7);
    
    if (hasLeftTool) {
      if (randomBoolean(0.5)) {
        const weaponType = randomChoice(['blade', 'gun', 'plasma', 'drill', 'saw']);
        generateWeapon(builder, weaponType, leftArmX + armWidth/2, handY, handZ + 3, palette);
      } else {
        const toolType = randomChoice(['pliers', 'wrench', 'cutter', 'claw']);
        generateTool(builder, toolType, leftArmX + armWidth/2, handY, handZ + 3, palette);
      }
    } else {
      generateHand(builder, 'left', leftArmX + armWidth/2, handY, handZ + 2, palette);
    }
    
    if (hasRightTool) {
      if (randomBoolean(0.5)) {
        const weaponType = randomChoice(['blade', 'gun', 'plasma', 'drill', 'saw']);
        generateWeapon(builder, weaponType, rightArmX + armWidth/2, handY, handZ + 3, palette);
      } else {
        const toolType = randomChoice(['pliers', 'wrench', 'cutter', 'claw']);
        generateTool(builder, toolType, rightArmX + armWidth/2, handY, handZ + 3, palette);
      }
    } else {
      generateHand(builder, 'right', rightArmX + armWidth/2, handY, handZ + 2, palette);
    }
  } else {
    // Tools are in addition to hands - always have hands
    generateHand(builder, 'left', leftArmX + armWidth/2, handY, handZ + 2, palette);
    generateHand(builder, 'right', rightArmX + armWidth/2, handY, handZ + 2, palette);
    
    // Add additional tools from other locations
    const additionalToolLocation = randomChoice([
      'back', 'back', 'back',      // 30%
      'head', 'head',              // 20%
      'shoulders', 'shoulders',    // 20%
      'chest',                     // 15%
      'hips'                       // 15%
    ]);
    
    switch (additionalToolLocation) {
      case 'back':
        generateBackTool(builder, torsoX, torsoY, torsoZ, torsoWidth, torsoHeight, torsoDepth, palette);
        break;
      case 'head':
        generateHeadTool(builder, headX, headY, headZ, palette);
        break;
      case 'shoulders':
        generateShoulderTool(builder, leftArmX, rightArmX, armY, palette);
        break;
      case 'chest':
        generateChestTool(builder, torsoX, torsoY, torsoZ, torsoWidth, torsoHeight, torsoDepth, palette);
        break;
      case 'hips':
        generateHipTool(builder, leftLegX, rightLegX, legHeight, palette);
        break;
    }
  }

  // --- Optional Backpack/Jetpack (30% chance) ---
  // Only if no back tool was added
  if (randomBoolean(0.3) && (!toolsReplaceHands || randomBoolean(0.5))) {
    const backpackWidth = randomRange(3, 5);
    const backpackHeight = randomRange(4, 6);
    builder.addBox(-backpackWidth/2, torsoY + 1, -torsoDepth/2 - 2, backpackWidth, backpackHeight, 2, palette.secondary);
    // Jetpack details
    if (randomBoolean(0.5)) {
      builder.addBox(-1, torsoY + backpackHeight + 1, -torsoDepth/2 - 2, 2, 2, 2, palette.accent);
      builder.addBox(1, torsoY + backpackHeight + 1, -torsoDepth/2 - 2, 2, 2, 2, palette.accent);
    }
  }

  // --- Additional torso details ---
  // Chest panel
  if (randomBoolean(0.6)) {
    builder.addBox(-2, torsoY + torsoHeight/2, -torsoDepth/2 - 1, 4, 3, 1, palette.accent);
  }
  
  // Side ports
  if (randomBoolean(0.5)) {
    builder.addBox(-torsoWidth/2 - 1, torsoY + 2, -1, 1, 2, 2, palette.detail);
    builder.addBox(torsoWidth/2, torsoY + 2, -1, 1, 2, 2, palette.detail);
  }

  return {
    id: crypto.randomUUID(),
    name: `Robot ${randomRange(1, 999)}`,
    category: 'robot',
    createdAt: Date.now(),
    voxels: builder.voxels,
    seed: actualSeed
  };
}
