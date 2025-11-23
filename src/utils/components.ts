import type { Palette } from './palettes';
import { VoxelBuilder, randomRange, randomBoolean } from './voxelBuilder';

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
