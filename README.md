# PRATIKDIL — MİMARİ MANİFESTO VE KODLAMA REHBERİ

> **BU BELGE (`README.md`):** Projede çalışan geliştiriciler ve yapay zeka asistanları (Antigravity vb.) için bağlayıcı mühendislik prensipleridir. Kod yazarken tekrar eden promptlara gerek kalmadan, doğrudan bu standartlara uyulacaktır.

---

## 1. 🎨 RENK, TEMA VE GÖRSEL MİMARİ STANDARTLARI

Uygulamada **asla keyfi sabit hex kodları (`#1E293B`, `#2563EB` vb.) elle yazılmaz**. Tüm renkler `useThemeStore` üzerindeki `colors` nesnesinden alınır.

### Token Kullanım Matrisi:
| Token | Kullanım Alanı | Kesinlikle Kullanılmayacağı Yer |
|---|---|---|
| `colors.brand` | Birincil butonlar, aktif sekmeler, ana aksiyonlar, ses butonları | Seri/streak alevi veya hata mesajları |
| `colors.brandLight` | Buton ve chip arka planları (`rgba(37,99,235, 0.09)`) | Kart veya sayfa genel arka planı |
| `colors.accentWarm` | **SADECE** seri (streak), ateş ikonu (🔥), dikkat çekici rozetler | Normal butonlar, kart başlıkları |
| `colors.background` | Sayfa kök arka planı (`#F8FAFC`) | Kart içi kutular |
| `colors.cardBackground`| Kartlar, modallar, açılır pencereler (`#FFFFFF`) | Sayfa arka planı |
| `colors.subtleBackground`| Örnek cümle kutusu, etimoloji kutusu, kategori tag'leri | Ana kart yüzeyi |
| `colors.border` | Standart ayırıcı çizgiler, input sınırları | Vurgulu öğeler |
| `colors.text` | Birincil başlıklar ve kelime metinleri | İkincil açıklamalar |
| `colors.textSecondary`| Türkçe çeviriler, alt başlıklar, ipuçları | Ana kelime başlığı |
| `colors.error` / `errorLight` | Yanlış cevap, hesap silme, hata uyarıları | Nötr durumlar |
| `colors.success` / `successLight` | Doğru cevap, tamamlama durumu | Nötr durumlar |

### Tipografi Kuralı:
* Sabit font boyutu verilmez: Daima `dynamicFontSize` veya `Math.round(dynamicFontSize * 1.25)` gibi oranlar kullanılır.
* Font ailesi daima `dynamicFontFamily` veya sistem default'u ile uyumlu olmalıdır.

---

## 2. 🧩 BİLEŞEN MİMARİSİ VE KOD UZUNLUĞU (MODÜLERLİK)

### 2.1. "Monolitik Dosya Yasağı" ve Refactor Güvenliği
* **Yeni yazılacak bileşenlerde** dosya uzunluğu 250-300 satırı aşmamalı, alt bileşenlere (Sub-components) ayrılmalıdır.
* *Örnek Bölünme:* `WordCard` -> `WordCardHeader.tsx`, `WordCardMeaning.tsx`, `WordCardExample.tsx`, `WordCardActions.tsx`
* **Mevcut Büyük Dosyalar Kuralı:** Projedeki mevcut büyük ekranlar (`WordVaultScreen`, `SettingsScreen`, `DictionaryScreen`), kullanıcı açıkça *"bu ekranı refactor et/parçala"* demedikçe küçük bugfix veya özellik eklemeleri sırasında **asla komple parçalanmaya kalkışılmaz** (çalışan özellikleri bozma riskini önlemek için).

### 2.2. UI ve Veri Mantığının (Business Logic) Ayrımı
* **Bileşenler (UI Layer):** Yalnızca prop alır, animasyon/render yapar ve kullanıcı aksiyonunu tetikler.
* **Store (State Layer):** Günlük sayaçlar, aktif kelime listesi, seri takibi `useLearningStore` içinde yaşar.
* **Services (Logic Layer):** Tureng araması, API çağrıları, Leitner hesaplamaları servis sınıflarında kalır. Bileşen içinde inline ağır SQL veya API parsing yapılmaz.

### 2.3. Gereksiz Render'ları Engelleme
* Listelerde render edilecek alt bileşenler `React.memo` ile sarmalanır.
* Olay yöneticileri (`handleAnswer`, `handleSpeak`) `useCallback` ile; filtreleme ve sıralama hesaplamaları `useMemo` ile korunur.

---

## 3. 🛡️ DEFANSİF KODLAMA VE BUG KORUMA PRENSİPLERİ

Uygulamada kullanıcının karşısına beyaz ekran (crash) çıkmaması veya kullanıcının "şu bozuldu" dememesi için şu 5 kural esastır:

### 3.1. Native Modül Güvenliği (Try/Catch Guard)
`expo-speech`, `expo-notifications`, donanım titreşimi gibi native modüller binary'de eksik olsa dahi uygulama çökmeyecektir:
```typescript
// DOĞRU YAKLAŞIM:
try {
  if (SpeechModule && typeof SpeechModule.speak === 'function') {
    SpeechModule.speak(text, { language: 'en-US' });
  }
} catch (e) {
  console.warn('Speech safe fallback:', e);
}
```

### 3.2. Null & Undefined Emniyeti (Optional Chaining & Fallbacks)
* Asla `word.meanings[0].turkish` gibi güvensiz zincirleme yazılmaz.
* Daima `word?.meanings?.[0]?.turkish ?? word?.meaning ?? ''` şeklinde tam koruma sağlanır.

### 3.3. Bellek Sızıntısı (Memory Leak) Koruması
* `useEffect` içinde yapılan tüm asenkron isteklerde (`fetch`, `lookupWord`) mutlaka `isMounted` bayrağı veya `AbortController` kullanılır.
* `setTimeout` veya `setInterval` kullanıldığında `return () => clearTimeout(...)` ile temizlenir.

### 3.4. Veri Güvenliği ve Tek Doğruluk Noktası (SQLite + Zustand)
* Veritabanı işlemleri daima `DatabaseService.ts` üzerinden yürütülür.
* **Asla** kullanıcının özel kelimelerini (`is_custom = 1`) veya sınav ilerlemesini topluca silen kör sorgular yazılamaz.
* Şema güncellemeleri `ALTER TABLE ... ADD COLUMN` ile ve mutlaka `try/catch` blokları içinde yapılır.
* Akış: Önce SQLite'a yazılır -> başarılıysa Zustand Store güncellenir (Veri kaybı sıfır).

### 3.5. Anti-Boilerplate Kuralı (Gerçek Cümle Zorunluluğu)
* *"The word '...' frequently appears in YDS passages"* gibi yapay şablon cümleler ekranda asla gösterilmez.
* Cümle gösterilecek her yerde `sentenceUtils.ts`'deki `getValidExampleSentence` kullanılır. Boşsa Tureng veya AI'dan gerçek cümle çekilir.

---

## 4. ⚡ PERFORMANS VE LİSTE OPTİMİZASYONLARI

Kelimeler veya sorular listelenirken (WordVault, Dictionary, Exam History):
* `ScrollView` içine binlerce kelime basılmaz; mutlaka `FlatList` kullanılır.
* FlatList için zorunlu optimizasyon prop'ları:
  ```typescript
  <FlatList
    keyExtractor={(item) => String(item.id)}
    initialNumToRender={12}
    maxToRenderPerBatch={10}
    windowSize={5}
    removeClippedSubviews={Platform.OS === 'android'}
    getItemLayout={itemHeight ? (_, index) => ({ length: itemHeight, offset: itemHeight * index, index }) : undefined}
  />
  ```

---

## 5. 📱 PLATFORM-SPESİFİK TASARIM VE MİMARİ PRENSİPLERİ (iOS vs Android)

Pratikdil, tek bir temiz kod tabanından hem iOS hem de Android'de native hissiyat sunacak şekilde optimize edilmiştir.

### 5.1. Tasarım Dili ve Native İncelikler

| Alan | iOS (Human Interface) | Android (Material Design) | Uygulama Yöntemi |
|---|---|---|---|
| **Köşe Yuvarlaklığı** | Yumuşak, büyük (`16-20px`) | Daha keskin/geometrik (`10-12px`) | `Platform.select({ ios: 18, android: 10 })` |
| **Derinlik / Gölge** | `shadowColor / shadowOffset / shadowOpacity` | `elevation` | `StyleSheet` içinde `Platform.select` |
| **Font Ailesi** | `San Francisco` (Sistem varsayılanı) | `Roboto` (Sistem varsayılanı) | `dynamicFontFamily` üzerinden otomatik |
| **Geri Navigasyon** | Sol üst ok butonu + iOS jesti | Donanım/jest geri tuşu + sol üst ok | Her iki platformda da sol üst ok korunur |
| **Aksiyon Butonları** | Altta sabit, tam genişlikli modern bar | Altta sabit, tam genişlikli modern bar | **Tutarlılık:** Duolingo/Quizlet tipi alt aksiyon alanı korunur (asla çakışan FAB eklenmez) |
| **Haptik / Titreşim** | `expo-haptics` (İnce geri bildirim) | `expo-haptics` / Güvenli fallback | Daima `try/catch` içinde çağrılır |
| **Safe Area** | Dynamic Island & Çentik için `SafeAreaView` | Status bar yüksekliği | `SafeAreaView` veya sistem padding'leri |

### 5.2. Tek Kod Tabanı Kuralı (Dosya Bölme Yasağı)
* **Asla gereksiz yere `.ios.tsx` ve `.android.tsx` şeklinde dosya kopyalaması yapılmaz.** Dosyaları platforma göre ikiye bölmek, yarın bir gün kelime mantığı değiştiğinde bir platformda yapılıp diğerinde unutulmasına (kod drift/bug) yol açar.
* Tüm platform farkları tek dosya içinde `Platform.select` ve `Platform.OS` ile çözülür.

---

## 6. 🎯 HIZLI ÇALIŞMA KILAVUZU (AGENT & DEVELOPER)

Bir özellik geliştirilirken veya hata düzeltilirken:
1. **İlişkili Bileşenleri Kontrol Et:** Bir kelime alanı değişiyorsa `CardComponent`, `LearnMatchWordCard`, `DictionaryScreen` ve `WordVaultScreen` paralel düşünülür; tek bir ekranda yapıp diğerini eksik bırakmak yasaktır.
2. **Platform Uyumunu Kontrol Et:** Gölge ve radius farkları için `Platform.select` kullanılır, butonlar ekranın altında tutarlı kalır.
3. **TypeScript Denetimi:** Her değişiklikten sonra `npx tsc --noEmit` çalıştırılarak sıfır hata garantilenir.
4. **Kısa ve Amaca Yönelik İstekler:** Bu dosya hafızada olduğu için kullanıcı yalnızca *"Kelime detayına etimoloji kartı ekle"* dediğinde bileşen ayrımı, tema renkleri, null kontrolleri ve TypeScript tipleri otomatik olarak bu standartlara göre yazılır.
