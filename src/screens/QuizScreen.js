import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import lessons from '../data/lessons';
import { speakChinese } from '../utils/speech';
import { recordQuizAnswer } from '../utils/progress';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestions(vocab, count) {
  const pool = shuffle(vocab).slice(0, count);
  return pool.map((item) => {
    const askEnglish = Math.random() < 0.5;
    const distractors = shuffle(vocab.filter((v) => v.hanzi !== item.hanzi)).slice(0, 3);
    const options = shuffle([item, ...distractors]);
    return { id: item.hanzi, item, askEnglish, options };
  });
}

export default function QuizScreen() {
  const allVocab = useMemo(() => {
    const rows = [];
    for (const lesson of lessons) {
      if (lesson.locked) continue;
      rows.push(...lesson.vocab);
    }
    return rows;
  }, []);

  const questions = useMemo(() => buildQuestions(allVocab, Math.min(500, allVocab.length)), [allVocab]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [attemptedCount, setAttemptedCount] = useState(null);

  if (allVocab.length < 4) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Not enough vocabulary yet for a quiz</Text>
      </View>
    );
  }

  const question = questions[index];
  const isLast = index === questions.length - 1;

  function handleSelect(option) {
    if (selected) return;
    const correct = option.hanzi === question.item.hanzi;
    setSelected(option.hanzi);
    if (correct) setScore((s) => s + 1);
    recordQuizAnswer({ id: question.id, item: question.item, askEnglish: question.askEnglish }, correct);
    if (!question.askEnglish) speakChinese(question.item.hanzi);
  }

  function next() {
    if (isLast) {
      setAttemptedCount(questions.length);
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setAttemptedCount(null);
  }

  if (finished) {
    const total = attemptedCount ?? questions.length;
    return (
      <View style={styles.centerContainer}>
        <Ionicons name={total > 0 && score / total >= 0.7 ? 'trophy' : 'school'} size={48} color="#b91c1c" />
        <Text style={styles.resultTitle}>{score} / {total} correct</Text>
        <Text style={styles.resultSubtitle}>Nice work — keep practicing to lock it in.</Text>
        <TouchableOpacity onPress={restart} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quiz</Text>
        <Text style={styles.subtitle}>Multiple choice, sampled from every unlocked lesson.</Text>
      </View>

      <View style={{ paddingHorizontal: 16, gap: 14, flex: 1 }}>
        <View style={styles.topRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round((index / questions.length) * 100)}%` }]} />
          </View>
          <TouchableOpacity
            onPress={() => {
              setAttemptedCount(selected ? index + 1 : index || 0);
              setFinished(true);
            }}
            style={styles.endBtn}
          >
            <Text style={styles.endBtnText}>End quiz</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.meta}>Question {index + 1} / {questions.length}</Text>

        <View style={styles.card}>
          {question.askEnglish ? (
            <>
              <Text style={styles.hanzi}>{question.item.hanzi}</Text>
              <Text style={styles.pinyin}>{question.item.pinyin}</Text>
              <TouchableOpacity style={styles.soundBtnSmall} onPress={() => speakChinese(question.item.hanzi)}>
                <Ionicons name="volume-medium" size={16} color="#374151" />
              </TouchableOpacity>
              <Text style={styles.prompt}>What does this mean?</Text>
            </>
          ) : (
            <>
              <Text style={styles.englishPrompt}>{question.item.english}</Text>
              <Text style={styles.prompt}>Which word matches?</Text>
            </>
          )}
        </View>

        <View style={styles.optionsGrid}>
          {question.options.map((opt) => {
            const isCorrect = selected && opt.hanzi === question.item.hanzi;
            const isWrongPick = selected === opt.hanzi && opt.hanzi !== question.item.hanzi;
            return (
              <TouchableOpacity
                key={opt.hanzi}
                disabled={!!selected}
                onPress={() => handleSelect(opt)}
                style={[styles.optionBtn, isCorrect && styles.optionCorrect, isWrongPick && styles.optionWrong]}
              >
                {question.askEnglish ? (
                  <Text style={styles.optionText}>{opt.english}</Text>
                ) : (
                  <>
                    <Text style={styles.optionHanzi}>{opt.hanzi}</Text>
                    <Text style={styles.optionPinyin}>{opt.pinyin}</Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {selected && (
          <TouchableOpacity onPress={next} style={styles.primaryBtnFull}>
            <Text style={styles.primaryBtnText}>{isLast ? 'See results' : 'Next'}</Text>
            <Ionicons name="chevron-forward" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  subtitle: { color: '#6b7280', fontSize: 13, marginTop: 2 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: '#b91c1c' },
  endBtn: { borderWidth: 1, borderColor: '#d1d5db', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  endBtnText: { fontSize: 11, color: '#374151' },
  meta: { color: '#6b7280', fontSize: 13 },
  card: { alignItems: 'center', gap: 6, backgroundColor: '#f9fafb', borderRadius: 16, paddingVertical: 24 },
  hanzi: { fontSize: 30 },
  pinyin: { color: '#1d4ed8' },
  englishPrompt: { fontSize: 18, color: '#374151' },
  soundBtnSmall: { padding: 6, borderRadius: 999, backgroundColor: '#f3f4f6' },
  prompt: { color: '#9ca3af', fontSize: 11, marginTop: 4 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: { width: '48%', height: 64, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  optionCorrect: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  optionWrong: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  optionText: { fontSize: 14, color: '#374151', textAlign: 'center', paddingHorizontal: 6 },
  optionHanzi: { fontSize: 16, fontWeight: '500' },
  optionPinyin: { fontSize: 11, color: '#6b7280' },
  primaryBtn: { backgroundColor: '#b91c1c', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, marginTop: 8 },
  primaryBtnFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#b91c1c', borderRadius: 10, paddingVertical: 12 },
  primaryBtnText: { color: '#fff', fontWeight: '600' },
  resultTitle: { fontSize: 20, fontWeight: '700', color: '#1f2937', marginTop: 8 },
  resultSubtitle: { color: '#6b7280', fontSize: 13 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});
