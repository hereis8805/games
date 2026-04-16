import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
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

  const queueBlocks  = queue.slice(0, -1); // 위에 쌓이는 대기 블록
  const targetBlock  = queue[queue.length - 1]; // 맨 아래 타겟

  return (
    <Animated.View style={[styles.lane, laneStyle]}>
      {/* 오답 플래시 오버레이 */}
      <Animated.View style={[styles.flash, flashStyle]} pointerEvents="none" />

      {/* 대기 블록들 */}
      {queueBlocks.map(item => (
        <Animated.View
          key={item.id}
          entering={FadeIn.duration(150)}
          exiting={ZoomOut.duration(220)}
          layout={LinearTransition.duration(160)}
          style={styles.blockWrapper}
        >
          <ArrowBlock item={item} isTarget={false} />
        </Animated.View>
      ))}

      {/* ── 타겟 구분선 ── */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>지금 이 방향!</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* 타겟 블록 */}
      {targetBlock && (
        <Animated.View
          key={targetBlock.id}
          entering={FadeIn.duration(150)}
          exiting={ZoomOut.duration(220)}
          layout={LinearTransition.duration(160)}
          style={styles.targetWrapper}
        >
          <ArrowBlock item={targetBlock} isTarget={true} />
          {/* 아래 방향 힌트 화살표 */}
          <Text style={styles.downHint}>▼</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  lane: {
    alignItems:       'center',
    gap:              BLOCK_GAP,
    paddingTop:       16,
    paddingBottom:    12,
    paddingHorizontal: 24,
    backgroundColor:  COLORS.lane,
    borderRadius:     20,
    overflow:         'hidden',
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

  // 구분선
  divider: {
    flexDirection: 'row',
    alignItems:    'center',
    width:         '100%',
    gap:           8,
    marginVertical: 4,
    zIndex:        2,
  },
  dividerLine: {
    flex:            1,
    height:          1,
    backgroundColor: 'rgba(233,69,96,0.5)',
  },
  dividerText: {
    fontSize:      11,
    fontWeight:    '700',
    color:         '#e94560',
    letterSpacing: 0.5,
  },

  // 타겟 블록 영역
  targetWrapper: {
    alignItems: 'center',
    gap:        4,
    zIndex:     2,
  },
  downHint: {
    fontSize:  12,
    color:     'rgba(233,69,96,0.6)',
    lineHeight: 14,
  },
});
