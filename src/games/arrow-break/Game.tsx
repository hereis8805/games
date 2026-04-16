import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  useGameStore, useKeyboard,
  BlockLane, DirectionPad, EnergyBar, HUD,
  ComboPopup, GameOverlay, Leaderboard, NicknameModal,
  COLORS, DIRECTION_LABEL,
} from '@game/arrow-break';
import type { Direction } from '@game/arrow-break';

type Overlay = 'none' | 'nickname' | 'leaderboard';

export default function GameArrowBreak() {
  const {
    queue, status, score, level,
    startCountdown, countdownTick,
    pressDirection, energyTick, levelTick, goHome,
  } = useGameStore();

  // 플랫폼 분기: 웹은 window.innerHeight로 브라우저 크롬 처리, 네이티브는 기기 safe area 사용
  const rawInsets = useSafeAreaInsets();
  const insets = Platform.OS === 'web'
    ? { top: 0, bottom: 0, left: 0, right: 0 }
    : rawInsets;

  const [activeDir,   setActiveDir]   = useState<Direction | null>(null);
  const [overlay,     setOverlay]     = useState<Overlay>('none');
  const [submittedId, setSubmittedId] = useState<string | undefined>();
  const prevStatus = useRef(status);

  useEffect(() => {
    if (prevStatus.current === 'playing' && status === 'over' && score > 0) {
      setOverlay('nickname');
    }
    prevStatus.current = status;
  }, [status]);

  useEffect(() => {
    if (status !== 'countdown') return;
    const t = setInterval(countdownTick, 1000);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => {
    if (status !== 'playing') return;
    const energyTimer = setInterval(energyTick, 100);
    const levelTimer  = setInterval(levelTick, 2500);
    return () => { clearInterval(energyTimer); clearInterval(levelTimer); };
  }, [status]);

  const handleInput = useCallback((dir: Direction) => {
    setActiveDir(dir);
    pressDirection(dir);
    setTimeout(() => setActiveDir(null), 350);
  }, [pressDirection]);

  useKeyboard(handleInput);

  // 웹 스와이프 감지 (touchstart + touchend만 사용 → touchmove 전역 차단과 충돌 없음)
  const handleInputRef = useRef(handleInput);
  handleInputRef.current = handleInput;

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    // document 레벨에 붙임 — 첫 렌더 시 game element가 아직 없어도 동작함
    // pressDirection 내부에서 status !== 'playing' 이면 무시하므로 안전

    const MIN_SWIPE = 40;
    let startX = 0;
    let startY = 0;

    const onStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < MIN_SWIPE && Math.abs(dy) < MIN_SWIPE) return;
      const dir: Direction = Math.abs(dx) > Math.abs(dy)
        ? (dx > 0 ? 'right' : 'left')
        : (dy > 0 ? 'down' : 'up');
      handleInputRef.current(dir);
    };

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchend',   onEnd,   { passive: true });
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchend',   onEnd);
    };
  }, []);

  if (status === 'idle') {
    return (
      <View style={[styles.idleScreen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <TouchableOpacity style={[styles.backBtn, { top: 16 + insets.top }]} onPress={() => router.back()}>
          <Text style={styles.backText}>← 허브</Text>
        </TouchableOpacity>
        <Text style={styles.idleTitle}>ARROW</Text>
        <Text style={styles.idleTitleAccent}>BREAK</Text>
        <Text style={styles.idleDesc}>
          화살표 블럭을 맞춰 에너지를 유지하세요!{'\n'}
          콤보를 이어갈수록 점수가 폭발합니다.
        </Text>
        <View style={styles.idleGuide}>
          {(['up', 'left', 'down', 'right'] as Direction[]).map(d => (
            <View key={d} style={[styles.guidePill, { backgroundColor: COLORS.block[d].bg }]}>
              <Text style={{ color: COLORS.block[d].text, fontSize: 20, fontWeight: '800' }}>
                {DIRECTION_LABEL[d]}
              </Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.startBtn} onPress={startCountdown} activeOpacity={0.85}>
          <Text style={styles.startText}>START</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rankLink} onPress={() => setOverlay('leaderboard')}>
          <Text style={styles.rankLinkText}>🏆 글로벌 랭킹 보기</Text>
        </TouchableOpacity>
        {overlay === 'leaderboard' && (
          <Leaderboard onClose={() => setOverlay('none')} onHome={() => setOverlay('none')} />
        )}
      </View>
    );
  }

  return (
    <View nativeID="arrow-break-game" style={[styles.container, { paddingTop: Math.max(12, insets.top), paddingBottom: Math.max(12, insets.bottom) }]}>
      {/* 상단 고정 영역 */}
      <View style={styles.topSection}>
        <HUD />
        <View style={styles.energyWrap}><EnergyBar /></View>
      </View>

      {/* 중간: 남은 공간 차지, 넘쳐도 클립 */}
      <View style={styles.laneWrap}>
        <ComboPopup />
        <BlockLane queue={queue} />
      </View>

      {/* 하단 고정: 항상 보임 */}
      <DirectionPad activeDir={activeDir} onPress={handleInput} />

      <GameOverlay
        onRestart={() => { setOverlay('none'); setSubmittedId(undefined); startCountdown(); }}
        onRegister={() => setOverlay('nickname')}
        onLeaderboard={() => { setSubmittedId(undefined); setOverlay('leaderboard'); }}
        onHome={() => { setOverlay('none'); setSubmittedId(undefined); goHome(); }}
      />

      {overlay === 'nickname' && status === 'over' && (
        <NicknameModal
          score={score}
          level={level}
          onSubmitted={(id) => { setSubmittedId(id); setOverlay('leaderboard'); }}
          onSkip={() => setOverlay('none')}
        />
      )}
      {overlay === 'leaderboard' && (
        <Leaderboard
          highlightId={submittedId}
          onClose={() => { setOverlay('none'); setSubmittedId(undefined); goHome(); }}
          onHome={() => { setOverlay('none'); setSubmittedId(undefined); goHome(); }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  idleScreen: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  backBtn:    { position: 'absolute', top: 16, left: 20, padding: 8 },
  backText:   { fontSize: 14, color: COLORS.subText, fontWeight: '600' },
  idleTitle:       { fontSize: 52, fontWeight: '900', color: COLORS.scoreText, letterSpacing: 4, lineHeight: 56 },
  idleTitleAccent: { fontSize: 52, fontWeight: '900', color: COLORS.comboText, letterSpacing: 4, lineHeight: 56, marginBottom: 24 },
  idleDesc:   { fontSize: 14, color: COLORS.subText, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  idleGuide:  { flexDirection: 'row', gap: 10, marginBottom: 32 },
  guidePill:  { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  startBtn:   { backgroundColor: COLORS.buttonActive, paddingHorizontal: 56, paddingVertical: 16, borderRadius: 16, marginBottom: 16 },
  startText:  { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 3 },
  rankLink:   { paddingVertical: 8 },
  rankLinkText:{ fontSize: 14, color: COLORS.subText, fontWeight: '600' },
  container:   { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24 },
  topSection:  { width: '100%' },
  energyWrap:  { width: '100%', marginTop: 8, marginBottom: 4 },
  laneWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', paddingVertical: 8 },
});
