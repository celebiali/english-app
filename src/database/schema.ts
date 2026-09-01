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
  is_custom INTEGER DEFAULT 0,
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
  incorrect_count INTEGER DEFAULT 0,
  paragraph_completed INTEGER DEFAULT 0,
  cloze_completed INTEGER DEFAULT 0,
  sentence_completed INTEGER DEFAULT 0,
  skills_completed INTEGER DEFAULT 0
);
`;

export const CREATE_USER_SETTINGS_TABLE = `
CREATE TABLE IF NOT EXISTS user_settings (
  id INTEGER PRIMARY KEY,
  daily_limit INTEGER DEFAULT 25,
  current_level TEXT DEFAULT 'B1',
  last_active_date DATE,
  streak_count INTEGER DEFAULT 1,
  last_streak_date DATE,
  paragraph_goal INTEGER DEFAULT 8,
  cloze_goal INTEGER DEFAULT 5,
  sentence_goal INTEGER DEFAULT 8,
  skills_goal INTEGER DEFAULT 14
);
`;

export const CREATE_QUESTIONS_TABLE = `
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  title TEXT,
  passage TEXT,
  question_number INTEGER,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  option_e TEXT NOT NULL,
  correct_option TEXT NOT NULL,
  explanation TEXT NOT NULL,
  subtopic TEXT,
  difficulty TEXT DEFAULT 'YDS_EXAM',
  source TEXT DEFAULT 'YDS Question Bank',
  status TEXT DEFAULT 'ACTIVE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

export const CREATE_MISTAKE_VAULT_TABLE = `
CREATE TABLE IF NOT EXISTS mistake_vault (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  user_selected_option TEXT NOT NULL,
  ai_analysis_json TEXT,
  is_reviewed INTEGER DEFAULT 0,
  reviewed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);
`;

export const CREATE_EXAM_HISTORY_TABLE = `
CREATE TABLE IF NOT EXISTS exam_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id TEXT NOT NULL,
  title TEXT NOT NULL,
  total_questions INTEGER DEFAULT 80,
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  empty_count INTEGER DEFAULT 0,
  net_score REAL DEFAULT 0,
  yds_score REAL DEFAULT 0,
  level_grade TEXT DEFAULT 'C',
  time_spent_seconds INTEGER DEFAULT 0,
  category_breakdown_json TEXT,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

export const CREATE_USER_SESSION_TABLE = `
CREATE TABLE IF NOT EXISTS user_session (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  target_score INTEGER DEFAULT 80,
  is_guest INTEGER DEFAULT 0,
  is_pro INTEGER DEFAULT 0,
  pro_expires_at TEXT,
  applied_promo_code TEXT,
  provider TEXT DEFAULT 'email',
  token TEXT,
  created_at TEXT NOT NULL
);
`;

export const CREATE_VOCAB_FOLDERS_TABLE = `
CREATE TABLE IF NOT EXISTS vocab_folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_system INTEGER DEFAULT 0,
  category_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

export const CREATE_INDEXES = `
CREATE INDEX IF NOT EXISTS idx_words_level ON words(level);
CREATE INDEX IF NOT EXISTS idx_words_category ON words(category);
CREATE INDEX IF NOT EXISTS idx_words_subcategory ON words(subcategory);
CREATE INDEX IF NOT EXISTS idx_progress_box_next ON user_word_progress(box, next_review_at);
CREATE INDEX IF NOT EXISTS idx_progress_word_id ON user_word_progress(word_id);
CREATE INDEX IF NOT EXISTS idx_questions_type_status ON questions(type, status);
CREATE INDEX IF NOT EXISTS idx_mistake_vault_reviewed ON mistake_vault(is_reviewed);
CREATE INDEX IF NOT EXISTS idx_exam_history_completed ON exam_history(completed_at);
`;


