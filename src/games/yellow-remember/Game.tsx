import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useGameStore, GameBoard, HUD, NicknameModal, Leaderboard,
  DIFFICULTY_LEVELS, ROUND_TIME_MS,
} from '@game/yellow-remember';

const COLORS = {
  bg:        '#0f0e17',
  card:      '#1a1a2e',
  yellow:    '#ffe066',
  text:      '#e2e8f0',
  sub:       '#94a3b8',
  button:    '#533483',
  challenge: '#05c46b',
};

const RESTORE_DURATION_MS     = 700;
const TRANSITION_HOLD_MS      = 150;
const TRANSITION_FADE_MS      = 350;
const PRE_SHOWING_DURATION_MS = 180;
const TIMER_INTERVAL_MS       = 100;

export default function YellowRememberGame() {
  const rawInsets = useSafeAreaInsets();
  const insets    = Platform.OS === 'web'
    ? { top: 0, bottom: 0 }
    : rawInsets;

  const status        = useGameStore(s => s.status);
  const diffIdx       = useGameStore(s => s.diffIdx);
  const score         = useGameStore(s => s.score);
  const roundKey      = useGameStore(s => s.roundKey);
  const lives         = useGameStore(s => s.lives);
  const roundTimeLeft = useGameStore(s => s.roundTimeLeft);

  const startGame           = useGameStore(s => s.startGame);
  const nextRound           = useGameStore(s => s.nextRound);
  const beginTransitionFade = useGameStore(s => s.beginTransitionFade);
  const prepareGrid         = useGameStore(s => s.prepareGrid);
  const startRound          = useGameStore(s => s.startRound);
  const setGameOver         = useGameStore(s => s.setGameOver);
  const goHome              = useGameStore(s => s.goHome);
  const challenge           = useGameStore(s => s.challenge);
  const setTimeLeft         = useGameStore(s => s.setTimeLeft);
  const timeOut             = useGameStore(s => s.timeOut);

  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timer2Ref   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const barProgress = useSharedValue(1);
  const barColor    = useSharedValue(0);

  const [countNum, setCountNum] = useState<number | null>(null);
  const [overlay,     setOverlay]     = useState<'none' | 'gameover' | 'leaderboard'>('none');
  const [submittedId, setSubmittedId] = useState<string | undefined>();

  // 게임 오버 → 모달 리셋
  useEffect(() => {
    if (status === 'over') {
      setOverlay('none');
      setSubmittedId(undefined);
    }
  }, [status]);

  // 카운트다운
  useEffect(() => {
    if (status !== 'countdown') { setCountNum(null); return; }
    setCountNum(3);
    const t1 = setTimeout(() => setCountNum(2),  600);
    const t2 = setTimeout(() => setCountNum(1), 1200);
    const t3 = setTimeout(() => setCountNum(0), 1800);
    const t4 = setTimeout(() => startRound(),   2300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [status, roundKey]);

  // 상태별 타이머
  useEffect(() => {
    if (timerRef.current)  clearTimeout(timerRef.current);
    if (timer2Ref.current) clearTimeout(timer2Ref.current);

    if (status === 'result') {
      timerRef.current = setTimeout(nextRound, RESTORE_DURATION_MS);
    } else if (status === 'wrong_pause') {
      timerRef.current = setTimeout(() => {
        if (lives <= 0) setGameOver();
        else nextRound();
      }, 700);
    } else if (status === 'transition') {
      timerRef.current = setTimeout(() => {
        beginTransitionFade();
        timer2Ref.current = setTimeout(prepareGrid, TRANSITION_FADE_MS + 50);
      }, TRANSITION_HOLD_MS);
    } else if (status === 'pre_showing') {
      timerRef.current = setTimeout(startRound, PRE_SHOWING_DURATION_MS);
    }
    return () => {
      if (timerRef.current)  clearTimeout(timerRef.current);
      if (timer2Ref.current) clearTimeout(timer2Ref.current);
    };
  }, [status, roundKey]);

  // 타임바 진행률 동기화
  useEffect(() => {
    const ratio = roundTimeLeft / ROUND_TIME_MS;
    barProgress.value = withTiming(ratio, { duration: 120, easing: Easing.linear });
    const targetColor = ratio > 0.6 ? 0 : ratio > 0.4 ? 0.5 : 1;
    barColor.value = withTiming(targetColor, { duration: 120 });
  }, [roundTimeLeft]);

  // 새 라운드 시 타임바 리셋
  useEffect(() => {
    if (status === 'showing') {
      barProgress.value = 1;
      barColor.value    = 0;
    }
  }, [roundKey]);

  // 라운드 타이머 interval
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (status === 'showing' || status === 'input') {
      intervalRef.current = setInterval(() => {
        const store   = useGameStore.getState();
        const current = store.roundTimeLeft;
        const next    = current - TIMER_INTERVAL_MS;
        if (next <= 0) {
          store.setTimeLeft(0);
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          const s = useGameStore.getState().status;
          if (s === 'showing') store.challenge();
          else if (s === 'input') store.timeOut();
        } else {
          store.setTimeLeft(next);
        }
      }, TIMER_INTERVAL_MS);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, roundKey]);

  const { gridSize } = DIFFICULTY_LEVELS[diffIdx];
  const gridLabel    = `${gridSize}×${gridSize}`;
  const showTimer    = status === 'showing' || status === 'input';

  const timeBarAnimStyle = useAnimatedStyle(() => {
    const t = barColor.value;
    const r = t <= 0.5 ? Math.round(5   + t * 2 * 250)               : Math.round(255 - (t - 0.5) * 2 * 22);
    const g = t <= 0.5 ? Math.round(198 - t * 2 * 39)                : Math.round(159 - (t - 0.5) * 2 * 90);
    const b = t <= 0.5 ? Math.round(107 - t * 2 * 40)                : Math.round(67  - (t - 0.5) * 2 * 67);
    return {
      width:           `${barProgress.value * 100}%` as any,
      backgroundColor: `rgb(${r},${g},${b})`,
    };
  });

  /* ─── 홈 화면 ─── */
  if (status === 'idle') {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.centerContent}>
          <Text style={styles.emoji}>💛</Text>
          <Text style={styles.titleLarge}>Yellow Remember</Text>
          <Text style={styles.subtitle}>번호 순서를 기억하고{'\n'}도전 버튼을 눌러 입력하세요!</Text>

          <View style={styles.rulesCard}>
            <Text style={styles.ruleItem}>• 노란 블럭의 번호 순서를 기억하세요</Text>
            <Text style={styles.ruleItem}>• 도전! 버튼 또는 타일을 바로 탭해도 시작</Text>
            <Text style={styles.ruleItem}>• 10초 안에 도전하면 시간 보너스 점수 획득</Text>
            <Text style={styles.ruleItem}>• 틀리면 ♥ -1, 3번 틀리면 게임 오버</Text>
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={startGame} activeOpacity={0.85}>
            <Text style={styles.startText}>게임 시작</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setOverlay('leaderboard')}>
            <Text style={styles.rankLink}>🏆 글로벌 랭킹 보기</Text>
          </TouchableOpacity>
        </View>

        {overlay === 'leaderboard' && (
          <Leaderboard onClose={() => setOverlay('none')} />
        )}
      </View>
    );
  }

  /* ─── 게임 오버 ─── */
  if (status === 'over') {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.centerContent}>
          <Text style={styles.emoji}>💔</Text>
          <Text style={styles.titleLarge}>게임 오버</Text>
          <Text style={styles.scoreDisplay}>{score}점</Text>
          <Text style={styles.subtitle}>{gridLabel} 그리드까지 도달했습니다</Text>

          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.button }]} onPress={startGame} activeOpacity={0.85}>
              <Text style={styles.btnText}>다시 하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#333348' }]} onPress={() => { goHome(); router.back(); }} activeOpacity={0.85}>
              <Text style={styles.btnText}>홈으로</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => setOverlay('leaderboard')}>
            <Text style={styles.rankLink}>🏆 글로벌 랭킹 보기</Text>
          </TouchableOpacity>
        </View>

        {overlay === 'none' && score > 0 && (
          <NicknameModal
            score={score}
            maxGrid={gridSize}
            onSubmitted={(id) => { setSubmittedId(id); setOverlay('leaderboard'); }}
            onSkip={() => setOverlay('gameover')}
          />
        )}

        {overlay === 'leaderboard' && (
          <Leaderboard
            highlightId={submittedId}
            onClose={() => setOverlay('gameover')}
          />
        )}
      </View>
    );
  }

  /* ─── 플레이 화면 (countdown 포함) ─── */
  return (
    <View style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => { goHome(); router.back(); }}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <View style={styles.hudWrap}>
        <HUD />
      </View>

      <View style={styles.statusWrap}>
        {status === 'result' ? (
          <Text style={styles.statusTextResult}>✓ Nice!</Text>
        ) : status === 'showing' ? (
          <Text style={styles.statusText}>번호 순서를 기억하세요!</Text>
        ) : status === 'input' ? (
          <Text style={styles.statusTextActive}>번호 순서대로 탭하세요!</Text>
        ) : null}
      </View>

      {/* 타임바 + 도전 버튼 */}
      <View style={[styles.timerSection, !showTimer && { opacity: 0 }]}>
        <View style={styles.timeBarBg}>
          <Animated.View style={[styles.timeBarFill, timeBarAnimStyle]} />
        </View>
        <TouchableOpacity
          style={[styles.challengeBtn, status === 'input' && styles.challengeBtnHidden]}
          onPress={challenge}
          disabled={status === 'input'}
          activeOpacity={0.85}
        >
          <Text style={styles.challengeText}>도전!</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.boardWrap}>
        <GameBoard />

        {status === 'countdown' && countNum !== null && (
          <View style={styles.countdownOverlay}>
            <Text style={countNum === 0 ? styles.countdownGo : styles.countdownNum}>
              {countNum === 0 ? 'GO!' : countNum}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.bg,
    alignItems:      'center',
  },
  backBtn: {
    position: 'absolute',
    top:      16,
    left:     16,
    zIndex:   10,
    padding:  8,
  },
  backText: {
    fontSize:   24,
    color:      COLORS.sub,
    fontWeight: '700',
  },
  centerContent: {
    flex:              1,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 32,
    gap:               20,
  },
  emoji:      { fontSize: 56 },
  titleLarge: {
    fontSize:      32,
    fontWeight:    '900',
    color:         COLORS.yellow,
    letterSpacing: 1,
    textAlign:     'center',
  },
  subtitle: {
    fontSize:   14,
    color:      COLORS.sub,
    textAlign:  'center',
    lineHeight: 22,
  },
  rulesCard: {
    backgroundColor: COLORS.card,
    borderRadius:    16,
    padding:         20,
    width:           '100%',
    gap:             8,
  },
  ruleItem: {
    fontSize:   13,
    color:      COLORS.sub,
    lineHeight: 20,
  },
  startBtn: {
    backgroundColor:   COLORS.yellow,
    paddingHorizontal: 40,
    paddingVertical:   14,
    borderRadius:      14,
  },
  startText: {
    fontSize:   18,
    fontWeight: '800',
    color:      '#1a1a2e',
  },
  rankLink: {
    fontSize:        14,
    color:           COLORS.sub,
    fontWeight:      '600',
    paddingVertical: 8,
  },
  scoreDisplay: {
    fontSize:   40,
    fontWeight: '900',
    color:      COLORS.text,
  },
  btnRow: {
    flexDirection: 'row',
    gap:           12,
    marginTop:     8,
  },
  btn: {
    paddingHorizontal: 28,
    paddingVertical:   12,
    borderRadius:      12,
  },
  btnText: {
    fontSize:   15,
    fontWeight: '700',
    color:      '#fff',
  },
  hudWrap: {
    width:             '100%',
    paddingHorizontal: 16,
    marginTop:         40,
  },
  statusWrap: {
    marginTop:      20,
    marginBottom:   16,
    height:         28,
    alignItems:     'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize:      15,
    color:         COLORS.yellow,
    fontWeight:    '700',
    letterSpacing: 0.3,
  },
  statusTextActive: {
    fontSize:      15,
    color:         '#05c46b',
    fontWeight:    '700',
    letterSpacing: 0.3,
  },
  statusTextResult: {
    fontSize:      18,
    color:         '#ffe066',
    fontWeight:    '900',
    letterSpacing: 1,
  },
  timerSection: {
    width:             '100%',
    paddingHorizontal: 16,
    gap:               10,
    alignItems:        'center',
    marginBottom:      12,
  },
  timeBarBg: {
    width:           '100%',
    height:          10,
    backgroundColor: '#1e1e2e',
    borderRadius:    5,
    overflow:        'hidden',
  },
  timeBarFill: {
    height:       '100%',
    borderRadius: 5,
  },
  challengeBtn: {
    backgroundColor:   COLORS.challenge,
    paddingHorizontal: 56,
    paddingVertical:   13,
    borderRadius:      16,
    shadowColor:       '#05c46b',
    shadowOpacity:     0.45,
    shadowRadius:      10,
    elevation:         5,
  },
  challengeBtnHidden: { opacity: 0 },
  challengeText: {
    fontSize:      20,
    fontWeight:    '900',
    color:         '#0f0e17',
    letterSpacing: 1,
  },
  boardWrap: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    width:          '100%',
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: 'rgba(15, 14, 23, 0.75)',
  },
  countdownNum: {
    fontSize:   120,
    fontWeight: '900',
    color:      '#ffe066',
    lineHeight: 130,
  },
  countdownGo: {
    fontSize:      72,
    fontWeight:    '900',
    color:         '#05c46b',
    letterSpacing: 4,
  },
});
