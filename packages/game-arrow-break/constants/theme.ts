export const COLORS = {
  background: '#1a1a2e',
  lane:       '#16213e',
  laneEmpty:  '#0f3460',

  // 방향별 블럭 색상
  block: {
    up:    { bg: '#e94560', text: '#ffffff' },
    down:  { bg: '#0f3460', text: '#ffffff' },
    left:  { bg: '#533483', text: '#ffffff' },
    right: { bg: '#05c46b', text: '#ffffff' },
  },

  // 타겟 블럭 (하단) 강조
  blockTarget: {
    up:    { bg: '#ff6b8a', text: '#ffffff' },
    down:  { bg: '#1a6eb5', text: '#ffffff' },
    left:  { bg: '#8b5cf6', text: '#ffffff' },
    right: { bg: '#0be881', text: '#ffffff' },
  },

  // HUD
  scoreText:   '#e2e8f0',
  levelText:   '#ffd700',
  comboText:   '#ff6b6b',
  subText:     '#94a3b8',

  // 에너지 바
  energyHigh:   '#05c46b',
  energyMid:    '#ffd700',
  energyLow:    '#e94560',
  energyBg:     '#0f3460',

  // 버튼
  button:       '#533483',
  buttonActive: '#e94560',
  buttonText:   '#ffffff',

  // 오버레이
  overlay:      'rgba(0,0,0,0.75)',
};

export const BLOCK_SIZE  = 54;
export const BLOCK_GAP   = 8;
export const LANE_PADDING = 12;
export const MAX_VISIBLE  = 5;
