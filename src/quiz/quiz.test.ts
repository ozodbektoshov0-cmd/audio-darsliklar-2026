import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { isValidQuiz, normalize, isFillCorrect, getCards, shuffleOptions, buildBookQuiz } from "./util.ts";
import {
  buildCrosswordGrid,
  buildJeopardyBoard,
  buildMemoryDeck,
  buildMysteryBoxes,
  buildWordChain,
  extractClozePuzzles,
  extractSentencePuzzles,
  extractWordPuzzles,
  generateWordSearch,
  toPlayableChoiceQuestions,
} from "./gameEngines.ts";
import type { Quiz } from "./types.ts";

const DATA_DIR = path.resolve(import.meta.dirname, "data");
const ADABIYOT_FILES = fs
  .readdirSync(DATA_DIR)
  .filter((f) => f.startsWith("g9-uz-adabiyot-") && f.endsWith(".json"))
  .sort();
const ALGEBRA_FILES = fs
  .readdirSync(DATA_DIR)
  .filter((f) => f.startsWith("g9-uz-algebra-") && f.endsWith(".json"))
  .sort();

test("utility functions normalize, isFillCorrect, shuffleOptions, getCards work accurately", () => {
  assert.equal(normalize("  Choʻlponʼning   sheʼri "), "cho'lpon'ning she'ri");
  assert.equal(
    isFillCorrect({ type: "fill", q: "test", answer: ["Qo'ng'irot", "Qongirot"] }, "qoʻngʻirot"),
    true,
  );
  assert.equal(isFillCorrect({ type: "fill", q: "test", answer: "ot" }, ""), false);

  const cq = {
    type: "choice" as const,
    q: "Test savol",
    options: ["Bir", "Ikki", "Uch", "To'rt"],
    answer: 2,
  };
  const shuffled = shuffleOptions(cq);
  assert.equal(shuffled.options[shuffled.answer], "Uch");
  assert.equal(shuffled.options.length, 4);

  const sampleQuiz: Quiz = {
    id: "t1",
    title: "T1",
    questions: [cq],
    cards: [["A", "B"]],
  };
  assert.deepEqual(getCards(sampleQuiz), [["A", "B"]]);
});

test("all 14 topics of 9-sinf Adabiyot (2025) exist and pass strict validation", () => {
  assert.equal(ADABIYOT_FILES.length, 14, `Expected 14 topic files, found ${ADABIYOT_FILES.length}`);

  const seenIds = new Set<string>();

  for (const file of ADABIYOT_FILES) {
    const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
    const parsed = JSON.parse(raw) as Quiz;

    assert.equal(isValidQuiz(parsed), true, `${file} failed isValidQuiz()`);
    assert.equal(parsed.subjectId, "g9-uz-adabiyot", `${file} has wrong subjectId`);
    assert.equal(parsed.grade, "9", `${file} has wrong grade`);
    assert.equal(parsed.lang, "uz", `${file} has wrong lang`);
    assert.ok(!seenIds.has(parsed.id), `Duplicate quiz id: ${parsed.id}`);
    seenIds.add(parsed.id);

    assert.ok(
      parsed.questions.length >= 100 && parsed.questions.length <= 200,
      `${file} should have 100..200 questions, got ${parsed.questions.length}`,
    );

    const seenQuestions = new Set<string>();
    for (let idx = 0; idx < parsed.questions.length; idx++) {
      const q = parsed.questions[idx];
      const normQ = normalize(q.q);
      assert.ok(normQ.length >= 10, `${file} question #${idx} is too short: ${q.q}`);
      assert.ok(!seenQuestions.has(normQ), `${file} has duplicate question #${idx}: ${q.q}`);
      seenQuestions.add(normQ);

      if (q.type === "choice") {
        const distinctOpts = new Set(q.options.map(normalize));
        assert.equal(distinctOpts.size, q.options.length, `${file} question #${idx} has duplicate options`);
      }
    }

    assert.ok(Array.isArray(parsed.cards) && parsed.cards.length >= 20, `${file} needs >= 20 cards`);
    const shortCards = parsed.cards.filter(([a, b]) => a.length <= 70 && b.length <= 70);
    assert.ok(
      shortCards.length >= 15,
      `${file} has only ${shortCards.length} MatchGame-eligible cards (<= 70 chars)`,
    );
  }
});

test("all 40 topics of 9-sinf Algebra (2019) exist and pass strict validation (300..500 Qs + game cards)", () => {
  assert.equal(ALGEBRA_FILES.length, 40, `Expected 40 Algebra topic files, found ${ALGEBRA_FILES.length}`);

  const seenIds = new Set<string>();
  const loadedQuizzes: Quiz[] = [];

  for (const file of ALGEBRA_FILES) {
    const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
    const parsed = JSON.parse(raw) as Quiz;

    assert.equal(isValidQuiz(parsed), true, `${file} failed isValidQuiz()`);
    assert.equal(parsed.subjectId, "g9-uz-algebra", `${file} has wrong subjectId`);
    assert.equal(parsed.grade, "9", `${file} has wrong grade`);
    assert.equal(parsed.lang, "uz", `${file} has wrong lang`);
    assert.ok(!seenIds.has(parsed.id), `Duplicate quiz id: ${parsed.id}`);
    seenIds.add(parsed.id);

    assert.ok(
      parsed.questions.length >= 300 && parsed.questions.length <= 500,
      `${file} should have 300..500 questions, got ${parsed.questions.length}`,
    );

    const seenQuestions = new Set<string>();
    for (let idx = 0; idx < parsed.questions.length; idx++) {
      const q = parsed.questions[idx];
      const normQ = normalize(q.q);
      assert.ok(normQ.length >= 10, `${file} question #${idx} is too short: ${q.q}`);
      assert.ok(!seenQuestions.has(normQ), `${file} has duplicate question #${idx}: ${q.q}`);
      seenQuestions.add(normQ);

      if (q.type === "choice") {
        assert.equal(q.options.length, 4, `${file} choice Q#${idx} must have 4 options`);
        const distinctOpts = new Set(q.options.map(normalize));
        assert.equal(distinctOpts.size, 4, `${file} choice Q#${idx} has duplicate options: ${q.options.join(" | ")}`);
        assert.ok(q.answer >= 0 && q.answer <= 3, `${file} choice Q#${idx} answer out of bounds`);
      }
      assert.ok(typeof q.explain === "string" && q.explain.trim().length > 0, `${file} Q#${idx} missing explain`);
    }

    assert.ok(Array.isArray(parsed.cards) && parsed.cards.length >= 20, `${file} needs >= 20 cards`);
    const shortCards = parsed.cards.filter(([a, b]) => a.length <= 70 && b.length <= 70);
    assert.ok(
      shortCards.length >= 15,
      `${file} has only ${shortCards.length} MatchGame-eligible cards (<= 70 chars)`,
    );

    const words = extractWordPuzzles(parsed);
    assert.ok(words.length >= 6, `${file} extracted only ${words.length} WordPuzzles`);

    loadedQuizzes.push(parsed);
  }

  // Test game engines on sample Algebra topic and combined 40-topic book quiz
  const sampleTopic = loadedQuizzes[0];
  const bookQuiz = buildBookQuiz("g9-uz-algebra", loadedQuizzes, "Algebra", true);
  assert.ok(bookQuiz);
  assert.ok(bookQuiz.questions.length >= 12000, `Expected >= 12000 book questions, got ${bookQuiz.questions.length}`);

  const t0 = performance.now();
  const playableTopic = toPlayableChoiceQuestions(sampleTopic, true);
  const playableBook = toPlayableChoiceQuestions(bookQuiz, true);
  const wordsBook = extractWordPuzzles(bookQuiz);
  const ws = generateWordSearch(wordsBook, 10);
  const cw = buildCrosswordGrid(wordsBook, 6);
  const sentences = extractSentencePuzzles(bookQuiz);
  const cloze = extractClozePuzzles(bookQuiz);
  const boxes = buildMysteryBoxes(bookQuiz, 12, true);
  const jeopardy = buildJeopardyBoard(loadedQuizzes.slice(0, 4), bookQuiz, true);
  const deck = buildMemoryDeck(bookQuiz, sampleTopic, 6);
  const chain = buildWordChain(wordsBook, 8);
  const elapsedMs = performance.now() - t0;

  assert.ok(playableTopic.length > 0);
  assert.ok(playableBook.length > 0);
  assert.ok(ws.placements.length >= 4);
  assert.ok(cw.entries.length >= 2);
  assert.ok(sentences.length >= 5);
  assert.ok(cloze.length >= 5);
  assert.equal(boxes.length, 12);
  assert.equal(jeopardy.length, 4);
  assert.equal(deck.length, 12);
  assert.ok(chain.length >= 4);
  assert.ok(elapsedMs < 1500, `Combined game engine generation took too long: ${elapsedMs.toFixed(1)} ms`);
});
