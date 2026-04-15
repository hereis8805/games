import { create } from 'zustand';
import { Platform } from 'react-native';
import {
  BlockItem, Direction,
  initQueue, judgeInput, popAndPush,
} from '../logic/blocks';
import {
  QUEUE_SIZE, MAX_ENERGY,
  ENERGY_DECAY_BASE,
  ENERGY_GAIN_BASE, ENERGY_GAIN_COMBO, ENERGY_GAIN_CAP,
  ENERGY_WRONG, COMBO_MULTIPLIERS, SCORE_BASE,
} from '../constants/game';

export type GameStatus = 'idle' | 'countdown' | 'playing' | 'over';
export type LastAction = 'correct' | 'wrong' | null;

const BEST_KEY = 'arrow-break-best';

function loadBest(): number {
  if (Platform.OS === 'web') {
    try { return parseInt(localStorage.getItem(BEST_KEY) ?? '0', 10) || 0; }
    catch { return 0; }
  }
  return 0;
}

function saveBest(score: number) {
  if (Platform.OS === 'web') {
    try { localStorage.setItem(BEST_KEY, String(score)); } catch {}
  } else {
    try {
      const AS = require('@react-native-async-storage/async-storage').default;
      AS.setItem(BEST_KEY, String(score));
    } catch {}
  }
}

function getComboMultiplier(combo: number): number {
  const idx = Math.min(combo, COMBO_MULTIPLIERS.length - 1);
  return COMBO_MULTIPLIERS[idx];
}

interface GameState {
  queue:      BlockItem[];
  level:      number;
  energy:     number;
  score:      number;
  combo:      number;
  status:     GameStatus;
  countdown:  number;      // 3 → 2 → 1 → 0 (= playing)
  lastAction: LastAction;
  actionSeq:  number;      // 매 입력마다 +1 (애니메이션 트리거용)
  bestScore:  number;

  startCountdown:  () => void;
  countdownTick:   () => void;   // 1초마다 App.tsx에서 호출
  pressDirection:  (dir: Direction) => void;
  energyTick:      () => void;   // 100ms마다 App.tsx에서 호출
  levelTick:       () => void;   // 5000ms마다 App.tsx에서 호출
  goHome:          () => void;   // 게임 홈(idle)으로 복귀
}

export const useGameStore = create<GameState>((set, get) => ({
  queue:      initQueue(QUEUE_SIZE),
  level:      1,
  energy:     MAX_ENERGY,
  score:      0,
  combo:      0,
  status:     'idle',
  countdown:  3,
  lastAction: null,
  actionSeq:  0,
  bestScore:  loadBest(),

  // ── 카운트다운 시작 ──────────────────────────────────────────────────
  startCountdown: () => {
    set({
      queue:      initQueue(QUEUE_SIZE),
      level:      1,
      energy:     MAX_ENERGY,
      score:      0,
      combo:      0,
      status:     'countdown',
      countdown:  3,
      lastAction: null,
      actionSeq:  0,
    });
  },

  // ── 카운트다운 틱 (1s) ──────────────────────────────────────────────
  countdownTick: () => {
    const { countdown } = get();
    if (countdown <= 1) {
      set({ status: 'playing', countdown: 0 });
    } else {
      set({ countdown: countdown - 1 });
    }
  },

  // ── 방향 입력 처리 ───────────────────────────────────────────────────
  pressDirection: (dir: Direction) => {
    const { status, queue, energy, score, combo, bestScore, actionSeq } = get();
    if (status !== 'playing') return;

    const correct = judgeInput(queue, dir);

    if (correct) {
      const newCombo    = combo + 1;
      const multiplier  = getComboMultiplier(newCombo);
      const gained      = Math.floor(SCORE_BASE * get().level * multiplier);
      const energyGain  = Math.min(ENERGY_GAIN_BASE + newCombo * ENERGY_GAIN_COMBO, ENERGY_GAIN_CAP);
      const newEnergy   = Math.min(energy + energyGain, MAX_ENERGY);
      const newScore    = score + gained;
      const newBest     = Math.max(bestScore, newScore);

      if (newBest > bestScore) saveBest(newBest);

      set({
        queue:      popAndPush(queue),
        combo:      newCombo,
        energy:     newEnergy,
        score:      newScore,
        bestScore:  newBest,
        lastAction: 'correct',
        actionSeq:  actionSeq + 1,
      });
    } else {
      const newEnergy = Math.max(energy - ENERGY_WRONG, 0);

      if (newEnergy <= 0) {
        const newBest = Math.max(bestScore, score);
        if (newBest > bestScore) saveBest(newBest);
        set({
          energy:     0,
          combo:      0,
          status:     'over',
          lastAction: 'wrong',
          actionSeq:  actionSeq + 1,
          bestScore:  newBest,
        });
      } else {
        set({
          energy:     newEnergy,
          combo:      0,
          lastAction: 'wrong',
          actionSeq:  actionSeq + 1,
        });
      }
    }
  },

  // ── 에너지 감소 틱 (100ms) ───────────────────────────────────────────
  energyTick: () => {
    const { status, energy, level, score, bestScore } = get();
    if (status !== 'playing') return;

    const decay    = ENERGY_DECAY_BASE * level * 0.1; // per 100ms
    const newEnergy = Math.max(energy - decay, 0);

    if (newEnergy <= 0) {
      const newBest = Math.max(bestScore, score);
      if (newBest > bestScore) saveBest(newBest);
      set({ energy: 0, status: 'over', bestScore: newBest });
    } else {
      set({ energy: newEnergy });
    }
  },

  // ── 레벨업 틱 (5000ms) ───────────────────────────────────────────────
  levelTick: () => {
    const { status } = get();
    if (status !== 'playing') return;
    set((s) => ({ level: s.level + 1 }));
  },

  // ── 게임 홈(idle)으로 복귀 ────────────────────────────────────────────
  goHome: () => {
    set({
      status:     'idle',
      score:      0,
      level:      1,
      energy:     MAX_ENERGY,
      combo:      0,
      countdown:  3,
      lastAction: null,
      actionSeq:  0,
      queue:      initQueue(QUEUE_SIZE),
    });
  },
}));
