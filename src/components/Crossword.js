import { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { generateCrossword, pinyinToAnswer } from '../utils/crossword';

const CELL_SIZE = 30;

export default function Crossword({ vocab, onComplete }) {
  const { grid, placements, size } = useMemo(() => {
    const entries = vocab.map((v) => ({ word: pinyinToAnswer(v.pinyin), clue: `${v.emoji} ${v.english}` }));
    return generateCrossword(entries);
  }, [vocab]);

  const [values, setValues] = useState({});
  const [checked, setChecked] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);

  function key(r, c) {
    return `${r}-${c}`;
  }

  function handleChange(r, c, text) {
    const letter = text.slice(-1).toLowerCase();
    setValues((v) => ({ ...v, [key(r, c)]: letter }));
    setChecked(false);
  }

  function check() {
    let ok = true;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] !== null) {
          const val = (values[key(r, c)] || '').toLowerCase();
          if (val !== grid[r][c]) ok = false;
        }
      }
    }
    setChecked(true);
    setAllCorrect(ok);
    if (ok) onComplete?.();
  }

  function reset() {
    setValues({});
    setChecked(false);
    setAllCorrect(false);
  }

  const numberAt = {};
  placements.forEach((p) => {
    numberAt[key(p.row, p.col)] = p.number;
  });

  let minR = size, maxR = 0, minC = size, maxC = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== null) {
        minR = Math.min(minR, r);
        maxR = Math.max(maxR, r);
        minC = Math.min(minC, c);
        maxC = Math.max(maxC, c);
      }
    }
  }

  const cols = maxC - minC + 1;
  const rows = maxR - minR + 1;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {Array.from({ length: rows }).map((_, ri) => (
            <View key={ri} style={{ flexDirection: 'row' }}>
              {Array.from({ length: cols }).map((_, ci) => {
                const r = ri + minR;
                const c = ci + minC;
                const isCell = grid[r][c] !== null;
                const k = key(r, c);
                const num = numberAt[k];
                const isCorrect = checked && (values[k] || '').toLowerCase() === grid[r][c];
                const isWrong = checked && isCell && (values[k] || '').toLowerCase() !== grid[r][c];

                if (!isCell) {
                  return <View key={k} style={styles.blankCell} />;
                }

                return (
                  <View key={k} style={styles.cellWrapper}>
                    {num && <Text style={styles.cellNumber}>{num}</Text>}
                    <TextInput
                      maxLength={1}
                      value={values[k] || ''}
                      onChangeText={(t) => handleChange(r, c, t)}
                      autoCapitalize="characters"
                      style={[
                        styles.cellInput,
                        isCorrect && styles.cellCorrect,
                        isWrong && styles.cellWrong,
                      ]}
                    />
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      <Text style={styles.cluesTitle}>Clues</Text>
      <View style={{ gap: 4 }}>
        {placements.map((p) => (
          <Text key={p.number} style={styles.clueText}>
            <Text style={styles.clueNumber}> {p.number} </Text> {p.clue} ({p.horizontal ? 'across' : 'down'})
          </Text>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={reset} style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={check} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Check</Text>
        </TouchableOpacity>
      </View>

      {checked && (
        <Text style={allCorrect ? styles.successText : styles.errorText}>
          {allCorrect ? 'Crossword solved!' : 'Some letters are wrong — keep trying'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  blankCell: { width: CELL_SIZE, height: CELL_SIZE },
  cellWrapper: { width: CELL_SIZE, height: CELL_SIZE, position: 'relative' },
  cellNumber: { position: 'absolute', top: 0, left: 2, fontSize: 8, color: '#9ca3af', zIndex: 1 },
  cellInput: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: '#d1d5db',
    textAlign: 'center',
    fontSize: 14,
    textTransform: 'uppercase',
    backgroundColor: '#fff',
  },
  cellCorrect: { backgroundColor: '#dcfce7', borderColor: '#22c55e' },
  cellWrong: { backgroundColor: '#fee2e2', borderColor: '#ef4444' },
  cluesTitle: { fontWeight: '600', color: '#374151' },
  clueText: { color: '#6b7280', fontSize: 13 },
  clueNumber: { fontWeight: '600', color: '#374151' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  primaryBtn: { backgroundColor: '#b91c1c', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '600' },
  secondaryBtn: { borderWidth: 1, borderColor: '#d1d5db', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  secondaryBtnText: { color: '#374151' },
  successText: { color: '#16a34a', textAlign: 'center' },
  errorText: { color: '#ef4444', textAlign: 'center' },
});
