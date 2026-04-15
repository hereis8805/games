import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { getLeaderboard, LeaderboardEntry } from '../lib/supabase';
import { COLORS } from '../constants/theme';

interface Props {
  highlightId?: string;
  onClose: () => void;
}

const MEDALS = ['🥇', '🥈', '🥉'];

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function Leaderboard({ highlightId, onClose }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setEntries(await getLeaderboard(20));
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
          {index < 3 ? MEDALS[index] : `${index + 1}`}
        </Text>
        <Text style={[styles.nickname, isMe && styles.nicknameHighlight]} numberOfLines={1}>
          {item.nickname}
        </Text>
        <Text style={styles.score}>{item.score.toLocaleString()}</Text>
        <Text style={styles.date}>{formatDate(item.created_at)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>🏆 글로벌 랭킹</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* 컬럼 헤더 */}
      <View style={styles.colHeader}>
        <Text style={[styles.colText, { width: 36 }]}>#</Text>
        <Text style={[styles.colText, { flex: 1 }]}>닉네임</Text>
        <Text style={[styles.colText, { width: 80, textAlign: 'right' }]}>점수</Text>
        <Text style={[styles.colText, { width: 44, textAlign: 'right' }]}>날짜</Text>
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.button} size="large" />}
      {!!error && (
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
          <Text style={styles.emptyText}>첫 번째 기록을 남겨보세요! 🎮</Text>
        </View>
      )}
      {!loading && !error && entries.length > 0 && (
        <FlatList
          data={entries}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
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
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.background,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title:     { fontSize: 24, fontWeight: '900', color: COLORS.text },
  closeBtn:  { padding: 8 },
  closeText: { fontSize: 20, color: COLORS.subText, fontWeight: '700' },
  colHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.board,
    marginBottom: 4,
  },
  colText:   { fontSize: 12, fontWeight: '700', color: COLORS.subText },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  rowHighlight:      { backgroundColor: '#fff3cd', borderWidth: 2, borderColor: '#f65e3b' },
  rank:              { width: 36, fontSize: 18, textAlign: 'center' },
  nickname:          { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.text },
  nicknameHighlight: { color: '#f65e3b' },
  score:             { width: 80, fontSize: 15, fontWeight: '800', color: COLORS.text, textAlign: 'right' },
  date:              { width: 44, fontSize: 12, color: COLORS.subText, textAlign: 'right' },
  center:            { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  errorText:         { fontSize: 14, color: '#e74c3c' },
  retryBtn:          { paddingHorizontal: 20, paddingVertical: 8, backgroundColor: COLORS.button, borderRadius: 6 },
  retryText:         { color: '#fff', fontWeight: '700' },
  emptyText:         { fontSize: 15, color: COLORS.subText },
  refreshBtn:        { alignItems: 'center', paddingVertical: 16 },
  refreshText:       { color: COLORS.subText, fontSize: 14, fontWeight: '600' },
});
