-- ==============================================================================
-- PRATIKDIL: EĞİTMEN PROMOSYON KODUNA ÖZEL KELİME LİSTESİ ALTYAPISI (SCHEMA & RLS)
-- ==============================================================================

-- 1. EĞİTMEN KELİME LİSTELERİ TABLOSU (Klasör Tanımı)
CREATE TABLE IF NOT EXISTS public.instructor_word_lists (
  id TEXT PRIMARY KEY,                             -- Örn: 'list_hakki_yds_2026'
  promo_code TEXT NOT NULL,                        -- Örn: 'HAKKI20' (Büyük harf)
  instructor_name TEXT NOT NULL,                   -- Örn: 'Hakkı Hoca'
  title TEXT NOT NULL,                             -- Örn: 'Hakkı Hoca 2026 YDS Vurgulu Kelimeler'
  description TEXT,                                -- Örn: '2026 İlkbahar YDS grubu için seçilmiş kritik kelimeler'
  badge_text TEXT DEFAULT '🎓 EĞİTMEN PAKETİ',      -- Kart üzeri etiket
  color TEXT DEFAULT '#8B5CF6',                    -- Tema rengi (Mor / Eğitmen Rengi)
  icon TEXT DEFAULT 'GraduationCap',               -- Lucide ikon adı
  is_active BOOLEAN DEFAULT TRUE,                  -- Aktiflik durumu
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Hızlı promosyon kodu aramaları için indeks
CREATE INDEX IF NOT EXISTS idx_instructor_word_lists_promo_code 
  ON public.instructor_word_lists (UPPER(promo_code));

-- 2. EĞİTMEN KELİMELERİ TABLOSU (Listeye Bağlı Kelimeler)
CREATE TABLE IF NOT EXISTS public.instructor_words (
  id BIGSERIAL PRIMARY KEY,
  list_id TEXT NOT NULL REFERENCES public.instructor_word_lists(id) ON DELETE CASCADE,
  word TEXT NOT NULL,                              -- Örn: 'alleviate'
  meaning TEXT NOT NULL,                           -- Örn: 'hafifletmek, dindirmek, yatıştırmak'
  category TEXT DEFAULT 'VOCABULARY',
  level TEXT DEFAULT 'B2',                         -- A1, A2, B1, B2, C1
  example_sentence TEXT,                           -- Örnek İngilizce cümle
  example_translation TEXT,                        -- Örnek cümlenin Türkçe çevirisi
  synonyms JSONB DEFAULT '[]'::jsonb,              -- Eş anlamlılar dizisi
  etymology_note TEXT,                             -- Köken/hatırlatıcı not
  part_of_speech TEXT,                             -- fiil, isim, sıfat, zarf
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Liste ID indekslemesi
CREATE INDEX IF NOT EXISTS idx_instructor_words_list_id 
  ON public.instructor_words (list_id);

-- 3. ROW LEVEL SECURITY (RLS) POLİTİKALARI
ALTER TABLE public.instructor_word_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_words ENABLE ROW LEVEL SECURITY;

-- Anon ve Authenticated kullanıcılar aktif listeleri ve kelimeleri okuyabilir
CREATE POLICY "Public Read Active Instructor Lists" 
  ON public.instructor_word_lists 
  FOR SELECT 
  USING (is_active = TRUE);

CREATE POLICY "Public Read Instructor Words" 
  ON public.instructor_words 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.instructor_word_lists l 
      WHERE l.id = instructor_words.list_id AND l.is_active = TRUE
    )
  );

-- Service Role (Yönetici ve Eğitmen Backend API) için tam yetki
CREATE POLICY "Service Role Full Access Lists"
  ON public.instructor_word_lists
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Service Role Full Access Words"
  ON public.instructor_words
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- 4. ÖRNEK SEED VERİSİ (DEMO VE BAŞLANGIÇ EĞİTMEN SETİ)
INSERT INTO public.instructor_word_lists (id, promo_code, instructor_name, title, description, badge_text, color, icon)
VALUES 
(
  'list_hakki_yds_2026',
  'HAKKI20',
  'Hakkı Hoca',
  'Hakkı Hoca — 2026 YDS Vurgulu Kelimeler',
  '2026 İlkbahar YDS grubu için Hakkı Hoca tarafından seçilmiş sınavda en sık çeldirici olan 50 kritik kelime.',
  '🎓 HAKKI HOCA ÖZEL',
  '#8B5CF6',
  'GraduationCap'
),
(
  'list_serkan_yds_master',
  'SERKAN20',
  'Serkan Hoca',
  'Serkan Hoca — İleri Düzey Akademik Sıfatlar',
  'Akademik makale ve paragraf sorularında fark yaratan ileri düzey sıfatlar ve eş anlamlıları.',
  '🎓 SERKAN HOCA ÖZEL',
  '#EC4899',
  'Award'
)
ON CONFLICT (id) DO NOTHING;

-- Örnek kelimeler
INSERT INTO public.instructor_words (list_id, word, meaning, category, level, example_sentence, example_translation, synonyms, part_of_speech)
VALUES
(
  'list_hakki_yds_2026',
  'alleviate',
  'hafifletmek, dindirmek, acısını azaltmak',
  'VOCABULARY',
  'B2',
  'The doctor gave him medication to alleviate the severe back pain.',
  'Doktor, şiddetli sırt ağrısını hafifletmesi için ona ilaç verdi.',
  '["ease", "relieve", "mitigate", "lessen"]'::jsonb,
  'fiil'
),
(
  'list_hakki_yds_2026',
  'curb',
  'dizginlemek, kontrol altına almak, frenlemek',
  'VOCABULARY',
  'B2',
  'New monetary policies were introduced to curb rising inflation.',
  'Artan enflasyonu dizginlemek için yeni para politikaları uygulamaya konuldu.',
  '["restrain", "control", "check", "contain"]'::jsonb,
  'fiil'
),
(
  'list_hakki_yds_2026',
  'deteriorate',
  'kötüleşmek, bozulmak, fenalaşmak',
  'VOCABULARY',
  'B2',
  'The weather conditions deteriorated rapidly during the flight.',
  'Uçuş sırasında hava koşulları hızla kötüleşti.',
  '["worsen", "decline", "degenerate"]'::jsonb,
  'fiil'
),
(
  'list_hakki_yds_2026',
  'meticulous',
  'titiz, kılı kırk yaran, son derece dikkatli',
  'VOCABULARY',
  'C1',
  'She conducted meticulous research before publishing her thesis.',
  'Tezini yayımlamadan önce kılı kırk yaran titiz bir araştırma yürüttü.',
  '["thorough", "painstaking", "diligent"]'::jsonb,
  'sıfat'
),
(
  'list_hakki_yds_2026',
  'scrutinize',
  'derinlemesine incelemek, mercek altına almak',
  'VOCABULARY',
  'C1',
  'The committee will closely scrutinize every proposal submitted.',
  'Komite, sunulan her öneriyi mercek altına alarak derinlemesine inceleyecek.',
  '["examine", "inspect", "investigate"]'::jsonb,
  'fiil'
)
ON CONFLICT DO NOTHING;
