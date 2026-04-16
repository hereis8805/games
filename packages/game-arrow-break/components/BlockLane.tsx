import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
  LinearTransition,
  Keyframe,
} from 'react-native-reanimated';
import { BlockItem } from '../logic/blocks';
import { useGameStore } from '../store/gameStore';
import { COLORS, BLOCK_GAP } from '../constants/theme';
import ArrowBlock from './ArrowBlock';

interface Props {
  queue: BlockItem[];
}

// 타겟 블록 제거: 제자리에서 빠르게 사라짐 (위로 올라가는 느낌 없음)
const TargetPopOut = new Keyframe({
  0:   { opacity: 1, transform: [{ scale: 1   }] },
  100: { opacity: 0, transform: [{ scale: 0.5 }] },
}).duration(160);

// 대기 블록 제거 (일반)
const QueueFadeOut = FadeOut.duration(120);

// 새 블록 등장: 위에서 자연스럽게 나타남
const BlockEnter = FadeIn.duration(200).delay(80);

// 블록 위치 이동: 스프링 감각
const BlockShift = LinearTransition.springify().damping(18).stiffness(200);

export default function BlockLane({ queue }: Props) {
  const actionSeq  = useGameStore(s => s.actionSeq);
  const lastAction = useGameStore(s => s.lastAction);

  const shakeX    = useSharedValue(0);
  const bgOpacity = useSharedValue(0);

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

  const laneStyle  = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));

  return (
    <Animated.View style={[styles.lane, laneStyle]}>
      {/* 오답 플래시 오버레이 */}
      <Animated.View style={[styles.flash, flashStyle]} pointerEvents="none" />

      {/* 모든 블록을 하나의 리스트로 → layout 애니메이션이 연속 적용되어 자연스럽게 이동 */}
      {queue.map((item, index) => {
        const isTarget = index === queue.length - 1;
        return (
          <Animated.View
            key={item.id}
            entering={BlockEnter}
            exiting={isTarget ? TargetPopOut : QueueFadeOut}
            layout={BlockShift}
            style={isTarget ? styles.targetWrapper : styles.blockWrapper}
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
    alignItems:        'center',
    gap:               BLOCK_GAP,
    paddingTop:        16,
    paddingBottom:     12,
    paddingHorizontal: 24,
    backgroundColor:   COLORS.lane,
    borderRadius:      20,
    overflow:          'hidden',
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
    alignItems: 'center',
    marginTop:  6,   // 타겟 위 구분 여백
    zIndex:     2,
  },
});
