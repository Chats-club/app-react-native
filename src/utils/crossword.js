// Strips tone diacritics from pinyin, e.g. "nǐ hǎo" -> "nihao", for use as a
// crossword answer. Works because pinyin tone marks are Unicode combining
// diacritics that NFD normalization exposes and can strip out.
export function pinyinToAnswer(pinyin) {
  return pinyin
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase();
}

const GRID_SIZE = 45;

function emptyGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

function canPlace(grid, word, row, col, horizontal) {
  for (let i = 0; i < word.length; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
    const existing = grid[r][c];
    if (existing !== null && existing !== word[i]) return false;
  }
  return true;
}

function place(grid, word, row, col, horizontal) {
  for (let i = 0; i < word.length; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;
    grid[r][c] = word[i];
  }
}

// Generates a simple crossword layout from a list of { word, clue } entries.
// Returns { grid, placements } where placements include start row/col,
// direction, the word, clue, and a clue number.
export function generateCrossword(entries) {
  const words = entries
    .map((e) => ({ ...e, word: e.word.toLowerCase() }))
    .filter((e) => e.word.length >= 2)
    .sort((a, b) => b.word.length - a.word.length);

  const grid = emptyGrid();
  const placements = [];

  words.forEach((entry, index) => {
    const { word } = entry;
    let placed = false;

    if (index === 0) {
      const row = Math.floor(GRID_SIZE / 2);
      const col = Math.max(0, Math.floor((GRID_SIZE - word.length) / 2));
      if (canPlace(grid, word, row, col, true)) {
        place(grid, word, row, col, true);
        placements.push({ word, clue: entry.clue, row, col, horizontal: true });
        placed = true;
      }
    } else {
      // Try to find an intersection with an already-placed word.
      outer: for (const existing of placements) {
        for (let i = 0; i < existing.word.length; i++) {
          const eR = existing.horizontal ? existing.row : existing.row + i;
          const eC = existing.horizontal ? existing.col + i : existing.col;
          const letter = existing.word[i];
          const matchIdx = word.indexOf(letter);
          if (matchIdx === -1) continue;

          const horizontal = !existing.horizontal;
          const row = horizontal ? eR : eR - matchIdx;
          const col = horizontal ? eC - matchIdx : eC;

          if (canPlace(grid, word, row, col, horizontal)) {
            place(grid, word, row, col, horizontal);
            placements.push({ word, clue: entry.clue, row, col, horizontal });
            placed = true;
            break outer;
          }
        }
      }
    }

    // Fallback: place in its own free row if no intersection was found.
    if (!placed) {
      for (let row = 0; row < GRID_SIZE && !placed; row++) {
        if (canPlace(grid, word, row, 0, true)) {
          place(grid, word, row, 0, true);
          placements.push({ word, clue: entry.clue, row, col: 0, horizontal: true });
          placed = true;
        }
      }
    }
  });

  // Assign clue numbers based on reading order (top-to-bottom, left-to-right).
  const sorted = [...placements].sort((a, b) => a.row - b.row || a.col - b.col);
  const numbered = sorted.map((p, i) => ({ ...p, number: i + 1 }));

  return { grid, placements: numbered, size: GRID_SIZE };
}
