import type { ChassisConfig, GameTheme } from '../types';

const chassisModules: Record<string, () => Promise<{ default: ChassisConfig }>> = {
  'idle-clicker':  () => import('./idle-clicker/config'),
  'card-battler':  () => import('./card-battler/config'),
  'visual-novel':  () => import('./visual-novel/config'),
  'trivia-quiz':   () => import('./trivia-quiz/config'),
};

export async function loadChassis(id: string): Promise<ChassisConfig> {
  const loader = chassisModules[id] ?? chassisModules['idle-clicker'];
  const mod = await loader();
  return mod.default;
}

const gameModules: Record<string, () => Promise<{ default: React.ComponentType<{ theme: GameTheme }> }>> = {
  'idle-clicker':  () => import('./idle-clicker/Game'),
  'card-battler':  () => import('./card-battler/Game'),
  'visual-novel':  () => import('./visual-novel/Game'),
  'trivia-quiz':   () => import('./trivia-quiz/Game'),
};

export async function loadGame(id: string): Promise<React.ComponentType<{ theme: GameTheme }>> {
  const loader = gameModules[id] ?? gameModules['idle-clicker'];
  const mod = await loader();
  return mod.default;
}
