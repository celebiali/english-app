import { WordWithProgress } from '../database/DatabaseService';

export interface LearnMatchCourse {
  id: string;
  title: string;
  subtitle: string;
  section: 'Başlangıç Seviyesi' | 'İleri Seviye' | 'YDS Özel Modülleri';
  category: 'VOCABULARY' | 'CONNECTOR' | 'IDIOM' | 'PREFIX_ROOT' | 'CUSTOM';
  levelFilter?: string;
  imageUrl: string;
  badge?: string;
}

export interface LearnMatchUnit {
  id: string;
  courseId: string;
  title: string;
  subtitle: string;
  order: number;
  wordCount: number;
  learnedCount: number;
  percentage: number;
  stars: number;
  words: WordWithProgress[];
}

export const LEARN_MATCH_COURSES: LearnMatchCourse[] = [
  // Section 1: Başlangıç Seviyesi
  {
    id: 'course_a1',
    title: '1 İngilizce - Başlangıç',
    subtitle: 'Temel Günlük Kelimeler (A1)',
    section: 'Başlangıç Seviyesi',
    category: 'VOCABULARY',
    levelFilter: 'A1',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&auto=format&fit=crop&q=80', // London Big Ben with umbrella
    badge: 'ücretsiz',
  },
  {
    id: 'course_a2',
    title: 'Basit kelime bilgisi - İngilizce',
    subtitle: 'Temel İletişim Kelimeleri (A2)',
    section: 'Başlangıç Seviyesi',
    category: 'VOCABULARY',
    levelFilter: 'A2',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&auto=format&fit=crop&q=80', // Student studying with books
    badge: 'ücretsiz',
  },

  // Section 2: İleri Seviye (YDS Odak)
  {
    id: 'course_b1',
    title: '2 İngilizce - Temel',
    subtitle: 'Orta Düzey YDS Kelimeleri (B1)',
    section: 'İleri Seviye',
    category: 'VOCABULARY',
    levelFilter: 'B1',
    imageUrl: 'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=400&auto=format&fit=crop&q=80', // London bus
    badge: 'ücretsiz',
  },
  {
    id: 'course_b2',
    title: '3 İngilizce - Alt orta seviye',
    subtitle: 'YDS Sık Çıkan Akademik Kelimeler (B2)',
    section: 'İleri Seviye',
    category: 'VOCABULARY',
    levelFilter: 'B2',
    imageUrl: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=400&auto=format&fit=crop&q=80', // Street art / culture
    badge: 'ücretsiz',
  },
  {
    id: 'course_c1',
    title: '4 İngilizce - Orta düzey',
    subtitle: 'İleri Düzey Akademik Paragraf Kelimeleri (C1)',
    section: 'İleri Seviye',
    category: 'VOCABULARY',
    levelFilter: 'C1',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&auto=format&fit=crop&q=80', // University campus students
    badge: 'ücretsiz',
  },

  // Section 3: YDS Özel Modülleri
  {
    id: 'course_conn',
    title: '5 YDS Bağlaçlar ve Yapılar',
    subtitle: 'Zaman, Zıtlık, Koşul ve Sebep Bağlaçları',
    section: 'YDS Özel Modülleri',
    category: 'CONNECTOR',
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&auto=format&fit=crop&q=80', // Tower bridge
    badge: 'Önemli',
  },
  {
    id: 'course_idiom',
    title: '6 Deyimler ve Kalıp İfadeler',
    subtitle: 'Oxford YDS Sık Kullanılan Kalıplar',
    section: 'YDS Özel Modülleri',
    category: 'IDIOM',
    imageUrl: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=400&auto=format&fit=crop&q=80', // London telephone box
    badge: 'Kalıplar',
  },
  {
    id: 'course_root',
    title: '7 Etimoloji ve Kökler',
    subtitle: 'Latin & Grek Kökler, Ön ve Son Ekler',
    section: 'YDS Özel Modülleri',
    category: 'PREFIX_ROOT',
    imageUrl: 'https://images.unsplash.com/photo-1507842229450-7907e5c5c037?w=400&auto=format&fit=crop&q=80', // Library book arch
    badge: 'Analiz',
  },
  {
    id: 'course_custom',
    title: 'Özel Kelime Defterim',
    subtitle: 'Kendi Eklediğiniz ve Kaydettiğiniz Kelimeler',
    section: 'YDS Özel Modülleri',
    category: 'CUSTOM',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&auto=format&fit=crop&q=80', // Personal notebook
    badge: 'Defterim',
  },
];

// Thematic unit titles pool
const THEMATIC_TOPICS = [
  'People',
  'Travel',
  'Technology',
  'During break',
  'Food & Drink',
  'Injury & Health',
  'Daily Routine',
  'Work & Career',
  'Education',
  'Nature & Planet',
  'Society & Law',
  'Arts & Media',
  'Sports & Leisure',
  'Emotions & Mind',
  'Home & Family',
  'Science & Future',
  'History & Culture',
  'Business & Economy',
  'City & Transport',
  'Academic Writing',
];

/**
 * Splits words of a course into bite-sized units (~35 words per unit)
 */
export function buildUnitsForCourse(
  course: LearnMatchCourse,
  allWords: WordWithProgress[]
): LearnMatchUnit[] {
  let filteredWords: WordWithProgress[] = [];

  if (course.category === 'VOCABULARY') {
    filteredWords = allWords.filter(
      (w) => w.category === 'VOCABULARY' && (!course.levelFilter || w.level === course.levelFilter)
    );
  } else if (course.category === 'CONNECTOR') {
    filteredWords = allWords.filter((w) => w.category === 'CONNECTOR');
  } else if (course.category === 'IDIOM') {
    filteredWords = allWords.filter((w) => w.category === 'IDIOM');
  } else if (course.category === 'PREFIX_ROOT') {
    filteredWords = allWords.filter((w) => w.category === 'PREFIX_ROOT');
  } else if (course.category === 'CUSTOM') {
    filteredWords = allWords.filter((w) => w.is_custom || w.subcategory === 'Özel Kelimeler');
  }

  if (filteredWords.length === 0) {
    return [];
  }

  // If items already have meaningful subcategories (like connectors or roots), group by subcategory
  if (course.category === 'CONNECTOR' || course.category === 'PREFIX_ROOT') {
    const subcatMap = new Map<string, WordWithProgress[]>();
    filteredWords.forEach((w) => {
      const sub = w.subcategory || 'Genel Yapılar';
      if (!subcatMap.has(sub)) subcatMap.set(sub, []);
      subcatMap.get(sub)!.push(w);
    });

    const units: LearnMatchUnit[] = [];
    let idx = 1;
    subcatMap.forEach((wordsInSub, subName) => {
      const learned = wordsInSub.filter((w) => (w.box || 0) >= 2).length;
      const pct = wordsInSub.length > 0 ? Math.round((learned / wordsInSub.length) * 100) : 0;
      const stars = Math.min(3, Math.floor((pct / 100) * 3));
      units.push({
        id: `${course.id}_sub_${idx}`,
        courseId: course.id,
        title: `${subName.charAt(0).toUpperCase() + subName.slice(1)}`,
        subtitle: `${wordsInSub.length} Terim`,
        order: idx,
        wordCount: wordsInSub.length,
        learnedCount: learned,
        percentage: pct,
        stars,
        words: wordsInSub,
      });
      idx++;
    });
    return units;
  }

  // Otherwise, partition words into uniform chunks of 35 words
  const CHUNK_SIZE = 35;
  const totalUnits = Math.ceil(filteredWords.length / CHUNK_SIZE);
  const units: LearnMatchUnit[] = [];

  for (let i = 0; i < totalUnits; i++) {
    const start = i * CHUNK_SIZE;
    const chunkWords = filteredWords.slice(start, start + CHUNK_SIZE);
    const topicName = THEMATIC_TOPICS[i % THEMATIC_TOPICS.length];
    const unitNumber = Math.floor(i / THEMATIC_TOPICS.length) + 1;
    const learned = chunkWords.filter((w) => (w.box || 0) >= 2).length;
    const pct = chunkWords.length > 0 ? Math.round((learned / chunkWords.length) * 100) : 0;
    const stars = Math.min(3, Math.floor((pct / 100) * 3));

    units.push({
      id: `${course.id}_unit_${i + 1}`,
      courseId: course.id,
      title: `${topicName} ${unitNumber}`,
      subtitle: `${chunkWords.length} Kelime`,
      order: i + 1,
      wordCount: chunkWords.length,
      learnedCount: learned,
      percentage: pct,
      stars,
      words: chunkWords,
    });
  }

  return units;
}

// Curated contextual imagery matching common concept domains
const CONTEXT_IMAGES = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80', // Person face
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80', // Woman portrait
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80', // Cute dog
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&auto=format&fit=crop&q=80', // Working on laptop
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80', // Code / technology
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80', // Landscape nature
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80', // Healthy salad food
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80', // Celebration / event
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80', // Students together
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80', // Studying notebook
  'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&auto=format&fit=crop&q=80', // Driving car / transport
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop&q=80', // Travel boat
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80', // Global network
];

/**
 * Returns a stable high-res illustration photo for a given word
 */
export function getContextImageForWord(word: string, id: string | number): string {
  let hash = 0;
  const str = `${word}_${id}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CONTEXT_IMAGES.length;
  return CONTEXT_IMAGES[index];
}

/**
 * Returns all words belonging directly to a given course (no sub-units / no thematic splits)
 */
export function getWordsForCourse(
  course: LearnMatchCourse,
  allWords: WordWithProgress[]
): WordWithProgress[] {
  if (course.category === 'VOCABULARY') {
    return allWords.filter(
      (w) => w.category === 'VOCABULARY' && (!course.levelFilter || w.level === course.levelFilter)
    );
  } else if (course.category === 'CONNECTOR') {
    return allWords.filter((w) => w.category === 'CONNECTOR');
  } else if (course.category === 'IDIOM') {
    return allWords.filter((w) => w.category === 'IDIOM');
  } else if (course.category === 'PREFIX_ROOT') {
    return allWords.filter((w) => w.category === 'PREFIX_ROOT');
  } else if (course.category === 'CUSTOM') {
    return allWords.filter((w) => Boolean(w.is_custom) || w.subcategory === 'Özel Kelimeler');
  }
  return [];
}

