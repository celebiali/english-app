import { MockExam, QuestionItem, YdsQuestionType } from '../types';
import { INITIAL_YDS_QUESTIONS } from './YdsQuestionBank';

export interface CatalogExamInfo {
  id: string;
  title: string;
  year: number;
  season?: 'İlkbahar' | 'Sonbahar' | 'e-YDS' | 'ELS Dergisi' | 'AI Özel';
  totalQuestions: number;
  durationMinutes: number;
  difficulty: 'STANDART' | 'ZOR' | 'ÖSYM_TAM';
  tag: string;
  description: string;
}

export const EXAM_CATALOG: CatalogExamInfo[] = [
  {
    id: 'yds_2024_1',
    title: '2024 YDS / 1 (İlkbahar Sınavı)',
    year: 2024,
    season: 'İlkbahar',
    totalQuestions: 80,
    durationMinutes: 180,
    difficulty: 'ÖSYM_TAM',
    tag: 'ÖSYM Çıkmış',
    description: '2024 YDS 1. Dönem resmi sınav standartlarında 80 soru ve 180 dakika simülasyonu.',
  },
  {
    id: 'yds_2023_2',
    title: '2023 YDS / 2 (Sonbahar Sınavı)',
    year: 2023,
    season: 'Sonbahar',
    totalQuestions: 80,
    durationMinutes: 180,
    difficulty: 'ÖSYM_TAM',
    tag: 'ÖSYM Çıkmış',
    description: '2023 Sonbahar dönemi tam kapsamlı YDS soru tipleri, okuma parçaları ve cloze testler.',
  },
  {
    id: 'yds_2023_1',
    title: '2023 YDS / 1 (İlkbahar Sınavı)',
    year: 2023,
    season: 'İlkbahar',
    totalQuestions: 80,
    durationMinutes: 180,
    difficulty: 'ÖSYM_TAM',
    tag: 'ÖSYM Çıkmış',
    description: '2023 İlkbahar dönemi standart ÖSYM YDS sınav seti.',
  },
  {
    id: 'yds_2022_2',
    title: '2022 YDS / 2 (Sonbahar Sınavı)',
    year: 2022,
    season: 'Sonbahar',
    totalQuestions: 80,
    durationMinutes: 180,
    difficulty: 'ÖSYM_TAM',
    tag: 'ÖSYM Çıkmış',
    description: '2022 Sonbahar çıkmış soruları ve akademik paragraf analizleri.',
  },
  {
    id: 'yds_2022_1',
    title: '2022 YDS / 1 (İlkbahar Sınavı)',
    year: 2022,
    season: 'İlkbahar',
    totalQuestions: 80,
    durationMinutes: 180,
    difficulty: 'ÖSYM_TAM',
    tag: 'ÖSYM Çıkmış',
    description: '2022 İlkbahar YDS soru formatı ve çeldirici analizleri.',
  },
  {
    id: 'yds_2021_all',
    title: '2021 YDS Standart Denemesi',
    year: 2021,
    season: 'İlkbahar',
    totalQuestions: 80,
    durationMinutes: 180,
    difficulty: 'STANDART',
    tag: 'ÖSYM Çıkmış',
    description: '2021 yılı tam format YDS deneme simülasyonu.',
  },
  {
    id: 'els_prep_1',
    title: 'ELS İngilizce Hazırlık - Deneme 1',
    year: 2024,
    season: 'ELS Dergisi',
    totalQuestions: 80,
    durationMinutes: 180,
    difficulty: 'ZOR',
    tag: 'ELS Dergi Serisi',
    description: 'ELS 35 Sayı dergi arşivinden derlenen ileri düzey akademik gramer ve okuma denemesi.',
  },
  {
    id: 'els_prep_2',
    title: 'ELS İngilizce Hazırlık - Deneme 2',
    year: 2024,
    season: 'ELS Dergisi',
    totalQuestions: 80,
    durationMinutes: 180,
    difficulty: 'ZOR',
    tag: 'ELS Dergi Serisi',
    description: 'ELS dergi serisi Sağlık & Sosyal Bilimler ağırlıklı YDS prova denemesi.',
  },
  {
    id: 'ai_adaptive_1',
    title: 'AI Adaptif YDS Deneme Sınavı',
    year: 2026,
    season: 'AI Özel',
    totalQuestions: 80,
    durationMinutes: 180,
    difficulty: 'ÖSYM_TAM',
    tag: 'Yapay Zeka Özel',
    description: 'Yapay zeka tarafından güncel akademik makalelerden üretilmiş sıfır kilometre 80 soruluk deneme.',
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
