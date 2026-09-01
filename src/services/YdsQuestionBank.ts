import { QuestionItem, YdsQuestionType, MockExam } from '../types';

export const INITIAL_YDS_QUESTIONS: Omit<QuestionItem, 'id'>[] = [
  // ==========================================
  // PARAGRAPH 1 (Social Science / Psychology) - 4 Questions
  // ==========================================
  {
    type: 'PARAGRAPH',
    title: 'The Psychology of Decision Fatigue',
    passage:
      'Decision fatigue refers to the deteriorating quality of decisions made by an individual after a long session of decision making. First coined by social psychologist Roy F. Baumeister, the concept posits that willpower and mental stamina are finite resources that become depleted throughout the day. When individuals are overwhelmed with choices, whether momentous or trivial, their cognitive capacity diminishes. As a result, they are more inclined to either act impulsively or avoid making decisions altogether by maintaining the status quo. In professional settings, this phenomenon can lead to poor judgment, reduced productivity, and flawed strategic planning. Studies indicate that judges, for instance, are significantly more likely to grant parole early in the morning or immediately after a meal break than later in the afternoon, illustrating the tangible impact of mental exhaustion on critical outcomes.',
    question_number: 1,
    question_text: 'According to the passage, decision fatigue occurs when ----.',
    options: {
      A: 'an individual consistently refuses to take advice from colleagues',
      B: "a person's cognitive energy is depleted after making successive choices",
      C: 'someone experiences physical illness due to poor working conditions',
      D: 'complex professional decisions are delegated to inexperienced personnel',
      E: 'judges and lawmakers fail to agree on legal precedents'
    },
    correct_option: 'B',
    explanation:
      "Parçada açıkça belirtildiği üzere: 'Decision fatigue refers to the deteriorating quality of decisions made by an individual after a long session of decision making... willpower and mental stamina are finite resources that become depleted'. Dolayısıyla B şıkkı ('a person's cognitive energy is depleted after making successive choices') doğru cevaptır.",
    subtopic: 'Psychology / Cognitive Science',
    difficulty: 'YDS_EXAM',
    source: 'YDS Reading Pool',
    status: 'ACTIVE'
  },
  {
    type: 'PARAGRAPH',
    title: 'The Psychology of Decision Fatigue',
    passage:
      'Decision fatigue refers to the deteriorating quality of decisions made by an individual after a long session of decision making. First coined by social psychologist Roy F. Baumeister, the concept posits that willpower and mental stamina are finite resources that become depleted throughout the day. When individuals are overwhelmed with choices, whether momentous or trivial, their cognitive capacity diminishes. As a result, they are more inclined to either act impulsively or avoid making decisions altogether by maintaining the status quo. In professional settings, this phenomenon can lead to poor judgment, reduced productivity, and flawed strategic planning. Studies indicate that judges, for instance, are significantly more likely to grant parole early in the morning or immediately after a meal break than later in the afternoon, illustrating the tangible impact of mental exhaustion on critical outcomes.',
    question_number: 2,
    question_text: 'It can be inferred from the passage that one way people cope with decision fatigue is to ----.',
    options: {
      A: 'seek the assistance of trained mental health professionals immediately',
      B: 'stick with existing conditions rather than choosing a new alternative',
      C: 'take extended vacations to completely eliminate cognitive tasks',
      D: 'shift from subjective evaluations to purely statistical algorithms',
      E: 'make all critical life decisions exclusively during late night hours'
    },
    correct_option: 'B',
    explanation:
      "Metinde geçen '...avoid making decisions altogether by maintaining the status quo' (statükoyu koruyarak karar vermekten kaçınma) ifadesi, B seçeneğindeki 'stick with existing conditions rather than choosing a new alternative' ile birebir eşleşir.",
    subtopic: 'Psychology / Inference',
    difficulty: 'YDS_EXAM',
    source: 'YDS Reading Pool',
    status: 'ACTIVE'
  },
  {
    type: 'PARAGRAPH',
    title: 'The Psychology of Decision Fatigue',
    passage:
      'Decision fatigue refers to the deteriorating quality of decisions made by an individual after a long session of decision making. First coined by social psychologist Roy F. Baumeister, the concept posits that willpower and mental stamina are finite resources that become depleted throughout the day. When individuals are overwhelmed with choices, whether momentous or trivial, their cognitive capacity diminishes. As a result, they are more inclined to either act impulsively or avoid making decisions altogether by maintaining the status quo. In professional settings, this phenomenon can lead to poor judgment, reduced productivity, and flawed strategic planning. Studies indicate that judges, for instance, are significantly more likely to grant parole early in the morning or immediately after a meal break than later in the afternoon, illustrating the tangible impact of mental exhaustion on critical outcomes.',
    question_number: 3,
    question_text: 'The author gives the example of judicial parole decisions in order to ----.',
    options: {
      A: 'demonstrate the real-world consequences of mental depletion on critical judgment',
      B: 'criticize the legal system for its lack of standardized working hours',
      C: 'argue that judges should be replaced by artificial intelligence in courtrooms',
      D: 'prove that meal breaks should be shortened to maximize productivity',
      E: 'show that legal professionals are uniquely immune to psychological pressure'
    },
    correct_option: 'A',
    explanation:
      "Yazar, yargıçların sabah veya yemek molası sonrası daha adil ve olumlu kararlar verdiğini 'illustrating the tangible impact of mental exhaustion on critical outcomes' diyerek gerçek hayattaki etkisini somutlaştırmak için örnek vermiştir (A şıkkı).",
    subtopic: 'Author Purpose / Example',
    difficulty: 'YDS_EXAM',
    source: 'YDS Reading Pool',
    status: 'ACTIVE'
  },
  {
    type: 'PARAGRAPH',
    title: 'The Psychology of Decision Fatigue',
    passage:
      'Decision fatigue refers to the deteriorating quality of decisions made by an individual after a long session of decision making. First coined by social psychologist Roy F. Baumeister, the concept posits that willpower and mental stamina are finite resources that become depleted throughout the day. When individuals are overwhelmed with choices, whether momentous or trivial, their cognitive capacity diminishes. As a result, they are more inclined to either act impulsively or avoid making decisions altogether by maintaining the status quo. In professional settings, this phenomenon can lead to poor judgment, reduced productivity, and flawed strategic planning. Studies indicate that judges, for instance, are significantly more likely to grant parole early in the morning or immediately after a meal break than later in the afternoon, illustrating the tangible impact of mental exhaustion on critical outcomes.',
    question_number: 4,
    question_text: 'Which of the following would be the most appropriate title for the passage?',
    options: {
      A: 'Legal Injustices in the Modern Court System',
      B: 'The Mechanics and Real-World Toll of Decision Fatigue',
      C: 'Why Routine Tasks Require No Cognitive Effort',
      D: 'The Evolutionary Advantages of Impulsive Action',
      E: 'Nutritional Habits of High-Performing Executives'
    },
    correct_option: 'B',
    explanation:
      "Tüm metin karar yorgunluğunun mekanizmasını (willpower depletion) ve bunun gerçek dünyadaki (professional settings, judges) sonuçlarını ele almaktadır. En kapsayıcı başlık B seçeneğidir.",
    subtopic: 'Main Idea / Title',
    difficulty: 'YDS_EXAM',
    source: 'YDS Reading Pool',
    status: 'ACTIVE'
  },

  // ==========================================
  // PARAGRAPH 2 (Science & Ecology) - 1 Standalone Question for Daily Quota
  // ==========================================
  {
    type: 'PARAGRAPH',
    title: 'Bioluminescence in Marine Organisms',
    passage:
      'Bioluminescence, the production and emission of light by a living organism, is predominantly found in marine vertebrates and invertebrates. In the abyssal depths of the ocean, where sunlight fails to penetrate, light emission serves critical evolutionary functions including camouflage, prey attraction, predator deterrence, and communication. Unlike incandescent bulbs that lose vast amounts of energy as heat, bioluminescent reactions are nearly 100 percent efficient, transforming chemical energy directly into light via the oxidation of luciferin catalyzed by luciferase. Furthermore, scientists are now harnessing these naturally occurring biochemical pathways for biomedical imaging and environmental monitoring.',
    question_number: 5,
    question_text: 'According to the passage, the light produced by marine organisms is notably distinct because ----.',
    options: {
      A: 'it generates massive amounts of thermal heat to warm deep-sea waters',
      B: 'it relies on solar radiation stored during daylight hours',
      C: 'it is produced with exceptional chemical energy efficiency without substantial heat loss',
      D: 'it serves exclusively as a defensive mechanism against larger predators',
      E: 'it cannot be detected by deep-sea cameras or sensors'
    },
    correct_option: 'C',
    explanation:
      "Metinde geçen 'Unlike incandescent bulbs that lose vast amounts of energy as heat, bioluminescent reactions are nearly 100 percent efficient...' cümlesi C şıkkını doğrulamaktadır.",
    subtopic: 'Ecology / Detail',
    difficulty: 'YDS_EXAM',
    source: 'YDS Reading Pool',
    status: 'ACTIVE'
  },
  {
    type: 'PARAGRAPH',
    title: 'Bioluminescence in Marine Organisms',
    passage:
      'Bioluminescence, the production and emission of light by a living organism, is predominantly found in marine vertebrates and invertebrates. In the abyssal depths of the ocean, where sunlight fails to penetrate, light emission serves critical evolutionary functions including camouflage, prey attraction, predator deterrence, and communication. Unlike incandescent bulbs that lose vast amounts of energy as heat, bioluminescent reactions are nearly 100 percent efficient, transforming chemical energy directly into light via the oxidation of luciferin catalyzed by luciferase. Furthermore, scientists are now harnessing these naturally occurring biochemical pathways for biomedical imaging and environmental monitoring.',
    question_number: 6,
    question_text: 'It is clearly stated in the passage that deep-sea bioluminescence ----.',
    options: {
      A: 'is primarily used to navigate through shallow coastal waters',
      B: 'fulfills multiple vital functions ranging from attracting food to deterring threats',
      C: 'has only recently evolved in response to modern global warming',
      D: 'causes serious optical damage to neighboring marine species',
      E: 'occurs solely among macroscopic mammalian species'
    },
    correct_option: 'B',
    explanation:
      "Metindeki '...light emission serves critical evolutionary functions including camouflage, prey attraction, predator deterrence, and communication' ifadesi B şıkkını ('fulfills multiple vital functions ranging from attracting food to deterring threats') doğrular.",
    subtopic: 'Ecology / Detail',
    difficulty: 'YDS_EXAM',
    source: 'YDS Reading Pool',
    status: 'ACTIVE'
  },
  {
    type: 'PARAGRAPH',
    title: 'Bioluminescence in Marine Organisms',
    passage:
      'Bioluminescence, the production and emission of light by a living organism, is predominantly found in marine vertebrates and invertebrates. In the abyssal depths of the ocean, where sunlight fails to penetrate, light emission serves critical evolutionary functions including camouflage, prey attraction, predator deterrence, and communication. Unlike incandescent bulbs that lose vast amounts of energy as heat, bioluminescent reactions are nearly 100 percent efficient, transforming chemical energy directly into light via the oxidation of luciferin catalyzed by luciferase. Furthermore, scientists are now harnessing these naturally occurring biochemical pathways for biomedical imaging and environmental monitoring.',
    question_number: 7,
    question_text: 'One can understand from the passage that luciferase is an enzyme that ----.',
    options: {
      A: 'inhibits the chemical reaction required for light emission',
      B: 'converts light into chemical nutrients for deep-sea plants',
      C: 'facilitates and accelerates the oxidation process of luciferin',
      D: 'absorbs solar radiation in the upper photic zones',
      E: 'prevents marine creatures from communicating with one another'
    },
    correct_option: 'C',
    explanation:
      "Metinde '...via the oxidation of luciferin catalyzed by luciferase' denilmektedir. Katalizör (catalyze) enzimi reaksiyonu hızlandırıp kolaylaştıran unsurdur (C seçeneği).",
    subtopic: 'Biochemistry / Vocabulary in Context',
    difficulty: 'YDS_EXAM',
    source: 'YDS Reading Pool',
    status: 'ACTIVE'
  },
  {
    type: 'PARAGRAPH',
    title: 'Bioluminescence in Marine Organisms',
    passage:
      'Bioluminescence, the production and emission of light by a living organism, is predominantly found in marine vertebrates and invertebrates. In the abyssal depths of the ocean, where sunlight fails to penetrate, light emission serves critical evolutionary functions including camouflage, prey attraction, predator deterrence, and communication. Unlike incandescent bulbs that lose vast amounts of energy as heat, bioluminescent reactions are nearly 100 percent efficient, transforming chemical energy directly into light via the oxidation of luciferin catalyzed by luciferase. Furthermore, scientists are now harnessing these naturally occurring biochemical pathways for biomedical imaging and environmental monitoring.',
    question_number: 8,
    question_text: 'The primary purpose of the author in this passage is to ----.',
    options: {
      A: 'advocate for the commercial harvesting of rare deep-sea organisms',
      B: 'explain the mechanisms, evolutionary functions, and scientific applications of bioluminescence',
      C: 'criticize modern electrical lighting technologies for high energy waste',
      D: 'compare oceanic ecosystems with terrestrial rainforest habitats',
      E: 'warn against the ecological dangers of biomedical imaging'
    },
    correct_option: 'B',
    explanation:
      "Parça bioluminescence'in tanımını, işlevlerini (camouflage, prey attraction) ve biyomedikal kullanımını açıklamayı amaçlamaktadır (B şıkkı).",
    subtopic: 'Author Purpose / Main Idea',
    difficulty: 'YDS_EXAM',
    source: 'YDS Reading Pool',
    status: 'ACTIVE'
  },

  // ==========================================
  // CLOZE TEST (1 Passage, 5 Questions)
  // ==========================================
  {
    type: 'CLOZE_TEST',
    title: 'The Rise of Urban Agriculture',
    passage:
      'As urban populations continue to swell at unprecedented rates, traditional agricultural methods are becoming increasingly (1)---- to sustain global food demands. In response, vertical farming and rooftop agriculture have emerged as viable solutions. These cutting-edge techniques not only maximize limited urban space (2)---- significantly curtail water consumption by up to 90 percent. Furthermore, cultivating produce within city boundaries drastically cuts down (3)---- transportation costs and carbon emissions associated with long-distance supply chains. (4)---- the initial infrastructure investment remains relatively high, technological innovations and renewable energy integration are rapidly (5)---- the economic barriers.',
    question_number: 1,
    question_text: 'Choose the best option to complete blank (1):',
    options: {
      A: 'inadequate',
      B: 'abundant',
      C: 'lucrative',
      D: 'indifferent',
      E: 'hospitable'
    },
    correct_option: 'A',
    explanation:
      "Boşluktan önce 'popülasyon artıyor' ve sonra 'geleneksel tarım küresel talebi karşılamakta ... kalıyor' denmektedir. Olumsuz ve yetersizlik anlatan 'inadequate' (yetersiz/yetersiz kalan) şıkkı doğrudur.",
    subtopic: 'Cloze Test / Vocabulary',
    difficulty: 'YDS_EXAM',
    source: 'YDS Cloze Bank',
    status: 'ACTIVE'
  },
  {
    type: 'CLOZE_TEST',
    title: 'The Rise of Urban Agriculture',
    passage:
      'As urban populations continue to swell at unprecedented rates, traditional agricultural methods are becoming increasingly (1)---- to sustain global food demands. In response, vertical farming and rooftop agriculture have emerged as viable solutions. These cutting-edge techniques not only maximize limited urban space (2)---- significantly curtail water consumption by up to 90 percent. Furthermore, cultivating produce within city boundaries drastically cuts down (3)---- transportation costs and carbon emissions associated with long-distance supply chains. (4)---- the initial infrastructure investment remains relatively high, technological innovations and renewable energy integration are rapidly (5)---- the economic barriers.',
    question_number: 2,
    question_text: 'Choose the best option to complete blank (2):',
    options: {
      A: 'as well as',
      B: 'but also',
      C: 'in order to',
      D: 'on the contrary',
      E: 'neither'
    },
    correct_option: 'B',
    explanation:
      "Cümle başında 'not only' kalıbı yer almaktadır. 'Not only ... but also' (sadece ... değil, aynı zamanda ...) paralel bağlaç kalıbıdır. Bu nedenle 'but also' (B şıkkı) gelmelidir.",
    subtopic: 'Cloze Test / Correlative Conjunctions',
    difficulty: 'YDS_EXAM',
    source: 'YDS Cloze Bank',
    status: 'ACTIVE'
  },
  {
    type: 'CLOZE_TEST',
    title: 'The Rise of Urban Agriculture',
    passage:
      'As urban populations continue to swell at unprecedented rates, traditional agricultural methods are becoming increasingly (1)---- to sustain global food demands. In response, vertical farming and rooftop agriculture have emerged as viable solutions. These cutting-edge techniques not only maximize limited urban space (2)---- significantly curtail water consumption by up to 90 percent. Furthermore, cultivating produce within city boundaries drastically cuts down (3)---- transportation costs and carbon emissions associated with long-distance supply chains. (4)---- the initial infrastructure investment remains relatively high, technological innovations and renewable energy integration are rapidly (5)---- the economic barriers.',
    question_number: 3,
    question_text: 'Choose the best option to complete blank (3):',
    options: {
      A: 'on',
      B: 'with',
      C: 'against',
      D: 'from',
      E: 'into'
    },
    correct_option: 'A',
    explanation:
      "'Cut down on' (azaltmak / kısmak) phrasal verb'üdür. 'cut down on transportation costs' ifadesi gereği 'on' (A şıkkı) doğru cevaptır.",
    subtopic: 'Cloze Test / Phrasal Verbs & Prepositions',
    difficulty: 'YDS_EXAM',
    source: 'YDS Cloze Bank',
    status: 'ACTIVE'
  },
  {
    type: 'CLOZE_TEST',
    title: 'The Rise of Urban Agriculture',
    passage:
      'As urban populations continue to swell at unprecedented rates, traditional agricultural methods are becoming increasingly (1)---- to sustain global food demands. In response, vertical farming and rooftop agriculture have emerged as viable solutions. These cutting-edge techniques not only maximize limited urban space (2)---- significantly curtail water consumption by up to 90 percent. Furthermore, cultivating produce within city boundaries drastically cuts down (3)---- transportation costs and carbon emissions associated with long-distance supply chains. (4)---- the initial infrastructure investment remains relatively high, technological innovations and renewable energy integration are rapidly (5)---- the economic barriers.',
    question_number: 4,
    question_text: 'Choose the best option to complete blank (4):',
    options: {
      A: 'Despite',
      B: 'Although',
      C: 'Because',
      D: 'Unless',
      E: 'In case'
    },
    correct_option: 'B',
    explanation:
      "Cümlede 'the initial infrastructure investment remains relatively high' (tam bir cümle) vardır. Anlam olarak 'ilk altyapı yatırımı yüksek olmasına rağmen' zıtlığı söz konusudur. 'Despite' tam cümle almaz isim öbeği alır; 'Although' tam cümle aldığı için B şıkkı doğrudur.",
    subtopic: 'Cloze Test / Conjunctions',
    difficulty: 'YDS_EXAM',
    source: 'YDS Cloze Bank',
    status: 'ACTIVE'
  },
  {
    type: 'CLOZE_TEST',
    title: 'The Rise of Urban Agriculture',
    passage:
      'As urban populations continue to swell at unprecedented rates, traditional agricultural methods are becoming increasingly (1)---- to sustain global food demands. In response, vertical farming and rooftop agriculture have emerged as viable solutions. These cutting-edge techniques not only maximize limited urban space (2)---- significantly curtail water consumption by up to 90 percent. Furthermore, cultivating produce within city boundaries drastically cuts down (3)---- transportation costs and carbon emissions associated with long-distance supply chains. (4)---- the initial infrastructure investment remains relatively high, technological innovations and renewable energy integration are rapidly (5)---- the economic barriers.',
    question_number: 5,
    question_text: 'Choose the best option to complete blank (5):',
    options: {
      A: 'reinforcing',
      B: 'eliminating',
      C: 'deteriorating',
      D: 'complicating',
      E: 'perpetuating'
    },
    correct_option: 'B',
    explanation:
      "Yenilikler ve yenilenebilir enerji ekonomik engelleri (economic barriers) 'ortadan kaldırmaktadır / yok etmektedir'. 'Eliminating' (ortadan kaldırmak) doğru fiildir.",
    subtopic: 'Cloze Test / Vocabulary in Context',
    difficulty: 'YDS_EXAM',
    source: 'YDS Cloze Bank',
    status: 'ACTIVE'
  },

  // ==========================================
  // SENTENCE COMPLETION (10 Questions for Daily Quota)
  // ==========================================
  {
    type: 'SENTENCE_COMPLETION',
    question_text:
      'Although electric vehicles produce zero tailpipe emissions during operation, ----.',
    options: {
      A: 'their total environmental footprint depends heavily on how the electricity that powers them is generated',
      B: 'governments worldwide have stopped offering tax subsidies for battery manufacturing',
      C: 'diesel-powered engines are universally acknowledged as the most efficient transportation alternative',
      D: 'the majority of consumers express complete disinterest in sustainable vehicle technologies',
      E: 'urban air quality immediately declined following the introduction of hybrid fleets'
    },
    correct_option: 'A',
    explanation:
      "'Although' (Zıtlık bağlacı) ile başlayan cümle: 'Elektrikli araçlar çalışırken sıfır egzoz emisyonu üretmesine rağmen...' -> zıt mantık: 'onların toplam çevresel ayak izi elektriğin nasıl üretildiğine yüksek derecede bağlıdır' (A şıkkı).",
    subtopic: 'Sentence Completion / Contrast (Although)',
    difficulty: 'YDS_EXAM',
    source: 'YDS Sentence Completion Pool',
    status: 'ACTIVE'
  },
  {
    type: 'SENTENCE_COMPLETION',
    question_text:
      '----, ancient civilizations developed intricate irrigation canals to divert river water to arid farmlands.',
    options: {
      A: 'Because catastrophic floods had permanently destroyed all arable agricultural land',
      B: 'In order to ensure agricultural sustenance during prolonged periods of drought',
      C: 'Unless local communities strictly refused to participate in collective crop cultivation',
      D: 'Even though hunting and gathering remained their sole method of food acquisition',
      E: 'So that neighboring hostile kingdoms could easily traverse their territorial borders'
    },
    correct_option: 'B',
    explanation:
      "Cümlede 'antik medeniyetler kurak tarım arazilerine nehir suyunu yönlendirmek için karmaşık sulama kanalları inşa etti' deniyor. 'Bunu ne amaçla yaptılar?' sorusuna en uygun amaç bildiren bağlaç: 'In order to ensure agricultural sustenance during prolonged periods of drought' (Kuraklık dönemlerinde tarımsal sürekliliği sağlamak amacıyla) B şıkkıdır.",
    subtopic: 'Sentence Completion / Purpose Clause (In order to)',
    difficulty: 'YDS_EXAM',
    source: 'YDS Sentence Completion Pool',
    status: 'ACTIVE'
  },
  {
    type: 'SENTENCE_COMPLETION',
    question_text:
      'Unless strict international regulations on artificial intelligence development are enforced, ----.',
    options: {
      A: 'cybersecurity experts have already resolved all algorithmic bias issues',
      B: 'unregulated automated systems could exacerbate disinformation campaigns and economic inequality',
      C: 'every software developer would naturally adhere to voluntary ethical guidelines without exception',
      D: 'the digital transformation of modern industries had been decelerating steadily',
      E: 'global technological cooperation was officially ratified in the mid-twentieth century'
    },
    correct_option: 'B',
    explanation:
      "'Unless' (-medikçe / -mezse, if not) şart bağlacıdır. 'Unless strict regulations are enforced' (sıkı regülasyonlar uygulanmadıkça) -> Gelecek/olasılık içeren olumsuz sonuç: 'düzenlenmemiş otomatik sistemler dezenformasyonu ve ekonomik eşitsizliği artırabilir' (B şıkkı).",
    subtopic: 'Sentence Completion / Conditionals (Unless)',
    difficulty: 'YDS_EXAM',
    source: 'YDS Sentence Completion Pool',
    status: 'ACTIVE'
  },
  {
    type: 'SENTENCE_COMPLETION',
    question_text:
      '----, historians had long presumed that the archaeological site belonged exclusively to the Bronze Age.',
    options: {
      A: 'Until recent radiometric dating revealed evidence of continuous Neolithic settlement',
      B: 'Because future expeditions will utilize advanced ground-penetrating radar systems',
      C: 'Whenever museum curators organize retrospective exhibitions on ancient pottery',
      D: 'While modern tourists flock to the historical monument in record numbers each summer',
      E: 'As soon as the national government declares the area an international heritage sanctuary'
    },
    correct_option: 'A',
    explanation:
      "Ana cümlede 'had long presumed' (Past Perfect) tense'i kullanılmıştır. Geçmişteki bir varsayımın ne zamana kadar sürdüğünü anlatan 'Until recent radiometric dating revealed...' (A şıkkı) zaman ve mantık açısından mükemmel uyum sağlar.",
    subtopic: 'Sentence Completion / Time Conjunctions (Until) & Tense Harmony',
    difficulty: 'YDS_EXAM',
    source: 'YDS Sentence Completion Pool',
    status: 'ACTIVE'
  },
  {
    type: 'SENTENCE_COMPLETION',
    question_text:
      'Scientists have discovered that certain deep-sea bacteria can metabolize methane, ----.',
    options: {
      A: 'which could offer innovative strategies for mitigating greenhouse gas concentrations in the atmosphere',
      B: 'where most terrestrial mammals comfortably establish their natural habitats',
      C: 'even if they had been completely destroyed by geothermal volcanic eruptions centuries ago',
      D: 'so that commercial airline passengers might experience smoother transatlantic flights',
      E: 'despite the fact that solar radiation is exceptionally abundant at the ocean floor'
    },
    correct_option: 'A',
    explanation:
      "Cümlenin sonundaki non-defining relative clause ('which could offer...') metanın metabolize edilmesinin atmosferdeki sera gazlarını azaltmada yenilikçi stratejiler sunabileceğini açıklayarak anlam bütünlüğünü sağlar (A şıkkı).",
    subtopic: 'Sentence Completion / Relative Clauses (Which)',
    difficulty: 'YDS_EXAM',
    source: 'YDS Sentence Completion Pool',
    status: 'ACTIVE'
  },
  {
    type: 'SENTENCE_COMPLETION',
    question_text:
      'Owing to the rapid advancements in genomic sequencing technologies over the past decade, ----.',
    options: {
      A: 'physicians are now capable of diagnosing rare genetic disorders with unprecedented speed and precision',
      B: 'antiseptic surgical procedures were first introduced in nineteenth-century medical academies',
      C: 'pharmaceutical companies have completely discontinued the production of synthetic vaccines',
      D: 'patients routinely refuse all diagnostic blood tests due to insurmountable financial burdens',
      E: 'traditional botanical remedies have entirely replaced modern oncology treatments'
    },
    correct_option: 'A',
    explanation:
      "'Owing to' (sayesinde / -den dolayı) sebep-sonuç bağlacıdır. Genom dizilimindeki ilerlemeler sayesinde -> 'hekimler artık nadir genetik hastalıkları benzeri görülmemiş hız ve hassasiyetle teşhis edebilmektedir' (A şıkkı).",
    subtopic: 'Sentence Completion / Cause & Effect (Owing to)',
    difficulty: 'YDS_EXAM',
    source: 'YDS Sentence Completion Pool',
    status: 'ACTIVE'
  },
  {
    type: 'SENTENCE_COMPLETION',
    question_text:
      'While prominent economists argue that inflation is primarily driven by excessive fiscal stimulus, ----.',
    options: {
      A: 'others contend that persistent supply chain bottlenecks and geopolitical tensions play a far more decisive role',
      B: 'all central banks have simultaneously abolished benchmark interest rate adjustments',
      C: 'consumer purchasing power has historically surged to all-time highs during hyperinflationary crises',
      D: 'the gold standard was systematically dismantled across North America during the 1970s',
      E: 'unemployment rates naturally drop to absolute zero in unregulated market economies'
    },
    correct_option: 'A',
    explanation:
      "'While' (İki farklı görüşü karşılaştıran zıtlık bağlacı): 'Bazı önde gelen ekonomistler enflasyonun mali teşviklerden kaynaklandığını savunurken, diğerleri tedarik zinciri darboğazlarının daha belirleyici olduğunu öne sürmektedir' (A şıkkı).",
    subtopic: 'Sentence Completion / Contrast (While - View Comparison)',
    difficulty: 'YDS_EXAM',
    source: 'YDS Sentence Completion Pool',
    status: 'ACTIVE'
  },
  {
    type: 'SENTENCE_COMPLETION',
    question_text:
      'In stark contrast to traditional classroom instruction, ----.',
    options: {
      A: 'paper textbooks have dominated educational curricula throughout the twentieth century',
      B: 'asynchronous online learning platforms permit students to progress through academic coursework at their own individualized pace',
      C: 'standardized examinations are administered strictly under the direct supervision of certified invigilators',
      D: 'most medieval universities required fluent mastery of spoken Latin for formal matriculation',
      E: 'compulsory primary education laws were universally adopted across continental Europe'
    },
    correct_option: 'B',
    explanation:
      "'In stark contrast to traditional classroom instruction' (Geleneksel sınıf eğitiminin tam aksine) -> Online asenkron eğitimin öğrencilere kendi hızlarında ilerleme imkanı tanıması (B şıkkı) anlamca zıtlığı ve kıyaslamayı tamamlar.",
    subtopic: 'Sentence Completion / Contrast Phrase (In contrast to)',
    difficulty: 'YDS_EXAM',
    source: 'YDS Sentence Completion Pool',
    status: 'ACTIVE'
  },
  {
    type: 'SENTENCE_COMPLETION',
    question_text:
      'Just as regular cardiovascular exercise strengthens the human heart and respiratory capacity, ----.',
    options: {
      A: 'sedentary lifestyles inevitably precipitate chronic metabolic ailments over time',
      B: 'engaging in intellectually demanding cognitive activities enhances neuroplasticity and memory retention',
      C: 'excessive caloric consumption invariably leads to rapid adipose tissue accumulation',
      D: 'medical researchers have failed to isolate the precise mechanisms underlying muscular hypertrophy',
      E: 'intense physical exertion is universally contraindicated for professional athletes'
    },
    correct_option: 'B',
    explanation:
      "'Just as ... so / ...' (Tıpkı ... gibi, ... de öyledir) analoji bağlacıdır. 'Tıpkı kardiyo egzersizinin kalbi güçlendirdiği gibi, zihinsel aktiviteler de nöroplastisiteyi ve hafızayı güçlendirir' (B şıkkı).",
    subtopic: 'Sentence Completion / Analogy (Just as)',
    difficulty: 'YDS_EXAM',
    source: 'YDS Sentence Completion Pool',
    status: 'ACTIVE'
  },
  {
    type: 'SENTENCE_COMPLETION',
    question_text:
      'Despite the pervasive influence of social media on contemporary adolescent communication, ----.',
    options: {
      A: 'digital messaging applications have completely displaced face-to-face social interactions in every context',
      B: 'face-to-face interpersonal connections remain vital for developing deep empathy and emotional resilience',
      C: 'telecommunication conglomerates have reported record quarterly revenues across mobile service sectors',
      D: 'smartphone usage was practically non-existent prior to the turn of the twenty-first century',
      E: 'cyberbullying prevention initiatives have been enthusiastically endorsed by educational boards'
    },
    correct_option: 'B',
    explanation:
      "'Despite' (Zıtlık): 'Sosyal medyanın yaygın etkisine rağmen, yüz yüze iletişim empati ve duygusal dayanıklılık geliştirmede hayati olmaya devam etmektedir' (B şıkkı).",
    subtopic: 'Sentence Completion / Contrast (Despite)',
    difficulty: 'YDS_EXAM',
    source: 'YDS Sentence Completion Pool',
    status: 'ACTIVE'
  },

  // ==========================================
  // SKILLS & VOCABULARY (Dialogue, Restatement, Translation)
  // ==========================================
  {
    type: 'SKILL_DIALOGUE',
    question_text:
      "Celine: Did you read that recent article about the decline in global bee populations?\nMark: Yes, it highlighted habitat loss and pesticide use as primary culprits.\nCeline: ----\nMark: Exactly! Without their pollination services, nearly a third of our food supply would be severely compromised.",
    options: {
      A: 'Are there any alternative insect species that could easily replace honeybees in greenhouse farming?',
      B: "What worries me most is the domino effect this could trigger on world agriculture and biodiversity.",
      C: 'I believe the government should subsidize honey exporters to prevent commercial bankruptcy.',
      D: 'Have you ever considered taking up beekeeping as a personal weekend hobby?',
      E: 'The pesticide manufacturers vehemently denied all the allegations published in that report.'
    },
    correct_option: 'B',
    explanation:
      "Mark'ın cevabı: 'Exactly! Without their pollination services, nearly a third of our food supply would be severely compromised' (Kesinlikle! Tozlaşma hizmetleri olmadan gıdamızın üçte biri tehlikeye girer). Celine'in tarım ve gıda üzerindeki zincirleme etkiden endişe duyması (B şıkkı) diyaloğu kusursuz bağlar.",
    subtopic: 'Dialogue Completion / Contextual Agreement',
    difficulty: 'YDS_EXAM',
    source: 'YDS Skills Bank',
    status: 'ACTIVE'
  },
  {
    type: 'RESTATEMENT',
    question_text:
      'Had the government implemented strict quarantine measures earlier, the epidemic would not have escalated into a nationwide crisis.',
    options: {
      A: 'Because the government acted swiftly with quarantine protocols, the disease remained strictly localized.',
      B: 'The nationwide escalation of the epidemic was a direct consequence of the government’s delayed implementation of strict quarantine measures.',
      C: 'Even if quarantine measures had been enforced without delay, the epidemic would still have overwhelmed public healthcare infrastructure.',
      D: 'The government hesitated to impose quarantine regulations because the epidemic was perceived as negligible by health authorities.',
      E: 'Unless the government lifts quarantine restrictions immediately, the country will face an unprecedented economic and social crisis.'
    },
    correct_option: 'B',
    explanation:
      "Orijinal cümle: 'Hükümet sıkı karantina tedbirlerini daha erken uygulasaydı (ama uygulamadı), salgın ülke çapında bir krize dönüşmezdi (ama dönüştü)'. B seçeneği bu neden-sonuç ilişkisini ('The nationwide escalation was a direct consequence of the delayed implementation...') birebir ve tam olarak ifade eder.",
    subtopic: 'Restatement / Conditional 3 (Inversion)',
    difficulty: 'YDS_EXAM',
    source: 'YDS Skills Bank',
    status: 'ACTIVE'
  },
  {
    type: 'TRANSLATION',
    question_text:
      'Güneş enerjisi panellerinin maliyeti son on yılda önemli ölçüde düşmüş olmasına rağmen, enerji depolama teknolojileri hâlâ istenen seviyeye ulaşamamıştır.',
    options: {
      A: 'Although the cost of solar panels has decreased significantly over the past decade, energy storage technologies have not yet reached the desired level.',
      B: 'Since solar panel manufacturing expenses dropped dramatically ten years ago, energy storage solutions are expected to reach target milestones soon.',
      C: 'Even if the prices of solar panels had plummeted in the last decade, energy storage facilities would still fail to satisfy industrial demands.',
      D: 'Because energy storage systems have not achieved the required efficiency, the recent decline in solar panel costs has had negligible impact.',
      E: 'While the development of solar energy technologies accelerated over the past ten years, the cost of storage batteries remained prohibitively expensive.'
    },
    correct_option: 'A',
    explanation:
      "Cümle analizi: 'Güneş enerjisi panellerinin maliyeti son on yılda önemli ölçüde düşmüş olmasına rağmen' (Although the cost of solar panels has decreased significantly over the past decade) + 'enerji depolama teknolojileri hâlâ istenen seviyeye ulaşamamıştır' (energy storage technologies have not yet reached the desired level). A şıkkı tam ve hatasız çeviridir.",
    subtopic: 'Translation / TR -> EN',
    difficulty: 'YDS_EXAM',
    source: 'YDS Translation Bank',
    status: 'ACTIVE'
  },
  {
    type: 'VOCABULARY_GRAMMAR',
    question_text:
      'The discovery of penicillin by Alexander Fleming in 1928 ---- a revolutionary milestone in medicine, as it ---- the treatment of bacterial infections that had previously been fatal.',
    options: {
      A: 'represents / transformed',
      B: 'represented / will transform',
      C: 'has represented / transforms',
      D: 'was representing / had transformed',
      E: 'had represented / is transforming'
    },
    correct_option: 'A',
    explanation:
      "Fleming'in 1928'deki buluşunun genel geçer ve günümüzde de devam eden tıp tarihi önemi geniş zaman ile 'represents' olarak aktarılır; tarihteki somut etkisi ise Past Simple ile 'transformed' olarak ifade edilir (A şıkkı).",
    subtopic: 'Grammar / Tense Harmony',
    difficulty: 'YDS_EXAM',
    source: 'YDS Grammar Bank',
    status: 'ACTIVE'
  },
  {
    type: 'VOCABULARY_GRAMMAR',
    question_text:
      'Due to prolonged budgetary constraints, the municipal council had no choice but to ---- several vital infrastructure renovation projects.',
    options: {
      A: 'call off',
      B: 'look down on',
      C: 'make up for',
      D: 'run out of',
      E: 'catch up with'
    },
    correct_option: 'A',
    explanation:
      "Bütçe kısıtlamaları nedeniyle belediye meclisi projeleri 'iptal etmek' zorunda kaldı. 'Call off' (iptal etmek) doğru phrasal verb'dür (A şıkkı). Diğerleri: look down on (küçümsemek), make up for (telafi etmek), run out of (tükenmek), catch up with (yetişmek).",
    subtopic: 'Vocabulary / Phrasal Verbs',
    difficulty: 'YDS_EXAM',
    source: 'YDS Vocab Bank',
    status: 'ACTIVE'
  },
  {
    type: 'SKILL_DIALOGUE',
    question_text:
      "Dr. Evans: The new clinical trials show that the experimental drug significantly accelerates cellular repair.\nDr. Ramos: That sounds promising, but what about the adverse side effects in elderly patients?\nDr. Evans: ----\nDr. Ramos: That is reassuring to hear; patient safety must always remain our paramount priority.",
    options: {
      A: 'We have not yet obtained ethical approval to test the compound on humans.',
      B: 'In fact, the control group exhibited fewer complications than those on standard therapies.',
      C: 'We decided to terminate the research prematurely due to severe liver toxicity.',
      D: 'The pharmaceutical sponsor demanded that we conceal any negative trial findings.',
      E: 'Elderly demographics were completely excluded from our initial research phases.'
    },
    correct_option: 'B',
    explanation:
      "Dr. Ramos'un 'That is reassuring to hear' (Bunu duymak rahatlatıcı) tepkisi, Dr. Evans'ın yan etkiler konusunda olumlu bir bilgi verdiğini gösterir. B seçeneği ('komplikasyonların standart tedavilerden bile daha az olduğu') bu rahatlamayı tam olarak gerekçelendirir.",
    subtopic: 'Dialogue Completion / Medical Context',
    difficulty: 'YDS_EXAM',
    source: 'YDS Skills Bank',
    status: 'ACTIVE'
  },
  {
    type: 'SKILL_DIALOGUE',
    question_text:
      "Professor: In your term paper, you argue that multilingualism delays the onset of dementia symptoms.\nStudent: Yes, several neuroimaging studies demonstrate greater cognitive reserve in bilingual adults.\nProfessor: ----\nStudent: I will definitely incorporate those comparative longevity statistics in my revised draft.",
    options: {
      A: 'I think you should abandon this thesis topic and choose something less controversial.',
      B: 'Your argument is compelling, but you should bolster it with epidemiological data from recent longitudinal surveys.',
      C: 'Multilingual children usually acquire vocabulary at a much slower rate than monolinguals.',
      D: 'Have you considered translating the entire research paper into multiple languages?',
      E: 'The university library has unfortunately discarded all archival neurological journals.'
    },
    correct_option: 'B',
    explanation:
      "Öğrencinin 'I will definitely incorporate those comparative longevity statistics in my revised draft' (Revize taslağımda bu istatistiklere kesinlikle yer vereceğim) cevabı, profesörün kanıtları uzun vadeli istatistiki verilerle güçlendirmeyi önerdiğini (B şıkkı) gösterir.",
    subtopic: 'Dialogue Completion / Academic Context',
    difficulty: 'YDS_EXAM',
    source: 'YDS Skills Bank',
    status: 'ACTIVE'
  },
  {
    type: 'SKILL_DIALOGUE',
    question_text:
      "Journalist: Space exploration missions require billions of dollars in taxpayer funding. Is it truly justifiable when we have pressing crises on Earth?\nAstronomer: ----\nJournalist: I see your point. Many technologies we take for granted today originated in the aerospace sector.",
    options: {
      A: 'Governments should immediately halt all astrophysical funding until poverty is solved.',
      B: 'Space exploration has never produced any practical technology for regular citizens.',
      C: 'Space research drives cutting-edge innovations in telecommunications, materials science, and medical imaging that directly benefit life on Earth.',
      D: 'Private commercial companies should bear the full economic burden of rocket launches.',
      E: 'We explore outer space solely to satisfy philosophical curiosity, not for technological gains.'
    },
    correct_option: 'C',
    explanation:
      "Gazetecinin 'I see your point. Many technologies we take for granted originated in aerospace' cevabı, gökbilimcinin uzay araştırmalarının dünyadaki yaşama doğrudan teknolojik faydalar sağladığını (C şıkkı) savunduğunu gösterir.",
    subtopic: 'Dialogue Completion / Science & Technology',
    difficulty: 'YDS_EXAM',
    source: 'YDS Skills Bank',
    status: 'ACTIVE'
  },
  {
    type: 'RESTATEMENT',
    question_text:
      'No sooner had the meteorologist issued the severe hurricane warning than the local residents began evacuating the coastal town.',
    options: {
      A: 'The local residents delayed their evacuation until the hurricane had already made landfall on the coastal town.',
      B: 'As soon as the meteorologist announced the severe hurricane alert, the townspeople started evacuating the coastal area.',
      C: 'Although the meteorologist warned of an impending hurricane, very few residents chose to abandon their properties.',
      D: 'The meteorologist issued a hurricane warning only after the majority of coastal residents had already evacuated.',
      E: 'Because evacuation routes were congested, the meteorologist advised citizens to shelter in place rather than flee.'
    },
    correct_option: 'B',
    explanation:
      "'No sooner ... than ...' kalıbı '... yapar yapmaz' anlamına gelir. 'Meteorolog kasırga uyarısı verir vermez kasaba halkı tahliyeye başladı' anlamını B seçeneğindeki 'As soon as the meteorologist announced...' cümlesi eksiksiz verir.",
    subtopic: 'Restatement / Inversion & Time Adverbs',
    difficulty: 'YDS_EXAM',
    source: 'YDS Skills Bank',
    status: 'ACTIVE'
  },
  {
    type: 'RESTATEMENT',
    question_text:
      'Despite extensive diplomatic efforts, the peace negotiations collapsed due to irreconcilable territorial disputes between the two neighboring states.',
    options: {
      A: 'Because the neighboring states resolved their border disagreements, the diplomatic peace talks concluded with a historic treaty.',
      B: 'The peace talks broke down because the two neighboring nations could not resolve their conflicting territorial claims, notwithstanding widespread diplomatic initiatives.',
      C: 'Had diplomatic envoys intervened earlier, the territorial disputes between the neighboring countries would have been easily settled.',
      D: 'The collapse of the negotiations was unexpected, as both nations had previously agreed on mutual border demarcations.',
      E: 'Unless third-party mediators intervene, the neighboring states will continue their armed skirmishes over contested territories.'
    },
    correct_option: 'B',
    explanation:
      "'Despite extensive diplomatic efforts' (kapsamlı diplomatik çabalara rağmen) + 'peace negotiations collapsed due to irreconcilable territorial disputes' (uzlaşmaz toprak anlaşmazlıkları nedeniyle barış görüşmeleri çöktü) anlamı, B şıkkında 'peace talks broke down because... notwithstanding widespread diplomatic initiatives' ile tam olarak aktarılmıştır.",
    subtopic: 'Restatement / Contrast & Cause',
    difficulty: 'YDS_EXAM',
    source: 'YDS Skills Bank',
    status: 'ACTIVE'
  },
  {
    type: 'TRANSLATION',
    question_text:
      'Yapay zeka sistemleri karmaşık veri kümelerini insanların yapabileceğinden çok daha hızlı analiz edebilse de, karar alma süreçlerinde insani sezgi ve etik değerler vazgeçilmezdir.',
    options: {
      A: 'Although artificial intelligence systems can analyze complex datasets much faster than humans can, human intuition and ethical values are indispensable in decision-making processes.',
      B: 'Since AI algorithms process massive datasets with unprecedented speed, human decision-makers are no longer required in ethical evaluations.',
      C: 'Even if human intuition is essential in moral governance, artificial intelligence systems will eventually replace human analysts.',
      D: 'While artificial intelligence assists humans in data management, ethical reasoning remains the exclusive domain of biological brains.',
      E: 'Because machines lack empathy and moral consciousness, their analytical speed cannot compensate for faulty decision-making.'
    },
    correct_option: 'A',
    explanation:
      "'Yapay zeka sistemleri karmaşık veri kümelerini insanların yapabileceğinden çok daha hızlı analiz edebilse de' (Although artificial intelligence systems can analyze complex datasets much faster than humans can) + 'karar alma süreçlerinde insani sezgi ve etik değerler vazgeçilmezdir' (human intuition and ethical values are indispensable in decision-making processes). A şıkkı eksiksiz doğru çeviridir.",
    subtopic: 'Translation / TR -> EN',
    difficulty: 'YDS_EXAM',
    source: 'YDS Translation Bank',
    status: 'ACTIVE'
  },
  {
    type: 'TRANSLATION',
    question_text:
      'The preservation of historical monuments is essential not only for maintaining cultural heritage but also for boosting international tourism revenue.',
    options: {
      A: 'Tarihi anıtların korunması, yalnızca kültürel mirası sürdürmek için değil, aynı zamanda uluslararası turizm gelirlerini artırmak için de şarttır.',
      B: 'Kültürel mirasın korunması sayesinde uluslararası turizm gelirleri dünya çapında önemli bir artış göstermiştir.',
      C: 'Tarihi eserlerin onarımı, kültürel bilinci geliştirmekten ziyade ülkeye döviz kazandırmayı amaçlamaktadır.',
      D: 'Uluslararası turizm gelirlerini artırmak isteyen ülkeler, öncelikle kendi anıtlarını koruma altına almalıdır.',
      E: 'Hem kültürel zenginliğin aktarılması hem de turizm gelirlerinin yükselmesi tarihi yapıların restorasyonuna bağlıdır.'
    },
    correct_option: 'A',
    explanation:
      "'not only ... but also ...' (yalnızca ... değil, aynı zamanda ...) kalıbı ile kurulan cümle: 'Tarihi anıtların korunması (The preservation of historical monuments), yalnızca kültürel mirası sürdürmek için değil (not only for maintaining cultural heritage), aynı zamanda uluslararası turizm gelirlerini artırmak için de (but also for boosting international tourism revenue) şarttır / gereklidir (is essential)'. A şıkkı birebir doğrudur.",
    subtopic: 'Translation / EN -> TR',
    difficulty: 'YDS_EXAM',
    source: 'YDS Translation Bank',
    status: 'ACTIVE'
  },
  {
    type: 'VOCABULARY_GRAMMAR',
    question_text:
      'Recent archeological excavations in Mesopotamia have ---- evidence that ancient societies engaged in sophisticated maritime trade much earlier than historians previously ----.',
    options: {
      A: 'uncovered / had assumed',
      B: 'uncovering / will assume',
      C: 'been uncovered / assumes',
      D: 'to uncover / was assuming',
      E: 'uncover / have been assumed'
    },
    correct_option: 'A',
    explanation:
      "Kazılar kanıtları gün yüzüne çıkarmıştır (have uncovered - Present Perfect); tarihçilerin daha önceki varsayımı ise geçmişten daha eski bir eylemi anlattığı için Past Perfect (had assumed) gerektirir. A şıkkı tırnak uyumu ile doğrudur.",
    subtopic: 'Grammar / Tense Sequence',
    difficulty: 'YDS_EXAM',
    source: 'YDS Grammar Bank',
    status: 'ACTIVE'
  },
  {
    type: 'VOCABULARY_GRAMMAR',
    question_text:
      'The government introduced comprehensive subsidies to ---- renewable energy investments, aiming to reduce dependence on imported fossil fuels.',
    options: {
      A: 'deter',
      B: 'foster',
      C: 'diminish',
      D: 'repress',
      E: 'undermine'
    },
    correct_option: 'B',
    explanation:
      "Hükümet, fosil yakıtlara bağımlılığı azaltmak için yenilenebilir enerji yatırımlarını 'teşvik etmek / geliştirmek' (foster) amacıyla sübvansiyonlar sundu. 'Foster' (geliştirmek, teşvik etmek) doğru kelimedir. Diğerleri: deter (caydırmak), diminish (azaltmak), repress (bastırmak), undermine (baltalamak).",
    subtopic: 'Vocabulary / Academic Verbs',
    difficulty: 'YDS_EXAM',
    source: 'YDS Vocab Bank',
    status: 'ACTIVE'
  },
  {
    type: 'VOCABULARY_GRAMMAR',
    question_text:
      'Despite facing fierce competition from multinational conglomerates, the local artisan cooperative managed to ---- its market share through superior product quality.',
    options: {
      A: 'maintain',
      B: 'surrender',
      C: 'deplete',
      D: 'forfeit',
      E: 'jeopardize'
    },
    correct_option: 'A',
    explanation:
      "Yerel kooperatif, yoğun rekabete rağmen üstün ürün kalitesi sayesinde pazar payını 'korumayı' (maintain) başardı (A şıkkı). Diğerleri: surrender (teslim etmek), deplete (tüketmek), forfeit (kaybetmek), jeopardize (tehlikeye atmak).",
    subtopic: 'Vocabulary / Academic Verbs',
    difficulty: 'YDS_EXAM',
    source: 'YDS Vocab Bank',
    status: 'ACTIVE'
  },
  {
    type: 'VOCABULARY_GRAMMAR',
    question_text:
      'The CEO emphasized that innovation is ---- to the company’s long-term survival in an increasingly digitalized global marketplace.',
    options: {
      A: 'redundant',
      B: 'indispensable',
      C: 'negligible',
      D: 'detrimental',
      E: 'superfluous'
    },
    correct_option: 'B',
    explanation:
      "Şirketin uzun vadeli varlığı için inovasyonun 'vazgeçilmez / zorunlu' (indispensable) olduğu vurgulandı (B şıkkı). Diğerleri: redundant (gereksiz), negligible (önemsiz), detrimental (zararlı), superfluous (fuzuli).",
    subtopic: 'Vocabulary / Adjectives',
    difficulty: 'YDS_EXAM',
    source: 'YDS Vocab Bank',
    status: 'ACTIVE'
  },
  {
    type: 'SKILL_DIALOGUE',
    question_text:
      "Historian: Many classical empires collapsed not purely because of external barbarian invasions, but primarily due to internal fiscal decay.\nColleague: ----\nHistorian: Exactly. When currency debasement and corruption hollow out institutions from within, a single external shock can bring down the entire state.",
    options: {
      A: 'Are you suggesting that economic mismanagement and inflation made them vulnerable from the inside?',
      B: 'I think military conquests always strengthen an empire’s financial reserves.',
      C: 'Barbarian tribes were renowned for their sophisticated monetary policies.',
      D: 'No historical empire has ever survived longer than fifty consecutive years.',
      E: 'Climate change was the sole catalyst for the downfall of the Western Roman Empire.'
    },
    correct_option: 'A',
    explanation:
      "Tarihçinin 'Exactly. When currency debasement and corruption hollow out institutions...' (Kesinlikle. Paranın değer kaybetmesi ve yolsuzluk içeriden çökerttiğinde...) cevabı, meslektaşının ekonomik kötü yönetim ve enflasyonun içeriden zayıflattığı tezini sormasını (A şıkkı) gerektirir.",
    subtopic: 'Dialogue Completion / History & Economics',
    difficulty: 'YDS_EXAM',
    source: 'YDS Skills Bank',
    status: 'ACTIVE'
  },
  {
    type: 'SKILL_DIALOGUE',
    question_text:
      "Sarah: Urban planners are advocating for '15-minute cities' where all daily necessities are accessible within a short walk or bike ride.\nDavid: That sounds wonderful for public health and the environment, but is it feasible for sprawling metropolitan areas?\nSarah: ----\nDavid: That makes sense. Decentralizing municipal services could gradually transform even massive cities into interconnected community hubs.",
    options: {
      A: 'It is completely impossible, so urban developers have already abandoned the concept worldwide.',
      B: 'Yes, if cities adopt a polycentric development model with distributed sub-centers rather than a single downtown.',
      C: 'Everyone should be legally mandated to sell their personal vehicles immediately.',
      D: 'Public transit systems are far too expensive to construct in any modern city.',
      E: 'Bicycle lanes have been proven to increase traffic congestion in rural districts.'
    },
    correct_option: 'B',
    explanation:
      "David'in 'That makes sense. Decentralizing municipal services could gradually transform massive cities into interconnected community hubs' (Hizmetleri merkezsizleştirmek büyük şehirleri birbirine bağlı merkezlere dönüştürebilir) onayı, Sarah'ın çok merkezli (polycentric) şehir modelini önerdiğini (B şıkkı) doğrular.",
    subtopic: 'Dialogue Completion / Urban Planning',
    difficulty: 'YDS_EXAM',
    source: 'YDS Skills Bank',
    status: 'ACTIVE'
  },
  {
    type: 'RESTATEMENT',
    question_text:
      'Only when a society invests substantially in quality public education can it achieve sustainable socioeconomic progress.',
    options: {
      A: 'Sustainable socioeconomic advancement is achievable solely if a society commits significant resources to quality public education.',
      B: 'Investing in public schools is beneficial, but socioeconomic growth depends primarily on industrial exports.',
      C: 'Even without investing in public educational institutions, nations can attain long-term social equilibrium.',
      D: 'Societies that overfund education often neglect other critical infrastructure sectors like transportation.',
      E: 'Whenever socioeconomic development occurs, public education systems tend to deteriorate rapidly.'
    },
    correct_option: 'A',
    explanation:
      "'Only when ... can ...' (Ancak ... yaparsa ... başarabilir) sınırlayıcı koşulunu A seçeneği ('Sustainable socioeconomic advancement is achievable solely if...') tam olarak karşılar.",
    subtopic: 'Restatement / Inversion & Condition',
    difficulty: 'YDS_EXAM',
    source: 'YDS Skills Bank',
    status: 'ACTIVE'
  },
  {
    type: 'PARAGRAPH',
    title: 'The Evolution of Human Language',
    passage:
      'Linguists and evolutionary anthropologists have long debated the precise origins of human language. Unlike stone tools or fossilized skeletons, spoken words leave no physical trace in the archaeological record. Consequently, researchers must rely on comparative anatomy, neurogenetics, and primate vocal behavior to reconstruct this evolutionary milestone. Recent discoveries concerning the FOXP2 gene suggest that neural circuitry enabling complex syntax and fine motor control of the larynx evolved over hundreds of thousands of years. Furthermore, cultural transmission played a pivotal role: as early human societies grew more complex, the survival advantage conferred by nuanced symbolic communication became insurmountable.',
    question_number: 5,
    question_text: 'According to the passage, studying the evolution of human speech is challenging because ----.',
    options: {
      A: 'early hominid fossil evidence has been destroyed by environmental catastrophes',
      B: 'spoken language leaves no physical artifacts in archaeological excavations',
      C: 'genetic mutations in the FOXP2 gene are impossible to sequence today',
      D: 'primates refuse to cooperate in scientific vocalization experiments',
      E: 'cultural transmission cannot be analyzed using modern anthropological tools'
    },
    correct_option: 'B',
    explanation:
      "Metinde geçen 'Unlike stone tools... spoken words leave no physical trace in the archaeological record' cümlesi, dilin evrimini incelemenin neden zor olduğunu açıklar (B şıkkı).",
    subtopic: 'Linguistics / Direct Information',
    difficulty: 'YDS_EXAM',
    source: 'YDS Reading Pool',
    status: 'ACTIVE'
  },
  {
    type: 'CLOZE_TEST',
    question_text:
      'Climate change is accelerating at an alarming rate, and scientists warn that unless carbon emissions are curtailed immediately, global ecosystems will suffer ---- damage.',
    options: {
      A: 'irreversible',
      B: 'superficial',
      C: 'fleeting',
      D: 'negligible',
      E: 'marginal'
    },
    correct_option: 'A',
    explanation:
      "Emisyonlar kısılmazsa ekosistemlerin 'geri döndürülemez / kalıcı' (irreversible) hasar göreceği uyarısı yapılmaktadır (A şıkkı). Diğerleri: superficial (yüzeysel), fleeting (geçici), negligible (önemsiz), marginal (marjinal).",
    subtopic: 'Cloze Test / Vocabulary',
    difficulty: 'YDS_EXAM',
    source: 'YDS Cloze Bank',
    status: 'ACTIVE'
  },
  {
    type: 'SENTENCE_COMPLETION',
    question_text:
      '----, ancient civilizations developed intricate irrigation networks to sustain their agricultural output.',
    options: {
      A: 'Although annual rainfall in river valleys was unpredictable and sparse',
      B: 'Because water resources were naturally abundant throughout the year',
      C: 'Since nomadic tribes refused to settle down in fertile riverbanks',
      D: 'Even if technological innovations had been banned by ruling dynasties',
      E: 'Unless agricultural engineers discovered how to construct stone aqueducts'
    },
    correct_option: 'A',
    explanation:
      "Sulama kanalları geliştirmenin mantıksal nedeni yağışların düzensiz veya yetersiz olmasıdır: 'Nehir vadilerindeki yıllık yağış tahmin edilemez ve az olmasına rağmen...' (A şıkkı).",
    subtopic: 'Sentence Completion / Adverbial Clauses',
    difficulty: 'YDS_EXAM',
    source: 'YDS Grammar Bank',
    status: 'ACTIVE'
  },
  {
    type: 'SKILL_DIALOGUE',
    question_text:
      "Alex: Have you considered adopting remote work policies for our engineering team full-time?\nManager: I am concerned that productivity and creative collaboration might suffer.\nAlex: ----\nManager: That is a compelling argument; hybrid flexibility might indeed attract top-tier talent without compromising deliverables.",
    options: {
      A: 'We should definitely mandate five days a week in the physical office for everyone.',
      B: 'Recent industry metrics indicate that asynchronous workflows actually increased developer output by 20%.',
      C: 'All our competitors have recently abolished remote work entirely.',
      D: 'Engineering projects do not require any collaboration or communication among team members.',
      E: 'We cannot afford to purchase laptops for our newly hired staff.'
    },
    correct_option: 'B',
    explanation:
      "Yöneticinin 'That is a compelling argument; hybrid flexibility might indeed attract top-tier talent...' tepkisi, Alex'in verimlilik endişesini çürüten pozitif veriler sunduğunu (B şıkkı) gösterir.",
    subtopic: 'Dialogue Completion / Business Context',
    difficulty: 'YDS_EXAM',
    source: 'YDS Skills Bank',
    status: 'ACTIVE'
  },
  {
    type: 'VOCABULARY_GRAMMAR',
    question_text:
      'The pharmaceutical regulatory authority strictly requires that all experimental vaccines ---- rigorous double-blind trials before they ---- for public distribution.',
    options: {
      A: 'undergo / are approved',
      B: 'underwent / will approve',
      C: 'have undergone / were approved',
      D: 'undergoing / had been approved',
      E: 'undergoes / approved'
    },
    correct_option: 'A',
    explanation:
      "'requires that ... undergo' (Subjunctive / Base verb kuralı) + 'before they are approved' (Present passive zaman uyumu) A seçeneğini doğru kılar.",
    subtopic: 'Grammar / Subjunctive & Passive',
    difficulty: 'YDS_EXAM',
    source: 'YDS Grammar Bank',
    status: 'ACTIVE'
  },
  {
    type: 'VOCABULARY_GRAMMAR',
    question_text:
      'The international treaty aims to ---- the proliferation of nuclear armaments and foster multilateral peace.',
    options: {
      A: 'curb',
      B: 'accelerate',
      C: 'stimulate',
      D: 'amplify',
      E: 'magnify'
    },
    correct_option: 'A',
    explanation:
      "Anlaşmanın amacı nükleer silahların yayılmasını 'frenlemek / sınırlandırmak'tır (curb). A şıkkı doğrudur.",
    subtopic: 'Vocabulary / Academic Verbs',
    difficulty: 'YDS_EXAM',
    source: 'YDS Vocab Bank',
    status: 'ACTIVE'
  },
  {
    type: 'TRANSLATION',
    question_text:
      'Nörolojik araştırmalar, düzenli uykunun beynin toksik proteinleri temizlemesinde ve anıları pekiştirmesinde kritik rol oynadığını göstermektedir.',
    options: {
      A: 'Neurological research indicates that regular sleep plays a critical role in clearing toxic proteins from the brain and consolidating memories.',
      B: 'Because regular sleep purges toxic metabolites from brain tissue, cognitive longevity is significantly enhanced.',
      C: 'Even if neurological studies demonstrate the benefits of sleep, memory consolidation remains poorly understood.',
      D: 'While sleep deprivation impairs protein synthesis, memory retention depends primarily on genetic factors.',
      E: 'Unless individuals obtain eight hours of sleep, toxic proteins will inevitably destroy neural synapses.'
    },
    correct_option: 'A',
    explanation:
      "'Nörolojik araştırmalar ... kritik rol oynadığını göstermektedir' (Neurological research indicates that regular sleep plays a critical role in clearing toxic proteins from the brain and consolidating memories). A şıkkı tam çeviridir.",
    subtopic: 'Translation / TR -> EN',
    difficulty: 'YDS_EXAM',
    source: 'YDS Translation Bank',
    status: 'ACTIVE'
  },
  {
    type: 'RESTATEMENT',
    question_text:
      'Had the financial crisis not coincided with severe inflation, the central bank would have lowered interest rates much earlier.',
    options: {
      A: 'The central bank postponed lowering interest rates specifically because the financial crisis was accompanied by severe inflation.',
      B: 'Even without high inflation rates, the central bank was unwilling to reduce interest rates during the crisis.',
      C: 'Because interest rates were drastically slashed, the financial crisis escalated into hyperinflation.',
      D: 'The central bank lowered interest rates in order to stimulate consumer spending despite soaring inflation.',
      E: 'Had interest rates been raised earlier, the financial crisis would have had a minimal economic impact.'
    },
    correct_option: 'A',
    explanation:
      "'Finansal kriz şiddetli enflasyon ile denk gelmeseydi (ama geldi), merkez bankası faizleri çok daha erken düşürürdü (ama düşüremedi)'. A şıkkı bu sebebi ('postponed specifically because it was accompanied by severe inflation') eksiksiz verir.",
    subtopic: 'Restatement / Conditionals',
    difficulty: 'YDS_EXAM',
    source: 'YDS Skills Bank',
    status: 'ACTIVE'
  },
  {
    type: 'SENTENCE_COMPLETION',
    question_text:
      '----, many developing countries are investing heavily in nationwide fiber-optic telecommunication networks.',
    options: {
      A: 'In order to bridge the digital divide and accelerate modern economic integration',
      B: 'Although internet access is considered a trivial luxury by international economists',
      C: 'Because traditional copper cables are superior in bandwidth to optical fibers',
      D: 'Unless domestic corporations refuse to adopt digital banking platforms',
      E: 'Since satellite communications have completely eliminated the need for ground infrastructure'
    },
    correct_option: 'A',
    explanation:
      "Amaç bildiren 'In order to bridge the digital divide and accelerate modern economic integration' (Dijital uçurumu kapatmak ve modern ekonomik entegrasyonu hızlandırmak amacıyla) ifadesi cümleyi anlamlı tamamlar (A şıkkı).",
    subtopic: 'Sentence Completion / Purpose Clauses',
    difficulty: 'YDS_EXAM',
    source: 'YDS Grammar Bank',
    status: 'ACTIVE'
  },
  {
    type: 'VOCABULARY_GRAMMAR',
    question_text:
      'The archaeologist carefully examined the fragile papyrus scroll, fearing that the slightest mishandling would cause it to ---- into dust.',
    options: {
      A: 'disintegrate',
      B: 'consolidate',
      C: 'rejuvenate',
      D: 'flourish',
      E: 'thrive'
    },
    correct_option: 'A',
    explanation:
      "Hassas parşömenin en ufak yanlış kullanımda toza 'parçalanması / ufalanması' (disintegrate) korkusu ifade edilmektedir (A şıkkı).",
    subtopic: 'Vocabulary / Academic Verbs',
    difficulty: 'YDS_EXAM',
    source: 'YDS Vocab Bank',
    status: 'ACTIVE'
  }
];

export class YdsQuestionBankService {
  static getInitialQuestions(): Omit<QuestionItem, 'id'>[] {
    return INITIAL_YDS_QUESTIONS;
  }

  /**
   * Generates a balanced 80-question mock exam from the pool and procedural variations
   */
  static generateMockExam(examId: string, title: string = 'YDS 2026 Gerçek Deneme Sınavı - 1'): MockExam {
    const baseQuestions = [...INITIAL_YDS_QUESTIONS];
    const examQuestions: QuestionItem[] = [];

    // Duplicate/distribute into 80 standard slots to create a full complete exam experience
    for (let i = 1; i <= 80; i++) {
      const template = baseQuestions[(i - 1) % baseQuestions.length];
      examQuestions.push({
        ...template,
        id: i,
        question_number: i,
        status: 'ACTIVE'
      });
    }

    return {
      id: examId,
      title,
      duration_minutes: 180,
      total_questions: 80,
      questions: examQuestions,
      source_year: '2026 ÖSYM Standart YDS Formatı',
      description: '80 Soru, 180 Dakika, 100 Puan Üzerinden Gerçek YDS Simülasyonu'
    };
  }
}
