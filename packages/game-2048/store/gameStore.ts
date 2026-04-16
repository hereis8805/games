import { create } from 'zustand';
import { Platform } from 'react-native';
import { Board, Direction, addRandomTile, initBoard, isGameOver, hasWon, slideBoard } from '../logic/board';

// idle: 게임 시작 전 (허브에서 사용)
// playing: 게임 중
// won: 2048 달성 (standalone에서 WinModal 표시, 허브에서는 무시 가능)
// over: 게임 종료
export type Status = 'idle' | 'playing' | 'won' | 'over';

const BEST_KEY = '2048-best';

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

async function loadBestNative(): Promise<number> {
  try {
    const AS = require('@react-native-async-storage/async-storage').default;
    const val = await AS.getItem(BEST_KEY);
    return parseInt(val ?? '0', 10) || 0;
  } catch { return 0; }
}

interface GameState {
  board:     Board;
  score:     number;
  bestScore: number;
  status:    Status;

  startGame:       () => void;
  move:            (dir: Direction) => void;
  continueAfterWin: () => void;
  // goHome: idle 상태로 리셋 (허브 - 허브 메인으로 복귀 / standalone - 홈화면으로)
  goHome:          () => void;
  _initBest:       () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  board:     initBoard(),
  score:     0,
  bestScore: loadBest(),
  status:    'idle',

  _initBest: async () => {
    if (Platform.OS !== 'web') {
      const best = await loadBestNative();
      if (best > get().bestScore) set({ bestScore: best });
    }
  },

  startGame: () => {
    set({ board: initBoard(), score: 0, status: 'playing' });
  },

  move: (dir: Direction) => {
    const { board, score, bestScore, status } = get();
    if (status === 'over') return;

    const [newBoard, gained, changed] = slideBoard(board, dir);
    if (!changed) return;

    const withTile = addRandomTile(newBoard);
    const newScore = score + gained;
    const newBest  = Math.max(bestScore, newScore);

    if (newBest > bestScore) saveBest(newBest);

    let newStatus: Status = 'playing';
    if (status !== 'won' && hasWon(withTile)) newStatus = 'won';
    else if (isGameOver(withTile))             newStatus = 'over';

    set({ board: withTile, score: newScore, bestScore: newBest, status: newStatus });
  },

  continueAfterWin: () => set({ status: 'playing' }),

  goHome: () => set({ status: 'idle', score: 0, board: initBoard() }),
}));
