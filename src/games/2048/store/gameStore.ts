import { create } from 'zustand';
import { Platform } from 'react-native';
import { Board, Direction, addRandomTile, initBoard, isGameOver, hasWon, slideBoard } from '../logic/board';

type Status = 'idle' | 'playing' | 'won' | 'over';

const BEST_KEY = '2048-best';

// 플랫폼별 스토리지 (import.meta 없음)
function loadBest(): number {
  if (Platform.OS === 'web') {
    try { return parseInt(localStorage.getItem(BEST_KEY) ?? '0', 10) || 0; }
    catch { return 0; }
  }
  return 0; // 네이티브는 앱 마운트 시 비동기 로딩
}

function saveBest(score: number) {
  if (Platform.OS === 'web') {
    try { localStorage.setItem(BEST_KEY, String(score)); } catch {}
  } else {
    // 네이티브: require로 번들링 분리 (import.meta 에러 없음)
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
  board: Board;
  score: number;
  bestScore: number;
  status: Status;
  startGame: () => void;
  move: (dir: Direction) => void;
  continueAfterWin: () => void;
  _initBest: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  board: initBoard(),
  score: 0,
  bestScore: loadBest(),
  status: 'idle',

  // 네이티브 앱 마운트 시 한 번만 호출
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
    if (status === 'idle' || status === 'over') return;

    const [newBoard, gained, changed] = slideBoard(board, dir);
    if (!changed) return;

    const withTile = addRandomTile(newBoard);
    const newScore = score + gained;
    const newBest = Math.max(bestScore, newScore);

    if (newBest > bestScore) saveBest(newBest);

    let newStatus: Status = 'playing';
    if (status !== 'won' && hasWon(withTile)) newStatus = 'won';
    else if (isGameOver(withTile)) newStatus = 'over';

    set({ board: withTile, score: newScore, bestScore: newBest, status: newStatus });
  },

  continueAfterWin: () => set({ status: 'playing' }),
}));
