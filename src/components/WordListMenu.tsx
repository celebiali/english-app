import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { ChevronRight, Plus, CheckCircle2 } from 'lucide-react-native';
import { WordWithProgress, dbService } from '../database/DatabaseService';
import { useLearningStore } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';
import { CustomWordModal } from './CustomWordModal';
import {
  LearnMatchCourse,
  LEARN_MATCH_COURSES,
  buildUnitsForCourse,
} from '../services/vocabLearnMatchData';
import { LearnMatchUnitList } from './LearnMatchUnitList';

export interface WordListMenuProps {
  words: WordWithProgress[];
  onStartStudyFolder?: (folderWords?: WordWithProgress[]) => void;
}

export const WordListMenu: React.FC<WordListMenuProps> = ({ words = [], onStartStudyFolder }) => {
  const { colors } = useThemeStore();
  const {
    loadVocabSession,
    loadVocabFolders,
    setActiveStudyFolder,
  } = useLearningStore();

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false);

  const safeWords = words || [];

  // Group courses by section
  const sections = useMemo(() => {
    const list = LEARN_MATCH_COURSES;
    const grouped: { [section: string]: LearnMatchCourse[] } = {
      'Başlangıç Seviyesi': [],
      'İleri Seviye': [],
      'YDS Özel Modülleri': [],
    };

    list.forEach((c) => {
      if (!grouped[c.section]) grouped[c.section] = [];
      grouped[c.section].push(c);
    });

    return grouped;
  }, []);

  const handleToggleLearned = async (word: WordWithProgress) => {
    const currentBox = word.box || 0;
    const targetBox = currentBox >= 2 ? 1 : 2;
    await dbService.updateWordBox(word.id, targetBox);
    await loadVocabSession();
    await loadVocabFolders();
  };

  const handleSelectCourse = async (course: LearnMatchCourse) => {
    setSelectedCourseId(course.id);

    // Sync active study folder with selected course
    const folderMapping: Record<string, string> = {
      course_a1: 'sys_vocab_a',
      course_a2: 'sys_vocab_a',
      course_b1: 'sys_vocab_b',
      course_b2: 'sys_vocab_b',
      course_c1: 'sys_vocab_c',
      course_conn: 'sys_conn',
      course_idiom: 'sys_idiom',
      course_root: 'sys_root',
      course_custom: 'custom_default',
    };

    if (folderMapping[course.id]) {
      await setActiveStudyFolder(folderMapping[course.id]);
    }
  };

  // If a course is selected, render LearnMatchUnitList
  if (selectedCourseId) {
    const activeCourse = LEARN_MATCH_COURSES.find((c) => c.id === selectedCourseId);
    if (activeCourse) {
      const units = buildUnitsForCourse(activeCourse, safeWords);
      return (
        <LearnMatchUnitList
          course={activeCourse}
          units={units}
          onBack={() => setSelectedCourseId(null)}
          onToggleLearned={handleToggleLearned}
        />
      );
    }
  }

  // Calculate course stats (learned words & total words)
  const getCourseStats = (course: LearnMatchCourse) => {
    let filtered: WordWithProgress[] = [];
    if (course.category === 'VOCABULARY') {
      filtered = safeWords.filter(
        (w) => w.category === 'VOCABULARY' && (!course.levelFilter || w.level === course.levelFilter)
      );
    } else if (course.category === 'CONNECTOR') {
      filtered = safeWords.filter((w) => w.category === 'CONNECTOR');
    } else if (course.category === 'IDIOM') {
      filtered = safeWords.filter((w) => w.category === 'IDIOM');
    } else if (course.category === 'PREFIX_ROOT') {
      filtered = safeWords.filter((w) => w.category === 'PREFIX_ROOT');
    } else if (course.category === 'CUSTOM') {
      filtered = safeWords.filter((w) => w.is_custom || w.subcategory === 'Özel Kelimeler');
    }

    const total = filtered.length;
    const learned = filtered.filter((w) => (w.box || 0) >= 2).length;
    const isCompleted = total > 0 && learned >= total;
    return { total, learned, isCompleted };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* SECTIONS & COURSES LIST */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(sections).map(([sectionTitle, courseList]) => {
          if (courseList.length === 0) return null;

          return (
            <View key={sectionTitle} style={styles.sectionContainer}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                {sectionTitle}
              </Text>

              <View style={styles.cardsList}>
                {courseList.map((course) => {
                  const { total, learned, isCompleted } = getCourseStats(course);

                  return (
                    <TouchableOpacity
                      key={course.id}
                      style={[
                        styles.courseCard,
                        {
                          backgroundColor: colors.cardBackground,
                          borderColor: colors.border,
                          shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
                        },
                      ]}
                      onPress={() => handleSelectCourse(course)}
                      activeOpacity={0.78}
                    >
                      {/* Left Thumbnail Image */}
                      <Image
                        source={{ uri: course.imageUrl }}
                        style={styles.courseThumb}
                        resizeMode="cover"
                      />

                      {/* Middle Info */}
                      <View style={styles.courseInfoCol}>
                        <View style={styles.titleRow}>
                          <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={1}>
                            {course.title}
                          </Text>
                          {isCompleted && (
                            <CheckCircle2 size={16} color={colors.brand} style={styles.checkIcon} />
                          )}
                        </View>

                        <Text style={[styles.courseSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                          {course.subtitle}
                        </Text>

                        {/* Status / Subtitle Pill */}
                        <View style={styles.bottomMetaRow}>
                          <Text style={[styles.metaStatusText, { color: colors.textSecondary }]}>
                            {course.badge || 'ücretsiz'}
                          </Text>
                          <Text style={[styles.dotSeparator, { color: colors.textSecondary }]}>•</Text>
                          <Text style={[styles.wordCountText, { color: colors.brand }]}>
                            {total} Kelime
                          </Text>
                          {learned > 0 && (
                            <>
                              <Text style={[styles.dotSeparator, { color: colors.textSecondary }]}>•</Text>
                              <Text style={[styles.learnedText, { color: colors.brand }]}>
                                {learned} Öğrenildi
                              </Text>
                            </>
                          )}
                        </View>
                      </View>

                      {/* Right Chevron */}
                      <View style={styles.chevronWrapper}>
                        <ChevronRight size={18} color={colors.textSecondary} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* CUSTOM WORD MODAL */}
      <CustomWordModal
        visible={isAddWordModalOpen}
        onClose={() => {
          setIsAddWordModalOpen(false);
          loadVocabSession();
          loadVocabFolders();
        }}
        initialFolderId="custom_default"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addWordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  addWordBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  cardsList: {
    gap: 12,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  courseThumb: {
    width: 76,
    height: 76,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  courseInfoCol: {
    flex: 1,
    paddingLeft: 14,
    paddingRight: 6,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  checkIcon: {
    marginLeft: 2,
  },
  courseSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  bottomMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  metaStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dotSeparator: {
    marginHorizontal: 5,
    fontSize: 10,
  },
  wordCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  learnedText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chevronWrapper: {
    paddingRight: 4,
  },
});
