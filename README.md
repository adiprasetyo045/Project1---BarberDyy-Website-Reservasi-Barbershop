```markdown
#  Sistem Reservasi Barbershop Modern
Sistem pemesanan barbershop yang lengkap dan siap produksi dengan antarmuka pengguna (UI) modern, fungsionalitas full-stack, serta fitur komprehensif untuk pelanggan dan administrator.
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-blue?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-Supported-2496ED?style=flat-square)

## Fitur
### Fitur Pelanggan
- **Registrasi & Login Pengguna** - Autentikasi aman menggunakan JWT.
- **Dashboard** - Tampilan personal dengan statistik pemesanan.
- **Sistem Booking** - Wizard pemesanan multi-langkah dengan ketersediaan waktu nyata (real-time).
- **Booking Saya** - Lihat, kelola, dan batalkan janji temu.
- **Manajemen Profil** - Perbarui informasi pribadi dan preferensi.
- **Riwayat Booking** - Lacak janji temu yang lalu dan yang akan datang.
- **Notifikasi Email** - Konfirmasi booking dan pengingat otomatis.

### Fitur Admin
- **Dashboard Admin** - Analitik komprehensif, grafik pendapatan, dan statistik.
- **Manajemen Booking** - Lihat dan kelola semua pemesanan pelanggan.
- **Kontrol Status** - Perbarui status booking (menunggu, dikonfirmasi, selesai, dibatalkan).
- **Manajemen Layanan** - CRUD operasi untuk layanan (harga, durasi, deskripsi).
- **Manajemen Barber** - Kelola barber, profil, dan jadwal kerja.
- **Manajemen Pengguna** - Lihat dan kelola akun pelanggan.
- **Fungsi Ekspor** - Ekspor data pemesanan untuk pelaporan.

###  Fitur Teknis
- **Desain Responsif** - Dioptimalkan sepenuhnya untuk desktop, tablet, dan seluler.
- **Validasi Real-time** - Validasi formulir di sisi klien dan server.
- **Keamanan** - Autentikasi JWT, hashing password bcrypt, CORS, rate limiting, Helmet.js.
- **Database** - PostgreSQL dengan pengindeksan, foreign keys, dan batasan (constraints) yang tepat.
- **Dukungan PWA** - Implementasi service worker untuk kemampuan offline.
- **Dukungan Docker** - Deployment tercontainerisasi dengan Docker Compose.

---

## 🏗 Arsitektur

```text
barbershop-reservation/
├── frontend/                 # Aplikasi sisi klien (Client-side)
│   ├── assets/               # CSS, JavaScript, gambar
│   ├── *.html                # Halaman HTML (Index, Login, Dashboard, dll.)
│   └── service-worker.js     # Konfigurasi PWA
├── backend/                  # Aplikasi sisi server (Server-side)
│   ├── config/               # Konfigurasi DB dan App
│   ├── controllers/          # Logika Request (Auth, Booking, Service, Barber)
│   ├── middleware/           # Auth, Validasi, Error Handling
│   ├── models/               # Model Database
│   ├── routes/               # Endpoint API
│   ├── utils/                # Helpers (Email, Date, Validators)
│   └── tests/                # Unit dan Integration tests
├── database/                 # Manajemen Database
│   ├── migrations/           # Skrip migrasi skema
│   ├── seeds/                # Data dummy untuk testing
│   └── schema.sql            # Skema SQL mentah
├── documentation/            # Panduan proyek
└── docker/                   # Konfigurasi Docker

```

---

## Mulai Cepat

### Prasyarat

* **Node.js**: v18 atau lebih tinggi
* **PostgreSQL**: v15 atau lebih tinggi
* **npm** atau **yarn**

### Panduan Instalasi

#### 1. Clone Repository

```bash
git clone [https://github.com/yourusername/barbershop-reservation.git](https://github.com/yourusername/barbershop-reservation.git)
cd barbershop-reservation

```

#### 2. Setup Database

Buat database dan terapkan skema:

```bash
# Buat Database
createdb barbershop_db

# Impor Skema
psql barbershop_db < database/schema.sql

# ATAU gunakan script migrasi
cd backend
node scripts/migration.js up

```

#### 3. Konfigurasi Backend

Masuk ke direktori backend dan atur environment variables:

```bash
cd backend
cp .env.example .env
npm install

```

*Edit file `.env` dengan kredensial database Anda (lihat bagian Konfigurasi di bawah).*

#### 4. Seed Data (Opsional)

Isi database dengan data awal (User Admin, Layanan, Barber):

```bash
node scripts/seed.js

```

#### 5. Jalankan Aplikasi

**Jalankan Backend API:**

```bash
# Dari direktori /backend
npm start
# ATAU untuk mode pengembangan (development)
npm run dev

```

*Backend berjalan di: `https://project1-barber-dyy-website-reservasi-barbershop-l0xeswl4b.vercel.app*`

**Jalankan Frontend:**

```bash
# Buka terminal baru, masuk ke /frontend
cd frontend

# Gunakan Python SimpleHTTP (atau server statis lainnya seperti live-server)
python -m http.server 8000

```

*Frontend berjalan di: `http://localhost:8000*`

---

## Kredensial Default

|    Role      |           Email             |     Password      |
|--------------|-----------------------------|------------------ |
| **Admin**    | `prasetyaadhi398@gmail.com` | `prasetyaadhi045` |
| **Customer** | `farisadam123@gmail.com`    | `farisadam123`    |

---

## Konfigurasi (.env)

| Variabel        | Deskripsi         | Default           |
| `PORT`          | Port Server       | `3000`            |
| `NODE_ENV`      | Environment       | `development`     |
| `DB_HOST`       | Host Database     | `localhost`       |
| `DB_PORT`       | Port Database     | `5432`            |
| `DB_NAME`       | Nama Database     | `barbershop_db`   |
| `DB_USER`       | User Database     | `postgres`        |
| `DB_PASSWORD`   | Password Database | `your_password`   |
| `JWT_SECRET`    | Rahasia Token     | `your_jwt_secret` |
| `JWT_EXPIRE`    | Kadaluarsa Token  | `7d`              |
| `EMAIL_ENABLED` | Aktifkan Email    | `false`           |

---

## Deployment Docker

Untuk menjalankan seluruh stack (Frontend, Backend, Database) menggunakan Docker:

```bash
# Build Development
docker-compose up -d

# Build Production
docker-compose -f docker-compose.prod.yml up -d

```

---

## 🚦 Endpoint API

### Autentikasi

* `POST /api/auth/register` - Registrasi pengguna baru
* `POST /api/auth/login` - Login pengguna
* `GET /api/auth/profile` - Dapatkan profil pengguna saat ini

### Booking

* `GET /api/bookings` - Dapatkan semua booking (Admin)
* `POST /api/bookings` - Buat booking baru
* `GET /api/bookings/my-bookings` - Dapatkan booking user yang sedang login
* `PUT /api/bookings/:id/status` - Perbarui status booking (Admin)

### Layanan & Barber

* `GET /api/services` - Daftar semua layanan
* `POST /api/services` - Tambah layanan (Admin)
* `GET /api/barbers` - Daftar semua barber
* `GET /api/barbers/:id/schedule` - Dapatkan jadwal barber tertentu

---

## Testing

Jalankan rangkaian tes otomatis yang terletak di `backend/tests`:

```bash
cd backend

# Jalankan semua tes
npm test

# Jalankan file tes tertentu
npm test -- auth.test.js

# Cek cakupan tes (coverage)
npm run test:coverage

```

---

## Kontribusi

1. Fork repository ini.
2. Buat branch fitur Anda (`git checkout -b feature/FiturKeren`).
3. Commit perubahan Anda (`git commit -m 'Menambahkan FiturKeren'`).
4. Push ke branch tersebut (`git push origin feature/FiturKeren`).
5. Buka Pull Request.

## Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT - lihat file [LICENSE](https://www.google.com/search?q=LICENSE) untuk detailnya.

## Ucapan Terima Kasih

* Ikon oleh [Font Awesome](https://fontawesome.com)
* Font oleh [Google Fonts](https://fonts.google.com)
* Grafik oleh [Chart.js](https://www.chartjs.org)

```

```