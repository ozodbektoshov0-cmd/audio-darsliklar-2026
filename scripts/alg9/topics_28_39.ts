import {
  TopicBuilder,
  fracStr,
  gcd,
  pickNumDistractors,
  pickStrDistractors,
  type QuizOutput,
} from "./core.ts";

function makeTopic28(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-28-ketma-ketliklar",
    topicTitle: "28-§. Sonli ketma-ketliklar",
    title: "28-§. Sonli ketma-ketliklar",
    source: "Algebra 9-sinf (2019), IV bob, 28-§, 150–153-betlar",
    seed: 9028,
  });

  b.addCards([
    ["Ketma", "Natural sonlarga mos sonlar tartibi (a₁, a₂, ...)"],
    ["Tartib", "Hadning ketma-ketlikdagi o'rni (n ∈ N)"],
    ["Umumiy", "aₙ = f(n) ko'rinishidagi formula"],
    ["Rekurrent", "Keyingi hadni oldingilar orqali berish usuli"],
    ["Fibonachchi", "Har bir hadi oldingi ikki had yig'indisi bo'lgan ketma-ketlik"],
    ["Cheksiz", "Hadlari tugamaydigan ketma-ketlik"],
    ["Chekli", "Ma'lum n ta haddan iborat ketma-ketlik"],
    ["Monoton", "Faqat o'suvchi yoki faqat kamayuvchi ketma-ketlik"],
    ["O'suvchi", "aₙ₊₁ > aₙ shartini bajaruvchi ketma-ketlik"],
    ["Kamayuvchi", "aₙ₊₁ < aₙ shartini bajaruvchi ketma-ketlik"],
    ["aₙ belgisi", "Ketma-ketlikning n-hadi"],
    ["Analitik usul", "Umumiy had formulasi orqali berish"],
    ["So'z bilan", "Masalan: tub sonlar ketma-ketligi"],
    ["aₙ = n²", "Natural sonlar kvadratlari: 1, 4, 9, 16..."],
    ["aₙ = 2n", "Juft natural sonlar ketma-ketligi"],
    ["aₙ = 2n − 1", "Toq natural sonlar ketma-ketligi"],
    ["aₙ = (−1)ⁿ", "Ishora almashinuvchi −1, 1, −1, 1..."],
    ["Fibonachchi sonlari", "1, 1, 2, 3, 5, 8, 13, 21, 34..."],
    ["Chegaralangan", "Barcha hadlari |aₙ| ≤ M shartini qanoatlantiradi"],
    ["a₁", "Ketma-ketlikning birinchi hadi"],
    ["n indeks", "Faqat natural son qiymatlarini qabul qiladi (1, 2, 3...)"],
    ["O'zgarmas", "Barcha hadlari teng bo'lgan ketma-ketlik"],
    ["Natural sonlar", "1, 2, 3, 4, 5, ... cheksiz ketma-ketligi"],
    ["Juft hadlar", "Indeksi 2, 4, 6, ... bo'lgan hadlar"],
  ]);

  b.addChoice("Sonli ketma-ketlikning ta'rifi qaysi?", "Natural argumentli funksiya (n ∈ N ga mos aₙ sonlar)", ["Ixtiyoriy tartibsiz sonlar to'plami", "Faqat manfiy sonlar guruhi", "Kvadrat tenglamalar sistemasi"], "Ketma-ketlik — natural sonlar to'plami N da aniqlangan sonli funksiya.");
  b.addChoice("Har bir hadi o'zidan oldingi ikki hadning yig'indisiga teng bo'lgan mashhur ketma-ketlik qaysi?", "Fibonachchi ketma-ketligi", ["Arifmetik", "Garmonik", "Trigonometrik"], "1, 1, 2, 3, 5, 8, 13... — Fibonachchi ketma-ketligi (aₙ₊₂ = aₙ₊₁ + aₙ).");
  b.addTF("Ketma-ketlik hadining n tartib raqami faqat natural son bo'lishi mumkin.", true, "Hadlar n = 1, 2, 3, ... natural sonlar bilan raqamlanadi.");
  b.addTF("Agar barcha n ∈ N uchun aₙ₊₁ < aₙ bo'lsa, ketma-ketlik o'suvchi deyiladi.", false, "aₙ₊₁ < aₙ bo'lsa ketma-ketlik kamayuvchi bo'ladi.");

  // 1) a_n = k*n + b ning hadini va n ni topish
  for (let k = 2; k <= 9; k++) {
    for (let m = -5; m <= 9; m++) {
      if (b.count >= 165) break;
      const formula = `aₙ = ${k}n ${m >= 0 ? `+ ${m}` : `− ${Math.abs(m)}`}`;
      const n = 3 + ((k + Math.abs(m)) % 10);
      const val = k * n + m;
      if ((k + Math.abs(m)) % 3 === 0) {
        b.addFill(
          `${formula} formula bilan berilgan ketma-ketlikning ${n}-hadini toping.`,
          `${val}`,
          `a_${n} = ${k}·${n} + (${m}) = ${val}.`,
        );
      } else if ((k + Math.abs(m)) % 3 === 1) {
        b.addChoice(
          `${formula} ketma-ketlikning a_${n} hadi nimaga teng?`,
          `${val}`,
          pickNumDistractors(val, [val + k, val - k, k * (n + 1)]),
          `n = ${n} qo'yganda ${k}·${n} + (${m}) = ${val}.`,
        );
      } else {
        b.addFill(
          `${formula} ketma-ketlikning nechanchi hadi ${val} ga teng?`,
          `${n}`,
          `${k}n + (${m}) = ${val} ⇒ ${k}n = ${k * n} ⇒ n = ${n}.`,
        );
      }
    }
  }

  // 2) a_n = n^2 + c yoki n(n+1)
  for (let c = -6; c <= 12; c++) {
    for (let n = 2; n <= 9; n++) {
      if (b.count >= 260) break;
      const val = n * n + c;
      const f = c === 0 ? "aₙ = n²" : `aₙ = n² ${c > 0 ? `+ ${c}` : `− ${Math.abs(c)}`}`;
      if ((n + Math.abs(c)) % 2 === 0) {
        b.addChoice(
          `${f} ketma-ketlikning ${n}-hadi nechaga teng?`,
          `${val}`,
          pickNumDistractors(val, [val + 2, 2 * n + c, (n + 1) ** 2 + c]),
          `${n}² + (${c}) = ${val}.`,
        );
      } else {
        b.addTF(
          `${f} ketma-ketlikning ${n}-hadi ${val} ga teng.`,
          true,
          `n = ${n} da ${n}² + (${c}) = ${val}.`,
        );
      }
    }
  }

  // 3) Rekurrent ketma-ketliklar a_{n+1} = p*a_n + q
  for (let a1 = 1; a1 <= 8; a1++) {
    for (let p = 2; p <= 4; p++) {
      for (let q = -3; q <= 5; q++) {
        if (b.count >= 340) break;
        const a2 = p * a1 + q;
        const a3 = p * a2 + q;
        const rec = `a₁ = ${a1}, aₙ₊₁ = ${p}aₙ ${q >= 0 ? `+ ${q}` : `− ${Math.abs(q)}`}`;
        if ((a1 + p + Math.abs(q)) % 2 === 0) {
          b.addChoice(
            `${rec} rekurrent ketma-ketlikning uchinchi hadi (a₃) ni toping.`,
            `${a3}`,
            pickNumDistractors(a3, [a2, a3 + p, a3 - 1]),
            `a₂ = ${p}·${a1} + (${q}) = ${a2}; a₃ = ${p}·${a2} + (${q}) = ${a3}.`,
          );
        } else {
          b.addFill(
            `${rec} ketma-ketlikning ikkinchi hadi (a₂) ni toping.`,
            `${a2}`,
            `a₂ = ${p}·${a1} + (${q}) = ${a2}.`,
          );
        }
      }
    }
  }

  return b.build();
}

function makeTopic29(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-29-arifmetik-progressiya",
    topicTitle: "29-§. Arifmetik progressiya",
    title: "29-§. Arifmetik progressiya",
    source: "Algebra 9-sinf (2019), IV bob, 29-§, 153–157-betlar",
    seed: 9029,
  });

  b.addCards([
    ["Progressiya", "Ma'lum qonuniyat bilan o'zgaruvchi sonlar ketma-ketligi"],
    ["Arifmetik", "Har bir had oldingisiga o'zgarmas d qo'shishdan hosil"],
    ["Ayirma", "Qo'shni hadlar farqi d = aₙ₊₁ − aₙ"],
    ["Umumiy", "aₙ = a₁ + (n − 1)d formulasi"],
    ["O'suvchi", "Ayirmasi d > 0 bo'lgan arifmetik progressiya"],
    ["Kamayuvchi", "Ayirmasi d < 0 bo'lgan arifmetik progressiya"],
    ["O'rtacha", "Har bir had qo'shnilarining o'rta arifmetigi"],
    ["Xarakteristik", "aₙ = (aₙ₋₁ + aₙ₊₁) / 2 xossasi"],
    ["Indeks", "Hadlar yig'indisi m + k = p + r da a_m+a_k = a_p+a_r"],
    ["Musbat", "aₙ > 0 shartini bajaruvchi hadlar"],
    ["aₙ = a₁ + (n−1)d", "Arifmetik progressiya n-hadi formulasi"],
    ["d = aₙ₊₁ − aₙ", "Arifmetik progressiya ayirmasi"],
    ["d = (aₘ − aₖ)/(m − k)", "Ixtiyoriy ikki had orqali ayirmani topish"],
    ["aₙ = (aₙ₋₁+aₙ₊₁)/2", "Xarakteristik xossa formulasi"],
    ["d = 0 holi", "O'zgarmas (barcha hadlari teng) progressiya"],
    ["a₁ = 2, d = 3", "2, 5, 8, 11, 14, ... progressiya"],
    ["Teskari qadam", "a₁ = aₙ − (n − 1)d"],
    ["Qo'shni hadlar", "Bir-biridan aynan d ga farq qiladi"],
    ["O'rta arifmetik", "Ikki son orasiga arifmetik progressiya hadini qo'yish"],
    ["a₁₀ − a₄", "6·d ga teng ayirma"],
    ["a₃ + a₇", "a₁ + a₉ yoki 2·a₅ ga teng"],
    ["Birinchi manfiy had", "aₙ < 0 tengsizlikdan topiladi"],
    ["Oxirgi musbat had", "aₙ > 0 shartidan topiladigan eng katta n"],
    ["1, 3, 5, 7...", "d = 2 ayirmali toq sonlar progressiyasi"],
  ]);

  b.addChoice("Arifmetik progressiyaning n-had formulasi qaysi?", "aₙ = a₁ + (n − 1)d", ["aₙ = a₁ + nd", "aₙ = a₁ · dⁿ⁻¹", "aₙ = (a₁ + d)n"], "aₙ = a₁ + (n − 1)d — arifmetik progressiya umumiy hadi.");
  b.addChoice("Arifmetik progressiyaning ixtiyoriy uchta ketma-ket hadi uchun xarakteristik xossa qaysi?", "aₙ = (aₙ₋₁ + aₙ₊₁) / 2", ["aₙ² = aₙ₋₁ · aₙ₊₁", "aₙ = aₙ₋₁ + aₙ₊₁", "aₙ = √(aₙ₋₁ · aₙ₊₁)"], "Har bir had o'z qo'shnilarining o'rta arifmetigiga teng.");
  b.addTF("Arifmetik progressiyada ayirma d > 0 bo'lsa, u o'suvchi progressiya bo'ladi.", true, "Har safar musbat d soni qo'shilgani uchun aₙ₊₁ > aₙ.");
  b.addTF("a₁ + a₁₀ = a₄ + a₇ tenglik har qanday arifmetik progressiyada to'g'ri.", true, "1 + 10 = 4 + 7 = 11 bo'lgani uchun yig'indilar 2a₁ + 9d ga teng.");

  // 1) a_1, d, n -> a_n va teskari d topish
  for (let a1 = -5; a1 <= 12; a1++) {
    for (let d = -4; d <= 8; d++) {
      if (d === 0 || b.count >= 210) continue;
      const n = 5 + ((Math.abs(a1) + Math.abs(d)) % 12);
      const an = a1 + (n - 1) * d;
      const mode = (Math.abs(a1) + Math.abs(d)) % 4;
      if (mode === 0) {
        b.addChoice(
          `Arifmetik progressiyada a₁ = ${a1}, d = ${d}. Uning a_${n} hadini toping.`,
          `${an}`,
          pickNumDistractors(an, [an + d, an - d, a1 + n * d]),
          `a_${n} = ${a1} + (${n} − 1)·(${d}) = ${an}.`,
        );
      } else if (mode === 1) {
        b.addFill(
          `Arifmetik progressiyada a₁ = ${a1}, d = ${d} bo'lsa, a_${n} ni hisoblang.`,
          `${an}`,
          `a_${n} = ${a1} + ${n - 1}·(${d}) = ${an}.`,
        );
      } else if (mode === 2) {
        b.addChoice(
          `a₁ = ${a1}, a_${n} = ${an} bo'lgan arifmetik progressiyaning ayirmasi d ni toping.`,
          `${d}`,
          pickNumDistractors(d, [d + 1, d - 1, -d]),
          `d = (a_${n} − a₁) / (${n} − 1) = (${an} − (${a1})) / ${n - 1} = ${d}.`,
        );
      } else {
        b.addFill(
          `a₁ = ${a1}, d = ${d} arifmetik progressiyaning nechanchi hadi ${an} ga teng?`,
          `${n}`,
          `n = (${an} − (${a1}))/(${d}) + 1 = ${n}.`,
        );
      }
    }
  }

  // 2) Xarakteristik xossa a_{n-1}, a_n, a_{n+1}
  for (let x = -6; x <= 20; x++) {
    for (let d = 2; d <= 7; d++) {
      if (b.count >= 290) break;
      const mid = x + d;
      const right = x + 2 * d;
      b.addChoice(
        `${x}; y; ${right} sonlari arifmetik progressiyaning ketma-ket hadlari bo'lsa, y ni toping.`,
        `${mid}`,
        pickNumDistractors(mid, [mid + 1, mid - 1, right - x]),
        `y = (${x} + ${right}) / 2 = ${mid}.`,
      );
    }
  }

  // 3) a_k va a_m berilganda d va boshqa had topish
  for (let a1 = 1; a1 <= 10; a1++) {
    for (let d = 2; d <= 6; d++) {
      if (b.count >= 340) break;
      const a3 = a1 + 2 * d;
      const a7 = a1 + 6 * d;
      const a5 = a1 + 4 * d;
      b.addFill(
        `Arifmetik progressiyada a₃ = ${a3}, a₇ = ${a7}. Uning a₅ hadini toping.`,
        `${a5}`,
        `a₅ = (a₃ + a₇)/2 = (${a3} + ${a7})/2 = ${a5}.`,
      );
    }
  }

  return b.build();
}

function makeTopic30(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-30-arifmetik-yigindi",
    topicTitle: "30-§. Arifmetik progressiya dastlabki n ta hadining yig'indisi",
    title: "30-§. Arifmetik progressiya dastlabki n ta hadining yig'indisi",
    source: "Algebra 9-sinf (2019), IV bob, 30-§, 158–161-betlar",
    seed: 9030,
  });

  b.addCards([
    ["Yig'indi", "Sₙ = a₁ + a₂ + ... + aₙ dastlabki n had summasi"],
    ["Gauss", "1 + 2 + ... + 100 = 5050 usulini topgan mashhur matematik"],
    ["Birinchi", "a₁ va oxirgi aₙ hadlar yig'indisining yarmi × n"],
    ["Amfiteatr", "Qatorlar bo'yicha o'rinlar sonini hisoblash masalasi"],
    ["Sₙ (1-formula)", "Sₙ = ((a₁ + aₙ) / 2) · n"],
    ["Sₙ (2-formula)", "Sₙ = ((2a₁ + (n − 1)d) / 2) · n"],
    ["1+2+...+n", "Dastlabki n ta natural son yig'indisi n(n+1)/2"],
    ["Toq sonlar summasi", "1 + 3 + ... + (2n − 1) = n²"],
    ["Juft sonlar summasi", "2 + 4 + ... + 2n = n(n + 1)"],
    ["aₙ = Sₙ − Sₙ₋₁", "Yig'indi formulasi orqali n-hadni topish"],
    ["Karl Gauss", "Nemis matematigi, yig'indi usuli muallifi"],
    ["S₁₀ (1..10)", "55 ga teng yig'indi"],
    ["S₁₀₀ (1..100)", "5050 ga teng yig'indi"],
    ["O'rtacha had", "Sₙ / n = (a₁ + aₙ)/2"],
    ["a₁ + aₙ", "2·Sₙ / n ga teng"],
    ["To'g'ri burchakli", "Uchburchak va amfiteatr qatorlari yig'indisi"],
    ["So'at bongi", "12 soatda uriladigan bonglar yig'indisi 78"],
    ["Qarz to'lash", "Har oy bir xil ortuvchi to'lovlar yig'indisi"],
    ["Sₙ = an² + bn", "Arifmetik progressiya yig'indisining kvadratik shakli"],
    ["d = 2a", "Sₙ = an² + bn da ayirma d = 2a"],
    ["2a₁ + (n−1)d", "Ikkinchi Sₙ formulasidagi surat ifodasi"],
    ["Natural yig'indi", "Birinchi 20 ta natural son yig'indisi 210"],
    ["Toq yig'indi", "Dastlabki 10 ta toq son yig'indisi 100"],
    ["Sₙ − Sₙ₋₁", "n > 1 da aₙ hadni beradi"],
  ]);

  b.addChoice("Arifmetik progressiya dastlabki n ta hadining yig'indisi Sₙ qaysi formula bilan topiladi?", "Sₙ = (a₁ + aₙ)·n / 2", ["Sₙ = (a₁ + aₙ)·n", "Sₙ = (2a₁ + nd)·n", "Sₙ = (a₁ − aₙ)·n / 2"], "Dastlabki n ta had yig'indisi birinchi va oxirgi hadlar o'rtachasini n ga ko'paytirishga teng.");
  b.addChoice("Dastlabki n ta toq natural son yig'indisi 1 + 3 + 5 + ... + (2n − 1) nimaga teng?", "n²", ["n(n + 1)", "n(n + 1)/2", "2n²"], "a₁ = 1, d = 2 da Sₙ = (2 + 2(n−1))·n/2 = n².");
  b.addTF("1 + 2 + 3 + ... + 100 yig'indi 5050 ga teng.", true, "100 · 101 / 2 = 5050.");
  b.addTF("Arifmetik progressiyada aₙ = Sₙ − Sₙ₋₁ (n ≥ 2) tenglik har doim bajariladi.", true, "Sₙ = Sₙ₋₁ + aₙ bo'lgani uchun ayirma aynan aₙ ni beradi.");

  // 1) a_1, d, n -> S_n hisoblash
  for (let a1 = 1; a1 <= 10; a1++) {
    for (let d = 1; d <= 6; d++) {
      for (let n = 4; n <= 12; n += 2) {
        if (b.count >= 175) break;
        const sn = ((2 * a1 + (n - 1) * d) * n) / 2;
        if ((a1 + d + n) % 3 === 0) {
          b.addFill(
            `Arifmetik progressiyada a₁ = ${a1}, d = ${d}. Dastlabki ${n} ta had yig'indisi S_${n} ni toping.`,
            `${sn}`,
            `S_${n} = (2·${a1} + ${n - 1}·${d})·${n}/2 = ${sn}.`,
          );
        } else {
          b.addChoice(
            `a₁ = ${a1}, d = ${d} arifmetik progressiyaning dastlabki ${n} ta hadi yig'indisini toping.`,
            `${sn}`,
            pickNumDistractors(sn, [sn + n, sn - n, sn + d]),
            `S_${n} = ((2·${a1} + ${n - 1}·${d})/2)·${n} = ${sn}.`,
          );
        }
      }
    }
  }

  // 2) a_1 va a_n berilganda S_n
  for (let n = 6; n <= 30; n += 2) {
    for (let a1 = 2; a1 <= 10; a1 += 2) {
      if (b.count >= 255) break;
      const an = a1 + (n - 1) * 3;
      const sn = ((a1 + an) * n) / 2;
      b.addChoice(
        `Arifmetik progressiyada a₁ = ${a1}, a_${n} = ${an} bo'lsa, S_${n} nechaga teng?`,
        `${sn}`,
        pickNumDistractors(sn, [sn + n, (a1 + an) * n, sn - 5]),
        `S_${n} = (${a1} + ${an})·${n}/2 = ${sn}.`,
      );
    }
  }

  // 3) Natural, toq, juft sonlar yig'indisi va S_n = an^2 + bn dan a_k topish
  for (let n = 5; n <= 50; n++) {
    if (b.count >= 340) break;
    const natSum = (n * (n + 1)) / 2;
    const oddSum = n * n;
    const evenSum = n * (n + 1);
    if (n % 3 === 0) {
      b.addFill(
        `1 + 2 + 3 + ... + ${n} yig'indini hisoblang.`,
        `${natSum}`,
        `S = ${n}·${n + 1}/2 = ${natSum}.`,
      );
    } else if (n % 3 === 1) {
      b.addChoice(
        `Dastlabki ${n} ta toq natural sonning yig'indisini toping.`,
        `${oddSum}`,
        pickNumDistractors(oddSum, [natSum, evenSum, oddSum + n]),
        `Dastlabki n ta toq son yig'indisi n² = ${n}² = ${oddSum}.`,
      );
    } else {
      b.addTF(
        `Dastlabki ${n} ta juft natural sonning yig'indisi ${evenSum} ga teng.`,
        true,
        `2 + 4 + ... + ${2 * n} = ${n}(${n} + 1) = ${evenSum}.`,
      );
    }
  }

  // 4) a_2 + a_{n-1} xossasi (386–387-mashqlar), S_n = a*n^2 + b*n dan d = 2a va yog'och taxlash (385-mashq)
  for (let a = 1; a <= 6; a++) {
    for (let c = 1; c <= 12; c++) {
      if (b.count >= 340) break;
      const a1 = a + c;
      const d = 2 * a;
      b.addChoice(
        `Arifmetik progressiya dastlabki n ta hadi yig'indisi Sₙ = ${a === 1 ? "" : a}n² + ${c}n bo'lsa, progressiyaning ayirmasi d ni toping.`,
        `${d}`,
        pickNumDistractors(d, [a, c, a1]),
        `a₁ = S₁ = ${a1}, S₂ = ${4 * a + 2 * c} ⇒ a₂ = S₂ − S₁ = ${3 * a + c} ⇒ d = a₂ − a₁ = ${d}.`,
      );
      if (b.count < 340) {
        b.addFill(
          `Amfiteatrda ${c + 6} ta qator bo'lib, har keyingi qatorda oldingisidan ${a + 1} ta ko'p o'rin bor. 1-qatorda 10 ta o'rin bo'lsa, jami o'rinlar sonini toping.`,
          `${((2 * 10 + (c + 5) * (a + 1)) * (c + 6)) / 2}`,
          `S_${c + 6} = (2·10 + ${c + 5}·${a + 1})·${c + 6}/2 = ${((2 * 10 + (c + 5) * (a + 1)) * (c + 6)) / 2}.`,
        );
      }
    }
  }

  return b.build();
}

function makeTopic31(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-31-geometrik-progressiya",
    topicTitle: "31-§. Geometrik progressiya",
    title: "31-§. Geometrik progressiya",
    source: "Algebra 9-sinf (2019), IV bob, 31-§, 162–167-betlar",
    seed: 9031,
  });

  b.addCards([
    ["Geometrik", "Har bir had oldingisini q songa ko'paytirishdan olinadi"],
    ["Maxraj", "bₙ₊₁ / bₙ = q o'zgarmas ko'paytuvchi"],
    ["Nolmas", "Geometrik progressiyaning barcha hadlari bₙ ≠ 0 va q ≠ 0"],
    ["Kvadrat", "bₙ² = bₙ₋₁ · bₙ₊₁ xarakteristik xossa"],
    ["O'sish", "b₁ > 0, q > 1 bo'lganda barcha hadlar ortadi"],
    ["Kamayish", "b₁ > 0, 0 < q < 1 da hadlar kamayib boradi"],
    ["Almashinuvchi", "q < 0 bo'lganda hadlar ishorasi almashadi"],
    ["Umumiy", "bₙ = b₁ · qⁿ⁻¹ n-had formulasi"],
    ["O'rta", "Ikki musbat sonning o'rta geometrigi √(ab)"],
    ["Daraja", "bₙ va bₖ nisbati qⁿ⁻ᵏ ga tengligi"],
    ["bₙ = b₁ · qⁿ⁻¹", "Geometrik progressiya umumiy hadi"],
    ["q = bₙ₊₁ / bₙ", "Progressiya maxrajini topish"],
    ["bₙ² = bₙ₋₁ · bₙ₊₁", "Xarakteristik xossa tengligi"],
    ["q = −1 holi", "b₁, −b₁, b₁, −b₁... tebranuvchi ketma-ketlik"],
    ["q = 1 holi", "Barcha hadlari b₁ ga teng progressiya"],
    ["qⁿ⁻ᵏ = bₙ/bₖ", "Ikki had orqali maxraj q ni topish"],
    ["b₂ · b₈", "b₅² yoki b₁ · b₉ ga teng ko'paytma"],
    ["Bakteriya bo'linishi", "q = 2 ga ega geometrik o'sish misoli"],
    ["Murakkab foiz", "A₀(1 + p/100)ⁿ geometrik o'sish formulasi"],
    ["q = 2, b₁ = 1", "1, 2, 4, 8, 16, 32, 64... progressiyasi"],
    ["q = 1/2, b₁ = 16", "16, 8, 4, 2, 1, 1/2... kamayuvchi progressiya"],
    ["Musbat o'rta", "b₂ = √(b₁ · b₃) geometrik o'rta"],
    ["Ishora almashishi", "q < 0 bo'lganda ketma-ket hadlar +, − bo'ladi"],
    ["bₙ ≠ 0 sharti", "Geometrik progressiyada nol had bo'lmaydi"],
  ]);

  b.addChoice("Geometrik progressiyaning n-had formulasi qaysi?", "bₙ = b₁ · qⁿ⁻¹", ["bₙ = b₁ + (n − 1)q", "bₙ = b₁ · qⁿ", "bₙ = (b₁ · q)ⁿ⁻¹"], "Har bir qadamda q ga ko'paytirilgani uchun bₙ = b₁ · qⁿ⁻¹.");
  b.addChoice("Geometrik progressiyaning xarakteristik xossasi qaysi javobda to'g'ri yozilgan?", "bₙ² = bₙ₋₁ · bₙ₊₁", ["bₙ = (bₙ₋₁ + bₙ₊₁)/2", "bₙ = bₙ₋₁ · bₙ₊₁", "2bₙ = bₙ₋₁ · bₙ₊₁"], "Har bir hadning kvadrati qo'shni hadlar ko'paytmasiga teng.");
  b.addTF("Geometrik progressiyaning maxraji q = 0 bo'lishi mumkin.", false, "Ta'rifga ko'ra b₁ ≠ 0 va q ≠ 0 bo'lishi shart.");
  b.addTF("b₁ > 0 va 0 < q < 1 bo'lganda geometrik progressiya kamayuvchi bo'ladi.", true, "Har safar 1 dan kichik musbat songa ko'paytirilganda hadlar kichrayadi.");

  // 1) b1, q, n -> bn
  for (let b1 = 1; b1 <= 7; b1++) {
    for (const q of [2, 3, 4, -2, -3, 5]) {
      for (let n = 3; n <= 6; n++) {
        if (b.count >= 165) break;
        const bn = b1 * Math.pow(q, n - 1);
        const mode = (b1 + Math.abs(q) + n) % 4;
        if (mode === 0) {
          b.addChoice(
            `Geometrik progressiyada b₁ = ${b1}, q = ${q}. Uning b_${n} hadini toping.`,
            `${bn}`,
            pickNumDistractors(bn, [bn * q, Math.round(bn / q), -bn]),
            `b_${n} = ${b1} · (${q})^${n - 1} = ${bn}.`,
          );
        } else if (mode === 1) {
          b.addFill(
            `b₁ = ${b1}, q = ${q} geometrik progressiyada b_${n} nimaga teng?`,
            `${bn}`,
            `b_${n} = ${b1}·(${q})^${n - 1} = ${bn}.`,
          );
        } else if (mode === 2) {
          b.addChoice(
            `Geometrik progressiyada b₁ = ${b1} va b₂ = ${b1 * q}. Uning b_${n} hadini toping.`,
            `${bn}`,
            pickNumDistractors(bn, [bn + b1, -bn, b1 * Math.pow(q, n)]),
            `q = b₂/b₁ = ${q}, demak b_${n} = ${b1}·(${q})^${n - 1} = ${bn}.`,
          );
        } else {
          b.addTF(
            `b₁ = ${b1}, q = ${q} geometrik progressiyaning ${n}-hadi ${bn} ga teng.`,
            true,
            `${b1}·(${q})^${n - 1} = ${bn}.`,
          );
        }
      }
    }
  }

  // 2) Kasrli q = 1/2, 1/3, 1/4, 1/5
  for (const den of [2, 3, 4, 5]) {
    for (let k = 1; k <= 9; k++) {
      for (let n = 3; n <= 5; n++) {
        if (b.count >= 255) break;
        const b1 = k * Math.pow(den, n - 1);
        const bn = k;
        b.addFill(
          `Geometrik progressiyada b₁ = ${b1}, q = 1/${den}. Uning b_${n} hadini toping.`,
          `${bn}`,
          `b_${n} = ${b1} · (1/${den})^${n - 1} = ${bn}.`,
        );
      }
    }
  }

  // 3) Xarakteristik xossa: b_{n-1}, x, b_{n+1} -> x > 0 topish va ikkita had orqali q
  for (let a = 1; a <= 12; a++) {
    for (let q = 2; q <= 7; q++) {
      if (b.count >= 340) break;
      const b1 = a;
      const b2 = a * q;
      const b3 = a * q * q;
      b.addChoice(
        `${b1}; x; ${b3} sonlari musbat hadli geometrik progressiyaning ketma-ket hadlari bo'lsa, x ni toping.`,
        `${b2}`,
        pickNumDistractors(b2, [(b1 + b3) / 2, b2 + q, b2 - 1]),
        `x = √(${b1} · ${b3}) = ${b2}.`,
      );
      if (b.count < 340) {
        b.addChoice(
          `Musbat hadli geometrik progressiyada b₂ = ${b2} va b₄ = ${b2 * q * q}. Progressiya maxraji q ni toping.`,
          `${q}`,
          pickNumDistractors(q, [q * q, q + 1, Math.max(1, q - 1)]),
          `q² = b₄/b₂ = ${q * q} ⇒ musbat q = ${q}.`,
        );
      }
    }
  }

  return b.build();
}

function makeTopic32(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-32-geometrik-yigindi",
    topicTitle: "32-§. Geometrik progressiya dastlabki n ta hadining yig'indisi",
    title: "32-§. Geometrik progressiya dastlabki n ta hadining yig'indisi",
    source: "Algebra 9-sinf (2019), IV bob, 32-§, 167–171-betlar",
    seed: 9032,
  });

  b.addCards([
    ["Yig'indi", "Sₙ = b₁(qⁿ − 1)/(q − 1) formulasi (q ≠ 1)"],
    ["Koeffitsiyent", "q = 1 bo'lganda Sₙ = n · b₁ tengligi"],
    ["Murakkab", "Foiz ustiga foiz qo'shiluvchi omonatlar hisobi"],
    ["Darajali", "qⁿ ko'rsatkichli o'sish"],
    ["Sₙ (q > 1)", "b₁(qⁿ − 1) / (q − 1)"],
    ["Sₙ (q < 1)", "b₁(1 − qⁿ) / (1 − q)"],
    ["Sₙ oxirgi had bilan", "(bₙ·q − b₁) / (q − 1)"],
    ["q = 1 holi", "Sₙ = n · b₁"],
    ["q = −1 (n juft)", "Juft hadlarda Sₙ = 0"],
    ["q = −1 (n toq)", "Toq hadlarda Sₙ = b₁"],
    ["1 + 2 + 4 + 8", "S₄ = 15 (2⁴ − 1)"],
    ["1 + 3 + 9 + 27", "S₄ = 40 ((3⁴ − 1)/2)"],
    ["Bank omonati", "S = A · (1 + p/100)ⁿ formula"],
    ["2⁰ + 2¹ + ... + 2ⁿ⁻¹", "Yig'indisi 2ⁿ − 1 ga teng"],
    ["bₙ = Sₙ − Sₙ₋₁", "Yig'indidan n-hadni topish formulasi"],
    ["1 − q", "Kamayuvchi progressiyada q < 1 da maxraj"],
    ["q − 1", "O'suvchi progressiyada q > 1 da maxraj"],
    ["b₁ = 1, q = 2, n = 5", "S₅ = 31"],
    ["b₁ = 1, q = 2, n = 6", "S₆ = 63"],
    ["b₁ = 1, q = 2, n = 10", "S₁₀ = 1023"],
    ["b₁ = 2, q = 3, n = 3", "S₃ = 2 + 6 + 18 = 26"],
    ["Hadlar soni", "Sₙ va b₁, q orqali n ni topish"],
    ["Foiz stavkasi", "Har yili p% ga oshganda q = 1 + p/100"],
    ["bₙ · q", "Sₙ(q − 1) + b₁ ga teng"],
    ["Omonat", "Bankka foiz daromadi uchun qo'yilgan mablag'"],
    ["Stavka", "Yillik yoki davriy qo'shimcha foiz miqdori"],
    ["Progress", "Ketma-ket hadlar yig'indisining o'sish qonuni"],
    ["Ko'paytma", "b₁ ga q darajasini ko'paytirish natijasi"],
    ["Formula", "Sₙ = b₁(qⁿ − 1)/(q − 1) hisoblash qoidasi"],
  ]);

  b.addChoice("q ≠ 1 bo'lgan geometrik progressiyaning dastlabki n ta hadi yig'indisi formulasi qaysi?", "Sₙ = b₁(qⁿ − 1) / (q − 1)", ["Sₙ = b₁(qⁿ + 1) / (q + 1)", "Sₙ = b₁ · qⁿ⁻¹", "Sₙ = (b₁ + bₙ)n / 2"], "q ≠ 1 da Sₙ = b₁(qⁿ − 1)/(q − 1) = b₁(1 − qⁿ)/(1 − q).");
  b.addChoice("Geometrik progressiyada q = 1 bo'lganda Sₙ yig'indi nimaga teng?", "n · b₁", ["0", "b₁", "b₁ⁿ"], "Barcha n ta had b₁ ga teng bo'lgani uchun Sₙ = n · b₁.");
  b.addChoice("1 + 2 + 4 + 8 + ... + 2⁹ yig'indining qiymati nechaga teng?", "1023", ["1024", "511", "2047"], "(2¹⁰ − 1)/(2 − 1) = 1024 − 1 = 1023.");
  b.addTF("q = −1 va b₁ = 5 bo'lgan geometrik progressiyaning dastlabki 100 ta hadining yig'indisi 0 ga teng.", true, "Juft sondagi qarama-qarshi hadlar jufti (5 − 5) = 0 bo'lib qisqaradi.");

  // 1) b1, q, n -> S_n (butun q)
  for (let b1 = 1; b1 <= 10; b1++) {
    for (const q of [2, 3, 4, -2, -3, 5]) {
      for (let n = 3; n <= 6; n++) {
        if (b.count >= 210) break;
        if (q === 5 && n > 5) continue;
        const sn = Math.round((b1 * (Math.pow(q, n) - 1)) / (q - 1));
        const mode = (b1 + Math.abs(q) + n) % 3;
        if (mode === 0) {
          b.addFill(
            `Geometrik progressiyada b₁ = ${b1}, q = ${q}. Dastlabki ${n} ta hadi yig'indisi S_${n} ni toping.`,
            `${sn}`,
            `S_${n} = ${b1}·((${q})^${n} − 1)/(${q} − 1) = ${sn}.`,
          );
        } else if (mode === 1) {
          b.addChoice(
            `b₁ = ${b1}, q = ${q} geometrik progressiyada S_${n} nechaga teng?`,
            `${sn}`,
            pickNumDistractors(sn, [sn + b1, sn - 1, -sn]),
            `S_${n} = ${b1}·((${q})^${n} − 1)/(${q} − 1) = ${sn}.`,
          );
        } else {
          b.addTF(
            `b₁ = ${b1}, q = ${q} geometrik progressiya dastlabki ${n} hadining yig'indisi ${sn} ga teng.`,
            true,
            `Formula bo'yicha S_${n} = ${sn}.`,
          );
        }
      }
    }
  }

  // 2) Kasrli q = 1/2, 1/3, 1/4: b1 = k * den^(n-1)
  for (const den of [2, 3, 4]) {
    for (let k = 1; k <= 8; k++) {
      for (let n = 3; n <= 5; n++) {
        if (b.count >= 295) break;
        const b1 = k * Math.pow(den, n - 1);
        let sum = 0;
        let cur = b1;
        for (let i = 0; i < n; i++) {
          sum += cur;
          cur = cur / den;
        }
        b.addChoice(
          `b₁ = ${b1}, q = 1/${den} geometrik progressiyaning dastlabki ${n} ta had yig'indisi S_${n} ni toping.`,
          `${sum}`,
          pickNumDistractors(sum, [sum + k, sum - k, b1 * n]),
          `Hadlar yig'indisi S_${n} = ${sum}.`,
        );
      }
    }
  }

  // 3) q = 1 va q = -1 maxsus holatlar + b_n = S_n - S_{n-1}
  for (let b1 = 2; b1 <= 30; b1++) {
    if (b.count >= 340) break;
    const n = 10 + (b1 % 15);
    b.addFill(
      `b₁ = ${b1}, q = 1 geometrik progressiyaning dastlabki ${n} ta hadi yig'indisini toping.`,
      `${b1 * n}`,
      `q = 1 da S_${n} = ${n}·${b1} = ${b1 * n}.`,
    );
    if (b.count < 340) {
      b.addChoice(
        `b₁ = ${b1}, q = −1 bo'lgan geometrik progressiyada S_${2 * n + 1} (toq sondagi hadlar) yig'indisi nimaga teng?`,
        `${b1}`,
        [`0`, `−${b1}`, `${b1 * (2 * n + 1)}`],
        `Toq sondagi hadlarda barcha juftliklar yo'qolib, bitta b₁ = ${b1} qoladi.`,
      );
    }
  }

  return b.build();
}

function makeTopic33(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-33-cheksiz-kamayuvchi",
    topicTitle: "33-§. Cheksiz kamayuvchi geometrik progressiya",
    title: "33-§. Cheksiz kamayuvchi geometrik progressiya (IV bob yakuni)",
    source: "Algebra 9-sinf (2019), IV bob, 33-§, 171–185-betlar",
    seed: 9033,
  });

  b.addCards([
    ["Cheksiz", "Hadlar soni cheklanmagan |q| < 1 progressiya"],
    ["Yaqinlashish", "n → ∞ da qⁿ → 0 bo'lish xossasi"],
    ["Davriy", "Cheksiz takrorlanuvchi o'nli kasr 0,(a)"],
    ["Shaxmat", "Beruniy keltirgan 2⁶⁴ − 1 bug'doy donasi masalasi"],
    ["Axmes", "Qadimgi Misr papirusidagi progressiya masalasi"],
    ["|q| < 1 sharti", "Cheksiz kamayuvchi geometrik progressiya belgisi"],
    ["S = b₁/(1 − q)", "Cheksiz kamayuvchi progressiya yig'indisi"],
    ["0,(a)", "a / 9 oddiy kasriga teng"],
    ["0,(ab)", "ab / 99 oddiy kasriga teng"],
    ["1 + 1/2 + 1/4 + ...", "Cheksiz yig'indisi 2 ga teng"],
    ["2⁶⁴ − 1", "Shaxmat kataklaridagi bug'doy donalari soni"],
    ["IV bob yakuni", "Arifmetik va geometrik progressiyalar"],
    ["0,(3)", "1 / 3 oddiy kasriga teng"],
    ["0,(6)", "2 / 3 oddiy kasriga teng"],
    ["0,(1)", "1 / 9 oddiy kasriga teng"],
    ["1 − q maxraji", "S = b₁ / (1 − q) formuladagi maxraj"],
    ["b₁ = S(1 − q)", "Yig'indi va maxrajdan birinchi hadni topish"],
    ["q = 1 − b₁/S", "Yig'indi va b₁ dan maxrajni topish"],
    ["To'p sakrashi", "Har safar k qismga ko'tarilish — cheksiz yig'indi"],
    ["Kvadrat ichida", "O'rtalarini tutashtirib olingan kvadratlar yig'indisi"],
    ["Beruniy hisobi", "64 katakdagi bug'doy soni 18 kvintilliondan ko'p"],
    ["Oddiy kasr", "Davriy o'nli kasrning p/q shakli"],
    ["1 + q + q² + ...", "|q| < 1 da 1 / (1 − q) ga teng"],
    ["Aralash davr", "0,a(b) kasrini oddiy kasrga aylantirish"],
    ["Limit", "n → ∞ da yig'indi Sₙ yaqinlashadigan cheklangan son"],
    ["Kasr", "Davriy o'nli sonning p/q shaklidagi yozuvi"],
    ["Donacha", "Beruniy shaxmat masalasidagi har katakdagi bug'doy"],
  ]);

  b.addChoice("Cheksiz geometrik progressiya cheksiz kamayuvchi bo'lishi uchun uning q maxraji qanday shartni bajarishi kerak?", "|q| < 1 (ya'ni −1 < q < 1, q ≠ 0)", ["q > 1", "|q| > 1", "q = 1"], "n → ∞ da qⁿ → 0 bo'lishi uchun |q| < 1 bo'lishi zarur.");
  b.addChoice("Cheksiz kamayuvchi geometrik progressiyaning barcha hadlari yig'indisi formulasi qaysi?", "S = b₁ / (1 − q)", ["S = b₁ / (1 + q)", "S = b₁ · (1 − q)", "S = (1 − q) / b₁"], "|q| < 1 da qⁿ → 0 bo'lgani uchun S = b₁/(1 − q) olinadi.");
  b.addChoice("Shaxmatning 64 katagiga 1, 2, 4, 8, ... tartibda qo'yiladigan jami donalar soni qaysi ifoda bilan beriladi (Beruniy asarida)?", "2⁶⁴ − 1", ["2⁶³", "2⁶⁴", "64² − 1"], "1 + 2 + 4 + ... + 2⁶³ = 2⁶⁴ − 1.");
  b.addChoice("Qadimgi Misrdagi qaysi manbada progressiyaga oid mashhur «7 uy, 49 mushuk...» masalasi uchraydi?", "Axmes (Raynd) papirusi", ["Pifagor jadvali", "Al-Jabr risolasi", "Evklid Negizlari"], "Darslikdagi tarixiy ma'lumotda Axmes papirusi masalasi keltirilgan.");
  b.addTF("1 + ½ + ¼ + ⅛ + ... cheksiz yig'indining qiymati 2 ga teng.", true, "b₁ = 1, q = 1/2 ⇒ S = 1 / (1 − 1/2) = 2.");
  b.addTF("q = −3/2 bo'lgan geometrik progressiya cheksiz kamayuvchi hisoblanadi.", false, "|−3/2| = 1,5 > 1, shuning uchun kamayuvchi emas.");

  // 1) S = b1 / (1 - q) aniq hisoblashlar (q = p/den, b1 har xil)
  const qList: [number, number][] = [
    [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [-1, 2], [-1, 3], [-1, 4],
  ];
  for (const [qn, qd] of qList) {
    for (let b1 = 1; b1 <= 15; b1++) {
      if (b.count >= 210) break;
      // S = b1 / (1 - qn/qd) = (b1 * qd) / (qd - qn)
      const qStr = fracStr(qn, qd);
      const sStr = fracStr(b1 * qd, qd - qn);
      const mode = (b1 + Math.abs(qn) + qd) % 3;
      if (mode === 0) {
        b.addChoice(
          `Cheksiz kamayuvchi geometrik progressiyada b₁ = ${b1}, q = ${qStr}. Uning yig'indisini toping.`,
          sStr,
          pickStrDistractors(sStr, [fracStr(b1 * qd, qd + qn), fracStr(b1, qd), fracStr(b1 * (qd - qn), qd)]),
          `S = ${b1} / (1 − (${qStr})) = ${sStr}.`,
        );
      } else if (mode === 1 && !sStr.includes("/")) {
        b.addFill(
          `b₁ = ${b1} va q = ${qStr} cheksiz kamayuvchi geometrik progressiya yig'indisini toping.`,
          sStr,
          `S = ${b1} / (1 − (${qStr})) = ${sStr}.`,
        );
      } else {
        b.addTF(
          `b₁ = ${b1}, q = ${qStr} cheksiz kamayuvchi progressiyaning yig'indisi ${sStr} ga teng.`,
          true,
          `S = ${b1}/(1 − (${qStr})) = ${sStr}.`,
        );
      }
    }
  }

  // 2) Davriy o'nli kasrlar 0,(d) va 0,(ab) -> oddiy kasr
  for (let d = 1; d <= 8; d++) {
    const ans = fracStr(d, 9);
    b.addChoice(
      `0,(${d}) cheksiz davriy o'nli kasrni oddiy kasrga aylantiring.`,
      ans,
      pickStrDistractors(ans, [fracStr(d, 10), fracStr(d, 99), fracStr(d + 1, 9)]),
      `0,(${d}) = ${d}/10 + ${d}/100 + ... = (${d}/10)/(1 − 1/10) = ${ans}.`,
    );
  }
  for (let ab = 12; ab <= 88; ab += 3) {
    if (ab % 11 === 0) continue;
    const ans = fracStr(ab, 99);
    b.addChoice(
      `0,(${ab}) davriy o'nli kasrni qisqarmas oddiy kasr ko'rinishida yozing.`,
      ans,
      pickStrDistractors(ans, [fracStr(ab, 100), fracStr(ab, 90), fracStr(ab + 1, 99)]),
      `0,(${ab}) = ${ab}/99 = ${ans}.`,
    );
  }

  // 3) S va b1 orqali q topish yoki S va q orqali b1 topish
  for (let qd = 2; qd <= 7; qd++) {
    for (let k = 1; k <= 10; k++) {
      if (b.count >= 340) break;
      const b1 = k * (qd - 1);
      const sVal = k * qd;
      b.addChoice(
        `Cheksiz kamayuvchi geometrik progressiyaning yig'indisi S = ${sVal}, birinchi hadi b₁ = ${b1}. Maxraj q ni toping.`,
        `1/${qd}`,
        pickStrDistractors(`1/${qd}`, [`1/${qd + 1}`, `${qd - 1}/${qd}`, `−1/${qd}`]),
        `1 − q = b₁/S = ${b1}/${sVal} = ${qd - 1}/${qd} ⇒ q = 1/${qd}.`,
      );
    }
  }

  // 4) Aralash davriy o'nli kasrlar 0,a(c) (422-mashq), koptok sakrashi (184-bet 7-masala) va kvadratlar yig'indisi (420–421-mashqlar)
  for (let a = 1; a <= 8; a++) {
    for (let c = 1; c <= 8; c++) {
      if (b.count >= 340) break;
      if (a === c) continue;
      const num = 10 * a + c - a;
      const ans = fracStr(num, 90);
      b.addChoice(
        `0,${a}(${c}) aralash davriy o'nli kasrni qisqarmas oddiy kasr ko'rinishida yozing.`,
        ans,
        pickStrDistractors(ans, [fracStr(10 * a + c, 99), fracStr(10 * a + c, 90), fracStr(num, 99)]),
        `0,${a}(${c}) = (${10 * a + c} − ${a}) / 90 = ${num}/90 = ${ans}.`,
      );
    }
  }

  for (let h = 4; h <= 40; h += 2) {
    if (b.count >= 340) break;
    // To'p H m balandlikdan tashlanib har safar 1/3 balandlikka ko'tariladi: H + 2*H*(1/3)/(1 - 1/3) = H + H = 2H; yoki 1/2 da H + 2*H = 3H!
    const totalHalf = 3 * h;
    b.addFill(
      `To'p ${h} m balandlikdan tashlandi va har urilishdan keyin oldingi balandlikning 1/2 qismigacha ko'tariladi. To'xtaguncha bosib o'tgan jami yo'lni (m) toping.`,
      `${totalHalf}`,
      `Yo'l = ${h} + 2·(${h}/2)/(1 − 1/2) = ${h} + 2·${h} = ${totalHalf} m.`,
    );
    if (b.count < 340) {
      b.addChoice(
        `Tomoni ${h} sm bo'lgan kvadrat tomonlari o'rtalarini tutashtirib cheksiz kvadratlar yasaldi. Barcha kvadratlar yuzalari yig'indisini (sm²) toping.`,
        `${2 * h * h}`,
        pickNumDistractors(2 * h * h, [h * h, 4 * h * h, Math.round(1.5 * h * h)]),
        `Har keyingi kvadrat yuzi 2 marta kichik (q = 1/2): S = ${h * h}/(1 − 1/2) = ${2 * h * h} sm².`,
      );
    }
  }

  // 5) Butun qismli davriy o'nli kasrlar n,(d) va S, q dan b1 ni topish
  for (let w = 1; w <= 5; w++) {
    for (let d = 1; d <= 8; d++) {
      if (b.count >= 340) break;
      const ans = fracStr(9 * w + d, 9);
      b.addChoice(
        `${w},(${d}) davriy o'nli kasrni noto'g'ri oddiy kasr ko'rinishida yozing.`,
        ans,
        pickStrDistractors(ans, [fracStr(10 * w + d, 9), fracStr(9 * w + d, 10), fracStr(w + d, 9)]),
        `${w},(${d}) = ${w} + ${d}/9 = ${ans}.`,
      );
    }
  }

  for (let s = 12; s <= 48; s += 4) {
    for (const [qn, qd] of [[1, 2], [1, 3], [1, 4], [2, 3]] as [number, number][]) {
      if (b.count >= 340) break;
      const b1 = fracStr(s * (qd - qn), qd);
      b.addChoice(
        `Cheksiz kamayuvchi geometrik progressiyaning yig'indisi S = ${s}, maxraji q = ${qn}/${qd}. Birinchi had b₁ ni toping.`,
        b1,
        pickStrDistractors(b1, [`${s}`, fracStr(s * qn, qd), fracStr(s, qd - qn)]),
        `b₁ = S(1 − q) = ${s}·(1 − ${qn}/${qd}) = ${b1}.`,
      );
    }
  }

  return b.build();
}

function makeTopic34(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-34-hodisalar",
    topicTitle: "34-§. Hodisalar",
    title: "34-§. Hodisalar",
    source: "Algebra 9-sinf (2019), V bob, 34-§, 186–190-betlar",
    seed: 9034,
  });

  b.addCards([
    ["Hodisa", "Tajriba yoki kuzatishning mumkin bo'lgan natijasi"],
    ["Muqarrar", "Tajribada har doim albatta yuz beradigan hodisa"],
    ["Tasodifiy", "Yuz berishi ham, bermasligi ham mumkin hodisa"],
    ["Qaramaqarshi", "A yuz bermaganda ro'y beruvchi Ā hodisa"],
    ["Tajriba", "Tasodifiy natija kuzatiladigan sinov (masalan, tanga tashlash)"],
    ["Elementar", "Boshqa maydaroq qismga bo'linmaydigan natija"],
    ["Uyg'unmas", "Bir vaqtda ro'y bera olmaydigan hodisalar"],
    ["Birlashma", "A yoki B hodisalardan kamida bittasining yuz berishi"],
    ["Kesishma", "A va B hodisalarning birgalikda yuz berishi"],
    ["Fazo", "Barcha elementar natijalar to'plami Ω"],
    ["Mumkin bo'lmagan", "Hech qachon yuz bermaydigan ∅ hodisa"],
    ["Uyg'un hodisalar", "Bir tajribada birga ro'y bera oladigan hodisalar"],
    ["Tanga tashlash", "2 ta elementar natija: Gerb va Raqam"],
    ["O'yin soqqasi", "6 ta elementar natija: 1, 2, 3, 4, 5, 6"],
    ["Ikki tanga", "4 ta elementar natija: GG, GR, RG, RR"],
    ["Ikki soqqa", "36 ta teng imkoniyatli natija juftligi"],
    ["Ā hodisasi", "A hodisaga qarama-qarshi hodisa"],
    ["A ∪ Ā = Ω", "Hodisa va uning qarama-qarshisi muqarrar hodisa"],
    ["A ∩ Ā = ∅", "Qarama-qarshi hodisalar uyg'unmasdir"],
    ["To'la gruppa", "Juft-jufti bilan uyg'unmas barcha natijalar"],
    ["Teng imkoniyatli", "Birining chiqishi boshqasidan ustun bo'lmagan natijalar"],
    ["Kombinatorika", "Elementar natijalar sonini sanash bo'limi"],
    ["Simmetrik kubik", "Barcha 6 yog'i bir xil tushish imkoniyatli"],
    ["Natija soni", "Tajribadagi jami mumkin bo'lgan oqibatlar"],
  ]);

  b.addChoice("Tajribada albatta ro'y beradigan hodisa qanday ataladi?", "Muqarrar hodisa", ["Tasodifiy hodisa", "Mumkin bo'lmagan hodisa", "Qarama-qarshi hodisa"], "Har bir sinovda muqarrar sodir bo'ladigan hodisa muqarrar hodisa (Ω) deyiladi.");
  b.addChoice("Tajribada hech qachon sodir bo'lmaydigan hodisa qanday nomlanadi?", "Mumkin bo'lmagan hodisa", ["Muqarrar hodisa", "Tasodifiy hodisa", "Teng imkoniyatli hodisa"], "Bo'sh to'plam ∅ bilan belgilanadigan hodisa mumkin bo'lmagan hodisadir.");
  b.addChoice("Bir tajribada bir vaqtda ro'y bera olmaydigan ikki hodisa qanday ataladi?", "Birgalikda bo'lmagan (uyg'unmas) hodisalar", ["Uyg'un hodisalar", "Muqarrar hodisalar", "Mustaqil hodisalar"], "Ularning kesishmasi bo'sh to'plam bo'lsa, birgalikda bo'lmagan hodisalar deyiladi.");
  b.addTF("O'yin kubigini (soqqani) bir marta tashlaganda 7 ochko tushishi mumkin bo'lmagan hodisadir.", true, "Kubik yoqlarida faqat 1 dan 6 gacha ochkolar bor.");
  b.addTF("O'yin soqqasini bir marta tashlaganda 7 dan kichik natural ochko tushishi tasodifiy hodisadir.", false, "1, 2, 3, 4, 5, 6 barchasi 7 dan kichik, demak bu muqarrar hodisa.");

  // 1) Tanga va soqqa elementar natijalar soni: 2^k tanga, 6^k soqqa
  for (let k = 1; k <= 8; k++) {
    const coins = Math.pow(2, k);
    b.addFill(
      `Simmetrik tangani ${k} marta ketma-ket tashlaganda nechta teng imkoniyatli elementar natija bo'ladi?`,
      `${coins}`,
      `Har tashlashda 2 natija: 2^${k} = ${coins}.`,
    );
    if (k <= 4) {
      const dice = Math.pow(6, k);
      b.addChoice(
        `${k} ta o'yin soqqasini birga tashlaganda jami nechta elementar natija bo'ladi?`,
        `${dice}`,
        pickNumDistractors(dice, [6 * k, dice * 2, Math.pow(2, k)]),
        `6^${k} = ${dice} ta natija.`,
      );
    }
  }

  // 2) Hodisa turlarini aniqlash: Muqarrar / Mumkin bo'lmagan / Tasodifiy (ko'plab aniq vaziyatlar)
  for (let n = 3; n <= 40; n++) {
    if (b.count >= 210) break;
    b.addChoice(
      `Qutida faqat ${n} ta oq shar bor. Tasodifiy olingan sharning qora bo'lishi qanday hodisa?`,
      "Mumkin bo'lmagan hodisa",
      ["Muqarrar hodisa", "Tasodifiy hodisa", "Teng imkoniyatli hodisa"],
      `Qutida qora shar umuman yo'q, shuning uchun bu mumkin bo'lmagan hodisa.`,
    );
    b.addChoice(
      `Qutida faqat ${n} ta ko'k shar bor. Olingan bitta sharning ko'k bo'lishi qanday hodisa?`,
      "Muqarrar hodisa",
      ["Tasodifiy hodisa", "Mumkin bo'lmagan hodisa", "Qarama-qarshi hodisa"],
      `Barcha ${n} ta shar ko'k bo'lgani uchun har doim ko'k shar chiqadi — muqarrar hodisa.`,
    );
    b.addChoice(
      `Qutida ${n} ta oq va ${n + 2} ta qizil shar bor. Olingan sharning oq bo'lishi qanday hodisa?`,
      "Tasodifiy hodisa",
      ["Muqarrar hodisa", "Mumkin bo'lmagan hodisa", "Aniq hodisa"],
      `Oq ham, qizil ham chiqishi mumkin, demak tasodifiy hodisa.`,
    );
  }

  // 3) Kubik (1..6) va 2 ta kubikda qulay natijalar soni, qarama-qarshi hodisa
  for (let sum = 2; sum <= 12; sum++) {
    let cnt = 0;
    for (let i = 1; i <= 6; i++) {
      for (let j = 1; j <= 6; j++) {
        if (i + j === sum) cnt++;
      }
    }
    b.addFill(
      `Ikkita o'yin soqqasi tashlanganda ochkolar yig'indisi ${sum} ga teng bo'ladigan nechta natija bor?`,
      `${cnt}`,
      `1..6 juftliklar orasida i + j = ${sum} shartini ${cnt} ta juftlik qanoatlantiradi.`,
    );
    b.addChoice(
      `Ikki kubik tashlanganda ochkolar yig'indisi ${sum} dan farqli chiqishi uchun nechta natija qulay?`,
      `${36 - cnt}`,
      pickNumDistractors(36 - cnt, [cnt, 36, 36 - cnt + 2]),
      `Jami 36 natijadan ${cnt} tasi yig'indisi ${sum}, qolgan ${36 - cnt} tasi farqli.`,
    );
  }

  // 4) Qarama-qarshi hodisalar & Uyg'un/Uyg'unmas tekshiruvlar
  for (let m = 2; m <= 55; m++) {
    if (b.count >= 340) break;
    if (m % 2 === 0) {
      b.addTF(
        `«${m} ta sinovdan kamida 1 ta omadli» hodisasiga qarama-qarshi hodisa «hech bir sinov omadli emas» dir.`,
        true,
        `«Kamida bitta» ning inkori — «birortasi ham emas (0 ta)».`,
      );
    } else {
      b.addTF(
        `O'yin soqqasini tashlaganda «juft son tushishi» va «toq son tushishi» birgalikda bo'lmagan hodisalardir.`,
        true,
        `Bir son ham juft, ham toq bo'la olmaydi, shu sababli ular uyg'unmas.`,
      );
    }
    if (b.count < 340) {
      b.addChoice(
        `1 dan ${m + 10} gacha raqamlangan kartochkalardan bittasi olindi. Uning juft raqamli bo'lishi uchun nechta qulay natija bor?`,
        `${Math.floor((m + 10) / 2)}`,
        pickNumDistractors(Math.floor((m + 10) / 2), [m + 10, Math.ceil((m + 10) / 2) + 2, 1]),
        `1..${m + 10} oralig'ida ⌊${m + 10}/2⌋ = ${Math.floor((m + 10) / 2)} ta juft son bor.`,
      );
    }
  }

  // 5) Kubik shartlari, domino (28 tosh) va karta dastasi (52 karta) elementar natijalari (456–464-mashqlar)
  for (let k = 1; k <= 5; k++) {
    b.addFill(
      `O'yin soqqasini bir marta tashlaganda ${k} dan katta ochko tushishi hodisasiga nechta elementar natija qulay?`,
      `${6 - k}`,
      `${k} dan katta ochkolar: ${6 - k} ta (${Array.from({ length: 6 - k }, (_, i) => k + 1 + i).join(", ")}).`,
    );
    b.addFill(
      `O'yin soqqasini tashlaganda ${k + 1} dan kichik ochko tushishiga nechta natija qulay?`,
      `${k}`,
      `${k + 1} dan kichik natural ochkolar 1 dan ${k} gacha ${k} ta.`,
    );
  }

  for (let N = 15; N <= 60; N++) {
    if (b.count >= 340) break;
    const div3 = Math.floor(N / 3);
    const div5 = Math.floor(N / 5);
    b.addChoice(
      `1 dan ${N} gacha raqamlangan sharlardan bittasi olindi. «3 ga karrali» hodisasiga nechta natija qulay?`,
      `${div3}`,
      pickNumDistractors(div3, [div5, N - div3, div3 + 1]),
      `1..${N} oralig'ida 3 ga karrali sonlar ⌊${N}/3⌋ = ${div3} ta.`,
    );
    if (b.count < 340) {
      b.addChoice(
        `1 dan ${N} gacha raqamlangan chiptalar ichidan «5 ga karrali» hodisasiga nechta natija qulay?`,
        `${div5}`,
        pickNumDistractors(div5, [div3, div5 + 2, N]),
        `5 ga karrali sonlar ⌊${N}/5⌋ = ${div5} ta.`,
      );
    }
  }

  return b.build();
}

function makeTopic35(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-35-ehtimollik",
    topicTitle: "35-§. Hodisaning ehtimolligi",
    title: "35-§. Hodisaning ehtimolligi",
    source: "Algebra 9-sinf (2019), V bob, 35-§, 190–194-betlar",
    seed: 9035,
  });

  b.addCards([
    ["Ehtimollik", "P(A) = m / n hodisa yuz berish imkoniyati o'lchovi"],
    ["Klassik", "Teng imkoniyatli natijalar soni nisbatiga asoslangan ta'rif"],
    ["Paskal", "1654-yilda ehtimolliklar nazariyasiga asos solgan fransuz olimi"],
    ["Ferma", "Paskal bilan ehtimollik muammolarini yozishgan matematik"],
    ["Qulay", "A hodisani yuzaga keltiruvchi m ta natija"],
    ["Qaramaqarshi", "P(Ā) = 1 − P(A) formulasi"],
    ["Yig'indi", "Uyg'unmas hodisalar uchun P(A∪B) = P(A) + P(B)"],
    ["Chegara", "0 ≤ P(A) ≤ 1 ehtimollik xossasi"],
    ["P(Ω) = 1", "Muqarrar hodisa ehtimolligi 1 ga teng"],
    ["P(∅) = 0", "Mumkin bo'lmagan hodisa ehtimolligi 0 ga teng"],
    ["P(A) = m / n", "Ehtimollikning klassik formulasi"],
    ["P(Ā) = 1 − P(A)", "Qarama-qarshi hodisa ehtimolligi"],
    ["Tanga gerbi", "P = 1/2 (0,5)"],
    ["Kubik 6 ochko", "P = 1/6"],
    ["Kubik juft son", "P = 3/6 = 1/2"],
    ["Blez Paskal", "1623–1662 yillarda yashagan fransuz olimi"],
    ["Pyer Ferma", "1601–1665 yillarda yashagan fransuz matematigi"],
    ["1654-yil", "Ehtimolliklar nazariyasi vujudga kelgan yil"],
    ["Shar chiqarish", "m/(m+k) formulali klassik masala"],
    ["Sifatli mahsulot", "(n − k)/n ehtimollik"],
    ["Lotereya chiptasi", "Yutuqli chiptalar soni / jami chiptalar"],
    ["Ikki tanga", "Ikkala marta gerb tushishi P = 1/4"],
    ["m ≤ n sharti", "Qulay natijalar jami natijalardan oshmaydi"],
    ["Uyg'unmas yig'indi", "P(A) + P(B) ≤ 1"],
  ]);

  b.addChoice("Hodisa ehtimolligining klassik ta'rifi qaysi formula bilan beriladi?", "P(A) = m / n", ["P(A) = n / m", "P(A) = m · n", "P(A) = (n − m) / m"], "m — qulay natijalar soni, n — barcha teng imkoniyatli natijalar soni: P(A) = m / n.");
  b.addChoice("Har qanday A hodisaning P(A) ehtimolligi qaysi oraliqda bo'ladi?", "0 ≤ P(A) ≤ 1", ["−1 ≤ P(A) ≤ 1", "0 < P(A) < ∞", "1 ≤ P(A) ≤ 100"], "0 ≤ m ≤ n bo'lgani uchun 0 ≤ P(A) ≤ 1.");
  b.addChoice("1654-yilda ehtimolliklar nazariyasiga asos solgan ikki fransuz olimi kimlar edi?", "Blez Paskal va Pyer Ferma", ["Isaak Nyuton va Leybnits", "Yakob Bernulli va Eyler", "Karl Gauss va Koshi"], "1654-yilda Paskal va Fermaning o'zaro yozishmalari ehtimolliklar nazariyasini boshlab bergan.");
  b.addTF("Muqarrar hodisaning ehtimolligi 1 ga, mumkin bo'lmagan hodisaniki 0 ga teng.", true, "P(Ω) = n/n = 1, P(∅) = 0/n = 0.");
  b.addTF("Agar P(A) = 0,35 bo'lsa, unga qarama-qarshi Ā hodisaning ehtimolligi 0,75 ga teng.", false, "P(Ā) = 1 − 0,35 = 0,65.");

  // 1) Qutidagi sharlar masalalari: w ta oq, r ta qizil, g ta ko'k
  for (let w = 2; w <= 10; w++) {
    for (let r = 2; r <= 10; r++) {
      for (let g = 0; g <= 4; g += 2) {
        if (b.count >= 180) break;
        const tot = w + r + g;
        const pW = fracStr(w, tot);
        const pNotW = fracStr(r + g, tot);
        if ((w + r + g) % 3 === 0) {
          b.addChoice(
            `Qutida ${w} ta oq, ${r} ta qizil${g > 0 ? ` va ${g} ta ko'k` : ""} shar bor. Tasodifiy olingan sharning oq bo'lish ehtimolligini toping.`,
            pW,
            pickStrDistractors(pW, [pNotW, fracStr(w, r + g), fracStr(1, w), fracStr(w + 1, tot)]),
            `Jami ${tot} ta shardan ${w} tasi oq: P = ${w}/${tot} = ${pW}.`,
          );
        } else if ((w + r + g) % 3 === 1) {
          b.addChoice(
            `Qutida ${w} ta oq va ${r + g} ta qora shar bor. Olingan sharning oq BO'LMASLIGI ehtimolligini toping.`,
            pNotW,
            pickStrDistractors(pNotW, [pW, fracStr(1, tot), fracStr(r + g, tot + 1)]),
            `1 − ${pW} = ${pNotW}.`,
          );
        } else {
          b.addTF(
            `${w} ta yutuqli va ${r + g} ta yutuqsiz chiptalar orasidan bitta chipta olganda yutuq chiqish ehtimolligi ${pW} ga teng.`,
            true,
            `P = ${w}/(${w} + ${r + g}) = ${pW}.`,
          );
        }
      }
    }
  }

  // 2) Qarama-qarshi hodisalar P(A) -> P(not A) foizda yoki o'nli kasrda
  for (let p = 5; p <= 95; p += 3) {
    const pDec = (p / 100).toFixed(2).replace(".", ",");
    const qDec = ((100 - p) / 100).toFixed(2).replace(".", ",");
    b.addFill(
      `Biror A hodisaning yuz berish ehtimolligi P(A) = ${pDec} ga teng. Unga qarama-qarshi Ā hodisa ehtimolligi P(Ā) ni toping (vergul bilan yozing).`,
      [qDec, qDec.replace(",", ".")],
      `P(Ā) = 1 − ${pDec} = ${qDec}.`,
    );
  }

  // 3) Raqamlangan kartochkalar va ikkita kubik
  for (let N = 10; N <= 50; N += 2) {
    for (const k of [2, 3, 5]) {
      if (b.count >= 340) break;
      const mult = Math.floor(N / k);
      const ans = fracStr(mult, N);
      b.addChoice(
        `1 dan ${N} gacha raqamlangan kartochkalardan bittasi tanlandi. Raqamning ${k} ga karrali bo'lish ehtimolligini toping.`,
        ans,
        pickStrDistractors(ans, [fracStr(mult + 1, N), fracStr(1, k + 1), fracStr(N - mult, N)]),
        `1..${N} da ${k} ga karrali sonlar ${mult} ta: P = ${mult}/${N} = ${ans}.`,
      );
    }
  }

  // 4) Ikki kubik yig'indisi ehtimolligi, domino va 52 talik karta dastasi (466–474-mashqlar)
  for (let sum = 2; sum <= 12; sum++) {
    let cnt = 0;
    for (let i = 1; i <= 6; i++) {
      for (let j = 1; j <= 6; j++) {
        if (i + j === sum) cnt++;
      }
    }
    const pStr = fracStr(cnt, 36);
    b.addChoice(
      `Ikkita o'yin kubigi tashlanganda ochkolar yig'indisi ${sum} ga teng bo'lish ehtimolligini toping.`,
      pStr,
      pickStrDistractors(pStr, [fracStr(cnt + 1, 36), fracStr(1, 6), fracStr(36 - cnt, 36)]),
      `Jami 36 natijadan ${cnt} tasi qulay: P = ${cnt}/36 = ${pStr}.`,
    );
  }

  // Domino (28 tosh) & 52 karta
  const deckEvents: [string, string, string[], string][] = [
    ["28 toshli dominodan tasodifiy olingan toshning «dubl» (bir xil raqamli) bo'lish ehtimolligi?", "1/4", ["1/7", "1/28", "7/36"], "Dominoda 7 ta dubl bor (0-0..6-6): P = 7/28 = 1/4."],
    ["52 talik o'yin kartalari dastasidan tasodifiy olingan kartaning qizil rangli (g'isht yoki toppon) bo'lish ehtimolligi?", "1/2", ["1/4", "1/13", "1/52"], "52 kartaning yarmi (26 tasi) qizil rangda: P = 26/52 = 1/2."],
    ["52 talik karta dastasidan olingan kartaning «tuz» chiqish ehtimolligi?", "1/13", ["1/52", "1/4", "4/13"], "Dastada 4 ta tuz bor: P = 4/52 = 1/13."],
    ["52 talik karta dastasidan bitta karta olindi. Uning qarg'a (piki) mastida bo'lish ehtimolligi?", "1/4", ["1/13", "1/52", "1/2"], "Har bir mastda 13 tadan karta bor: P = 13/52 = 1/4."],
    ["Ikki xonali maxfiy kod (00..99) ni bir urinishda to'g'ri topish ehtimolligi?", "1/100", ["1/90", "1/10", "1/50"], "00 dan 99 gacha 100 ta teng imkoniyatli kod bor: P = 1/100."],
  ];
  for (const [q, a, d, e] of deckEvents) {
    b.addChoice(q, a, d, e);
  }

  for (let N = 12; N <= 52; N += 2) {
    for (const k of [4, 6, 7]) {
      if (b.count >= 340) break;
      const mult = Math.floor(N / k);
      const ans = fracStr(mult, N);
      b.addChoice(
        `1 dan ${N} gacha raqamlangan sharlar ichidan bittasi tanlandi. Raqamning ${k} ga karrali bo'lish ehtimolligini toping.`,
        ans,
        pickStrDistractors(ans, [fracStr(mult + 1, N), fracStr(1, k), fracStr(N - mult, N)]),
        `${k} ga karralilar ${mult} ta: P = ${mult}/${N} = ${ans}.`,
      );
    }
  }

  for (let N = 15; N <= 55; N++) {
    for (let k = 2; k <= Math.min(8, N - 2); k++) {
      if (b.count >= 340) break;
      const ans = fracStr(N - k, N);
      b.addChoice(
        `1 dan ${N} gacha raqamlangan kartochkalardan bittasi olindi. Raqamning ${k} dan katta bo'lish ehtimolligini toping.`,
        ans,
        pickStrDistractors(ans, [fracStr(k, N), fracStr(N - k + 1, N), fracStr(1, N)]),
        `${k} dan katta sonlar ${k + 1}..${N} (${N - k} ta): P = ${N - k}/${N} = ${ans}.`,
      );
    }
  }

  // Uyg'unmas hodisalar yig'indisi P(A ∪ B) = P(A) + P(B)
  for (let p1 = 10; p1 <= 45; p1 += 5) {
    for (let p2 = 10; p2 <= 45; p2 += 5) {
      if (b.count >= 340 || p1 + p2 >= 100) break;
      const s = ((p1 + p2) / 100).toFixed(2).replace(".", ",");
      b.addFill(
        `Uyg'unmas A va B hodisalar uchun P(A) = ${(p1 / 100).toFixed(2).replace(".", ",")} va P(B) = ${(p2 / 100).toFixed(2).replace(".", ",")}. P(A ∪ B) ni toping (vergul bilan).`,
        [s, s.replace(",", ".")],
        `P(A ∪ B) = P(A) + P(B) = ${s}.`,
      );
    }
  }

  return b.build();
}

function makeTopic36(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-36-nisbiy-chastota",
    topicTitle: "36-§. Tasodifiy hodisaning nisbiy chastotasi",
    title: "36-§. Tasodifiy hodisaning nisbiy chastotasi",
    source: "Algebra 9-sinf (2019), V bob, 36-§, 194–197-betlar",
    seed: 9036,
  });

  b.addCards([
    ["Chastota", "Hodisaning n ta tajribada necha marta ro'y berishi (m)"],
    ["Nisbiy", "W(A) = m / n — uchrashish ulushi"],
    ["Barqarorlik", "n ortgan sari W(A) ning P(A) ga yaqinlashishi"],
    ["Statistik", "Kuzatish va tajribalar orqali baholangan ehtimollik"],
    ["Bernulli", "Katta sonlar qonunini isbotlagan shveysariyalik matematik"],
    ["Byuffon", "Tangani 4040 marta tashlab 2048 gerb olgan olim"],
    ["Pirson", "Tangani 24000 marta tashlab 12012 gerb olgan olim"],
    ["W(A) = m / n", "Hodisaning nisbiy chastotasi formulasi"],
    ["Mutlaq chastota", "Hodisaning tajribada necha marta yuz bergani (m)"],
    ["Tajriba soni", "O'tkazilgan jami sinovlar soni (n)"],
    ["Katta sonlar qonuni", "Ko'p sinovda nisbiy chastota ehtimollikka intiladi"],
    ["0 ≤ W(A) ≤ 1", "Nisbiy chastotaning qiymatlar oralig'i"],
    ["Byuffon natijasi", "2048 / 4040 ≈ 0,5069"],
    ["Pirson natijasi", "12012 / 24000 = 0,5005"],
    ["Foizda chastota", "(m / n) · 100% ko'rinishida yoziladi"],
    ["W(A) + W(Ā) = 1", "Qarama-qarshi hodisalar nisbiy chastotalari yig'indisi"],
    ["Yaroqsiz ulush", "Tekshirilgan detallarda nuqsonli detallar nisbiy chastotasi"],
    ["Nishonga tegish", "O'q uzishdagi natijadorlik nisbiy chastotasi"],
    ["Unib chiqish", "Urug'larning unib chiqish nisbiy chastotasi"],
    ["Ya. Bernulli", "«Ars Conjectandi» asari muallifi (1713)"],
    ["Sinovlar seriyasi", "Takrorlanuvchi mustaqil kuzatishlar zanjiri"],
    ["m = W(A) · n", "Nisbiy chastotadan mutlaq chastotani topish"],
    ["n = m / W(A)", "Mutlaq va nisbiy chastotadan sinovlar sonini topish"],
    ["Σ Wᵢ = 1", "Barcha o'zaro uyg'unmas natijalar chastotalari yig'indisi"],
  ]);

  b.addChoice("n ta tajribada A hodisa m marta yuz berganda, uning nisbiy chastotasi W(A) qaysi formula bilan topiladi?", "W(A) = m / n", ["W(A) = n / m", "W(A) = m · n", "W(A) = n − m"], "Nisbiy chastota hodisa ro'y berishlar sonining jami tajribalar soniga nisbatidir.");
  b.addChoice("Katta sonlar qonuniga ko'ra, sinovlar soni n cheksiz ortganda nisbiy chastota W(A) nimaga yaqinlashadi?", "Hodisaning P(A) ehtimolligiga", ["Nolga", "Cheksizlikka", "Har doim 1 ga"], "Ya. Bernulli teoremasi (katta sonlar qonuni) ga ko'ra n → ∞ da W(A) → P(A).");
  b.addChoice("Darslikdagi tarixiy jadvalda K. Pirson tangani 24 000 marta tashlaganda gerb tomoni necha marta tushgan?", "12 012 marta (W = 0,5005)", ["2048 marta", "10 000 marta", "15 000 marta"], "Karl Pirson 24 000 tajribada 12 012 marta gerb olgan (nisbiy chastota 0,5005).");
  b.addChoice("Fransuz olimi J. Byuffon tangani 4040 marta tashlaganda gerb necha marta chiqqan?", "2048 marta (≈ 0,5069)", ["12012 marta", "2020 marta", "1500 marta"], "Byuffon 4040 sinovda 2048 marta gerb tomoni tushishini kuzatgan.");
  b.addTF("Nisbiy chastota W(A) hech qachon 1 dan katta bo'la olmaydi.", true, "0 ≤ m ≤ n bo'lgani uchun 0 ≤ m/n ≤ 1.");

  // 1) m va n dan W(A) ni kasr va foiz ko'rinishida topish
  const totals = [20, 25, 40, 50, 80, 100, 120, 200, 250, 400, 500, 1000];
  for (const n of totals) {
    for (let step = 1; step <= 8; step++) {
      if (b.count >= 225) break;
      const m = Math.max(1, Math.min(n - 1, Math.round((n * step) / 10)));
      const wFrac = fracStr(m, n);
      const pct = Math.round((m * 1000) / n) / 10;
      const isCleanPct = Math.abs(pct * 10 - Math.round(pct * 10)) < 1e-6 && pct === Math.floor(pct);
      if ((n + step) % 3 === 0 && isCleanPct) {
        b.addFill(
          `${n} ta o'qdan ${m} tasi nishonga tegdi. Nishonga tegish nisbiy chastotasini foizda (%) yozing (belgisiz).`,
          `${pct}`,
          `W = (${m}/${n}) · 100% = ${pct}%.`,
        );
      } else if ((n + step) % 3 === 1) {
        b.addChoice(
          `${n} ta ekilgan urug'dan ${m} tasi unib chiqdi. Unib chiqish nisbiy chastotasini qisqarmas kasrda toping.`,
          wFrac,
          pickStrDistractors(wFrac, [fracStr(n - m, n), fracStr(m + 1, n), fracStr(1, n)]),
          `W = ${m}/${n} = ${wFrac}.`,
        );
      } else {
        b.addChoice(
          `${n} ta detalning ${n - m} tasi sifatli chiqdi. Yaroqsiz detallar nisbiy chastotasi nechaga teng?`,
          wFrac,
          pickStrDistractors(wFrac, [fracStr(n - m, n), fracStr(m, n + 10), "1"]),
          `Yaroqsizlar soni ${n} − ${n - m} = ${m}. W = ${m}/${n} = ${wFrac}.`,
        );
      }
    }
  }

  // 2) W(A) va n dan m ni topish, yoki m va W(A) dan n ni topish
  for (let pct = 10; pct <= 90; pct += 5) {
    for (const n of [40, 60, 80, 100, 120, 200, 300, 400]) {
      if (b.count >= 340) break;
      if ((pct * n) % 100 !== 0) continue;
      const m = (pct * n) / 100;
      const wDec = (pct / 100).toString().replace(".", ",");
      if ((pct + n) % 2 === 0) {
        b.addFill(
          `${n} marta sinov o'tkazilganda hodisaning nisbiy chastotasi ${wDec} ga teng bo'ldi. Hodisa necha marta ro'y bergan?`,
          `${m}`,
          `m = W · n = ${wDec} · ${n} = ${m}.`,
        );
      } else {
        b.addChoice(
          `Hodisa ${m} marta yuz berib, nisbiy chastotasi ${wDec} ni tashkil etdi. Jami nechta tajriba o'tkazilgan?`,
          `${n}`,
          pickNumDistractors(n, [m, n + 20, Math.round(n / 2)]),
          `n = m / W = ${m} / ${wDec} = ${n}.`,
        );
      }
    }
  }

  // 3) Qarama-qarshi hodisa chastotasi W(not A) = 1 - W(A) va vergulli nisbiy chastotalar (475–478-mashqlar)
  for (const n of [100, 200, 250, 500, 1000]) {
    for (let k = 1; k <= 19; k++) {
      if (b.count >= 340) break;
      const m = Math.max(1, Math.min(n - 1, Math.round((n * k) / 20)));
      const notM = n - m;
      const wNotDec = (notM / n).toFixed(2).replace(".", ",");
      b.addChoice(
        `${n} ta sinovda A hodisa ${m} marta ro'y berdi. Qarama-qarshi Ā hodisaning nisbiy chastotasini toping.`,
        wNotDec,
        pickStrDistractors(wNotDec, [
          (m / n).toFixed(2).replace(".", ","),
          ((notM + 1) / n).toFixed(2).replace(".", ","),
          "0,50",
        ]),
        `W(Ā) = 1 − ${m}/${n} = ${notM}/${n} = ${wNotDec}.`,
      );
      if (b.count < 340) {
        const wFrac = fracStr(m, n);
        b.addTF(
          `${n} ta sinovda hodisa ${m} marta kuzatilgan bo'lsa, nisbiy chastota ${wFrac} ga teng.`,
          true,
          `W = ${m}/${n} = ${wFrac}.`,
        );
      }
    }
  }

  return b.build();
}

function makeTopic37(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-37-tasodifiy-miqdorlar",
    topicTitle: "37-§. Tasodifiy miqdorlar",
    title: "37-§. Tasodifiy miqdorlar",
    source: "Algebra 9-sinf (2019), V bob, 37-§, 198–205-betlar",
    seed: 9037,
  });

  b.addCards([
    ["Diskret", "Alohida ajralgan qiymatlarni oluvchi tasodifiy miqdor"],
    ["Uzluksiz", "Ma'lum oraliqdagi barcha qiymatlarni oluvchi miqdor"],
    ["Taqsimot", "Qiymatlar va ularning ehtimolliklari jadvali"],
    ["Poligon", "Chastotalarni siniq chiziq bilan tasvirlovchi grafik"],
    ["Gistogramma", "Ustunchali taqsimot diagrammasi"],
    ["Eyler", "Yig'indi uchun Σ belgisini kiritgan alloma"],
    ["Sigma", "Σ — matematikada yig'indi belgisi"],
    ["Variatsion", "O'sish tartibida joylashtirilgan kuzatuv qatori"],
    ["Tanlanma", "Kuzatish natijasida to'plangan ma'lumotlar to'plami"],
    ["Chegaraviy", "Tanlanmaning eng kichik va eng katta qiymatlari"],
    ["∑ pᵢ = 1", "Taqsimot qonunidagi barcha ehtimolliklar yig'indisi"],
    ["X qiymatlari", "x₁, x₂, ..., xₖ tasodifiy miqdor natijalari"],
    ["Diskret misol", "Oiladagi bolalar soni yoki imtihon bahosi"],
    ["Uzluksiz misol", "O'quvchining bo'yi yoki havoning harorati"],
    ["Chastotalar poligoni", "Nuqtalari (xᵢ; mᵢ) bo'lgan siniq chiziq"],
    ["Taqsimot jadvali", "Qiymat xᵢ va uning pᵢ ehtimolligi jadvali"],
    ["Leonhard Eyler", "1755-yilda ∑ (sigma) belgisini kiritgan"],
    ["Bosh to'plam", "O'rganilayotgan barcha obyektlar majmui"],
    ["Variantalar", "Tanlanmada uchraydigan turli qiymatlar"],
    ["Interval qatori", "Uzluksiz ma'lumotlarni oraliqlarga guruhlash"],
    ["Σ Wᵢ = 1", "Nisbiy chastotalar yig'indisi har doim 1"],
    ["Ko'paytma jadvali", "Taqsimotdan ko'rsatkichlar hisoblash asosi"],
    ["∑ mᵢ = n", "Barcha chastotalar yig'indisi tanlanma hajmiga teng"],
    ["Diagnostik jadval", "Ma'lumotlarni tartiblash va tahlil qilish usuli"],
  ]);

  b.addChoice("Diskret tasodifiy miqdorning taqsimot jadvalidagi barcha pᵢ ehtimolliklar yig'indisi nechaga teng?", "1 ga", ["0 ga", "100 ga", "Qiymatlar soniga"], "Taqsimot qonunining asosiy xossasiga ko'ra p₁ + p₂ + ... + pₖ = 1.");
  b.addChoice("Matematikada yig'indi uchun Σ (katta sigma) belgisini 1755-yilda qaysi mashhur olim kiritgan?", "Leonhard Eyler", ["Karl Gauss", "Blez Paskal", "Rene Dekart"], "Darslikda yig'indi Σ belgisini Shveysariya va Rossiya akademigi L. Eyler kiritgani ko'rsatilgan.");
  b.addChoice("Quyidagilardan qaysi biri UZLIKSIZ tasodifiy miqdor hisoblanadi?", "O'quvchining bo'yi uzunligi (sm)", ["Sinfdagi o'quvchilar soni", "Tanga tashlaganda gerb chiqish soni", "Kitobdagi xatolar soni"], "Bo'y uzunligi berilgan oraliqdagi ixtiyoriy haqiqiy qiymatni qabul qilishi mumkin.");
  b.addTF("O'yin soqqasini tashlashda tushadigan ochkolar soni diskret tasodifiy miqdordir.", true, "U faqat ajralgan 1, 2, 3, 4, 5, 6 qiymatlarini oladi.");
  b.addTF("Chastotalar poligonida qo'shni nuqtalar egri yoy bilan tutashtiriladi.", false, "Poligonda (xᵢ; mᵢ) nuqtalar kesmalar (siniq chiziq) bilan tutashtiriladi.");

  // 1) Taqsimot jadvalidagi noma'lum p ni topish (p1 + p2 + p3 + x = 1)
  for (let a = 1; a <= 4; a++) {
    for (let c = 1; c <= 4; c++) {
      for (let d = 1; d <= 5; d++) {
        if (b.count >= 165) break;
        if (a + c + d >= 10) continue;
        const miss = 10 - (a + c + d);
        const p1 = (a / 10).toString().replace(".", ",");
        const p2 = (c / 10).toString().replace(".", ",");
        const p3 = (d / 10).toString().replace(".", ",");
        const ans = (miss / 10).toString().replace(".", ",");
        if ((a + c + d) % 3 === 0) {
          b.addFill(
            `Diskret tasodifiy miqdor taqsimot qonunida ehtimolliklar ${p1}; ${p2}; ${p3} va p₄ berilgan. p₄ ni toping (vergul bilan).`,
            [ans, ans.replace(",", ".")],
            `∑pᵢ = 1 ⇒ p₄ = 1 − (${p1} + ${p2} + ${p3}) = ${ans}.`,
          );
        } else {
          b.addChoice(
            `Tasodifiy miqdorning taqsimot ehtimolliklari ${p1}; ${p2}; ${p3} va x ga teng. x ni toping.`,
            ans,
            pickStrDistractors(ans, ["0,5", "0,1", "0,9", "0,4"]),
            `Ehtimolliklar yig'indisi 1 bo'lishi kerak: 1 − ${(a + c + d) / 10} = ${ans}.`.replace(".", ","),
          );
        }
      }
    }
  }

  // 2) Kasrli p1 + p2 + x = 1 va ∑m_i = n
  for (let den = 4; den <= 16; den++) {
    for (let a = 1; a < den - 2; a++) {
      for (let c = 1; c < den - a; c++) {
        if (b.count >= 255) break;
        const rem = den - a - c;
        if (rem <= 0) continue;
        const ans = fracStr(rem, den);
        b.addChoice(
          `Taqsimot jadvalida uchta holat ehtimolliklari ${fracStr(a, den)}, ${fracStr(c, den)} va p ga teng. p ni toping.`,
          ans,
          pickStrDistractors(ans, [fracStr(a + c, den), fracStr(1, den), "1"]),
          `p = 1 − ${fracStr(a + c, den)} = ${ans}.`,
        );
      }
    }
  }

  // 3) Tanlanma hajmi va chastotalar yig'indisi hamda sigma yig'indilar
  for (let n = 1; n <= 45; n++) {
    if (b.count >= 340) break;
    const f1 = n + 3;
    const f2 = 2 * n;
    const f3 = n + 5;
    const tot = f1 + f2 + f3 + 7;
    b.addFill(
      `Tanlanma chastotalari ${f1}, ${f2}, ${f3} va m₄, jami kuzatuvlar soni ${tot} ta. Noma'lum m₄ chastotani toping.`,
      `7`,
      `m₄ = ${tot} − (${f1} + ${f2} + ${f3}) = 7.`,
    );
    if (b.count < 340) {
      b.addChoice(
        `∑_{i=1}^{4} (i + ${n}) yig'indining qiymatini hisoblang.`,
        `${10 + 4 * n}`,
        pickNumDistractors(10 + 4 * n, [10 + n, 4 * n, 12 + 4 * n]),
        `(1+${n}) + (2+${n}) + (3+${n}) + (4+${n}) = 10 + ${4 * n} = ${10 + 4 * n}.`,
      );
    }
  }

  return b.build();
}

function makeTopic38(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-38-sonli-xarakteristikalar",
    topicTitle: "38-§. Tasodifiy miqdorlarning sonli xarakteristikalari",
    title: "38-§. Tasodifiy miqdorlarning sonli xarakteristikalari (V bob yakuni)",
    source: "Algebra 9-sinf (2019), V bob, 38-§, 206–221-betlar",
    seed: 9038,
  });

  b.addCards([
    ["Matematik", "M(X) = ∑ xᵢ·pᵢ tasodifiy miqdor o'rta qiymati"],
    ["Moda", "Tanlanmada eng ko'p uchraydigan qiymat (Mo)"],
    ["Mediana", "Tartiblangan qatorning o'rtadagi qiymati (Me)"],
    ["Diapazon", "Eng katta va eng kichik qiymatlar ayirmasi R"],
    ["Dispersiya", "O'rta qiymatdan chetlanishlar kvadratining o'rtachasi D(X)"],
    ["Chetlanish", "σ = √D(X) — o'rtacha kvadratik chetlanish"],
    ["Tanlanma", "Statistik ma'lumotlar to'plami"],
    ["Kutilma", "M(X) — kutilayotgan o'rtacha qiymat"],
    ["M(X) = ∑xᵢpᵢ", "Matematik kutilma formulasi"],
    ["D(X) = M(X²) − M²(X)", "Dispersiyani hisoblash qulay formulasi"],
    ["σ = √D(X)", "O'rtacha kvadratik chetlanish (standart chetlanish)"],
    ["R = x_max − x_min", "Eng katta farq (diapazon)"],
    ["Mo belgisi", "Moda — maksimal chastotali varianta"],
    ["Me (toq n)", "Tartiblangan qatorning markaziy hadi"],
    ["Me (juft n)", "O'rtadagi ikki hadning o'rta arifmetigi"],
    ["O'rta arifmetik", "x̄ = (x₁ + x₂ + ... + xₙ) / n"],
    ["V bob yakuni", "Ehtimollar nazariyasi va statistika elementlari"],
    ["D(X) ≥ 0", "Dispersiya hech qachon manfiy bo'lmaydi"],
    ["D(c) = 0", "O'zgarmas sonning dispersiyasi nolga teng"],
    ["M(c) = c", "O'zgarmas sonning matematik kutilmasi o'ziga teng"],
    ["Chetlanish yig'indisi", "∑(xᵢ − x̄) = 0 har doim nolga teng"],
    ["Tarqoqlik", "Dispersiya va σ qiymatlarning sochilish darajasi"],
    ["M(kX) = k·M(X)", "Matematik kutilma xossasi"],
    ["D(kX) = k²·D(X)", "Dispersiya xossasi"],
  ]);

  b.addChoice("Tanlanmada eng ko'p uchraydigan qiymat nima deb ataladi?", "Moda (Mo)", ["Mediana (Me)", "Dispersiya (D)", "O'rta arifmetik"], "Eng yuqori chastotali qiymat tanlanmaning modasi (Mo) deyiladi.");
  b.addChoice("O'sish tartibida yozilgan sonlar qatorining qoq o'rtasida turgan son (yoki o'rtadagi ikki son o'rta arifmetigi) nima?", "Mediana (Me)", ["Moda (Mo)", "Diapazon (R)", "O'rtacha kvadratik chetlanish"], "Tartiblangan qatorni teng ikkiga bo'luvchi ko'rsatkich mediana (Me) dir.");
  b.addChoice("O'rtacha kvadratik chetlanish σ va dispersiya D(X) orasidagi bog'lanish qaysi?", "σ = √D(X)", ["σ = D(X)²", "σ = D(X) / 2", "D(X) = √σ"], "O'rtacha kvadratik chetlanish dispersiyaning kvadrat ildiziga teng.");
  b.addTF("Har qanday sonlar qatorida o'rta arifmetikdan chetlanishlar yig'indisi ∑(xᵢ − x̄) = 0 ga teng.", true, "∑xᵢ − n·x̄ = n·x̄ − n·x̄ = 0.");
  b.addTF("Agar D(X) = 16 bo'lsa, o'rtacha kvadratik chetlanish σ = 8 ga teng.", false, "σ = √16 = 4.");

  // 1) O'rta arifmetik, moda, mediana, diapazon aniq qatorlardan
  for (let a = 2; a <= 14; a++) {
    for (let d = 1; d <= 6; d++) {
      if (b.count >= 165) break;
      // 5 ta elementli qator: [a, a+d, a+d, a+2d, a+4d] => Mo = a+d, Me = a+d, R = 4d
      // Or [a, a+d, a+2d, a+2d, a+5d] => sum = 5a + 10d => mean = a + 2d, Mo = a + 2d, Me = a + 2d, R = 5d!
      const arr = [a, a + d, a + 2 * d, a + 2 * d, a + 5 * d];
      const mean = a + 2 * d;
      const range = 5 * d;
      const str = arr.join(", ");
      const m = (a + d) % 4;
      if (m === 0) {
        b.addFill(
          `${str} sonlar qatorining o'rta arifmetikini toping.`,
          `${mean}`,
          `(${arr.join("+")})/5 = ${5 * mean}/5 = ${mean}.`,
        );
      } else if (m === 1) {
        b.addChoice(
          `${str} tanlanmaning modasini (Mo) toping.`,
          `${a + 2 * d}`,
          pickNumDistractors(a + 2 * d, [a, a + d, a + 5 * d]),
          `${a + 2 * d} qiymati 2 marta, qolganlari 1 martadan uchragan.`,
        );
      } else if (m === 2) {
        b.addFill(
          `${str} qatorning eng katta farqini (diapazonini R) toping.`,
          `${range}`,
          `R = ${a + 5 * d} − ${a} = ${range}.`,
        );
      } else {
        b.addChoice(
          `${str} qatorning medianasini (Me) toping.`,
          `${a + 2 * d}`,
          pickNumDistractors(a + 2 * d, [a + d, range, a + 5 * d]),
          `5 ta tartiblangan sondan o'rtadagi 3-son: ${a + 2 * d}.`,
        );
      }
    }
  }

  // 2) Juft sondagi elementlar medianasi (6 ta son)
  for (let x = 4; x <= 25; x++) {
    for (let gap = 2; gap <= 6; gap += 2) {
      if (b.count >= 245) break;
      const arr = [x - 3, x - 1, x, x + gap, x + gap + 3, x + gap + 6];
      const med = x + gap / 2;
      b.addChoice(
        `${arr.join(", ")} tartiblangan qatorning medianasini toping.`,
        `${med}`,
        pickNumDistractors(med, [x, x + gap, med + 1]),
        `O'rtadagi 3 va 4-hadlar o'rtachasi: (${x} + ${x + gap})/2 = ${med}.`,
      );
    }
  }

  // 3) Dispersiya va standart chetlanish (simmetrik juftliklar [-a, a] -> mean=0, D=a^2, sigma=a; va D -> sigma)
  for (let s = 1; s <= 25; s++) {
    const varVal = s * s;
    b.addFill(
      `Tasodifiy miqdorning dispersiyasi D(X) = ${varVal} bo'lsa, o'rtacha kvadratik chetlanish σ ni toping.`,
      `${s}`,
      `σ = √${varVal} = ${s}.`,
    );
    b.addChoice(
      `X tasodifiy miqdor teng ehtimollik (p = 0,5) bilan −${s} va ${s} qiymatlarni oladi. Uning dispersiyasi D(X) ni toping.`,
      `${varVal}`,
      pickNumDistractors(varVal, [s, 0, 2 * varVal]),
      `M(X) = 0, D(X) = (−${s})²·0,5 + ${s}²·0,5 = ${varVal}.`,
    );
  }

  // 4) Matematik kutilma M(X) = x1*p1 + x2*p2
  for (let x1 = 1; x1 <= 8; x1++) {
    for (let x2 = x1 + 2; x2 <= 12; x2 += 2) {
      if (b.count >= 340) break;
      // p1 = 0.5, p2 = 0.5
      const mx = (x1 + x2) / 2;
      if (Number.isInteger(mx)) {
        b.addFill(
          `X tasodifiy miqdor 0,5 ehtimollik bilan ${x1} va 0,5 ehtimollik bilan ${x2} qiymat oladi. Matematik kutilma M(X) ni toping.`,
          `${mx}`,
          `M(X) = ${x1}·0,5 + ${x2}·0,5 = ${mx}.`,
        );
      }
    }
  }

  // 5) Chastotalar jadvali bo'yicha o'rta qiymat, reprezentativ tanlanma (488-mashq) va ikki qiymatli dispersiya
  for (let w1 = 2; w1 <= 8; w1++) {
    for (let x1 = 1; x1 <= 6; x1++) {
      for (let d = 2; d <= 8; d += 2) {
        if (b.count >= 340) break;
        const x2 = x1 + d;
        const m1 = w1;
        const m2 = w1;
        const weightedMean = (x1 * m1 + x2 * m2) / (m1 + m2);
        if (Number.isInteger(weightedMean)) {
          b.addChoice(
            `Chastotalar jadvalida ${x1} qiymat ${m1} marta, ${x2} qiymat ${m2} marta uchradi. Tanlanma o'rta qiymatini toping.`,
            `${weightedMean}`,
            pickNumDistractors(weightedMean, [x1, x2, m1 + m2]),
            `x̄ = (${x1}·${m1} + ${x2}·${m2})/(${m1} + ${m2}) = ${weightedMean}.`,
          );
        }
      }
    }
  }

  for (let sample = 20; sample <= 200; sample += 15) {
    for (const def of [1, 2, 3, 4, 5]) {
      if (b.count >= 340) break;
      const pop = sample * 10;
      const est = def * 10;
      b.addFill(
        `${pop} ta detaldan tasodifiy tanlab olingan ${sample} ta detalning ${def} tasi yaroqsiz chiqdi. Butun partiyada taxminan nechta yaroqsiz detal bor?`,
        `${est}`,
        `Nisbiy chastota ${def}/${sample} ⇒ ${pop}·(${def}/${sample}) = ${est} ta.`,
      );
    }
  }

  return b.build();
}

function makeTopic39(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-39-yakuniy-takrorlash",
    topicTitle: "39. IX sinf «Algebra» kursini yakuniy takrorlash",
    title: "39. IX sinf «Algebra» kursini yakuniy takrorlash (512–569-mashqlar)",
    source: "Algebra 9-sinf (2019), Yakuniy takrorlash, 222–227-betlar",
    seed: 9039,
  });

  b.addCards([
    ["Parabola", "Kvadrat funksiya grafigi (y = ax² + bx + c)"],
    ["Koshi", "(a + b)/2 ≥ √(ab) klassik tengsizligi"],
    ["Radian", "Yoy uzunligi R ga teng burchak (180° = π rad)"],
    ["Ayniyat", "sin²α + cos²α = 1 asosiy bog'lanish"],
    ["Arifmetik", "aₙ = a₁ + (n − 1)d progressiyasi"],
    ["Geometrik", "bₙ = b₁ · qⁿ⁻¹ progressiyasi"],
    ["Ehtimollik", "P(A) = m / n tasodifiy hodisa mezoni"],
    ["Dispersiya", "O'rta kvadratik chetlanish kvadrati D(X)"],
    ["Mediana", "Tartiblangan qatorning o'rta qiymati"],
    ["Al-Xorazmiy", "Algebra faniga asos solgan buyuk vatandoshimiz"],
    ["512–569 mashq", "9-sinf Algebra yakuniy takrorlash mashqlari"],
    ["x₀ = −b/(2a)", "Parabola uchining abssissasi"],
    ["S = b₁/(1−q)", "Cheksiz kamayuvchi geometrik progressiya yig'indisi"],
    ["sin 2α", "2 sin α cos α ikkilangan burchak formulasi"],
    ["cos(α+β)", "cos α cos β − sin α sin β"],
    ["1 + tg²α", "1 / cos²α ga teng ayniyat"],
    ["Sₙ arifmetik", "((a₁ + aₙ) / 2) · n"],
    ["Sₙ geometrik", "b₁(qⁿ − 1) / (q − 1)"],
    ["P(Ā) = 1 − P(A)", "Qarama-qarshi hodisa ehtimolligi"],
    ["W(A) = m / n", "Tajribadagi nisbiy chastota"],
    ["f(−x) = f(x)", "Juft funksiya sharti"],
    ["f(−x) = −f(x)", "Toq funksiya sharti"],
    ["M(X) = ∑xᵢpᵢ", "Matematik kutilma formulasi"],
    ["σ = √D(X)", "O'rtacha kvadratik chetlanish"],
  ]);

  b.addChoice("9-sinf Algebra kursida o'rganilgan 5 ta asosiy bob qaysilar?", "Kvadrat funksiya, Sistemalar, Trigonometriya, Progressiyalar, Ehtimollar nazariyasi", ["Logarifm, Hosila, Integral, Vektor, Stereometriya", "Matritsa, Kompleks son, Limit, Differensial, Guruhlar", "Faqat arifmetika va geometriya"], "9-sinf Algebra darsligi aynan shu 5 bobdan tashkil topgan.");
  b.addTF("IX sinf yakuniy takrorlash bobi 512–569-mashqlarni o'z ichiga oladi.", true, "Darslikning 222–227-betlarida 512 dan 569 gacha yakuniy takrorlash mashqlari joylashgan.");

  // Barcha 5 bobdan kompleks 340 ta savol
  // 1) Bob I: Parabola uchi va kvadrat tengsizlik butun yechimlari (70 ta)
  for (let m = -5; m <= 5; m++) {
    for (let n = -3; n <= 4; n++) {
      if (b.count >= 75) break;
      const bb = -2 * m;
      const c = m * m + n;
      const bStr = bb === 0 ? "" : bb > 0 ? ` + ${bb}x` : ` − ${Math.abs(bb)}x`;
      const cStr = c === 0 ? "" : c > 0 ? ` + ${c}` : ` − ${Math.abs(c)}`;
      b.addChoice(
        `y = x²${bStr}${cStr} parabolaning uchining koordinatalarini toping.`,
        `(${m}; ${n})`,
        [`(${-m}; ${n})`, `(${m}; ${-n})`, `(${n}; ${m})`],
        `x₀ = ${m}, y₀ = ${n}.`,
      );
    }
  }

  for (let r1 = -4; r1 <= 3; r1++) {
    for (let r2 = r1 + 2; r2 <= 6; r2++) {
      if (b.count >= 120) break;
      const p = -(r1 + r2);
      const q = r1 * r2;
      const pStr = p === 0 ? "" : p > 0 ? ` + ${p}x` : ` − ${Math.abs(p)}x`;
      const qStr = q === 0 ? "" : q > 0 ? ` + ${q}` : ` − ${Math.abs(q)}`;
      b.addFill(
        `x²${pStr}${qStr} ≤ 0 kvadrat tengsizlikning nechta butun yechimi bor?`,
        `${r2 - r1 + 1}`,
        `[${r1}; ${r2}] kesmada ${r2 - r1 + 1} ta butun son bor.`,
      );
    }
  }

  // 2) Bob II: Sistemalar va Koshi tengsizligi (65 ta)
  for (let a = 1; a <= 8; a++) {
    for (let c = a + 1; c <= 10; c++) {
      if (b.count >= 180) break;
      b.addChoice(
        `{x + y = ${a + c}; xy = ${a * c}} tenglamalar sistemasidan x² + y² qiymatini toping.`,
        `${a * a + c * c}`,
        pickNumDistractors(a * a + c * c, [(a + c) ** 2, a * c, a * a + c * c + 2]),
        `(${a + c})² − 2·${a * c} = ${a * a + c * c}.`,
      );
    }
  }
  for (let k = 2; k <= 18; k++) {
    b.addFill(
      `x > 0 bo'lganda ${k}x + ${k}/x ifodaning eng kichik qiymatini toping.`,
      `${2 * k}`,
      `Koshi bo'yicha ≥ 2√(${k}²) = ${2 * k}.`,
    );
  }

  // 3) Bob III: Trigonometriya kompleks (75 ta)
  for (let k = 1; k <= 24; k++) {
    const deg = k * 15;
    const g = gcd(deg, 180);
    const num = deg / g;
    const den = 180 / g;
    const rad = den === 1 ? (num === 1 ? "π" : `${num}π`) : num === 1 ? `π/${den}` : `${num}π/${den}`;
    b.addChoice(
      `${deg}° burchakni radianda ifodalang.`,
      rad,
      pickStrDistractors(rad, [`${num + 1}π/${den}`, `π/${den + 1}`, `${deg}π`]),
      `${deg}°·π/180° = ${rad}.`,
    );
  }
  const pyth: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];
  for (const [a, c, h] of pyth) {
    b.addChoice(
      `I chorakdagi α uchun sin α = ${a}/${h} bo'lsa, cos α va tg α ni toping.`,
      `${c}/${h} va ${a}/${c}`,
      [`${a}/${c} va ${c}/${h}`, `−${c}/${h} va ${a}/${c}`, `${c}/${h} va ${c}/${a}`],
      `cos α = ${c}/${h}, tg α = ${a}/${c}.`,
    );
    b.addChoice(
      `O'tkir α uchun sin α = ${a}/${h} da sin 2α nimaga teng?`,
      fracStr(2 * a * c, h * h),
      pickStrDistractors(fracStr(2 * a * c, h * h), [fracStr(a * c, h * h), fracStr(2 * a, h), "1"]),
      `sin 2α = 2·(${a}/${h})·(${c}/${h}) = ${fracStr(2 * a * c, h * h)}.`,
    );
  }
  for (let k = 2; k <= 32; k++) {
    b.addTF(
      `${k}sin²α + ${k}cos²α − ${k} = 0 tenglik barcha α lar uchun o'rinli.`,
      true,
      `${k}(sin²α + cos²α) − ${k} = ${k} − ${k} = 0.`,
    );
  }

  // 4) Bob IV: Progressiyalar kompleks (60 ta)
  for (let a1 = 2; a1 <= 12; a1 += 2) {
    for (let d = 2; d <= 6; d++) {
      if (b.count >= 295) break;
      const n = 6;
      const sn = ((2 * a1 + (n - 1) * d) * n) / 2;
      b.addChoice(
        `Arifmetik progressiyada a₁ = ${a1}, d = ${d}. Dastlabki ${n} ta had yig'indisini toping.`,
        `${sn}`,
        pickNumDistractors(sn, [sn + 6, sn - 6, a1 + 5 * d]),
        `S₆ = (2·${a1} + 5·${d})·6/2 = ${sn}.`,
      );
    }
  }
  for (let b1 = 1; b1 <= 15; b1++) {
    b.addFill(
      `Cheksiz kamayuvchi geometrik progressiyada b₁ = ${b1}, q = 1/3. Yig'indini toping (kasr yoki butun).`,
      fracStr(3 * b1, 2),
      `S = ${b1}/(1 − 1/3) = ${fracStr(3 * b1, 2)}.`,
    );
  }

  // 5) Bob V: Ehtimollik va statistika kompleks (qolganini 340 gacha)
  for (let w = 2; w <= 16; w++) {
    for (let k = 3; k <= 9; k++) {
      if (b.count >= 340) break;
      const tot = w + k;
      const ans = fracStr(w, tot);
      b.addChoice(
        `Qutida ${w} ta yashil va ${k} ta sariq shar bor. Yashil shar chiqish ehtimolligini toping.`,
        ans,
        pickStrDistractors(ans, [fracStr(k, tot), fracStr(w, k), "1"]),
        `P = ${w}/${tot} = ${ans}.`,
      );
      if (b.count < 340) {
        const s = (w % 12) + 2;
        b.addFill(
          `Dispersiyasi D(X) = ${s * s} bo'lgan tasodifiy miqdorning o'rtacha kvadratik chetlanishi σ ni toping.`,
          `${s}`,
          `σ = √(${s * s}) = ${s}.`,
        );
      }
    }
  }

  return b.build();
}

export function buildTopics28To39(): QuizOutput[] {
  return [
    makeTopic28(),
    makeTopic29(),
    makeTopic30(),
    makeTopic31(),
    makeTopic32(),
    makeTopic33(),
    makeTopic34(),
    makeTopic35(),
    makeTopic36(),
    makeTopic37(),
    makeTopic38(),
    makeTopic39(),
  ];
}
