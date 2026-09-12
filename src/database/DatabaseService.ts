import {
  CREATE_WORDS_TABLE,
  CREATE_PROGRESS_TABLE,
  CREATE_DAILY_STATS_TABLE,
  CREATE_USER_SETTINGS_TABLE,
  CREATE_QUESTIONS_TABLE,
  CREATE_MISTAKE_VAULT_TABLE,
  CREATE_EXAM_HISTORY_TABLE,
  CREATE_USER_SESSION_TABLE,
  CREATE_VOCAB_FOLDERS_TABLE,
  CREATE_INDEXES,
} from './schema';
import {
  WordItem,
  WordProgress,
  BoxCountSummary,
  BoxType,
  QuestionItem,
  YdsQuestionType,
  OptionKey,
  MistakeItem,
  ExamScoreCard,
  UserProfile,
  TaskGoalsConfig,
  VocabFolder,
  CardWord,
} from '../types';
import { YdsQuestionBankService } from '../services/YdsQuestionBank';
import { DataParserService } from '../services/DataParserService';

export interface WordWithProgress extends WordItem {
  isStudied: boolean;
  box: BoxType | null;
  status: string | null;
  correctCount: number;
  incorrectCount: number;
  nextReviewAt?: string | null;
  isUnlocked?: boolean;
  daysRemaining?: number;
}

class MemoryDatabase {
  words: Map<number, WordItem> = new Map();
  progress: Map<number, WordProgress> = new Map();
  questions: Map<number, QuestionItem> = new Map();
  mistakes: Map<number, MistakeItem> = new Map();
  folders: Map<string, VocabFolder> = new Map();
  examHistory: ExamScoreCard[] = [];
  userSession: UserProfile | null = null;
  taskGoals: TaskGoalsConfig = { paragraph: 8, cloze: 5, sentence: 8, skills: 14, words: 25 };
  dailyTaskStats: Map<string, {
    paragraphCompleted: number;
    clozeCompleted: number;
    sentenceCompleted: number;
    skillsCompleted: number;
    vocabCompleted: number;
  }> = new Map();
  questionStreak: { count: number; lastDate: string } = { count: 0, lastDate: '' };
  vocabStreak: { count: number; lastDate: string } = { count: 0, lastDate: '' };
  streak: { count: number; lastDate: string } = { count: 0, lastDate: '' };
  activeStudyFolderId: string = 'sys_conn';
  autoWordId = 1;
  autoQuestionId = 1;
  autoMistakeId = 1;

  async init() {
    if (this.folders.size === 0) {
      this.folders.set('sys_conn', {
        id: 'sys_conn',
        name: 'Bağlaçlar ve Yapılar',
        description: 'Zaman, Zıtlık, Sebep ve Koşul Bağlaçları (127 Kelime)',
        color: '#0EA5E9',
        icon: 'Link',
        is_system: true,
        category_type: 'CONNECTOR',
      });
      this.folders.set('sys_root', {
        id: 'sys_root',
        name: 'Etimoloji ve Kökler',
        description: 'Latin & Grek Kökler, Ön ve Son Ekler (215 Kelime)',
        color: '#8B5CF6',
        icon: 'Dna',
        is_system: true,
        category_type: 'PREFIX_ROOT',
      });
      this.folders.set('sys_idiom', {
        id: 'sys_idiom',
        name: 'Deyimler ve Kalıplar',
        description: 'Oxford YDS Sık Kullanılan Kalıp İfadeler (1054 İfade)',
        color: '#F59E0B',
        icon: 'MessageSquareQuote',
        is_system: true,
        category_type: 'IDIOM',
      });
      this.folders.set('sys_vocab_a', {
        id: 'sys_vocab_a',
        name: 'A1 - A2 Temel Kelimeler',
        description: 'Başlangıç ve Temel Seviye Kelimeler (3300+ Kelime)',
        color: '#2563EB',
        icon: 'BookOpen',
        is_system: true,
        category_type: 'VOCABULARY',
        level_filter: 'A1,A2',
      });
      this.folders.set('sys_vocab_b', {
        id: 'sys_vocab_b',
        name: 'B1 - B2 YDS Odak Kelimeler',
        description: 'Orta ve İleri Orta YDS Sınav Kelimeleri (3800+ Kelime)',
        color: '#4F46E5',
        icon: 'Sparkles',
        is_system: true,
        category_type: 'VOCABULARY',
        level_filter: 'B1,B2',
      });
      this.folders.set('sys_vocab_c', {
        id: 'sys_vocab_c',
        name: 'C1 İleri Akademik Kelimeler',
        description: 'Üst Seviye Akademik Makale ve Paragraf Kelimeleri (1800+ Kelime)',
        color: '#EC4899',
        icon: 'GraduationCap',
        is_system: true,
        category_type: 'VOCABULARY',
        level_filter: 'C1',
      });
      this.folders.set('custom_default', {
        id: 'custom_default',
        name: 'Özel Kelime Defterim',
        description: 'Eklediğim tüm özel kelimeler',
        color: '#F97316',
        icon: 'Star',
        is_system: false,
      });
    }
  }

  async insertWord(item: Omit<WordItem, 'id'>): Promise<number> {
    const id = this.autoWordId++;
    const word: WordItem = { ...item, id };
    this.words.set(id, word);
    return id;
  }

  async insertQuestion(item: Omit<QuestionItem, 'id'>): Promise<number> {
    const id = this.autoQuestionId++;
    const question: QuestionItem = { ...item, id };
    this.questions.set(id, question);
    return id;
  }
}

class DatabaseService {
  private memoryDb: MemoryDatabase = new MemoryDatabase();
  private isNative: boolean = false;
  private dbInstance: any = null;

  async initDatabase(): Promise<void> {
    try {
      const SQLite: any = await import('expo-sqlite');
      if (SQLite && SQLite.openDatabaseAsync) {
        this.dbInstance = await SQLite.openDatabaseAsync('yds_vocab.db');
        this.isNative = true;
        await this.execNativeSchema();
        await this.seedQuestionsIfEmpty();
        await this.seedWordsIfEmpty();
        return;
      }
    } catch (e) {
      console.warn('Native SQLite unavailable. Falling back to Memory Database Layer.', e);
    }
    this.isNative = false;
    await this.memoryDb.init();
    await this.seedQuestionsIfEmpty();
    await this.seedWordsIfEmpty();
  }

  private async execNativeSchema(): Promise<void> {
    if (!this.dbInstance) return;
    await this.dbInstance.execAsync(CREATE_WORDS_TABLE);
    await this.dbInstance.execAsync(CREATE_PROGRESS_TABLE);
    await this.dbInstance.execAsync(CREATE_DAILY_STATS_TABLE);
    await this.dbInstance.execAsync(CREATE_USER_SETTINGS_TABLE);
    await this.dbInstance.execAsync(CREATE_QUESTIONS_TABLE);
    await this.dbInstance.execAsync(CREATE_MISTAKE_VAULT_TABLE);
    await this.dbInstance.execAsync(CREATE_EXAM_HISTORY_TABLE);
    await this.dbInstance.execAsync(CREATE_USER_SESSION_TABLE);
    await this.dbInstance.execAsync(CREATE_VOCAB_FOLDERS_TABLE);
    await this.dbInstance.execAsync(CREATE_INDEXES);

    // Safely ensure daily_stats columns exist in existing SQLite DBs
    try {
      await this.dbInstance.execAsync(`ALTER TABLE daily_stats ADD COLUMN paragraph_completed INTEGER DEFAULT 0;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE daily_stats ADD COLUMN cloze_completed INTEGER DEFAULT 0;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE daily_stats ADD COLUMN sentence_completed INTEGER DEFAULT 0;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE daily_stats ADD COLUMN skills_completed INTEGER DEFAULT 0;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`DELETE FROM exam_history WHERE (correct_count + wrong_count) = 0;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE user_settings ADD COLUMN paragraph_goal INTEGER DEFAULT 8;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE user_settings ADD COLUMN cloze_goal INTEGER DEFAULT 5;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE user_settings ADD COLUMN sentence_goal INTEGER DEFAULT 8;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE user_settings ADD COLUMN skills_goal INTEGER DEFAULT 14;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE questions ADD COLUMN user_id TEXT;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE questions ADD COLUMN generation_date DATE;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE questions ADD COLUMN difficulty TEXT DEFAULT 'YDS_EXAM';`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE questions ADD COLUMN source TEXT;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE questions ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE mistake_vault ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE mistake_vault ADD COLUMN reviewed_at DATETIME;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE user_session ADD COLUMN applied_promo_code TEXT;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE user_settings ADD COLUMN last_ai_generation_date DATE;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE user_settings ADD COLUMN question_streak_count INTEGER DEFAULT 0;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE user_settings ADD COLUMN last_question_date DATE;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE user_settings ADD COLUMN vocab_streak_count INTEGER DEFAULT 0;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE user_settings ADD COLUMN last_vocab_date DATE;`);
    } catch (_) {}

    try {
      await this.dbInstance.execAsync(`ALTER TABLE user_settings ADD COLUMN active_study_folder_id TEXT DEFAULT 'sys_conn';`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE vocab_folders ADD COLUMN level_filter TEXT;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE words ADD COLUMN part_of_speech TEXT;`);
    } catch (_) {}
    try {
      await this.dbInstance.execAsync(`ALTER TABLE words ADD COLUMN image_url TEXT;`);
    } catch (_) {}

    // Clean up any unstudied dummy rows from user_word_progress
    try {
      await this.dbInstance.execAsync(`
        DELETE FROM user_word_progress 
        WHERE (correct_count IS NULL OR correct_count = 0) 
          AND (incorrect_count IS NULL OR incorrect_count = 0);
      `);
    } catch (_) {}

    // Fix words that jumped to Box 2 on 1st correct answer -> move back to Box 1 (1. Gün)
    try {
      await this.dbInstance.execAsync(`
        UPDATE user_word_progress 
        SET box = 1, next_review_at = datetime('now', '+1 day'), status = 'LEARNING'
        WHERE box = 2 AND (correct_count IS NULL OR correct_count <= 1);
      `);
    } catch (_) {}

    // Reset streak if user has 0 completed activity
    try {
      await this.dbInstance.execAsync(`
        UPDATE user_settings 
        SET 
          streak_count = 0, last_active_date = NULL,
          question_streak_count = 0, last_question_date = NULL,
          vocab_streak_count = 0, last_vocab_date = NULL
        WHERE id = 1 AND (
          (SELECT COUNT(*) FROM questions WHERE status != 'ACTIVE') = 0 
          AND (SELECT COUNT(*) FROM user_word_progress WHERE correct_count > 0 OR incorrect_count > 0) = 0
          AND (SELECT COUNT(*) FROM daily_stats WHERE (paragraph_completed + cloze_completed + sentence_completed + skills_completed + new_words_learned + words_reviewed) > 0) = 0
        );
      `);
    } catch (_) {}

    // Update default folder color from green to blue
    try {
      await this.dbInstance.execAsync(`UPDATE vocab_folders SET color = '#2563EB' WHERE id = 'sys_vocab_a' AND color = '#10B981';`);
    } catch (_) {}

    // Seed default folders
    await this.seedDefaultFoldersIfEmpty();

    await this.dbInstance.runAsync(
      `INSERT OR IGNORE INTO user_settings (id, daily_limit, current_level, last_active_date, streak_count, question_streak_count, last_question_date, vocab_streak_count, last_vocab_date, paragraph_goal, cloze_goal, sentence_goal, skills_goal, active_study_folder_id) VALUES (1, 25, 'A1', NULL, 0, 0, NULL, 0, NULL, 8, 5, 8, 14, 'sys_conn')`
    );
  }

  /**
   * Guaranteed seeding of system vocabulary folders
   */
  async seedDefaultFoldersIfEmpty(): Promise<void> {
    const defaultFolders = [
      {
        id: 'sys_conn',
        name: 'Bağlaçlar ve Yapılar',
        description: 'Zaman, Zıtlık, Sebep ve Koşul Bağlaçları (127 Kelime)',
        color: '#0EA5E9',
        icon: 'Link',
        is_system: 1,
        category_type: 'CONNECTOR',
        level_filter: null,
      },
      {
        id: 'sys_root',
        name: 'Etimoloji ve Kökler',
        description: 'Latin & Grek Kökler, Ön ve Son Ekler (215 Kelime)',
        color: '#8B5CF6',
        icon: 'Dna',
        is_system: 1,
        category_type: 'PREFIX_ROOT',
        level_filter: null,
      },
      {
        id: 'sys_idiom',
        name: 'Deyimler ve Kalıplar',
        description: 'Oxford YDS Sık Kullanılan Kalıp İfadeler (1054 İfade)',
        color: '#F59E0B',
        icon: 'MessageSquareQuote',
        is_system: 1,
        category_type: 'IDIOM',
        level_filter: null,
      },
      {
        id: 'sys_vocab_a',
        name: 'A1 - A2 Temel Kelimeler',
        description: 'Başlangıç ve Temel Seviye Kelimeler (3300+ Kelime)',
        color: '#2563EB',
        icon: 'BookOpen',
        is_system: 1,
        category_type: 'VOCABULARY',
        level_filter: 'A1,A2',
      },
      {
        id: 'sys_vocab_b',
        name: 'B1 - B2 YDS Odak Kelimeler',
        description: 'Orta ve İleri Orta YDS Sınav Kelimeleri (3800+ Kelime)',
        color: '#4F46E5',
        icon: 'Sparkles',
        is_system: 1,
        category_type: 'VOCABULARY',
        level_filter: 'B1,B2',
      },
      {
        id: 'sys_vocab_c',
        name: 'C1 İleri Akademik Kelimeler',
        description: 'Üst Seviye Akademik Makale ve Paragraf Kelimeleri (1800+ Kelime)',
        color: '#EC4899',
        icon: 'GraduationCap',
        is_system: 1,
        category_type: 'VOCABULARY',
        level_filter: 'C1',
      },
      {
        id: 'custom_default',
        name: 'Özel Kelime Defterim',
        description: 'Eklediğim tüm özel kelimeler',
        color: '#F97316',
        icon: 'Star',
        is_system: 0,
        category_type: null,
        level_filter: null,
      },
    ];

    if (!this.isNative) {
      for (const f of defaultFolders) {
        if (!this.memoryDb.folders.has(f.id)) {
          this.memoryDb.folders.set(f.id, {
            id: f.id,
            name: f.name,
            description: f.description,
            color: f.color,
            icon: f.icon,
            is_system: f.is_system === 1,
            category_type: f.category_type as any,
            level_filter: f.level_filter || undefined,
          });
        }
      }
      return;
    }

    // Clean up old single sys_vocab if it exists
    try {
      await this.dbInstance.runAsync(`DELETE FROM vocab_folders WHERE id = 'sys_vocab'`);
    } catch (_) {}

    for (const f of defaultFolders) {
      try {
        await this.dbInstance.runAsync(
          `INSERT OR IGNORE INTO vocab_folders (id, name, description, color, icon, is_system, category_type, level_filter)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [f.id, f.name, f.description, f.color, f.icon, f.is_system, f.category_type, f.level_filter]
        );
      } catch (err) {
        console.warn('Error inserting folder:', f.id, err);
      }
    }
  }

  async getActiveStudyFolderId(): Promise<string> {
    if (!this.isNative) {
      return this.memoryDb.activeStudyFolderId || 'custom_default';
    }
    try {
      const row: any = await this.dbInstance.getFirstAsync(
        `SELECT active_study_folder_id FROM user_settings WHERE id = 1`
      );
      return row?.active_study_folder_id || 'custom_default';
    } catch (e) {
      return 'custom_default';
    }
  }

  async setActiveStudyFolderId(folderId: string): Promise<void> {
    if (!this.isNative) {
      this.memoryDb.activeStudyFolderId = folderId;
      return;
    }
    try {
      await this.dbInstance.runAsync(
        `UPDATE user_settings SET active_study_folder_id = ? WHERE id = 1`,
        [folderId]
      );
    } catch (e) {
      console.warn('Failed to update active study folder id:', e);
    }
  }

  /**
   * Reads user's dynamic daily question & vocabulary task goals
   */
  async getUserTaskGoals(): Promise<TaskGoalsConfig> {
    const defaultGoals: TaskGoalsConfig = { paragraph: 8, cloze: 5, sentence: 8, skills: 14, words: 25 };
    if (!this.isNative) {
      return this.memoryDb.taskGoals || defaultGoals;
    }

    try {
      const row: any = await this.dbInstance.getFirstAsync(
        `SELECT paragraph_goal, cloze_goal, sentence_goal, skills_goal, daily_limit FROM user_settings WHERE id = 1`
      );
      if (row) {
        return {
          paragraph: Number(row.paragraph_goal) || 8,
          cloze: Number(row.cloze_goal) || 5,
          sentence: Number(row.sentence_goal) || 8,
          skills: Number(row.skills_goal) || 14,
          words: Number(row.daily_limit) || 25,
        };
      }
    } catch (e) {
      console.warn('Failed to load user task goals from SQLite:', e);
    }
    return defaultGoals;
  }

  /**
   * Saves user's dynamic daily question & vocabulary task goals
   */
  async saveUserTaskGoals(goals: TaskGoalsConfig): Promise<void> {
    const wordsGoal = goals.words !== undefined ? goals.words : (this.memoryDb.taskGoals?.words || 25);
    if (!this.isNative) {
      this.memoryDb.taskGoals = { ...goals, words: wordsGoal };
      return;
    }

    try {
      await this.dbInstance.runAsync(
        `UPDATE user_settings SET paragraph_goal = ?, cloze_goal = ?, sentence_goal = ?, skills_goal = ?, daily_limit = ? WHERE id = 1`,
        [goals.paragraph, goals.cloze, goals.sentence, goals.skills, wordsGoal]
      );
    } catch (e) {
      console.warn('Failed to save user task goals in SQLite:', e);
    }
  }

  /**
   * Seeds initial YDS questions if empty
   */
  async seedQuestionsIfEmpty(): Promise<void> {
    const initialList = YdsQuestionBankService.getInitialQuestions();

    if (!this.isNative) {
      if (this.memoryDb.questions.size < initialList.length) {
        for (const q of initialList) {
          await this.memoryDb.insertQuestion(q);
        }
      }
      return;
    }

    const countRes = await this.dbInstance.getFirstAsync(`SELECT COUNT(*) as cnt FROM questions`);
    if (!countRes || countRes.cnt < initialList.length) {
      await this.dbInstance.withTransactionAsync(async () => {
        for (const q of initialList) {
          const exists = await this.dbInstance.getFirstAsync(
            `SELECT id FROM questions WHERE question_text = ? LIMIT 1`,
            [q.question_text]
          );
          if (!exists) {
            await this.dbInstance.runAsync(
              `INSERT INTO questions (type, title, passage, question_number, question_text, option_a, option_b, option_c, option_d, option_e, correct_option, explanation, subtopic, difficulty, source, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                q.type,
                q.title || null,
                q.passage || null,
                q.question_number || null,
                q.question_text,
                q.options.A,
                q.options.B,
                q.options.C,
                q.options.D,
                q.options.E,
                q.correct_option,
                q.explanation,
                q.subtopic || null,
                q.difficulty || 'YDS_EXAM',
                q.source || 'YDS Question Bank',
                q.status || 'ACTIVE',
              ]
            );
          }
        }
      });
    }
  }

  /**
   * Guaranteed seeding of base vocabulary dataset (Connectors, Roots, Academic Core)
   */
  async seedWordsIfEmpty(): Promise<void> {
    const initialList = DataParserService.getFullSeedDataset();

    if (!this.isNative) {
      if (this.memoryDb.words.size < 50) {
        for (const w of initialList) {
          await this.memoryDb.insertWord(w);
        }
      }
      return;
    }

    try {
      const countRes: any = await this.dbInstance.getFirstAsync(`SELECT COUNT(*) as cnt FROM words`);
      if (!countRes || countRes.cnt < 50) {
        const CHUNK_SIZE = 50;
        await this.dbInstance.withTransactionAsync(async () => {
          for (let i = 0; i < initialList.length; i += CHUNK_SIZE) {
            const chunk = initialList.slice(i, i + CHUNK_SIZE);
            const placeholders = chunk.map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?)`).join(', ');
            const sql = `INSERT INTO words (word, meaning, category, subcategory, level, synonyms, example_sentence, example_translation, etymology_note) VALUES ${placeholders}`;
            const params: any[] = [];
            for (const w of chunk) {
              params.push(
                w.word,
                w.meaning,
                w.category || 'VOCABULARY',
                w.subcategory || null,
                w.level || 'B1',
                w.synonyms ? JSON.stringify(w.synonyms) : null,
                w.example_sentence || null,
                w.example_translation || null,
                w.etymology_note || null
              );
            }
            await this.dbInstance.runAsync(sql, params);
          }
        });
      }
    } catch (e) {
      console.warn('Failed to seed words in SQLite:', e);
    }
  }

  // ==========================================
  // DYNAMIC QUESTION POOL METHODS
  // ==========================================

  /**
   * Fetches active questions for daily tasks according to dynamic category goals.
   * User-scoped: prioritizes questions belonging to this user or fallback to initial pool.
   */
  async getDailyTaskQuestions(
    goals: TaskGoalsConfig = { paragraph: 8, cloze: 5, sentence: 8, skills: 14 },
    userId?: string
  ): Promise<QuestionItem[]> {
    const paragraphs = await this.getActiveQuestionsByType('PARAGRAPH', goals.paragraph, userId);
    const clozes = await this.getActiveQuestionsByType('CLOZE_TEST', goals.cloze, userId);
    const sentences = await this.getActiveQuestionsByType('SENTENCE_COMPLETION', goals.sentence, userId);
    const skills = await this.getActiveQuestionsByType('SKILL_DIALOGUE', goals.skills, userId);

    return [...paragraphs, ...clozes, ...sentences, ...skills];
  }

  /**
   * Fetches active questions for daily tasks by question type.
   * Only returns questions with status = 'ACTIVE'.
   * Correctly answered questions disappear from this active query!
   * Scoped to specific userId, prioritizing user's customized questions.
   */
  async getActiveQuestionsByType(
    type?: YdsQuestionType,
    limit: number = 20,
    userId?: string
  ): Promise<QuestionItem[]> {
    if (!this.isNative) {
      let filtered = Array.from(this.memoryDb.questions.values()).filter((q) => {
        if (q.status !== 'ACTIVE') return false;
        if (userId) {
          return q.user_id === userId || !q.user_id;
        }
        return true;
      });

      if (type) {
        if (type === 'SKILL_DIALOGUE') {
          filtered = filtered.filter(
            (q) =>
              q.type === 'SKILL_DIALOGUE' ||
              q.type === 'RESTATEMENT' ||
              q.type === 'TRANSLATION' ||
              q.type === 'VOCABULARY_GRAMMAR'
          );
        } else {
          filtered = filtered.filter((q) => q.type === type);
        }
      }

      if (userId) {
        filtered.sort((a, b) => {
          const aUser = a.user_id === userId ? 0 : 1;
          const bUser = b.user_id === userId ? 0 : 1;
          if (aUser !== bUser) return aUser - bUser;
          return a.id - b.id;
        });
      }

      return filtered.slice(0, limit);
    }

    try {
      let query = `SELECT * FROM questions WHERE status = 'ACTIVE'`;
      const params: any[] = [];

      if (userId) {
        query += ` AND (user_id = ? OR user_id IS NULL)`;
        params.push(userId);
      }

      if (type) {
        if (type === 'SKILL_DIALOGUE') {
          query += ` AND type IN ('SKILL_DIALOGUE', 'RESTATEMENT', 'TRANSLATION', 'VOCABULARY_GRAMMAR')`;
        } else {
          query += ` AND type = ?`;
          params.push(type);
        }
      }

      if (userId) {
        query += ` ORDER BY CASE WHEN user_id = ? THEN 0 ELSE 1 END, id ASC LIMIT ?`;
        params.push(userId, limit);
      } else {
        query += ` ORDER BY id ASC LIMIT ?`;
        params.push(limit);
      }

      const rows = await this.dbInstance.getAllAsync(query, params);
      return (rows || []).map((r: any) => this.mapRowToQuestion(r));
    } catch (err) {
      console.warn('getActiveQuestionsByType query error, falling back:', err);
      return [];
    }
  }

  /**
   * Completes a question:
   * - If isCorrect === true: Question status becomes 'SOLVED_CORRECT' (graduates / disappears from active pool!)
   * - If isCorrect === false: Question status becomes 'MISTAKE' and added into mistake_vault
   */
  async completeQuestion(
    questionId: number,
    userSelectedOption: OptionKey,
    isCorrect: boolean
  ): Promise<void> {
    const newStatus = isCorrect ? 'SOLVED_CORRECT' : 'MISTAKE';

    if (!this.isNative) {
      const q = this.memoryDb.questions.get(questionId);
      if (q) {
        q.status = newStatus;
        if (!isCorrect) {
          const mId = this.memoryDb.autoMistakeId++;
          this.memoryDb.mistakes.set(mId, {
            id: mId,
            question: q,
            user_selected_option: userSelectedOption,
            is_reviewed: false,
            created_at: new Date().toISOString(),
          });
        }
      }
      return;
    }

    await this.dbInstance.runAsync(`UPDATE questions SET status = ? WHERE id = ?`, [newStatus, questionId]);

    if (!isCorrect) {
      await this.dbInstance.runAsync(
        `INSERT INTO mistake_vault (question_id, user_selected_option, is_reviewed, created_at)
         VALUES (?, ?, 0, datetime('now'))`,
        [questionId, userSelectedOption]
      );
    }
  }

  /**
   * Inserts a newly generated AI question into the active pool
   */
  async insertGeneratedQuestion(item: Omit<QuestionItem, 'id'>): Promise<number> {
    if (!this.isNative) {
      return await this.memoryDb.insertQuestion(item);
    }

    const res = await this.dbInstance.runAsync(
      `INSERT INTO questions (user_id, generation_date, type, title, passage, question_number, question_text, option_a, option_b, option_c, option_d, option_e, correct_option, explanation, subtopic, difficulty, source, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.user_id || null,
        item.generation_date || null,
        item.type,
        item.title || null,
        item.passage || null,
        item.question_number || null,
        item.question_text,
        item.options.A,
        item.options.B,
        item.options.C,
        item.options.D,
        item.options.E,
        item.correct_option,
        item.explanation,
        item.subtopic || null,
        item.difficulty || 'YDS_EXAM',
        item.source || 'AI Generated',
        'ACTIVE',
      ]
    );

    return res.lastInsertRowId;
  }

  /**
   * Checks whether questions have already been generated for this specific user today
   */
  async hasGeneratedQuestionsForToday(userId: string, dateStr: string): Promise<boolean> {
    if (!this.isNative) {
      return Array.from(this.memoryDb.questions.values()).some(
        (q) => q.user_id === userId && q.generation_date === dateStr
      );
    }

    try {
      const row: any = await this.dbInstance.getFirstAsync(
        `SELECT COUNT(*) as cnt FROM questions WHERE user_id = ? AND generation_date = ?`,
        [userId, dateStr]
      );
      return row ? row.cnt > 0 : false;
    } catch (e) {
      console.warn('Error checking hasGeneratedQuestionsForToday:', e);
      return false;
    }
  }

  /**
   * Inserts an entire daily batch of questions for a specific user into SQLite atomically
   */
  async insertBatchQuestions(
    questions: Array<Omit<QuestionItem, 'id'>>,
    userId: string,
    generationDate: string
  ): Promise<number[]> {
    const insertedIds: number[] = [];

    if (!this.isNative) {
      for (const q of questions) {
        const id = await this.memoryDb.insertQuestion({
          ...q,
          user_id: userId,
          generation_date: generationDate,
        });
        insertedIds.push(id);
      }
      return insertedIds;
    }

    await this.dbInstance.withTransactionAsync(async () => {
      for (const item of questions) {
        const res = await this.dbInstance.runAsync(
          `INSERT INTO questions (
            user_id, generation_date, type, title, passage, question_number,
            question_text, option_a, option_b, option_c, option_d, option_e,
            correct_option, explanation, subtopic, difficulty, source, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            generationDate,
            item.type,
            item.title || null,
            item.passage || null,
            item.question_number || null,
            item.question_text,
            item.options.A,
            item.options.B,
            item.options.C,
            item.options.D,
            item.options.E,
            item.correct_option,
            item.explanation,
            item.subtopic || null,
            item.difficulty || 'YDS_EXAM',
            item.source || 'AI Günlük İkmal',
            'ACTIVE',
          ]
        );
        insertedIds.push(res.lastInsertRowId);
      }
    });

    return insertedIds;
  }

  /**
   * Reads last AI question generation date
   */
  async getLastAIGenerationDate(userId?: string): Promise<string | null> {
    if (!this.isNative) {
      return (this.memoryDb as any).lastAiGenerationDate || null;
    }

    try {
      if (userId) {
        const qRow: any = await this.dbInstance.getFirstAsync(
          `SELECT generation_date FROM questions WHERE user_id = ? ORDER BY id DESC LIMIT 1`,
          [userId]
        );
        if (qRow && qRow.generation_date) {
          return qRow.generation_date;
        }
      }

      const row: any = await this.dbInstance.getFirstAsync(
        `SELECT last_ai_generation_date FROM user_settings WHERE id = 1`
      );
      return row?.last_ai_generation_date || null;
    } catch (e) {
      console.warn('Error reading last_ai_generation_date:', e);
      return null;
    }
  }

  /**
   * Updates last AI question generation date
   */
  async setLastAIGenerationDate(dateStr: string): Promise<void> {
    if (!this.isNative) {
      (this.memoryDb as any).lastAiGenerationDate = dateStr;
      return;
    }

    try {
      await this.dbInstance.runAsync(
        `UPDATE user_settings SET last_ai_generation_date = ? WHERE id = 1`,
        [dateStr]
      );
    } catch (e) {
      console.warn('Error updating last_ai_generation_date:', e);
    }
  }

  // ==========================================
  // MISTAKE VAULT & AI ANALYSIS METHODS
  // ==========================================

  async getMistakeItems(): Promise<MistakeItem[]> {
    if (!this.isNative) {
      return Array.from(this.memoryDb.mistakes.values()).filter((m) => !m.is_reviewed);
    }

    const rows = await this.dbInstance.getAllAsync(
      `SELECT mv.id as mistake_id, mv.user_selected_option, mv.ai_analysis_json, mv.is_reviewed, mv.created_at as mistake_created_at,
              q.*
       FROM mistake_vault mv
       JOIN questions q ON mv.question_id = q.id
       WHERE mv.is_reviewed = 0
       ORDER BY mv.id DESC`
    );

    if (!rows || rows.length === 0) {
      return [];
    }

    return rows.map((r: any) => ({
      id: r.mistake_id,
      user_selected_option: r.user_selected_option,
      ai_analysis: r.ai_analysis_json ? JSON.parse(r.ai_analysis_json) : undefined,
      is_reviewed: r.is_reviewed === 1,
      created_at: r.mistake_created_at,
      question: this.mapRowToQuestion(r),
    }));
  }

  async saveMistakeAIAnalysis(mistakeId: number, analysis: any): Promise<void> {
    if (!this.isNative) {
      const m = this.memoryDb.mistakes.get(mistakeId);
      if (m) m.ai_analysis = analysis;
      return;
    }

    await this.dbInstance.runAsync(
      `UPDATE mistake_vault SET ai_analysis_json = ? WHERE id = ?`,
      [JSON.stringify(analysis), mistakeId]
    );
  }

  /**
   * "Öğrendim / Kasadan Kaldır" button: marks mistake as reviewed and question as ARCHIVED
   */
  async archiveMistake(mistakeId: number, questionId: number): Promise<void> {
    if (!this.isNative) {
      const m = this.memoryDb.mistakes.get(mistakeId);
      if (m) m.is_reviewed = true;
      const q = this.memoryDb.questions.get(questionId);
      if (q) q.status = 'ARCHIVED';
      return;
    }

    await this.dbInstance.runAsync(
      `UPDATE mistake_vault SET is_reviewed = 1, reviewed_at = datetime('now') WHERE id = ?`,
      [mistakeId]
    );
    await this.dbInstance.runAsync(`UPDATE questions SET status = 'ARCHIVED' WHERE id = ?`, [questionId]);
  }

  // ==========================================
  // 180-MIN FULL MOCK EXAM METHODS
  // ==========================================

  async saveExamResult(result: ExamScoreCard): Promise<void> {
    // Only save legitimate exams where at least one question was answered
    if ((result.correctCount + result.wrongCount) === 0) {
      return;
    }

    if (!this.isNative) {
      this.memoryDb.examHistory.unshift(result);
      return;
    }

    await this.dbInstance.runAsync(
      `INSERT INTO exam_history
       (exam_id, title, total_questions, correct_count, wrong_count, empty_count, net_score, yds_score, level_grade, time_spent_seconds, category_breakdown_json, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        result.examId,
        result.title,
        result.totalQuestions,
        result.correctCount,
        result.wrongCount,
        result.emptyCount,
        result.netScore,
        result.ydsScore,
        result.levelGrade,
        result.timeSpentSeconds,
        JSON.stringify(result.categoryBreakdown),
      ]
    );
  }

  async getExamHistory(): Promise<ExamScoreCard[]> {
    if (!this.isNative) {
      return this.memoryDb.examHistory.filter(
        (h) => h && (h.correctCount + h.wrongCount > 0)
      );
    }

    const rows = await this.dbInstance.getAllAsync(
      `SELECT * FROM exam_history WHERE (correct_count + wrong_count) > 0 ORDER BY id DESC LIMIT 20`
    );

    return rows.map((r: any) => ({
      examId: r.exam_id,
      title: r.title,
      totalQuestions: r.total_questions,
      correctCount: r.correct_count,
      wrongCount: r.wrong_count,
      emptyCount: r.empty_count,
      netScore: r.net_score,
      ydsScore: r.yds_score,
      levelGrade: r.level_grade,
      timeSpentSeconds: r.time_spent_seconds,
      completedAt: r.completed_at,
      categoryBreakdown: r.category_breakdown_json ? JSON.parse(r.category_breakdown_json) : [],
    }));
  }

  // ==========================================
  // VOCABULARY FOLDER & CUSTOM WORD METHODS
  // ==========================================

  async getVocabFolders(cachedWords?: WordWithProgress[]): Promise<VocabFolder[]> {
    const allWords = cachedWords || (await this.getAllWordsWithProgress());

    if (!this.isNative) {
      await this.memoryDb.init();
      const otherCustomNames = Array.from(this.memoryDb.folders.values())
        .filter((f) => !f.is_system && f.id !== 'custom_default')
        .map((f) => f.name.toLowerCase());

      return Array.from(this.memoryDb.folders.values()).map((f) => {
        let matchingWords: WordWithProgress[] = [];
        if (f.is_system && f.category_type) {
          if (f.level_filter) {
            const allowed = f.level_filter.split(',').map((s) => s.trim());
            matchingWords = allWords.filter(
              (w) => w.category === f.category_type && allowed.includes(w.level || '')
            );
          } else {
            matchingWords = allWords.filter((w) => w.category === f.category_type);
          }
        } else if (f.id === 'custom_default') {
          matchingWords = allWords.filter(
            (w) =>
              (w.is_custom || (w.subcategory && !['VOCABULARY', 'CONNECTOR', 'PREFIX_ROOT', 'IDIOM'].includes(w.subcategory))) &&
              (!w.subcategory || !otherCustomNames.includes(w.subcategory.toLowerCase()))
          );
        } else {
          matchingWords = allWords.filter((w) => w.subcategory === f.name);
        }
        const learned = matchingWords.filter((w) => w.box !== null && w.box > 1).length;
        const isCompleted = matchingWords.length > 0 && learned >= matchingWords.length;
        return {
          ...f,
          word_count: matchingWords.length,
          learned_count: learned,
          is_completed: isCompleted,
        };
      });
    }

    const rows = await this.dbInstance.getAllAsync(
      `SELECT * FROM vocab_folders ORDER BY is_system DESC, id ASC`
    );

    const otherCustomNames = rows
      .filter((r: any) => r.is_system !== 1 && r.id !== 'custom_default')
      .map((r: any) => r.name.toLowerCase());

    return rows.map((r: any) => {
      const folder: VocabFolder = {
        id: r.id,
        name: r.name,
        description: r.description,
        color: r.color,
        icon: r.icon,
        is_system: r.is_system === 1,
        category_type: r.category_type,
        level_filter: r.level_filter || undefined,
        created_at: r.created_at,
      };

      let matchingWords: WordWithProgress[] = [];
      if (folder.is_system && folder.category_type) {
        if (folder.level_filter) {
          const allowed = folder.level_filter.split(',').map((s) => s.trim());
          matchingWords = allWords.filter(
            (w) => w.category === folder.category_type && allowed.includes(w.level || '')
          );
        } else {
          matchingWords = allWords.filter((w) => w.category === folder.category_type);
        }
      } else if (folder.id === 'custom_default') {
        matchingWords = allWords.filter(
          (w) =>
            (w.is_custom || (w.subcategory && !['VOCABULARY', 'CONNECTOR', 'PREFIX_ROOT', 'IDIOM'].includes(w.subcategory))) &&
            (!w.subcategory || !otherCustomNames.includes(w.subcategory.toLowerCase()))
        );
      } else {
        matchingWords = allWords.filter((w) => w.subcategory === folder.name);
      }
      const learned = matchingWords.filter((w) => w.box !== null && w.box > 1).length;
      const isCompleted = matchingWords.length > 0 && learned >= matchingWords.length;

      return {
        ...folder,
        word_count: matchingWords.length,
        learned_count: learned,
        is_completed: isCompleted,
      };
    });
  }

  async createVocabFolder(folder: {
    name: string;
    description?: string;
    color: string;
    icon: string;
  }): Promise<VocabFolder> {
    const id = `folder_${Date.now()}`;
    const newFolder: VocabFolder = {
      id,
      name: folder.name.trim(),
      description: folder.description?.trim() || '',
      color: folder.color || '#6366F1',
      icon: folder.icon || 'Folder',
      is_system: false,
      word_count: 0,
      learned_count: 0,
      created_at: new Date().toISOString(),
    };

    if (!this.isNative) {
      this.memoryDb.folders.set(id, newFolder);
      return newFolder;
    }

    await this.dbInstance.runAsync(
      `INSERT INTO vocab_folders (id, name, description, color, icon, is_system, category_type)
       VALUES (?, ?, ?, ?, ?, 0, NULL)`,
      [newFolder.id, newFolder.name, newFolder.description, newFolder.color, newFolder.icon]
    );

    return newFolder;
  }

  async updateVocabFolder(
    id: string,
    updates: { name?: string; description?: string; color?: string; icon?: string }
  ): Promise<void> {
    if (!this.isNative) {
      const existing = this.memoryDb.folders.get(id);
      if (existing) {
        this.memoryDb.folders.set(id, { ...existing, ...updates });
      }
      return;
    }

    if (updates.name) {
      const old = await this.dbInstance.getFirstAsync(`SELECT name FROM vocab_folders WHERE id = ?`, [id]);
      if (old && old.name) {
        await this.dbInstance.runAsync(
          `UPDATE words SET subcategory = ? WHERE subcategory = ?`,
          [updates.name, old.name]
        );
      }
    }

    await this.dbInstance.runAsync(
      `UPDATE vocab_folders
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           color = COALESCE(?, color),
           icon = COALESCE(?, icon)
       WHERE id = ?`,
      [updates.name || null, updates.description || null, updates.color || null, updates.icon || null, id]
    );
  }

  async deleteVocabFolder(id: string): Promise<void> {
    if (!this.isNative) {
      const f = this.memoryDb.folders.get(id);
      if (f) {
        for (const [wId, w] of this.memoryDb.words.entries()) {
          if (w.subcategory === f.name) {
            this.memoryDb.words.delete(wId);
            this.memoryDb.progress.delete(wId);
          }
        }
      }
      this.memoryDb.folders.delete(id);
      return;
    }

    const old = await this.dbInstance.getFirstAsync(`SELECT name FROM vocab_folders WHERE id = ?`, [id]);
    if (old && old.name) {
      await this.dbInstance.runAsync(
        `DELETE FROM user_word_progress WHERE word_id IN (SELECT id FROM words WHERE subcategory = ?)`,
        [old.name]
      );
      await this.dbInstance.runAsync(`DELETE FROM words WHERE subcategory = ?`, [old.name]);
    }
    await this.dbInstance.runAsync(`DELETE FROM vocab_folders WHERE id = ?`, [id]);
  }

  async insertCustomWord(word: Partial<WordItem>): Promise<number> {
    const item: Omit<WordItem, 'id'> = {
      word: word.word || '',
      meaning: word.meaning || '',
      category: word.category || 'VOCABULARY',
      subcategory: word.subcategory || word.folder_name || 'Özel Kelime Defterim',
      level: word.level || 'B2',
      synonyms: word.synonyms || [],
      example_sentence: word.example_sentence || '',
      example_translation: word.example_translation || '',
      etymology_note: word.etymology_note || '',
      is_custom: true,
    };

    if (!this.isNative) {
      const id = await this.memoryDb.insertWord(item);
      return id;
    }

    const res = await this.dbInstance.runAsync(
      `INSERT INTO words (word, meaning, category, subcategory, level, synonyms, example_sentence, example_translation, etymology_note, is_custom)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        item.word,
        item.meaning,
        item.category,
        item.subcategory,
        item.level,
        JSON.stringify(item.synonyms),
        item.example_sentence,
        item.example_translation,
        item.etymology_note,
      ]
    );

    const wordId = res.lastInsertRowId;
    return wordId;
  }

  /**
   * Fast local dictionary lookup in SQLite for 100% verified ÖSYM/Tureng vocabulary.
   */
  async findWordByText(text: string): Promise<WordItem | null> {
    const clean = (text || '').trim().toLowerCase();
    if (!clean) return null;

    if (!this.isNative) {
      for (const w of this.memoryDb.words.values()) {
        if (w.word.trim().toLowerCase() === clean) return w;
      }
      return null;
    }

    try {
      const row: any = await this.dbInstance.getFirstAsync(
        `SELECT * FROM words WHERE LOWER(TRIM(word)) = ? LIMIT 1`,
        [clean]
      );
      if (!row) return null;
      let synonyms: string[] = [];
      try {
        if (row.synonyms) synonyms = JSON.parse(row.synonyms);
      } catch (_) {}
      return {
        ...row,
        is_custom: row.is_custom === 1,
        synonyms,
      };
    } catch (err) {
      return null;
    }
  }

  /**
   * Search dictionary across English words and Turkish meanings.
   * Matches prefix first, then containment.
   */
  async searchDictionary(query: string, limit: number = 50): Promise<WordItem[]> {
    const clean = (query || '').trim().toLowerCase();
    if (!clean) {
      // Return popular or starter academic words
      if (!this.isNative) {
        return Array.from(this.memoryDb.words.values()).slice(0, limit);
      }
      try {
        const rows: any[] = await this.dbInstance.getAllAsync(
          `SELECT * FROM words ORDER BY id ASC LIMIT ?`,
          [limit]
        );
        return rows.map((r) => ({
          ...r,
          is_custom: r.is_custom === 1,
          synonyms: r.synonyms ? JSON.parse(r.synonyms) : [],
        }));
      } catch (err) {
        return [];
      }
    }

    if (!this.isNative) {
      const results: WordItem[] = [];
      for (const w of this.memoryDb.words.values()) {
        if (
          w.word.toLowerCase().includes(clean) ||
          w.meaning.toLowerCase().includes(clean)
        ) {
          results.push(w);
          if (results.length >= limit) break;
        }
      }
      return results;
    }

    try {
      const rows: any[] = await this.dbInstance.getAllAsync(
        `SELECT * FROM words 
         WHERE LOWER(word) LIKE ? OR LOWER(meaning) LIKE ? 
         ORDER BY 
           CASE 
             WHEN LOWER(word) = ? THEN 1
             WHEN LOWER(word) LIKE ? THEN 2
             WHEN LOWER(meaning) LIKE ? THEN 3
             ELSE 4
           END,
           LENGTH(word) ASC
         LIMIT ?`,
        [`%${clean}%`, `%${clean}%`, clean, `${clean}%`, `${clean}%`, limit]
      );

      return rows.map((r) => {
        let synonyms: string[] = [];
        try {
          if (r.synonyms) synonyms = JSON.parse(r.synonyms);
        } catch (_) {}
        return {
          ...r,
          is_custom: r.is_custom === 1,
          synonyms,
        };
      });
    } catch (err) {
      console.warn('searchDictionary error:', err);
      return [];
    }
  }

  /**
   * Add a word from dictionary to a specific practice folder
   */
  async addWordToFolder(
    word: Partial<WordItem>,
    folderName: string,
    imageUrl?: string
  ): Promise<number> {
    const targetFolder = (folderName || 'Özel Kelime Defterim').trim();
    return await this.insertCustomWord({
      ...word,
      subcategory: targetFolder,
      folder_name: targetFolder,
      image_url: imageUrl || word.image_url,
    });
  }

  async deleteCustomWord(wordId: number): Promise<void> {
    if (!this.isNative) {
      const w = this.memoryDb.words.get(wordId);
      if (w && (w.is_custom || (w.subcategory && !['VOCABULARY', 'CONNECTOR', 'PREFIX_ROOT', 'IDIOM'].includes(w.subcategory)))) {
        this.memoryDb.words.delete(wordId);
      }
      this.memoryDb.progress.delete(wordId);
      return;
    }

    await this.dbInstance.runAsync(`DELETE FROM user_word_progress WHERE word_id = ?`, [wordId]);
    await this.dbInstance.runAsync(
      `DELETE FROM words WHERE id = ? AND (is_custom = 1 OR (subcategory IS NOT NULL AND subcategory NOT IN ('VOCABULARY', 'CONNECTOR', 'PREFIX_ROOT', 'IDIOM')))`,
      [wordId]
    );
  }

  async updateWordBox(wordId: number, boxNumber: number): Promise<void> {
    if (!this.isNative) {
      const p = this.memoryDb.progress.get(wordId);
      if (p) {
        p.box = (boxNumber as any);
        p.status = boxNumber > 1 ? 'MASTERED' : 'LEARNING';
      }
      return;
    }

    await this.dbInstance.runAsync(
      `UPDATE user_word_progress SET box = ?, status = ? WHERE word_id = ?`,
      [boxNumber, boxNumber > 1 ? 'MASTERED' : 'LEARNING', wordId]
    );
  }

  // ==========================================
  // VOCABULARY & LEITNER EXISTING METHODS
  // ==========================================

  async purgeNonCustomWords(): Promise<number> {
    if (!this.isNative) {
      let deleted = 0;
      for (const [id, w] of Array.from(this.memoryDb.words.entries())) {
        if (!w.is_custom && w.subcategory !== 'Özel Kelimeler') {
          this.memoryDb.words.delete(id);
          this.memoryDb.progress.delete(id);
          deleted++;
        }
      }
      return deleted;
    }

    try {
      await this.dbInstance.runAsync(
        `DELETE FROM words WHERE (is_custom IS NULL OR is_custom = 0) AND (subcategory IS NULL OR subcategory != 'Özel Kelimeler')`
      );
      await this.dbInstance.runAsync(
        `DELETE FROM user_word_progress WHERE word_id NOT IN (SELECT id FROM words)`
      );
      // Clean up old multi-level system folders to leave single folder
      await this.dbInstance.runAsync(
        `DELETE FROM vocab_folders WHERE id IN ('sys_conn', 'sys_root', 'sys_idiom', 'sys_vocab_a', 'sys_vocab_b', 'sys_vocab_c')`
      );
      const existing = await this.dbInstance.getFirstAsync(`SELECT id FROM vocab_folders WHERE id = 'custom_default'`);
      if (!existing) {
        await this.dbInstance.runAsync(
          `INSERT INTO vocab_folders (id, name, description, color, icon, is_system, category_type)
           VALUES ('custom_default', 'Kelimelerim', 'Özel Eklenen Kelimeler', '#2563EB', 'Folder', 0, 'CUSTOM')`
        );
      }
    } catch (e) {
      console.warn('Error purging non-custom words:', e);
    }
    return 1;
  }

  async getWordCount(): Promise<number> {
    if (!this.isNative) return this.memoryDb.words.size;
    const res = await this.dbInstance.getFirstAsync(`SELECT COUNT(*) as cnt FROM words`);
    return res?.cnt || 0;
  }

  async resetAndSeedDatabase(wordsList: Omit<WordItem, 'id'>[]): Promise<number> {
    if (!this.isNative) {
      this.memoryDb.words.clear();
      this.memoryDb.progress.clear();
      this.memoryDb.autoWordId = 1;
      for (const w of wordsList) {
        await this.memoryDb.insertWord(w);
      }
      return wordsList.length;
    }

    await this.dbInstance.runAsync(`DELETE FROM user_word_progress`);
    await this.dbInstance.runAsync(`DELETE FROM words`);

    let inserted = 0;
    const CHUNK_SIZE = 50;

    await this.dbInstance.withTransactionAsync(async () => {
      for (let i = 0; i < wordsList.length; i += CHUNK_SIZE) {
        const chunk = wordsList.slice(i, i + CHUNK_SIZE);
        const placeholders = chunk.map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?)`).join(', ');
        const sql = `INSERT INTO words (word, meaning, category, subcategory, level, synonyms, example_sentence, example_translation, etymology_note) VALUES ${placeholders}`;

        const params: any[] = [];
        for (const w of chunk) {
          params.push(
            w.word,
            w.meaning,
            w.category || 'VOCABULARY',
            w.subcategory || null,
            w.level || 'B1',
            w.synonyms ? JSON.stringify(w.synonyms) : null,
            w.example_sentence || null,
            w.example_translation || null,
            w.etymology_note || null
          );
        }

        await this.dbInstance.runAsync(sql, params);
        inserted += chunk.length;
      }
    });

    return inserted;
  }

  /**
   * Clears all user study progress, resets questions to ACTIVE,
   * empties mistake vault, exam history, daily stats, and resets streak to 1.
   */
  async resetAllUserProgress(): Promise<void> {
    if (!this.isNative) {
      this.memoryDb.progress.clear();
      this.memoryDb.mistakes.clear();
      this.memoryDb.examHistory = [];
      this.memoryDb.dailyTaskStats.clear();
      this.memoryDb.questionStreak = { count: 0, lastDate: '' };
      this.memoryDb.vocabStreak = { count: 0, lastDate: '' };
      this.memoryDb.streak = { count: 0, lastDate: '' };
      for (const q of this.memoryDb.questions.values()) {
        q.status = 'ACTIVE';
      }
      return;
    }

    try {
      await this.dbInstance.withTransactionAsync(async () => {
        await this.dbInstance.runAsync(`DELETE FROM user_word_progress`);
        await this.dbInstance.runAsync(`DELETE FROM mistake_vault`);
        await this.dbInstance.runAsync(`DELETE FROM exam_history`);
        await this.dbInstance.runAsync(`DELETE FROM daily_stats`);
        await this.dbInstance.runAsync(`UPDATE questions SET status = 'ACTIVE'`);
        await this.dbInstance.runAsync(
          `UPDATE user_settings SET 
            streak_count = 0, last_active_date = NULL,
            question_streak_count = 0, last_question_date = NULL,
            vocab_streak_count = 0, last_vocab_date = NULL
           WHERE id = 1`
        );
      });
    } catch (e) {
      console.warn('Failed to reset all user progress:', e);
    }
  }

  async getWordsForBoxReview(box: BoxType): Promise<WordWithProgress[]> {
    if (!this.isNative) {
      const list: WordWithProgress[] = [];
      for (const [wId, p] of this.memoryDb.progress.entries()) {
        if (p.box === box) {
          const w = this.memoryDb.words.get(wId);
          if (w) {
            list.push({
              ...w,
              isStudied: true,
              box: p.box,
              status: p.status,
              correctCount: p.correct_count,
              incorrectCount: p.incorrect_count,
              nextReviewAt: p.next_review_at,
              isUnlocked: true,
              daysRemaining: 0,
            });
          }
        }
      }
      return list;
    }

    const rows = await this.dbInstance.getAllAsync(
      `SELECT w.*, p.box, p.status as p_status, p.correct_count, p.incorrect_count, p.next_review_at
       FROM words w
       JOIN user_word_progress p ON w.id = p.word_id
       WHERE p.box = ?
       ORDER BY p.next_review_at ASC`,
      [box]
    );

    const now = new Date();

    return rows.map((r: any) => {
      const nextReviewDate = r.next_review_at ? new Date(r.next_review_at) : null;
      const diffMs = nextReviewDate ? nextReviewDate.getTime() - now.getTime() : 0;
      const daysRemaining = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;
      const isUnlocked = !nextReviewDate || diffMs <= 0;

      return {
        id: r.id,
        word: r.word,
        meaning: r.meaning,
        category: r.category,
        subcategory: r.subcategory,
        level: r.level,
        synonyms: this.safeParseJson(r.synonyms, []),
        example_sentence: r.example_sentence,
        example_translation: r.example_translation,
        etymology_note: r.etymology_note,
        is_custom: r.is_custom === 1,
        isStudied: true,
        box: r.box,
        status: r.p_status,
        correctCount: r.correct_count,
        incorrectCount: r.incorrect_count,
        nextReviewAt: r.next_review_at,
        isUnlocked: isUnlocked,
        daysRemaining: daysRemaining,
      };
    });
  }

  async getAllWordsWithProgress(): Promise<WordWithProgress[]> {
    if (!this.isNative) {
      const list: WordWithProgress[] = [];
      for (const [wId, w] of this.memoryDb.words.entries()) {
        const p = this.memoryDb.progress.get(wId);
        list.push({
          ...w,
          isStudied: !!p,
          box: p ? p.box : null,
          status: p ? p.status : null,
          correctCount: p ? p.correct_count : 0,
          incorrectCount: p ? p.incorrect_count : 0,
          nextReviewAt: p ? p.next_review_at : null,
        });
      }
      return list;
    }

    const rows = await this.dbInstance.getAllAsync(
      `SELECT w.*, p.box, p.status as p_status, p.correct_count, p.incorrect_count, p.next_review_at
       FROM words w
       LEFT JOIN user_word_progress p ON w.id = p.word_id
       ORDER BY w.id ASC`
    );

    return rows.map((r: any) => ({
      id: r.id,
      word: r.word,
      meaning: r.meaning,
      category: r.category,
      subcategory: r.subcategory,
      level: r.level,
      synonyms: this.safeParseJson(r.synonyms, []),
      example_sentence: r.example_sentence,
      example_translation: r.example_translation,
      etymology_note: r.etymology_note,
      is_custom: r.is_custom === 1,
      isStudied: r.box !== null && ((r.correct_count || 0) > 0 || (r.incorrect_count || 0) > 0),
      box: r.box,
      status: r.p_status,
      correctCount: r.correct_count || 0,
      incorrectCount: r.incorrect_count || 0,
      nextReviewAt: r.next_review_at,
    }));
  }

  async getBoxSummary(): Promise<BoxCountSummary> {
    if (!this.isNative) {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0;
      for (const p of this.memoryDb.progress.values()) {
        if (p.box === 0) b0++;
        if (p.box === 1) b1++;
        if (p.box === 2) b2++;
        if (p.box === 3) b3++;
      }
      const total = this.memoryDb.words.size;
      return {
        specialPoolCount: b0,
        dailyBoxCount: b1,
        weeklyBoxCount: b2,
        monthlyBoxCount: b3,
        totalWords: total,
        learnedWords: b2 + b3,
      };
    }

    const boxCounts = await this.dbInstance.getAllAsync(
      `SELECT box, COUNT(*) as cnt FROM user_word_progress GROUP BY box`
    );

    const map: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    boxCounts.forEach((r: any) => {
      map[r.box] = r.cnt;
    });

    const totalRes = await this.dbInstance.getFirstAsync(`SELECT COUNT(*) as cnt FROM words`);

    return {
      specialPoolCount: map[0] || 0,
      dailyBoxCount: map[1] || 0,
      weeklyBoxCount: map[2] || 0,
      monthlyBoxCount: map[3] || 0,
      totalWords: totalRes?.cnt || 0,
      learnedWords: (map[2] || 0) + (map[3] || 0),
    };
  }

  async getDailyLearningQueue(limit: number = 25, folderId?: string): Promise<CardWord[]> {
    return await this.getWordsForDailyBatch(limit, folderId);
  }

  async getAllWordsWithStatus(): Promise<WordWithProgress[]> {
    return await this.getAllWordsWithProgress();
  }

  async updateWordProgress(wordId: number, isCorrect: boolean): Promise<WordProgress> {
    const now = new Date();
    const nowISO = now.toISOString();
    let currentProgress: WordProgress | null = null;

    if (!this.isNative) {
      currentProgress = this.memoryDb.progress.get(wordId) || null;
    } else {
      const row = await this.dbInstance.getFirstAsync(
        `SELECT * FROM user_word_progress WHERE word_id = ?`,
        [wordId]
      );
      if (row) {
        currentProgress = {
          id: row.id,
          word_id: row.word_id,
          box: row.box,
          status: row.status,
          correct_count: row.correct_count,
          incorrect_count: row.incorrect_count,
          last_reviewed_at: row.last_reviewed_at,
          next_review_at: row.next_review_at,
          box_entry_date: row.box_entry_date,
        };
      }
    }

    let newBox: BoxType = 1;
    let nextReviewAt = new Date();
    let newStatus = 'LEARNING';
    let correctCount = currentProgress ? currentProgress.correct_count : 0;
    let incorrectCount = currentProgress ? currentProgress.incorrect_count : 0;

    const currentBox = currentProgress ? currentProgress.box : 0;

    // Randevu saatini sabah 06:00'ya sabitler; böylece sabah 09:00 bildirimi geldiğinde tüm kelimeler hazır olur!
    const getMorningReviewDate = (daysAhead: number): Date => {
      const target = new Date();
      target.setDate(target.getDate() + daysAhead);
      target.setHours(6, 0, 0, 0);
      return target;
    };

    if (isCorrect) {
      correctCount += 1;

      if (!currentProgress || currentBox === 0) {
        // 1. AŞAMA (YENİ KELİME BİLİNDİ): 1. Gün kutusuna gider (ertesi sabah hazır)
        newBox = 1;
        nextReviewAt = getMorningReviewDate(1);
        newStatus = 'LEARNING';
      } else if (currentBox === 1) {
        // 2. AŞAMA (1. GÜN KUTUSUNDAKİ KELİME TEKRAR BİLİNDİ): 3. Gün kutusuna gider (3 gün sonra sabah hazır)
        newBox = 2;
        nextReviewAt = getMorningReviewDate(3);
        newStatus = 'REVIEWING';
      } else if (currentBox === 2) {
        // 3. AŞAMA (3. GÜN KUTUSUNDAKİ KELİME TEKRAR BİLİNDİ): 7. Gün kutusuna gider (7 gün sonra sabah hazır)
        newBox = 3;
        nextReviewAt = getMorningReviewDate(7);
        newStatus = 'REVIEWING';
      } else {
        // 4. AŞAMA (7. GÜN KUTUSUNDAKİ KELİME TEKRAR BİLİNDİ): %100 TAMAMLANDI (Mastered & Kalıcı Hafıza)
        newBox = 3;
        nextReviewAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        newStatus = 'MASTERED';
      }
    } else {
      incorrectCount += 1;

      if (currentBox === 3) {
        // 7. Gün kutusundaki yanlış bilinirse -> Kutu 2'ye (3. Gün) geriler, ertesi sabah tekrar sorulur
        newBox = 2;
        nextReviewAt = getMorningReviewDate(1);
        newStatus = 'REVIEWING';
      } else if (currentBox === 2) {
        // 3. Gün kutusundaki yanlış bilinirse -> Kutu 1'e (1. Gün) geriler, ertesi sabah tekrar sorulur
        newBox = 1;
        nextReviewAt = getMorningReviewDate(1);
        newStatus = 'LEARNING';
      } else {
        // 1. Gün veya yeni kelime yanlış bilinirse -> Kutu 1'de kalır, ertesi sabah tekrar sorulur
        newBox = 1;
        nextReviewAt = getMorningReviewDate(1);
        newStatus = 'LEARNING';
      }
    }

    const updatedProg: WordProgress = {
      id: currentProgress ? currentProgress.id : Date.now(),
      word_id: wordId,
      box: newBox,
      status: newStatus as any,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      last_reviewed_at: nowISO,
      next_review_at: nextReviewAt.toISOString(),
      box_entry_date: nowISO,
    };

    if (this.isNative) {
      await this.dbInstance.runAsync(
        `INSERT INTO user_word_progress
          (word_id, box, status, correct_count, incorrect_count, last_reviewed_at, next_review_at, box_entry_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(word_id) DO UPDATE SET
          box = excluded.box,
          status = excluded.status,
          correct_count = excluded.correct_count,
          incorrect_count = excluded.incorrect_count,
          last_reviewed_at = excluded.last_reviewed_at,
          next_review_at = excluded.next_review_at,
          box_entry_date = excluded.box_entry_date`,
        [
          wordId,
          updatedProg.box,
          updatedProg.status,
          updatedProg.correct_count,
          updatedProg.incorrect_count,
          updatedProg.last_reviewed_at,
          updatedProg.next_review_at,
          updatedProg.box_entry_date,
        ]
      );

      // Record to daily_stats for words_reviewed
      await this.dbInstance.runAsync(
        `INSERT INTO daily_stats (study_date, words_reviewed) VALUES (date('now'), 1)
         ON CONFLICT(study_date) DO UPDATE SET words_reviewed = words_reviewed + 1`
      ).catch(() => {});
    } else {
      this.memoryDb.progress.set(wordId, updatedProg);
    }

    return updatedProg;
  }

  async getWordsForDailyBatch(newWordsLimit: number = 25, folderId?: string): Promise<CardWord[]> {
    const targetFolderId = folderId || (await this.getActiveStudyFolderId());

    const computeBadgeInfo = (progBox: number, nextReviewAtStr?: string | null) => {
      const now = Date.now();
      let daysOverdue = 0;
      if (nextReviewAtStr) {
        const dueTime = new Date(nextReviewAtStr).getTime();
        if (now > dueTime) {
          daysOverdue = Math.max(0, Math.floor((now - dueTime) / (24 * 60 * 60 * 1000)));
        }
      }

      if (progBox === 1) {
        return { badgeText: '🔄 Dünden Tekrar (1 Gün)', daysOverdue };
      }
      if (progBox === 2) {
        return { badgeText: '⚡ 3. Gün Tekrarı', daysOverdue };
      }
      if (progBox === 3) {
        return { badgeText: '🏆 7. Gün Kalıcı Hafıza Testi', daysOverdue };
      }
      return { badgeText: '🔄 Aralıklı Tekrar', daysOverdue };
    };

    if (!this.isNative) {
      await this.memoryDb.init();
      const targetFolder = this.memoryDb.folders.get(targetFolderId) || null;
      const isMatchingFolder = (w: WordItem): boolean => {
        if (!targetFolder) return true;
        if (targetFolder.id === 'custom_default') {
          return !!w.is_custom || (!!w.subcategory && !['VOCABULARY', 'CONNECTOR', 'PREFIX_ROOT', 'IDIOM'].includes(w.subcategory));
        }
        if (targetFolder.is_system && targetFolder.category_type) {
          if (targetFolder.level_filter) {
            const allowed = targetFolder.level_filter.split(',').map((s) => s.trim());
            return w.category === targetFolder.category_type && allowed.includes(w.level || '');
          }
          return w.category === targetFolder.category_type;
        }
        return w.subcategory === targetFolder.name;
      };

      const allWords = Array.from(this.memoryDb.words.values());
      const reviewCandidates: { word: WordItem; prog: WordProgress; daysOverdue: number; badgeText: string }[] = [];
      const now = Date.now();

      // Vadesi gelmiş kelimeleri TÜM klasörlerden tara
      for (const w of allWords) {
        const prog = this.memoryDb.progress.get(w.id);
        if (prog && prog.next_review_at) {
          const dueTime = new Date(prog.next_review_at).getTime();
          if (dueTime <= now) {
            const { badgeText, daysOverdue } = computeBadgeInfo(prog.box, prog.next_review_at);
            reviewCandidates.push({ word: w, prog, daysOverdue, badgeText });
          }
        }
      }

      reviewCandidates.sort((a, b) => {
        const tA = a.prog.next_review_at ? new Date(a.prog.next_review_at).getTime() : 0;
        const tB = b.prog.next_review_at ? new Date(b.prog.next_review_at).getTime() : 0;
        return tA - tB;
      });

      const reviewWords: CardWord[] = reviewCandidates.map(({ word: w, prog, daysOverdue, badgeText }) => ({
        ...w,
        progress: prog,
        cardType: 'REVIEW',
        reviewBox: prog.box,
        reviewBadgeText: badgeText,
        daysOverdue,
        isCooldown: false,
      }));

      // Hedef havuzdan en fazla newWordsLimit kadar tekrar ve yeni kelime al
      const limitedReviews = reviewWords.slice(0, newWordsLimit);
      const remainingSlots = Math.max(0, newWordsLimit - limitedReviews.length);

      const targetFolderWords = allWords.filter(isMatchingFolder);
      const newWords: CardWord[] = [];
      if (remainingSlots > 0) {
        // 1. Önce kullanıcının yeni eklediği ve henüz çalışmadığı özel kelimeleri ekle
        const customUnstudied = allWords.filter((w) => w.is_custom && !this.memoryDb.progress.get(w.id));
        for (const w of customUnstudied) {
          if (newWords.length < remainingSlots) {
            newWords.push({
              ...w,
              cardType: 'NEW',
              reviewBadgeText: '⭐ Yeni Eklenen Kelimen',
              isCooldown: false,
            });
          }
        }

        // 2. Kalan yer varsa aktif klasörden ekle
        for (const w of targetFolderWords) {
          if (newWords.length >= remainingSlots) break;
          const prog = this.memoryDb.progress.get(w.id);
          if (!prog && !newWords.some((nw) => nw.id === w.id)) {
            newWords.push({
              ...w,
              cardType: 'NEW',
              reviewBadgeText: '✨ Günün Yeni Kelimesi',
              isCooldown: false,
            });
          }
        }

        // 3. Hâlâ yer varsa genel kelime havuzundan tamamla
        for (const w of allWords) {
          if (newWords.length >= remainingSlots) break;
          const prog = this.memoryDb.progress.get(w.id);
          if (!prog && !newWords.some((nw) => nw.id === w.id)) {
            newWords.push({
              ...w,
              cardType: 'NEW',
              reviewBadgeText: '✨ Günün Yeni Kelimesi',
              isCooldown: false,
            });
          }
        }
      }

      return [...limitedReviews, ...newWords].slice(0, newWordsLimit);
    }

    // Native SQLite implementation
    const targetFolder: any = await this.dbInstance.getFirstAsync(
      `SELECT * FROM vocab_folders WHERE id = ?`,
      [targetFolderId]
    );

    let folderFilterSql = '';
    let folderParams: any[] = [];

    if (targetFolder) {
      if (targetFolder.id === 'custom_default') {
        folderFilterSql = `(w.is_custom = 1 OR (w.subcategory IS NOT NULL AND w.subcategory NOT IN ('VOCABULARY', 'CONNECTOR', 'PREFIX_ROOT', 'IDIOM')))`;
      } else if (targetFolder.is_system === 1 && targetFolder.category_type) {
        if (targetFolder.level_filter) {
          const levels = targetFolder.level_filter.split(',').map((s: string) => s.trim());
          const placeholders = levels.map(() => '?').join(',');
          folderFilterSql = `w.category = ? AND w.level IN (${placeholders})`;
          folderParams = [targetFolder.category_type, ...levels];
        } else {
          folderFilterSql = `w.category = ?`;
          folderParams = [targetFolder.category_type];
        }
      } else {
        folderFilterSql = `w.subcategory = ?`;
        folderParams = [targetFolder.name];
      }
    }

    // 1. Vadesi gelmiş kelimeleri TÜM klasörlerden çek (azami newWordsLimit kadar)
    const nowIso = new Date().toISOString();
    const reviewSql = `SELECT w.*, p.box as prog_box, p.status as prog_status, p.correct_count as prog_correct, p.incorrect_count as prog_incorrect, p.last_reviewed_at as prog_last_reviewed, p.next_review_at as prog_next_review, p.box_entry_date as prog_entry_date
         FROM words w
         INNER JOIN user_word_progress p ON w.id = p.word_id
         WHERE p.next_review_at IS NOT NULL AND (datetime(p.next_review_at) <= datetime('now') OR p.next_review_at <= ?)
         ORDER BY p.next_review_at ASC
         LIMIT ?`;

    const reviewRows = await this.dbInstance.getAllAsync(reviewSql, [nowIso, newWordsLimit]);

    const reviewWords: CardWord[] = reviewRows.map((r: any) => {
      const { badgeText, daysOverdue } = computeBadgeInfo(r.prog_box, r.prog_next_review);
      return {
        id: r.id,
        word: r.word,
        meaning: r.meaning,
        category: r.category,
        subcategory: r.subcategory,
        level: r.level,
        synonyms: this.safeParseJson(r.synonyms, []),
        example_sentence: r.example_sentence,
        example_translation: r.example_translation,
        etymology_note: r.etymology_note,
        is_custom: r.is_custom === 1,
        cardType: 'REVIEW',
        reviewBox: r.prog_box,
        reviewBadgeText: badgeText,
        daysOverdue,
        progress: {
          id: r.id,
          word_id: r.id,
          box: r.prog_box,
          status: r.prog_status,
          correct_count: r.prog_correct,
          incorrect_count: r.prog_incorrect,
          last_reviewed_at: r.prog_last_reviewed,
          next_review_at: r.prog_next_review,
          box_entry_date: r.prog_entry_date,
        },
        isCooldown: false,
      };
    });

    // 2. Kalan kontenjan varsa:
    // ADIM A: Önce kullanıcının yeni eklediği ve henüz çalışmadığı özel kelimeleri (is_custom = 1) en başa al!
    // ADIM B: Aktif klasörden doldur
    // ADIM C: Hâlâ yer varsa genel kelimelerden tamamla
    const remainingSlots = Math.max(0, newWordsLimit - reviewWords.length);
    let newWords: CardWord[] = [];

    if (remainingSlots > 0) {
      // ADIM A: Özel eklenen ve henüz çalışılmamış kelimeler
      const customUnstudiedSql = `
        SELECT w.* FROM words w
        LEFT JOIN user_word_progress p ON w.id = p.word_id
        WHERE p.id IS NULL AND w.is_custom = 1
        ORDER BY w.id DESC
        LIMIT ?
      `;
      const customRows = await this.dbInstance.getAllAsync(customUnstudiedSql, [remainingSlots]);
      const customWords: CardWord[] = customRows.map((r: any) => ({
        id: r.id,
        word: r.word,
        meaning: r.meaning,
        category: r.category,
        subcategory: r.subcategory,
        level: r.level,
        synonyms: this.safeParseJson(r.synonyms, []),
        example_sentence: r.example_sentence,
        example_translation: r.example_translation,
        etymology_note: r.etymology_note,
        is_custom: true,
        cardType: 'NEW',
        reviewBadgeText: '⭐ Yeni Eklenen Kelimen',
        isCooldown: false,
      }));
      newWords.push(...customWords);

      const afterCustomSlots = Math.max(0, remainingSlots - customWords.length);
      if (afterCustomSlots > 0) {
        const customIds = customRows.map((r: any) => r.id);
        const excludeCustomClause = customIds.length > 0 ? `AND w.id NOT IN (${customIds.join(',')})` : '';

        // ADIM B: Aktif klasördeki yeni kelimeler
        const newSql = folderFilterSql
          ? `SELECT w.* FROM words w
             LEFT JOIN user_word_progress p ON w.id = p.word_id
             WHERE p.id IS NULL AND (${folderFilterSql}) ${excludeCustomClause}
             ORDER BY w.id ASC
             LIMIT ?`
          : `SELECT w.* FROM words w
             LEFT JOIN user_word_progress p ON w.id = p.word_id
             WHERE p.id IS NULL AND (w.is_custom IS NULL OR w.is_custom = 0) ${excludeCustomClause}
             ORDER BY w.id ASC
             LIMIT ?`;

        const newParams = [...folderParams, afterCustomSlots];
        const newRows = await this.dbInstance.getAllAsync(newSql, newParams);

        const folderBatch: CardWord[] = newRows.map((r: any) => ({
          id: r.id,
          word: r.word,
          meaning: r.meaning,
          category: r.category,
          subcategory: r.subcategory,
          level: r.level,
          synonyms: this.safeParseJson(r.synonyms, []),
          example_sentence: r.example_sentence,
          example_translation: r.example_translation,
          etymology_note: r.etymology_note,
          is_custom: r.is_custom === 1,
          cardType: 'NEW',
          reviewBadgeText: '✨ Günün Yeni Kelimesi',
          isCooldown: false,
        }));
        newWords.push(...folderBatch);

        // ADIM C: Hâlâ kontenjan kaldıysa genel kelimelerden tamamla
        const afterFolderSlots = Math.max(0, afterCustomSlots - folderBatch.length);
        if (afterFolderSlots > 0) {
          const allFetchedIds = [...customIds, ...newRows.map((r: any) => r.id)];
          const excludeAllClause = allFetchedIds.length > 0 ? `AND w.id NOT IN (${allFetchedIds.join(',')})` : '';
          const fallbackSql = `
            SELECT w.* FROM words w
            LEFT JOIN user_word_progress p ON w.id = p.word_id
            WHERE p.id IS NULL ${excludeAllClause}
            ORDER BY w.id ASC
            LIMIT ?
          `;
          const fallbackRows = await this.dbInstance.getAllAsync(fallbackSql, [afterFolderSlots]);
          const fallbackBatch: CardWord[] = fallbackRows.map((r: any) => ({
            id: r.id,
            word: r.word,
            meaning: r.meaning,
            category: r.category,
            subcategory: r.subcategory,
            level: r.level,
            synonyms: this.safeParseJson(r.synonyms, []),
            example_sentence: r.example_sentence,
            example_translation: r.example_translation,
            etymology_note: r.etymology_note,
            is_custom: r.is_custom === 1,
            cardType: 'NEW',
            reviewBadgeText: '✨ Günün Yeni Kelimesi',
            isCooldown: false,
          }));
          newWords.push(...fallbackBatch);
        }
      }
    }

    return [...reviewWords, ...newWords].slice(0, newWordsLimit);
  }

  // ==========================================
  // SEPARATE QUESTION & VOCAB STREAKS
  // ==========================================

  async getQuestionStreakCount(): Promise<number> {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!this.isNative) {
      if (!this.memoryDb.questionStreak || this.memoryDb.questionStreak.count <= 0) return 0;
      const lastDate = this.memoryDb.questionStreak.lastDate;
      if (lastDate === todayStr || lastDate === yesterdayStr) {
        return this.memoryDb.questionStreak.count;
      }
      return 0;
    }

    try {
      // Check if user has answered any questions
      const qRow: any = await this.dbInstance.getFirstAsync(
        `SELECT COUNT(*) as answered_count FROM questions WHERE status != 'ACTIVE'`
      );
      if (!qRow || qRow.answered_count === 0) {
        await this.dbInstance.runAsync(
          `UPDATE user_settings SET question_streak_count = 0, last_question_date = NULL WHERE id = 1`
        ).catch(() => {});
        return 0;
      }

      const row: any = await this.dbInstance.getFirstAsync(
        `SELECT last_question_date, question_streak_count FROM user_settings WHERE id = 1`
      );
      const lastQuestionDate = row?.last_question_date;
      const count = Number(row?.question_streak_count) || 0;

      if (lastQuestionDate === todayStr || lastQuestionDate === yesterdayStr) {
        return count;
      }
      return 0;
    } catch (e) {
      console.warn('Failed to get question streak from SQLite:', e);
      return 0;
    }
  }

  async checkAndUpdateQuestionStreak(): Promise<number> {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!this.isNative) {
      const lastDate = this.memoryDb.questionStreak.lastDate;
      if (lastDate === todayStr) {
        return Math.max(1, this.memoryDb.questionStreak.count);
      } else if (lastDate === yesterdayStr) {
        this.memoryDb.questionStreak.count = (this.memoryDb.questionStreak.count || 0) + 1;
        this.memoryDb.questionStreak.lastDate = todayStr;
      } else {
        this.memoryDb.questionStreak.count = 1;
        this.memoryDb.questionStreak.lastDate = todayStr;
      }
      this.memoryDb.streak = { ...this.memoryDb.questionStreak };
      return this.memoryDb.questionStreak.count;
    }

    try {
      const row: any = await this.dbInstance.getFirstAsync(
        `SELECT last_question_date, question_streak_count FROM user_settings WHERE id = 1`
      );
      let count = Number(row?.question_streak_count) || 0;
      const lastDate = row?.last_question_date;

      if (lastDate === todayStr) {
        count = Math.max(1, count);
      } else if (lastDate === yesterdayStr) {
        count = (count > 0 ? count : 0) + 1;
      } else {
        count = 1;
      }

      await this.dbInstance.runAsync(
        `UPDATE user_settings SET last_question_date = ?, question_streak_count = ?, last_active_date = ?, streak_count = ? WHERE id = 1`,
        [todayStr, count, todayStr, count]
      );

      return count;
    } catch (e) {
      console.warn('Failed to update question streak in SQLite:', e);
      return 1;
    }
  }

  async getVocabStreakCount(): Promise<number> {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!this.isNative) {
      if (!this.memoryDb.vocabStreak || this.memoryDb.vocabStreak.count <= 0) return 0;
      const lastDate = this.memoryDb.vocabStreak.lastDate;
      if (lastDate === todayStr || lastDate === yesterdayStr) {
        return this.memoryDb.vocabStreak.count;
      }
      return 0;
    }

    try {
      // Check if user has practiced any words
      const vRow: any = await this.dbInstance.getFirstAsync(
        `SELECT COUNT(*) as practiced_count FROM user_word_progress WHERE correct_count > 0 OR incorrect_count > 0`
      );
      if (!vRow || vRow.practiced_count === 0) {
        await this.dbInstance.runAsync(
          `UPDATE user_settings SET vocab_streak_count = 0, last_vocab_date = NULL WHERE id = 1`
        ).catch(() => {});
        return 0;
      }

      const row: any = await this.dbInstance.getFirstAsync(
        `SELECT last_vocab_date, vocab_streak_count FROM user_settings WHERE id = 1`
      );
      const lastVocabDate = row?.last_vocab_date;
      const count = Number(row?.vocab_streak_count) || 0;

      if (lastVocabDate === todayStr || lastVocabDate === yesterdayStr) {
        return count;
      }
      return 0;
    } catch (e) {
      console.warn('Failed to get vocab streak from SQLite:', e);
      return 0;
    }
  }

  async checkAndUpdateVocabStreak(): Promise<number> {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!this.isNative) {
      const lastDate = this.memoryDb.vocabStreak.lastDate;
      if (lastDate === todayStr) {
        return Math.max(1, this.memoryDb.vocabStreak.count);
      } else if (lastDate === yesterdayStr) {
        this.memoryDb.vocabStreak.count = (this.memoryDb.vocabStreak.count || 0) + 1;
        this.memoryDb.vocabStreak.lastDate = todayStr;
      } else {
        this.memoryDb.vocabStreak.count = 1;
        this.memoryDb.vocabStreak.lastDate = todayStr;
      }
      return this.memoryDb.vocabStreak.count;
    }

    try {
      const row: any = await this.dbInstance.getFirstAsync(
        `SELECT last_vocab_date, vocab_streak_count FROM user_settings WHERE id = 1`
      );
      let count = Number(row?.vocab_streak_count) || 0;
      const lastDate = row?.last_vocab_date;

      if (lastDate === todayStr) {
        count = Math.max(1, count);
      } else if (lastDate === yesterdayStr) {
        count = (count > 0 ? count : 0) + 1;
      } else {
        count = 1;
      }

      await this.dbInstance.runAsync(
        `UPDATE user_settings SET last_vocab_date = ?, vocab_streak_count = ? WHERE id = 1`,
        [todayStr, count]
      );

      // Also record to daily_stats for words_reviewed
      await this.dbInstance.runAsync(
        `INSERT INTO daily_stats (study_date, words_reviewed) VALUES (?, 1)
         ON CONFLICT(study_date) DO UPDATE SET words_reviewed = words_reviewed + 1`,
        [todayStr]
      ).catch(() => {});

      return count;
    } catch (e) {
      console.warn('Failed to update vocab streak in SQLite:', e);
      return 1;
    }
  }

  async getStreakCount(): Promise<number> {
    return await this.getQuestionStreakCount();
  }

  async checkAndUpdateDailyStreak(): Promise<number> {
    return await this.checkAndUpdateQuestionStreak();
  }

  // ==========================================
  // PERSISTENT DAILY TASK PROGRESS (35 QUESTIONS)
  // ==========================================

  async getDailyTaskProgressToday(goals: TaskGoalsConfig = { paragraph: 8, cloze: 5, sentence: 8, skills: 14 }): Promise<{
    paragraphCompleted: number;
    clozeCompleted: number;
    sentenceCompleted: number;
    skillsCompleted: number;
    vocabCompleted: number;
  }> {
    const todayStr = new Date().toISOString().split('T')[0];

    if (!this.isNative) {
      let p_done = 0, c_done = 0, s_done = 0, sk_done = 0;
      for (const q of this.memoryDb.questions.values()) {
        if (q.status !== 'ACTIVE') {
          if (q.type === 'PARAGRAPH') p_done++;
          else if (q.type === 'CLOZE_TEST') c_done++;
          else if (q.type === 'SENTENCE_COMPLETION') s_done++;
          else sk_done++;
        }
      }
      return {
        paragraphCompleted: Math.min(goals.paragraph, p_done),
        clozeCompleted: Math.min(goals.cloze, c_done),
        sentenceCompleted: Math.min(goals.sentence, s_done),
        skillsCompleted: Math.min(goals.skills, sk_done),
        vocabCompleted: this.memoryDb.dailyTaskStats?.get(todayStr)?.vocabCompleted || 0,
      };
    }

    try {
      const qRow: any = await this.dbInstance.getFirstAsync(
        `SELECT 
          COALESCE(SUM(CASE WHEN type = 'PARAGRAPH' AND status != 'ACTIVE' THEN 1 ELSE 0 END), 0) as p_done,
          COALESCE(SUM(CASE WHEN type = 'CLOZE_TEST' AND status != 'ACTIVE' THEN 1 ELSE 0 END), 0) as c_done,
          COALESCE(SUM(CASE WHEN type = 'SENTENCE_COMPLETION' AND status != 'ACTIVE' THEN 1 ELSE 0 END), 0) as s_done,
          COALESCE(SUM(CASE WHEN type IN ('SKILL_DIALOGUE', 'RESTATEMENT', 'TRANSLATION', 'VOCABULARY_GRAMMAR') AND status != 'ACTIVE' THEN 1 ELSE 0 END), 0) as sk_done
         FROM questions`
      );

      // Ensure any unstudied dummy rows are deleted
      await this.dbInstance.runAsync(
        `DELETE FROM user_word_progress 
         WHERE (correct_count IS NULL OR correct_count = 0) 
           AND (incorrect_count IS NULL OR incorrect_count = 0)`
      ).catch(() => {});

      // Query authoritative count from user_word_progress for words reviewed today
      const vocabRow: any = await this.dbInstance.getFirstAsync(
        `SELECT COUNT(*) as vocab_done
         FROM user_word_progress
         WHERE (correct_count > 0 OR incorrect_count > 0)
           AND (
             DATE(last_reviewed_at) = DATE('now')
             OR DATE(last_reviewed_at) = DATE('now', 'localtime')
             OR last_reviewed_at LIKE ? || '%'
           )`,
        [todayStr]
      );

      const pDone = Math.min(goals.paragraph, qRow?.p_done || 0);
      const cDone = Math.min(goals.cloze, qRow?.c_done || 0);
      const sDone = Math.min(goals.sentence, qRow?.s_done || 0);
      const skDone = Math.min(goals.skills, qRow?.sk_done || 0);
      const vDone = vocabRow?.vocab_done || 0;

      // Keep daily_stats table in exact sync with authoritative questions and vocab count
      await this.dbInstance.runAsync(
        `INSERT INTO daily_stats (study_date, paragraph_completed, cloze_completed, sentence_completed, skills_completed, words_reviewed)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(study_date) DO UPDATE SET
           paragraph_completed = excluded.paragraph_completed,
           cloze_completed = excluded.cloze_completed,
           sentence_completed = excluded.sentence_completed,
           skills_completed = excluded.skills_completed,
           words_reviewed = MAX(COALESCE(daily_stats.words_reviewed, 0), excluded.words_reviewed)`,
        [todayStr, pDone, cDone, sDone, skDone, vDone]
      );

      return {
        paragraphCompleted: pDone,
        clozeCompleted: cDone,
        sentenceCompleted: sDone,
        skillsCompleted: skDone,
        vocabCompleted: vDone,
      };
    } catch (e) {
      console.warn('Failed to get daily task progress from SQLite:', e);
      return {
        paragraphCompleted: 0,
        clozeCompleted: 0,
        sentenceCompleted: 0,
        skillsCompleted: 0,
        vocabCompleted: 0,
      };
    }
  }

  async incrementDailyTaskProgress(
    type: YdsQuestionType,
    goals: TaskGoalsConfig = { paragraph: 8, cloze: 5, sentence: 8, skills: 14 }
  ): Promise<{
    paragraphCompleted: number;
    clozeCompleted: number;
    sentenceCompleted: number;
    skillsCompleted: number;
    vocabCompleted: number;
  }> {
    return await this.getDailyTaskProgressToday(goals);
  }

  // ==========================================
  // PERSISTENT USER SESSION METHODS
  // ==========================================

  async saveUserSession(user: UserProfile): Promise<void> {
    if (!this.isNative) {
      this.memoryDb.userSession = user;
      return;
    }

    try {
      // Clear any previous single session
      await this.dbInstance.runAsync(`DELETE FROM user_session`);
      await this.dbInstance.runAsync(
        `INSERT INTO user_session (id, email, full_name, target_score, is_guest, is_pro, pro_expires_at, applied_promo_code, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.email,
          user.fullName,
          user.targetScore || 80,
          user.isGuest ? 1 : 0,
          user.isPro ? 1 : 0,
          user.proExpiresAt || null,
          user.appliedPromoCode || null,
          user.createdAt || new Date().toISOString(),
        ]
      );
    } catch (err) {
      console.warn('Failed to save user session in SQLite:', err);
    }
  }

  async getUserSession(): Promise<UserProfile | null> {
    if (!this.isNative) {
      return this.memoryDb.userSession;
    }

    try {
      const row = await this.dbInstance.getFirstAsync(`SELECT * FROM user_session LIMIT 1`);
      if (!row) return null;

      return {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        targetScore: row.target_score || 80,
        isGuest: row.is_guest === 1,
        isPro: row.is_pro === 1,
        proExpiresAt: row.pro_expires_at || undefined,
        appliedPromoCode: row.applied_promo_code || undefined,
        createdAt: row.created_at,
      };
    } catch (err) {
      console.warn('Failed to load user session from SQLite:', err);
      return null;
    }
  }

  async clearUserSession(): Promise<void> {
    if (!this.isNative) {
      this.memoryDb.userSession = null;
      return;
    }

    try {
      await this.dbInstance.runAsync(`DELETE FROM user_session`);
    } catch (err) {
      console.warn('Failed to clear user session in SQLite:', err);
    }
  }

  async updateUserTargetScore(score: number): Promise<void> {
    if (!this.isNative) {
      if (this.memoryDb.userSession) {
        this.memoryDb.userSession.targetScore = score;
      }
      return;
    }

    try {
      await this.dbInstance.runAsync(`UPDATE user_session SET target_score = ?`, [score]);
    } catch (err) {
      console.warn('Failed to update target score in SQLite:', err);
    }
  }

  async updateUserFullName(fullName: string): Promise<void> {
    if (!this.isNative) {
      if (this.memoryDb.userSession) {
        this.memoryDb.userSession.fullName = fullName;
      }
      return;
    }

    try {
      await this.dbInstance.runAsync(`UPDATE user_session SET full_name = ?`, [fullName]);
    } catch (err) {
      console.warn('Failed to update full name in SQLite:', err);
    }
  }

  async getComprehensivePerformanceStats(): Promise<PerformanceStats> {
    if (!this.isNative) {
      let totalSolved = 0, totalCorrect = 0, totalMistakes = 0;
      let p_solved = 0, p_correct = 0;
      let c_solved = 0, c_correct = 0;
      let s_solved = 0, s_correct = 0;
      let sk_solved = 0, sk_correct = 0;

      for (const q of this.memoryDb.questions.values()) {
        if (q.status !== 'ACTIVE') {
          totalSolved++;
          const isCorrect = q.status === 'SOLVED_CORRECT';
          if (isCorrect) totalCorrect++;
          else totalMistakes++;

          if (q.type === 'PARAGRAPH') {
            p_solved++;
            if (isCorrect) p_correct++;
          } else if (q.type === 'CLOZE_TEST') {
            c_solved++;
            if (isCorrect) c_correct++;
          } else if (q.type === 'SENTENCE_COMPLETION') {
            s_solved++;
            if (isCorrect) s_correct++;
          } else {
            sk_solved++;
            if (isCorrect) sk_correct++;
          }
        }
      }

      let wordsStudied = 0;
      for (const p of this.memoryDb.progress.values()) {
        if ((p.box && p.box > 1) || p.status === 'MASTERED' || (p.correct_count && p.correct_count > 0)) {
          wordsStudied++;
        }
      }

      const exams = this.memoryDb.examHistory || [];
      const totalExams = exams.length;
      const latestExamScore = totalExams > 0 ? Math.round(exams[0].ydsScore) : null;
      const avgExamScore = totalExams > 0 
        ? Math.round(exams.reduce((acc, e) => acc + e.ydsScore, 0) / totalExams) 
        : null;

      const accuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;
      const predictedScore = latestExamScore !== null 
        ? latestExamScore 
        : totalSolved > 0 
          ? Math.min(100, Math.max(35, Math.round(accuracy * 0.9 + (totalSolved > 20 ? 10 : 0))))
          : 60;

      return {
        totalQuestionsSolved: totalSolved,
        totalCorrect,
        totalMistakes,
        accuracyPercentage: accuracy,
        predictedYdsScore: predictedScore,
        totalExamsCompleted: totalExams,
        latestExamScore,
        averageExamScore: avgExamScore,
        totalWordsStudied: wordsStudied,
        categoryStats: {
          paragraph: { solved: p_solved, correct: p_correct, accuracy: p_solved > 0 ? Math.round((p_correct / p_solved) * 100) : 0 },
          cloze: { solved: c_solved, correct: c_correct, accuracy: c_solved > 0 ? Math.round((c_correct / c_solved) * 100) : 0 },
          sentence: { solved: s_solved, correct: s_correct, accuracy: s_solved > 0 ? Math.round((s_correct / s_solved) * 100) : 0 },
          skills: { solved: sk_solved, correct: sk_correct, accuracy: sk_solved > 0 ? Math.round((sk_correct / sk_solved) * 100) : 0 },
        },
        dailyStreak: 1,
      };
    }

    try {
      const qStats: any = await this.dbInstance.getFirstAsync(
        `SELECT 
          COUNT(*) as total_solved,
          COALESCE(SUM(CASE WHEN status = 'SOLVED_CORRECT' THEN 1 ELSE 0 END), 0) as total_correct,
          COALESCE(SUM(CASE WHEN status = 'MISTAKE' THEN 1 ELSE 0 END), 0) as total_mistakes,
          
          COALESCE(SUM(CASE WHEN type = 'PARAGRAPH' THEN 1 ELSE 0 END), 0) as p_solved,
          COALESCE(SUM(CASE WHEN type = 'PARAGRAPH' AND status = 'SOLVED_CORRECT' THEN 1 ELSE 0 END), 0) as p_correct,

          COALESCE(SUM(CASE WHEN type = 'CLOZE_TEST' THEN 1 ELSE 0 END), 0) as c_solved,
          COALESCE(SUM(CASE WHEN type = 'CLOZE_TEST' AND status = 'SOLVED_CORRECT' THEN 1 ELSE 0 END), 0) as c_correct,

          COALESCE(SUM(CASE WHEN type = 'SENTENCE_COMPLETION' THEN 1 ELSE 0 END), 0) as s_solved,
          COALESCE(SUM(CASE WHEN type = 'SENTENCE_COMPLETION' AND status = 'SOLVED_CORRECT' THEN 1 ELSE 0 END), 0) as s_correct,

          COALESCE(SUM(CASE WHEN type IN ('SKILL_DIALOGUE', 'RESTATEMENT', 'TRANSLATION', 'VOCABULARY_GRAMMAR') THEN 1 ELSE 0 END), 0) as sk_solved,
          COALESCE(SUM(CASE WHEN type IN ('SKILL_DIALOGUE', 'RESTATEMENT', 'TRANSLATION', 'VOCABULARY_GRAMMAR') AND status = 'SOLVED_CORRECT' THEN 1 ELSE 0 END), 0) as sk_correct
         FROM questions WHERE status != 'ACTIVE'`
      );

      const wordsRes: any = await this.dbInstance.getFirstAsync(
        `SELECT COUNT(*) as words_studied FROM user_word_progress WHERE (box > 1 OR status = 'MASTERED' OR correct_count > 0)`
      );

      const examStats: any = await this.dbInstance.getFirstAsync(
        `SELECT COUNT(*) as total_exams, AVG(yds_score) as avg_score FROM exam_history WHERE (correct_count + wrong_count) > 0`
      );

      const latestExam: any = await this.dbInstance.getFirstAsync(
        `SELECT yds_score FROM exam_history WHERE (correct_count + wrong_count) > 0 ORDER BY completed_at DESC LIMIT 1`
      );

      const totalSolved = qStats?.total_solved || 0;
      const totalCorrect = qStats?.total_correct || 0;
      const totalMistakes = qStats?.total_mistakes || 0;
      const accuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;
      
      const latestExamScore = latestExam?.yds_score ? Math.round(latestExam.yds_score) : null;
      const avgExamScore = examStats?.avg_score ? Math.round(examStats.avg_score) : null;

      const predictedScore = latestExamScore !== null 
        ? latestExamScore 
        : totalSolved > 0 
          ? Math.min(100, Math.max(35, Math.round(accuracy * 0.9 + (totalSolved > 20 ? 10 : 0))))
          : 60;

      const pSolved = qStats?.p_solved || 0;
      const pCorrect = qStats?.p_correct || 0;
      const cSolved = qStats?.c_solved || 0;
      const cCorrect = qStats?.c_correct || 0;
      const sSolved = qStats?.s_solved || 0;
      const sCorrect = qStats?.s_correct || 0;
      const skSolved = qStats?.sk_solved || 0;
      const skCorrect = qStats?.sk_correct || 0;

      return {
        totalQuestionsSolved: totalSolved,
        totalCorrect,
        totalMistakes,
        accuracyPercentage: accuracy,
        predictedYdsScore: predictedScore,
        totalExamsCompleted: examStats?.total_exams || 0,
        latestExamScore,
        averageExamScore: avgExamScore,
        totalWordsStudied: wordsRes?.words_studied || 0,
        categoryStats: {
          paragraph: { solved: pSolved, correct: pCorrect, accuracy: pSolved > 0 ? Math.round((pCorrect / pSolved) * 100) : 0 },
          cloze: { solved: cSolved, correct: cCorrect, accuracy: cSolved > 0 ? Math.round((cCorrect / cSolved) * 100) : 0 },
          sentence: { solved: sSolved, correct: sCorrect, accuracy: sSolved > 0 ? Math.round((sCorrect / sSolved) * 100) : 0 },
          skills: { solved: skSolved, correct: skCorrect, accuracy: skSolved > 0 ? Math.round((skCorrect / skSolved) * 100) : 0 },
        },
        dailyStreak: 1,
      };
    } catch (e) {
      console.warn('Failed to calculate comprehensive stats:', e);
      return {
        totalQuestionsSolved: 0,
        totalCorrect: 0,
        totalMistakes: 0,
        accuracyPercentage: 0,
        predictedYdsScore: 60,
        totalExamsCompleted: 0,
        latestExamScore: null,
        averageExamScore: null,
        totalWordsStudied: 0,
        categoryStats: {
          paragraph: { solved: 0, correct: 0, accuracy: 0 },
          cloze: { solved: 0, correct: 0, accuracy: 0 },
          sentence: { solved: 0, correct: 0, accuracy: 0 },
          skills: { solved: 0, correct: 0, accuracy: 0 },
        },
        dailyStreak: 1,
      };
    }
  }

  private mapRowToQuestion(r: any): QuestionItem {
    return {
      id: r.id,
      user_id: r.user_id || undefined,
      generation_date: r.generation_date || undefined,
      type: r.type,
      title: r.title,
      passage: r.passage,
      question_number: r.question_number,
      question_text: r.question_text,
      options: {
        A: r.option_a,
        B: r.option_b,
        C: r.option_c,
        D: r.option_d,
        E: r.option_e,
      },
      correct_option: r.correct_option as OptionKey,
      explanation: r.explanation,
      subtopic: r.subtopic,
      difficulty: r.difficulty,
      source: r.source,
      status: r.status,
      created_at: r.created_at,
    };
  }

  private safeParseJson<T>(val: any, fallback: T): T {
    if (!val) return fallback;
    if (typeof val !== 'string') return val;
    try {
      return JSON.parse(val) as T;
    } catch (_) {
      return fallback;
    }
  }
}

export interface PerformanceStats {
  totalQuestionsSolved: number;
  totalCorrect: number;
  totalMistakes: number;
  accuracyPercentage: number;
  predictedYdsScore: number;
  totalExamsCompleted: number;
  latestExamScore: number | null;
  averageExamScore: number | null;
  totalWordsStudied: number;
  categoryStats: {
    paragraph: { solved: number; correct: number; accuracy: number };
    cloze: { solved: number; correct: number; accuracy: number };
    sentence: { solved: number; correct: number; accuracy: number };
    skills: { solved: number; correct: number; accuracy: number };
  };
  dailyStreak: number;
}

export const dbService = new DatabaseService();
