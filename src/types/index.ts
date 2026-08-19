export type WordLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export type CategoryType = 'VOCABULARY' | 'CONNECTOR' | 'PREFIX_ROOT' | 'IDIOM';

/**
 * Box Systems (Kutu Sistemi):
 * 0: Özel Tekrar Havuzu (Wrong pool - 24-hour review cooldown)
 * 1: Günlük Kutu (25 daily words + yesterday's expired cooldown words)
 * 2: Haftalık Kutu (Passed daily box; requires 7-day retention test)
 * 3: Aylık Kutu (Mastered pool; reviewed monthly / archived)
 */
export type BoxType = 0 | 1 | 2 | 3;

export type WordStatus = 'NEW' | 'LEARNING' | 'REVIEWING' | 'MASTERED';

export interface WordItem {
  id: number;
  word: string;
  meaning: string;
  category: CategoryType;
  subcategory?: string;
  level: WordLevel;
  synonyms?: string[];
  example_sentence?: string;
  example_translation?: string;
  etymology_note?: string;
  created_at?: string;
}

export interface WordProgress {
  id: number;
  word_id: number;
  box: BoxType;
  status: WordStatus;
  correct_count: number;
  incorrect_count: number;
  last_reviewed_at: string | null;
  next_review_at: string; // ISO string timestamp
  box_entry_date: string;
}

/**
 * Unified Card Data passed into CardComponent
 */
export interface CardWord extends WordItem {
  progress?: WordProgress;
  isCooldown?: boolean;
}

export interface DailyStats {
  study_date: string;
  new_words_learned: number;
  words_reviewed: number;
  correct_count: number;
  incorrect_count: number;
}

export interface BoxCountSummary {
  specialPoolCount: number; // Box 0
  dailyBoxCount: number;    // Box 1
  weeklyBoxCount: number;   // Box 2
  monthlyBoxCount: number;  // Box 3
  totalWords: number;
  learnedWords: number;
}

export interface UserSettings {
  daily_limit: number;      // Default 25
  current_level: WordLevel;
  last_active_date: string;
}
