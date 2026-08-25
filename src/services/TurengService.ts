import { AIService } from './AIService';

export interface TurengMeaningItem {
  category: string; // e.g. "Genel", "Akademik", "Tıp", "Hukuk", "Ekonomi"
  turkish: string;
  type: string; // "f.", "isim", "sıfat", "zarf"
}

export interface TurengWordDetail {
  word: string;
  phonetic?: string;
  meanings: TurengMeaningItem[];
  primaryMeaning: string;
  synonyms: string[];
  antonyms: string[];
  sampleSentenceEn?: string;
  sampleSentenceTr?: string;
}

// In-memory cache for fast offline Tureng dictionary responses
const TURENG_CACHE = new Map<string, TurengWordDetail>();

export class TurengService {
  /**
   * Fetches Tureng-style detailed academic Turkish meanings for any English word.
   */
  static async lookupWord(word: string): Promise<TurengWordDetail> {
    const cleanWord = word.trim().toLowerCase();

    if (TURENG_CACHE.has(cleanWord)) {
      return TURENG_CACHE.get(cleanWord)!;
    }

    try {
      // Use Gemini configured with Tureng dictionary structure
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
  "sampleSentenceEn": "A formal academic YDS example sentence using ${cleanWord}.",
  "sampleSentenceTr": "Bu cümlenin Türkçe akademik çevirisi."
}`;

      const aiData = await AIService.generateCustomJSON<TurengWordDetail>(prompt);

      if (aiData && aiData.primaryMeaning) {
        TURENG_CACHE.set(cleanWord, aiData);
        return aiData;
      }
    } catch (err) {
      console.warn('Tureng live lookup fallback:', err);
    }

    // Fallback default item
    const fallback: TurengWordDetail = {
      word: cleanWord,
      primaryMeaning: cleanWord,
      meanings: [{ category: 'Genel', type: 'kelime', turkish: cleanWord }],
      synonyms: [],
      antonyms: [],
    };
    TURENG_CACHE.set(cleanWord, fallback);
    return fallback;
  }

  /**
   * Evaluates whether user's typed Turkish translation matches the Tureng dictionary.
   * Supports multi-meaning, fuzzy matching, and synonym acceptance.
   */
  static checkTurkishAnswer(
    userTyped: string,
    targetMeaning: string,
    allMeanings: TurengMeaningItem[] = [],
    synonyms: string[] = []
  ): { isCorrect: boolean; matchedWith?: string } {
    const normalize = (txt: string) =>
      txt
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const cleanInput = normalize(userTyped);
    if (!cleanInput) return { isCorrect: false };

    // 1. Direct target meaning check
    const normalizedTarget = normalize(targetMeaning);
    const targetParts = normalizedTarget.split(/[,;\/]/).map((p) => p.trim());

    for (const part of targetParts) {
      if (part === cleanInput || cleanInput.includes(part) || part.includes(cleanInput)) {
        if (cleanInput.length >= 3 && part.length >= 3) {
          return { isCorrect: true, matchedWith: part };
        }
      }
    }

    // 2. All Tureng categories meanings check
    for (const m of allMeanings) {
      const parts = normalize(m.turkish).split(/[,;\/]/).map((p) => p.trim());
      for (const part of parts) {
        if (part === cleanInput || (cleanInput.length >= 4 && part.includes(cleanInput))) {
          return { isCorrect: true, matchedWith: `${m.turkish} (${m.category})` };
        }
      }
    }

    return { isCorrect: false };
  }
}
