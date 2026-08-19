import { dbService, WordWithProgress } from '../database/DatabaseService';
import { CardWord, BoxCountSummary } from '../types';

export class SpacedRepetitionEngine {
  /**
   * Fetch today's 25 learning batch items in sequential level order (A1 -> C1)
   */
  async loadDailyBatch(dailyLimit: number = 25): Promise<CardWord[]> {
    const rawWords = await dbService.getDailyLearningQueue(dailyLimit);

    const cardWords: CardWord[] = rawWords.map((w) => {
      return {
        ...w,
        isCooldown: false,
      };
    });

    return cardWords;
  }

  /**
   * Fetch complete word dictionary with study status (isStudied, box tier)
   */
  async fetchAllWordsWithStatus(): Promise<WordWithProgress[]> {
    return await dbService.getAllWordsWithStatus();
  }

  /**
   * Handle user answer and update box transitions
   */
  async handleAnswer(wordId: number, isCorrect: boolean) {
    const updatedProgress = await dbService.updateWordProgress(
      wordId,
      isCorrect
    );
    return updatedProgress;
  }

  /**
   * Fetch retention statistics across Spaced Repetition Boxes
   */
  async fetchBoxSummary(): Promise<BoxCountSummary> {
    return await dbService.getBoxSummary();
  }
}

export const srEngine = new SpacedRepetitionEngine();
