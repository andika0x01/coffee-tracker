-- Auth Tables (NextAuth v5 compatible)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  emailVerified DATETIME,
  image TEXT
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  providerAccountId TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  -- Add these if specifically requested by some adapter versions
  oauth_token_secret TEXT,
  oauth_token TEXT,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  sessionToken TEXT UNIQUE NOT NULL,
  userId TEXT NOT NULL,
  expires DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_token (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires DATETIME NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- App Data
CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  coffee_tbsp REAL NOT NULL DEFAULT 0,
  sugar_tbsp REAL NOT NULL DEFAULT 0,
  notes TEXT,
  logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_analysis (
  user_id TEXT PRIMARY KEY,
  analysis TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
