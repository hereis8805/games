// Store
export { useGameStore } from './store/gameStore';
export type { Status } from './store/gameStore';

// Logic
export { initBoard, slideBoard, addRandomTile, hasWon, isGameOver } from './logic/board';
export type { Board, Direction } from './logic/board';

// Constants
export { COLORS, BOARD_PADDING, TILE_GAP } from './constants/theme';

// Hooks
export { useKeyboard } from './hooks/useKeyboard';

// Components
export { default as Board }         from './components/Board';
export { default as Tile }          from './components/Tile';
export { default as DirectionPad }  from './components/DirectionPad';
export { default as ScoreBar }      from './components/ScoreBar';
export { default as NicknameModal } from './components/NicknameModal';
export { default as Leaderboard }   from './components/Leaderboard';
export { default as GameOverModal } from './components/GameOverModal';
export { default as WinModal }      from './components/WinModal';
export { default as HomeScreen }    from './components/HomeScreen';

// Config
export { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';
