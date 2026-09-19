import { WordItem } from '../types';
import { dbService } from '../database/DatabaseService';
import { isBoilerplateSentence, getValidExampleSentence } from '../utils/sentenceUtils';
import { getBuiltinAcademicSentence } from './BuiltinAcademicDictionary';

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

export interface LookupOptions {
  signal?: AbortSignal;
  skipSentenceTranslation?: boolean;
}

export class DictionaryApiService {
  private static cache = new Map<string, RichDictionaryResult>();

  static getCachedWord(word: string): RichDictionaryResult | undefined {
    return this.cache.get((word || '').trim().toLowerCase());
  }

  private static readonly USER_AGENT =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';

  /**
   * High-reliability multi-engine translation:
   * 1. Local SQLite DB (instant 1ms)
   * 2. Google Translate Neural Engine with gtx client (primary, 5000ms timeout for mobile networks)
   * 3. Google Translate clients5 dict client (fallback, 4000ms timeout)
   * 4. Google Translate dict-chrome-ex client (fallback, 4000ms timeout)
   * 5. MyMemory Translation API (fallback, 4000ms timeout)
   * 
   * NEVER returns the English word as the Turkish meaning!
   */
  private static async fetchTurkishTranslations(
    word: string,
    signal?: AbortSignal
  ): Promise<{ primary: string; all: string[]; meanings: ApiMeaningGroup[] }> {
    const clean = word.trim().toLowerCase();

    // 1. First check local SQLite database for 100% verified ÖSYM/Tureng translation (1ms)
    try {
      const localWord = await dbService.findWordByText(clean);
      if (localWord && localWord.meaning) {
        const parts = localWord.meaning
          .split(/[,;\/]/)
          .map((s) => s.trim())
          .filter(Boolean);
        const primary = parts[0] || localWord.meaning;
        const all = parts.length > 0 ? parts.slice(0, 8) : [localWord.meaning];
        const localMeanings: ApiMeaningGroup[] = [
          {
            partOfSpeech: localWord.part_of_speech || localWord.category?.toLowerCase() || 'genel',
            definitions: all.map((m) => ({ definition: m })),
            synonyms: localWord.synonyms || [],
          },
        ];
        return { primary, all, meanings: localMeanings };
      }
    } catch (_) {}

    // Helper: Checks if candidate translation is genuine Turkish (not equal to the English input)
    const isValidTurkish = (candidate: string): boolean => {
      if (!candidate) return false;
      const t = candidate.trim().toLowerCase();
      return t.length > 0 && t !== clean;
    };

    // 2. Google Translate with public "gtx" client (5000ms timeout - high resilience on 5G/cellular)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const onParentAbort = () => controller.abort();
      if (signal) signal.addEventListener('abort', onParentAbort);

      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&dt=bd&dt=at&q=${encodeURIComponent(
        clean
      )}`;

      const response = await fetch(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener('abort', onParentAbort);

      if (response.ok) {
        const data = await response.json();
        let primary = '';
        const all: string[] = [];
        const meanings: ApiMeaningGroup[] = [];

        // Primary translation from segments
        if (Array.isArray(data) && Array.isArray(data[0])) {
          let assembled = '';
          for (const seg of data[0]) {
            if (seg && typeof seg[0] === 'string') {
              assembled += seg[0];
            }
          }
          const trClean = assembled.trim();
          if (isValidTurkish(trClean)) {
            primary = trClean.charAt(0).toUpperCase() + trClean.slice(1);
            all.push(primary);
          }
        }

        // Detailed parts of speech and alternative definitions from data[1]
        if (Array.isArray(data) && Array.isArray(data[1])) {
          for (const group of data[1]) {
            const pos = typeof group[0] === 'string' ? group[0] : 'general';
            const definitions: ApiDefinitionItem[] = [];
            if (Array.isArray(group[1])) {
              for (const w of group[1]) {
                if (typeof w === 'string') {
                  const wClean = w.trim();
                  if (isValidTurkish(wClean)) {
                    const wCap = wClean.charAt(0).toUpperCase() + wClean.slice(1);
                    if (!all.includes(wCap)) {
                      all.push(wCap);
                    }
                    definitions.push({ definition: wCap });
                  }
                }
              }
            }
            if (definitions.length > 0) {
              meanings.push({
                partOfSpeech: pos,
                definitions: definitions.slice(0, 4),
              });
            }
          }
        }

        if (primary || all.length > 0) {
          const finalPrimary = primary || all[0] || '';
          if (isValidTurkish(finalPrimary)) {
            return {
              primary: finalPrimary,
              all: all.length > 0 ? all.slice(0, 8) : [finalPrimary],
              meanings,
            };
          }
        }
      }
    } catch (_) {}

    // 3. Fallback: Google Translate clients5 endpoint (4000ms timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const onParentAbort = () => controller.abort();
      if (signal) signal.addEventListener('abort', onParentAbort);

      const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=tr&q=${encodeURIComponent(
        clean
      )}`;

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener('abort', onParentAbort);

      if (response.ok) {
        const data = await response.json();
        const candidate = Array.isArray(data) && typeof data[0] === 'string' ? data[0].trim() : '';
        if (isValidTurkish(candidate)) {
          const cap = candidate.charAt(0).toUpperCase() + candidate.slice(1);
          return {
            primary: cap,
            all: [cap],
            meanings: [],
          };
        }
      }
    } catch (_) {}

    // 4. Fallback: Google Translate dict-chrome-ex endpoint (4000ms timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const onParentAbort = () => controller.abort();
      if (signal) signal.addEventListener('abort', onParentAbort);

      const url = `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=en&tl=tr&dt=t&dt=bd&dt=at&q=${encodeURIComponent(
        clean
      )}`;

      const response = await fetch(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener('abort', onParentAbort);

      if (response.ok) {
        const data = await response.json();
        let primary = '';
        const all: string[] = [];

        if (Array.isArray(data) && Array.isArray(data[0])) {
          let assembled = '';
          for (const seg of data[0]) {
            if (seg && typeof seg[0] === 'string') {
              assembled += seg[0];
            }
          }
          const trClean = assembled.trim();
          if (isValidTurkish(trClean)) {
            primary = trClean.charAt(0).toUpperCase() + trClean.slice(1);
            all.push(primary);
          }
        }

        if (primary) {
          return { primary, all, meanings: [] };
        }
      }
    } catch (_) {}

    // 5. Fallback: MyMemory Translation API (4000ms timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const onParentAbort = () => controller.abort();
      if (signal) signal.addEventListener('abort', onParentAbort);

      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        clean
      )}&langpair=en|tr`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener('abort', onParentAbort);

      if (response.ok) {
        const data = await response.json();
        let primary = '';
        const all: string[] = [];

        if (data?.responseData?.translatedText) {
          const tr = data.responseData.translatedText.trim();
          if (isValidTurkish(tr)) {
            primary = tr.charAt(0).toUpperCase() + tr.slice(1);
            all.push(primary);
          }
        }

        if (Array.isArray(data?.matches)) {
          for (const match of data.matches) {
            if (match.translation) {
              const cleanTr = match.translation.trim();
              if (isValidTurkish(cleanTr) && cleanTr.length < 35) {
                const capTr = cleanTr.charAt(0).toUpperCase() + cleanTr.slice(1);
                if (!all.includes(capTr)) {
                  all.push(capTr);
                }
              }
            }
            if (all.length >= 6) break;
          }
        }

        if (primary || all.length > 0) {
          return {
            primary: primary || all[0] || '',
            all: all.length > 0 ? all : (primary ? [primary] : []),
            meanings: [],
          };
        }
      }
    } catch (_) {}

    // NEVER return clean (English word) as Turkish! Return empty if not found.
    return { primary: '', all: [], meanings: [] };
  }

  /**
   * Translates an English example sentence to Turkish using Google Translate (4500ms timeout)
   */
  static async translateSentence(sentence: string, signal?: AbortSignal): Promise<string> {
    if (!sentence || sentence.trim().length === 0) return '';
    const cleanSentence = sentence.trim();

    // 1. Google Translate gtx
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const onParentAbort = () => controller.abort();
      if (signal) signal.addEventListener('abort', onParentAbort);

      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=${encodeURIComponent(
        cleanSentence
      )}`;
      const response = await fetch(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener('abort', onParentAbort);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && Array.isArray(data[0])) {
          let fullTr = '';
          for (const part of data[0]) {
            if (part && typeof part[0] === 'string') {
              fullTr += part[0];
            }
          }
          if (fullTr.trim()) {
            return fullTr.trim();
          }
        }
      }
    } catch (_) {}

    // 2. Fallback to MyMemory (4000ms timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const onParentAbort = () => controller.abort();
      if (signal) signal.addEventListener('abort', onParentAbort);

      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        cleanSentence
      )}&langpair=en|tr`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener('abort', onParentAbort);

      if (response.ok) {
        const data = await response.json();
        if (data?.responseData?.translatedText) {
          return data.responseData.translatedText.trim();
        }
      }
    } catch (_) {}

    return '';
  }

  /**
   * Fetches phonetic IPA and English definitions from Datamuse API (<100ms)
   */
  private static async fetchDatamuseDetails(
    word: string,
    signal?: AbortSignal
  ): Promise<{
    phonetic?: string;
    meanings: ApiMeaningGroup[];
    firstExample?: string;
  }> {
    const clean = word.trim().toLowerCase();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const onParentAbort = () => controller.abort();
      if (signal) signal.addEventListener('abort', onParentAbort);

      const url = `https://api.datamuse.com/words?sp=${encodeURIComponent(
        clean
      )}&md=dpfsr&ipa=1&max=1`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener('abort', onParentAbort);

      if (!response.ok) return { meanings: [] };
      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        return { meanings: [] };
      }

      const entry = data[0];
      let phonetic = '';

      if (Array.isArray(entry.tags)) {
        for (const t of entry.tags) {
          if (typeof t === 'string' && t.startsWith('ipa_pron:')) {
            phonetic = `/${t.replace('ipa_pron:', '')}/`;
            break;
          }
        }
      }

      const meaningsMap = new Map<string, ApiDefinitionItem[]>();
      if (Array.isArray(entry.defs)) {
        for (const d of entry.defs) {
          if (typeof d === 'string') {
            const parts = d.split('\t');
            const pos = parts[0] === 'n' ? 'noun' : parts[0] === 'v' ? 'verb' : parts[0] === 'adj' ? 'adjective' : parts[0] === 'adv' ? 'adverb' : 'general';
            const defText = (parts[1] || '').trim();
            if (defText) {
              const current = meaningsMap.get(pos) || [];
              if (current.length < 3) {
                current.push({ definition: defText });
                meaningsMap.set(pos, current);
              }
            }
          }
        }
      }

      const meanings: ApiMeaningGroup[] = [];
      meaningsMap.forEach((definitions, partOfSpeech) => {
        meanings.push({ partOfSpeech, definitions });
      });

      return {
        phonetic: phonetic || undefined,
        meanings,
      };
    } catch (_) {
      return { meanings: [] };
    }
  }

  /**
   * High-resilience authentic sentence resolver for any English vocabulary.
   * Priority:
   * 1. Built-in Academic Dictionary (instant 0ms)
   * 2. Tatoeba human-translated bilingual corpus API (real EN & TR sentences)
   * 3. Wiktionary API definition examples + Google Translate
   */
  static async fetchAuthenticSentence(
    word: string,
    signal?: AbortSignal
  ): Promise<{ en: string; tr: string } | null> {
    const clean = (word || '').trim().toLowerCase();
    if (!clean) return null;

    // 1. Built-in Academic Dictionary check (0ms)
    const builtin = getBuiltinAcademicSentence(clean);
    if (builtin?.sampleSentenceEn) {
      return {
        en: builtin.sampleSentenceEn,
        tr: builtin.sampleSentenceTr || '',
      };
    }

    // 2. Tatoeba API: millions of human-translated bilingual English-Turkish pairs
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const onParentAbort = () => controller.abort();
      if (signal) signal.addEventListener('abort', onParentAbort);

      const url = `https://tatoeba.org/en/api_v0/search?from=eng&to=tur&query=${encodeURIComponent(
        clean
      )}&trans_filter=limit&limit=6`;
      const response = await fetch(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener('abort', onParentAbort);

      if (response.ok) {
        const data = await response.json();
        const wordRegex = new RegExp(`\\b${clean}\\b`, 'i');
        const candidates = (data.results || [])
          .map((r: any) => ({
            en: (r.text || '').trim(),
            tr: (r.translations?.[0]?.[0]?.text || '').trim(),
          }))
          .filter(
            (item: any) =>
              item.en &&
              item.tr &&
              wordRegex.test(item.en) &&
              item.en.length >= 18 &&
              item.en.length <= 160 &&
              !isBoilerplateSentence(item.en)
          );

        candidates.sort((a: any, b: any) => b.en.length - a.en.length);
        if (candidates.length > 0) {
          const chosen = candidates[0];
          return { en: chosen.en, tr: chosen.tr };
        }
      }
    } catch (_) {}

    // 3. Wiktionary API definition examples
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const onParentAbort = () => controller.abort();
      if (signal) signal.addEventListener('abort', onParentAbort);

      const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(clean)}`;
      const response = await fetch(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener('abort', onParentAbort);

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.en)) {
          for (const item of data.en) {
            for (const def of item.definitions || []) {
              if (Array.isArray(def.examples)) {
                for (const ex of def.examples) {
                  const stripped = String(ex).replace(/<[^>]+>/g, '').trim();
                  if (
                    stripped.length >= 20 &&
                    stripped.length <= 160 &&
                    !isBoilerplateSentence(stripped)
                  ) {
                    let tr = '';
                    try {
                      tr = await this.translateSentence(stripped, signal);
                    } catch (_) {}
                    return { en: stripped, tr };
                  }
                }
              }
            }
          }
        }
      }
    } catch (_) {}

    return null;
  }

  /**
   * Complete rich word lookup:
   * Combines instant cache/local DB + ultra-fast Google neural translation + Datamuse IPA phonetic definitions.
   */
  static async lookupWord(
    word: string,
    options?: LookupOptions
  ): Promise<RichDictionaryResult | null> {
    const clean = word.trim().toLowerCase();
    if (!clean) return null;

    // Check in-memory cache first (0ms)
    if (this.cache.has(clean)) {
      return this.cache.get(clean)!;
    }

    try {
      // 1. Check local SQLite DB first (1-2ms)
      const localWord = await dbService.findWordByText(clean);
      if (localWord && localWord.meaning) {
        const parts = localWord.meaning
          .split(/[,;\/]/)
          .map((s) => s.trim())
          .filter(Boolean);
        const primary = parts[0] || localWord.meaning;
        const all = parts.length > 0 ? parts.slice(0, 8) : [localWord.meaning];

        let exampleEn =
          getValidExampleSentence(localWord.example_sentence) ||
          getBuiltinAcademicSentence(clean)?.sampleSentenceEn;
        let exampleTr =
          getValidExampleSentence(localWord.example_sentence)
            ? getValidExampleSentence(localWord.example_translation) || undefined
            : getBuiltinAcademicSentence(clean)?.sampleSentenceTr;

        // If example sentence is missing from local SQLite, enrich it asynchronously
        if (!exampleEn) {
          const authentic = await this.fetchAuthenticSentence(clean, options?.signal);
          if (authentic?.en) {
            exampleEn = authentic.en;
            exampleTr = authentic.tr || undefined;
            if (localWord.id) {
              dbService.updateWordExample(localWord.id, exampleEn, exampleTr).catch(() => {});
            } else {
              dbService.updateWordExampleByText(clean, exampleEn, exampleTr).catch(() => {});
            }
          }
        }

        const localResult: RichDictionaryResult = {
          word: clean,
          phonetic: localWord.etymology_note || undefined,
          audioUrl: undefined,
          primaryTurkish: primary,
          allTurkishMeanings: all,
          meanings: [
            {
              partOfSpeech: localWord.part_of_speech || localWord.category?.toLowerCase() || 'genel',
              definitions: all.map((m) => ({ definition: m })),
              synonyms: localWord.synonyms || [],
            },
          ],
          exampleEn,
          exampleTr,
          isFromApi: false,
        };

        this.cache.set(clean, localResult);
        return localResult;
      }

      // 2. High-speed parallel online fetch with generous timeouts
      const [trData, datamuseData] = await Promise.all([
        this.fetchTurkishTranslations(clean, options?.signal),
        this.fetchDatamuseDetails(clean, options?.signal),
      ]);

      // Combine meanings
      let finalMeanings = trData.meanings;
      if (finalMeanings.length === 0 && datamuseData.meanings.length > 0) {
        finalMeanings = datamuseData.meanings;
      }

      // High quality academic example sentence (avoid synthetic boilerplate)
      const builtinExample = getBuiltinAcademicSentence(clean);
      let exampleEn =
        getValidExampleSentence(datamuseData.firstExample) ||
        builtinExample?.sampleSentenceEn ||
        undefined;
      let exampleTr = builtinExample?.sampleSentenceTr || '';

      if (!exampleEn) {
        const authentic = await this.fetchAuthenticSentence(clean, options?.signal);
        if (authentic?.en) {
          exampleEn = authentic.en;
          exampleTr = authentic.tr || '';
        }
      }

      if (options?.skipSentenceTranslation) {
        exampleTr = '';
      } else if (exampleEn && !exampleTr) {
        // Fast sentence translation in background/parallel
        try {
          exampleTr = await this.translateSentence(exampleEn, options?.signal);
        } catch (_) {}
      }

      // STRICT VALIDATION: Never accept English word as Turkish translation
      const primaryTurkish =
        trData.primary && trData.primary.toLowerCase() !== clean ? trData.primary : '';
      const allTurkishMeanings = (trData.all || []).filter(
        (m) => m && m.toLowerCase() !== clean
      );

      const result: RichDictionaryResult = {
        word: clean,
        phonetic: datamuseData.phonetic,
        audioUrl: undefined,
        primaryTurkish,
        allTurkishMeanings,
        meanings: finalMeanings,
        exampleEn,
        exampleTr,
        isFromApi: true,
      };

      // Only cache if valid translation was actually found
      if (primaryTurkish) {
        this.cache.set(clean, result);
      }
      return result;
    } catch (err) {
      console.warn('lookupWord API error:', err);
      return null;
    }
  }

  /**
   * Converts an API result to a clean WordItem with its primary Turkish meaning
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
      example_sentence: apiWord.exampleEn,
      example_translation: apiWord.exampleTr,
      etymology_note: apiWord.phonetic,
      is_custom: true,
    };
  }

  static clearCache(): void {
    this.cache.clear();
  }
}
