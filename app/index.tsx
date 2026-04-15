import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';

const COLORS = {
  bg:       '#0f0e17',
  card:     '#1a1a2e',
  border:   '#16213e',
  title:    '#fffffe',
  sub:      '#a7a9be',
  accent:   '#ff8906',
};

interface GameCard {
  id:          string;
  title:       string;
  description: string;
  emoji:       string;
  accentColor: string;
  route:       string;
}

const GAMES: GameCard[] = [
  {
    id:          '2048',
    title:       '2048',
    description: '타일을 밀어 숫자를 합치세요.\n2048을 만들면 승리!',
    emoji:       '🔢',
    accentColor: '#f59563',
    route:       '/2048',
  },
  {
    id:          'arrow-break',
    title:       'Arrow Break',
    description: '화살표 블럭을 맞춰 에너지를 유지하세요.\n콤보로 점수를 폭발시키세요!',
    emoji:       '🎯',
    accentColor: '#e94560',
    route:       '/arrow-break',
  },
];

function GameCardItem({ game }: { game: GameCard }) {
  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: game.accentColor + '40' }]}
      onPress={() => router.push(game.route as any)}
      activeOpacity={0.8}
    >
      <View style={[styles.cardAccent, { backgroundColor: game.accentColor + '20' }]}>
        <Text style={styles.cardEmoji}>{game.emoji}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: game.accentColor }]}>{game.title}</Text>
        <Text style={styles.cardDesc}>{game.description}</Text>
      </View>
      <View style={[styles.playBtn, { backgroundColor: game.accentColor }]}>
        <Text style={styles.playText}>▶</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HubScreen() {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerSub}>WELCOME TO</Text>
        <Text style={styles.headerTitle}>GAME HUB</Text>
        <Text style={styles.headerDesc}>게임을 선택하세요</Text>
      </View>

      {/* 게임 목록 */}
      <ScrollView
        contentContainerStyle={[styles.list, { maxWidth: Math.min(width, 480) }]}
        showsVerticalScrollIndicator={false}
      >
        {GAMES.map(game => (
          <GameCardItem key={game.id} game={game} />
        ))}

        {/* 더 많은 게임 Coming Soon */}
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>더 많은 게임이 곧 추가됩니다 🚀</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.bg,
    alignItems:      'center',
  },
  header: {
    alignItems:   'center',
    paddingTop:   80,
    paddingBottom: 32,
  },
  headerSub: {
    fontSize:      11,
    fontWeight:    '700',
    color:         COLORS.sub,
    letterSpacing: 3,
    marginBottom:  6,
  },
  headerTitle: {
    fontSize:      42,
    fontWeight:    '900',
    color:         COLORS.title,
    letterSpacing: 4,
  },
  headerDesc: {
    marginTop:  8,
    fontSize:   14,
    color:      COLORS.sub,
    fontWeight: '500',
  },
  list: {
    width:             '100%',
    paddingHorizontal: 24,
    paddingBottom:     40,
    gap:               16,
    alignSelf:         'center',
  },
  card: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.card,
    borderRadius:    20,
    borderWidth:     1,
    padding:         16,
    gap:             14,
  },
  cardAccent: {
    width:          64,
    height:         64,
    borderRadius:   16,
    alignItems:     'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 30,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize:   18,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize:   12,
    color:      COLORS.sub,
    lineHeight: 18,
  },
  playBtn: {
    width:          40,
    height:         40,
    borderRadius:   12,
    alignItems:     'center',
    justifyContent: 'center',
  },
  playText: {
    color:    '#fff',
    fontSize: 16,
  },
  comingSoon: {
    alignItems:    'center',
    paddingVertical: 24,
  },
  comingSoonText: {
    fontSize: 13,
    color:    COLORS.sub,
  },
});
