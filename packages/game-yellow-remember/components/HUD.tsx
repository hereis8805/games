import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { DIFFICULTY_LEVELS, MAX_LIVES, ROUND_TIME_MS } from '../constants/game';

export default function HUD() {
  const lives           = useGameStore(s => s.lives);
  const score           = useGameStore(s => s.score);
  const diffIdx         = useGameStore(s => s.diffIdx);
  const subStageIdx     = useGameStore(s => s.subStageIdx);
  const roundInSubStage = useGameStore(s => s.roundInSubStage);
  const yellowCount     = useGameStore(s => s.yellowCount);
  const status          = useGameStore(s => s.status);
  const roundTimeLeft   = useGameStore(s => s.roundTimeLeft);

  const level    = DIFFICULTY_LEVELS[diffIdx];
  const subStage = level.subStages[subStageIdx];

  const showTimer = status === 'showing' || status === 'input';
  const timeSec   = roundTimeLeft / 1000;
  const timeColor = timeSec <= 2 ? '#e94560' : timeSec <= 3 ? '#ff9f43' : '#ffe066';

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
          <Text style={styles.badgeLabel}>SCORE</Text>
          <Text style={styles.badgeValue}>{score}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>TARGETS</Text>
          <Text style={styles.badgeValue}>{yellowCount}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>ROUND</Text>
          <Text style={styles.badgeValue}>
            {roundInSubStage + 1}/{subStage.repetitions}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>TIME</Text>
          <Text style={[styles.badgeValue, showTimer ? { color: timeColor } : styles.badgeValueDim]}>
            {showTimer ? timeSec.toFixed(1) : '–'}
          </Text>
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
    fontSize:   18,
    fontWeight: '800',
    color:      '#ffe066',
  },
  badgeValueDim: {
    color: '#333348',
  },
});
