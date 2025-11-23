import type { VoxelObjectData } from '../types';
import { getRandomPalette, type Palette } from '../utils/palettes';
import { VoxelBuilder, randomRange, randomChoice, randomBoolean, setSeed, generateSeed } from '../utils/voxelBuilder';

export function generateMonster(seed?: number): VoxelObjectData {
  // Set seed if provided, otherwise generate new one
  const actualSeed = seed !== undefined ? seed : generateSeed();
  setSeed(actualSeed);
  
  const palette = getRandomPalette('monster');
  const builder = new VoxelBuilder(palette);

  const bodyType = randomChoice(['humanoid', 'quadruped', 'serpentine', 'amorphous']);

  switch (bodyType) {
    case 'humanoid':
      generateHumanoidMonster(builder, palette);
      break;
    case 'quadruped':
      generateQuadrupedMonster(builder, palette);
      break;
    case 'serpentine':
      generateSerpentineMonster(builder, palette);
      break;
    case 'amorphous':
      generateAmorphousMonster(builder, palette);
      break;
  }

  return {
    id: crypto.randomUUID(),
    name: `Monster ${randomRange(1, 999)}`,
    category: 'monster',
    createdAt: Date.now(),
    voxels: builder.voxels,
    seed: actualSeed
  };
}

function generateHumanoidMonster(builder: VoxelBuilder, palette: Palette) {
  const size = randomRange(4, 10);
  const centerX = 0;
  const centerY = size;
  const centerZ = 0;

  // Main body
  builder.addBox(centerX - size/2, centerY, centerZ - size/2, size, size, size, palette.primary);

  // Head
  const headSize = randomRange(3, 5);
  builder.addBox(centerX - headSize/2, centerY + size, centerZ - headSize/2, headSize, headSize, headSize, palette.primary);

  // Arms
  const armLength = randomRange(4, 8);
  const armWidth = 2;
  builder.addBox(centerX - size/2 - armWidth, centerY + size/2, centerZ - armWidth/2, armWidth, armLength, armWidth, palette.secondary);
  builder.addBox(centerX + size/2, centerY + size/2, centerZ - armWidth/2, armWidth, armLength, armWidth, palette.secondary);

  // Claws on hands
  for (let i = 0; i < 3; i++) {
    builder.addVoxel(centerX - size/2 - armWidth - 1, centerY + size/2 + armLength, centerZ - 1 + i, palette.accent);
    builder.addVoxel(centerX + size/2 + armWidth, centerY + size/2 + armLength, centerZ - 1 + i, palette.accent);
  }

  // Legs
  const legLength = randomRange(4, 7);
  builder.addBox(centerX - size/2 + 1, centerY - legLength, centerZ - 1, 2, legLength, 2, palette.secondary);
  builder.addBox(centerX + size/2 - 3, centerY - legLength, centerZ - 1, 2, legLength, 2, palette.secondary);

  // Multiple eyes
  const eyeCount = randomRange(2, 6);
  for (let i = 0; i < eyeCount; i++) {
    const eyeX = centerX - headSize/2 + 1 + (i % 3) * 2;
    const eyeY = centerY + size + 2 + Math.floor(i / 3) * 2;
    builder.addVoxel(eyeX, eyeY, centerZ + headSize/2, '#FFFFFF');
    builder.addVoxel(eyeX, eyeY, centerZ + headSize/2 + 1, '#FF0000');
  }

  // Spikes on body
  if (randomBoolean(0.7)) {
    for (let i = 0; i < randomRange(5, 12); i++) {
      const spikeX = centerX - size/2 + randomRange(0, size);
      const spikeY = centerY + randomRange(0, size);
      const spikeZ = centerZ - size/2 + randomRange(0, size);
      builder.addVoxel(spikeX, spikeY + 1, spikeZ, palette.accent);
    }
  }

  // Glowing energy core
  if (randomBoolean(0.6)) {
    builder.addVoxel(centerX, centerY + size/2, centerZ, '#00FFFF');
    builder.addVoxel(centerX, centerY + size/2 + 1, centerZ, '#00FFFF');
  }

  // Armor plates
  if (randomBoolean(0.5)) {
    builder.addBox(centerX - size/2 + 1, centerY + 1, centerZ - size/2 - 1, size - 2, size - 2, 1, palette.detail);
  }
}

function generateQuadrupedMonster(builder: VoxelBuilder, palette: Palette) {
  const bodyLen = randomRange(8, 16);
  const bodyWidth = randomRange(4, 8);
  const bodyHeight = randomRange(4, 8);
  const legHeight = randomRange(3, 6);
  
  const bodyY = legHeight;
  builder.addBox(-bodyWidth/2, bodyY, -bodyLen/2, bodyWidth, bodyHeight, bodyLen, palette.primary);

  // Legs
  const legW = randomRange(2, 3);
  builder.addBox(-bodyWidth/2, 0, bodyLen/2 - 3, legW, legHeight, legW, palette.secondary);
  builder.addBox(bodyWidth/2 - legW, 0, bodyLen/2 - 3, legW, legHeight, legW, palette.secondary);
  builder.addBox(-bodyWidth/2, 0, -bodyLen/2 + 2, legW, legHeight, legW, palette.secondary);
  builder.addBox(bodyWidth/2 - legW, 0, -bodyLen/2 + 2, legW, legHeight, legW, palette.secondary);

  // Claws on feet
  for (let i = 0; i < 4; i++) {
    const footX = i % 2 === 0 ? -bodyWidth/2 : bodyWidth/2 - legW;
    const footZ = i < 2 ? bodyLen/2 - 3 : -bodyLen/2 + 2;
    for (let j = 0; j < 3; j++) {
      builder.addVoxel(footX + j, 0, footZ + legW, palette.accent);
    }
  }

  // Head
  const headSize = randomRange(4, 6);
  builder.addBox(-headSize/2, bodyY + bodyHeight - 1, bodyLen/2 + 1, headSize, headSize, headSize, palette.primary);

  // Fangs
  builder.addVoxel(-1, bodyY + bodyHeight, bodyLen/2 + headSize + 1, palette.detail);
  builder.addVoxel(1, bodyY + bodyHeight, bodyLen/2 + headSize + 1, palette.detail);

  // Multiple eyes
  const eyeCount = randomRange(2, 4);
  for (let i = 0; i < eyeCount; i++) {
    const eyeX = -headSize/2 + 1 + (i % 2) * (headSize - 2);
    const eyeY = bodyY + bodyHeight + 1 + Math.floor(i / 2) * 2;
    builder.addVoxel(eyeX, eyeY, bodyLen/2 + headSize, '#FFFFFF');
    builder.addVoxel(eyeX, eyeY, bodyLen/2 + headSize + 1, '#FF0000');
  }

  // Spikes along back
  for (let i = 0; i < bodyLen; i += 2) {
    builder.addVoxel(0, bodyY + bodyHeight, -bodyLen/2 + i, palette.accent);
    builder.addVoxel(0, bodyY + bodyHeight + 1, -bodyLen/2 + i, palette.accent);
  }

  // Scales/armor
  if (randomBoolean(0.6)) {
    for (let i = 0; i < randomRange(8, 15); i++) {
      const scaleX = -bodyWidth/2 + randomRange(0, bodyWidth);
      const scaleY = bodyY + randomRange(0, bodyHeight);
      const scaleZ = -bodyLen/2 + randomRange(0, bodyLen);
      builder.addVoxel(scaleX, scaleY, scaleZ, palette.detail);
    }
  }

  // Tail
  const tailLength = randomRange(4, 8);
  for (let i = 0; i < tailLength; i++) {
    builder.addBox(-1, bodyY + bodyHeight - 1, -bodyLen/2 - i, 2, 2, 2, palette.secondary);
  }
  // Tail spike
  builder.addVoxel(0, bodyY + bodyHeight, -bodyLen/2 - tailLength, palette.accent);
}

function generateSerpentineMonster(builder: VoxelBuilder, palette: Palette) {
  const segmentCount = randomRange(8, 16);
  const segmentSize = randomRange(3, 5);
  const centerX = 0;
  let currentY = segmentSize;
  let currentZ = 0;

  // Head
  const headSize = randomRange(4, 6);
  builder.addBox(centerX - headSize/2, currentY, currentZ, headSize, headSize, headSize, palette.primary);

  // Multiple eyes
  const eyeCount = randomRange(3, 6);
  for (let i = 0; i < eyeCount; i++) {
    const eyeX = centerX - headSize/2 + 1 + (i % 3) * 2;
    const eyeY = currentY + 2 + Math.floor(i / 3) * 2;
    builder.addVoxel(eyeX, eyeY, currentZ + headSize, '#FFFFFF');
    builder.addVoxel(eyeX, eyeY, currentZ + headSize + 1, '#FF0000');
  }

  // Fangs
  builder.addVoxel(centerX - 1, currentY, currentZ + headSize + 1, palette.detail);
  builder.addVoxel(centerX + 1, currentY, currentZ + headSize + 1, palette.detail);

  // Body segments
  for (let i = 0; i < segmentCount; i++) {
    const segmentZ = currentZ - (i + 1) * segmentSize;
    const segmentY = currentY + Math.floor(Math.sin(i * 0.3) * 2); // Slight wave
    
    builder.addBox(centerX - segmentSize/2, segmentY, segmentZ - segmentSize/2, segmentSize, segmentSize, segmentSize, palette.primary);
    
    // Scales on segments
    if (randomBoolean(0.4)) {
      builder.addVoxel(centerX - segmentSize/2 + 1, segmentY + segmentSize, segmentZ, palette.detail);
      builder.addVoxel(centerX + segmentSize/2 - 1, segmentY + segmentSize, segmentZ, palette.detail);
    }
  }

  // Spikes along body
  if (randomBoolean(0.7)) {
    for (let i = 0; i < segmentCount; i += 2) {
      const spikeZ = currentZ - (i + 1) * segmentSize;
      const spikeY = currentY + segmentSize;
      builder.addVoxel(centerX, spikeY, spikeZ, palette.accent);
    }
  }

  // Glowing core segments
  if (randomBoolean(0.5)) {
    for (let i = 0; i < segmentCount; i += 3) {
      const coreZ = currentZ - (i + 1) * segmentSize;
      builder.addVoxel(centerX, currentY + segmentSize/2, coreZ, '#00FFFF');
    }
  }
}

function generateAmorphousMonster(builder: VoxelBuilder, palette: Palette) {
  const baseSize = randomRange(6, 12);
  const centerX = 0;
  const centerY = baseSize;
  const centerZ = 0;

  // Main blob body
  builder.addSphere(centerX, centerY, centerZ, baseSize, palette.primary);

  // Random mutations (asymmetric)
  const mutationCount = randomRange(5, 12);
  for (let i = 0; i < mutationCount; i++) {
    const w = randomRange(2, 5);
    const h = randomRange(2, 5);
    const d = randomRange(2, 5);
    
    const x = centerX + randomRange(-baseSize, baseSize);
    const y = centerY + randomRange(-baseSize, baseSize);
    const z = centerZ + randomRange(-baseSize, baseSize);
    
    const color = randomBoolean(0.5) ? palette.secondary : palette.accent;
    builder.addBox(x, y, z, w, h, d, color);
  }

  // Multiple eyes (random locations)
  const eyeCount = randomRange(3, 8);
  for (let i = 0; i < eyeCount; i++) {
    const eyeX = centerX + randomRange(-baseSize/2, baseSize/2);
    const eyeY = centerY + randomRange(-baseSize/2, baseSize/2);
    const eyeZ = centerZ + baseSize/2 + 1;
    builder.addVoxel(eyeX, eyeY, eyeZ, '#FFFFFF');
    builder.addVoxel(eyeX, eyeY, eyeZ + 1, '#FF0000');
  }

  // Tentacles
  if (randomBoolean(0.7)) {
    const tentacleCount = randomRange(4, 8);
    for (let t = 0; t < tentacleCount; t++) {
      const angle = (t / tentacleCount) * Math.PI * 2;
      const startX = centerX + Math.round(Math.cos(angle) * baseSize);
      const startZ = centerZ + Math.round(Math.sin(angle) * baseSize);
      const tentacleLength = randomRange(4, 10);
      
      for (let i = 0; i < tentacleLength; i++) {
        const segmentWidth = Math.max(1, 2 - Math.floor(i / 3));
        const curveX = Math.round(Math.sin(i * 0.2) * 1);
        const curveZ = Math.round(Math.cos(i * 0.2) * 1);
        builder.addBox(startX + curveX - segmentWidth/2, centerY, startZ + curveZ + i - segmentWidth/2, segmentWidth, segmentWidth, segmentWidth, palette.secondary);
      }
    }
  }

  // Glowing energy cores
  if (randomBoolean(0.6)) {
    const coreCount = randomRange(2, 4);
    for (let i = 0; i < coreCount; i++) {
      const coreX = centerX + randomRange(-baseSize/2, baseSize/2);
      const coreY = centerY + randomRange(-baseSize/2, baseSize/2);
      const coreZ = centerZ + randomRange(-baseSize/2, baseSize/2);
      builder.addVoxel(coreX, coreY, coreZ, '#00FFFF');
      builder.addVoxel(coreX, coreY + 1, coreZ, '#00FFFF');
    }
  }

  // Spikes
  if (randomBoolean(0.5)) {
    for (let i = 0; i < randomRange(8, 15); i++) {
      const angle = (i / 15) * Math.PI * 2;
      const spikeX = centerX + Math.round(Math.cos(angle) * baseSize);
      const spikeY = centerY + Math.round(Math.sin(angle) * baseSize);
      const spikeZ = centerZ + randomRange(-baseSize/2, baseSize/2);
      builder.addVoxel(spikeX, spikeY, spikeZ, palette.accent);
    }
  }
}
