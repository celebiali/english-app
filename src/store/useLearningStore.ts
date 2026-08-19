import { create } from 'zustand';
import { CardWord, BoxCountSummary } from '../types';
import { dbService, WordWithProgress } from '../database/DatabaseService';
import { srEngine } from '../services/SpacedRepetitionEngine';
import { DataParserService } from '../services/DataParserService';

export type AppTab = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'DICTIONARY';
export type StudyMode = 'PREVIEW' | 'TEST';

interface LearningState {
  activeTab: AppTab;
  studyMode: StudyMode;
  dailyLimit: number;
  sessionWords: CardWord[];
  currentIndex: number;
  boxSummary: BoxCountSummary;
  weeklyWords: WordWithProgress[];
  monthlyWords: WordWithProgress[];
  dictionaryWords: WordWithProgress[];
  isLoading: boolean;
  isInitialized: boolean;
  completedTodayCount: number;

  // Actions
  initStore: () => Promise<void>;
  setActiveTab: (tab: AppTab) => void;
  setStudyMode: (mode: StudyMode) => void;
  loadSession: () => Promise<void>;
  loadWeeklyBox: () => Promise<void>;
  loadMonthlyBox: () => Promise<void>;
  loadDictionary: () => Promise<void>;
  answerCurrentCard: (isCorrect: boolean) => Promise<void>;
  resetSession: () => Promise<void>;
}

export const useLearningStore = create<LearningState>((set, get) => ({
  activeTab: 'DAILY',
  studyMode: 'PREVIEW',
  dailyLimit: 25,
  sessionWords: [],
  currentIndex: 0,
  boxSummary: {
    specialPoolCount: 0,
    dailyBoxCount: 0,
    weeklyBoxCount: 0,
    monthlyBoxCount: 0,
    totalWords: 0,
    learnedWords: 0,
  },
  weeklyWords: [],
  monthlyWords: [],
  dictionaryWords: [],
  isLoading: true,
  isInitialized: false,
  completedTodayCount: 0,

  initStore: async () => {
    set({ isLoading: true });
    try {
      await dbService.initDatabase();

      const count = await dbService.getWordCount();
      if (count < 7000) {
        console.log('Resetting and seeding full YDS dataset...');
        const seedData = DataParserService.getFullSeedDataset();
        await dbService.resetAndSeedDatabase(seedData);
      }

      await get().loadSession();
      await get().loadWeeklyBox();
      await get().loadMonthlyBox();
      await get().loadDictionary();
      set({ isInitialized: true, isLoading: false });
    } catch (e) {
      console.error('Failed to initialize learning store:', e);
      set({ isLoading: false });
    }
  },

  setActiveTab: (tab: AppTab) => {
    set({ activeTab: tab });
    if (tab === 'DAILY') get().loadSession();
    if (tab === 'WEEKLY') get().loadWeeklyBox();
    if (tab === 'MONTHLY') get().loadMonthlyBox();
    if (tab === 'DICTIONARY') get().loadDictionary();
  },

  setStudyMode: (mode: StudyMode) => {
    set({ studyMode: mode });
  },

  loadSession: async () => {
    set({ isLoading: true });
    const { dailyLimit } = get();

    const words = await srEngine.loadDailyBatch(dailyLimit);
    const summary = await srEngine.fetchBoxSummary();

    set({
      sessionWords: words,
      currentIndex: 0,
      boxSummary: summary,
      studyMode: 'PREVIEW',
      isLoading: false,
    });
  },

  loadWeeklyBox: async () => {
    const list = await dbService.getBoxWordsWithLockStatus(2);
    set({ weeklyWords: list });
  },

  loadMonthlyBox: async () => {
    const list = await dbService.getBoxWordsWithLockStatus(3);
    set({ monthlyWords: list });
  },

  loadDictionary: async () => {
    const list = await srEngine.fetchAllWordsWithStatus();
    set({ dictionaryWords: list });
  },

  answerCurrentCard: async (isCorrect: boolean) => {
    const { sessionWords, currentIndex, completedTodayCount } = get();
    if (currentIndex >= sessionWords.length) return;

    const currentCard = sessionWords[currentIndex];

    await srEngine.handleAnswer(currentCard.id, isCorrect);

    const summary = await srEngine.fetchBoxSummary();
    await get().loadDictionary();

    set({
      currentIndex: currentIndex + 1,
      boxSummary: summary,
      completedTodayCount: completedTodayCount + 1,
    });
  },

  resetSession: async () => {
    await get().loadSession();
  },
}));
