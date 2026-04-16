import { create } from 'zustand';
import { DIFFICULTY_LEVELS, MAX_LIVES, ROUND_TIME_MS, TIME_BONUS_PER_SEC } from '../constants/game';

export type GameStatus =
  | 'idle'
  | 'countdown'
  | 'showing'
  | 'input'
  | 'result'
  | 'transition'
  | 'pre_showing'
  | 'wrong_pause'
  | 'over';


export interface BlockState {
  id:        number;
  isYellow:  boolean;
  fadeStart: number;   // Date.now() when fade started (0 = not fading)
  order:     number;   // 탭 순서 (1-based). 0 = 노란블럭 아님
}

// ─── 유틸 ───────────────────────────────────────────────

function pickYellowIndices(total: number, count: number): number[] {
  const indices = new Set<number>();
  while (indices.size < count) {
    indices.add(Math.floor(Math.random() * total));
  }
  return Array.from(indices); // 삽입 순서 = 랜덤 순서
}

function buildBlocks(gridSize: number, yellowCount: number): BlockState[] {
  const total = gridSize * gridSize;
  const yellowPositions = pickYellowIndices(total, yellowCount);
  // 삽입된 순서가 곧 탭 순서 (order 1, 2, 3, …)
  const posToOrder = new Map(yellowPositions.map((pos, i) => [pos, i + 1]));

  return Array.from({ length: total }, (_, i) => ({
    id:        i,
    isYellow:  posToOrder.has(i),
    fadeStart: 0,
    order:     posToOrder.get(i) ?? 0,
  }));
}

// ─── 상태 타입 ───────────────────────────────────────────

interface GameState {
  status:          GameStatus;
  diffIdx:         number;   // DIFFICULTY_LEVELS 인덱스
  subStageIdx:     number;   // 현재 서브 스테이지 인덱스
  roundInSubStage: number;   // 현재 서브 스테이지 내 몇 번째 라운드
  score:           number;
  lives:           number;
  blocks:          BlockState[];
  yellowCount:     number;
  tappedSet:       Set<number>;   // 정답 탭한 block.id
  wrongTapped:     Set<number>;   // 오답 탭한 block.id
  roundKey:        number;
  tutorialShown:   boolean;
  shakeTrigger:    number;
  nextTapOrder:    number;   // 다음에 눌러야 할 order (1부터 시작)
  roundTimeLeft:   number;   // 라운드 남은 시간 (ms)

  startGame:           () => void;
  startRound:          () => void;
  beginFade:           () => void;
  challenge:           () => void;   // 도전 버튼 → showing→input 전환
  setTimeLeft:         (ms: number) => void;
  timeOut:             () => void;   // 시간 초과 (input 중)
  tapBlock:            (id: number) => void;
  nextRound:           () => void;
  beginTransitionFade: () => void;
  prepareGrid:         () => void;
  setGameOver:         () => void;
  goHome:              () => void;
}

// ─── 스토어 ─────────────────────────────────────────────

export const useGameStore = create<GameState>((set, get) => ({
  status:          'idle',
  diffIdx:         0,
  subStageIdx:     0,
  roundInSubStage: 0,
  score:           0,
  lives:           MAX_LIVES,
  blocks:          [],
  yellowCount:     0,
  tappedSet:       new Set(),
  wrongTapped:     new Set(),
  roundKey:        0,
  tutorialShown:   false,
  shakeTrigger:    0,
  nextTapOrder:    1,
  roundTimeLeft:   ROUND_TIME_MS,

  startGame: () => {
    const diffIdx     = 0;
    const subStageIdx = 0;
    const { gridSize } = DIFFICULTY_LEVELS[diffIdx];
    const total = gridSize * gridSize;
    // 카운트다운 동안 보여줄 전체 회색 블럭
    const grayBlocks: BlockState[] = Array.from({ length: total }, (_, i) => ({
      id: i, isYellow: false, fadeStart: 0, order: 0,
    }));
    set({
      status:          'countdown',
      diffIdx,
      subStageIdx,
      roundInSubStage: 0,
      score:           0,
      lives:           MAX_LIVES,
      blocks:          grayBlocks,
      yellowCount:     0,
      tappedSet:       new Set(),
      wrongTapped:     new Set(),
      roundKey:        Date.now(),
      tutorialShown:   false,
      shakeTrigger:    0,
      nextTapOrder:    1,
    });
  },

  startRound: () => {
    const { diffIdx, subStageIdx } = get();
    const { gridSize, subStages } = DIFFICULTY_LEVELS[diffIdx];
    const { yellowCount } = subStages[subStageIdx];
    set({
      status:        'showing',
      blocks:        buildBlocks(gridSize, yellowCount),
      yellowCount,
      tappedSet:     new Set(),
      wrongTapped:   new Set(),
      roundKey:      Date.now(),
      shakeTrigger:  0,
      nextTapOrder:  1,
      roundTimeLeft: ROUND_TIME_MS,
    });
  },

  beginFade: () => {
    set(s => ({
      status: 'input',
      // fadeStart: 1 → elapsed ≈ 수십년 → remaining=0 → 즉시 회색으로 전환
      // 이미 탭한 블럭(tappedSet)은 유지 → 숫자 계속 표시
      blocks: s.blocks.map(b =>
        b.isYellow && !s.tappedSet.has(b.id) ? { ...b, fadeStart: 1 } : b
      ),
    }));
  },

  // 도전 버튼 누름: showing → input (블럭 숨김)
  challenge: () => {
    const { status } = get();
    if (status !== 'showing') return;
    set(s => ({
      status: 'input',
      blocks: s.blocks.map(b =>
        b.isYellow && !s.tappedSet.has(b.id) ? { ...b, fadeStart: 1 } : b
      ),
    }));
  },

  setTimeLeft: (ms: number) => set({ roundTimeLeft: ms }),

  // 시간 초과: input 상태에서 타이머 0 → 오답 처리
  timeOut: () => {
    const { status, lives } = get();
    if (status !== 'input') return;
    set(s => ({
      status:       'wrong_pause',
      lives:        Math.max(lives - 1, 0),
      shakeTrigger: Date.now(),
      blocks:       s.blocks.map(b =>
        b.isYellow && !s.tappedSet.has(b.id) ? { ...b, fadeStart: 1 } : b
      ),
    }));
  },

  tapBlock: (id: number) => {
    // showing 상태에서 타일 탭 → 자동 도전 전환
    if (get().status === 'showing') get().challenge();

    const {
      status, blocks, tappedSet, wrongTapped,
      lives, score, diffIdx, subStageIdx, roundInSubStage,
      yellowCount, nextTapOrder, roundTimeLeft,
    } = get();

    if (status !== 'input') return;

    const block = blocks[id];
    if (!block) return;
    if (tappedSet.has(id) || wrongTapped.has(id)) return;

    const isFirstTap = tappedSet.size === 0 && wrongTapped.size === 0;

    // ─── 오답 처리 헬퍼 ─────────────────────────────────
    const handleWrong = (newBlocks: BlockState[]) => {
      const newWrong = new Set(wrongTapped);
      newWrong.add(id);
      set({
        status:       'wrong_pause',
        lives:        lives - 1,
        wrongTapped:  newWrong,
        blocks:       newBlocks,
        shakeTrigger: Date.now(),
      });
    };

    const fadedOtherBlocks = (targetId: number) =>
      isFirstTap
        ? blocks.map(b => b.isYellow && b.id !== targetId ? { ...b, fadeStart: 1 } : b)
        : blocks;

    // ─── 노란 블럭 탭 ───────────────────────────────────
    if (block.isYellow) {
      // 순서가 틀리면 오답
      if (block.order !== nextTapOrder) {
        handleWrong(
          isFirstTap
            ? blocks.map(b => b.isYellow ? { ...b, fadeStart: 1 } : b)
            : blocks
        );
        return;
      }

      // 정답 & 순서 맞음
      const newTapped = new Set(tappedSet);
      newTapped.add(id);
      const newNextTapOrder = nextTapOrder + 1;
      const newBlocks = fadedOtherBlocks(id);

      if (newTapped.size >= yellowCount) {
        // ── 라운드 성공: 진행 계산 ──────────────────────
        const level    = DIFFICULTY_LEVELS[diffIdx];
        const subStage = level.subStages[subStageIdx];
        const newRound = roundInSubStage + 1;

        let nDiffIdx    = diffIdx;
        let nSubStage   = subStageIdx;
        let nRoundInSub = newRound;

        if (newRound >= subStage.repetitions) {
          nRoundInSub = 0;
          nSubStage   = subStageIdx + 1;

          if (nSubStage >= level.subStages.length) {
            nSubStage = 0;
            nDiffIdx  = Math.min(diffIdx + 1, DIFFICULTY_LEVELS.length - 1);
            // 마지막 레벨이면 마지막 서브스테이지 유지
            if (nDiffIdx === diffIdx) {
              nSubStage = level.subStages.length - 1;
            }
          }
        }

        const timeBonus = Math.ceil(roundTimeLeft / 1000) * TIME_BONUS_PER_SEC;
        const newScore = score + yellowCount * 10 + timeBonus;

        // 눌렀던 블럭들 노란색으로 복구
        const restoredBlocks = blocks.map(b =>
          b.isYellow ? { ...b, fadeStart: 0 } : b
        );
        set({
          status:          'result',
          score:           newScore,
          diffIdx:         nDiffIdx,
          subStageIdx:     nSubStage,
          roundInSubStage: nRoundInSub,
          lives:           Math.min(lives + 1, MAX_LIVES),
          blocks:          restoredBlocks,
          tappedSet:       new Set(),
          wrongTapped:     new Set(),
          nextTapOrder:    1,
          tutorialShown:   true,
        });
      } else {
        set({ status: 'input', blocks: newBlocks, tappedSet: newTapped, nextTapOrder: newNextTapOrder });
      }

    // ─── 회색 블럭 탭 (오답) ────────────────────────────
    } else {
      handleWrong(
        isFirstTap
          ? blocks.map(b => b.isYellow ? { ...b, fadeStart: 1 } : b)
          : blocks
      );
    }
  },

  nextRound: () => {
    const { blocks } = get();
    const allYellow = blocks.map(b => ({ ...b, isYellow: true, fadeStart: 0 }));
    set({ status: 'transition', blocks: allYellow, tappedSet: new Set(), wrongTapped: new Set() });
  },

  beginTransitionFade: () => {
    const now = Date.now();
    set(s => ({
      blocks: s.blocks.map(b => ({ ...b, fadeStart: now })),
    }));
  },

  prepareGrid: () => {
    const { diffIdx } = get();
    const { gridSize } = DIFFICULTY_LEVELS[diffIdx];
    const total = gridSize * gridSize;
    const grayBlocks: BlockState[] = Array.from({ length: total }, (_, i) => ({
      id: i, isYellow: false, fadeStart: 0, order: 0,
    }));
    set({
      status:       'pre_showing',
      blocks:       grayBlocks,
      tappedSet:    new Set(),
      wrongTapped:  new Set(),
      roundKey:     Date.now(),
      shakeTrigger: 0,
    });
  },

  setGameOver: () => set({ status: 'over' }),

  goHome: () => {
    set({
      status:          'idle',
      diffIdx:         0,
      subStageIdx:     0,
      roundInSubStage: 0,
      score:           0,
      lives:           MAX_LIVES,
      blocks:          [],
      tappedSet:       new Set(),
      wrongTapped:     new Set(),
      shakeTrigger:    0,
      nextTapOrder:    1,
    });
  },
}));
