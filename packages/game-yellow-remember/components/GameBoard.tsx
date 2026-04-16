import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { BOARD_MAX_WIDTH, BLOCK_GAP } from '../constants/game';
import Block from './Block';

export default function GameBoard() {
  const blocks     = useGameStore(s => s.blocks);
  const diffIdx    = useGameStore(s => s.diffIdx);
  const tappedSet  = useGameStore(s => s.tappedSet);
  const wrongTapped = useGameStore(s => s.wrongTapped);
  const roundKey   = useGameStore(s => s.roundKey);
  const { width }  = useWindowDimensions();

  // blocks.length 기준으로 gridSize 계산
  // diffIdx 기준으로 계산하면 diffIdx 업데이트 직후 blocks가 아직 이전 크기일 때
  // 열 수가 맞지 않아 레이아웃이 깨지는 현상이 생긴다
  const gridSize   = blocks.length > 0 ? Math.round(Math.sqrt(blocks.length)) : 3;
  const boardWidth = Math.min(width - 48, BOARD_MAX_WIDTH);
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
          key={`${roundKey}-${block.id}`}
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
