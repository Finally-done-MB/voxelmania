import type { Palette } from './palettes';
import { VoxelBuilder, randomRange, randomBoolean, randomChoice } from './voxelBuilder';

// ========== ROBOT COMPONENTS ==========

export function generateHand(builder: VoxelBuilder, side: 'left' | 'right', x: number, y: number, z: number, palette: Palette) {
  const handSize = randomRange(2, 3);
  const fingerCount = randomRange(3, 5);
  
  // Palm
  builder.addBox(x - handSize/2, y, z, handSize, handSize, 2, palette.secondary);
  
  // Thumb (opposable)
  const thumbX = side === 'left' ? x - handSize/2 - 1 : x + handSize/2;
  const thumbLength = randomRange(2, 3);
  for (let i = 0; i < thumbLength; i++) {
    builder.addVoxel(thumbX, y + i, z + 1, palette.detail);
  }
  
  // Fingers
  const fingerSpacing = handSize / (fingerCount + 1);
  for (let i = 0; i < fingerCount; i++) {
    const fingerX = x - handSize/2 + (i + 1) * fingerSpacing;
    const fingerLength = randomRange(2, 4);
    for (let j = 0; j < fingerLength; j++) {
      builder.addVoxel(fingerX, y + j, z + 2, palette.detail);
    }
  }
}

export function generateElbow(builder: VoxelBuilder, _side: 'left' | 'right', x: number, y: number, z: number, palette: Palette) {
  // Joint mechanism
  builder.addBox(x - 1, y, z - 1, 2, 2, 2, palette.detail);
  // Joint details
  builder.addVoxel(x, y + 1, z, palette.accent);
  builder.addVoxel(x, y - 1, z, palette.accent);
}

export function generateKnee(builder: VoxelBuilder, _side: 'left' | 'right', x: number, y: number, z: number, palette: Palette) {
  // Knee joint
  builder.addBox(x - 1, y, z - 1, 2, 2, 2, palette.detail);
  // Joint details
  builder.addVoxel(x, y + 1, z, palette.accent);
  builder.addVoxel(x, y - 1, z, palette.accent);
}

export function generateWeapon(builder: VoxelBuilder, type: string, x: number, y: number, z: number, palette: Palette) {
  switch (type) {
    case 'blade':
      // Energy blade
      const bladeLength = randomRange(6, 12);
      builder.addBox(x - 1, y, z, 2, 2, bladeLength, palette.accent);
      builder.addBox(x, y, z + bladeLength, 1, 1, 2, '#FFFFFF');
      break;
    case 'gun':
      // Plasma gun
      builder.addBox(x - 1, y, z, 2, 2, 4, palette.secondary);
      builder.addBox(x - 1, y + 1, z + 4, 2, 1, 2, palette.accent);
      builder.addVoxel(x, y, z + 6, '#FF0000'); // Muzzle
      break;
    case 'plasma':
      // Plasma cannon
      builder.addBox(x - 2, y, z, 4, 3, 5, palette.secondary);
      builder.addBox(x - 1, y + 1, z + 5, 2, 1, 3, palette.accent);
      break;
    case 'drill':
      // Drill attachment
      builder.addBox(x - 1, y, z, 2, 2, 3, palette.secondary);
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const offsetX = Math.round(Math.cos(angle));
        const offsetZ = Math.round(Math.sin(angle));
        builder.addVoxel(x + offsetX, y, z + 3 + offsetZ, palette.detail);
      }
      break;
    case 'saw':
      // Circular saw
      builder.addBox(x - 1, y, z, 2, 2, 2, palette.secondary);
      // Saw blade
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const offsetX = Math.round(Math.cos(angle) * 2);
        const offsetZ = Math.round(Math.sin(angle) * 2);
        builder.addVoxel(x + offsetX, y, z + 2 + offsetZ, palette.accent);
      }
      break;
    default:
      builder.addBox(x - 1, y, z, 2, 2, 4, palette.accent);
  }
}

export function generateTool(builder: VoxelBuilder, type: string, x: number, y: number, z: number, palette: Palette) {
  switch (type) {
    case 'pliers':
      // Pliers
      builder.addBox(x - 1, y, z, 2, 2, 2, palette.secondary);
      // Two jaws
      builder.addBox(x - 2, y, z + 2, 1, 1, 2, palette.detail);
      builder.addBox(x + 1, y, z + 2, 1, 1, 2, palette.detail);
      break;
    case 'wrench':
      // Wrench
      builder.addBox(x - 1, y, z, 2, 2, 3, palette.secondary);
      builder.addBox(x - 2, y, z + 3, 4, 1, 1, palette.detail);
      break;
    case 'cutter':
      // Cutter tool
      builder.addBox(x - 1, y, z, 2, 2, 2, palette.secondary);
      builder.addBox(x - 1, y, z + 2, 2, 1, 3, palette.accent);
      break;
    case 'claw':
      // Claw
      builder.addBox(x - 1, y, z, 2, 2, 2, palette.secondary);
      // Three claws
      for (let i = 0; i < 3; i++) {
        const clawX = x - 1 + i;
        builder.addBox(clawX, y, z + 2, 1, 1, 3, palette.detail);
      }
      break;
    default:
      builder.addBox(x - 1, y, z, 2, 2, 3, palette.detail);
  }
}

export function generateRobotHead(builder: VoxelBuilder, type: string, x: number, y: number, z: number, palette: Palette) {
  const headWidth = randomRange(3, 5);
  const headHeight = randomRange(3, 5);
  const headDepth = randomRange(3, 5);
  
  switch (type) {
    case 'humanoid':
      builder.addBox(x - headWidth/2, y, z - headDepth/2, headWidth, headHeight, headDepth, palette.primary);
      // Eyes
      builder.addBox(x - 1, y + 2, z + headDepth/2, 2, 1, 1, palette.accent);
      break;
    case 'sensor':
      // Sensor array head
      builder.addBox(x - headWidth/2, y, z - headDepth/2, headWidth, headHeight, headDepth, palette.primary);
      // Multiple sensors
      for (let i = 0; i < 4; i++) {
        builder.addVoxel(x - headWidth/2 + i, y + headHeight, z, palette.accent);
      }
      break;
    case 'visor':
      // Visor head
      builder.addBox(x - headWidth/2, y, z - headDepth/2, headWidth, headHeight, headDepth, palette.primary);
      // Visor
      builder.addBox(x - headWidth/2 + 1, y + 1, z + headDepth/2, headWidth - 2, 2, 1, palette.accent);
      break;
    case 'antenna':
      // Antenna cluster
      builder.addBox(x - headWidth/2, y, z - headDepth/2, headWidth, headHeight, headDepth, palette.primary);
      // Antennas
      for (let i = 0; i < 3; i++) {
        const antX = x - 1 + i;
        for (let j = 0; j < 3; j++) {
          builder.addVoxel(antX, y + headHeight + j, z, palette.detail);
        }
      }
      break;
    default:
      builder.addBox(x - headWidth/2, y, z - headDepth/2, headWidth, headHeight, headDepth, palette.primary);
  }
}

export function generateRobotTorso(builder: VoxelBuilder, x: number, y: number, z: number, width: number, height: number, depth: number, palette: Palette) {
  builder.addBox(x - width/2, y, z - depth/2, width, height, depth, palette.primary);
  
  // Panels
  if (randomBoolean(0.7)) {
    builder.addBox(x - width/2 + 1, y + 1, z - depth/2 - 1, width - 2, height - 2, 1, palette.secondary);
  }
  
  // Vents
  if (randomBoolean(0.6)) {
    for (let i = 0; i < 3; i++) {
      builder.addBox(x - 1, y + 2 + i * 2, z - depth/2 - 1, 2, 1, 1, palette.detail);
    }
  }
  
  // Core reactor
  if (randomBoolean(0.5)) {
    builder.addVoxel(x, y + height/2, z, palette.accent);
    builder.addVoxel(x, y + height/2 + 1, z, palette.accent);
  }
}

export function generateRobotLeg(builder: VoxelBuilder, side: 'left' | 'right', x: number, y: number, z: number, length: number, palette: Palette) {
  const legWidth = randomRange(2, 3);
  const thighLength = Math.floor(length * 0.4);
  const shinLength = Math.floor(length * 0.4);
  const footLength = length - thighLength - shinLength;
  
  // Thigh
  builder.addBox(x - legWidth/2, y, z, legWidth, thighLength, legWidth, palette.secondary);
  
  // Knee
  generateKnee(builder, side, x, y + thighLength, z + legWidth/2, palette);
  
  // Shin
  builder.addBox(x - legWidth/2, y + thighLength + 1, z, legWidth, shinLength, legWidth, palette.secondary);
  
  // Ankle
  builder.addBox(x - 1, y + thighLength + shinLength + 1, z - 1, 2, 1, 2, palette.detail);
  
  // Foot with toes
  builder.addBox(x - legWidth/2, y + thighLength + shinLength + 2, z, legWidth, 1, footLength + 2, palette.dark);
  // Toes
  for (let i = 0; i < 3; i++) {
    builder.addVoxel(x - 1 + i, y + thighLength + shinLength + 3, z + footLength + 2, palette.detail);
  }
}

export function generateBackTool(builder: VoxelBuilder, torsoX: number, torsoY: number, torsoZ: number, _torsoWidth: number, torsoHeight: number, torsoDepth: number, palette: Palette) {
  // Large tools mounted on back (welding torches, large drills, extendable arms)
  const toolType = randomChoice(['welding', 'large-drill', 'extendable-arm', 'crane']);
  
  switch (toolType) {
    case 'welding':
      // Welding torch
      builder.addBox(torsoX - 1, torsoY + torsoHeight/2, torsoZ - torsoDepth/2 - 3, 2, 2, 4, palette.accent);
      builder.addVoxel(torsoX, torsoY + torsoHeight/2, torsoZ - torsoDepth/2 - 4, '#FFFF00');
      break;
    case 'large-drill':
      // Large drill
      builder.addBox(torsoX - 2, torsoY + torsoHeight/2, torsoZ - torsoDepth/2 - 3, 4, 3, 5, palette.secondary);
      // Drill bit
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const offsetX = Math.round(Math.cos(angle));
        const offsetZ = Math.round(Math.sin(angle));
        builder.addVoxel(torsoX + offsetX, torsoY + torsoHeight/2, torsoZ - torsoDepth/2 - 4 + offsetZ, palette.detail);
      }
      break;
    case 'extendable-arm':
      // Extendable arm
      builder.addBox(torsoX - 1, torsoY + 1, torsoZ - torsoDepth/2 - 2, 2, torsoHeight - 2, 2, palette.secondary);
      // Arm segments
      for (let i = 0; i < 3; i++) {
        builder.addBox(torsoX - 1, torsoY + 1 + i * 2, torsoZ - torsoDepth/2 - 4 - i, 2, 2, 2, palette.detail);
      }
      // Gripper at end
      builder.addBox(torsoX - 1, torsoY + 7, torsoZ - torsoDepth/2 - 7, 2, 1, 2, palette.accent);
      builder.addBox(torsoX - 2, torsoY + 7, torsoZ - torsoDepth/2 - 7, 1, 1, 2, palette.accent);
      builder.addBox(torsoX + 1, torsoY + 7, torsoZ - torsoDepth/2 - 7, 1, 1, 2, palette.accent);
      break;
    case 'crane':
      // Crane arm
      builder.addBox(torsoX - 1, torsoY + torsoHeight/2, torsoZ - torsoDepth/2 - 2, 2, 4, 2, palette.secondary);
      // Crane boom
      for (let i = 0; i < 5; i++) {
        builder.addBox(torsoX - 1, torsoY + torsoHeight/2 + 2, torsoZ - torsoDepth/2 - 4 - i, 2, 1, 1, palette.detail);
      }
      break;
  }
}

export function generateHeadTool(builder: VoxelBuilder, headX: number, headY: number, headZ: number, palette: Palette) {
  // Small tools mounted on head (sensors, scanners, small cutters, lights)
  const toolType = randomChoice(['sensor', 'scanner', 'small-cutter', 'light', 'antenna']);
  
  switch (toolType) {
    case 'sensor':
      // Sensor array
      builder.addBox(headX - 1, headY + 3, headZ, 2, 2, 2, palette.accent);
      builder.addVoxel(headX, headY + 4, headZ, '#00FFFF');
      break;
    case 'scanner':
      // Scanner
      builder.addCylinder(headX, headY + 3, headZ, 1, 2, palette.accent, 'y');
      builder.addVoxel(headX, headY + 4, headZ, '#FFFF00');
      break;
    case 'small-cutter':
      // Small cutter
      builder.addBox(headX - 1, headY + 3, headZ, 2, 1, 3, palette.accent);
      builder.addVoxel(headX, headY + 3, headZ + 3, '#FF0000');
      break;
    case 'light':
      // Light
      builder.addBox(headX - 1, headY + 3, headZ, 2, 1, 2, palette.detail);
      builder.addVoxel(headX, headY + 3, headZ + 2, '#FFFFFF');
      break;
    case 'antenna':
      // Antenna
      for (let i = 0; i < 4; i++) {
        builder.addVoxel(headX, headY + 3 + i, headZ, palette.detail);
      }
      builder.addVoxel(headX, headY + 7, headZ, '#00FFFF');
      break;
  }
}

export function generateShoulderTool(builder: VoxelBuilder, leftArmX: number, rightArmX: number, armY: number, palette: Palette) {
  // Tools mounted on shoulders (cannons, extendable arms, tools)
  const toolType = randomChoice(['cannon', 'extendable', 'tool-mount']);
  const armWidth = 2;
  
  switch (toolType) {
    case 'cannon':
      // Shoulder cannons
      builder.addBox(leftArmX - 2, armY + 2, -1, 2, 2, 4, palette.accent);
      builder.addBox(rightArmX + armWidth, armY + 2, -1, 2, 2, 4, palette.accent);
      builder.addVoxel(leftArmX - 1, armY + 2, -2, '#FF0000');
      builder.addVoxel(rightArmX + armWidth + 1, armY + 2, -2, '#FF0000');
      break;
    case 'extendable':
      // Extendable arms
      for (let i = 0; i < 3; i++) {
        builder.addBox(leftArmX - 2, armY + 2 + i, -1, 1, 1, 2, palette.detail);
        builder.addBox(rightArmX + armWidth + 1, armY + 2 + i, -1, 1, 1, 2, palette.detail);
      }
      // Grippers
      builder.addBox(leftArmX - 3, armY + 5, -1, 1, 1, 2, palette.accent);
      builder.addBox(rightArmX + armWidth + 2, armY + 5, -1, 1, 1, 2, palette.accent);
      break;
    case 'tool-mount':
      // Tool mounts
      builder.addBox(leftArmX - 2, armY + 2, -1, 2, 2, 3, palette.secondary);
      builder.addBox(rightArmX + armWidth, armY + 2, -1, 2, 2, 3, palette.secondary);
      // Small tools
      builder.addVoxel(leftArmX - 1, armY + 2, -2, palette.accent);
      builder.addVoxel(rightArmX + armWidth + 1, armY + 2, -2, palette.accent);
      break;
  }
}

export function generateChestTool(builder: VoxelBuilder, torsoX: number, torsoY: number, torsoZ: number, _torsoWidth: number, torsoHeight: number, torsoDepth: number, palette: Palette) {
  // Medium tools mounted on chest (cutters, saws, plasma torches)
  const toolType = randomChoice(['cutter', 'saw', 'plasma-torch', 'welder']);
  
  switch (toolType) {
    case 'cutter':
      // Chest-mounted cutter
      builder.addBox(torsoX - 1, torsoY + torsoHeight/2, torsoZ - torsoDepth/2 - 1, 2, 2, 3, palette.accent);
      builder.addVoxel(torsoX, torsoY + torsoHeight/2, torsoZ - torsoDepth/2 - 2, '#FF0000');
      break;
    case 'saw':
      // Circular saw
      builder.addBox(torsoX - 2, torsoY + torsoHeight/2, torsoZ - torsoDepth/2 - 1, 4, 2, 2, palette.secondary);
      // Saw blade
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const offsetX = Math.round(Math.cos(angle) * 2);
        const offsetZ = Math.round(Math.sin(angle) * 2);
        builder.addVoxel(torsoX + offsetX, torsoY + torsoHeight/2, torsoZ - torsoDepth/2 - 2 + offsetZ, palette.accent);
      }
      break;
    case 'plasma-torch':
      // Plasma torch
      builder.addBox(torsoX - 1, torsoY + torsoHeight/2, torsoZ - torsoDepth/2 - 1, 2, 2, 4, palette.accent);
      builder.addVoxel(torsoX, torsoY + torsoHeight/2, torsoZ - torsoDepth/2 - 2, '#00FFFF');
      break;
    case 'welder':
      // Welder
      builder.addBox(torsoX - 1, torsoY + torsoHeight/2, torsoZ - torsoDepth/2 - 1, 2, 1, 3, palette.secondary);
      builder.addVoxel(torsoX, torsoY + torsoHeight/2, torsoZ - torsoDepth/2 - 2, '#FFFF00');
      break;
  }
}

export function generateHipTool(builder: VoxelBuilder, leftLegX: number, rightLegX: number, legHeight: number, palette: Palette) {
  // Utility tools mounted on hips (grippers, small drills, storage compartments)
  const toolType = randomChoice(['gripper', 'small-drill', 'storage', 'tool-pod']);
  const legWidth = 2;
  
  switch (toolType) {
    case 'gripper':
      // Hip-mounted grippers
      builder.addBox(leftLegX + legWidth/2, legHeight - 2, 1, 2, 2, 2, palette.accent);
      builder.addBox(rightLegX + legWidth/2, legHeight - 2, 1, 2, 2, 2, palette.accent);
      // Gripper jaws
      builder.addBox(leftLegX + legWidth/2 + 1, legHeight - 2, 2, 1, 1, 2, palette.detail);
      builder.addBox(rightLegX + legWidth/2 + 1, legHeight - 2, 2, 1, 1, 2, palette.detail);
      break;
    case 'small-drill':
      // Small drills
      builder.addBox(leftLegX + legWidth/2, legHeight - 2, 1, 1, 2, 3, palette.accent);
      builder.addBox(rightLegX + legWidth/2, legHeight - 2, 1, 1, 2, 3, palette.accent);
      builder.addVoxel(leftLegX + legWidth/2, legHeight - 1, 3, palette.detail);
      builder.addVoxel(rightLegX + legWidth/2, legHeight - 1, 3, palette.detail);
      break;
    case 'storage':
      // Storage compartments
      builder.addBox(leftLegX + legWidth/2, legHeight - 3, 1, 2, 3, 2, palette.secondary);
      builder.addBox(rightLegX + legWidth/2, legHeight - 3, 1, 2, 3, 2, palette.secondary);
      break;
    case 'tool-pod':
      // Tool pods
      builder.addBox(leftLegX + legWidth/2, legHeight - 2, 1, 2, 2, 2, palette.detail);
      builder.addBox(rightLegX + legWidth/2, legHeight - 2, 1, 2, 2, 2, palette.detail);
      // Tools inside
      builder.addVoxel(leftLegX + legWidth/2 + 1, legHeight - 1, 1, palette.accent);
      builder.addVoxel(rightLegX + legWidth/2 + 1, legHeight - 1, 1, palette.accent);
      break;
  }
}

// ========== ANIMAL COMPONENTS ==========

export function generateQuadrupedBody(builder: VoxelBuilder, x: number, y: number, z: number, length: number, width: number, height: number, palette: Palette) {
  builder.addBox(x - width/2, y, z - length/2, width, height, length, palette.primary);
}

export function generateBipedBody(builder: VoxelBuilder, x: number, y: number, z: number, width: number, height: number, depth: number, palette: Palette) {
  builder.addBox(x - width/2, y, z - depth/2, width, height, depth, palette.primary);
}

export function generateAquaticBody(builder: VoxelBuilder, x: number, y: number, z: number, length: number, width: number, height: number, palette: Palette) {
  // Streamlined body
  builder.addTaperedBox(x - width/2, y, z - length/2, width, height, length, width * 0.6, length * 0.8, palette.primary);
}

export function generateFlyingBody(builder: VoxelBuilder, x: number, y: number, z: number, width: number, height: number, depth: number, palette: Palette) {
  // Lightweight body
  builder.addBox(x - width/2, y, z - depth/2, width, height, depth, palette.primary);
}

export function generateLongNeck(builder: VoxelBuilder, x: number, y: number, z: number, length: number, palette: Palette) {
  const neckWidth = 2;
  for (let i = 0; i < length; i++) {
    builder.addBox(x - neckWidth/2, y + i, z - neckWidth/2, neckWidth, 1, neckWidth, palette.primary);
  }
}

export function generateTrunk(builder: VoxelBuilder, x: number, y: number, z: number, length: number, palette: Palette) {
  const trunkWidth = 2;
  // Trunk base
  builder.addBox(x - trunkWidth/2, y, z, trunkWidth, trunkWidth, 3, palette.primary);
  // Trunk extension (curved)
  for (let i = 0; i < length; i++) {
    const offsetX = Math.floor(Math.sin(i * 0.3) * 1);
    builder.addBox(x - trunkWidth/2 + offsetX, y, z + 3 + i, trunkWidth, trunkWidth, 1, palette.primary);
  }
  // Trunk tip
  builder.addBox(x - 1, y, z + 3 + length, 2, 1, 1, palette.detail);
}

export function generateTentacles(builder: VoxelBuilder, count: number, centerX: number, centerY: number, centerZ: number, length: number, palette: Palette) {
  for (let t = 0; t < count; t++) {
    const angle = (t / count) * Math.PI * 2;
    const startX = centerX + Math.round(Math.cos(angle) * 2);
    const startZ = centerZ + Math.round(Math.sin(angle) * 2);
    
    // Tentacle segments
    for (let i = 0; i < length; i++) {
      const segmentWidth = Math.max(1, 2 - Math.floor(i / 3));
      const curveX = Math.round(Math.sin(i * 0.2) * 1);
      const curveZ = Math.round(Math.cos(i * 0.2) * 1);
      builder.addBox(startX + curveX - segmentWidth/2, centerY, startZ + curveZ + i - segmentWidth/2, segmentWidth, segmentWidth, segmentWidth, palette.secondary);
    }
  }
}

export function generateAnimalTail(builder: VoxelBuilder, type: string, x: number, y: number, z: number, length: number, palette: Palette) {
  switch (type) {
    case 'long':
      // Long thin tail
      for (let i = 0; i < length; i++) {
        builder.addBox(x - 1, y, z - i, 2, 1, 1, palette.secondary);
      }
      break;
    case 'bushy':
      // Bushy tail
      for (let i = 0; i < length; i++) {
        const width = Math.min(3, 1 + Math.floor(i / 2));
        builder.addBox(x - width/2, y, z - i, width, width, 1, palette.secondary);
      }
      break;
    case 'fin':
      // Fin tail
      builder.addBox(x - 2, y, z, 4, 3, length, palette.secondary);
      break;
    case 'segmented':
      // Segmented tail
      for (let i = 0; i < length; i++) {
        builder.addBox(x - 1, y, z - i * 2, 2, 2, 2, palette.secondary);
      }
      break;
    default:
      builder.addBox(x - 1, y, z, 2, 1, length, palette.secondary);
  }
}

export function generateAnimalHead(builder: VoxelBuilder, type: string, x: number, y: number, z: number, palette: Palette) {
  const headSize = randomRange(3, 5);
  
  switch (type) {
    case 'snout':
      // Long snout
      builder.addBox(x - headSize/2, y, z, headSize, headSize, headSize + 3, palette.primary);
      // Nose
      builder.addVoxel(x, y, z + headSize + 3, palette.dark);
      break;
    case 'beak':
      // Bird beak
      builder.addBox(x - headSize/2, y, z, headSize, headSize, headSize, palette.primary);
      builder.addBox(x - 1, y, z + headSize, 2, 1, 3, palette.accent);
      break;
    case 'horns':
      // Horned head
      builder.addBox(x - headSize/2, y, z, headSize, headSize, headSize, palette.primary);
      // Horns
      for (let i = 0; i < 3; i++) {
        builder.addVoxel(x - 2, y + headSize + i, z, palette.detail);
        builder.addVoxel(x + 1, y + headSize + i, z, palette.detail);
      }
      break;
    case 'antlers':
      // Antlers
      builder.addBox(x - headSize/2, y, z, headSize, headSize, headSize, palette.primary);
      // Antler branches
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI;
        const offsetX = Math.round(Math.cos(angle) * 2);
        const offsetZ = Math.round(Math.sin(angle) * 2);
        builder.addVoxel(x + offsetX, y + headSize + 1, z + offsetZ, palette.detail);
        builder.addVoxel(x + offsetX * 2, y + headSize + 2, z + offsetZ * 2, palette.detail);
      }
      break;
    case 'multiple-eyes':
      // Multiple eyes
      builder.addBox(x - headSize/2, y, z, headSize, headSize, headSize, palette.primary);
      // Eyes
      for (let i = 0; i < 4; i++) {
        const eyeX = x - 1 + (i % 2) * 2;
        const eyeY = y + 1 + Math.floor(i / 2) * 2;
        builder.addVoxel(eyeX, eyeY, z + headSize, '#FFFFFF');
        builder.addVoxel(eyeX, eyeY, z + headSize + 1, '#000000');
      }
      break;
    default:
      builder.addBox(x - headSize/2, y, z, headSize, headSize, headSize, palette.primary);
  }
  
  // Common: add eyes if not already added
  if (type !== 'multiple-eyes') {
    builder.addVoxel(x - 1, y + 2, z + headSize, '#FFFFFF');
    builder.addVoxel(x + 1, y + 2, z + headSize, '#FFFFFF');
    builder.addVoxel(x - 1, y + 2, z + headSize + 1, '#000000');
    builder.addVoxel(x + 1, y + 2, z + headSize + 1, '#000000');
  }
}

export function generateWings(builder: VoxelBuilder, side: 'left' | 'right', x: number, y: number, z: number, span: number, palette: Palette) {
  const wingWidth = randomRange(3, 6);
  const wingHeight = randomRange(2, 4);
  
  if (side === 'left') {
    builder.addBox(x - span, y, z, span, wingHeight, wingWidth, palette.secondary);
  } else {
    builder.addBox(x, y, z, span, wingHeight, wingWidth, palette.secondary);
  }
  
  // Wing details
  for (let i = 0; i < span; i += 2) {
    builder.addVoxel(side === 'left' ? x - i : x + i, y + wingHeight, z + wingWidth/2, palette.detail);
  }
}

export function generateFins(builder: VoxelBuilder, x: number, y: number, z: number, count: number, palette: Palette) {
  for (let i = 0; i < count; i++) {
    const finX = x - 2 + i * 2;
    builder.addBox(finX, y, z, 1, 3, 2, palette.secondary);
  }
}

// ========== SPACESHIP DECORATIONS ==========

export function generateCoatOfArms(builder: VoxelBuilder, x: number, y: number, z: number, size: number, palette: Palette, direction: 'x' | 'y' | 'z' = 'z') {
  // Create flat coat of arms as surface patterns - only recolor existing voxels (dyes)
  // direction: which surface to place on ('x' for sides, 'y' for top, 'z' for front/back)
  // Pattern only extends in the plane of the surface, not perpendicular to it
  
  const symbolType = randomChoice(['shield', 'shield', 'circle', 'diamond', 'star']); // Favor shield
  
  // Helper to recolor existing voxel on surface (only if it exists)
  const recolorVoxelSurface = (vx: number, vy: number, vz: number, color: string) => {
    // Only recolor if voxel exists at this position
    builder.recolorVoxel(vx, vy, vz, color);
  };
  
  // Adjust coordinates based on direction - pattern should only extend in the surface plane
  let patternX = x, patternY = y, patternZ = z;
  if (direction === 'x') {
    // Side surface: pattern extends in Y and Z, X stays constant
    patternX = x; // Keep X constant (the side surface)
  } else if (direction === 'y') {
    // Top surface: pattern extends in X and Z, Y stays constant
    patternY = y; // Keep Y constant (the top surface)
  } else {
    // Front/back surface: pattern extends in X and Y, Z stays constant
    patternZ = z; // Keep Z constant (the front/back surface)
  }
  
  switch (symbolType) {
    case 'shield':
      // Shield shape (upside-down triangle with curved top) - recolor existing voxels
      // Pattern extends in Y and Z for side surfaces, X and Z for top surfaces
      if (direction === 'x') {
        // Side surface: extend in Y and Z only
        // Top curve
        for (let i = -size; i <= size; i++) {
          const curveY = Math.floor(Math.sqrt(size * size - i * i) * 0.5);
          recolorVoxelSurface(patternX, patternY + curveY, patternZ + i, palette.accent);
        }
        // Sides
        for (let i = 0; i < size; i++) {
          recolorVoxelSurface(patternX, patternY - i, patternZ - size + i, palette.accent);
          recolorVoxelSurface(patternX, patternY - i, patternZ + size - i, palette.accent);
        }
        // Bottom point
        recolorVoxelSurface(patternX, patternY - size, patternZ, palette.accent);
        // Inner pattern
        if (randomBoolean(0.5)) {
          for (let i = -Math.floor(size/2); i <= Math.floor(size/2); i++) {
            recolorVoxelSurface(patternX, patternY, patternZ + i, palette.detail);
            recolorVoxelSurface(patternX, patternY + i, patternZ, palette.detail);
          }
        } else {
          for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const offsetZ = Math.round(Math.cos(angle) * size/2);
            const offsetY = Math.round(Math.sin(angle) * size/2);
            recolorVoxelSurface(patternX, patternY + offsetY, patternZ + offsetZ, palette.detail);
          }
          recolorVoxelSurface(patternX, patternY, patternZ, palette.detail);
        }
      } else if (direction === 'y') {
        // Top surface: extend in X and Z only
        // Use high-contrast colors to ensure visibility
        const accentColor = palette.accent;
        const detailColor = palette.detail;
        // Top curve
        for (let i = -size; i <= size; i++) {
          const curveZ = Math.floor(Math.sqrt(size * size - i * i) * 0.5);
          recolorVoxelSurface(patternX + i, patternY, patternZ + curveZ, accentColor);
        }
        // Sides
        for (let i = 0; i < size; i++) {
          recolorVoxelSurface(patternX - size + i, patternY, patternZ - i, accentColor);
          recolorVoxelSurface(patternX + size - i, patternY, patternZ - i, accentColor);
        }
        // Bottom point
        recolorVoxelSurface(patternX, patternY, patternZ - size, accentColor);
        // Inner pattern
        if (randomBoolean(0.5)) {
          for (let i = -Math.floor(size/2); i <= Math.floor(size/2); i++) {
            recolorVoxelSurface(patternX + i, patternY, patternZ, detailColor);
            recolorVoxelSurface(patternX, patternY, patternZ + i, detailColor);
          }
        } else {
          for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const offsetX = Math.round(Math.cos(angle) * size/2);
            const offsetZ = Math.round(Math.sin(angle) * size/2);
            recolorVoxelSurface(patternX + offsetX, patternY, patternZ + offsetZ, detailColor);
          }
          recolorVoxelSurface(patternX, patternY, patternZ, detailColor);
        }
      } else {
        // Front/back surface: extend in X and Y only
        // Top curve
        for (let i = -size; i <= size; i++) {
          const curveY = Math.floor(Math.sqrt(size * size - i * i) * 0.5);
          recolorVoxelSurface(patternX + i, patternY + curveY, patternZ, palette.accent);
        }
        // Sides
        for (let i = 0; i < size; i++) {
          recolorVoxelSurface(patternX - size + i, patternY - i, patternZ, palette.accent);
          recolorVoxelSurface(patternX + size - i, patternY - i, patternZ, palette.accent);
        }
        // Bottom point
        recolorVoxelSurface(patternX, patternY - size, patternZ, palette.accent);
        // Inner pattern
        if (randomBoolean(0.5)) {
          for (let i = -Math.floor(size/2); i <= Math.floor(size/2); i++) {
            recolorVoxelSurface(patternX + i, patternY, patternZ, palette.detail);
            recolorVoxelSurface(patternX, patternY + i, patternZ, palette.detail);
          }
        } else {
          for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const offsetX = Math.round(Math.cos(angle) * size/2);
            const offsetY = Math.round(Math.sin(angle) * size/2);
            recolorVoxelSurface(patternX + offsetX, patternY + offsetY, patternZ, palette.detail);
          }
          recolorVoxelSurface(patternX, patternY, patternZ, palette.detail);
        }
      }
      break;
      
    case 'circle':
      // Circular emblem - recolor existing voxels
      const radius = size;
      if (direction === 'x') {
        // Side surface: circle in Y-Z plane
        for (let i = -radius; i <= radius; i++) {
          for (let j = -radius; j <= radius; j++) {
            if (i * i + j * j <= radius * radius && i * i + j * j >= (radius - 1) * (radius - 1)) {
              recolorVoxelSurface(patternX, patternY + i, patternZ + j, palette.accent);
            }
          }
        }
        // Inner symbol
        if (randomBoolean(0.5)) {
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const offsetY = Math.round(Math.cos(angle) * size/2);
            const offsetZ = Math.round(Math.sin(angle) * size/2);
            recolorVoxelSurface(patternX, patternY + offsetY, patternZ + offsetZ, palette.detail);
          }
        } else {
          recolorVoxelSurface(patternX, patternY, patternZ, palette.detail);
          recolorVoxelSurface(patternX, patternY - 1, patternZ, palette.detail);
          recolorVoxelSurface(patternX, patternY + 1, patternZ, palette.detail);
          recolorVoxelSurface(patternX, patternY, patternZ - 1, palette.detail);
          recolorVoxelSurface(patternX, patternY, patternZ + 1, palette.detail);
        }
      } else if (direction === 'y') {
        // Top surface: circle in X-Z plane
        const accentColor = palette.accent;
        const detailColor = palette.detail;
        for (let i = -radius; i <= radius; i++) {
          for (let j = -radius; j <= radius; j++) {
            if (i * i + j * j <= radius * radius && i * i + j * j >= (radius - 1) * (radius - 1)) {
              recolorVoxelSurface(patternX + i, patternY, patternZ + j, accentColor);
            }
          }
        }
        // Inner symbol
        if (randomBoolean(0.5)) {
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const offsetX = Math.round(Math.cos(angle) * size/2);
            const offsetZ = Math.round(Math.sin(angle) * size/2);
            recolorVoxelSurface(patternX + offsetX, patternY, patternZ + offsetZ, detailColor);
          }
        } else {
          recolorVoxelSurface(patternX, patternY, patternZ, detailColor);
          recolorVoxelSurface(patternX - 1, patternY, patternZ, detailColor);
          recolorVoxelSurface(patternX + 1, patternY, patternZ, detailColor);
          recolorVoxelSurface(patternX, patternY, patternZ - 1, detailColor);
          recolorVoxelSurface(patternX, patternY, patternZ + 1, detailColor);
        }
      } else {
        // Front/back surface: circle in X-Y plane
        for (let i = -radius; i <= radius; i++) {
          for (let j = -radius; j <= radius; j++) {
            if (i * i + j * j <= radius * radius && i * i + j * j >= (radius - 1) * (radius - 1)) {
              recolorVoxelSurface(patternX + i, patternY + j, patternZ, palette.accent);
            }
          }
        }
        // Inner symbol
        if (randomBoolean(0.5)) {
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const offsetX = Math.round(Math.cos(angle) * size/2);
            const offsetY = Math.round(Math.sin(angle) * size/2);
            recolorVoxelSurface(patternX + offsetX, patternY + offsetY, patternZ, palette.detail);
          }
        } else {
          recolorVoxelSurface(patternX, patternY, patternZ, palette.detail);
          recolorVoxelSurface(patternX - 1, patternY, patternZ, palette.detail);
          recolorVoxelSurface(patternX + 1, patternY, patternZ, palette.detail);
          recolorVoxelSurface(patternX, patternY - 1, patternZ, palette.detail);
          recolorVoxelSurface(patternX, patternY + 1, patternZ, palette.detail);
        }
      }
      break;
      
    case 'diamond':
      // Diamond shape - recolor existing voxels
      if (direction === 'x') {
        // Side surface: diamond in Y-Z plane
        for (let i = 0; i < size; i++) {
          for (let j = 0; j <= i; j++) {
            recolorVoxelSurface(patternX, patternY + j, patternZ + i - j, palette.accent);
            recolorVoxelSurface(patternX, patternY - j, patternZ + i - j, palette.accent);
            recolorVoxelSurface(patternX, patternY + j, patternZ - i + j, palette.accent);
            recolorVoxelSurface(patternX, patternY - j, patternZ - i + j, palette.accent);
          }
        }
        recolorVoxelSurface(patternX, patternY, patternZ, palette.detail);
      } else if (direction === 'y') {
        // Top surface: diamond in X-Z plane
        const accentColor = palette.accent;
        const detailColor = palette.detail;
        for (let i = 0; i < size; i++) {
          for (let j = 0; j <= i; j++) {
            recolorVoxelSurface(patternX + j, patternY, patternZ + i - j, accentColor);
            recolorVoxelSurface(patternX - j, patternY, patternZ + i - j, accentColor);
            recolorVoxelSurface(patternX + j, patternY, patternZ - i + j, accentColor);
            recolorVoxelSurface(patternX - j, patternY, patternZ - i + j, accentColor);
          }
        }
        recolorVoxelSurface(patternX, patternY, patternZ, detailColor);
      } else {
        // Front/back surface: diamond in X-Y plane
        for (let i = 0; i < size; i++) {
          for (let j = 0; j <= i; j++) {
            recolorVoxelSurface(patternX + j, patternY + i - j, patternZ, palette.accent);
            recolorVoxelSurface(patternX - j, patternY + i - j, patternZ, palette.accent);
            recolorVoxelSurface(patternX + j, patternY - i + j, patternZ, palette.accent);
            recolorVoxelSurface(patternX - j, patternY - i + j, patternZ, palette.accent);
          }
        }
        recolorVoxelSurface(patternX, patternY, patternZ, palette.detail);
      }
      break;
      
    case 'star':
      // Star shape - recolor existing voxels
      const points = 5;
      if (direction === 'x') {
        // Side surface: star in Y-Z plane
        for (let i = 0; i < points; i++) {
          const angle1 = (i / points) * Math.PI * 2;
          const angle2 = ((i + 0.5) / points) * Math.PI * 2;
          const outerY = Math.round(Math.cos(angle1) * size);
          const outerZ = Math.round(Math.sin(angle1) * size);
          const innerY = Math.round(Math.cos(angle2) * size/2);
          const innerZ = Math.round(Math.sin(angle2) * size/2);
          const steps = 5;
          for (let s = 0; s <= steps; s++) {
            const t = s / steps;
            const py = Math.round(outerY * (1 - t) + innerY * t);
            const pz = Math.round(outerZ * (1 - t) + innerZ * t);
            recolorVoxelSurface(patternX, patternY + py, patternZ + pz, palette.accent);
          }
        }
        recolorVoxelSurface(patternX, patternY, patternZ, palette.detail);
      } else if (direction === 'y') {
        // Top surface: star in X-Z plane
        const accentColor = palette.accent;
        const detailColor = palette.detail;
        for (let i = 0; i < points; i++) {
          const angle1 = (i / points) * Math.PI * 2;
          const angle2 = ((i + 0.5) / points) * Math.PI * 2;
          const outerX = Math.round(Math.cos(angle1) * size);
          const outerZ = Math.round(Math.sin(angle1) * size);
          const innerX = Math.round(Math.cos(angle2) * size/2);
          const innerZ = Math.round(Math.sin(angle2) * size/2);
          const steps = 5;
          for (let s = 0; s <= steps; s++) {
            const t = s / steps;
            const px = Math.round(outerX * (1 - t) + innerX * t);
            const pz = Math.round(outerZ * (1 - t) + innerZ * t);
            recolorVoxelSurface(patternX + px, patternY, patternZ + pz, accentColor);
          }
        }
        recolorVoxelSurface(patternX, patternY, patternZ, detailColor);
      } else {
        // Front/back surface: star in X-Y plane
        for (let i = 0; i < points; i++) {
          const angle1 = (i / points) * Math.PI * 2;
          const angle2 = ((i + 0.5) / points) * Math.PI * 2;
          const outerX = Math.round(Math.cos(angle1) * size);
          const outerY = Math.round(Math.sin(angle1) * size);
          const innerX = Math.round(Math.cos(angle2) * size/2);
          const innerY = Math.round(Math.sin(angle2) * size/2);
          const steps = 5;
          for (let s = 0; s <= steps; s++) {
            const t = s / steps;
            const px = Math.round(outerX * (1 - t) + innerX * t);
            const py = Math.round(outerY * (1 - t) + innerY * t);
            recolorVoxelSurface(patternX + px, patternY + py, patternZ, palette.accent);
          }
        }
        recolorVoxelSurface(patternX, patternY, patternZ, palette.detail);
      }
      break;
  }
}

export function generateSymbol(builder: VoxelBuilder, x: number, y: number, z: number, type: string, palette: Palette) {
  // Symbols are also surface patterns - only recolor existing voxels
  switch (type) {
    case 'cross':
      // Simple cross
      for (let i = -2; i <= 2; i++) {
        builder.recolorVoxel(x + i, y, z, palette.accent);
        builder.recolorVoxel(x, y + i, z, palette.accent);
      }
      break;
    case 'arrow':
      // Arrow pointing forward
      builder.recolorVoxel(x, y, z, palette.accent);
      builder.recolorVoxel(x, y, z + 1, palette.accent);
      builder.recolorVoxel(x - 1, y, z + 1, palette.accent);
      builder.recolorVoxel(x + 1, y, z + 1, palette.accent);
      builder.recolorVoxel(x, y, z + 2, palette.accent);
      break;
    case 'triangle':
      // Triangle
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j <= i; j++) {
          builder.recolorVoxel(x + j - i/2, y + i, z, palette.accent);
        }
      }
      break;
    case 'square':
      // Square - recolor existing voxels in a 3x3 area
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          builder.recolorVoxel(x + i, y + j, z, palette.accent);
        }
      }
      builder.recolorVoxel(x, y, z, palette.detail);
      break;
    case 'circle':
      // Small circle
      const radius = 2;
      for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
          if (Math.abs(i * i + j * j - radius * radius) < 2) {
            builder.recolorVoxel(x + i, y + j, z, palette.accent);
          }
        }
      }
      break;
    case 'lightning':
      // Lightning bolt
      builder.recolorVoxel(x, y + 2, z, palette.accent);
      builder.recolorVoxel(x - 1, y + 1, z, palette.accent);
      builder.recolorVoxel(x, y, z, palette.accent);
      builder.recolorVoxel(x + 1, y - 1, z, palette.accent);
      builder.recolorVoxel(x, y - 2, z, palette.accent);
      break;
  }
}

export function addCoatOfArmsToWing(builder: VoxelBuilder, wingX: number, wingY: number, wingZ: number, wingWidth: number, wingLength: number, palette: Palette, wingHeight: number = 1) {
  // Add coat of arms to wing surface (top) - ALWAYS decorate wings - recolor existing wing voxels
  // Always place on the top surface of the wing so it's visible from above
  // Center the decoration on the wing for better visibility
  const emblemX = wingX + Math.floor(wingWidth / 2);
  const emblemZ = wingZ + Math.floor(wingLength / 2);
  // Place on top surface: wingY + wingHeight - 1 (topmost voxel of the wing)
  // Use larger size (3-5) to ensure visibility, but ensure it fits on wing
  const maxSize = Math.min(Math.floor(wingWidth / 2), Math.floor(wingLength / 2), 5);
  const size = Math.max(3, randomRange(3, maxSize));
  generateCoatOfArms(builder, emblemX, wingY + wingHeight - 1, emblemZ, size, palette, 'y');
}

export function addShipDecorativeDetails(builder: VoxelBuilder, centerX: number, centerY: number, centerZ: number, width: number, length: number, height: number, palette: Palette) {
  // Add various decorative elements to ship hull
  
  // 1. Coat of arms on sides (ALWAYS - make it prominent) - recolor existing hull voxels
  // Place on side surface, centered on the surface
  const useLeftSide = randomBoolean(0.5);
  // For left side: place at x = -width/2 (the left surface), but center the pattern
  // For right side: place at x = width/2 - 1 (the right surface), but center the pattern
  const sideX = useLeftSide ? -width/2 : width/2 - 1;
  const emblemY = centerY + Math.floor(height / 2);
  const emblemZ = centerZ + randomRange(-length/4, length/4);
  // Use smaller size to ensure pattern fits on hull surface
  generateCoatOfArms(builder, sideX, emblemY, emblemZ, randomRange(2, 3), palette, 'x');
  
  // Also add to opposite side sometimes (50% chance)
  if (randomBoolean(0.5)) {
    const oppositeX = useLeftSide ? width/2 - 1 : -width/2;
    const oppositeY = centerY + Math.floor(height / 2);
    const oppositeZ = centerZ + randomRange(-length/4, length/4);
    generateCoatOfArms(builder, oppositeX, oppositeY, oppositeZ, randomRange(2, 3), palette, 'x');
  }
  
  // Coat of arms on top surface (60% chance) - recolor existing top surface voxels
  if (randomBoolean(0.6)) {
    const topX = centerX + randomRange(-width/3, width/3);
    const topZ = centerZ + randomRange(-length/3, length/3);
    // Place on top surface: centerY + height - 1 (top surface of hull)
    generateCoatOfArms(builder, topX, centerY + height - 1, topZ, randomRange(2, 3), palette, 'y');
  }
  
  // 2. Symbols on top surface (60% chance) - recolor existing hull voxels
  if (randomBoolean(0.6)) {
    const symbolCount = randomRange(1, 3);
    for (let i = 0; i < symbolCount; i++) {
      const symbolX = centerX + randomRange(-width/2 + 1, width/2 - 1);
      const symbolZ = centerZ + randomRange(-length/2 + 2, length/2 - 2);
      const symbolType = randomChoice(['cross', 'arrow', 'triangle', 'square', 'circle', 'lightning']);
      // Place on top surface of hull - recolor existing voxels
      generateSymbol(builder, symbolX, centerY + height - 1, symbolZ, symbolType, palette);
    }
  }
  
  // 3. Decorative panels/stripes (80% chance) - recolor existing hull voxels
  if (randomBoolean(0.8)) {
    const stripeCount = randomRange(2, 4);
    for (let i = 0; i < stripeCount; i++) {
      const stripeZ = centerZ - length/2 + (i + 1) * (length / (stripeCount + 1));
      // Horizontal stripe on top surface - recolor existing voxels
      for (let x = centerX - width/2 + 1; x < centerX + width/2 - 1; x++) {
        builder.recolorVoxel(x, centerY + height - 1, stripeZ, palette.secondary);
      }
    }
  }
  
  // 4. Hull markings/numbers (40% chance) - recolor existing hull voxels
  if (randomBoolean(0.4)) {
    const markZ = centerZ + length/2 - 2;
    // Simple number pattern on top surface - recolor existing voxels
    const number = randomRange(1, 9);
    // Represent number with dots
    for (let i = 0; i < number && i < 5; i++) {
      builder.recolorVoxel(centerX - 2 + i, centerY + height - 1, markZ, palette.detail);
    }
  }
  
  // 5. Warning stripes (30% chance) - recolor existing hull voxels
  if (randomBoolean(0.3)) {
    const stripeZ = centerZ - length/2 + 1;
    // Diagonal warning stripes on top surface - recolor existing voxels
    for (let i = 0; i < 3; i++) {
      builder.recolorVoxel(centerX - width/2 + i, centerY + height - 1, stripeZ + i, '#FF0000');
      builder.recolorVoxel(centerX + width/2 - 1 - i, centerY + height - 1, stripeZ + i, '#FF0000');
    }
  }
  
  // 6. Decorative vents/grilles (50% chance) - recolor existing hull voxels
  if (randomBoolean(0.5)) {
    const ventCount = randomRange(2, 4);
    for (let i = 0; i < ventCount; i++) {
      const ventZ = centerZ - length/2 + 2 + i * 3;
      // Grid pattern on top surface - recolor existing voxels
      for (let j = 0; j < 3; j++) {
        builder.recolorVoxel(centerX - 1 + j, centerY + height - 1, ventZ, palette.detail);
      }
    }
  }
}
