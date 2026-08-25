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
      'Bioluminescence, the production and emission of light by a living organism, is predominantly found in marine vertebrates and invertebrates. In the abyssal depths of the ocean, where sunlight fails to penetrate, light emission serves critical evolutionary functions including camouflage, prey attraction, predator deterrence, and communication. Unlike incandescent bulbs that lose vast amounts of energy as heat, bioluminescent reactions are nearly 100 percent efficient, transforming chemical energy directly into light via the oxidation of luciferin catalyzed by luciferase.',
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
