import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Award,
  Calculator,
  Check,
  Clock,
  Flag,
  Flame,
  Gift,
  Grid3X3,
  HelpCircle,
  Layers,
  Link2,
  Package,
  RotateCcw,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";
import type { IntellectualGameId, PlayMode, Quiz } from "./types";
import { buildExplanation, correctAnswerText, isFillCorrect, normalize, shuffle } from "./util";
import { GENERAL_INTELLECTUAL_QUIZ } from "./generalGamesPack";
import {
  applyTugStep,
  buildCrosswordGrid,
  buildJeopardyBoard,
  buildMathDuelProblems,
  buildMemoryDeck,
  buildMysteryBoxes,
  buildWordChain,
  computeNextWheelRotation,
  extractClozePuzzles,
  extractSentencePuzzles,
  extractWordPuzzles,
  generateWordSearch,
  getLineCoords,
  isSentenceSolved,
  matchWordSearchSelection,
  scoreRaceStep,
  scoreTrueFalseStreak,
  scrambleWordTiles,
  toPlayableChoiceQuestions,
  WHEEL_SECTORS,
  type GridCoord,
  type JeopardyTile,
  type MysteryBoxTile,
} from "./gameEngines";
import { CardsGame, ChoiceBlock, MatchGame } from "./games";

const TugOfWar3D = lazy(() => import("./TugOfWar3D"));
const MysteryBox3DStage = lazy(() =>
  import("./MysteryBox3D").then((m) => ({ default: m.MysteryBox3DStage })),
);

function ThreeDStageFallback({ label }: { label: string }) {
  return (
    <div className="w-full h-[260px] rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4 text-xs font-bold text-slate-500 dark:text-slate-400">
      {label}
    </div>
  );
}

export interface IntellectualGameProps {
  quiz: Quiz;
  /** Butun kitob yoki fan ichidagi barcha mavzular (Jeopardy kategoriyalari uchun) */
  relatedQuizzes?: Quiz[];
  uz: boolean;
  playMode: PlayMode;
  onFinish: (score: number) => void;
  onRestart: () => void;
}

const cardClass =
  "bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-sm font-bold transition-colors disabled:opacity-50 whitespace-nowrap shrink-0";

function TeamScoreHeader({
  playMode,
  scores,
  activeTeam,
  uz,
  extra,
}: {
  playMode: PlayMode;
  scores: [number, number];
  activeTeam: 1 | 2;
  uz: boolean;
  extra?: string;
}) {
  const isTeam = playMode !== "solo";
  const label1 = playMode === "class" ? (uz ? "1-guruh" : "Группа 1") : uz ? "1-jamoa" : "Команда 1";
  const label2 = playMode === "class" ? (uz ? "2-guruh" : "Группа 2") : uz ? "2-jamoa" : "Команда 2";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
      {isTeam ? (
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2 tabular-nums transition-colors ${
              activeTeam === 1
                ? "bg-blue-50 dark:bg-blue-950/50 border-brand-primary text-brand-primary dark:text-blue-200"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            <Users size={14} />
            <span>{label1}:</span>
            <span className="font-black text-base">{scores[0]}</span>
          </div>
          <div
            className={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2 tabular-nums transition-colors ${
              activeTeam === 2
                ? "bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-800 dark:text-amber-200"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            <Users size={14} />
            <span>{label2}:</span>
            <span className="font-black text-base">{scores[1]}</span>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {uz ? `Navbat: ${activeTeam === 1 ? label1 : label2}` : `Ход: ${activeTeam === 1 ? label1 : label2}`}
          </span>
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-sm font-bold text-brand-primary dark:text-blue-200 tabular-nums">
          <Award size={16} />
          <span>{uz ? "Ball:" : "Очки:"}</span>
          <span className="font-black text-base">{scores[0]}</span>
        </div>
      )}
      {extra && <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">{extra}</span>}
    </div>
  );
}

function WinnerPanel({
  title,
  playMode,
  scores,
  uz,
  onRestart,
}: {
  title: string;
  playMode: PlayMode;
  scores: [number, number];
  uz: boolean;
  onRestart: () => void;
}) {
  const isTeam = playMode !== "solo";
  const winnerMsg = isTeam
    ? scores[0] === scores[1]
      ? uz
        ? "Durrang!"
        : "Ничья!"
      : scores[0] > scores[1]
        ? uz
          ? "1-jamoa g'olib!"
          : "Победила Команда 1!"
        : uz
          ? "2-jamoa g'olib!"
          : "Победила Команда 2!"
    : `${scores[0]} ${uz ? "ball" : "очков"}`;

  return (
    <div className={`${cardClass} text-center`}>
      <Trophy className="mx-auto text-amber-500 mb-3" size={44} />
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
      <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white my-3">{winnerMsg}</h3>
      {isTeam && (
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-6 tabular-nums">
          {uz ? `1-jamoa: ${scores[0]} ball · 2-jamoa: ${scores[1]} ball` : `Команда 1: ${scores[0]} · Команда 2: ${scores[1]}`}
        </p>
      )}
      <button type="button" onClick={onRestart} className={primaryBtn}>
        <RotateCcw size={16} />
        {uz ? "Qayta o'ynash" : "Играть снова"}
      </button>
    </div>
  );
}

/* ============ 1. SIRLI QUTI (MYSTERY BOX) ============ */
export function MysteryBoxGame({ quiz, uz, playMode, onFinish, onRestart }: IntellectualGameProps) {
  const [boxes] = useState<MysteryBoxTile[]>(() => buildMysteryBoxes(quiz, 12, uz));
  const [openedIds, setOpenedIds] = useState<Set<number>>(() => new Set());
  const [activeBox, setActiveBox] = useState<MysteryBoxTile | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [activeTeam, setActiveTeam] = useState<1 | 2>(1);
  const [multiplier, setMultiplier] = useState<1 | 2>(1);
  const [surpriseMsg, setSurpriseMsg] = useState<string | null>(null);
  const reported = useRef(false);

  const done = openedIds.size === boxes.length && activeBox === null;

  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true;
      onFinish(Math.max(scores[0], scores[1]));
    }
  }, [done, scores, onFinish]);

  if (done) {
    return (
      <WinnerPanel
        title={uz ? "Sirli quti yakuni" : "Итоги «Тайного ящика»"}
        playMode={playMode}
        scores={scores}
        uz={uz}
        onRestart={onRestart}
      />
    );
  }

  const addPoints = (delta: number) => {
    setScores((prev) =>
      activeTeam === 1 ? [Math.max(0, prev[0] + delta), prev[1]] : [prev[0], Math.max(0, prev[1] + delta)],
    );
  };

  const openBox = (box: MysteryBoxTile) => {
    if (openedIds.has(box.id) || activeBox) return;
    setOpenedIds((prev) => new Set(prev).add(box.id));
    setPicked(null);
    setSurpriseMsg(null);

    if (box.kind === "gift") {
      const gained = box.points * multiplier;
      addPoints(gained);
      setMultiplier(1);
      setSurpriseMsg(uz ? `Kutilmagan sovg'a! +${gained} ball qo'shildi.` : `Неожиданный подарок! +${gained} очков.`);
      setActiveBox(box);
    } else if (box.kind === "double") {
      setMultiplier(2);
      setSurpriseMsg(uz ? "Omadli quti! Keyingi to'g'ri javob balli 2 barobar (2x) bo'ladi." : "Удача! Следующий верный ответ удваивается (2x).");
      setActiveBox(box);
    } else if (box.kind === "trap") {
      addPoints(box.points);
      setMultiplier(1);
      setSurpriseMsg(uz ? `Kutilmagan tuzoq: ${box.points} ball ayirildi!` : `Ловушка: ${box.points} очков!`);
      setActiveBox(box);
    } else {
      setActiveBox(box);
    }
  };

  const answerQuestion = (idx: number) => {
    if (!activeBox?.question || picked !== null) return;
    setPicked(idx);
    const q = activeBox.question;
    const correctIdx = q.type === "choice" ? q.answer : q.answer ? 0 : 1;
    if (idx === correctIdx) {
      addPoints(activeBox.points * multiplier);
      setMultiplier(1);
    }
  };

  const closeBox = () => {
    setActiveBox(null);
    setPicked(null);
    setSurpriseMsg(null);
    if (playMode !== "solo") setActiveTeam((t) => (t === 1 ? 2 : 1));
  };

  return (
    <div className={cardClass}>
      <TeamScoreHeader
        playMode={playMode}
        scores={scores}
        activeTeam={activeTeam}
        uz={uz}
        extra={`${uz ? "Ochildi:" : "Открыто:"} ${openedIds.size}/${boxes.length}${multiplier === 2 ? " · 2x faol" : ""}`}
      />

      {!activeBox ? (
        <>
          <Suspense fallback={<ThreeDStageFallback label={uz ? "3D sahna yuklanmoqda..." : "Загрузка 3D сцены..."} />}>
            <MysteryBox3DStage
              total={boxes.length}
              openedIds={openedIds}
              disabled={activeBox !== null}
              onOpenBox={(id) => {
                const found = boxes.find((b) => b.id === id);
                if (found) openBox(found);
              }}
            />
          </Suspense>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            {uz
              ? "3D sahnadagi yoki quyidagi raqamlangan qutilardan birini tanlang — savol, sovg'a yoki 2x ball chiqadi."
              : "Выберите коробку на 3D сцене или ниже — внутри вопрос, подарок или 2x."}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {boxes.map((box) => {
              const isOpen = openedIds.has(box.id);
              return (
                <button
                  key={box.id}
                  type="button"
                  disabled={isOpen}
                  onClick={() => openBox(box)}
                  className={`min-h-[88px] rounded-2xl border flex flex-col items-center justify-center gap-1.5 font-black transition-all ${
                    isOpen
                      ? "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400"
                      : "bg-amber-50 dark:bg-slate-800 border-amber-300 dark:border-slate-700 text-slate-900 dark:text-white hover:border-brand-primary hover:-translate-y-0.5 shadow-xs"
                  }`}
                >
                  <Package size={22} className={isOpen ? "text-slate-400" : "text-amber-600 dark:text-amber-400"} />
                  <span className="text-base tabular-nums">
                    {isOpen ? (uz ? "Ochildi" : "Открыто") : `${uz ? "Quti" : "Ящик"} #${box.id}`}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {uz ? `Quti #${activeBox.id}` : `Ящик #${activeBox.id}`}
              {activeBox.kind === "question" && ` · +${activeBox.points * multiplier} ${uz ? "ball" : "очков"}`}
            </span>
          </div>

          {surpriseMsg ? (
            <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-center">
              <Gift className="mx-auto text-amber-600 mb-2" size={34} />
              <p className="text-lg font-black text-slate-900 dark:text-white mb-4">{surpriseMsg}</p>
              <button type="button" onClick={closeBox} className={primaryBtn}>
                {uz ? "Davom etish" : "Продолжить"}
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            activeBox.question && (
              <>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {activeBox.question.q}
                </h3>
                <ChoiceBlock q={activeBox.question} picked={picked} onPick={answerQuestion} uz={uz} />
                {picked !== null && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {uz ? "To'g'ri javob:" : "Правильный ответ:"} {correctAnswerText(activeBox.question, uz)}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">
                      {buildExplanation(activeBox.question, uz)}
                    </p>
                    <div className="mt-4 flex justify-end">
                      <button type="button" onClick={closeBox} className={primaryBtn}>
                        {uz ? "Keyingi quti" : "Следующий ящик"}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ============ 2. OMAD CHARXI (WHEEL OF FORTUNE) ============ */
export function WheelOfFortuneGame({ quiz, uz, playMode, onFinish, onRestart }: IntellectualGameProps) {
  const pool = useMemo(() => toPlayableChoiceQuestions(quiz, uz), [quiz, uz]);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [sectorIdx, setSectorIdx] = useState<number | null>(null);
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [activeTeam, setActiveTeam] = useState<1 | 2>(1);
  const [multiplier, setMultiplier] = useState<1 | 2>(1);
  const [round, setRound] = useState(0);
  const maxRounds = 8;
  const reported = useRef(false);

  const done = round >= maxRounds && sectorIdx === null;

  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true;
      onFinish(Math.max(scores[0], scores[1]));
    }
  }, [done, scores, onFinish]);

  if (done) {
    return (
      <WinnerPanel
        title={uz ? "Omad charxi yakuni" : "Итоги «Колеса фортуны»"}
        playMode={playMode}
        scores={scores}
        uz={uz}
        onRestart={onRestart}
      />
    );
  }

  const addScore = (delta: number) => {
    setScores((prev) =>
      activeTeam === 1 ? [Math.max(0, prev[0] + delta), prev[1]] : [prev[0], Math.max(0, prev[1] + delta)],
    );
  };

  const spin = () => {
    if (spinning || sectorIdx !== null) return;
    const chosen = Math.floor(Math.random() * WHEEL_SECTORS.length);
    const nextRot = computeNextWheelRotation(rotation, chosen, 4);
    setSpinning(true);
    setRotation(nextRot);

    window.setTimeout(() => {
      setSpinning(false);
      setSectorIdx(chosen);
      setPicked(null);
      const sec = WHEEL_SECTORS[chosen];
      if (sec.type === "bonus") {
        addScore(sec.points * multiplier);
        setMultiplier(1);
      } else if (sec.type === "double") {
        setMultiplier(2);
      } else if (sec.type === "penalty") {
        addScore(sec.points);
        setMultiplier(1);
      }
    }, 1500);
  };

  const activeSector = sectorIdx !== null ? WHEEL_SECTORS[sectorIdx] : null;
  const q = pool.length > 0 ? pool[qIdx % pool.length] : null;

  const answerWheelQ = (idx: number) => {
    if (!q || !activeSector || picked !== null) return;
    setPicked(idx);
    const correctIdx = q.type === "choice" ? q.answer : q.answer ? 0 : 1;
    if (idx === correctIdx) {
      addScore(activeSector.points * multiplier);
      setMultiplier(1);
    }
  };

  const finishTurn = () => {
    setSectorIdx(null);
    setPicked(null);
    setQIdx((n) => n + 1);
    setRound((r) => r + 1);
    if (playMode !== "solo") setActiveTeam((t) => (t === 1 ? 2 : 1));
  };

  const sliceAngle = 360 / WHEEL_SECTORS.length;
  const gradientStops = WHEEL_SECTORS.map(
    (s, idx) => `${s.color} ${idx * sliceAngle}deg ${(idx + 1) * sliceAngle}deg`,
  ).join(", ");

  return (
    <div className={cardClass}>
      <TeamScoreHeader
        playMode={playMode}
        scores={scores}
        activeTeam={activeTeam}
        uz={uz}
        extra={`${uz ? "Aylantirish:" : "Раунд:"} ${round}/${maxRounds}${multiplier === 2 ? " · 2x faol" : ""}`}
      />

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col items-center">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* Pointer */}
            <div
              aria-hidden="true"
              className="absolute -top-3 z-20 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-slate-900 dark:border-t-white drop-shadow"
            />
            <div
              className="w-full h-full rounded-full border-4 border-slate-900 dark:border-slate-200 shadow-lg relative overflow-hidden transition-transform duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                background: `conic-gradient(${gradientStops})`,
                transform: `rotate(${rotation}deg)`,
              }}
            >
              {WHEEL_SECTORS.map((s, idx) => {
                const angle = idx * sliceAngle + sliceAngle / 2;
                return (
                  <span
                    key={idx}
                    className="absolute left-1/2 top-1/2 text-[11px] font-black text-white drop-shadow whitespace-nowrap"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${angle - 90}deg) translateX(74px)`,
                    }}
                  >
                    {s.label}
                  </span>
                );
              })}
              <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-white shadow" />
            </div>
          </div>

          <button
            type="button"
            disabled={spinning || sectorIdx !== null}
            onClick={spin}
            className={`${primaryBtn} mt-6`}
          >
            <Sparkles size={16} />
            {spinning
              ? uz
                ? "Aylanmoqda..."
                : "Вращается..."
              : uz
                ? "G'ildirakni aylantirish"
                : "Крутить колесо"}
          </button>
        </div>

        <div>
          {!activeSector ? (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <p className="font-bold text-slate-900 dark:text-white mb-2">
                {uz ? "Aylantirish tugmasini bosing" : "Нажмите кнопку вращения"}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {uz
                  ? "Strelka to'xtagan bo'limga qarab savol beriladi yoki bonus ball taqdim etiladi."
                  : "В зависимости от сектора появится вопрос или бонусные очки."}
              </p>
            </div>
          ) : activeSector.type !== "question" || !q ? (
            <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-1">
                {activeSector.label}
              </p>
              <p className="text-lg font-black text-slate-900 dark:text-white mb-4">
                {activeSector.type === "bonus"
                  ? uz
                    ? `Ajoyib! Sizga +${activeSector.points} sovg'a ball qo'shildi.`
                    : `Отлично! Начислено +${activeSector.points} бонусных очков.`
                  : activeSector.type === "double"
                    ? uz
                      ? "Keyingi to'g'ri javobingiz 2 barobar baholanadi!"
                      : "Следующий верный ответ будет удвоен!"
                    : uz
                      ? "Biroz omadsizlik: 50 ball ayirildi."
                      : "Штраф: снято 50 очков."}
              </p>
              <button type="button" onClick={finishTurn} className={primaryBtn}>
                {uz ? "Keyingi urinish" : "Дальше"}
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs font-bold text-brand-primary dark:text-blue-300">
                {uz ? `Bo'lim: ${activeSector.label} ball` : `Сектор: ${activeSector.label}`}
              </p>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{q.q}</h3>
              <ChoiceBlock q={q} picked={picked} onPick={answerWheelQ} uz={uz} />
              {picked !== null && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {uz ? "To'g'ri javob:" : "Правильный ответ:"} {correctAnswerText(q, uz)}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">{buildExplanation(q, uz)}</p>
                  <button type="button" onClick={finishTurn} className={`${primaryBtn} mt-3`}>
                    {uz ? "Davom etish" : "Продолжить"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============ 3. ARG'AMCHI TORTISH 3D (TUG OF WAR 3D) ============ */
export function TugOfWarGame({ quiz, uz, playMode, onFinish, onRestart }: IntellectualGameProps) {
  return (
    <Suspense fallback={<ThreeDStageFallback label={uz ? "3D arena yuklanmoqda..." : "Загрузка 3D арены..."} />}>
      <TugOfWar3D quiz={quiz} uz={uz} playMode={playMode} onFinish={onFinish} onRestart={onRestart} />
    </Suspense>
  );
}

/* ============ 4. JEOPARDY ============ */
export function JeopardyGame({ quiz, relatedQuizzes, uz, playMode, onFinish, onRestart }: IntellectualGameProps) {
  const board = useMemo(
    () => buildJeopardyBoard(relatedQuizzes && relatedQuizzes.length >= 2 ? relatedQuizzes : [quiz], GENERAL_INTELLECTUAL_QUIZ, uz),
    [quiz, relatedQuizzes, uz],
  );
  const [used, setUsed] = useState<Set<string>>(() => new Set());
  const [activeTile, setActiveTile] = useState<JeopardyTile | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [activeTeam, setActiveTeam] = useState<1 | 2>(1);
  const reported = useRef(false);

  const totalTiles = board.reduce((sum, col) => sum + col.tiles.length, 0);
  const done = totalTiles > 0 && used.size === totalTiles && !activeTile;

  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true;
      onFinish(Math.max(scores[0], scores[1]));
    }
  }, [done, scores, onFinish]);

  if (done) {
    return (
      <WinnerPanel
        title="Jeopardy"
        playMode={playMode}
        scores={scores}
        uz={uz}
        onRestart={onRestart}
      />
    );
  }

  const pickTile = (tile: JeopardyTile) => {
    if (used.has(tile.id) || activeTile) return;
    setActiveTile(tile);
    setPicked(null);
  };

  const answerTile = (idx: number) => {
    if (!activeTile || picked !== null) return;
    setPicked(idx);
    const q = activeTile.question;
    const correctIdx = q.type === "choice" ? q.answer : q.answer ? 0 : 1;
    const ok = idx === correctIdx;
    setScores((prev) => {
      const delta = ok ? activeTile.points : -Math.floor(activeTile.points / 2);
      return activeTeam === 1 ? [Math.max(0, prev[0] + delta), prev[1]] : [prev[0], Math.max(0, prev[1] + delta)];
    });
  };

  const closeTile = () => {
    if (activeTile) setUsed((prev) => new Set(prev).add(activeTile.id));
    setActiveTile(null);
    setPicked(null);
    if (playMode !== "solo") setActiveTeam((t) => (t === 1 ? 2 : 1));
  };

  return (
    <div className={cardClass}>
      <TeamScoreHeader
        playMode={playMode}
        scores={scores}
        activeTeam={activeTeam}
        uz={uz}
        extra={`${used.size}/${totalTiles}`}
      />

      {!activeTile ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {board.map((col, cIdx) => (
            <div key={cIdx} className="space-y-2.5 min-w-0">
              <div className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-center text-xs font-bold min-h-[52px] flex items-center justify-center">
                <span className="line-clamp-2">{col.title}</span>
              </div>
              {col.tiles.map((tile) => {
                const isUsed = used.has(tile.id);
                return (
                  <button
                    key={tile.id}
                    type="button"
                    disabled={isUsed}
                    onClick={() => pickTile(tile)}
                    className={`w-full py-4 rounded-xl border text-lg font-black tabular-nums transition-colors ${
                      isUsed
                        ? "bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700"
                        : "bg-blue-50 dark:bg-slate-800 border-blue-200 dark:border-slate-700 text-brand-primary dark:text-amber-300 hover:bg-brand-primary hover:text-white"
                    }`}
                  >
                    {isUsed ? "—" : tile.points}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-bold text-brand-primary dark:text-blue-300">
            {activeTile.category} · {activeTile.points} {uz ? "ball" : "очков"}
          </p>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{activeTile.question.q}</h3>
          <ChoiceBlock q={activeTile.question} picked={picked} onPick={answerTile} uz={uz} />
          {picked !== null && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm">
              <p className="font-bold text-slate-900 dark:text-white">
                {uz ? "To'g'ri javob:" : "Правильный ответ:"} {correctAnswerText(activeTile.question, uz)}
              </p>
              <p className="text-slate-600 dark:text-slate-300 mt-1">{buildExplanation(activeTile.question, uz)}</p>
              <div className="mt-4 flex justify-end">
                <button type="button" onClick={closeTile} className={primaryBtn}>
                  {uz ? "Jadvalga qaytish" : "К таблице"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============ 5. ANAGRAM ============ */
export function AnagramGame({ quiz, uz, onFinish, onRestart }: IntellectualGameProps) {
  const words = useMemo(() => shuffle(extractWordPuzzles(quiz, GENERAL_INTELLECTUAL_QUIZ)).slice(0, 10), [quiz]);
  const [idx, setIdx] = useState(0);
  const [tiles, setTiles] = useState(() => (words[0] ? scrambleWordTiles(words[0].word) : []));
  const [pickedIds, setPickedIds] = useState<number[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const reported = useRef(false);

  const current = words[idx];

  useEffect(() => {
    if (done && !reported.current && words.length > 0) {
      reported.current = true;
      onFinish(Math.round((score / words.length) * 100));
    }
  }, [done, score, words.length, onFinish]);

  if (words.length === 0) return <div className={cardClass}>{uz ? "So'zlar topilmadi." : "Слова не найдены."}</div>;

  if (done) {
    return (
      <div className={`${cardClass} text-center`}>
        <Trophy className="mx-auto text-amber-500 mb-3" size={40} />
        <p className="text-sm font-bold text-slate-500">Anagram</p>
        <p className="text-5xl font-black text-slate-900 dark:text-white my-3 tabular-nums">
          {score}/{words.length}
        </p>
        <button type="button" onClick={onRestart} className={primaryBtn}>
          <RotateCcw size={16} /> {uz ? "Qayta o'ynash" : "Играть снова"}
        </button>
      </div>
    );
  }

  const assembled = pickedIds.map((id) => tiles.find((t) => t.id === id)?.char ?? "").join("");

  const toggleTile = (id: number) => {
    if (checked !== null) return;
    if (pickedIds.includes(id)) {
      setPickedIds((prev) => prev.filter((x) => x !== id));
    } else {
      setPickedIds((prev) => [...prev, id]);
    }
  };

  const revealHint = () => {
    if (checked !== null || !current) return;
    const nextPos = pickedIds.length;
    if (nextPos >= current.word.length) return;
    const neededChar = current.word[nextPos];
    const match = tiles.find((t) => t.char === neededChar && !pickedIds.includes(t.id));
    if (match) setPickedIds((prev) => [...prev, match.id]);
  };

  const checkWord = () => {
    if (!current || checked !== null) return;
    const ok = assembled === current.word;
    setChecked(ok);
    if (ok) setScore((s) => s + 1);
  };

  const nextWord = () => {
    if (idx + 1 >= words.length) {
      setDone(true);
      return;
    }
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    setTiles(scrambleWordTiles(words[nextIdx].word));
    setPickedIds([]);
    setChecked(null);
  };

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 tabular-nums">
        <span>
          {uz ? "So'z" : "Слово"} {idx + 1}/{words.length}
        </span>
        <span>
          {uz ? "Topildi:" : "Угадано:"} {score}
        </span>
      </div>

      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{uz ? "Izoh:" : "Подсказка:"}</p>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">{current.hint}</h3>

      {/* Javob katakchalari */}
      <div className="flex flex-wrap gap-2 mb-5 min-h-[52px] p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 justify-center">
        {current.word.split("").map((_, slotIdx) => {
          const id = pickedIds[slotIdx];
          const tile = id !== undefined ? tiles.find((t) => t.id === id) : undefined;
          return (
            <button
              key={slotIdx}
              type="button"
              disabled={!tile || checked !== null}
              onClick={() => tile && toggleTile(tile.id)}
              className={`w-10 h-11 rounded-xl border text-base font-black flex items-center justify-center transition-colors ${
                tile
                  ? "bg-white dark:bg-slate-900 border-brand-primary text-slate-900 dark:text-white"
                  : "border-dashed border-slate-300 dark:border-slate-600 text-transparent"
              }`}
            >
              {tile?.char ?? "_"}
            </button>
          );
        })}
      </div>

      {/* Aralashtirilgan harflar */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {tiles.map((t) => {
          const used = pickedIds.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              disabled={used || checked !== null}
              onClick={() => toggleTile(t.id)}
              className={`w-11 h-11 rounded-xl border text-base font-black transition-colors ${
                used
                  ? "opacity-25 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  : "bg-blue-50 dark:bg-slate-800 border-blue-200 dark:border-slate-700 text-brand-primary dark:text-blue-200 hover:bg-brand-primary hover:text-white"
              }`}
            >
              {t.char}
            </button>
          );
        })}
      </div>

      {checked === null ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPickedIds([])}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200"
          >
            {uz ? "Tozalash" : "Очистить"}
          </button>
          <button
            type="button"
            onClick={revealHint}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm font-bold"
          >
            <HelpCircle size={15} /> {uz ? "Harf ochish" : "Подсказка"}
          </button>
          <button
            type="button"
            disabled={pickedIds.length !== current.word.length}
            onClick={checkWord}
            className={primaryBtn}
          >
            {uz ? "Tekshirish" : "Проверить"}
          </button>
        </div>
      ) : (
        <div
          className={`p-4 rounded-xl text-sm flex flex-wrap items-center justify-between gap-3 ${
            checked
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200"
          }`}
        >
          <p className="font-bold">
            {checked ? (uz ? "To'g'ri topdingiz!" : "Верно!") : `${uz ? "To'g'ri so'z:" : "Правильное слово:"} ${current.displayWord}`}
          </p>
          <button type="button" onClick={nextWord} className={primaryBtn}>
            {idx + 1 >= words.length ? (uz ? "Natija" : "Итог") : uz ? "Keyingi so'z" : "Следующее"}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ============ 6. SO'Z QIDIRISH (WORD SEARCH) ============ */
export function WordSearchGame({ quiz, uz, onFinish, onRestart }: IntellectualGameProps) {
  const puzzle = useMemo(() => {
    const words = extractWordPuzzles(quiz, GENERAL_INTELLECTUAL_QUIZ, 8);
    return generateWordSearch(words, 10);
  }, [quiz]);

  const [startCell, setStartCell] = useState<GridCoord | null>(null);
  const [foundWords, setFoundWords] = useState<Set<string>>(() => new Set());
  const [hintCell, setHintCell] = useState<GridCoord | null>(null);
  const reported = useRef(false);

  const done = puzzle.placements.length > 0 && foundWords.size === puzzle.placements.length;

  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true;
      onFinish(100);
    }
  }, [done, onFinish]);

  const foundCoordSet = useMemo(() => {
    const set = new Set<string>();
    for (const p of puzzle.placements) {
      if (foundWords.has(p.word)) {
        for (const c of p.cells) set.add(`${c.r},${c.c}`);
      }
    }
    return set;
  }, [puzzle.placements, foundWords]);

  if (done) {
    return (
      <div className={`${cardClass} text-center`}>
        <Trophy className="mx-auto text-amber-500 mb-3" size={40} />
        <p className="text-sm font-bold text-slate-500">{uz ? "So'z qidirish" : "Поиск слов"}</p>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white my-3">
          {uz ? `Barcha ${puzzle.placements.length} ta so'z topildi!` : `Найдены все ${puzzle.placements.length} слов!`}
        </h3>
        <button type="button" onClick={onRestart} className={primaryBtn}>
          <RotateCcw size={16} /> {uz ? "Yangi jadval" : "Новая сетка"}
        </button>
      </div>
    );
  }

  const clickCell = (r: number, c: number) => {
    if (!startCell) {
      setStartCell({ r, c });
      return;
    }
    if (startCell.r === r && startCell.c === c) {
      setStartCell(null);
      return;
    }
    const line = getLineCoords(startCell, { r, c });
    if (line.length >= 2) {
      const match = matchWordSearchSelection(puzzle, startCell, { r, c });
      if (match) {
        setFoundWords((prev) => new Set(prev).add(match.word));
        setHintCell(null);
      }
    }
    setStartCell(null);
  };

  const showHint = () => {
    const remaining = puzzle.placements.find((p) => !foundWords.has(p.word));
    if (remaining) setHintCell(remaining.cells[0]);
  };

  return (
    <div className={cardClass}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
          {uz
            ? "So'zning birinchi va oxirgi harfini ketma-ket bosing."
            : "Нажмите по очереди первую и последнюю букву слова."}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 tabular-nums">
            {foundWords.size}/{puzzle.placements.length}
          </span>
          <button
            type="button"
            onClick={showHint}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold"
          >
            <HelpCircle size={14} /> {uz ? "Yordam" : "Подсказка"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[auto_1fr] gap-6 items-start">
        <div className="overflow-x-auto pb-1">
          <div
            className="grid gap-1 select-none"
            style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(34px, 40px))` }}
          >
            {puzzle.grid.map((row, r) =>
              row.map((letter, c) => {
                const key = `${r},${c}`;
                const isStart = startCell?.r === r && startCell?.c === c;
                const isFound = foundCoordSet.has(key);
                const isHint = hintCell?.r === r && hintCell?.c === c;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => clickCell(r, c)}
                    className={`h-9 sm:h-10 rounded-lg border text-sm sm:text-base font-black flex items-center justify-center transition-colors ${
                      isStart
                        ? "bg-brand-primary border-brand-primary text-white"
                        : isFound
                          ? "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400 text-emerald-800 dark:text-emerald-200"
                          : isHint
                            ? "bg-amber-100 dark:bg-amber-900/50 border-amber-500 text-amber-900 dark:text-amber-200"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-brand-primary"
                    }`}
                  >
                    {letter}
                  </button>
                );
              }),
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {uz ? "Topilishi kerak so'zlar" : "Слова для поиска"}
          </p>
          {puzzle.placements.map((p) => {
            const isFound = foundWords.has(p.word);
            return (
              <div
                key={p.word}
                className={`p-2.5 rounded-xl border text-xs sm:text-sm ${
                  isFound
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 line-through"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                }`}
              >
                <p className="font-black">{p.displayWord}</p>
                <p className="text-xs opacity-80 line-clamp-1">{p.hint}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============ 7. GAP TUZISH (SENTENCE BUILDER) ============ */
export function SentenceBuilderGame({ quiz, uz, onFinish, onRestart }: IntellectualGameProps) {
  const puzzles = useMemo(() => extractSentencePuzzles(quiz, GENERAL_INTELLECTUAL_QUIZ, 10), [quiz]);
  const [idx, setIdx] = useState(0);
  const [pickedIds, setPickedIds] = useState<number[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const reported = useRef(false);

  const item = puzzles[idx];

  useEffect(() => {
    if (done && !reported.current && puzzles.length > 0) {
      reported.current = true;
      onFinish(Math.round((score / puzzles.length) * 100));
    }
  }, [done, score, puzzles.length, onFinish]);

  if (puzzles.length === 0) return <div className={cardClass}>{uz ? "Gaplar topilmadi." : "Предложения не найдены."}</div>;

  if (done) {
    return (
      <div className={`${cardClass} text-center`}>
        <Trophy className="mx-auto text-amber-500 mb-3" size={40} />
        <p className="text-sm font-bold text-slate-500">{uz ? "Gap tuzish" : "Составление предложений"}</p>
        <p className="text-5xl font-black text-slate-900 dark:text-white my-3 tabular-nums">
          {score}/{puzzles.length}
        </p>
        <button type="button" onClick={onRestart} className={primaryBtn}>
          <RotateCcw size={16} /> {uz ? "Qayta o'ynash" : "Играть снова"}
        </button>
      </div>
    );
  }

  const toggleToken = (id: number) => {
    if (checked !== null) return;
    if (pickedIds.includes(id)) {
      setPickedIds((prev) => prev.filter((x) => x !== id));
    } else {
      setPickedIds((prev) => [...prev, id]);
    }
  };

  const verify = () => {
    if (!item || checked !== null) return;
    const words = pickedIds.map((id) => item.shuffledTokens.find((t) => t.id === id)?.text ?? "");
    const ok = isSentenceSolved(words, item.words);
    setChecked(ok);
    if (ok) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx + 1 >= puzzles.length) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setPickedIds([]);
    setChecked(null);
  };

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 tabular-nums">
        <span>
          {uz ? "Gap" : "Предложение"} {idx + 1}/{puzzles.length}
        </span>
        <span>
          {uz ? "To'g'ri:" : "Верно:"} {score}
        </span>
      </div>

      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{uz ? "Mavzu / savol:" : "Контекст:"}</p>
      <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">{item.hint}</p>

      {/* Yig'ilgan gap */}
      <div className="min-h-[72px] p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 mb-5">
        {pickedIds.length === 0 ? (
          <span className="text-xs text-slate-400">
            {uz ? "Pastdagi so'zlarni to'g'ri tartibda bosing..." : "Нажмите слова ниже в правильном порядке..."}
          </span>
        ) : (
          pickedIds.map((id) => {
            const tok = item.shuffledTokens.find((t) => t.id === id);
            if (!tok) return null;
            return (
              <button
                key={id}
                type="button"
                disabled={checked !== null}
                onClick={() => toggleToken(id)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-brand-primary text-sm font-bold text-slate-900 dark:text-white"
              >
                {tok.text}
              </button>
            );
          })
        )}
      </div>

      {/* Aralashtirilgan so'zlar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {item.shuffledTokens.map((tok) => {
          const used = pickedIds.includes(tok.id);
          return (
            <button
              key={tok.id}
              type="button"
              disabled={used || checked !== null}
              onClick={() => toggleToken(tok.id)}
              className={`px-3.5 py-2 rounded-xl border text-sm font-bold transition-colors ${
                used
                  ? "opacity-25 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  : "bg-blue-50 dark:bg-slate-800 border-blue-200 dark:border-slate-700 text-brand-primary dark:text-blue-200 hover:bg-brand-primary hover:text-white"
              }`}
            >
              {tok.text}
            </button>
          );
        })}
      </div>

      {checked === null ? (
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setPickedIds([])}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200"
          >
            {uz ? "Tozalash" : "Очистить"}
          </button>
          <button
            type="button"
            disabled={pickedIds.length !== item.words.length}
            onClick={verify}
            className={primaryBtn}
          >
            {uz ? "Tekshirish" : "Проверить"}
          </button>
        </div>
      ) : (
        <div
          className={`p-4 rounded-xl text-sm flex flex-wrap items-center justify-between gap-3 ${
            checked
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200"
          }`}
        >
          <div>
            <p className="font-bold">
              {checked ? (uz ? "Mazmunli gap to'g'ri tuzildi!" : "Предложение составлено верно!") : uz ? "Tartibda xatolik bor:" : "Есть ошибка в порядке:"}
            </p>
            {!checked && <p className="mt-1 font-semibold">{item.targetSentence}</p>}
          </div>
          <button type="button" onClick={next} className={primaryBtn}>
            {idx + 1 >= puzzles.length ? (uz ? "Natija" : "Итог") : uz ? "Keyingisi" : "Дальше"}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ============ 8. BO'SH JOYNI TO'LDIRISH (FILL IN THE BLANK) ============ */
export function FillBlankGame({ quiz, uz, onFinish, onRestart }: IntellectualGameProps) {
  const items = useMemo(() => extractClozePuzzles(quiz, GENERAL_INTELLECTUAL_QUIZ, 12), [quiz]);
  const [idx, setIdx] = useState(0);
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const reported = useRef(false);

  const item = items[idx];

  useEffect(() => {
    if (done && !reported.current && items.length > 0) {
      reported.current = true;
      onFinish(Math.round((score / items.length) * 100));
    }
  }, [done, score, items.length, onFinish]);

  if (items.length === 0) return <div className={cardClass}>{uz ? "Savollar topilmadi." : "Задания не найдены."}</div>;

  if (done) {
    return (
      <div className={`${cardClass} text-center`}>
        <Trophy className="mx-auto text-amber-500 mb-3" size={40} />
        <p className="text-sm font-bold text-slate-500">{uz ? "Bo'sh joyni to'ldirish" : "Заполнение пропусков"}</p>
        <p className="text-5xl font-black text-slate-900 dark:text-white my-3 tabular-nums">
          {Math.round((score / items.length) * 100)}%
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          {uz ? `${items.length} tadan ${score} tasi to'g'ri` : `${score} из ${items.length} верно`}
        </p>
        <button type="button" onClick={onRestart} className={primaryBtn}>
          <RotateCcw size={16} /> {uz ? "Qayta o'ynash" : "Играть снова"}
        </button>
      </div>
    );
  }

  const checkAnswer = (submitted: string) => {
    if (!item || checked !== null) return;
    const ok = isFillCorrect({ type: "fill", q: item.q, answer: item.answer }, submitted);
    setValue(submitted);
    setChecked(ok);
    if (ok) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx + 1 >= items.length) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setValue("");
    setChecked(null);
  };

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 tabular-nums">
        <span>
          {uz ? "Topshiriq" : "Задание"} {idx + 1}/{items.length}
        </span>
        <span>
          {uz ? "To'g'ri:" : "Верно:"} {score}
        </span>
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-5 whitespace-pre-line">{item.q}</h3>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) checkAnswer(value);
        }}
        className="flex flex-col sm:flex-row gap-2 mb-4"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={checked !== null}
          placeholder={uz ? "Tushirib qoldirilgan so'zni yozing..." : "Введите пропущенное слово..."}
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <button type="submit" disabled={checked !== null || !value.trim()} className={primaryBtn}>
          {uz ? "Tekshirish" : "Проверить"}
        </button>
      </form>

      {item.suggestions.length > 0 && checked === null && (
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
            {uz ? "Yoki tayyor so'zlardan tanlang:" : "Или выберите из вариантов:"}
          </p>
          <div className="flex flex-wrap gap-2">
            {item.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => checkAnswer(s)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-brand-primary text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {checked !== null && (
        <div
          className={`mt-4 p-4 rounded-xl text-sm ${
            checked
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200"
          }`}
        >
          <p className="font-black flex items-center gap-1.5">
            {checked ? <Check size={16} /> : <X size={16} />}
            {checked ? (uz ? "To'g'ri!" : "Верно!") : `${uz ? "To'g'ri javob:" : "Правильный ответ:"} ${item.answer[0]}`}
          </p>
          <p className="mt-1 opacity-90">{item.explain}</p>
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={next} className={primaryBtn}>
              {idx + 1 >= items.length ? (uz ? "Natija" : "Итог") : uz ? "Keyingisi" : "Дальше"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ 9. KARTOCHKA VA MOSLASHTIRISH ============ */
export function CardsAndMatchGame({ quiz, uz, onFinish, onRestart }: IntellectualGameProps) {
  const [subMode, setSubMode] = useState<"cards" | "match">("cards");
  const [round, setRound] = useState(0);

  return (
    <div className="space-y-4">
      <div className="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => {
            setSubMode("cards");
            setRound((r) => r + 1);
          }}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
            subMode === "cards"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          <Layers size={15} /> {uz ? "Kartochkalar" : "Карточки"}
        </button>
        <button
          type="button"
          onClick={() => {
            setSubMode("match");
            setRound((r) => r + 1);
          }}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
            subMode === "match"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          <Link2 size={15} /> {uz ? "Moslashtirish (Juftlash)" : "Сопоставление"}
        </button>
      </div>

      <div key={`${subMode}-${round}`}>
        {subMode === "cards" ? (
          <CardsGame
            quiz={quiz}
            uz={uz}
            onFinish={(s) => onFinish(s)}
            onRestart={() => {
              setRound((r) => r + 1);
              onRestart();
            }}
          />
        ) : (
          <MatchGame
            quiz={quiz}
            uz={uz}
            onFinish={(s) => onFinish(s)}
            onRestart={() => {
              setRound((r) => r + 1);
              onRestart();
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ============ 10. BILIM POYGASI (QUIZ RACE) ============ */
export function QuizRaceGame({ quiz, uz, playMode, onFinish, onRestart }: IntellectualGameProps) {
  const pool = useMemo(() => toPlayableChoiceQuestions(quiz, uz), [quiz, uz]);
  const targetSteps = 8;
  const [progress, setProgress] = useState<[number, number]>([0, 0]);
  const [activeTeam, setActiveTeam] = useState<1 | 2>(1);
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const reported = useRef(false);

  const q = pool.length > 0 ? pool[qIdx % pool.length] : null;

  useEffect(() => {
    if (winner && !reported.current) {
      reported.current = true;
      onFinish(Math.max(progress[0], progress[1]) * 100);
    }
  }, [winner, progress, onFinish]);

  if (!q) return <div className={cardClass}>{uz ? "Savollar topilmadi." : "Вопросы не найдены."}</div>;

  if (winner) {
    return (
      <WinnerPanel
        title={uz ? "Bilim poygasi yakuni" : "Итоги «Гонки знаний»"}
        playMode={playMode === "solo" ? "teams" : playMode}
        scores={[progress[0] * 100, progress[1] * 100]}
        uz={uz}
        onRestart={onRestart}
      />
    );
  }

  const answerRace = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    const correctIdx = q.type === "choice" ? q.answer : q.answer ? 0 : 1;
    const isOk = idx === correctIdx;

    if (playMode === "solo") {
      const playerStep = scoreRaceStep(progress[0], isOk, targetSteps);
      const botOk = !isOk && Math.random() < 0.7;
      const botStep = scoreRaceStep(progress[1], botOk, targetSteps);
      setProgress([playerStep.nextProgress, botStep.nextProgress]);
      if (playerStep.finished) setWinner(1);
      else if (botStep.finished) setWinner(2);
    } else {
      const idxTeam = activeTeam === 1 ? 0 : 1;
      const res = scoreRaceStep(progress[idxTeam], isOk, targetSteps);
      const nextProg: [number, number] =
        activeTeam === 1 ? [res.nextProgress, progress[1]] : [progress[0], res.nextProgress];
      setProgress(nextProg);
      if (res.finished) setWinner(activeTeam);
    }
  };

  const nextQ = () => {
    setPicked(null);
    setQIdx((i) => i + 1);
    if (playMode !== "solo") setActiveTeam((t) => (t === 1 ? 2 : 1));
  };

  const label1 = playMode === "solo" ? (uz ? "Siz" : "Вы") : uz ? "1-jamoa" : "Команда 1";
  const label2 = playMode === "solo" ? (uz ? "Raqib (Bot)" : "Соперник") : uz ? "2-jamoa" : "Команда 2";

  return (
    <div className={cardClass}>
      <TeamScoreHeader
        playMode={playMode === "solo" ? "teams" : playMode}
        scores={[progress[0] * 100, progress[1] * 100]}
        activeTeam={activeTeam}
        uz={uz}
        extra={`${uz ? "Marra:" : "Финиш:"} ${targetSteps} ${uz ? "qadam" : "шагов"}`}
      />

      {/* Race Track */}
      <div className="space-y-3 mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
        {[
          { label: label1, val: progress[0], color: "bg-brand-primary" },
          { label: label2, val: progress[1], color: "bg-amber-500" },
        ].map((racer, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">
              <span>{racer.label}</span>
              <span className="flex items-center gap-1">
                {racer.val}/{targetSteps} <Flag size={12} />
              </span>
            </div>
            <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full ${racer.color} transition-all duration-300 rounded-full`}
                style={{ width: `${Math.round((racer.val / targetSteps) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{q.q}</h3>
      <ChoiceBlock q={q} picked={picked} onPick={answerRace} uz={uz} />

      {picked !== null && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div>
            <p className="font-bold text-slate-900 dark:text-white">
              {uz ? "To'g'ri javob:" : "Ответ:"} {correctAnswerText(q, uz)}
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-0.5">{buildExplanation(q, uz)}</p>
          </div>
          <button type="button" onClick={nextQ} className={primaryBtn}>
            {uz ? "Keyingi qadam" : "Дальше"}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ============ 11. HA / YO'Q BLITS (TRUE/FALSE BLITZ) ============ */
export function TrueFalseBlitzGame({ quiz, uz, onFinish, onRestart }: IntellectualGameProps) {
  const statements = useMemo(() => {
    const tfFromQuiz = quiz.questions
      .filter((q) => q.type === "truefalse")
      .map((q) => ({ q: q.q, answer: q.answer, explain: buildExplanation(q, uz) }));

    const derivedFromChoice = quiz.questions
      .filter((q) => q.type === "choice")
      .slice(0, 14)
      .map((q, idx) => {
        const makeTrue = idx % 2 === 0 || q.options.length < 2;
        const shownOpt = makeTrue ? q.options[q.answer] : q.options[(q.answer + 1) % q.options.length];
        return {
          q: `${q.q} — «${shownOpt}»`,
          answer: makeTrue,
          explain: buildExplanation(q, uz),
        };
      });

    const merged = shuffle([...tfFromQuiz, ...derivedFromChoice]);
    if (merged.length >= 6) return merged.slice(0, 15);
    return shuffle(
      GENERAL_INTELLECTUAL_QUIZ.questions
        .filter((q) => q.type === "truefalse")
        .map((q) => ({ q: q.q, answer: q.answer, explain: buildExplanation(q, uz) })),
    );
  }, [quiz, uz]);

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [timeLeft, setTimeLeft] = useState(45);
  const [feedback, setFeedback] = useState<{ ok: boolean; explain: string } | null>(null);
  const reported = useRef(false);

  const done = timeLeft <= 0 || idx >= statements.length;

  useEffect(() => {
    if (done) return;
    const id = window.setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [done]);

  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true;
      onFinish(score);
    }
  }, [done, score, onFinish]);

  if (done) {
    return (
      <div className={`${cardClass} text-center`}>
        <Trophy className="mx-auto text-amber-500 mb-3" size={40} />
        <p className="text-sm font-bold text-slate-500">{uz ? "Ha / Yo'q Blits" : "Блиц Правда/Ложь"}</p>
        <p className="text-5xl font-black text-slate-900 dark:text-white my-3 tabular-nums">{score}</p>
        <button type="button" onClick={onRestart} className={primaryBtn}>
          <RotateCcw size={16} /> {uz ? "Qayta o'ynash" : "Играть снова"}
        </button>
      </div>
    );
  }

  const current = statements[idx];

  const handleAnswer = (val: boolean) => {
    if (feedback) return;
    const ok = val === current.answer;
    const res = scoreTrueFalseStreak(streak, ok);
    setStreak(res.nextStreak);
    setMultiplier(res.multiplier);
    if (ok) setScore((s) => s + res.deltaPoints);
    setFeedback({ ok, explain: current.explain });
    window.setTimeout(() => {
      setFeedback(null);
      setIdx((i) => i + 1);
    }, 850);
  };

  return (
    <div className={cardClass}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800 tabular-nums">
        <div className="flex items-center gap-3 text-sm font-bold">
          <span className="text-brand-primary dark:text-blue-300">
            {uz ? "Ball:" : "Очки:"} <strong className="text-base">{score}</strong>
          </span>
          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <Flame size={15} /> {streak}x ({multiplier}x)
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 text-sm font-black text-slate-700 dark:text-slate-200">
          <Clock size={15} /> {timeLeft}s
        </div>
      </div>

      <p className="text-xs font-bold text-slate-400 mb-2 tabular-nums">
        {idx + 1}/{statements.length}
      </p>
      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6 min-h-[72px]">
        {current.q}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          disabled={feedback !== null}
          onClick={() => handleAnswer(true)}
          className="py-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-black text-lg hover:bg-emerald-600 hover:text-white transition-colors"
        >
          ✓ {uz ? "HA (To'g'ri)" : "ДА (Верно)"}
        </button>
        <button
          type="button"
          disabled={feedback !== null}
          onClick={() => handleAnswer(false)}
          className="py-5 rounded-2xl border-2 border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 font-black text-lg hover:bg-red-600 hover:text-white transition-colors"
        >
          ✕ {uz ? "YO'Q (Noto'g'ri)" : "НЕТ (Неверно)"}
        </button>
      </div>

      {feedback && (
        <div
          className={`mt-4 p-3.5 rounded-xl text-xs sm:text-sm font-semibold ${
            feedback.ok
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200"
          }`}
        >
          {feedback.ok ? (uz ? "To'g'ri!" : "Верно!") : uz ? "Xato!" : "Неверно!"} — {feedback.explain}
        </div>
      )}
    </div>
  );
}

/* ============ 12. MATEMATIK DUEL (MATH DUEL) ============ */
export function MathDuelGame({ quiz, uz, playMode, onFinish, onRestart }: IntellectualGameProps) {
  const gradeNum = quiz.grade ? parseInt(quiz.grade, 10) || 7 : 7;
  const problems = useMemo(() => buildMathDuelProblems(gradeNum, 10), [gradeNum]);
  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [activeTeam, setActiveTeam] = useState<1 | 2>(1);
  const [picked, setPicked] = useState<number | null>(null);
  const reported = useRef(false);

  const done = idx >= problems.length;

  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true;
      onFinish(Math.max(scores[0], scores[1]));
    }
  }, [done, scores, onFinish]);

  if (done) {
    return (
      <WinnerPanel
        title={uz ? "Matematik duel yakuni" : "Итоги математической дуэли"}
        playMode={playMode}
        scores={scores}
        uz={uz}
        onRestart={onRestart}
      />
    );
  }

  const p = problems[idx];

  const handlePick = (opt: number) => {
    if (picked !== null) return;
    setPicked(opt);
    if (opt === p.answer) {
      setScores((prev) => (activeTeam === 1 ? [prev[0] + 100, prev[1]] : [prev[0], prev[1] + 100]));
    }
  };

  const next = () => {
    setPicked(null);
    setIdx((i) => i + 1);
    if (playMode !== "solo") setActiveTeam((t) => (t === 1 ? 2 : 1));
  };

  return (
    <div className={cardClass}>
      <TeamScoreHeader
        playMode={playMode}
        scores={scores}
        activeTeam={activeTeam}
        uz={uz}
        extra={`${gradeNum}-${uz ? "sinf" : "кл"} · ${idx + 1}/${problems.length}`}
      />

      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center mb-5">
        <Calculator className="mx-auto text-brand-primary dark:text-blue-400 mb-2" size={26} />
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
          {p.prompt}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {p.options.map((opt) => {
          const isCorrect = opt === p.answer;
          const isPicked = picked === opt;
          let cls =
            "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:border-brand-primary";
          if (picked !== null) {
            if (isCorrect) cls = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200";
            else if (isPicked) cls = "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200";
          }
          return (
            <button
              key={opt}
              type="button"
              disabled={picked !== null}
              onClick={() => handlePick(opt)}
              className={`py-4 rounded-xl border-2 text-lg font-black font-mono tabular-nums transition-colors ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="font-bold text-slate-800 dark:text-slate-200">{p.explain}</p>
          <button type="button" onClick={next} className={primaryBtn}>
            {idx + 1 >= problems.length ? (uz ? "Natija" : "Итог") : uz ? "Keyingi misol" : "Следующий"}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ============ 13. KROSSVORD (CROSSWORD) ============ */
export function CrosswordGame({ quiz, uz, onFinish, onRestart }: IntellectualGameProps) {
  const cw = useMemo(() => {
    const words = extractWordPuzzles(quiz, GENERAL_INTELLECTUAL_QUIZ, 8);
    return buildCrosswordGrid(words, 6);
  }, [quiz]);

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);
  const reported = useRef(false);

  const totalCells = useMemo(() => {
    let count = 0;
    for (const row of cw.solutionGrid) {
      for (const cell of row) if (cell !== null) count++;
    }
    return count;
  }, [cw]);

  const correctCount = useMemo(() => {
    let ok = 0;
    cw.solutionGrid.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell && (inputs[`${r}:${c}`] || "").toUpperCase() === cell) ok++;
      }),
    );
    return ok;
  }, [cw, inputs]);

  useEffect(() => {
    if (done && !reported.current && totalCells > 0) {
      reported.current = true;
      onFinish(Math.round((correctCount / totalCells) * 100));
    }
  }, [done, correctCount, totalCells, onFinish]);

  if (cw.entries.length === 0) {
    return <div className={cardClass}>{uz ? "Krossvord uchun so'zlar yetarli emas." : "Недостаточно слов."}</div>;
  }

  const verifyCrossword = () => {
    setChecked(true);
    if (correctCount === totalCells) setDone(true);
  };

  const revealSolution = () => {
    const filled: Record<string, string> = {};
    cw.solutionGrid.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell) filled[`${r}:${c}`] = cell;
      }),
    );
    setInputs(filled);
    setChecked(true);
  };

  return (
    <div className={cardClass}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
          {uz
            ? "Katakchalarga harflarni kiriting va «Tekshirish» tugmasini bosing."
            : "Впишите буквы в клетки и нажмите «Проверить»."}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={revealSolution}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            {uz ? "Javoblarni ko'rsatish" : "Показать ответы"}
          </button>
          <button type="button" onClick={verifyCrossword} className={primaryBtn}>
            {uz ? "Tekshirish" : "Проверить"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[auto_1fr] gap-6 items-start">
        <div className="overflow-x-auto pb-2">
          <div
            className="inline-grid gap-1 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
            style={{ gridTemplateColumns: `repeat(${cw.cols}, minmax(34px, 40px))` }}
          >
            {cw.solutionGrid.map((row, r) =>
              row.map((cell, c) => {
                if (cell === null) {
                  return <div key={`${r}:${c}`} className="w-9 h-9 sm:w-10 sm:h-10" />;
                }
                const key = `${r}:${c}`;
                const num = cw.numberGrid[r][c];
                const val = inputs[key] || "";
                const isOk = checked && val.toUpperCase() === cell;
                const isErr = checked && val.toUpperCase() !== cell;
                return (
                  <div key={key} className="relative w-9 h-9 sm:w-10 sm:h-10">
                    {num !== null && (
                      <span className="absolute top-0.5 left-1 text-[9px] font-black text-slate-500 dark:text-slate-400 pointer-events-none">
                        {num}
                      </span>
                    )}
                    <input
                      maxLength={1}
                      aria-label={`Katak ${r + 1}-${c + 1}`}
                      value={val}
                      onChange={(e) => {
                        setChecked(false);
                        setInputs((prev) => ({
                          ...prev,
                          [key]: e.target.value.slice(-1).toUpperCase(),
                        }));
                      }}
                      className={`w-full h-full text-center font-black uppercase text-sm sm:text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                        isOk
                          ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-200"
                          : isErr
                            ? "bg-red-50 dark:bg-red-950/50 border-red-400 text-red-800 dark:text-red-200"
                            : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      }`}
                    />
                  </div>
                );
              }),
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {uz ? "Savollar (Ta'riflar)" : "Вопросы"}
          </p>
          <div className="space-y-2">
            {cw.entries.map((e) => (
              <div
                key={`${e.number}-${e.direction}`}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
              >
                <span className="font-black text-brand-primary dark:text-blue-300 mr-1.5 tabular-nums">
                  {e.number}. ({e.direction === "across" ? (uz ? "Gorizontal" : "По гориз.") : uz ? "Vertikal" : "По верт."} · {e.word.length})
                </span>
                <span className="text-slate-700 dark:text-slate-200">{e.hint}</span>
              </div>
            ))}
          </div>

          {checked && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2 tabular-nums">
              <span>
                {uz ? `To'g'ri harflar: ${correctCount}/${totalCells}` : `Верно букв: ${correctCount}/${totalCells}`}
              </span>
              <button type="button" onClick={onRestart} className="text-brand-primary dark:text-blue-300 underline">
                {uz ? "Yangi krossvord" : "Новый"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============ 14. XOTIRA JUFTLARI (MEMORY CARDS) ============ */
export function MemoryCardsGame({ quiz, uz, onFinish, onRestart }: IntellectualGameProps) {
  const deck = useMemo(() => buildMemoryDeck(quiz, GENERAL_INTELLECTUAL_QUIZ, 6), [quiz]);
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(() => new Set());
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const reported = useRef(false);

  const totalPairs = deck.length / 2;
  const done = totalPairs > 0 && matchedPairs.size === totalPairs;

  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true;
      const eff = Math.max(40, 120 - Math.max(0, moves - totalPairs) * 6);
      onFinish(eff);
    }
  }, [done, moves, totalPairs, onFinish]);

  if (deck.length === 0) {
    return <div className={cardClass}>{uz ? "Juftliklar topilmadi." : "Пары не найдены."}</div>;
  }

  if (done) {
    return (
      <div className={`${cardClass} text-center`}>
        <Trophy className="mx-auto text-amber-500 mb-3" size={40} />
        <p className="text-sm font-bold text-slate-500">{uz ? "Xotira juftlari" : "Карточки памяти"}</p>
        <p className="text-4xl font-black text-slate-900 dark:text-white my-3 tabular-nums">
          {moves} {uz ? "ta urinish" : "ходов"}
        </p>
        <button type="button" onClick={onRestart} className={primaryBtn}>
          <RotateCcw size={16} /> {uz ? "Qayta o'ynash" : "Играть снова"}
        </button>
      </div>
    );
  }

  const pickCard = (uid: string) => {
    if (locked || flippedUids.includes(uid)) return;
    const target = deck.find((c) => c.uid === uid);
    if (!target || matchedPairs.has(target.pairId)) return;

    const nextFlipped = [...flippedUids, uid];
    setFlippedUids(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const first = deck.find((c) => c.uid === nextFlipped[0]);
      const second = deck.find((c) => c.uid === nextFlipped[1]);
      if (first && second && first.pairId === second.pairId) {
        setMatchedPairs((prev) => new Set(prev).add(first.pairId));
        setFlippedUids([]);
      } else {
        setLocked(true);
        window.setTimeout(() => {
          setFlippedUids([]);
          setLocked(false);
        }, 700);
      }
    }
  };

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-5 tabular-nums">
        <span>
          {uz ? "Topildi:" : "Найдено:"} {matchedPairs.size}/{totalPairs}
        </span>
        <span>
          {uz ? "Urinish:" : "Ходов:"} {moves}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {deck.map((card) => {
          const isMatched = matchedPairs.has(card.pairId);
          const isOpen = isMatched || flippedUids.includes(card.uid);
          return (
            <button
              key={card.uid}
              type="button"
              disabled={isOpen || locked}
              onClick={() => pickCard(card.uid)}
              className={`min-h-[108px] p-3 rounded-2xl border-2 text-xs sm:text-sm font-bold flex items-center justify-center text-center transition-all ${
                isMatched
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200"
                  : isOpen
                    ? "bg-blue-50 dark:bg-slate-800 border-brand-primary text-slate-900 dark:text-white"
                    : "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-brand-primary"
              }`}
            >
              {isOpen ? (
                <span className="line-clamp-4">{card.text}</span>
              ) : (
                <span className="text-xl font-black text-brand-primary dark:text-blue-400">?</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============ 15. SO'Z ZANJIRI (WORD CHAIN) ============ */
export function WordChainGame({ quiz, uz, onFinish, onRestart }: IntellectualGameProps) {
  const links = useMemo(() => {
    const words = extractWordPuzzles(quiz, GENERAL_INTELLECTUAL_QUIZ, 8);
    return buildWordChain(words, 8);
  }, [quiz]);

  const [idx, setIdx] = useState(0);
  const [pickedOpt, setPickedOpt] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const reported = useRef(false);

  useEffect(() => {
    if (done && !reported.current && links.length > 0) {
      reported.current = true;
      onFinish(Math.round((score / links.length) * 100));
    }
  }, [done, score, links.length, onFinish]);

  if (links.length === 0) {
    return <div className={cardClass}>{uz ? "Zanjir uchun atamalar topilmadi." : "Термины не найдены."}</div>;
  }

  if (done) {
    return (
      <div className={`${cardClass} text-center`}>
        <Trophy className="mx-auto text-amber-500 mb-3" size={40} />
        <p className="text-sm font-bold text-slate-500">{uz ? "So'z zanjiri" : "Цепочка слов"}</p>
        <p className="text-5xl font-black text-slate-900 dark:text-white my-3 tabular-nums">
          {score}/{links.length}
        </p>
        <button type="button" onClick={onRestart} className={primaryBtn}>
          <RotateCcw size={16} /> {uz ? "Qayta o'ynash" : "Играть снова"}
        </button>
      </div>
    );
  }

  const current = links[idx];

  const pickOption = (opt: string) => {
    if (pickedOpt !== null) return;
    setPickedOpt(opt);
    if (normalize(opt) === normalize(current.displayWord)) {
      setScore((s) => s + 1);
    }
  };

  const next = () => {
    if (idx + 1 >= links.length) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setPickedOpt(null);
  };

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 tabular-nums">
        <span>
          {uz ? "Halqa" : "Звено"} {idx + 1}/{links.length}
        </span>
        <span>
          {uz ? "To'g'ri:" : "Верно:"} {score}
        </span>
      </div>

      {/* Zanjir vizualizatsiyasi */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {links.map((l, i) => (
          <div key={l.step} className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                i < idx
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-700 dark:text-emerald-300"
                  : i === idx
                    ? "bg-brand-primary border-brand-primary text-white"
                    : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
              }`}
            >
              {i < idx ? l.displayWord : `${l.firstLetter}···`}
            </span>
            {i < links.length - 1 && <ArrowRight size={13} className="text-slate-400" />}
          </div>
        ))}
      </div>

      <p className="text-xs font-bold text-brand-primary dark:text-blue-300 mb-1">
        {uz ? `Bosh harfi «${current.firstLetter}», ${current.word.length} harf` : `Первая буква «${current.firstLetter}»`}
      </p>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">{current.hint}</h3>

      <div className="grid sm:grid-cols-2 gap-3">
        {current.options.map((opt) => {
          const isOk = normalize(opt) === normalize(current.displayWord);
          const isPicked = pickedOpt === opt;
          let cls =
            "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:border-brand-primary";
          if (pickedOpt !== null) {
            if (isOk) cls = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200";
            else if (isPicked) cls = "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200";
          }
          return (
            <button
              key={opt}
              type="button"
              disabled={pickedOpt !== null}
              onClick={() => pickOption(opt)}
              className={`p-3.5 rounded-xl border-2 text-left text-sm font-bold transition-colors ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {pickedOpt !== null && (
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={next} className={primaryBtn}>
            {idx + 1 >= links.length ? (uz ? "Natija" : "Итог") : uz ? "Keyingi halqa" : "Далее"}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ============ GAME REGISTRY METADATA (15 O'YIN) ============ */
export const INTELLECTUAL_GAMES_META: {
  id: IntellectualGameId;
  titleUz: string;
  titleRu: string;
  descUz: string;
  descRu: string;
  teamCapable: boolean;
}[] = [
  {
    id: "mystery-box",
    titleUz: "Sirli quti 3D",
    titleRu: "Тайный ящик 3D",
    descUz: "3D qutilardan birini tanlang — savol, sovg'a yoki 2x ball chiqadi.",
    descRu: "Выберите 3D коробку — внутри вопрос, подарок или бонус 2x.",
    teamCapable: true,
  },
  {
    id: "wheel",
    titleUz: "Omad charxi",
    titleRu: "Колесо фортуны",
    descUz: "G'ildirakni aylantiring va to'xtagan bo'lim savoliga javob bering.",
    descRu: "Вращайте колесо и отвечайте на вопрос выпавшего сектора.",
    teamCapable: true,
  },
  {
    id: "tug-of-war",
    titleUz: "Arg'amchi tortish 3D",
    titleRu: "Перетягивание каната 3D",
    descUz: "3D arenada ikki bola arqon tortishadi: pastda ikki chetdagi testni kim to'g'ri yechsa arqon o'sha tomonga tortiladi.",
    descRu: "3D арена с двумя игроками и двумя тестами по краям — верный ответ тянет канат.",
    teamCapable: true,
  },
  {
    id: "jeopardy",
    titleUz: "Jeopardy",
    titleRu: "Своя игра (Jeopardy)",
    descUz: "Mavzular va qiyinlik ballari (100–400) bo'yicha savollarni tanlang.",
    descRu: "Выбирайте вопросы по темам и уровню баллов от 100 до 400.",
    teamCapable: true,
  },
  {
    id: "quiz-race",
    titleUz: "Bilim poygasi",
    titleRu: "Гонка знаний",
    descUz: "To'g'ri javoblar bilan 8 qadamlik marraga birinchi bo'lib yetib boring.",
    descRu: "Отвечайте быстрее соперника и первым дойдите до финиша за 8 шагов.",
    teamCapable: true,
  },
  {
    id: "truefalse-blitz",
    titleUz: "Ha / Yo'q Blits",
    titleRu: "Блиц Правда/Ложь",
    descUz: "45 soniya ichida ketma-ket to'g'ri javob berib 3x seriya to'plang.",
    descRu: "Ответьте на максимум утверждений за 45 секунд и соберите серию x3.",
    teamCapable: false,
  },
  {
    id: "math-duel",
    titleUz: "Matematik duel",
    titleRu: "Математическая дуэль",
    descUz: "Sinf darajasiga mos tezkor hisoblash, tenglama va mantiqiy duellar.",
    descRu: "Быстрый счет, уравнения и задачи по уровню вашего класса.",
    teamCapable: true,
  },
  {
    id: "crossword",
    titleUz: "Krossvord",
    titleRu: "Кроссворд",
    descUz: "Darslik atamalari asosida avtomatik qurilgan kesishuvchi krossvord.",
    descRu: "Интерактивный кроссворд по ключевым терминам учебника.",
    teamCapable: false,
  },
  {
    id: "memory-cards",
    titleUz: "Xotira juftlari",
    titleRu: "Карточки памяти",
    descUz: "Yopiq kartochkalarni ochib atama va uning ma'nosini juftlang.",
    descRu: "Открывайте карточки по две и находите совпадающие пары.",
    teamCapable: false,
  },
  {
    id: "word-chain",
    titleUz: "So'z zanjiri",
    titleRu: "Цепочка слов",
    descUz: "Ta'rif va bosh harf bo'yicha bilim zanjirining barcha halqalarini ulang.",
    descRu: "Соберите всю цепочку терминов по определениям и подсказкам.",
    teamCapable: false,
  },
  {
    id: "anagram",
    titleUz: "Anagram",
    titleRu: "Анаграмма",
    descUz: "Aralashtirilgan harflardan to'g'ri so'z tuzib toping.",
    descRu: "Составьте верное слово из перемешанных букв.",
    teamCapable: false,
  },
  {
    id: "word-search",
    titleUz: "So'z qidirish",
    titleRu: "Поиск слов",
    descUz: "Harflar jadvali ichidan yashiringan kalit so'zlarni toping.",
    descRu: "Найдите спрятанные слова внутри буквенной сетки.",
    teamCapable: false,
  },
  {
    id: "sentence-builder",
    titleUz: "Gap tuzish",
    titleRu: "Сборка предложения",
    descUz: "Aralashgan so'zlarni to'g'ri tartibda joylashtirib gap hosil qiling.",
    descRu: "Расставьте слова в правильном порядке для получения верной фразы.",
    teamCapable: false,
  },
  {
    id: "fill-blank",
    titleUz: "Bo'sh joyni to'ldirish",
    titleRu: "Заполнить пропуск",
    descUz: "Gapda tushirib qoldirilgan kerakli so'zni topib qo'ying.",
    descRu: "Вставьте пропущенное слово или термин в утверждение.",
    teamCapable: false,
  },
  {
    id: "cards-match",
    titleUz: "Kartochka va Moslashtirish",
    titleRu: "Карточки и пары",
    descUz: "Yangi tushunchalarni yodlash va ularni juftiga moslashtirish.",
    descRu: "Запоминание понятий по карточкам и соединение пар.",
    teamCapable: false,
  },
];

export { Grid3X3 };
