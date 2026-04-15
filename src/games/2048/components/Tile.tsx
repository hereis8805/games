import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { COLORS, TILE_GAP, BOARD_PADDING } from '../constants/theme';

interface TileProps {
  value: number;
  row: number;
  col: number;
  tileSize: number;
}

export default function Tile({ value, row, col, tileSize }: TileProps) {
  const scale = useSharedValue(value === 0 ? 0 : 1);
  const prevValue = React.useRef(value);

  const pos = (index: number) => BOARD_PADDING + index * (tileSize + TILE_GAP);

  useEffect(() => {
    if (value !== 0 && prevValue.current === 0) {
      // 새로 생긴 타일: 팝인 효과
      scale.value = 0;
      scale.value = withSequence(
        withTiming(1.15, { duration: 120, easing: Easing.out(Easing.back(2)) }),
        withTiming(1.0, { duration: 80 })
      );
    } else if (value !== 0 && value !== prevValue.current) {
      // 병합된 타일: 펄스 효과
      scale.value = withSequence(
        withTiming(1.2, { duration: 80 }),
        withTiming(1.0, { duration: 80 })
      );
    }
    prevValue.current = value;
  }, [value]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (value === 0) return null;

  const colors = COLORS.tile[value] ?? COLORS.tileDefault;
  const fontSize = value >= 1000 ? tileSize * 0.28 : value >= 100 ? tileSize * 0.34 : tileSize * 0.42;

  return (
    <Animated.View
      style={[
        styles.tile,
        animStyle,
        {
          width: tileSize,
          height: tileSize,
          borderRadius: tileSize * 0.07,
          top: pos(row),
          left: pos(col),
          backgroundColor: colors.bg,
        },
      ]}
    >
      <Text style={[styles.text, { color: colors.text, fontSize }]}>{value}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '800',
  },
});
