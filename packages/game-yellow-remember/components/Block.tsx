import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import { BlockState } from '../store/gameStore';
import { COLOR_GRAY, COLOR_YELLOW, FADE_DURATION_MS } from '../constants/game';
import { useGameStore } from '../store/gameStore';

interface Props {
  block:     BlockState;
  size:      number;
  diffIdx:   number;
  isWrong:   boolean;
  isTapped:  boolean;
}

export default function Block({ block, size, diffIdx, isWrong, isTapped }: Props) {
  const tapBlock   = useGameStore(s => s.tapBlock);
  const status     = useGameStore(s => s.status);

  // 0 = gray, 1 = yellow
  const colorProgress = useSharedValue(block.isYellow ? 1 : 0);
  const scale         = useSharedValue(1);
  const wrongOpacity  = useSharedValue(0);

  const fadeDuration = FADE_DURATION_MS[Math.min(diffIdx, FADE_DURATION_MS.length - 1)];

  // 노란 블럭 페이드 아웃
  useEffect(() => {
    if (block.fadeStart > 0 && block.isYellow) {
      // fadeStart 기준으로 남은 시간 계산
      const elapsed  = Date.now() - block.fadeStart;
      const remaining = Math.max(fadeDuration - elapsed, 0);
      colorProgress.value = withTiming(0, { duration: remaining });
    } else if (block.isYellow) {
      colorProgress.value = 1;
    } else {
      colorProgress.value = withTiming(0, { duration: 200 });
    }
  }, [block.isYellow, block.fadeStart]);

  // 오답 피드백
  useEffect(() => {
    if (isWrong) {
      wrongOpacity.value = withTiming(1, { duration: 100 });
      scale.value = withTiming(0.88, { duration: 100 });
    }
  }, [isWrong]);

  // 정답 탭 피드백
  useEffect(() => {
    if (isTapped) {
      scale.value = withTiming(0.88, { duration: 80 });
    }
  }, [isTapped]);

  const animStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(
      colorProgress.value,
      [0, 1],
      [COLOR_GRAY, COLOR_YELLOW],
    );
    return {
      backgroundColor: bg,
      transform:       [{ scale: scale.value }],
    };
  });

  const wrongStyle = useAnimatedStyle(() => ({
    opacity: wrongOpacity.value,
  }));

  const disabled = status !== 'input' || isTapped || isWrong;

  return (
    <TouchableOpacity
      onPress={() => tapBlock(block.id)}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Animated.View style={[styles.block, { width: size, height: size, borderRadius: size * 0.18 }, animStyle]}>
        {/* 오답 빨간 오버레이 */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.wrongOverlay, { borderRadius: size * 0.18 }, wrongStyle]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  block: {
    overflow: 'hidden',
  },
  wrongOverlay: {
    backgroundColor: '#e94560',
  },
});
