import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, FadeIn,
} from 'react-native-reanimated';
import {
  Board, ScoreBar, DirectionPad,
  NicknameModal, Leaderboard, WinModal, HomeScreen,
  useGameStore, useKeyboard, COLORS,
} from '@game/2048';
import type { Direction } from '@game/2048';

type Overlay = 'none' | 'gameover' | 'leaderboard';

// ── 게임 오버 카드 ──────────────────────────────────────────────────────────
function GameOverCard({
  score, bestScore,
  onRegister, onLeaderboard, onRestart, onHome,
}: {
  score: number; bestScore: number;
  onRegister: () => void; onLeaderboard: () => void;
  onRestart: () => void; onHome: () => void;
}) {
  const cardScale = useSharedValue(0.75);
  useEffect(() => {
    cardScale.value = withSpring(1, { damping: 12, stiffness: 120 });
  }, []);
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: cardScale.value }] }));
  const isNewBest = score >= bestScore && score > 0;

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
          <Text style={styles.restartText}>다시하기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={onHome} activeOpacity={0.8}>
          <Text style={styles.navText}>홈</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── 메인 ────────────────────────────────────────────────────────────────────
export default function Game2048() {
  const { board, score, bestScore, status, move, startGame, continueAfterWin, goHome, _initBest } = useGameStore();
  const [winSeen,     setWinSeen]     = useState(false);
  const [activeDir,   setActiveDir]   = useState<Direction | null>(null);
  const [overlay,     setOverlay]     = useState<Overlay>('none');
  const [submittedId, setSubmittedId] = useState<string | undefined>();

  useEffect(() => { _initBest(); }, []);

  useEffect(() => {
    if (status === 'idle') {
      setOverlay('none');
      setSubmittedId(undefined);
      setWinSeen(false);
    }
  }, [status]);

  const handleMove = useCallback((dir: Direction) => {
    setActiveDir(dir);
    move(dir);
    setTimeout(() => setActiveDir(null), 400);
  }, [move]);

  useKeyboard(handleMove);

  const handleNewGame = () => {
    setOverlay('none');
    setSubmittedId(undefined);
    setWinSeen(false);
    startGame();
  };

  const handleGoHome = () => {
    setOverlay('none');
    setSubmittedId(undefined);
    setWinSeen(false);
    goHome();
  };

  // ── idle 시작 화면 ──────────────────────────────────────────────────────
  if (status === 'idle') {
    return (
      <>
        <HomeScreen
          onPlay={startGame}
          onLeaderboard={() => setOverlay('leaderboard')}
          bestScore={bestScore}
          onBack={() => router.back()}
        />
        {overlay === 'leaderboard' && (
          <Leaderboard onClose={() => setOverlay('none')} />
        )}
      </>
    );
  }

  // ── 게임 화면 ───────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <ScoreBar
        score={score}
        bestScore={bestScore}
        onNewGame={handleNewGame}
        onLeaderboard={() => setOverlay('leaderboard')}
        onBack={handleGoHome}
      />
      <Board board={board} onSwipe={handleMove} />
      <DirectionPad activeDir={activeDir} onPress={handleMove} />

      {status === 'won' && !winSeen && overlay === 'none' && (
        <WinModal
          score={score}
          onContinue={() => { setWinSeen(true); continueAfterWin(); }}
          onRestart={handleNewGame}
          onLeaderboard={() => setOverlay('leaderboard')}
        />
      )}

      {/* 게임 종료 → NicknameModal 먼저 */}
      {status === 'over' && overlay === 'none' && (
        <NicknameModal
          score={score}
          onSubmitted={(id) => { setSubmittedId(id); setOverlay('leaderboard'); }}
          onSkip={() => setOverlay('gameover')}
        />
      )}

      {overlay === 'gameover' && (
        <GameOverCard
          score={score}
          bestScore={bestScore}
          onRegister={() => setOverlay('leaderboard')}
          onLeaderboard={() => { setSubmittedId(undefined); setOverlay('leaderboard'); }}
          onRestart={handleNewGame}
          onHome={handleGoHome}
        />
      )}

      {overlay === 'leaderboard' && (
        <Leaderboard
          highlightId={submittedId}
          onClose={() => setOverlay(status === 'over' ? 'gameover' : 'none')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', paddingTop: 16, paddingBottom: 16 },
  overlay:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  card:       { width: 300, backgroundColor: COLORS.background, borderRadius: 24, padding: 28, alignItems: 'center' },
  overTitle:  { fontSize: 28, fontWeight: '900', color: COLORS.text, letterSpacing: 2, marginBottom: 8 },
  newBest:    { fontSize: 13, fontWeight: '800', color: '#d4a017', letterSpacing: 1.5, marginBottom: 10, backgroundColor: 'rgba(255,215,0,0.15)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  statRow:    { flexDirection: 'row', gap: 24, marginVertical: 14 },
  stat:       { alignItems: 'center', minWidth: 80 },
  statLabel:  { fontSize: 10, fontWeight: '600', color: COLORS.subText, letterSpacing: 1, marginBottom: 2 },
  statValue:  { fontSize: 22, fontWeight: '900', color: COLORS.text },
  actionRow:  { flexDirection: 'row', gap: 10, width: '100%', marginTop: 8 },
  registerBtn:{ flex: 2, backgroundColor: COLORS.button, paddingVertical: 11, borderRadius: 12, alignItems: 'center' },
  registerText:{ fontSize: 14, fontWeight: '700', color: COLORS.buttonText },
  rankBtn:    { flex: 1, borderWidth: 1, borderColor: COLORS.subText, paddingVertical: 11, borderRadius: 12, alignItems: 'center' },
  rankText:   { fontSize: 14, fontWeight: '700', color: COLORS.subText },
  restartBtn: { marginTop: 10, width: '100%', backgroundColor: '#f65e3b', paddingVertical: 13, borderRadius: 14, alignItems: 'center' },
  restartText:{ fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  navBtn:     { flex: 1, paddingVertical: 10, alignItems: 'center' },
  navText:    { fontSize: 14, color: COLORS.subText, fontWeight: '600' },
});
