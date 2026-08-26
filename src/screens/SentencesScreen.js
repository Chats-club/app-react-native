import { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import lessons from '../data/lessons';
import { speakChinese } from '../utils/speech';

export default function SentencesScreen() {
  const [query, setQuery] = useState('');

  const allSentences = useMemo(() => {
    const rows = [];
    for (const lesson of lessons) {
      if (lesson.locked) continue;
      for (const s of lesson.sentences) rows.push({ ...s, lessonTitle: lesson.titleEn, lessonIcon: lesson.icon });
    }
    return rows;
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return allSentences;
    const q = query.trim().toLowerCase();
    return allSentences.filter(
      (s) => s.hanzi.includes(q) || s.pinyin.toLowerCase().includes(q) || s.english.toLowerCase().includes(q)
    );
  }, [allSentences, query]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sentences</Text>
        <Text style={styles.subtitle}>{allSentences.length} phrases across all unlocked lessons.</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="#9ca3af" />
        <TextInput
          placeholder="Search by hanzi, pinyin, or English..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item, i) => `${item.hanzi}-${i}`}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListEmptyComponent={<Text style={styles.empty}>No matching sentences</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowHanzi}>{item.hanzi}</Text>
              <Text style={styles.rowPinyin}>{item.pinyin}</Text>
              <Text style={styles.rowEnglish}>{item.english}</Text>
            </View>
            <TouchableOpacity style={styles.soundBtn} onPress={() => speakChinese(item.hanzi)}>
              <Ionicons name="volume-medium" size={16} color="#374151" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  subtitle: { color: '#6b7280', fontSize: 13, marginTop: 2 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  rowHanzi: { fontSize: 16 },
  rowPinyin: { color: '#1d4ed8', fontSize: 13, marginTop: 2 },
  rowEnglish: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  soundBtn: { padding: 6, borderRadius: 999, backgroundColor: '#f3f4f6' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});
