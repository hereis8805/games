import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/theme';

interface Props {
  score: number;
  onContinue: () => void;
  onRestart: () => void;
  onLeaderboard: () => void;
}

export default function WinModal({ score, onContinue, onRestart, onLeaderboard }: Props) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.trophy}>🎉</Text>
        <Text style={styles.title}>2048 달성!</Text>
        <Text style={styles.sub}>대단해요! 계속해서 더 높은 점수에 도전하세요.</Text>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>현재 점수</Text>
          <Text style={styles.score}>{score.toLocaleString()}</Text>
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={onContinue} activeOpacity={0.85}>
          <Text style={styles.continueBtnText}>계속 하기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rankBtn} onPress={onLeaderboard} activeOpacity={0.85}>
          <Text style={styles.rankBtnText}>🏆 랭킹 등록</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.restartBtn} onPress={onRestart} activeOpacity={0.85}>
          <Text style={styles.restartBtnText}>새 게임</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 32,
    width: 300,
    alignItems: 'center',
    gap: 12,
  },
  trophy:   { fontSize: 52 },
  title:    { fontSize: 30, fontWeight: '900', color: '#edc22e' },
  sub:      { fontSize: 13, color: COLORS.subText, textAlign: 'center', lineHeight: 18 },
  scoreBox: {
    backgroundColor: COLORS.scoreBox,
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 10,
    alignItems: 'center',
    marginVertical: 4,
  },
  scoreLabel: { fontSize: 11, fontWeight: '700', color: COLORS.scoreText, letterSpacing: 1 },
  score:      { fontSize: 34, fontWeight: '900', color: COLORS.scoreText },
  continueBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: '#edc22e',
    alignItems: 'center',
  },
  continueBtnText: { color: '#fff', fontWeight: '900', fontSize: 17 },
  rankBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: COLORS.button,
    alignItems: 'center',
  },
  rankBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  restartBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.board,
    alignItems: 'center',
  },
  restartBtnText: { color: COLORS.subText, fontWeight: '700', fontSize: 15 },
});
