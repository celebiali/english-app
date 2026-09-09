import { WordItem } from '../types';
import { dbService } from '../database/DatabaseService';

export interface ApiDefinitionItem {
  definition: string;
  example?: string;
  synonyms?: string[];
}

export interface ApiMeaningGroup {
  partOfSpeech: string;
  definitions: ApiDefinitionItem[];
  synonyms?: string[];
}

export interface RichDictionaryResult {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  primaryTurkish: string;
  allTurkishMeanings: string[];
  meanings: ApiMeaningGroup[];
  exampleEn?: string;
  exampleTr?: string;
  isFromApi: boolean;
}

export class DictionaryApiService {
  private static cache = new Map<string, RichDictionaryResult>();

  /**
   * Translates English words and sentences to Turkish using MyMemory API.
   * 100% free, JSON response, never triggers bot captchas.
   */
  private static async fetchTurkishTranslations(
    word: string
  ): Promise<{ primary: string; all: string[] }> {
    const clean = word.trim().toLowerCase();

    // 1. First check local SQLite database for 100% verified ÖSYM/Tureng translation
    try {
      const localWord = await dbService.findWordByText(clean);
      if (localWord && localWord.meaning) {
        const parts = localWord.meaning
          .split(/[,;\/]/)
          .map((s) => s.trim())
          .filter(Boolean);
        return {
          primary: parts[0] || localWord.meaning,
          all: parts.length > 0 ? parts.slice(0, 6) : [localWord.meaning],
        };
      }
    } catch (_) {}

    // 2. Fetch from MyMemory Translation API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        clean
      )}&langpair=en|tr`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('Translation failed');
      const data = await response.json();

      let primary = '';
      const all: string[] = [];

      if (data && data.responseData && data.responseData.translatedText) {
        const tr = data.responseData.translatedText.trim().toLowerCase();
        // Ignore if returned same word (meaning no translation found)
        if (tr && tr !== clean) {
          primary = tr.charAt(0).toUpperCase() + tr.slice(1);
          all.push(primary);
        }
      }

      // Collect alternative translations from matches
      if (data && Array.isArray(data.matches)) {
        for (const match of data.matches) {
          if (match.translation) {
            const cleanTr = match.translation.trim().toLowerCase();
            const capTr = cleanTr.charAt(0).toUpperCase() + cleanTr.slice(1);
            if (
              cleanTr &&
              cleanTr !== clean &&
              !all.map((a) => a.toLowerCase()).includes(cleanTr) &&
              cleanTr.length < 30
            ) {
              all.push(capTr);
              if (!primary) primary = capTr;
            }
          }
          if (all.length >= 6) break;
        }
      }

      return {
        primary: primary || clean,
        all: all.length > 0 ? all : [primary || clean],
      };
    } catch (err) {
      console.warn('MyMemory translation error:', err);
      return { primary: clean, all: [clean] };
    }
  }

  /**
   * Translates an English example sentence to Turkish
   */
  static async translateSentence(sentence: string): Promise<string> {
    if (!sentence || sentence.trim().length === 0) return '';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        sentence.trim()
      )}&langpair=en|tr`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return '';
      const data = await response.json();
      if (data && data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText.trim();
      }
      return '';
    } catch {
      return '';
    }
  }

  /**
   * Fetches rich Oxford / Cambridge level definitions, phonetics, and audio from Free Dictionary API
   */
  private static async fetchFreeDictionaryApi(word: string): Promise<{
    phonetic?: string;
    audioUrl?: string;
    meanings: ApiMeaningGroup[];
    firstExample?: string;
  }> {
    const clean = encodeURIComponent(word.trim().toLowerCase());
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${clean}`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return { meanings: [] };
      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        return { meanings: [] };
      }

      const entry = data[0];
      let phonetic = entry.phonetic;
      let audioUrl = '';

      if (entry.phonetics && Array.isArray(entry.phonetics)) {
        for (const p of entry.phonetics) {
          if (!phonetic && p.text) phonetic = p.text;
          if (p.audio && p.audio.startsWith('http')) {
            audioUrl = p.audio;
            break;
          }
        }
      }

      const meanings: ApiMeaningGroup[] = [];
      let firstExample = '';

      if (entry.meanings && Array.isArray(entry.meanings)) {
        entry.meanings.forEach((m: any) => {
          const definitions: ApiDefinitionItem[] = [];
          if (m.definitions && Array.isArray(m.definitions)) {
            m.definitions.forEach((d: any) => {
              if (d.definition) {
                definitions.push({
                  definition: d.definition,
                  example: d.example,
                  synonyms: d.synonyms,
                });
                if (!firstExample && d.example) {
                  firstExample = d.example;
                }
              }
            });
          }

          meanings.push({
            partOfSpeech: m.partOfSpeech || 'general',
            definitions: definitions.slice(0, 4),
            synonyms: m.synonyms || [],
          });
        });
      }

      return {
        phonetic,
        audioUrl,
        meanings,
        firstExample,
      };
    } catch {
      return { meanings: [] };
    }
  }

  /**
   * Complete rich word lookup:
   * Combines Free Dictionary API definitions + MyMemory Turkish translations + example translations.
   */
  static async lookupWord(word: string): Promise<RichDictionaryResult | null> {
    const clean = word.trim().toLowerCase();
    if (!clean) return null;

    if (this.cache.has(clean)) {
      return this.cache.get(clean)!;
    }

    try {
      const [dictData, trData] = await Promise.all([
        this.fetchFreeDictionaryApi(clean),
        this.fetchTurkishTranslations(clean),
      ]);

      let exampleEn = dictData.firstExample || '';
      let exampleTr = '';

      if (exampleEn) {
        exampleTr = await this.translateSentence(exampleEn);
      }

      const result: RichDictionaryResult = {
        word: clean,
        phonetic: dictData.phonetic,
        audioUrl: dictData.audioUrl,
        primaryTurkish: trData.primary || clean,
        allTurkishMeanings: trData.all.length > 0 ? trData.all : [trData.primary],
        meanings: dictData.meanings,
        exampleEn,
        exampleTr,
        isFromApi: true,
      };

      this.cache.set(clean, result);
      return result;
    } catch (err) {
      console.warn('lookupWord API error:', err);
      return null;
    }
  }

  /**
   * Converts an API result to a clean WordItem with only its primary Turkish meaning
   */
  static convertToWordItem(apiWord: RichDictionaryResult): Partial<WordItem> {
    const cleanMeaning = apiWord.primaryTurkish?.trim() || apiWord.allTurkishMeanings[0]?.trim() || '';

    return {
      word: apiWord.word.trim().toLowerCase(),
      meaning: cleanMeaning,
      category: 'VOCABULARY',
      subcategory: 'Kelimelerim',
      folder_name: 'Kelimelerim',
      level: 'B1',
      is_custom: true,
    };
  }
}
