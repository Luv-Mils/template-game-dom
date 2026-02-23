import type { ChassisConfig } from '../../types';
import { THEMES } from '../../themes';

const config: ChassisConfig = {
  id: 'card-battler',
  name: 'Deck Duels',
  description: 'Build a deck, draw cards, play them strategically against an AI opponent',
  icon: '🃏',
  themes: THEMES,
  defaultTheme: 'midnight',
};

export default config;
