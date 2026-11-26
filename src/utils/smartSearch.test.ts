import test from "node:test";
import assert from "node:assert/strict";
import { getSubjectsWithAudio } from "../data/index.ts";
import {
  fuzzyScore,
  generateDeterministicMaterial,
  levenshteinDistance,
  MATERIAL_TYPES,
  searchUnifiedCatalog,
} from "./smartSearch.ts";

test("getSubjectsWithAudio returns real audio subjects for grades 8 and 9", () => {
  const withAudio = getSubjectsWithAudio();
  assert.ok(withAudio.length >= 2);
  assert.ok(withAudio.some((s) => s.id === "g8-uz-adabiyot"));
  assert.ok(withAudio.some((s) => s.id === "g9-uz-adabiyot"));
});

test("Fuzzy search handles typos cleanly (e.g. Alpmish -> Alpomish)", () => {
  assert.equal(levenshteinDistance("alpmish", "alpomish"), 1);
  assert.ok(fuzzyScore("Alpmish", "9-sinf Adabiyot Alpomish dostoni") > 0);
  assert.ok(fuzzyScore("Matmatika", "7-sinf Matematika va Algebra") > 0);

  const hits = searchUnifiedCatalog("Alpmish", "all", "uz", 10);
  assert.ok(hits.length >= 1);
  assert.ok(hits.some((h) => h.title.toLowerCase().includes("alpomish")));
});

test("searchUnifiedCatalog respects scope filter including audio", () => {
  const audioHits = searchUnifiedCatalog("Adabiyot", "audio", "uz", 10);
  assert.ok(audioHits.length >= 1);
  for (const h of audioHits) {
    assert.equal(h.kind, "audio");
  }
});

test("Deterministic material generator builds valid printable sheets for all 10 types", () => {
  assert.equal(MATERIAL_TYPES.length, 10);
  for (const m of MATERIAL_TYPES) {
    const doc = generateDeterministicMaterial({
      typeId: m.id,
      grade: "9",
      subject: "Adabiyot",
      topic: "Alpomish dostoni",
    });
    assert.ok(doc.title.length > 0);
    assert.ok(doc.blocks.length >= 1);
    for (const block of doc.blocks) {
      assert.ok(block.prompt.length > 0);
      assert.ok(block.answer.length > 0);
    }
  }
});
