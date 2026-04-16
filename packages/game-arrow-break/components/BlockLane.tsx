import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  FadeIn,
  ZoomOut,
  LinearTransition,
} from 'react-native-reanimated';
import { BlockItem } from '../logic/blocks';
import { useGameStore } from '../store/gameStore';
import { COLORS, BLOCK_GAP } from '../constants/theme';
import ArrowBlock from './ArrowBlock';

interface Props {
  queue: BlockItem[];
}

export default function BlockLane({ queue }: Props) {
  const actionSeq  = useGameStore(s => s.actionSeq);
  const lastAction = useGameStore(s => s.lastAction);

  const shakeX     = useSharedValue(0);
  const bgOpacity  = useSharedValue(0);

  // 오답 시 흔들림 + 배경 플래시
  useEffect(() => {
    if (lastAction === 'wrong') {
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10,  { duration: 50 }),
        withTiming(-7,  { duration: 40 }),
        withTiming(7,   { duration: 40 }),
        withTiming(0,   { duration: 30 }),
      );
      bgOpacity.value = withSequence(
        withTiming(1, { duration: 60 }),
        withTiming(0, { duration: 300 }),
      );
    }
  }, [actionSeq]);

  const laneStyle  = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  return (
    <Animated.View style={[styles.lane, laneStyle]}>
      {/* 오답 플래시 오버레이 */}
      <Animated.View style={[styles.flash, flashStyle]} pointerEvents="none" />

      {queue.map((item, index) => {
        const isTarget = index === queue.length - 1;
        return (
          <Animated.View
            key={item.id}
            entering={FadeIn.duration(150)}
            exiting={ZoomOut.duration(220)}
            layout={LinearTransition.duration(160)}
            style={[
              styles.blockWrapper,
              isTarget && styles.targetWrapper,
            ]}
          >
            <ArrowBlock item={item} isTarget={isTarget} />
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  lane: {
    alignItems:      'center',
    gap:             BLOCK_GAP,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: COLORS.lane,
    borderRadius:    20,
    overflow:        'hidden',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#e94560',
    borderRadius:    20,
    zIndex:          1,
  },
  blockWrapper: {
    zIndex: 2,
  },
  targetWrapper: {
    // 타겟 구분 여백
    marginTop: 4,
  },
});
