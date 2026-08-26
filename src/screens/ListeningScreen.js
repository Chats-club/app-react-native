import { useMemo } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import lessons from '../data/lessons';
import FillBlank from '../components/FillBlank';

export default function ListeningScreen() {
  const { allVocab, allSentences } = useMemo(() => {
    const vocab = [];
    const sentences = [];
    for (const lesson of lessons) {
      if (lesson.locked) continue;
      vocab.push(...lesson.vocab);
      sentences.push(...lesson.sentences);
    }
    return { allVocab: vocab, allSentences: sentences };
  }, []);

  if (allSentences.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>No sentences available yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Listening</Text>
        <Text style={styles.subtitle}>Listen and fill in the missing word, across all unlocked lessons.</Text>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <FillBlank
          vocab={allVocab}
          sentences={allSentences}
          onComplete={() => Alert.alert('Nice work!', 'Set complete.')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  subtitle: { color: '#6b7280', fontSize: 13, marginTop: 2 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});
