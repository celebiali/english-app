import {
  CREATE_WORDS_TABLE,
  CREATE_PROGRESS_TABLE,
  CREATE_DAILY_STATS_TABLE,
  CREATE_USER_SETTINGS_TABLE,
  CREATE_QUESTIONS_TABLE,
  CREATE_MISTAKE_VAULT_TABLE,
  CREATE_EXAM_HISTORY_TABLE,
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
  examHistory: ExamScoreCard[] = [];
  streak: { count: number; lastDate: string } = { count: 1, lastDate: new Date().toISOString().split('T')[0] };
  autoWordId = 1;
  autoQuestionId = 1;
  autoMistakeId = 1;

  async init() {}

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
    await this.dbInstance.execAsync(CREATE_INDEXES);

    await this.dbInstance.runAsync(
      `INSERT OR IGNORE INTO user_settings (id, daily_limit, current_level, last_active_date, streak_count) VALUES (1, 25, 'A1', date('now'), 1)`
    );
  }

  /**
   * Seeds initial YDS questions if empty
   */
  async seedQuestionsIfEmpty(): Promise<void> {
    const initialList = YdsQuestionBankService.getInitialQuestions();

    if (!this.isNative) {
      if (this.memoryDb.questions.size === 0) {
        for (const q of initialList) {
          await this.memoryDb.insertQuestion(q);
        }
      }
      return;
    }

    const countRes = await this.dbInstance.getFirstAsync(`SELECT COUNT(*) as cnt FROM questions`);
    if (!countRes || countRes.cnt === 0) {
      await this.dbInstance.withTransactionAsync(async () => {
        for (const q of initialList) {
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
      });
    }
  }

  // ==========================================
  // DYNAMIC QUESTION POOL METHODS
  // ==========================================

  /**
   * Fetches active questions for daily tasks by question type.
   * Only returns questions with status = 'ACTIVE'.
   * Correctly answered questions disappear from this active query!
   */
  async getActiveQuestionsByType(type?: YdsQuestionType, limit: number = 20): Promise<QuestionItem[]> {
    if (!this.isNative) {
      let filtered = Array.from(this.memoryDb.questions.values()).filter((q) => q.status === 'ACTIVE');
      if (type) {
        filtered = filtered.filter((q) => q.type === type);
      }
      return filtered.slice(0, limit);
    }

    let query = `SELECT * FROM questions WHERE status = 'ACTIVE'`;
    const params: any[] = [];

    if (type) {
      query += ` AND type = ?`;
      params.push(type);
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
   * "Öğrendim / Mezun Et" button: marks mistake as reviewed and question as ARCHIVED
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
      return this.memoryDb.examHistory;
    }

    const rows = await this.dbInstance.getAllAsync(
      `SELECT * FROM exam_history ORDER BY id DESC LIMIT 20`
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
  // CUSTOM VOCABULARY & LEITNER BOX METHODS
  // ==========================================

  async insertCustomWord(word: Partial<WordItem>): Promise<number> {
    const item: Omit<WordItem, 'id'> = {
      word: word.word || '',
      meaning: word.meaning || '',
      category: word.category || 'VOCABULARY',
      subcategory: word.subcategory || 'Custom Words',
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
      this.memoryDb.progress.set(id, {
        id: Date.now(),
        word_id: id,
        box: 1,
        status: 'NEW',
        correct_count: 0,
        incorrect_count: 0,
        last_reviewed_at: null,
        next_review_at: now.toISOString(),
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
    await this.dbInstance.runAsync(
      `INSERT INTO user_word_progress (word_id, box, status, correct_count, incorrect_count, next_review_at, box_entry_date)
       VALUES (?, 1, 'NEW', 0, 0, datetime('now'), datetime('now'))`,
      [wordId]
    );

    return wordId;
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

  async getDailyLearningQueue(limit: number = 25): Promise<WordItem[]> {
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

  async getWordsForDailyBatch(limit: number = 25): Promise<WordItem[]> {
    if (!this.isNative) {
      return Array.from(this.memoryDb.words.values()).slice(0, limit);
    }
    const rows = await this.dbInstance.getAllAsync(
      `SELECT w.* FROM words w
       LEFT JOIN user_word_progress p ON w.id = p.word_id
       WHERE p.id IS NULL OR p.box = 1
       LIMIT ?`,
      [limit]
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
    }));
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

export const dbService = new DatabaseService();
