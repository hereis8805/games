import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { getLeaderboard, LeaderboardEntry } from '../lib/supabase';

const C = {
  bg:         '#0f0e17',
  card:       '#1a1a2e',
  yellow:     '#ffe066',
  green:      '#05c46b',
  sub:        '#94a3b8',
  border:     '#2d2d3a',
  highlight:  'rgba(255,224,102,0.12)',
  red:        '#e94560',
  button:     '#533483',
};

const MEDALS = ['🥇', '🥈', '🥉'];

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

interface Props {
  highlightId?: string;
  onClose:      () => void;
}

export default function Leaderboard({ highlightId, onClose }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setEntries(await getLeaderboard(30));
    } catch {
      setError('랭킹을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isMe = item.id === highlightId;
    return (
      <View style={[styles.row, isMe && styles.rowHighlight]}>
        <Text style={styles.rank}>
          {index < 3 ? MEDALS[index] : String(index + 1)}
        </Text>
        <Text style={[styles.nickname, isMe && styles.highlightText]} numberOfLines={1}>
          {item.nickname}
        </Text>
        <Text style={[styles.grid, isMe && styles.highlightText]}>
          {item.max_grid}×{item.max_grid}
        </Text>
        <Text style={[styles.score, isMe && styles.highlightText]}>
          {item.score.toLocaleString()}
        </Text>
        <Text style={styles.date}>{formatDate(item.created_at)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 글로벌 랭킹</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.colHeader}>
        <Text style={[styles.colText, { width: 36 }]}>#</Text>
        <Text style={[styles.colText, { flex: 1 }]}>닉네임</Text>
        <Text style={[styles.colText, { width: 48 }]}>그리드</Text>
        <Text style={[styles.colText, { width: 72, textAlign: 'right' }]}>점수</Text>
        <Text style={[styles.colText, { width: 40, textAlign: 'right' }]}>날짜</Text>
      </View>

      {loading && (
        <ActivityIndicator style={{ marginTop: 40 }} color={C.yellow} size="large" />
      )}
      {!!error && !loading && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      )}
      {!loading && !error && entries.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyText}>아직 등록된 점수가 없습니다.</Text>
          <Text style={styles.emptyText}>첫 번째 기록을 남겨보세요!</Text>
        </View>
      )}
      {!loading && !error && entries.length > 0 && (
        <FlatList
          data={entries}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}

      <TouchableOpacity style={styles.refreshBtn} onPress={load} disabled={loading}>
        <Text style={styles.refreshText}>↻ 새로고침</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position:          'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor:   C.bg,
    paddingTop:        60,
    paddingHorizontal: 16,
    zIndex:            150,
  },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   16,
  },
  title: {
    fontSize:   24,
    fontWeight: '900',
    color:      C.yellow,
  },
  closeBtn:  { padding: 8 },
  closeText: {
    fontSize:   22,
    color:      C.sub,
    fontWeight: '700',
  },
  colHeader: {
    flexDirection:     'row',
    paddingVertical:    8,
    paddingHorizontal: 12,
    borderBottomWidth:  1,
    borderBottomColor: C.border,
    marginBottom:       4,
  },
  colText: {
    fontSize:      11,
    fontWeight:    '700',
    color:         C.sub,
    letterSpacing: 0.8,
  },
  row: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:    11,
    paddingHorizontal: 12,
    borderRadius:       10,
    marginBottom:       4,
    backgroundColor:   C.card,
  },
  rowHighlight: {
    backgroundColor: C.highlight,
    borderWidth:      1,
    borderColor:      C.yellow,
  },
  rank: {
    width:     36,
    fontSize:  16,
    textAlign: 'center',
    color:     '#e2e8f0',
  },
  nickname: {
    flex:       1,
    fontSize:   14,
    fontWeight: '600',
    color:      '#e2e8f0',
  },
  grid: {
    width:      48,
    fontSize:   12,
    fontWeight: '700',
    color:      C.green,
  },
  score: {
    width:      72,
    fontSize:   14,
    fontWeight: '800',
    color:      '#e2e8f0',
    textAlign:  'right',
  },
  date: {
    width:     40,
    fontSize:  11,
    color:     C.sub,
    textAlign: 'right',
  },
  highlightText: { color: C.yellow },
  center: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            8,
  },
  errorText: { fontSize: 14, color: C.red },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical:    8,
    backgroundColor:   C.button,
    borderRadius:       8,
  },
  retryText: { color: '#fff', fontWeight: '700' },
  emptyText: { fontSize: 14, color: C.sub },
  refreshBtn:  { alignItems: 'center', paddingVertical: 16 },
  refreshText: { color: C.sub, fontSize: 14, fontWeight: '600' },
});
