import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { speakChinese } from '../utils/speech';

export default function Pronunciation({ vocab, sentences, onComplete }) {
  useEffect(() => {
    onComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Words</Text>
      <View style={styles.card}>
        {vocab.map((item, i) => (
          <View key={item.hanzi} style={[styles.row, i !== vocab.length - 1 && styles.rowBorder]}>
            <Text style={styles.rowEmoji}>{item.emoji}</Text>
            <Text style={styles.rowHanzi}>{item.hanzi}</Text>
            <View style={styles.pinyinTag}>
              <Text style={styles.pinyinTagText}>{item.pinyin}</Text>
            </View>
            <Text style={styles.rowEnglish} numberOfLines={1}>{item.english}</Text>
            <TouchableOpacity style={styles.soundBtn} onPress={() => speakChinese(item.hanzi)}>
              <Ionicons name="volume-medium" size={18} color="#374151" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Sentences</Text>
      <View style={styles.card}>
        {sentences.map((item, i) => (
          <View key={item.hanzi} style={[styles.sentenceRow, i !== sentences.length - 1 && styles.rowBorder]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowHanzi}>{item.hanzi}</Text>
              <Text style={styles.sentencePinyin}>{item.pinyin}</Text>
              <Text style={styles.rowEnglish}>{item.english}</Text>
            </View>
            <TouchableOpacity style={styles.soundBtn} onPress={() => speakChinese(item.hanzi)}>
              <Ionicons name="volume-medium" size={18} color="#374151" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10 },
  sentenceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowEmoji: { fontSize: 18 },
  rowHanzi: { fontSize: 16, fontWeight: '500' },
  pinyinTag: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  pinyinTagText: { color: '#1d4ed8', fontSize: 12 },
  sentencePinyin: { color: '#1d4ed8', fontSize: 13, marginTop: 2 },
  rowEnglish: { color: '#6b7280', fontSize: 13, flexShrink: 1 },
  soundBtn: { padding: 8, borderRadius: 999, backgroundColor: '#f3f4f6', marginLeft: 'auto' },
});
