import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import lessons from '../data/lessons';
import { getLessonCompletionRatio, getOverallStats, getQuizStats } from '../utils/progress';

export default function ProgressScreen() {
  const [stats, setStats] = useState({ totalVocab: 0, totalSentences: 0, completedLessons: 0 });
  const [quiz, setQuiz] = useState({ correct: 0, total: 0 });
  const [ratios, setRatios] = useState({});

  const load = useCallback(async () => {
    setStats(await getOverallStats(lessons));
    setQuiz(await getQuizStats());
    const entries = await Promise.all(
      lessons.map(async (l) => [l.id, l.locked ? 0 : await getLessonCompletionRatio(l.id)])
    );
    setRatios(Object.fromEntries(entries));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const quizAccuracy = quiz.total > 0 ? Math.round((quiz.correct / quiz.total) * 100) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Progress</Text>
      <Text style={styles.subtitle}>Your overall stats across all lessons.</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalVocab}</Text>
          <Text style={styles.statLabel}>Vocabulary words</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalSentences}</Text>
          <Text style={styles.statLabel}>Sentences</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{quizAccuracy === null ? '—' : `${quizAccuracy}%`}</Text>
          <Text style={styles.statLabel}>
            Quiz accuracy{quiz.total > 0 ? ` (${quiz.correct}/${quiz.total})` : ''}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Lessons</Text>
      <View style={{ gap: 12 }}>
        {lessons.map((lesson) => {
          const ratio = ratios[lesson.id] || 0;
          return (
            <View key={lesson.id} style={styles.lessonRow}>
              <Text style={styles.lessonIcon}>{lesson.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.lessonTitle}>
                  {lesson.titleCn} <Text style={styles.lessonTitleEn}>· {lesson.titleEn}</Text>
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.round(ratio * 100)}%`, backgroundColor: lesson.locked ? '#d1d5db' : '#b91c1c' },
                    ]}
                  />
                </View>
              </View>
              {lesson.locked && <Text style={styles.lockedLabel}>locked</Text>}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  subtitle: { color: '#6b7280', fontSize: 13, marginTop: 2, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  statLabel: { fontSize: 10, color: '#6b7280', textAlign: 'center', marginTop: 4 },
  sectionTitle: { fontWeight: '600', color: '#374151', marginBottom: 10 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lessonIcon: { fontSize: 20, width: 28 },
  lessonTitle: { fontSize: 13, color: '#374151' },
  lessonTitleEn: { color: '#9ca3af' },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', marginTop: 4, overflow: 'hidden' },
  progressFill: { height: 4 },
  lockedLabel: { fontSize: 10, color: '#9ca3af' },
});
