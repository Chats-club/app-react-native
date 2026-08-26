import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getQuizWrongItems, clearReviewItem } from '../utils/progress';
import { speakChinese } from '../utils/speech';

export default function ReviewScreen() {
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    setItems(await getQuizWrongItems());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleGotIt(id) {
    await clearReviewItem(id);
    load();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Review</Text>
        <Text style={styles.subtitle}>Words you've missed on quizzes — practice them again here.</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(entry) => entry.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListEmptyComponent={<Text style={styles.empty}>Nothing to review — great job!</Text>}
        renderItem={({ item: entry }) => (
          <View style={styles.row}>
            <Text style={styles.rowEmoji}>{entry.item.emoji}</Text>
            <Text style={styles.rowHanzi}>{entry.item.hanzi}</Text>
            <View style={styles.pinyinTag}>
              <Text style={styles.pinyinTagText}>{entry.item.pinyin}</Text>
            </View>
            <Text style={styles.rowEnglish} numberOfLines={1}>{entry.item.english}</Text>
            <TouchableOpacity style={styles.iconBtn} onPress={() => speakChinese(entry.item.hanzi)}>
              <Ionicons name="volume-medium" size={16} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.gotItBtn} onPress={() => handleGotIt(entry.id)}>
              <Ionicons name="checkmark" size={14} color="#166534" />
              <Text style={styles.gotItText}>Got it</Text>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowEmoji: { fontSize: 16 },
  rowHanzi: { fontSize: 15, fontWeight: '500' },
  pinyinTag: { backgroundColor: '#dbeafe', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  pinyinTagText: { color: '#1d4ed8', fontSize: 10 },
  rowEnglish: { color: '#6b7280', fontSize: 11, flex: 1 },
  iconBtn: { padding: 6, borderRadius: 999, backgroundColor: '#f3f4f6' },
  gotItBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  gotItText: { color: '#166534', fontSize: 11, fontWeight: '500' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});
