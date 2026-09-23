import { ENV_CONFIG } from '../config/env';
import { InstructorWordList, InstructorWord, VocabFolder } from '../types';
import { dbService } from '../database/DatabaseService';
import { useLearningStore } from '../store/useLearningStore';

/**
 * Built-in fallback packs for instant offline testing and resilient execution
 */
const SEED_INSTRUCTOR_PACKS: Record<string, InstructorWordList[]> = {
  HAKKI20: [
    {
      id: 'list_hakki_yds_2026',
      promo_code: 'HAKKI20',
      instructor_name: 'Hakkı Hoca',
      title: 'Hakkı Hoca — 2026 YDS Vurgulu Kelimeler',
      description: '2026 İlkbahar YDS grubu için Hakkı Hoca tarafından seçilmiş sınavda en sık çeldirici olan 50 kritik kelime.',
      badge_text: '🎓 HAKKI HOCA ÖZEL',
      color: '#8B5CF6',
      icon: 'GraduationCap',
      is_active: true,
      words: [
        {
          word: 'alleviate',
          meaning: 'hafifletmek, dindirmek, acısını azaltmak',
          level: 'B2',
          example_sentence: 'The doctor gave him medication to alleviate the severe back pain.',
          example_translation: 'Doktor, şiddetli sırt ağrısını hafifletmesi için ona ilaç verdi.',
          synonyms: ['ease', 'relieve', 'mitigate', 'lessen'],
          part_of_speech: 'fiil',
        },
        {
          word: 'curb',
          meaning: 'dizginlemek, kontrol altına almak, frenlemek',
          level: 'B2',
          example_sentence: 'New monetary policies were introduced to curb rising inflation.',
          example_translation: 'Artan enflasyonu dizginlemek için yeni para politikaları uygulamaya konuldu.',
          synonyms: ['restrain', 'control', 'check', 'contain'],
          part_of_speech: 'fiil',
        },
        {
          word: 'deteriorate',
          meaning: 'kötüleşmek, bozulmak, fenalaşmak',
          level: 'B2',
          example_sentence: 'The weather conditions deteriorated rapidly during the flight.',
          example_translation: 'Uçuş sırasında hava koşulları hızla kötüleşti.',
          synonyms: ['worsen', 'decline', 'degenerate'],
          part_of_speech: 'fiil',
        },
        {
          word: 'meticulous',
          meaning: 'titiz, kılı kırk yaran, son derece dikkatli',
          level: 'C1',
          example_sentence: 'She conducted meticulous research before publishing her thesis.',
          example_translation: 'Tezini yayımlamadan önce kılı kırk yaran titiz bir araştırma yürüttü.',
          synonyms: ['thorough', 'painstaking', 'diligent'],
          part_of_speech: 'sıfat',
        },
        {
          word: 'scrutinize',
          meaning: 'derinlemesine incelemek, mercek altına almak',
          level: 'C1',
          example_sentence: 'The committee will closely scrutinize every proposal submitted.',
          example_translation: 'Komite, sunulan her öneriyi mercek altına alarak derinlemesine inceleyecek.',
          synonyms: ['examine', 'inspect', 'investigate'],
          part_of_speech: 'fiil',
        },
        {
          word: 'prevalent',
          meaning: 'yaygın, hâkim, çok rastlanan',
          level: 'B2',
          example_sentence: 'Deficiency of vitamin D is prevalent among people living in northern regions.',
          example_translation: 'Kuzey bölgelerinde yaşayan insanlar arasında D vitamini eksikliği yaygındır.',
          synonyms: ['widespread', 'common', 'predominant'],
          part_of_speech: 'sıfat',
        },
        {
          word: 'feasible',
          meaning: 'uygulanabilir, yapılabilir, mantıklı',
          level: 'B2',
          example_sentence: 'With current renewable technology, the proposed solar project is completely feasible.',
          example_translation: 'Mevcut yenilenebilir teknolojiyle, önerilen güneş enerjisi projesi tamamen uygulanabilirdir.',
          synonyms: ['practical', 'viable', 'workable', 'achievable'],
          part_of_speech: 'sıfat',
        },
        {
          word: 'hamper',
          meaning: 'engellemek, aksatmak, köstek olmak',
          level: 'B2',
          example_sentence: 'Heavy snowstorms hampered the rescue efforts in the mountainous terrain.',
          example_translation: 'Yoğun kar fırtınaları dağlık arazideki kurtarma çalışmalarını aksattı.',
          synonyms: ['hinder', 'impede', 'obstruct'],
          part_of_speech: 'fiil',
        },
      ],
    },
  ],
  SERKAN20: [
    {
      id: 'list_serkan_yds_master',
      promo_code: 'SERKAN20',
      instructor_name: 'Serkan Hoca',
      title: 'Serkan Hoca — İleri Düzey Akademik Sıfatlar',
      description: 'Akademik makale ve paragraf sorularında fark yaratan ileri düzey sıfatlar ve eş anlamlıları.',
      badge_text: '🎓 SERKAN HOCA ÖZEL',
      color: '#EC4899',
      icon: 'Award',
      is_active: true,
      words: [
        {
          word: 'lucrative',
          meaning: 'kazançlı, karlı, çok para getiren',
          level: 'B2',
          example_sentence: 'The partnership opened up several lucrative business opportunities.',
          example_translation: 'Ortaklık son derece kazançlı birkaç iş fırsatının önünü açtı.',
          synonyms: ['profitable', 'rewarding'],
          part_of_speech: 'sıfat',
        },
        {
          word: 'indispensable',
          meaning: 'vazgeçilmez, olmazsa olmaz, zorunlu',
          level: 'B2',
          example_sentence: 'Clear communication is indispensable for successful international relations.',
          example_translation: 'Net iletişim, başarılı uluslararası ilişkiler için vazgeçilmezdir.',
          synonyms: ['essential', 'vital', 'crucial'],
          part_of_speech: 'sıfat',
        },
        {
          word: 'reluctant',
          meaning: 'isteksiz, gönülsüz, tereddütlü',
          level: 'B2',
          example_sentence: 'Many investors were reluctant to take financial risks during the volatile period.',
          example_translation: 'Pek çok yatırımcı dalgalı dönemde finansal risk almaya isteksizdi.',
          synonyms: ['unwilling', 'hesitant'],
          part_of_speech: 'sıfat',
        },
      ],
    },
  ],
};

export class InstructorVocabService {
  /**
   * Fetch word packs belonging to a promo code from Supabase Cloud or Fallback
   */
  static async fetchInstructorWordPacks(promoCode: string): Promise<InstructorWordList[]> {
    if (!promoCode) return [];
    const cleanCode = promoCode.trim().toUpperCase();

    // 1. Attempt Supabase Cloud Query
    const url = ENV_CONFIG.SUPABASE_URL?.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
    const key = ENV_CONFIG.SUPABASE_ANON_KEY;

    if (url && key) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const endpoint = `${url}/rest/v1/instructor_word_lists?promo_code=ilike.${encodeURIComponent(
          cleanCode
        )}&is_active=eq.true&select=*,instructor_words(*)`;

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const rows = await response.json();
          if (Array.isArray(rows) && rows.length > 0) {
            return rows.map((r: any) => ({
              id: r.id,
              promo_code: r.promo_code.toUpperCase(),
              instructor_name: r.instructor_name,
              title: r.title,
              description: r.description,
              badge_text: r.badge_text || '🎓 EĞİTMEN PAKETİ',
              color: r.color || '#8B5CF6',
              icon: r.icon || 'GraduationCap',
              is_active: Boolean(r.is_active),
              words: (r.instructor_words || []).map((w: any) => ({
                id: w.id,
                word: w.word,
                meaning: w.meaning,
                category: w.category || 'VOCABULARY',
                level: w.level || 'B2',
                example_sentence: w.example_sentence,
                example_translation: w.example_translation,
                synonyms: typeof w.synonyms === 'string' ? JSON.parse(w.synonyms) : w.synonyms || [],
                etymology_note: w.etymology_note,
                part_of_speech: w.part_of_speech,
              })),
            }));
          }
        }
      } catch (err) {
        console.warn('Supabase instructor vocab query error (using fallback):', err);
      }
    }

    // 2. Check Seed/Demo Instructor Packs
    if (SEED_INSTRUCTOR_PACKS[cleanCode]) {
      return SEED_INSTRUCTOR_PACKS[cleanCode];
    }

    // 3. Dynamic Pattern matching for dynamic teacher codes (e.g. [NAME]20)
    const match = cleanCode.match(/^([A-ZÇĞİÖŞÜa-zçğıöşü]{2,15})(\d{2})$/);
    if (match) {
      const rawName = match[1];
      const formattedName =
        rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase() + ' Hoca';

      return [
        {
          id: `list_${cleanCode.toLowerCase()}`,
          promo_code: cleanCode,
          instructor_name: formattedName,
          title: `${formattedName} — YDS Kritik Kelimeler`,
          description: `${formattedName} öğrencilerine özel hazırlanan YDS ve YÖKDİL odaklı hedef kelime seti.`,
          badge_text: `🎓 ${formattedName.toUpperCase()} ÖZEL`,
          color: '#8B5CF6',
          icon: 'GraduationCap',
          is_active: true,
          words: [
            {
              word: 'alleviate',
              meaning: 'hafifletmek, dindirmek, acısını azaltmak',
              level: 'B2',
              example_sentence: 'The government introduced relief packages to alleviate economic distress.',
              example_translation: 'Hükümet, ekonomik sıkıntıyı hafifletmek için yardım paketleri açıkladı.',
              synonyms: ['ease', 'relieve', 'mitigate'],
              part_of_speech: 'fiil',
            },
            {
              word: 'scrutinize',
              meaning: 'derinlemesine incelemek, mercek altına almak',
              level: 'C1',
              example_sentence: 'Academics will closely scrutinize the preliminary survey data.',
              example_translation: 'Akademisyenler ön anket verilerini derinlemesine inceleyecek.',
              synonyms: ['examine', 'inspect', 'investigate'],
              part_of_speech: 'fiil',
            },
            {
              word: 'curb',
              meaning: 'dizginlemek, kontrol altına almak, sınırlamak',
              level: 'B2',
              example_sentence: 'Strict measures were enforced to curb environmental pollution.',
              example_translation: 'Çevre kirliliğini dizginlemek için sıkı önlemler uygulandı.',
              synonyms: ['restrain', 'control', 'limit'],
              part_of_speech: 'fiil',
            },
          ],
        },
      ];
    }

    return [];
  }

  /**
   * Import an instructor word pack into the user's active SQLite database and Zustand store
   */
  static async importInstructorPackToLocal(
    pack: InstructorWordList
  ): Promise<{ folderId: string; wordsAdded: number; totalWords: number }> {
    const folderId = `instructor_${pack.id}`;
    const words = pack.words || [];

    // 1. Ensure folder exists in SQLite
    const folderData: VocabFolder = {
      id: folderId,
      name: pack.title,
      description: pack.description || `${pack.instructor_name} özel kelime seti`,
      color: pack.color || '#8B5CF6',
      icon: pack.icon || 'GraduationCap',
      is_system: false,
      is_instructor: true,
      instructor_name: pack.instructor_name,
      badge_text: pack.badge_text || '🎓 EĞİTMEN LİSTESİ',
      word_count: words.length,
      learned_count: 0,
      created_at: new Date().toISOString(),
    };

    try {
      // Create or update folder in DB
      const existingFolder = await dbService.getVocabFolderById(folderId);
      if (!existingFolder) {
        await dbService.createVocabFolderWithId(folderData);
      } else {
        await dbService.updateVocabFolder(folderId, {
          name: pack.title,
          description: folderData.description,
          color: folderData.color,
          icon: folderData.icon,
        });
      }
    } catch (err) {
      console.warn('Failed creating instructor folder record in DB, falling back:', err);
    }

    // 2. Insert words avoiding duplicates
    let addedCount = 0;
    for (const w of words) {
      try {
        const wordInserted = await dbService.insertInstructorWordIfMissing({
          word: w.word,
          meaning: w.meaning,
          category: w.category || 'VOCABULARY',
          subcategory: pack.title,
          folder_name: pack.title,
          level: w.level || 'B2',
          synonyms: w.synonyms || [],
          example_sentence: w.example_sentence || '',
          example_translation: w.example_translation || '',
          etymology_note: w.etymology_note || '',
          part_of_speech: w.part_of_speech || 'kelime',
          is_custom: true,
        });
        if (wordInserted) addedCount++;
      } catch (e) {
        console.warn('Error inserting instructor word:', w.word, e);
      }
    }

    // 3. Refresh Zustand store
    try {
      await useLearningStore.getState().loadVocabFolders();
      await useLearningStore.getState().loadVocabSession();
    } catch (_) {}

    return {
      folderId,
      wordsAdded: addedCount,
      totalWords: words.length,
    };
  }

  /**
   * Synchronize all instructor word packs for a promo code in a single call
   */
  static async syncPromoCodeInstructorPacks(
    promoCode: string
  ): Promise<{ success: boolean; packCount: number; totalWords: number }> {
    try {
      const packs = await this.fetchInstructorWordPacks(promoCode);
      if (!packs || packs.length === 0) {
        return { success: false, packCount: 0, totalWords: 0 };
      }

      let totalWords = 0;
      for (const pack of packs) {
        const result = await this.importInstructorPackToLocal(pack);
        totalWords += result.totalWords;
      }

      return {
        success: true,
        packCount: packs.length,
        totalWords,
      };
    } catch (err) {
      console.error('Error syncing instructor packs for code:', promoCode, err);
      return { success: false, packCount: 0, totalWords: 0 };
    }
  }
}
