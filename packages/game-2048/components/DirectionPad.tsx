import React, { useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Direction } from '../logic/board';
import { COLORS } from '../constants/theme';

interface DirectionPadProps {
  activeDir: Direction | null;
  onPress: (dir: Direction) => void;
}

const ARROWS: { dir: Direction; label: string }[] = [
  { dir: 'up',    label: '▲' },
  { dir: 'left',  label: '◀' },
  { dir: 'down',  label: '▼' },
  { dir: 'right', label: '▶' },
];

function ArrowButton({
  dir,
  label,
  isActive,
  onPress,
}: {
  dir: Direction;
  label: string;
  isActive: boolean;
  onPress: (dir: Direction) => void;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    if (isActive) {
      scale.value = withSequence(
        withTiming(0.78, { duration: 80 }),
        withTiming(1.0,  { duration: 120 })
      );
      opacity.value = withSequence(
        withTiming(1.0,  { duration: 60 }),
        withTiming(0.45, { duration: 300 })
      );
    }
  }, [isActive]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        style={[styles.btn, isActive && styles.btnActive]}
        onPress={() => onPress(dir)}
        activeOpacity={0.7}
      >
        <Text style={[styles.arrow, isActive && styles.arrowActive]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function DirectionPad({ activeDir, onPress }: DirectionPadProps) {
  return (
    <View style={styles.pad}>
      {/* 위 */}
      <View style={styles.row}>
        <ArrowButton dir="up"    label="▲" isActive={activeDir === 'up'}    onPress={onPress} />
      </View>
      {/* 좌 / 아래 / 우 */}
      <View style={styles.row}>
        <ArrowButton dir="left"  label="◀" isActive={activeDir === 'left'}  onPress={onPress} />
        <ArrowButton dir="down"  label="▼" isActive={activeDir === 'down'}  onPress={onPress} />
        <ArrowButton dir="right" label="▶" isActive={activeDir === 'right'} onPress={onPress} />
      </View>
    </View>
  );
}

const BTN = 52;

const styles = StyleSheet.create({
  pad: {
    marginTop: 24,
    alignItems: 'center',
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  btn: {
    width: BTN,
    height: BTN,
    borderRadius: 10,
    backgroundColor: COLORS.board,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActive: {
    backgroundColor: COLORS.button,
  },
  arrow: {
    fontSize: 22,
    color: COLORS.scoreText,
  },
  arrowActive: {
    color: '#fff',
  },
});
