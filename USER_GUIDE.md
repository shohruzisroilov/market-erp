# Ichimliklar Do'koni ERP — 1 Varoqlik Tezkor Qo'llanma

Ushbu ixcham yo'riqnoma do'kon egasi va sotuvchilar uchun tizimdan 2 daqiqada foydalanishni boshlash uchun mo'ljallangan.

---

### 1. Asosiy Qoida: Dona va Blok
* Ichimliklar zavoddan **blok (upakovka)** holida keladi, mijozlarga esa **bloklab** yoki **donalab** sotiladi.
* Har bir tovar kiritilganda **"1 Blokdagi Donalar Soni"** belgilanadi (masalan: Cola 0.5L = 12 dona).
* Ombordagi qoldiq doimo aniq ko'rinadi: **"18 blok + 3 dona (219 dona)"**. Tovar ustiga bosib, uning qaysi sovutgichda qancha turganini darhol ko'rish mumkin.

---

### 2. Yangi Ichimlik Qo'shish (1 daqiqada)
1. **"Ichimliklar"** bo'limiga o'ting va **"+ Yangi Ichimlik"** tugmasini bosing.
2. Nomi (masalan: *Coca-Cola 1.5L*) va **1 blokdagi donasi**ni (masalan: *6*) yozing.
3. 1 dona **Kelgan narxi** va **Sotish narxlari**ni (dona / blok) kiritib, **"Ichimlikni Yaratish"** tugmasini bosing.

---

### 3. Tovarni Kirim Qilish (Xarid — 1 Klikda)
1. **"Kirim"** bo'limiga kiring $\rightarrow$ **"Yangi Kirim Qilish"** tugmasini bosing.
2. Yetkazib beruvchi va qaysi sovutgichga tushayotganini tanlang.
3. Necha blok/dona kelganini va to'langan pulni kiriting.
4. **"Qabul Qilish & Omborga Qo'shish"** tugmasini bosing — tovar 1 klikda omborga kiradi va kassa/qarz avtomatik yangilanadi.

---

### 4. Savdo Qilish (Tezkor POS — 1 Klikda)
1. **"Sotuv"** bo'limiga kiring $\rightarrow$ **"Yangi Savdo Qilish"** tugmasini bosing.
2. Chiqim joyini (masalan: *1-Sovutgich*) va to'lov turini (*Naqd*, *Terminal* yoki *Nasiya*) tanlang.
3. Ichimlikni tanlab, **`[+]`** va **`[-]`** tugmalari bilan yoki klaviaturadan sotilayotgan sonni belgilang.
4. **"Sotish & Tovarni Chiqarish"** tugmasini bosing — 1 klikda tovar ombordan chiqadi, kassa to'ladi va foyda hisoblanadi.

---

### 5. Xarajatlar (Yo'l kira) va Toza Sof Foyda
* **Yo'l kira kiritish (3 soniyada):** Yuqoridagi **"+ Yo'l kira / Chiqim"** tugmasini bosing $\rightarrow$ Summani tanlang (masalan: *20,000*) $\rightarrow$ **"Tasdiqlash"**. Kassadan pul kamayadi va Sof Foydadan chegiriladi.
* **Toza Sof Foydani ko'rish:** **"Boshqaruv"** bo'limida tizim avtomatik hisoblaydi:
  $$\text{Toza Sof Foyda} = \text{Savdo Tushumi} - \text{Sotilgan Tovar Tannarxi} - \text{Do'kon Xarajatlari (Yo'l kira, ijara)} \pm \text{Sanash Farqi}$$
* **Haqiqiy sanash:** **"Sanash"** bo'limida sovutgichdagi tovarlarni sanab, **"Tasdiqlash & Qoldiqni To'g'rilash"** tugmasi bosilsa, kamomad/ortiqchalik avtomatik hisoblanib ombor to'g'rilanadi.
