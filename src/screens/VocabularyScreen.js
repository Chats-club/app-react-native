import { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import lessons from '../data/lessons';
import { speakChinese } from '../utils/speech';

export default function VocabularyScreen() {
  const [query, setQuery] = useState('');

  const allVocab = useMemo(() => {
    const rows = [];
    for (const lesson of lessons) {
      if (lesson.locked) continue;
      for (const v of lesson.vocab) rows.push({ ...v, lessonTitle: lesson.titleEn, lessonIcon: lesson.icon });
    }
    return rows;
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return allVocab;
    const q = query.trim().toLowerCase();
    return allVocab.filter(
      (v) => v.hanzi.includes(q) || v.pinyin.toLowerCase().includes(q) || v.english.toLowerCase().includes(q)
    );
  }, [allVocab, query]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vocabulary</Text>
        <Text style={styles.subtitle}>{allVocab.length} words across all unlocked lessons.</Text>
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
        ListEmptyComponent={<Text style={styles.empty}>No matching words</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowEmoji}>{item.emoji}</Text>
            <Text style={styles.rowHanzi}>{item.hanzi}</Text>
            <View style={styles.pinyinTag}>
              <Text style={styles.pinyinTagText}>{item.pinyin}</Text>
            </View>
            <Text style={styles.rowEnglish} numberOfLines={1}>{item.english}</Text>
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
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  rowEmoji: { fontSize: 18 },
  rowHanzi: { fontSize: 16, fontWeight: '500' },
  pinyinTag: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  pinyinTagText: { color: '#1d4ed8', fontSize: 11 },
  rowEnglish: { color: '#6b7280', fontSize: 12, flex: 1 },
  soundBtn: { padding: 6, borderRadius: 999, backgroundColor: '#f3f4f6' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});
