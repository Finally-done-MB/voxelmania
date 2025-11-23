import type { GeneratorCategory } from '../types';

const STATS_KEY = 'voxel_forge_stats';

interface StatsData {
  totalCreations: number;
  byCategory: {
    robot: number;
    spaceship: number;
    animal: number;
    monster: number;
  };
  firstCreation?: number;
  lastCreation?: number;
}

function getDefaultStats(): StatsData {
  return {
    totalCreations: 0,
    byCategory: {
      robot: 0,
      spaceship: 0,
      animal: 0,
      monster: 0,
    },
  };
}

export function getStats(): StatsData {
  const data = localStorage.getItem(STATS_KEY);
  if (!data) return getDefaultStats();
  
  try {
    const parsed = JSON.parse(data);
    // Merge with defaults to handle missing fields
    return {
      ...getDefaultStats(),
      ...parsed,
      byCategory: {
        ...getDefaultStats().byCategory,
        ...parsed.byCategory,
      },
    };
  } catch (e) {
    return getDefaultStats();
  }
}

export function trackCreation(category: GeneratorCategory) {
  const stats = getStats();
  
  stats.totalCreations += 1;
  stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
  
  if (!stats.firstCreation) {
    stats.firstCreation = Date.now();
  }
  stats.lastCreation = Date.now();
  
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}
