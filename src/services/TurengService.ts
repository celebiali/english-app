import { AIService } from './AIService';
import {
  TurengMeaningItem,
  TurengWordDetail,
  BUILTIN_ACADEMIC_DICT,
  getBuiltinAcademicSentence,
} from './BuiltinAcademicDictionary';

export type { TurengMeaningItem, TurengWordDetail };
export { BUILTIN_ACADEMIC_DICT, getBuiltinAcademicSentence };

// In-memory cache for fast offline Tureng dictionary responses
const TURENG_CACHE = new Map<string, TurengWordDetail>();


// Semantic Equivalence Clusters for YDS Connectors & Grammar
const SEMANTIC_GROUPS: { keywords: string[]; equivalents: string[] }[] = [
  {
    keywords: [
      'because', 'since', 'as', 'for', 'seeing that', 'now that', 'in that',
      'due to the fact that', 'owing to the fact that', 'on account of the fact that',
      'on the grounds that', 'given that', 'considering that',
    ],
    equivalents: [
      'çünkü', 'dığı için', 'diği için', 'duğu için', 'düğü için', 'için',
      'zira', 'nedeniyle', 'sebebiyle', 'dolayı', 'ötürü', 'dolayısıyla',
      'yüzünden', 'gerekçesiyle', 'bakımından', 'açısından', 'sebebi',
    ],
  },
  {
    keywords: [
      'because of', 'due to', 'owing to', 'thanks to', 'in view of', 'on account of',
    ],
    equivalents: [
      'nedeniyle', 'sebebiyle', 'yüzünden', 'dolayı', 'den dolayı', 'dan dolayı',
      'sayesinde', 'ötürü', 'kaynaklı', 'dolayısıyla',
    ],
  },
  {
    keywords: [
      'although', 'though', 'even though', 'despite the fact that',
      'in spite of the fact that', 'whereas', 'while', 'even if',
    ],
    equivalents: [
      'rağmen', 'e rağmen', 'a rağmen', 'karşın', 'e karşın', 'a karşın',
      'se de', 'sa da', 'olsa da', 'her ne kadar', 'buna rağmen', 'yine de',
      'iken', 'oysa',
    ],
  },
  {
    keywords: [
      'despite', 'in spite of', 'notwithstanding', 'unlike', 'in contrast to', 'contrary to',
    ],
    equivalents: [
      'rağmen', 'e rağmen', 'a rağmen', 'karşın', 'e karşın', 'a karşın',
      'aksine', 'tersine', 'nın aksine', 'nin aksine',
    ],
  },
  {
    keywords: [
      'however', 'nevertheless', 'nonetheless', 'yet', 'but', 'still', 'even so',
    ],
    equivalents: [
      'ancak', 'fakat', 'ama', 'yine de', 'lakin', 'oysa', 'oysaki',
      'bununla birlikte', 'buna rağmen', 'ne var ki', 'böyle olsa bile',
    ],
  },
  {
    keywords: [
      'therefore', 'thus', 'hence', 'consequently', 'as a result',
      'as a consequence', 'that is why', 'because of this', 'accordingly', 'in turn',
    ],
    equivalents: [
      'bu yüzden', 'bu nedenle', 'bu sebeple', 'dolayısıyla', 'sonuç olarak',
      'böylece', 'bundan dolayı', 'bu doğrultuda', 'buna göre', 'netice olarak',
    ],
  },
  {
    keywords: [
      'moreover', 'furthermore', 'in addition', 'besides', 'what is more',
      'also', 'as well as', 'along with', 'in addition to',
    ],
    equivalents: [
      'ayrıca', 'dahası', 'üstelik', 'buna ek olarak', 'ek olarak',
      'bunun yanı sıra', 'yanı sıra', 'ayrıyeten', 'ile birlikte',
    ],
  },
  {
    keywords: [
      'in order to', 'so that', 'so as to', 'to', 'in order that',
      'for this purpose', 'to this end',
    ],
    equivalents: [
      'mek için', 'mak için', 'için', 'amacıyla', 'maksadıyla',
      'sin diye', 'sın diye', 'adına', 'bu amaçla',
    ],
  },
  {
    keywords: [
      'if', 'provided that', 'providing that', 'as long as', 'so long as',
      'on condition that', 'only if',
    ],
    equivalents: [
      'eğer', 'şayet', 'se', 'sa', 'şartıyla', 'koşuluyla',
      'dığı sürece', 'yeter ki', 'sürece',
    ],
  },
  {
    keywords: [
      'unless',
    ],
    equivalents: [
      'medikçe', 'madıkça', 'mezse', 'mazsa', 'olmadığı takdirde',
      'olmazsa', 'olmadıkça', 'etmedikçe',
    ],
  },
  {
    keywords: [
      'as soon as', 'the moment that', 'no sooner than', 'hardly when', 'barely when',
    ],
    equivalents: [
      'ır ırmaz', 'ir irmez', 'ar amaz', 'er emez', 'dığı anda',
      'dığı gibi', 'hemen sonra', 'yapar yapmaz', 'eder etmez', 'daha yeni mıştı ki',
    ],
  },
  {
    keywords: [
      'as if', 'as though',
    ],
    equivalents: [
      'mış gibi', 'miş gibi', 'muş gibi', 'müş gibi', 'sanki',
    ],
  },
];

export class TurengService {
  /**
   * Fast synchronous check for built-in high-quality academic example sentences.
   */
  static getBuiltinSentence(word: string): { sampleSentenceEn?: string; sampleSentenceTr?: string } | null {
    return getBuiltinAcademicSentence(word);
  }

  /**
   * Fetches Tureng-style detailed academic Turkish meanings for any English word.
   */
  static async lookupWord(word: string): Promise<TurengWordDetail> {
    const cleanWord = (word || '').trim().toLowerCase();

    if (TURENG_CACHE.has(cleanWord)) {
      return TURENG_CACHE.get(cleanWord)!;
    }

    // 1. Check built-in academic lookup first (instant offline response)
    if (BUILTIN_ACADEMIC_DICT[cleanWord]) {
      const item = BUILTIN_ACADEMIC_DICT[cleanWord];
      TURENG_CACHE.set(cleanWord, item);
      return item;
    }

    // 2. Try Gemini AI generation
    try {
      const prompt = `You are the official Tureng English-Turkish Academic Dictionary engine for YDS examination.
Given the English word "${cleanWord}", provide a comprehensive Tureng dictionary lookup JSON.

Return ONLY valid JSON matching this exact structure:
{
  "word": "${cleanWord}",
  "phonetic": "/.../",
  "primaryMeaning": "en yaygın YDS akademik Türkçe karşılığı",
  "meanings": [
    { "category": "Genel", "type": "fiil", "turkish": "kötüleşmek, bozulmak" },
    { "category": "Akademik", "type": "fiil", "turkish": "şiddetlendirmek, fenalaşmak" },
    { "category": "Tıp/Sağlık", "type": "fiil", "turkish": "sağlık durumu gerilemek" }
  ],
  "synonyms": ["worsen", "aggravate", "decline"],
  "antonyms": ["improve", "alleviate", "ameliorate"],
  "sampleSentenceEn": "A formal academic YDS exam sentence where '${cleanWord}' is actively used in natural grammatical context. Never use meta templates like 'the word X is used'.",
  "sampleSentenceTr": "Bu cümlenin akıcı Türkçe akademik çevirisi."
}`;

      const aiData = await AIService.generateCustomJSON<TurengWordDetail>(prompt);

      if (aiData && aiData.primaryMeaning && aiData.meanings && aiData.meanings.length > 0) {
        TURENG_CACHE.set(cleanWord, aiData);
        return aiData;
      }
    } catch (err) {
      console.warn('Tureng live lookup fallback:', err);
    }

    // 3. Fallback item (Never use English word as Turkish meaning)
    const fallback: TurengWordDetail = {
      word: cleanWord,
      primaryMeaning: '',
      meanings: [],
      synonyms: [],
      antonyms: [],
    };
    TURENG_CACHE.set(cleanWord, fallback);
    return fallback;
  }

  /**
   * Normalizes Turkish text for fuzzy and semantic comparison.
   */
  private static normalizeTr(txt: string): string {
    return (txt || '')
      .toLowerCase()
      .replace(/[\-–—_.,\/#!$%\^&\*;:{}=\`~()\"\'\?\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Strips common Turkish verb and grammatical endings for stem matching.
   */
  private static getTrStem(txt: string): string {
    let norm = this.normalizeTr(txt);
    // Strip common suffixes
    norm = norm
      .replace(/(mek|mak|me|ma|mesi|ması|mekte|makta)$/g, '')
      .replace(/(dığı için|diği için|duğu için|düğü için)$/g, '')
      .replace(/(e rağmen|a rağmen|e karşın|a karşın)$/g, '')
      .trim();
    return norm;
  }

  /**
   * Evaluates whether user's typed Turkish translation matches the dictionary,
   * semantic equivalence clusters, synonyms, and sub-meanings.
   */
  static checkTurkishAnswer(
    userTyped: string,
    englishWord: string = '',
    targetMeaning: string = '',
    allMeanings: TurengMeaningItem[] = [],
    synonyms: string[] = []
  ): { isCorrect: boolean; matchedWith?: string } {
    const cleanInput = this.normalizeTr(userTyped);
    if (!cleanInput) return { isCorrect: false };

    const cleanWord = (englishWord || '').trim().toLowerCase();
    const inputStem = this.getTrStem(cleanInput);

    // Generate word variants for compound/parenthetical expressions (e.g. "now (that)" -> ["now (that)", "now that", "now"])
    const variants = new Set<string>();
    if (cleanWord) {
      variants.add(cleanWord);
      variants.add(cleanWord.replace(/[()]/g, '').replace(/\s+/g, ' ').trim());
      const withoutParen = cleanWord.replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
      if (withoutParen) variants.add(withoutParen);
      cleanWord.split(/[\/\\]/).forEach((part) => {
        const p = part.replace(/[()]/g, '').trim();
        if (p) variants.add(p);
      });
    }

    // 1. Check Built-in Academic Dictionary for exact/sub meanings of all word variants
    for (const v of variants) {
      if (BUILTIN_ACADEMIC_DICT[v]) {
        const item = BUILTIN_ACADEMIC_DICT[v];
        const allBuiltinTr = [
          item.primaryMeaning,
          ...item.meanings.map((m) => m.turkish),
        ];

        for (const rawTr of allBuiltinTr) {
          const parts = this.normalizeTr(rawTr).split(/[,\/]/).map((p) => p.trim());
          for (const p of parts) {
            if (p === cleanInput || cleanInput.includes(p) || (p.length >= 3 && p.includes(cleanInput))) {
              return { isCorrect: true, matchedWith: `${rawTr}` };
            }
            const stem = this.getTrStem(p);
            if (stem.length >= 3 && inputStem.length >= 3 && (stem === inputStem || stem.startsWith(inputStem) || inputStem.startsWith(stem))) {
              return { isCorrect: true, matchedWith: `${rawTr}` };
            }
          }
        }
      }
    }

    // 2. Check Semantic Equivalence Clusters for all word variants
    for (const group of SEMANTIC_GROUPS) {
      const isWordInGroup = Array.from(variants).some((v) =>
        group.keywords.some((k) => k === v || v.includes(k) || k.includes(v))
      );
      const isTargetInGroup =
        targetMeaning &&
        group.equivalents.some((eq) => this.normalizeTr(targetMeaning).includes(eq));

      if (isWordInGroup || isTargetInGroup) {
        // Check if user's input matches any equivalent in this group
        for (const eq of group.equivalents) {
          if (cleanInput === eq || cleanInput.includes(eq) || eq.includes(cleanInput)) {
            return { isCorrect: true, matchedWith: `${eq} (Eş Anlamlı Karşılık)` };
          }
        }
      }
    }

    // 3. Direct Target Meaning Check
    const normalizedTarget = this.normalizeTr(targetMeaning);
    const targetParts = normalizedTarget.split(/[,\/;]/).map((p) => p.trim());

    for (const part of targetParts) {
      if (part === cleanInput || cleanInput.includes(part) || part.includes(cleanInput)) {
        if (cleanInput.length >= 3 && part.length >= 3) {
          return { isCorrect: true, matchedWith: part };
        }
      }
      // Stem comparison
      const targetStem = this.getTrStem(part);
      if (targetStem.length >= 3 && inputStem.length >= 3) {
        if (targetStem === inputStem || targetStem.startsWith(inputStem) || inputStem.startsWith(targetStem)) {
          return { isCorrect: true, matchedWith: part };
        }
      }
    }

    // 4. All Tureng Categories / Meanings Check
    if (allMeanings && allMeanings.length > 0) {
      for (const m of allMeanings) {
        const parts = this.normalizeTr(m.turkish).split(/[,\/;]/).map((p) => p.trim());
        for (const part of parts) {
          if (part === cleanInput || (cleanInput.length >= 3 && part.includes(cleanInput))) {
            return { isCorrect: true, matchedWith: `${m.turkish} (${m.category})` };
          }
          const stem = this.getTrStem(part);
          if (stem.length >= 3 && inputStem.length >= 3 && (stem === inputStem || stem.startsWith(inputStem))) {
            return { isCorrect: true, matchedWith: `${m.turkish} (${m.category})` };
          }
        }
      }
    }

    return { isCorrect: false };
  }
}
