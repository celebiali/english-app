import { create } from 'zustand';
import {
  CardWord,
  BoxCountSummary,
  QuestionItem,
  YdsQuestionType,
  OptionKey,
  MistakeItem,
  MockExam,
  ExamSessionState,
  ExamScoreCard,
  WordItem,
  UserProfile,
} from '../types';
import { dbService, WordWithProgress } from '../database/DatabaseService';
import { srEngine } from '../services/SpacedRepetitionEngine';
import { DataParserService } from '../services/DataParserService';
import { YdsQuestionBankService } from '../services/YdsQuestionBank';
import { YdsExamEngine } from '../services/YdsExamEngine';
import { AIService } from '../services/AIService';
import { YdsExamCatalogService, CatalogExamInfo } from '../services/YdsExamCatalog';

export type AppTab = 'TASKS' | 'EXAM' | 'MISTAKES' | 'VOCAB';
export type StudyMode = 'PREVIEW' | 'TEST';

interface DailyTaskProgress {
  paragraphCompleted: number;
  clozeCompleted: number;
  sentenceCompleted: number;
  skillsCompleted: number;
  vocabCompleted: number;
}

interface LearningState {
  activeTab: AppTab;
  isLoading: boolean;
  isInitialized: boolean;
  streakCount: number;

  // Daily Tasks State
  dailyTasksProgress: DailyTaskProgress;
  activeDailyQuestions: QuestionItem[];
  currentDailyIndex: number;
  isGeneratingAI: boolean;

  // 180-min Mock Exam State
  selectedCatalogExam: CatalogExamInfo | null;
  currentExam: MockExam | null;
  examState: ExamSessionState | null;
  examScoreCard: ExamScoreCard | null;
  examHistory: ExamScoreCard[];

  // Mistake Vault State
  mistakes: MistakeItem[];
  selectedMistake: MistakeItem | null;
  isAnalyzingMistake: boolean;

  // Vocabulary & Leitner State
  studyMode: StudyMode;
  dailyLimit: number;
  sessionWords: CardWord[];
  currentVocabIndex: number;
  boxSummary: BoxCountSummary;
  weeklyWords: WordWithProgress[];
  monthlyWords: WordWithProgress[];
  dictionaryWords: WordWithProgress[];
  completedTodayCount: number;
  // User Auth & Profile
  userProfile: UserProfile | null;

  // Actions
  initStore: () => Promise<void>;
  setActiveTab: (tab: AppTab) => void;
  setUserProfile: (profile: UserProfile | null) => void;

  // Daily Tasks Actions
  loadDailyTasks: () => Promise<void>;
  answerDailyQuestion: (question: QuestionItem, selectedOption: OptionKey) => Promise<boolean>;
  generateFreshAIQuestions: (type: YdsQuestionType) => Promise<void>;
  nextDailyQuestion: () => void;
  prevDailyQuestion: () => void;

  // Mock Exam Actions
  selectCatalogExam: (exam: CatalogExamInfo | null) => void;
  startExamFromCatalog: (examId: string) => Promise<void>;
  startCustomAIQuiz: (questions: QuestionItem[], title: string) => void;
  startMockExam: (examId?: string) => Promise<void>;
  selectExamQuestion: (index: number) => void;
  answerExamQuestion: (questionIndex: number, option: OptionKey) => void;
  toggleFlagExamQuestion: (questionIndex: number) => void;
  tickExamTimer: () => void;
  finishMockExam: () => Promise<void>;
  resetExam: () => void;

  // Mistake Vault Actions
  loadMistakes: () => Promise<void>;
  selectMistake: (mistake: MistakeItem | null) => void;
  analyzeMistakeWithAI: (mistake: MistakeItem) => Promise<void>;
  archiveMistake: (mistake: MistakeItem) => Promise<void>;

  // Vocabulary Actions
  setStudyMode: (mode: StudyMode) => void;
  loadVocabSession: () => Promise<void>;
  answerCurrentVocabCard: (isCorrect: boolean) => Promise<void>;
  resetVocabSession: () => Promise<void>;
  addCustomWordWithAI: (wordText: string) => Promise<boolean>;
}

export const useLearningStore = create<LearningState>((set, get) => ({
  activeTab: 'TASKS',
  isLoading: true,
  isInitialized: false,
  streakCount: 1,

  // Daily Tasks
  dailyTasksProgress: {
    paragraphCompleted: 0,
    clozeCompleted: 0,
    sentenceCompleted: 0,
    skillsCompleted: 0,
    vocabCompleted: 0,
  },
  activeDailyQuestions: [],
  currentDailyIndex: 0,
  isGeneratingAI: false,

  // Mock Exam
  selectedCatalogExam: null,
  currentExam: null,
  examState: null,
  examScoreCard: null,
  examHistory: [],

  // Mistake Vault
  mistakes: [],
  selectedMistake: null,
  isAnalyzingMistake: false,

  // Vocabulary
  studyMode: 'PREVIEW',
  dailyLimit: 25,
  sessionWords: [],
  currentVocabIndex: 0,
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
  completedTodayCount: 0,
  userProfile: null,

  initStore: async () => {
    set({ isLoading: true });
    try {
      await dbService.initDatabase();

      const count = await dbService.getWordCount();
      if (count < 7000) {
        const seedData = DataParserService.getFullSeedDataset();
        await dbService.resetAndSeedDatabase(seedData);
      }

      const streak = await dbService.getStreakCount();
      const examHist = await dbService.getExamHistory();

      set({ streakCount: streak, examHistory: examHist });

      await get().loadDailyTasks();
      await get().loadMistakes();
      await get().loadVocabSession();

      set({ isInitialized: true, isLoading: false });
    } catch (e) {
      console.error('Failed to initialize learning store:', e);
      set({ isLoading: false });
    }
  },

  setActiveTab: (tab: AppTab) => {
    set({ activeTab: tab });
    if (tab === 'TASKS') get().loadDailyTasks();
    if (tab === 'MISTAKES') get().loadMistakes();
    if (tab === 'VOCAB') get().loadVocabSession();
  },

  setUserProfile: (profile: UserProfile | null) => {
    set({ userProfile: profile });
  },

  // ==========================================
  // DAILY TASKS & DYNAMIC POOL
  // ==========================================
  loadDailyTasks: async () => {
    try {
      const activeQs = await dbService.getActiveQuestionsByType(undefined, 30);
      set({ activeDailyQuestions: activeQs, currentDailyIndex: 0 });
    } catch (err) {
      console.error('Failed to load daily questions:', err);
    }
  },

  answerDailyQuestion: async (question: QuestionItem, selectedOption: OptionKey) => {
    const isCorrect = selectedOption === question.correct_option;

    // Record in DB: correct -> 'SOLVED_CORRECT' (graduates/disappears), wrong -> 'MISTAKE' (moves to mistake vault)
    await dbService.completeQuestion(question.id, selectedOption, isCorrect);

    // Update daily task progress counter
    set((state) => {
      const prog = { ...state.dailyTasksProgress };
      if (question.type === 'PARAGRAPH') prog.paragraphCompleted += 1;
      else if (question.type === 'CLOZE_TEST') prog.clozeCompleted += 1;
      else if (question.type === 'SENTENCE_COMPLETION') prog.sentenceCompleted += 1;
      else prog.skillsCompleted += 1;

      // Filter out correctly solved question immediately from active view
      const remainingQuestions = isCorrect
        ? state.activeDailyQuestions.filter((q) => q.id !== question.id)
        : state.activeDailyQuestions;

      return {
        dailyTasksProgress: prog,
        activeDailyQuestions: remainingQuestions,
      };
    });

    if (!isCorrect) {
      // Refresh mistakes list
      get().loadMistakes();
    }

    return isCorrect;
  },

  generateFreshAIQuestions: async (type: YdsQuestionType) => {
    set({ isGeneratingAI: true });
    try {
      const newQuestion = await AIService.generateFreshQuestion(type);
      const insertedId = await dbService.insertGeneratedQuestion(newQuestion);
      const fullItem: QuestionItem = { ...newQuestion, id: insertedId };

      set((state) => ({
        activeDailyQuestions: [fullItem, ...state.activeDailyQuestions],
        currentDailyIndex: 0,
        isGeneratingAI: false,
      }));
    } catch (err) {
      console.error('Failed to generate AI question:', err);
      set({ isGeneratingAI: false });
    }
  },

  nextDailyQuestion: () => {
    const { currentDailyIndex, activeDailyQuestions } = get();
    if (currentDailyIndex < activeDailyQuestions.length - 1) {
      set({ currentDailyIndex: currentDailyIndex + 1 });
    }
  },

  prevDailyQuestion: () => {
    const { currentDailyIndex } = get();
    if (currentDailyIndex > 0) {
      set({ currentDailyIndex: currentDailyIndex - 1 });
    }
  },

  // ==========================================
  // 180-MIN FULL MOCK EXAM & CATALOG
  // ==========================================
  selectCatalogExam: (exam: CatalogExamInfo | null) => {
    set({ selectedCatalogExam: exam });
  },

  startExamFromCatalog: async (examId: string) => {
    const exam = YdsExamCatalogService.getFullExam(examId);
    const examState: ExamSessionState = {
      examId: exam.id,
      title: exam.title,
      timeRemainingSeconds: exam.duration_minutes * 60,
      isPaused: false,
      currentQuestionIndex: 0,
      userAnswers: {},
      flaggedQuestions: {},
      isFinished: false,
    };

    set({
      currentExam: exam,
      examState,
      examScoreCard: null,
      selectedCatalogExam: null,
    });
  },

  startCustomAIQuiz: (questions: QuestionItem[], title: string) => {
    const exam: MockExam = {
      id: `ai_quiz_${Date.now()}`,
      title,
      duration_minutes: Math.max(15, questions.length * 2),
      total_questions: questions.length,
      questions,
      source_year: '2026 AI Kişiselleştirilmiş Test',
      description: `${questions.length} Soruluk Yapay Zeka Özel Çalışma Testi`,
    };

    const examState: ExamSessionState = {
      examId: exam.id,
      title: exam.title,
      timeRemainingSeconds: exam.duration_minutes * 60,
      isPaused: false,
      currentQuestionIndex: 0,
      userAnswers: {},
      flaggedQuestions: {},
      isFinished: false,
    };

    set({
      currentExam: exam,
      examState,
      examScoreCard: null,
      selectedCatalogExam: null,
    });
  },

  startMockExam: async (examId: string = `yds_mock_${Date.now()}`) => {
    const exam = YdsQuestionBankService.generateMockExam(examId, 'YDS 2026 Gerçek Deneme Sınavı');
    const examState: ExamSessionState = {
      examId: exam.id,
      title: exam.title,
      timeRemainingSeconds: 180 * 60,
      isPaused: false,
      currentQuestionIndex: 0,
      userAnswers: {},
      flaggedQuestions: {},
      isFinished: false,
    };

    set({
      currentExam: exam,
      examState,
      examScoreCard: null,
      selectedCatalogExam: null,
    });
  },

  selectExamQuestion: (index: number) => {
    set((state) => (state.examState ? { examState: { ...state.examState, currentQuestionIndex: index } } : {}));
  },

  answerExamQuestion: (questionIndex: number, option: OptionKey) => {
    set((state) => {
      if (!state.examState) return {};
      const newAnswers = { ...state.examState.userAnswers, [questionIndex]: option };
      return { examState: { ...state.examState, userAnswers: newAnswers } };
    });
  },

  toggleFlagExamQuestion: (questionIndex: number) => {
    set((state) => {
      if (!state.examState) return {};
      const currentFlag = !!state.examState.flaggedQuestions[questionIndex];
      const newFlags = { ...state.examState.flaggedQuestions, [questionIndex]: !currentFlag };
      return { examState: { ...state.examState, flaggedQuestions: newFlags } };
    });
  },

  tickExamTimer: () => {
    set((state) => {
      if (!state.examState || state.examState.isPaused || state.examState.isFinished) return {};
      const nextTime = Math.max(0, state.examState.timeRemainingSeconds - 1);
      return { examState: { ...state.examState, timeRemainingSeconds: nextTime } };
    });
  },

  finishMockExam: async () => {
    const { currentExam, examState } = get();
    if (!currentExam || !examState) return;

    const timeSpent = currentExam.duration_minutes * 60 - examState.timeRemainingSeconds;
    const scoreCard = YdsExamEngine.evaluateExam(currentExam, examState.userAnswers, timeSpent);

    // Save to SQLite
    await dbService.saveExamResult(scoreCard);

    // Automatically send wrong answers to Mistake Vault
    currentExam.questions.forEach(async (q, idx) => {
      const userSelected = examState.userAnswers[idx];
      if (userSelected && userSelected !== q.correct_option) {
        await dbService.completeQuestion(q.id, userSelected, false);
      }
    });

    const updatedHistory = await dbService.getExamHistory();

    set((state) => ({
      examScoreCard: scoreCard,
      examHistory: updatedHistory,
      examState: state.examState ? { ...state.examState, isFinished: true } : null,
    }));
  },

  resetExam: () => {
    set({ currentExam: null, examState: null, examScoreCard: null, selectedCatalogExam: null });
  },

  // ==========================================
  // MISTAKE VAULT & AI ANALYSIS
  // ==========================================
  loadMistakes: async () => {
    try {
      const list = await dbService.getMistakeItems();
      set({ mistakes: list });
    } catch (err) {
      console.error('Failed to load mistakes:', err);
    }
  },

  selectMistake: (mistake: MistakeItem | null) => {
    set({ selectedMistake: mistake });
  },

  analyzeMistakeWithAI: async (mistake: MistakeItem) => {
    set({ isAnalyzingMistake: true });
    try {
      const analysis = await AIService.analyzeMistake(mistake.question, mistake.user_selected_option);
      await dbService.saveMistakeAIAnalysis(mistake.id, analysis);

      const updatedMistake: MistakeItem = { ...mistake, ai_analysis: analysis };

      set((state) => ({
        selectedMistake: updatedMistake,
        mistakes: state.mistakes.map((m) => (m.id === mistake.id ? updatedMistake : m)),
        isAnalyzingMistake: false,
      }));
    } catch (err) {
      console.error('Failed to analyze mistake with AI:', err);
      set({ isAnalyzingMistake: false });
    }
  },

  archiveMistake: async (mistake: MistakeItem) => {
    await dbService.archiveMistake(mistake.id, mistake.question.id);
    set((state) => ({
      mistakes: state.mistakes.filter((m) => m.id !== mistake.id),
      selectedMistake: null,
    }));
  },

  // ==========================================
  // VOCABULARY & LEITNER
  // ==========================================
  setStudyMode: (mode: StudyMode) => set({ studyMode: mode }),

  loadVocabSession: async () => {
    const { dailyLimit } = get();
    let words = await srEngine.loadDailyBatch(dailyLimit);

    if (words.length === 0) {
      try {
        const freshWords = await AIService.generateDynamicAcademicWords(dailyLimit);
        if (freshWords && freshWords.length > 0) {
          for (const w of freshWords) {
            await dbService.insertCustomWord(w);
          }
          words = await srEngine.loadDailyBatch(dailyLimit);
        }
      } catch (err) {
        console.warn('Auto dynamic word generation error:', err);
      }
    }

    const summary = await srEngine.fetchBoxSummary();
    const weekly = await dbService.getWordsForBoxReview(2);
    const monthly = await dbService.getWordsForBoxReview(3);
    const dictionary = await dbService.getAllWordsWithProgress();

    set({
      sessionWords: words,
      currentVocabIndex: 0,
      boxSummary: summary,
      weeklyWords: weekly,
      monthlyWords: monthly,
      dictionaryWords: dictionary,
    });
  },

  answerCurrentVocabCard: async (isCorrect: boolean) => {
    const { sessionWords, currentVocabIndex } = get();
    const currentWord = sessionWords[currentVocabIndex];
    if (!currentWord) return;

    await srEngine.processAnswer(currentWord.id, isCorrect);
    const nextIdx = currentVocabIndex + 1;
    const summary = await srEngine.fetchBoxSummary();

    set((state) => ({
      currentVocabIndex: nextIdx,
      boxSummary: summary,
      completedTodayCount: isCorrect ? state.completedTodayCount + 1 : state.completedTodayCount,
      dailyTasksProgress: {
        ...state.dailyTasksProgress,
        vocabCompleted: state.dailyTasksProgress.vocabCompleted + 1,
      },
    }));
  },

  resetVocabSession: async () => {
    await get().loadVocabSession();
  },

  addCustomWordWithAI: async (wordText: string) => {
    try {
      const autoFilled = await AIService.autoCompleteWord(wordText);
      await dbService.insertCustomWord(autoFilled);
      await get().loadVocabSession();
      return true;
    } catch (err) {
      console.error('Failed to add custom word:', err);
      return false;
    }
  },
}));
