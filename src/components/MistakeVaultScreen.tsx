import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { useLearningStore } from '../store/useLearningStore';
import { MistakeItem } from '../types';
import { SmoothBottomSheet } from './SmoothBottomSheet';

export const MistakeVaultScreen: React.FC = () => {
  const {
    mistakes,
    selectedMistake,
    isAnalyzingMistake,
    selectMistake,
    analyzeMistakeWithAI,
    archiveMistake,
  } = useLearningStore();

  const handleOpenMistake = async (item: MistakeItem) => {
    selectMistake(item);
    if (!item.ai_analysis) {
      await analyzeMistakeWithAI(item);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topline} />

        {/* SCREEN 4: MV-HEADER IN HTML */}
        <View style={styles.mvHeader}>
          <View style={styles.mvCount}>
            <Text style={styles.mvCountText}>{mistakes.length || 18}</Text>
          </View>
          <View>
            <Text style={styles.mvTitle}>Hata Kasan</Text>
            <Text style={styles.mvSubtitle}>Çözülmemiş hatalar</Text>
          </View>
        </View>

        {/* INSIGHT BANNER */}
        <View style={styles.mvInsight}>
          <Text style={styles.mvInsightText}>
            🎯 Zayıflıklarını güçlü yönlere çevir — bugün 3 hatanı "mezun et".
          </Text>
        </View>

        {/* MISTAKE CARDS LIST */}
        {mistakes.length > 0 ? (
          mistakes.map((m) => {
            const q = m.question;
            return (
              <TouchableOpacity
                key={m.id}
                style={styles.mistakeCard}
                onPress={() => handleOpenMistake(m)}
                activeOpacity={0.8}
              >
                <View style={styles.mistakeTop}>
                  <Text style={styles.mistakeTopic}>
                    {q.type.replace('_', ' ')}
                  </Text>
                  <Text style={styles.mistakeDate}>
                    {new Date(m.created_at).toLocaleDateString('tr-TR')}
                  </Text>
                </View>

                <Text style={styles.mistakePreview} numberOfLines={2}>
                  "{q.question_text}"
                </Text>

                {/* COMPARE ROW IN HTML */}
                <View style={styles.compareRow}>
                  <View style={[styles.comparePill, styles.compareWrong]}>
                    <Text style={styles.compareWrongText}>
                      Seçimin: {m.user_selected_option}
                    </Text>
                  </View>

                  <Text style={styles.compareArrow}>➔</Text>

                  <View style={[styles.comparePill, styles.compareRight]}>
                    <Text style={styles.compareRightText}>
                      Doğru: {q.correct_option}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <CheckCircle2 size={44} color="#10B981" />
            <Text style={styles.emptyTitle}>Tebrikler! Hata Kasan Boş</Text>
            <Text style={styles.emptySubtitle}>
              Denemelerde ve görevlerde yanlış yaptığın sorular otomatik olarak buraya eklenir.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* SCREEN 4: BREAKDOWN MODAL IN HTML */}
      <SmoothBottomSheet
        visible={!!selectedMistake}
        onClose={() => selectMistake(null)}
        maxHeight="86%"
      >
        <View style={styles.bmSheetContent}>
          {selectedMistake && (
            <>
              <View style={styles.bmHeader}>
                <Text style={styles.eyebrow}>AI DERİN ANALİZ</Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => selectMistake(null)}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {isAnalyzingMistake ? (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator size="small" color="#7C3AED" />
                    <Text style={styles.loadingText}>
                      Yapay zeka çeldirici analizini hazırlıyor...
                    </Text>
                  </View>
                ) : selectedMistake.ai_analysis ? (
                  <>
                    {/* GOOD BOX (YEŞİL) */}
                    <View style={[styles.bmBox, styles.bmBoxGood]}>
                      <Text style={styles.bmHGood}>✅ Neden Doğru?</Text>
                      <Text style={styles.bmBoxText}>
                        {selectedMistake.ai_analysis.why_correct}
                      </Text>
                    </View>

                    {/* BAD BOX (KIRMIZI) */}
                    <View style={[styles.bmBox, styles.bmBoxBad]}>
                      <Text style={styles.bmHBad}>⚠️ Neden Tuzağa Düştün?</Text>
                      <Text style={styles.bmBoxText}>
                        {selectedMistake.ai_analysis.why_distractor_failed}
                      </Text>
                    </View>

                    {/* KEY VOCABULARY */}
                    {selectedMistake.ai_analysis.key_vocabulary?.length > 0 && (
                      <>
                        <Text style={[styles.eyebrow, { marginTop: 14, marginBottom: 8 }]}>
                          ANAHTAR AKADEMİK KELİMELER
                        </Text>
                        <View style={styles.vocabChipRow}>
                          {selectedMistake.ai_analysis.key_vocabulary.map((v, i) => (
                            <View key={i} style={styles.vocabChip}>
                              <Text style={styles.vocabChipText}>{v}</Text>
                            </View>
                          ))}
                        </View>
                      </>
                    )}
                  </>
                ) : null}
              </ScrollView>

              {/* GRADUATE BUTTON */}
              <TouchableOpacity
                style={styles.graduateBtn}
                onPress={() => archiveMistake(selectedMistake)}
                activeOpacity={0.8}
              >
                <Text style={styles.graduateBtnText}>🎓 Bu Soruyu Öğrendim</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SmoothBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 40,
  },
  topline: {
    height: 10,
  },
  mvHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  mvCount: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mvCountText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#DC2626',
  },
  mvTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  mvSubtitle: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  mvInsight: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginVertical: 14,
  },
  mvInsightText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#9A3412',
    lineHeight: 18,
  },
  mistakeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.03)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  mistakeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mistakeTopic: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#7C3AED',
    textTransform: 'uppercase',
  },
  mistakeDate: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  mistakePreview: {
    fontSize: 13.5,
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 10,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  comparePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  compareWrong: {
    backgroundColor: '#FEE2E2',
  },
  compareWrongText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  compareRight: {
    backgroundColor: '#D1FAE5',
  },
  compareRightText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  compareArrow: {
    color: '#94A3B8',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  bmSheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  bmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: '#F1F4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  bmBox: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  bmBoxGood: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  bmHGood: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 6,
  },
  bmBoxBad: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  bmHBad: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#DC2626',
    marginBottom: 6,
  },
  bmBoxText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
  },
  vocabChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 16,
  },
  vocabChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
  },
  vocabChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4F46E5',
  },
  graduateBtn: {
    backgroundColor: '#059669',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
  graduateBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#7C3AED',
  },
});
