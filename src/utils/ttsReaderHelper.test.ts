import test from "node:test";
import assert from "node:assert/strict";
import { cleanTextForSpeech, formatQuizPayloadForSpeech } from "./ttsReaderHelper";

test("cleanTextForSpeech strips markdown symbols and clamps length", () => {
  const input = "### **Kvadrat tenglama**: `ax^2 + bx + c = 0` [ko'rish](https://example.com)";
  const out = cleanTextForSpeech(input);
  assert.equal(out.includes("**"), false);
  assert.equal(out.includes("https://"), false);
  assert.match(out, /Kvadrat tenglama/);
});

test("formatQuizPayloadForSpeech formats question and labeled options", () => {
  const out = formatQuizPayloadForSpeech(
    {
      question: "2x + 4 = 10 tenglamani yeching.",
      options: ["x = 3", "x = 5", "x = 2", "x = 7"],
    },
    true,
  );
  assert.match(out, /2x \+ 4 = 10/);
  assert.match(out, /Variantlar: A: x = 3\. B: x = 5\./);
});
