import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { submitScore } from '../lib/supabase';
import { COLORS } from '../constants/theme';

interface Props {
  score:       number;
  level:       number;
  onSubmitted: (id: string) => void;
  onSkip:      () => void;
}

export default function NicknameModal({ score, level, onSubmitted, onSkip }: Props) {
  const [nickname, setNickname] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async () => {
    const name = nickname.trim();
    if (!name)           { setError('닉네임을 입력해주세요'); return; }
    if (name.length > 12){ setError('12자 이하로 입력해주세요'); return; }

    setLoading(true);
    setError('');
    try {
      const id = await submitScore(name, score, level);
      onSubmitted(id);
    } catch (e: any) {
      setError(e?.message ?? '저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.backdrop}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          <Text style={styles.title}>점수 등록</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>SCORE</Text>
              <Text style={styles.statValue}>{score.toLocaleString()}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={styles.statLabel}>LEVEL</Text>
              <Text style={[styles.statValue, { color: COLORS.levelText }]}>{level}</Text>
            </View>
          </View>

          <Text style={styles.inputLabel}>닉네임 (최대 12자)</Text>
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
    position:        'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems:      'center',
    justifyContent:  'center',
    zIndex:          200,
  },
  card: {
    backgroundColor: COLORS.lane,
    borderRadius:    20,
    padding:         28,
    width:           300,
    alignItems:      'center',
    gap:             12,
  },
  title: {
    fontSize:      22,
    fontWeight:    '900',
    color:         COLORS.scoreText,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            20,
    paddingVertical: 8,
  },
  stat: {
    alignItems: 'center',
    minWidth:   80,
  },
  statLabel: {
    fontSize:      10,
    fontWeight:    '700',
    color:         COLORS.subText,
    letterSpacing: 1.2,
    marginBottom:  2,
  },
  statValue: {
    fontSize:   28,
    fontWeight: '900',
    color:      COLORS.comboText,
  },
  divider: {
    width:           1,
    height:          40,
    backgroundColor: COLORS.energyBg,
  },
  inputLabel: {
    fontSize:    12,
    color:       COLORS.subText,
    alignSelf:   'flex-start',
    marginBottom: -4,
  },
  input: {
    width:             '100%',
    borderWidth:       2,
    borderColor:       COLORS.energyBg,
    borderRadius:      10,
    paddingHorizontal: 14,
    paddingVertical:   10,
    fontSize:          16,
    color:             COLORS.scoreText,
    backgroundColor:   COLORS.background,
  },
  error: {
    fontSize:  12,
    color:     COLORS.energyLow,
    alignSelf: 'flex-start',
  },
  btnRow: {
    flexDirection: 'row',
    gap:           10,
    width:         '100%',
    marginTop:     4,
  },
  skipBtn: {
    flex:             1,
    paddingVertical:  13,
    borderRadius:     10,
    borderWidth:      2,
    borderColor:      COLORS.energyBg,
    alignItems:       'center',
  },
  skipText: {
    color:      COLORS.subText,
    fontWeight: '700',
    fontSize:   14,
  },
  submitBtn: {
    flex:             2,
    paddingVertical:  13,
    borderRadius:     10,
    backgroundColor:  COLORS.buttonActive,
    alignItems:       'center',
  },
  submitText: {
    color:      '#fff',
    fontWeight: '800',
    fontSize:   15,
  },
});
