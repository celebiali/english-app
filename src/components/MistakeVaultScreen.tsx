import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {
  Sparkles,
  BookmarkPlus,
  Plus,
  Check,
  ChevronLeft,
} from 'lucide-react-native';
import { useLearningStore } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';
import { MistakeItem } from '../types';
import { CustomWordModal } from './CustomWordModal';
import { SmoothBottomSheet } from './SmoothBottomSheet';

import { dbService } from '../database/DatabaseService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MistakeVaultScreenProps {
  onBack?: () => void;
  onBackToTasks?: () => void;
}

export const MistakeVaultScreen: React.FC<MistakeVaultScreenProps> = ({ onBack, onBackToTasks }) => {
  const handleBack = onBack || onBackToTasks;
  const {
    mistakes,
    selectedMistake,
    isAnalyzingMistake,
    selectMistake,
    archiveMistake,
    loadVocabSession,
  } = useLearningStore();

  const { colors } = useThemeStore();

  const [addedWords, setAddedWords] = useState<Record<string, boolean>>({});
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [modalWord, setModalWord] = useState('');
  const [modalMeaning, setModalMeaning] = useState('');
  const [isPassageExpanded, setIsPassageExpanded] = useState(false);

  const handleOpenMistake = (item: MistakeItem) => {
    setIsPassageExpanded(false);
    selectMistake(item);
  };

  const handleQuickAddWord = async (word: string, meaning: string) => {
    if (!word) return;
    const cleanWord = word.trim();
    await dbService.insertCustomWord({
      word: cleanWord,
      meaning: meaning || 'Akademik Kelime',
      category: 'VOCABULARY',
      subcategory: 'Mistake Vault',
      level: 'B2',
    });
    await loadVocabSession();
    setAddedWords((prev) => ({ ...prev, [cleanWord.toLowerCase()]: true }));
  };

  const handleOpenCustomWordModal = (word: string, meaning: string) => {
    setModalWord(word);
    setModalMeaning(meaning);
    setIsWordModalOpen(true);
  };

  const parseVocabItem = (item: any): { word: string; meaning: string } => {
    if (typeof item === 'string') {
      const parts = item.split(':');
      if (parts.length > 1) {
        return { word: parts[0].trim(), meaning: parts.slice(1).join(':').trim() };
      }
      return { word: item.trim(), meaning: '' };
    }
    if (item && typeof item === 'object') {
      return { word: item.word || '', meaning: item.meaning || item.turkish || '' };
    }
    return { word: '', meaning: '' };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.mvHeader}>
          {handleBack && (
            <TouchableOpacity
              style={[
                styles.inlineBackBtn,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
                },
              ]}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <ChevronLeft size={20} color={colors.brand} />
            </TouchableOpacity>
          )}

          <View style={{ flex: 1 }}>
            <View style={styles.mvTitleRow}>
              <Text style={[styles.mvTitle, { color: colors.text }]}>Hata Defteri</Text>
              <View style={[styles.mvCountPill, { backgroundColor: colors.accentWarmLight }]}>
                <Text style={[styles.mvCountPillText, { color: colors.accentWarm }]}>{mistakes.length} Yanlış</Text>
              </View>
            </View>
            <Text style={[styles.mvSubtitle, { color: colors.textSecondary }]}>
              ÖSYM çeldirici analizleri ve zayıf nokta telafisi
            </Text>
          </View>
        </View>

        {/* INSIGHT BANNER */}
        {mistakes.length > 0 && (
          <View
            style={[
              styles.mvInsight,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
              },
            ]}
          >
            <Text style={[styles.mvInsightText, { color: colors.text }]}>
              🎯 Zayıf noktalarını güçlendir — bugün {Math.min(3, mistakes.length)} hatanı inceleyip telafi et.
            </Text>
          </View>
        )}

        {/* MISTAKE CARDS LIST */}
        {mistakes.length > 0 ? (
          mistakes.map((m) => {
            const q = m.question;
            return (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.mistakeCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
                  },
                ]}
                onPress={() => handleOpenMistake(m)}
                activeOpacity={0.8}
              >
                <View style={styles.mistakeTop}>
                  <Text style={[styles.mistakeTopic, { color: colors.brand }]}>
                    {q.type.replace('_', ' ')}
                  </Text>
                  <Text style={[styles.mistakeDate, { color: colors.textSecondary }]}>
                    {new Date(m.created_at).toLocaleDateString('tr-TR')}
                  </Text>
                </View>

                <Text style={[styles.mistakePreview, { color: colors.text }]} numberOfLines={2}>
                  "{q.question_text}"
                </Text>

                {/* COMPARE ROW */}
                <View style={styles.compareRow}>
                  <View style={[styles.comparePill, { backgroundColor: colors.errorLight }]}>
                    <Text style={[styles.compareWrongText, { color: colors.error }]}>
                      Seçimin: {m.user_selected_option}
                    </Text>
                  </View>

                  <Text style={[styles.compareArrow, { color: colors.textSecondary }]}>➔</Text>

                  <View style={[styles.comparePill, { backgroundColor: colors.successLight }]}>
                    <Text style={[styles.compareRightText, { color: colors.success }]}>
                      Doğru: {q.correct_option}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Kayıtlı hata bulunmuyor. Denemelerde ve görevlerde yanlış yaptığın sorular otomatik olarak buraya eklenir.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* SCREEN 4: BREAKDOWN MODAL */}
      <SmoothBottomSheet
        visible={!!selectedMistake}
        onClose={() => selectMistake(null)}
        maxHeight="90%"
      >
        <View style={[styles.bmSheetContent, { backgroundColor: colors.cardBackground }]}>
          {selectedMistake && (
            <>
              {/* Modal Header */}
              <View style={styles.bmHeader}>
                <View style={styles.bmHeaderLeft}>
                  <Sparkles size={16} color={colors.brand} />
                  <Text style={[styles.eyebrow, { color: colors.brand }]}>AI DERİN ANALİZ</Text>
                </View>
                <TouchableOpacity
                  style={[styles.closeBtn, { backgroundColor: colors.subtleBackground }]}
                  onPress={() => selectMistake(null)}
                >
                  <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.bmScrollView}
                contentContainerStyle={styles.bmScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Passage / Question Preview if present */}
                {selectedMistake.question.passage && (
                  <View style={[styles.passageCard, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
                    <View style={styles.passageHead}>
                      <Text style={[styles.passageTitle, { color: colors.textSecondary }]}>Akademik Okuma Paragrafı</Text>
                    </View>
                    <Text
                      style={[styles.passageText, { color: colors.text }]}
                      numberOfLines={isPassageExpanded ? undefined : 3}
                    >
                      {selectedMistake.question.passage}
                    </Text>
                    <TouchableOpacity
                      style={styles.expandToggle}
                      onPress={() => setIsPassageExpanded(!isPassageExpanded)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.expandLabel, { color: colors.brand }]}>
                        {isPassageExpanded ? 'Metni daralt ▴' : 'Metnin tamamını göster ▾'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Soru Kökü */}
                <View style={[styles.questionStemBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <Text style={[styles.questionStemText, { color: colors.text }]}>
                    "{selectedMistake.question.question_text}"
                  </Text>
                </View>

                {isAnalyzingMistake ? (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator size="small" color={colors.brand} />
                    <Text style={[styles.loadingText, { color: colors.brand }]}>
                      Yapay zeka çeldirici analizini ve akademik kelimeleri hazırlıyor...
                    </Text>
                  </View>
                ) : selectedMistake.ai_analysis ? (
                  <>
                    {/* TRAP TYPE BADGE */}
                    {((selectedMistake.ai_analysis.trap_types && selectedMistake.ai_analysis.trap_types.length > 0) || selectedMistake.ai_analysis.trap_type) && (
                      <View style={[styles.trapTypeBanner, { backgroundColor: colors.accentWarmLight, borderColor: colors.accentWarmLight }]}>
                        <Text style={[styles.trapTypeLabel, { color: colors.accentWarm }]}>🚨 ÇELDİRİCİ TUZAĞI</Text>
                        <Text style={[styles.trapTypeValue, { color: colors.accentWarm }]}>
                          {selectedMistake.ai_analysis.trap_types && selectedMistake.ai_analysis.trap_types.length > 0
                            ? selectedMistake.ai_analysis.trap_types.join(' • ')
                            : selectedMistake.ai_analysis.trap_type}
                        </Text>
                      </View>
                    )}

                    {/* GOOD BOX (YEŞİL) */}
                    <View style={[styles.bmBox, { backgroundColor: colors.successLight, borderColor: colors.successLight }]}>
                      <View style={styles.bmBoxHeadRow}>
                        <View style={[styles.greenDot, { backgroundColor: colors.success }]} />
                        <Text style={[styles.bmHGood, { color: colors.success }]}>
                          {selectedMistake.ai_analysis.evidence_source === 'grammar_rule'
                            ? `Doğru Cevap & Gramer Kuralı: (${selectedMistake.question.correct_option})`
                            : `Doğru Cevap & Metin Kanıtı: (${selectedMistake.question.correct_option})`}
                        </Text>
                      </View>
                      <Text style={[styles.bmBoxText, { color: colors.text }]}>
                        {selectedMistake.ai_analysis.correct_evidence || selectedMistake.ai_analysis.why_correct}
                      </Text>
                    </View>

                    {/* BAD BOX (KIRMIZI) */}
                    <View style={[styles.bmBox, { backgroundColor: colors.errorLight, borderColor: colors.errorLight }]}>
                      <View style={styles.bmBoxHeadRow}>
                        <View style={[styles.redDot, { backgroundColor: colors.error }]} />
                        <Text style={[styles.bmHBad, { color: colors.error }]}>
                          Neden Tuzağa Düştün? ({selectedMistake.user_selected_option})
                        </Text>
                      </View>
                      <Text style={[styles.bmBoxText, { color: colors.text }]}>
                        {selectedMistake.ai_analysis.why_wrong || selectedMistake.ai_analysis.why_distractor_failed}
                      </Text>
                    </View>

                    {/* INTERACTIVE KEY VOCABULARY SECTION */}
                    {selectedMistake.ai_analysis.key_vocabulary?.length > 0 && (
                      <View style={[styles.vocabSection, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
                        <View style={styles.vocabSectionHeader}>
                          <View style={styles.vocabHeaderTitleRow}>
                            <BookmarkPlus size={16} color={colors.brand} />
                            <Text style={[styles.vocabSectionHeading, { color: colors.brand }]}>
                              ANAHTAR AKADEMİK KELİMELER
                            </Text>
                          </View>
                          <Text style={[styles.vocabSectionSub, { color: colors.textSecondary }]}>
                            Bilmediğin kelimeleri tek tıkla kelime kasana ekle:
                          </Text>
                        </View>

                        <View style={styles.vocabCardsList}>
                          {selectedMistake.ai_analysis.key_vocabulary.map((rawItem, idx) => {
                            const parsed = parseVocabItem(rawItem);
                            const isAdded = !!addedWords[parsed.word.toLowerCase()];

                            return (
                              <View key={idx} style={[styles.vocabItemCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                                <TouchableOpacity
                                  style={styles.vocabItemLeft}
                                  onPress={() =>
                                    handleOpenCustomWordModal(parsed.word, parsed.meaning)
                                  }
                                  activeOpacity={0.7}
                                >
                                  <Text style={[styles.vocabItemWord, { color: colors.text }]}>{parsed.word}</Text>
                                  {parsed.meaning ? (
                                    <Text style={[styles.vocabItemMeaning, { color: colors.textSecondary }]}>
                                      {parsed.meaning}
                                    </Text>
                                  ) : null}
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={[
                                    styles.vocabAddBtn,
                                    isAdded
                                      ? { backgroundColor: colors.successLight, borderColor: colors.successLight }
                                      : { backgroundColor: colors.brandLight, borderColor: colors.brandLightBorder },
                                  ]}
                                  onPress={() =>
                                    handleQuickAddWord(parsed.word, parsed.meaning)
                                  }
                                  activeOpacity={0.8}
                                >
                                  {isAdded ? (
                                    <>
                                      <Check size={13} color={colors.success} strokeWidth={2.5} />
                                      <Text style={[styles.vocabAddBtnDoneText, { color: colors.success }]}>Kasada</Text>
                                    </>
                                  ) : (
                                    <>
                                      <Plus size={13} color={colors.brand} strokeWidth={2.5} />
                                      <Text style={[styles.vocabAddBtnActionText, { color: colors.brand }]}>
                                        Kasaya At
                                      </Text>
                                    </>
                                  )}
                                </TouchableOpacity>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    )}
                  </>
                ) : null}
              </ScrollView>

              {/* SOLVED / REMOVE FROM VAULT BUTTON */}
              <View style={[styles.bmBottomFooter, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
                <TouchableOpacity
                  style={[styles.graduateBtn, { backgroundColor: colors.success }]}
                  onPress={() => archiveMistake(selectedMistake)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.graduateBtnText, { color: colors.textOnBrand }]}>✅ Bu Hatayı Öğrendim (Kasadan Kaldır)</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </SmoothBottomSheet>

      {/* Custom Word Modal */}
      <CustomWordModal
        visible={isWordModalOpen}
        onClose={() => setIsWordModalOpen(false)}
        initialWord={modalWord}
        initialMeaning={modalMeaning}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 40,
  },
  mvHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  inlineBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginRight: 12,
  },
  mvTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mvTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  mvCountPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  mvCountPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  mvSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 3,
  },
  mvInsight: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  mvInsightText: {
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 18,
  },
  mistakeCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginTop: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  mistakeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  mistakeTopic: {
    fontSize: 11.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  mistakeDate: {
    fontSize: 11,
    fontWeight: '600',
  },
  mistakePreview: {
    fontSize: 13.5,
    fontWeight: '600',
    lineHeight: 19,
    marginBottom: 12,
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
  compareWrongText: {
    fontSize: 12,
    fontWeight: '700',
  },
  compareRightText: {
    fontSize: 12,
    fontWeight: '700',
  },
  compareArrow: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 40,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  bmSheetContent: {
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  bmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 4,
  },
  bmHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  bmScrollView: {
    maxHeight: SCREEN_HEIGHT * 0.58,
  },
  bmScrollContent: {
    paddingBottom: 20,
  },
  passageCard: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  passageHead: {
    marginBottom: 4,
  },
  passageTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  passageText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  expandToggle: {
    marginTop: 6,
  },
  expandLabel: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  questionStemBox: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  questionStemText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  bmBox: {
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1.2,
  },
  bmBoxHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trapTypeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.2,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  trapTypeLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  trapTypeValue: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  bmHGood: {
    fontSize: 13,
    fontWeight: '800',
  },
  bmHBad: {
    fontSize: 13,
    fontWeight: '800',
  },
  bmBoxText: {
    fontSize: 13,
    lineHeight: 20,
  },
  vocabSection: {
    marginTop: 6,
    marginBottom: 14,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
  },
  vocabSectionHeader: {
    marginBottom: 10,
  },
  vocabHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  vocabSectionHeading: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  vocabSectionSub: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  vocabCardsList: {
    gap: 8,
  },
  vocabItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  vocabItemLeft: {
    flex: 1,
    marginRight: 10,
  },
  vocabItemWord: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  vocabItemMeaning: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 2,
  },
  vocabAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  vocabAddBtnActionText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  vocabAddBtnDoneText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  bmBottomFooter: {
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
  },
  graduateBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  graduateBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
  },
});
