import {
  TopicBuilder,
  fracStr,
  gcd,
  pickNumDistractors,
  pickStrDistractors,
  polyLinear,
  signedTerm,
  type QuizOutput,
} from "./core.ts";

interface TrigAngle {
  deg: number;
  rad: string;
  quadrant: string; // I, II, III, IV, or axis
  sin: string;
  cos: string;
  tg: string | null;
  ctg: string | null;
  sinVal: number;
  cosVal: number;
}

const SPECIAL_ANGLES: TrigAngle[] = [
  { deg: 0, rad: "0", quadrant: "O'qda", sin: "0", cos: "1", tg: "0", ctg: null, sinVal: 0, cosVal: 1 },
  { deg: 30, rad: "π/6", quadrant: "I", sin: "1/2", cos: "√3/2", tg: "√3/3", ctg: "√3", sinVal: 0.5, cosVal: 0.866 },
  { deg: 45, rad: "π/4", quadrant: "I", sin: "√2/2", cos: "√2/2", tg: "1", ctg: "1", sinVal: 0.707, cosVal: 0.707 },
  { deg: 60, rad: "π/3", quadrant: "I", sin: "√3/2", cos: "1/2", tg: "√3", ctg: "√3/3", sinVal: 0.866, cosVal: 0.5 },
  { deg: 90, rad: "π/2", quadrant: "O'qda", sin: "1", cos: "0", tg: null, ctg: "0", sinVal: 1, cosVal: 0 },
  { deg: 120, rad: "2π/3", quadrant: "II", sin: "√3/2", cos: "−1/2", tg: "−√3", ctg: "−√3/3", sinVal: 0.866, cosVal: -0.5 },
  { deg: 135, rad: "3π/4", quadrant: "II", sin: "√2/2", cos: "−√2/2", tg: "−1", ctg: "−1", sinVal: 0.707, cosVal: -0.707 },
  { deg: 150, rad: "5π/6", quadrant: "II", sin: "1/2", cos: "−√3/2", tg: "−√3/3", ctg: "−√3", sinVal: 0.5, cosVal: -0.866 },
  { deg: 180, rad: "π", quadrant: "O'qda", sin: "0", cos: "−1", tg: "0", ctg: null, sinVal: 0, cosVal: -1 },
  { deg: 210, rad: "7π/6", quadrant: "III", sin: "−1/2", cos: "−√3/2", tg: "√3/3", ctg: "√3", sinVal: -0.5, cosVal: -0.866 },
  { deg: 225, rad: "5π/4", quadrant: "III", sin: "−√2/2", cos: "−√2/2", tg: "1", ctg: "1", sinVal: -0.707, cosVal: -0.707 },
  { deg: 240, rad: "4π/3", quadrant: "III", sin: "−√3/2", cos: "−1/2", tg: "√3", ctg: "√3/3", sinVal: -0.866, cosVal: -0.5 },
  { deg: 270, rad: "3π/2", quadrant: "O'qda", sin: "−1", cos: "0", tg: null, ctg: "0", sinVal: -1, cosVal: 0 },
  { deg: 300, rad: "5π/3", quadrant: "IV", sin: "−√3/2", cos: "1/2", tg: "−√3", ctg: "−√3/3", sinVal: -0.866, cosVal: 0.5 },
  { deg: 315, rad: "7π/4", quadrant: "IV", sin: "−√2/2", cos: "√2/2", tg: "−1", ctg: "−1", sinVal: -0.707, cosVal: 0.707 },
  { deg: 330, rad: "11π/6", quadrant: "IV", sin: "−1/2", cos: "√3/2", tg: "−√3/3", ctg: "−√3", sinVal: -0.5, cosVal: 0.866 },
  { deg: 360, rad: "2π", quadrant: "O'qda", sin: "0", cos: "1", tg: "0", ctg: null, sinVal: 0, cosVal: 1 },
];

const TRIG_ALL_VALS = ["0", "1", "−1", "1/2", "−1/2", "√2/2", "−√2/2", "√3/2", "−√3/2", "√3", "−√3", "√3/3", "−√3/3"];

function commonTrigCards(): [string, string][] {
  return [
    ["Radian", "Yoy uzunligi radiusga teng markaziy burchak"],
    ["Sinus", "Burilgan nuqtaning ordinatasi (y koordinatasi)"],
    ["Kosinus", "Burilgan nuqtaning abssissasi (x koordinatasi)"],
    ["Tangens", "Sinusning kosinusga nisbati (sin α / cos α)"],
    ["Kotangens", "Kosinusning sinusga nisbati (cos α / sin α)"],
    ["Ayniyat", "O'zgaruvchining barcha ruxsatli qiymatlarida to'g'ri tenglik"],
    ["Birlik", "Radiusi R = 1 bo'lgan markaziy aylana"],
    ["Chorak", "Koordinata tekisligining to'rtdan bir qismi"],
    ["Davr", "Trigonometrik funksiyalar qiymati takrorlanuvchi burchak"],
    ["Keltirish", "Katta burchakni o'tkir burchak orqali ifodalash"],
  ];
}

function makeTopic13(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-13-sodda-sistemalar",
    topicTitle: "13-§. Ikkinchi darajali tenglama qatnashgan sodda sistemalar",
    title: "13-§. Ikkinchi darajali tenglama qatnashgan sodda sistemalar",
    source: "Algebra 9-sinf (2019), II bob, 13-§, 68–72-betlar",
    seed: 9013,
  });

  b.addCards([
    ["Sistema", "Birgalikda yechiladigan tenglamalar to'plami"],
    ["Yechim", "Sistemaning barcha tenglamalarini qanoatlantiruvchi (x; y) juftlik"],
    ["Viyet", "x + y = s va xy = p sistemasini yechuvchi teorema"],
    ["Almashtirish", "Bir noma'lumni ikkinchisi orqali ifodalash usuli"],
    ["Kesishish", "Grafiklarning umumiy nuqtalari soni"],
    ["Parabola", "Ikkinchi darajali funksiya grafigi"],
    ["Chiziq", "Birinchi darajali tenglama grafigi"],
    ["To'rtburchak", "Yuzi S = xy va perimetri P = 2(x+y) masala"],
    ["Simmetrik", "x va y o'rnini almashtirganda o'zgarmaydigan sistema"],
    ["Gipotenuza", "To'g'ri burchakli uchburchakda c² = a² + b²"],
    ["Juftlik", "Tenglamalar sistemasining (x; y) ko'rinishidagi yechimi"],
    ["O'rniga qo'yish", "Sodda sistemalarni yechishning asosiy usuli"],
    ["{x+y=s, xy=p}", "t² − st + p = 0 kvadrat tenglamaga keltiriladi"],
    ["Grafik usul", "Ikkita tenglama grafigi kesishish nuqtalarini topish"],
    ["Teng kuchli", "Bir xil yechimlar to'plamiga ega sistemalar"],
    ["Urinish nuqtasi", "To'g'ri chiziq va parabolaning 1 ta umumiy nuqtasi"],
    ["Chiziqli + kvadrat", "Eng ko'pi bilan 2 ta yechimga ega sistema"],
    ["S = ab", "To'g'ri to'rtburchak yuzi formulasi"],
    ["P = 2(a + b)", "To'g'ri to'rtburchak perimetri formulasi"],
    ["Katetlar", "Yuzi S = ab/2 va gipotenuzasi c bo'lgan tomonlar"],
    ["Yechimsiz", "Grafiklar kesishmasa sistema yechimi bo'sh (∅)"],
    ["Kvadrat summa", "x² + y² = (x + y)² − 2xy ayniyati"],
    ["Ayirma kvadrati", "(x − y)² = (x + y)² − 4xy"],
    ["Ikki yechim", "s² − 4p > 0 da Vieta sistemasi 2 juft yechim beradi"],
    ["Bir yechim", "s² − 4p = 0 da x = y bo'lgan yagona juftlik"],
  ]);

  b.addChoice("{x + y = s; xy = p} sistemani yechish uchun qaysi yordamchi kvadrat tenglama tuziladi?", "t² − st + p = 0", ["t² + st + p = 0", "t² − pt + s = 0", "t² + st − p = 0"], "Viyet teoremasiga ko'ra x va y sonlari t² − st + p = 0 tenglamaning ildizlaridir.");
  b.addChoice("Chiziqli tenglama va ikkinchi darajali tenglamadan iborat sistema ko'pi bilan nechta yechimga ega bo'lishi mumkin?", "2 ta", ["1 ta", "3 ta", "4 ta"], "Bir o'zgaruvchini o'rniga qo'yganda ko'pi bilan kvadrat tenglama hosil bo'ladi.");
  b.addTF("{x − y = 2; xy = 15} tenglamalar sistemasini (5; 3) juftlik qanoatlantiradi.", true, "5 − 3 = 2 va 5 · 3 = 15, demak (5; 3) sistemaning yechimi.");
  b.addTF("To'g'ri chiziq va parabola hech qachon 3 ta nuqtada kesisha olmaydi.", true, "Chiziqli va kvadrat funksiyalar tenglashtirilganda ko'pi bilan 2-darajali tenglama olinadi.");

  // 1) {x + y = s, xy = p}
  for (let a = 1; a <= 11; a++) {
    for (let c = a + 1; c <= 14; c++) {
      if (b.count >= 165) break;
      const s = a + c;
      const p = a * c;
      const m = (a + c) % 4;
      if (m === 0) {
        b.addChoice(
          `{x + y = ${s}; xy = ${p}} tenglamalar sistemasining yechimlarini toping.`,
          `(${a}; ${c}) va (${c}; ${a})`,
          [`(${a}; ${-c}) va (${-c}; ${a})`, `(${a + 1}; ${c - 1})`, `(${a}; ${c})`],
          `t² − ${s}t + ${p} = 0 ildizlari ${a} va ${c}.`,
        );
      } else if (m === 1) {
        b.addFill(
          `{x + y = ${s}; xy = ${p}} sistemaning yechimlaridan x² + y² qiymatini toping.`,
          `${a * a + c * c}`,
          `x² + y² = (x + y)² − 2xy = ${s}² − 2·${p} = ${a * a + c * c}.`,
        );
      } else if (m === 2) {
        b.addFill(
          `To'g'ri to'rtburchakning perimetri ${2 * s} sm, yuzi ${p} sm². Uning katta tomonini (sm) toping.`,
          `${c}`,
          `a + b = ${s}, ab = ${p} ⇒ tomonlar ${a} va ${c} sm. Kattasi ${c} sm.`,
        );
      } else {
        b.addTF(
          `(${a}; ${c}) juftlik {x + y = ${s}; xy = ${p}} sistemaning yechimidir.`,
          true,
          `${a} + ${c} = ${s} va ${a}·${c} = ${p}.`,
        );
      }
    }
  }

  // 2) {x - y = d, xy = p}
  for (let y = 1; y <= 10; y++) {
    for (let d = 1; d <= 9; d++) {
      if (b.count >= 255) break;
      const x = y + d;
      const p = x * y;
      if ((y + d) % 3 === 0) {
        b.addFill(
          `Ikki musbat sonning ayirmasi ${d}, ko'paytmasi ${p} ga teng. Shu sonlardan kattasini toping.`,
          `${x}`,
          `y(y + ${d}) = ${p} ⇒ y = ${y}, kattasi x = ${x}.`,
        );
      } else {
        b.addChoice(
          `{x − y = ${d}; xy = ${p}} sistemaning musbat yechimini (x; y) toping.`,
          `(${x}; ${y})`,
          [`(${y}; ${x})`, `(${x + 1}; ${y + 1})`, `(${x}; ${-y})`],
          `${x} − ${y} = ${d} va ${x} · ${y} = ${p}.`,
        );
      }
    }
  }

  // 3) {y = x^2 + c, y = kx + m} o'rniga qo'yish orqali ildizlar yig'indisi/soni
  for (let x1 = -4; x1 <= 3; x1++) {
    for (let x2 = x1 + 1; x2 <= 6; x2++) {
      if (b.count >= 340) break;
      const k = x1 + x2;
      const m = -x1 * x2;
      // x^2 = kx + m => x^2 - (x1+x2)x + x1*x2 = 0
      const lineStr = polyLinear(k, m);
      b.addChoice(
        `y = x² parabola va y = ${lineStr} to'g'ri chiziq kesishish nuqtalari abssissalarini toping.`,
        `${x1} va ${x2}`,
        [`${-x1} va ${-x2}`, `${x1} va ${x2 + 1}`, `${x1 - 1} va ${x2}`],
        `x² = ${lineStr} ⇒ x² ${signedTerm(-k, "x")} ${signedTerm(-m)} = 0 ⇒ x = ${x1}, ${x2}.`,
      );
    }
  }

  // 4) {y - kx = b, x^2 - py = q} o'rniga qo'yish (154–161-mashqlar) va perimetr/maydon
  for (let r1 = -5; r1 <= 4; r1++) {
    for (let r2 = r1 + 1; r2 <= 6; r2++) {
      for (let p = 1; p <= 3; p++) {
        if (b.count >= 340) break;
        const k = r1 + r2;
        const m = -r1 * r2;
        // x^2 - p(y) = q, y = (k/p)*x + m/p -> simmetrik y = x + d bilan: {y - x = d, x^2 + y^2 = ...}
        // Yoki: {y = px + c, x^2 - y = m} => x^2 - px - (c + m) = 0; choose x^2 - (r1+r2)x + r1*r2 = 0
        // Set y = k*x - m (so x^2 - y = 0 -> x^2 = k*x - m)
        const cTerm = -m;
        const bVal = k;
        b.addChoice(
          `{y = ${polyLinear(bVal, cTerm)}; x² − y = 0} tenglamalar sistemasining nechta haqiqiy yechimi bor?`,
          `2 ta`,
          [`1 ta`, `Yechimi yo'q`, `4 ta`],
          `x² − (${polyLinear(bVal, cTerm)}) = 0 ⇒ x = ${r1} va x = ${r2} (2 ta yechim).`,
        );
        if (b.count < 340) {
          b.addFill(
            `{x + y = ${r1 + r2 + 12}; x − y = ${r2 - r1}} sistemadan x² − y² qiymatini toping.`,
            `${(r1 + r2 + 12) * (r2 - r1)}`,
            `x² − y² = (x + y)(x − y) = ${r1 + r2 + 12}·${r2 - r1} = ${(r1 + r2 + 12) * (r2 - r1)}.`,
          );
        }
      }
    }
  }

  return b.build();
}

function makeTopic14(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-14-sistemalar-usullari",
    topicTitle: "14-§. Tenglamalar sistemasini yechishning turli usullari",
    title: "14-§. Tenglamalar sistemasini yechishning turli usullari",
    source: "Algebra 9-sinf (2019), II bob, 14-§, 72–77-betlar",
    seed: 9014,
  });

  b.addCards([
    ["Qo'shish", "Tenglamalarni hadlab qo'shish yoki ayirish usuli"],
    ["Almashtirish", "u = x + y va v = xy yangi o'zgaruvchilar kiritish"],
    ["Ko'paytuvchilar", "Tenglamaning bir tomonini nolga teng ko'paytma qilish"],
    ["Simmetriya", "x va y almashsa ham ko'rinishi saqlanuvchi sistema"],
    ["Gipotenuza", "To'g'ri burchakli uchburchakning eng katta tomoni"],
    ["Katet", "To'g'ri burchak hosil qiluvchi tomonlar"],
    ["Aylana", "x² + y² = R² ko'rinishidagi tenglama grafigi"],
    ["Pifagor", "a² + b² = c² teoremasi"],
    ["Harakat", "v = s/t bog'lanishli matnli masalalar"],
    ["Hamkorlik", "Birgalikda ish bajarish unumdorlik masalalari"],
    ["x² + y² = a", "Markazi (0; 0), radiusi √a bo'lgan aylana"],
    ["x² − y² = (x−y)(x+y)", "Sistemani soddalashtirish usuli"],
    ["(x+y)² = x²+2xy+y²", "Simmetrik sistemalarda asosiy ayniyat"],
    ["(x−y)² = x²−2xy+y²", "Ayirmani kvadrat orqali topish"],
    ["4 ta yechim", "Ikki ikkinchi darajali tenglama sistemasida max yechimlar"],
    ["Ish unumdorligi", "1/t₁ + 1/t₂ = 1/T formula"],
    ["O'rtacha tezlik", "Daryo oqimi bo'ylab v+u va qarshi v−u"],
    ["Diagonal", "To'g'ri to'rtburchakda d² = a² + b²"],
    ["Ikki xonali son", "10a + b ko'rinishida yozilishi"],
    ["Raqamlar yig'indisi", "a + b tenglama sharti"],
    ["To'la kvadrat", "x² + 2xy + y² ni (x + y)² ga yig'ish"],
    ["Nolinchi ko'paytma", "(x − a)(y − b) = 0 bo'lishi"],
    ["Radius", "x² + y² = R² tenglamadagi R soni"],
    ["Kvadratlar yig'indisi", "x² + y² qiymati har doim ≥ 0"],
  ]);

  b.addChoice("x² + y² = R² tenglamaning koordinata tekisligidagi grafigi nima?", "Markazi (0; 0), radiusi R bo'lgan aylana", ["Parabola", "Giperbola", "To'g'ri chiziq"], "x² + y² = R² — markazi koordinata boshida, radiusi R ga teng aylana tenglamasi.");
  b.addChoice("{x + y = a; x² + y² = b} simmetrik sistemani yechishda xy ni qaysi ayniyat orqali topish qulay?", "xy = ((x + y)² − (x² + y²)) / 2", ["xy = (x + y)² + x² + y²", "xy = a − b", "xy = √(a·b)"], "(x + y)² = x² + y² + 2xy ayniyatidan 2xy = a² − b kelib chiqadi.");
  b.addTF("Ikki ikkinchi darajali tenglama sistemasi 4 tagacha yechimga ega bo'lishi mumkin.", true, "Masalan, aylana va giperbola 4 nuqtada kesishishi mumkin.");
  b.addTF("x² − y² = 12 va x − y = 3 sistemadan x + y = 9 kelib chiqadi.", false, "(x − y)(x + y) = 12 dan x + y = 12 / 3 = 4 bo'ladi.");

  // 1) {x^2 - y^2 = diff, x - y = d} => x + y = diff/d
  for (let x = 3; x <= 14; x++) {
    for (let y = 1; y < x; y++) {
      if (b.count >= 135) break;
      const d = x - y;
      const s = x + y;
      const diffSq = d * s;
      const mode = (x + y) % 3;
      if (mode === 0) {
        b.addChoice(
          `{x² − y² = ${diffSq}; x − y = ${d}} sistemani yechib (x; y) juftlikni toping.`,
          `(${x}; ${y})`,
          [`(${y}; ${x})`, `(${x + 1}; ${y})`, `(${x}; ${y + 1})`],
          `x + y = ${diffSq}/${d} = ${s} va x − y = ${d} ⇒ x = ${x}, y = ${y}.`,
        );
      } else if (mode === 1) {
        b.addFill(
          `{x² − y² = ${diffSq}; x + y = ${s}} sistemadan x − y qiymatini toping.`,
          `${d}`,
          `(x − y)(x + y) = ${diffSq} ⇒ x − y = ${diffSq} / ${s} = ${d}.`,
        );
      } else {
        b.addTF(
          `{x² + y² = ${x * x + y * y}; x − y = ${d}} sistemani (${x}; ${y}) juftlik qanoatlantiradi.`,
          true,
          `${x}² + ${y}² = ${x * x + y * y} va ${x} − ${y} = ${d}.`,
        );
      }
    }
  }

  // 2) {x^2 + y^2 = c2, xy = p} — x + y, |x - y| va Pifagor masalalari
  const triples: [number, number, number][] = [
    [3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15],
    [7, 24, 25], [12, 16, 20], [10, 24, 26], [15, 20, 25], [9, 40, 41],
  ];
  for (const [k1, k2, h] of triples) {
    const c2 = h * h;
    const p = k1 * k2;
    b.addFill(
      `To'g'ri burchakli uchburchakning gipotenuzasi ${h} sm, katetlari yig'indisi ${k1 + k2} sm. Uning yuzini (sm²) toping.`,
      `${p / 2}`,
      `a² + b² = ${c2}, a + b = ${k1 + k2} ⇒ katetlar ${k1} va ${k2}. S = ${k1}·${k2}/2 = ${p / 2}.`,
    );
    b.addChoice(
      `To'g'ri to'rtburchakning diagonali ${h} sm, yuzi ${p} sm². Uning perimetri necha sm?`,
      `${2 * (k1 + k2)}`,
      pickNumDistractors(2 * (k1 + k2), [k1 + k2, 2 * h, 2 * (k1 + k2) + 4]),
      `(a + b)² = a² + b² + 2ab = ${c2} + ${2 * p} = ${(k1 + k2) ** 2} ⇒ P = 2(${k1 + k2}) = ${2 * (k1 + k2)}.`,
    );
  }

  // 3) Qo'shish va almashtirish usullari: {x^2 + y = A, x^2 - y = B}
  for (let x = 2; x <= 11; x++) {
    for (let y = -5; y <= 10; y++) {
      if (b.count >= 270) break;
      const a = x * x + y;
      const c = x * x - y;
      if ((x + Math.abs(y)) % 2 === 0) {
        b.addFill(
          `{x² + y = ${a}; x² − y = ${c}} sistemadan y ning qiymatini toping.`,
          `${y}`,
          `Ayirsak 2y = ${a} − (${c}) = ${2 * y} ⇒ y = ${y}.`,
        );
      } else {
        b.addChoice(
          `{x² + y = ${a}; x² − y = ${c}} sistemaning musbat x li yechimini toping.`,
          `(${x}; ${y})`,
          [`(${-x}; ${y})`, `(${x}; ${-y})`, `(${x + 1}; ${y})`],
          `Qo'shsak 2x² = ${2 * x * x} ⇒ x = ±${x}; musbat x = ${x}, y = ${y}.`,
        );
      }
    }
  }

  // 4) Ikki xonali son va harakat/ish masalalari
  for (let a = 1; a <= 8; a++) {
    for (let d = 1; d <= 9; d++) {
      if (b.count >= 340) break;
      if (a + d > 9) continue;
      const c = a + d;
      const num = 10 * a + c;
      const prod = a * c;
      b.addChoice(
        `Ikki xonali sonning o'nliklar raqami birliklaridan ${d} ta kam, raqamlari ko'paytmasi esa ${prod} ga teng. Shu sonni toping.`,
        `${num}`,
        pickNumDistractors(num, [10 * c + a, num + 11, num - 9]),
        `${a} · ${c} = ${prod} va ${c} − ${a} = ${d}, demak son ${num}.`,
      );
    }
  }

  // 5) {x^3 - y^3 = ..., x - y = ...} va {1/x + 1/y = ..., x + y = ...} (165–175-mashqlar)
  for (let x = 2; x <= 10; x++) {
    for (let y = 1; y < x; y++) {
      if (b.count >= 340) break;
      const diffCube = x * x * x - y * y * y;
      const d = x - y;
      const xy = x * y;
      b.addChoice(
        `{x³ − y³ = ${diffCube}; x − y = ${d}} sistemadan xy ko'paytmani toping.`,
        `${xy}`,
        pickNumDistractors(xy, [xy + 1, x + y, diffCube / d]),
        `(x − y)² + 3xy = ${diffCube}/${d} = ${diffCube / d} ⇒ 3xy = ${diffCube / d - d * d} ⇒ xy = ${xy}.`,
      );
      if (b.count < 340) {
        const invSum = fracStr(x + y, xy);
        b.addTF(
          `{1/x + 1/y = ${invSum}; xy = ${xy}} sistemani (${x}; ${y}) juftlik qanoatlantiradi.`,
          true,
          `1/${x} + 1/${y} = ${invSum} va ${x}·${y} = ${xy}.`,
        );
      }
    }
  }

  return b.build();
}

function makeTopic15(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-15-tengsizliklar-sistemasi",
    topicTitle: "15-§. Ikkinchi darajali bir noma'lumli tengsizliklar sistemalari",
    title: "15-§. Ikkinchi darajali bir noma'lumli tengsizliklar sistemalari",
    source: "Algebra 9-sinf (2019), II bob, 15-§, 77–80-betlar",
    seed: 9015,
  });

  b.addCards([
    ["Kesishma", "Ikkita yechim to'plamining umumiy qismi (∩)"],
    ["Sistema", "Bir vaqtda bajarilishi shart bo'lgan tengsizliklar"],
    ["Oraliq", "Sonlar o'qidagi [a; b] yoki (a; b) to'plam"],
    ["Qo'sh", "a < f(x) < b ko'rinishidagi ikki tomonlama tengsizlik"],
    ["Ildizlar", "Ikki tengsizlik yechimlarini belgilovchi nuqtalar"],
    ["Bo'sh", "Umumiy yechim bo'lmagan holat (∅)"],
    ["Shtrixlash", "Son o'qida yechimlarni ustma-ust belgilash"],
    ["Butun", "Kesishma sohasidagi Z sonlar"],
    ["Aniqlanish", "√f(x) + √g(x) ifodada ikki shart sistemasi"],
    ["Modul", "|f(x)| < a ning qo'sh tengsizlikka o'tishi"],
    ["{x²≤a², x≥0}", "Umumiy yechimi [0; a] kesma"],
    ["{x²≥a², x≤b}", "Ikki shartning umumiy sohasi"],
    ["Chiziqli + kvadrat", "Eng ko'p uchraydigan tengsizliklar sistemasi"],
    ["Eng katta butun", "Kesishmadagi maksimal Z qiymat"],
    ["Eng kichik butun", "Kesishmadagi minimal Z qiymat"],
    ["Qat'iy shart", "Ochiq chetki nuqtalar bilan olinadi"],
    ["Noqat'iy shart", "Chetki nuqtalar ham yechimga kiradi"],
    ["f(x) > a", "Qo'sh tengsizlikning chap qismi"],
    ["f(x) < b", "Qo'sh tengsizlikning o'ng qismi"],
    ["To'plamlar kesishmasi", "Ikkala shtrix ham ustiga tushgan qism"],
    ["x ∈ ∅", "Tengsizliklar bir-biriga zid bo'lganda"],
    ["Kvadrat uchhad", "Sistemada parabola va nur kesishmasi"],
    ["O'ng nur", "[a; +∞) yoki (a; +∞) oraliq"],
    ["Chap nur", "(−∞; b] yoki (−∞; b) oraliq"],
  ]);

  b.addChoice("Ikkinchi darajali bir noma'lumli tengsizliklar sistemasining yechimi qanday topiladi?", "Har bir tengsizlik alohida yechilib, ularning kesishmasi olinadi", ["Yechimlar birlashtiriladi", "Tengsizliklar hadlab qo'shiladi", "Faqat birinchi tengsizlik yechiladi"], "Sistema yechimi barcha tengsizliklarni bir vaqtda qanoatlantiruvchi x lar, ya'ni yechimlar kesishmasidir.");
  b.addTF("{x² ≤ 9; x > 1} tengsizliklar sistemasining yechimi (1; 3] yarim intervaldir.", true, "[−3; 3] ∩ (1; +∞) = (1; 3].");
  b.addTF("{x² < 4; x > 5} tengsizliklar sistemasining cheksiz ko'p yechimi bor.", false, "(−2; 2) va (5; +∞) kesishmaydi, yechim ∅.");

  // 1) {x^2 <= R^2 (or <), x >= a (or >)}
  for (let r = 2; r <= 12; r++) {
    for (let a = -r + 1; a < r; a++) {
      if (b.count >= 165) break;
      const r2 = r * r;
      const m = (r + Math.abs(a)) % 4;
      if (m === 0) {
        b.addChoice(
          `{x² ≤ ${r2}; x ≥ ${a}} tengsizliklar sistemasining yechimini toping.`,
          `[${a}; ${r}]`,
          [`[−${r}; ${a}]`, `(${a}; ${r})`, `[−${r}; ${r}]`],
          `[−${r}; ${r}] ∩ [${a}; +∞) = [${a}; ${r}].`,
        );
      } else if (m === 1) {
        const cnt = r - a;
        b.addFill(
          `{x² ≤ ${r2}; x > ${a}} sistemaning nechta butun yechimi bor?`,
          `${cnt}`,
          `(${a}; ${r}] yarim intervalda ${a + 1} dan ${r} gacha ${cnt} ta butun son bor.`,
        );
      } else if (m === 2) {
        b.addChoice(
          `{x² < ${r2}; x ≤ ${a}} sistemaning yechimi qaysi?`,
          `(−${r}; ${a}]`,
          [`[−${r}; ${a}]`, `(${a}; ${r})`, `(−${r}; ${a})`],
          `(−${r}; ${r}) ∩ (−∞; ${a}] = (−${r}; ${a}].`,
        );
      } else {
        b.addTF(
          `{x² < ${r2}; x > ${r + 1}} sistemaning yechimi bo'sh to'plam (∅).`,
          true,
          `(−${r}; ${r}) va (${r + 1}; +∞) kesishmaydi.`,
        );
      }
    }
  }

  // 2) {(x - r1)(x - r2) <= 0, x^2 >= k^2} yoki qo'sh tengsizlik
  for (let a = 1; a <= 8; a++) {
    for (let c = a + 2; c <= a + 9; c++) {
      if (b.count >= 255) break;
      const a2 = a * a;
      const c2 = c * c;
      b.addChoice(
        `${a2} ≤ x² < ${c2} qo'sh tengsizlikning musbat yechimlar oralig'ini toping.`,
        `[${a}; ${c})`,
        [`(${a}; ${c}]`, `[${a}; ${c}]`, `[${a2}; ${c2})`],
        `x > 0 uchun ${a} ≤ x < ${c}, ya'ni [${a}; ${c}).`,
      );
      if (b.count < 255) {
        b.addFill(
          `${a2} < x² ≤ ${c2} qo'sh tengsizlikning nechta butun yechimi bor?`,
          `${2 * (c - a)}`,
          `Musbat yechimlar (${a}; ${c}] da ${c - a} ta, manfiy [−${c}; −${a}) da ${c - a} ta: jami ${2 * (c - a)} ta.`,
        );
      }
    }
  }

  // 3) Aniqlanish sohasi sistemasi √(x - a) + √(b - x) va x^2 - bx + c <= 0
  for (let r1 = -5; r1 <= 4; r1++) {
    for (let r2 = r1 + 2; r2 <= 8; r2++) {
      if (b.count >= 340) break;
      const mid = r1 + 1;
      b.addChoice(
        `{(x − ${r1})(x − ${r2}) ≤ 0; x ≥ ${mid}} sistemaning yechimini toping.`,
        `[${mid}; ${r2}]`,
        [`[${r1}; ${mid}]`, `[${r1}; ${r2}]`, `(${mid}; ${r2})`],
        `[${r1}; ${r2}] ∩ [${mid}; +∞) = [${mid}; ${r2}].`,
      );
    }
  }

  // 4) Modul va kvadrat qo'sh tengsizliklar (177-mashq): |x^2 - k| < m
  for (let bVal = 2; bVal <= 12; bVal++) {
    for (let r = 1; r <= 5; r++) {
      if (b.count >= 340) break;
      const hi = bVal + r;
      const lo = Math.max(1, bVal - r);
      b.addChoice(
        `{x² ≥ ${lo * lo}; x < ${hi}} tengsizliklar sistemasini x > 0 uchun yeching.`,
        `[${lo}; ${hi})`,
        [`(${lo}; ${hi}]`, `[${lo}; ${hi}]`, `(0; ${lo}]`],
        `x > 0 da x ≥ ${lo} va x < ${hi} ⇒ [${lo}; ${hi}).`,
      );
    }
  }

  return b.build();
}

function makeTopic16(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-16-tengsizlik-isbotlash",
    topicTitle: "16-§. Sodda tengsizliklarni isbotlash",
    title: "16-§. Sodda tengsizliklarni isbotlash (II bob yakuni)",
    source: "Algebra 9-sinf (2019), II bob, 16-§, 80–92-betlar",
    seed: 9016,
  });

  b.addCards([
    ["Ayirma", "a ≥ b ni isbotlash uchun a − b ≥ 0 ni ko'rsatish"],
    ["Koshi", "Nomanfiy sonlarning o'rta arifmetigi ≥ o'rta geometrigi"],
    ["Arifmetik", "Ikki son uchun (a + b) / 2"],
    ["Geometrik", "Ikki nomanfiy son uchun √(ab)"],
    ["Kvadrat", "Har qanday haqiqiy x uchun x² ≥ 0 xossasi"],
    ["To'la", "(a − b)² ≥ 0 ayniyatiga keltirib isbotlash"],
    ["O'zaro teskari", "a > 0 uchun a + 1/a ≥ 2 tengsizligi"],
    ["Ekstremal", "a = b bo'lganda Koshi tengsizligi tenglikka aylanadi"],
    ["Ogyusten Koshi", "Mashhur fransuz matematigi (1789–1857)"],
    ["II bob yakuni", "Sistemalar va tengsizliklarni isbotlash"],
    ["a² + b² ≥ 2ab", "Kvadratlar yig'indisi haqidagi asosiy tengsizlik"],
    ["a/b + b/a ≥ 2", "Bir xil ishorali a, b ≠ 0 lar uchun o'rinli"],
    ["x² + px + q > 0", "To'la kvadrat ajratib isbotlanadigan tengsizlik"],
    ["(a+b)/2 ≥ √(ab)", "O'rta arifmetik va o'rta geometrik munosabati"],
    ["Tenglik holi", "Koshi tengsizligida faqat a = b da tenglik bo'ladi"],
    ["(a+b)(1/a+1/b) ≥ 4", "Musbat a, b lar uchun o'rinli tengsizlik"],
    ["a² + 1 ≥ 2a", "Har qanday a ∈ R uchun (a − 1)² ≥ 0 dan keladi"],
    ["Nomanfiy", "a ≥ 0 va b ≥ 0 shartli sonlar"],
    ["Isbotlash usuli", "Chapdan o'ngni ayirib ishorasini aniqlash"],
    ["a² + b² + c² ≥ ab+bc+ac", "Uchta son uchun mashhur tengsizlik"],
    ["x + 1/x ≤ −2", "Manfiy x < 0 lar uchun bajariladi"],
    ["II bob test", "Sistemalar va isbotlash bo'yicha nazorat"],
    ["Kvadrat ildiz", "√(ab) ning mavjudlik sharti ab ≥ 0"],
    ["Minimal yig'indi", "ab = P da a + b eng kichik qiymati 2√P"],
  ]);

  b.addChoice("Ikki nomanfiy a va b sonlar uchun Koshi tengsizligi qanday yoziladi?", "(a + b)/2 ≥ √(ab)", ["(a + b)/2 ≤ √(ab)", "a + b ≥ ab", "(a² + b²)/2 ≤ ab"], "O'rta arifmetik (a+b)/2 o'rta geometrik √(ab) dan kichik emas.");
  b.addChoice("Koshi tengsizligi (a + b)/2 ≥ √(ab) da qachon aniq tenglik o'rinli bo'ladi?", "a = b bo'lganda", ["a = −b bo'lganda", "a = 0 bo'lganda", "a > b bo'lganda"], "((a+b)/2 − √(ab)) = (√a − √b)²/2 = 0 ⇔ a = b.");
  b.addChoice("Har qanday musbat a > 0 son uchun a + 1/a ifodaning eng kichik qiymati nechaga teng?", "2", ["1", "0", "4"], "Koshi tengsizligiga ko'ra a + 1/a ≥ 2√(a·(1/a)) = 2 (a = 1 da erishiladi).");
  b.addTF("a² + b² ≥ 2ab tengsizlik har qanday haqiqiy a va b sonlar uchun o'rinli.", true, "a² − 2ab + b² = (a − b)² ≥ 0.");
  b.addTF("Manfiy x < 0 son uchun x + 1/x ≥ 2 tengsizlik o'rinlidir.", false, "x < 0 bo'lganda x + 1/x ≤ −2 bo'ladi.");

  // 1) To'la kvadrat ajratib min qiymat topish: x^2 + 2kx + m = (x + k)^2 + (m - k^2)
  for (let k = -9; k <= 9; k++) {
    for (let minV = 1; minV <= 10; minV++) {
      if (b.count >= 165) break;
      if (k === 0) continue;
      const bb = 2 * k;
      const c = k * k + minV;
      const expr = `x² ${signedTerm(bb, "x")} + ${c}`;
      if ((Math.abs(k) + minV) % 3 === 0) {
        b.addFill(
          `${expr} ifodaning barcha x ∈ R larda qabul qiladigan eng kichik qiymatini toping.`,
          `${minV}`,
          `${expr} = (x ${signedTerm(k)})² + ${minV} ≥ ${minV}.`,
        );
      } else if ((Math.abs(k) + minV) % 3 === 1) {
        b.addTF(
          `${expr} > 0 tengsizlik barcha haqiqiy x lar uchun o'rinli.`,
          true,
          `(x ${signedTerm(k)})² + ${minV} ≥ ${minV} > 0.`,
        );
      } else {
        b.addChoice(
          `${expr} ifoda nechaga teng yoki undan katta bo'ladi (barcha x ∈ R uchun)?`,
          `${minV}`,
          pickNumDistractors(minV, [0, minV + 1, c]),
          `To'la kvadrat ajratsak (x ${signedTerm(k)})² + ${minV} ≥ ${minV}.`,
        );
      }
    }
  }

  // 2) Koshi tengsizligi sonli va parametrli: k*x + m/x >= 2√(km)
  for (let p = 1; p <= 12; p++) {
    for (let k = 1; k <= 7; k++) {
      if (b.count >= 255) break;
      const prod = k * k * p * p; // sqrt(prod) = k*p
      const minSum = 2 * k * p;
      b.addChoice(
        `x > 0 bo'lganda ${k}x + ${prod / k === Math.floor(prod / k) ? prod : k}/x (to'g'risi: ${k}x + ${k * p * p}/x) ifodaning eng kichik qiymatini toping.`.replace(`${k}x + ${prod / k === Math.floor(prod / k) ? prod : k}/x (to'g'risi: `, "").replace(") ifodaning", " ifodaning"),
        `${minSum}`,
        pickNumDistractors(minSum, [k * p, minSum + 2, k]),
        `Koshi bo'yicha ${k}x + ${k * p * p}/x ≥ 2√(${k * k * p * p}) = ${minSum}.`,
      );
      if (b.count < 255) {
        b.addFill(
          `x > 0 da ${k}x + ${k * p * p}/x ifoda qaysi x qiymatida eng kichik qiymatga erishadi?`,
          `${p}`,
          `${k}x = ${k * p * p}/x ⇒ x² = ${p * p} ⇒ x = ${p}.`,
        );
      }
    }
  }

  // 3) O'rta arifmetik >= o'rta geometrik aniq juftliklar (a, b)
  for (let m = 1; m <= 9; m++) {
    for (let n = m + 1; n <= 12; n++) {
      if (b.count >= 340) break;
      const a = m * m;
      const c = n * n;
      const arith = fracStr(a + c, 2);
      const geom = m * n;
      b.addChoice(
        `${a} va ${c} sonlarining o'rta arifmetigi va o'rta geometrigi mos ravishda nechaga teng?`,
        `${arith} va ${geom}`,
        [`${geom} va ${arith}`, `${a + c} va ${geom}`, `${arith} va ${geom + 1}`],
        `O'rta arifmetik (${a}+${c})/2 = ${arith}, o'rta geometrik √(${a}·${c}) = ${m}·${n} = ${geom}.`,
      );
    }
  }

  // 4) (a+b)(1/a+1/b) >= 4, tarozi masalasi va II bob sinov testlari (80–92-betlar)
  for (let k = 2; k <= 35; k++) {
    if (b.count >= 340) break;
    b.addFill(
      `a > 0 va b > 0 sonlar uchun (${k}a + ${k}b)(1/a + 1/b) ifodaning eng kichik qiymatini toping.`,
      `${4 * k}`,
      `${k}(a+b)(1/a+1/b) = ${k}(2 + a/b + b/a) ≥ ${k}·4 = ${4 * k}.`,
    );
    if (b.count < 340) {
      b.addTF(
        `Har qanday haqiqiy x uchun (x + ${k})² ≥ ${4 * k}x tengsizlik o'rinli.`,
        true,
        `(x + ${k})² − ${4 * k}x = (x − ${k})² ≥ 0.`,
      );
    }
  }

  return b.build();
}

function makeTopic17(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-17-radian-olchovi",
    topicTitle: "17-§. Burchakning radian o'lchovi",
    title: "17-§. Burchakning radian o'lchovi",
    source: "Algebra 9-sinf (2019), III bob, 17-§, 93–97-betlar",
    seed: 9017,
  });

  b.addCards([
    ...commonTrigCards(),
    ["Gradus", "To'liq aylananing 1/360 qismi"],
    ["Sektor", "Ikki radius va yoy bilan chegaralangan doira bo'lagi"],
    ["Yoy", "l = α·R formula bilan topiladigan aylana qismi"],
    ["1 radian", "Taxminan 57°18' (57,3°) ga teng burchak"],
    ["π radian", "180° yoyiq burchakka teng"],
    ["2π radian", "360° to'liq aylanish burchagi"],
    ["π/2 radian", "90° to'g'ri burchak"],
    ["π/3 radian", "60° burchakning radian o'lchovi"],
    ["π/4 radian", "45° burchakning radian o'lchovi"],
    ["π/6 radian", "30° burchakning radian o'lchovi"],
    ["Gradusdan radianga", "α_rad = α° · π / 180°"],
    ["Radiandan gradusga", "α° = α_rad · 180° / π"],
    ["Sektor yuzi", "S = α·R² / 2 (α radianda)"],
    ["Yoy uzunligi", "l = α·R (α radianda)"],
  ]);

  b.addChoice("1 radian taxminan necha gradusga teng?", "57°18'", ["45°", "60°", "90°"], "180° / π ≈ 57,2958° ≈ 57°18'.");
  b.addChoice("π radian necha gradusga teng?", "180°", ["90°", "360°", "270°"], "Yoyiq burchak 180° = π radian.");
  b.addChoice("Markaziy burchagi α (radianda), radiusi R bo'lgan aylana yoyi uzunligi qaysi formula bilan topiladi?", "l = α·R", ["l = α/R", "l = α·R²/2", "l = 2πR/α"], "Yoy uzunligi l = α·R.");
  b.addChoice("Radiusi R va markaziy burchagi α (radianda) bo'lgan doira sektori yuzi formulasi qaysi?", "S = α·R² / 2", ["S = α·R", "S = 2α·R²", "S = πR²/α"], "Doira sektori yuzi S = ½·α·R².");
  b.addTF("180° li burchakning radian o'lchovi π ga teng.", true, "π rad = 180°.");
  b.addTF("3π/2 radian 135° ga teng.", false, "3·180°/2 = 270°.");

  // 1) Gradus -> Radian va Radian -> Gradus (barcha 15° karralari 15..720)
  for (let k = 1; k <= 48; k++) {
    const deg = k * 15;
    const g = gcd(deg, 180);
    const num = deg / g;
    const den = 180 / g;
    const rad = den === 1 ? (num === 1 ? "π" : `${num}π`) : num === 1 ? `π/${den}` : `${num}π/${den}`;
    if (k % 3 === 0) {
      b.addChoice(
        `${deg}° burchakning radian o'lchovini toping.`,
        rad,
        pickStrDistractors(rad, [`${num + 1}π/${den}`, `π/${den + 1}`, `${fracStr(deg, 360)}π`, `${deg}π`]),
        `${deg}° · π / 180° = ${rad}.`,
      );
    } else if (k % 3 === 1) {
      b.addChoice(
        `${rad} radian necha gradusga teng?`,
        `${deg}°`,
        [`${deg + 15}°`, `${Math.max(5, deg - 15)}°`, `${deg * 2}°`],
        `${rad} · 180° / π = ${deg}°.`,
      );
    } else {
      b.addFill(
        `${rad} radian necha gradus bo'lishini son bilan yozing (belgisiz).`,
        `${deg}`,
        `${rad} = ${deg}°.`,
      );
    }
  }

  // 2) Yoy uzunligi l = alpha * R va sektor yuzi S = alpha * R^2 / 2
  const rands = [
    { rad: "π/6", kNum: 1, kDen: 6 },
    { rad: "π/4", kNum: 1, kDen: 4 },
    { rad: "π/3", kNum: 1, kDen: 3 },
    { rad: "π/2", kNum: 1, kDen: 2 },
    { rad: "2π/3", kNum: 2, kDen: 3 },
    { rad: "3π/4", kNum: 3, kDen: 4 },
    { rad: "5π/6", kNum: 5, kDen: 6 },
    { rad: "π", kNum: 1, kDen: 1 },
  ];
  for (const ang of rands) {
    for (let r = 2; r <= 18; r++) {
      if (b.count >= 285) break;
      const lCoeff = fracStr(ang.kNum * r, ang.kDen);
      const lStr = lCoeff === "1" ? "π" : `${lCoeff}π`;
      b.addChoice(
        `Radiusi R = ${r} sm, markaziy burchagi α = ${ang.rad} bo'lgan yoy uzunligini toping.`,
        `${lStr} sm`,
        [`${r}π sm`, `${fracStr(ang.kNum * r, ang.kDen + 1)}π sm`, `${ang.kNum * r}π sm`],
        `l = α·R = ${ang.rad} · ${r} = ${lStr} sm.`,
      );
      if (b.count < 285 && (ang.kNum * r * r) % (2 * ang.kDen) === 0) {
        const sCoeff = (ang.kNum * r * r) / (2 * ang.kDen);
        b.addChoice(
          `Radiusi ${r} sm va markaziy burchagi ${ang.rad} bo'lgan doira sektori yuzi nechaga teng?`,
          `${sCoeff}π sm²`,
          [`${sCoeff * 2}π sm²`, `${sCoeff + 1}π sm²`, `${r}π sm²`],
          `S = α·R²/2 = (${ang.rad} · ${r}²) / 2 = ${sCoeff}π sm².`,
        );
      }
    }
  }

  // 3) Yoy uzunligi sonli (alpha rad = m, R = n)
  for (let alpha = 2; alpha <= 6; alpha++) {
    for (let r = 3; r <= 16; r++) {
      if (b.count >= 340) break;
      const len = alpha * r;
      b.addFill(
        `Radiusi ${r} sm va markaziy burchagi ${alpha} radian bo'lgan aylana yoyi uzunligini (sm) toping.`,
        `${len}`,
        `l = α·R = ${alpha} · ${r} = ${len} sm.`,
      );
    }
  }

  // 4) Manfiy burchaklar, ko'pburchak burchaklari (217-mashq) va soat mili
  for (let k = 1; k <= 40; k++) {
    if (b.count >= 340) break;
    const deg = -k * 15;
    const g = gcd(Math.abs(deg), 180);
    const num = Math.abs(deg) / g;
    const den = 180 / g;
    const rad = den === 1 ? (num === 1 ? "−π" : `−${num}π`) : num === 1 ? `−π/${den}` : `−${num}π/${den}`;
    b.addChoice(
      `${deg}° manfiy burchakning radian o'lchovini toping.`,
      rad,
      pickStrDistractors(rad, [rad.slice(1), `−${num + 1}π/${den}`, `−π/${den + 1}`]),
      `${deg}° · π / 180° = ${rad}.`,
    );
    if (b.count < 340) {
      b.addTF(
        `${rad} radian ${deg}° burchakka teng.`,
        true,
        `(${rad}) · 180°/π = ${deg}°.`,
      );
    }
  }

  // Muntazam n-burchak ichki va tashqi burchaklari radianda
  for (const n of [3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36]) {
    if (b.count >= 340) break;
    const extFrac = fracStr(2, n);
    const extRad = extFrac === "1" ? "π" : `${extFrac}π`;
    const intNum = n - 2;
    const g = gcd(intNum, n);
    const inStr = n / g === 1 ? "π" : intNum / g === 1 ? `π/${n / g}` : `${intNum / g}π/${n / g}`;
    b.addChoice(
      `Muntazam ${n}-burchakning ichki burchagi necha radian?`,
      inStr,
      pickStrDistractors(inStr, [extRad, `π/${n}`, `${intNum}π`]),
      `Ichki burchak (n − 2)π/n = (${n} − 2)π/${n} = ${inStr}.`,
    );
    if (b.count < 340) {
      b.addChoice(
        `Muntazam ${n}-burchakning tashqi burchagi radian o'lchovida nimaga teng?`,
        extRad,
        pickStrDistractors(extRad, [inStr, `π/${n}`, `${n}π`]),
        `Tashqi burchak 2π / ${n} = ${extRad}.`,
      );
    }
  }

  // Soat daqiqa mili necha minutda necha radian buriladi
  for (let mins = 5; mins <= 55; mins += 5) {
    if (b.count >= 340) break;
    const rCoeff = fracStr(mins, 30);
    const rStr = rCoeff === "1" ? "π" : `${rCoeff}π`;
    b.addChoice(
      `Soatning minut mili ${mins} minut davomida necha radian burchakka buriladi?`,
      rStr,
      pickStrDistractors(rStr, [`${fracStr(mins, 60)}π`, `${fracStr(mins, 15)}π`, `2π`]),
      `60 minutda 2π rad ⇒ ${mins} minutda 2π·${mins}/60 = ${rStr}.`,
    );
  }

  // 10 gradusli burchaklar va teskari R = l/alpha masalalari
  for (let k = 1; k <= 25; k++) {
    if (b.count >= 340) break;
    const deg = k * 10;
    if (deg % 30 === 0) continue;
    const c = fracStr(deg, 180);
    const rad = c === "1" ? "π" : `${c.replace("/1", "")}π`.replace(/^(\d+)\/(\d+)π$/, "$1π/$2");
    b.addChoice(
      `${deg}° burchakni radianlarda ifodalang.`,
      rad,
      pickStrDistractors(rad, [`π/${k + 2}`, `${deg}π`, `π/18`]),
      `${deg}° · π / 180° = ${rad}.`,
    );
    if (b.count < 340) {
      b.addFill(
        `Yoy uzunligi l = ${k * 6} sm, markaziy burchagi ${k} radian bo'lgan aylana radiusini (sm) toping.`,
        `6`,
        `R = l / α = ${k * 6} / ${k} = 6 sm.`,
      );
    }
  }

  return b.build();
}

function makeTopic18(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-18-nuqtani-burish",
    topicTitle: "18-§. Nuqtani koordinatalar boshi atrofida burish",
    title: "18-§. Nuqtani koordinatalar boshi atrofida burish",
    source: "Algebra 9-sinf (2019), III bob, 18-§, 97–103-betlar",
    seed: 9018,
  });

  b.addCards([
    ...commonTrigCards(),
    ["Musbat", "Soat strelkasiga qarshi yo'nalishda burish"],
    ["Manfiy", "Soat strelkasi bo'ylab yo'nalishda burish"],
    ["Aylanma", "α + 2πk burchaklar bitta nuqtaga tushishi"],
    ["Boshlang'ich", "Birlik aylanadagi P(1; 0) nuqta"],
    ["P(1; 0)", "0 radian burilish nuqtasi"],
    ["(0; 1)", "π/2 (90°) burilish nuqtasi"],
    ["(−1; 0)", "π (180°) burilish nuqtasi"],
    ["(0; −1)", "3π/2 (−π/2) burilish nuqtasi"],
    ["I chorak", "0 < α < π/2 burchaklar sohasi (x>0, y>0)"],
    ["II chorak", "π/2 < α < π burchaklar sohasi (x<0, y>0)"],
    ["III chorak", "π < α < 3π/2 burchaklar sohasi (x<0, y<0)"],
    ["IV chorak", "3π/2 < α < 2π burchaklar sohasi (x>0, y<0)"],
    ["2πk davr", "Har to'liq aylanishdan keyin nuqta ustiga tushadi"],
    ["α + 360°k", "Gradusdagi bir xil nuqtaga tushish formulasi"],
  ]);

  b.addChoice("Birlik aylanada P(1; 0) nuqtani musbat yo'nalishda burish qaysi tomonga bo'ladi?", "Soat strelkasiga qarshi", ["Soat strelkasi bo'ylab", "Faqat pastga", "O'q bo'ylab to'g'ri"], "Matematikada soat strelkasiga qarshi yo'nalish musbat hisoblanadi.");
  b.addChoice("P(1; 0) nuqtani π/2 burchakka burganda u qaysi koordinatali nuqtaga o'tadi?", "(0; 1)", ["(1; 0)", "(−1; 0)", "(0; −1)"], "90° soat strelkasiga qarshi burilganda nuqta musbat Oy o'qidagi (0; 1) ga boradi.");
  b.addChoice("P(1; 0) nuqtani −π/2 burchakka burganda qaysi nuqta hosil bo'ladi?", "(0; −1)", ["(0; 1)", "(−1; 0)", "(1; 0)"], "−90° soat strelkasi bo'ylab burish (0; −1) nuqtaga olib keladi.");
  b.addTF("α va α + 2πk (k ∈ Z) burchaklarga burishlar birlik aylanada ayni bir nuqtani beradi.", true, "2π to'liq aylanish nuqtani o'z o'rniga qaytaradi.");
  b.addTF("200° burchak II chorakda joylashadi.", false, "180° < 200° < 270°, demak III chorakda.");

  // 1) Turli gradus va radian burchaklar qaysi chorakka tushishini aniqlash (0..720 + manfiy)
  for (let deg = -350; deg <= 710; deg += 15) {
    if (b.count >= 210) break;
    if (deg % 90 === 0) continue;
    const norm = ((deg % 360) + 360) % 360;
    const q = norm < 90 ? "I chorak" : norm < 180 ? "II chorak" : norm < 270 ? "III chorak" : "IV chorak";
    const others = ["I chorak", "II chorak", "III chorak", "IV chorak"].filter((c) => c !== q);
    if (Math.abs(deg) % 30 === 15) {
      b.addTF(
        `${deg}° burchakka burilganda nuqta ${q} da joylashadi.`,
        true,
        `${deg}° ≡ ${norm}° (mod 360°), bu ${q} oralig'ida.`,
      );
    } else {
      b.addChoice(
        `P(1; 0) nuqtani ${deg}° burchakka burganda hosil bo'lgan nuqta qaysi chorakda yotadi?`,
        q,
        others,
        `${deg}° ning [0°; 360°) dagi mos burchagi ${norm}° bo'lib, u ${q} ka tushadi.`,
      );
    }
  }

  // 2) Radian burchaklar choragi va koordinatalari
  for (const ang of SPECIAL_ANGLES) {
    const coord = `(${ang.cos}; ${ang.sin})`;
    b.addChoice(
      `P(1; 0) nuqtani α = ${ang.rad} (${ang.deg}°) ga burganda uning koordinatalari qanday bo'ladi?`,
      coord,
      [`(${ang.sin}; ${ang.cos})`, `(−${ang.cos}; −${ang.sin})`.replace("−−", ""), `(${ang.cos}; −${ang.sin})`.replace("−−", "")],
      `Nuqta koordinatalari (cos ${ang.rad}; sin ${ang.rad}) = ${coord}.`,
    );
  }

  // 3) K·2π + α shaklida keltirish
  for (let k = 1; k <= 12; k++) {
    for (const base of [30, 45, 60, 90, 120, 135, 180, 270]) {
      if (b.count >= 340) break;
      const big = 360 * k + base;
      if ((k + base) % 2 === 0) {
        b.addFill(
          `${big}° burchakni [0°; 360°) oraliqdagi teng kuchli burchakka keltiring (faqat sonini yozing).`,
          `${base}`,
          `${big}° = 360°·${k} + ${base}°, demak asosiy burchak ${base}°.`,
        );
      } else {
        b.addChoice(
          `${big}° burchakka burish birlik aylanada [0°; 360°) dagi qaysi burchak bilan bir xil nuqtaga tushadi?`,
          `${base}°`,
          [`${(base + 90) % 360}°`, `${(base + 180) % 360}°`, `${Math.abs(base - 30)}°`],
          `${big}° − 360°·${k} = ${base}°.`,
        );
      }
    }
  }

  // 4) Radian burchaklar uchun a + 2*pi*k va chorak aniqlash (222–231-mashqlar)
  const radBases = [
    { rad: "π/6", q: "I chorak", k1: 1, d: 6 },
    { rad: "π/4", q: "I chorak", k1: 1, d: 4 },
    { rad: "π/3", q: "I chorak", k1: 1, d: 3 },
    { rad: "2π/3", q: "II chorak", k1: 2, d: 3 },
    { rad: "3π/4", q: "II chorak", k1: 3, d: 4 },
    { rad: "5π/6", q: "II chorak", k1: 5, d: 6 },
    { rad: "7π/6", q: "III chorak", k1: 7, d: 6 },
    { rad: "5π/4", q: "III chorak", k1: 5, d: 4 },
    { rad: "4π/3", q: "III chorak", k1: 4, d: 3 },
    { rad: "5π/3", q: "IV chorak", k1: 5, d: 3 },
    { rad: "7π/4", q: "IV chorak", k1: 7, d: 4 },
    { rad: "11π/6", q: "IV chorak", k1: 11, d: 6 },
  ];
  for (let k = 1; k <= 7; k++) {
    for (const rb of radBases) {
      if (b.count >= 340) break;
      const totalNum = rb.k1 + 2 * k * rb.d;
      const g = gcd(totalNum, rb.d);
      const bigRad = rb.d / g === 1 ? `${totalNum / g}π` : `${totalNum / g}π/${rb.d / g}`;
      const others = ["I chorak", "II chorak", "III chorak", "IV chorak"].filter((c) => c !== rb.q);
      b.addChoice(
        `P(1; 0) nuqtani ${bigRad} radian burchakka burganda nuqta qaysi chorakda yotadi?`,
        rb.q,
        others,
        `${bigRad} = ${rb.rad} + 2π·${k}, bu ${rb.q} da joylashadi.`,
      );
      if (b.count < 340) {
        const negNum = rb.k1 - 2 * k * rb.d;
        const gn = gcd(Math.abs(negNum), rb.d);
        const negRad = `${negNum / gn}π/${rb.d / gn}`.replace("/1", "");
        b.addTF(
          `${negRad} va ${rb.rad} burchaklarga burishlar birlik aylanada ayni bir nuqtani beradi.`,
          true,
          `${negRad} = ${rb.rad} − 2π·${k} bo'lib, farqi 2π ga karrali.`,
        );
      }
    }
  }

  return b.build();
}

function makeTopic19(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-19-sin-cos-tg-ctg",
    topicTitle: "19-§. Burchakning sinusi, kosinusi, tangensi va kotangensi",
    title: "19-§. Burchakning sinusi, kosinusi, tangensi va kotangensi",
    source: "Algebra 9-sinf (2019), III bob, 19-§, 103–109-betlar",
    seed: 9019,
  });

  b.addCards([
    ...commonTrigCards(),
    ["Aniqmas", "cos α = 0 da tg α ning holati"],
    ["Jadval", "0, 30°, 45°, 60°, 90° burchak qiymatlari"],
    ["Chegarali", "−1 ≤ sin α ≤ 1 va −1 ≤ cos α ≤ 1"],
    ["Nisbat", "tg α = sin α / cos α"],
    ["sin 30°", "1/2 (yoki 0,5)"],
    ["cos 60°", "1/2 (yoki 0,5)"],
    ["sin 45°", "√2 / 2"],
    ["cos 45°", "√2 / 2"],
    ["sin 60°", "√3 / 2"],
    ["tg 45°", "1 ga teng"],
    ["tg 60°", "√3 ga teng"],
    ["tg 30°", "√3 / 3 ga teng"],
    ["sin 90°", "1 ga teng"],
    ["cos 180°", "−1 ga teng"],
  ]);

  b.addChoice("Birlik aylanada P(1; 0) nuqtani α burchakka burganda hosil bo'lgan (x; y) nuqta uchun sin α nimaga teng?", "y ordinataga", ["x abssissaga", "y/x nisbatga", "x/y nisbatga"], "Ta'rifga ko'ra sin α = y, cos α = x.");
  b.addChoice("Qaysi burchaklarda tg α aniqlanmagan?", "α = π/2 + πk (k ∈ Z)", ["α = πk", "α = 2πk", "α = π/4 + πk"], "cos α = 0 bo'lgan α = π/2 + πk nuqtalarda tg α = sin α / cos α mavjud emas.");
  b.addTF("Har qanday α haqiqiy son uchun |sin α| ≤ 1 va |cos α| ≤ 1 bajariladi.", true, "Birlik aylanadagi nuqtalarning x² + y² = 1 bo'lgani uchun |x| ≤ 1, |y| ≤ 1.");
  b.addTF("ctg 0° ning qiymati 0 ga teng.", false, "sin 0° = 0 bo'lgani uchun ctg 0° = cos 0° / sin 0° aniqlanmagan.");

  // 1) Barcha maxsus burchaklar uchun sin, cos, tg, ctg qiymatlari
  for (const a of SPECIAL_ANGLES) {
    b.addChoice(
      `sin(${a.rad}) ning qiymatini toping (${a.deg}°).`,
      a.sin,
      pickStrDistractors(a.sin, TRIG_ALL_VALS),
      `Birlik aylanadan sin(${a.rad}) = ${a.sin}.`,
    );
    b.addChoice(
      `cos(${a.rad}) ning qiymatini toping (${a.deg}°).`,
      a.cos,
      pickStrDistractors(a.cos, TRIG_ALL_VALS),
      `Birlik aylanadan cos(${a.rad}) = ${a.cos}.`,
    );
    if (a.tg !== null) {
      b.addChoice(
        `tg(${a.rad}) ning qiymati nechaga teng?`,
        a.tg,
        pickStrDistractors(a.tg, TRIG_ALL_VALS),
        `tg(${a.rad}) = sin(${a.rad}) / cos(${a.rad}) = ${a.tg}.`,
      );
    }
    if (a.ctg !== null) {
      b.addChoice(
        `ctg(${a.rad}) ning qiymatini aniqlang.`,
        a.ctg,
        pickStrDistractors(a.ctg, TRIG_ALL_VALS),
        `ctg(${a.rad}) = cos(${a.rad}) / sin(${a.rad}) = ${a.ctg}.`,
      );
    }
  }

  // 2) Aniq sonli kombinatsiyalar (a*sin(x) + b*cos(y) + c*tg(z))
  const exactPool: { label: string; num2: number; den: number }[] = [
    { label: "sin(π/6)", num2: 1, den: 2 },
    { label: "cos(π/3)", num2: 1, den: 2 },
    { label: "sin(π/2)", num2: 1, den: 1 },
    { label: "cos(0)", num2: 1, den: 1 },
    { label: "cos(π)", num2: -1, den: 1 },
    { label: "sin(3π/2)", num2: -1, den: 1 },
    { label: "tg(π/4)", num2: 1, den: 1 },
    { label: "ctg(3π/4)", num2: -1, den: 1 },
    { label: "sin(7π/6)", num2: -1, den: 2 },
    { label: "cos(2π/3)", num2: -1, den: 2 },
  ];
  for (let i = 0; i < exactPool.length; i++) {
    for (let j = i + 1; j < exactPool.length; j++) {
      for (const c1 of [2, 4, 6]) {
        if (b.count >= 285) break;
        const t1 = exactPool[i];
        const t2 = exactPool[j];
        const v1 = (c1 * t1.num2) / t1.den;
        const c2 = 2;
        const v2 = (c2 * t2.num2) / t2.den;
        const sum = v1 + v2;
        if (Number.isInteger(sum)) {
          if ((i + j + c1) % 3 === 0) {
            b.addFill(
              `${c1}·${t1.label} + ${c2}·${t2.label} ifodaning qiymatini hisoblang.`,
              `${sum}`,
              `${c1}·(${v1 / c1}) + ${c2}·(${v2 / c2}) = ${v1} + (${v2}) = ${sum}.`,
            );
          } else {
            b.addChoice(
              `${c1}·${t1.label} + ${c2}·${t2.label} ifoda nimaga teng?`,
              `${sum}`,
              pickNumDistractors(sum, [sum + 1, sum - 1, -sum]),
              `${v1} + (${v2}) = ${sum}.`,
            );
          }
        }
      }
    }
  }

  // 3) Kvadratli ifodalar sin^2 + cos^2 va qiymatlar mumkinligi
  for (let n = 1; n <= 60; n++) {
    if (b.count >= 340) break;
    if (n % 2 === 0) {
      b.addTF(
        `sin α = ${fracStr(n + 1, n)} tenglikni qanoatlantiruvchi α burchak mavjud.`,
        false,
        `${n + 1}/${n} > 1 bo'lgani uchun sin α bunga teng bo'la olmaydi.`,
      );
    } else {
      b.addTF(
        `cos α = ${fracStr(n, n + 2)} tenglikni qanoatlantiruvchi burchak mavjud.`,
        true,
        `|${n}/${n + 2}| < 1 bo'lgani uchun bunday burchak mavjud.`,
      );
    }
  }

  // 4) Sodda trigonometrik tenglamalar sin x = 0, ±1, cos x = 0, ±1, tg x = 0 (237, 240-mashqlar)
  const simpleEqs: [string, string, string[], string][] = [
    ["sin x = 0", "x = πk (k ∈ Z)", ["x = π/2 + πk", "x = 2πk", "x = π/4 + πk"], "Birlik aylanada y = 0 nuqtalar 0 va π da, ya'ni x = πk."],
    ["sin x = 1", "x = π/2 + 2πk (k ∈ Z)", ["x = πk", "x = −π/2 + 2πk", "x = π/2 + πk"], "y = 1 nuqtaga faqat π/2 + 2πk burchaklar mos keladi."],
    ["sin x = −1", "x = −π/2 + 2πk (k ∈ Z)", ["x = π/2 + 2πk", "x = π + 2πk", "x = −π/2 + πk"], "y = −1 nuqta 3π/2 (yoki −π/2) + 2πk da bo'ladi."],
    ["cos x = 0", "x = π/2 + πk (k ∈ Z)", ["x = πk", "x = 2πk", "x = π/2 + 2πk"], "x = 0 koordinata Oy o'qida, ya'ni π/2 + πk burchaklarda."],
    ["cos x = 1", "x = 2πk (k ∈ Z)", ["x = πk", "x = π + 2πk", "x = π/2 + 2πk"], "x = 1 faqat boshlang'ich (1; 0) nuqtada: 2πk."],
    ["cos x = −1", "x = π + 2πk (k ∈ Z)", ["x = 2πk", "x = πk", "x = −π/2 + 2πk"], "x = −1 faqat (−1; 0) nuqtada: π + 2πk."],
    ["tg x = 0", "x = πk (k ∈ Z)", ["x = π/2 + πk", "x = 2πk", "x = π/4 + πk"], "sin x / cos x = 0 ⇔ sin x = 0 ⇔ x = πk."],
    ["ctg x = 0", "x = π/2 + πk (k ∈ Z)", ["x = πk", "x = 2πk", "x = π/4 + 2πk"], "cos x / sin x = 0 ⇔ cos x = 0 ⇔ x = π/2 + πk."],
  ];
  for (const [eq, ans, dist, exp] of simpleEqs) {
    b.addChoice(`${eq} sodda trigonometrik tenglamaning yechimini toping.`, ans, dist, exp);
  }

  for (let k = 1; k <= 35; k++) {
    if (b.count >= 340) break;
    // sin^2(30) + cos^2(30) yoki k*(sin 90 - cos 180)
    b.addFill(
      `${k}·sin(90°) − ${k}·cos(180°) + ${k}·tg(45°) ifodaning qiymatini hisoblang.`,
      `${3 * k}`,
      `${k}·1 − ${k}·(−1) + ${k}·1 = ${3 * k}.`,
    );
    if (b.count < 340) {
      b.addChoice(
        `${2 * k}·sin(π/6) · cos(π/3) · tg(π/4) ifoda nimaga teng?`,
        fracStr(k, 2),
        pickStrDistractors(fracStr(k, 2), [`${k}`, `${2 * k}`, fracStr(k, 4)]),
        `${2 * k}·(1/2)·(1/2)·1 = ${fracStr(k, 2)}.`,
      );
    }
  }

  return b.build();
}

function makeTopic20(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-20-ishoralar",
    topicTitle: "20-§. Sinus, kosinus va tangensning ishoralari",
    title: "20-§. Sinus, kosinus va tangensning ishoralari",
    source: "Algebra 9-sinf (2019), III bob, 20-§, 109–112-betlar",
    seed: 9020,
  });

  b.addCards([
    ...commonTrigCards(),
    ["Musbat", "Noldan katta qiymat (+)"],
    ["Manfiy", "Noldan kichik qiymat (−)"],
    ["Ko'paytma", "Ikki funksiyaning birgalikdagi ishorasi"],
    ["Radian", "57,3° li o'lchov birligi yordamida chorak topish"],
    ["sin α > 0", "I va II choraklarda musbat"],
    ["sin α < 0", "III va IV choraklarda manfiy"],
    ["cos α > 0", "I va IV choraklarda musbat"],
    ["cos α < 0", "II va III choraklarda manfiy"],
    ["tg α > 0", "I va III choraklarda musbat"],
    ["tg α < 0", "II va IV choraklarda manfiy"],
    ["ctg α > 0", "I va III choraklarda musbat"],
    ["I chorak barchasi", "sin > 0, cos > 0, tg > 0, ctg > 0"],
    ["sin 2 rad", "2 rad ≈ 114,6° (II chorak) ⇒ musbat"],
    ["cos 2 rad", "2 rad (II chorak) ⇒ manfiy"],
  ]);

  b.addChoice("sin α funksiyasi qaysi choraklarda musbat (+) ishoraga ega?", "I va II choraklarda", ["I va IV choraklarda", "II va III choraklarda", "I va III choraklarda"], "sin α = y ordinata bo'lib, Ox o'qidan yuqorida (I va II choraklarda) musbat.");
  b.addChoice("cos α funksiyasi qaysi choraklarda musbat (+) ishorali?", "I va IV choraklarda", ["I va II choraklarda", "II va III choraklarda", "III va IV choraklarda"], "cos α = x abssissa Oy o'qidan o'ngda (I va IV choraklarda) musbat.");
  b.addChoice("tg α va ctg α funksiyalari qaysi choraklarda musbat?", "I va III choraklarda", ["II va IV choraklarda", "I va II choraklarda", "III va IV choraklarda"], "I da (+)/(+) = +, III da (−)/(−) = + bo'ladi.");
  b.addTF("Agar sin α < 0 va cos α > 0 bo'lsa, α burchak IV chorakda yotadi.", true, "y < 0 va x > 0 bo'lgan chorak — IV chorak.");
  b.addTF("2 radian burchakning kosinusi musbat.", false, "π/2 ≈ 1,57 < 2 < π ≈ 3,14 (II chorak) da cos 2 < 0.");

  // 1) Gradus burchaklar uchun sin/cos/tg/ctg ishorasi
  for (let deg = -350; deg <= 710; deg += 12) {
    if (b.count >= 170) break;
    if (deg % 90 === 0) continue;
    const norm = ((deg % 360) + 360) % 360;
    const sinPos = norm < 180;
    const cosPos = norm < 90 || norm > 270;
    const tgPos = sinPos === cosPos;
    const fnIdx = Math.abs(deg) % 3;
    const fnName = fnIdx === 0 ? "sin" : fnIdx === 1 ? "cos" : "tg";
    const isPos = fnIdx === 0 ? sinPos : fnIdx === 1 ? cosPos : tgPos;
    if (Math.abs(deg) % 24 === 0) {
      b.addTF(
        `${fnName}(${deg}°) ifodaning qiymati ${isPos ? "musbat" : "manfiy"}.`,
        true,
        `${deg}° (${norm}°) burchakda ${fnName} ${isPos ? "> 0" : "< 0"}.`,
      );
    } else {
      b.addChoice(
        `${fnName}(${deg}°) ning ishorasini aniqlang.`,
        isPos ? "Musbat (+)" : "Manfiy (−)",
        [isPos ? "Manfiy (−)" : "Musbat (+)", "Nolga teng (0)", "Aniqlanmagan"],
        `${deg}° ≡ ${norm}° burchakda ${fnName} ishorasi ${isPos ? "+" : "−"}.`,
      );
    }
  }

  // 2) Butun radian sonlar (1, 2, 3, 4, 5, 6, -1..-5) va kasr pi*a/b ishorasi
  const radNumbers = [1, 2, 3, 4, 5, 6, -1, -2, -3, -4, -5];
  for (const r of radNumbers) {
    const twoPi = 2 * Math.PI;
    const norm = ((r % twoPi) + twoPi) % twoPi;
    const sinPos = norm < Math.PI;
    const cosPos = norm < Math.PI / 2 || norm > (3 * Math.PI) / 2;
    const tgPos = sinPos === cosPos;
    b.addChoice(
      `sin(${r}) sonining ishorasi qanday (${r} radianda)?`,
      sinPos ? "Musbat (+)" : "Manfiy (−)",
      [sinPos ? "Manfiy (−)" : "Musbat (+)", "Nol (0)", "Aniqlanmagan"],
      `${r} rad ≈ ${Math.round((r * 180) / Math.PI)}°, shu sabab sin(${r}) ${sinPos ? "> 0" : "< 0"}.`,
    );
    b.addChoice(
      `cos(${r}) sonining ishorasini aniqlang (${r} rad).`,
      cosPos ? "Musbat (+)" : "Manfiy (−)",
      [cosPos ? "Manfiy (−)" : "Musbat (+)", "Nol (0)", "Aniqlanmagan"],
      `cos(${r}) qiymati ${cosPos ? "musbat" : "manfiy"}.`,
    );
    b.addTF(
      `tg(${r}) (radianda) qiymati ${tgPos ? "musbat" : "manfiy"} ishorali.`,
      true,
      `sin(${r}) va cos(${r}) ishoralari nisbati ${tgPos ? "+" : "−"}.`,
    );
  }

  // 3) Ko'paytma ishoralari sin(a)*cos(b), tg(a)*sin(b)
  const sampleDegs = [25, 110, 205, 310, 50, 140, 235, 330];
  for (let i = 0; i < sampleDegs.length; i++) {
    for (let j = 0; j < sampleDegs.length; j++) {
      if (b.count >= 340) break;
      const d1 = sampleDegs[i];
      const d2 = sampleDegs[j];
      const s1 = d1 < 180 ? 1 : -1;
      const c2 = d2 < 90 || d2 > 270 ? 1 : -1;
      const prodPos = s1 * c2 > 0;
      b.addChoice(
        `sin(${d1}°) · cos(${d2}°) ko'paytmaning ishorasini aniqlang.`,
        prodPos ? "Musbat (+)" : "Manfiy (−)",
        [prodPos ? "Manfiy (−)" : "Musbat (+)", "Nol (0)", "Aniqlab bo'lmaydi"],
        `sin(${d1}°) ${s1 > 0 ? "> 0" : "< 0"}, cos(${d2}°) ${c2 > 0 ? "> 0" : "< 0"} ⇒ ko'paytma ${prodPos ? "+" : "−"}.`,
      );
      if (b.count < 340 && i !== j) {
        const s1b = d1 < 180 ? 1 : -1;
        const c1b = d1 < 90 || d1 > 270 ? 1 : -1;
        const qName = s1b > 0 ? (c1b > 0 ? "I" : "II") : c1b > 0 ? "IV" : "III";
        b.addFill(
          `sin α ${s1b > 0 ? "> 0" : "< 0"} va cos α ${c1b > 0 ? "> 0" : "< 0"} bo'lsa, α qaysi chorakda (Rim raqami: I, II, III, IV)?`,
          qName,
          `Ishoralarga mos chorak — ${qName}.`,
        );
      }
    }
  }

  // 4) Kasr radian burchaklar a*pi/b ning ishoralari (247–254-mashqlar)
  for (const den of [5, 7, 8, 9, 10, 12]) {
    for (let num = 1; num < 2 * den; num++) {
      if (b.count >= 340) break;
      if (gcd(num, den) !== 1) continue;
      if ((2 * num) % den === 0) continue;
      const ratio = num / den; // in (0, 2)
      const q = ratio < 0.5 ? 1 : ratio < 1 ? 2 : ratio < 1.5 ? 3 : 4;
      const rad = num === 1 ? `π/${den}` : `${num}π/${den}`;
      const sinPos = q <= 2;
      const cosPos = q === 1 || q === 4;
      const tgPos = q === 1 || q === 3;

      b.addChoice(
        `sin(${rad}) va cos(${rad}) larning ishoralari mos ravishda qanday?`,
        `${sinPos ? "+" : "−"} va ${cosPos ? "+" : "−"}`,
        [
          `${sinPos ? "−" : "+"} va ${cosPos ? "+" : "−"}`,
          `${sinPos ? "+" : "−"} va ${cosPos ? "−" : "+"}`,
          `${sinPos ? "−" : "+"} va ${cosPos ? "−" : "+"}`,
        ],
        `${rad} burchak ${q}-chorakda joylashgan, demak sin ${sinPos ? "> 0" : "< 0"}, cos ${cosPos ? "> 0" : "< 0"}.`,
      );
      if (b.count < 340) {
        b.addTF(
          `ctg(${rad}) qiymati ${tgPos ? "musbat (+)" : "manfiy (−)"} ishorali.`,
          true,
          `${rad} (${q}-chorak) da kotangens ishorasi ${tgPos ? "+" : "−"}.`,
        );
      }
    }
  }

  // 5) Qo'shimcha a*pi/11, a*pi/14 va tg(d1)*cos(d2) ishoralari
  for (const den of [11, 13, 14, 15]) {
    for (let num = 1; num < 2 * den; num++) {
      if (b.count >= 340) break;
      if (gcd(num, den) !== 1) continue;
      const ratio = num / den;
      const q = ratio < 0.5 ? 1 : ratio < 1 ? 2 : ratio < 1.5 ? 3 : 4;
      const rad = num === 1 ? `π/${den}` : `${num}π/${den}`;
      const tgPos = q === 1 || q === 3;
      b.addChoice(
        `tg(${rad}) ning ishorasini aniqlang.`,
        tgPos ? "Musbat (+)" : "Manfiy (−)",
        [tgPos ? "Manfiy (−)" : "Musbat (+)", "Nol (0)", "Aniqlanmagan"],
        `${rad} burchak ${q}-chorakda joylashgan, shu sabab tg(${rad}) ${tgPos ? "> 0" : "< 0"}.`,
      );
    }
  }

  return b.build();
}

function makeTopic21(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-21-munosabatlar",
    topicTitle: "21-§. Ayni bir burchakning sin, cos va tg munosabatlari",
    title: "21-§. Ayni bir burchakning sin, cos va tg munosabatlari",
    source: "Algebra 9-sinf (2019), III bob, 21-§, 112–116-betlar",
    seed: 9021,
  });

  b.addCards([
    ...commonTrigCards(),
    ["Teskari", "tg α · ctg α = 1 bog'lanishi"],
    ["Pifagor", "sin²α + cos²α = 1 asosiy ayniyati"],
    ["Sekans", "1 + tg²α = 1 / cos²α formulasi"],
    ["Kosekans", "1 + ctg²α = 1 / sin²α formulasi"],
    ["sin²α + cos²α = 1", "Asosiy trigonometrik ayniyat"],
    ["sin α = ±√(1−cos²α)", "Ishora chorakka qarab tanlanadi"],
    ["tg α = sin α / cos α", "Tangensning asosiy ta'rifi"],
    ["ctg α = 1 / tg α", "Tangens va kotangens bog'lanishi"],
    ["(3; 4; 5) uchlik", "sin α = 3/5 ⇒ |cos α| = 4/5"],
    ["(5; 12; 13) uchlik", "sin α = 5/13 ⇒ |cos α| = 12/13"],
    ["(8; 15; 17) uchlik", "cos α = 8/17 ⇒ |sin α| = 15/17"],
    ["(7; 24; 25) uchlik", "cos α = 7/25 ⇒ |sin α| = 24/25"],
    ["1 − sin²α", "cos²α ga teng ifoda"],
    ["1 − cos²α", "sin²α ga teng ifoda"],
  ]);

  b.addChoice("Asosiy trigonometrik ayniyat qaysi javobda to'g'ri ko'rsatilgan?", "sin²α + cos²α = 1", ["sin α + cos α = 1", "sin²α − cos²α = 1", "tg²α + ctg²α = 1"], "Birlik aylanadagi nuqta uchun x² + y² = 1 dan sin²α + cos²α = 1 kelib chiqadi.");
  b.addChoice("1 + tg²α ifoda nimaga teng (cos α ≠ 0)?", "1 / cos²α", ["1 / sin²α", "sin²α", "cos²α"], "1 + sin²α/cos²α = (cos²α + sin²α)/cos²α = 1/cos²α.");
  b.addChoice("1 + ctg²α ifoda nimaga teng (sin α ≠ 0)?", "1 / sin²α", ["1 / cos²α", "cos²α", "tg²α"], "1 + cos²α/sin²α = 1/sin²α.");
  b.addTF("tg α · ctg α = 1 ayniyat α ≠ πk/2 bo'lgan barcha burchaklar uchun o'rinli.", true, "(sin α / cos α) · (cos α / sin α) = 1.");

  // Pifagor uchliklari bilan yechiladigan aniq masalalar
  const pyth: [number, number, number][] = [
    [3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [9, 40, 41],
    [11, 60, 61], [12, 35, 37], [20, 21, 29], [16, 63, 65],
  ];
  const quads: { name: string; sinSign: 1 | -1; cosSign: 1 | -1 }[] = [
    { name: "I", sinSign: 1, cosSign: 1 },
    { name: "II", sinSign: 1, cosSign: -1 },
    { name: "III", sinSign: -1, cosSign: -1 },
    { name: "IV", sinSign: -1, cosSign: 1 },
  ];

  for (const [a, c, h] of pyth) {
    for (const [leg1, leg2] of [[a, c], [c, a]]) {
      for (const q of quads) {
        if (b.count >= 250) break;
        const sinStr = fracStr(q.sinSign * leg1, h);
        const cosStr = fracStr(q.cosSign * leg2, h);
        const tgSign = q.sinSign * q.cosSign;
        const tgStr = fracStr(tgSign * leg1, leg2);
        const ctgStr = fracStr(tgSign * leg2, leg1);

        b.addChoice(
          `α — ${q.name} chorak burchagi va sin α = ${sinStr} bo'lsa, cos α ni toping.`,
          cosStr,
          pickStrDistractors(cosStr, [fracStr(-q.cosSign * leg2, h), fracStr(leg1, leg2), sinStr]),
          `cos²α = 1 − (${sinStr})² = ${leg2 * leg2}/${h * h}. ${q.name} chorakda cos α = ${cosStr}.`,
        );
        b.addChoice(
          `α — ${q.name} chorak burchagi va cos α = ${cosStr} bo'lsa, tg α ni toping.`,
          tgStr,
          pickStrDistractors(tgStr, [fracStr(-tgSign * leg1, leg2), ctgStr, sinStr]),
          `sin α = ${sinStr} ⇒ tg α = (${sinStr}) / (${cosStr}) = ${tgStr}.`,
        );
        b.addTF(
          `Agar tg α = ${tgStr} (${q.name} chorak) bo'lsa, ctg α = ${ctgStr} ga teng.`,
          true,
          `ctg α = 1 / tg α = ${ctgStr}.`,
        );
      }
    }
  }

  // Sodda tg*ctg va 1 + tg^2 = 1/cos^2 hisoblashlar
  for (let n = 2; n <= 45; n++) {
    if (b.count >= 340) break;
    const inv = fracStr(1, n);
    b.addFill(
      `tg α = ${n} bo'lsa, ctg α ning qiymatini kasr ko'rinishida yozing.`,
      inv,
      `tg α · ctg α = 1 dan ctg α = ${inv}.`,
    );
    if (b.count < 340) {
      const sq = n * n + 1;
      b.addChoice(
        `tg α = ${n} bo'lganda 1 / cos²α qiymatini toping.`,
        `${sq}`,
        pickNumDistractors(sq, [n * n, sq + 1, n + 1]),
        `1 / cos²α = 1 + tg²α = 1 + ${n}² = ${sq}.`,
      );
    }
  }

  // 3) Bir jinsli kasrlar (a*sin + b*cos) / (c*sin + d*cos) (262-mashq)
  for (let t = 2; t <= 8; t++) {
    for (let a = 1; a <= 4; a++) {
      for (let c = 1; c <= 4; c++) {
        if (b.count >= 340) break;
        const num = a * t + 3;
        const den = c * t + 1;
        if (den === 0) continue;
        const ans = fracStr(num, den);
        b.addChoice(
          `tg α = ${t} bo'lsa, (${a === 1 ? "" : a}sin α + 3cos α) / (${c === 1 ? "" : c}sin α + cos α) ifodaning qiymatini toping.`,
          ans,
          pickStrDistractors(ans, [fracStr(a + 3, c + 1), fracStr(num + 1, den), fracStr(num, den + 1)]),
          `Surat va maxrajni cos α ga bo'lamiz: (${a}tg α + 3)/(${c}tg α + 1) = (${a}·${t}+3)/(${c}·${t}+1) = ${ans}.`,
        );
      }
    }
  }

  return b.build();
}

function makeTopic22(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-22-trigonometrik-ayniyatlar",
    topicTitle: "22-§. Trigonometrik ayniyatlar",
    title: "22-§. Trigonometrik ayniyatlar",
    source: "Algebra 9-sinf (2019), III bob, 22-§, 117–119-betlar",
    seed: 9022,
  });

  b.addCards([
    ...commonTrigCards(),
    ["Soddalashtirish", "Murakkab ifodani qisqa shaklga keltirish"],
    ["Isbotlash", "Chap tomonni o'ng tomonga teng ekanini ko'rsatish"],
    ["Ko'paytma", "sin⁴α − cos⁴α ni (sin²α−cos²α)(sin²α+cos²α) ga ajratish"],
    ["Yig'indi", "(sin α + cos α)² = 1 + 2sin α cos α"],
    ["(sin α−cos α)²", "1 − 2sin α cos α ga teng"],
    ["1 − sin²α", "cos²α ga aynan teng"],
    ["1 − cos²α", "sin²α ga aynan teng"],
    ["sin²α / (1−cos α)", "1 + cos α ga teng (cos α ≠ 1)"],
    ["tg α · cos α", "sin α ga teng ayniyat"],
    ["ctg α · sin α", "cos α ga teng ayniyat"],
    ["1/(1+tg²α)", "cos²α ga teng ifoda"],
    ["1/(1+ctg²α)", "sin²α ga teng ifoda"],
    ["sin⁴α + cos⁴α", "1 − 2sin²α cos²α ga teng"],
    ["(1−sin α)(1+sin α)", "cos²α ga teng"],
  ]);

  b.addChoice("sin⁴α − cos⁴α ifodani soddalashtiring.", "sin²α − cos²α", ["1", "sin²α + cos²α", "2sin²α"], "(sin²α − cos²α)(sin²α + cos²α) = (sin²α − cos²α)·1.");
  b.addChoice("(sin α + cos α)² + (sin α − cos α)² ifoda nimaga teng?", "2", ["1", "0", "4sin α cos α"], "(1 + 2sin α cos α) + (1 − 2sin α cos α) = 2.");
  b.addChoice("(1 − cos α)(1 + cos α) ifoda qaysi funksiyaga aynan teng?", "sin²α", ["cos²α", "tg²α", "1"], "1 − cos²α = sin²α.");
  b.addTF("tg α · cos α = sin α tenglik cos α ≠ 0 bo'lgan barcha burchaklar uchun ayniyatdir.", true, "(sin α / cos α) · cos α = sin α.");

  // 1) Ko'paytmali ayniyatlar k*(1 - cos^2 a) + k*cos^2 a va sin^2 a + cos^2 a = 1 kombinatsiyalari
  for (let k = 2; k <= 50; k++) {
    b.addFill(
      `${k}sin²α + ${k}cos²α ifodaning qiymatini hisoblang.`,
      `${k}`,
      `${k}(sin²α + cos²α) = ${k}·1 = ${k}.`,
    );
    b.addChoice(
      `${k} − ${k}sin²α ifoda nimaga teng?`,
      `${k}cos²α`,
      [`${k}sin²α`, `${k}`, `${k}tg²α`],
      `${k}(1 − sin²α) = ${k}cos²α.`,
    );
    b.addChoice(
      `${k}tg α · cos α − ${k}sin α ifodani soddalashtiring.`,
      `0`,
      [`${k}`, `2${k}sin α`, `−${k}`],
      `tg α · cos α = sin α bo'lgani uchun ${k}sin α − ${k}sin α = 0.`,
    );
  }

  // 2) sin a + cos a = s bo'lganda sin a * cos a ni topish
  const sums = [
    { s: "1/2", num: -3, den: 8 },
    { s: "1/3", num: -4, den: 9 },
    { s: "2/3", num: -5, den: 18 },
    { s: "1/4", num: -15, den: 32 },
    { s: "3/4", num: -7, den: 32 },
    { s: "1/5", num: -12, den: 25 },
    { s: "3/5", num: -8, den: 25 },
    { s: "4/5", num: -9, den: 50 },
    { s: "6/5", num: 11, den: 50 },
    { s: "7/5", num: 12, den: 25 },
    { s: "0", num: -1, den: 2 },
    { s: "1", num: 0, den: 1 },
  ];
  for (const item of sums) {
    const pStr = fracStr(item.num, item.den);
    b.addChoice(
      `Agar sin α + cos α = ${item.s} bo'lsa, sin α · cos α qiymatini toping.`,
      pStr,
      pickStrDistractors(pStr, ["1/2", "−1/2", "1/4", "3/4", "0"]),
      `(sin α + cos α)² = 1 + 2sin α cos α dan 2sin α cos α = (${item.s})² − 1, demak sin α cos α = ${pStr}.`,
    );
    b.addTF(
      `sin α + cos α = ${item.s} tenglik bajarilganda sin α · cos α = ${pStr} bo'ladi.`,
      true,
      `Kvadratga ko'tarish orqali sin α cos α = ((${item.s})² − 1)/2 = ${pStr}.`,
    );
  }

  // 3) Standart soddalashtirish shakllari
  for (let m = 2; m <= 60; m++) {
    if (b.count >= 340) break;
    if (m % 2 === 0) {
      b.addChoice(
        `${m}·(1 + tg²α)·cos²α ifodaning qiymatini toping (cos α ≠ 0).`,
        `${m}`,
        pickNumDistractors(m, [m + 1, 2 * m, 1]),
        `(1 + tg²α)·cos²α = (1/cos²α)·cos²α = 1 ⇒ javob ${m}.`,
      );
    } else {
      b.addChoice(
        `${m}·(1 + ctg²α)·sin²α ifoda nimaga teng (sin α ≠ 0)?`,
        `${m}`,
        pickNumDistractors(m, [m - 1, 2 * m, 0]),
        `(1 + ctg²α)·sin²α = (1/sin²α)·sin²α = 1 ⇒ javob ${m}.`,
      );
    }
    if (b.count < 340) {
      b.addTF(
        `(1 − sin α)(1 + sin α) + sin²α = 1 tenglik barcha α lar uchun ayniyatdir.`,
        true,
        `(1 − sin²α) + sin²α = cos²α + sin²α = 1.`,
      );
    }
  }

  // 4) sin α − cos α = d dan sin α cos α va tg α + ctg α = m dan tg²α + ctg²α (267–273-mashqlar)
  for (const item of sums) {
    const pStr = fracStr(-item.num, item.den);
    b.addChoice(
      `Agar sin α − cos α = ${item.s} bo'lsa, sin α · cos α qiymatini toping.`,
      pStr,
      pickStrDistractors(pStr, ["1/2", "−1/2", "1/4", "0", "3/4"]),
      `(sin α − cos α)² = 1 − 2sin α cos α ⇒ sin α cos α = (1 − (${item.s})²)/2 = ${pStr}.`,
    );
  }

  for (let m = 2; m <= 35; m++) {
    if (b.count >= 340) break;
    const sqSum = m * m - 2;
    b.addFill(
      `tg α + ctg α = ${m} bo'lsa, tg²α + ctg²α ning qiymatini toping.`,
      `${sqSum}`,
      `(tg α + ctg α)² = tg²α + 2·tg α·ctg α + ctg²α = tg²α + ctg²α + 2 = ${m}² ⇒ javob ${sqSum}.`,
    );
    if (b.count < 340) {
      const diffSq = m * m - 4;
      b.addChoice(
        `tg α + ctg α = ${m} bo'lganda (tg α − ctg α)² nimaga teng?`,
        `${diffSq}`,
        pickNumDistractors(diffSq, [m * m, sqSum, m * m + 4]),
        `(tg α − ctg α)² = (tg α + ctg α)² − 4·tg α·ctg α = ${m}² − 4 = ${diffSq}.`,
      );
    }
    if (b.count < 340) {
      b.addTF(
        `${m}·(sin⁴α − cos⁴α + cos²α) = ${m}·sin²α tenglik ayniyatdir.`,
        true,
        `sin⁴α − cos⁴α = sin²α − cos²α; unga cos²α qo'shsak sin²α qoladi.`,
      );
    }
  }

  return b.build();
}

function makeTopic23(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-23-manfiy-burchaklar",
    topicTitle: "23-§. α va −α burchaklarning sinusi, kosinusi, tangensi",
    title: "23-§. α va −α burchaklarning sinusi, kosinusi, tangensi",
    source: "Algebra 9-sinf (2019), III bob, 23-§, 120–121-betlar",
    seed: 9023,
  });

  b.addCards([
    ...commonTrigCards(),
    ["Juftlik", "cos(−α) = cos α bo'lgani uchun kosinus juft"],
    ["Toqlik", "sin(−α) = −sin α bo'lgani uchun sinus toq"],
    ["Simmetriya", "α va −α nuqtalari Ox o'qiga simmetrik"],
    ["Manfiy", "−α burchakda minusni saqlovchi sin, tg, ctg"],
    ["cos(−α) = cos α", "Kosinus manfiy belgini yutadi (juft funksiya)"],
    ["sin(−α) = −sin α", "Sinus minusni oldiga chiqaradi (toq funksiya)"],
    ["tg(−α) = −tg α", "Tangens toq funksiya"],
    ["ctg(−α) = −ctg α", "Kotangens toq funksiya"],
    ["sin(−30°)", "−1/2 ga teng"],
    ["cos(−60°)", "1/2 ga teng"],
    ["tg(−45°)", "−1 ga teng"],
    ["cos(−π/3)", "1/2 ga teng"],
    ["sin(−π/4)", "−√2 / 2 ga teng"],
    ["tg(−π/3)", "−√3 ga teng"],
  ]);

  b.addChoice("Trigonometrik funksiyalardan qaysi biri juft funksiya hisoblanadi?", "cos α", ["sin α", "tg α", "ctg α"], "cos(−α) = cos α bo'lgani uchun kosinus juft, qolgan uchtasi toq funksiyalardir.");
  b.addChoice("sin(−α) ifoda nimaga teng?", "−sin α", ["sin α", "cos α", "−cos α"], "Sinus toq funksiya: sin(−α) = −sin α.");
  b.addTF("tg(−α) = −tg α ayniyat tangens aniqlangan barcha burchaklar uchun o'rinli.", true, "tg(−α) = sin(−α)/cos(−α) = −sin α / cos α = −tg α.");
  b.addTF("cos(−45°) = −√2/2 ga teng.", false, "Kosinus juft funksiya: cos(−45°) = cos 45° = √2/2.");

  // Barcha maxsus burchaklar va manfiy burchaklar
  for (const a of SPECIAL_ANGLES) {
    if (a.deg === 0) continue;
    const negSin = a.sin === "0" ? "0" : a.sin.startsWith("−") ? a.sin.slice(1) : `−${a.sin}`;
    const negTg = a.tg === null ? null : a.tg === "0" ? "0" : a.tg.startsWith("−") ? a.tg.slice(1) : `−${a.tg}`;
    const negCtg = a.ctg === null ? null : a.ctg === "0" ? "0" : a.ctg.startsWith("−") ? a.ctg.slice(1) : `−${a.ctg}`;

    b.addChoice(
      `sin(−${a.rad}) nimaga teng (−${a.deg}°)?`,
      negSin,
      pickStrDistractors(negSin, TRIG_ALL_VALS),
      `sin(−${a.rad}) = −sin(${a.rad}) = ${negSin}.`,
    );
    b.addChoice(
      `cos(−${a.rad}) nimaga teng (−${a.deg}°)?`,
      a.cos,
      pickStrDistractors(a.cos, TRIG_ALL_VALS),
      `cos(−${a.rad}) = cos(${a.rad}) = ${a.cos}.`,
    );
    if (negTg !== null) {
      b.addChoice(
        `tg(−${a.rad}) ning qiymatini toping.`,
        negTg,
        pickStrDistractors(negTg, TRIG_ALL_VALS),
        `tg(−${a.rad}) = −tg(${a.rad}) = ${negTg}.`,
      );
    }
    if (negCtg !== null) {
      b.addChoice(
        `ctg(−${a.rad}) ning qiymatini toping.`,
        negCtg,
        pickStrDistractors(negCtg, TRIG_ALL_VALS),
        `ctg(−${a.rad}) = −ctg(${a.rad}) = ${negCtg}.`,
      );
    }
  }

  // Sonli hisoblashlar k*sin(-a) + m*cos(-b)
  for (let k = 2; k <= 25; k++) {
    const val = k - 2; // k*cos(-pi/3) - sin(-pi/2) -> wait 2*cos(-pi/3) = 1
    b.addFill(
      `${2 * k}·cos(−π/3) + ${k}·sin(−π/2) ifodani hisoblang.`,
      `0`,
      `cos(−π/3) = 1/2, sin(−π/2) = −1 ⇒ ${2 * k}·(1/2) + ${k}·(−1) = ${k} − ${k} = 0.`,
    );
    b.addFill(
      `${2 * k}·sin(−30°) + ${2 * val + 2}·cos(−60°) ifodani hisoblang.`,
      `${val - k + 1}`,
      `sin(−30°) = −1/2, cos(−60°) = 1/2 ⇒ −${k} + ${val + 1} = ${val - k + 1}.`,
    );
  }

  // Parametrli: sin(-a) + sin(a), cos(-a) - cos(a) va h.k.
  for (let k = 1; k <= 40; k++) {
    if (b.count >= 340) break;
    b.addChoice(
      `${k}sin(−α) + ${k + 3}sin α ifodani soddalashtiring.`,
      `3sin α`,
      [`${2 * k + 3}sin α`, `−3sin α`, `0`],
      `sin(−α) = −sin α ⇒ −${k}sin α + ${k + 3}sin α = 3sin α.`,
    );
    b.addChoice(
      `${k}cos(−α) + ${k}cos α ifoda nimaga teng?`,
      `${2 * k}cos α`,
      [`0`, `${k}cos α`, `−${2 * k}cos α`],
      `cos(−α) = cos α bo'lgani uchun ${k}cos α + ${k}cos α = ${2 * k}cos α.`,
    );
    if (b.count < 340) {
      b.addTF(
        `tg(−${k}°) + tg(${k}°) = 0 tenglik to'g'ri.`,
        true,
        `tg(−${k}°) = −tg(${k}°), shuning uchun yig'indisi 0.`,
      );
    }
  }

  // 4) Manfiy burchaklar ko'paytmasi va juft-toqlik soddalashtirishlari (275–279-mashqlar)
  for (let k = 1; k <= 40; k++) {
    if (b.count >= 340) break;
    b.addChoice(
      `${k}·tg(−α) · ctg α ifodani soddalashtiring (α ≠ πn/2).`,
      `−${k}`,
      [`${k}`, `0`, `1`],
      `tg(−α) = −tg α va tg α · ctg α = 1 ⇒ javob −${k}.`,
    );
    if (b.count < 340) {
      b.addChoice(
        `sin²(−α) + cos²(−α) + ${k} ifodaning qiymatini toping.`,
        `${k + 1}`,
        pickNumDistractors(k + 1, [k, k - 1, 1]),
        `(−sin α)² + (cos α)² = sin²α + cos²α = 1 ⇒ 1 + ${k} = ${k + 1}.`,
      );
    }
    if (b.count < 340) {
      b.addTF(
        `f(α) = ${k}·sin α · tg α funksiya juft funksiyadir.`,
        true,
        `Ikki toq funksiya ko'paytmasi juft: (−sin α)(−tg α) = sin α · tg α.`,
      );
    }
  }

  return b.build();
}

function makeTopic24(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-24-qoshish-formulalari",
    topicTitle: "24-§. Qo'shish formulalari",
    title: "24-§. Qo'shish formulalari",
    source: "Algebra 9-sinf (2019), III bob, 24-§, 121–126-betlar",
    seed: 9024,
  });

  b.addCards([
    ...commonTrigCards(),
    ["Yoyish", "sin(α ± β) va cos(α ± β) formulalari"],
    ["Yig'ish", "sin α cos β + cos α sin β ni sin(α + β) ga yig'ish"],
    ["Tangens", "tg(α ± β) = (tg α ± tg β)/(1 ∓ tg α tg β)"],
    ["15° burchak", "45° − 30° ayirma ko'rinishida hisoblanadi"],
    ["sin(α + β)", "sin α cos β + cos α sin β"],
    ["sin(α − β)", "sin α cos β − cos α sin β"],
    ["cos(α + β)", "cos α cos β − sin α sin β"],
    ["cos(α − β)", "cos α cos β + sin α sin β"],
    ["75° burchak", "45° + 30° yig'indi ko'rinishida hisoblanadi"],
    ["105° burchak", "60° + 45° yig'indi ko'rinishida hisoblanadi"],
    ["sin 15°", "(√6 − √2) / 4 ga teng"],
    ["cos 15°", "(√6 + √2) / 4 ga teng"],
    ["tg 15°", "2 − √3 ga teng"],
    ["tg 75°", "2 + √3 ga teng"],
  ]);

  b.addChoice("cos(α + β) formulasi qaysi javobda to'g'ri berilgan?", "cos α cos β − sin α sin β", ["cos α cos β + sin α sin β", "sin α cos β + cos α sin β", "sin α cos β − cos α sin β"], "Kosinuslar yig'indi formulasida o'rtadagi ishora minus: cos α cos β − sin α sin β.");
  b.addChoice("sin(α − β) formulasi qanday yoziladi?", "sin α cos β − cos α sin β", ["sin α cos β + cos α sin β", "cos α cos β − sin α sin β", "cos α cos β + sin α sin β"], "sin(α − β) = sin α cos β − cos α sin β.");
  b.addChoice("sin 15° ning aniq qiymati qaysi?", "(√6 − √2) / 4", ["(√6 + √2) / 4", "√2 / 4", "(√3 − 1) / 2"], "sin(45° − 30°) = (√2/2)(√3/2) − (√2/2)(1/2) = (√6 − √2)/4.");
  b.addChoice("cos 15° ning aniq qiymati qaysi?", "(√6 + √2) / 4", ["(√6 − √2) / 4", "(√3 + 1) / 4", "√3 / 2"], "cos(45° − 30°) = (√6 + √2)/4.");
  b.addTF("tg(45° + α) = (1 + tg α) / (1 − tg α) tenglik o'rinli.", true, "tg 45° = 1 bo'lgani uchun (1 + tg α)/(1 − 1·tg α) chiqadi.");

  // 1) sin(A)*cos(B) ± cos(A)*sin(B) va cos(A)*cos(B) ± sin(A)*sin(B) teskari yig'ish -> aniq burchak
  for (let a = 5; a <= 85; a += 5) {
    for (let c = 5; c <= 85; c += 5) {
      if (b.count >= 250) break;
      const sumDeg = a + c;
      const matchSum = SPECIAL_ANGLES.find((ang) => ang.deg === sumDeg);
      if (matchSum) {
        b.addChoice(
          `sin ${a}° cos ${c}° + cos ${a}° sin ${c}° ifodaning qiymatini hisoblang.`,
          matchSum.sin,
          pickStrDistractors(matchSum.sin, TRIG_ALL_VALS),
          `sin(${a}° + ${c}°) = sin ${sumDeg}° = ${matchSum.sin}.`,
        );
        b.addChoice(
          `cos ${a}° cos ${c}° − sin ${a}° sin ${c}° ifodaning qiymatini toping.`,
          matchSum.cos,
          pickStrDistractors(matchSum.cos, TRIG_ALL_VALS),
          `cos(${a}° + ${c}°) = cos ${sumDeg}° = ${matchSum.cos}.`,
        );
      }
      const diffDeg = a - c;
      const matchDiff = SPECIAL_ANGLES.find((ang) => ang.deg === diffDeg);
      if (matchDiff) {
        b.addChoice(
          `sin ${a}° cos ${c}° − cos ${a}° sin ${c}° ifodaning qiymati nimaga teng?`,
          matchDiff.sin,
          pickStrDistractors(matchDiff.sin, TRIG_ALL_VALS),
          `sin(${a}° − ${c}°) = sin ${diffDeg}° = ${matchDiff.sin}.`,
        );
        b.addChoice(
          `cos ${a}° cos ${c}° + sin ${a}° sin ${c}° ifodani hisoblang.`,
          matchDiff.cos,
          pickStrDistractors(matchDiff.cos, TRIG_ALL_VALS),
          `cos(${a}° − ${c}°) = cos ${diffDeg}° = ${matchDiff.cos}.`,
        );
      }
    }
  }

  // 2) tg(a+b) va parametrli yig'indilar
  for (let x = 2; x <= 20; x++) {
    for (let y = 1; y <= 6; y++) {
      if (b.count >= 340) break;
      // tg(a) = 1/x, tg(b) = 1/y => tg(a+b) = (x+y)/(xy - 1)
      if (x * y === 1) continue;
      const ans = fracStr(x + y, x * y - 1);
      b.addChoice(
        `tg α = 1/${x} va tg β = ${y === 1 ? "1" : `1/${y}`} bo'lsa, tg(α + β) ni toping.`,
        ans,
        pickStrDistractors(ans, [fracStr(x + y, x * y + 1), fracStr(Math.abs(x - y), x * y - 1), "1", "2"]),
        `tg(α + β) = (1/${x} + 1/${y}) / (1 − 1/${x * y}) = ${ans}.`,
      );
      if (b.count < 340) {
        b.addTF(
          `sin(α + ${x}°)cos(${x}°) − cos(α + ${x}°)sin(${x}°) = sin α tenglik ayniyatdir.`,
          true,
          `sin((α + ${x}°) − ${x}°) = sin α.`,
        );
      }
    }
  }

  return b.build();
}

function makeTopic25(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-25-ikkilangan-burchak",
    topicTitle: "25-§. Ikkilangan burchakning sinusi va kosinusi",
    title: "25-§. Ikkilangan burchakning sinusi va kosinusi",
    source: "Algebra 9-sinf (2019), III bob, 25-§, 126–129-betlar",
    seed: 9025,
  });

  b.addCards([
    ...commonTrigCards(),
    ["Ikkilangan", "2α burchakli trigonometrik funksiya formulalari"],
    ["Pasaytirish", "sin²α va cos²α darajasini pasaytirish"],
    ["sin 2α", "2 sin α cos α ga teng"],
    ["cos 2α (1)", "cos²α − sin²α ga teng"],
    ["cos 2α (2)", "2cos²α − 1 ga teng"],
    ["cos 2α (3)", "1 − 2sin²α ga teng"],
    ["tg 2α", "2 tg α / (1 − tg²α)"],
    ["1 − cos 2α", "2 sin²α ga teng"],
    ["1 + cos 2α", "2 cos²α ga teng"],
    ["2sin 15° cos 15°", "sin 30° = 1/2 ga teng"],
    ["cos²15° − sin²15°", "cos 30° = √3 / 2 ga teng"],
    ["sin α cos α", "½ · sin 2α ga teng"],
    ["cos²α − sin²α", "cos 2α formulasi"],
    ["cos α − cos²(α/2)", "Yarim burchakka o'tishda ishlatiladi"],
  ]);

  b.addChoice("sin 2α formulasi qaysi?", "2 sin α cos α", ["sin²α + cos²α", "cos²α − sin²α", "2 sin α + cos α"], "Qo'shish formulasida β = α qo'ysak sin(α + α) = 2 sin α cos α chiqadi.");
  b.addChoice("Quyidagilardan qaysi biri cos 2α ga teng EMAS?", "cos²α + sin²α", ["cos²α − sin²α", "2cos²α − 1", "1 − 2sin²α"], "cos²α + sin²α = 1, bu cos 2α emas.");
  b.addChoice("tg 2α ning formulasi qaysi?", "2 tg α / (1 − tg²α)", ["2 tg α / (1 + tg²α)", "tg²α − 1", "(1 − tg²α) / (2 tg α)"], "tg(α + α) = (tg α + tg α)/(1 − tg α · tg α).");
  b.addTF("1 − cos 2α = 2 sin²α tenglik barcha α lar uchun o'rinli.", true, "cos 2α = 1 − 2 sin²α dan 1 − cos 2α = 2 sin²α.");

  // 1) 2*k*sin(a)*cos(a) va k*(cos^2 a - sin^2 a)
  const halfAngles = [
    { deg: 15, rad: "π/12", dblSin: "1/2", dblCos: "√3/2", dVal: 0.5 },
    { deg: 22.5, rad: "π/8", dblSin: "√2/2", dblCos: "√2/2", dVal: 0.707 },
    { deg: 30, rad: "π/6", dblSin: "√3/2", dblCos: "1/2", dVal: 0.866 },
    { deg: 45, rad: "π/4", dblSin: "1", dblCos: "0", dVal: 1 },
    { deg: 60, rad: "π/3", dblSin: "√3/2", dblCos: "−1/2", dVal: 0.866 },
    { deg: 75, rad: "5π/12", dblSin: "1/2", dblCos: "−√3/2", dVal: 0.5 },
    { deg: 90, rad: "π/2", dblSin: "0", dblCos: "−1", dVal: 0 },
  ];
  for (const h of halfAngles) {
    b.addChoice(
      `2 sin(${h.rad}) cos(${h.rad}) ifodaning qiymatini toping.`,
      h.dblSin,
      pickStrDistractors(h.dblSin, TRIG_ALL_VALS),
      `sin(2·${h.rad}) = ${h.dblSin}.`,
    );
    b.addChoice(
      `cos²(${h.rad}) − sin²(${h.rad}) ifodaning qiymati nechaga teng?`,
      h.dblCos,
      pickStrDistractors(h.dblCos, TRIG_ALL_VALS),
      `cos(2·${h.rad}) = ${h.dblCos}.`,
    );
  }

  // 2) Aniq sonli: sin a yoki cos a berilganda cos 2a va sin 2a topish
  for (let den = 3; den <= 13; den++) {
    for (let num = 1; num < den; num++) {
      if (b.count >= 210) break;
      if (gcd(num, den) !== 1) continue;
      const sinStr = fracStr(num, den);
      // cos 2a = 1 - 2*(num/den)^2 = (den^2 - 2*num^2) / den^2
      const c2a = fracStr(den * den - 2 * num * num, den * den);
      b.addChoice(
        `Agar sin α = ${sinStr} bo'lsa, cos 2α qiymatini toping.`,
        c2a,
        pickStrDistractors(c2a, [fracStr(2 * num * num - den * den, den * den), fracStr(den * den - num * num, den * den), fracStr(num, den)]),
        `cos 2α = 1 − 2sin²α = 1 − 2·(${sinStr})² = ${c2a}.`,
      );
      if (b.count < 210) {
        const s2aCos = fracStr(2 * num * num - den * den, den * den);
        b.addChoice(
          `Agar cos α = ${sinStr} bo'lsa, cos 2α qiymatini toping.`,
          s2aCos,
          pickStrDistractors(s2aCos, [c2a, fracStr(num * num, den * den), "1"]),
          `cos 2α = 2cos²α − 1 = 2·(${sinStr})² − 1 = ${s2aCos}.`,
        );
      }
    }
  }

  // 3) Pifagor uchliklari bilan sin 2a va tg 2a
  const pyth: [number, number, number][] = [
    [3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [9, 40, 41],
  ];
  for (const [a, c, h] of pyth) {
    for (const [sNum, cNum] of [[a, c], [c, a]]) {
      const sin2 = fracStr(2 * sNum * cNum, h * h);
      b.addChoice(
        `O'tkir α burchak uchun sin α = ${sNum}/${h} bo'lsa, sin 2α ni toping.`,
        sin2,
        pickStrDistractors(sin2, [fracStr(sNum * cNum, h * h), fracStr(2 * sNum, h), fracStr(cNum, h)]),
        `cos α = ${cNum}/${h} ⇒ sin 2α = 2·(${sNum}/${h})·(${cNum}/${h}) = ${sin2}.`,
      );
    }
  }

  // 4) tg a berilganda tg 2a va 2k*sin 15 * cos 15
  for (let k = 2; k <= 25; k++) {
    if (b.count >= 305) break;
    // tg a = 1/k => tg 2a = 2k / (k^2 - 1)
    const t2 = fracStr(2 * k, k * k - 1);
    b.addChoice(
      `tg α = 1/${k} bo'lganda tg 2α nimaga teng?`,
      t2,
      pickStrDistractors(t2, [fracStr(2 * k, k * k + 1), fracStr(k, k * k - 1), fracStr(2, k)]),
      `tg 2α = (2/${k}) / (1 − 1/${k * k}) = ${t2}.`,
    );
    b.addFill(
      `${4 * k} · sin 15° · cos 15° ifodaning qiymatini hisoblang.`,
      `${k}`,
      `${4 * k} · ½ sin 30° = ${2 * k} · ½ = ${k}.`,
    );
  }

  for (let m = 1; m <= 40; m++) {
    if (b.count >= 340) break;
    b.addTF(
      `${2 * m} sin²α + ${m} cos 2α = ${m} tenglik ayniyatdir.`,
      true,
      `2m sin²α + m(1 − 2sin²α) = m.`,
    );
  }

  // 5) 2cos^2 - 1, 1 - 2sin^2 va sin a ± cos a = s dan sin 2a (300, 302, 306-mashqlar)
  for (const ang of [
    { deg: "15°", rad: "π/12", c2: "√3/2", s2: "1/2" },
    { deg: "22,5°", rad: "π/8", c2: "√2/2", s2: "√2/2" },
    { deg: "30°", rad: "π/6", c2: "1/2", s2: "√3/2" },
    { deg: "45°", rad: "π/4", c2: "0", s2: "1" },
    { deg: "60°", rad: "π/3", c2: "−1/2", s2: "√3/2" },
    { deg: "75°", rad: "5π/12", c2: "−√3/2", s2: "1/2" },
  ]) {
    b.addChoice(
      `2cos²(${ang.deg}) − 1 ifodaning qiymatini hisoblang.`,
      ang.c2,
      pickStrDistractors(ang.c2, TRIG_ALL_VALS),
      `2cos²α − 1 = cos 2α ⇒ cos(2·${ang.deg}) = ${ang.c2}.`,
    );
    b.addChoice(
      `1 − 2sin²(${ang.rad}) ifoda nimaga teng?`,
      ang.c2,
      pickStrDistractors(ang.c2, TRIG_ALL_VALS),
      `1 − 2sin²α = cos 2α ⇒ cos(2·${ang.rad}) = ${ang.c2}.`,
    );
  }

  for (let den = 2; den <= 10; den++) {
    for (let num = 1; num < den; num++) {
      if (b.count >= 340) break;
      if (gcd(num, den) !== 1) continue;
      const s = fracStr(num, den);
      // (sin a + cos a)^2 = 1 + sin 2a => sin 2a = (num^2 - den^2)/den^2
      const sin2 = fracStr(num * num - den * den, den * den);
      b.addChoice(
        `Agar sin α + cos α = ${s} bo'lsa, sin 2α ni toping.`,
        sin2,
        pickStrDistractors(sin2, [fracStr(den * den - num * num, den * den), s, "0"]),
        `1 + sin 2α = (${s})² ⇒ sin 2α = ${sin2}.`,
      );
      if (b.count < 340) {
        const sin2Minus = fracStr(den * den - num * num, den * den);
        b.addChoice(
          `Agar sin α − cos α = ${s} bo'lsa, sin 2α ni toping.`,
          sin2Minus,
          pickStrDistractors(sin2Minus, [sin2, s, "1"]),
          `1 − sin 2α = (${s})² ⇒ sin 2α = ${sin2Minus}.`,
        );
      }
    }
  }

  for (let k = 2; k <= 30; k++) {
    if (b.count >= 340) break;
    b.addFill(
      `${k}·(cos²(π/8) − sin²(π/8))² ifodaning qiymatini kasrda yozing (masalan: 3/2).`,
      fracStr(k, 2),
      `cos(π/4) = √2/2; kvadrati 1/2 ⇒ javob ${fracStr(k, 2)}.`,
    );
  }

  return b.build();
}

function makeTopic26(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-26-keltirish-formulalari",
    topicTitle: "26-§. Keltirish formulalari",
    title: "26-§. Keltirish formulalari",
    source: "Algebra 9-sinf (2019), III bob, 26-§, 129–135-betlar",
    seed: 9026,
  });

  b.addCards([
    ...commonTrigCards(),
    ["Almashish", "π/2 ± α va 3π/2 ± α da funksiyaning o'zgarishi"],
    ["Saqlanish", "π ± α va 2π ± α da funksiya nomi o'zgarmasligi"],
    ["Qoida", "Ikki qadamli keltirish: nomi va chorak ishorasi"],
    ["sin(π − α)", "sin α ga teng (II chorak, '+' ishora)"],
    ["cos(π − α)", "−cos α ga teng (II chorak, '−' ishora)"],
    ["sin(π/2 − α)", "cos α ga teng (I chorak)"],
    ["cos(π/2 − α)", "sin α ga teng (I chorak)"],
    ["sin(π/2 + α)", "cos α ga teng (II chorak)"],
    ["cos(π/2 + α)", "−sin α ga teng (II chorak)"],
    ["tg(π − α)", "−tg α ga teng"],
    ["tg(π + α)", "tg α ga teng (III chorak)"],
    ["cos(2π − α)", "cos α ga teng (IV chorak)"],
    ["sin(3π/2 − α)", "−cos α ga teng (III chorak)"],
    ["sin 150°", "sin(180° − 30°) = sin 30° = 1/2"],
  ]);

  b.addChoice("Keltirish formulalarida qaysi burchaklarda funksiyaning nomi kofunksiyasiga (sin ↔ cos, tg ↔ ctg) o'zgaradi?", "π/2 ± α va 3π/2 ± α larda", ["π ± α va 2π ± α larda", "Faqat 2π − α da", "Hech qachon o'zgarmaydi"], "Vertikal o'q (90° va 270°) nuqtalarida funksiya nomi o'zgaradi.");
  b.addChoice("sin(π/2 + α) ifoda nimaga teng?", "cos α", ["−cos α", "sin α", "−sin α"], "π/2 da sin → cos ga almashadi; o'tkir α uchun π/2+α II chorakda va sin > 0.");
  b.addChoice("cos(π/2 + α) ifoda nimaga teng?", "−sin α", ["sin α", "cos α", "−cos α"], "II chorakda boshlang'ich cos manfiy, shuning uchun −sin α.");
  b.addTF("sin(180° − α) = sin α formulasi barcha α lar uchun o'rinli.", true, "180° da nomi saqlanadi, II chorakda sinus musbat.");
  b.addTF("cos(180° − α) = cos α ga teng.", false, "II chorakda kosinus manfiy bo'lgani uchun cos(180° − α) = −cos α.");

  // 1) Barcha 32 ta asosiy keltirish formulalari (4 ta funksiya * 8 ta bazaviy burchak)
  const bases = [
    { label: "90° − α", rad: "π/2 − α", swap: true, q: 1 },
    { label: "90° + α", rad: "π/2 + α", swap: true, q: 2 },
    { label: "180° − α", rad: "π − α", swap: false, q: 2 },
    { label: "180° + α", rad: "π + α", swap: false, q: 3 },
    { label: "270° − α", rad: "3π/2 − α", swap: true, q: 3 },
    { label: "270° + α", rad: "3π/2 + α", swap: true, q: 4 },
    { label: "360° − α", rad: "2π − α", swap: false, q: 4 },
    { label: "360° + α", rad: "2π + α", swap: false, q: 1 },
  ];
  const fns = ["sin", "cos", "tg", "ctg"] as const;
  const signInQ = (fn: string, q: number): 1 | -1 => {
    if (fn === "sin") return q === 1 || q === 2 ? 1 : -1;
    if (fn === "cos") return q === 1 || q === 4 ? 1 : -1;
    return q === 1 || q === 3 ? 1 : -1;
  };
  const cofn = (fn: string): string => (fn === "sin" ? "cos" : fn === "cos" ? "sin" : fn === "tg" ? "ctg" : "tg");

  for (const bs of bases) {
    for (const fn of fns) {
      const s = signInQ(fn, bs.q);
      const resFn = bs.swap ? cofn(fn) : fn;
      const ans = `${s < 0 ? "−" : ""}${resFn} α`;
      const alt1 = `${s < 0 ? "" : "−"}${resFn} α`;
      const alt2 = `${s < 0 ? "−" : ""}${bs.swap ? fn : cofn(fn)} α`;
      const alt3 = `${s < 0 ? "" : "−"}${bs.swap ? fn : cofn(fn)} α`;

      b.addChoice(
        `${fn}(${bs.rad}) ifodani keltirish formulasi bilan soddalashtiring.`,
        ans,
        [alt1, alt2, alt3],
        `Chorak ${bs.q} da ${fn} ishorasi ${s > 0 ? "+" : "−"}, funksiya nomi ${bs.swap ? "o'zgaradi" : "saqlanadi"}.`,
      );
      b.addChoice(
        `${fn}(${bs.label}) nimaga teng?`,
        ans,
        [alt1, alt2, alt3],
        `Keltirish qoidasiga ko'ra ${fn}(${bs.label}) = ${ans}.`,
      );
    }
  }

  // 2) Katta burchaklarni hisoblash: 390, 405, 420, ..., 1140
  const acutes = [
    { d: 30, sin: "1/2", cos: "√3/2", tg: "√3/3" },
    { d: 45, sin: "√2/2", cos: "√2/2", tg: "1" },
    { d: 60, sin: "√3/2", cos: "1/2", tg: "√3" },
  ];
  for (let turns = 0; turns <= 4; turns++) {
    for (const signQ of [1, 2, 3, 4]) {
      for (const ac of acutes) {
        if (b.count >= 295) break;
        const base =
          signQ === 1 ? ac.d : signQ === 2 ? 180 - ac.d : signQ === 3 ? 180 + ac.d : 360 - ac.d;
        const fullDeg = 360 * turns + base;
        if (fullDeg === ac.d) continue;
        const sSin = signQ <= 2 ? ac.sin : `−${ac.sin}`;
        const sCos = signQ === 1 || signQ === 4 ? ac.cos : `−${ac.cos}`;
        const sTg = signQ === 1 || signQ === 3 ? ac.tg : `−${ac.tg}`;

        b.addChoice(
          `sin(${fullDeg}°) ning qiymatini keltirish formulasi bilan hisoblang.`,
          sSin,
          pickStrDistractors(sSin, TRIG_ALL_VALS),
          `${fullDeg}° ≡ ${base}° (${signQ}-chorak), shu sabab sin(${fullDeg}°) = ${sSin}.`,
        );
        b.addChoice(
          `cos(${fullDeg}°) ning qiymatini toping.`,
          sCos,
          pickStrDistractors(sCos, TRIG_ALL_VALS),
          `cos(${fullDeg}°) = cos(${base}°) = ${sCos}.`,
        );
        if (b.count < 295 && turns <= 2) {
          b.addChoice(
            `tg(${fullDeg}°) ning qiymatini toping.`,
            sTg,
            pickStrDistractors(sTg, TRIG_ALL_VALS),
            `tg(${fullDeg}°) = tg(${base}°) = ${sTg}.`,
          );
        }
      }
    }
  }

  // 3) Keltirish soddalashtirishlari
  for (let m = 2; m <= 50; m++) {
    if (b.count >= 340) break;
    b.addFill(
      `${m}·sin(90° − α) / cos α + ${m} ifodaning qiymatini hisoblang (cos α ≠ 0).`,
      `${2 * m}`,
      `sin(90° − α) = cos α ⇒ ${m}·1 + ${m} = ${2 * m}.`,
    );
  }

  // 4) Keltirish formulasini ko'paytmada soddalashtirish va kasr pi burchaklar (307–317-mashqlar)
  for (let k = 1; k <= 40; k++) {
    if (b.count >= 340) break;
    b.addChoice(
      `sin(90° − α)·cos α − cos(90° + α)·sin α + ${k} ifodaning qiymatini toping.`,
      `${k + 1}`,
      pickNumDistractors(k + 1, [k, k - 1, 2 * k]),
      `sin(90° − α) = cos α, cos(90° + α) = −sin α ⇒ cos²α + sin²α + ${k} = 1 + ${k} = ${k + 1}.`,
    );
    if (b.count < 340) {
      b.addChoice(
        `${k}·tg(π − α) + ${k}·tg α ifoda nimaga teng?`,
        `0`,
        [`${2 * k}·tg α`, `${k}`, `−${k}`],
        `tg(π − α) = −tg α ⇒ −${k}tg α + ${k}tg α = 0.`,
      );
    }
    if (b.count < 340) {
      b.addTF(
        `cos(${2 * k}π − α) = cos α tenglik barcha α lar uchun o'rinli.`,
        true,
        `${2 * k}π to'liq davr bo'lgani uchun cos(2πk − α) = cos(−α) = cos α.`,
      );
    }
  }

  for (let k = 1; k <= 18; k++) {
    if (b.count >= 340) break;
    // tg(k*pi + pi/4) = 1, tg(k*pi - pi/4) = -1
    const radP = `${4 * k + 1}π/4`;
    const radM = `${4 * k - 1}π/4`;
    b.addChoice(
      `tg(${radP}) ning qiymatini keltirish formulasi bilan hisoblang.`,
      `1`,
      [`−1`, `√3`, `0`],
      `${radP} = ${k}π + π/4 ⇒ tg(${k}π + π/4) = tg(π/4) = 1.`,
    );
    if (b.count < 340) {
      b.addChoice(
        `tg(${radM}) ning qiymati nechaga teng?`,
        `−1`,
        [`1`, `−√3`, `0`],
        `${radM} = ${k}π − π/4 ⇒ tg(${k}π − π/4) = −tg(π/4) = −1.`,
      );
    }
  }

  return b.build();
}

function makeTopic27(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-27-yigindi-ayirma",
    topicTitle: "27-§. Sinuslar va kosinuslar yig'indisi hamda ayirmasi",
    title: "27-§. Sinuslar va kosinuslar yig'indisi hamda ayirmasi (III bob yakuni)",
    source: "Algebra 9-sinf (2019), III bob, 27-§, 135–149-betlar",
    seed: 9027,
  });

  b.addCards([
    ...commonTrigCards(),
    ["Beruniy", "Yer radiusini 6372,91 km aniqlikda hisoblagan olim"],
    ["Ulug'bek", "sin 1° ni 18 xona aniqlikkacha hisoblagan alloma"],
    ["Koshiy", "π sonini 16 kasr xonasigacha aniqlagan alloma"],
    ["sin α + sin β", "2 sin((α+β)/2) cos((α−β)/2)"],
    ["sin α − sin β", "2 sin((α−β)/2) cos((α+β)/2)"],
    ["cos α + cos β", "2 cos((α+β)/2) cos((α−β)/2)"],
    ["cos α − cos β", "−2 sin((α+β)/2) sin((α−β)/2)"],
    ["sin 75° + sin 15°", "2 sin 45° cos 30° = √6 / 2"],
    ["cos 75° + cos 15°", "2 cos 45° cos 30° = √6 / 2"],
    ["cos 75° − cos 15°", "−2 sin 45° sin 30° = −√2 / 2"],
    ["sin 75° − sin 15°", "2 sin 30° cos 45° = √2 / 2"],
    ["sin α + cos α", "√2 · sin(α + 45°) ga teng"],
    ["Zij jadvali", "Ulug'bekning Samarqanddagi trigonometrik jadvallari"],
    ["III bob test", "Trigonometriya asosiy formulalari yakuni"],
  ]);

  b.addChoice("sin α + sin β yig'indini ko'paytmaga keltirish formulasi qaysi?", "2 sin((α+β)/2) cos((α−β)/2)", ["2 cos((α+β)/2) cos((α−β)/2)", "2 sin((α−β)/2) cos((α+β)/2)", "−2 sin((α+β)/2) sin((α−β)/2)"], "sin α + sin β = 2 sin((α+β)/2) cos((α−β)/2).");
  b.addChoice("cos α − cos β ayirmani ko'paytmaga keltirish formulasi qaysi?", "−2 sin((α+β)/2) sin((α−β)/2)", ["2 cos((α+β)/2) cos((α−β)/2)", "2 sin((α+β)/2) sin((α−β)/2)", "2 sin((α−β)/2) cos((α+β)/2)"], "cos α − cos β = −2 sin((α+β)/2) sin((α−β)/2).");
  b.addChoice("Abu Rayhon Beruniy trigonometriya yordamida Yer sharining radiusini taxminan necha km deb hisoblagan (darslik tarixiy ma'lumoti)?", "6372,91 km", ["5120 km", "7450 km", "3840 km"], "Darslikdagi tarixiy ma'lumotga ko'ra Beruniy Yer radiusini ~6372,91 km deb topgan.");
  b.addChoice("Samarqandda sin 1° qiymatini o'ta yuqori aniqlikda hisoblagan buyuk o'zbek astronomi kim?", "Mirzo Ulug'bek", ["Al-Xorazmiy", "Ibn Sino", "Al-Farg'oniy"], "Mirzo Ulug'bek rasadxonasida sin 1° jadvallari 18 xonali aniqlikkacha tuzilgan.");
  b.addChoice("π sonini verguldan keyin 16 xona aniqlikkacha hisoblagan alloma kim?", "G'iyosiddin al-Koshiy", ["Pifagor", "Evklid", "Arximed"], "G'iyosiddin Jamshid al-Koshiy «Aylana haqida risola»sida π ni 16 xonagacha hisoblagan.");
  b.addTF("cos α + cos β = 2 cos((α+β)/2) cos((α−β)/2) formulasi o'rinlidir.", true, "Kosinuslar yig'indisining ko'paytma formulasi.");

  // 1) sin A ± sin B va cos A ± cos B (bunda (A+B)/2 yoki (A-B)/2 0,30,45,60,90 ga tushadi)
  const validPairs: { a: number; c: number; mid: number; halfDiff: number }[] = [];
  const nice = [0, 30, 45, 60, 90, 120, 135, 150, 180];
  for (const mid of nice) {
    for (const halfDiff of [15, 30, 45, 60]) {
      const a = mid + halfDiff;
      const c = mid - halfDiff;
      if (c > 0 && a <= 180) validPairs.push({ a, c, mid, halfDiff });
    }
  }

  for (const vp of validPairs) {
    const angMid = SPECIAL_ANGLES.find((x) => x.deg === vp.mid);
    const angDiff = SPECIAL_ANGLES.find((x) => x.deg === vp.halfDiff);
    if (!angMid || !angDiff) continue;
    // Also check exact cases where sin(mid) or cos(mid) is simple (1/2, 1, 0)
    if (angMid.deg === 30) {
      // 2*sin(30)*cos(halfDiff) = cos(halfDiff)
      b.addChoice(
        `sin ${vp.a}° + sin ${vp.c}° ifodani ko'paytmaga keltirib hisoblang.`,
        angDiff.cos,
        pickStrDistractors(angDiff.cos, TRIG_ALL_VALS),
        `2 sin 30° cos ${vp.halfDiff}° = 2·½·cos ${vp.halfDiff}° = ${angDiff.cos}.`,
      );
    }
    if (angMid.deg === 60) {
      // 2*cos(60)*cos(halfDiff) = cos(halfDiff)
      b.addChoice(
        `cos ${vp.a}° + cos ${vp.c}° ifodani hisoblang.`,
        angDiff.cos,
        pickStrDistractors(angDiff.cos, TRIG_ALL_VALS),
        `2 cos 60° cos ${vp.halfDiff}° = 2·½·cos ${vp.halfDiff}° = ${angDiff.cos}.`,
      );
    }
    if (angMid.deg === 90) {
      // cos(90)=0 => cos A + cos C = 0; sin A - sin C = 0
      b.addFill(
        `cos ${vp.a}° + cos ${vp.c}° ifodaning qiymatini toping.`,
        `0`,
        `2 cos 90° cos ${vp.halfDiff}° = 0.`,
      );
      b.addFill(
        `sin ${vp.a}° − sin ${vp.c}° ifodaning qiymatini toping.`,
        `0`,
        `2 sin ${vp.halfDiff}° cos 90° = 0.`,
      );
    }
    if (vp.halfDiff === 30) {
      // sin A - sin C = 2*sin 30 * cos mid = cos mid
      b.addChoice(
        `sin ${vp.a}° − sin ${vp.c}° ifodani hisoblang.`,
        angMid.cos,
        pickStrDistractors(angMid.cos, TRIG_ALL_VALS),
        `2 sin 30° cos ${vp.mid}° = cos ${vp.mid}° = ${angMid.cos}.`,
      );
      // cos A - cos C = -2*sin mid * sin 30 = -sin mid
      const negSinMid = angMid.sin === "0" ? "0" : angMid.sin.startsWith("−") ? angMid.sin.slice(1) : `−${angMid.sin}`;
      b.addChoice(
        `cos ${vp.a}° − cos ${vp.c}° ifodani hisoblang.`,
        negSinMid,
        pickStrDistractors(negSinMid, TRIG_ALL_VALS),
        `−2 sin ${vp.mid}° sin 30° = −sin ${vp.mid}° = ${negSinMid}.`,
      );
    }
  }

  // 2) Ko'paytmani yig'indiga aylantirish va nisbatlar (sin A + sin B) / (cos A + cos B) = tg((A+B)/2)
  for (let a = 10; a <= 70; a += 5) {
    for (let c = 10; c <= 70; c += 5) {
      if (b.count >= 295) break;
      if (a === c) continue;
      const sum = a + c;
      const mid = sum / 2;
      const matchM = SPECIAL_ANGLES.find((x) => x.deg === mid);
      if (matchM && matchM.tg !== null) {
        b.addChoice(
          `(sin ${a}° + sin ${c}°) / (cos ${a}° + cos ${c}°) nisbatning qiymatini toping.`,
          matchM.tg,
          pickStrDistractors(matchM.tg, TRIG_ALL_VALS),
          `Bu nisbat tg((${a}° + ${c}°)/2) = tg(${mid}°) = ${matchM.tg} ga teng.`,
        );
      }
      if (a < c && (c - a) % 2 === 0) {
        b.addChoice(
          `sin ${c}° + sin ${a}° ifodani ko'paytma shaklida yozing.`,
          `2 sin ${mid}° cos ${(c - a) / 2}°`,
          [
            `2 cos ${mid}° cos ${(c - a) / 2}°`,
            `2 sin ${(c - a) / 2}° cos ${mid}°`,
            `−2 sin ${mid}° sin ${(c - a) / 2}°`,
          ],
          `(c+a)/2 = ${mid}°, (c−a)/2 = ${(c - a) / 2}° ⇒ 2 sin ${mid}° cos ${(c - a) / 2}°.`,
        );
      }
    }
  }

  // 3) Koeffitsiyentli nisbatlar k*(sin x + sin y)/(cos x + cos y)
  for (let k = 2; k <= 50; k++) {
    if (b.count >= 340) break;
    b.addFill(
      `${k}·(sin 50° + sin 40°) / (cos 50° + cos 40°) ifodaning qiymatini hisoblang.`,
      `${k}`,
      `(sin 50° + sin 40°)/(cos 50° + cos 40°) = tg 45° = 1 ⇒ javob ${k}.`,
    );
    if (b.count < 340) {
      b.addTF(
        `(sin ${k}° + sin ${90 - k}°) / (cos ${k}° + cos ${90 - k}°) = 1 tenglik to'g'ri.`,
        true,
        `Burchaklar o'rta arifmetigi 45°, tg 45° = 1.`,
      );
    }
  }

  // 4) sin(A)±sin(B) va cos(A)±cos(B) aralash hamda tg a ± tg b = sin(a±b)/(cos a cos b) (326, 348-mashqlar + III bob test)
  for (let k = 2; k <= 40; k++) {
    if (b.count >= 340) break;
    b.addChoice(
      `${k}·(cos 20° − cos 40°) / (sin 20° + sin 40°) ifoda nimaga teng?`,
      `${k}·tg 10°`,
      [`−${k}·tg 10°`, `${k}·ctg 10°`, `${k}`],
      `(2 sin 30° sin 10°) / (2 sin 30° cos 10°) = tg 10° ⇒ ${k}·tg 10°.`,
    );
    if (b.count < 340) {
      b.addChoice(
        `${2 * k}·sin 75° · cos 15° − ${k}·sin 60° ifodaning qiymatini soddalashtiring.`,
        `${k}`,
        pickNumDistractors(k, [0, 2 * k, k + 1]),
        `2 sin 75° cos 15° = sin 90° + sin 60° = 1 + sin 60° ⇒ ${k}(1 + sin 60°) − ${k}sin 60° = ${k}.`,
      );
    }
    if (b.count < 340) {
      b.addChoice(
        `${2 * k}·cos 75° · cos 15° − ${k}·cos 60° ifodaning qiymatini hisoblang.`,
        `0`,
        [`${k}`, `${2 * k}`, `−${k}`],
        `2 cos 75° cos 15° = cos 90° + cos 60° = cos 60° ⇒ ayirma 0.`,
      );
    }
    if (b.count < 340) {
      b.addTF(
        `(sin ${k}° + sin ${60 - k > 0 ? 60 - k : k + 60}°) ifodani ko'paytmaga keltirganda musbat qiymat chiqadi.`,
        true,
        `I chorak burchaklari uchun sinuslar musbat, yig'indisi ham musbat.`,
      );
    }
    if (b.count < 340) {
      b.addFill(
        `2·sin(45° + ${k}°)·cos(45° + ${k}°) − cos(${2 * k}°) ifodani hisoblang.`,
        `0`,
        `sin(90° + ${2 * k}°) = cos(${2 * k}°) ⇒ cos(${2 * k}°) − cos(${2 * k}°) = 0.`,
      );
    }
  }

  return b.build();
}

export function buildTopics13To27(): QuizOutput[] {
  return [
    makeTopic13(),
    makeTopic14(),
    makeTopic15(),
    makeTopic16(),
    makeTopic17(),
    makeTopic18(),
    makeTopic19(),
    makeTopic20(),
    makeTopic21(),
    makeTopic22(),
    makeTopic23(),
    makeTopic24(),
    makeTopic25(),
    makeTopic26(),
    makeTopic27(),
  ];
}
