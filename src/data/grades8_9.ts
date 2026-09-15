/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SubjectItem } from "./types";

export const GRADE_8_SUBJECTS: SubjectItem[] = [
  // --- 8-SINF O'ZBEK TILIDA ---
  {
    id: "g8-uz-adabiyot",
    name: "Adabiyot (Audio mavjud)",
    grade: "8",
    lang: "uz",
    category: "Ona tili va Adabiyot",
    hasAudio: true,
    resources: [
      {
        title: "Adabiyot darslik (2019)",
        year: "2019",
        pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/adabiyot_8_uzb.pdf",
        audioUrl: "https://youtube.com/playlist?list=PL8i6F9PI9IOp4yI0Ha_qIu_YBgLkZAhgq",
        type: "darslik",
      },
      {
        title: "Adabiyot yangi nashr (2025)",
        year: "2025",
        pdfUrl: "https://drive.google.com/file/d/1w6Qz_8a9jX4y1F6FzL9fD2qZU4j0NqV4/view",
        audioUrl: "https://youtube.com/playlist?list=PL8i6F9PI9IOpE8IsA8RISr46lD6GmCP_T",
        type: "darslik",
      },
    ],
  },
  {
    id: "g8-uz-ona-tili",
    name: "Ona tili",
    grade: "8",
    lang: "uz",
    category: "Ona tili va Adabiyot",
    resources: [
      { title: "Ona tili (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/ona_tili_8_uzb.pdf", type: "darslik" },
      { title: "Ona tili (2024)", year: "2024", pdfUrl: "https://drive.google.com/file/d/1a6Qz_8a9jX4y1F6FzL9fD2qZU4j0NqV4/view", type: "darslik" },
    ],
  },
  {
    id: "g8-uz-algebra-geometriya",
    name: "Algebra va Geometriya",
    grade: "8",
    lang: "uz",
    category: "Aniq fanlar",
    resources: [
      { title: "Algebra (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/algebra_8_uzb.pdf", type: "darslik" },
      { title: "Geometriya (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/geometriya_8_uzb.pdf", type: "darslik" },
      { title: "Informatika (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/informatika_8_uzb.pdf", type: "darslik" },
    ],
  },
  {
    id: "g8-uz-fizika-kimyo-biologiya",
    name: "Fizika, Kimyo va Biologiya",
    grade: "8",
    lang: "uz",
    category: "Tabiiy fanlar",
    resources: [
      { title: "Fizika (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/fizika_8_uzb.pdf", type: "darslik" },
      { title: "Kimyo (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/kimyo_8_uzb.pdf", type: "darslik" },
      { title: "Biologiya (Odam va uning salomatligi) (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/biologiya_8_uzb.pdf", type: "darslik" },
      { title: "Geografiya (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/geografiya_8_uzb.pdf", type: "darslik" },
    ],
  },
  {
    id: "g8-uz-tarix-huquq",
    name: "O'zbekiston tarixi, Jahon tarixi va Huquq",
    grade: "8",
    lang: "uz",
    category: "Ijtimoiy-gumanitar",
    resources: [
      { title: "O'zbekiston tarixi (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/ozbekiston_tarixi_8_uzb.pdf", type: "darslik" },
      { title: "Jahon tarixi (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/jahon_tarixi_8_uzb.pdf", type: "darslik" },
      { title: "Davlat va huquq asoslari (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/davlat_huquq_asoslari_8_uzb.pdf", type: "darslik" },
      { title: "Iqtisodiy bilim asoslari (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/iqtisod_8_uzb.pdf", type: "darslik" },
      { title: "Tarbiya (2020)", year: "2020", pdfUrl: "https://drive.google.com/file/d/14m8b2u0v8x9a0b1c2d3e4f5g6h7i8j9k/view", type: "darslik" },
    ],
  },
  {
    id: "g8-uz-xorijiy-amaliy",
    name: "Xorijiy tillar, Chizmachilik va Texnologiya",
    grade: "8",
    lang: "uz",
    category: "Xorijiy tillar",
    resources: [
      { title: "Ingliz tili (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/ingliz_tili_8_uzb.pdf", type: "darslik" },
      { title: "Rus tili (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/rus_tili_8_uzb.pdf", type: "darslik" },
      { title: "Fransuz tili (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/fransuz_tili_8_uzb.pdf", type: "darslik" },
      { title: "Nemis tili (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/nemis_tili_8_uzb.pdf", type: "darslik" },
      { title: "Chizmachilik (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/chizmachilik_8_uzb.pdf", type: "darslik" },
      { title: "Texnologiya (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/texnologiya_8_uzb.pdf", type: "darslik" },
    ],
  },

  // --- 8-SINF НА РУССКОМ ---
  {
    id: "g8-ru-literatura",
    name: "Литература и Русский язык",
    grade: "8",
    lang: "ru",
    category: "Ona tili va Adabiyot",
    resources: [
      { title: "Литература (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/adabiyot_8_rus.pdf", type: "darslik" },
      { title: "Русский язык (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/ona_tili_8_rus.pdf", type: "darslik" },
      { title: "Узбекский язык (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/rus_tili_8_rus.pdf", type: "darslik" },
    ],
  },
  {
    id: "g8-ru-tochnye",
    name: "Алгебра, Геометрия, Физика, Информатика",
    grade: "8",
    lang: "ru",
    category: "Aniq fanlar",
    resources: [
      { title: "Алгебра (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/algebra_8_rus.pdf", type: "darslik" },
      { title: "Геометрия (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/geometriya_8_rus.pdf", type: "darslik" },
      { title: "Информатика (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/informatika_8_rus.pdf", type: "darslik" },
      { title: "Физика (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/fizika_8_rus.pdf", type: "darslik" },
      { title: "Химия (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/kimyo_8_rus.pdf", type: "darslik" },
    ],
  },
  {
    id: "g8-ru-gumanitar",
    name: "История, Право, Биология и Иностранные языки",
    grade: "8",
    lang: "ru",
    category: "Ijtimoiy-gumanitar",
    resources: [
      { title: "Биология (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/biologiya_8_rus.pdf", type: "darslik" },
      { title: "История Узбекистана (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/ozbekiston_tarixi_8_rus.pdf", type: "darslik" },
      { title: "Всемирная история (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/jahon_tarixi_8_rus.pdf", type: "darslik" },
      { title: "Основы государства и права (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/davlat_huquq_asoslari_8_rus.pdf", type: "darslik" },
      { title: "Английский язык (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/8/ingliz_tili_8_rus.pdf", type: "darslik" },
    ],
  },
];

export const GRADE_9_SUBJECTS: SubjectItem[] = [
  // --- 9-SINF O'ZBEK TILIDA ---
  {
    id: "g9-uz-adabiyot",
    name: "Adabiyot (Audio mavjud)",
    grade: "9",
    lang: "uz",
    category: "Ona tili va Adabiyot",
    hasAudio: true,
    resources: [
      {
        title: "Adabiyot darslik (2019)",
        year: "2019",
        pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/adabiyot_9_uzb.pdf",
        type: "darslik",
      },
      {
        title: "Adabiyot yangi audio nashr (2025)",
        year: "2025",
        pdfUrl: "https://drive.google.com/file/d/1y6Qz_8a9jX4y1F6FzL9fD2qZU4j0NqV4/view",
        audioUrl: "https://youtube.com/playlist?list=PLOmXeNaR-258&si=8Az86LL1IVTuFshW",
        type: "darslik",
      },
    ],
  },
  {
    id: "g9-uz-ona-tili",
    name: "Ona tili",
    grade: "9",
    lang: "uz",
    category: "Ona tili va Adabiyot",
    resources: [
      { title: "Ona tili (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/ona_tili_9_uzb.pdf", type: "darslik" },
      { title: "Ona tili (2024)", year: "2024", pdfUrl: "https://drive.google.com/file/d/1b6Qz_8a9jX4y1F6FzL9fD2qZU4j0NqV4/view", type: "darslik" },
    ],
  },
  {
    id: "g9-uz-algebra-geometriya",
    name: "Algebra va Geometriya",
    grade: "9",
    lang: "uz",
    category: "Aniq fanlar",
    resources: [
      { title: "Algebra (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/algebra_9_uzb.pdf", type: "darslik" },
      { title: "Geometriya (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/geometriya_9_uzb.pdf", type: "darslik" },
      { title: "Informatika (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/informatika_9_uzb.pdf", type: "darslik" },
    ],
  },
  {
    id: "g9-uz-tabiiy-fanlar",
    name: "Fizika, Kimyo va Biologiya",
    grade: "9",
    lang: "uz",
    category: "Tabiiy fanlar",
    resources: [
      { title: "Fizika (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/fizika_9_uzb.pdf", type: "darslik" },
      { title: "Kimyo (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/kimyo_9_uzb.pdf", type: "darslik" },
      { title: "Biologiya (Sitologiya va genetika) (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/biologiya_9_uzb.pdf", type: "darslik" },
      { title: "Geografiya (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/geografiya_9_uzb.pdf", type: "darslik" },
    ],
  },
  {
    id: "g9-uz-tarix-huquq",
    name: "Tarix, Konstitutsiyaviy huquq va Ma'naviyat",
    grade: "9",
    lang: "uz",
    category: "Ijtimoiy-gumanitar",
    resources: [
      { title: "O'zbekiston tarixi (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/ozbekiston_tarixi_9_uzb.pdf", type: "darslik" },
      { title: "Jahon tarixi (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/jahon_tarixi_9_uzb.pdf", type: "darslik" },
      { title: "Konstitutsiyaviy huquq asoslari (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/davlat_huquq_asoslari_9_uzb.pdf", type: "darslik" },
      { title: "Milliy istiqlol g'oyasi (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/manaviyat_9_uzb.pdf", type: "darslik" },
      { title: "Iqtisodiy bilim asoslari (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/iqtisod_9_uzb.pdf", type: "darslik" },
      { title: "Tarbiya (2020)", year: "2020", pdfUrl: "https://drive.google.com/file/d/15m8b2u0v8x9a0b1c2d3e4f5g6h7i8j9k/view", type: "darslik" },
    ],
  },
  {
    id: "g9-uz-xorijiy-amaliy",
    name: "Xorijiy tillar, Chizmachilik va Texnologiya",
    grade: "9",
    lang: "uz",
    category: "Xorijiy tillar",
    resources: [
      { title: "Ingliz tili (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/ingliz_tili_9_uzb.pdf", type: "darslik" },
      { title: "Rus tili (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/rus_tili_9_uzb.pdf", type: "darslik" },
      { title: "Fransuz tili (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/fransuz_tili_9_uzb.pdf", type: "darslik" },
      { title: "Nemis tili (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/nemis_tili_9_uzb.pdf", type: "darslik" },
      { title: "Chizmachilik (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/chizmachilik_9_uzb.pdf", type: "darslik" },
      { title: "Texnologiya (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/texnologiya_9_uzb.pdf", type: "darslik" },
    ],
  },

  // --- 9-SINF НА РУССКОМ ---
  {
    id: "g9-ru-literatura",
    name: "Литература и Русский язык",
    grade: "9",
    lang: "ru",
    category: "Ona tili va Adabiyot",
    resources: [
      { title: "Литература (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/adabiyot_9_rus.pdf", type: "darslik" },
      { title: "Русский язык (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/ona_tili_9_rus.pdf", type: "darslik" },
      { title: "Узбекский язык (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/rus_tili_9_rus.pdf", type: "darslik" },
    ],
  },
  {
    id: "g9-ru-tochnye",
    name: "Алгебра, Геометрия, Физика, Химия",
    grade: "9",
    lang: "ru",
    category: "Aniq fanlar",
    resources: [
      { title: "Алгебра (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/algebra_9_rus.pdf", type: "darslik" },
      { title: "Геометрия (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/geometriya_9_rus.pdf", type: "darslik" },
      { title: "Информатика (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/informatika_9_rus.pdf", type: "darslik" },
      { title: "Физика (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/fizika_9_rus.pdf", type: "darslik" },
      { title: "Химия (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/kimyo_9_rus.pdf", type: "darslik" },
      { title: "Биология (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/biologiya_9_rus.pdf", type: "darslik" },
    ],
  },
  {
    id: "g9-ru-istoriya-gumanitar",
    name: "История, Право и Иностранные языки",
    grade: "9",
    lang: "ru",
    category: "Ijtimoiy-gumanitar",
    resources: [
      { title: "История Узбекистана (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/ozbekiston_tarixi_9_rus.pdf", type: "darslik" },
      { title: "Всемирная история (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/jahon_tarixi_9_rus.pdf", type: "darslik" },
      { title: "Основы государства и права (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/davlat_huquq_asoslari_9_rus.pdf", type: "darslik" },
      { title: "Английский язык (2019)", year: "2019", pdfUrl: "https://old.eduportal.uz/Umumiyfiles/darsliklar/9/ingliz_tili_9_rus.pdf", type: "darslik" },
    ],
  },
];
