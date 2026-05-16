# Nuxt Sayur - Aplikasi E-commerce Sayuran

Aplikasi e-commerce sayuran yang dibangun menggunakan Nuxt 3.

## Persyaratan Sistem

Sebelum menginstal aplikasi, pastikan sistem Anda memenuhi persyaratan berikut:

- Node.js (versi 16 atau lebih tinggi)
- NPM atau Yarn atau Bun
- Git

## Langkah Instalasi

1. Clone repository

```bash
git clone <repository-url>
cd nuxt-sayur
```

2. Install dependensi

```bash
npm install
# atau
yarn install
# atau
bun install
```

3. Konfigurasi environment
   Salin `.env.example` menjadi `.env`, lalu sesuaikan jika perlu:

```plaintext
NUXT_USER_API_BASE_URL=http://localhost:8090
NUXT_ORDER_API_BASE_URL=http://localhost:8083
NUXT_PRODUCT_API_BASE_URL=http://localhost:8082
NUXT_PAYMENT_API_BASE_URL=http://localhost:8084
NUXT_NOTIFICATION_API_BASE_URL=http://localhost:8085
```

## Menjalankan Aplikasi

### Mode Development

```bash
npm run dev
# atau
yarn dev
# atau
bun dev
```

Aplikasi akan berjalan di `http://localhost:3000`

### Mode Production

1. Build aplikasi

```bash
npm run build
# atau
yarn build
# atau
bun run build
```

2. Jalankan aplikasi

```bash
npm run start
# atau
yarn start
# atau
bun run start
```

## Fitur Utama

- Autentikasi pengguna
- Manajemen profil
- Katalog produk
- Keranjang belanja
- Checkout dan pembayaran
- Riwayat pesanan
- Geolokasi untuk pengiriman

## Teknologi yang Digunakan

- Nuxt 3
- Vue.js
- Pinia (State Management)
- Tailwind CSS
- Swiper
- Dropzone
- Quill Editor
- NoUiSlider
- Bun (JavaScript Runtime)

## Struktur Project

```plaintext
nuxt-sayur/
├── assets/          # Asset statis (CSS, gambar)
├── components/      # Komponen Vue
├── layouts/         # Layout aplikasi
├── pages/          # Halaman aplikasi
├── public/         # File publik
├── stores/         # Pinia stores
└── nuxt.config.ts  # Konfigurasi Nuxt
```

## Kontribusi

Silakan buat pull request untuk kontribusi pada project ini.

## Lisensi

[MIT License](LICENSE)
