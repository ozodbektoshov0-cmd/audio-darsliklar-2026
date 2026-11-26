import {
  TopicBuilder,
  fmtXShift,
  fracStr,
  gcd,
  pickNumDistractors,
  pickStrDistractors,
  polyLinear,
  polyQuad,
  signedTerm,
  type QuizOutput,
} from "./core.ts";

function commonAlgebraCards(): [string, string][] {
  return [
    ["Algebra", "Tenglama, tengsizlik va funksiyalarni o'rganuvchi fan"],
    ["Kvadrat", "Ikkinchi darajaga ko'tarilgan hadli ifoda"],
    ["Funksiya", "Har bir x ga yagona y mos qo'yuvchi bog'lanish"],
    ["Parabola", "Kvadrat funksiyaning grafigi bo'lgan egri chiziq"],
    ["Diskriminant", "D = b² − 4ac ildizlar sonini aniqlovchi ifoda"],
    ["Viyet", "Ildizlar yig'indisi va ko'paytmasini bog'lovchi teorema"],
    ["Ildiz", "Tenglamani to'g'ri tenglikka aylantiruvchi qiymat"],
    ["Argumеnt", "Erkin o'zgaruvchi x ning boshqacha nomi"],
    ["Simmetriya", "Parabola uchidan o'tuvchi tik o'q xossasi"],
    ["Interval", "Sonlar o'qidagi uzluksiz oraliq"],
    ["Tengsizlik", "Taqqoslash belgilari qatnashgan munosabat"],
    ["Qiymat", "Funksiyaning biror nuqtadagi natijasi"],
  ];
}

function makeTopic00(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-00-takrorlash",
    topicTitle: "0. 8-sinfda o'rganilgan mavzularni takrorlash",
    title: "0. 8-sinfda o'rganilgan mavzularni takrorlash",
    source: "Algebra 9-sinf (2019), Takrorlash, 3–4-betlar",
    seed: 9000,
  });

  b.addCards([
    ...commonAlgebraCards(),
    ["Qisqa", "Ko'paytirish formulalarining umumiy nomi"],
    ["Arifmetik", "Manfiy bo'lmagan kvadrat ildiz turi"],
    ["Modul", "Sonning koordinata boshigacha bo'lgan masofasi"],
    ["Ratsional", "Ko'phadlar nisbati ko'rinishidagi kasr ifoda"],
    ["Koeffitsiyent", "O'zgaruvchi oldidagi sonli ko'paytuvchi"],
    ["Chiziqli", "Birinchi darajali tenglama va tengsizlik turi"],
    ["Kvadrat ildiz", "Kvadrati a ga teng bo'lgan nomanfiy son"],
    ["To'la kvadrat", "(a ± b)² = a² ± 2ab + b² ayniyati"],
    ["Kvadratlar ayirmasi", "a² − b² = (a − b)(a + b)"],
    ["Viyet formulalari", "x₁ + x₂ = −p, x₁·x₂ = q"],
    ["Katta ildiz", "x² − 7x + 12 = 0 da x = 4"],
    ["Kichik ildiz", "x² − 7x + 12 = 0 da x = 3"],
    ["Tengsizlik yechimi", "Tengsizlikni to'g'ri qiluvchi sonlar to'plami"],
    ["Kasr maxraji", "Nolga teng bo'lmasligi shart bo'lgan qism"],
  ]);

  b.addChoice("ax² + bx + c = 0 (a ≠ 0) kvadrat tenglamaning diskriminanti qaysi formula bilan topiladi?", "D = b² − 4ac", ["D = b² + 4ac", "D = b − 4ac", "D = (b² − ac)/2"], "Kvadrat tenglama diskriminanti D = b² − 4ac ga teng.");
  b.addChoice("Diskriminant D < 0 bo'lganda kvadrat tenglama nechta haqiqiy ildizga ega bo'ladi?", "Haqiqiy ildizi bo'lmaydi", ["1 ta ildiz", "2 ta turli ildiz", "Cheksiz ko'p ildiz"], "D < 0 da haqiqiy sonlar to'plamida kvadrat tenglama yechimga ega emas.");
  b.addChoice("Keltirilgan x² + px + q = 0 kvadrat tenglama uchun Viyet teoremasi qanday yoziladi?", "x₁ + x₂ = −p va x₁·x₂ = q", ["x₁ + x₂ = p va x₁·x₂ = −q", "x₁ + x₂ = q va x₁·x₂ = p", "x₁ − x₂ = p va x₁·x₂ = q"], "Viyet teoremasiga ko'ra ildizlar yig'indisi −p ga, ko'paytmasi q ga teng.");
  b.addChoice("√(a²) ifoda har qanday haqiqiy a son uchun nimaga teng?", "|a|", ["a", "−a", "a²"], "Har qanday haqiqiy a uchun √(a²) = |a| bo'ladi.");
  b.addChoice("(a − b)² formulasi qanday yoyiladi?", "a² − 2ab + b²", ["a² − ab + b²", "a² + 2ab − b²", "a² − b²"], "Ayirmaning kvadrati a² − 2ab + b² ga teng.");
  b.addChoice("a² − b² ifoda qanday ko'paytuvchilarga ajraladi?", "(a − b)(a + b)", ["(a − b)²", "(a + b)²", "(a − b)(a − b)"], "Kvadratlar ayirmasi (a − b)(a + b) ko'paytmasiga teng.");

  // 1) Kvadrat tenglama ildizlari (x - r1)(x - r2) = 0 -> x^2 + px + q = 0
  for (let r1 = -8; r1 <= 8; r1++) {
    for (let r2 = r1 + 1; r2 <= 9; r2++) {
      if (b.count >= 110) break;
      if (r1 === 0 && r2 === 0) continue;
      const p = -(r1 + r2);
      const q = r1 * r2;
      const eq = `${polyQuad(1, p, q)} = 0`;
      if ((r1 + r2 + 100) % 4 === 0) {
        b.addFill(
          `${eq} kvadrat tenglamaning katta ildizini toping.`,
          `${r2}`,
          `${eq} tenglama ildizlari ${r1} va ${r2}. Kattasi ${r2}.`,
        );
      } else if ((r1 + r2 + 100) % 4 === 1) {
        b.addTF(
          `${eq} tenglama ildizlari yig'indisi ${-p} ga teng.`,
          true,
          `Viyet teoremasi bo'yicha x₁ + x₂ = ${r1} + (${r2}) = ${-p}.`,
        );
      } else {
        b.addChoice(
          `${eq} tenglama ildizlari qaysi javobda to'g'ri berilgan?`,
          `${r1} va ${r2}`,
          [`${-r1} va ${-r2}`, `${r1 - 1} va ${r2 + 1}`, `${r1} va ${r2 + 2}`],
          `Viyet bo'yicha (${r1}) + (${r2}) = ${-p}, ko'paytma = ${q}.`,
        );
      }
    }
  }

  // 2) Diskriminant hisoblash
  for (let a = 1; a <= 4; a++) {
    for (let bb = -7; bb <= 7; bb++) {
      for (let c = -5; c <= 5; c++) {
        if (b.count >= 190) break;
        if (bb === 0 && c === 0) continue;
        const d = bb * bb - 4 * a * c;
        const eq = `${polyQuad(a, bb, c)} = 0`;
        if ((a + Math.abs(bb) + Math.abs(c)) % 3 === 0) {
          b.addFill(
            `${eq} tenglama diskriminantini hisoblang.`,
            `${d}`,
            `D = (${bb})² − 4·${a}·(${c}) = ${bb * bb} − ${4 * a * c} = ${d}.`,
          );
        } else {
          const dist = pickNumDistractors(d, [d + 4, d - 4, bb * bb + 4 * a * c, -d]);
          b.addChoice(
            `${eq} kvadrat tenglamaning diskriminanti nechaga teng?`,
            `${d}`,
            dist,
            `D = b² − 4ac = (${bb})² − 4·${a}·(${c}) = ${d}.`,
          );
        }
      }
    }
  }

  // 3) Kvadrat ildiz hisoblash va soddalashtirish
  for (let k = 2; k <= 25; k++) {
    for (let m = 1; m <= 6; m++) {
      if (b.count >= 265) break;
      const val = k * k;
      const ans = k + m;
      if ((k + m) % 3 === 0) {
        b.addTF(
          `√${val} + √${m * m} ifodaning qiymati ${ans} ga teng.`,
          true,
          `√${val} = ${k} va √${m * m} = ${m}, yig'indisi ${ans}.`,
        );
      } else {
        b.addChoice(
          `√${val} − √${m * m} ifodani hisoblang.`,
          `${k - m}`,
          pickNumDistractors(k - m, [k + m, k - m + 2, val - m * m]),
          `√${val} = ${k}, √${m * m} = ${m}. Ayirma ${k} − ${m} = ${k - m}.`,
        );
      }
    }
  }

  // 4) Chiziqli tengsizliklar va kasr qisqartirish
  for (let k = 2; k <= 9; k++) {
    for (let x0 = -5; x0 <= 10; x0++) {
      if (b.count >= 345) break;
      const c = 3 + ((k * 3 + Math.abs(x0)) % 11);
      const rhs = k * x0 + c;
      const qTxt = `${k}x + ${c} > ${rhs} tengsizlikning yechimini toping.`;
      b.addChoice(
        qTxt,
        `x > ${x0}`,
        [`x < ${x0}`, `x ≥ ${x0}`, `x > ${x0 + 1}`],
        `${k}x > ${rhs} − ${c} ⇒ ${k}x > ${k * x0} ⇒ x > ${x0}.`,
      );
      if (b.count < 345 && x0 > 0) {
        const diff = k * k - x0 * x0;
        b.addTF(
          `(${k} − ${x0})(${k} + ${x0}) ko'paytma ${diff} ga teng.`,
          true,
          `Kvadratlar ayirmasi formulasiga ko'ra ${k}² − ${x0}² = ${diff}.`,
        );
      }
    }
  }

  // Fallback ekstra
  let extra = 2;
  while (b.count < 340) {
    const val = extra * extra + 1;
    b.addFill(
      `x = ${extra} bo'lganda x² + 1 ifoda qiymatini toping.`,
      `${val}`,
      `${extra}² + 1 = ${extra * extra} + 1 = ${val}.`,
    );
    extra++;
  }

  return b.build();
}

function makeTopic01(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-01-kvadrat-funksiya-tarifi",
    topicTitle: "1-§. Kvadrat funksiyaning ta'rifi",
    title: "1-§. Kvadrat funksiyaning ta'rifi",
    source: "Algebra 9-sinf (2019), I bob, 1-§, 5–7-betlar",
    seed: 9001,
  });

  b.addCards([
    ...commonAlgebraCards(),
    ["Bosh had", "Kvadrat funksiyadagi ax² qo'shiluvchisi"],
    ["Ozod had", "y = ax² + bx + c dagi c soni"],
    ["Nol", "Funksiyani nolga aylantiruvchi x qiymati"],
    ["Moslik", "x va y orasidagi funksional bog'lanish"],
    ["Kvadrat funksiya", "y = ax² + bx + c (a ≠ 0) ko'rinishidagi funksiya"],
    ["Kvadrat uchhad", "ax² + bx + c (a ≠ 0) ko'rinishidagi ifoda"],
    ["a ≠ 0 sharti", "a = 0 bo'lsa funksiya chiziqli bo'lib qoladi"],
    ["x² koeffitsiyenti", "y = ax² + bx + c dagi a soni"],
    ["x koeffitsiyenti", "y = ax² + bx + c dagi b soni"],
    ["y(0) qiymati", "Kvadrat funksiyada har doim c ga teng"],
    ["Funksiyaning noli", "ax² + bx + c = 0 tenglama ildizlari"],
    ["Erkin tushish", "h = gt²/2 — kvadratik bog'lanish misoli"],
    ["Kvadrat yuzi", "S = a² — kvadrat funksiyaning sodda turi"],
    ["To'la bo'lmagan", "b = 0 yoki c = 0 bo'lgan kvadrat funksiya"],
  ]);

  b.addChoice("Qaysi formula kvadrat funksiyaning umumiy ko'rinishini ifodalaydi?", "y = ax² + bx + c (a ≠ 0)", ["y = kx + b", "y = k / x", "y = a / x² + b"], "y = ax² + bx + c, bunda a ≠ 0 — kvadrat funksiya ta'rifi.");
  b.addChoice("y = ax² + bx + c funksiyada a = 0 bo'lsa, u qanday funksiyaga aylanadi?", "Chiziqli funksiyaga", ["Teskari proporsionallikka", "Kub funksiyaga", "O'zgarmas qoladi"], "a = 0 da y = bx + c chiziqli funksiya hosil bo'ladi.");
  b.addTF("y = 3x² − 5x + 1 kvadrat funksiya hisoblanadi.", true, "Bunda a = 3 ≠ 0, demak bu kvadrat funksiya.");
  b.addTF("y = 2x + 7 kvadrat funksiya hisoblanadi.", false, "y = 2x + 7 da x² hadi yo'q (a = 0), u chiziqli funksiya.");
  b.addTF("Tomoni x ga teng kvadratning yuzi S(x) = x² kvadrat funksiyadir.", true, "S(x) = 1·x² + 0·x + 0 ko'rinishida bo'lib, a = 1 ≠ 0.");

  // 1) Koeffitsiyentlarni aniqlash
  const coeffs: [number, number, number][] = [];
  for (let a = -4; a <= 5; a++) {
    if (a === 0) continue;
    for (let bb = -5; bb <= 5; bb++) {
      for (let c = -4; c <= 4; c++) {
        if (coeffs.length < 95) coeffs.push([a, bb, c]);
      }
    }
  }
  coeffs.forEach(([a, bb, c], idx) => {
    const fn = `y = ${polyQuad(a, bb, c)}`;
    if (idx % 3 === 0) {
      b.addChoice(
        `${fn} kvadrat funksiyaning a, b, c koeffitsiyentlarini toping.`,
        `a = ${a}, b = ${bb}, c = ${c}`,
        [
          `a = ${bb}, b = ${a}, c = ${c}`,
          `a = ${a}, b = ${-bb}, c = ${c}`,
          `a = ${a}, b = ${c}, c = ${bb}`,
        ],
        `y = ax² + bx + c bilan solishtirganda a = ${a}, b = ${bb}, c = ${c}.`,
      );
    } else if (idx % 3 === 1) {
      b.addFill(
        `${fn} kvadrat funksiyaning ozod hadini (c ni) yozing.`,
        `${c}`,
        `Ozod had x ga bog'liq bo'lmagan had bo'lib, c = ${c}.`,
      );
    } else {
      b.addTF(
        `${fn} funksiyada x² oldidagi koeffitsiyent ${a} ga teng.`,
        true,
        `x² hadining koeffitsiyenti a = ${a}.`,
      );
    }
  });

  // 2) y(x0) qiymatini hisoblash
  for (let a = 1; a <= 4; a++) {
    for (let bb = -4; bb <= 4; bb++) {
      for (let c = -3; c <= 5; c++) {
        if (b.count >= 245) break;
        const x0 = ((a + Math.abs(bb) + Math.abs(c)) % 5) - 2 || 2;
        const y0 = a * x0 * x0 + bb * x0 + c;
        const fn = `f(x) = ${polyQuad(a, bb, c)}`;
        if ((a + c) % 4 === 0) {
          b.addFill(
            `${fn} funksiya berilgan. f(${x0}) qiymatini hisoblang.`,
            `${y0}`,
            `f(${x0}) = ${a}·(${x0})² + (${bb})·(${x0}) + (${c}) = ${y0}.`,
          );
        } else {
          b.addChoice(
            `${fn} bo'lsa, f(${x0}) nimaga teng?`,
            `${y0}`,
            pickNumDistractors(y0, [y0 + 2, y0 - 2, -y0, y0 + a]),
            `x = ${x0} ni qo'ysak: ${a}·${x0 * x0} + (${bb * x0}) + (${c}) = ${y0}.`,
          );
        }
      }
    }
  }

  // 3) Kvadrat funksiyani tanish va nollarini topish
  for (let r1 = -5; r1 <= 4; r1++) {
    for (let r2 = r1 + 1; r2 <= 6; r2++) {
      if (b.count >= 340) break;
      const bb = -(r1 + r2);
      const c = r1 * r2;
      const fn = `y = ${polyQuad(1, bb, c)}`;
      b.addChoice(
        `${fn} kvadrat funksiyaning nollarini toping.`,
        `${r1} va ${r2}`,
        [`${-r1} va ${-r2}`, `${r1} va ${r2 + 2}`, `${r1 - 1} va ${r2}`],
        `${polyQuad(1, bb, c)} = 0 tenglama ildizlari x₁ = ${r1}, x₂ = ${r2}.`,
      );
      if (b.count < 340) {
        b.addTF(
          `x = ${r1} qiymat ${fn} funksiyaning noli hisoblanadi.`,
          true,
          `y(${r1}) = (${r1})² + (${bb})·(${r1}) + (${c}) = 0.`,
        );
      }
    }
  }

  let k = 1;
  while (b.count < 340) {
    const val = 2 * k * k + 3;
    b.addFill(
      `y = 2x² + 3 funksiyada x = ${k} bo'lganda y qiymatini toping.`,
      `${val}`,
      `2·${k}² + 3 = ${val}.`,
    );
    k++;
  }

  return b.build();
}

function makeTopic02(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-02-y-x2-funksiya",
    topicTitle: "2-§. y = x² funksiya",
    title: "2-§. y = x² funksiya",
    source: "Algebra 9-sinf (2019), I bob, 2-§, 7–10-betlar",
    seed: 9002,
  });

  b.addCards([
    ...commonAlgebraCards(),
    ["Shoxlar", "Parabolaning yuqoriga qaragan ikki tarmog'i"],
    ["Koordinata", "Nuqtaning tekislikdagi (x; y) o'rni"],
    ["Juftlik", "f(-x) = f(x) xossasiga ega funksiya"],
    ["Manfiy emas", "y ≥ 0 qiymatlar to'plami"],
    ["Uch", "Parabolaning eng quyi nuqtasi (0; 0)"],
    ["y = x² uchi", "Koordinata boshi (0; 0) nuqtasida"],
    ["Simmetriya o'qi", "Oy o'qi (x = 0 to'g'ri chizig'i)"],
    ["Qiymatlar sohasi", "E(y) = [0; +∞)"],
    ["O'sish oralig'i", "[0; +∞) oraliqda funksiya o'sadi"],
    ["Kamayish oralig'i", "(−∞; 0] oraliqda funksiya kamayadi"],
    ["Eng kichik qiymat", "y = x² funksiyaning min qiymati 0"],
    ["Juft funksiya", "(−x)² = x² bo'lgani uchun juft"],
    ["y = x² va y = 9", "x = −3 va x = 3 da kesishadi"],
    ["Shoxlar yo'nalishi", "y = x² shoxlari yuqoriga qaragan"],
  ]);

  b.addChoice("y = x² funksiyaning grafigi qanday chiziq?", "Uchi (0; 0) da bo'lgan parabola", ["To'g'ri chiziq", "Giperbola", "Aylana"], "y = x² funksiyaning grafigi — uchi (0; 0) nuqtasida bo'lgan parabola.");
  b.addChoice("y = x² funksiyaning qiymatlar sohasi E(y) qaysi oraliq?", "[0; +∞)", ["(−∞; +∞)", "(0; +∞)", "(−∞; 0]"], "Har qanday haqiqiy x uchun x² ≥ 0, shuning uchun E(y) = [0; +∞).");
  b.addChoice("y = x² funksiya qaysi oraliqda o'suvchi?", "[0; +∞)", ["(−∞; 0]", "(−∞; +∞)", "[−1; 1]"], "x ≥ 0 da x ortishi bilan x² ham ortadi.");
  b.addChoice("y = x² funksiya grafigining simmetriya o'qi qaysi to'g'ri chiziq?", "Oy o'qi (x = 0)", ["Ox o'qi (y = 0)", "y = x", "x = 1"], "(−x)² = x² bo'lgani uchun grafik Oy o'qiga nisbatan simmetrik.");
  b.addTF("y = x² funksiya (−∞; 0] oraliqda kamayuvchi.", true, "x₁ < x₂ ≤ 0 bo'lganda x₁² > x₂², ya'ni funksiya kamayadi.");
  b.addTF("y = x² parabola grafigi III va IV choraklardan o'tadi.", false, "x² ≥ 0 bo'lgani uchun grafik I va II choraklarda joylashadi.");

  // 1) Nuqta tegishliligi va qiymat hisoblash
  for (let x = -35; x <= 35; x++) {
    if (b.count >= 120) break;
    const y = x * x;
    if (x % 3 === 0) {
      b.addFill(
        `y = x² funksiyada x = ${x} bo'lganda y ning qiymatini toping.`,
        `${y}`,
        `y(${x}) = (${x})² = ${y}.`,
      );
    } else if (x % 3 === 1) {
      b.addTF(
        `A(${x}; ${y}) nuqta y = x² funksiya grafigiga tegishli.`,
        true,
        `(${x})² = ${y} tenglik to'g'ri bajariladi.`,
      );
    } else {
      b.addChoice(
        `y = x² grafik x = ${x} nuqtada qanday ordinataga ega?`,
        `${y}`,
        pickNumDistractors(y, [y + 2, -y, Math.abs(x) * 2, y + 4]),
        `y = (${x})² = ${y}.`,
      );
    }
  }

  // 2) Kasr nuqtalar y = (p/q)^2
  for (let q = 2; q <= 9; q++) {
    for (let p = -11; p <= 11; p++) {
      if (b.count >= 210) break;
      if (p === 0 || gcd(p, q) !== 1) continue;
      const ans = fracStr(p * p, q * q);
      const xStr = fracStr(p, q);
      b.addChoice(
        `y = x² funksiyada x = ${xStr} bo'lsa, y nimaga teng?`,
        ans,
        pickStrDistractors(ans, [fracStr(p, q * q), fracStr(p * p, q), `-${ans}`]),
        `(${xStr})² = ${ans}.`,
      );
    }
  }

  // 3) Kesmada eng katta va eng kichik qiymatlar [a; b]
  for (let a = -9; a <= 4; a++) {
    for (let c = a + 1; c <= 10; c++) {
      if (b.count >= 300) break;
      const maxV = Math.max(a * a, c * c);
      const minV = a <= 0 && c >= 0 ? 0 : Math.min(a * a, c * c);
      if ((a + c + 20) % 2 === 0) {
        b.addChoice(
          `y = x² funksiyaning [${a}; ${c}] kesmadagi eng katta qiymatini toping.`,
          `${maxV}`,
          pickNumDistractors(maxV, [minV, maxV + 1, Math.min(a * a, c * c) + 2]),
          `[${a}; ${c}] da x² ning eng katta qiymati chetlarda: max(${a * a}, ${c * c}) = ${maxV}.`,
        );
      } else {
        b.addFill(
          `y = x² funksiyaning [${a}; ${c}] kesmadagi eng kichik qiymatini toping.`,
          `${minV}`,
          a <= 0 && c >= 0
            ? `0 ∈ [${a}; ${c}] bo'lgani uchun eng kichik qiymat y(0) = 0.`
            : `Nol kesmaga kirmaydi, shuning uchun eng kichik qiymat ${minV}.`,
        );
      }
    }
  }

  // 4) y = x² va y = c kesishishi
  for (let m = 1; m <= 25; m++) {
    if (b.count >= 340) break;
    const sq = m * m;
    b.addChoice(
      `y = x² parabola va y = ${sq} to'g'ri chiziqning kesishish nuqtalari abssissalarini toping.`,
      `−${m} va ${m}`,
      [`0 va ${m}`, `−${sq} va ${sq}`, `−${m + 1} va ${m + 1}`],
      `x² = ${sq} tenglama ildizlari x = ±${m}.`,
    );
    if (b.count < 340) {
      b.addTF(
        `A(${m}; ${sq + 1}) nuqta y = x² grafigiga tegishli.`,
        false,
        `(${m})² = ${sq} ≠ ${sq + 1}, shuning uchun tegishli emas.`,
      );
    }
  }

  return b.build();
}

function makeTopic03(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-03-y-ax2-funksiya",
    topicTitle: "3-§. y = ax² funksiya",
    title: "3-§. y = ax² funksiya",
    source: "Algebra 9-sinf (2019), I bob, 3-§, 10–14-betlar",
    seed: 9003,
  });

  b.addCards([
    ...commonAlgebraCards(),
    ["Chozilish", "|a| > 1 da grafikning Oy o'qiga yaqinlashishi"],
    ["Siqilish", "|a| < 1 da grafikning Ox o'qiga yaqinlashishi"],
    ["Koordinata", "A(x₀; y₀) orqali a = y₀/x₀² topish"],
    ["Simmetrik", "y = ax² va y = −ax² grafiklari Ox ga nisbatan"],
    ["a > 0 holi", "Parabola shoxlari yuqoriga yo'nalgan"],
    ["a < 0 holi", "Parabola shoxlari pastga yo'nalgan"],
    ["Qiymatlar sohasi a>0", "E(y) = [0; +∞)"],
    ["Qiymatlar sohasi a<0", "E(y) = (−∞; 0]"],
    ["Eng katta qiymat a<0", "x = 0 da y_max = 0 ga erishiladi"],
    ["Eng kichik qiymat a>0", "x = 0 da y_min = 0 ga erishiladi"],
    ["y = 2x²", "y = x² ga nisbatan tikroq parabola"],
    ["y = 0,5x²", "y = x² ga nisbatan yoyiqroq parabola"],
    ["y = −3x²", "Shoxlari pastga qaragan parabola"],
    ["Ox ga simmetriya", "y = ax² va y = −ax² juftligi"],
  ]);

  b.addChoice("y = ax² (a < 0) parabolaning shoxlari qayerga yo'nalgan bo'ladi?", "Pastga", ["Yuqoriga", "O'ngga", "Chapga"], "a < 0 bo'lganda barcha qiymatlar y ≤ 0, demak shoxlar pastga qaraydi.");
  b.addChoice("y = ax² (a < 0) funksiyaning qiymatlar sohasi qaysi to'plam?", "(−∞; 0]", ["[0; +∞)", "(−∞; +∞)", "(−∞; 0)"], "a < 0 da ax² ≤ 0, maksimal qiymat 0.");
  b.addChoice("y = ax² parabola A(x₀; y₀) nuqtadan (x₀ ≠ 0) o'tsa, a qanday topiladi?", "a = y₀ / x₀²", ["a = x₀² / y₀", "a = y₀ / x₀", "a = x₀ · y₀"], "y₀ = ax₀² dan a = y₀ / x₀² kelib chiqadi.");
  b.addTF("y = 4x² funksiyaning grafigi y = 0,25x² ga qaraganda Oy o'qiga yaqinroq joylashadi.", true, "|a| qancha katta bo'lsa, parabola shuncha tik va Oy o'qiga yaqin bo'ladi.");
  b.addTF("y = −2x² funksiya (−∞; 0] oraliqda o'suvchi.", true, "a < 0 da funksiya x ≤ 0 da o'sadi, x ≥ 0 da kamayadi.");

  // 1) A(x0; y0) orqali a ni topish
  for (let a = -6; a <= 6; a++) {
    if (a === 0) continue;
    for (let x0 = 1; x0 <= 7; x0++) {
      if (b.count >= 130) break;
      const y0 = a * x0 * x0;
      const signX = x0 % 2 === 0 ? -x0 : x0;
      if ((Math.abs(a) + x0) % 3 === 0) {
        b.addFill(
          `y = ax² funksiya grafigi A(${signX}; ${y0}) nuqtadan o'tsa, a koeffitsiyentni toping.`,
          `${a}`,
          `a = ${y0} / (${signX})² = ${y0} / ${x0 * x0} = ${a}.`,
        );
      } else {
        b.addChoice(
          `y = ax² parabola M(${signX}; ${y0}) nuqtadan o'tadi. a ning qiymatini toping.`,
          `${a}`,
          pickNumDistractors(a, [-a, a + 1, a - 1, a * 2]),
          `y₀ = ax₀² ⇒ ${y0} = a·${x0 * x0} ⇒ a = ${a}.`,
        );
      }
    }
  }

  // 2) y = ax² ning x0 nuqtadagi qiymati
  for (let a = -5; a <= 5; a++) {
    if (a === 0) continue;
    for (let x0 = -6; x0 <= 6; x0++) {
      if (b.count >= 245) break;
      if (x0 === 0) continue;
      const y0 = a * x0 * x0;
      const fn = `y = ${a === 1 ? "" : a === -1 ? "−" : a}x²`;
      if ((Math.abs(a) + Math.abs(x0)) % 4 === 0) {
        b.addTF(
          `${fn} funksiyaning x = ${x0} dagi qiymati ${y0} ga teng.`,
          true,
          `${a} · (${x0})² = ${y0}.`,
        );
      } else {
        b.addChoice(
          `${fn} funksiyada x = ${x0} bo'lganda y nimaga teng?`,
          `${y0}`,
          pickNumDistractors(y0, [-y0, a * x0, y0 + a, y0 - 2]),
          `y = ${a}·(${x0})² = ${y0}.`,
        );
      }
    }
  }

  // 3) Kesmada max/min va simmetriya
  for (let a = 1; a <= 6; a++) {
    for (let c = 1; c <= 6; c++) {
      if (b.count >= 340) break;
      const val = a * c * c;
      b.addChoice(
        `y = ${a === 1 ? "" : a}x² funksiyaning [−${c}; ${c + 1}] kesmadagi eng katta qiymatini toping.`,
        `${a * (c + 1) * (c + 1)}`,
        pickNumDistractors(a * (c + 1) * (c + 1), [val, 0, a * (c + 2) * (c + 2)]),
        `a > 0 da eng katta qiymat |x| eng katta nuqtada: ${a}·${c + 1}² = ${a * (c + 1) * (c + 1)}.`,
      );
      if (b.count < 340) {
        b.addFill(
          `y = −${a === 1 ? "" : a}x² parabola bilan Ox o'qiga simmetrik parabola tenglamasi y = ax² da a nechaga teng?`,
          `${a}`,
          `y = −${a}x² ga Ox ga nisbatan simmetrik parabola y = ${a}x², ya'ni a = ${a}.`,
        );
      }
    }
  }

  return b.build();
}

function makeTopic04(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-04-y-ax2-bx-c",
    topicTitle: "4-§. y = ax² + bx + c funksiya",
    title: "4-§. y = ax² + bx + c funksiya",
    source: "Algebra 9-sinf (2019), I bob, 4-§, 14–18-betlar",
    seed: 9004,
  });

  b.addCards([
    ...commonAlgebraCards(),
    ["Abssissa", "Parabola uchining birinchi koordinatasi x₀"],
    ["Ordinata", "Parabola uchining ikkinchi koordinatasi y₀"],
    ["Siljish", "Parabolani o'qlar bo'ylab parallel ko'chirish"],
    ["Kanonik", "a(x − m)² + n ko'rinishidagi yozuv"],
    ["Parabola uchi x₀", "x₀ = −b / (2a)"],
    ["Parabola uchi y₀", "y₀ = ax₀² + bx₀ + c"],
    ["Simmetriya o'qi", "x = −b / (2a) to'g'ri chizig'i"],
    ["Oy kesishish nuqtasi", "(0; c) nuqtada kesishadi"],
    ["y = a(x−m)² + n", "Uchi (m; n) nuqtada joylashgan"],
    ["To'la kvadrat ajratish", "ax² + bx + c = a(x − x₀)² + y₀"],
    ["Eng kichik (a > 0)", "y_min = y₀ qiymatga x = x₀ da erishadi"],
    ["Eng katta (a < 0)", "y_max = y₀ qiymatga x = x₀ da erishadi"],
    ["Ildizlar o'rtasi", "x₀ = (x₁ + x₂) / 2"],
    ["Diskriminant va uch", "y₀ = −D / (4a)"],
  ]);

  b.addChoice("y = ax² + bx + c parabola uchining x₀ abssissasi qaysi formula bilan topiladi?", "x₀ = −b / (2a)", ["x₀ = b / (2a)", "x₀ = −b / a", "x₀ = −c / (2a)"], "Parabola uchining abssissasi x₀ = −b / (2a).");
  b.addChoice("y = ax² + bx + c funksiyaning grafigi Oy o'qini qaysi nuqtada kesib o'tadi?", "(0; c)", ["(c; 0)", "(0; b)", "(−b/(2a); 0)"], "x = 0 qo'yilganda y = c chiqadi, demak nuqta (0; c).");
  b.addTF("y = a(x − m)² + n parabolaning uchi (m; n) nuqtada bo'ladi.", true, "Kanonik shakldagi (m; n) nuqta parabolaning uchi hisoblanadi.");
  b.addTF("y = x² − 6x + 5 parabolaning simmetriya o'qi x = −3 to'g'ri chizig'idir.", false, "x₀ = −(−6)/(2·1) = 3, demak simmetriya o'qi x = 3.");

  // Parametric y = a(x - m)^2 + n = a*x^2 - 2*a*m*x + (a*m^2 + n)
  for (let a = -3; a <= 3; a++) {
    if (a === 0) continue;
    for (let m = -5; m <= 5; m++) {
      for (let n = -5; n <= 5; n++) {
        if (b.count >= 250) break;
        const bb = -2 * a * m;
        const c = a * m * m + n;
        const fn = `y = ${polyQuad(a, bb, c)}`;
        const selector = (Math.abs(a) + Math.abs(m) + Math.abs(n)) % 5;
        if (selector === 0) {
          b.addChoice(
            `${fn} parabolaning uchining koordinatalarini toping.`,
            `(${m}; ${n})`,
            [`(${-m}; ${n})`, `(${m}; ${-n})`, `(${n}; ${m})`],
            `x₀ = −(${bb})/(2·${a}) = ${m}, y₀ = ${n}.`,
          );
        } else if (selector === 1) {
          b.addFill(
            `${fn} parabolaning simmetriya o'qi x = x₀ bo'lsa, x₀ ni toping.`,
            `${m}`,
            `x₀ = −b/(2a) = −(${bb})/${2 * a} = ${m}.`,
          );
        } else if (selector === 2) {
          b.addChoice(
            `${fn} funksiyaning ${a > 0 ? "eng kichik" : "eng katta"} qiymatini toping.`,
            `${n}`,
            pickNumDistractors(n, [-n, n + 2, m, c]),
            `a = ${a} ${a > 0 ? "> 0 bo'lgani uchun y_min" : "< 0 bo'lgani uchun y_max"} = y(${m}) = ${n}.`,
          );
        } else if (selector === 3) {
          b.addTF(
            `${fn} parabola Oy o'qini (0; ${c}) nuqtada kesadi.`,
            true,
            `x = 0 qo'ysak y(0) = ${c}.`,
          );
        } else {
          const rhs = a > 0 ? `[${n}; +∞)` : `(−∞; ${n}]`;
          b.addChoice(
            `${fn} funksiyaning qiymatlar sohasi E(y) ni toping.`,
            rhs,
            [a > 0 ? `(${n}; +∞)` : `(−∞; ${n})`, a > 0 ? `(−∞; ${n}]` : `[${n}; +∞)`, `(−∞; +∞)`],
            `Uchi (${m}; ${n}), a = ${a} ${a > 0 ? "> 0 ⇒ E(y) = [n; +∞)" : "< 0 ⇒ E(y) = (−∞; n]"}.`,
          );
        }
      }
    }
  }

  // a(x-m)^2 + n kanonik ko'rinishdan umumiy ko'rinishga o'tish
  for (let m = -8; m <= 8; m++) {
    for (let n = -6; n <= 6; n++) {
      if (b.count >= 340) break;
      if (m === 0) continue;
      const bb = -2 * m;
      const c = m * m + n;
      const canon = `y = ${fmtXShift(m)}² ${signedTerm(n, "", false)}`;
      b.addChoice(
        `${canon} funksiyani y = ax² + bx + c ko'rinishida yozing.`,
        `y = ${polyQuad(1, bb, c)}`,
        [`y = ${polyQuad(1, -bb, c)}`, `y = ${polyQuad(1, bb, n)}`, `y = ${polyQuad(1, m, c)}`],
        `${fmtXShift(m)}² ${signedTerm(n)} = x² ${signedTerm(bb, "x")} ${signedTerm(m * m + n)}.`,
      );
    }
  }

  return b.build();
}

function makeTopic05(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-05-grafik-yasash",
    topicTitle: "5-§. Kvadrat funksiyaning grafigini yasash",
    title: "5-§. Kvadrat funksiyaning grafigini yasash",
    source: "Algebra 9-sinf (2019), I bob, 5-§, 18–23-betlar",
    seed: 9005,
  });

  b.addCards([
    ...commonAlgebraCards(),
    ["Perimetr", "To'g'ri to'rtburchak tomonlari yig'indisi"],
    ["Kvadrat", "Berilgan perimetrda eng katta yuzali shakl"],
    ["Ekstremum", "Eng katta yoki eng kichik qiymat"],
    ["Kesishish", "Grafikning Ox va Oy o'qlari bilan umumiy nuqtalari"],
    ["Yasash bosqichlari", "Uch, simmetriya o'qi, nollar va qo'shimcha nuqtalar"],
    ["Ox bilan kesishish", "y = 0 bo'lganda x₁, x₂ nuqtalari"],
    ["D > 0 da grafik", "Ox o'qini 2 ta nuqtada kesib o'tadi"],
    ["D = 0 da grafik", "Ox o'qiga uchida urinadi (1 umumiy nuqta)"],
    ["D < 0 da grafik", "Ox o'qini kesib o'tmaydi"],
    ["Ishora oraliqlari", "Grafik Ox dan yuqori (y>0) yoki past (y<0) qismi"],
    ["Max yuza masalasi", "P perimetrda S_max = (P/4)²"],
    ["O'ngga siljitish", "x o'rniga (x − m), m > 0 yozilganda"],
    ["Yuqoriga siljitish", "y = f(x) + n, n > 0 bo'lganda"],
    ["Koordinata tekisligi", "Grafik chiziladigan dekart tekisligi"],
  ]);

  b.addChoice("Kvadrat funksiya grafigi Ox o'qini nechta nuqtada kesishi mumkin?", "0, 1 yoki 2 ta nuqtada", ["Faqat 2 ta nuqtada", "Har doim 1 ta nuqtada", "3 ta nuqtada"], "Diskriminant D < 0 da 0 ta, D = 0 da 1 ta, D > 0 da 2 ta umumiy nuqta bo'ladi.");
  b.addChoice("D < 0 va a > 0 bo'lganda y = ax² + bx + c parabola qayerda joylashadi?", "To'liq Ox o'qidan yuqorida (y > 0)", ["To'liq Ox o'qidan pastda", "Ox o'qini 2 nuqtada kesadi", "Faqat III chorakda"], "a > 0 va D < 0 da funksiya barcha x lar uchun musbat qiymat qabul qiladi.");
  b.addChoice("y = x² grafigini 3 birlik o'ngga va 2 birlik yuqoriga siljitsak qanday funksiya hosil bo'ladi?", "y = (x − 3)² + 2", ["y = (x + 3)² + 2", "y = (x − 3)² − 2", "y = (x + 3)² − 2"], "m birlik o'ngga (x − m), n birlik yuqoriga +n qo'shiladi.");
  b.addTF("y = x² + 5 parabola Ox o'qini kesib o'tmaydi.", true, "x² + 5 = 0 tenglamaning haqiqiy ildizi yo'q (D = −20 < 0).");
  b.addTF("Perimetri 40 sm bo'lgan to'g'ri to'rtburchaklar ichida eng katta yuzasi 100 sm² dir.", true, "x(20 − x) eng katta qiymati x = 10 da S = 10·10 = 100 sm².");

  // 1) Ox o'qi bilan kesishish nuqtalari
  for (let r1 = -6; r1 <= 5; r1++) {
    for (let r2 = r1 + 1; r2 <= 7; r2++) {
      if (b.count >= 140) break;
      const bb = -(r1 + r2);
      const c = r1 * r2;
      const fn = `y = ${polyQuad(1, bb, c)}`;
      if ((r1 + r2 + 20) % 3 === 0) {
        b.addFill(
          `${fn} parabola Ox o'qini kesadigan ikkita nuqta abssissalari yig'indisini toping.`,
          `${r1 + r2}`,
          `x₁ + x₂ = ${r1} + (${r2}) = ${r1 + r2}.`,
        );
      } else {
        b.addChoice(
          `${fn} grafigi Ox o'qini qaysi nuqtalarda kesib o'tadi?`,
          `(${r1}; 0) va (${r2}; 0)`,
          [`(0; ${r1}) va (0; ${r2})`, `(${-r1}; 0) va (${-r2}; 0)`, `(${r1}; 0) va (${r2 + 1}; 0)`],
          `y = 0 tenglama ildizlari x₁ = ${r1}, x₂ = ${r2}.`,
        );
      }
    }
  }

  // 2) Parallel siljishlar
  for (let h = -6; h <= 6; h++) {
    if (h === 0) continue;
    for (let v = -6; v <= 6; v++) {
      if (v === 0 || b.count >= 245) break;
      const hDir = h > 0 ? `${h} birlik o'ngga` : `${Math.abs(h)} birlik chapga`;
      const vDir = v > 0 ? `${v} birlik yuqoriga` : `${Math.abs(v)} birlik pastga`;
      const formula = `y = ${fmtXShift(h)}² ${signedTerm(v)}`;
      b.addChoice(
        `y = x² parabolani ${hDir} va ${vDir} parallel ko'chirish natijasida qaysi funksiya grafigi olinadi?`,
        formula,
        [
          `y = ${fmtXShift(-h)}² ${signedTerm(v)}`,
          `y = ${fmtXShift(h)}² ${signedTerm(-v)}`,
          `y = ${fmtXShift(-h)}² ${signedTerm(-v)}`,
        ],
        `${hDir} siljish ${fmtXShift(h)}, ${vDir} siljish ${signedTerm(v)} beradi.`,
      );
    }
  }

  // 3) Amaliy ekstremum: Perimetr = 4*side bo'lganda max yuza, va y = x^2 + px + q da D=0 sharti
  for (let side = 3; side <= 45; side++) {
    if (b.count >= 310) break;
    const perim = 4 * side;
    const area = side * side;
    b.addFill(
      `Perimetri ${perim} sm bo'lgan to'g'ri to'rtburchakning eng katta yuzasi necha sm² ga teng?`,
      `${area}`,
      `Yarim perimetr ${2 * side}. S(x) = x(${2 * side} − x) maksimumi x = ${side} da S = ${area} sm².`,
    );
  }

  for (let a = 1; a <= 5; a++) {
    for (let bb = -6; bb <= 6; bb++) {
      if (b.count >= 340) break;
      const c = bb * bb + a; // D < 0 (here for a=1)
      b.addTF(
        `y = x² ${signedTerm(bb, "x")} + ${c} parabola Ox o'qini kesib o'tmaydi.`,
        true,
        `D = (${bb})² − 4·1·${c} = ${bb * bb - 4 * c} < 0 bo'lgani uchun Ox o'qi bilan kesishmaydi.`,
      );
    }
  }

  return b.build();
}

function makeTopic06(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-06-kvadrat-tengsizlik",
    topicTitle: "6-§. Kvadrat tengsizlik va uning yechimi",
    title: "6-§. Kvadrat tengsizlik va uning yechimi",
    source: "Algebra 9-sinf (2019), I bob, 6-§, 24–27-betlar",
    seed: 9006,
  });

  b.addCards([
    ...commonAlgebraCards(),
    ["Qat'iy", "Faqat > yoki < belgili tengsizlik"],
    ["Noqat'iy", "≥ yoki ≤ belgili tengsizlik"],
    ["Butun", "Tengsizlik yechimlaridagi butun sonlar"],
    ["Birlashma", "Ikkita nur yechimlar to'plami (∪)"],
    ["Kvadrat tengsizlik", "ax² + bx + c > 0 (< 0, ≥ 0, ≤ 0), a ≠ 0"],
    ["x² < k²", "Yechimi: (−k; k) oraliq (k > 0)"],
    ["x² > k²", "Yechimi: (−∞; −k) ∪ (k; +∞)"],
    ["(x−r₁)(x−r₂) < 0", "Yechimi ildizlar orasida: (r₁; r₂)"],
    ["(x−r₁)(x−r₂) > 0", "Yechimi chetlarda: (−∞; r₁) ∪ (r₂; +∞)"],
    ["a>0, D<0, >0", "Yechim barcha haqiqiy sonlar R"],
    ["a>0, D<0, <0", "Yechimlar to'plami bo'sh (∅)"],
    ["(x − m)² ≥ 0", "Har qanday x ∈ R uchun o'rinli"],
    ["(x − m)² ≤ 0", "Yagona yechimi x = m"],
    ["(x − m)² < 0", "Yechimi yo'q (∅)"],
  ]);

  b.addChoice("x² − 9 < 0 tengsizlikning yechimi qaysi oraliq?", "(−3; 3)", ["(−∞; −3) ∪ (3; +∞)", "[−3; 3]", "(0; 3)"], "(x − 3)(x + 3) < 0 tengsizlik −3 < x < 3 da bajariladi.");
  b.addChoice("x² + 4 > 0 tengsizlikning yechimlar to'plami qaysi?", "Barcha haqiqiy sonlar R", ["Bo'sh to'plam ∅", "(−2; 2)", "(2; +∞)"], "x² ≥ 0 bo'lgani uchun x² + 4 ≥ 4 > 0 barcha x ∈ R uchun o'rinli.");
  b.addTF("x² + 1 ≤ 0 tengsizlikning haqiqiy yechimlari yo'q.", true, "x² + 1 ≥ 1 bo'lgani uchun hech qachon ≤ 0 bo'lmaydi.");
  b.addTF("(x − 4)² ≤ 0 tengsizlikning yagona yechimi x = 4 dir.", true, "Kvadrat faqat x = 4 da nolga teng, manfiy bo'lmaydi.");

  // 1) (x - r1)(x - r2) < 0, > 0, <= 0, >= 0
  for (let r1 = -6; r1 <= 4; r1++) {
    for (let r2 = r1 + 1; r2 <= 7; r2++) {
      if (b.count >= 255) break;
      const bb = -(r1 + r2);
      const c = r1 * r2;
      const poly = polyQuad(1, bb, c);
      const mode = (r1 + r2 + 30) % 4;
      if (mode === 0) {
        b.addChoice(
          `${poly} < 0 kvadrat tengsizlikni yeching.`,
          `(${r1}; ${r2})`,
          [`(−∞; ${r1}) ∪ (${r2}; +∞)`, `[${r1}; ${r2}]`, `(${-r2}; ${-r1})`],
          `Ildizlar ${r1} va ${r2}. a = 1 > 0 bo'lgani uchun < 0 ildizlar orasida: (${r1}; ${r2}).`,
        );
      } else if (mode === 1) {
        b.addChoice(
          `${poly} > 0 kvadrat tengsizlikni yeching.`,
          `(−∞; ${r1}) ∪ (${r2}; +∞)`,
          [`(${r1}; ${r2})`, `[${r1}; ${r2}]`, `(−∞; ${r1}] ∪ [${r2}; +∞)`],
          `a = 1 > 0 da > 0 ildizlardan tashqarida bajariladi.`,
        );
      } else if (mode === 2) {
        const intCount = r2 - r1 - 1;
        b.addFill(
          `${poly} < 0 tengsizlikning nechta butun yechimi bor?`,
          `${intCount}`,
          `(${r1}; ${r2}) oraliqdagi butun sonlar soni (${r2} − (${r1}) − 1) = ${intCount} ta.`,
        );
      } else {
        const inclCount = r2 - r1 + 1;
        b.addFill(
          `${poly} ≤ 0 tengsizlikning nechta butun yechimi bor?`,
          `${inclCount}`,
          `[${r1}; ${r2}] kesmada (${r2} − (${r1}) + 1) = ${inclCount} ta butun son bor.`,
        );
      }
    }
  }

  // 2) x^2 < k^2, x^2 >= k^2 va D <= 0 maxsus hollar
  for (let k = 1; k <= 16; k++) {
    if (b.count >= 315) break;
    const k2 = k * k;
    b.addChoice(
      `x² ≥ ${k2} tengsizlikning yechimi qaysi?`,
      `(−∞; −${k}] ∪ [${k}; +∞)`,
      [`[−${k}; ${k}]`, `(−∞; −${k}) ∪ (${k}; +∞)`, `[${k}; +∞)`],
      `|x| ≥ ${k} shart (−∞; −${k}] ∪ [${k}; +∞) to'plamda bajariladi.`,
    );
    b.addTF(
      `x² − ${2 * k}x + ${k2} > 0 tengsizlikning yechimi x ≠ ${k} barcha haqiqiy sonlardir.`,
      true,
      `(x − ${k})² > 0 faqat x = ${k} nuqtadan tashqari barcha x larda bajariladi.`,
    );
  }

  let m = 1;
  while (b.count < 340) {
    b.addTF(
      `x² + ${m} < 0 tengsizlikning yechimlar to'plami bo'sh (∅).`,
      true,
      `x² + ${m} ≥ ${m} > 0 bo'lgani uchun hech qanday haqiqiy yechim yo'q.`,
    );
    m++;
  }

  return b.build();
}

function makeTopic07(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-07-grafik-tengsizlik",
    topicTitle: "7-§. Kvadrat tengsizlikni grafik yordamida yechish",
    title: "7-§. Kvadrat tengsizlikni grafik yordamida yechish",
    source: "Algebra 9-sinf (2019), I bob, 7-§, 28–32-betlar",
    seed: 9007,
  });

  b.addCards([
    ...commonAlgebraCards(),
    ["Musbat", "Grafik Ox o'qidan yuqorida joylashgan qism"],
    ["Manfiy", "Grafik Ox o'qidan pastda joylashgan qism"],
    ["Urinish", "D = 0 da parabolaning Ox ga bitta nuqtada tegishi"],
    ["Chegaraviy", "Nolga teng bo'ladigan x₁ va x₂ nuqtalar"],
    ["Grafik usul", "Parabola eskiziga qarab ishorani aniqlash"],
    ["y > 0 sharti", "Parabola Ox o'qidan yuqorida yotuvchi x lar"],
    ["y < 0 sharti", "Parabola Ox o'qidan pastda yotuvchi x lar"],
    ["a > 0, D = 0", "Parabola Ox dan yuqorida, faqat x₀ da urinadi"],
    ["a < 0, D = 0", "Parabola Ox dan pastda, faqat x₀ da urinadi"],
    ["a < 0, D > 0", "Ildizlar orasida parabola Ox dan yuqorida"],
    ["a > 0, D > 0", "Ildizlar orasida parabola Ox dan pastda"],
    ["a < 0, D < 0", "Parabola butunlay Ox dan pastda yotadi"],
    ["Bo'sh to'plam", "Grafik talab qilingan yarim tekislikda yo'q"],
    ["Cheksiz yechim", "Parabola to'liq talab qilingan sohada joylashgan"],
  ]);

  b.addChoice("y = ax² + bx + c parabola a < 0 va D > 0 bo'lganda qaysi oraliqda Ox o'qidan yuqorida yotadi?", "(x₁; x₂) — ildizlar orasida", ["(−∞; x₁) ∪ (x₂; +∞)", "Butun son o'qida", "Hech qayerda"], "Shoxlari pastga qaragan parabola ikki ildizi orasida Ox o'qidan yuqorida bo'ladi.");
  b.addChoice("Agar parabola Ox o'qidan to'liq pastda yotsa, u holda a va D qanday ishorali bo'ladi?", "a < 0 va D < 0", ["a > 0 va D < 0", "a < 0 va D > 0", "a > 0 va D = 0"], "Shoxlar pastga (a < 0) va kesishish nuqtasi yo'q (D < 0).");
  b.addTF("y = −x² + 2x − 5 funksiya grafigi butunlay Ox o'qidan pastda joylashadi.", true, "a = −1 < 0 va D = 4 − 20 = −16 < 0.");
  b.addTF("a > 0 va D = 0 da ax² + bx + c < 0 tengsizlik bitta yechimga ega.", false, "D = 0, a > 0 da parabola Ox dan pastga o'tmaydi, yechim ∅.");

  // Parametric −x^2 + bx + c (a = -1) va ax^2 + bx + c grafik talqini
  for (let r1 = -6; r1 <= 4; r1++) {
    for (let r2 = r1 + 1; r2 <= 7; r2++) {
      if (b.count >= 210) break;
      const bb = r1 + r2;
      const c = -r1 * r2;
      const polyNeg = polyQuad(-1, bb, c);
      const polyPos = polyQuad(1, -(r1 + r2), r1 * r2);
      const m = (r1 + r2 + 25) % 4;
      if (m === 0) {
        b.addChoice(
          `Grafik usulda ${polyNeg} > 0 tengsizlikni yeching (shoxlari pastga).`,
          `(${r1}; ${r2})`,
          [`(−∞; ${r1}) ∪ (${r2}; +∞)`, `[${r1}; ${r2}]`, `(−∞; ${r1}]`],
          `a = −1 < 0 bo'lgani uchun parabola (${r1}; ${r2}) da Ox o'qidan yuqorida.`,
        );
      } else if (m === 1) {
        b.addChoice(
          `Grafik usulda ${polyNeg} < 0 tengsizlikni yeching.`,
          `(−∞; ${r1}) ∪ (${r2}; +∞)`,
          [`(${r1}; ${r2})`, `[${r1}; ${r2}]`, `(${r1}; +∞)`],
          `a = −1 < 0 da parabola ildizlardan tashqarida Ox o'qidan pastda yotadi.`,
        );
      } else if (m === 2) {
        b.addChoice(
          `y = ${polyPos} parabola qaysi oraliqda Ox o'qidan yuqorida joylashadi?`,
          `(−∞; ${r1}) ∪ (${r2}; +∞)`,
          [`(${r1}; ${r2})`, `[${r1}; ${r2}]`, `(${r2}; +∞)`],
          `a = 1 > 0 da parabola (${r1}; 0) dan chapda va (${r2}; 0) dan o'ngda yuqorida.`,
        );
      } else {
        b.addFill(
          `y = ${polyNeg} funksiya Ox o'qidan yuqorida bo'ladigan eng katta butun x qiymatini toping.`,
          `${r2 - 1}`,
          `(${r1}; ${r2}) oraliqdagi eng katta butun son ${r2 - 1}.`,
        );
      }
    }
  }

  // Maxsus grafik holatlar: b^2 - 4c < 0 yoki = 0
  for (let p = -8; p <= 8; p++) {
    for (let k = 1; k <= 8; k++) {
      if (b.count >= 340) break;
      const cPos = Math.floor((p * p) / 4) + k + 1;
      const cNeg = -cPos;
      if ((Math.abs(p) + k) % 2 === 0) {
        b.addTF(
          `${polyQuad(-1, p, cNeg)} < 0 tengsizlik barcha x ∈ R uchun bajariladi.`,
          true,
          `a = −1 < 0 va D = ${p * p - 4 * (-1) * cNeg} < 0, parabola Ox dan pastda.`,
        );
      } else {
        b.addChoice(
          `y = ${polyQuad(1, p, cPos)} funksiya grafigi nechta chorakda joylashadi?`,
          `2 ta (I va II chorakda)`,
          [`4 ta chorakda`, `Faqat I chorakda`, `2 ta (III va IV chorakda)`],
          `a = 1 > 0 va D < 0 bo'lgani uchun barcha nuqtalarda y > 0, ya'ni I va II choraklarda.`,
        );
      }
    }
  }

  return b.build();
}

function makeTopic08(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-08-intervallar-usuli",
    topicTitle: "8-§. Intervallar usuli",
    title: "8-§. Intervallar usuli",
    source: "Algebra 9-sinf (2019), I bob, 8-§, 32–36-betlar",
    seed: 9008,
  });

  b.addCards([
    ...commonAlgebraCards(),
    ["Ratsional", "P(x)/Q(x) ko'rinishidagi tengsizlik"],
    ["Maxraj", "Hech qachon nolga teng bo'lmaydigan ifoda"],
    ["Karrali", "Juft darajada qatnashgan ildiz nuqtasi"],
    ["Ishora", "Har bir intervalda o'zgarmaydigan (+/−) holat"],
    ["Intervallar usuli", "Ildizlar bilan son o'qini bo'lib ishora tekshirish"],
    ["Qat'iy tengsizlik", "Chetki nuqtalar bo'yalmaydi (ochiq doira)"],
    ["Maxraj nollari", "Har doim yechimdan chiqarib tashlanadi"],
    ["Juft karrali ildiz", "Bu nuqtadan o'tganda ifoda ishorasi o'zgarmaydi"],
    ["Toq karrali ildiz", "Bu nuqtadan o'tganda ifoda ishorasi almashadi"],
    ["O'ng ekstremal interval", "Barcha (x − xᵢ) ko'paytma uchun '+' ishorali"],
    ["(x−a)/(x−b) ≤ 0", "(x−a)(x−b) ≤ 0 va x ≠ b ga teng kuchli"],
    ["Uch hadli ko'paytma", "(x−a)(x−b)(x−c) > 0 ikkita oraliq beradi"],
    ["Bo'yalgan nuqta", "≤ yoki ≥ tengsizlikdagi surat ildizi"],
    ["Ochiq nuqta", "Qat'iy tengsizlik yoki maxraj ildizi"],
  ]);

  b.addChoice("Intervallar usulida ratsional P(x)/Q(x) ≥ 0 tengsizlik yechilganda Q(x) = 0 ildizlar qanday belgilanadi?", "Ochiq nuqta (yechimga kirmaydi)", ["Bo'yalgan nuqta", "Har doim yechimga kiradi", "E'tiborga olinmaydi"], "Maxraj nolga teng bo'la olmagani uchun Q(x) = 0 nuqtalar doimo ochiq (kirmaydi).");
  b.addChoice("(x − 2)²(x − 5) < 0 tengsizlikda x = 2 nuqtadan o'tganda ishora qanday o'zgaradi?", "Ishora o'zgarmaydi", ["Musbatdan manfiyga o'tadi", "Manfiydan musbatga o'tadi", "Nolga teng bo'lib qoladi"], "(x − 2)² juft daraja bo'lgani uchun x = 2 atrofida ishora saqlanadi.");
  b.addTF("Intervallar usuli ikkinchi darajadan yuqori ko'phadli va kasrli tengsizliklarni yechishda qo'llaniladi.", true, "Bu usul ixtiyoriy darajali ko'paytuvchili va ratsional tengsizliklar uchun universaldir.");
  b.addTF("(x − 1)/(x + 3) ≤ 0 tengsizlik yechimiga x = −3 nuqta kiradi.", false, "x = −3 maxrajni nolga aylantiradi, shuning uchun kirmaydi.");

  // 1) (x - a)/(x - b) < 0, <= 0, > 0
  for (let a = -5; a <= 5; a++) {
    for (let c = a + 1; c <= 7; c++) {
      if (b.count >= 170) break;
      const mode = (a + c + 20) % 4;
      const numFactor = a === 0 ? "x" : fmtXShift(a);
      const denFactor = c === 0 ? "x" : fmtXShift(c);
      if (mode === 0) {
        b.addChoice(
          `${numFactor}/${denFactor} < 0 tengsizlikning yechimini toping.`,
          `(${a}; ${c})`,
          [`(−∞; ${a}) ∪ (${c}; +∞)`, `[${a}; ${c})`, `(${a}; ${c}]`],
          `Nollar ${a} va ${c}. O'rta interval (${a}; ${c}) da kasr manfiy.`,
        );
      } else if (mode === 1) {
        b.addChoice(
          `${numFactor}/${denFactor} ≤ 0 tengsizlikning yechimi qaysi?`,
          `[${a}; ${c})`,
          [`[${a}; ${c}]`, `(${a}; ${c}]`, `(${a}; ${c})`],
          `Surat ildizi ${a} kiradi, maxraj ildizi ${c} kirmaydi: [${a}; ${c}).`,
        );
      } else if (mode === 2) {
        b.addFill(
          `${numFactor}/${denFactor} ≤ 0 tengsizlikning nechta butun yechimi mavjud?`,
          `${c - a}`,
          `[${a}; ${c}) yarim intervalda ${c - a} ta butun son bor.`,
        );
      } else {
        b.addTF(
          `${numFactor}/${denFactor} > 0 tengsizlik (−∞; ${a}) ∪ (${c}; +∞) da bajariladi.`,
          true,
          `Chetki intervallarda surat va maxraj bir xil ishorali.`,
        );
      }
    }
  }

  // 2) Uch hadli ko'paytma (x - a)(x - b)(x - c) > 0 yoki < 0
  for (let a = -5; a <= 0; a++) {
    for (let c = a + 1; c <= 3; c++) {
      for (let d = c + 1; d <= 7; d++) {
        if (b.count >= 280) break;
        const f1 = a === 0 ? "x" : fmtXShift(a);
        const f2 = c === 0 ? "x" : fmtXShift(c);
        const f3 = d === 0 ? "x" : fmtXShift(d);
        const expr = `${f1}${f2}${f3}`;
        if ((Math.abs(a) + c + d) % 2 === 0) {
          b.addChoice(
            `${expr} > 0 tengsizlikni intervallar usulida yeching.`,
            `(${a}; ${c}) ∪ (${d}; +∞)`,
            [`(−∞; ${a}) ∪ (${c}; ${d})`, `(${a}; ${d})`, `[${a}; ${c}] ∪ [${d}; +∞)`],
            `O'ngdan chapga ishoralar +, −, +, − almashadi. '+' lar: (${a}; ${c}) ∪ (${d}; +∞).`,
          );
        } else {
          b.addChoice(
            `${expr} < 0 tengsizlikni yeching.`,
            `(−∞; ${a}) ∪ (${c}; ${d})`,
            [`(${a}; ${c}) ∪ (${d}; +∞)`, `(${c}; ${d})`, `(−∞; ${a}) ∪ (${d}; +∞)`],
            `Ishoralar +, −, +, −. Manfiy intervallar: (−∞; ${a}) ∪ (${c}; ${d}).`,
          );
        }
      }
    }
  }

  // 3) Juft karrali ildiz (x - m)^2 * (x - k) < 0
  for (let m = -4; m <= 5; m++) {
    for (let k = -3; k <= 6; k++) {
      if (b.count >= 340) break;
      if (m === k) continue;
      const fm = m === 0 ? "x²" : `${fmtXShift(m)}²`;
      const fk = k === 0 ? "x" : fmtXShift(k);
      if (m < k) {
        b.addChoice(
          `${fm}${fk} < 0 tengsizlikning yechimi qaysi?`,
          `(−∞; ${m}) ∪ (${m}; ${k})`,
          [`(−∞; ${k})`, `(${m}; ${k})`, `(${k}; +∞)`],
          `x < ${k} bo'lganda manfiy, ammo x = ${m} da nol bo'lib qolgani uchun ${m} chiqariladi.`,
        );
      } else {
        b.addFill(
          `${fm}${fk} ≤ 0 tengsizlikni qanoatlantiruvchi x > ${k} butun sonlardan nechtasi bor?`,
          `1`,
          `x > ${k} uchun faqat juft ildiz nuqtasi x = ${m} tenglikni nolga aylantirib yechim bo'ladi (1 ta).`,
        );
      }
    }
  }

  return b.build();
}

function makeTopic09(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-09-aniqlanish-sohasi",
    topicTitle: "9-§. Funksiyaning aniqlanish sohasi",
    title: "9-§. Funksiyaning aniqlanish sohasi",
    source: "Algebra 9-sinf (2019), I bob, 9-§, 37–41-betlar",
    seed: 9009,
  });

  b.addCards([
    ...commonAlgebraCards(),
    ["Ildizosti", "Kvadrat ildiz ichidagi nomanfiy ifoda"],
    ["Maxraj", "Kasrning noldan farqli quyi qismi"],
    ["Aniqlanish", "x qabul qilishi mumkin bo'lgan barcha qiymatlar"],
    ["Cheklov", "Ifodaga ma'no beruvchi matematik shart"],
    ["D(y) belgisi", "Funksiyaning aniqlanish sohasi"],
    ["y = √f(x)", "Sharti: f(x) ≥ 0"],
    ["y = 1 / f(x)", "Sharti: f(x) ≠ 0"],
    ["y = 1 / √f(x)", "Sharti: f(x) > 0 (qat'iy musbat)"],
    ["Ko'phad D(y)", "Barcha haqiqiy sonlar R = (−∞; +∞)"],
    ["Kvadrat funksiya D(y)", "Har doim (−∞; +∞)"],
    ["Kub ildiz ∛x", "Barcha x ∈ R uchun aniqlangan"],
    ["Kesishma", "Bir nechta shartning umumiy qismi"],
    ["y = √(x − a)", "Aniqlanish sohasi [a; +∞)"],
    ["y = √(a² − x²)", "Aniqlanish sohasi [−a; a]"],
  ]);

  b.addChoice("y = √f(x) ko'rinishidagi funksiyaning aniqlanish sohasini topish uchun qaysi shart qo'yiladi?", "f(x) ≥ 0", ["f(x) > 0", "f(x) ≠ 0", "f(x) ≤ 0"], "Juft darajali ildiz ostidagi ifoda manfiy bo'lmasligi kerak: f(x) ≥ 0.");
  b.addChoice("y = 1 / √f(x) funksiyaning aniqlanish sohasi qaysi shartdan topiladi?", "f(x) > 0", ["f(x) ≥ 0", "f(x) ≠ 0", "f(x) < 0"], "Ham ildiz osti (f ≥ 0), ham maxraj (f ≠ 0) birgalikda f(x) > 0 beradi.");
  b.addTF("Har qanday y = ax² + bx + c kvadrat funksiyaning aniqlanish sohasi (−∞; +∞) dir.", true, "Ko'phadda bo'lish va juft ildiz yo'q, shuning uchun x ∈ R.");
  b.addTF("y = 1 / (x² + 9) funksiyaning aniqlanish sohasi barcha haqiqiy sonlardir.", true, "x² + 9 ≥ 9 > 0 bo'lgani uchun maxraj hech qachon nol bo'lmaydi.");

  // 1) y = √(ax + b)
  for (let a = 1; a <= 6; a++) {
    for (let x0 = -6; x0 <= 6; x0++) {
      if (b.count >= 115) break;
      const bb = -a * x0;
      const expr = polyLinear(a, bb);
      b.addChoice(
        `y = √(${expr}) funksiyaning aniqlanish sohasini toping.`,
        `[${x0}; +∞)`,
        [`(${x0}; +∞)`, `(−∞; ${x0}]`, `[${-x0}; +∞)`],
        `${expr} ≥ 0 ⇒ ${a}x ≥ ${-bb} ⇒ x ≥ ${x0}.`,
      );
    }
  }

  // 2) y = √(x^2 - k^2) va √(k^2 - x^2)
  for (let k = 1; k <= 15; k++) {
    if (b.count >= 175) break;
    const k2 = k * k;
    b.addChoice(
      `y = √(${k2} − x²) funksiyaning aniqlanish sohasini toping.`,
      `[−${k}; ${k}]`,
      [`(−${k}; ${k})`, `(−∞; −${k}] ∪ [${k}; +∞)`, `[0; ${k}]`],
      `${k2} − x² ≥ 0 ⇒ x² ≤ ${k2} ⇒ −${k} ≤ x ≤ ${k}.`,
    );
    b.addChoice(
      `y = √(x² − ${k2}) funksiyaning aniqlanish sohasini toping.`,
      `(−∞; −${k}] ∪ [${k}; +∞)`,
      [`[−${k}; ${k}]`, `(−∞; −${k}) ∪ (${k}; +∞)`, `[${k}; +∞)`],
      `x² − ${k2} ≥ 0 ⇒ |x| ≥ ${k}.`,
    );
    b.addFill(
      `y = 1 / √(${k2} − x²) funksiyaning aniqlanish sohasida nechta butun son bor?`,
      `${2 * k - 1}`,
      `(${-k}; ${k}) ochiq intervalda −${k - 1} dan ${k - 1} gacha jami ${2 * k - 1} ta butun son bor.`,
    );
    b.addFill(
      `y = √(${k2} − x²) funksiyaning aniqlanish sohasida nechta butun son bor?`,
      `${2 * k + 1}`,
      `[−${k}; ${k}] kesmada −${k} dan ${k} gacha jami ${2 * k + 1} ta butun son bor.`,
    );
  }

  // 3) y = 1 / (x^2 + bx + c) maxraj nollari
  for (let r1 = -5; r1 <= 4; r1++) {
    for (let r2 = r1 + 1; r2 <= 6; r2++) {
      if (b.count >= 270) break;
      const bb = -(r1 + r2);
      const c = r1 * r2;
      const denom = polyQuad(1, bb, c);
      if ((r1 + r2 + 20) % 2 === 0) {
        b.addChoice(
          `y = 1 / (${denom}) funksiyaning aniqlanish sohasini toping.`,
          `x ≠ ${r1}, x ≠ ${r2}`,
          [`x ≠ ${-r1}, x ≠ ${-r2}`, `x > ${r2}`, `(${r1}; ${r2})`],
          `Maxraj ${denom} ≠ 0 bo'lishi kerak, ya'ni x ≠ ${r1} va x ≠ ${r2}.`,
        );
      } else {
        b.addChoice(
          `y = √(${denom}) funksiyaning aniqlanish sohasini toping.`,
          `(−∞; ${r1}] ∪ [${r2}; +∞)`,
          [`[${r1}; ${r2}]`, `(−∞; ${r1}) ∪ (${r2}; +∞)`, `[${r2}; +∞)`],
          `${denom} ≥ 0 tengsizlik yechimi: (−∞; ${r1}] ∪ [${r2}; +∞).`,
        );
      }
    }
  }

  // 4) y = √(x - a) + 1/(x - c) aralash
  for (let a = -4; a <= 4; a++) {
    for (let c = a + 1; c <= a + 6; c++) {
      if (b.count >= 340) break;
      const fa = a === 0 ? "x" : `x ${signedTerm(-a)}`;
      const fc = c === 0 ? "x" : `x ${signedTerm(-c)}`;
      b.addChoice(
        `y = √(${fa}) + 1/(${fc}) funksiyaning aniqlanish sohasini toping.`,
        `[${a}; ${c}) ∪ (${c}; +∞)`,
        [`[${a}; +∞)`, `(${a}; ${c}) ∪ (${c}; +∞)`, `[${c}; +∞)`],
        `x ≥ ${a} va x ≠ ${c} shartlar birgalikda [${a}; ${c}) ∪ (${c}; +∞) ni beradi.`,
      );
      if (b.count < 340) {
        b.addTF(
          `y = √(${fa}) + √(${c} − x) funksiyaning aniqlanish sohasi [${a}; ${c}] kesmadir.`,
          true,
          `x ≥ ${a} va x ≤ ${c} shartlar kesishmasi [${a}; ${c}].`,
        );
      }
    }
  }

  return b.build();
}

function makeTopic10(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-10-osish-kamayish",
    topicTitle: "10-§. Funksiyaning o'sishi va kamayishi",
    title: "10-§. Funksiyaning o'sishi va kamayishi",
    source: "Algebra 9-sinf (2019), I bob, 10-§, 41–46-betlar",
    seed: 9010,
  });

  b.addCards([
    ...commonAlgebraCards(),
    ["Monoton", "Faqat o'suvchi yoki faqat kamayuvchi funksiya"],
    ["Giperbola", "y = k/x teskari proporsionallik grafigi"],
    ["O'suvchi", "x₂ > x₁ da f(x₂) > f(x₁) xossasi"],
    ["Kamayuvchi", "x₂ > x₁ da f(x₂) < f(x₁) xossasi"],
    ["Chiziqli k>0", "y = kx + b funksiya (−∞; +∞) da o'sadi"],
    ["Chiziqli k<0", "y = kx + b funksiya (−∞; +∞) da kamayadi"],
    ["y = √x", "[0; +∞) da o'suvchi funksiya"],
    ["y = x³", "(−∞; +∞) da o'suvchi kub parabola"],
    ["y = −x³", "(−∞; +∞) da kamayuvchi funksiya"],
    ["y = k/x (k>0)", "(−∞; 0) va (0; +∞) da kamayadi"],
    ["y = k/x (k<0)", "(−∞; 0) va (0; +∞) da o'sadi"],
    ["Parabola a>0", "(−∞; x₀] da kamayib, [x₀; +∞) da o'sadi"],
    ["Parabola a<0", "(−∞; x₀] da o'sib, [x₀; +∞) da kamayadi"],
    ["Taqqoslash", "O'sish oralig'ida katta x ga katta y mos"],
  ]);

  b.addChoice("Agar oraliqdagi har qanday x₂ > x₁ uchun f(x₂) > f(x₁) bajarilsa, funksiya bu oraliqda qanday bo'ladi?", "O'suvchi", ["Kamayuvchi", "Juft", "O'zgarmas"], "Katta argumentga katta qiymat mos kelsa, funksiya o'suvchidir.");
  b.addChoice("y = −4x + 7 chiziqli funksiya barcha haqiqiy sonlarda qanday xossaga ega?", "Kamayuvchi", ["O'suvchi", "O'zgarmas", "Juft"], "k = −4 < 0 bo'lgani uchun chiziqli funksiya barcha R da kamayadi.");
  b.addTF("y = √x funksiya [0; +∞) aniqlanish sohasida o'suvchidir.", true, "x₂ > x₁ ≥ 0 da √x₂ > √x₁ bajariladi.");
  b.addTF("y = 6/x funksiya butun son o'qida kamayadi.", false, "x = 0 nuqta aniqlanish sohasiga kirmaydi: f(−1) = −6 < f(1) = 6.");

  // 1) Kvadrat funksiyaning o'sish/kamayish oraliqlari
  for (let a = -3; a <= 3; a++) {
    if (a === 0) continue;
    for (let m = -8; m <= 8; m++) {
      if (b.count >= 170) break;
      const bb = -2 * a * m;
      const c = a * m * m + (m % 5);
      const fn = `y = ${polyQuad(a, bb, c)}`;
      const incInt = a > 0 ? `[${m}; +∞)` : `(−∞; ${m}]`;
      const decInt = a > 0 ? `(−∞; ${m}]` : `[${m}; +∞)`;
      if ((Math.abs(a) + Math.abs(m)) % 2 === 0) {
        b.addChoice(
          `${fn} funksiyaning o'sish oralig'ini toping.`,
          incInt,
          [decInt, `[${-m}; +∞)`, `(−∞; +∞)`],
          `Parabola uchi x₀ = ${m}, a = ${a} ${a > 0 ? "> 0 ⇒ [x₀; +∞) da o'sadi" : "< 0 ⇒ (−∞; x₀] da o'sadi"}.`,
        );
      } else {
        b.addChoice(
          `${fn} funksiyaning kamayish oralig'ini toping.`,
          decInt,
          [incInt, `(−∞; ${-m}]`, `(0; +∞)`],
          `x₀ = ${m}, a = ${a} ${a > 0 ? "> 0 ⇒ (−∞; x₀] da kamayadi" : "< 0 ⇒ [x₀; +∞) da kamayadi"}.`,
        );
      }
    }
  }

  // 2) Chiziqli va giperbola o'sish/kamayishi
  for (let k = -15; k <= 15; k++) {
    if (k === 0 || b.count >= 260) continue;
    const shift = (k * 3) % 9;
    const fn = `y = ${polyLinear(k, shift)}`;
    b.addTF(
      `${fn} funksiya (−∞; +∞) da ${k > 0 ? "o'suvchi" : "kamayuvchi"}.`,
      true,
      `k = ${k} ${k > 0 ? "> 0 bo'lgani uchun o'sadi" : "< 0 bo'lgani uchun kamayadi"}.`,
    );
    if (b.count < 260) {
      b.addChoice(
        `y = ${k}/x funksiya (0; +∞) oraliqda qanday bo'ladi?`,
        k > 0 ? "Kamayuvchi" : "O'suvchi",
        [k > 0 ? "O'suvchi" : "Kamayuvchi", "O'zgarmas", "Avval o'sib, keyin kamayadi"],
        `y = k/x da ${k > 0 ? "k > 0 ⇒ kamayadi" : "k < 0 ⇒ o'sadi"}.`,
      );
    }
  }

  // 3) Taqqoslash masalalari f(x) = x^2 va f(x) = (x - m)^2
  for (let m = -5; m <= 5; m++) {
    for (let d = 1; d <= 8; d++) {
      if (b.count >= 340) break;
      const x1 = m + d;
      const x2 = m + d + 2;
      const fn = m === 0 ? "f(x) = x²" : `f(x) = ${fmtXShift(m)}²`;
      b.addChoice(
        `${fn} uchun f(${x1}) va f(${x2}) qiymatlarni taqqoslang.`,
        `f(${x1}) < f(${x2})`,
        [`f(${x1}) > f(${x2})`, `f(${x1}) = f(${x2})`, `Taqqoslab bo'lmaydi`],
        `${x2} > ${x1} ≥ ${m} bo'lib, funksiya [${m}; +∞) da o'sadi, demak f(${x1}) < f(${x2}).`,
      );
    }
  }

  return b.build();
}

function makeTopic11(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-11-juftlik-toqlik",
    topicTitle: "11-§. Funksiyaning juftligi va toqligi",
    title: "11-§. Funksiyaning juftligi va toqligi",
    source: "Algebra 9-sinf (2019), I bob, 11-§, 46–50-betlar",
    seed: 9011,
  });

  b.addCards([
    ...commonAlgebraCards(),
    ["Juft", "f(−x) = f(x) shartini bajaruvchi funksiya"],
    ["Toq", "f(−x) = −f(x) shartini bajaruvchi funksiya"],
    ["Ordinata", "Juft funksiya grafigining simmetriya o'qi"],
    ["Daraja", "Juft va toqlikni belgilovchi ko'rsatkich"],
    ["Juft funksiya", "D(f) simmetrik va f(−x) = f(x)"],
    ["Toq funksiya", "D(f) simmetrik va f(−x) = −f(x)"],
    ["Juft grafik", "Oy o'qiga nisbatan simmetrik"],
    ["Toq grafik", "Koordinata boshi O(0; 0) ga nisbatan simmetrik"],
    ["Umumiy holat", "Ba'zi funksiyalar na juft, na toq"],
    ["f(x) = x²ⁿ", "Har doim juft funksiya (n ∈ N)"],
    ["f(x) = x²ⁿ⁺¹", "Har doim toq funksiya (n ∈ N)"],
    ["y = |x|", "Oy ga simmetrik juft funksiya"],
    ["Toq f(0)", "0 ∈ D(f) bo'lsa, toq funksiyada f(0) = 0"],
    ["y = x² + x", "Na juft, na toq funksiya misoli"],
  ]);

  b.addChoice("f(−x) = f(x) shartini bajaruvchi (aniqlanish sohasi simmetrik) funksiya qanday ataladi?", "Juft funksiya", ["Toq funksiya", "Na juft, na toq", "Chiziqli funksiya"], "Ta'rifga ko'ra f(−x) = f(x) bo'lsa, funksiya juft.");
  b.addChoice("Toq funksiyaning grafigi nimaga nisbatan simmetrik bo'ladi?", "Koordinata boshi (0; 0) ga", ["Ox o'qiga", "Oy o'qiga", "y = x to'g'ri chiziqqa"], "Toq funksiyada (x; y) bilan (−x; −y) nuqta ham grafikda bo'ladi.");
  b.addTF("y = x⁵ + 3x funksiya toq funksiya hisoblanadi.", true, "(−x)⁵ + 3(−x) = −(x⁵ + 3x) = −f(x).");
  b.addTF("y = √x funksiya juft funksiya hisoblanadi.", false, "Aniqlanish sohasi [0; +∞) nolga nisbatan simmetrik emas.");

  // 1) Juft/toq qiymat hisoblash: f(a) beriladi, f(-a) topiladi
  for (let a = 1; a <= 45; a++) {
    const val = (a * 3 + 7) % 50 + 2;
    b.addFill(
      `Juft f(x) funksiya uchun f(${a}) = ${val} bo'lsa, f(−${a}) qiymatini yozing.`,
      `${val}`,
      `Juft funksiyada f(−${a}) = f(${a}) = ${val}.`,
    );
    b.addFill(
      `Toq g(x) funksiya uchun g(${a}) = ${val} bo'lsa, g(−${a}) qiymatini yozing.`,
      `${-val}`,
      `Toq funksiyada g(−${a}) = −g(${a}) = −${val}.`,
    );
  }

  // 2) Turli funksiyalar juft/toq/umumiy turini aniqlash
  for (let k = 1; k <= 16; k++) {
    for (let c = 1; c <= 6; c++) {
      if (b.count >= 250) break;
      const mode = (k + c) % 4;
      if (mode === 0) {
        b.addChoice(
          `f(x) = ${k}x⁴ + ${c}x² + ${k + c} funksiyaning turini aniqlang.`,
          "Juft",
          ["Toq", "Na juft, na toq", "Aniqlanmagan"],
          `Faqat juft darajalar va ozod had qatnashgani uchun f(−x) = f(x).`,
        );
      } else if (mode === 1) {
        b.addChoice(
          `f(x) = ${k}x³ − ${c}x funksiyaning turini aniqlang.`,
          "Toq",
          ["Juft", "Na juft, na toq", "O'zgarmas"],
          `Faqat toq darajalar: f(−x) = −${k}x³ + ${c}x = −f(x).`,
        );
      } else if (mode === 2) {
        b.addChoice(
          `f(x) = ${k}x² + ${c}x funksiyaning juft-toqligini aniqlang.`,
          "Na juft, na toq",
          ["Juft", "Toq", "Ham juft, ham toq"],
          `f(−x) = ${k}x² − ${c}x, bu na f(x) ga, na −f(x) ga teng.`,
        );
      } else {
        b.addTF(
          `f(x) = ${k}x⁵ + ${c} funksiya toq funksiya hisoblanadi.`,
          false,
          `f(−x) = −${k}x⁵ + ${c} ≠ −f(x) (c ≠ 0 ozod had toqlikni buzadi).`,
        );
      }
    }
  }

  // 3) Simmetriya nuqtalari va ifodalar
  for (let x = 1; x <= 30; x++) {
    if (b.count >= 340) break;
    const y = (x * 4 + 1) % 37;
    b.addChoice(
      `Juft f(x) funksiyaning grafigi A(${x}; ${y}) nuqtadan o'tsa, yana qaysi nuqtadan albatta o'tadi?`,
      `(−${x}; ${y})`,
      [`(−${x}; −${y})`, `(${x}; −${y})`, `(${y}; ${x})`],
      `Juft funksiya Oy ga simmetrik, demak (−${x}; ${y}) ham grafikda.`,
    );
    if (b.count < 340) {
      b.addChoice(
        `Toq g(x) funksiyaning grafigi B(${x}; ${y}) nuqtadan o'tsa, yana qaysi nuqtadan o'tadi?`,
        `(−${x}; −${y})`,
        [`(−${x}; ${y})`, `(${x}; −${y})`, `(−${y}; −${x})`],
        `Toq funksiya (0; 0) ga simmetrik: (−${x}; −${y}) nuqtadan ham o'tadi.`,
      );
    }
  }

  return b.build();
}

function makeTopic12(): QuizOutput {
  const b = new TopicBuilder({
    id: "g9-uz-algebra-12-daraja-tengsizlik-tenglama",
    topicTitle: "12-§. Daraja qatnashgan tengsizlik va tenglamalar",
    title: "12-§. Daraja qatnashgan tengsizlik va tenglamalar (I bob yakuni)",
    source: "Algebra 9-sinf (2019), I bob, 12-§, 51–67-betlar",
    seed: 9012,
  });

  b.addCards([
    ...commonAlgebraCards(),
    ["Bikvadrat", "ax⁴ + bx² + c = 0 ko'rinishidagi tenglama"],
    ["Beruniy", "Doira yuzini S = 3r² taqribiy olgan alloma"],
    ["Daraja", "O'zgaruvchi ko'rsatkichi n > 2 bo'lgan had"],
    ["Arifmetik", "n-darajali nomanfiy ildiz"],
    ["x³ = a tenglama", "Har qanday a ∈ R da yagona yechim x = ∛a"],
    ["x²ⁿ = a (a>0)", "Ikkita ildizga ega: x = ±²ⁿ√a"],
    ["x²ⁿ = a (a<0)", "Haqiqiy yechimga ega emas"],
    ["x² = t almashtirish", "Bikvadrat tenglamani kvadratga keltirish usuli"],
    ["|x| < a (a>0)", "−a < x < a qo'sh tengsizlik"],
    ["|x| > a (a>0)", "(−∞; −a) ∪ (a; +∞) oraliqlar"],
    ["I bob testlari", "Kvadrat funksiya, tengsizlik va xossalari"],
    ["(aⁿ)ᵐ = aⁿᵐ", "Darajani darajaga ko'tarish qoidasi"],
    ["x³ > a³", "x > a tengsizlikka teng kuchli"],
    ["Kub parabola", "y = x³ funksiyaning grafigi"],
  ]);

  b.addChoice("ax⁴ + bx² + c = 0 (a ≠ 0) bikvadrat tenglamani yechish uchun qanday belgilash kiritiladi?", "x² = t (t ≥ 0)", ["x = t²", "x⁴ = t", "x² = −t"], "x² = t belgilash bikvadrat tenglamani at² + bt + c = 0 kvadrat tenglamaga keltiradi.");
  b.addChoice("I bob tarixiy ma'lumotida Abu Rayhon Beruniy doira yuzi uchun qaysi taqribiy formulani ishlatgani keltiriladi?", "S = 3r²", ["S = 4r²", "S = 2r²", "S = 5r²"], "Darslikda Beruniy qadimiy taqribiy S = 3r² (π ≈ 3) va aniq hisoblashlarni solishtirgani bayon etilgan.");
  b.addTF("x⁵ = −32 tenglamaning haqiqiy ildizi x = −2 ga teng.", true, "(−2)⁵ = −32.");
  b.addTF("x⁴ = −16 tenglama ikkita haqiqiy ildizga ega.", false, "Juft daraja x⁴ ≥ 0, shuning uchun manfiy songa teng bo'la olmaydi.");

  // 1) Bikvadrat tenglamalar: (x^2 - p)(x^2 - q) = 0 => x^4 - (p+q)x^2 + pq = 0
  for (let r1 = 1; r1 <= 6; r1++) {
    for (let r2 = r1 + 1; r2 <= 8; r2++) {
      if (b.count >= 130) break;
      const p = r1 * r1;
      const q = r2 * r2;
      const mid = -(p + q);
      const free = p * q;
      const eq = `x⁴ − ${p + q}x² + ${free} = 0`;
      if ((r1 + r2) % 3 === 0) {
        b.addFill(
          `${eq} bikvadrat tenglamaning nechta haqiqiy ildizi bor?`,
          `4`,
          `x² = ${p} va x² = ${q} dan x = ±${r1}, ±${r2} — jami 4 ta ildiz.`,
        );
      } else if ((r1 + r2) % 3 === 1) {
        b.addChoice(
          `${eq} bikvadrat tenglamaning eng katta ildizini toping.`,
          `${r2}`,
          pickNumDistractors(r2, [r1, q, r2 + 1]),
          `t₁ = ${p}, t₂ = ${q} ⇒ eng katta ildiz √${q} = ${r2}.`,
        );
      } else {
        b.addChoice(
          `${eq} bikvadrat tenglamaning barcha haqiqiy ildizlarini ko'rsating.`,
          `±${r1}; ±${r2}`,
          [`±${p}; ±${q}`, `${r1}; ${r2}`, `±${r1}; ${r2}`],
          `x² = ${p} ⇒ ±${r1}, x² = ${q} ⇒ ±${r2}.`,
        );
      }
      if (b.count < 130) {
        b.addTF(
          `x⁴ + ${Math.abs(mid)}x² + ${free} = 0 bikvadrat tenglama 4 ta ildizga ega.`,
          false,
          `t² + ${Math.abs(mid)}t + ${free} = 0 ildizlari manfiy (−${p}, −${q}), demak x² = t da haqiqiy ildiz yo'q.`,
        );
      }
    }
  }

  // 2) x^n = a tenglamalar
  for (let n = 3; n <= 6; n++) {
    for (let x = -4; x <= 5; x++) {
      if (b.count >= 215) break;
      if (x === 0) continue;
      if (n % 2 === 0 && x < 0) continue;
      const val = Math.pow(x, n);
      if (n % 2 === 1) {
        b.addFill(
          `x^${n} = ${val} tenglamaning haqiqiy ildizini toping.`,
          `${x}`,
          `(${x})^${n} = ${val}.`,
        );
      } else {
        b.addChoice(
          `x^${n} = ${val} tenglamaning haqiqiy ildizlari qaysilar?`,
          `−${x} va ${x}`,
          [`Faqat ${x}`, `Faqat −${x}`, `Ildizi yo'q`],
          `Juft ${n}-darajali ildiz ±${x}.`,
        );
      }
    }
  }

  // 3) Daraja qatnashgan tengsizliklar va |x| tenglamalar
  for (let r = 1; r <= 18; r++) {
    if (b.count >= 300) break;
    const cube = r * r * r;
    b.addChoice(
      `x³ > ${cube} tengsizlikning yechimini toping.`,
      `(${r}; +∞)`,
      [`(−∞; ${r})`, `(−${r}; ${r})`, `[${r}; +∞)`],
      `y = x³ o'suvchi bo'lgani uchun x³ > ${r}³ ⇔ x > ${r}.`,
    );
    b.addChoice(
      `x⁴ ≤ ${r * r * r * r} tengsizlikning nechta butun yechimi bor?`,
      `${2 * r + 1}`,
      pickNumDistractors(2 * r + 1, [2 * r - 1, r, 2 * r]),
      `−${r} ≤ x ≤ ${r} kesmada ${2 * r + 1} ta butun son bor.`,
    );
    if (b.count < 300) {
      b.addTF(
        `x³ < −${cube} tengsizlikning yechimi (−∞; −${r}) oraliqdir.`,
        true,
        `(−${r})³ = −${cube} va y = x³ o'suvchi bo'lgani uchun x < −${r}.`,
      );
    }
  }

  // 4) Beruniy S = 3r² va I bob yakuniy amaliy masalalari
  for (let r = 2; r <= 25; r++) {
    if (b.count >= 340) break;
    const s = 3 * r * r;
    b.addFill(
      `Beruniyning taqribiy S = 3r² formulasiga ko'ra radiusi r = ${r} sm bo'lgan doira yuzini (sm²) toping.`,
      `${s}`,
      `S = 3 · ${r}² = 3 · ${r * r} = ${s} sm².`,
    );
  }

  return b.build();
}

export function buildTopics00To12(): QuizOutput[] {
  return [
    makeTopic00(),
    makeTopic01(),
    makeTopic02(),
    makeTopic03(),
    makeTopic04(),
    makeTopic05(),
    makeTopic06(),
    makeTopic07(),
    makeTopic08(),
    makeTopic09(),
    makeTopic10(),
    makeTopic11(),
    makeTopic12(),
  ];
}
