import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from 'react-native';
import { CardWord } from '../types';

export interface CardComponentProps {
  cardWord: CardWord;
  onAnswer: (isCorrect: boolean) => void;
  cardIndex: number;
  totalCards: number;
}

const { width } = Dimensions.get('window');

export const CardComponent: React.FC<CardComponentProps> = ({
  cardWord,
  onAnswer,
  cardIndex,
  totalCards,
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [cardWord.id]);

  return (
    <View style={styles.container}>
      {/* SCREEN 5: FLASH WRAP */}
      <View style={styles.flashWrap}>
        <Pressable
          style={styles.flashCard}
          onPress={() => setIsFlipped(!isFlipped)}
        >
          {!isFlipped ? (
            /* FRONT FACE */
            <View style={styles.flashFront}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{cardWord.level || 'B2 / C1'}</Text>
              </View>

              <Text style={styles.flashWord}>{cardWord.word}</Text>

              <Text style={styles.flashPhon}>
                {cardWord.etymology_note || 'akademik kelime'}
              </Text>

              <Text style={styles.tapHint}>↺ Anlamı görmek için dokun</Text>
            </View>
          ) : (
            /* BACK FACE */
            <View style={styles.flashBack}>
              <Text style={styles.fbTr}>{cardWord.meaning}</Text>

              {cardWord.synonyms && cardWord.synonyms.length > 0 && (
                <View style={styles.fbSynRow}>
                  {cardWord.synonyms.map((syn, idx) => (
                    <View key={idx} style={styles.fbSyn}>
                      <Text style={styles.fbSynText}>{syn}</Text>
                    </View>
                  ))}
                </View>
              )}

              {cardWord.example_sentence && (
                <View style={styles.fbEx}>
                  <Text style={styles.fbExEn}>"{cardWord.example_sentence}"</Text>
                  {cardWord.example_translation && (
                    <Text style={styles.fbExTr}>{cardWord.example_translation}</Text>
                  )}
                </View>
              )}
            </View>
          )}
        </Pressable>
      </View>

      {/* LEITNER ACTIONS ROW */}
      <View style={styles.leitnerActions}>
        <TouchableOpacity
          style={[styles.lact, styles.lactRepeat]}
          onPress={() => onAnswer(false)}
          activeOpacity={0.7}
        >
          <Text style={styles.lactRepeatText}>❌ Tekrar Et</Text>
          <Text style={styles.lactRepeatSub}>Kutu 1'de kalır</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.lact, styles.lactAdvance]}
          onPress={() => onAnswer(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.lactAdvanceText}>✅ Biliyorum</Text>
          <Text style={styles.lactAdvanceSub}>Kutu 2'ye ilerler</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  flashWrap: {
    height: 380,
    marginVertical: 8,
  },
  flashCard: {
    flex: 1,
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 6,
  },
  flashFront: {
    flex: 1,
    backgroundColor: '#3730A3',
    borderRadius: 26,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 20,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  flashWord: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
    lineHeight: 40,
  },
  flashPhon: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.72)',
    marginTop: 10,
    fontWeight: '600',
  },
  tapHint: {
    marginTop: 26,
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '700',
  },
  flashBack: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 24,
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: '#E7EAF3',
  },
  fbTr: {
    fontSize: 25,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  fbSynRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  fbSyn: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  fbSynText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#7C3AED',
  },
  fbEx: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginTop: 'auto',
    borderWidth: 1,
    borderColor: '#E7EAF3',
  },
  fbExEn: {
    fontSize: 13,
    lineHeight: 19,
    color: '#0F172A',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  fbExTr: {
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E7EAF3',
  },
  leitnerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  lact: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1.6,
  },
  lactRepeat: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  lactRepeatText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#DC2626',
  },
  lactRepeatSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 2,
    opacity: 0.8,
  },
  lactAdvance: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  lactAdvanceText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#059669',
  },
  lactAdvanceSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 2,
    opacity: 0.8,
  },
});
