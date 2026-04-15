import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from './store/gameStore';
import { useKeyboard }  from './hooks/useKeyboard';
import { Direction }    from './logic/blocks';
import { COLORS }       from './constants/theme';

import BlockLane     from './components/BlockLane';
import DirectionPad  from './components/DirectionPad';
import EnergyBar     from './components/EnergyBar';
import HUD           from './components/HUD';
import ComboPopup    from './components/ComboPopup';
import GameOverlay   from './components/GameOverlay';
import NicknameModal from './components/NicknameModal';
import Leaderboard   from './components/Leaderboard';

type Overlay = 'none' | 'nickname' | 'leaderboard';

export default function GameArrowBreak() {
  const {
    queue, status, score, level,
    startCountdown, countdownTick,
    pressDirection, energyTick, levelTick, goHome,
  } = useGameStore();

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
    return () => {
      clearInterval(energyTimer);
      clearInterval(levelTimer);
    };
  }, [status]);

  const handleInput = useCallback((dir: Direction) => {
    setActiveDir(dir);
    pressDirection(dir);
    setTimeout(() => setActiveDir(null), 350);
  }, [pressDirection]);

  useKeyboard(handleInput);

  if (status === 'idle') {
    return (
      <View style={styles.idleScreen}>
        {/* 뒤로가기 */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← 허브</Text>
        </TouchableOpacity>

        <Text style={styles.idleTitle}>ARROW</Text>
        <Text style={styles.idleTitleAccent}>BREAK</Text>
        <Text style={styles.idleDesc}>
          화살표 블럭을 맞춰 에너지를 유지하세요!{'\n'}
          콤보를 이어갈수록 점수가 폭발합니다.
        </Text>
        <View style={styles.idleGuide}>
          {(['up','left','down','right'] as Direction[]).map(d => (
            <View key={d} style={[styles.guidePill, { backgroundColor: COLORS.block[d].bg }]}>
              <Text style={{ color: COLORS.block[d].text, fontSize: 20, fontWeight: '800' }}>
                {{ up:'▲', left:'◀', down:'▼', right:'▶' }[d]}
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
    <View style={styles.container}>
      <HUD />
      <View style={styles.energyWrap}>
        <EnergyBar />
      </View>
      <View style={styles.laneWrap}>
        <ComboPopup />
        <BlockLane queue={queue} />
      </View>
      <DirectionPad activeDir={activeDir} onPress={handleInput} />

      <GameOverlay
        onRestart={() => { setOverlay('none'); setSubmittedId(undefined); startCountdown(); }}
        onRegister={() => setOverlay('nickname')}
        onLeaderboard={() => { setSubmittedId(undefined); setOverlay('leaderboard'); }}
        onHome={() => { setOverlay('none'); setSubmittedId(undefined); goHome(); }}
        onHub={() => router.back()}
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
          onClose={() => setOverlay('none')}
          onHome={() => { setOverlay('none'); setSubmittedId(undefined); goHome(); }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  idleScreen: {
    flex:              1,
    backgroundColor:   COLORS.background,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 32,
  },
  backBtn: {
    position: 'absolute',
    top:      56,
    left:     20,
    padding:  8,
  },
  backText: {
    fontSize:   14,
    color:      COLORS.subText,
    fontWeight: '600',
  },
  idleTitle: {
    fontSize: 52, fontWeight: '900', color: COLORS.scoreText,
    letterSpacing: 4, lineHeight: 56,
  },
  idleTitleAccent: {
    fontSize: 52, fontWeight: '900', color: COLORS.comboText,
    letterSpacing: 4, lineHeight: 56, marginBottom: 24,
  },
  idleDesc: {
    fontSize: 14, color: COLORS.subText,
    textAlign: 'center', lineHeight: 22, marginBottom: 24,
  },
  idleGuide: { flexDirection: 'row', gap: 10, marginBottom: 32 },
  guidePill: {
    width: 52, height: 52, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  startBtn: {
    backgroundColor: COLORS.buttonActive,
    paddingHorizontal: 56, paddingVertical: 16,
    borderRadius: 16, marginBottom: 16,
  },
  startText: {
    fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 3,
  },
  rankLink: { paddingVertical: 8 },
  rankLinkText: { fontSize: 14, color: COLORS.subText, fontWeight: '600' },
  container: {
    flex: 1, backgroundColor: COLORS.background,
    alignItems: 'center', justifyContent: 'center',
    paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24,
  },
  energyWrap: { width: '100%', marginTop: 12, marginBottom: 16 },
  laneWrap:   { alignItems: 'center', marginBottom: 28 },
});
