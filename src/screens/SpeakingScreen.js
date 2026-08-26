import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import lessons from '../data/lessons';
import { speakChinese } from '../utils/speech';
import { isRecognitionSupported, recognizeOnce, scorePronunciation } from '../utils/speechRecognition';

const ERROR_MESSAGES = {
  not_supported: "Speech recognition isn't available in this build. It needs a custom dev client (see README) — plain Expo Go can't include the native speech module. You can still listen and repeat out loud.",
  'not-allowed': 'Microphone or speech recognition access was denied. Enable both in your device Settings for this app, then try again.',
  'service-not-allowed': 'Speech recognition service is unavailable on this device right now — try again shortly.',
  'audio-capture': 'No microphone was found or it could not be accessed.',
  network: 'Network error while recognizing speech — check your connection and try again.',
  'no-speech': "Didn't hear anything — make sure your mic isn't muted, then try again.",
  'language-not-supported': "This device doesn't support Mandarin speech recognition.",
  busy: 'Speech recognition is busy — wait a moment and try again.',
  timeout: "Didn't catch that in time — try again.",
  start_failed: 'Could not start speech recognition — try again.',
  recognition_error: 'Something went wrong recognizing your speech — try again.',
};

export default function SpeakingScreen() {
  const items = useMemo(() => {
    const rows = [];
    for (const lesson of lessons) {
      if (lesson.locked) continue;
      for (const s of lesson.sentences) rows.push(s);
    }
    return rows;
  }, []);

  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);

  const supported = isRecognitionSupported();
  const item = items[index];
  const isLast = index === items.length - 1;

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>No sentences available yet</Text>
      </View>
    );
  }

  async function handleRecord() {
    setStatus('listening');
    setResult(null);
    try {
      const heard = await recognizeOnce({ lang: 'zh-CN' });
      const score = scorePronunciation(item.hanzi, heard);
      setResult({ heard, score });
      if (score >= 0.7) setCompletedCount((c) => c + 1);
    } catch (err) {
      Alert.alert('Speaking', ERROR_MESSAGES[err.message] || 'Something went wrong — try again.');
    } finally {
      setStatus('done');
    }
  }

  function markPracticed() {
    setCompletedCount((c) => c + 1);
    next();
  }

  function next() {
    if (isLast) return;
    setIndex((i) => i + 1);
    setStatus('idle');
    setResult(null);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Speaking</Text>
        <Text style={styles.subtitle}>Listen, then repeat the phrase out loud.</Text>
      </View>

      <View style={{ paddingHorizontal: 16, gap: 16, flex: 1 }}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round((completedCount / items.length) * 100)}%` }]} />
        </View>
        <Text style={styles.meta}>Phrase {index + 1} / {items.length}</Text>

        <View style={styles.card}>
          <TouchableOpacity style={styles.soundBtn} onPress={() => speakChinese(item.hanzi)}>
            <Ionicons name="volume-high" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.hint}>tap to hear it</Text>

          <Text style={styles.hanzi}>{item.hanzi}</Text>
          <Text style={styles.pinyin}>{item.pinyin}</Text>
          <Text style={styles.english}>{item.english}</Text>

          {supported ? (
            <TouchableOpacity
              style={[styles.micBtn, status === 'listening' && styles.micBtnActive]}
              onPress={handleRecord}
              disabled={status === 'listening'}
            >
              <Ionicons name="mic" size={18} color="#374151" />
              <Text style={styles.micBtnText}>{status === 'listening' ? 'Listening...' : 'Tap to speak'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.micBtn} onPress={markPracticed}>
              <Ionicons name="checkmark-circle" size={18} color="#374151" />
              <Text style={styles.micBtnText}>Mark as practiced</Text>
            </TouchableOpacity>
          )}

          {result && (
            <View style={{ alignItems: 'center', marginTop: 8 }}>
              <View
                style={[
                  styles.resultTag,
                  result.score >= 0.7 ? styles.resultGood : result.score >= 0.4 ? styles.resultOk : styles.resultBad,
                ]}
              >
                <Text style={styles.resultTagText}>Heard: {result.heard || '(nothing)'}</Text>
              </View>
              <Text style={styles.resultFeedback}>
                {result.score >= 0.7 ? 'Great pronunciation!' : result.score >= 0.4 ? 'Close — try again' : 'Try again'}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={next}
          disabled={isLast}
          style={[styles.nextBtn, isLast && styles.nextBtnDisabled]}
        >
          <Text style={styles.nextBtnText}>{isLast ? 'Last phrase' : 'Next'}</Text>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  subtitle: { color: '#6b7280', fontSize: 13, marginTop: 2 },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: '#b91c1c' },
  meta: { color: '#6b7280', fontSize: 13 },
  card: { alignItems: 'center', gap: 6, backgroundColor: '#f9fafb', borderRadius: 16, paddingVertical: 28, paddingHorizontal: 16 },
  soundBtn: { backgroundColor: '#b91c1c', padding: 16, borderRadius: 999 },
  hint: { color: '#9ca3af', fontSize: 11 },
  hanzi: { fontSize: 24, marginTop: 8 },
  pinyin: { color: '#1d4ed8', fontSize: 14 },
  english: { color: '#6b7280', fontSize: 13 },
  micBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#d1d5db', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, marginTop: 12 },
  micBtnActive: { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
  micBtnText: { color: '#374151', fontWeight: '500' },
  resultTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  resultGood: { backgroundColor: '#dcfce7' },
  resultOk: { backgroundColor: '#fef3c7' },
  resultBad: { backgroundColor: '#fee2e2' },
  resultTagText: { fontSize: 12, color: '#374151' },
  resultFeedback: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#b91c1c', borderRadius: 10, paddingVertical: 12 },
  nextBtnDisabled: { backgroundColor: '#f3a8a8' },
  nextBtnText: { color: '#fff', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});
