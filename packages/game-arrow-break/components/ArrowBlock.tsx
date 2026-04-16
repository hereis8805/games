import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { BlockItem, DIRECTION_LABEL } from '../logic/blocks';
import { COLORS, BLOCK_SIZE } from '../constants/theme';

interface Props {
  item:     BlockItem;
  isTarget: boolean;
}

export default function ArrowBlock({ item, isTarget }: Props) {
  const scale       = useSharedValue(0);
  const pulseScale  = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  // 등장 팝인
  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.18, { duration: 110, easing: Easing.out(Easing.back(2)) }),
      withTiming(1.0,  { duration: 80 })
    );
  }, []);

  // 타겟일 때 펄스 + 글로우
  useEffect(() => {
    if (!isTarget) return;
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 550, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.00, { duration: 550, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1,   { duration: 550 }),
        withTiming(0.3, { duration: 550 }),
      ),
      -1,
      false,
    );
  }, [isTarget]);

  const popStyle  = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));
  const blockStyle = useAnimatedStyle(() => ({
    transform: [{ scale: isTarget ? pulseScale.value : 1 }],
  }));

  const colors   = isTarget ? COLORS.blockTarget[item.dir] : COLORS.block[item.dir];
  const fontSize = isTarget ? 32 : 22;

  return (
    <Animated.View style={popStyle}>
      <View style={styles.wrapper}>
        {/* 글로우 링 */}
        {isTarget && (
          <Animated.View
            style={[
              styles.glowRing,
              { borderColor: colors.bg },
              ringStyle,
            ]}
          />
        )}

        {/* 블록 본체 */}
        <Animated.View
          style={[
            styles.block,
            { backgroundColor: colors.bg },
            isTarget && styles.targetBlock,
            blockStyle,
          ]}
        >
          <Text style={[styles.arrow, { color: colors.text, fontSize }]}>
            {DIRECTION_LABEL[item.dir]}
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems:     'center',
    justifyContent: 'center',
  },
  glowRing: {
    position:     'absolute',
    width:        BLOCK_SIZE + 16,
    height:       BLOCK_SIZE + 16,
    borderRadius: 22,
    borderWidth:  3,
  },
  block: {
    width:          BLOCK_SIZE,
    height:         BLOCK_SIZE,
    borderRadius:   12,
    alignItems:     'center',
    justifyContent: 'center',
  },
  targetBlock: {
    borderRadius:   14,
    shadowColor:    '#fff',
    shadowOffset:   { width: 0, height: 0 },
    shadowOpacity:  0.3,
    shadowRadius:   10,
    elevation:      12,
  },
  arrow: {
    fontWeight: '900',
  },
});
