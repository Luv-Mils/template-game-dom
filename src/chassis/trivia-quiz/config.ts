import type { ChassisConfig } from '../../types';
import { THEMES } from '../../themes';

const config: ChassisConfig = {
  id: 'trivia-quiz',
  name: 'Brain Blitz',
  description: 'Fast-paced trivia game with categories, streaks, and a ticking clock',
  icon: '🧠',
  themes: THEMES,
  defaultTheme: 'ember',
};

export default config;
