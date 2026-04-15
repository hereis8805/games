import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, FadeIn,
} from 'react-native-reanimated';
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
  { value: 2,    bg: '#eee4da', text: '#776e65' },
  { value: 4,    bg: '#ede0c8', text: '#776e65' },
  { value: 8,    bg: '#f2b179', text: '#f9f6f2' },
  { value: 2048, bg: '#edc22e', text: '#f9f6f2' },
];

// ── 게임 오버 카드 ──────────────────────────────────────────────────────────
function GameOverCard({
  score,
  bestScore,
  onRegister,
  onLeaderboard,
  onRestart,
  onHome,
  onHub,
}: {
  score:         number;
  bestScore:     number;
  onRegister:    () => void;
  onLeaderboard: () => void;
  onRestart:     () => void;
  onHome:        () => void;
  onHub:         () => void;
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

        {/* 점수 등록 + 랭킹 */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.registerBtn} onPress={onRegister} activeOpacity={0.8}>
            <Text style={styles.registerText}>점수 등록</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rankBtn} onPress={onLeaderboard} activeOpacity={0.8}>
            <Text style={styles.rankText}>랭킹</Text>
          </TouchableOpacity>
        </View>

        {/* 다시하기 */}
        <TouchableOpacity style={styles.restartBtn} onPress={onRestart} activeOpacity={0.8}>
          <Text style={styles.restartText}>다시하기</Text>
        </TouchableOpacity>

        {/* 홈 + 허브 */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBtn} onPress={onHome} activeOpacity={0.8}>
            <Text style={styles.navText}>홈</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={onHub} activeOpacity={0.8}>
            <Text style={styles.navText}>← 허브</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

// ── 메인 ────────────────────────────────────────────────────────────────────
export default function Game2048() {
  const { board, score, bestScore, status, move, startGame, goHome, _initBest } = useGameStore();
  const [activeDir,   setActiveDir]   = useState<Direction | null>(null);
  const [overlay,     setOverlay]     = useState<Overlay>('none');
  const [submittedId, setSubmittedId] = useState<string | undefined>();
  const prevStatus = useRef(status);

  useEffect(() => { _initBest(); }, []);

  // 게임이 playing → idle로 돌아오면 overlay 초기화
  useEffect(() => {
    if (status === 'idle') {
      setOverlay('none');
      setSubmittedId(undefined);
    }
    prevStatus.current = status;
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

  // ── idle 시작 화면 ──────────────────────────────────────────────────────
  if (status === 'idle') {
    return (
      <View style={styles.idleScreen}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← 허브</Text>
        </TouchableOpacity>

        <Text style={styles.idleTitle}>2048</Text>
        <Text style={styles.idleDesc}>
          타일을 밀어 숫자를 합치세요.{'\n'}2048을 만들면 승리!
        </Text>

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

  // ── 게임 화면 ───────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <ScoreBar
        score={score}
        bestScore={bestScore}
        onNewGame={handleNewGame}
        onLeaderboard={() => setOverlay('leaderboard')}
        onBack={() => goHome()}
      />
      <Board board={board} onSwipe={handleMove} />
      <DirectionPad activeDir={activeDir} onPress={handleMove} />

      {/* 게임 오버 / 승리 카드 */}
      {status === 'over' && overlay === 'none' && (
        <GameOverCard
          score={score}
          bestScore={bestScore}
          onRegister={() => setOverlay('nickname')}
          onLeaderboard={() => { setSubmittedId(undefined); setOverlay('leaderboard'); }}
          onRestart={handleNewGame}
          onHome={() => goHome()}
          onHub={() => router.back()}
        />
      )}

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
  // ── idle ──────────────────────────────────────────────────────────────
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
  rankLink:     { paddingVertical: 8 },
  rankLinkText: { fontSize: 14, color: COLORS.subText, fontWeight: '600' },

  // ── game ──────────────────────────────────────────────────────────────
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
    alignItems:      'center',
    justifyContent:  'center',
    paddingTop:      60,
    paddingBottom:   40,
  },

  // ── game over card ─────────────────────────────────────────────────────
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems:      'center',
    justifyContent:  'center',
    zIndex:          100,
  },
  card: {
    width:           300,
    backgroundColor: COLORS.background,
    borderRadius:    24,
    padding:         28,
    alignItems:      'center',
  },
  overTitle: {
    fontSize:      28,
    fontWeight:    '900',
    color:         COLORS.text,
    letterSpacing: 2,
    marginBottom:  8,
  },
  newBest: {
    fontSize:          13,
    fontWeight:        '800',
    color:             '#d4a017',
    letterSpacing:     1.5,
    marginBottom:      10,
    backgroundColor:   'rgba(255,215,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical:    3,
    borderRadius:       6,
  },
  statRow: {
    flexDirection:  'row',
    gap:            24,
    marginVertical: 14,
  },
  stat: {
    alignItems: 'center',
    minWidth:   80,
  },
  statLabel: {
    fontSize:      10,
    fontWeight:    '600',
    color:         COLORS.subText,
    letterSpacing: 1,
    marginBottom:  2,
  },
  statValue: {
    fontSize:   22,
    fontWeight: '900',
    color:      COLORS.text,
  },
  actionRow: {
    flexDirection: 'row',
    gap:           10,
    width:         '100%',
    marginTop:     8,
  },
  registerBtn: {
    flex:            2,
    backgroundColor: COLORS.button,
    paddingVertical: 11,
    borderRadius:    12,
    alignItems:      'center',
  },
  registerText: {
    fontSize:   14,
    fontWeight: '700',
    color:      COLORS.buttonText,
  },
  rankBtn: {
    flex:            1,
    borderWidth:     1,
    borderColor:     COLORS.subText,
    paddingVertical: 11,
    borderRadius:    12,
    alignItems:      'center',
  },
  rankText: {
    fontSize:   14,
    fontWeight: '700',
    color:      COLORS.subText,
  },
  restartBtn: {
    marginTop:       10,
    width:           '100%',
    backgroundColor: '#f65e3b',
    paddingVertical: 13,
    borderRadius:    14,
    alignItems:      'center',
  },
  restartText: {
    fontSize:      16,
    fontWeight:    '800',
    color:         '#fff',
    letterSpacing: 1,
  },
  navRow: {
    flexDirection:  'row',
    gap:             10,
    marginTop:       6,
    width:          '100%',
  },
  navBtn: {
    flex:            1,
    paddingVertical: 10,
    alignItems:      'center',
  },
  navText: {
    fontSize:   14,
    color:      COLORS.subText,
    fontWeight: '600',
  },
});
