-- =============================================
-- Thai Board Games — Supabase Schema
-- Run this in your Supabase SQL editor
-- =============================================

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    TEXT UNIQUE NOT NULL,
  avatar_seed TEXT NOT NULL DEFAULT 'default',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Player stats per game type
CREATE TABLE IF NOT EXISTS player_stats (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id  UUID REFERENCES players(id) ON DELETE CASCADE,
  game_type  TEXT NOT NULL,       -- 'makhos' | 'chess' | etc.
  wins       INT DEFAULT 0,
  losses     INT DEFAULT 0,
  draws      INT DEFAULT 0,
  elo        INT DEFAULT 1000,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, game_type)
);

-- Rooms / active games
CREATE TABLE IF NOT EXISTS rooms (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type    TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'waiting',  -- waiting | playing | finished
  player1_id   UUID REFERENCES players(id),
  player2_id   UUID REFERENCES players(id),
  current_turn UUID REFERENCES players(id),
  game_state   JSONB NOT NULL DEFAULT '{}',
  winner_id    UUID REFERENCES players(id),
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Game history
CREATE TABLE IF NOT EXISTS game_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id    UUID REFERENCES rooms(id),
  game_type  TEXT NOT NULL,
  player1_id UUID REFERENCES players(id),
  player2_id UUID REFERENCES players(id),
  winner_id  UUID REFERENCES players(id),
  moves      JSONB DEFAULT '[]',
  played_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE players       ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats  ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms         ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history  ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for leaderboard)
CREATE POLICY "Public read players"       ON players       FOR SELECT USING (true);
CREATE POLICY "Public read player_stats"  ON player_stats  FOR SELECT USING (true);
CREATE POLICY "Public read rooms"         ON rooms         FOR SELECT USING (true);
CREATE POLICY "Public read game_history"  ON game_history  FOR SELECT USING (true);

-- Allow public insert/update (no auth for simplicity)
CREATE POLICY "Public insert players"     ON players       FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update players"     ON players       FOR UPDATE USING (true);
CREATE POLICY "Public insert stats"       ON player_stats  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update stats"       ON player_stats  FOR UPDATE USING (true);
CREATE POLICY "Public insert rooms"       ON rooms         FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update rooms"       ON rooms         FOR UPDATE USING (true);
CREATE POLICY "Public insert history"     ON game_history  FOR INSERT WITH CHECK (true);

-- Enable realtime for rooms table
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;

-- Leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
  SELECT
    p.id,
    p.username,
    p.avatar_seed,
    ps.game_type,
    ps.wins,
    ps.losses,
    ps.draws,
    ps.elo,
    (ps.wins + ps.losses + ps.draws) AS total_games
  FROM players p
  JOIN player_stats ps ON p.id = ps.player_id
  ORDER BY ps.elo DESC;
