import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function LessonCard({ lesson, progressRatio, onPress }) {
  const isComplete = progressRatio === 1;

  if (lesson.locked) {
    return (
      <View style={[styles.card, styles.lockedCard]}>
        <View style={styles.topRow}>
          <Text style={[styles.icon, { opacity: 0.4 }]}>{lesson.icon}</Text>
          <Ionicons name="lock-closed" size={16} color="#9ca3af" />
        </View>
        <Text style={styles.lockedTitleCn}>{lesson.titleCn}</Text>
        <Text style={styles.lockedTitleEn}>{lesson.titleEn}</Text>
        <Text style={styles.comingSoon}>Coming soon</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.cardWrapper}>
      <LinearGradient
        colors={[lesson.color, lesson.color + 'cc']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.topRow}>
          <Text style={styles.icon}>{lesson.icon}</Text>
          {isComplete && <Ionicons name="checkmark-circle" size={18} color="#fff" />}
        </View>
        <Text style={styles.titleCn}>{lesson.titleCn}</Text>
        <Text style={styles.titleEn}>{lesson.titleEn}</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progressRatio * 100)}%` }]} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    minWidth: '46%',
    maxWidth: '48%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 16,
    padding: 14,
    minHeight: 130,
    justifyContent: 'space-between',
  },
  lockedCard: {
    flex: 1,
    minWidth: '46%',
    maxWidth: '48%',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    fontSize: 26,
  },
  titleCn: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    marginTop: 8,
  },
  titleEn: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  lockedTitleCn: {
    color: '#9ca3af',
    fontSize: 17,
    fontWeight: '600',
    marginTop: 8,
  },
  lockedTitleEn: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  comingSoon: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 8,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: '#fff',
  },
});
