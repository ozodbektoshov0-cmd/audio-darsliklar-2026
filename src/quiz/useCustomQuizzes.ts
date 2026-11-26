import { useCallback, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import type { Quiz } from "./types";
import { isValidQuiz, readCustomQuizzes } from "./util";

const CUSTOM_KEY = "audio_darsliklar_custom_quizzes_v1";

function toFirestorePayload(quiz: Quiz, uid: string, authorName: string) {
  const safeId = quiz.id.replace(/[^a-zA-Z0-9_\-]/g, "_").slice(0, 128);
  const safeQuestions = quiz.questions.slice(0, 250).map((q) => {
    if (q.type === "choice") {
      return {
        type: "choice",
        q: q.q.slice(0, 800),
        options: q.options.map((o) => String(o).slice(0, 300)),
        answer: q.answer,
        ...(q.explain ? { explain: q.explain.slice(0, 800) } : {}),
      };
    }
    if (q.type === "truefalse") {
      return {
        type: "truefalse",
        q: q.q.slice(0, 800),
        answer: q.answer,
        ...(q.explain ? { explain: q.explain.slice(0, 800) } : {}),
      };
    }
    const answers = (Array.isArray(q.answer) ? q.answer : [q.answer])
      .map((a) => String(a).trim().slice(0, 200))
      .filter(Boolean);
    return {
      type: "fill",
      q: q.q.slice(0, 800),
      answer: answers[0] || "",
      ...(answers.length > 1 ? { answerAlternatives: answers.slice(0, 10) } : {}),
      ...(q.explain ? { explain: q.explain.slice(0, 800) } : {}),
    };
  });

  const payload: Record<string, unknown> = {
    id: safeId,
    ownerId: uid,
    authorName: authorName.slice(0, 100) || "O'qituvchi",
    title: quiz.title.trim().slice(0, 180),
    grade: quiz.grade || "all",
    lang: quiz.lang || "uz",
    subjectId: (quiz.subjectId || "custom").slice(0, 120),
    subjectName: (quiz.subjectName || "Umumiy fan").slice(0, 140),
    topicTitle: (quiz.topicTitle || quiz.title).slice(0, 180),
    source: (quiz.source || `${authorName} yaratgan to'plam`).slice(0, 240),
    isPublic: true,
    questions: safeQuestions,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (quiz.cards && quiz.cards.length > 0) {
    payload.cardPairs = quiz.cards.slice(0, 250).map(([front, back]) => ({
      front: String(front).slice(0, 300),
      back: String(back).slice(0, 500),
    }));
  }

  return { safeId, payload };
}

function docToQuiz(data: Record<string, unknown>): Quiz | null {
  const cardPairs = Array.isArray(data.cardPairs)
    ? data.cardPairs
        .filter((p): p is { front: string; back: string } => Boolean(p && typeof p === "object" && "front" in p && "back" in p))
        .map((p) => [String(p.front), String(p.back)] as [string, string])
    : undefined;

  const normalizedQuestions = Array.isArray(data.questions)
    ? data.questions.map((raw) => {
        if (!raw || typeof raw !== "object") return raw;
        const qObj = raw as Record<string, unknown>;
        if (qObj.type === "fill" && Array.isArray(qObj.answerAlternatives) && qObj.answerAlternatives.length > 0) {
          const alts = qObj.answerAlternatives.map((x) => String(x)).filter(Boolean);
          if (alts.length > 0) {
            return {
              type: "fill" as const,
              q: String(qObj.q || ""),
              answer: alts.length === 1 ? alts[0] : alts,
              ...(typeof qObj.explain === "string" ? { explain: qObj.explain } : {}),
            };
          }
        }
        return raw;
      })
    : [];

  const candidate: Quiz = {
    id: String(data.id || ""),
    subjectId: typeof data.subjectId === "string" && data.subjectId !== "custom" ? data.subjectId : undefined,
    subjectName: typeof data.subjectName === "string" ? data.subjectName : undefined,
    topicTitle: typeof data.topicTitle === "string" ? data.topicTitle : undefined,
    grade: typeof data.grade === "string" && data.grade !== "all" ? (data.grade as Quiz["grade"]) : undefined,
    lang: data.lang === "uz" || data.lang === "ru" ? data.lang : "uz",
    title: String(data.title || ""),
    source: typeof data.source === "string" ? data.source : undefined,
    ownerId: typeof data.ownerId === "string" ? data.ownerId : undefined,
    authorName: typeof data.authorName === "string" ? data.authorName : undefined,
    custom: true,
    questions: normalizedQuestions as Quiz["questions"],
    cards: cardPairs && cardPairs.length > 0 ? cardPairs : undefined,
  };

  return isValidQuiz(candidate) ? candidate : null;
}

export function useCloudCustomQuizzes() {
  const { user, authReady } = useAuth();
  const [localQuizzes, setLocalQuizzes] = useState<Quiz[]>(readCustomQuizzes);
  const [cloudQuizzes, setCloudQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    const syncLocal = () => setLocalQuizzes(readCustomQuizzes());
    window.addEventListener("custom-quizzes-updated", syncLocal);
    return () => window.removeEventListener("custom-quizzes-updated", syncLocal);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    const colPath = "customQuizzes";
    const qPublic = query(collection(db, colPath), where("isPublic", "==", true));

    const unsubPublic = onSnapshot(
      qPublic,
      (snap) => {
        const list: Quiz[] = [];
        snap.forEach((docSnap) => {
          const parsed = docToQuiz({ id: docSnap.id, ...docSnap.data() });
          if (parsed) list.push(parsed);
        });
        setCloudQuizzes(list);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, colPath);
        } catch (wrapped) {
          console.warn(wrapped);
        }
      },
    );

    return () => unsubPublic();
  }, [authReady, user?.uid]);

  const customQuizzes = (() => {
    const map = new Map<string, Quiz>();
    for (const q of cloudQuizzes) map.set(q.id, q);
    for (const q of localQuizzes) {
      if (!map.has(q.id)) map.set(q.id, q);
    }
    return Array.from(map.values());
  })();

  const saveCustomQuiz = useCallback(async (quiz: Quiz): Promise<Quiz> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Test yuklash uchun avval Google akkaunt bilan kiring.");
    }

    const authorName = currentUser.displayName?.trim() || "O'qituvchi";
    const { safeId, payload } = toFirestorePayload(quiz, currentUser.uid, authorName);
    const tagged: Quiz = {
      ...quiz,
      id: safeId,
      ownerId: currentUser.uid,
      authorName,
      custom: true,
    };

    const docPath = `customQuizzes/${safeId}`;
    try {
      await setDoc(doc(db, "customQuizzes", safeId), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }

    // Update local cache immediately for snappy UI
    const existing = readCustomQuizzes();
    const next = [tagged, ...existing.filter((item) => item.id !== safeId)];
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("custom-quizzes-updated"));
    } catch {
      // ignore storage errors
    }

    return tagged;
  }, []);

  const removeCustomQuiz = useCallback(async (id: string) => {
    const docPath = `customQuizzes/${id}`;
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, "customQuizzes", id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    }
    const next = readCustomQuizzes().filter((item) => item.id !== id);
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("custom-quizzes-updated"));
    } catch {
      // ignore
    }
  }, []);

  return { customQuizzes, saveCustomQuiz, removeCustomQuiz };
}
