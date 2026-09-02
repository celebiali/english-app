import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import {
  ShieldCheck,
  FileText,
  ExternalLink,
  Check,
  X,
} from 'lucide-react-native';
import { SmoothBottomSheet } from './SmoothBottomSheet';
import { useThemeStore } from '../store/useThemeStore';

interface LegalSheetModalProps {
  visible: boolean;
  onClose: () => void;
  initialTab?: 'PRIVACY' | 'TERMS';
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export const LegalSheetModal: React.FC<LegalSheetModalProps> = ({
  visible,
  onClose,
  initialTab = 'PRIVACY',
  onAccept,
  showAcceptButton = false,
}) => {
  const { colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'PRIVACY' | 'TERMS'>(initialTab);

  useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
    }
  }, [visible, initialTab]);

  const liveUrl =
    activeTab === 'PRIVACY'
      ? 'https://english-app-three-azure.vercel.app/privacy.html'
      : 'https://english-app-three-azure.vercel.app/terms.html';

  const handleOpenExternal = async () => {
    try {
      await Linking.openURL(liveUrl);
    } catch {
      // ignore
    }
  };

  const handleAcceptAndClose = () => {
    if (onAccept) {
      onAccept();
    }
    onClose();
  };

  return (
    <SmoothBottomSheet visible={visible} onClose={onClose} maxHeight="90%">
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'PRIVACY' && [
                  styles.tabButtonActive,
                  { borderBottomColor: colors.brand },
                ],
              ]}
              onPress={() => setActiveTab('PRIVACY')}
              activeOpacity={0.75}
            >
              <ShieldCheck
                size={16}
                color={activeTab === 'PRIVACY' ? colors.brand : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === 'PRIVACY' ? colors.brand : colors.textSecondary,
                    fontWeight: activeTab === 'PRIVACY' ? '700' : '500',
                  },
                ]}
              >
                Gizlilik (KVKK)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'TERMS' && [
                  styles.tabButtonActive,
                  { borderBottomColor: colors.brand },
                ],
              ]}
              onPress={() => setActiveTab('TERMS')}
              activeOpacity={0.75}
            >
              <FileText
                size={16}
                color={activeTab === 'TERMS' ? colors.brand : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === 'TERMS' ? colors.brand : colors.textSecondary,
                    fontWeight: activeTab === 'TERMS' ? '700' : '500',
                  },
                ]}
              >
                Şartlar (EULA)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.headerRightButtons}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.subtleBackground }]}
              onPress={handleOpenExternal}
              accessibilityLabel="Tarayıcıda Aç"
              activeOpacity={0.7}
            >
              <ExternalLink size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.subtleBackground }]}
              onPress={onClose}
              accessibilityLabel="Kapat"
              activeOpacity={0.7}
            >
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Document Body */}
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {activeTab === 'PRIVACY' ? (
            <View style={styles.documentWrapper}>
              <View style={[styles.badgeContainer, { backgroundColor: colors.brandLight }]}>
                <Text style={[styles.badgeText, { color: colors.brand }]}>
                  KVKK & GDPR Kapsamında Koruma Altındadır
                </Text>
              </View>

              <Text style={[styles.docTitle, { color: colors.text }]}>
                YDS Pratik Gizlilik Politikası
              </Text>
              <Text style={[styles.docSubtitle, { color: colors.textSecondary }]}>
                Son Güncelleme: Eylül 2026
              </Text>

              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  1. Toplanan Veriler ve Amaç
                </Text>
                <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                  YDS Pratik, kullanıcı deneyimini iyileştirmek, sınav koçluğu sağlamak ve kelime öğrenme ilerlemenizi takip etmek amacıyla sınırlı kişisel veri işler.
                </Text>
                <Text style={[styles.bulletItem, { color: colors.textSecondary }]}>
                  • <Text style={{ fontWeight: '700', color: colors.text }}>Hesap Bilgileri:</Text> E-posta adresi, ad-soyad (kayıt olunması halinde).
                </Text>
                <Text style={[styles.bulletItem, { color: colors.textSecondary }]}>
                  • <Text style={{ fontWeight: '700', color: colors.text }}>Öğrenme İstatistikleri:</Text> Çözülen soru sayıları, kelime kutuları (Leitner kutusu), hedef puan ve sınav deneme sonuçları.
                </Text>
                <Text style={[styles.bulletItem, { color: colors.textSecondary }]}>
                  • <Text style={{ fontWeight: '700', color: colors.text }}>Cihaz Verileri:</Text> Çevrimdışı SQLite senkronizasyonu için anonim cihaz kimliği.
                </Text>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  2. Veri Güvenliği ve Çevrimdışı Çalışma
                </Text>
                <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                  Uygulama öncelikli olarak cihazınızın yerel SQLite belleğinde çalışır. Verileriniz endüstri standardı SSL/TLS şifreleme ile korunur. Verileriniz hiçbir şekilde üçüncü şahıs veya reklam şirketlerine satılmaz veya pazarlama amacıyla paylaşılmaz.
                </Text>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  3. Apple & KVKK Kapsamında Haklarınız (Hesap Silme)
                </Text>
                <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                  6698 Sayılı KVKK ve Apple İnceleme Kuralları (Guideline 5.1.1) gereği, dilediğiniz an Ayarlar ekranındaki "Hesabımı ve Tüm Verilerimi Sil" seçeneğini kullanarak profilinizi, çalışma geçmişinizi ve tüm kayıtlarınızı anında kalıcı olarak silebilirsiniz.
                </Text>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  4. İletişim
                </Text>
                <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                  Gizlilikle ilgili tüm sorularınız için destek ekibimizle iletişime geçebilirsiniz:{'\n'}
                  <Text style={{ fontWeight: '600', color: colors.brand }}>support@ydspratik.app</Text>
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.documentWrapper}>
              <View style={[styles.badgeContainer, { backgroundColor: colors.brandLight }]}>
                <Text style={[styles.badgeText, { color: colors.brand }]}>
                  Apple Standart Son Kullanıcı Lisans Sözleşmesi (EULA)
                </Text>
              </View>

              <Text style={[styles.docTitle, { color: colors.text }]}>
                Kullanım Şartları ve Lisans Sözleşmesi
              </Text>
              <Text style={[styles.docSubtitle, { color: colors.textSecondary }]}>
                Son Güncelleme: Eylül 2026
              </Text>

              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  1. Lisansın Kapsamı
                </Text>
                <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                  YDS Pratik, kullanıcılara Yabancı Dil Bilgisi Seviye Tespit Sınavı'na (YDS) ve YÖKDİL'e hazırlanmaları için şahsi, devredilemez ve münhasır olmayan bir kullanım lisansı sunar.
                </Text>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  2. Fikri Mülkiyet Hakları
                </Text>
                <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                  Uygulama içerisinde yer alan tüm soru havuzu, yapay zeka analiz motoru, kelime etimoloji açıklamaları, seslendirmeler ve arayüz tasarımları YDS Pratik'e aittir. İçeriklerin izinsiz kopyalanması, çoğaltılması veya ticari amaçla kullanımı yasaktır.
                </Text>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  3. Sorumluluk Reddi (Disclaimer)
                </Text>
                <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                  YDS Pratik bağımsız bir sınav hazırlık uygulamasıdır; ÖSYM veya herhangi bir resmi devlet kurumu ile doğrudan bağlantısı veya temsilciliği bulunmamaktadır. Sınav başarı oranları kullanıcıların kişisel çalışma disiplinine bağlıdır.
                </Text>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  4. Hesap Askıya Alma ve Fesih
                </Text>
                <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                  Kullanım şartlarını ihlal eden, hile veya kötüye kullanım girişiminde bulunan hesaplar önceden bildirilmeksizin sonlandırılabilir.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer Accept Action Button */}
        {showAcceptButton && (
          <View style={[styles.footerBar, { borderTopColor: colors.border, backgroundColor: colors.cardBackground }]}>
            <TouchableOpacity
              style={[styles.acceptButton, { backgroundColor: colors.brand }]}
              onPress={handleAcceptAndClose}
              activeOpacity={0.85}
            >
              <Check size={18} color={colors.textOnBrand} />
              <Text style={[styles.acceptButtonText, { color: colors.textOnBrand }]}>
                Okudum ve Kabul Ediyorum
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SmoothBottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {},
  tabText: {
    fontSize: 14,
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  documentWrapper: {
    gap: 16,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  docTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  docSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: -8,
  },
  sectionBlock: {
    gap: 6,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
  },
  bulletItem: {
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 4,
  },
  footerBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  acceptButton: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
