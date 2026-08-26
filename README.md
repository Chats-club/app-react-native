# 🎰 Casino Chinese (React Native / Expo)

A full Expo React Native port of the Casino Chinese web app — same 11
lessons, same 6 activities per lesson (Flashcards, Pronunciation,
Sentences, Match, Fill Blank, Crossword), plus the 8-section navigation
(Lessons, Vocabulary, Sentences, Listening, Speaking, Quiz, Review,
Progress), now as a bottom-tab native app for iOS and Android.

## Running it

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) to try almost everything —
flashcards, pronunciation (text-to-speech), sentence games, crossword,
quiz, progress, etc. all work in Expo Go.

**Bonus:** this same codebase also runs in a browser via Expo's web
target (`npx expo start --web`, or press `w` after `npx expo start`) —
`react-native-web` is already included. Text-to-speech and everything
except Speaking's native mic-scoring work there too.

### One exception: Speaking's mic-scoring needs a custom dev client

The Speaking tab's "listen and repeat, get scored" feature uses
`expo-speech-recognition`, a **native module**. Expo Go can't load
arbitrary native code, so that one feature will show a fallback
"Mark as practiced" button there instead of the real mic button until you
build a custom dev client:

```bash
npx expo prebuild        # generates ios/ and android/ native projects
npx expo run:ios         # or: npx expo run:android
```

(Requires Xcode for iOS or Android Studio for Android, installed locally —
this can't run in this sandboxed environment, only on your own machine.)
Once you're running that custom build instead of Expo Go, the real
microphone button appears automatically — `isRecognitionSupported()`
detects it at runtime.

## What changed from the web version

| Web (React + Vite) | Native (Expo) |
|---|---|
| Ant Design components | Core React Native components (View/Text/TouchableOpacity) + custom StyleSheet |
| Tailwind CSS classNames | `StyleSheet.create` |
| Sidebar navigation | Bottom tab bar (`@react-navigation/bottom-tabs`) + native stack for Lessons → Lesson detail |
| `window.speechSynthesis` (TTS) | `expo-speech` |
| `window.SpeechRecognition` (STT) | `expo-speech-recognition` (native module, New Architecture-compatible) |
| `localStorage` | `@react-native-async-storage/async-storage` (all progress functions are now `async`) |
| CSS 3D flip (flashcards) | React Native `Animated` API with `rotateY` transforms |

The **data layer is unchanged**: `src/data/lessons.js` and the pure-logic
utilities (`crossword.js`, `pinyinChunks.js`, `fillBlank.js`) are the exact
same validated content and logic as the web app — 100 vocab words and
10-12 sentences per lesson, every sentence's word-chunks verified against
its pinyin, zero duplicate vocab per lesson.

### Why `expo-speech-recognition` instead of `@react-native-voice/voice`

`@react-native-voice/voice` (a common choice for this) does **not**
support React Native's New Architecture, which Expo SDK 55+ requires with
no opt-out — it fails silently on modern Expo projects. `expo-speech-recognition`
is actively maintained, explicitly supports Fabric/TurboModules, and uses
Web Speech API-compatible event names and error codes, which made porting
the web version's error-handling logic (permission denied, no mic, no
speech detected, timeout, etc.) straightforward.

## Project structure

```
App.js                         ← bottom tab navigator (8 sections)
src/
  data/lessons.js               ← same validated 11-lesson dataset as web
  navigation/LessonsStack.js     ← Lessons list → Lesson detail (native stack)
  screens/
    LessonsListScreen.js / LessonDetailScreen.js
    VocabularyScreen.js / SentencesScreen.js
    ListeningScreen.js / SpeakingScreen.js
    QuizScreen.js / ReviewScreen.js / ProgressScreen.js
  components/
    FlashCards.js / Pronunciation.js / MixedSentences.js
    MatchPictures.js / FillBlank.js / Crossword.js / LessonCard.js
  utils/
    progress.js        ← AsyncStorage-backed (async)
    speech.js            ← expo-speech (TTS)
    speechRecognition.js   ← expo-speech-recognition (STT)
    crossword.js / pinyinChunks.js / fillBlank.js  ← unchanged pure logic
```

## Verified before delivery

- Full app bundled successfully via `expo export -p web` (825 modules, zero
  errors) as a fast syntax/import sanity check
- `lessons.js` re-validated: 100 vocab per lesson, zero duplicates, every
  sentence's chunks match its pinyin token count
- All `progress.js` calls across every screen correctly `await` the now-async
  AsyncStorage operations
# app-react-native
