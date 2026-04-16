// 레벨 관련
export const LEVEL_UP_INTERVAL_MS = 2500;  // 2.5초마다 레벨업 (기존 5초의 2배 속도)

// 에너지 관련
export const MAX_ENERGY          = 100;
export const ENERGY_DECAY_BASE   = 4;      // 초당 차감 기본값 (× level) — 기존 2의 2배
export const ENERGY_GAIN_BASE    = 12;     // 정답 시 기본 충전량
export const ENERGY_GAIN_COMBO   = 3;      // 콤보당 추가 충전량
export const ENERGY_GAIN_CAP     = 30;     // 충전 최대 캡 (6콤보 이상 고정)
export const ENERGY_WRONG        = 10;     // 오답 시 차감량

// 콤보 관련
export const COMBO_CAP_AT        = 6;      // 이 콤보 이상이면 에너지 게인 캡
export const COMBO_MULTIPLIERS   = [1.0, 1.0, 1.2, 1.5, 1.8, 2.0, 2.5]; // index = combo (0~6+)

// 점수 관련
export const SCORE_BASE          = 100;   // 블럭 1개 기본 점수

// 블럭 큐
export const QUEUE_SIZE          = 5;     // 화면에 보이는 최대 블럭 수
