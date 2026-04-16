// Store
export { useGameStore } from './store/gameStore';
export type { GameStatus, LastAction } from './store/gameStore';

// Logic
export { initQueue, judgeInput, popAndPush, DIRECTION_LABEL } from './logic/blocks';
export type { BlockItem, Direction } from './logic/blocks';

// Constants
export { COLORS } from './constants/theme';
export {
  QUEUE_SIZE, MAX_ENERGY, ENERGY_DECAY_BASE,
  ENERGY_GAIN_BASE, ENERGY_GAIN_COMBO, ENERGY_GAIN_CAP,
  ENERGY_WRONG, COMBO_MULTIPLIERS, SCORE_BASE,
} from './constants/game';

// Hooks
export { useKeyboard } from './hooks/useKeyboard';

// Components
export { default as ArrowBlock }    from './components/ArrowBlock';
export { default as BlockLane }     from './components/BlockLane';
export { default as ComboPopup }    from './components/ComboPopup';
export { default as DirectionPad }  from './components/DirectionPad';
export { default as EnergyBar }     from './components/EnergyBar';
export { default as HUD }           from './components/HUD';
export { default as GameOverlay }   from './components/GameOverlay';
export { default as Leaderboard }   from './components/Leaderboard';
export { default as NicknameModal } from './components/NicknameModal';

// Config
export { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';
