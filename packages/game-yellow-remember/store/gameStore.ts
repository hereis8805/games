import { create } from 'zustand';
import {
  DIFFICULTY_LEVELS, MAX_LIVES, ROUNDS_TO_LEVEL_UP,
  FADE_DURATION_MS,
} from '../constants/game';

export type GameStatus = 'idle' | 'showing' | 'input' | 'result' | 'over';

export interface BlockState {
  id:        number;
  isYellow:  boolean;
  fadeStart: number;   // Date.now() when fade started (0 = not yet)
}

function pickYellowIndices(total: number, count: number): Set<number> {
  const indices = new Set<number>();
  while (indices.size < count) {
    indices.add(Math.floor(Math.random() * total));
  }
  return indices;
}

function buildBlocks(gridSize: number, yellowCount: number): BlockState[] {
  const total   = gridSize * gridSize;
  const yellows = pickYellowIndices(total, yellowCount);
  return Array.from({ length: total }, (_, i) => ({
    id:        i,
    isYellow:  yellows.has(i),
    fadeStart: 0,
  }));
}

function randomYellowCount(diffIdx: number): number {
  const { minYellow, maxYellow } = DIFFICULTY_LEVELS[diffIdx];
  return minYellow + Math.floor(Math.random() * (maxYellow - minYellow + 1));
}

interface GameState {
  status:       GameStatus;
  diffIdx:      number;    // 0~3
  roundInLevel: number;    // 0~ROUNDS_TO_LEVEL_UP-1
  score:        number;
  lives:        number;
  blocks:       BlockState[];
  yellowCount:  number;
  tappedSet:    Set<number>;   // 이번 라운드에 사용자가 누른 yellow idx
  wrongTapped:  Set<number>;   // 틀린 블럭 idx (시각 피드백용)
  roundKey:     number;        // 라운드 전환 키

  startGame:    () => void;
  startRound:   () => void;
  beginFade:    () => void;    // 블럭 페이드 시작 (showing→input)
  tapBlock:     (id: number) => void;
  nextRound:    () => void;
  goHome:       () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  status:       'idle',
  diffIdx:      0,
  roundInLevel: 0,
  score:        0,
  lives:        MAX_LIVES,
  blocks:       [],
  yellowCount:  0,
  tappedSet:    new Set(),
  wrongTapped:  new Set(),
  roundKey:     0,

  startGame: () => {
    const diffIdx     = 0;
    const yellowCount = randomYellowCount(diffIdx);
    const { gridSize } = DIFFICULTY_LEVELS[diffIdx];
    set({
      status:       'showing',
      diffIdx,
      roundInLevel: 0,
      score:        0,
      lives:        MAX_LIVES,
      blocks:       buildBlocks(gridSize, yellowCount),
      yellowCount,
      tappedSet:    new Set(),
      wrongTapped:  new Set(),
      roundKey:     Date.now(),
    });
  },

  startRound: () => {
    const { diffIdx } = get();
    const yellowCount = randomYellowCount(diffIdx);
    const { gridSize } = DIFFICULTY_LEVELS[diffIdx];
    set({
      status:      'showing',
      blocks:      buildBlocks(gridSize, yellowCount),
      yellowCount,
      tappedSet:   new Set(),
      wrongTapped: new Set(),
      roundKey:    Date.now(),
    });
  },

  beginFade: () => {
    const now = Date.now();
    set(s => ({
      status: 'input',
      blocks: s.blocks.map(b =>
        b.isYellow ? { ...b, fadeStart: now } : b
      ),
    }));
  },

  tapBlock: (id: number) => {
    const { status, blocks, tappedSet, wrongTapped, lives, score, diffIdx, roundInLevel } = get();
    if (status !== 'input') return;

    const block = blocks[id];
    if (!block) return;

    // 이미 처리된 블럭 무시
    if (tappedSet.has(id) || wrongTapped.has(id)) return;

    if (block.isYellow) {
      // 정답 블럭
      const newTapped = new Set(tappedSet);
      newTapped.add(id);

      // 누른 yellow 블럭은 즉시 회색으로 전환 (fadeStart = 0 리셋)
      const newBlocks = blocks.map(b =>
        b.id === id ? { ...b, isYellow: false, fadeStart: 0 } : b
      );

      // 모든 yellow 를 다 맞췄으면 결과 처리
      const totalYellow = blocks.filter(b => b.isYellow).length;
      if (newTapped.size >= totalYellow) {
        // 라운드 성공
        const newScore        = score + 10 * (diffIdx + 1);
        const newRoundInLevel = roundInLevel + 1;
        const newDiffIdx      = newRoundInLevel >= ROUNDS_TO_LEVEL_UP
          ? Math.min(diffIdx + 1, DIFFICULTY_LEVELS.length - 1)
          : diffIdx;
        set({
          blocks:       newBlocks,
          tappedSet:    newTapped,
          score:        newScore,
          status:       'result',
          diffIdx:      newDiffIdx,
          roundInLevel: newRoundInLevel >= ROUNDS_TO_LEVEL_UP ? 0 : newRoundInLevel,
        });
      } else {
        set({ blocks: newBlocks, tappedSet: newTapped });
      }
    } else {
      // 오답 블럭
      const newWrong = new Set(wrongTapped);
      newWrong.add(id);
      const newLives = lives - 1;

      if (newLives <= 0) {
        set({ lives: 0, wrongTapped: newWrong, status: 'over' });
      } else {
        set({ lives: newLives, wrongTapped: newWrong });
      }
    }
  },

  nextRound: () => {
    get().startRound();
  },

  goHome: () => {
    set({
      status:       'idle',
      diffIdx:      0,
      roundInLevel: 0,
      score:        0,
      lives:        MAX_LIVES,
      blocks:       [],
      tappedSet:    new Set(),
      wrongTapped:  new Set(),
    });
  },
}));
