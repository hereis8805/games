import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface Props {
  score: number;
  onRestart: () => void;
  onLeaderboard: () => void;
  onHome: () => void;
}

export default function GameOverModal({ score, onRestart, onLeaderboard, onHome }: Props) {
  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <Text style={styles.title}>Game Over</Text>
        <Text style={styles.scoreLabel}>최종 점수</Text>
        <Text style={styles.score}>{score.toLocaleString()}</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={onRestart}>
          <Text style={styles.primaryText}>다시하기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={onLeaderboard}>
          <Text style={styles.secondaryText}>🏆 글로벌 랭킹</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghostBtn} onPress={onHome}>
          <Text style={styles.ghostText}>홈으로</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 32,
    width: 300,
    alignItems: 'center',
    gap: 12,
  },
  title:        { fontSize: 28, fontWeight: '900', color: COLORS.text },
  scoreLabel:   { fontSize: 13, color: COLORS.subText, marginTop: 4 },
  score:        { fontSize: 42, fontWeight: '900', color: '#f65e3b', marginBottom: 8 },
  primaryBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f65e3b',
    alignItems: 'center',
  },
  primaryText:  { color: '#fff', fontWeight: '800', fontSize: 16 },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: COLORS.button,
    alignItems: 'center',
  },
  secondaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  ghostBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.board,
    alignItems: 'center',
  },
  ghostText:    { color: COLORS.subText, fontWeight: '700', fontSize: 15 },
});
