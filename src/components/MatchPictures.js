import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { speakChinese } from '../utils/speech';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PAIR_COUNT = 12;

export default function MatchPictures({ vocab, onComplete }) {
  const [items] = useState(() => vocab.slice(0, PAIR_COUNT));
  const [pictures] = useState(() => shuffle(items));
  const [words] = useState(() => shuffle(items));
  const [selectedId, setSelectedId] = useState(null);
  const [matched, setMatched] = useState(() => new Set());
  const [wrongId, setWrongId] = useState(null);
  const [doneNotified, setDoneNotified] = useState(false);

  function handlePictureTap(item) {
    if (matched.has(item.hanzi)) return;
    speakChinese(item.hanzi);
    setSelectedId(item.hanzi);
    setWrongId(null);
  }

  function handleWordTap(item) {
    if (matched.has(item.hanzi) || selectedId === null) return;
    if (item.hanzi === selectedId) {
      const next = new Set(matched);
      next.add(item.hanzi);
      setMatched(next);
      setSelectedId(null);
      if (next.size === items.length && !doneNotified) {
        setDoneNotified(true);
        onComplete?.();
      }
    } else {
      setWrongId(item.hanzi);
      setTimeout(() => setWrongId(null), 400);
      setSelectedId(null);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Tap a picture to hear it, then tap its matching word.</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round((matched.size / items.length) * 100)}%` }]} />
      </View>

      <ScrollView style={{ maxHeight: 420 }}>
        <View style={styles.columns}>
          <View style={styles.column}>
            {pictures.map((item) => {
              const isMatched = matched.has(item.hanzi);
              const isSelected = selectedId === item.hanzi;
              return (
                <TouchableOpacity
                  key={item.hanzi}
                  disabled={isMatched}
                  onPress={() => handlePictureTap(item)}
                  style={[
                    styles.cell,
                    isMatched && styles.cellMatched,
                    isSelected && styles.cellSelected,
                  ]}
                >
                  <Text style={styles.emoji}>{item.emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.column}>
            {words.map((item) => {
              const isMatched = matched.has(item.hanzi);
              const isWrong = wrongId === item.hanzi;
              return (
                <TouchableOpacity
                  key={item.hanzi}
                  disabled={isMatched}
                  onPress={() => handleWordTap(item)}
                  style={[
                    styles.cell,
                    isMatched && styles.cellMatched,
                    isWrong && styles.cellWrong,
                  ]}
                >
                  <Text style={styles.wordHanzi}>{item.hanzi}</Text>
                  <Text style={styles.wordPinyin}>{item.pinyin}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <Text style={styles.counter}>Matched {matched.size} / {items.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  hint: { color: '#6b7280', fontSize: 13 },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: '#b91c1c' },
  columns: { flexDirection: 'row', gap: 10 },
  column: { flex: 1, gap: 8 },
  cell: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellMatched: { opacity: 0.3, backgroundColor: '#f3f4f6' },
  cellSelected: { borderColor: '#3b82f6', borderWidth: 2 },
  cellWrong: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  emoji: { fontSize: 26 },
  wordHanzi: { fontSize: 15, fontWeight: '500' },
  wordPinyin: { fontSize: 10, color: '#9ca3af' },
  counter: { textAlign: 'center', color: '#6b7280', fontSize: 13 },
});
