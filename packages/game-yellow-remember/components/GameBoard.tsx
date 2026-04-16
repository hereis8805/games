import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { DIFFICULTY_LEVELS, BOARD_MAX_WIDTH, BLOCK_GAP } from '../constants/game';
import Block from './Block';

export default function GameBoard() {
  const blocks     = useGameStore(s => s.blocks);
  const diffIdx    = useGameStore(s => s.diffIdx);
  const tappedSet  = useGameStore(s => s.tappedSet);
  const wrongTapped= useGameStore(s => s.wrongTapped);
  const { width }  = useWindowDimensions();

  const { gridSize } = DIFFICULTY_LEVELS[diffIdx];
  const boardWidth   = Math.min(width - 48, BOARD_MAX_WIDTH);
  const blockSize    = Math.floor((boardWidth - BLOCK_GAP * (gridSize - 1)) / gridSize);

  const rows = [];
  for (let r = 0; r < gridSize; r++) {
    const row = [];
    for (let c = 0; c < gridSize; c++) {
      const idx   = r * gridSize + c;
      const block = blocks[idx];
      if (!block) continue;
      row.push(
        <Block
          key={block.id}
          block={block}
          size={blockSize}
          diffIdx={diffIdx}
          isWrong={wrongTapped.has(idx)}
          isTapped={tappedSet.has(idx)}
        />
      );
    }
    rows.push(
      <View key={r} style={[styles.row, { gap: BLOCK_GAP }]}>
        {row}
      </View>
    );
  }

  return (
    <View style={[styles.board, { gap: BLOCK_GAP, width: boardWidth }]}>
      {rows}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
