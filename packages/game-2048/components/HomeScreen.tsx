import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  onPlay: () => void;
  onLeaderboard: () => void;
  bestScore: number;
  onBack?: () => void;   // 허브에서 뒤로가기 버튼용
}

const PREVIEW_TILES = [
  { value: 2048, row: 0, col: 0 },
  { value: 1024, row: 0, col: 1 },
  { value: 512,  row: 0, col: 2 },
  { value: 256,  row: 0, col: 3 },
  { value: 128,  row: 1, col: 0 },
  { value: 64,   row: 1, col: 1 },
  { value: 32,   row: 1, col: 2 },
  { value: 16,   row: 1, col: 3 },
];

function getTileColor(value: number) {
  const palette: Record<number, { bg: string; text: string }> = {
    2:    { bg: '#eee4da', text: '#776e65' },
    4:    { bg: '#ede0c8', text: '#776e65' },
    8:    { bg: '#f2b179', text: '#f9f6f2' },
    16:   { bg: '#f59563', text: '#f9f6f2' },
    32:   { bg: '#f67c5f', text: '#f9f6f2' },
    64:   { bg: '#f65e3b', text: '#f9f6f2' },
    128:  { bg: '#edcf72', text: '#f9f6f2' },
    256:  { bg: '#edcc61', text: '#f9f6f2' },
    512:  { bg: '#edc850', text: '#f9f6f2' },
    1024: { bg: '#edc53f', text: '#f9f6f2' },
    2048: { bg: '#edc22e', text: '#f9f6f2' },
  };
  return palette[value] ?? { bg: '#3c3a32', text: '#f9f6f2' };
}

export default function HomeScreen({ onPlay, onLeaderboard, bestScore, onBack }: HomeScreenProps) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const TILE_SIZE = Math.min(width * 0.14, 64);

  return (
    <Animated.View style={[styles.outer, { opacity: fadeAnim }]}>
      {/* 허브 뒤로가기 버튼 */}
      {onBack && (
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← 허브</Text>
        </TouchableOpacity>
      )}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

      {/* 타이틀 */}
      <Animated.View style={{ transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}>
        <Text style={styles.title}>2048</Text>
        <Text style={styles.subtitle}>숫자를 합쳐서 2048을 만드세요!</Text>
      </Animated.View>

      {/* 미리보기 타일 */}
      <Animated.View style={[styles.previewBoard, { opacity: fadeAnim }]}>
        {[0, 1].map(row => (
          <View key={row} style={styles.previewRow}>
            {[0, 1, 2, 3].map(col => {
              const tile = PREVIEW_TILES.find(t => t.row === row && t.col === col);
              const colors = tile ? getTileColor(tile.value) : null;
              return (
                <View
                  key={col}
                  style={[
                    styles.previewTile,
                    { width: TILE_SIZE, height: TILE_SIZE },
                    colors ? { backgroundColor: colors.bg } : { backgroundColor: COLORS.emptyTile },
                  ]}
                >
                  {tile && (
                    <Text
                      style={[
                        styles.previewTileText,
                        { color: colors!.text, fontSize: tile.value >= 1000 ? TILE_SIZE * 0.28 : TILE_SIZE * 0.36 },
                      ]}
                    >
                      {tile.value}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </Animated.View>

      {/* 최고 점수 */}
      {bestScore > 0 && (
        <Animated.View style={[styles.bestScoreBox, { opacity: fadeAnim }]}>
          <Text style={styles.bestScoreLabel}>최고 기록</Text>
          <Text style={styles.bestScoreValue}>{bestScore.toLocaleString()}</Text>
        </Animated.View>
      )}

      {/* 버튼 */}
      <Animated.View style={[styles.buttonGroup, { transform: [{ translateY: slideAnim }], opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.playButton} onPress={onPlay} activeOpacity={0.85}>
          <Text style={styles.playButtonText}>게임 시작</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rankButton} onPress={onLeaderboard} activeOpacity={0.85}>
          <Text style={styles.rankButtonText}>🏆 랭킹 보기</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 조작법 안내 */}
      <Animated.View style={[styles.howto, { opacity: fadeAnim }]}>
        <Text style={styles.howtoTitle}>조작 방법</Text>
        <View style={styles.howtoRow}>
          <HowtoItem icon="⬆️⬇️⬅️➡️" label="방향키 / 스와이프" />
          <HowtoItem icon="🔢" label="같은 숫자 합치기" />
          <HowtoItem icon="✨" label="2048 달성!" />
        </View>
      </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}

function HowtoItem({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.howtoItem}>
      <Text style={styles.howtoIcon}>{icon}</Text>
      <Text style={styles.howtoLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,   // backBtn 공간
    paddingBottom: 32,
    gap: 24,
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  backText: {
    fontSize: 14,
    color: COLORS.subText,
    fontWeight: '600',
  },
  title: {
    fontSize: 80,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.subText,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  previewBoard: {
    backgroundColor: COLORS.board,
    borderRadius: 10,
    padding: 8,
    gap: 8,
  },
  previewRow: {
    flexDirection: 'row',
    gap: 8,
  },
  previewTile: {
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTileText: {
    fontWeight: '900',
  },
  bestScoreBox: {
    backgroundColor: COLORS.scoreBox,
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bestScoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.scoreText,
    letterSpacing: 1,
  },
  bestScoreValue: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.scoreText,
    marginTop: 2,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  playButton: {
    backgroundColor: COLORS.button,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  playButtonText: {
    color: COLORS.buttonText,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rankButton: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.board,
  },
  rankButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  howto: {
    width: '100%',
    backgroundColor: '#f0ebe3',
    borderRadius: 12,
    padding: 16,
  },
  howtoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.subText,
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  howtoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  howtoItem: {
    alignItems: 'center',
    gap: 4,
  },
  howtoIcon: {
    fontSize: 22,
  },
  howtoLabel: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '600',
    textAlign: 'center',
  },
});
