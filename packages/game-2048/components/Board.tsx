import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, useWindowDimensions, Platform } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { COLORS, BOARD_PADDING, TILE_GAP } from '../constants/theme';
import Tile from './Tile';
import { Board as BoardType, Direction } from '../logic/board';

interface BoardProps {
  board: BoardType;
  onSwipe: (dir: Direction) => void;
}

const SIZE = 4;
const MIN_SWIPE = 20;

export default function Board({ board, onSwipe }: BoardProps) {
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - 32, 420);
  const tileSize  = (boardSize - BOARD_PADDING * 2 - TILE_GAP * (SIZE - 1)) / SIZE;

  // ── 네이티브: react-native-gesture-handler Pan ─────────────────────────
  const pan = Gesture.Pan()
    .runOnJS(true)
    .onEnd(e => {
      const { translationX: dx, translationY: dy } = e;
      if (Math.abs(dx) < MIN_SWIPE && Math.abs(dy) < MIN_SWIPE) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        onSwipe(dx > 0 ? 'right' : 'left');
      } else {
        onSwipe(dy > 0 ? 'down' : 'up');
      }
    });

  // ── 웹: DOM 터치 이벤트 (passive:false → preventDefault 가능) ──────────
  const webBoardRef = useRef<View>(null);
  const touchStart  = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // nativeID로 DOM 엘리먼트 획득
    const el = document.getElementById('board-2048');
    if (!el) return;

    const onStart = (e: Event) => {
      const te = e as TouchEvent;
      e.preventDefault();
      touchStart.current = { x: te.touches[0].clientX, y: te.touches[0].clientY };
    };
    const onMove = (e: Event) => {
      e.preventDefault(); // 주소창·스크롤 차단
    };
    const onEnd = (e: Event) => {
      const te = e as TouchEvent;
      e.preventDefault();
      if (!touchStart.current) return;
      const dx = te.changedTouches[0].clientX - touchStart.current.x;
      const dy = te.changedTouches[0].clientY - touchStart.current.y;
      touchStart.current = null;
      if (Math.abs(dx) < MIN_SWIPE && Math.abs(dy) < MIN_SWIPE) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        onSwipe(dx > 0 ? 'right' : 'left');
      } else {
        onSwipe(dy > 0 ? 'down' : 'up');
      }
    };

    el.addEventListener('touchstart', onStart, { passive: false });
    el.addEventListener('touchmove',  onMove,  { passive: false });
    el.addEventListener('touchend',   onEnd,   { passive: false });

    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove',  onMove);
      el.removeEventListener('touchend',   onEnd);
    };
  }, [onSwipe]);

  const emptyGrid = Array.from({ length: SIZE }, (_, r) =>
    Array.from({ length: SIZE }, (__, c) => (
      <View
        key={`empty-${r}-${c}`}
        style={[
          styles.emptyTile,
          {
            width:        tileSize,
            height:       tileSize,
            borderRadius: tileSize * 0.07,
            top:  BOARD_PADDING + r * (tileSize + TILE_GAP),
            left: BOARD_PADDING + c * (tileSize + TILE_GAP),
          },
        ]}
      />
    ))
  );

  const tiles = board.flatMap((row, r) =>
    row.map((value, c) => (
      <Tile key={`${r}-${c}`} value={value} row={r} col={c} tileSize={tileSize} />
    ))
  );

  const boardContent = (
    <View
      nativeID="board-2048"
      ref={webBoardRef}
      style={[
        styles.board,
        { width: boardSize, height: boardSize, borderRadius: boardSize * 0.03 },
      ]}
    >
      {emptyGrid}
      {tiles}
    </View>
  );

  // 웹: boardContent에 이미 DOM 리스너를 붙임
  if (Platform.OS === 'web') return boardContent;

  // 네이티브: GestureDetector로 감싸기
  return <GestureDetector gesture={pan}>{boardContent}</GestureDetector>;
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: COLORS.board,
    position: 'relative',
  },
  emptyTile: {
    position: 'absolute',
    backgroundColor: COLORS.emptyTile,
  },
});
