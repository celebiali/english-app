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
      'and', 'and also', 'as well as', 'along with',
    ],
    equivalents: [
      've', 'ile', 've de', 'hem de', 'birlikte', 'aynı zamanda', 'ek olarak', 'ek şart', 'yanı sıra',
    ],
  },
  {
    keywords: [
      'or', 'either or',
    ],
    equivalents: [
      'veya', 'ya da', 'yahut', 'velev ki',
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
   * Calculates Levenshtein distance for smart typo tolerance (1 letter typo allowed for 5+ letter words)
   */
  private static levenshtein(a: string, b: string): number {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  /**
   * Evaluates whether user's typed Turkish translation matches the dictionary,
   * semantic equivalence clusters, synonyms, and sub-meanings.
   * Balanced: Accepts valid short words ('ve', 'ile'), close synonyms, and 1-letter typos without over-accepting false positives.
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

    // 1. Direct Target Meaning Check (Split raw string BEFORE stripping punctuation!)
    const rawTargetParts = (targetMeaning || '')
      .split(/[,\/;|•\n()]+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    for (const rawPart of rawTargetParts) {
      const partNorm = this.normalizeTr(rawPart);
      if (!partNorm) continue;

      // 1a. Exact match (case and diacritics normalized) -> ALWAYS ACCEPT even for 2-letter words like 've', 'ön', 'ile'
      if (partNorm === cleanInput) {
        return { isCorrect: true, matchedWith: rawPart };
      }

      // 1b. Whole token / word inside phrase (e.g. "ek şart" contains "şart" or "ek")
      const subWords = partNorm.split(/\s+/).filter(Boolean);
      if (subWords.includes(cleanInput)) {
        return { isCorrect: true, matchedWith: rawPart };
      }

      // 1c. Substring matching (strictly require at least 4 characters to prevent false positives like 'e' in 'etkilemek')
      if (cleanInput.length >= 4 && partNorm.length >= 4) {
        if (partNorm.includes(cleanInput) || cleanInput.includes(partNorm)) {
          return { isCorrect: true, matchedWith: rawPart };
        }
      }

      // 1d. Stem comparison (e.g. "kötüleşmek" -> "kötüleşme")
      const targetStem = this.getTrStem(partNorm);
      if (targetStem.length >= 3 && inputStem.length >= 3) {
        if (targetStem === inputStem || (targetStem.length >= 4 && (targetStem.startsWith(inputStem) || inputStem.startsWith(targetStem)))) {
          return { isCorrect: true, matchedWith: rawPart };
        }
      }

      // 1e. Smart Typo Tolerance (Levenshtein distance <= 1 for words with 5+ letters)
      if (cleanInput.length >= 5 && partNorm.length >= 5 && Math.abs(cleanInput.length - partNorm.length) <= 1) {
        if (this.levenshtein(cleanInput, partNorm) <= 1) {
          return { isCorrect: true, matchedWith: `${rawPart} (Yazım düzeltildi)` };
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
        for (const eq of group.equivalents) {
          const normEq = this.normalizeTr(eq);
          if (cleanInput === normEq) {
            return { isCorrect: true, matchedWith: `${eq} (Eş Anlamlı Karşılık)` };
          }
          if (cleanInput.length >= 4 && normEq.length >= 4 && (cleanInput.includes(normEq) || normEq.includes(cleanInput))) {
            return { isCorrect: true, matchedWith: `${eq} (Eş Anlamlı Karşılık)` };
          }
        }
      }
    }

    // 3. Check Built-in Academic Dictionary for exact/sub meanings of all word variants
    for (const v of variants) {
      if (BUILTIN_ACADEMIC_DICT[v]) {
        const item = BUILTIN_ACADEMIC_DICT[v];
        const allBuiltinTr = [
          item.primaryMeaning,
          ...item.meanings.map((m) => m.turkish),
        ];

        for (const rawTr of allBuiltinTr) {
          const parts = rawTr.split(/[,\/;|•\n()]+/).map((p) => this.normalizeTr(p)).filter(Boolean);
          for (const p of parts) {
            if (p === cleanInput) {
              return { isCorrect: true, matchedWith: `${rawTr}` };
            }
            if (cleanInput.length >= 4 && p.length >= 4 && (p.includes(cleanInput) || cleanInput.includes(p))) {
              return { isCorrect: true, matchedWith: `${rawTr}` };
            }
            const stem = this.getTrStem(p);
            if (stem.length >= 3 && inputStem.length >= 3 && stem === inputStem) {
              return { isCorrect: true, matchedWith: `${rawTr}` };
            }
          }
        }
      }
    }

    // 4. Check Synonyms parameter if passed
    if (synonyms && Array.isArray(synonyms) && synonyms.length > 0) {
      for (const syn of synonyms) {
        if (!syn || typeof syn !== 'string') continue;
        const normSyn = this.normalizeTr(syn);
        if (normSyn === cleanInput) {
          return { isCorrect: true, matchedWith: `${syn} (Eş Anlam)` };
        }
      }
    }

    // 5. All Tureng Categories / Meanings Check
    if (allMeanings && allMeanings.length > 0) {
      for (const m of allMeanings) {
        const parts = (m.turkish || '').split(/[,\/;|•\n()]+/).map((p) => this.normalizeTr(p)).filter(Boolean);
        for (const part of parts) {
          if (part === cleanInput) {
            return { isCorrect: true, matchedWith: `${m.turkish} (${m.category})` };
          }
          if (cleanInput.length >= 4 && part.length >= 4 && (part.includes(cleanInput) || cleanInput.includes(part))) {
            return { isCorrect: true, matchedWith: `${m.turkish} (${m.category})` };
          }
          const stem = this.getTrStem(part);
          if (stem.length >= 3 && inputStem.length >= 3 && stem === inputStem) {
            return { isCorrect: true, matchedWith: `${m.turkish} (${m.category})` };
          }
        }
      }
    }

    return { isCorrect: false };
  }
}
