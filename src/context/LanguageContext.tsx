/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type SiteLanguage = "uz" | "ru";

interface Translations {
  [key: string]: {
    uz: string;
    ru: string;
  };
}

export const UI_STRINGS: Translations = {
  // Navigation
  navHome: { uz: "Asosiy", ru: "Главная" },
  navLibrary: { uz: "Kutubxona", ru: "Библиотека" },
  navAiChat: { uz: "AI Ustoz", ru: "ИИ Учитель" },
  navTts: { uz: "Audio Yaratish (TTS)", ru: "Создать Аудио (TTS)" },
  navProfile: { uz: "Profil", ru: "Профиль" },
  navAbout: { uz: "Loyiha", ru: "О проекте" },
  navContact: { uz: "Aloqa", ru: "Контакты" },
  navTelegram: { uz: "Telegram", ru: "Telegram" },
  navTelegramChannel: { uz: "Telegram Kanal", ru: "Telegram канал" },

  // Hero
  heroBadge: { 
    uz: "Rasmiy Ta'lim Resursi 2026", 
    ru: "Официальный образовательный ресурс 2026" 
  },
  heroTitle1: { uz: "Maktab", ru: "Школьные" },
  heroTitle2: { uz: "Darsliklari", ru: "Учебники" },
  heroTitle3: { uz: "Audio va PDF", ru: "Аудио и PDF" },
  heroSubtitle: { 
    uz: "1–11-sinf maktab darsliklarining rasmiy PDF nusxalari va adabiyot darslarining sifatli audio versiyalari. Innovatsion ta'lim platformasi orqali bilimlaringizni yanada boyiting.", 
    ru: "Официальные PDF-копии школьных учебников 1–11 классов и качественные аудиоверсии уроков литературы. Обогащайте свои знания через инновационную образовательную платформу." 
  },
  heroCtaBrowse: { uz: "Darsliklarni ko'rish", ru: "Смотреть учебники" },
  heroCtaYoutube: { uz: "YouTube Kanalimiz", ru: "Наш YouTube канал" },
  heroStatBooks: { uz: "Darsliklar (1-11)", ru: "Учебники (1-11)" },
  heroStatDesc: { 
    uz: "Barcha darsliklar rasmiy o'quv dasturlari va yangi nashrlar asosida jamlangan.", 
    ru: "Все учебники собраны на основе официальных учебных программ и новых изданий." 
  },
  heroStatFree: { uz: "Mutlaqo Bepul", ru: "Абсолютно бесплатно" },
  heroStatFreeDesc: { 
    uz: "Hech qanday to'lov yoki ro'yxatdan o'tish talab etilmaydi.", 
    ru: "Никаких оплат и обязательной регистрации не требуется." 
  },

  // Textbook Section
  sectionBadge: { 
    uz: "1-11 Sinf Barcha Darsliklari & Audio Versiyalar", 
    ru: "Все учебники 1-11 классов и аудиоверсии" 
  },
  sectionTitle1: { uz: "Maktab", ru: "Школьные" },
  sectionTitle2: { uz: "Darsliklari", ru: "Учебники" },
  sectionTitle3: { uz: "va Audio", ru: "и Аудио" },
  sectionSubtitle: { 
    uz: "1-sinfdan 11-sinfgacha barcha fanlarning rasmiy PDF darsliklari, mashq daftarlari va 8–9-sinf O'zbek adabiyoti audio darslari.", 
    ru: "Официальные PDF-учебники всех предметов с 1 по 11 класс, рабочие тетради и аудиоуроки узбекской литературы 8–9 классов." 
  },
  searchPlaceholder: { 
    uz: "Fan nomi, sinf yoki kitob...", 
    ru: "Название предмета, класс или книга..." 
  },
  viewCurated: { uz: "Adabiyot & Audio To'plam", ru: "Литература и Аудио" },
  viewCatalog: { uz: "To'liq Fanlar Katalogi", ru: "Полный каталог предметов" },
  allGradesBtn: { uz: "Barcha sinflar (1-11)", ru: "Все классы (1-11)" },
  gradeSuffix: { uz: "-sinf", ru: " класс" },
  gradeYou: { uz: "Siz", ru: "Вы" },
  allCategories: { uz: "Barcha yo'nalishlar", ru: "Все направления" },
  allLangs: { uz: "Barchasi", ru: "Все языки" },
  langUz: { uz: "🇺🇿 O'zbekcha", ru: "🇺🇿 Узбекский" },
  langRu: { uz: "🇷🇺 Русский", ru: "🇷🇺 Русский" },
  
  // Student Notice
  studentNoticeWithGrade: {
    uz: "Sizning sinfingiz:",
    ru: "Ваш класс:"
  },
  studentNoticeForYou: {
    uz: "siz uchun darsliklar ro'yxatda birinchi bo'lib turibdi.",
    ru: "учебники вашего класса отображаются в начале списка."
  },
  studentNoticePrompt: {
    uz: "O'quvchi profilida o'z sinfingizni (1–11) tanlang va kerakli darsliklarni qulay saqlab boring.",
    ru: "Выберите свой класс (1–11) в профиле ученика для удобного доступа к нужным учебникам."
  },
  btnSelectGrade: { uz: "Sinfni Tanlash (1-11)", ru: "Выбрать класс (1-11)" },
  btnViewProfile: { uz: "Profilni Ko'rish", ru: "Открыть профиль" },
  yourGradeBadge: { uz: "Sizning Sinfingiz", ru: "Ваш класс" },
  selectedBadge: { uz: "Tanlangan", ru: "Выбран" },
  setAsMyGrade: { uz: "Mening sinfim qilib belgilash", ru: "Выбрать как мой класс" },

  // Favorites & Bookmarks
  myFavorites: { uz: "Mening Sevimlilarim", ru: "Моё Избранное" },
  favoritesSubtitle: { 
    uz: "Tezkor kirish uchun saqlangan PDF darsliklar va audio pleylistlar", 
    ru: "Сохранённые PDF-учебники и аудио плейлисты для быстрого доступа" 
  },
  favoritesCount: { uz: "ta saqlangan havola", ru: "сохранённых ссылок" },
  tabAll: { uz: "Barchasi", ru: "Все" },
  tabPdf: { uz: "Faqat PDF Darsliklar", ru: "Только PDF" },
  tabAudio: { uz: "Faqat Audio Pleylistlar", ru: "Только Аудио" },
  noFavoritesTitle: { uz: "Hali hech qanday havola saqlanmagan", ru: "Пока нет сохранённых ссылок" },
  noFavoritesDesc: { 
    uz: "Darsliklar va audiolarni belgilab, o'zingizga kerakli barcha havolalarni bir joyda to'plashingiz mumkin.", 
    ru: "Сохраняйте нужные PDF-учебники и аудиоматериалы с помощью кнопки закладки для мгновенного доступа." 
  },
  browseBooksBtn: { uz: "Darsliklarni tanlash", ru: "Выбрать учебники" },
  clearAllFavorites: { uz: "Barchasini tozalash", ru: "Очистить всё" },
  confirmClearFavorites: { uz: "Barcha saqlangan havolalarni o'chirishni xohlaysizmi?", ru: "Вы уверены, что хотите удалить все сохранённые ссылки?" },
  removeFromFavorites: { uz: "Sevimlilardan o'chirish", ru: "Удалить из избранного" },
  addToFavorites: { uz: "Sevimlilarga qo'shish", ru: "В избранное" },
  openPdfAction: { uz: "PDF Ochish", ru: "Открыть PDF" },
  listenAudioAction: { uz: "Audioni Tinglash", ru: "Слушать аудио" },
  copyFavoriteLink: { uz: "Havolani nusxalash", ru: "Скопировать ссылку" },
  copiedNotification: { uz: "Havola nusxalandi!", ru: "Ссылка скопирована!" },
  quickAccessTag: { uz: "Tezkor Kirish", ru: "Быстрый Доступ" },

  // Book action buttons
  btnPdfBook: { uz: "PDF Darslik", ru: "PDF Учебник" },
  btnAudioListen: { uz: "Audio Tinglash", ru: "Слушать аудио" },
  btnAudioPending: { uz: "Tayyorlanmoqda", ru: "В разработке" },
  downloadOpen: { uz: "Yuklab olish ochiq", ru: "Доступно скачивание" },
  materialsAvailable: { uz: "ta material mavjud", ru: "материалов доступно" },
  editionsCount: { uz: "ta nashr varianti", ru: "варианта издания" },
  audioAvailableTag: { uz: "Audio Bor", ru: "Есть аудио" },
  bookmarkAdd: { uz: "Xatcho'pga qo'shish", ru: "В закладки" },
  bookmarkRemove: { uz: "Xatcho'pdan o'chirish", ru: "Удалить из закладок" },
  emptyTitle: { uz: "Darslik topilmadi", ru: "Учебник не найден" },
  emptyDesc: { 
    uz: "Qidiruv so'zini o'zgartiring yoki filtrlarni tozalang.", 
    ru: "Измените поисковый запрос или сбросьте фильтры." 
  },
  btnClearFilters: { uz: "Filtrlarni Tozalash", ru: "Сбросить фильтры" },

  // Features
  featFreeTitle: { uz: "100% Bepul Ta'lim", ru: "100% Бесплатное образование" },
  featFreeDesc: { 
    uz: "O'zbekiston maktablarining barcha o'quvchilari uchun bepul va ochiq darsliklar platformasi.", 
    ru: "Бесплатная и открытая платформа учебников для всех школьников Узбекистана." 
  },
  featAudioTitle: { uz: "Audio Darslar (TTS)", ru: "Аудиоуроки (TTS)" },
  featAudioDesc: { 
    uz: "Adabiyot darslarini tinglab o'rganish uchun YouTube'dagi qulay audio pleylistlar.", 
    ru: "Удобные аудио плейлисты на YouTube для изучения литературы на слух." 
  },
  featOfficialTitle: { uz: "Rasmiy Dastur", ru: "Официальная программа" },
  featOfficialDesc: { 
    uz: "Vazirlik tomonidan tasdiqlangan rasmiy darsliklar va yangi nashr nusxalari.", 
    ru: "Официальные учебники и новые издания, утвержденные министерством." 
  },

  // About Page
  aboutHistoryBadge: { uz: "Loyiha tarixi", ru: "История проекта" },
  aboutTitle: { uz: "Bilim hamma uchun", ru: "Знания доступны" },
  aboutFree: { uz: "bepul", ru: "бесплатно" },
  aboutDesc: { 
    uz: "Audio Darsliklar 2026 loyihasi O'zbekistonning barcha o'quvchilari (1-11 sinf) uchun darsliklarni PDF va sifatli audio formatda bepul taqdim etishni maqsad qilgan.", 
    ru: "Проект «Audio Darsliklar 2026» создан для бесплатного предоставления школьных учебников 1–11 классов в формате PDF и качественного аудио." 
  },
  aboutAuthorTitle: { uz: "Loyiha yaratuvchisi", ru: "Создатель проекта" },
  aboutAuthorName: { uz: "Toshov Ozodbek", ru: "Тошов Озодбек" },
  aboutValuesTitle: { uz: "Qadriyatlarimiz", ru: "Наши ценности" },
  aboutSupportTitle: { uz: "Loyihani qo'llab-quvvatlang", ru: "Поддержите проект" },
  aboutSupportDesc: { 
    uz: "Agar sizda foydali darsliklar yoki takliflar bo'lsa, biz bilan bog'laning. Birgalikda ta'lim sifatini oshiramiz!", 
    ru: "Если у вас есть полезные учебники или предложения, свяжитесь с нами. Вместе мы улучшаем качество образования!" 
  },

  // Contact Page
  contactTitle: { uz: "Biz bilan bog'laning", ru: "Свяжитесь с нами" },
  contactSubtitle: { 
    uz: "Savollar, takliflar yoki yangi darsliklar bo'yicha biz bilan bemalol aloqaga chiqing.", 
    ru: "По вопросам, предложениям или добавлению новых учебников связывайтесь с нами." 
  },
  contactAuthorCard: { uz: "Loyiha Muallifi", ru: "Автор проекта" },
  contactOfficialEmail: { uz: "Rasmiy pochta", ru: "Официальная почта" },
  contactPersonalEmail: { uz: "Shaxsiy pochta", ru: "Личная почта" },

  // Footer
  footerMission: { 
    uz: "O'zbekiston maktablarining 1-11 sinf o'quvchilari uchun sifatli darsliklarni bepul yetkazib berish innovatsion loyihasi.", 
    ru: "Инновационный проект бесплатной доставки качественных учебников для учащихся 1–11 классов школ Узбекистана." 
  },
  footerPhilosophy: { 
    uz: "\"Bilim — bu insonning eng katta boyligi. Uni ulashish esa baxtdir.\"", 
    ru: "«Знание — величайшее богатство человека. А делиться им — истинное счастье.»" 
  },
  footerCopyright: { 
    uz: "Hamma resurslar foydalanish uchun ochiq.", 
    ru: "Все ресурсы открыты для бесплатного использования." 
  },
};

interface LanguageContextType {
  language: SiteLanguage;
  setLanguage: (lang: SiteLanguage) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SiteLanguage>(() => {
    const saved = localStorage.getItem("audio_darsliklar_lang");
    return saved === "ru" ? "ru" : "uz";
  });

  const setLanguage = (lang: SiteLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("audio_darsliklar_lang", lang);
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => {
    setLanguage(language === "uz" ? "ru" : "uz");
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    if (UI_STRINGS[key]) {
      return UI_STRINGS[key][language] || UI_STRINGS[key]["uz"];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
