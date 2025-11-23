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
    // More variety: reduce quadruped dominance, add more birds, fish, spiders
    const animalType = randomChoice([
      'quadruped', 'quadruped', // 13% - dog, cat, sheep (reduced from 30%)
      'bird', 'bird', 'bird', // 20% - birds (increased)
      'fish', 'fish', 'fish', // 20% - fish (increased)
      'spider', 'spider', // 13% - spiders (new)
      'long-necked', // 7% - giraffe
      'large-quadruped', // 7% - elephant, rhino
      'aquatic' // 7% - whale, dolphin
    ]);

    switch (animalType) {
      case 'quadruped':
        generateQuadrupedAnimal(builder, palette);
        break;
      case 'bird':
        generateBird(builder, palette);
        break;
      case 'fish':
        generateFish(builder, palette);
        break;
      case 'spider':
        generateSpider(builder, palette);
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
    }
  } else {
    // === WEIRD/ORGANIC ANIMALS (40%) ===
    const weirdType = randomChoice([
      'multi-limbed',
      'tentacled',
      'hybrid',
      'asymmetric',
      'spider' // Add spider to weird category too
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
      case 'spider':
        generateSpider(builder, palette);
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

function generateBird(builder: VoxelBuilder, palette: Palette) {
  // Bird body - smaller and more compact
  const bodyWidth = randomRange(2, 4);
  const bodyHeight = randomRange(3, 5);
  const bodyDepth = randomRange(2, 4);
  const legHeight = randomRange(2, 4);
  
  const bodyY = legHeight;
  generateBipedBody(builder, 0, bodyY, 0, bodyWidth, bodyHeight, bodyDepth, palette);

  // Thin legs
  const legW = 1;
  builder.addBox(-1, 0, 0, legW, legHeight, legW, palette.secondary);
  builder.addBox(1, 0, 0, legW, legHeight, legW, palette.secondary);
  
  // Feet (webbed or talons)
  if (randomBoolean(0.5)) {
    // Webbed feet
    builder.addBox(-2, 0, -1, 3, 1, 2, palette.detail);
    builder.addBox(0, 0, -1, 3, 1, 2, palette.detail);
  } else {
    // Talons
    for (let i = 0; i < 3; i++) {
      builder.addVoxel(-1 + i, 0, -1, palette.accent);
      builder.addVoxel(1 + i, 0, -1, palette.accent);
    }
  }

  // Wings (always present for birds)
  const wingSpan = randomRange(5, 10);
  generateWings(builder, 'left', -bodyWidth/2, bodyY + 1, 0, wingSpan, palette);
  generateWings(builder, 'right', bodyWidth/2, bodyY + 1, 0, wingSpan, palette);

  // Beak head
  generateAnimalHead(builder, 'beak', 0, bodyY + bodyHeight, 1, palette);

  // Tail feathers
  if (randomBoolean(0.8)) {
    const tailType = randomChoice(['long', 'bushy']);
    generateAnimalTail(builder, tailType, 0, bodyY + bodyHeight - 1, -bodyDepth/2, randomRange(3, 6), palette);
  }
}

function generateFish(builder: VoxelBuilder, palette: Palette) {
  // Fish body - streamlined
  const bodyLen = randomRange(8, 16);
  const bodyWidth = randomRange(3, 6);
  const bodyHeight = randomRange(3, 6);
  
  const bodyY = 5; // Lift it up
  generateAquaticBody(builder, 0, bodyY, 0, bodyLen, bodyWidth, bodyHeight, palette);

  // Fins - more detailed
  // Dorsal fin (top)
  const dorsalFinHeight = randomRange(3, 6);
  for (let i = 0; i < dorsalFinHeight; i++) {
    builder.addVoxel(0, bodyY + bodyHeight + i, bodyLen/4, palette.secondary);
    builder.addVoxel(0, bodyY + bodyHeight + i, 0, palette.secondary);
    builder.addVoxel(0, bodyY + bodyHeight + i, -bodyLen/4, palette.secondary);
  }
  
  // Pectoral fins (sides)
  generateFins(builder, 0, bodyY + bodyHeight/2, bodyLen/3, 2, palette);
  
  // Pelvic fins (bottom sides)
  builder.addBox(-bodyWidth/2 - 1, bodyY, bodyLen/4, 1, 2, 2, palette.secondary);
  builder.addBox(bodyWidth/2, bodyY, bodyLen/4, 1, 2, 2, palette.secondary);
  
  // Anal fin (bottom back)
  for (let i = 0; i < 3; i++) {
    builder.addVoxel(0, bodyY - 1, -bodyLen/3 + i, palette.secondary);
  }

  // Head with eyes on sides
  generateAnimalHead(builder, 'snout', 0, bodyY + bodyHeight/2, bodyLen/2 + 1, palette);
  // Side eyes
  builder.addVoxel(-bodyWidth/2, bodyY + bodyHeight/2, bodyLen/2, '#FFFFFF');
  builder.addVoxel(bodyWidth/2 - 1, bodyY + bodyHeight/2, bodyLen/2, '#FFFFFF');
  builder.addVoxel(-bodyWidth/2, bodyY + bodyHeight/2, bodyLen/2 + 1, '#000000');
  builder.addVoxel(bodyWidth/2 - 1, bodyY + bodyHeight/2, bodyLen/2 + 1, '#000000');

  // Tail fin (large)
  generateAnimalTail(builder, 'fin', 0, bodyY + bodyHeight/2, -bodyLen/2, randomRange(5, 8), palette);
  
  // Scales pattern
  if (randomBoolean(0.6)) {
    for (let i = 0; i < 8; i++) {
      const scaleX = randomRange(-bodyWidth/2 + 1, bodyWidth/2 - 1);
      const scaleZ = randomRange(-bodyLen/2 + 1, bodyLen/2 - 1);
      builder.addVoxel(scaleX, bodyY + bodyHeight, scaleZ, palette.accent);
    }
  }
}

function generateSpider(builder: VoxelBuilder, palette: Palette) {
  // Spider body - two segments (cephalothorax and abdomen)
  const bodySize = randomRange(3, 6);
  const bodyY = 3;
  
  // Cephalothorax (front segment)
  builder.addSphere(0, bodyY, bodySize/2, bodySize, palette.primary);
  
  // Abdomen (back segment, larger)
  const abdomenSize = randomRange(bodySize, bodySize + 2);
  builder.addSphere(0, bodyY, -abdomenSize/2, abdomenSize, palette.primary);
  
  // Legs - 8 legs total, 4 on each side
  const legLength = randomRange(4, 8);
  
  for (let side = 0; side < 2; side++) {
    const sideX = side === 0 ? -bodySize - 1 : bodySize;
    for (let leg = 0; leg < 4; leg++) {
      const legZ = bodySize/2 - leg * 2;
      const legY = bodyY;
      
      // Leg segments (3 segments per leg)
      const segment1Len = Math.floor(legLength / 3);
      const segment2Len = Math.floor(legLength / 3);
      const segment3Len = legLength - segment1Len - segment2Len;
      
      // First segment (up and out)
      for (let i = 0; i < segment1Len; i++) {
        builder.addVoxel(sideX + (side === 0 ? -i : i), legY + i, legZ, palette.secondary);
      }
      
      // Second segment (down)
      const seg2StartX = sideX + (side === 0 ? -segment1Len : segment1Len);
      const seg2StartY = legY + segment1Len;
      for (let i = 0; i < segment2Len; i++) {
        builder.addVoxel(seg2StartX, seg2StartY - i, legZ, palette.secondary);
      }
      
      // Third segment (out)
      const seg3StartY = seg2StartY - segment2Len;
      for (let i = 0; i < segment3Len; i++) {
        builder.addVoxel(seg2StartX + (side === 0 ? -i : i), seg3StartY, legZ - i, palette.secondary);
      }
    }
  }
  
  // Eyes (usually 8, but we'll do 4-6 for visibility)
  const eyeCount = randomRange(4, 6);
  for (let i = 0; i < eyeCount; i++) {
    const angle = (i / eyeCount) * Math.PI * 2;
    const eyeX = Math.round(Math.cos(angle) * (bodySize - 1));
    const eyeZ = bodySize/2 + 1;
    const eyeY = bodyY + Math.round(Math.sin(angle) * 1);
    builder.addVoxel(eyeX, eyeY, eyeZ, '#FFFFFF');
    builder.addVoxel(eyeX, eyeY, eyeZ + 1, '#000000');
  }
  
  // Fangs/chelicerae
  builder.addBox(-1, bodyY, bodySize/2 + bodySize, 1, 1, 2, palette.detail);
  builder.addBox(1, bodyY, bodySize/2 + bodySize, 1, 1, 2, palette.detail);
  
  // Spinnerets (back)
  if (randomBoolean(0.7)) {
    builder.addVoxel(0, bodyY, -abdomenSize/2 - abdomenSize, palette.accent);
    builder.addVoxel(-1, bodyY, -abdomenSize/2 - abdomenSize, palette.accent);
    builder.addVoxel(1, bodyY, -abdomenSize/2 - abdomenSize, palette.accent);
  }
  
  // Pattern on abdomen
  if (randomBoolean(0.6)) {
    for (let i = 0; i < 4; i++) {
      const patternX = randomRange(-abdomenSize/2, abdomenSize/2);
      const patternZ = randomRange(-abdomenSize, 0);
      builder.addVoxel(patternX, bodyY + abdomenSize/2, patternZ, palette.accent);
    }
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
