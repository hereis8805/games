import React, { useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Direction, DIRECTION_LABEL } from '../logic/blocks';
import { COLORS } from '../constants/theme';

interface DirectionPadProps {
  activeDir: Direction | null;
  onPress:   (dir: Direction) => void;
}

function ArrowButton({
  dir, isActive, onPress,
}: {
  dir:      Direction;
  isActive: boolean;
  onPress:  (dir: Direction) => void;
}) {
  const scale   = useSharedValue(1);
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    if (isActive) {
      scale.value = withSequence(
        withTiming(0.80, { duration: 80 }),
        withTiming(1.0,  { duration: 120 }),
      );
      opacity.value = withSequence(
        withTiming(1.0,  { duration: 60 }),
        withTiming(0.55, { duration: 320 }),
      );
    }
  }, [isActive]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity:   opacity.value,
  }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        style={[styles.btn, isActive && styles.btnActive]}
        onPressIn={() => onPress(dir)}
        activeOpacity={0.6}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.arrow, isActive && styles.arrowActive]}>
          {DIRECTION_LABEL[dir]}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function DirectionPad({ activeDir, onPress }: DirectionPadProps) {
  return (
    <View style={styles.pad}>
      <View style={styles.row}>
        <ArrowButton dir="up"    isActive={activeDir === 'up'}    onPress={onPress} />
      </View>
      <View style={styles.row}>
        <ArrowButton dir="left"  isActive={activeDir === 'left'}  onPress={onPress} />
        <ArrowButton dir="down"  isActive={activeDir === 'down'}  onPress={onPress} />
        <ArrowButton dir="right" isActive={activeDir === 'right'} onPress={onPress} />
      </View>
    </View>
  );
}

const BTN = 68;

const styles = StyleSheet.create({
  pad: {
    alignItems: 'center',
    gap:        8,
  },
  row: {
    flexDirection: 'row',
    gap:           8,
  },
  btn: {
    width:           BTN,
    height:          BTN,
    borderRadius:    14,
    backgroundColor: COLORS.button,
    alignItems:      'center',
    justifyContent:  'center',
  },
  btnActive: {
    backgroundColor: COLORS.buttonActive,
  },
  arrow: {
    fontSize:   26,
    color:      COLORS.buttonText,
    opacity:    0.7,
  },
  arrowActive: {
    opacity: 1,
  },
});
