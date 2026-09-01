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
  taskGoals: TaskGoalsConfig = { paragraph: 8, cloze: 5, sentence: 8, skills: 14 };
  dailyTaskStats: Map<string, {
    paragraphCompleted: number;
    clozeCompleted: number;
    sentenceCompleted: number;
    skillsCompleted: number;
    vocabCompleted: number;
  }> = new Map();
  streak: { count: number; lastDate: string } = { count: 1, lastDate: new Date().toISOString().split('T')[0] };
  autoWordId = 1;
  autoQuestionId = 1;
  autoMistakeId = 1;

  async init() {
    if (this.folders.size === 0) {
      this.folders.set('sys_vocab', {
        id: 'sys_vocab',
        name: 'YDS Kelime Havuzu',
        description: 'A1 - C1 Seviye Temel ve İleri Kelimeler',
        color: '#4F46E5',
        icon: 'BookOpen',
        is_system: true,
        category_type: 'VOCABULARY',
      });
      this.folders.set('sys_conn', {
        id: 'sys_conn',
        name: 'Bağlaçlar ve Yapılar',
        description: 'Zaman, Zıtlık, Sebep ve Koşul Bağlaçları',
        color: '#0EA5E9',
        icon: 'Link',
        is_system: true,
        category_type: 'CONNECTOR',
      });
      this.folders.set('sys_root', {
        id: 'sys_root',
        name: 'Etimoloji ve Kökler',
        description: 'Latin & Grek Kökler, Ön ve Son Ekler',
        color: '#8B5CF6',
        icon: 'Dna',
        is_system: true,
        category_type: 'PREFIX_ROOT',
      });
      this.folders.set('sys_idiom', {
        id: 'sys_idiom',
        name: 'Deyimler ve Kalıplar',
        description: 'Oxford YDS Sık Kullanılan Kalıp İfadeler',
        color: '#F59E0B',
        icon: 'MessageSquareQuote',
        is_system: true,
        category_type: 'IDIOM',
      });
      this.folders.set('custom_default', {
        id: 'custom_default',
        name: 'Özel Kelime Defterim',
        description: 'Eklediğim tüm özel kelimeler',
        color: '#10B981',
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
        return;
      }
    } catch (e) {
      console.warn('Native SQLite unavailable. Falling back to Memory Database Layer.', e);
    }
    this.isNative = false;
    await this.memoryDb.init();
    await this.seedQuestionsIfEmpty();
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

    // Seed default folders
    try {
      await this.dbInstance.runAsync(
        `INSERT OR IGNORE INTO vocab_folders (id, name, description, color, icon, is_system, category_type) VALUES
         ('sys_vocab', 'YDS Kelime Havuzu', 'A1 - C1 Seviye Temel ve İleri Kelimeler', '#4F46E5', 'BookOpen', 1, 'VOCABULARY'),
         ('sys_conn', 'Bağlaçlar ve Yapılar', 'Zaman, Zıtlık, Sebep ve Koşul Bağlaçları', '#0EA5E9', 'Link', 1, 'CONNECTOR'),
         ('sys_root', 'Etimoloji ve Kökler', 'Latin & Grek Kökler, Ön ve Son Ekler', '#8B5CF6', 'Dna', 1, 'PREFIX_ROOT'),
         ('sys_idiom', 'Deyimler ve Kalıplar', 'Oxford YDS Sık Kullanılan Kalıp İfadeler', '#F59E0B', 'MessageSquareQuote', 1, 'IDIOM'),
         ('custom_default', 'Özel Kelime Defterim', 'Eklediğim tüm özel kelimeler', '#10B981', 'Star', 0, NULL)`
      );
    } catch (_) {}

    await this.dbInstance.runAsync(
      `INSERT OR IGNORE INTO user_settings (id, daily_limit, current_level, last_active_date, streak_count, paragraph_goal, cloze_goal, sentence_goal, skills_goal) VALUES (1, 25, 'A1', date('now'), 1, 8, 5, 8, 14)`
    );
  }

  /**
   * Reads user's dynamic daily question task goals
   */
  async getUserTaskGoals(): Promise<TaskGoalsConfig> {
    const defaultGoals: TaskGoalsConfig = { paragraph: 8, cloze: 5, sentence: 8, skills: 14 };
    if (!this.isNative) {
      return this.memoryDb.taskGoals || defaultGoals;
    }

    try {
      const row: any = await this.dbInstance.getFirstAsync(
        `SELECT paragraph_goal, cloze_goal, sentence_goal, skills_goal FROM user_settings WHERE id = 1`
      );
      if (row) {
        return {
          paragraph: Number(row.paragraph_goal) || 8,
          cloze: Number(row.cloze_goal) || 5,
          sentence: Number(row.sentence_goal) || 8,
          skills: Number(row.skills_goal) || 14,
        };
      }
    } catch (e) {
      console.warn('Failed to load user task goals from SQLite:', e);
    }
    return defaultGoals;
  }

  /**
   * Saves user's dynamic daily question task goals
   */
  async saveUserTaskGoals(goals: TaskGoalsConfig): Promise<void> {
    if (!this.isNative) {
      this.memoryDb.taskGoals = { ...goals };
      return;
    }

    try {
      await this.dbInstance.runAsync(
        `UPDATE user_settings SET paragraph_goal = ?, cloze_goal = ?, sentence_goal = ?, skills_goal = ? WHERE id = 1`,
        [goals.paragraph, goals.cloze, goals.sentence, goals.skills]
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

  // ==========================================
  // DYNAMIC QUESTION POOL METHODS
  // ==========================================

  /**
   * Fetches active questions for daily tasks according to dynamic category goals.
   */
  async getDailyTaskQuestions(goals: TaskGoalsConfig = { paragraph: 8, cloze: 5, sentence: 8, skills: 14 }): Promise<QuestionItem[]> {
    const paragraphs = await this.getActiveQuestionsByType('PARAGRAPH', goals.paragraph);
    const clozes = await this.getActiveQuestionsByType('CLOZE_TEST', goals.cloze);
    const sentences = await this.getActiveQuestionsByType('SENTENCE_COMPLETION', goals.sentence);
    const skills = await this.getActiveQuestionsByType('SKILL_DIALOGUE', goals.skills);

    return [...paragraphs, ...clozes, ...sentences, ...skills];
  }

  /**
   * Fetches active questions for daily tasks by question type.
   * Only returns questions with status = 'ACTIVE'.
   * Correctly answered questions disappear from this active query!
   */
  async getActiveQuestionsByType(type?: YdsQuestionType, limit: number = 20): Promise<QuestionItem[]> {
    if (!this.isNative) {
      let filtered = Array.from(this.memoryDb.questions.values()).filter((q) => q.status === 'ACTIVE');
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
      return filtered.slice(0, limit);
    }

    let query = `SELECT * FROM questions WHERE status = 'ACTIVE'`;
    const params: any[] = [];

    if (type) {
      if (type === 'SKILL_DIALOGUE') {
        query += ` AND type IN ('SKILL_DIALOGUE', 'RESTATEMENT', 'TRANSLATION', 'VOCABULARY_GRAMMAR')`;
      } else {
        query += ` AND type = ?`;
        params.push(type);
      }
    }

    query += ` ORDER BY id ASC LIMIT ?`;
    params.push(limit);

    const rows = await this.dbInstance.getAllAsync(query, params);
    return rows.map((r: any) => this.mapRowToQuestion(r));
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
      `INSERT INTO questions (type, title, passage, question_number, question_text, option_a, option_b, option_c, option_d, option_e, correct_option, explanation, subtopic, difficulty, source, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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

  async getVocabFolders(): Promise<VocabFolder[]> {
    const allWords = await this.getAllWordsWithProgress();

    if (!this.isNative) {
      await this.memoryDb.init();
      const list = Array.from(this.memoryDb.folders.values());
      return list.map((f) => {
        let matchingWords: WordWithProgress[] = [];
        if (f.is_system && f.category_type) {
          matchingWords = allWords.filter((w) => w.category === f.category_type);
        } else if (f.id === 'custom_default') {
          matchingWords = allWords.filter(
            (w) => w.is_custom || (w.subcategory && !['VOCABULARY', 'CONNECTOR', 'PREFIX_ROOT', 'IDIOM'].includes(w.subcategory))
          );
        } else {
          matchingWords = allWords.filter((w) => w.subcategory === f.name);
        }
        const learned = matchingWords.filter((w) => w.box !== null && w.box > 1).length;
        return {
          ...f,
          word_count: matchingWords.length,
          learned_count: learned,
        };
      });
    }

    const rows = await this.dbInstance.getAllAsync(
      `SELECT * FROM vocab_folders ORDER BY is_system DESC, id ASC`
    );

    return rows.map((r: any) => {
      const folder: VocabFolder = {
        id: r.id,
        name: r.name,
        description: r.description,
        color: r.color,
        icon: r.icon,
        is_system: r.is_system === 1,
        category_type: r.category_type,
        created_at: r.created_at,
      };

      let matchingWords: WordWithProgress[] = [];
      if (folder.is_system && folder.category_type) {
        matchingWords = allWords.filter((w) => w.category === folder.category_type);
      } else if (folder.id === 'custom_default') {
        matchingWords = allWords.filter(
          (w) => w.is_custom || (w.subcategory && !['VOCABULARY', 'CONNECTOR', 'PREFIX_ROOT', 'IDIOM'].includes(w.subcategory))
        );
      } else {
        matchingWords = allWords.filter((w) => w.subcategory === folder.name);
      }
      const learned = matchingWords.filter((w) => w.box !== null && w.box > 1).length;

      return {
        ...folder,
        word_count: matchingWords.length,
        learned_count: learned,
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
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      this.memoryDb.progress.set(id, {
        id: Date.now(),
        word_id: id,
        box: 1,
        status: 'NEW',
        correct_count: 0,
        incorrect_count: 0,
        last_reviewed_at: now.toISOString(),
        next_review_at: tomorrow.toISOString(),
        box_entry_date: now.toISOString(),
      });
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
    // Set next_review_at to tomorrow so words added today NEVER appear in today's daily study session
    await this.dbInstance.runAsync(
      `INSERT INTO user_word_progress (word_id, box, status, correct_count, incorrect_count, last_reviewed_at, next_review_at, box_entry_date)
       VALUES (?, 1, 'NEW', 0, 0, datetime('now'), datetime('now', '+1 day'), datetime('now'))`,
      [wordId]
    );

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

  async deleteCustomWord(wordId: number): Promise<void> {
    if (!this.isNative) {
      this.memoryDb.words.delete(wordId);
      this.memoryDb.progress.delete(wordId);
      return;
    }

    await this.dbInstance.runAsync(`DELETE FROM user_word_progress WHERE word_id = ?`, [wordId]);
    await this.dbInstance.runAsync(`DELETE FROM words WHERE id = ?`, [wordId]);
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
    await this.dbInstance.withTransactionAsync(async () => {
      for (const w of wordsList) {
        await this.dbInstance.runAsync(
          `INSERT INTO words (word, meaning, category, subcategory, level, synonyms, example_sentence, example_translation, etymology_note)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            w.word,
            w.meaning,
            w.category || 'VOCABULARY',
            w.subcategory || null,
            w.level || 'B1',
            w.synonyms ? JSON.stringify(w.synonyms) : null,
            w.example_sentence || null,
            w.example_translation || null,
            w.etymology_note || null,
          ]
        );
        inserted++;
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
      this.memoryDb.streak = { count: 1, lastDate: new Date().toISOString().split('T')[0] };
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
          `UPDATE user_settings SET streak_count = 1, last_active_date = date('now') WHERE id = 1`
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
        synonyms: r.synonyms ? JSON.parse(r.synonyms) : [],
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
      synonyms: r.synonyms ? JSON.parse(r.synonyms) : [],
      example_sentence: r.example_sentence,
      example_translation: r.example_translation,
      etymology_note: r.etymology_note,
      is_custom: r.is_custom === 1,
      isStudied: r.box !== null,
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

  async getDailyLearningQueue(limit: number = 25): Promise<CardWord[]> {
    return await this.getWordsForDailyBatch(limit);
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

    if (isCorrect) {
      correctCount += 1;
      const currentBox = currentProgress ? currentProgress.box : 1;

      if (currentBox === 0 || currentBox === 1) {
        newBox = 2;
        nextReviewAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        newStatus = 'REVIEWING';
      } else if (currentBox === 2) {
        newBox = 3;
        nextReviewAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        newStatus = 'MASTERED';
      } else {
        newBox = 3;
        nextReviewAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        newStatus = 'MASTERED';
      }
    } else {
      incorrectCount += 1;
      newBox = 0;
      nextReviewAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      newStatus = 'LEARNING';
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
    } else {
      this.memoryDb.progress.set(wordId, updatedProg);
    }

    return updatedProg;
  }

  async getWordsForDailyBatch(newWordsLimit: number = 25): Promise<CardWord[]> {
    if (!this.isNative) {
      const allWords = Array.from(this.memoryDb.words.values());
      const reviewWords: CardWord[] = [];
      const newWords: CardWord[] = [];

      for (const w of allWords) {
        const prog = this.memoryDb.progress.get(w.id);
        const isDue = !prog?.next_review_at || new Date(prog.next_review_at).getTime() <= Date.now();
        if (prog && (prog.box === 0 || prog.box === 1) && isDue) {
          reviewWords.push({
            ...w,
            progress: prog,
            cardType: 'REVIEW',
            reviewBox: prog.box,
            isCooldown: false,
          });
        } else if (!prog && !w.is_custom) {
          if (newWords.length < newWordsLimit) {
            newWords.push({
              ...w,
              cardType: 'NEW',
              isCooldown: false,
            });
          }
        }
      }
      return [...reviewWords, ...newWords];
    }

    // 1. Fetch DUE REVIEW words waiting in Box 0 or Box 1 (Must be due for review, excluding words added today)
    const reviewRows = await this.dbInstance.getAllAsync(
      `SELECT w.*, p.box as prog_box, p.status as prog_status, p.correct_count as prog_correct, p.incorrect_count as prog_incorrect, p.last_reviewed_at as prog_last_reviewed, p.next_review_at as prog_next_review, p.box_entry_date as prog_entry_date
       FROM words w
       INNER JOIN user_word_progress p ON w.id = p.word_id
       WHERE (p.box = 0 OR p.box = 1)
         AND (p.next_review_at IS NULL OR p.next_review_at <= datetime('now'))
       ORDER BY p.last_reviewed_at ASC`
    );

    const reviewWords: CardWord[] = reviewRows.map((r: any) => ({
      id: r.id,
      word: r.word,
      meaning: r.meaning,
      category: r.category,
      subcategory: r.subcategory,
      level: r.level,
      synonyms: r.synonyms ? JSON.parse(r.synonyms) : [],
      example_sentence: r.example_sentence,
      example_translation: r.example_translation,
      etymology_note: r.etymology_note,
      is_custom: r.is_custom === 1,
      cardType: 'REVIEW',
      reviewBox: r.prog_box,
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
    }));

    // 2. Fetch GUARANTEED 25 BRAND NEW UNSEEN words from official curriculum
    const newRows = await this.dbInstance.getAllAsync(
      `SELECT w.* FROM words w
       LEFT JOIN user_word_progress p ON w.id = p.word_id
       WHERE p.id IS NULL AND (w.is_custom IS NULL OR w.is_custom = 0)
       ORDER BY w.id ASC
       LIMIT ?`,
      [newWordsLimit]
    );

    const newWords: CardWord[] = newRows.map((r: any) => ({
      id: r.id,
      word: r.word,
      meaning: r.meaning,
      category: r.category,
      subcategory: r.subcategory,
      level: r.level,
      synonyms: r.synonyms ? JSON.parse(r.synonyms) : [],
      example_sentence: r.example_sentence,
      example_translation: r.example_translation,
      etymology_note: r.etymology_note,
      is_custom: r.is_custom === 1,
      cardType: 'NEW',
      isCooldown: false,
    }));

    // Return due review words first, followed by the full quota of 25 new words
    return [...reviewWords, ...newWords];
  }

  async getStreakCount(): Promise<number> {
    if (!this.isNative) return this.memoryDb.streak.count;
    const res = await this.dbInstance.getFirstAsync(`SELECT streak_count FROM user_settings WHERE id = 1`);
    return res?.streak_count || 1;
  }

  async checkAndUpdateDailyStreak(): Promise<number> {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!this.isNative) {
      const lastDate = this.memoryDb.streak.lastDate;
      if (lastDate === todayStr) {
        return this.memoryDb.streak.count;
      } else if (lastDate === yesterdayStr) {
        this.memoryDb.streak.count += 1;
        this.memoryDb.streak.lastDate = todayStr;
      } else {
        this.memoryDb.streak.count = 1;
        this.memoryDb.streak.lastDate = todayStr;
      }
      return this.memoryDb.streak.count;
    }

    const row = await this.dbInstance.getFirstAsync(
      `SELECT last_active_date, streak_count FROM user_settings WHERE id = 1`
    );
    let count = row?.streak_count || 1;
    const lastActive = row?.last_active_date;

    if (lastActive === todayStr) {
      return count;
    } else if (lastActive === yesterdayStr) {
      count += 1;
    } else {
      count = 1;
    }

    await this.dbInstance.runAsync(
      `UPDATE user_settings SET last_active_date = ?, streak_count = ? WHERE id = 1`,
      [todayStr, count]
    );

    return count;
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
      const memStat = this.memoryDb.dailyTaskStats?.get(todayStr);
      return {
        paragraphCompleted: Math.min(goals.paragraph, Math.max(memStat?.paragraphCompleted || 0, p_done)),
        clozeCompleted: Math.min(goals.cloze, Math.max(memStat?.clozeCompleted || 0, c_done)),
        sentenceCompleted: Math.min(goals.sentence, Math.max(memStat?.sentenceCompleted || 0, s_done)),
        skillsCompleted: Math.min(goals.skills, Math.max(memStat?.skillsCompleted || 0, sk_done)),
        vocabCompleted: memStat?.vocabCompleted || 0,
      };
    }

    try {
      const statsRow: any = await this.dbInstance.getFirstAsync(
        `SELECT paragraph_completed, cloze_completed, sentence_completed, skills_completed, words_reviewed 
         FROM daily_stats WHERE study_date = ?`,
        [todayStr]
      );

      const qRow: any = await this.dbInstance.getFirstAsync(
        `SELECT 
          COALESCE(SUM(CASE WHEN type = 'PARAGRAPH' AND status != 'ACTIVE' THEN 1 ELSE 0 END), 0) as p_done,
          COALESCE(SUM(CASE WHEN type = 'CLOZE_TEST' AND status != 'ACTIVE' THEN 1 ELSE 0 END), 0) as c_done,
          COALESCE(SUM(CASE WHEN type = 'SENTENCE_COMPLETION' AND status != 'ACTIVE' THEN 1 ELSE 0 END), 0) as s_done,
          COALESCE(SUM(CASE WHEN type IN ('SKILL_DIALOGUE', 'RESTATEMENT', 'TRANSLATION', 'VOCABULARY_GRAMMAR') AND status != 'ACTIVE' THEN 1 ELSE 0 END), 0) as sk_done
         FROM questions`
      );

      const pStat = statsRow?.paragraph_completed || 0;
      const cStat = statsRow?.cloze_completed || 0;
      const sStat = statsRow?.sentence_completed || 0;
      const skStat = statsRow?.skills_completed || 0;

      const pDone = Math.min(goals.paragraph, Math.max(pStat, qRow?.p_done || 0));
      const cDone = Math.min(goals.cloze, Math.max(cStat, qRow?.c_done || 0));
      const sDone = Math.min(goals.sentence, Math.max(sStat, qRow?.s_done || 0));
      const skDone = Math.min(goals.skills, Math.max(skStat, qRow?.sk_done || 0));

      return {
        paragraphCompleted: pDone,
        clozeCompleted: cDone,
        sentenceCompleted: sDone,
        skillsCompleted: skDone,
        vocabCompleted: statsRow?.words_reviewed || 0,
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
    const todayStr = new Date().toISOString().split('T')[0];
    const current = await this.getDailyTaskProgressToday(goals);

    let p = current.paragraphCompleted;
    let c = current.clozeCompleted;
    let s = current.sentenceCompleted;
    let sk = current.skillsCompleted;

    if (type === 'PARAGRAPH') p = Math.min(goals.paragraph, p + 1);
    else if (type === 'CLOZE_TEST') c = Math.min(goals.cloze, c + 1);
    else if (type === 'SENTENCE_COMPLETION') s = Math.min(goals.sentence, s + 1);
    else sk = Math.min(goals.skills, sk + 1);

    if (!this.isNative) {
      if (!this.memoryDb.dailyTaskStats) {
        this.memoryDb.dailyTaskStats = new Map();
      }
      const updated = {
        paragraphCompleted: p,
        clozeCompleted: c,
        sentenceCompleted: s,
        skillsCompleted: sk,
        vocabCompleted: current.vocabCompleted,
      };
      this.memoryDb.dailyTaskStats.set(todayStr, updated);
      return updated;
    }

    try {
      await this.dbInstance.runAsync(
        `INSERT INTO daily_stats (study_date, paragraph_completed, cloze_completed, sentence_completed, skills_completed)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(study_date) DO UPDATE SET
           paragraph_completed = excluded.paragraph_completed,
           cloze_completed = excluded.cloze_completed,
           sentence_completed = excluded.sentence_completed,
           skills_completed = excluded.skills_completed`,
        [todayStr, p, c, s, sk]
      );
    } catch (e) {
      console.warn('Failed to increment daily task progress in SQLite:', e);
    }

    return {
      paragraphCompleted: p,
      clozeCompleted: c,
      sentenceCompleted: s,
      skillsCompleted: sk,
      vocabCompleted: current.vocabCompleted,
    };
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
