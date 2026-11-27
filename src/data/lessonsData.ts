import type { GradeNumber, Language } from "../data/types";
import type { SlideDiagramData } from "../components/SlideDiagramRenderer";
import type { SlideVisualTheme } from "../utils/slideHelper";

export interface LessonSlide {
  title: string;
  subtitle?: string;
  body: string;
  bullets: string[];
  highlight?: string;
  teacherNote: string;
  visualTheme?: SlideVisualTheme;
  imageUrl?: string;
  diagram?: SlideDiagramData;
  checkQuestion?: {
    q: string;
    options: string[];
    answer: number;
    explain: string;
  };
}

export interface InteractiveLesson {
  id: string;
  grade: GradeNumber;
  subjectName: string;
  lang: Language;
  title: string;
  durationMin: number;
  objectives: string[];
  keyTerms: { term: string; def: string }[];
  slides: LessonSlide[];
  quizId?: string;
}

export const INTERACTIVE_LESSONS: InteractiveLesson[] = [
  {
    id: "lesson-9-adabiyot-alpomish",
    grade: "9",
    subjectName: "Adabiyot",
    lang: "uz",
    title: "«Alpomish» dostoni: mardlik, vafodorlik va xalq ideali",
    durationMin: 45,
    objectives: [
      "«Alpomish» dostonining g'oyaviy-badiiy xususiyatlarini tushuntirish",
      "Alpomish, Barchinoy va Qaldirg'och obrazlarining xarakter qirralarini tahlil qilish",
      "Doston matnidagi badiiy san'atlar va xalq maqollarining o'rnini aniqlash",
    ],
    keyTerms: [
      { term: "Qahramonlik eposi", def: "Xalqning erki, birligi va mardligini tarannum etuvchi yirik folklor asari." },
      { term: "Baxshi", def: "Dostonlarni do'mbira jo'rligida yoddan kuylovchi xalq san'atkori." },
      { term: "Shart qo'yish motivi", def: "Qahramonning jismoniy va ma'naviy yetukligini sinovdan o'tkazuvchi an'anaviy tasvir." },
    ],
    quizId: "g9-uz-adabiyot-01-alpomish",
    slides: [
      {
        title: "Kirish: «Alpomish» — turkiy xalqlarning boqiy eposi",
        subtitle: "1-slayd · Dostonning yaratilishi va ijro an'anasi",
        body: "«Alpomish» dostoni o'zbek xalq og'zaki ijodining eng mukammal namunasi bo'lib, Fozil Yo'ldosh o'g'li variantida yuksak badiiy darajada saqlanib qolgan.",
        bullets: [
          "Asar Boysun-Qo'ng'irot elining birligi va tinchligini markazga qo'yadi.",
          "YUNESKO doirasida dostonning 1000 yilligi xalqaro miqyosda nishonlangan.",
          "Baxshilar uni do'mbira sadolari ostida ichki ovoz (bo'g'iz) bilan kuylagan.",
        ],
        highlight: "Asosiy g'oya: yurt birligi, or-nomus va halollik har qanday boylikdan ustun.",
        teacherNote: "Dars boshida Fozil Yo'ldosh o'g'li ijrosidagi 1 daqiqalik terma namunasini eshittirib, doston ritmini his qildiring.",
        checkQuestion: {
          q: "«Alpomish» dostonining eng mukammal yozib olingan varianti qaysi baxshi ijrosiga mansub?",
          options: ["Ergash Jumanbulbul o'g'li", "Fozil Yo'ldosh o'g'li", "Islom shoir", "Po'lkan shoir"],
          answer: 1,
          explain: "Dostonning eng to'liq va badiiy yetuk nusxasi 1928-yilda Fozil Yo'ldosh o'g'lidan yozib olingan.",
        },
      },
      {
        title: "Asosiy qahramonlar va ularning ma'naviy qiyofasi",
        subtitle: "2-slayd · Obrazlar tahlili",
        body: "Dostondagi har bir obraz xalq tasavvurida shakllangan axloqiy mezonlarni ifodalaydi: mardlik, sadoqat, zakovat va birodarlik.",
        bullets: [
          "Hakimbek (Alpomish): kuchsizlarga himoyachi, do'stlik va ahdu paymonga sodiq bahodir.",
          "Oybarchin: aql-zakovati va irodasi bilan to'rt shartni qo'ya olgan jasur qiz.",
          "Qaldirg'och: og'ir damda aka-ukaga to'g'ri yo'l ko'rsatuvchi dono singil.",
        ],
        highlight: "Qorajon bilan do'stlik — elatlararo birodarlik ramzi.",
        teacherNote: "O'quvchilarni 3 guruhga bo'lib, Hakimbek, Barchinoy va Qorajon obrazlari uchun klaster tuzishni topshiring.",
      },
      {
        title: "To'rt shart sinovi va mubolag'a san'ati",
        subtitle: "3-slayd · Badiiy tasvir vositalari",
        body: "Barchinoy qalmoq alplaridan himoyalanish va munosib yorni tanlash uchun to'rtta murakkab shart qo'yadi.",
        bullets: [
          "1-shart: Poya (ot) poygasi — Boychiborning qanot chiqarishi.",
          "2-shart: Yoy tortish — o'n to'rt botmon parlik yoyni ko'tarish.",
          "3-shart: Ming qadamdan tanga pulni urish (merganlik).",
          "4-shart: Kurashda to'qson alpni yengish.",
        ],
        highlight: "Mubolag'a (bo'rttirish) xalq dostonida qahramon qudratini yorqin ko'rsatadi.",
        teacherNote: "Boychibor obrazi orqali sadoqat va qahramonga madadkor kuchlar haqida suhbat o'tkazing.",
        checkQuestion: {
          q: "Barchinoy qalmoq alplariga nechta shart qo'yadi?",
          options: ["2 ta", "3 ta", "4 ta", "7 ta"],
          answer: 2,
          explain: "Barchinoy poyga, yoy tortish, merganlik va kurashdan iborat 4 shartni e'lon qiladi.",
        },
      },
      {
        title: "Xulosa va mustahkamlash topshiriqlari",
        subtitle: "4-slayd · Dostonning zamonaviy tarbiyaviy ahamiyati",
        body: "Alpomishning zindondan chiqishi va oilasiga qaytishi adolatning tantanasini ifodalaydi.",
        bullets: [
          "«Alpomish» bugun ham vatanparvarlik va oilaviy qadriyatlar maktabidir.",
          "Uyga vazifa: doston matnidan 5 ta xalq maqolini ko'chirib, ma'nosini izohlash.",
        ],
        highlight: "Keyingi qadam: 9-sinf Adabiyot testi yoki 3D Arg'amchi tortish o'yinini boshlang!",
        teacherNote: "Dars yakunida «Arg'amchi tortish 3D» o'yinida ikki jamoa o'rtasida musobaqa o'tkazish tavsiya etiladi.",
      },
    ],
  },
  {
    id: "lesson-8-adabiyot-navoiy",
    grade: "8",
    subjectName: "Adabiyot",
    lang: "uz",
    title: "Alisher Navoiyning «Xamsa» asari va «Hayrat ul-abror» dostoni",
    durationMin: 45,
    objectives: [
      "«Xamsa» an'anasi va Navoiy xamsachiligining o'ziga xosligini bilish",
      "«Hayrat ul-abror» dostonining komil inson haqidagi g'oyalarini sharhlash",
    ],
    keyTerms: [
      { term: "Xamsa", def: "Bir muallif tomonidan yozilgan beshta yirik dostondan iborat majmua." },
      { term: "Maqolat", def: "«Hayrat ul-abror»dagi axloqiy-falsafiy bob nomi." },
    ],
    slides: [
      {
        title: "Turkiy tildagi ilk «Xamsa» (1483–1485)",
        subtitle: "1-slayd · Xamsachilik tarixi",
        body: "Alisher Navoiy o'zbek tilida ilk bor beshta dostondan iborat «Xamsa» yaratib, ona tilimizning cheksiz imkoniyatlarini isbotladi.",
        bullets: [
          "1. «Hayrat ul-abror» — falsafiy-axloqiy doston.",
          "2. «Farhod va Shirin», 3. «Layli va Majnun» — ishqiy-qahramonlik dostonlari.",
          "4. «Sab'ai sayyor», 5. «Saddi Iskandariy» — ijtimoiy-siyosiy dostonlar.",
        ],
        highlight: "Navoiy «Xamsa»ni atigi ikki yil ichida yaratgan.",
        teacherNote: "Xamsa tarkibidagi 5 ta doston nomini xronologik tartibda doskaga yozib tushuntiring.",
        checkQuestion: {
          q: "Alisher Navoiy «Xamsa»sining birinchi dostoni qaysi?",
          options: ["Farhod va Shirin", "Hayrat ul-abror", "Sab'ai sayyor", "Saddi Iskandariy"],
          answer: 1,
          explain: "«Hayrat ul-abror» (Yaxshi kishilarning hayratlanishi) 1483-yilda yozilgan birinchi dostondir.",
        },
      },
      {
        title: "«Hayrat ul-abror»da adolat, ilm va saxovat",
        subtitle: "2-slayd · Komil inson tarbiyasi",
        body: "Doston 20 ta maqolatdan iborat bo'lib, har bir maqolatda insoniy fazilatlar hikoyatlar bilan dalillanadi.",
        bullets: [
          "Rostgo'ylik va yolg'onchilikning oqibatlari «Sher bilan Durroj» hikoyatida yoritiladi.",
          "Karam va saxovat mavzusi «Hotami Toy» hikoyati orqali ochib beriladi.",
        ],
        highlight: "«Oz-oz o'rganib dono bo'lur, qatra-qatra yig'ilib daryo bo'lur».",
        teacherNote: "«Sher bilan Durroj» hikoyatini rollarga bo'lib o'qitish o'quvchilar faolligini oshiradi.",
      },
      {
        title: "Aruz vazni va badiiy mahorat",
        subtitle: "3-slayd · She'riy tahlil",
        body: "Doston sari' bahrida yozilgan bo'lib, ravon ohangi va qofiyadosh hikmatlari bilan ajralib turadi.",
        bullets: [
          "Baytlarda tazod (qarama-qarshi qo'yish) va talmeh san'atlari keng qo'llangan.",
          "Har bir hikmatli bayt bugungi kunda ham maqol kabi qo'llanadi.",
        ],
        teacherNote: "O'quvchilardan Navoiyning rostgo'ylik haqidagi 2 baytini yoddan tahlil qilishni so'rang.",
      },
    ],
  },
  {
    id: "lesson-7-algebra-chiziqli",
    grade: "7",
    subjectName: "Algebra",
    lang: "uz",
    title: "Chiziqli funksiya va uning grafigi (y = kx + b)",
    durationMin: 45,
    objectives: [
      "y = kx + b ko'rinishidagi funksiyaning k va b koeffitsiyentlari ma'nosini tushunish",
      "Ikki nuqta orqali chiziqli funksiya grafigini chizish",
    ],
    keyTerms: [
      { term: "Burchak koeffitsiyenti (k)", def: "To'g'ri chiziqning Ox o'qiga nisbatan og'ish burchagini belgilovchi son." },
      { term: "Ozod had (b)", def: "Grafikning Oy o'qini kesib o'tadigan nuqtasi ordinatasi (0; b)." },
    ],
    slides: [
      {
        title: "Chiziqli funksiya ta'rifi",
        subtitle: "1-slayd · Nazariy asos",
        body: "y = kx + b ko'rinishidagi funksiya chiziqli funksiya deyiladi. Bu yerda x — erkli o'zgaruvchi, k va b — berilgan haqiqiy sonlar.",
        bullets: [
          "Agar b = 0 bo'lsa, y = kx to'g'ri proporsionallik funksiyasi hosil bo'ladi.",
          "Agar k > 0 bo'lsa funksiya o'suvchi, k < 0 bo'lsa kamayuvchi bo'ladi.",
          "Agar k = 0 bo'lsa, grafik Ox o'qiga parallel to'g'ri chiziq bo'ladi.",
        ],
        highlight: "Ikki chiziqli funksiyaning k koeffitsiyentlari teng bo'lsa, ularning grafiklari parallel!",
        teacherNote: "Doskada y = 2x + 1 va y = 2x - 3 grafiklarini yonma-yon chizib parallellikni ko'rsating.",
        checkQuestion: {
          q: "y = -3x + 5 chiziqli funksiyaning grafigi Oy o'qini qaysi nuqtada kesib o'tadi?",
          options: ["(5; 0)", "(0; 5)", "(0; -3)", "(-3; 5)"],
          answer: 1,
          explain: "Oy o'qi bilan kesishishda x = 0 bo'ladi: y = -3·0 + 5 = 5, demak (0; 5).",
        },
      },
      {
        title: "Grafik chizish algoritmi",
        subtitle: "2-slayd · Amaliy qadamlar",
        body: "To'g'ri chiziqni tekislikda yasash uchun atigi 2 ta nuqta koordinatasini topish kifoya.",
        bullets: [
          "1-qadam: x = 0 deb olib, y = b nuqtani belgilang: (0; b).",
          "2-qadam: qulay bir x qiymati (masalan, x = 2) olib y ni hisoblang.",
          "3-qadam: shu ikki nuqta orqali chizg'ich bilan to'g'ri chiziq o'tkazing.",
        ],
        teacherNote: "O'quvchilarga daftarida y = 0.5x - 2 funksiyasi uchun jadval tuzishni bering.",
      },
      {
        title: "Hayotiy masalalar va xulosa",
        subtitle: "3-slayd · Amaliy qo'llanilishi",
        body: "Taksi narxi (boshlang'ich to'lov + har km narxi), o'zgarmas tezlikdagi harakat masofasi chiziqli funksiya bilan modellanadi.",
        bullets: [
          "Misol: Taksi chaqirish 5 000 so'm va har 1 km uchun 3 000 so'm → S(x) = 3000x + 5000.",
          "Mustahkamlash uchun «Matematik ishchi varaq» generatoridan foydalaning.",
        ],
        teacherNote: "Real taksi narxi misolida k va b koeffitsiyentlarining hayotiy ma'nosini muhokama qiling.",
      },
    ],
  },
  {
    id: "lesson-8-fizika-om-qonuni",
    grade: "8",
    subjectName: "Fizika",
    lang: "uz",
    title: "Zanjirning bir qismi uchun Om qonuni",
    durationMin: 45,
    objectives: [
      "Tok kuchi, kuchlanish va qarshilik orasidagi bog'lanishni izohlash",
      "I = U / R formulasi yordamida elektr zanjiri masalalarini yechish",
    ],
    keyTerms: [
      { term: "Tok kuchi (I)", def: "O'tkazgich ko'ndalang kesimidan 1 sekundda o'tadigan zaryad miqdori (Amper, A)." },
      { term: "Kuchlanish (U)", def: "Elektr maydonining birlik zaryadni ko'chirishdagi ishi (Volt, V)." },
      { term: "Qarshilik (R)", def: "O'tkazgichning elektr tokiga ko'rsatadigan qarshilik xossasi (Om, Ω)." },
    ],
    slides: [
      {
        title: "Georg Om tajribasi va qonun ta'rifi",
        subtitle: "1-slayd · Asosiy formula",
        body: "Zanjirning bir qismidagi tok kuchi shu qism uchlaridagi kuchlanishga to'g'ri proporsional, qarshiligiga esa teskari proporsionaldir.",
        bullets: [
          "Formula: I = U / R",
          "Bundan: U = I · R va R = U / I kelib chiqadi.",
          "O'lchov birliklari: 1 A = 1 V / 1 Om.",
        ],
        highlight: "Qarshilik o'zgarmas bo'lsa, kuchlanish 2 marta oshganda tok kuchi ham 2 marta ortadi.",
        teacherNote: "Uchburchak qoidasi (U tepada, I va R pastda) yordamida 3 ta formulani eslab qolishni o'rgating.",
        checkQuestion: {
          q: "Qarshiligi 10 Om bo'lgan o'tkazgich uchlariga 220 V kuchlanish berilsa, tok kuchi qancha bo'ladi?",
          options: ["2,2 A", "22 A", "2200 A", "0,22 A"],
          answer: 1,
          explain: "Om qonuniga ko'ra I = U / R = 220 V / 10 Om = 22 A.",
        },
      },
      {
        title: "O'lchash asboblari va xavfsizlik",
        subtitle: "2-slayd · Ampermetr va Voltmetr",
        body: "Elektr zanjirida tok kuchini o'lchash uchun ampermetr ketma-ket, kuchlanishni o'lchash uchun voltmetr parallel ulanadi.",
        bullets: [
          "Ampermetr qarshiligi juda kichik bo'ladi va zanjirga ketma-ket ulanadi.",
          "Voltmetr qarshiligi juda katta bo'ladi va o'lchanayotgan qismga parallel ulanadi.",
        ],
        teacherNote: "Ampermetrni hech qachon manbaga to'g'ridan-to'g'ri parallel ulab bo'lmasligini alohida ta'kidlang.",
      },
    ],
  },
  {
    id: "lesson-5-ona-tili-ot",
    grade: "5",
    subjectName: "Ona tili",
    lang: "uz",
    title: "Ot so'z turkumi: atoqli va turdosh otlar",
    durationMin: 45,
    objectives: [
      "Kim? Nima? Qayer? so'roqlariga javob beradigan so'zlarni ajratish",
      "Atoqli otlarni bosh harf bilan yozish imlo qoidalarini mustahkamlash",
    ],
    keyTerms: [
      { term: "Ot", def: "Predmet, shaxs va joy nomini bildirib Kim? Nima? Qayer? so'rog'iga javob beruvchi so'z turkumi." },
      { term: "Atoqli ot", def: "Bir turdagi predmetlardan bittasini ajratib atovchi nom (Toshkent, Navoiy)." },
    ],
    slides: [
      {
        title: "Ot nima? So'roqlari va ma'no turlari",
        subtitle: "1-slayd · So'z turkumi",
        body: "Atrofimizdagi barcha narsa-predmetlar, insonlar, joylar va tushunchalarning nomi ot so'z turkumiga kiradi.",
        bullets: [
          "Shaxs otlari: Kim? (o'qituvchi, Alisher, do'st)",
          "Narsa otlari: Nima? (kitob, quyosh, ilm)",
          "O'rin-joy otlari: Qayer? (Samarqand, maktab, bog')",
        ],
        highlight: "Atoqli otlar gapning qayerida kelishidan qat'i nazar bosh harf bilan yoziladi.",
        teacherNote: "O'quvchilarga o'z sinfidagi 5 ta narsa va 3 ta atoqli otni daftariga yozdiring.",
        checkQuestion: {
          q: "Qaysi qatorda faqat atoqli otlar berilgan?",
          options: [
            "Kitob, qalam, daftar",
            "Buxoro, Amudaryo, Bobur",
            "Tog', daryo, shahar",
            "Maktab, Toshkent, do'st",
          ],
          answer: 1,
          explain: "Buxoro (shahar), Amudaryo (daryo), Bobur (shaxs ismi) — barchasi yakka nom, ya'ni atoqli otlar.",
        },
      },
      {
        title: "Turdosh otlarning atoqli otga ko'chishi",
        subtitle: "2-slayd · Imlo nozikliklari",
        body: "Ba'zan turdosh otlar inson ismi yoki tashkilot nomiga aylanib, atoqli otga o'tadi: lola — Lola, yulduz — Yulduz, bahor — Bahor.",
        bullets: [
          "Bog'da qizil lola ochildi (turdosh ot, kichik harf).",
          "Lola darsga birinchi bo'lib keldi (atoqli ot, bosh harf).",
        ],
        teacherNote: "O'quvchilardan «Olma», «Qudrat», «Guli» so'zlarini ikki xil ma'noda gap ichida qo'llashni so'rang.",
      },
    ],
  },
  {
    id: "lesson-10-tarix-temuriylar",
    grade: "10",
    subjectName: "O'zbekiston tarixi",
    lang: "uz",
    title: "Amir Temur va Temuriylar Renessansi davri madaniyati",
    durationMin: 45,
    objectives: [
      "Temuriylar davrida ilm-fan, me'morchilik va adabiyot yuksalishini tahlil qilish",
      "Mirzo Ulug'bek akademiyasi va «Ziji Jadidi Ko'ragoniy» ahamiyatini tushunish",
    ],
    keyTerms: [
      { term: "Renessans", def: "Ilm-fan, san'at, adabiyot va ma'naviyatning mislsiz uyg'onish va yuksalish davri." },
      { term: "Zij", def: "Yulduzlar koordinatalari va sayyoralar harakatini aks ettiruvchi astronomik jadval." },
    ],
    slides: [
      {
        title: "Ikkinchi Renessans poydevori",
        subtitle: "1-slayd · Samarqand va Hirot markazlari",
        body: "XIV asr oxiri – XV asrda Movarounnahr va Xurosonda ilm-fan va madaniyat misli ko'rilmagan darajada taraqqiy etdi.",
        bullets: [
          "Samarqandda Registon, Shohi Zinda, Bibixonim, Go'ri Amir kabi noyob obidalar bunyod etildi.",
          "Hirotda Alisher Navoiy, Abdurahmon Jomiy va Kamoliddin Behzod ijod qildi.",
        ],
        highlight: "Mirzo Ulug'bekning Samarqand rasadxonasida 1018 ta yulduzning aniq koordinatalari o'rganilgan.",
        teacherNote: "Samarqand va Hirot maktablari o'rtasidagi umumiylik va farqlarni taqqoslang.",
        checkQuestion: {
          q: "Mirzo Ulug'bek tomonidan tuzilgan mashhur yulduzlar jadvali qanday nomlanadi?",
          options: ["Qonuni Mas'udiy", "Ziji Jadidi Ko'ragoniy", "Boburnoma", "Devoni hikmat"],
          answer: 1,
          explain: "«Ziji Jadidi Ko'ragoniy» XV asr jahon astronomiyasining eng aniq asari hisoblanadi.",
        },
      },
      {
        title: "Me'morchilik va miniatyura san'ati",
        subtitle: "2-slayd · Badiiy meros",
        body: "Kamoliddin Behzod miniatyura maktabi Sharq tasviriy san'atida realistik portret va kompozitsiya inqilobini yasadi.",
        bullets: [
          "Moviy koshinlar va sirkor naqshlar Temuriylar me'morchiligining o'ziga xos belgisidir.",
          "Tarixshunoslikda Sharafiddin Ali Yazdiy («Zafarnoma») va Mirxond asarlari yaratildi.",
        ],
        teacherNote: "Registon maydonidagi Uch madrasaning qurilish tarixini qisqacha eslatib o'ting.",
      },
    ],
  },
  {
    id: "lesson-9-biologiya-hujayra",
    grade: "9",
    subjectName: "Biologiya",
    lang: "uz",
    title: "Hujayra tuzilishi va organoidlar funksiyalari",
    durationMin: 45,
    objectives: [
      "Prokariot va eukariot hujayralarning asosiy farqlarini sanab berish",
      "Mitoxondriya, ribosoma va xloroplast vazifalarini tushuntirish",
    ],
    keyTerms: [
      { term: "Mitoxondriya", def: "ATF energiyasini sintezlovchi «hujayra energetik stansiyasi»." },
      { term: "Ribosoma", def: "Oqsil biosintezini amalga oshiruvchi membranasiz organoid." },
    ],
    slides: [
      {
        title: "Hujayra — tirik organizmning tuzilish birligi",
        subtitle: "1-slayd · Eukariot hujayra qismlari",
        body: "Barcha tirik mavjudotlar hujayralardan tuzilgan. Eukariot hujayrada shakllangan yadro va ixtisoslashgan organoidlar mavjud.",
        bullets: [
          "Plazmatik membrana — hujayrani himoya qiladi va moddalar almashinuvini boshqaradi.",
          "Yadro — DNK irsiy axborotini saqlaydi.",
          "Mitoxondriya — hujayra nafas olishi va ATF hosil bo'lishini ta'minlaydi.",
        ],
        highlight: "O'simlik hujayrasi sellyuloza po'stloq, plastidalar (xloroplast) va yirik vakuolaga ega.",
        teacherNote: "Hayvon va o'simlik hujayrasini Venn diagrammasida solishtiring.",
        checkQuestion: {
          q: "Hujayrada oqsil sintezi qaysi organoidda amalga oshiriladi?",
          options: ["Lizosoma", "Ribosoma", "Golji majmuasi", "Vakuola"],
          answer: 1,
          explain: "Ribosomalar m-RNK asosida aminokislotalardan oqsil zanjirini yig'adi.",
        },
      },
      {
        title: "Moddalar almashinuvi va energiya",
        subtitle: "2-slayd · Fotosintez va nafas olish",
        body: "Xloroplastlarda quyosh nuri yordamida noorganik moddalardan glyukoza va kislorod sintezlanadi.",
        bullets: [
          "Fotosintezning yorug'lik fazasi tilakoidlarda, qorong'ulik fazasi stromada kechadi.",
          "Hosil bo'lgan ATF barcha hayotiy jarayonlarni quvvatlaydi.",
        ],
        teacherNote: "Fotosintez tenglamasini doskada yozib, kislorod ajralishi ahamiyatini tushuntiring.",
      },
    ],
  },
  {
    id: "lesson-11-informatika-algoritm",
    grade: "11",
    subjectName: "Informatika",
    lang: "uz",
    title: "Python dasturlash tilida ma'lumotlar tuzilmasi va funksiyalar",
    durationMin: 45,
    objectives: [
      "List (ro'yxat) va Dictionary (lug'at) tuzilmalarining farqini amalda qo'llash",
      "Qaytariluvchi va parametrlangan funksiyalar (def) yozish",
    ],
    keyTerms: [
      { term: "List (ro'yxat)", def: "Tartiblangan va o'zgartiriladigan elementlar to'plami: [1, 2, 3]." },
      { term: "Dictionary (lug'at)", def: "Kalit-qiymat (key: value) juftliklaridan iborat tezkor ma'lumot tuzilmasi." },
    ],
    slides: [
      {
        title: "Ro'yxat (List) va Lug'at (Dict) imkoniyatlari",
        subtitle: "1-slayd · Ma'lumotlarni saqlash",
        body: "Katta hajmdagi ma'lumotlar bilan ishlashda to'g'ri tuzilmani tanlash dastur tezligini bir necha barobar oshiradi.",
        bullets: [
          "List indeks bo'yicha murojaat qiladi: fanlar[0] → 'Adabiyot'.",
          "Dict kalit bo'yicha tezkor O(1) qidiruv beradi: baho['Ali'] → 5.",
          "def kalit so'zi orqali kodni qayta ishlatiladigan modulga ajratamiz.",
        ],
        highlight: "Toza kod yozish qoidasi: har bir funksiya bitta aniq vazifani bajarishi kerak.",
        teacherNote: "O'quvchilarga sinf jurnali baholarini Dict ko'rinishida saqlab o'rtacha ball hisoblashni topshiring.",
        checkQuestion: {
          q: "Python tilida kalit-qiymat (key-value) juftliklarini saqlaydigan tuzilma qaysi?",
          options: ["tuple", "set", "dict", "int"],
          answer: 2,
          explain: "Dictionary (dict) ma'lumotlarni {kalit: qiymat} ko'rinishida saqlaydi.",
        },
      },
      {
        title: "Funksiyalar va rekursiya tushunchasi",
        subtitle: "2-slayd · Modulli dasturlash",
        body: "Funksiyalar dasturdagi takrorlanishni kamaytiradi va xatolarni tez topishga yordam beradi.",
        bullets: [
          "def hisobla(a, b=1): — standart parametr berish usuli.",
          "return operatori natijani chaqiruvchi kodga qaytaradi.",
        ],
        teacherNote: "Faktorial hisoblash misolida oddiy sikl va rekursiya farqini ko'rsating.",
      },
    ],
  },
  {
    id: "lesson-1-alifbe-harflar",
    grade: "1",
    subjectName: "Alifbe va Ona tili",
    lang: "uz",
    title: "Unli va undosh tovushlar dunyosiga sayohat",
    durationMin: 35,
    objectives: [
      "Unli (6 ta) va undosh tovushlarni talaffuz orqali ajrata olish",
      "Bo'g'in hosil qilishda unli tovushning o'rnini tushunish",
    ],
    keyTerms: [
      { term: "Unli tovushlar", def: "Og'iz bo'shlig'ida to'siqqa uchramay, cho'zib aytiladigan 6 ta tovush (a, o, i, u, e, o')." },
      { term: "Bo'g'in", def: "Bir havo zarbi bilan aytiladigan tovush yoki tovushlar birikmasi." },
    ],
    slides: [
      {
        title: "6 ta sehrli unli tovush!",
        subtitle: "1-slayd · A, O, I, U, E, O'",
        body: "Unli tovushlarni kuylab, cho'zib talaffuz qilish mumkin. Har bir so'zda nechta unli bo'lsa, shuncha bo'g'in bo'ladi!",
        bullets: [
          "A — Anor, O — Olma, I — Ilm",
          "U — Uzum, E — Ertak, O' — O'zbekiston",
          "Qoida: Bo'g'in doim unli tovush bilan tuziladi.",
        ],
        highlight: "Ma-k-tab → Maktab (2 ta unli = 2 ta bo'g'in: mak-tab).",
        teacherNote: "Boshlang'ich sinf o'quvchilari bilan so'zlarni chapak chalib bo'g'inga bo'lish o'yinini o'ynang.",
        checkQuestion: {
          q: "«Vatan» so'zida nechta bo'g'in bor?",
          options: ["1 ta", "2 ta", "3 ta", "4 ta"],
          answer: 1,
          explain: "«Vatan» so'zida ikkita unli (a, a) bor, shuning uchun 2 bo'g'in: Va-tan.",
        },
      },
    ],
  },
  {
    id: "lesson-6-geografiya-materiklar",
    grade: "6",
    subjectName: "Geografiya",
    lang: "uz",
    title: "Yer shari materiklari va okeanlari",
    durationMin: 45,
    objectives: [
      "6 ta materik va 4 ta okeanni xaritada ko'rsatish va maydoniga ko'ra tartiblash",
      "Ekvator va Bosh meridianning materiklarni kesib o'tishini tushunish",
    ],
    keyTerms: [
      { term: "Materik", def: "Atrofi okean va dengizlar bilan o'ralgan yirik quruqlik bo'lagi." },
      { term: "Yevrosiyo", def: "Yevropa va Osiyo qit'alarini birlashtiruvchi eng katta materik." },
    ],
    slides: [
      {
        title: "6 materik va 4 okean xaritasi",
        subtitle: "1-slayd · Maydon va rekordlar",
        body: "Yer yuzasining 71 foizini suv (Dunyo okeani), 29 foizini esa quruqlik (materik va orollar) egallaydi.",
        bullets: [
          "Eng katta materik: Yevrosiyo (54 mln km²). Eng kichigi: Avstraliya.",
          "Eng issiq materik: Afrika. Eng sovuq: Antarktida.",
          "Eng katta va chuqur okean: Tinch okeani (Mariana botig'i — 11 022 m).",
        ],
        highlight: "Afrika — ekvator deyarli o'rtasidan kesib o'tadigan yagona materik.",
        teacherNote: "Sinf xaritasi yoki globusda Tinch okeanidan Hind okeaniga o'tish yo'lini ko'rsating.",
        checkQuestion: {
          q: "Yer sharidagi eng kichik materik qaysi?",
          options: ["Janubiy Amerika", "Antarktida", "Avstraliya", "Afrika"],
          answer: 2,
          explain: "Avstraliya maydoni ~7,7 mln km² bo'lib, olti materik orasida eng kichigidir.",
        },
      },
    ],
  },
];

export function getLessonsByGrade(grade: string): InteractiveLesson[] {
  if (!grade || grade === "all") return INTERACTIVE_LESSONS;
  return INTERACTIVE_LESSONS.filter((l) => l.grade === grade);
}
