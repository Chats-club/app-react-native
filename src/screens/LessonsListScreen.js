import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import lessons from '../data/lessons';
import LessonCard from '../components/LessonCard';
import { getLessonCompletionRatio } from '../utils/progress';

export default function LessonsListScreen({ navigation }) {
  const [ratios, setRatios] = useState({});

  const loadRatios = useCallback(async () => {
    const entries = await Promise.all(
      lessons.map(async (l) => [l.id, l.locked ? 0 : await getLessonCompletionRatio(l.id)])
    );
    setRatios(Object.fromEntries(entries));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRatios();
    }, [loadRatios])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lessons</Text>
        <Text style={styles.subtitle}>Pick a topic to practice vocabulary and phrases.</Text>
      </View>
      <FlatList
        data={lessons}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <LessonCard
            lesson={item}
            progressRatio={ratios[item.id] || 0}
            onPress={() => navigation.navigate('LessonDetail', { lesson: item })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  subtitle: { color: '#6b7280', fontSize: 13, marginTop: 2 },
  list: { paddingHorizontal: 12, paddingBottom: 24, gap: 12 },
  row: { gap: 12 },
});
