import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { BlockItem, DIRECTION_LABEL } from '../logic/blocks';
import { COLORS, BLOCK_SIZE } from '../constants/theme';

interface Props {
  item:     BlockItem;
  isTarget: boolean;
}

export default function ArrowBlock({ item, isTarget }: Props) {
  const scale = useSharedValue(0);

  // 등장 팝인 애니메이션
  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.18, { duration: 110, easing: Easing.out(Easing.back(2)) }),
      withTiming(1.0,  { duration: 80 })
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const colors = isTarget ? COLORS.blockTarget[item.dir] : COLORS.block[item.dir];
  const fontSize = isTarget ? 30 : 24;

  return (
    <Animated.View
      style={[
        styles.block,
        { backgroundColor: colors.bg },
        isTarget && styles.targetBlock,
        animStyle,
      ]}
    >
      <Text style={[styles.arrow, { color: colors.text, fontSize }]}>
        {DIRECTION_LABEL[item.dir]}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  block: {
    width:           BLOCK_SIZE,
    height:          BLOCK_SIZE,
    borderRadius:    12,
    alignItems:      'center',
    justifyContent:  'center',
  },
  targetBlock: {
    borderRadius: 14,
    shadowColor:  '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius:  6,
    elevation:     8,
  },
  arrow: {
    fontWeight: '800',
  },
});
