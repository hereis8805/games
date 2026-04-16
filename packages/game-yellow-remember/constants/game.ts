// 난이도별 그리드 설정
export interface DifficultyConfig {
  gridSize:  number;  // 3 | 4 | 5 | 6
  minYellow: number;
  maxYellow: number;
}

export const DIFFICULTY_LEVELS: DifficultyConfig[] = [
  { gridSize: 3, minYellow: 1, maxYellow: 3 },
  { gridSize: 4, minYellow: 2, maxYellow: 4 },
  { gridSize: 5, minYellow: 3, maxYellow: 5 },
  { gridSize: 6, minYellow: 4, maxYellow: 6 },
];

// 각 라운드에서 몇 번 맞춰야 다음 난이도로
export const ROUNDS_TO_LEVEL_UP = 5;

// 노란 블럭 페이드 지속시간 (ms) — 난이도 올라갈수록 짧아짐
export const FADE_DURATION_MS = [3000, 2400, 1900, 1500]; // index = 난이도(0~3)

// 라이프
export const MAX_LIVES = 3;

// 블럭 색상
export const COLOR_GRAY   = '#2d2d3a';
export const COLOR_YELLOW = '#ffe066';
export const COLOR_YELLOW_BG = 'rgba(255, 224, 0, 0.18)';

// 블럭 크기 (그리드별 자동 계산, 최대 너비 기준)
export const BOARD_MAX_WIDTH = 340;
export const BLOCK_GAP       = 8;
