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
Buat file `.env` di root project dan isi dengan konfigurasi berikut:
```plaintext
NUXT_USER_API_BASE_URL=<url_api_user>
NUXT_ORDER_API_BASE_URL=<url_api_order>
NUXT_PRODUCT_API_BASE_URL=<url_api_product>
NUXT_PAYMENT_API_BASE_URL=<url_api_payment>
NUXT_NOTIFICATION_API_BASE_URL=<url_api_notification>
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

        