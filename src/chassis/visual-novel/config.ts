import type { ChassisConfig } from '../../types';
import { THEMES } from '../../themes';

const config: ChassisConfig = {
  id: 'visual-novel',
  name: 'Story Forge',
  description: 'Branching narrative with character portraits, choices, and multiple endings',
  icon: '📖',
  themes: THEMES,
  defaultTheme: 'ocean',
};

export default config;
