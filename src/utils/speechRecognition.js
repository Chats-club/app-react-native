import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

// expo-speech-recognition wraps iOS SFSpeechRecognizer / Android
// SpeechRecognizer with Web Speech API-compatible event names and error
// codes, and (unlike @react-native-voice/voice) supports React Native's
// New Architecture, which Expo SDK 55+ requires with no opt-out.
// It needs a custom dev client — it can't run inside plain Expo Go, since
// that can't include arbitrary native modules. See the README.
export function isRecognitionSupported() {
  try {
    return ExpoSpeechRecognitionModule.isRecognitionAvailable();
  } catch {
    return false;
  }
}

// Records one utterance and resolves with the recognized text.
// Rejects with a reason string matching the library's Web Speech API-style
// error codes: 'not-allowed' | 'no-speech' | 'audio-capture' | 'network' |
// 'service-not-allowed' | 'busy' | 'timeout' | 'start_failed' | etc.
export function recognizeOnce({ lang = 'zh-CN', timeoutMs = 9000 } = {}) {
  if (!isRecognitionSupported()) {
    return Promise.reject(new Error('not_supported'));
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    let listeners = [];

    const cleanup = () => {
      clearTimeout(timer);
      listeners.forEach((l) => l.remove());
      listeners = [];
    };

    const finish = (fn, arg) => {
      if (settled) return;
      settled = true;
      cleanup();
      fn(arg);
    };

    const timer = setTimeout(() => {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch {
        // already stopped
      }
      finish(reject, new Error('timeout'));
    }, timeoutMs);

    listeners.push(
      ExpoSpeechRecognitionModule.addListener('result', (event) => {
        if (!event.isFinal) return;
        const text = event.results?.[0]?.transcript || '';
        finish(resolve, text);
      })
    );

    listeners.push(
      ExpoSpeechRecognitionModule.addListener('error', (event) => {
        finish(reject, new Error(event.error || 'recognition_error'));
      })
    );

    // If recognition ends without ever firing a final result or an error
    // (e.g. very brief/silent input), fail fast instead of waiting out the
    // full timeout.
    listeners.push(
      ExpoSpeechRecognitionModule.addListener('end', () => {
        finish(reject, new Error('no-speech'));
      })
    );

    ExpoSpeechRecognitionModule.requestPermissionsAsync()
      .then((perm) => {
        if (settled) return;
        if (!perm.granted) {
          finish(reject, new Error('not-allowed'));
          return;
        }
        try {
          ExpoSpeechRecognitionModule.start({
            lang,
            interimResults: false,
            continuous: false,
            maxAlternatives: 1,
          });
        } catch {
          finish(reject, new Error('start_failed'));
        }
      })
      .catch(() => finish(reject, new Error('start_failed')));
  });
}

// Loose comparison: strips punctuation/whitespace and checks for a
// meaningful character overlap rather than requiring an exact match,
// since ASR output for Mandarin can vary in segmentation.
export function scorePronunciation(target, heard) {
  const clean = (s) => s.replace(/[，。！？、\s,.!?]/g, '');
  const t = clean(target);
  const h = clean(heard);
  if (!h) return 0;
  if (t === h) return 1;

  let matches = 0;
  const heardChars = [...h];
  const targetChars = [...t];
  for (const ch of targetChars) {
    const idx = heardChars.indexOf(ch);
    if (idx !== -1) {
      matches++;
      heardChars.splice(idx, 1);
    }
  }
  return matches / targetChars.length;
}
