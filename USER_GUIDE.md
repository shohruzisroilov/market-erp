# Ichimliklar Do'koni ERP — 1 Varoqlik Tezkor Qo'llanma

Ushbu ixcham yo'riqnoma do'kon egasi va sotuvchilar uchun tizimdan 2 daqiqada foydalanishni boshlash uchun mo'ljallangan.

---

### 1. Asosiy Qoida: Dona va Blok
* Ichimliklar zavoddan **blok (upakovka)** holida keladi, mijozlarga esa **bloklab** yoki **donalab** sotiladi.
* Har bir tovar kiritilganda **"1 Blokdagi Donalar Soni"** belgilanadi (masalan: Cola 0.5L = 12 dona).
* Ombordagi qoldiq har doim aniq ko'rinadi: **"18 blok + 3 dona (219 dona)"**.

---

### 2. Yangi Ichimlik Qo'shish (1 daqiqada)
1. **"Mahsulotlar"** bo'limiga o'ting va **"+ Yangi Mahsulot"** tugmasini bosing.
2. Ichimlik nomi (masalan: *Coca-Cola 1.5L*) va **1 blokdagi soni**ni (masalan: *6*) yozing.
3. 1 dona **Kelgan narxi** va **Sotish narxlari**ni (dona / blok) kiritib, **"Saqlash"** tugmasini bosing.

---

### 3. Tovarni Kirim Qilish (Xarid)
1. **"Xaridlar"** bo'limiga kiring $\rightarrow$ **"Yangi Xarid Hujjati"** tugmasini bosing.
2. Tovarlar qaysi sovutgich yoki omborga tushayotganini va yetkazib beruvchini tanlang.
3. Necha **blok** yoki necha **dona** kelganini va to'langan pulni kiriting $\rightarrow$ **"Saqlash"**.
4. Tovar mashinadan tushgach, jadvaldagi **"Qabul qilish"** tugmasini bosing — tovar omborga kiradi va kassa/qarz avtomatik yangilanadi.

---

### 4. Savdo Qilish (Tezkor Kassa)
1. **"Savdolar"** bo'limiga kiring $\rightarrow$ **"Yangi Savdo Hujjati"** tugmasini bosing.
2. Chiqim joyini (masalan: *1-Sovutgich*) va xaridorni tanlang.
3. Ichimlikni tanlab, **`[+]`** va **`[-]`** tugmalari bilan sotilayotgan blok va donani 1 soniyada belgilang.
4. To'lov turini tanlang (*Naqd*, *Karta* yoki *Nasiya/Qarz*) va **"Tovarni chiqarish"** tugmasini bosing.

---

### 5. Xarajatlar (Yo'l kira) va Sof Foyda
* **Yo'l kira / Chiqim kiritish:** **"Kassa"** bo'limida **"+ Xarajat / Yo'l kira"** tugmasini bosing. Summani va izohni (masalan: *Haydovchiga yo'l kira 20,000*) yozing.
* **Toza Sof Foydani ko'rish:** **"Boshqaruv"** bo'limida tizim avtomatik hisoblaydi:
  $$\text{Toza Sof Foyda} = \text{Savdo Tushumi} - \text{Sotilgan Tovar Tannarxi} - \text{Do'kon Xarajatlari (Yo'l kira, ijara)} \pm \text{Sanash Farqi}$$
* **Haqiqiy sanash (Inventarizatsiya):** Haftada 1 marta **"Sanash"** bo'limida sovutgichdagi tovarlarni sanab kiritsangiz, kamomad yoki ortiqchalik avtomatik hisoblanadi.
