import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { COLORS } from '../constants/theme';
import { COMBO_MULTIPLIERS } from '../constants/game';

function getComboMultiplier(combo: number): number {
  const idx = Math.min(combo, COMBO_MULTIPLIERS.length - 1);
  return COMBO_MULTIPLIERS[idx];
}

export default function HUD() {
  const score     = useGameStore(s => s.score);
  const bestScore = useGameStore(s => s.bestScore);
  const combo     = useGameStore(s => s.combo);
  const level     = useGameStore(s => s.level);

  // 레벨업 플래시
  const prevLevel   = useRef(level);
  const levelScale  = useSharedValue(1);

  useEffect(() => {
    if (level > prevLevel.current) {
      levelScale.value = withSequence(
        withTiming(1.4, { duration: 120 }),
        withTiming(1.0, { duration: 200 }),
      );
    }
    prevLevel.current = level;
  }, [level]);

  const levelAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: levelScale.value }],
  }));

  const multiplier = getComboMultiplier(combo);

  return (
    <View style={styles.container}>
      {/* 점수 줄 */}
      <View style={styles.row}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>BEST</Text>
          <Text style={styles.scoreValue}>{bestScore.toLocaleString()}</Text>
        </View>
      </View>

      {/* 콤보 & 레벨 줄 */}
      <View style={[styles.row, { marginTop: 6 }]}>
        {combo >= 2 ? (
          <Animated.View
            entering={FadeIn.duration(120)}
            exiting={FadeOut.duration(120)}
            style={styles.comboBox}
          >
            <Text style={styles.comboText}>
              {combo} COMBO  ×{multiplier.toFixed(1)}
            </Text>
          </Animated.View>
        ) : (
          <View style={styles.comboBoxPlaceholder} />
        )}

        <Animated.View style={levelAnimStyle}>
          <Text style={styles.levelText}>LV {level}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 4,
  },
  row: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  scoreBox: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize:      10,
    fontWeight:    '600',
    color:         COLORS.subText,
    letterSpacing: 1.2,
  },
  scoreValue: {
    fontSize:   22,
    fontWeight: '800',
    color:      COLORS.scoreText,
  },
  comboBox: {
    backgroundColor: 'rgba(233,69,96,0.2)',
    paddingHorizontal: 10,
    paddingVertical:    3,
    borderRadius:       8,
    borderWidth:        1,
    borderColor:        COLORS.comboText,
  },
  comboBoxPlaceholder: {
    height: 26,
  },
  comboText: {
    fontSize:   13,
    fontWeight: '800',
    color:      COLORS.comboText,
    letterSpacing: 0.5,
  },
  levelText: {
    fontSize:   18,
    fontWeight: '900',
    color:      COLORS.levelText,
    letterSpacing: 1,
  },
});
