# Test formati

Bu papkaga `<id>.json` fayl tashlansa, test saytda avtomatik chiqadi (kodni o'zgartirish shart emas).

```json
{
  "id": "g8-uz-adabiyot-1",
  "subjectId": "g8-uz-adabiyot",
  "title": "8-sinf Adabiyot: 1-bob",
  "grade": "8",
  "lang": "uz",
  "source": "Adabiyot 8-sinf (2019), 5-40-betlar",
  "questions": [
    { "type": "choice", "q": "…?", "options": ["A", "B", "C", "D"], "answer": 1, "explain": "…" },
    { "type": "truefalse", "q": "…", "answer": true },
    { "type": "fill", "q": "… ___ …", "answer": ["javob", "muqobil javob"] }
  ],
  "cards": [["Atama", "Ta'rif"]]
}
```

- `subjectId` — `src/data` ichidagi fan `id`si; shunda kutubxonada o'sha fan yonida "Test va o'yinlar" tugmasi chiqadi.
- `cards` ixtiyoriy: bo'lmasa, kartochkalar va juftlash o'yini variantli savollardan yasaladi.
- Noto'g'ri formatdagi fayl o'tkazib yuboriladi (brauzer konsolida ogohlantirish chiqadi).
