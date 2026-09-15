/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";

export type GradeNumber = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11";

export interface SavedBookmarkItem {
  id: string; // unique ID e.g. `pdf-${url}` or `audio-${url}`
  type: "pdf" | "audio";
  title: string;
  url: string;
  grade: string;
  year?: string;
  subjectName?: string;
  timestamp: number;
}

export interface StudentProfileState {
  grade: GradeNumber | null;
  studentName: string;
  bookmarks: string[];
  savedItems: SavedBookmarkItem[];
}

interface StudentContextType {
  profile: StudentProfileState;
  setGrade: (grade: GradeNumber | null) => void;
  setStudentName: (name: string) => void;
  toggleBookmark: (bookId: string) => void;
  isBookmarked: (bookId: string) => boolean;
  toggleBookmarkItem: (item: Omit<SavedBookmarkItem, "timestamp">) => boolean;
  isItemBookmarked: (urlOrId: string) => boolean;
  removeBookmarkItem: (idOrUrl: string) => void;
  clearAllBookmarks: () => void;
  clearProfile: () => void;
}

const STORAGE_KEY = "audio_darsliklar_student_profile_v2";
const LEGACY_STORAGE_KEY = "audio_darsliklar_student_profile_v1";

const defaultState: StudentProfileState = {
  grade: null,
  studentName: "",
  bookmarks: [],
  savedItems: [],
};

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<StudentProfileState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultState,
          ...parsed,
          savedItems: Array.isArray(parsed.savedItems) ? parsed.savedItems : [],
          bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
        };
      }
      
      // Check legacy key
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        return {
          ...defaultState,
          ...parsedLegacy,
          savedItems: [],
          bookmarks: Array.isArray(parsedLegacy.bookmarks) ? parsedLegacy.bookmarks : [],
        };
      }
    } catch {
      // ignore
    }
    return defaultState;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  const setGrade = (grade: GradeNumber | null) => {
    setProfile(prev => ({ ...prev, grade }));
  };

  const setStudentName = (studentName: string) => {
    setProfile(prev => ({ ...prev, studentName }));
  };

  // Legacy ID toggler
  const toggleBookmark = (bookId: string) => {
    setProfile(prev => {
      const exists = prev.bookmarks.includes(bookId);
      const bookmarks = exists 
        ? prev.bookmarks.filter(id => id !== bookId)
        : [...prev.bookmarks, bookId];
      return { ...prev, bookmarks };
    });
  };

  const isBookmarked = (bookId: string) => {
    return profile.bookmarks.includes(bookId);
  };

  // Specific PDF or Audio Link Toggler
  const toggleBookmarkItem = (item: Omit<SavedBookmarkItem, "timestamp">): boolean => {
    let nowAdded = false;
    setProfile(prev => {
      const existingIdx = prev.savedItems.findIndex(
        b => b.id === item.id || b.url === item.url
      );

      let nextItems: SavedBookmarkItem[];
      if (existingIdx >= 0) {
        // Remove
        nextItems = prev.savedItems.filter((_, idx) => idx !== existingIdx);
        nowAdded = false;
      } else {
        // Add
        const newItem: SavedBookmarkItem = {
          ...item,
          timestamp: Date.now(),
        };
        nextItems = [newItem, ...prev.savedItems];
        nowAdded = true;
      }

      // Also ensure item.id or legacy identifier stays synced in bookmarks list
      const bookmarkId = item.id;
      const bookmarks = nowAdded 
        ? (prev.bookmarks.includes(bookmarkId) ? prev.bookmarks : [...prev.bookmarks, bookmarkId])
        : prev.bookmarks.filter(b => b !== bookmarkId && b !== item.url);

      return {
        ...prev,
        savedItems: nextItems,
        bookmarks,
      };
    });
    return nowAdded;
  };

  const isItemBookmarked = (urlOrId: string): boolean => {
    return profile.savedItems.some(item => item.id === urlOrId || item.url === urlOrId);
  };

  const removeBookmarkItem = (idOrUrl: string) => {
    setProfile(prev => ({
      ...prev,
      savedItems: prev.savedItems.filter(item => item.id !== idOrUrl && item.url !== idOrUrl),
      bookmarks: prev.bookmarks.filter(b => b !== idOrUrl),
    }));
  };

  const clearAllBookmarks = () => {
    setProfile(prev => ({
      ...prev,
      savedItems: [],
      bookmarks: [],
    }));
  };

  const clearProfile = () => {
    setProfile(defaultState);
  };

  return (
    <StudentContext.Provider
      value={{
        profile,
        setGrade,
        setStudentName,
        toggleBookmark,
        isBookmarked,
        toggleBookmarkItem,
        isItemBookmarked,
        removeBookmarkItem,
        clearAllBookmarks,
        clearProfile,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent must be used within a StudentProvider");
  }
  return context;
}
