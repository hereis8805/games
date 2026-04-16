import React, { useEffect } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import { BlockState } from '../store/gameStore';
import { COLOR_GRAY, COLOR_YELLOW, DIFFICULTY_LEVELS, TRANSITION_FADE_MS } from '../constants/game';
import { useGameStore } from '../store/gameStore';

interface Props {
  block:    BlockState;
  size:     number;
  diffIdx:  number;
  isWrong:  boolean;
  isTapped: boolean;
}

export default function Block({ block, size, diffIdx, isWrong, isTapped }: Props) {
  const tapBlock     = useGameStore(s => s.tapBlock);
  const status       = useGameStore(s => s.status);
  const shakeTrigger = useGameStore(s => s.shakeTrigger);

  const colorProgress = useSharedValue(block.isYellow ? 1 : 0);
  const wrongOpacity  = useSharedValue(0);
  const shakeX        = useSharedValue(0);

  const fadeDuration = status === 'transition'
    ? TRANSITION_FADE_MS
    : DIFFICULTY_LEVELS[Math.min(diffIdx, DIFFICULTY_LEVELS.length - 1)].fadeDurationMs;

  // 색상 전환
  useEffect(() => {
    if (isTapped) {
      colorProgress.value = 1;
    } else if (block.fadeStart > 0 && block.isYellow) {
      const elapsed   = Date.now() - block.fadeStart;
      const remaining = Math.max(fadeDuration - elapsed, 0);
      colorProgress.value = withTiming(0, { duration: remaining });
    } else if (block.isYellow) {
      colorProgress.value = 1;
    } else {
      colorProgress.value = withTiming(0, { duration: 200 });
    }
  }, [block.isYellow, block.fadeStart, isTapped]);

  // 오답 피드백
  useEffect(() => {
    if (isWrong) {
      wrongOpacity.value = withTiming(1, { duration: 80 });
    }
  }, [isWrong]);

  // 전체 진동
  useEffect(() => {
    if (shakeTrigger === 0) return;
    shakeX.value = withSequence(
      withTiming(-8, { duration: 55 }),
      withTiming( 8, { duration: 55 }),
      withTiming(-6, { duration: 55 }),
      withTiming( 6, { duration: 55 }),
      withTiming(-3, { duration: 55 }),
      withTiming( 0, { duration: 55 }),
    );
  }, [shakeTrigger]);

  const animStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(colorProgress.value, [0, 1], [COLOR_GRAY, COLOR_YELLOW]);
    return { backgroundColor: bg, transform: [{ translateX: shakeX.value }] };
  });

  const wrongStyle = useAnimatedStyle(() => ({
    opacity: wrongOpacity.value,
  }));

  // 순서 숫자 표시 조건:
  // - 노란 블럭 (block.isYellow)
  // - 페이드 전(fadeStart === 0) 이거나 이미 정답 탭한 블럭(isTapped)
  // - 전환 애니메이션 중 아님
  const showOrder =
    block.order > 0 &&
    block.isYellow &&
    (block.fadeStart === 0 || isTapped) &&
    status !== 'transition' &&
    status !== 'pre_showing';

  const disabled =
    status === 'countdown'   ||
    status === 'result'      ||
    status === 'transition'  ||
    status === 'pre_showing' ||
    status === 'wrong_pause' ||
    status === 'over'        ||
    status === 'idle'        ||
    isTapped                 ||
    isWrong;

  return (
    <TouchableOpacity onPress={() => tapBlock(block.id)} disabled={disabled} activeOpacity={1}>
      <Animated.View style={[styles.block, { width: size, height: size, borderRadius: size * 0.18 }, animStyle]}>
        {/* 오답 빨간 오버레이 */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.wrongOverlay, { borderRadius: size * 0.18 }, wrongStyle]} />

        {/* 순서 숫자 */}
        {showOrder && (
          <Text style={[styles.orderNum, { fontSize: size * 0.38 }]}>
            {block.order}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  block: {
    overflow:       'hidden',
    alignItems:     'center',
    justifyContent: 'center',
  },
  wrongOverlay: {
    backgroundColor: '#e94560',
  },
  orderNum: {
    fontWeight: '900',
    color:      '#1a1a2e',
  },
});
