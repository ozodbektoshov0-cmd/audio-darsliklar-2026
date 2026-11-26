import test from "node:test";
import assert from "node:assert/strict";
import { formatTimerHMS, buildBookQuiz, buildExplanation } from "./util.ts";
import { GENERAL_INTELLECTUAL_QUIZ, GENERAL_INTELLECTUAL_CATEGORIES } from "./generalGamesPack.ts";
import {
  applyTugStep,
  buildJeopardyBoard,
  buildMysteryBoxes,
  computeNextWheelRotation,
  extractClozePuzzles,
  extractSentencePuzzles,
  extractWordPuzzles,
  generateWordSearch,
  getLineCoords,
  isSentenceSolved,
  matchWordSearchSelection,
  sanitizeLettersOnly,
  scrambleWordTiles,
  WHEEL_SECTORS,
} from "./gameEngines.ts";

test("formatTimerHMS outputs exact xx.xx.xx format", () => {
  assert.equal(formatTimerHMS(0), "00.00.00");
  assert.equal(formatTimerHMS(9), "00.00.09");
  assert.equal(formatTimerHMS(65), "00.01.05");
  assert.equal(formatTimerHMS(3661), "01.01.01");
});

test("buildBookQuiz combines multiple topics deduplicating questions and cards", () => {
  const cats = Object.values(GENERAL_INTELLECTUAL_CATEGORIES);
  const combined = buildBookQuiz("test-book", cats, "Test Kitob", true);
  assert.ok(combined);
  assert.equal(combined.id, "book:test-book");
  assert.ok(combined.questions.length >= 16);
});

test("buildExplanation always returns non-empty explanation", () => {
  const exp = buildExplanation({
    type: "choice",
    q: "Test?",
    options: ["A", "B"],
    answer: 1,
  });
  assert.ok(exp.includes("B"));
});

test("Word extraction, sanitization, and scrambling work properly", () => {
  assert.equal(sanitizeLettersOnly("Oʻzbekiston!"), "OZBEKISTON");
  const words = extractWordPuzzles(GENERAL_INTELLECTUAL_QUIZ);
  assert.ok(words.length >= 10);
  for (const w of words) {
    assert.ok(w.word.length >= 4 && w.word.length <= 11);
    const tiles = scrambleWordTiles(w.word);
    assert.equal(tiles.length, w.word.length);
    assert.equal(
      tiles
        .map((t) => t.char)
        .sort()
        .join(""),
      w.word.split("").sort().join(""),
    );
  }
});

test("Word Search places words cleanly and validates straight-line selections", () => {
  const words = extractWordPuzzles(GENERAL_INTELLECTUAL_QUIZ).slice(0, 6);
  const puzzle = generateWordSearch(words, 10);
  assert.equal(puzzle.grid.length, 10);
  assert.equal(puzzle.grid[0].length, 10);
  assert.ok(puzzle.placements.length >= 4);

  const first = puzzle.placements[0];
  const start = first.cells[0];
  const end = first.cells[first.cells.length - 1];
  const matched = matchWordSearchSelection(puzzle, start, end);
  assert.equal(matched?.word, first.word);

  // Diagonal invalid non-line check
  assert.deepEqual(getLineCoords({ r: 0, c: 0 }, { r: 2, c: 1 }), []);
});

test("Sentence builder and Cloze extraction generate valid items", () => {
  const sentences = extractSentencePuzzles(GENERAL_INTELLECTUAL_QUIZ);
  assert.ok(sentences.length >= 5);
  const s = sentences[0];
  assert.equal(isSentenceSolved(s.words, s.words), true);
  assert.equal(isSentenceSolved([...s.words].reverse(), s.words), false);

  const cloze = extractClozePuzzles(GENERAL_INTELLECTUAL_QUIZ);
  assert.ok(cloze.length >= 5);
  assert.ok(cloze[0].suggestions.includes(cloze[0].answer[0]));
});

test("Mystery Box, Wheel of Fortune, Tug of War, and Jeopardy engines work deterministically", () => {
  const boxes = buildMysteryBoxes(GENERAL_INTELLECTUAL_QUIZ, 12, true);
  assert.equal(boxes.length, 12);

  for (let idx = 0; idx < WHEEL_SECTORS.length; idx++) {
    const rot = computeNextWheelRotation(15, idx, 4);
    assert.ok(rot > 1440);
  }

  let pos = 0;
  for (let i = 0; i < 4; i++) {
    const res = applyTugStep(pos, 1, true, 4);
    pos = res.nextPosition;
    if (i < 3) assert.equal(res.winner, null);
    else assert.equal(res.winner, 1);
  }

  const board = buildJeopardyBoard(Object.values(GENERAL_INTELLECTUAL_CATEGORIES), GENERAL_INTELLECTUAL_QUIZ, true);
  assert.equal(board.length, 4);
  for (const col of board) {
    assert.equal(col.tiles.length, 4);
    assert.deepEqual(
      col.tiles.map((t) => t.points),
      [100, 200, 300, 400],
    );
  }
});

import {
  buildCrosswordGrid,
  buildMathDuelProblems,
  buildMemoryDeck,
  buildWordChain,
  scoreRaceStep,
  scoreTrueFalseStreak,
} from "./gameEngines.ts";

test("New 6 intellectual game engines produce valid deterministic outputs", () => {
  // 1. Quiz Race
  assert.deepEqual(scoreRaceStep(0, false, 8), { nextProgress: 0, finished: false });
  assert.deepEqual(scoreRaceStep(7, true, 8), { nextProgress: 8, finished: true });

  // 2. True/False Blitz streak
  assert.deepEqual(scoreTrueFalseStreak(0, true), { nextStreak: 1, multiplier: 1, deltaPoints: 50 });
  assert.deepEqual(scoreTrueFalseStreak(2, true), { nextStreak: 3, multiplier: 2, deltaPoints: 100 });
  assert.deepEqual(scoreTrueFalseStreak(4, true), { nextStreak: 5, multiplier: 3, deltaPoints: 150 });
  assert.deepEqual(scoreTrueFalseStreak(4, false), { nextStreak: 0, multiplier: 1, deltaPoints: 0 });

  // 3. Math Duel
  const problems = buildMathDuelProblems(8, 8);
  assert.equal(problems.length, 8);
  for (const p of problems) {
    assert.ok(p.options.includes(p.answer));
    assert.equal(p.options.length, 4);
  }

  // 4. Crossword Grid
  const words = extractWordPuzzles(GENERAL_INTELLECTUAL_QUIZ, GENERAL_INTELLECTUAL_QUIZ, 8);
  const cw = buildCrosswordGrid(words, 6);
  assert.ok(cw.entries.length >= 2);
  for (const e of cw.entries) {
    for (let i = 0; i < e.word.length; i++) {
      const r = e.direction === "across" ? e.row : e.row + i;
      const c = e.direction === "across" ? e.col + i : e.col;
      assert.equal(cw.solutionGrid[r][c], e.word[i]);
    }
  }

  // 5. Memory Deck
  const deck = buildMemoryDeck(GENERAL_INTELLECTUAL_QUIZ, GENERAL_INTELLECTUAL_QUIZ, 5);
  assert.equal(deck.length, 10);

  // 6. Word Chain
  const chain = buildWordChain(words, 6);
  assert.ok(chain.length >= 4);
  for (const link of chain) {
    assert.ok(link.options.includes(link.displayWord));
  }
});

