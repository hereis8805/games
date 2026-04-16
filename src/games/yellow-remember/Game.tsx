import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '@game/yellow-remember';
import { GameBoard } from '@game/yellow-remember';
import { HUD } from '@game/yellow-remember';
import { DIFFICULTY_LEVELS, FADE_DURATION_MS } from '@game/yellow-remember';

const COLORS = {
  bg:       '#0f0e17',
  card:     '#1a1a2e',
  yellow:   '#ffe066',
  gray:     '#2d2d3a',
  text:     '#e2e8f0',
  sub:      '#94a3b8',
  danger:   '#e94560',
  button:   '#533483',
};

// 'showing' 상태 지속 시간 (블럭을 보여주는 시간)
const SHOW_DURATION_MS = 1200;

export default function YellowRememberGame() {
  const rawInsets = useSafeAreaInsets();
  const insets    = Platform.OS === 'web'
    ? { top: 0, bottom: 0 }
    : rawInsets;

  const status    = useGameStore(s => s.status);
  const diffIdx   = useGameStore(s => s.diffIdx);
  const score     = useGameStore(s => s.score);
  const lives     = useGameStore(s => s.lives);
  const roundKey  = useGameStore(s => s.roundKey);

  const { startGame, beginFade, nextRound, goHome } = useGameStore(s => ({
    startGame: s.startGame,
    beginFade: s.beginFade,
    nextRound: s.nextRound,
    goHome:    s.goHome,
  }));

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // showing → input 전환 타이머
  useEffect(() => {
    if (status === 'showing') {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        beginFade();
      }, SHOW_DURATION_MS);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [status, roundKey]);

  const gridLabel = `${DIFFICULTY_LEVELS[diffIdx].gridSize}×${DIFFICULTY_LEVELS[diffIdx].gridSize}`;

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
          <Text style={styles.subtitle}>노란 블럭이 사라지기 전에{'\n'}모두 기억하고 눌러보세요!</Text>

          <View style={styles.rulesCard}>
            <Text style={styles.ruleItem}>• 노란 블럭이 서서히 회색으로 변해요</Text>
            <Text style={styles.ruleItem}>• 노란 블럭이었던 자리를 모두 탭하세요</Text>
            <Text style={styles.ruleItem}>• 틀리면 ♥ -1, 3번 틀리면 게임 오버</Text>
            <Text style={styles.ruleItem}>• 5라운드마다 그리드가 커져요</Text>
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={startGame} activeOpacity={0.85}>
            <Text style={styles.startText}>게임 시작</Text>
          </TouchableOpacity>
        </View>
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
        </View>
      </View>
    );
  }

  /* ─── 라운드 성공 결과 ─── */
  if (status === 'result') {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.centerContent}>
          <Text style={styles.emoji}>✅</Text>
          <Text style={styles.titleMedium}>성공!</Text>
          <Text style={styles.scoreDisplay}>{score}점</Text>

          <TouchableOpacity style={styles.startBtn} onPress={nextRound} activeOpacity={0.85}>
            <Text style={styles.startText}>다음 라운드</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ─── 플레이 화면 (showing / input) ─── */
  return (
    <View style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
      {/* 뒤로 버튼 */}
      <TouchableOpacity style={styles.backBtn} onPress={() => { goHome(); router.back(); }}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      {/* HUD */}
      <View style={styles.hudWrap}>
        <HUD />
      </View>

      {/* 상태 안내 */}
      <View style={styles.statusWrap}>
        {status === 'showing' ? (
          <Text style={styles.statusText}>노란 블럭을 기억하세요!</Text>
        ) : (
          <Text style={styles.statusTextActive}>기억한 블럭을 눌러주세요</Text>
        )}
      </View>

      {/* 게임 보드 */}
      <View style={styles.boardWrap}>
        <GameBoard />
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
  centerContent: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap:            20,
  },
  backBtn: {
    position:   'absolute',
    top:        16,
    left:       16,
    zIndex:     10,
    padding:    8,
  },
  backText: {
    fontSize:   24,
    color:      COLORS.sub,
    fontWeight: '700',
  },
  emoji: {
    fontSize: 56,
  },
  titleLarge: {
    fontSize:      32,
    fontWeight:    '900',
    color:         COLORS.yellow,
    letterSpacing: 1,
    textAlign:     'center',
  },
  titleMedium: {
    fontSize:   26,
    fontWeight: '900',
    color:      '#05c46b',
    textAlign:  'center',
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
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 40,
    paddingVertical:   14,
    borderRadius:      14,
  },
  startText: {
    fontSize:   18,
    fontWeight: '800',
    color:      '#1a1a2e',
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

  // 플레이 화면
  hudWrap: {
    width:       '100%',
    paddingHorizontal: 16,
    marginTop:   40,
  },
  statusWrap: {
    marginTop:    20,
    marginBottom: 16,
    height:       28,
    alignItems:   'center',
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
  boardWrap: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    width:          '100%',
  },
});
