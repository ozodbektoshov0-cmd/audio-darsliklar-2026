import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cleanSingleLetterTerms, normalizeText, type QuizOutput } from "./core.ts";
import { buildTopics00To12 } from "./topics_00_12.ts";
import { buildTopics13To27 } from "./topics_13_27.ts";
import { buildTopics28To39 } from "./topics_28_39.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../../src/quiz/data");

function validateQuiz(q: QuizOutput): void {
  if (q.questions.length < 300 || q.questions.length > 500) {
    throw new Error(`${q.id}: questions.length = ${q.questions.length} (expected 300..500)`);
  }
  const seenQ = new Set<string>();
  for (let i = 0; i < q.questions.length; i++) {
    const item = q.questions[i];
    const nq = normalizeText(item.q);
    if (seenQ.has(nq)) {
      throw new Error(`${q.id}: duplicate question #${i}: ${item.q}`);
    }
    seenQ.add(nq);
    if (item.type === "choice") {
      if (item.options.length !== 4) {
        throw new Error(`${q.id}: Q#${i} does not have 4 options`);
      }
      const optSet = new Set(item.options.map(normalizeText));
      if (optSet.size !== 4) {
        throw new Error(`${q.id}: Q#${i} has duplicate options: ${item.options.join(" | ")}`);
      }
      if (item.answer < 0 || item.answer > 3) {
        throw new Error(`${q.id}: Q#${i} invalid answer index ${item.answer}`);
      }
    }
  }

  const shortCards = q.cards.filter(([a, b]) => a.length <= 70 && b.length <= 70);
  if (shortCards.length < 15) {
    throw new Error(`${q.id}: only ${shortCards.length} MatchGame-eligible cards (<= 70 chars)`);
  }

  const singleTerms = cleanSingleLetterTerms(q.cards);
  if (singleTerms < 8) {
    throw new Error(`${q.id}: only ${singleTerms} single-word 4..11 letter terms for WordGames`);
  }
}

function main(): void {
  const all: QuizOutput[] = [
    ...buildTopics00To12(),
    ...buildTopics13To27(),
    ...buildTopics28To39(),
  ];

  if (all.length !== 40) {
    throw new Error(`Expected 40 topics, got ${all.length}`);
  }

  let totalQuestions = 0;
  for (const quiz of all) {
    validateQuiz(quiz);
    totalQuestions += quiz.questions.length;
    const outPath = path.join(OUT_DIR, `${quiz.id}.json`);
    fs.writeFileSync(outPath, `${JSON.stringify(quiz, null, 2)}\n`, "utf8");
  }

  console.log(`Generated ${all.length} Algebra 9 topic files (${totalQuestions} total questions) into ${OUT_DIR}`);
}

main();
