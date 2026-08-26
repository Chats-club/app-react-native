import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'casino-chinese-progress-v1';

const EMPTY_STATE = { lessons: {}, quizWrong: [], quizStats: { correct: 0, total: 0 } };

async function readAll() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { ...EMPTY_STATE };
  } catch {
    return { ...EMPTY_STATE };
  }
}

async function writeAll(data) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage unavailable — fail silently
  }
}

const DEFAULT_TASKS = {
  flashcards: false,
  pronunciation: false,
  mixedSentences: false,
  matchPictures: false,
  fillBlank: false,
  crossword: false,
};

export async function getLessonProgress(lessonId) {
  const all = await readAll();
  return all.lessons[lessonId] || { ...DEFAULT_TASKS };
}

export async function setLessonTaskDone(lessonId, task) {
  const all = await readAll();
  const current = all.lessons[lessonId] || { ...DEFAULT_TASKS };
  current[task] = true;
  all.lessons[lessonId] = current;
  await writeAll(all);
  return current;
}

export async function getLessonCompletionRatio(lessonId) {
  const p = await getLessonProgress(lessonId);
  const tasks = Object.values(p);
  const done = tasks.filter(Boolean).length;
  return done / tasks.length;
}

export async function recordQuizAnswer(item, correct) {
  const all = await readAll();
  all.quizStats.total += 1;
  if (correct) {
    all.quizStats.correct += 1;
    all.quizWrong = all.quizWrong.filter((w) => w.id !== item.id);
  } else if (!all.quizWrong.find((w) => w.id === item.id)) {
    all.quizWrong.push(item);
  }
  await writeAll(all);
}

export async function getQuizWrongItems() {
  const all = await readAll();
  return all.quizWrong;
}

export async function clearReviewItem(id) {
  const all = await readAll();
  all.quizWrong = all.quizWrong.filter((w) => w.id !== id);
  await writeAll(all);
}

export async function getQuizStats() {
  const all = await readAll();
  return all.quizStats;
}

export async function getOverallStats(lessons) {
  let totalVocab = 0;
  let totalSentences = 0;
  let completedLessons = 0;
  for (const lesson of lessons) {
    if (lesson.locked) continue;
    totalVocab += lesson.vocab.length;
    totalSentences += lesson.sentences.length;
    const ratio = await getLessonCompletionRatio(lesson.id);
    if (ratio === 1) completedLessons++;
  }
  return { totalVocab, totalSentences, completedLessons };
}

export async function resetProgress() {
  await writeAll({ ...EMPTY_STATE });
}
