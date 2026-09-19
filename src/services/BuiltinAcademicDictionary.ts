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

// Rich built-in academic lookup for high-frequency connectors & YDS core vocabulary
export const BUILTIN_ACADEMIC_DICT: Record<string, TurengWordDetail> = {
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
  'environment': {
    word: 'environment',
    phonetic: '/ɪnˈvaɪ.rən.mənt/',
    primaryMeaning: 'çevre, ortam',
    meanings: [
      { category: 'Genel', type: 'isim', turkish: 'çevre, ortam, etraf' },
      { category: 'Akademik / Ekoloji', type: 'isim', turkish: 'doğal çevre, ekolojik ortam' },
    ],
    synonyms: ['surroundings', 'ecosystem', 'habitat', 'milieu'],
    antonyms: [],
    sampleSentenceEn: 'Industrial emissions and deforestation pose severe threats to the global environment.',
    sampleSentenceTr: 'Sanayi emisyonları ve ormansızlaşma, küresel çevre için ciddi tehditler oluşturmaktadır.',
  },
  'environmental': {
    word: 'environmental',
    phonetic: '/ɪnˌvaɪ.rənˈmen.təl/',
    primaryMeaning: 'çevresel, çevreye ait',
    meanings: [
      { category: 'Akademik', type: 'sıfat', turkish: 'çevresel, çevre ile ilgili' },
    ],
    synonyms: ['ecological'],
    antonyms: [],
    sampleSentenceEn: 'International treaties aim to mitigate the adverse impacts of environmental degradation.',
    sampleSentenceTr: 'Uluslararası anlaşmalar, çevresel bozulmanın olumsuz etkilerini hafifletmeyi amaçlamaktadır.',
  },
  'sustainable': {
    word: 'sustainable',
    phonetic: '/səˈsteɪ.nə.bəl/',
    primaryMeaning: 'sürdürülebilir, devam ettirilebilir',
    meanings: [
      { category: 'Akademik', type: 'sıfat', turkish: 'sürdürülebilir, dengeli' },
    ],
    synonyms: ['viable', 'maintainable', 'renewable'],
    antonyms: ['unsustainable'],
    sampleSentenceEn: 'Adopting sustainable agricultural practices is crucial for long-term food security.',
    sampleSentenceTr: 'Sürdürülebilir tarım uygulamalarını benimsemek, uzun vadeli gıda güvenliği için çok önemlidir.',
  },
  'accomplish': {
    word: 'accomplish',
    phonetic: '/əˈkʌm.plɪʃ/',
    primaryMeaning: 'başarmak, sonuçlandırmak',
    meanings: [
      { category: 'Genel / Akademik', type: 'fiil', turkish: 'başarmak, yerine getirmek, tamamlamak' },
    ],
    synonyms: ['achieve', 'fulfill', 'attain', 'execute'],
    antonyms: ['fail'],
    sampleSentenceEn: 'The international team accomplished their comprehensive climate assessment ahead of the deadline.',
    sampleSentenceTr: 'Uluslararası ekip kapsamlı iklim değerlendirmesini belirlenen süreden önce başarıyla tamamladı.',
  },
  'abandon': {
    word: 'abandon',
    phonetic: '/əˈbæn.dən/',
    primaryMeaning: 'terk etmek, vazgeçmek',
    meanings: [
      { category: 'Genel', type: 'fiil', turkish: 'terk etmek, bırakmak, vazgeçmek' },
    ],
    synonyms: ['desert', 'forsake', 'relinquish'],
    antonyms: ['retain', 'maintain'],
    sampleSentenceEn: 'Due to escalating geopolitical instability, the corporation decided to abandon the overseas venture.',
    sampleSentenceTr: 'Tırmanan jeopolitik istikrarsızlık nedeniyle şirket, denizaşırı girişimden vazgeçmeye karar verdi.',
  },
  'accurate': {
    word: 'accurate',
    phonetic: '/ˈæk.jə.rət/',
    primaryMeaning: 'doğru, kesin, hatasız',
    meanings: [
      { category: 'Akademik', type: 'sıfat', turkish: 'doğru, isabetli, kesin' },
    ],
    synonyms: ['precise', 'exact', 'flawless', 'correct'],
    antonyms: ['inaccurate', 'erroneous'],
    sampleSentenceEn: 'Accurate data collection is indispensable for drawing valid empirical conclusions.',
    sampleSentenceTr: 'Doğru veri toplama, geçerli ampirik sonuçlara ulaşmak için vazgeçilmezdir.',
  },
  'acquire': {
    word: 'acquire',
    phonetic: '/əˈkwaɪər/',
    primaryMeaning: 'edinmek, elde etmek, kazanmak',
    meanings: [
      { category: 'Akademik', type: 'fiil', turkish: 'edinmek, elde etmek, kazanmak' },
    ],
    synonyms: ['obtain', 'gain', 'attain', 'procure'],
    antonyms: ['lose'],
    sampleSentenceEn: 'Early childhood is the critical period during which humans acquire complex linguistic abilities.',
    sampleSentenceTr: 'Erken çocukluk, insanların karmaşık dil yeteneklerini edindikleri kritik dönemdir.',
  },
  'approach': {
    word: 'approach',
    phonetic: '/əˈprəʊtʃ/',
    primaryMeaning: 'yaklaşım, yaklaşmak',
    meanings: [
      { category: 'Akademik', type: 'isim', turkish: 'yaklaşım, metodoloji' },
      { category: 'Genel', type: 'fiil', turkish: 'yaklaşmak' },
    ],
    synonyms: ['methodology', 'perspective', 'strategy'],
    antonyms: [],
    sampleSentenceEn: 'Researchers adopted an interdisciplinary approach to resolve the long-standing ecological crisis.',
    sampleSentenceTr: 'Araştırmacılar, süregelen ekolojik krizi çözmek için disiplinlerarası bir yaklaşım benimsediler.',
  },
  'concept': {
    word: 'concept',
    phonetic: '/ˈkɒn.sept/',
    primaryMeaning: 'kavram, fikir',
    meanings: [
      { category: 'Akademik', type: 'isim', turkish: 'kavram, kuramsal fikir' },
    ],
    synonyms: ['notion', 'idea', 'theory', 'principle'],
    antonyms: [],
    sampleSentenceEn: 'The fundamental concept of sustainable economics challenges traditional industrial models.',
    sampleSentenceTr: 'Sürdürülebilir ekonominin temel kavramı, geleneksel sanayi modellerine meydan okumaktadır.',
  },
  'consequence': {
    word: 'consequence',
    phonetic: '/ˈkɒn.sɪ.kwəns/',
    primaryMeaning: 'sonuç, netice',
    meanings: [
      { category: 'Akademik', type: 'isim', turkish: 'sonuç, getiri, netice' },
    ],
    synonyms: ['outcome', 'repercussion', 'result'],
    antonyms: ['cause'],
    sampleSentenceEn: 'Rising sea levels are a direct consequence of accelerated global warming.',
    sampleSentenceTr: 'Yükselen deniz seviyeleri, hızlanan küresel ısınmanın doğrudan bir sonucudur.',
  },
  'establish': {
    word: 'establish',
    phonetic: '/ɪˈstæb.lɪʃ/',
    primaryMeaning: 'kurmak, kanıtlamak, tesis etmek',
    meanings: [
      { category: 'Akademik', type: 'fiil', turkish: 'ortaya koymak, kurmak, saptamak' },
    ],
    synonyms: ['found', 'institute', 'prove', 'demonstrate'],
    antonyms: ['abolish', 'dismantle'],
    sampleSentenceEn: 'Recent clinical trials established a clear link between poor sleep quality and cognitive decline.',
    sampleSentenceTr: 'Son klinik deneyler, zayıf uyku kalitesi ile bilişsel gerileme arasında açık bir bağlantı ortaya koydu.',
  },
  'indicate': {
    word: 'indicate',
    phonetic: '/ˈɪn.dɪ.keɪt/',
    primaryMeaning: 'göstermek, işaret etmek, belirtmek',
    meanings: [
      { category: 'Akademik', type: 'fiil', turkish: 'göstermek, işaret etmek, belirtmek' },
    ],
    synonyms: ['demonstrate', 'signify', 'denote', 'reveal'],
    antonyms: [],
    sampleSentenceEn: 'Preliminary survey results indicate a significant shift in consumer preferences toward green energy.',
    sampleSentenceTr: 'Ön anket sonuçları, tüketici tercihlerinde yeşil enerjiye doğru belirgin bir kaymaya işaret ediyor.',
  },
  'significant': {
    word: 'significant',
    phonetic: '/sɪɡˈnɪf.ɪ.kənt/',
    primaryMeaning: 'önemli, anlamlı, belirgin',
    meanings: [
      { category: 'Akademik', type: 'sıfat', turkish: 'kayda değer, önemli, belirgin' },
    ],
    synonyms: ['substantial', 'considerable', 'notable', 'momentous'],
    antonyms: ['insignificant', 'trivial'],
    sampleSentenceEn: 'There has been a significant increase in international student mobility over the past decade.',
    sampleSentenceTr: 'Son on yılda uluslararası öğrenci hareketliliğinde kayda değer bir artış gerçekleşti.',
  },
  'phenomenon': {
    word: 'phenomenon',
    phonetic: '/fəˈnɒm.ɪ.nən/',
    primaryMeaning: 'olgu, fenomen, doğa olayı',
    meanings: [
      { category: 'Akademik', type: 'isim', turkish: 'olgu, olay, fenomen' },
    ],
    synonyms: ['occurrence', 'event', 'marvel'],
    antonyms: [],
    sampleSentenceEn: 'Bioluminescence is a fascinating natural phenomenon observed predominantly in marine life.',
    sampleSentenceTr: 'Biyolüminesans, ağırlıklı olarak deniz canlılarında gözlemlenen büyüleyici bir doğa olgusudur.',
  },
};


/**
 * Fast synchronous check for built-in high-quality academic example sentences.
 */
export function getBuiltinAcademicSentence(
  word: string
): { sampleSentenceEn?: string; sampleSentenceTr?: string } | null {
  const cleanWord = (word || '').trim().toLowerCase();
  const item = BUILTIN_ACADEMIC_DICT[cleanWord];
  if (item && item.sampleSentenceEn) {
    return {
      sampleSentenceEn: item.sampleSentenceEn,
      sampleSentenceTr: item.sampleSentenceTr,
    };
  }
  return null;
}
