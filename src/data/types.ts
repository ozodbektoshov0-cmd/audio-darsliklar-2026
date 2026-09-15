/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GradeNumber = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11";

export type Language = "uz" | "ru";

export type SubjectCategory =
  | "Boshlang'ich"
  | "Ona tili va Adabiyot"
  | "Aniq fanlar"
  | "Tabiiy fanlar"
  | "Ijtimoiy-gumanitar"
  | "Xorijiy tillar"
  | "Amaliy va estetik";

export interface BookResource {
  title: string;
  year?: string;
  pdfUrl?: string | null; // null if not available yet on site
  audioUrl?: string | null; // YouTube playlist or audio link
  type?: "darslik" | "daftar" | "metodika" | "toplam" | "boshqa";
}

export interface SubjectItem {
  id: string;
  name: string;
  grade: GradeNumber;
  lang: Language;
  category: SubjectCategory;
  resources: BookResource[];
  hasAudio?: boolean;
}
