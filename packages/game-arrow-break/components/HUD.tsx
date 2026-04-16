import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
  Easing,
} from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { COLORS } from '../constants/theme';
import { COMBO_MULTIPLIERS, COMBO_WINDOW_MS } from '../constants/game';

function getComboMultiplier(combo: number): number {
  const idx = Math.min(combo, COMBO_MULTIPLIERS.length - 1);
  return COMBO_MULTIPLIERS[idx];
}

// 0.5초 콤보 타이머 바
function ComboTimer() {
  const lastBlockTime = useGameStore(s => s.lastBlockTime);
  const status        = useGameStore(s => s.status);
  const progress      = useSharedValue(1);

  useEffect(() => {
    if (status !== 'playing' || lastBlockTime === 0) return;
    progress.value = 1;
    progress.value = withTiming(0, {
      duration: COMBO_WINDOW_MS,
      easing:   Easing.linear,
    });
  }, [lastBlockTime, status]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as any,
    backgroundColor: progress.value > 0.4 ? COLORS.energyHigh : COLORS.energyLow,
  }));

  if (status !== 'playing') return null;

  return (
    <View style={styles.timerTrack}>
      <Animated.View style={[styles.timerBar, barStyle]} />
    </View>
  );
}

export default function HUD() {
  const score     = useGameStore(s => s.score);
  const bestScore = useGameStore(s => s.bestScore);
  const combo     = useGameStore(s => s.combo);
  const level     = useGameStore(s => s.level);

  const prevLevel  = useRef(level);
  const levelScale = useSharedValue(1);

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
        <View style={styles.comboArea}>
          {combo >= 2 ? (
            <Animated.View
              entering={FadeIn.duration(120)}
              exiting={FadeOut.duration(120)}
              style={styles.comboBox}
            >
              <Text style={styles.comboText} numberOfLines={1}>
                {combo} COMBO  ×{multiplier.toFixed(1)}
              </Text>
            </Animated.View>
          ) : (
            <View style={styles.comboBoxPlaceholder} />
          )}
        </View>

        <Animated.View style={levelAnimStyle}>
          <Text style={styles.levelText}>LV {level}</Text>
        </Animated.View>
      </View>

      {/* 0.5초 콤보 타이머 바 */}
      <ComboTimer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width:            '100%',
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

  // 콤보 영역: flex:1 로 레벨 텍스트와 겹치지 않게
  comboArea: {
    flex:        1,
    marginRight: 8,
  },
  comboBox: {
    alignSelf:         'flex-start',
    backgroundColor:   'rgba(233,69,96,0.2)',
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
    fontSize:      13,
    fontWeight:    '800',
    color:         COLORS.comboText,
    letterSpacing: 0.5,
  },
  levelText: {
    fontSize:      18,
    fontWeight:    '900',
    color:         COLORS.levelText,
    letterSpacing: 1,
  },

  // 콤보 타이머 바
  timerTrack: {
    width:           '100%',
    height:           3,
    backgroundColor:  COLORS.energyBg,
    borderRadius:     2,
    marginTop:        6,
    overflow:         'hidden',
  },
  timerBar: {
    height:       3,
    borderRadius: 2,
  },
});
