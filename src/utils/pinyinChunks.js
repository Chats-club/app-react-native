// Splits a sentence's whitespace-delimited pinyin into one token per word
// chunk, stripping punctuation. Returns null if the token count doesn't
// match the chunk count, so callers can gracefully fall back to no pinyin
// rather than showing a misaligned label.
export function getChunkPinyins(sentence) {
  const cleaned = sentence.pinyin.replace(/[！？。，,.!?]/g, '').trim();
  const tokens = cleaned.split(/\s+/);
  if (tokens.length !== sentence.chunks.length) return null;
  return tokens;
}
