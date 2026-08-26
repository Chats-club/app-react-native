import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FlashCards from '../components/FlashCards';
import Pronunciation from '../components/Pronunciation';
import MixedSentences from '../components/MixedSentences';
import MatchPictures from '../components/MatchPictures';
import FillBlank from '../components/FillBlank';
import Crossword from '../components/Crossword';
import { setLessonTaskDone } from '../utils/progress';

const TABS = [
  { key: 'flashcards', label: 'Flashcards', icon: 'albums-outline', task: 'flashcards' },
  { key: 'pronunciation', label: 'Pronunciation', icon: 'volume-medium-outline', task: 'pronunciation' },
  { key: 'mixed', label: 'Sentences', icon: 'list-outline', task: 'mixedSentences' },
  { key: 'match', label: 'Match', icon: 'grid-outline', task: 'matchPictures' },
  { key: 'fillblank', label: 'Fill Blank', icon: 'create-outline', task: 'fillBlank' },
  { key: 'crossword', label: 'Crossword', icon: 'apps-outline', task: 'crossword' },
];

export default function LessonDetailScreen({ route }) {
  const { lesson } = route.params;
  const [activeTab, setActiveTab] = useState('flashcards');

  function handleTaskComplete(task) {
    setLessonTaskDone(lesson.id, task);
  }

  function renderActivity() {
    switch (activeTab) {
      case 'flashcards':
        return <FlashCards vocab={lesson.vocab} onComplete={() => handleTaskComplete('flashcards')} />;
      case 'pronunciation':
        return (
          <Pronunciation
            vocab={lesson.vocab}
            sentences={lesson.sentences}
            onComplete={() => handleTaskComplete('pronunciation')}
          />
        );
      case 'mixed':
        return (
          <MixedSentences sentences={lesson.sentences} onComplete={() => handleTaskComplete('mixedSentences')} />
        );
      case 'match':
        return <MatchPictures vocab={lesson.vocab} onComplete={() => handleTaskComplete('matchPictures')} />;
      case 'fillblank':
        return (
          <FillBlank
            vocab={lesson.vocab}
            sentences={lesson.sentences}
            onComplete={() => handleTaskComplete('fillBlank')}
          />
        );
      case 'crossword':
        return <Crossword vocab={lesson.vocab} onComplete={() => handleTaskComplete('crossword')} />;
      default:
        return null;
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{lesson.icon}</Text>
        <View>
          <Text style={styles.titleCn}>{lesson.titleCn}</Text>
          <Text style={styles.titleEn}>{lesson.titleEn}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={{ gap: 8, paddingHorizontal: 12 }}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
          >
            <Ionicons name={tab.icon} size={15} color={activeTab === tab.key ? '#b91c1c' : '#6b7280'} />
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} contentContainerStyle={{ padding: 16 }}>
        {renderActivity()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  icon: { fontSize: 28 },
  titleCn: { fontSize: 17, fontWeight: '600' },
  titleEn: { fontSize: 13, color: '#9ca3af' },
  tabBar: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 10, flexGrow: 0 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: '#f9fafb' },
  tabBtnActive: { backgroundColor: '#fee2e2' },
  tabLabel: { fontSize: 12, color: '#6b7280' },
  tabLabelActive: { color: '#b91c1c', fontWeight: '600' },
  content: { flex: 1 },
});
