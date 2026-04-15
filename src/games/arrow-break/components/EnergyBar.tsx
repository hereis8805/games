import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { COLORS, MAX_VISIBLE } from '../constants/theme';
import { MAX_ENERGY } from '../constants/game';

export default function EnergyBar() {
  const energy = useGameStore(s => s.energy);
  const level  = useGameStore(s => s.level);

  const progress = useSharedValue(energy / MAX_ENERGY);

  useEffect(() => {
    progress.value = withTiming(energy / MAX_ENERGY, { duration: 150 });
  }, [energy]);

  const barStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      progress.value,
      [0, 0.3, 0.6, 1.0],
      [
        COLORS.energyLow,
        COLORS.energyLow,
        COLORS.energyMid,
        COLORS.energyHigh,
      ]
    );
    return {
      width:           `${progress.value * 100}%`,
      backgroundColor: color,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>ENERGY</Text>
        <Text style={styles.levelText}>Lv.{level}</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.bar, barStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width:      '100%',
    paddingHorizontal: 4,
  },
  labelRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   4,
  },
  label: {
    fontSize:   11,
    fontWeight: '700',
    color:      COLORS.subText,
    letterSpacing: 1.5,
  },
  levelText: {
    fontSize:   12,
    fontWeight: '800',
    color:      COLORS.levelText,
  },
  track: {
    height:          14,
    backgroundColor: COLORS.energyBg,
    borderRadius:    7,
    overflow:        'hidden',
  },
  bar: {
    height:       '100%',
    borderRadius: 7,
  },
});
