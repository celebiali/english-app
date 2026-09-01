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

export interface VocabFolder {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  is_system?: boolean;
  category_type?: CategoryType;
  word_count?: number;
  learned_count?: number;
  created_at?: string;
}

export interface WordItem {
  id: number;
  word: string;
  meaning: string;
  category: CategoryType;
  subcategory?: string;
  folder_name?: string;
  level: WordLevel;
  synonyms?: string[];
  example_sentence?: string;
  example_translation?: string;
  etymology_note?: string;
  is_custom?: boolean;
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

export interface CardWord extends WordItem {
  progress?: WordProgress;
  isCooldown?: boolean;
  cardType?: 'NEW' | 'REVIEW';
  reviewBox?: number;
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

// ==========================================
// YDS QUESTION & EXAM MODELS
// ==========================================

export type YdsQuestionType =
  | 'PARAGRAPH'             // Reading Comprehension (4 questions per text or standalone)
  | 'CLOZE_TEST'            // 5 questions in 1 academic text
  | 'SENTENCE_COMPLETION'   // Cümle Tamamlama
  | 'VOCABULARY_GRAMMAR'    // Kelime, Preposition, Phrasal Verb, Tense
  | 'SKILL_DIALOGUE'        // Diyalog Tamamlama
  | 'RESTATEMENT'           // Anlamca En Yakın Cümle
  | 'TRANSLATION'           // TR-EN / EN-TR Çeviri
  | 'PARAGRAPH_COMPLETION'  // Paragraf Tamamlama
  | 'IRRELEVANT_SENTENCE';  // Anlamı Bozan Cümle

export type QuestionStatus =
  | 'ACTIVE'          // In active question pool (unsolved)
  | 'SOLVED_CORRECT'  // Correctly answered -> disappears from daily pool
  | 'MISTAKE'         // Wrongly answered -> moved to mistake vault
  | 'ARCHIVED';       // Permanently mastered / hidden from active queue

export type OptionKey = 'A' | 'B' | 'C' | 'D' | 'E';

export interface QuestionItem {
  id: number;
  type: YdsQuestionType;
  title?: string;
  passage?: string;          // Academic passage for Reading or Cloze test
  question_number?: number;  // e.g. 1 to 80 or 1 to 5
  question_text: string;     // The stem or blank
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correct_option: OptionKey;
  explanation: string;       // Detailed solution explanation
  subtopic?: string;         // e.g. "Contrast Connectors", "Medical Reading", "Phrasal Verbs"
  difficulty?: 'MEDIUM' | 'HARD' | 'YDS_EXAM';
  source?: string;           // "Master Deneme 1", "AI Generated"
  status: QuestionStatus;
  created_at?: string;
}

export interface UserQuestionProgress {
  id: number;
  question_id: number;
  selected_option: OptionKey | null;
  is_correct: boolean;
  time_spent_seconds?: number;
  answered_at: string;
}

export type YdsTrapType =
  | 'Tense Uyuşmazlığı'
  | 'Kapsam Aşımı'
  | 'Ters Nedensellik'
  | 'Anlamca Yakın Kelime Tuzağı'
  | 'Bağlaç Hatası'
  | 'Bağlaç/Bağlaç Anlamı Hatası'
  | 'Referans Hatası'
  | 'Referans (Zamir) Hatası'
  | 'Aşırı Genelleme'
  | 'Diğer';

export interface AIMistakeAnalysis {
  no_mistake?: boolean;
  trap_types?: YdsTrapType[];
  trap_type?: YdsTrapType;
  why_wrong?: string;
  correct_evidence?: string;
  evidence_source?: 'text_quote' | 'grammar_rule';
  confidence?: 'high' | 'medium' | 'low';
  summary?: string;
  why_correct?: string;
  why_distractor_failed?: string;
  key_vocabulary?: string[];
  grammar_rule?: string;
}

export interface AIWordMeaning {
  part_of_speech: string;
  turkish_meaning: string;
  cefr_level: string;
  formal_synonyms: { word: string; cefr_level: string }[];
  example_sentence_en: string;
  example_sentence_tr: string;
  context_note?: string;
}

export interface AIWordAutocompleteResult {
  word: string;
  meanings: AIWordMeaning[];
  frequency_note?: string;
}

export interface MistakeItem {
  id: number;
  question: QuestionItem;
  user_selected_option: OptionKey;
  ai_analysis?: AIMistakeAnalysis;
  is_reviewed: boolean;
  reviewed_at?: string;
  created_at: string;
}

// ==========================================
// 180-MIN FULL MOCK EXAM MODELS
// ==========================================

export interface MockExam {
  id: string;
  title: string;
  duration_minutes: number; // 180 for standard YDS
  total_questions: number;  // 80 for standard YDS
  questions: QuestionItem[];
  source_year?: string;
  description?: string;
}

export interface ExamSessionState {
  examId: string;
  title: string;
  timeRemainingSeconds: number; // Starts at 180 * 60 = 10800
  isPaused: boolean;
  currentQuestionIndex: number;
  userAnswers: Record<number, OptionKey>; // questionIndex -> selected Option
  flaggedQuestions: Record<number, boolean>; // questionIndex -> isFlagged
  isFinished: boolean;
}

export interface ExamScoreCard {
  examId: string;
  title: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
  netScore: number;
  ydsScore: number; // 100-point scale: (correctCount / totalQuestions) * 100
  levelGrade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  timeSpentSeconds: number;
  completedAt: string;
  categoryBreakdown: {
    type: YdsQuestionType;
    total: number;
    correct: number;
    wrong: number;
  }[];
  userAnswers?: Record<number, OptionKey>;
  questions?: QuestionItem[];
}

// ==========================================
// DAILY TO-DO TASK MODELS
// ==========================================

export interface TaskGoalsConfig {
  paragraph: number;
  cloze: number;
  sentence: number;
  skills: number;
}

export interface DailyTaskGoal {
  id: string;
  type: YdsQuestionType | 'VOCAB_REVIEW';
  title: string;
  targetCount: number;
  completedCount: number;
  iconName: string;
  color: string;
}

export interface DailyTasksState {
  date: string;
  isAllCompleted: boolean;
  streakCount: number;
  tasks: DailyTaskGoal[];
}

// ==========================================
// USER AUTH & PROFILE (APP STORE COMPLIANT)
// ==========================================

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  targetScore: number; // e.g. 70, 80, 90+
  isGuest: boolean;
  isPro?: boolean;
  proExpiresAt?: string;
  appliedPromoCode?: string;
  createdAt: string;
}

// ==========================================
// AFFILIATE / PROMO CODE & MONETIZATION
// ==========================================

export interface PromoCodeInfo {
  code: string;
  discountPercent: number; // e.g. 20 for 20%
  teacherName: string;
  channelName?: string;
  commissionPercent: number; // e.g. 20 for 20%
  isValid: boolean;
}

export interface SubscriptionPlan {
  id: string;
  title: string;
  durationMonths: number;
  originalPrice: number;
  discountedPrice?: number;
  badge?: string;
  isPopular?: boolean;
  features: string[];
}
