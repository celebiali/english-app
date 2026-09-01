import { AIService } from './AIService';

export interface TurengMeaningItem {
  category: string; // e.g. "Genel", "Akademik", "Bağlaç", "Tıp", "Hukuk", "Ekonomi"
  turkish: string;
  type: string; // "bağlaç", "fiil", "isim", "sıfat", "zarf", "edat"
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

// Rich built-in academic lookup for high-frequency connectors & YDS core vocabulary
const BUILTIN_ACADEMIC_DICT: Record<string, TurengWordDetail> = {
  'because': {
    word: 'because',
    phonetic: '/bɪˈkɒz/',
    primaryMeaning: '-dığı için, çünkü',
    meanings: [
      { category: 'Bağlaç', type: 'bağlaç', turkish: 'çünkü, -dığı için' },
      { category: 'Akademik', type: 'bağlaç', turkish: 'zira, nedeniyle, sebebiyle' },
      { category: 'Genel', type: 'bağlaç', turkish: 'için, dolayısıyla, ötürü' },
    ],
    synonyms: ['since', 'as', 'due to the fact that', 'seeing that', 'for'],
    antonyms: [],
    sampleSentenceEn: 'The experiment succeeded because the research team adhered strictly to the protocol.',
    sampleSentenceTr: 'Araştırma ekibi protokole sıkı sıkıya bağlı kaldığı için (çünkü) deney başarılı oldu.',
  },
  'since': {
    word: 'since',
    phonetic: '/sɪns/',
    primaryMeaning: '-dığı için, çünkü, -den beri',
    meanings: [
      { category: 'Bağlaç / Sebep', type: 'bağlaç', turkish: 'çünkü, -dığı için, zira' },
      { category: 'Zaman', type: 'edat', turkish: '-den beri' },
    ],
    synonyms: ['because', 'as', 'inasmuch as'],
    antonyms: [],
    sampleSentenceEn: 'Since the economic indicators were unstable, the government postponed the reforms.',
    sampleSentenceTr: 'Ekonomik göstergeler istikrarsız olduğu için hükümet reformları erteledi.',
  },
  'as': {
    word: 'as',
    phonetic: '/æz/',
    primaryMeaning: '-dığı için, gibi, olarak, -dıkça',
    meanings: [
      { category: 'Sebep Bağlacı', type: 'bağlaç', turkish: 'çünkü, -dığı için, zira' },
      { category: 'Zaman / Benzetme', type: 'bağlaç', turkish: '-dığı gibi, -iken, olarak' },
    ],
    synonyms: ['because', 'since', 'while', 'like'],
    antonyms: [],
    sampleSentenceEn: 'As demand for renewable energy expands, fossil fuel investments decline.',
    sampleSentenceTr: 'Yenilenebilir enerjiye talep arttıkça/arttığı için fosil yakıt yatırımları azalıyor.',
  },
  'although': {
    word: 'although',
    phonetic: '/ɔːlˈðəʊ/',
    primaryMeaning: '-e rağmen, -se de, karşın',
    meanings: [
      { category: 'Zıtlık Bağlacı', type: 'bağlaç', turkish: '-e rağmen, -e karşın' },
      { category: 'Akademik', type: 'bağlaç', turkish: 'her ne kadar ... -se de, olsa da' },
    ],
    synonyms: ['even though', 'though', 'despite the fact that', 'in spite of the fact that'],
    antonyms: [],
    sampleSentenceEn: 'Although the initial budget was insufficient, the project was completed on schedule.',
    sampleSentenceTr: 'Başlangıç bütçesi yetersiz olmasına rağmen proje zamanında tamamlandı.',
  },
  'even though': {
    word: 'even though',
    phonetic: '/ˈiː.vən ðəʊ/',
    primaryMeaning: '-e rağmen, -se de',
    meanings: [
      { category: 'Zıtlık Bağlacı', type: 'bağlaç', turkish: '-e rağmen, -se de, karşın' },
    ],
    synonyms: ['although', 'though', 'despite the fact that'],
    antonyms: [],
    sampleSentenceEn: 'Even though negotiations stalled, both sides agreed to maintain diplomatic channels.',
    sampleSentenceTr: 'Müzakereler tıkanmasına rağmen iki taraf da diplomatik kanalları sürdürmeyi kabul etti.',
  },
  'despite': {
    word: 'despite',
    phonetic: '/dɪˈspaɪt/',
    primaryMeaning: '-e rağmen, -e karşın',
    meanings: [
      { category: 'Edat (Zıtlık)', type: 'edat', turkish: '-e rağmen, -e karşın, karşın' },
    ],
    synonyms: ['in spite of', 'notwithstanding', 'regardless of'],
    antonyms: [],
    sampleSentenceEn: 'Despite intense market volatility, the company preserved its revenue margins.',
    sampleSentenceTr: 'Yoğun piyasa dalgalanmasına rağmen şirket gelir marjlarını korudu.',
  },
  'however': {
    word: 'however',
    phonetic: '/haʊˈev.ər/',
    primaryMeaning: 'ancak, fakat, yine de, oysa',
    meanings: [
      { category: 'Geçiş Zıtlık', type: 'zarf', turkish: 'ancak, fakat, ama, yine de' },
      { category: 'Akademik', type: 'zarf', turkish: 'oysaki, lakin, bununla birlikte' },
    ],
    synonyms: ['nevertheless', 'nonetheless', 'yet', 'still'],
    antonyms: [],
    sampleSentenceEn: 'The hypothesis seemed plausible; however, empirical findings refuted the premise.',
    sampleSentenceTr: 'Hipotez makul görünüyordu; ancak deneysel bulgular bu önermeyi çürüttü.',
  },
  'therefore': {
    word: 'therefore',
    phonetic: '/ˈðeə.fɔːr/',
    primaryMeaning: 'bu yüzden, dolayısıyla, bu nedenle',
    meanings: [
      { category: 'Sonuç / Sebep', type: 'zarf', turkish: 'bu yüzden, bu nedenle, dolayısıyla' },
      { category: 'Akademik', type: 'zarf', turkish: 'sonuç olarak, bundan dolayı, böylece' },
    ],
    synonyms: ['thus', 'hence', 'consequently', 'as a result', 'accordingly'],
    antonyms: [],
    sampleSentenceEn: 'The data contained severe discrepancies; therefore, the analysis had to be rerun.',
    sampleSentenceTr: 'Veriler ciddi tutarsızlıklar içeriyordu; bu yüzden analizin yeniden yapılması gerekti.',
  },
  'moreover': {
    word: 'moreover',
    phonetic: '/mɔːˈrəʊ.vər/',
    primaryMeaning: 'dahası, ayrıca, üstelik, buna ek olarak',
    meanings: [
      { category: 'Ek Bilgi', type: 'zarf', turkish: 'ayrıca, dahası, üstelik' },
      { category: 'Akademik', type: 'zarf', turkish: 'buna ek olarak, dahası' },
    ],
    synonyms: ['furthermore', 'in addition', 'besides', 'what is more'],
    antonyms: [],
    sampleSentenceEn: 'The new policy reduced operational overhead; moreover, it boosted employee productivity.',
    sampleSentenceTr: 'Yeni politika operasyonel giderleri azalttı; dahası çalışan verimliliğini artırdı.',
  },
  'in order to': {
    word: 'in order to',
    phonetic: '/ɪn ˈɔː.dər tuː/',
    primaryMeaning: '-mek için, amacıyla',
    meanings: [
      { category: 'Amaç Bağlacı', type: 'bağlaç', turkish: '-mek için, -mak için, amacıyla' },
      { category: 'Akademik', type: 'bağlaç', turkish: '-sın diye, maksadıyla' },
    ],
    synonyms: ['so as to', 'to', 'so that'],
    antonyms: [],
    sampleSentenceEn: 'In order to mitigate cyber threats, companies are adopting multi-layered security.',
    sampleSentenceTr: 'Siber tehditleri hafifletmek için şirketler çok katmanlı güvenliği benimsiyor.',
  },
  'now': {
    word: 'now',
    phonetic: '/naʊ/',
    primaryMeaning: 'şimdi, artık, şu an',
    meanings: [
      { category: 'Zaman / Zarf', type: 'zarf', turkish: 'şimdi, şu anda, artık' },
      { category: 'Bağlaç', type: 'bağlaç', turkish: '-dığına göre, mademki' },
    ],
    synonyms: ['at present', 'currently', 'nowadays', 'now that'],
    antonyms: ['then'],
    sampleSentenceEn: 'Now that the research data is compiled, we can formulate our final conclusion.',
    sampleSentenceTr: 'Araştırma verileri derlendiğine göre (şimdi) nihai sonucumuzu formüle edebiliriz.',
  },
  'now (that)': {
    word: 'now (that)',
    phonetic: '/naʊ ðæt/',
    primaryMeaning: '-dığına göre, mademki, şimdi, artık',
    meanings: [
      { category: 'Sebep Bağlacı', type: 'bağlaç', turkish: '-dığına göre, mademki, madem' },
      { category: 'Zaman', type: 'zarf', turkish: 'şimdi, artık, şu an' },
    ],
    synonyms: ['since', 'as', 'seeing that', 'now'],
    antonyms: [],
    sampleSentenceEn: 'Now that digital transformation is ubiquitous, security is a paramount concern.',
    sampleSentenceTr: 'Artık / mademki dijital dönüşüm her yerde, güvenlik en önemli önceliktir.',
  },
  'now that': {
    word: 'now that',
    phonetic: '/naʊ ðæt/',
    primaryMeaning: '-dığına göre, mademki, şimdi, artık',
    meanings: [
      { category: 'Sebep Bağlacı', type: 'bağlaç', turkish: '-dığına göre, mademki, madem' },
      { category: 'Zaman', type: 'zarf', turkish: 'şimdi, artık, şu an' },
    ],
    synonyms: ['since', 'as', 'seeing that', 'now'],
    antonyms: [],
    sampleSentenceEn: 'Now that funding has been secured, the trial will commence immediately.',
    sampleSentenceTr: 'Fon güvence altına alındığına göre (şimdi/artık) deneme derhal başlayacak.',
  },
  'once': {
    word: 'once',
    phonetic: '/wʌns/',
    primaryMeaning: '-ınca, -ır -ımaz, bir kez, bir zamanlar',
    meanings: [
      { category: 'Zaman Bağlacı', type: 'bağlaç', turkish: '-ınca, -ince, -ır -ımaz, yapınca' },
      { category: 'Zarf', type: 'zarf', turkish: 'bir kez, bir kere, bir zamanlar' },
    ],
    synonyms: ['as soon as', 'the moment', 'one time'],
    antonyms: [],
    sampleSentenceEn: 'Once the algorithm is trained, it detects anomalies in real time.',
    sampleSentenceTr: 'Algoritma eğitilince / eğitilir eğitilmez anomalileri gerçek zamanlı tespit eder.',
  },
  'until / till': {
    word: 'until / till',
    phonetic: '/ənˈtɪl / tɪl/',
    primaryMeaning: '-e kadar, kadar',
    meanings: [
      { category: 'Zaman Bağlacı', type: 'bağlaç', turkish: '-e kadar, -a kadar, değin' },
    ],
    synonyms: ['up to the time that'],
    antonyms: [],
    sampleSentenceEn: 'The team worked continuously until the system reached stability.',
    sampleSentenceTr: 'Ekip, sistem kararlılığa ulaşana kadar kesintisiz çalıştı.',
  },
  'as if / as though': {
    word: 'as if / as though',
    phonetic: '/æz ɪf/',
    primaryMeaning: '-mış gibi, sanki',
    meanings: [
      { category: 'Benzetme Bağlacı', type: 'bağlaç', turkish: '-mış gibi, -miş gibi, sanki' },
    ],
    synonyms: ['as though', 'like'],
    antonyms: [],
    sampleSentenceEn: 'He analyzed the data as if he had personally supervised the experiment.',
    sampleSentenceTr: 'Verileri sanki deneyi bizzat kendisi yönetmiş gibi analiz etti.',
  },
  'when': {
    word: 'when',
    phonetic: '/wen/',
    primaryMeaning: '-dığında, -dığı zaman, ne zaman',
    meanings: [
      { category: 'Zaman Bağlacı', type: 'bağlaç', turkish: '-dığında, -diğinde, -dığı zaman' },
      { category: 'Soru / Zarf', type: 'zarf', turkish: 'ne zaman' },
    ],
    synonyms: ['at the time that', 'as soon as'],
    antonyms: [],
    sampleSentenceEn: 'When economic pressures mount, international cooperation becomes critical.',
    sampleSentenceTr: 'Ekonomik baskılar arttığında uluslararası iş birliği kritik hale gelir.',
  },
  'while': {
    word: 'while',
    phonetic: '/waɪl/',
    primaryMeaning: '-iken, -e karşın, oysa, süre',
    meanings: [
      { category: 'Zaman Bağlacı', type: 'bağlaç', turkish: '-iken, -dığı sırada' },
      { category: 'Zıtlık Bağlacı', type: 'bağlaç', turkish: '-e karşın, -e rağmen, oysa' },
      { category: 'İsim', type: 'isim', turkish: 'bir süre, zaman' },
    ],
    synonyms: ['whereas', 'whilst', 'during the time that'],
    antonyms: [],
    sampleSentenceEn: 'While solar efficiency rose, manufacturing costs plummeted.',
    sampleSentenceTr: 'Güneş enerjisi verimliliği artarken (öte yandan) üretim maliyetleri düştü.',
  },
  'unless': {
    word: 'unless',
    phonetic: '/ənˈles/',
    primaryMeaning: '-medikçe, -mezse, olmazsa',
    meanings: [
      { category: 'Koşul Bağlacı', type: 'bağlaç', turkish: '-medikçe, -madıkça, -mezse, -mazsa' },
    ],
    synonyms: ['if not', 'except if'],
    antonyms: ['provided that'],
    sampleSentenceEn: 'Unless strict environmental policies are enforced, carbon emissions will escalate.',
    sampleSentenceTr: 'Katı çevre politikaları uygulanmadıkça karbon emisyonları tırmanacaktır.',
  },
};

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
  "sampleSentenceEn": "A formal academic YDS example sentence using ${cleanWord}.",
  "sampleSentenceTr": "Bu cümlenin Türkçe akademik çevirisi."
}`;

      const aiData = await AIService.generateCustomJSON<TurengWordDetail>(prompt);

      if (aiData && aiData.primaryMeaning && aiData.meanings && aiData.meanings.length > 0) {
        TURENG_CACHE.set(cleanWord, aiData);
        return aiData;
      }
    } catch (err) {
      console.warn('Tureng live lookup fallback:', err);
    }

    // 3. Fallback item
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
