import {
  CREATE_WORDS_TABLE,
  CREATE_PROGRESS_TABLE,
  CREATE_DAILY_STATS_TABLE,
  CREATE_USER_SETTINGS_TABLE,
  CREATE_INDEXES,
} from './schema';
import { WordItem, WordProgress, BoxCountSummary, BoxType } from '../types';

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
  autoId = 1;

  async init() {}

  async insertWord(item: Omit<WordItem, 'id'>): Promise<number> {
    const id = this.autoId++;
    const word: WordItem = { ...item, id };
    this.words.set(id, word);
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
        return;
      }
    } catch (e) {
      console.warn(
        'Native SQLite unavailable. Falling back to Memory Database Layer.',
        e
      );
    }
    this.isNative = false;
    await this.memoryDb.init();
  }

  private async execNativeSchema(): Promise<void> {
    if (!this.dbInstance) return;
    await this.dbInstance.execAsync(CREATE_WORDS_TABLE);
    await this.dbInstance.execAsync(CREATE_PROGRESS_TABLE);
    await this.dbInstance.execAsync(CREATE_DAILY_STATS_TABLE);
    await this.dbInstance.execAsync(CREATE_USER_SETTINGS_TABLE);
    await this.dbInstance.execAsync(CREATE_INDEXES);

    await this.dbInstance.runAsync(
      `INSERT OR IGNORE INTO user_settings (id, daily_limit, current_level, last_active_date) VALUES (1, 25, 'A1', date('now'))`
    );
  }

  /**
   * Reset database and re-seed full dataset safely
   */
  async resetAndSeedDatabase(wordsList: Omit<WordItem, 'id'>[]): Promise<number> {
    if (!this.isNative) {
      this.memoryDb.words.clear();
      this.memoryDb.progress.clear();
      this.memoryDb.autoId = 1;
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
            w.level || 'B1', // Level fallback guarantee
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

  async seedWords(wordsList: Omit<WordItem, 'id'>[]): Promise<number> {
    if (wordsList.length === 0) return 0;

    if (!this.isNative) {
      let count = 0;
      for (const w of wordsList) {
        await this.memoryDb.insertWord(w);
        count++;
      }
      return count;
    }

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
            w.level || 'B1', // Level fallback guarantee
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

  async getWordCount(): Promise<number> {
    if (!this.isNative) {
      return this.memoryDb.words.size;
    }
    const result = await this.dbInstance.getFirstAsync(
      'SELECT COUNT(*) as count FROM words'
    );
    return result?.count || 0;
  }

  async getDailyLearningQueue(dailyLimit: number = 25): Promise<WordItem[]> {
    if (!this.isNative) {
      const now = new Date().toISOString();
      const items: WordItem[] = [];

      for (const [id, word] of this.memoryDb.words.entries()) {
        const prog = this.memoryDb.progress.get(id);
        if (!prog) {
          if (items.length < dailyLimit) {
            items.push(word);
          }
        } else if (prog.box === 0 && prog.next_review_at <= now) {
          items.push(word);
        } else if (prog.box === 1 && prog.next_review_at <= now) {
          items.push(word);
        }
      }
      return items.slice(0, dailyLimit);
    }

    const nowISO = new Date().toISOString();

    const expiredCooldownWords = await this.dbInstance.getAllAsync(
      `SELECT w.* FROM words w
       JOIN user_word_progress p ON w.id = p.word_id
       WHERE p.box = 0 AND p.next_review_at <= ?
       ORDER BY p.next_review_at ASC`,
      [nowISO]
    );

    const neededNewCount = Math.max(
      0,
      dailyLimit - expiredCooldownWords.length
    );

    let newWords: any[] = [];
    if (neededNewCount > 0) {
      newWords = await this.dbInstance.getAllAsync(
        `SELECT w.* FROM words w
         LEFT JOIN user_word_progress p ON w.id = p.word_id
         WHERE p.id IS NULL
         ORDER BY CASE w.level
           WHEN 'A1' THEN 1
           WHEN 'A2' THEN 2
           WHEN 'B1' THEN 3
           WHEN 'B2' THEN 4
           WHEN 'C1' THEN 5
           ELSE 6
         END ASC, w.id ASC
         LIMIT ?`,
        [neededNewCount]
      );
    }

    const rawList = [...expiredCooldownWords, ...newWords];
    return rawList.map((row: any) => ({
      ...row,
      synonyms: row.synonyms ? JSON.parse(row.synonyms) : [],
    }));
  }

  async getBoxWordsWithLockStatus(boxNumber: 2 | 3): Promise<WordWithProgress[]> {
    const now = new Date();
    const nowISO = now.toISOString();

    if (!this.isNative) {
      const list: WordWithProgress[] = [];
      for (const [id, word] of this.memoryDb.words.entries()) {
        const prog = this.memoryDb.progress.get(id);
        if (prog && prog.box === boxNumber) {
          const nextDate = new Date(prog.next_review_at);
          const diffMs = nextDate.getTime() - now.getTime();
          const isUnlocked = diffMs <= 0;
          const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

          list.push({
            ...word,
            isStudied: true,
            box: prog.box,
            status: prog.status,
            correctCount: prog.correct_count,
            incorrectCount: prog.incorrect_count,
            nextReviewAt: prog.next_review_at,
            isUnlocked,
            daysRemaining,
          });
        }
      }
      return list;
    }

    const rows = await this.dbInstance.getAllAsync(
      `SELECT w.*, p.box, p.status, p.correct_count, p.incorrect_count, p.next_review_at, p.id as progress_id
       FROM words w
       JOIN user_word_progress p ON w.id = p.word_id
       WHERE p.box = ?
       ORDER BY p.next_review_at ASC`,
      [boxNumber]
    );

    return rows.map((r: any) => {
      const nextDate = new Date(r.next_review_at);
      const diffMs = nextDate.getTime() - now.getTime();
      const isUnlocked = diffMs <= 0;
      const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      return {
        ...r,
        synonyms: r.synonyms ? JSON.parse(r.synonyms) : [],
        isStudied: true,
        box: r.box,
        status: r.status,
        correctCount: r.correct_count || 0,
        incorrectCount: r.incorrect_count || 0,
        nextReviewAt: r.next_review_at,
        isUnlocked,
        daysRemaining,
      };
    });
  }

  async getAllWordsWithStatus(): Promise<WordWithProgress[]> {
    if (!this.isNative) {
      const list: WordWithProgress[] = [];
      for (const [id, word] of this.memoryDb.words.entries()) {
        const prog = this.memoryDb.progress.get(id);
        list.push({
          ...word,
          isStudied: !!prog,
          box: prog ? prog.box : null,
          status: prog ? prog.status : null,
          correctCount: prog ? prog.correct_count : 0,
          incorrectCount: prog ? prog.incorrect_count : 0,
        });
      }
      return list;
    }

    const rows = await this.dbInstance.getAllAsync(
      `SELECT w.*, p.box, p.status, p.correct_count, p.incorrect_count, p.id as progress_id
       FROM words w
       LEFT JOIN user_word_progress p ON w.id = p.word_id
       ORDER BY CASE w.level
         WHEN 'A1' THEN 1
         WHEN 'A2' THEN 2
         WHEN 'B1' THEN 3
         WHEN 'B2' THEN 4
         WHEN 'C1' THEN 5
         ELSE 6
       END ASC, w.id ASC`
    );

    return rows.map((r: any) => ({
      ...r,
      synonyms: r.synonyms ? JSON.parse(r.synonyms) : [],
      isStudied: !!r.progress_id,
      box: r.box !== undefined ? r.box : null,
      status: r.status || null,
      correctCount: r.correct_count || 0,
      incorrectCount: r.incorrect_count || 0,
    }));
  }

  async updateWordProgress(
    wordId: number,
    isCorrect: boolean
  ): Promise<WordProgress> {
    const now = new Date();
    const nowISO = now.toISOString();

    let currentProgress: WordProgress | null = null;

    if (this.isNative) {
      const row = await this.dbInstance.getFirstAsync(
        `SELECT * FROM user_word_progress WHERE word_id = ?`,
        [wordId]
      );
      if (row) {
        currentProgress = row as WordProgress;
      }
    } else {
      currentProgress = this.memoryDb.progress.get(wordId) || null;
    }

    let newBox: BoxType = 1;
    let newStatus = 'LEARNING';
    let nextReviewAt: Date;
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

  async getBoxSummary(): Promise<BoxCountSummary> {
    if (!this.isNative) {
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0;
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

    const totalRes = await this.dbInstance.getFirstAsync(
      `SELECT COUNT(*) as cnt FROM words`
    );

    return {
      specialPoolCount: map[0] || 0,
      dailyBoxCount: map[1] || 0,
      weeklyBoxCount: map[2] || 0,
      monthlyBoxCount: map[3] || 0,
      totalWords: totalRes?.cnt || 0,
      learnedWords: (map[2] || 0) + (map[3] || 0),
    };
  }
}

export const dbService = new DatabaseService();
