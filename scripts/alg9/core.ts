export interface ChoiceQ {
  type: "choice";
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface TrueFalseQ {
  type: "truefalse";
  q: string;
  answer: boolean;
  explain: string;
}

export interface FillQ {
  type: "fill";
  q: string;
  answer: string | string[];
  explain: string;
}

export type GenQuestion = ChoiceQ | TrueFalseQ | FillQ;

export interface QuizOutput {
  id: string;
  subjectId: "g9-uz-algebra";
  grade: "9";
  lang: "uz";
  subjectName: "Algebra";
  topicTitle: string;
  title: string;
  source: string;
  questions: GenQuestion[];
  cards: [string, string][];
}

export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ʻʼ’‘`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x === 0 ? 1 : x;
}

export function fracStr(num: number, den: number): string {
  if (den === 0) throw new Error("Zero denominator");
  if (num === 0) return "0";
  const sign = (num < 0) !== (den < 0) ? -1 : 1;
  const an = Math.abs(Math.round(num));
  const ad = Math.abs(Math.round(den));
  const g = gcd(an, ad);
  const rn = sign * (an / g);
  const rd = ad / g;
  return rd === 1 ? `${rn}` : `${rn}/${rd}`;
}

export function signedTerm(coef: number, variable = "", isFirst = false): string {
  if (coef === 0) return "";
  const abs = Math.abs(coef);
  const sign = coef < 0 ? (isFirst ? "−" : " − ") : isFirst ? "" : " + ";
  if (!variable) return `${sign}${abs}`;
  const numPart = abs === 1 ? "" : `${abs}`;
  return `${sign}${numPart}${variable}`;
}

export function polyQuad(a: number, b: number, c: number, v = "x"): string {
  const parts: string[] = [];
  if (a !== 0) parts.push(signedTerm(a, `${v}²`, parts.length === 0));
  if (b !== 0) parts.push(signedTerm(b, v, parts.length === 0));
  if (c !== 0) parts.push(signedTerm(c, "", parts.length === 0));
  return parts.length > 0 ? parts.join("") : "0";
}

export function polyLinear(k: number, b: number, v = "x"): string {
  const parts: string[] = [];
  if (k !== 0) parts.push(signedTerm(k, v, parts.length === 0));
  if (b !== 0) parts.push(signedTerm(b, "", parts.length === 0));
  return parts.length > 0 ? parts.join("") : "0";
}

export function fmtXShift(h: number): string {
  if (h === 0) return "x";
  return h > 0 ? `(x − ${h})` : `(x + ${Math.abs(h)})`;
}

export function pickNumDistractors(correct: number, candidates: number[]): string[] {
  const seen = new Set<string>([`${correct}`]);
  const out: string[] = [];
  for (const cand of candidates) {
    const s = `${cand}`;
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
      if (out.length === 3) break;
    }
  }
  let step = 1;
  while (out.length < 3) {
    const cand = correct + (step % 2 === 0 ? step : -step);
    const s = `${cand}`;
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
    step++;
  }
  return out;
}

export function pickStrDistractors(correct: string, candidates: string[]): string[] {
  const seen = new Set<string>([normalizeText(correct)]);
  const out: string[] = [];
  for (const c of candidates) {
    const nc = normalizeText(c);
    if (nc.length > 0 && !seen.has(nc)) {
      seen.add(nc);
      out.push(c.trim());
      if (out.length === 3) break;
    }
  }
  return out;
}

export class TopicBuilder {
  readonly id: string;
  readonly topicTitle: string;
  readonly title: string;
  readonly source: string;
  readonly rng: () => number;
  private seenQ = new Set<string>();
  private seenCard = new Set<string>();
  private questions: GenQuestion[] = [];
  private cards: [string, string][] = [];

  constructor(opts: { id: string; topicTitle: string; title: string; source: string; seed: number }) {
    this.id = opts.id;
    this.topicTitle = opts.topicTitle;
    this.title = opts.title;
    this.source = opts.source;
    this.rng = mulberry32(opts.seed);
  }

  get count(): number {
    return this.questions.length;
  }

  private shuffleArr<T>(arr: readonly T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  addChoice(q: string, correct: string, distractors: string[], explain: string): boolean {
    const cleanQ = q.replace(/\s+/g, " ").trim();
    const nq = normalizeText(cleanQ);
    if (nq.length < 10 || this.seenQ.has(nq)) return false;

    const cleanCorrect = correct.trim();
    const dList = pickStrDistractors(cleanCorrect, distractors);
    if (dList.length < 3) return false;

    const indexed = [
      { text: cleanCorrect, ok: true },
      { text: dList[0], ok: false },
      { text: dList[1], ok: false },
      { text: dList[2], ok: false },
    ];
    const mixed = this.shuffleArr(indexed);
    const answerIdx = mixed.findIndex((m) => m.ok);

    this.seenQ.add(nq);
    this.questions.push({
      type: "choice",
      q: cleanQ,
      options: mixed.map((m) => m.text),
      answer: answerIdx,
      explain: explain.replace(/\s+/g, " ").trim(),
    });
    return true;
  }

  addTF(q: string, answer: boolean, explain: string): boolean {
    const cleanQ = q.replace(/\s+/g, " ").trim();
    const nq = normalizeText(cleanQ);
    if (nq.length < 10 || this.seenQ.has(nq)) return false;
    this.seenQ.add(nq);
    this.questions.push({
      type: "truefalse",
      q: cleanQ,
      answer,
      explain: explain.replace(/\s+/g, " ").trim(),
    });
    return true;
  }

  addFill(q: string, answer: string | string[], explain: string): boolean {
    const cleanQ = q.replace(/\s+/g, " ").trim();
    const nq = normalizeText(cleanQ);
    if (nq.length < 10 || this.seenQ.has(nq)) return false;
    const ans = Array.isArray(answer) ? answer.map((a) => a.trim()).filter(Boolean) : answer.trim();
    if (Array.isArray(ans) ? ans.length === 0 : ans.length === 0) return false;
    this.seenQ.add(nq);
    this.questions.push({
      type: "fill",
      q: cleanQ,
      answer: ans,
      explain: explain.replace(/\s+/g, " ").trim(),
    });
    return true;
  }

  addCard(front: string, back: string): void {
    const f = front.replace(/\s+/g, " ").trim();
    const b = back.replace(/\s+/g, " ").trim();
    const key = normalizeText(f);
    if (!f || !b || this.seenCard.has(key)) return;
    this.seenCard.add(key);
    this.cards.push([f, b]);
  }

  addCards(pairs: [string, string][]): void {
    for (const [f, b] of pairs) this.addCard(f, b);
  }

  build(targetMin = 330, targetMax = 350): QuizOutput {
    if (this.questions.length < targetMin) {
      throw new Error(`Topic ${this.id} generated only ${this.questions.length} questions (need >= ${targetMin})`);
    }
    const finalQuestions = this.questions.slice(0, targetMax);
    if (this.cards.length < 22) {
      throw new Error(`Topic ${this.id} has only ${this.cards.length} cards (need >= 22)`);
    }
    return {
      id: this.id,
      subjectId: "g9-uz-algebra",
      grade: "9",
      lang: "uz",
      subjectName: "Algebra",
      topicTitle: this.topicTitle,
      title: this.title,
      source: this.source,
      questions: finalQuestions,
      cards: this.cards,
    };
  }
}

export function cleanSingleLetterTerms(cards: [string, string][]): number {
  return cards.filter(([f]) => {
    const clean = f
      .toUpperCase()
      .replace(/[ʻʼ’‘`´'\-\s.,!?;:«»"()]/g, "")
      .replace(/[^A-ZА-ЯЁЎҚҒҲ]/g, "");
    return f.trim().split(/\s+/).length <= 2 && clean.length >= 4 && clean.length <= 11;
  }).length;
}
