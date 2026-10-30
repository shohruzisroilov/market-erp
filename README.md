# Ichimliklar Do'koni Mini-ERP (Drinks Market ERP)

Ichimliklar savdosi bilan shug'ullanuvchi do'konlar va ulgurji savdo nuqtalari uchun mo'ljallangan to'liq **Mini-ERP** tizimi.

Ushbu tizim ichimliklar savdosidagi 3 ta eng katta amaliy muammoni to'liq hal qiladi:
1. **Dona va Blok qoldig'ini aniq ko'rsatish:** Ichimliklar upakovka (blok) ko'rinishida keladi, lekin mijozlarga donalab ham, bloklab ham sotiladi. Tizim har bir tovar qoldig'ini bir vaqtning o'zida ham donada, ham blokda ko'rsatadi (Masalan: `18 blok + 3 dona (219 dona)`).
2. **Mahsulot joylashuvlari:** 2 pog'onali ombor ierarxiyasi (Bosh Ombor $\rightarrow$ Sub-omborlar: *1-Sovutgich*, *Vitrina*, *Zaxira Angar*). Qaysi tovar aynan qayerda turgani aniq ko'rinadi.
3. **Haqiqiy Sof Foyda (P&L):** Buxgalteriya qoidalariga asoslangan toza foyda hisob-kitobi:
   $$\text{Sof Foyda} = \text{Savdo Tushumi} - \text{Sotilgan Tovar Tannarxi} - \text{Operatsion Xarajatlar (Yo'l kira, ijara, oylik)} \pm \text{Inventarizatsiya Farqi}$$
   Qarz berish va olish operatsiyalari esa Sof Foydani soxtalashtirmaydi, kassa balansida alohida yuritiladi.

---

## 🛠 Texnologiyalar Steki

* **Backend:** [NestJS 12](https://nestjs.com/) (TypeScript), REST API, Modular Architecture
* **Ma'lumotlar bazasi:** [PostgreSQL 18](https://www.postgresql.org/)
* **ORM:** [Prisma ORM 6.4.1](https://www.prisma.io/)
* **Frontend:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19)
* **Styling & UI:** Tailwind CSS, Lucide Icons, Responsive Mobile Dock & POS-style Steppers

---

## 📑 Hujjatlar

* [**USER_GUIDE.md**](./USER_GUIDE.md) — Oddiy do'kon egalari va sotuvchilar uchun **1 varoqlik tezkor qo'llanma**.
* [**PROMPTS.md**](./PROMPTS.md) — Loyihani yaratish davomida foydalanilgan **barcha AI promptlari** (xronologik tartibda).
* [**TECH_SPEC.md**](./TECH_SPEC.md) — Tizimning to'liq texnik arxitekturasi va ma'lumotlar bazasi ER-diagrammasi.

---

## 🚀 Tizimni Ishga Tushirish

### 1. Talablar
* Node.js 20+
* PostgreSQL 15+

### 2. Backend sozlash va ishga tushirish
```bash
cd backend

# 1. Kutubxonalarni o'rnatish
npm install

# 2. .env faylini sozlash (.env.example asosida)
cp .env.example .env
# .env ichida DATABASE_URL ga o'z PostgreSQL parolingizni yozing

# 3. Bazani sinxronlash va dastlabki ma'lumotlarni (seed) kiritish
npx prisma db push
npx ts-node prisma/seed.ts

# 4. Backend serverini ishga tushirish (Port: 4000)
npm run build
npm run start:prod
# API: http://localhost:4000/api
```

### 3. Frontend sozlash va ishga tushirish
```bash
cd ../frontend

# 1. Kutubxonalarni o'rnatish
npm install

# 2. Yig'ish va ishga tushirish (Port: 3000)
npm run build
npm run start
# UI: http://localhost:3000
```

---

## 📱 Asosiy Funksiyalar
* **Boshqaruv Paneli (Dashboard):** Sof foyda, savdo tushumi, do'kon xarajatlari va kassa qoldiqlari.
* **Mahsulotlar Katalogi:** Blokdagi donalar soni, tannarx va sotish narxlari (dona/blok).
* **Omborlar va Joylashuvlar:** Sovutgichlar, vitrinalar va angarlar bo'yicha tovarlar taqsimoti.
* **Xaridlar (Kirim):** Zavoddan kelgan tovarlarni qoralama qilish va qabul qilib omborga kiritish.
* **Savdolar (Chiqim):** Tezkor POS uslubidagi `[+]` va `[-]` tugmalari bilan naqd, karta yoki nasiyaga sotish.
* **Inventarizatsiya:** Haqiqiy qoldiqni sanash, kamomad va ortiqchalikni avtomatik hisoblab balansni to'g'rilash.
* **Kassa va Xarajatlar:** Yo'l kira / logistika, ijara, maosh va qarz munosabatlarini yuritish.
* **Hisobotlar:** P&L (Sof foyda), Qoldiqlar tahlili va Savdo aylanmasi.
