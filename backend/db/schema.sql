-- STEM Academia Olympiad Platform — PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'judge', 'participant', 'viewer')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ru VARCHAR(200) NOT NULL,
  name_kz VARCHAR(200),
  name_en VARCHAR(200),
  location VARCHAR(200),
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'finished')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  name_ru VARCHAR(100) NOT NULL,
  name_kz VARCHAR(100),
  name_en VARCHAR(100),
  max_attempts INT DEFAULT 2,
  time_limit_seconds INT DEFAULT 300
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  name VARCHAR(100) NOT NULL,
  organization VARCHAR(200),
  city VARCHAR(100),
  coach VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE arenas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  name VARCHAR(50) NOT NULL,
  judge_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'paused'))
);

CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  arena_id UUID REFERENCES arenas(id),
  judge_id UUID REFERENCES users(id),
  attempt_number INT NOT NULL CHECK (attempt_number IN (1, 2)),
  score INT DEFAULT 0,
  time_seconds NUMERIC(8,2),
  comment TEXT,
  submitted_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE score_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES attempts(id) ON DELETE CASCADE,
  criterion_key VARCHAR(50) NOT NULL,
  criterion_label VARCHAR(200),
  value INT DEFAULT 0,
  weight INT DEFAULT 1,
  is_penalty BOOLEAN DEFAULT FALSE
);

CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
  tournament_id UUID REFERENCES tournaments(id),
  category_id UUID REFERENCES categories(id),
  total_score INT DEFAULT 0,
  best_time_seconds NUMERIC(8,2),
  rank INT,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attempts_team ON attempts(team_id);
CREATE INDEX idx_results_tournament ON results(tournament_id, category_id);
CREATE INDEX idx_teams_tournament ON teams(tournament_id);

-- Demo data (passwords set via setup script)
INSERT INTO tournaments (name_ru, name_kz, name_en, location, start_date, end_date, status) VALUES
  ('STEM Academia Олимпиада 2026', 'STEM Academia Олимпиадасы 2026', 'STEM Academia Olympiad 2026',
   'Алматы, Казахстан', '2026-06-15', '2026-06-16', 'active');
