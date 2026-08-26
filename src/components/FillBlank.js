import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { speakChinese } from '../utils/speech';
import { generateFillBlankItems } from '../utils/fillBlank';

export default function FillBlank({ vocab, sentences, onComplete }) {
  const items = useMemo(() => generateFillBlankItems(sentences, vocab, 24), [sentences, vocab]);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState('playing');
  const [wrongOption, setWrongOption] = useState(null);
  const [solvedCount, setSolvedCount] = useState(0);

  const item = items[index];
  const isLast = index === items.length - 1;

  function handleOptionTap(opt) {
    if (status !== 'playing') return;
    if (opt.word === item.answer) {
      setStatus('correct');
      setSolvedCount((c) => c + 1);
    } else {
      setWrongOption(opt.word);
      setTimeout(() => setWrongOption(null), 400);
    }
  }

  function next() {
    if (isLast) {
      onComplete?.();
      return;
    }
    setIndex((i) => i + 1);
    setStatus('playing');
    setWrongOption(null);
  }

  if (!item) {
    return <Text style={styles.hint}>Not enough sentence content to build this exercise yet.</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round((solvedCount / items.length) * 100)}%` }]} />
      </View>
      <Text style={styles.meta}>Item {index + 1} / {items.length} — listen and pick the missing word</Text>

      <View style={styles.sentenceBox}>
        <TouchableOpacity style={styles.soundBtn} onPress={() => speakChinese(item.sentence.hanzi)}>
          <Ionicons name="volume-high" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.hint}>tap to hear the sentence</Text>

        <View style={styles.wrap}>
          {item.sentence.chunks.map((chunk, i) =>
            i === item.blankIndex ? (
              <View key={i} style={[styles.blank, status === 'correct' && styles.blankRevealed]}>
                <Text style={[styles.blankText, status === 'correct' && styles.blankTextRevealed]}>
                  {status === 'correct' ? item.answer : '？'}
                </Text>
                {status === 'correct' && item.answerPinyin && (
                  <Text style={styles.blankPinyin}>{item.answerPinyin}</Text>
                )}
              </View>
            ) : (
              <View key={i} style={styles.chunkBox}>
                <Text style={styles.chunkText}>{chunk}</Text>
                {item.chunkPinyins[i] && <Text style={styles.chunkPinyin}>{item.chunkPinyins[i]}</Text>}
              </View>
            )
          )}
        </View>

        <Text style={styles.english}>{item.sentence.english}</Text>
      </View>

      <View style={styles.optionsGrid}>
        {item.options.map((opt) => {
          const isCorrectChoice = status === 'correct' && opt.word === item.answer;
          const isWrongChoice = wrongOption === opt.word;
          return (
            <TouchableOpacity
              key={opt.word}
              disabled={status === 'correct'}
              onPress={() => handleOptionTap(opt)}
              style={[
                styles.optionBtn,
                isCorrectChoice && styles.optionCorrect,
                isWrongChoice && styles.optionWrong,
              ]}
            >
              <Text style={styles.optionHanzi}>{opt.word}</Text>
              {opt.pinyin && <Text style={styles.optionPinyin}>{opt.pinyin}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      {status === 'correct' && (
        <TouchableOpacity onPress={next} style={styles.nextBtn}>
          <Text style={styles.nextBtnText}>{isLast ? 'Finish' : 'Next'}</Text>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: '#b91c1c' },
  meta: { color: '#6b7280', fontSize: 13 },
  sentenceBox: { alignItems: 'center', gap: 6, backgroundColor: '#f9fafb', borderRadius: 12, paddingVertical: 20, paddingHorizontal: 12 },
  soundBtn: { backgroundColor: '#b91c1c', padding: 14, borderRadius: 999 },
  hint: { color: '#9ca3af', fontSize: 11 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 8 },
  chunkBox: { alignItems: 'center', paddingHorizontal: 4 },
  chunkText: { fontSize: 18 },
  chunkPinyin: { fontSize: 10, color: '#9ca3af' },
  blank: {
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 44,
  },
  blankRevealed: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  blankText: { fontSize: 18, color: '#d1d5db' },
  blankTextRevealed: { color: '#16a34a' },
  blankPinyin: { fontSize: 10, color: '#16a34a' },
  english: { color: '#6b7280', fontSize: 13, marginTop: 8, textAlign: 'center' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: {
    width: '48%',
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  optionCorrect: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  optionWrong: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  optionHanzi: { fontSize: 16, fontWeight: '500' },
  optionPinyin: { fontSize: 11, color: '#6b7280' },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#b91c1c',
    borderRadius: 10,
    paddingVertical: 12,
    alignSelf: 'flex-end',
    paddingHorizontal: 18,
  },
  nextBtnText: { color: '#fff', fontWeight: '600' },
});
