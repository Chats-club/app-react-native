import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { speakChinese } from '../utils/speech';

export default function FlashCards({ vocab, onComplete }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seen, setSeen] = useState(() => new Set());
  const flipAnim = useRef(new Animated.Value(0)).current;

  const card = vocab[index];
  const isLast = index === vocab.length - 1;

  function toggleFlip() {
    Animated.timing(flipAnim, {
      toValue: flipped ? 0 : 180,
      duration: 350,
      useNativeDriver: true,
    }).start();
    setFlipped((f) => !f);
  }

  function markSeen(i) {
    setSeen((prev) => {
      const next = new Set(prev);
      next.add(i);
      if (next.size === vocab.length) onComplete?.();
      return next;
    });
  }

  function goNext() {
    markSeen(index);
    flipAnim.setValue(0);
    setFlipped(false);
    setIndex((i) => Math.min(i + 1, vocab.length - 1));
  }

  function goPrev() {
    flipAnim.setValue(0);
    setFlipped(false);
    setIndex((i) => Math.max(i - 1, 0));
  }

  const frontInterpolate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const backInterpolate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [89, 90], outputRange: [1, 0] });
  const backOpacity = flipAnim.interpolate({ inputRange: [89, 90], outputRange: [0, 1] });

  return (
    <View style={styles.container}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round((seen.size / vocab.length) * 100)}%` }]} />
      </View>

      <TouchableOpacity activeOpacity={0.9} onPress={toggleFlip} style={styles.cardTouchable}>
        <Animated.View
          style={[styles.face, styles.front, { transform: [{ rotateY: frontInterpolate }], opacity: frontOpacity }]}
        >
          <Text style={styles.emoji}>{card.emoji}</Text>
          <Text style={styles.hanzi}>{card.hanzi}</Text>
          <Text style={styles.hint}>tap to flip</Text>
        </Animated.View>

        <Animated.View
          style={[styles.face, styles.back, { transform: [{ rotateY: backInterpolate }], opacity: backOpacity }]}
        >
          <View style={styles.pinyinTag}>
            <Text style={styles.pinyinText}>{card.pinyin}</Text>
          </View>
          <Text style={styles.englishText}>{card.english}</Text>
          <TouchableOpacity
            style={styles.soundBtn}
            onPress={(e) => {
              e.stopPropagation?.();
              speakChinese(card.hanzi);
            }}
          >
            <Ionicons name="volume-high" size={20} color="#374151" />
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.controls}>
        <TouchableOpacity onPress={goPrev} disabled={index === 0} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={20} color={index === 0 ? '#d1d5db' : '#374151'} />
        </TouchableOpacity>
        <Text style={styles.counter}>{index + 1} / {vocab.length}</Text>
        {isLast ? (
          <TouchableOpacity onPress={() => markSeen(index)} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={goNext} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 16, paddingVertical: 8 },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', width: '100%', overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: '#b91c1c' },
  cardTouchable: { width: '100%', height: 220 },
  face: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backfaceVisibility: 'hidden',
  },
  front: { backgroundColor: '#fff' },
  back: { backgroundColor: '#f9fafb' },
  emoji: { fontSize: 48 },
  hanzi: { fontSize: 32, fontWeight: '600' },
  hint: { color: '#9ca3af', fontSize: 12 },
  pinyinTag: { backgroundColor: '#dbeafe', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  pinyinText: { color: '#1d4ed8', fontSize: 15 },
  englishText: { fontSize: 18, color: '#374151' },
  soundBtn: { padding: 10, borderRadius: 999, backgroundColor: '#e5e7eb' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  navBtn: { padding: 10, borderRadius: 999, borderWidth: 1, borderColor: '#e5e7eb' },
  counter: { color: '#6b7280', fontSize: 13, width: 64, textAlign: 'center' },
  doneBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#b91c1c', borderRadius: 999 },
  doneBtnText: { color: '#fff', fontWeight: '600' },
});
