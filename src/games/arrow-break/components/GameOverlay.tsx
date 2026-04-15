import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  FadeIn,
  Easing,
} from 'react-native-reanimated';
import { useGameStore, GameStatus } from '../store/gameStore';
import { COLORS } from '../constants/theme';

// ── 카운트다운 ────────────────────────────────────────────────────────────
function CountdownOverlay() {
  const countdown = useGameStore(s => s.countdown);
  const scale     = useSharedValue(1.6);
  const opacity   = useSharedValue(1);

  useEffect(() => {
    scale.value   = 1.6;
    opacity.value = 1;
    scale.value   = withTiming(0.9, { duration: 700, easing: Easing.out(Easing.quad) });
    opacity.value = withSequence(
      withTiming(1,   { duration: 400 }),
      withTiming(0.2, { duration: 300 }),
    );
  }, [countdown]);

  const numStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity:   opacity.value,
  }));

  const label = countdown > 0 ? String(countdown) : 'GO!';
  const color = countdown > 0 ? COLORS.levelText : COLORS.energyHigh;

  return (
    <View style={styles.overlay}>
      <Animated.Text style={[styles.countdownNum, { color }, numStyle]}>
        {label}
      </Animated.Text>
      <Text style={styles.readyText}>Ready?</Text>
    </View>
  );
}

// ── 게임 오버 ─────────────────────────────────────────────────────────────
function GameOverOverlay({
  onRestart,
  onRegister,
  onLeaderboard,
}: {
  onRestart:     () => void;
  onRegister:    () => void;
  onLeaderboard: () => void;
}) {
  const score     = useGameStore(s => s.score);
  const bestScore = useGameStore(s => s.bestScore);
  const level     = useGameStore(s => s.level);
  const isNewBest = score >= bestScore && score > 0;

  const cardScale = useSharedValue(0.7);

  useEffect(() => {
    cardScale.value = withSpring(1, { damping: 12, stiffness: 120 });
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Text style={styles.overTitle}>GAME OVER</Text>

        {isNewBest && (
          <Animated.Text entering={FadeIn.duration(600).delay(300)} style={styles.newBest}>
            NEW BEST!
          </Animated.Text>
        )}

        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>SCORE</Text>
            <Text style={styles.statValue}>{score.toLocaleString()}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>BEST</Text>
            <Text style={styles.statValue}>{bestScore.toLocaleString()}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>LEVEL</Text>
            <Text style={styles.statValue}>{level}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.registerBtn} onPress={onRegister} activeOpacity={0.8}>
            <Text style={styles.registerText}>점수 등록</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rankBtn} onPress={onLeaderboard} activeOpacity={0.8}>
            <Text style={styles.rankText}>랭킹</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.restartBtn} onPress={onRestart} activeOpacity={0.8}>
          <Text style={styles.restartText}>RESTART</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── 메인 오버레이 ─────────────────────────────────────────────────────────
interface Props {
  onRestart:     () => void;
  onRegister:    () => void;
  onLeaderboard: () => void;
}

export default function GameOverlay({ onRestart, onRegister, onLeaderboard }: Props) {
  const status = useGameStore(s => s.status);

  if (status === 'countdown') return <CountdownOverlay />;
  if (status === 'over') {
    return (
      <GameOverOverlay
        onRestart={onRestart}
        onRegister={onRegister}
        onLeaderboard={onLeaderboard}
      />
    );
  }
  return null;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    alignItems:      'center',
    justifyContent:  'center',
    zIndex:          100,
  },

  // 카운트다운
  countdownNum: {
    fontSize:   100,
    fontWeight: '900',
    textShadowColor:  'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  readyText: {
    marginTop:  16,
    fontSize:   18,
    color:      COLORS.subText,
    fontWeight: '600',
    letterSpacing: 2,
  },

  // 게임 오버 카드
  card: {
    width:            300,
    backgroundColor:  COLORS.lane,
    borderRadius:     24,
    padding:          28,
    alignItems:       'center',
  },
  overTitle: {
    fontSize:      32,
    fontWeight:    '900',
    color:         COLORS.comboText,
    letterSpacing: 2,
    marginBottom:  8,
  },
  newBest: {
    fontSize:         14,
    fontWeight:       '800',
    color:            COLORS.levelText,
    letterSpacing:    1.5,
    marginBottom:     12,
    backgroundColor:  'rgba(255,215,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical:    3,
    borderRadius:       6,
  },
  statRow: {
    flexDirection:  'row',
    gap:            16,
    marginVertical: 16,
  },
  stat: {
    alignItems: 'center',
    minWidth:   70,
  },
  statLabel: {
    fontSize:      10,
    fontWeight:    '600',
    color:         COLORS.subText,
    letterSpacing: 1,
    marginBottom:  2,
  },
  statValue: {
    fontSize:   20,
    fontWeight: '800',
    color:      COLORS.scoreText,
  },
  actionRow: {
    flexDirection: 'row',
    gap:           10,
    width:         '100%',
    marginTop:     8,
  },
  registerBtn: {
    flex:             2,
    backgroundColor:  COLORS.button,
    paddingVertical:  11,
    borderRadius:     12,
    alignItems:       'center',
  },
  registerText: {
    fontSize:   14,
    fontWeight: '700',
    color:      '#fff',
  },
  rankBtn: {
    flex:             1,
    borderWidth:      1,
    borderColor:      COLORS.subText,
    paddingVertical:  11,
    borderRadius:     12,
    alignItems:       'center',
  },
  rankText: {
    fontSize:   14,
    fontWeight: '700',
    color:      COLORS.subText,
  },
  restartBtn: {
    marginTop:         8,
    width:             '100%',
    backgroundColor:   COLORS.buttonActive,
    paddingVertical:   13,
    borderRadius:      14,
    alignItems:        'center',
  },
  restartText: {
    fontSize:      16,
    fontWeight:    '800',
    color:         '#fff',
    letterSpacing: 2,
  },
});
