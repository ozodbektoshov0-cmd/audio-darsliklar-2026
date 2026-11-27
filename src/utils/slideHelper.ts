import stemHeroImg from "../assets/images/slide_stem_hero_1795787180190.jpg";
import humanitiesHeroImg from "../assets/images/slide_humanities_hero_1795787180006.jpg";

export type SlideVisualTheme = "stem" | "humanities";

const STEM_SUBJECT_KEYWORDS = [
  "matematika",
  "algebra",
  "geometriya",
  "fizika",
  "kimyo",
  "biologiya",
  "informatika",
  "astronomiya",
  "geografiya",
  "математика",
  "алгебра",
  "физика",
  "химия",
  "биология",
  "информатика",
];

export function inferSlideVisualTheme(subjectName: string): SlideVisualTheme {
  const low = subjectName.toLowerCase();
  return STEM_SUBJECT_KEYWORDS.some((kw) => low.includes(kw)) ? "stem" : "humanities";
}

export function getSlideHeroImage(theme?: SlideVisualTheme, subjectName = ""): string {
  const resolved = theme || inferSlideVisualTheme(subjectName);
  return resolved === "stem" ? stemHeroImg : humanitiesHeroImg;
}
