# Lilyn

Web interaktif bertema kipas LED genggam dengan nuansa ucapan ulang tahun. Halaman ini dibangun sebagai single-page experience berbasis React + Vite, dengan fokus pada visual animatif dan interaksi sinematik.

## Highlight

- Kipas LED di tengah layar dengan efek putaran baling-baling yang halus.
- Teks LED dot-matrix yang berganti otomatis:
  - `Happy Birthday`
  - `Linda`
  - `Putri`
  - `Rahayu`
- Animasi teks seperti mengetik LED satu per satu.
- Latar belakang kembang api yang terus berjalan selama halaman dibuka.
- Saat amplop dibuka, background termasuk kembang api ikut blur supaya fokus pindah ke amplop dan surat.
- Amplop interaktif yang naik ke tengah layar, membuka flap, lalu mengeluarkan surat dummy.
- Sudah disesuaikan supaya tetap nyaman dilihat di desktop dan mobile.

## Stack

- React
- Vite
- CSS custom tanpa UI framework

## Jalankan Lokal

```bash
npm install
npm run dev
```

Lalu buka:

```text
http://localhost:4173/
```

## Build Production

```bash
npm run build
```

Hasil build akan muncul di folder `dist/`.

## Struktur Singkat

```text
.
├── index.html
├── package.json
├── src
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
└── dist
```

## Interaksi Utama

### 1. Kipas LED

Kipas menjadi elemen utama di tengah halaman dengan efek glow, blur, dan lapisan rotor agar putarannya terasa lebih smooth secara visual.

### 2. LED Message Ring

Tulisan LED dibentuk sebagai dot-matrix hijau neon yang mengikuti arc lingkar kipas. Teks berganti otomatis dengan animasi ketik dan hapus.

### 3. Amplop dan Surat

Amplop kecil berada di bawah kipas. Saat ditekan:

- scene belakang blur
- amplop bergerak ke tengah
- flap amplop terbuka
- kertas keluar dari amplop
- surat tampil penuh di depan

### 4. Fireworks Background

Kembang api berjalan terus-menerus di background untuk menambah suasana perayaan, dan tetap menyatu dengan style visual gelap yang dipakai halaman.

## Catatan

- Isi surat masih dummy text dan bisa diganti kapan saja.
- Teks LED saat ini disusun dari font dot-matrix custom sederhana di `src/App.jsx`.
- Semua animasi utama dibuat dengan CSS dan state React ringan.
