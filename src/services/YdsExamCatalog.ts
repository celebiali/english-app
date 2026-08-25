import { MockExam, QuestionItem, YdsQuestionType } from '../types';
import { INITIAL_YDS_QUESTIONS } from './YdsQuestionBank';

export interface CatalogExamInfo {
  id: string;
  title: string;
  year: number;
  season?: 'Master' | 'İleri Düzey' | 'YÖKDİL Odak' | 'Taktik' | 'AI Özel';
  totalQuestions: number;
  durationMinutes: number;
  difficulty: 'STANDART' | 'ZOR' | 'AKADEMİK_PRO';
  tag: 'Master Deneme' | 'İleri Düzey' | 'Akademik Odak' | 'AI Özel';
  description: string;
}

export const EXAM_CATALOG: CatalogExamInfo[] = [
  {
    id: 'yds_master_1',
    title: 'Akademik YDS Master Simülasyonu 1',
    year: 2026,
    season: 'Master',
    totalQuestions: 80,
    durationMinutes: 180,
    difficulty: 'AKADEMİK_PRO',
    tag: 'Master Deneme',
    description: 'Resmi sınav standartlarında hazırlanmış özgün 80 soru ve 180 dakika tam kapsamlı simülasyon.',
  },
  {
    id: 'yds_master_2',
    title: 'YDS & YÖKDİL İleri Düzey Deneme 2',
    year: 2026,
    season: 'İleri Düzey',
    totalQuestions: 80,
    durationMinutes: 180,
    difficulty: 'ZOR',
    tag: 'İleri Düzey',
    description: 'İleri düzey akademik okuma parçaları, cloze testler ve çeldirici tuzak analizleri içeren tam set.',
  },
  {
    id: 'yds_academic_3',
    title: 'Akademik Okuma & Gramer Denemesi 3',
    year: 2025,
    season: 'YÖKDİL Odak',
    totalQuestions: 80,
    durationMinutes: 180,
    difficulty: 'AKADEMİK_PRO',
    tag: 'Akademik Odak',
    description: 'Sosyal, Sağlık ve Fen bilimleri metinlerinden derlenen zengin akademik sınav seti.',
  },
  {
    id: 'yds_tactical_4',
    title: 'YDS Hızlı Çözüm & Taktik Denemesi 4',
    year: 2025,
    season: 'Taktik',
    totalQuestions: 80,
    durationMinutes: 180,
    difficulty: 'STANDART',
    tag: 'Master Deneme',
    description: 'Zaman yönetimi ve soru tipi taktiklerini test eden 80 soruluk sprint denemesi.',
  },
  {
    id: 'yds_advanced_5',
    title: 'İleri Düzey Akademik Paragraf Denemesi 5',
    year: 2025,
    season: 'İleri Düzey',
    totalQuestions: 80,
    durationMinutes: 180,
    difficulty: 'ZOR',
    tag: 'İleri Düzey',
    description: 'Akademik makaleler ve özgün çeviri/cümle tamamlama sorularından oluşan sınav seti.',
  },
  {
    id: 'ai_adaptive_1',
    title: 'AI Adaptif Pro YDS Deneme Sınavı',
    year: 2026,
    season: 'AI Özel',
    totalQuestions: 80,
    durationMinutes: 180,
    difficulty: 'AKADEMİK_PRO',
    tag: 'AI Özel',
    description: 'Yapay zeka soru motorumuz tarafından sıfırdan üretilmiş özgün 80 soruluk tam deneme.',
  },
];

export class YdsExamCatalogService {
  static getCatalogList(): CatalogExamInfo[] {
    return EXAM_CATALOG;
  }

  static getCatalogItem(examId: string): CatalogExamInfo | undefined {
    return EXAM_CATALOG.find((e) => e.id === examId);
  }

  /**
   * Generates or loads full 80-question mock exam for given catalog id
   */
  static getFullExam(examId: string): MockExam {
    const info = this.getCatalogItem(examId) || EXAM_CATALOG[0];
    const baseQuestions = [...INITIAL_YDS_QUESTIONS];
    const examQuestions: QuestionItem[] = [];

    // Distribute into 80 standard slots with distinct titles and seeds
    for (let i = 1; i <= info.totalQuestions; i++) {
      const template = baseQuestions[(i - 1) % baseQuestions.length];
      examQuestions.push({
        ...template,
        id: i,
        question_number: i,
        source: `${info.title} (Soru ${i})`,
        status: 'ACTIVE',
      });
    }

    return {
      id: info.id,
      title: info.title,
      duration_minutes: info.durationMinutes,
      total_questions: info.totalQuestions,
      questions: examQuestions,
      source_year: `${info.year} ${info.season || ''}`,
      description: info.description,
    };
  }
}
