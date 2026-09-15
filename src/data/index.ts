/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SubjectItem, GradeNumber, Language, SubjectCategory } from "./types";
import { GRADE_1_SUBJECTS, GRADE_2_SUBJECTS, GRADE_3_SUBJECTS, GRADE_4_SUBJECTS } from "./grades1_4";
import { GRADE_5_SUBJECTS, GRADE_6_SUBJECTS, GRADE_7_SUBJECTS } from "./grades5_7";
import { GRADE_8_SUBJECTS, GRADE_9_SUBJECTS } from "./grades8_9";
import { GRADE_10_SUBJECTS, GRADE_11_SUBJECTS } from "./grades10_11";

export * from "./types";

export const ALL_SUBJECTS: SubjectItem[] = [
  ...GRADE_1_SUBJECTS,
  ...GRADE_2_SUBJECTS,
  ...GRADE_3_SUBJECTS,
  ...GRADE_4_SUBJECTS,
  ...GRADE_5_SUBJECTS,
  ...GRADE_6_SUBJECTS,
  ...GRADE_7_SUBJECTS,
  ...GRADE_8_SUBJECTS,
  ...GRADE_9_SUBJECTS,
  ...GRADE_10_SUBJECTS,
  ...GRADE_11_SUBJECTS,
];

// Helper functions for fast filtering
export function getSubjectsByGrade(grade: GradeNumber): SubjectItem[] {
  return ALL_SUBJECTS.filter((s) => s.grade === grade);
}

export function getSubjectsByLang(lang: Language): SubjectItem[] {
  return ALL_SUBJECTS.filter((s) => s.lang === lang);
}

export function getSubjectsWithAudio(): SubjectItem[] {
  return ALL_SUBJECTS.filter((s) => s.hasAudio || s.resources.some((r) => !!r.audioUrl));
}

// Interface compatible with original Textbook model
export interface LegacyBookItem {
  year: string;
  pdf: string;
  audio?: string;
  title?: string;
}

export interface LegacyTextbook {
  id: string;
  grade: string;
  title: string;
  description: string;
  books: LegacyBookItem[];
}

/**
 * Builds standard grade-level Textbook objects (grades 1 to 11)
 * grouping all main textbooks and audio resources for each grade.
 */
export function getLegacyTextbooks(): LegacyTextbook[] {
  const grades: GradeNumber[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];

  return grades.map((g) => {
    const subjects = getSubjectsByGrade(g);
    
    // Pick adabiyot/ona-tili or main primary textbook for header
    const mainSubject = subjects.find(
      (s) => s.lang === "uz" && (s.name.toLowerCase().includes("adabiyot") || s.name.toLowerCase().includes("alifbe"))
    ) || subjects[0];

    const books: LegacyBookItem[] = [];

    // Collect all valid downloadable resources
    subjects.forEach((subj) => {
      subj.resources.forEach((res) => {
        if (res.pdfUrl || res.audioUrl) {
          books.push({
            year: res.year || "2024",
            pdf: res.pdfUrl || (res.audioUrl as string),
            audio: res.audioUrl || undefined,
            title: `${subj.name} – ${res.title}`,
          });
        }
      });
    });

    return {
      id: `${g}-sinf-darsliklari`,
      grade: g,
      title: `${g}-sinf maktab darsliklari to'plami`,
      description: `${g}-sinf barcha fanlar bo'yicha rasmiy PDF darsliklar, mashq daftarlari va audio pleylistlar to'plami.`,
      books: books.slice(0, 8), // prominent books
    };
  });
}
