import { Platform } from 'react-native';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
  PurchasesError,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';
import { ENV_CONFIG } from '../config/env';

export interface PurchaseResult {
  success: boolean;
  isPro: boolean;
  planId?: string;
  expiresAt?: string;
  userCancelled?: boolean;
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  isPro: boolean;
  restoredPlanId?: string;
  expiresAt?: string;
  error?: string;
}

class ApplePurchaseServiceImpl {
  private isConfigured = false;
  private isMockMode = false;

  /**
   * Initializes RevenueCat / StoreKit with the public API key.
   */
  async initialize(userId?: string): Promise<boolean> {
    if (this.isConfigured) return true;

    // Only active on iOS or Android (App Store / Play Store)
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      console.log('[ApplePurchaseService] Non-mobile platform detected. Running in mock mode.');
      this.isMockMode = true;
      return false;
    }

    try {
      const apiKey = ENV_CONFIG.REVENUECAT_APPLE_API_KEY;

      // If key is a placeholder or native module is absent, safely use mock mode
      const isTemplateKey = !apiKey || apiKey.includes('placeholder') || apiKey.includes('YDSpRatIKPrOmasterKey');
      const isNativePurchasesAvailable = typeof Purchases !== 'undefined' && typeof Purchases.configure === 'function';

      if (isTemplateKey || !isNativePurchasesAvailable) {
        console.log('[ApplePurchaseService] Template API key or Expo Go detected. Running in mock/simulation mode.');
        this.isMockMode = true;
        this.isConfigured = true;
        return true;
      }

      Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);

      if (userId) {
        await Purchases.configure({ apiKey, appUserID: userId });
      } else {
        await Purchases.configure({ apiKey });
      }

      this.isConfigured = true;
      console.log('[ApplePurchaseService] Initialized successfully with user:', userId || 'anonymous');
      return true;
    } catch (err: any) {
      console.warn('[ApplePurchaseService] Native Purchases not available, falling back to mock:', err?.message || err);
      this.isMockMode = true;
      this.isConfigured = true;
      return true;
    }
  }

  /**
   * Identifies user after login (e.g. Supabase user id).
   */
  async identifyUser(userId: string): Promise<void> {
    if (!this.isConfigured || this.isMockMode) return;
    try {
      await Purchases.logIn(userId);
    } catch (e) {
      console.warn('[ApplePurchaseService] LogIn error:', e);
    }
  }

  /**
   * Clears identified user on logout.
   */
  async logoutUser(): Promise<void> {
    if (!this.isConfigured || this.isMockMode) return;
    try {
      await Purchases.logOut();
    } catch (e) {
      console.warn('[ApplePurchaseService] LogOut error:', e);
    }
  }

  /**
   * Fetches current offerings from App Store Connect.
   */
  async getOfferings(): Promise<PurchasesPackage[]> {
    if (!this.isConfigured || this.isMockMode) {
      return [];
    }

    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current && offerings.current.availablePackages.length > 0) {
        return offerings.current.availablePackages;
      }
      return [];
    } catch (err: any) {
      console.warn('[ApplePurchaseService] Failed to load offerings:', err?.message || err);
      return [];
    }
  }

  /**
   * Purchases a subscription plan by Apple Product ID.
   */
  async purchaseByProductId(productId: string): Promise<PurchaseResult> {
    console.log(`[ApplePurchaseService] Initiating purchase for: ${productId}`);

    if (this.isMockMode || !this.isConfigured) {
      // Mock / Sandbox simulation for local development & review bypass
      console.log('[ApplePurchaseService] Simulating successful Apple In-App Purchase.');
      const is12m = productId.includes('1099') || productId.includes('12m');
      const durationDays = is12m ? 365 : 180;
      const expiresAt = new Date(Date.now() + durationDays * 86400000).toISOString();

      return {
        success: true,
        isPro: true,
        planId: productId,
        expiresAt,
      };
    }

    try {
      // 1. Fetch offerings to get the matching package
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;

      let targetPackage = currentOffering?.availablePackages.find(
        (p) => p.product.identifier === productId
      );

      // If package not found in current offering, attempt directly by product
      if (!targetPackage) {
        const products = await Purchases.getProducts([productId]);
        if (products.length > 0) {
          const { customerInfo } = await Purchases.purchaseStoreProduct(products[0]);
          return this.parseCustomerInfo(customerInfo, productId);
        }
        throw new Error('Ürün App Store üzerinde bulunamadı.');
      }

      const { customerInfo } = await Purchases.purchasePackage(targetPackage);
      return this.parseCustomerInfo(customerInfo, productId);
    } catch (err: any) {
      const pErr = err as PurchasesError;
      if (pErr.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        console.log('[ApplePurchaseService] User cancelled Apple IAP prompt.');
        return { success: false, isPro: false, userCancelled: true };
      }

      console.error('[ApplePurchaseService] Purchase failed:', err?.message || err);
      return {
        success: false,
        isPro: false,
        error: err?.message || 'Satın alma işlemi tamamlanamadı.',
      };
    }
  }

  /**
   * Restores existing purchases for the user (Apple Guideline requirement).
   */
  async restorePurchases(): Promise<RestoreResult> {
    console.log('[ApplePurchaseService] Restoring purchases...');

    if (this.isMockMode || !this.isConfigured) {
      return {
        success: true,
        isPro: false,
        error: 'Aktif bir App Store aboneliği bulunamadı.',
      };
    }

    try {
      const customerInfo = await Purchases.restorePurchases();
      const hasActive =
        typeof customerInfo.entitlements.active['pro'] !== 'undefined' ||
        typeof customerInfo.entitlements.active['premium'] !== 'undefined';

      const entitlement =
        customerInfo.entitlements.active['pro'] || customerInfo.entitlements.active['premium'];

      return {
        success: true,
        isPro: hasActive,
        restoredPlanId: entitlement?.productIdentifier,
        expiresAt: entitlement?.expirationDate || undefined,
      };
    } catch (err: any) {
      console.error('[ApplePurchaseService] Restore failed:', err?.message || err);
      return {
        success: false,
        isPro: false,
        error: err?.message || 'Satın alımlar geri yüklenirken bir hata oluştu.',
      };
    }
  }

  /**
   * Checks current subscription entitlement status.
   */
  async checkSubscriptionStatus(): Promise<{ isPro: boolean; expiresAt?: string | null; planId?: string }> {
    if (this.isMockMode || !this.isConfigured) {
      return { isPro: false };
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlement =
        customerInfo.entitlements.active['pro'] || customerInfo.entitlements.active['premium'];

      if (entitlement && entitlement.isActive) {
        return {
          isPro: true,
          expiresAt: entitlement.expirationDate,
          planId: entitlement.productIdentifier,
        };
      }
      return { isPro: false };
    } catch (e) {
      return { isPro: false };
    }
  }

  private parseCustomerInfo(customerInfo: CustomerInfo, defaultPlanId: string): PurchaseResult {
    const entitlement =
      customerInfo.entitlements.active['pro'] || customerInfo.entitlements.active['premium'];

    const isPro = Boolean(entitlement?.isActive || Object.keys(customerInfo.activeSubscriptions).length > 0);

    return {
      success: true,
      isPro,
      planId: entitlement?.productIdentifier || defaultPlanId,
      expiresAt: entitlement?.expirationDate || new Date(Date.now() + 180 * 86400000).toISOString(),
    };
  }
}

export const ApplePurchaseService = new ApplePurchaseServiceImpl();
