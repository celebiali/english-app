import { PromoCodeInfo, SubscriptionPlan } from '../types';
import { ENV_CONFIG } from '../config/env';

export { PromoCodeInfo, SubscriptionPlan };

/**
 * Standard base seed promo codes (Fallback & Offline cache)
 */
const SEED_PROMO_CODES: Record<string, PromoCodeInfo> = {
  ALI20: {
    code: 'ALI20',
    discountPercent: 20,
    teacherName: 'Ali Hoca',
    channelName: 'Ali Hoca YDS İngilizce',
    commissionPercent: 20,
    isValid: true,
  },
  ALİ20: {
    code: 'ALİ20',
    discountPercent: 20,
    teacherName: 'Ali Hoca',
    channelName: 'Ali Hoca YDS İngilizce',
    commissionPercent: 20,
    isValid: true,
  },
  HAKAN20: {
    code: 'HAKAN20',
    discountPercent: 20,
    teacherName: 'Hakan Hoca',
    channelName: 'Hakan ile YDS Taktikleri',
    commissionPercent: 20,
    isValid: true,
  },
  YDS20: {
    code: 'YDS20',
    discountPercent: 20,
    teacherName: 'YDS Master Özel',
    channelName: 'YDS Master Resmi İndirim',
    commissionPercent: 0,
    isValid: true,
  },
  YOKDIL20: {
    code: 'YOKDIL20',
    discountPercent: 20,
    teacherName: 'YÖKDİL Akademi',
    channelName: 'YÖKDİL Hazırlık',
    commissionPercent: 20,
    isValid: true,
  },
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_1m',
    title: '1 Aylık Hızlı Sprint',
    durationMonths: 1,
    originalPrice: 349,
    features: [
      'Tüm Soru Tiplerine Erişim',
      'AI Hata Teşhisi ve Çeldirici Analizi',
      'Aralıklı Tekrar Kelime Havuzu',
    ],
  },
  {
    id: 'plan_3m',
    title: '3 Aylık YDS Tam Hazırlık',
    durationMonths: 3,
    originalPrice: 590,
    badge: 'EN ÇOK TERCİH EDİLEN ⭐',
    isPopular: true,
    features: [
      'Sınav Gününe Kadar Sınırsız AI Koçluğu',
      'Tüm Master Deneme Sınavları (80 Soru)',
      'Sınırsız Özgün AI Soru Üretimi',
      'Zayıf Nokta ve Tuzak Teşhis Raporu',
      'Çevrimdışı Çalışma & Bulut Senkronizasyonu',
    ],
  },
  {
    id: 'plan_12m',
    title: '12 Aylık YDS & YÖKDİL VIP',
    durationMonths: 12,
    originalPrice: 1090,
    badge: '%70 AVANTAJ',
    features: [
      '1 Yıl Boyunca Tüm Sınavlara Tam Erişim',
      'Tüm Yeni Eklenen Master Denemeler',
      'Ömür Boyu Kelime Defteri Yedekleme',
      'Öncelikli AI Sunucu Hızı',
    ],
  },
];

export class PromoCodeService {
  private static dynamicCache: Map<string, PromoCodeInfo> = new Map(
    Object.entries(SEED_PROMO_CODES)
  );

  /**
   * Register or update a promo code at runtime
   */
  static registerPromoCode(info: PromoCodeInfo) {
    const key = info.code.trim().toUpperCase();
    this.dynamicCache.set(key, { ...info, code: key });
  }

  /**
   * DYNAMIC VALIDATION:
   * 1. Checks Supabase Cloud Database (`promo_codes` table) in real-time
   * 2. Checks Dynamic In-Memory Cache
   * 3. Fallbacks to Smart Pattern Matching (e.g. `[NAME]20` or `[NAME]15`)
   */
  static async validateCodeAsync(inputCode: string): Promise<PromoCodeInfo | null> {
    if (!inputCode) return null;
    const clean = inputCode.trim().toUpperCase();

    // 1. Check in-memory / registered cache first
    if (this.dynamicCache.has(clean)) {
      const cached = this.dynamicCache.get(clean)!;
      if (cached.isValid) return cached;
    }

    // 2. Query Supabase Cloud Database for dynamically created teacher codes
    const cloudMatch = await this.fetchPromoFromCloud(clean);
    if (cloudMatch) {
      this.registerPromoCode(cloudMatch);
      return cloudMatch;
    }

    // 3. Smart Dynamic Pattern Matching (Allows any new teacher code like CANAN20, MURAT20, etc.)
    const patternMatch = this.detectDynamicPatternCode(clean);
    if (patternMatch) {
      this.registerPromoCode(patternMatch);
      return patternMatch;
    }

    return null;
  }

  /**
   * Synchronous fallback check for instant UI rendering
   */
  static validateCode(inputCode: string): PromoCodeInfo | null {
    if (!inputCode) return null;
    const clean = inputCode.trim().toUpperCase();

    if (this.dynamicCache.has(clean)) {
      const cached = this.dynamicCache.get(clean)!;
      if (cached.isValid) return cached;
    }

    return this.detectDynamicPatternCode(clean);
  }

  /**
   * Fetch promo code directly from Supabase Cloud Table
   */
  private static async fetchPromoFromCloud(code: string): Promise<PromoCodeInfo | null> {
    const url = ENV_CONFIG.SUPABASE_URL;
    const key = ENV_CONFIG.SUPABASE_ANON_KEY;
    if (!url || !key) return null;

    try {
      const endpoint = `${url.replace(/\/$/, '')}/rest/v1/promo_codes?code=ilike.${encodeURIComponent(
        code
      )}&is_valid=eq.true&select=*`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const rows = await response.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const row = rows[0];
          return {
            code: row.code.toUpperCase(),
            discountPercent: Number(row.discount_percent) || 20,
            teacherName: row.teacher_name || `${row.code} Özel`,
            channelName: row.channel_name || 'YDS Öğretmen Ortaklığı',
            commissionPercent: Number(row.commission_percent) || 20,
            isValid: Boolean(row.is_valid),
          };
        }
      }
    } catch (err) {
      console.warn('Dynamic promo cloud query skipped (offline/unconfigured):', err);
    }
    return null;
  }

  /**
   * Smart pattern detection: Any string ending in a 2-digit percentage (e.g. `SERKAN20`, `EBRU25`, `KEMAL10`)
   */
  private static detectDynamicPatternCode(code: string): PromoCodeInfo | null {
    // Regex matches 2+ letters followed by a discount number (10 to 50)
    const match = code.match(/^([A-ZÇĞİÖŞÜa-zçğıöşü]{2,15})(\d{2})$/);
    if (!match) return null;

    const rawName = match[1];
    const discount = parseInt(match[2], 10);

    // Only accept realistic discounts between 10% and 50%
    if (discount < 10 || discount > 50) return null;

    // Capitalize teacher name: e.g. "SERKAN" -> "Serkan Hoca"
    const formattedName =
      rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase() + ' Hoca';

    return {
      code: code.toUpperCase(),
      discountPercent: discount,
      teacherName: formattedName,
      channelName: `${formattedName} YDS Takipçileri`,
      commissionPercent: 20,
      isValid: true,
    };
  }

  /**
   * Log promo code conversion to Supabase for commission tracking
   */
  static async recordPromoUsage(
    promoCode: string,
    planId: string,
    amountPaid: number,
    userId?: string
  ): Promise<boolean> {
    const url = ENV_CONFIG.SUPABASE_URL;
    const key = ENV_CONFIG.SUPABASE_ANON_KEY;
    if (!url || !key) return false;

    try {
      const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/promo_usage_logs`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          promo_code: promoCode.toUpperCase(),
          plan_id: planId,
          amount_paid: amountPaid,
          user_id: userId || 'anonymous_user',
          created_at: new Date().toISOString(),
        }),
      });
      return response.ok;
    } catch (err) {
      console.warn('Promo usage logging skipped (offline):', err);
      return false;
    }
  }

  /**
   * Calculates discounted prices for all plans given a promo code or promo object
   */
  static getCalculatedPlans(promo?: PromoCodeInfo | string | null): SubscriptionPlan[] {
    let validPromo: PromoCodeInfo | null = null;

    if (typeof promo === 'string') {
      validPromo = this.validateCode(promo);
    } else if (promo && typeof promo === 'object') {
      validPromo = promo;
    }

    return SUBSCRIPTION_PLANS.map((plan) => {
      if (validPromo && validPromo.isValid) {
        const discountFactor = (100 - validPromo.discountPercent) / 100;
        const discounted = Math.round(plan.originalPrice * discountFactor);
        return {
          ...plan,
          discountedPrice: discounted,
        };
      }
      return {
        ...plan,
        discountedPrice: undefined,
      };
    });
  }
}
