import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { COLORS } from '../constants/theme';

export default function ComboPopup() {
  const combo      = useGameStore(s => s.combo);
  const actionSeq  = useGameStore(s => s.actionSeq);
  const lastAction = useGameStore(s => s.lastAction);

  const [displayCombo, setDisplayCombo] = useState(combo);

  const opacity    = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale      = useSharedValue(0.8);

  useEffect(() => {
    if (lastAction === 'correct' && combo >= 2) {
      setDisplayCombo(combo);
      opacity.value    = 0;
      translateY.value = 0;
      scale.value      = 0.8;

      opacity.value = withSequence(
        withTiming(1,   { duration: 100 }),
        withTiming(1,   { duration: 400 }),
        withTiming(0,   { duration: 300 }),
      );
      translateY.value = withTiming(-50, { duration: 800, easing: Easing.out(Easing.quad) });
      scale.value      = withSequence(
        withTiming(1.15, { duration: 120, easing: Easing.out(Easing.back(2)) }),
        withTiming(1.0,  { duration: 80 }),
      );
    }
  }, [actionSeq]);

  const animStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale:      scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.popup, animStyle]} pointerEvents="none">
      <Animated.Text style={styles.text}>
        {displayCombo}× COMBO!
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  popup: {
    position:   'absolute',
    alignSelf:  'center',
    zIndex:     99,
  },
  text: {
    fontSize:      28,
    fontWeight:    '900',
    color:         COLORS.comboText,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
});
