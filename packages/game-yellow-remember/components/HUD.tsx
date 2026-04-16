import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { DIFFICULTY_LEVELS, MAX_LIVES } from '../constants/game';

export default function HUD() {
  const lives   = useGameStore(s => s.lives);
  const score   = useGameStore(s => s.score);
  const diffIdx = useGameStore(s => s.diffIdx);
  const { gridSize } = DIFFICULTY_LEVELS[diffIdx];

  const hearts = Array.from({ length: MAX_LIVES }, (_, i) => (
    <Text key={i} style={[styles.heart, i < lives ? styles.heartFull : styles.heartEmpty]}>
      ♥
    </Text>
  ));

  return (
    <View style={styles.container}>
      <View style={styles.livesRow}>{hearts}</View>
      <View style={styles.infoRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>GRID</Text>
          <Text style={styles.badgeValue}>{gridSize}×{gridSize}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>SCORE</Text>
          <Text style={styles.badgeValue}>{score}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width:             '100%',
    paddingHorizontal: 8,
    gap:               8,
  },
  livesRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    gap:            6,
  },
  heart: {
    fontSize: 28,
  },
  heartFull: {
    color: '#e94560',
  },
  heartEmpty: {
    color: '#333348',
  },
  infoRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  badge: {
    alignItems: 'center',
  },
  badgeLabel: {
    fontSize:      10,
    fontWeight:    '700',
    color:         '#94a3b8',
    letterSpacing: 1.2,
  },
  badgeValue: {
    fontSize:   20,
    fontWeight: '800',
    color:      '#ffe066',
  },
});
