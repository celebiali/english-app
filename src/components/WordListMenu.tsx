import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Folder,
  FolderPlus,
  BookOpen,
  Link,
  Dna,
  MessageSquareQuote,
  Star,
  Bookmark,
  Sparkles,
  Target,
  Briefcase,
  Heart,
  Zap,
  GraduationCap,
  Plus,
  Search,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Edit2,
  Play,
  RotateCcw,
} from 'lucide-react-native';
import { WordWithProgress, dbService } from '../database/DatabaseService';
import { CategoryType, WordLevel, VocabFolder, CardWord } from '../types';
import { useLearningStore } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';
import { CardComponent } from './CardComponent';
import { AddFolderModal } from './AddFolderModal';
import { CustomWordModal } from './CustomWordModal';

export interface WordListMenuProps {
  words: WordWithProgress[];
  onStartStudyFolder?: (folderWords: WordWithProgress[]) => void;
}

type StatusTabFilter = 'ALL' | 'STUDIED' | 'UNSTUDIED';
type LevelTabFilter = 'ALL' | WordLevel;

const LEVELS: { key: LevelTabFilter; label: string }[] = [
  { key: 'ALL', label: 'Tümü' },
  { key: 'A1', label: 'A1' },
  { key: 'A2', label: 'A2' },
  { key: 'B1', label: 'B1' },
  { key: 'B2', label: 'B2' },
  { key: 'C1', label: 'C1' },
];

export const WordListMenu: React.FC<WordListMenuProps> = ({ words = [] }) => {
  const { colors } = useThemeStore();
  const {
    vocabFolders,
    activeFolderId,
    setActiveFolderId,
    deleteVocabFolder,
    deleteWord,
    loadVocabSession,
  } = useLearningStore();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusTabFilter>('ALL');
  const [levelFilter, setLevelFilter] = useState<LevelTabFilter>('ALL');
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<VocabFolder | null>(null);
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false);
  const [targetFolderForNewWord, setTargetFolderForNewWord] = useState<string | null>(null);

  // Folder Flashcard Mode
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [flashIndex, setFlashIndex] = useState(0);

  const safeWords = words || [];
  const activeFolder = vocabFolders.find((f) => f.id === activeFolderId) || null;

  const renderFolderIcon = (iconName: string, color: string, size = 20) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen size={size} color={color} />;
      case 'Link':
        return <Link size={size} color={color} />;
      case 'Dna':
        return <Dna size={size} color={color} />;
      case 'MessageSquareQuote':
        return <MessageSquareQuote size={size} color={color} />;
      case 'Star':
        return <Star size={size} color={color} />;
      case 'Bookmark':
        return <Bookmark size={size} color={color} />;
      case 'Sparkles':
        return <Sparkles size={size} color={color} />;
      case 'Target':
        return <Target size={size} color={color} />;
      case 'Briefcase':
        return <Briefcase size={size} color={color} />;
      case 'Heart':
        return <Heart size={size} color={color} />;
      case 'Zap':
        return <Zap size={size} color={color} />;
      case 'GraduationCap':
        return <GraduationCap size={size} color={color} />;
      default:
        return <Folder size={size} color={color} />;
    }
  };

  // Get words belonging to active folder
  const getFolderWords = (folder: VocabFolder): WordWithProgress[] => {
    const systemCats = ['VOCABULARY', 'CONNECTOR', 'PREFIX_ROOT', 'IDIOM'];
    if (folder.is_system && folder.category_type) {
      return safeWords.filter((w) => w.category === folder.category_type);
    } else if (folder.id === 'custom_default') {
      return safeWords.filter(
        (w) => w.is_custom || (w.subcategory && !systemCats.includes(w.subcategory))
      );
    } else {
      return safeWords.filter((w) => w.subcategory === folder.name);
    }
  };

  const handleToggleLearned = async (word: WordWithProgress) => {
    const currentBox = word.box || 0;
    const targetBox = currentBox > 1 ? 1 : 2;
    await dbService.updateWordBox(word.id, targetBox);
    await loadVocabSession();
  };

  const handleDeleteWordPrompt = (word: WordWithProgress) => {
    Alert.alert(
      'Kelimeyi Sil',
      `"${word.word}" kelimesini klasörünüzden silmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await deleteWord(word.id);
          },
        },
      ]
    );
  };

  const handleDeleteFolderPrompt = (folder: VocabFolder) => {
    Alert.alert(
      'Klasörü Sil',
      `"${folder.name}" klasörünü ve içindeki kelimeleri silmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await deleteVocabFolder(folder.id);
          },
        },
      ]
    );
  };

  // ==========================================
  // VIEW 1: FOLDER FLASHCARD MODE
  // ==========================================
  if (activeFolder && isFlashcardMode) {
    const folderWords = getFolderWords(activeFolder);
    const currentFlashWord = folderWords[flashIndex];
    const isFinished = flashIndex >= folderWords.length;

    return (
      <View style={styles.container}>
        {/* Top bar for Flashcard Mode */}
        <View style={[styles.subHeaderBar, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              setIsFlashcardMode(false);
              setFlashIndex(0);
            }}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={colors.brand} />
            <Text style={[styles.backBtnText, { color: colors.brand }]}>Klasöre Dön</Text>
          </TouchableOpacity>
          <Text style={[styles.subHeaderTitle, { color: colors.text }]} numberOfLines={1}>
            {activeFolder.name} ({Math.min(flashIndex + 1, folderWords.length)}/{folderWords.length})
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={{ flex: 1, padding: 16 }}>
          {!isFinished && currentFlashWord ? (
            <CardComponent
              cardWord={currentFlashWord as CardWord}
              onAnswer={(isCorrect) => {
                dbService.updateWordBox(currentFlashWord.id, isCorrect ? 2 : 1);
                setFlashIndex((prev) => prev + 1);
              }}
              cardIndex={flashIndex}
              totalCards={folderWords.length}
            />
          ) : (
            <View style={[styles.finishedCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <CheckCircle2 size={48} color={colors.success} />
              <Text style={[styles.finishedTitle, { color: colors.text }]}>Klasör Seti Tamamlandı! 🎉</Text>
              <Text style={[styles.finishedSubtitle, { color: colors.textSecondary }]}>
                "{activeFolder.name}" klasöründeki {folderWords.length} kelimeyi tekrar ettiniz.
              </Text>
              <TouchableOpacity
                style={[styles.restartBtn, { backgroundColor: colors.brand }]}
                onPress={() => setFlashIndex(0)}
                activeOpacity={0.85}
              >
                <RotateCcw size={16} color={colors.textOnBrand} />
                <Text style={[styles.restartBtnText, { color: colors.textOnBrand }]}>Baştan Tekrar Et</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  // ==========================================
  // VIEW 2: ACTIVE FOLDER DETAIL & WORD LIST
  // ==========================================
  if (activeFolder) {
    const rawFolderWords = getFolderWords(activeFolder);

    // Apply Search, Status, and Level filters
    const filteredWords = rawFolderWords.filter((w) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchWord = w.word.toLowerCase().includes(q);
        const matchMeaning = w.meaning.toLowerCase().includes(q);
        if (!matchWord && !matchMeaning) return false;
      }

      if (levelFilter !== 'ALL' && w.level !== levelFilter) {
        return false;
      }

      if (statusFilter === 'STUDIED' && (w.box || 0) <= 1) {
        return false;
      }
      if (statusFilter === 'UNSTUDIED' && (w.box || 0) > 1) {
        return false;
      }

      return true;
    });

    const learnedCount = rawFolderWords.filter((w) => (w.box || 0) > 1).length;
    const progressPercent = rawFolderWords.length > 0 ? Math.round((learnedCount / rawFolderWords.length) * 100) : 0;

    return (
      <View style={styles.container}>
        {/* Top Back Navigation Bar */}
        <View style={[styles.subHeaderBar, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              setActiveFolderId(null);
              setSearchQuery('');
            }}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={colors.brand} />
            <Text style={[styles.backBtnText, { color: colors.brand }]}>Klasörler</Text>
          </TouchableOpacity>
          <View style={styles.subHeaderCenter}>
            <Text style={[styles.subHeaderTitle, { color: colors.text }]} numberOfLines={1}>
              {activeFolder.name}
            </Text>
          </View>
          {!activeFolder.is_system ? (
            <TouchableOpacity
              style={[styles.headerAddBtn, { backgroundColor: colors.brandLight }]}
              onPress={() => {
                setTargetFolderForNewWord(activeFolder.id);
                setIsAddWordModalOpen(true);
              }}
              activeOpacity={0.8}
            >
              <Plus size={16} color={colors.brand} />
              <Text style={[styles.headerAddBtnText, { color: colors.brand }]}>Ekle</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 44 }} />
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
          {/* Folder Hero Banner */}
          <View style={[styles.folderHero, { backgroundColor: activeFolder.color + '15', borderColor: activeFolder.color + '30' }]}>
            <View style={styles.folderHeroTopRow}>
              <View style={[styles.folderHeroIconBox, { backgroundColor: activeFolder.color }]}>
                {renderFolderIcon(activeFolder.icon, '#FFFFFF', 24)}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.folderHeroTitle, { color: colors.text }]}>{activeFolder.name}</Text>
                <Text style={[styles.folderHeroSubtitle, { color: colors.textSecondary }]}>
                  {activeFolder.description || `${rawFolderWords.length} kelime içeriyor`}
                </Text>
              </View>
            </View>

            {/* Progress & Flashcard Button Row */}
            <View style={styles.folderHeroStatsRow}>
              <View style={styles.folderProgressBox}>
                <View style={styles.folderProgressNumbers}>
                  <Text style={[styles.folderProgressText, { color: colors.text }]}>
                    Öğrenilme: <Text style={{ color: colors.brand, fontWeight: '800' }}>%{progressPercent}</Text>
                  </Text>
                  <Text style={[styles.folderProgressSub, { color: colors.textSecondary }]}>
                    {learnedCount} / {rawFolderWords.length} Kelime
                  </Text>
                </View>
                <View style={[styles.progressBarTrack, { backgroundColor: colors.subtleBackground }]}>
                  <View style={[styles.progressBarFill, { backgroundColor: activeFolder.color, width: `${progressPercent}%` }]} />
                </View>
              </View>

              {rawFolderWords.length > 0 && (
                <TouchableOpacity
                  style={[styles.flashcardStartBtn, { backgroundColor: activeFolder.color }]}
                  onPress={() => {
                    setFlashIndex(0);
                    setIsFlashcardMode(true);
                  }}
                  activeOpacity={0.85}
                >
                  <Play size={15} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.flashcardStartBtnText}>Flashcard</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Search Box */}
          <View style={[styles.searchBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Search size={16} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={`"${activeFolder.name}" içinde ara...`}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={[styles.clearSearchText, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Filters: Status & Level */}
          <View style={styles.filterSection}>
            {/* Status Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              <TouchableOpacity
                style={[
                  styles.filterPill,
                  statusFilter === 'ALL' && [styles.filterPillActive, { backgroundColor: colors.brandLight, borderColor: colors.brand }],
                  { backgroundColor: colors.subtleBackground, borderColor: colors.border },
                ]}
                onPress={() => setStatusFilter('ALL')}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: statusFilter === 'ALL' ? colors.brand : colors.textSecondary },
                    statusFilter === 'ALL' && { fontWeight: '800' },
                  ]}
                >
                  Tümü ({rawFolderWords.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterPill,
                  statusFilter === 'STUDIED' && [styles.filterPillActive, { backgroundColor: colors.successLight, borderColor: colors.success }],
                  { backgroundColor: colors.subtleBackground, borderColor: colors.border },
                ]}
                onPress={() => setStatusFilter('STUDIED')}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: statusFilter === 'STUDIED' ? colors.success : colors.textSecondary },
                    statusFilter === 'STUDIED' && { fontWeight: '800' },
                  ]}
                >
                  ✅ Öğrenildi ({learnedCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterPill,
                  statusFilter === 'UNSTUDIED' && [styles.filterPillActive, { backgroundColor: colors.brandLight, borderColor: colors.brand }],
                  { backgroundColor: colors.subtleBackground, borderColor: colors.border },
                ]}
                onPress={() => setStatusFilter('UNSTUDIED')}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: statusFilter === 'UNSTUDIED' ? colors.brand : colors.textSecondary },
                    statusFilter === 'UNSTUDIED' && { fontWeight: '800' },
                  ]}
                >
                  ⏳ Öğreniliyor ({rawFolderWords.length - learnedCount})
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Level Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.levelRow}>
              {LEVELS.map((lvl) => {
                const isSelected = levelFilter === lvl.key;
                return (
                  <TouchableOpacity
                    key={lvl.key}
                    style={[
                      styles.levelPill,
                      isSelected && [styles.levelPillActive, { backgroundColor: colors.brand, borderColor: colors.brand }],
                      { backgroundColor: colors.subtleBackground, borderColor: colors.border },
                    ]}
                    onPress={() => setLevelFilter(lvl.key)}
                  >
                    <Text
                      style={[
                        styles.levelPillText,
                        { color: isSelected ? colors.textOnBrand : colors.textSecondary },
                        isSelected && { fontWeight: '800' },
                      ]}
                    >
                      {lvl.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Words List */}
          {filteredWords.length > 0 ? (
            <View style={styles.cardsList}>
              {filteredWords.map((item) => {
                const isLearned = (item.box || 0) > 1;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.wordCard,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.border,
                        shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
                      },
                    ]}
                  >
                    {/* Top Row: Word & Level & Action */}
                    <View style={styles.cardHeader}>
                      <View style={styles.wordTitleRow}>
                        <Text style={[styles.wordText, { color: colors.text }]}>{item.word}</Text>
                        <View style={[styles.levelBadge, { backgroundColor: colors.brandLight }]}>
                          <Text style={[styles.levelBadgeText, { color: colors.brand }]}>{item.level || 'B2'}</Text>
                        </View>
                      </View>

                      <View style={styles.actionsRight}>
                        {/* Toggle Learned */}
                        <TouchableOpacity
                          style={[
                            styles.statusBtn,
                            isLearned
                              ? { backgroundColor: colors.successLight }
                              : { backgroundColor: colors.subtleBackground },
                          ]}
                          onPress={() => handleToggleLearned(item)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.statusBtnText,
                              { color: isLearned ? colors.success : colors.textSecondary },
                              { fontWeight: '800' },
                            ]}
                          >
                            {isLearned ? '✅ Öğrendim' : '⏳ Öğreniliyor'}
                          </Text>
                        </TouchableOpacity>

                        {/* Delete Word (Only for custom words inside user-created folders) */}
                        {!activeFolder.is_system && item.is_custom && (
                          <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => handleDeleteWordPrompt(item)}
                            activeOpacity={0.7}
                          >
                            <Trash2 size={16} color={colors.textSecondary} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {/* Meaning Box */}
                    <View style={[styles.meaningBox, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
                      <Text style={[styles.meaningText, { color: colors.text }]}>{item.meaning}</Text>
                    </View>

                    {/* Example Sentence */}
                    {item.example_sentence ? (
                      <View style={[styles.exampleBox, { borderLeftColor: activeFolder.color || colors.brand }]}>
                        <Text style={[styles.exampleEn, { color: colors.text }]}>"{item.example_sentence}"</Text>
                        {item.example_translation && (
                          <Text style={[styles.exampleTr, { color: colors.textSecondary }]}>{item.example_translation}</Text>
                        )}
                      </View>
                    ) : null}

                    {/* Synonyms */}
                    {item.synonyms && item.synonyms.length > 0 && (
                      <View style={styles.synonymsRow}>
                        {item.synonyms.map((s, idx) => (
                          <View key={idx} style={[styles.synonymChip, { backgroundColor: colors.brandLight }]}>
                            <Text style={[styles.synonymChipText, { color: colors.brand }]}>{s}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.brandLight }]}>
                <BookOpen size={36} color={colors.brand} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Kelime Bulunamadı</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {activeFolder.is_system
                  ? 'Bu hazır listede filtrenize uygun kelime bulunamadı.'
                  : 'Bu klasörde henüz kriterlere uygun kelime bulunmuyor. AI desteğiyle anında kelime ekleyebilirsiniz.'}
              </Text>
              {!activeFolder.is_system && (
                <TouchableOpacity
                  style={[styles.emptyAddBtn, { backgroundColor: colors.brand }]}
                  onPress={() => {
                    setTargetFolderForNewWord(activeFolder.id);
                    setIsAddWordModalOpen(true);
                  }}
                  activeOpacity={0.85}
                >
                  <Plus size={16} color={colors.textOnBrand} strokeWidth={2.5} />
                  <Text style={[styles.emptyAddBtnText, { color: colors.textOnBrand }]}>Bu Klasöre Kelime Ekle</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>

        {/* Modals */}
        <CustomWordModal
          visible={isAddWordModalOpen}
          onClose={() => setIsAddWordModalOpen(false)}
          initialFolderId={targetFolderForNewWord}
        />
        <AddFolderModal
          visible={isAddFolderModalOpen}
          onClose={() => {
            setIsAddFolderModalOpen(false);
            setFolderToEdit(null);
          }}
          folderToEdit={folderToEdit}
        />
      </View>
    );
  }

  // ==========================================
  // VIEW 3: MAIN VOCABULARY & FOLDERS DIRECTORY
  // ==========================================
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Section: Klasörlerim Header with embedded + Kelime Ekle */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>📁 Kelime Sözlüğü</Text>
            <Text style={[styles.sectionCountBadge, { color: colors.textSecondary }]}>
              {vocabFolders.length} Klasör
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.headerAddWordBtn, { backgroundColor: colors.brand }]}
            onPress={() => {
              const userFolders = vocabFolders.filter((f) => !f.is_system);
              if (userFolders.length === 0) {
                Alert.alert(
                  'Önce Klasör Oluşturun',
                  'Hazır sistem kelime listelerine ekleme yapılamaz. Kelimelerinizi kaydetmek için lütfen önce kendi klasörünüzü oluşturun.',
                  [
                    { text: 'Vazgeç', style: 'cancel' },
                    {
                      text: '+ Klasör Oluştur',
                      onPress: () => {
                        setFolderToEdit(null);
                        setIsAddFolderModalOpen(true);
                      },
                    },
                  ]
                );
                return;
              }
              setTargetFolderForNewWord(null);
              setIsAddWordModalOpen(true);
            }}
            activeOpacity={0.85}
          >
            <Plus size={14} color={colors.textOnBrand} strokeWidth={2.5} />
            <Text style={[styles.headerAddWordBtnText, { color: colors.textOnBrand }]}>Kelime Ekle</Text>
          </TouchableOpacity>
        </View>

        {/* Folders List */}
        <View style={styles.foldersGrid}>
          {vocabFolders.map((folder) => {
            const folderWords = getFolderWords(folder);
            const learnedCount = folderWords.filter((w) => (w.box || 0) > 1).length;
            const percentage = folderWords.length > 0 ? Math.round((learnedCount / folderWords.length) * 100) : 0;

            return (
              <TouchableOpacity
                key={folder.id}
                style={[
                  styles.folderCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
                  },
                ]}
                onPress={() => setActiveFolderId(folder.id)}
                activeOpacity={0.8}
              >
                {/* Folder Top Row */}
                <View style={styles.folderCardTop}>
                  <View style={[styles.folderIconBox, { backgroundColor: folder.color + '20' }]}>
                    {renderFolderIcon(folder.icon, folder.color, 22)}
                  </View>

                  <View style={styles.folderCardActions}>
                    {!folder.is_system && (
                      <>
                        <TouchableOpacity
                          style={styles.folderActionIconBtn}
                          onPress={() => {
                            setFolderToEdit(folder);
                            setIsAddFolderModalOpen(true);
                          }}
                          activeOpacity={0.7}
                        >
                          <Edit2 size={15} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.folderActionIconBtn}
                          onPress={() => handleDeleteFolderPrompt(folder)}
                          activeOpacity={0.7}
                        >
                          <Trash2 size={15} color={colors.textSecondary} />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>

                {/* Folder Name & Description */}
                <Text style={[styles.folderName, { color: colors.text }]} numberOfLines={1}>
                  {folder.name}
                </Text>
                <Text style={[styles.folderDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                  {folder.description || 'Kişisel kelime koleksiyonu'}
                </Text>

                {/* Folder Footer: Count & Progress */}
                <View style={styles.folderCardFooter}>
                  <View style={styles.folderCountRow}>
                    <Text style={[styles.folderCountNum, { color: colors.text }]}>
                      {folderWords.length} <Text style={{ fontSize: 11, color: colors.textSecondary }}>Kelime</Text>
                    </Text>
                    <Text style={[styles.folderPercentText, { color: folder.color }]}>%{percentage}</Text>
                  </View>
                  <View style={[styles.miniProgressTrack, { backgroundColor: colors.subtleBackground }]}>
                    <View style={[styles.miniProgressFill, { backgroundColor: folder.color, width: `${percentage}%` }]} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Modals */}
      <CustomWordModal
        visible={isAddWordModalOpen}
        onClose={() => setIsAddWordModalOpen(false)}
        initialFolderId={targetFolderForNewWord}
        onOpenAddFolder={() => {
          setIsAddWordModalOpen(false);
          setIsAddFolderModalOpen(true);
        }}
      />
      <AddFolderModal
        visible={isAddFolderModalOpen}
        onClose={() => {
          setIsAddFolderModalOpen(false);
          setFolderToEdit(null);
        }}
        folderToEdit={folderToEdit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.2,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 12,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionCountBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerAddWordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  headerAddWordBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  foldersGrid: {
    gap: 12,
  },
  folderCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  folderCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  folderIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  folderActionIconBtn: {
    padding: 6,
    borderRadius: 8,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  folderDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  folderCardFooter: {
    marginTop: 'auto',
  },
  folderCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  folderCountNum: {
    fontSize: 13,
    fontWeight: '800',
  },
  folderPercentText: {
    fontSize: 12,
    fontWeight: '800',
  },
  miniProgressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Sub Header for Active Folder Detail
  subHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  subHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  subHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  headerAddBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  detailScrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  folderHero: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  folderHeroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  folderHeroIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderHeroTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  folderHeroSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  folderHeroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  folderProgressBox: {
    flex: 1,
  },
  folderProgressNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  folderProgressText: {
    fontSize: 12,
  },
  folderProgressSub: {
    fontSize: 11,
  },
  progressBarTrack: {
    height: 7,
    borderRadius: 3.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3.5,
  },
  flashcardStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  flashcardStartBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.2,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '500',
  },
  clearSearchText: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  filterSection: {
    marginBottom: 14,
    gap: 8,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  filterPillActive: {},
  filterPillText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  levelRow: {
    flexDirection: 'row',
  },
  levelPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  levelPillActive: {},
  levelPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardsList: {
    gap: 12,
  },
  wordCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  wordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  levelBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBtn: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBtnText: {
    fontSize: 10.5,
  },
  deleteBtn: {
    padding: 4,
  },
  meaningBox: {
    borderRadius: 10,
    padding: 9,
    marginBottom: 8,
  },
  meaningText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  exampleBox: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 2,
    marginBottom: 8,
  },
  exampleEn: {
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  exampleTr: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  synonymsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  synonymChip: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  synonymChipText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 6,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 14,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  finishedCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 20,
  },
  finishedTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  finishedSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
  },
  restartBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
