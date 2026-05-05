/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SOCIAL_LINKS = {
  telegram: "https://t.me/Audio_Darsliklar_2026",
  youtube: "https://www.youtube.com/@audiodarsliklar2025",
  instagram: "https://www.instagram.com/ozodbek_toshov007",
  tiktok: "https://www.tiktok.com/@ozodbek.toshov_uz",
  email: "ozodbektoshov0@gmail.com",
};

export const TEXTBOOKS = [
  {
    id: "class-5",
    grade: "5",
    title: "5-sinf O'zbek Adabiyoti",
    books: [
      { year: "2020", pdf: "https://drive.google.com/file/d/1Z1boTGvU_YJNififVEZoQKjud_Y6pgJn/view?usp=sharing" },
      { year: "2024 (1-qism)", pdf: "https://drive.google.com/file/d/1jSRUQe9MFc2R5-PN9uJQHWNrz8lVuN6W/view?usp=sharing" },
      { year: "2024 (2-qism)", pdf: "https://drive.google.com/file/d/1jVmeeblozsW_4GCtr4mDT9IoEN8afaae/view?usp=sharing" },
    ],
    audio: null,
  },
  {
    id: "class-6",
    grade: "6",
    title: "6-sinf O'zbek Adabiyoti",
    books: [
      { year: "2017 (1-qism)", pdf: "https://drive.google.com/file/d/1Ykm798qXa1sfSM36eRrp7HyISzz70y5A/view?usp=sharing" },
      { year: "2017 (2-qism)", pdf: "https://drive.google.com/file/d/1STCwjI_5L9K39-t8zcwoUrumdatYwBCs/view?usp=sharing" },
      { year: "2022", pdf: "https://drive.google.com/file/d/11GnYT2jH2tZsllITrbIIGg7xR_jg2FHH/view?usp=sharing" },
    ],
    audio: null,
  },
  {
    id: "class-7",
    grade: "7",
    title: "7-sinf O'zbek Adabiyoti",
    books: [
      { year: "2017", pdf: "https://drive.google.com/file/d/1xvF1D48PfKieZHQNgpXOQHv1ecCp485i/view?usp=sharing" },
      { year: "2022", pdf: "https://drive.google.com/file/d/139jsOtyEA8yQCxQ_YjPxvp972SRqvzB5/view?usp=sharing" },
    ],
    audio: null,
  },
  {
    id: "class-8",
    grade: "8",
    title: "8-sinf O'zbek Adabiyoti",
    books: [
      { 
        year: "2019", 
        pdf: "https://drive.google.com/file/d/1QTjFnbFwiRzqL-avNEC35xobRiQk9B4O/view?usp=sharing",
        audio: "https://youtube.com/playlist?list=PL8i6F9PI9IOp4yI0Ha_qIu_YBgLkZAhgq"
      },
      { 
        year: "2025", 
        pdf: "https://drive.google.com/file/d/1sNQ2l8b-Grv1P9NxhF6uK2bQBf5gAuq_/view?usp=sharing",
        audio: "https://youtube.com/playlist?list=PL8i6F9PI9IOpE8IsA8RISr46lD6GmCP_T"
      },
    ],
    audio: true, // Special flag for grade 8 since it has multiple linked audios
  },
  {
    id: "class-9",
    grade: "9",
    title: "9-sinf O'zbek Adabiyoti",
    books: [
      { year: "2019", pdf: "https://drive.google.com/file/d/1KkGZ6b-324-Ci7Eca1T_fvv3uHsavFj7/view?usp=sharing" },
    ],
    audio: null,
  },
  {
    id: "class-10",
    grade: "10",
    title: "10-sinf O'zbek Adabiyoti",
    books: [
      { year: "2017 (1-qism)", pdf: "https://drive.google.com/file/d/1y8hNlxFsFbeqLMScrISCkzRS8gQ3Bvff/view?usp=sharing" },
      { year: "2017 (2-qism)", pdf: "https://drive.google.com/file/d/1LaOtIOPnl5yMy6fagJP2ilcrpz6igG2i/view?usp=sharing" },
      { year: "2022", pdf: "https://drive.google.com/file/d/19EToo-Pzz15BNTJyV6N1MSY4ONT-2Hb9/view?usp=sharing" },
    ],
    audio: null,
  },
  {
    id: "class-11",
    grade: "11",
    title: "11-sinf O'zbek Adabiyoti",
    books: [
      { year: "2018 (1-qism)", pdf: "https://drive.google.com/file/d/13hcVKZ0QMjuyDvTlwBL7WcRbqN7S0ypN/view?usp=sharing" },
      { year: "2018 (2-qism)", pdf: "https://drive.google.com/file/d/1EY_hc46nEpXIMGiReMLx6Iwz19t576QR/view?usp=sharing" },
    ],
    audio: null,
  },
];

export const STATS = [
  { label: "Sinflar", value: "5-11", icon: "graduation" },
  { label: "Darsliklar", value: "20+", icon: "bookOpen" },
  { label: "Audio resurslar", value: "8-Sinf", icon: "music" },
  { label: "Foydalanish", value: "100% Bepul", icon: "heart" },
];

export const FEATURES = [
  {
    icon: "headphones",
    title: "Professional Audio",
    desc: "Darsliklarning eng sifatli audio talqinlari, ravon va tushunarli o'qilgan.",
  },
  {
    icon: "book",
    title: "Rasmiy Darsliklar",
    desc: "Maktab dasturi asosidagi tasdiqlangan rasmiy o'quv darsliklari.",
  },
  {
    icon: "gift",
    title: "100% Bepul",
    desc: "Barcha resurslar mutlaqo bepul va barchaga ochiq holatda taqdim etiladi.",
  },
  {
    icon: "smartphone",
    title: "Mobilga Mos",
    desc: "Sayt barcha turdagi mobil qurilmalar va planshetlarga to'liq moslangan.",
  },
  {
    icon: "shieldCheck",
    title: "Xavfsiz",
    desc: "Fayllar xavfsiz Google Drive bulutli xotirasida saqlanadi.",
  },
  {
    icon: "zap",
    title: "Tez Yuklanish",
    desc: "Minimalistik va optimallashtirilgan kod saytning tez ishlashini ta'minlaydi.",
  },
];
