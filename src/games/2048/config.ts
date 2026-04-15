const config = {
  supabase: {
    url:     process.env.EXPO_PUBLIC_SUPABASE_URL  ?? 'https://bjnxrjzojzalgfqhscpg.supabase.co',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqbnhyanpvanphbGdmcWhzY3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNTcyODksImV4cCI6MjA5MTYzMzI4OX0.ZjwNK5JgNBZ94t8p-s_xxNoOw7KVCePB5Os-Inehbts',
  },
} as const;

export default config;
