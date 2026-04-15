import React, { useCallback, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Board        from './components/Board';
import ScoreBar     from './components/ScoreBar';
import DirectionPad from './components/DirectionPad';
import NicknameModal from './components/NicknameModal';
import Leaderboard   from './components/Leaderboard';
import { useGameStore } from './store/gameStore';
import { useKeyboard }  from './hooks/useKeyboard';
import { Direction }    from './logic/board';
import { COLORS }       from './constants/theme';

type Overlay = 'none' | 'nickname' | 'leaderboard';

const PREVIEW_TILES = [
  { value: 2,   bg: '#eee4da', text: '#776e65' },
  { value: 4,   bg: '#ede0c8', text: '#776e65' },
  { value: 8,   bg: '#f2b179', text: '#f9f6f2' },
  { value: 2048,bg: '#edc22e', text: '#f9f6f2' },
];

export default function Game2048() {
  const { board, score, bestScore, status, move, startGame, _initBest } = useGameStore();
  const [activeDir,   setActiveDir]   = useState<Direction | null>(null);
  const [overlay,     setOverlay]     = useState<Overlay>('none');
  const [submittedId, setSubmittedId] = useState<string | undefined>();
  const [prevStatus,  setPrevStatus]  = useState(status);

  useEffect(() => { _initBest(); }, []);

  useEffect(() => {
    if (prevStatus === 'playing' && (status === 'over' || status === 'won') && score > 0) {
      setOverlay('nickname');
    }
    setPrevStatus(status);
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
    startGame();
  };

  // ── idle 시작 화면 ────────────────────────────────────────────────────────
  if (status === 'idle') {
    return (
      <View style={styles.idleScreen}>
        {/* 뒤로가기 */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← 허브</Text>
        </TouchableOpacity>

        {/* 타이틀 */}
        <Text style={styles.idleTitle}>2048</Text>
        <Text style={styles.idleDesc}>
          타일을 밀어 숫자를 합치세요.{'\n'}2048을 만들면 승리!
        </Text>

        {/* 미리보기 타일 */}
        <View style={styles.tileRow}>
          {PREVIEW_TILES.map(t => (
            <View key={t.value} style={[styles.previewTile, { backgroundColor: t.bg }]}>
              <Text style={[styles.previewText, { color: t.text }]}>{t.value}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={startGame} activeOpacity={0.85}>
          <Text style={styles.startText}>START</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rankLink} onPress={() => setOverlay('leaderboard')}>
          <Text style={styles.rankLinkText}>🏆 글로벌 랭킹 보기</Text>
        </TouchableOpacity>

        {overlay === 'leaderboard' && (
          <Leaderboard onClose={() => setOverlay('none')} />
        )}
      </View>
    );
  }

  // ── 게임 화면 ─────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <ScoreBar
        score={score}
        bestScore={bestScore}
        onNewGame={handleNewGame}
        onLeaderboard={() => setOverlay('leaderboard')}
        onBack={() => router.back()}
      />
      <Board board={board} onSwipe={handleMove} />
      <DirectionPad activeDir={activeDir} onPress={handleMove} />

      {overlay === 'nickname' && (
        <NicknameModal
          score={score}
          onSubmitted={(id) => { setSubmittedId(id); setOverlay('leaderboard'); }}
          onSkip={() => setOverlay('none')}
        />
      )}
      {overlay === 'leaderboard' && (
        <Leaderboard
          highlightId={submittedId}
          onClose={() => setOverlay('none')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ── idle ─────────────────────────────────────────────────────────────────
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
    fontSize:      72,
    fontWeight:    '900',
    color:         COLORS.text,
    letterSpacing: 2,
    marginBottom:  8,
  },
  idleDesc: {
    fontSize:     14,
    color:        COLORS.subText,
    textAlign:    'center',
    lineHeight:   22,
    marginBottom: 28,
  },
  tileRow: {
    flexDirection: 'row',
    gap:           8,
    marginBottom:  36,
  },
  previewTile: {
    width:          56,
    height:         56,
    borderRadius:   8,
    alignItems:     'center',
    justifyContent: 'center',
  },
  previewText: {
    fontSize:   16,
    fontWeight: '900',
  },
  startBtn: {
    backgroundColor:   COLORS.button,
    paddingHorizontal: 56,
    paddingVertical:   16,
    borderRadius:      12,
    marginBottom:      16,
  },
  startText: {
    fontSize:      20,
    fontWeight:    '900',
    color:         COLORS.buttonText,
    letterSpacing: 3,
  },
  rankLink: { paddingVertical: 8 },
  rankLinkText: {
    fontSize:   14,
    color:      COLORS.subText,
    fontWeight: '600',
  },

  // ── game ─────────────────────────────────────────────────────────────────
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
    alignItems:      'center',
    justifyContent:  'center',
    paddingTop:      60,
    paddingBottom:   40,
  },
});
