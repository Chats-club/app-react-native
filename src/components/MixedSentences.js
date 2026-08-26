import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getChunkPinyins } from '../utils/pinyinChunks';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildPairs(sentence) {
  const pinyins = getChunkPinyins(sentence);
  return sentence.chunks.map((word, i) => ({ word, pinyin: pinyins ? pinyins[i] : null }));
}

function WordTile({ pair, color, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tile, { borderColor: color }]}>
      <Text style={styles.tileHanzi}>{pair.word}</Text>
      {pair.pinyin && <Text style={styles.tilePinyin}>{pair.pinyin}</Text>}
    </TouchableOpacity>
  );
}

export default function MixedSentences({ sentences, onComplete }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [pool, setPool] = useState(() => shuffle(buildPairs(sentences[0])));
  const [status, setStatus] = useState('playing');
  const [solvedCount, setSolvedCount] = useState(0);

  const sentence = sentences[index];
  const isLast = index === sentences.length - 1;
  const correctAnswer = useMemo(() => sentence.chunks.join(''), [sentence]);

  function pick(pair, poolIdx) {
    if (status !== 'playing') return;
    setSelected((s) => [...s, pair]);
    setPool((p) => p.filter((_, i) => i !== poolIdx));
  }

  function unpick(pair, selectedIdx) {
    if (status !== 'playing') return;
    setSelected((s) => s.filter((_, i) => i !== selectedIdx));
    setPool((p) => [...p, pair]);
  }

  function check() {
    const answer = selected.map((p) => p.word).join('');
    if (answer === correctAnswer) {
      setStatus('correct');
      setSolvedCount((c) => c + 1);
    } else {
      setStatus('wrong');
    }
  }

  function retry() {
    setStatus('playing');
    setSelected([]);
    setPool(shuffle(buildPairs(sentence)));
  }

  function next() {
    if (isLast) {
      onComplete?.();
      return;
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setSelected([]);
    setPool(shuffle(buildPairs(sentences[nextIndex])));
    setStatus('playing');
  }

  const tileColor = status === 'correct' ? '#22c55e' : status === 'wrong' ? '#ef4444' : '#3b82f6';

  return (
    <View style={styles.container}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round((solvedCount / sentences.length) * 100)}%` }]} />
      </View>
      <Text style={styles.meta}>Sentence {index + 1} / {sentences.length} — put the words in order</Text>
      <Text style={styles.english}>{sentence.english}</Text>

      <View style={styles.answerBox}>
        {selected.length === 0 && <Text style={styles.placeholder}>Tap words below to build the sentence</Text>}
        <View style={styles.wrap}>
          {selected.map((pair, i) => (
            <WordTile key={`${pair.word}-${i}`} pair={pair} color={tileColor} onPress={() => unpick(pair, i)} />
          ))}
        </View>
      </View>

      <View style={styles.wrap}>
        {pool.map((pair, i) => (
          <WordTile key={`${pair.word}-${i}`} pair={pair} color="#d1d5db" onPress={() => pick(pair, i)} />
        ))}
      </View>

      {status === 'correct' && (
        <Text style={styles.correctText}>
          {sentence.hanzi} <Text style={styles.correctPinyin}>({sentence.pinyin})</Text>
        </Text>
      )}

      <View style={styles.actions}>
        {status === 'wrong' && (
          <TouchableOpacity onPress={retry} style={styles.secondaryBtn}>
            <Ionicons name="refresh" size={16} color="#374151" />
            <Text style={styles.secondaryBtnText}>Retry</Text>
          </TouchableOpacity>
        )}
        {status !== 'correct' && (
          <TouchableOpacity
            onPress={check}
            disabled={pool.length > 0}
            style={[styles.primaryBtn, pool.length > 0 && styles.primaryBtnDisabled]}
          >
            <Text style={styles.primaryBtnText}>Check</Text>
          </TouchableOpacity>
        )}
        {status === 'correct' && (
          <TouchableOpacity onPress={next} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>{isLast ? 'Finish' : 'Next sentence'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: '#b91c1c' },
  meta: { color: '#6b7280', fontSize: 13 },
  english: { color: '#374151', fontSize: 15 },
  answerBox: {
    minHeight: 64,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 10,
  },
  placeholder: { color: '#9ca3af', fontSize: 13 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center' },
  tileHanzi: { fontSize: 16 },
  tilePinyin: { fontSize: 10, color: '#6b7280', marginTop: 1 },
  correctText: { color: '#16a34a', fontSize: 16 },
  correctPinyin: { color: '#9ca3af', fontSize: 13 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  primaryBtn: { backgroundColor: '#b91c1c', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  primaryBtnDisabled: { backgroundColor: '#f3a8a8' },
  primaryBtnText: { color: '#fff', fontWeight: '600' },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#d1d5db', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  secondaryBtnText: { color: '#374151' },
});
