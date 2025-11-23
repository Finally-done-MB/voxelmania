import type { VoxelObjectData } from '../types';
import { getRandomPalette, type Palette } from '../utils/palettes';
import { VoxelBuilder, randomRange, randomChoice, randomBoolean } from '../utils/voxelBuilder';
import {
  generateQuadrupedBody,
  generateBipedBody,
  generateAquaticBody,
  generateLongNeck,
  generateTrunk,
  generateTentacles,
  generateAnimalTail,
  generateAnimalHead,
  generateWings,
  generateFins
} from '../utils/components';

export function generateAnimal(): VoxelObjectData {
  const palette = getRandomPalette('animal');
  const builder = new VoxelBuilder(palette);

  // 60% recognizable, 40% weird (with randomization)
  const weirdness = Math.random();
  const isRecognizable = weirdness < 0.6 || (weirdness < 0.8 && randomBoolean(0.3));

  if (isRecognizable) {
    // === RECOGNIZABLE ANIMALS (60%) ===
    const animalType = randomChoice([
      'quadruped', 'quadruped', 'quadruped', // 30% - dog, cat, sheep
      'long-necked', // 10% - giraffe
      'large-quadruped', // 10% - elephant, rhino
      'aquatic', // 5% - whale, dolphin
      'biped' // 5% - bird, penguin
    ]);

    switch (animalType) {
      case 'quadruped':
        generateQuadrupedAnimal(builder, palette);
        break;
      case 'long-necked':
        generateLongNeckedAnimal(builder, palette);
        break;
      case 'large-quadruped':
        generateLargeQuadrupedAnimal(builder, palette);
        break;
      case 'aquatic':
        generateAquaticAnimal(builder, palette);
        break;
      case 'biped':
        generateBipedAnimal(builder, palette);
        break;
    }
  } else {
    // === WEIRD/ORGANIC ANIMALS (40%) ===
    const weirdType = randomChoice([
      'multi-limbed',
      'tentacled',
      'hybrid',
      'asymmetric'
    ]);

    switch (weirdType) {
      case 'multi-limbed':
        generateMultiLimbedAnimal(builder, palette);
        break;
      case 'tentacled':
        generateTentacledAnimal(builder, palette);
        break;
      case 'hybrid':
        generateHybridAnimal(builder, palette);
        break;
      case 'asymmetric':
        generateAsymmetricAnimal(builder, palette);
        break;
    }
  }

  return {
    id: crypto.randomUUID(),
    name: `Critter ${Math.floor(Math.random() * 1000)}`,
    category: 'animal',
    createdAt: Date.now(),
    voxels: builder.voxels
  };
}

function generateQuadrupedAnimal(builder: VoxelBuilder, palette: Palette) {
  const bodyLen = randomRange(6, 12);
  const bodyWidth = randomRange(3, 6);
  const bodyHeight = randomRange(3, 6);
  const legHeight = randomRange(3, 7);
  
  const bodyY = legHeight;
  const bodyX = 0;
  const bodyZ = 0;

  generateQuadrupedBody(builder, bodyX, bodyY, bodyZ, bodyLen, bodyWidth, bodyHeight, palette);

  // Legs (4) with joints
  const legW = randomRange(1, 2);
  const frontLegZ = bodyLen / 2 - 2;
  const backLegZ = -bodyLen / 2 + 1;
  
  // Front Left
  builder.addBox(-bodyWidth/2, 0, frontLegZ, legW, legHeight, legW, palette.secondary);
  // Front Right
  builder.addBox(bodyWidth/2 - legW, 0, frontLegZ, legW, legHeight, legW, palette.secondary);
  // Back Left
  builder.addBox(-bodyWidth/2, 0, backLegZ, legW, legHeight, legW, palette.secondary);
  // Back Right
  builder.addBox(bodyWidth/2 - legW, 0, backLegZ, legW, legHeight, legW, palette.secondary);

  // Head
  const headType = randomChoice(['snout', 'snout', 'default', 'horns']);
  const headY = bodyY + bodyHeight - 1;
  const headZ = bodyLen / 2 + 2;
  generateAnimalHead(builder, headType, bodyX, headY, headZ, palette);

  // Neck
  builder.addBox(-1, bodyY + 1, bodyLen/2 - 1, 2, 2, 2, palette.primary);

  // Tail
  const tailType = randomChoice(['long', 'bushy', 'segmented']);
  generateAnimalTail(builder, tailType, bodyX, bodyY + bodyHeight - 1, -bodyLen/2, randomRange(3, 6), palette);

  // Ears
  if (randomBoolean(0.7)) {
    builder.addVoxel(-2, headY + 3, headZ, palette.detail);
    builder.addVoxel(2, headY + 3, headZ, palette.detail);
  }

  // Patterns
  if (randomBoolean(0.5)) {
    // Spots or stripes
    for (let i = 0; i < 5; i++) {
      const spotX = randomRange(-bodyWidth/2 + 1, bodyWidth/2 - 1);
      const spotZ = randomRange(-bodyLen/2 + 1, bodyLen/2 - 1);
      builder.addVoxel(spotX, bodyY + bodyHeight, spotZ, palette.accent);
    }
  }
}

function generateLongNeckedAnimal(builder: VoxelBuilder, palette: Palette) {
  const bodyLen = randomRange(8, 14);
  const bodyWidth = randomRange(4, 6);
  const bodyHeight = randomRange(4, 6);
  const legHeight = randomRange(5, 8);
  
  const bodyY = legHeight;
  generateQuadrupedBody(builder, 0, bodyY, 0, bodyLen, bodyWidth, bodyHeight, palette);

  // Tall legs
  const legW = 2;
  builder.addBox(-bodyWidth/2, 0, bodyLen/2 - 2, legW, legHeight, legW, palette.secondary);
  builder.addBox(bodyWidth/2 - legW, 0, bodyLen/2 - 2, legW, legHeight, legW, palette.secondary);
  builder.addBox(-bodyWidth/2, 0, -bodyLen/2 + 1, legW, legHeight, legW, palette.secondary);
  builder.addBox(bodyWidth/2 - legW, 0, -bodyLen/2 + 1, legW, legHeight, legW, palette.secondary);

  // Long neck
  const neckLength = randomRange(6, 10);
  generateLongNeck(builder, 0, bodyY + bodyHeight, bodyLen/2, neckLength, palette);

  // Small head
  generateAnimalHead(builder, 'default', 0, bodyY + bodyHeight + neckLength, bodyLen/2 + 2, palette);

  // Short tail
  generateAnimalTail(builder, 'long', 0, bodyY + bodyHeight - 1, -bodyLen/2, 2, palette);
}

function generateLargeQuadrupedAnimal(builder: VoxelBuilder, palette: Palette) {
  const bodyLen = randomRange(12, 18);
  const bodyWidth = randomRange(6, 10);
  const bodyHeight = randomRange(6, 10);
  const legHeight = randomRange(4, 6);
  
  const bodyY = legHeight;
  generateQuadrupedBody(builder, 0, bodyY, 0, bodyLen, bodyWidth, bodyHeight, palette);

  // Thick legs
  const legW = randomRange(2, 3);
  builder.addBox(-bodyWidth/2, 0, bodyLen/2 - 3, legW, legHeight, legW, palette.secondary);
  builder.addBox(bodyWidth/2 - legW, 0, bodyLen/2 - 3, legW, legHeight, legW, palette.secondary);
  builder.addBox(-bodyWidth/2, 0, -bodyLen/2 + 2, legW, legHeight, legW, palette.secondary);
  builder.addBox(bodyWidth/2 - legW, 0, -bodyLen/2 + 2, legW, legHeight, legW, palette.secondary);

  // Trunk (elephant-like)
  if (randomBoolean(0.6)) {
    generateTrunk(builder, 0, bodyY + bodyHeight - 1, bodyLen/2 + 1, randomRange(4, 7), palette);
  } else {
    // Regular head
    generateAnimalHead(builder, 'snout', 0, bodyY + bodyHeight - 1, bodyLen/2 + 2, palette);
  }

  // Neck
  builder.addBox(-2, bodyY + 2, bodyLen/2 - 1, 4, 3, 2, palette.primary);

  // Tail
  generateAnimalTail(builder, 'long', 0, bodyY + bodyHeight - 1, -bodyLen/2, randomRange(4, 6), palette);
}

function generateAquaticAnimal(builder: VoxelBuilder, palette: Palette) {
  const bodyLen = randomRange(10, 20);
  const bodyWidth = randomRange(4, 8);
  const bodyHeight = randomRange(4, 8);
  
  const bodyY = 5; // Lift it up
  generateAquaticBody(builder, 0, bodyY, 0, bodyLen, bodyWidth, bodyHeight, palette);

  // Fins
  generateFins(builder, 0, bodyY + bodyHeight/2, bodyLen/2, 2, palette);
  generateFins(builder, 0, bodyY + bodyHeight/2, -bodyLen/2, 1, palette);

  // Head
  generateAnimalHead(builder, 'snout', 0, bodyY + bodyHeight/2, bodyLen/2 + 2, palette);

  // Tail fin
  generateAnimalTail(builder, 'fin', 0, bodyY + bodyHeight/2, -bodyLen/2, randomRange(4, 6), palette);
}

function generateBipedAnimal(builder: VoxelBuilder, palette: Palette) {
  const bodyWidth = randomRange(3, 5);
  const bodyHeight = randomRange(4, 6);
  const bodyDepth = randomRange(3, 5);
  const legHeight = randomRange(4, 7);
  
  const bodyY = legHeight;
  generateBipedBody(builder, 0, bodyY, 0, bodyWidth, bodyHeight, bodyDepth, palette);

  // Two legs
  const legW = 2;
  builder.addBox(-1, 0, 0, legW, legHeight, legW, palette.secondary);
  builder.addBox(1, 0, 0, legW, legHeight, legW, palette.secondary);

  // Wings
  if (randomBoolean(0.7)) {
    generateWings(builder, 'left', -bodyWidth/2, bodyY + 1, 0, randomRange(4, 8), palette);
    generateWings(builder, 'right', bodyWidth/2, bodyY + 1, 0, randomRange(4, 8), palette);
  }

  // Head
  const headType = randomChoice(['beak', 'default', 'horns']);
  generateAnimalHead(builder, headType, 0, bodyY + bodyHeight, 1, palette);

  // Tail
  if (randomBoolean(0.6)) {
    generateAnimalTail(builder, 'long', 0, bodyY + bodyHeight - 1, -bodyDepth/2, randomRange(3, 5), palette);
  }
}

function generateMultiLimbedAnimal(builder: VoxelBuilder, palette: Palette) {
  const bodyLen = randomRange(8, 14);
  const bodyWidth = randomRange(4, 6);
  const bodyHeight = randomRange(3, 5);
  const legHeight = randomRange(2, 4);
  const limbCount = randomRange(6, 12);
  
  const bodyY = legHeight;
  generateQuadrupedBody(builder, 0, bodyY, 0, bodyLen, bodyWidth, bodyHeight, palette);

  // Multiple legs
  const legSpacing = bodyLen / (limbCount / 2);
  for (let i = 0; i < limbCount / 2; i++) {
    const legZ = -bodyLen/2 + i * legSpacing;
    builder.addBox(-bodyWidth/2, 0, legZ, 1, legHeight, 1, palette.secondary);
    builder.addBox(bodyWidth/2 - 1, 0, legZ, 1, legHeight, 1, palette.secondary);
  }

  // Head
  generateAnimalHead(builder, 'multiple-eyes', 0, bodyY + bodyHeight - 1, bodyLen/2 + 2, palette);
  
  // Tail
  generateAnimalTail(builder, 'segmented', 0, bodyY + bodyHeight - 1, -bodyLen/2, randomRange(4, 8), palette);
}

function generateTentacledAnimal(builder: VoxelBuilder, palette: Palette) {
  const bodySize = randomRange(4, 8);
  const bodyY = 5;
  
  // Main body
  builder.addSphere(0, bodyY, 0, bodySize, palette.primary);

  // Tentacles
  const tentacleCount = randomRange(6, 10);
  const tentacleLength = randomRange(6, 12);
  generateTentacles(builder, tentacleCount, 0, bodyY, 0, tentacleLength, palette);

  // Head/eyes
  generateAnimalHead(builder, 'multiple-eyes', 0, bodyY, bodySize + 1, palette);
}

function generateHybridAnimal(builder: VoxelBuilder, palette: Palette) {
  // Random hybrid combination
  const hasWings = randomBoolean(0.5);
  const hasFins = randomBoolean(0.5);
  const isAquatic = randomBoolean(0.3);

  if (isAquatic) {
    generateAquaticAnimal(builder, palette);
    if (hasWings) {
      generateWings(builder, 'left', -3, 6, 0, 4, palette);
      generateWings(builder, 'right', 3, 6, 0, 4, palette);
    }
  } else {
    generateQuadrupedAnimal(builder, palette);
    if (hasWings) {
      generateWings(builder, 'left', -3, 5, 0, 5, palette);
      generateWings(builder, 'right', 3, 5, 0, 5, palette);
    }
    if (hasFins) {
      generateFins(builder, 0, 5, 3, 2, palette);
    }
  }
}

function generateAsymmetricAnimal(builder: VoxelBuilder, palette: Palette) {
  const bodyLen = randomRange(6, 12);
  const bodyWidth = randomRange(3, 6);
  const bodyHeight = randomRange(3, 6);
  const legHeight = randomRange(3, 6);
  
  const bodyY = legHeight;
  
  // Asymmetric body
  builder.addBox(-bodyWidth/2, bodyY, -bodyLen/2, bodyWidth + randomRange(-1, 2), bodyHeight, bodyLen, palette.primary);

  // Uneven legs
  const leftLegs = randomRange(2, 4);
  const rightLegs = randomRange(2, 4);
  
  for (let i = 0; i < leftLegs; i++) {
    const legZ = -bodyLen/2 + i * 3;
    builder.addBox(-bodyWidth/2, 0, legZ, 1, legHeight, 1, palette.secondary);
  }
  
  for (let i = 0; i < rightLegs; i++) {
    const legZ = -bodyLen/2 + i * 3;
    builder.addBox(bodyWidth/2 - 1, 0, legZ, 1, legHeight, 1, palette.secondary);
  }

  // Asymmetric head
  const headOffset = randomRange(-2, 2);
  generateAnimalHead(builder, randomChoice(['snout', 'beak', 'horns', 'multiple-eyes']), headOffset, bodyY + bodyHeight - 1, bodyLen/2 + 2, palette);

  // Multiple tails or no tail
  if (randomBoolean(0.7)) {
    const tailCount = randomRange(1, 3);
    for (let i = 0; i < tailCount; i++) {
      generateAnimalTail(builder, randomChoice(['long', 'bushy', 'segmented']), -2 + i * 2, bodyY + bodyHeight - 1, -bodyLen/2, randomRange(3, 6), palette);
    }
  }
}
