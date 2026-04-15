import React from 'react';
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
// 스와이프 감도: 값이 작을수록 민감 (가볍게 스와이프해도 반응)
//              값이 클수록 둔감 (길게 밀어야 반응)
const MIN_SWIPE = 20;

export default function Board({ board, onSwipe }: BoardProps) {
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - 32, 420);
  const tileSize = (boardSize - BOARD_PADDING * 2 - TILE_GAP * (SIZE - 1)) / SIZE;

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

  const emptyGrid = Array.from({ length: SIZE }, (_, r) =>
    Array.from({ length: SIZE }, (__, c) => (
      <View
        key={`empty-${r}-${c}`}
        style={[
          styles.emptyTile,
          {
            width: tileSize,
            height: tileSize,
            borderRadius: tileSize * 0.07,
            top: BOARD_PADDING + r * (tileSize + TILE_GAP),
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
      style={[
        styles.board,
        { width: boardSize, height: boardSize, borderRadius: boardSize * 0.03 },
      ]}
    >
      {emptyGrid}
      {tiles}
    </View>
  );

  if (Platform.OS === 'web') return boardContent;

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
