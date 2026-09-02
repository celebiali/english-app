/**
 * Uygulama Genel Yapılandırma ve API Anahtarları
 */
export const ENV_CONFIG = {
  // Supabase Bulut Veritabanı Bilgileri (Bağlandı ✓)
  SUPABASE_URL: 'https://zkaxmzpfmjkemtkawicz.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_UEhJHeQUBRw9IsLqIAVECA_FPfoU2aV',

  // Google AI Studio Gemini API Key (Bağlandı ✓)
  GEMINI_API_KEY: 'AQ.Ab8RN6LwCnmE_6tQgq8of-G50VRyey58XjhD3OMrpui-UtJeig',

  // Apple StoreKit / RevenueCat Yapılandırması
  // RevenueCat Dashboard > Project Settings > API Keys > Public Apple API Key
  REVENUECAT_APPLE_API_KEY: 'appl_YDSpRatIKPrOmasterKey2025',

  // Apple In-App Purchase Product IDs (App Store Connect ile birebir eşleşmeli)
  APPLE_PRODUCT_IDS: {
    PLAN_6M: 'ydspratik_599_6m_7dt',   // 6 Aylık Hazırlık (599 TL - 7 Gün Ücretsiz Deneme)
    PLAN_12M: 'ydspratik_1099_12m_7dt', // 12 Aylık Sınırsız VIP (1099 TL - 7 Gün Ücretsiz Deneme)
  },

  // Apple App Store Yasal Bağlantıları (Guideline 3.1.2)
  LEGAL: {
    TERMS_URL: 'https://english-app-three-azure.vercel.app/terms.html',
    PRIVACY_URL: 'https://english-app-three-azure.vercel.app/privacy.html',
    SUPPORT_EMAIL: 'destek@ydspratik.com',
    APPLE_STANDARD_EULA_URL: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  },
};
