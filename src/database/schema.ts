export const CREATE_WORDS_TABLE = `
CREATE TABLE IF NOT EXISTS words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  level TEXT NOT NULL,
  synonyms TEXT,
  example_sentence TEXT,
  example_translation TEXT,
  etymology_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

export const CREATE_PROGRESS_TABLE = `
CREATE TABLE IF NOT EXISTS user_word_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word_id INTEGER UNIQUE NOT NULL,
  box INTEGER DEFAULT 1,
  status TEXT DEFAULT 'NEW',
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  last_reviewed_at DATETIME,
  next_review_at DATETIME NOT NULL,
  box_entry_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
);
`;

export const CREATE_DAILY_STATS_TABLE = `
CREATE TABLE IF NOT EXISTS daily_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  study_date DATE UNIQUE NOT NULL,
  new_words_learned INTEGER DEFAULT 0,
  words_reviewed INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0
);
`;

export const CREATE_USER_SETTINGS_TABLE = `
CREATE TABLE IF NOT EXISTS user_settings (
  id INTEGER PRIMARY KEY,
  daily_limit INTEGER DEFAULT 25,
  current_level TEXT DEFAULT 'B1',
  last_active_date DATE
);
`;

export const CREATE_INDEXES = `
CREATE INDEX IF NOT EXISTS idx_words_level ON words(level);
CREATE INDEX IF NOT EXISTS idx_words_category ON words(category);
CREATE INDEX IF NOT EXISTS idx_progress_box_next ON user_word_progress(box, next_review_at);
CREATE INDEX IF NOT EXISTS idx_progress_word_id ON user_word_progress(word_id);
`;
