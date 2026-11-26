import { ALL_SUBJECTS, type GradeNumber, type Language } from "../data";
import { INTERACTIVE_LESSONS } from "../data/lessonsData";
import { QUIZZES } from "../quiz";
import type { Quiz } from "../quiz/types";
import { buildCrosswordGrid, extractWordPuzzles, generateWordSearch, buildMathDuelProblems } from "../quiz/gameEngines";
import { GENERAL_INTELLECTUAL_QUIZ } from "../quiz/generalGamesPack";

export type SearchScope = "all" | "lessons" | "books" | "topics" | "games" | "materials" | "audio";

export interface MaterialTypeMeta {
  id: string;
  titleUz: string;
  titleRu: string;
  subtitleUz: string;
  subtitleRu: string;
  promptHint: string;
}

export const MATERIAL_TYPES: MaterialTypeMeta[] = [
  {
    id: "bsb",
    titleUz: "BSB / ChSB",
    titleRu: "СОР / СОЧ",
    subtitleUz: "Bob va choraklik nazorat ishlari (baholash mezoni bilan)",
    subtitleRu: "Контрольные работы по разделам и четвертям с критериями",
    promptHint: "BSB va ChSB nazorat ishi: A, B, C darajali topshiriqlar va ballar",
  },
  {
    id: "topic-test",
    titleUz: "Mavzu testi",
    titleRu: "Тест по теме",
    subtitleUz: "10 ta variantli test + javoblar kaliti va izoh",
    subtitleRu: "10 тестовых заданий с вариантами и ключом ответов",
    promptHint: "Mavzu yuzasidan 4 variantli test savollari",
  },
  {
    id: "math-sheet",
    titleUz: "Matematik varaq",
    titleRu: "Математический лист",
    subtitleUz: "Sinf darajasiga mos misol, tenglama va masalalar to'plami",
    subtitleRu: "Примеры, уравнения и задачи по уровню класса",
    promptHint: "Hisoblash, tenglama va matnli masalalar ishchi varag'i",
  },
  {
    id: "crossword",
    titleUz: "Krossvord",
    titleRu: "Кроссворд",
    subtitleUz: "Chop etishga tayyor katakli krossvord va ta'riflar",
    subtitleRu: "Готовый к печати кроссворд с определениями",
    promptHint: "Mavzu atamalaridan tuzilgan chop etiladigan krossvord",
  },
  {
    id: "word-search",
    titleUz: "So'z qidirish",
    titleRu: "Поиск слов",
    subtitleUz: "Harflar jadvalidan yashiringan atamalarni topish varag'i",
    subtitleRu: "Лист поиска ключевых терминов в сетке букв",
    promptHint: "Harflar jadvali va topilishi kerak bo'lgan atamalar ro'yxati",
  },
  {
    id: "anagram",
    titleUz: "Anagram",
    titleRu: "Анаграммы",
    subtitleUz: "Aralashtirilgan harflardan atamalarni tiklash mashqi",
    subtitleRu: "Восстановление терминов из перемешанных букв",
    promptHint: "Aralashtirilgan harflar va tayanch izohlar",
  },
  {
    id: "matching",
    titleUz: "Moslashtirish",
    titleRu: "Сопоставление",
    subtitleUz: "Atama va ta'rifni o'zaro bog'lash topshiriqlari",
    subtitleRu: "Задания на соотнесение понятий и определений",
    promptHint: "Chap va o'ng ustunlarni juftlash mashqi",
  },
  {
    id: "cloze",
    titleUz: "Bo'sh joy",
    titleRu: "Пропуски",
    subtitleUz: "Qoldirilgan kalit so'zni matnga to'g'ri joylashtirish",
    subtitleRu: "Заполнение пропущенных ключевых слов в тексте",
    promptHint: "Tushirib qoldirilgan so'zlarni to'ldirish varag'i",
  },
  {
    id: "summary",
    titleUz: "Mavzu konspekti",
    titleRu: "Конспект темы",
    subtitleUz: "Darsning qisqa, tizimli konspekti va tayanch xulosalar",
    subtitleRu: "Краткий системный конспект и ключевые выводы",
    promptHint: "Asosiy tushunchalar, qoidalar va eslatmalar konspekti",
  },
  {
    id: "slides",
    titleUz: "Slayd rejasi",
    titleRu: "План слайдов",
    subtitleUz: "45 daqiqalik dars uchun tayyor slayd ssenariysi",
    subtitleRu: "Готовый сценарий слайдов на 45-минутный урок",
    promptHint: "Dars bosqichlari va slayd matnlari rejasi",
  },
];

export const GAMES_SEARCH_INDEX = [
  { id: "tug-of-war", titleUz: "Arg'amchi tortish 3D", titleRu: "Перетягивание каната 3D", desc: "Ikki jamoa 3D musobaqasi" },
  { id: "mystery-box", titleUz: "Sirli quti 3D", titleRu: "Тайная коробка 3D", desc: "3D qutilar ichidagi savol va sovg'alar" },
  { id: "wheel", titleUz: "Omad charxi", titleRu: "Колесо фортуны", desc: "Barabanni aylantirib ball to'plash" },
  { id: "jeopardy", titleUz: "Jeopardy", titleRu: "Своя игра (Jeopardy)", desc: "Mavzular va balli jadval" },
  { id: "quiz-race", titleUz: "Bilim poygasi", titleRu: "Гонка знаний", desc: "Tezkor marraga yetish musobaqasi" },
  { id: "truefalse-blitz", titleUz: "Ha / Yo'q Blits", titleRu: "Блиц Правда/Ложь", desc: "Seriya bonusli tezkor fakt sinovi" },
  { id: "math-duel", titleUz: "Matematik duel", titleRu: "Математическая дуэль", desc: "Sinf darajasidagi misollar dueli" },
  { id: "crossword", titleUz: "Krossvord", titleRu: "Кроссворд", desc: "Kesishuvchi so'zlar boshqotirmasi" },
  { id: "memory-cards", titleUz: "Xotira juftlari", titleRu: "Карточки памяти", desc: "Juft atamalarni yodlab ochish" },
  { id: "word-chain", titleUz: "So'z zanjiri", titleRu: "Цепочка слов", desc: "Izohlar orqali zanjirni davom ettirish" },
  { id: "anagram", titleUz: "Anagram", titleRu: "Анаграмма", desc: "Harflardan so'z yig'ish" },
  { id: "word-search", titleUz: "So'z qidirish", titleRu: "Поиск слов", desc: "Katakchalardan atama topish" },
  { id: "sentence-builder", titleUz: "Gap tuzish", titleRu: "Собери предложение", desc: "So'zlardan to'g'ri gap qurish" },
  { id: "fill-blank", titleUz: "Bo'sh joyni to'ldirish", titleRu: "Заполни пропуск", desc: "Tushirib qoldirilgan so'zni topish" },
  { id: "cards-match", titleUz: "Kartochka va Moslashtirish", titleRu: "Карточки и пары", desc: "Flipp kartochkalar va juftlash" },
];

export interface UnifiedSearchHit {
  id: string;
  kind: Exclude<SearchScope, "all">;
  title: string;
  subtitle: string;
  href: string;
  badge: string;
  score: number;
}

export function normalizeSearchText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ʻʼ’‘`´']/g, "")
    .replace(/ў/g, "o")
    .replace(/қ/g, "q")
    .replace(/ғ/g, "g")
    .replace(/ҳ/g, "h")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  const curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

/** 0 dan katta bo'lsa mos keldi; katta son = kuchli moslik */
export function fuzzyScore(rawQuery: string, rawTarget: string): number {
  const q = normalizeSearchText(rawQuery);
  const t = normalizeSearchText(rawTarget);
  if (!q || !t) return 0;

  if (t === q) return 100;
  if (t.startsWith(q)) return 88;
  if (t.includes(q)) return 74;

  const qTokens = q.split(" ").filter(Boolean);
  const tTokens = t.split(" ").filter(Boolean);
  if (qTokens.length === 0 || tTokens.length === 0) return 0;

  let total = 0;
  let matchedCount = 0;

  for (const qt of qTokens) {
    let bestTokenScore = 0;
    for (const tt of tTokens) {
      if (tt === qt) {
        bestTokenScore = 40;
        break;
      }
      if (tt.startsWith(qt) || (qt.length >= 3 && tt.includes(qt))) {
        bestTokenScore = Math.max(bestTokenScore, 30);
        continue;
      }
      if (qt.length >= 4 && tt.length >= 4) {
        const maxDist = qt.length >= 7 ? 2 : 1;
        const dist = levenshteinDistance(qt, tt);
        if (dist <= maxDist) {
          bestTokenScore = Math.max(bestTokenScore, 24 - dist * 5);
        }
      }
    }
    if (bestTokenScore > 0) {
      matchedCount++;
      total += bestTokenScore;
    }
  }

  return matchedCount > 0 && matchedCount >= Math.ceil(qTokens.length * 0.6) ? total : 0;
}

export function searchUnifiedCatalog(
  query: string,
  scope: SearchScope = "all",
  lang: Language = "uz",
  limit = 18,
): UnifiedSearchHit[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const hits: UnifiedSearchHit[] = [];

  if (scope === "all" || scope === "lessons") {
    for (const lesson of INTERACTIVE_LESSONS) {
      const target = `${lesson.grade}-sinf ${lesson.subjectName} ${lesson.title} ${lesson.keyTerms.map((k) => k.term).join(" ")}`;
      const score = fuzzyScore(trimmed, target);
      if (score > 0) {
        hits.push({
          id: `lesson:${lesson.id}`,
          kind: "lessons",
          title: lesson.title,
          subtitle: `${lesson.grade}-sinf · ${lesson.subjectName} · ${lesson.slides.length} slayd`,
          href: `/lessons?id=${encodeURIComponent(lesson.id)}`,
          badge: lang === "uz" ? "Interaktiv dars" : "Урок-слайд",
          score: score + 4,
        });
      }
    }
  }

  if (scope === "all" || scope === "topics") {
    for (const quiz of QUIZZES) {
      const target = `${quiz.grade || ""}-sinf ${quiz.subjectName || ""} ${quiz.title} ${quiz.source || ""}`;
      const score = fuzzyScore(trimmed, target);
      if (score > 0) {
        hits.push({
          id: `topic:${quiz.id}`,
          kind: "topics",
          title: quiz.title,
          subtitle: `${quiz.grade ? `${quiz.grade}-sinf · ` : ""}${quiz.questions.length} savol`,
          href: `/tests/${quiz.id}`,
          badge: lang === "uz" ? "Mavzu testi" : "Тест по теме",
          score: score + 3,
        });
      }
    }
  }

  if (scope === "all" || scope === "games") {
    for (const g of GAMES_SEARCH_INDEX) {
      const target = `${g.titleUz} ${g.titleRu} ${g.desc}`;
      const score = fuzzyScore(trimmed, target);
      if (score > 0) {
        hits.push({
          id: `game:${g.id}`,
          kind: "games",
          title: lang === "uz" ? g.titleUz : g.titleRu,
          subtitle: g.desc,
          href: `/tests?section=games&game=${g.id}`,
          badge: lang === "uz" ? "Ta'limiy o'yin" : "Игра",
          score: score + 2,
        });
      }
    }
  }

  if (scope === "all" || scope === "materials") {
    for (const m of MATERIAL_TYPES) {
      const target = `${m.titleUz} ${m.titleRu} ${m.subtitleUz} ${m.subtitleRu}`;
      const score = fuzzyScore(trimmed, target);
      if (score > 0) {
        hits.push({
          id: `material:${m.id}`,
          kind: "materials",
          title: lang === "uz" ? m.titleUz : m.titleRu,
          subtitle: lang === "uz" ? m.subtitleUz : m.subtitleRu,
          href: `/materials?type=${m.id}`,
          badge: lang === "uz" ? "AI Material" : "ИИ Материал",
          score: score + 1,
        });
      }
    }
  }

  if (scope === "all" || scope === "books" || scope === "audio") {
    for (const subj of ALL_SUBJECTS) {
      const hasAudio = Boolean(subj.hasAudio || subj.resources.some((r) => Boolean(r.audioUrl)));
      if (scope === "audio" && !hasAudio) continue;
      const target = `${subj.grade}-sinf ${subj.name} ${subj.category} ${hasAudio ? "audio" : ""}`;
      const score = fuzzyScore(trimmed, target);
      if (score > 0) {
        hits.push({
          id: `book:${subj.id}`,
          kind: hasAudio && scope === "audio" ? "audio" : "books",
          title: `${subj.grade}-sinf · ${subj.name}`,
          subtitle: `${subj.category} · ${subj.resources.length} resurs${hasAudio ? " · Audio mavjud" : ""}`,
          href: `/library?grade=${subj.grade}&q=${encodeURIComponent(subj.name)}${scope === "audio" ? "&audio=1" : ""}`,
          badge: hasAudio ? (lang === "uz" ? "Audio + PDF" : "Аудио + PDF") : lang === "uz" ? "PDF darslik" : "PDF учебник",
          score: hasAudio ? score + 2 : score,
        });
      }
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

/* ================== DETERMINISTIK MATERIAL GENERATORI ================== */

export interface MaterialItemBlock {
  number: number;
  prompt: string;
  options?: string[];
  answer: string;
  points?: number;
  note?: string;
}

export interface GeneratedMaterial {
  typeId: string;
  title: string;
  subtitle: string;
  grade: string;
  subject: string;
  topic: string;
  instructions: string;
  blocks: MaterialItemBlock[];
  wordGrid?: string[][];
  crossword?: ReturnType<typeof buildCrosswordGrid>;
  generatedBy: "curriculum" | "ai";
}

function findMatchingQuiz(grade: string, subject: string): Quiz {
  const normSubj = normalizeSearchText(subject);
  const match = QUIZZES.find(
    (q) =>
      (!grade || grade === "all" || q.grade === (grade as GradeNumber)) &&
      (normSubj === "" ||
        normalizeSearchText(`${q.subjectName || ""} ${q.subjectId || ""} ${q.source || ""} ${q.title}`).includes(normSubj)),
  );
  return match || QUIZZES[0] || GENERAL_INTELLECTUAL_QUIZ;
}

export function generateDeterministicMaterial(opts: {
  typeId: string;
  grade: string;
  subject: string;
  topic: string;
  count?: number;
}): GeneratedMaterial {
  const { typeId, grade, subject, topic } = opts;
  const count = Math.max(5, Math.min(15, opts.count ?? 8));
  const gradeNum = parseInt(grade, 10) || 7;
  const quiz = findMatchingQuiz(grade, subject);
  const words = extractWordPuzzles(quiz, GENERAL_INTELLECTUAL_QUIZ, 10);
  const displayTopic = topic.trim() || `${subject} — umumiy takrorlash`;

  if (typeId === "math-sheet") {
    const problems = buildMathDuelProblems(gradeNum, count);
    return {
      typeId,
      title: `${grade}-sinf · Matematik ishchi varaq`,
      subtitle: displayTopic,
      grade,
      subject,
      topic: displayTopic,
      instructions: "Har bir misol va masalani yechim bosqichlari bilan daftarga yozing.",
      blocks: problems.map((p, idx) => ({
        number: idx + 1,
        prompt: p.prompt,
        options: p.options.map(String),
        answer: String(p.answer),
        note: p.explain,
      })),
      generatedBy: "curriculum",
    };
  }

  if (typeId === "crossword") {
    const cw = buildCrosswordGrid(words, 6);
    return {
      typeId,
      title: `${grade}-sinf · ${subject} — Krossvord`,
      subtitle: displayTopic,
      grade,
      subject,
      topic: displayTopic,
      instructions: "Ta'riflar asosida katakchalarga mos atamalarni yozing.",
      blocks: cw.entries.map((e, idx) => ({
        number: idx + 1,
        prompt: `${e.number}-${e.direction === "across" ? "gorizontal" : "vertikal"}: ${e.hint} (${e.word.length} harf)`,
        answer: e.displayWord,
      })),
      crossword: cw,
      generatedBy: "curriculum",
    };
  }

  if (typeId === "word-search") {
    const ws = generateWordSearch(words, 10);
    return {
      typeId,
      title: `${grade}-sinf · ${subject} — So'z qidirish`,
      subtitle: displayTopic,
      grade,
      subject,
      topic: displayTopic,
      instructions: "Jadval ichidan quyidagi ta'riflarga mos atamalarni topib belgilang.",
      blocks: ws.placements.map((p, idx) => ({
        number: idx + 1,
        prompt: `${p.hint} (${p.word.length} harf)`,
        answer: p.displayWord,
      })),
      wordGrid: ws.grid,
      generatedBy: "curriculum",
    };
  }

  if (typeId === "anagram") {
    return {
      typeId,
      title: `${grade}-sinf · ${subject} — Anagram mashqi`,
      subtitle: displayTopic,
      grade,
      subject,
      topic: displayTopic,
      instructions: "Aralashtirilgan harflardan to'g'ri atamani tiklang.",
      blocks: words.slice(0, count).map((w, idx) => {
        const scrambled = w.word.split("").reverse().join("");
        return {
          number: idx + 1,
          prompt: `Harflar: [ ${scrambled.split("").join(" · ")} ] — Izoh: ${w.hint}`,
          answer: w.displayWord,
        };
      }),
      generatedBy: "curriculum",
    };
  }

  if (typeId === "matching") {
    const pairs = words.slice(0, count);
    return {
      typeId,
      title: `${grade}-sinf · ${subject} — Moslashtirish varag'i`,
      subtitle: displayTopic,
      grade,
      subject,
      topic: displayTopic,
      instructions: "Chap ustundagi atamani o'ng ustundagi ta'rif bilan bog'lang.",
      blocks: pairs.map((w, idx) => ({
        number: idx + 1,
        prompt: `${w.displayWord} ↔ ________`,
        answer: `${w.displayWord} — ${w.hint}`,
        note: w.hint,
      })),
      generatedBy: "curriculum",
    };
  }

  if (typeId === "bsb") {
    const qs = quiz.questions.slice(0, Math.min(8, quiz.questions.length));
    return {
      typeId,
      title: `${grade}-sinf · ${subject} — BSB / ChSB Nazorat ishi`,
      subtitle: displayTopic,
      grade,
      subject,
      topic: displayTopic,
      instructions: "Nazorat ishi 3 bo'limdan iborat (jami 25 ball). Har bir topshiriqqa aniq javob yozing.",
      blocks: qs.map((q, idx) => {
        const pts = idx < 4 ? 2 : idx < 6 ? 3 : 5;
        const ans =
          q.type === "choice"
            ? q.options[q.answer]
            : q.type === "truefalse"
              ? q.answer
                ? "To'g'ri"
                : "Noto'g'ri"
              : Array.isArray(q.answer)
                ? q.answer[0]
                : q.answer;
        return {
          number: idx + 1,
          prompt: q.q,
          options: q.type === "choice" ? q.options : undefined,
          answer: ans,
          points: pts,
          note: q.explain,
        };
      }),
      generatedBy: "curriculum",
    };
  }

  if (typeId === "summary" || typeId === "slides") {
    const lesson = INTERACTIVE_LESSONS.find((l) => l.grade === grade) || INTERACTIVE_LESSONS[0];
    return {
      typeId,
      title: `${grade}-sinf · ${subject} — ${typeId === "slides" ? "Slayd ssenariysi" : "Mavzu konspekti"}`,
      subtitle: topic.trim() || lesson.title,
      grade,
      subject,
      topic: topic.trim() || lesson.title,
      instructions:
        typeId === "slides"
          ? "Har bir blok darsning bitta slaydi va o'qituvchi izohini aks ettiradi."
          : "Mavzu bo'yicha tayanch tushunchalar va asosiy xulosalar.",
      blocks: lesson.slides.map((s, idx) => ({
        number: idx + 1,
        prompt: `${s.title}: ${s.body}`,
        options: s.bullets,
        answer: s.highlight || s.teacherNote,
        note: s.teacherNote,
      })),
      generatedBy: "curriculum",
    };
  }

  // Default: topic-test / cloze
  const qs = quiz.questions.slice(0, count);
  return {
    typeId,
    title: `${grade}-sinf · ${subject} — ${typeId === "cloze" ? "Bo'sh joyni to'ldirish" : "Mavzu testi"}`,
    subtitle: displayTopic,
    grade,
    subject,
    topic: displayTopic,
    instructions:
      typeId === "cloze"
        ? "Nuqtalar o'rniga mos atama yoki faktlarni yozing."
        : "Har bir savol uchun to'g'ri variantni belgilang.",
    blocks: qs.map((q, idx) => {
      const ans =
        q.type === "choice"
          ? q.options[q.answer]
          : q.type === "truefalse"
            ? q.answer
              ? "To'g'ri"
              : "Noto'g'ri"
            : Array.isArray(q.answer)
              ? q.answer[0]
              : q.answer;
      return {
        number: idx + 1,
        prompt: q.q,
        options: typeId === "cloze" ? undefined : q.type === "choice" ? q.options : ["To'g'ri", "Noto'g'ri"],
        answer: ans,
        note: q.explain,
      };
    }),
    generatedBy: "curriculum",
  };
}
