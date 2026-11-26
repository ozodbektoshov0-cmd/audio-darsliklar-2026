import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getQuiz } from "../quiz";

const SITE_URL = "https://audio-darsliklar-2026.vercel.app";
const SITE_IMAGE = `${SITE_URL}/logo.jpg`;

interface SeoConfig {
  title: string;
  description: string;
  schemaType?: "WebSite" | "Course" | "Quiz" | "CollectionPage";
}

function resolveRouteSeo(pathname: string, search: string, lang: "uz" | "ru"): SeoConfig {
  const uz = lang === "uz";
  const params = new URLSearchParams(search);

  if (pathname === "/") {
    return {
      title: uz
        ? "Audio Darsliklar 2026 — Maktab darsliklari, Slayd darslar, 15 ta O'yin va AI Materiallar"
        : "Audio Darsliklar 2026 — Школьные учебники, Слайд-уроки, 15 Игр и ИИ-Материалы",
      description: uz
        ? "O'zbekiston maktablarining 1–11-sinflari uchun rasmiy PDF darsliklar, audio kitoblar, tayyor slayd darslar, 15 ta intellektual o'yin va AI material generatori."
        : "Официальные PDF-учебники 1–11 классов, аудиокниги, готовые слайд-уроки, 15 интеллектуальных игр и ИИ-генератор учебных материалов.",
      schemaType: "WebSite",
    };
  }

  if (pathname.startsWith("/library")) {
    const grade = params.get("grade");
    return {
      title: grade
        ? uz
          ? `${grade}-sinf Darsliklari va Audio Kutubxona | Audio Darsliklar 2026`
          : `Учебники ${grade} класса и Аудиобиблиотека | Audio Darsliklar 2026`
        : uz
          ? "1–11 Sinf Darsliklar Kutubxonasi (PDF va Audio) | Audio Darsliklar 2026"
          : "Библиотека учебников 1–11 классов (PDF и Аудио) | Audio Darsliklar 2026",
      description: uz
        ? "1-sinfdan 11-sinfgacha barcha fanlar bo'yicha o'zbek va rus tilidagi rasmiy PDF darsliklar va audio pleylistlar katalogi."
        : "Полный каталог официальных школьных учебников на узбекском и русском языках с 1 по 11 класс.",
      schemaType: "CollectionPage",
    };
  }

  if (pathname.startsWith("/lessons")) {
    return {
      title: uz
        ? "Tayyor Interaktiv Slayd Darslar (1–11 sinf) | Audio Darsliklar 2026"
        : "Готовые интерактивные слайд-уроки (1–11 класс) | Audio Darsliklar 2026",
      description: uz
        ? "O'qituvchilar va o'quvchilar uchun 1–11-sinf fanlaridan tayyor interaktiv slayd darslar, metodik tavsiyalar va AI slayd konstruktori."
        : "Готовые слайд-уроки, методические заметки и конструктор презентаций для учителей и учеников.",
      schemaType: "Course",
    };
  }

  if (pathname.startsWith("/materials")) {
    return {
      title: uz
        ? "AI Material Generatori: BSB/ChSB, Test, Krossvord va Matematik Varaqlar | Audio Darsliklar 2026"
        : "ИИ Генератор материалов: СОР/СОЧ, Тесты, Кроссворды | Audio Darsliklar 2026",
      description: uz
        ? "Soniyalar ichida BSB/ChSB nazorat ishlari, mavzu testlari, krossvordlar, matematik ishchi varaqlar va javoblar kalitini yarating va chop eting."
        : "Создавайте и распечатывайте СОР/СОЧ, тесты, кроссворды и рабочие листы с ключами ответов за секунды.",
      schemaType: "Course",
    };
  }

  if (pathname.startsWith("/tests/")) {
    const id = pathname.replace("/tests/", "");
    const quiz = getQuiz(id);
    return {
      title: quiz
        ? `${quiz.title} — ${uz ? "Test va O'yinlar" : "Тесты и Игры"} | Audio Darsliklar 2026`
        : uz
          ? "Test yechish va 15 ta Ta'limiy O'yin | Audio Darsliklar 2026"
          : "Тестирование и 15 обучающих игр | Audio Darsliklar 2026",
      description:
        quiz?.source ||
        (uz
          ? "Mavzular bo'yicha testlar, vaqt hisoblagichli sinovlar va 15 ta ta'limiy o'yin."
          : "Интерактивные тесты по темам учебников и 15 обучающих игр."),
      schemaType: "Quiz",
    };
  }

  if (pathname.startsWith("/tests")) {
    const section = params.get("section");
    return {
      title:
        section === "games"
          ? uz
            ? "15 ta Intellektual va 3D Ta'limiy O'yinlar | Audio Darsliklar 2026"
            : "15 Интеллектуальных и 3D обучающих игр | Audio Darsliklar 2026"
          : uz
            ? "Testlar, Attestatsiya va 15 ta Ta'limiy O'yin | Audio Darsliklar 2026"
            : "Тесты, Аттестация и 15 обучающих игр | Audio Darsliklar 2026",
      description: uz
        ? "1–11-sinf darsliklari bo'yicha mavzu testlari, attestatsiya sinovlari, Arg'amchi tortish 3D, Sirli quti 3D va yana 13 ta intellektual o'yin."
        : "Тематические тесты 1–11 классов, аттестация и 15 интеллектуальных игр для класса и дома.",
      schemaType: "Quiz",
    };
  }

  if (pathname.startsWith("/tts")) {
    return {
      title: uz
        ? "AI Audio Studiya (Matnni Ovozga Aylantirish) | Audio Darsliklar 2026"
        : "ИИ Аудио Студия (Озвучивание текста) | Audio Darsliklar 2026",
      description: uz
        ? "Darslik matnlari va konspektlarni tabiiy ovozga aylantiring va audio fayl sifatida yuklab oling."
        : "Преобразуйте тексты учебников и конспектов в качественное аудио.",
    };
  }

  if (pathname.startsWith("/ai-tutor")) {
    return {
      title: uz
        ? "AI Ustoz — 1–11 Sinf Virtual Repetitori | Audio Darsliklar 2026"
        : "ИИ Учитель — Виртуальный Репетитор | Audio Darsliklar 2026",
      description: uz
        ? "Maktab fanlari bo'yicha tushunmagan mavzularingizni AI Ustozdan so'rang va bosqichma-bosqich izoh oling."
        : "Персональный ИИ-репетитор по всем школьным предметам с пошаговыми объяснениями.",
    };
  }

  if (pathname.startsWith("/profile")) {
    return {
      title: uz ? "O'quvchi Profili va Saqlanganlar | Audio Darsliklar 2026" : "Профиль ученика | Audio Darsliklar 2026",
      description: uz
        ? "Sinfingizni tanlang va sevimli darslik hamda audio resurslaringizni bir joyda saqlang."
        : "Укажите класс и сохраняйте любимые учебники и аудиоматериалы.",
    };
  }

  if (pathname.startsWith("/about")) {
    return {
      title: uz ? "Loyiha Haqida | Audio Darsliklar 2026" : "О проекте | Audio Darsliklar 2026",
      description: uz
        ? "Audio Darsliklar 2026 — O'zbekiston o'quvchi va o'qituvchilari uchun 100% bepul raqamli ta'lim ekotizimi."
        : "Бесплатная цифровая образовательная платформа для школьников и учителей Узбекистана.",
    };
  }

  if (pathname.startsWith("/contact")) {
    return {
      title: uz ? "Aloqa va Takliflar | Audio Darsliklar 2026" : "Контакты и Предложения | Audio Darsliklar 2026",
      description: uz
        ? "Loyiha jamoasi bilan bog'lanish, taklif va savollar yuborish sahifasi."
        : "Свяжитесь с командой проекта Audio Darsliklar 2026.",
    };
  }

  return {
    title: "Audio Darsliklar 2026",
    description: "O'zbekiston maktablari uchun bepul darsliklar, slayd darslar, testlar va o'yinlar platformasi.",
  };
}

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
  if (!el) {
    el = document.createElement(selector.startsWith("link") ? "link" : "meta");
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
}

export default function RouteSeo() {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    const seo = resolveRouteSeo(location.pathname, location.search, language);
    const canonicalUrl = `${SITE_URL}${location.pathname}`;

    document.documentElement.lang = language;
    document.title = seo.title;

    upsertMeta('meta[name="description"]', { name: "description", content: seo.description });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: seo.title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: seo.description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: SITE_IMAGE });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: seo.title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: seo.description });
    upsertMeta('link[rel="canonical"]', { rel: "canonical", href: canonicalUrl });

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": seo.schemaType || "WebPage",
      name: seo.title,
      description: seo.description,
      url: canonicalUrl,
      inLanguage: language === "uz" ? "uz-UZ" : "ru-RU",
      isAccessibleForFree: true,
      publisher: {
        "@type": "EducationalOrganization",
        name: "Audio Darsliklar 2026",
        url: SITE_URL,
      },
    };

    let script = document.getElementById("route-jsonld") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "route-jsonld";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);
  }, [location.pathname, location.search, language]);

  return null;
}
