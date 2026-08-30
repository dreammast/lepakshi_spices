export const SCENE_DURATIONS = {
  ORIGIN: 3000,       // 0–3s
  CRAFT: 3000,        // 3–6s
  MAKING: 3000,       // 6–9s
  FOUNDER: 3500,      // 9–12.5s
  LOGO: 3000,         // 12.5–15.5s
  GRAND_OPENING: 3500,// 15.5–19s
  JOURNEY: Infinity,  // 19s+ Hold until CTA clicked
};

export type SceneKey = 'ORIGIN' | 'CRAFT' | 'MAKING' | 'FOUNDER' | 'LOGO' | 'GRAND_OPENING' | 'JOURNEY';

export const SCENE_KEYS: SceneKey[] = [
  'ORIGIN',
  'CRAFT',
  'MAKING',
  'FOUNDER',
  'LOGO',
  'GRAND_OPENING',
  'JOURNEY',
];

export const BRAND_COLORS = {
  deepEmerald: '#0B2E1A',
  darkEmerald: '#06170E',
  secondaryEmerald: '#123D28',
  luxuryGold: '#D6B15B',
  highlightGold: '#F6D88B',
  warmCream: '#F7F1E3',
  shadowBlack: '#030B07',
};
