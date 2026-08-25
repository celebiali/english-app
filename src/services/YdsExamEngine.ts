import { MockExam, OptionKey, ExamScoreCard, YdsQuestionType } from '../types';

export class YdsExamEngine {
  /**
   * Calculates final scorecard according to official ÖSYM YDS evaluation:
   * Score = correctCount * 1.25 (100-point scale)
   * Levels:
   * 90-100: A
   * 80-89: B
   * 70-79: C
   * 60-69: D
   * 50-59: E
   */
  static evaluateExam(
    exam: MockExam,
    userAnswers: Record<number, OptionKey>,
    timeSpentSeconds: number
  ): ExamScoreCard {
    let correct = 0;
    let wrong = 0;
    let empty = 0;

    const categoryMap: Record<
      YdsQuestionType,
      { total: number; correct: number; wrong: number }
    > = {
      PARAGRAPH: { total: 0, correct: 0, wrong: 0 },
      CLOZE_TEST: { total: 0, correct: 0, wrong: 0 },
      SENTENCE_COMPLETION: { total: 0, correct: 0, wrong: 0 },
      VOCABULARY_GRAMMAR: { total: 0, correct: 0, wrong: 0 },
      SKILL_DIALOGUE: { total: 0, correct: 0, wrong: 0 },
      RESTATEMENT: { total: 0, correct: 0, wrong: 0 },
      TRANSLATION: { total: 0, correct: 0, wrong: 0 },
      PARAGRAPH_COMPLETION: { total: 0, correct: 0, wrong: 0 },
      IRRELEVANT_SENTENCE: { total: 0, correct: 0, wrong: 0 }
    };

    exam.questions.forEach((q, idx) => {
      const selected = userAnswers[idx];
      const type = q.type || 'VOCABULARY_GRAMMAR';

      if (!categoryMap[type]) {
        categoryMap[type] = { total: 0, correct: 0, wrong: 0 };
      }
      categoryMap[type].total += 1;

      if (!selected) {
        empty += 1;
      } else if (selected === q.correct_option) {
        correct += 1;
        categoryMap[type].correct += 1;
      } else {
        wrong += 1;
        categoryMap[type].wrong += 1;
      }
    });

    const netScore = correct; // In YDS, 4 wrongs do not cancel 1 right (Doğrular silinmez)
    const ydsScore = Number((correct * 1.25).toFixed(2));

    let levelGrade: 'A' | 'B' | 'C' | 'D' | 'E' = 'E';
    if (ydsScore >= 90) levelGrade = 'A';
    else if (ydsScore >= 80) levelGrade = 'B';
    else if (ydsScore >= 70) levelGrade = 'C';
    else if (ydsScore >= 60) levelGrade = 'D';

    const categoryBreakdown = Object.entries(categoryMap)
      .filter(([_, stats]) => stats.total > 0)
      .map(([type, stats]) => ({
        type: type as YdsQuestionType,
        total: stats.total,
        correct: stats.correct,
        wrong: stats.wrong
      }));

    return {
      examId: exam.id,
      title: exam.title,
      totalQuestions: exam.questions.length,
      correctCount: correct,
      wrongCount: wrong,
      emptyCount: empty,
      netScore,
      ydsScore,
      levelGrade,
      timeSpentSeconds,
      completedAt: new Date().toISOString(),
      categoryBreakdown
    };
  }
}
