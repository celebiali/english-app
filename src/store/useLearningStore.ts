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
  TaskGoalsConfig,
  VocabFolder,
} from '../types';
import { dbService, WordWithProgress } from '../database/DatabaseService';
import { srEngine } from '../services/SpacedRepetitionEngine';
import { DataParserService } from '../services/DataParserService';
import { YdsQuestionBankService } from '../services/YdsQuestionBank';
import { YdsExamEngine } from '../services/YdsExamEngine';
import { AIService } from '../services/AIService';
import { YdsExamCatalogService, CatalogExamInfo } from '../services/YdsExamCatalog';
import { SupabaseService } from '../services/SupabaseService';
import { NotificationService } from '../services/NotificationService';

export type AppTab = 'TASKS' | 'EXAM' | 'VOCAB' | 'STATS' | 'MISTAKES';
export type StudyMode = 'PREVIEW' | 'TEST';

export function getTaskGoals(goals?: TaskGoalsConfig) {
  if (goals) return goals;
  return { paragraph: 8, cloze: 5, sentence: 8, skills: 14 };
}

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
  taskGoals: TaskGoalsConfig;
  dailyQuestionTarget: number;
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

  // Vocabulary & Leitner & Folder State
  studyMode: StudyMode;
  dailyLimit: number;
  sessionWords: CardWord[];
  currentVocabIndex: number;
  boxSummary: BoxCountSummary;
  weeklyWords: WordWithProgress[];
  monthlyWords: WordWithProgress[];
  dictionaryWords: WordWithProgress[];
  vocabFolders: VocabFolder[];
  activeFolderId: string | null;
  completedTodayCount: number;
  // User Auth & Profile
  userProfile: UserProfile | null;

  // Actions
  initStore: () => Promise<void>;
  setActiveTab: (tab: AppTab) => void;
  setUserProfile: (profile: UserProfile | null) => Promise<void>;
  updateUserTargetScore: (score: number) => Promise<void>;
  setDailyQuestionTarget: (target: number) => void;
  setTaskGoals: (goals: Partial<TaskGoalsConfig>) => Promise<void>;

  // Daily Tasks Actions
  loadDailyTasks: (force?: boolean) => Promise<void>;
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
  loadVocabSession: (force?: boolean) => Promise<void>;
  answerCurrentVocabCard: (isCorrect: boolean) => Promise<void>;
  resetVocabSession: () => Promise<void>;
  addCustomWordWithAI: (wordText: string, folderName?: string) => Promise<boolean>;
  loadVocabFolders: () => Promise<void>;
  setActiveFolderId: (id: string | null) => void;
  createVocabFolder: (folder: { name: string; description?: string; color: string; icon: string }) => Promise<void>;
  updateVocabFolder: (id: string, updates: { name?: string; description?: string; color?: string; icon?: string }) => Promise<void>;
  deleteVocabFolder: (id: string) => Promise<void>;
  deleteWord: (wordId: number) => Promise<void>;

  resetAllProgress: () => Promise<void>;
  deleteUserAccount: () => Promise<void>;
}

export const useLearningStore = create<LearningState>((set, get) => ({
  activeTab: 'TASKS',
  isLoading: true,
  isInitialized: false,
  streakCount: 0,

  // Daily Tasks
  taskGoals: {
    paragraph: 8,
    cloze: 5,
    sentence: 8,
    skills: 14,
  },
  dailyQuestionTarget: 35,
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

  // Vocabulary & Folders
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
  vocabFolders: [],
  activeFolderId: null,
  completedTodayCount: 0,
  userProfile: null,

  // ==========================================
  // STORE INITIALIZATION
  // ==========================================
  initStore: async () => {
    set({ isLoading: true });
    try {
      await dbService.initDatabase();
      await dbService.seedQuestionsIfEmpty();

      const count = await dbService.getWordCount();
      if (count < 7000) {
        const seedData = DataParserService.getFullSeedDataset();
        await dbService.resetAndSeedDatabase(seedData);
      }

      const streak = await dbService.getStreakCount();
      const examHist = await dbService.getExamHistory();
      const savedUser = await dbService.getUserSession();
      const userGoals = await dbService.getUserTaskGoals();
      const totalTarget = userGoals.paragraph + userGoals.cloze + userGoals.sentence + userGoals.skills;

      if (savedUser) {
        SupabaseService.setCurrentUser(savedUser);
      }

      set({
        streakCount: streak,
        examHistory: examHist,
        userProfile: savedUser,
        taskGoals: userGoals,
        dailyQuestionTarget: totalTarget,
      });

      await get().loadDailyTasks();
      await get().loadMistakes();
      await get().loadVocabSession();

      // Silently configure daily reminders in background ONLY IF already granted
      NotificationService.scheduleIfPermitted(20, 0, totalTarget, streak).catch((nErr) => {
        console.warn('Background notification init:', nErr);
      });
    } catch (e) {
      console.error('Failed to initialize learning store:', e);
    } finally {
      set({ isInitialized: true, isLoading: false });
    }
  },

  setActiveTab: (tab: AppTab) => {
    set({ activeTab: tab });
    if (tab === 'TASKS') {
      if (get().activeDailyQuestions.length === 0) {
        get().loadDailyTasks();
      }
    }
    if (tab === 'MISTAKES') {
      get().loadMistakes();
    }
    if (tab === 'VOCAB') {
      if (get().sessionWords.length === 0) {
        get().loadVocabSession();
      }
    }
  },

  setUserProfile: async (profile: UserProfile | null) => {
    SupabaseService.setCurrentUser(profile);
    set({ userProfile: profile });

    if (profile) {
      await dbService.saveUserSession(profile);
      // Schedule study reminders for user
      const streak = get().streakCount;
      const target = get().dailyQuestionTarget;
      NotificationService.scheduleAllReminders(20, 0, target, streak).catch(() => {});
    } else {
      await dbService.clearUserSession();
    }
  },

  updateUserTargetScore: async (score: number) => {
    const current = get().userProfile;
    if (current) {
      const updated: UserProfile = { ...current, targetScore: score };
      set({ userProfile: updated });
      SupabaseService.setCurrentUser(updated);
      await dbService.saveUserSession(updated);
    }
  },

  setDailyQuestionTarget: (target: number) => {
    set({ dailyQuestionTarget: target });
    get().loadDailyTasks(true);
  },

  setTaskGoals: async (newGoals: Partial<TaskGoalsConfig>) => {
    const current = get().taskGoals;
    const merged: TaskGoalsConfig = {
      paragraph: Math.max(1, Math.min(30, newGoals.paragraph ?? current.paragraph)),
      cloze: Math.max(1, Math.min(30, newGoals.cloze ?? current.cloze)),
      sentence: Math.max(1, Math.min(30, newGoals.sentence ?? current.sentence)),
      skills: Math.max(1, Math.min(30, newGoals.skills ?? current.skills)),
    };
    const total = merged.paragraph + merged.cloze + merged.sentence + merged.skills;
    await dbService.saveUserTaskGoals(merged);
    set({
      taskGoals: merged,
      dailyQuestionTarget: total,
    });
    await get().loadDailyTasks(true);
  },

  // ==========================================
  // DAILY TASKS & DYNAMIC POOL
  // ==========================================
  loadDailyTasks: async (force = false) => {
    try {
      const { taskGoals } = get();
      const todayProg = await dbService.getDailyTaskProgressToday(taskGoals);
      const activeQs = await dbService.getDailyTaskQuestions(taskGoals);
      set({
        dailyTasksProgress: todayProg,
        activeDailyQuestions: activeQs,
        currentDailyIndex: 0,
      });
    } catch (err) {
      console.error('Failed to load daily questions:', err);
    }
  },

  answerDailyQuestion: async (question: QuestionItem, selectedOption: OptionKey) => {
    const isCorrect = selectedOption === question.correct_option;
    const { taskGoals } = get();

    // Record in DB: correct -> 'SOLVED_CORRECT' (graduates/disappears), wrong -> 'MISTAKE' (moves to mistake vault)
    await dbService.completeQuestion(question.id, selectedOption, isCorrect);

    // Update persistent daily task progress
    const updatedProg = await dbService.incrementDailyTaskProgress(question.type, taskGoals);

    // Update real consecutive day streak
    const updatedStreak = await dbService.checkAndUpdateDailyStreak();

    set({
      dailyTasksProgress: updatedProg,
      streakCount: updatedStreak,
    });

    if (!isCorrect) {
      // Refresh mistakes list in background
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
      const fallbackAnalysis = {
        summary: `Bu soru ${mistake.question.subtopic || 'Akademik Bağlam'} kuralını test etmektedir.`,
        why_correct: `Doğru cevap olan (${mistake.question.correct_option}) seçeneği: "${mistake.question.options[mistake.question.correct_option] || ''}" ifadesi, akademik bağlam ve zaman uyumu ile tam örtüşmektedir. ${mistake.question.explanation || ''}`,
        why_distractor_failed: `İşaretlediğiniz (${mistake.user_selected_option}) seçeneği: "${mistake.question.options[mistake.user_selected_option] || ''}" ifadesi ÖSYM'nin klasik çeldirici tuzaklarındandır.`,
        key_vocabulary: [
          'deteriorate (kötüleşmek, gerilemek)',
          'deplete (tükenmek, eksilmek)',
          'precedent (emsal, geçmiş örnek)',
          'subsequent (ardından gelen, sonraki)',
        ],
        grammar_rule: mistake.question.subtopic || 'Akademik Bağlam & Gramer',
      };
      const updatedMistake: MistakeItem = { ...mistake, ai_analysis: fallbackAnalysis };
      set((state) => ({
        selectedMistake: updatedMistake,
        mistakes: state.mistakes.map((m) => (m.id === mistake.id ? updatedMistake : m)),
        isAnalyzingMistake: false,
      }));
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
  // VOCABULARY & FOLDER MANAGEMENT
  // ==========================================
  setStudyMode: (mode: StudyMode) => set({ studyMode: mode }),
  setActiveFolderId: (id: string | null) => set({ activeFolderId: id }),

  loadVocabFolders: async () => {
    try {
      const folders = await dbService.getVocabFolders();
      set({ vocabFolders: folders });
    } catch (err) {
      console.error('Failed to load vocab folders:', err);
    }
  },

  loadVocabSession: async (force = false) => {
    const { dailyLimit, sessionWords, currentVocabIndex } = get();
    let words = sessionWords;

    if (force || sessionWords.length === 0) {
      words = await srEngine.loadDailyBatch(dailyLimit);
    }

    const summary = await srEngine.fetchBoxSummary();
    const weekly = await dbService.getWordsForBoxReview(2);
    const monthly = await dbService.getWordsForBoxReview(3);
    const dictionary = await dbService.getAllWordsWithProgress();
    const folders = await dbService.getVocabFolders();

    set({
      sessionWords: words,
      currentVocabIndex: force ? 0 : currentVocabIndex,
      boxSummary: summary,
      weeklyWords: weekly,
      monthlyWords: monthly,
      dictionaryWords: dictionary,
      vocabFolders: folders,
    });
  },

  answerCurrentVocabCard: async (isCorrect: boolean) => {
    const { sessionWords, currentVocabIndex, dailyLimit } = get();
    const currentWord = sessionWords[currentVocabIndex];
    if (!currentWord) return;

    await srEngine.processAnswer(currentWord.id, isCorrect);
    const nextIdx = currentVocabIndex + 1;
    const summary = await srEngine.fetchBoxSummary();

    // Seamless continuous learning: when reaching end of loaded words, auto-fetch more words
    if (nextIdx >= sessionWords.length) {
      const moreWords = await srEngine.loadDailyBatch(dailyLimit || 30);
      if (moreWords && moreWords.length > 0) {
        // Filter out already seen in this session to prevent duplicate immediate loops
        const existingIds = new Set(sessionWords.map((w) => w.id));
        const freshWords = moreWords.filter((w) => !existingIds.has(w.id));
        const wordsToAdd = freshWords.length > 0 ? freshWords : moreWords;

        set((state) => ({
          sessionWords: [...state.sessionWords, ...wordsToAdd],
          currentVocabIndex: nextIdx,
          boxSummary: summary,
          completedTodayCount: isCorrect ? state.completedTodayCount + 1 : state.completedTodayCount,
          dailyTasksProgress: {
            ...state.dailyTasksProgress,
            vocabCompleted: state.dailyTasksProgress.vocabCompleted + 1,
          },
        }));
        return;
      }
    }

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
    await get().loadVocabSession(true);
  },

  addCustomWordWithAI: async (wordText: string, folderName?: string) => {
    try {
      const autoFilled = await AIService.autoCompleteWord(wordText);
      if (folderName) {
        autoFilled.subcategory = folderName;
      }
      await dbService.insertCustomWord(autoFilled);
      await get().loadVocabSession();
      return true;
    } catch (err) {
      console.error('Failed to add custom word:', err);
      return false;
    }
  },

  createVocabFolder: async (folder: { name: string; description?: string; color: string; icon: string }) => {
    try {
      await dbService.createVocabFolder(folder);
      await get().loadVocabFolders();
    } catch (err) {
      console.error('Failed to create vocab folder:', err);
    }
  },

  updateVocabFolder: async (id: string, updates: { name?: string; description?: string; color?: string; icon?: string }) => {
    try {
      await dbService.updateVocabFolder(id, updates);
      await get().loadVocabFolders();
      await get().loadVocabSession();
    } catch (err) {
      console.error('Failed to update vocab folder:', err);
    }
  },

  deleteVocabFolder: async (id: string) => {
    try {
      await dbService.deleteVocabFolder(id);
      set((state) => (state.activeFolderId === id ? { activeFolderId: null } : {}));
      await get().loadVocabFolders();
      await get().loadVocabSession();
    } catch (err) {
      console.error('Failed to delete vocab folder:', err);
    }
  },

  deleteWord: async (wordId: number) => {
    try {
      await dbService.deleteCustomWord(wordId);
      await get().loadVocabSession();
    } catch (err) {
      console.error('Failed to delete word:', err);
    }
  },

  resetAllProgress: async () => {
    set({ isLoading: true });
    try {
      await dbService.resetAllUserProgress();
      await dbService.seedQuestionsIfEmpty();
      await get().loadDailyTasks(true);
      await get().loadVocabSession(true);
      await get().loadMistakes();
      const streak = await dbService.getStreakCount();
      const examHist = await dbService.getExamHistory();
      set({
        streakCount: streak,
        examHistory: examHist,
        currentDailyIndex: 0,
        currentVocabIndex: 0,
        completedTodayCount: 0,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to reset all progress:', err);
      set({ isLoading: false });
    }
  },

  deleteUserAccount: async () => {
    set({ isLoading: true });
    try {
      await SupabaseService.deleteAccount();
      await dbService.resetAllUserProgress();
      await dbService.clearUserSession();
      await dbService.seedQuestionsIfEmpty();
      await get().setUserProfile(null);
      await get().loadDailyTasks(true);
      await get().loadVocabSession(true);
      await get().loadMistakes();
      const streak = await dbService.getStreakCount();
      const examHist = await dbService.getExamHistory();
      set({
        streakCount: streak,
        examHistory: examHist,
        userProfile: null,
        currentDailyIndex: 0,
        currentVocabIndex: 0,
        completedTodayCount: 0,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to delete account:', err);
      set({ isLoading: false });
    }
  },
}));
