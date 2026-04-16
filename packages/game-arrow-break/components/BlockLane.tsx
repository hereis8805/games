import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
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

// 타겟 블록 제거: 살짝 부풀었다가 사라짐 (정답 느낌)
const TargetPopOut = new Keyframe({
  0:   { opacity: 1, transform: [{ scale: 1    }] },
  25:  { opacity: 1, transform: [{ scale: 1.18 }] },
  100: { opacity: 0, transform: [{ scale: 0.4  }] },
}).duration(220);

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

  const queueBlocks = queue.slice(0, -1);
  const targetBlock = queue[queue.length - 1];

  return (
    <Animated.View style={[styles.lane, laneStyle]}>
      {/* 오답 플래시 오버레이 */}
      <Animated.View style={[styles.flash, flashStyle]} pointerEvents="none" />

      {/* 대기 블록들 */}
      {queueBlocks.map(item => (
        <Animated.View
          key={item.id}
          entering={BlockEnter}
          exiting={QueueFadeOut}
          layout={BlockShift}
          style={styles.blockWrapper}
        >
          <ArrowBlock item={item} isTarget={false} />
        </Animated.View>
      ))}

      {/* 타겟 구분 여백 */}
      <View style={styles.dividerGap} />

      {/* 타겟 블록 */}
      {targetBlock && (
        <Animated.View
          key={targetBlock.id}
          entering={BlockEnter}
          exiting={TargetPopOut}
          layout={BlockShift}
          style={styles.targetWrapper}
        >
          <ArrowBlock item={targetBlock} isTarget={true} />
          <Text style={styles.downHint}>▼</Text>
        </Animated.View>
      )}
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
  dividerGap: {
    height: 6,
    zIndex: 2,
  },
  targetWrapper: {
    alignItems: 'center',
    gap:        4,
    zIndex:     2,
  },
  downHint: {
    fontSize:   12,
    color:      'rgba(233,69,96,0.6)',
    lineHeight: 14,
  },
});
