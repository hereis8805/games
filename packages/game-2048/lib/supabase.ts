import config from '../config';

const BASE = config.supabase.url + '/rest/v1';
const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': config.supabase.anonKey,
  'Authorization': 'Bearer ' + config.supabase.anonKey,
};

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  score: number;
  created_at: string;
}

export async function submitScore(nickname: string, score: number): Promise<string> {
  const res = await fetch(BASE + '/leaderboard', {
    method: 'POST',
    headers: Object.assign({}, HEADERS, { 'Prefer': 'return=representation' }),
    body: JSON.stringify({ nickname: nickname.trim(), score }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data[0].id as string;
}

export async function getLeaderboard(limit: number = 20): Promise<LeaderboardEntry[]> {
  const res = await fetch(
    BASE + '/leaderboard?select=id,nickname,score,created_at&order=score.desc&limit=' + limit,
    { headers: HEADERS }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
