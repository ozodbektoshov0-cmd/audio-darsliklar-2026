import { useEffect, useMemo, useRef, useState } from "react";
import { Check, X, RotateCcw, Timer, Trophy, ArrowRight, Repeat } from "lucide-react";
import type { ChoiceQuestion, FillQuestion, Question, Quiz, TrueFalseQuestion } from "./types";
import { correctAnswerText, getCards, isChoiceLike, isFillCorrect, shuffle, shuffleOptions } from "./util";

interface GameProps {
  quiz: Quiz;
  uz: boolean;
  /** O'yin tugaganda natija (0-100 yoki to'g'ri javoblar soni) bilan chaqiriladi */
  onFinish: (score: number) => void;
  onRestart: () => void;
}

const card =
  "bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-8 shadow-sm";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-sm font-bold transition-colors disabled:opacity-50";

function ResultCard({
  title,
  big,
  sub,
  uz,
  onRestart,
}: {
  title: string;
  big: string;
  sub?: string;
  uz: boolean;
  onRestart: () => void;
}) {
  return (
    <div className={`${card} text-center`}>
      <Trophy className="mx-auto text-amber-500 mb-3" size={40} />
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{title}</p>
      <p className="text-5xl font-black text-slate-900 dark:text-white my-3">{big}</p>
      {sub && <p className="text-slate-600 dark:text-slate-300 mb-6">{sub}</p>}
      <button type="button" onClick={onRestart} className={primaryBtn}>
        <RotateCcw size={16} />
        {uz ? "Qayta o'ynash" : "Играть снова"}
      </button>
    </div>
  );
}

function optionClass(state: "idle" | "correct" | "wrong" | "dim") {
  const base = "w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ";
  if (state === "correct") return base + "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300";
  if (state === "wrong") return base + "bg-red-50 dark:bg-red-950/50 border-red-500 text-red-800 dark:text-red-300";
  if (state === "dim") return base + "border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600";
  return (
    base +
    "border-slate-200 dark:border-slate-700 hover:border-brand-primary hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100"
  );
}

/** Variantli yoki to'g'ri/noto'g'ri savol uchun tanlash tugmalari */
function ChoiceBlock({
  q,
  picked,
  onPick,
  uz,
}: {
  q: ChoiceQuestion | TrueFalseQuestion;
  picked: number | null;
  onPick: (i: number) => void;
  uz: boolean;
}) {
  const options = q.type === "choice" ? q.options : [uz ? "To'g'ri" : "Верно", uz ? "Noto'g'ri" : "Неверно"];
  const correctIdx = q.type === "choice" ? q.answer : q.answer ? 0 : 1;
  return (
    <div className="space-y-2.5">
      {options.map((opt, i) => {
        let state: "idle" | "correct" | "wrong" | "dim" = "idle";
        if (picked !== null) state = i === correctIdx ? "correct" : i === picked ? "wrong" : "dim";
        return (
          <button key={i} type="button" disabled={picked !== null} onClick={() => onPick(i)} className={optionClass(state)}>
            <span className="inline-flex items-center gap-3">
              <span className="w-6 h-6 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-black flex items-center justify-center text-slate-500">
                {q.type === "choice" ? String.fromCharCode(65 + i) : i === 0 ? "✓" : "✗"}
              </span>
              {opt}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ============ 1) VIKTORINA ============ */
export function QuizGame({ quiz, uz, onFinish, onRestart }: GameProps) {
  const questions = useMemo<Question[]>(
    () => shuffle(quiz.questions).map((q) => (q.type === "choice" ? shuffleOptions(q) : q)),
    [quiz],
  );
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [fillValue, setFillValue] = useState("");
  const [fillChecked, setFillChecked] = useState<null | boolean>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const reported = useRef(false);

  const total = questions.length;
  const q = questions[i];

  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true;
      onFinish(Math.round((correct / total) * 100));
    }
  }, [done, correct, total, onFinish]);

  if (total === 0) return <div className={card}>{uz ? "Savollar yo'q." : "Нет вопросов."}</div>;

  if (done) {
    const pct = Math.round((correct / total) * 100);
    return (
      <ResultCard
        uz={uz}
        title={uz ? "Viktorina natijasi" : "Результат викторины"}
        big={`${pct}%`}
        sub={uz ? `${total} ta savoldan ${correct} tasi to'g'ri` : `${correct} из ${total} верно`}
        onRestart={onRestart}
      />
    );
  }

  const answered = isChoiceLike(q) ? picked !== null : fillChecked !== null;
  const wasCorrect = isChoiceLike(q)
    ? picked !== null && picked === (q.type === "choice" ? q.answer : q.answer ? 0 : 1)
    : fillChecked === true;

  const choose = (idx: number) => {
    setPicked(idx);
    if (isChoiceLike(q) && idx === (q.type === "choice" ? q.answer : q.answer ? 0 : 1)) setCorrect((c) => c + 1);
  };

  const checkFill = () => {
    const ok = isFillCorrect(q as FillQuestion, fillValue);
    setFillChecked(ok);
    if (ok) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (i + 1 >= total) {
      setDone(true);
      return;
    }
    setI(i + 1);
    setPicked(null);
    setFillValue("");
    setFillChecked(null);
  };

  return (
    <div className={card}>
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">
        <span>
          {uz ? "Savol" : "Вопрос"} {i + 1}/{total}
        </span>
        <span>
          {uz ? "To'g'ri" : "Верно"}: {correct}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 mb-6 overflow-hidden">
        <div className="h-full bg-brand-primary transition-all" style={{ width: `${(i / total) * 100}%` }} />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-5 whitespace-pre-line">{q.q}</h3>

      {isChoiceLike(q) ? (
        <ChoiceBlock q={q} picked={picked} onPick={choose} uz={uz} />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (fillChecked === null && fillValue.trim()) checkFill();
          }}
          className="flex gap-2"
        >
          <input
            value={fillValue}
            onChange={(e) => setFillValue(e.target.value)}
            disabled={fillChecked !== null}
            placeholder={uz ? "Javobni yozing..." : "Введите ответ..."}
            autoFocus
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          <button type="submit" disabled={fillChecked !== null || !fillValue.trim()} className={primaryBtn}>
            {uz ? "Tekshirish" : "Проверить"}
          </button>
        </form>
      )}

      {answered && (
        <div
          className={`mt-5 p-4 rounded-xl text-sm ${
            wasCorrect
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300"
          }`}
        >
          <p className="font-black flex items-center gap-1.5">
            {wasCorrect ? <Check size={16} /> : <X size={16} />}
            {wasCorrect ? (uz ? "To'g'ri!" : "Верно!") : uz ? "Noto'g'ri" : "Неверно"}
          </p>
          {!wasCorrect && (
            <p className="mt-1">
              {uz ? "To'g'ri javob: " : "Правильный ответ: "}
              <b>{correctAnswerText(q)}</b>
            </p>
          )}
          {q.explain && <p className="mt-1 opacity-90">{q.explain}</p>}
        </div>
      )}

      {answered && (
        <div className="mt-5 flex justify-end">
          <button type="button" onClick={next} className={primaryBtn}>
            {i + 1 >= total ? (uz ? "Natijani ko'rish" : "Показать результат") : uz ? "Keyingisi" : "Дальше"}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ============ 2) VAQTGA QARSHI ============ */
const TIMED_SECONDS = 60;

export function TimedGame({ quiz, uz, onFinish, onRestart }: GameProps) {
  const pool = useMemo<(ChoiceQuestion | TrueFalseQuestion)[]>(() => quiz.questions.filter(isChoiceLike), [quiz]);
  const [order, setOrder] = useState<Question[]>(() =>
    shuffle(pool).map((q) => (q.type === "choice" ? shuffleOptions(q) : q)),
  );
  const [started, setStarted] = useState(false);
  const [left, setLeft] = useState(TIMED_SECONDS);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [asked, setAsked] = useState(0);
  const reported = useRef(false);
  const done = started && left <= 0;

  useEffect(() => {
    if (!started || left <= 0) return;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [started, left]);

  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true;
      onFinish(score);
    }
  }, [done, score, onFinish]);

  if (pool.length === 0) {
    return <div className={card}>{uz ? "Bu test uchun variantli savollar yo'q." : "Нет вопросов с вариантами."}</div>;
  }

  if (!started) {
    return (
      <div className={`${card} text-center`}>
        <Timer className="mx-auto text-brand-primary mb-3" size={40} />
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
          {uz ? `${TIMED_SECONDS} soniya` : `${TIMED_SECONDS} секунд`}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
          {uz
            ? "Vaqt tugaguncha iloji boricha ko'proq savolga to'g'ri javob bering. Har bir to'g'ri javob 1 ball."
            : "Ответьте правильно на как можно больше вопросов до конца времени. Каждый верный ответ — 1 балл."}
        </p>
        <button type="button" onClick={() => setStarted(true)} className={primaryBtn}>
          {uz ? "Boshlash" : "Начать"}
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <ResultCard
        uz={uz}
        title={uz ? "Vaqtga qarshi" : "На время"}
        big={String(score)}
        sub={uz ? `${asked} ta savoldan ${score} tasiga to'g'ri javob berdingiz` : `Верно ${score} из ${asked}`}
        onRestart={onRestart}
      />
    );
  }

  const q = order[i % order.length] as ChoiceQuestion | TrueFalseQuestion;

  const pick = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    setAsked((a) => a + 1);
    const correctIdx = q.type === "choice" ? q.answer : q.answer ? 0 : 1;
    if (idx === correctIdx) setScore((s) => s + 1);
    const nextI = i + 1;
    setTimeout(() => {
      setPicked(null);
      // Savollar tugasa, qayta aralashtiramiz
      if (nextI % order.length === 0) setOrder(shuffle(pool).map((x) => (x.type === "choice" ? shuffleOptions(x) : x)));
      setI(nextI);
    }, 650);
  };

  return (
    <div className={card}>
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center gap-1.5 text-sm font-black text-brand-primary dark:text-blue-300">
          <Timer size={16} /> {left}s
        </span>
        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
          {uz ? "Ball" : "Баллы"}: {score}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 mb-6 overflow-hidden">
        <div className="h-full bg-amber-500 transition-all duration-1000 ease-linear" style={{ width: `${(left / TIMED_SECONDS) * 100}%` }} />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-5 whitespace-pre-line">{q.q}</h3>
      <ChoiceBlock q={q} picked={picked} onPick={pick} uz={uz} />
    </div>
  );
}

/* ============ 3) KARTOCHKALAR ============ */
export function CardsGame({ quiz, uz, onFinish, onRestart }: GameProps) {
  const deck = useMemo(() => shuffle(getCards(quiz)), [quiz]);
  const [queue, setQueue] = useState<number[]>(() => deck.map((_, i) => i));
  const [flipped, setFlipped] = useState(false);
  const [firstTry, setFirstTry] = useState(0);
  const [retried, setRetried] = useState<Set<number>>(() => new Set());
  const reported = useRef(false);
  const done = queue.length === 0 && deck.length > 0;

  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true;
      onFinish(Math.round((firstTry / deck.length) * 100));
    }
  }, [done, firstTry, deck.length, onFinish]);

  if (deck.length === 0) return <div className={card}>{uz ? "Kartochkalar yo'q." : "Нет карточек."}</div>;

  if (done) {
    return (
      <ResultCard
        uz={uz}
        title={uz ? "Kartochkalar" : "Карточки"}
        big={`${Math.round((firstTry / deck.length) * 100)}%`}
        sub={uz ? `${deck.length} ta kartochkadan ${firstTry} tasini birinchi urinishda bildingiz` : `С первого раза: ${firstTry} из ${deck.length}`}
        onRestart={onRestart}
      />
    );
  }

  const idx = queue[0];
  const [front, back] = deck[idx];

  const advance = (known: boolean) => {
    setFlipped(false);
    if (known) {
      if (!retried.has(idx)) setFirstTry((n) => n + 1);
      setQueue((qu) => qu.slice(1));
    } else {
      setRetried((r) => new Set(r).add(idx));
      setQueue((qu) => [...qu.slice(1), idx]);
    }
  };

  return (
    <div className={card}>
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-4">
        <span>
          {uz ? "Qoldi" : "Осталось"}: {queue.length}
        </span>
        <span>
          {uz ? "Bildim" : "Знаю"}: {deck.length - queue.length}/{deck.length}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className={`w-full min-h-[200px] rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors ${
          flipped ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800" : "bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700"
        }`}
        aria-label={uz ? "Kartochkani aylantirish" : "Перевернуть карточку"}
      >
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
          {flipped ? (uz ? "Javob" : "Ответ") : uz ? "Savol (bosing)" : "Вопрос (нажмите)"}
        </span>
        <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white whitespace-pre-line">{flipped ? back : front}</span>
      </button>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={!flipped}
          onClick={() => advance(false)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-bold disabled:opacity-40"
        >
          <Repeat size={15} /> {uz ? "Takrorlayman" : "Повторить"}
        </button>
        <button
          type="button"
          disabled={!flipped}
          onClick={() => advance(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold disabled:opacity-40"
        >
          <Check size={15} /> {uz ? "Bilaman" : "Знаю"}
        </button>
      </div>
      <button type="button" onClick={onRestart} className="mt-4 mx-auto block text-xs font-bold text-slate-400 hover:text-slate-600">
        {uz ? "Aralashtirib boshidan" : "Перемешать заново"}
      </button>
    </div>
  );
}

/* ============ 4) JUFTLASH ============ */
const MATCH_PAIRS = 6;

export function MatchGame({ quiz, uz, onFinish, onRestart }: GameProps) {
  const pairs = useMemo(() => {
    const short = getCards(quiz).filter(([a, b]) => a.length <= 70 && b.length <= 70);
    return shuffle(short).slice(0, MATCH_PAIRS);
  }, [quiz]);
  const rightOrder = useMemo(() => shuffle(pairs.map((_, i) => i)), [pairs]);
  const [selLeft, setSelLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(() => new Set());
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState<{ l: number; r: number } | null>(null);
  const reported = useRef(false);
  const done = pairs.length > 0 && matched.size === pairs.length;
  const score = Math.max(0, 100 - mistakes * 15);

  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true;
      onFinish(score);
    }
  }, [done, score, onFinish]);

  if (pairs.length < 3) {
    return <div className={card}>{uz ? "Juftlash uchun yetarli qisqa kartochka yo'q." : "Недостаточно коротких карточек."}</div>;
  }

  if (done) {
    return (
      <ResultCard
        uz={uz}
        title={uz ? "Juftlash" : "Соединение пар"}
        big={`${score}`}
        sub={mistakes === 0 ? (uz ? "Xatosiz!" : "Без ошибок!") : uz ? `Xatolar: ${mistakes}` : `Ошибок: ${mistakes}`}
        onRestart={onRestart}
      />
    );
  }

  const clickRight = (r: number) => {
    if (selLeft === null || matched.has(r) || wrong) return;
    if (selLeft === r) {
      setMatched((m) => new Set(m).add(r));
      setSelLeft(null);
    } else {
      setMistakes((m) => m + 1);
      setWrong({ l: selLeft, r });
      setTimeout(() => {
        setWrong(null);
        setSelLeft(null);
      }, 700);
    }
  };

  const itemBase = "w-full text-left px-3 py-3 rounded-xl border text-xs sm:text-sm font-semibold transition-colors ";

  return (
    <div className={card}>
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-4">
        <span>{uz ? "Chapdan tanlang, keyin o'ngdan juftini toping" : "Выберите слева, затем найдите пару справа"}</span>
        <span>
          {uz ? "Xato" : "Ошибки"}: {mistakes}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2.5">
          {pairs.map(([a], l) => (
            <button
              key={l}
              type="button"
              disabled={matched.has(l)}
              onClick={() => !wrong && setSelLeft(l)}
              className={
                itemBase +
                (matched.has(l)
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-700 dark:text-emerald-300"
                  : wrong?.l === l
                    ? "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-700 dark:text-red-300"
                    : selLeft === l
                      ? "bg-blue-100 dark:bg-slate-700 border-brand-primary text-slate-900 dark:text-white"
                      : "border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-brand-primary")
              }
            >
              {a}
            </button>
          ))}
        </div>
        <div className="space-y-2.5">
          {rightOrder.map((r) => (
            <button
              key={r}
              type="button"
              disabled={matched.has(r) || selLeft === null}
              onClick={() => clickRight(r)}
              className={
                itemBase +
                (matched.has(r)
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-700 dark:text-emerald-300"
                  : wrong?.r === r
                    ? "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-700 dark:text-red-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-brand-primary disabled:hover:border-slate-200 dark:disabled:hover:border-slate-700")
              }
            >
              {pairs[r][1]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
