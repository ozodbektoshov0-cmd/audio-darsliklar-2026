import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
  signInWithGoogle,
  signOutGoogle,
} from "../lib/firebase";
import type { GradeNumber, ProfileUserType } from "./StudentContext";

interface AuthContextValue {
  user: User | null;
  authReady: boolean;
  authBusy: boolean;
  authError: string | null;
  clearAuthError: () => void;
  loginWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
  saveOnboardingPreferences: (prefs: {
    profileType?: ProfileUserType | null;
    grade?: GradeNumber | null;
    onboardingDone?: boolean;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function syncUserProfileDoc(u: User) {
  if (!u.emailVerified) return;
  const path = `users/${u.uid}`;
  const ref = doc(db, "users", u.uid);
  const safeName = (u.displayName || "Foydalanuvchi").trim().slice(0, 100) || "Foydalanuvchi";
  const safePhoto = (u.photoURL || "").slice(0, 500);

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const payload: Record<string, unknown> = {
        uid: u.uid,
        displayName: safeName,
        role: "student",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (safePhoto) payload.photoURL = safePhoto;
      await setDoc(ref, payload);
    } else {
      const payload: Record<string, unknown> = {
        displayName: safeName,
        updatedAt: serverTimestamp(),
      };
      if (safePhoto) payload.photoURL = safePhoto;
      await setDoc(ref, payload, { merge: true });
    }
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, path);
    } catch (wrapped) {
      console.warn(wrapped);
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (nextUser) {
        void syncUserProfileDoc(nextUser);
      }
    });
    return () => unsub();
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const u = await signInWithGoogle();
      return u;
    } catch (err: any) {
      const code = String(err?.code || "");
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setAuthError("Kirish oynasi yopildi. Qayta urinib ko'ring.");
      } else if (code === "auth/popup-blocked") {
        setAuthError("Brauzer qalqib chiquvchi oynani blokladi. Ruxsat bering.");
      } else {
        setAuthError("Google orqali kirishda xatolik yuz berdi.");
      }
      return null;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signOutGoogle();
    } catch {
      setAuthError("Chiqishda xatolik yuz berdi.");
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const saveOnboardingPreferences = useCallback(
    async (prefs: {
      profileType?: ProfileUserType | null;
      grade?: GradeNumber | null;
      onboardingDone?: boolean;
    }) => {
      const u = auth.currentUser;
      if (!u || !u.emailVerified) return;
      const path = `users/${u.uid}`;
      const ref = doc(db, "users", u.uid);
      try {
        const snap = await getDoc(ref);
        const safeName = (u.displayName || "Foydalanuvchi").trim().slice(0, 100) || "Foydalanuvchi";
        const safePhoto = (u.photoURL || "").slice(0, 500);
        const payload: Record<string, unknown> = {
          updatedAt: serverTimestamp(),
        };
        if (!snap.exists()) {
          payload.uid = u.uid;
          payload.displayName = safeName;
          payload.role = "student";
          payload.createdAt = serverTimestamp();
          if (safePhoto) payload.photoURL = safePhoto;
        }
        if (prefs.profileType === "student" || prefs.profileType === "teacher") {
          payload.profileType = prefs.profileType;
        }
        if (prefs.grade) {
          payload.grade = prefs.grade;
        }
        if (typeof prefs.onboardingDone === "boolean") {
          payload.onboardingDone = prefs.onboardingDone;
        }
        await setDoc(ref, payload, { merge: true });
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.WRITE, path);
        } catch (wrapped) {
          console.warn(wrapped);
        }
      }
    },
    [],
  );

  const clearAuthError = useCallback(() => setAuthError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        authBusy,
        authError,
        clearAuthError,
        loginWithGoogle,
        logout,
        saveOnboardingPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
