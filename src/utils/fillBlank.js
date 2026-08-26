import { getChunkPinyins } from './pinyinChunks.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Builds a hanzi -> pinyin lookup from the lesson's vocab list plus every
// sentence's own chunk pinyins, so any word tile or answer option (even ones
// that only ever appear inside a sentence, not the vocab list) can show its
// pinyin underneath.
function buildPinyinDict(sentences, vocab) {
  const dict = {};
  vocab.forEach((v) => {
    dict[v.hanzi] = v.pinyin;
  });
  sentences.forEach((s) => {
    const pinyins = getChunkPinyins(s);
    if (pinyins) {
      s.chunks.forEach((c, i) => {
        if (!(c in dict)) dict[c] = pinyins[i];
      });
    }
  });
  return dict;
}

function buildItem(sentence, blankIndex, distractorPool, pinyinDict) {
  const answer = sentence.chunks[blankIndex];
  const chunkPinyins = sentence.chunks.map((c) => pinyinDict[c] || null);
  const answerPinyin = chunkPinyins[blankIndex];

  let pool = sentence.chunks.filter((c, i) => i !== blankIndex && c !== answer);
  pool = pool.concat(distractorPool.filter((h) => h !== answer));
  pool = [...new Set(pool)];
  const distractorWords = shuffle(pool).slice(0, 3);
  const optionWords = shuffle([answer, ...distractorWords]);
  const options = optionWords.map((word) => ({ word, pinyin: pinyinDict[word] || null }));

  return {
    id: `${sentence.hanzi}-${blankIndex}`,
    sentence,
    blankIndex,
    answer,
    answerPinyin,
    chunkPinyins,
    options,
  };
}

// Cycles through each sentence's chunk positions (blank position 0 for every
// sentence, then position 1, etc.) so items are varied across the set rather
// than all coming from the first few sentences, until reaching maxItems.
export function generateFillBlankItems(sentences, vocab, maxItems = 24) {
  const distractorPool = vocab.map((v) => v.hanzi);
  const pinyinDict = buildPinyinDict(sentences, vocab);
  const items = [];
  let round = 0;

  while (items.length < maxItems) {
    let addedAny = false;
    for (const sentence of sentences) {
      if (round < sentence.chunks.length) {
        items.push(buildItem(sentence, round, distractorPool, pinyinDict));
        addedAny = true;
        if (items.length >= maxItems) break;
      }
    }
    if (!addedAny) break;
    round++;
  }

  return items;
}
