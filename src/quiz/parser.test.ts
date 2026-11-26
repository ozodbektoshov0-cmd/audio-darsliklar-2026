import test from "node:test";
import assert from "node:assert/strict";
import { parseTestContent } from "./parser";

test("parseTestContent parses numbered choice questions with * marker and Javob/Izoh", () => {
  const input = `
1. O'zbekiston poytaxti qaysi shahar?
A) Samarqand
*B) Toshkent
C) Buxoro
D) Xiva
Izoh: Toshkent 1930-yildan beri poytaxt.

2. Alisher Navoiy qachon tug'ilgan?
A) 1400
B) 1441
C) 1483

Javob: B
`;
  const res = parseTestContent(input);
  assert.equal(res.questions.length, 2);
  assert.equal(res.questions[0].type, "choice");
  if (res.questions[0].type === "choice") {
    assert.equal(res.questions[0].answer, 1);
    assert.equal(res.questions[0].options[1], "Toshkent");
    assert.match(res.questions[0].explain ?? "", /Toshkent/);
  }
  assert.equal(res.questions[1].type, "choice");
  if (res.questions[1].type === "choice") {
    assert.equal(res.questions[1].answer, 1);
  }
  assert.equal(res.cards.length, 2);
});

test("parseTestContent parses JSON arrays and pipe/equals shorthand", () => {
  const jsonRes = parseTestContent(
    JSON.stringify({
      questions: [
        { type: "choice", q: "2 + 2 = ?", options: ["3", "4", "5"], answer: 1 },
        { type: "truefalse", q: "Quyosh sharqdan chiqadi", answer: true },
      ],
    }),
  );
  assert.equal(jsonRes.questions.length, 2);

  const textRes = parseTestContent(`
Ona tili nechta unli bor? | 6 ta | 5 ta | 7 ta
Alpomish = Qahramonlik dostoni
`);
  assert.equal(textRes.questions.length, 2);
  assert.equal(textRes.questions[0].type, "choice");
  assert.equal(textRes.questions[1].type, "fill");
  assert.equal(textRes.cards.length, 2);
});
