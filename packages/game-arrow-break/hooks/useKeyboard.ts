import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Direction } from '../logic/blocks';

const KEY_MAP: Record<string, Direction> = {
  ArrowLeft:  'left',
  ArrowRight: 'right',
  ArrowUp:    'up',
  ArrowDown:  'down',
};

export function useKeyboard(onInput: (dir: Direction) => void) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handler = (e: KeyboardEvent) => {
      const dir = KEY_MAP[e.key];
      if (dir) {
        e.preventDefault();
        onInput(dir);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onInput]);
}
