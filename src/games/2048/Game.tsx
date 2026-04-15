import React, { useCallback, useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Board       from './components/Board';
import ScoreBar    from './components/ScoreBar';
import DirectionPad from './components/DirectionPad';
import NicknameModal from './components/NicknameModal';
import Leaderboard  from './components/Leaderboard';
import { useGameStore } from './store/gameStore';
import { useKeyboard }  from './hooks/useKeyboard';
import { Direction }    from './logic/board';
import { COLORS }       from './constants/theme';

type Overlay = 'none' | 'nickname' | 'leaderboard';

export default function Game2048() {
  const { board, score, bestScore, status, move, startGame, continueAfterWin, _initBest } =
    useGameStore();
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
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
    alignItems:      'center',
    justifyContent:  'center',
    paddingTop:      60,
    paddingBottom:   40,
  },
});
