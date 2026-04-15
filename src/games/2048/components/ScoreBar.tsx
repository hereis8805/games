import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

interface ScoreBarProps {
  score: number;
  bestScore: number;
  onNewGame: () => void;
  onLeaderboard: () => void;
  onBack?: () => void;
}

export default function ScoreBar({ score, bestScore, onNewGame, onLeaderboard, onBack }: ScoreBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.titleLeft}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>2048</Text>
        </View>
        <View style={styles.scores}>
          <ScoreBox label="SCORE" value={score} />
          <ScoreBox label="BEST" value={bestScore} />
        </View>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.rankBtn} onPress={onLeaderboard}>
          <Text style={styles.rankText}>🏆 랭킹.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onNewGame}>
          <Text style={styles.buttonText}>New Game</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ScoreBox({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.scoreBox}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scoreValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { width: '100%', paddingHorizontal: 16, marginBottom: 12 },
  titleRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleLeft:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn:    { padding: 4 },
  backText:   { fontSize: 22, color: COLORS.subText, fontWeight: '700' },
  title:      { fontSize: 52, fontWeight: '900', color: COLORS.text },
  scores:     { flexDirection: 'row', gap: 8 },
  scoreBox: {
    backgroundColor: COLORS.scoreBox,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 70,
  },
  scoreLabel: { fontSize: 11, fontWeight: '700', color: COLORS.scoreText, letterSpacing: 1 },
  scoreValue: { fontSize: 20, fontWeight: '800', color: COLORS.scoreText },
  actionRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  rankBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.board,
  },
  rankText:   { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  button: {
    backgroundColor: COLORS.button,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: { color: COLORS.buttonText, fontWeight: '700', fontSize: 14 },
});
