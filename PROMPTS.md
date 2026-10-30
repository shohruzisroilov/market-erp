# Loyihada foydalanilgan AI Promptlari (AI Prompts Log)

Ushbu hujjatda loyiha davomida foydalanuvchi tomonidan berilgan barcha topshiriqlar va promptlar ketma-ketlikda (xronologik tartibda) saqlab boriladi.

---

### Prompt #1
**Sana:** 2026-10-30  
**Matn:**
```text
Texnik topshiriq: Ichimliklar do'koni uchun mini-ERP
October 20 at 6:47 PM
Ichimliklar do‘koni uchun mini-ERP tizimini qurish texnik topshiriq belgilandi. Tizim ombordagi qoldiqlarni (dona va blok ko‘rinishida, joylashuvi bilan) aniq ko‘rsatishi, qarzlar va xarajatlar hisobga olingan holda sof foydani (P&L) hisoblab berishi lozim.
   •  Asosiy funksiyalar: mahsulot yaratish, ombor va sub-omborlarni boshqarish, savdo/xarid hujjatlarini yaratib-bajarish, inventarizatsiya va kassa (kirim-chiqim) operatsiyalari.
   •  Qo‘shimcha talablar: loyihani tushuntirish, foydalanuvchi uchun yozma dokumentatsiya tayyorlash va ishlatilgan AI promptlarini hujjatlashtirish.
Cocoon AI Summary
Topshiriq
Ichimliklar sotadigan do'kon uchun kichik ERP tizimini qurish kerak. Tizim do'kon egasiga omboridagi tovarlarni, ularning qayerda turganini va biznesi qancha sof foyda keltirayotganini aniq ko'rsatishi lozim.
Mijozning asosiy muammolari
1. Ombordagi qoldiq noaniq
Do'kon egasi omborida qancha tovar borligini aniq bilmaydi. Masalan, "Hozir nechta dona Cola bor?" va "Nechta blokda Cola bor?" degan savollarga javob bera olmaydi.
Tizim har bir mahsulot qoldig'ini ham dona, ham blok ko'rinishida aniq ko'rsatishi kerak.
2. Sof foyda ko'rinmaydi
Do'kon egasi sof foydasi qancha ekanini ko'ra olmaydi. Uning pul harakatlari faqat oldi-sotdi bilan cheklanmaydi:
qarz berish;
qarz olish;
yo'l kira kabi xarajatlar.
U bu operatsiyalarning barchasini tizimga kiritadi. Tizim ularni hisobga olgan holda sof foydani to'g'ri hisoblab ko'rsatishi kerak.
3. Mahsulot qayerda turgani noma'lum
Do'kon egasi har bir mahsulotning omborda qayerda joylashganini ko'rib tura olishi kerak. Ya'ni qaysi mahsulot qaysi ombor yoki sub-omborda va qancha miqdorda turgani ko'rinishi lozim.
Qo'shilishi kerak bo'lgan funksiyalar
1. Mahsulot yaratish
Foydalanuvchi tizimga yangi mahsulot qo'sha olishi kerak. Mahsulot ma'lumotlari uning qoldig'ini dona va blokda ko'rsatish imkonini berishi lozim.
2. Ombor yaratish (sub-omborlar bilan)
Foydalanuvchi ombor yarata olishi va uning ichida sub-omborlar yarata olishi kerak. Mahsulotlar shu omborlar va sub-omborlarda joylashadi — mahsulot joylashuvi aynan shu orqali ko'rinadi.
3. Savdo yaratish va bajarish
Foydalanuvchi savdo hujjatini yarata olishi va uni bajara olishi kerak. Yaratish va bajarish — ikki alohida amal. Savdo bajarilganda tovar ombordan chiqadi.
4. Xarid yaratish va bajarish
Foydalanuvchi xarid hujjatini yarata olishi va uni bajara olishi kerak. Yaratish va bajarish — ikki alohida amal. Xarid bajarilganda tovar omborga kiradi.
5. Inventarizatsiya
Foydalanuvchi ombordagi tovarlarni sanab, haqiqiy qoldiqni tizimga kirita olishi kerak. Tizimdagi qoldiq haqiqiy holatga moslashtiriladi.
6. Kassa: kirim va chiqim
Foydalanuvchi kassaga pul kirimi va kassadan pul chiqimini kirita olishi kerak. Qarz berish, qarz olish va yo'l kira kabi xarajatlar shu yerda kiritiladi.
Qo'shilishi kerak bo'lgan hisobotlar
1. Mahsulotlar qoldig'i
Har bir mahsulot qoldig'i dona va blokda ko'rsatiladi.
Qoldiq joylashuv bo'yicha ham ko'rsatiladi: qaysi ombor va sub-omborda qancha turibdi.
2. Savdo hisobotlari
Amalga oshirilgan savdolar bo'yicha hisobotlar.
3. P&L hisoboti
Foyda va zarar hisoboti. U do'kon egasiga sof foydasi qanchaligini ko'rsatishi kerak.
Qoidalar
1. AI'dan foydalanish
Istalgan tool'ni ishlatish mumkin. Topshiriq AI yordamida bajarilishi kerak.
2. Loyihani tushuntirish va dokumentatsiya
Ikki narsa talab qilinadi:
Loyihani to'liq tushuntirish. Loyiha nega aynan shunday qurilgani tushuntirilishi kerak.
Foydalanuvchi uchun yozma dokumentatsiya. Tizimdan qanday foydalanish yozma ravishda hujjatlashtirilishi kerak.
3. AI promptlari
AI'ga berilgan promptlar dokumentatsiyaning bir qismida to'liq yozilishi kerak. 

Salom menda shunday tizim qurushim kerak shuni menga qilib bergin faqat loyihani qilishdan oldin to'liq documentatsiya tuzib olgin keyin men tasdiqlaganimdan keyin ishni boshlagin har bir narsani qilishdan oldin mendan so'ragin o'zin bilganday qilib tashlamagin kichkina narsa bo'lsa ham mendan so'ragin men tasdiqlaganimdan keyin qilgin tushunarlimi bo'lsa ishni boshlagin  faqat bitta md fileda men senga yozgan promtlarni ketma ketlikda saqlab ketgin bu muhim va yana bitta fileda userlar uchun qanday foydalanish bo'yicha yuriqnoma ham tuzib ketgin men ohirida bularni tekshirib chiqaman.
```

---

### Prompt #2
**Sana:** 2026-10-30  
**Matn:**
```text
Menga next js va nest jsda yozgin loyihani typescript albatta baza uchun postgress sql prisma ishlatsang bo'ladi  dizayn shadcn ui va tailwind css bilan zamonaviy va qulay bo'lsin 
```

---

### Prompt #3
**Sana:** 2026-10-30  
**Matn:**
```text
men postgreSQL o'rnatib qo'ydim edin tekshirib menga hozircha local bazadan foydalanib qilib bergin
```

---

### Prompt #4
**Sana:** 2026-10-30  
**Matn:**
```text
parolni o'zim yozib qo'yaman env filega keyin hozircha ishni davom etkazgin
```

---

### Prompt #5
**Sana:** 2026-10-30  
**Matn:**
```text
Ha davom etamiz
```

---

### Prompt #6
**Sana:** 2026-10-30  
**Matn:**
```text
ham parolni kiritib qo'ydim keyingi bosqichga o'tsak bo'ladi 
```

---

### Prompt #7
**Sana:** 2026-10-30  
**Matn:**
```text
ha davom etamiz menga maqul
```

---

### Prompt #8
**Sana:** 2026-10-30  
**Matn:**
```text
ok menga ma'qul davom etkazgin
```

---

### Prompt #9
**Sana:** 2026-10-30  
**Matn:**
```text
Bo'ldimi barcha ishlar yakunlandimi
```

---

### Prompt #10
**Sana:** 2026-10-30  
**Matn:**
```text
Sen Senior UI/UX design va Senior Full stack developer sifatida bu qurgan tizimni to'liq re design qilib bergin dizayn to'liq foydalanuvchilarga qulay UI/UX qoidalariga amal qilgan holatda minimalizim asosida qilib bergin maximalni qulay bo'lsin har bir deviceda foydalanishda responsave bo'lsin va oddiy foydalanuvchilarga tushunarli bo'lishi kerak tizimdan foydalangan odam bu tizmda ortiqcha vaqt sarflashi kerak emas 
```

---

### Prompt #11
**Sana:** 2026-10-30  
**Matn:**
```text
ha albatta
```

---

### Prompt #12
**Sana:** 2026-10-30  
**Matn:**
```text
Tizim to'liq do'kon egalari oddiy userlar uchun tushunarli va foydalanishga qulay bo'lishi kerak hozirda har xil tushunarsiz terminlar va boshqa narsalarni olib tashlagin va keyin formalarda selectlarni yaxshilagin inputlarni ham hozir 0 bo'lib qolib ketayabdi bo'sh bo'lmayabdi shular hammasini to'g'irlagin
```

---

### Prompt #13
**Sana:** 2026-10-30  
**Matn:**
```text
ha albatta
```

---

### Prompt #14
**Sana:** 2026-10-30  
**Matn:**
```text
bu narsa footer kerak emas
```

---

### Prompt #15
**Sana:** 2026-10-30  
**Matn:**
```text
ha
```

---

### Prompt #16
**Sana:** 2026-10-30  
**Matn:**
```text
Hozirda inputlarda to'liq o'chirib tashlayb boshqa raqam yozaman desam 0 qolib ketayabdi 0 o'chib ketmayabdi shuni ham to'g'irlab bergin 0 ham o'chib ketsan
```

---

### Prompt #17
**Sana:** 2026-10-30  
**Matn:**
```text
user guide maximalni userlarga tushunarli va qisqa bo'lsin bir varoqga sig'adigan narsa bo'ldi bo'ldi
```

---

### Prompt #18
**Sana:** 2026-10-30  
**Matn:**
```text
ha  albatta
```

---

### Prompt #19
**Sana:** 2026-10-30  
**Matn:**
```text
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/shohruzisroilov/market-erp.git
git push -u origin main shunga push qilib bergin edi
```

---

### Prompt #20
**Sana:** 2026-10-30  
**Matn:**
```text
ha
```




















