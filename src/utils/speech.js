import * as Speech from 'expo-speech';

export function speakChinese(text) {
  try {
    Speech.stop();
    Speech.speak(text, {
      language: 'zh-CN',
      pitch: 1.0,
      rate: 0.85,
    });
    return true;
  } catch {
    return false;
  }
}

export function isSpeechSupported() {
  // expo-speech works on iOS/Android via the OS's built-in TTS engine —
  // effectively always available on a real device.
  return true;
}

// Native TTS voice availability isn't as easy to introspect as the web's
// speechSynthesis.getVoices(), and iOS/Android both ship a Mandarin voice
// by default, so we don't gate on this the way the web app did.
export function hasChineseVoice() {
  return true;
}
