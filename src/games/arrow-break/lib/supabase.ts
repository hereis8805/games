import config from '../config';

const BASE = config.supabase.url + '/rest/v1';
const HEADERS = {
  'Content-Type': 'application/json',
  'apikey':        config.supabase.anonKey,
  'Authorization': 'Bearer ' + config.supabase.anonKey,
};

export interface LeaderboardEntry {
  id:         string;
  nickname:   string;
  score:      number;
  level:      number;
  created_at: string;
}

/** 점수 등록 → 생성된 레코드 id 반환 */
export async function submitScore(
  nickname: string,
  score:    number,
  level:    number,
): Promise<string> {
  const res = await fetch(BASE + '/arrow_break_leaderboard', {
    method:  'POST',
    headers: { ...HEADERS, 'Prefer': 'return=representation' },
    body:    JSON.stringify({ nickname: nickname.trim(), score, level }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data[0].id as string;
}

/** 상위 limit개 리더보드 조회 */
export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const res = await fetch(
    BASE + '/arrow_break_leaderboard'
      + '?select=id,nickname,score,level,created_at'
      + '&order=score.desc'
      + '&limit=' + limit,
    { headers: HEADERS },
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
