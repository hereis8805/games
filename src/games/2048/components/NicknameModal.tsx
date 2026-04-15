import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { submitScore } from '../lib/supabase';
import { COLORS } from '../constants/theme';

interface Props {
  score: number;
  onSubmitted: (id: string) => void;
  onSkip: () => void;
}

export default function NicknameModal({ score, onSubmitted, onSkip }: Props) {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async () => {
    const name = nickname.trim();
    if (!name) { setError('닉네임을 입력해주세요'); return; }
    if (name.length > 12) { setError('12자 이하로 입력해주세요'); return; }

    setLoading(true);
    setError('');
    try {
      const id = await submitScore(name, score);
      onSubmitted(id);
    } catch (e: any) {
      console.error('submitScore error:', e);
      setError(e?.message ?? '저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.backdrop}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          <Text style={styles.title}>🏆 점수 등록</Text>
          <Text style={styles.score}>{score.toLocaleString()}점</Text>
          <Text style={styles.label}>닉네임 (최대 12자)</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="닉네임 입력"
            placeholderTextColor={COLORS.subText}
            maxLength={12}
            autoFocus
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.skipBtn} onPress={onSkip} disabled={loading}>
              <Text style={styles.skipText}>건너뛰기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitText}>등록하기</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 28,
    width: 300,
    alignItems: 'center',
    gap: 12,
  },
  title:      { fontSize: 22, fontWeight: '900', color: COLORS.text },
  score:      { fontSize: 36, fontWeight: '900', color: '#f65e3b' },
  label:      { fontSize: 13, color: COLORS.subText, alignSelf: 'flex-start' },
  input: {
    width: '100%',
    borderWidth: 2,
    borderColor: COLORS.board,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: '#fff',
  },
  error:      { fontSize: 12, color: '#e74c3c', alignSelf: 'flex-start' },
  btnRow:     { flexDirection: 'row', gap: 10, width: '100%', marginTop: 4 },
  skipBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.board,
    alignItems: 'center',
  },
  skipText:   { color: COLORS.subText, fontWeight: '700' },
  submitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f65e3b',
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
