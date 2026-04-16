// 서브 스테이지: 같은 그리드 크기 내 난이도 단계
export interface SubStage {
  yellowCount:  number;   // 노란 블럭 수 (= 기억할 순서 수)
  repetitions:  number;   // 해당 조건을 몇 번 클리어해야 다음 단계로
}

// 난이도 레벨: 그리드 크기 + 서브 스테이지 목록
export interface DifficultyLevel {
  gridSize:   number;
  subStages:  SubStage[];
  fadeDurationMs: number;  // 노란→회색 페이드 시간
}

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  {
    gridSize: 3,
    fadeDurationMs: 3000,
    subStages: [
      { yellowCount: 2, repetitions: 2 },
      { yellowCount: 3, repetitions: 3 },
    ],
  },
  {
    gridSize: 4,
    fadeDurationMs: 2400,
    subStages: [
      { yellowCount: 3, repetitions: 3 },
      { yellowCount: 4, repetitions: 4 },
      { yellowCount: 5, repetitions: 5 },
    ],
  },
  {
    gridSize: 5,
    fadeDurationMs: 1900,
    subStages: [
      { yellowCount: 5, repetitions: 5 },
      { yellowCount: 6, repetitions: 5 },
      { yellowCount: 7, repetitions: 5 },
    ],
  },
  {
    gridSize: 6,
    fadeDurationMs: 1500,
    subStages: [
      { yellowCount: 6, repetitions: 5 },
      { yellowCount: 8, repetitions: 5 },
      { yellowCount: 10, repetitions: 5 },
    ],
  },
];

// 라이프
export const MAX_LIVES = 3;

// 라운드 타이머
export const ROUND_TIME_MS        = 10000;  // 라운드당 주어지는 시간 (ms)
export const TIME_BONUS_PER_SEC   = 5;      // 남은 초당 보너스 점수

// 블럭 색상
export const COLOR_GRAY        = '#2d2d3a';
export const COLOR_YELLOW      = '#ffe066';
export const COLOR_YELLOW_BG   = 'rgba(255, 224, 0, 0.18)';

// 블럭 크기 (그리드별 자동 계산, 최대 너비 기준)
export const BOARD_MAX_WIDTH = 340;
export const BLOCK_GAP       = 8;

// 라운드 전환 애니메이션: 노란→회색 페이드 시간 (ms)
export const TRANSITION_FADE_MS = 350;
