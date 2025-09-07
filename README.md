# HabitTracker — Modern Habit Tracker

<!-- Tech stack badges -->
[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white&style=flat-square)](https://nextjs.org) 
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev) 
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com) 
[![Golang](https://img.shields.io/badge/Go-00ADD8?logo=go&logoColor=white&style=flat-square)](https://golang.org) 
[![GORM](https://img.shields.io/badge/GORM-2F4F4F?logo=gorm&logoColor=white&style=flat-square)](https://gorm.io) 
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white&style=flat-square)](https://www.mysql.com)

Sebuah aplikasi sederhana untuk melacak kebiasaan (habits), mencatat completion harian, dan melihat statistik.

<!-- ![Screenshot](./public/placeholder.jpg) -->

## Fitur utama
- Autentikasi (register / login)
- CRUD Habits (buat, ubah, hapus)
- Catatan harian (habit logs)
- Kategori untuk habit
- Statistik: completion rate, trend, breakdown per kategori
- UI modern dengan navigasi dan tema (dark/light)

## Tech stack
- Frontend: Next.js (App Router), React, Tailwind CSS
- Backend: Golang (Gin), GORM (MySQL / MariaDB)
- Persistance: MySQL / MariaDB (via GORM)

## Struktur proyek (singkat)

- `app/` - Next.js app (frontend)
- `components/` - React components
- `hooks/` - React Query hooks dan helpers
- `backend/` - Go API server (handlers, models, database)
- `public/` - static assets (gambar)

## Persiapan (prasyarat)
- Node.js (v16+)
- pnpm / npm
- Go (1.20+)
- MySQL atau MariaDB (atau gunakan docker)

## Environment variables

Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Backend (contoh, di environment atau .env sebelum menjalankan)

```
PORT=8080
JWT_SECRET=your_jwt_secret_here
DB_DSN=user:password@tcp(127.0.0.1:3306)/habit_tracker?parseTime=true
```

Pastikan database sudah dibuat dan `DB_DSN` sesuai.

## Menjalankan secara lokal

1) Jalankan backend (dari folder `backend`):

```powershell
cd c:\xampp\htdocs\belajar-react\habit-tracker\backend
go run main.go
```

2) Jalankan frontend (dari root project):

```powershell
cd c:\xampp\htdocs\belajar-react\habit-tracker
npm install
npm run dev
```

Frontend default berjalan di `http://localhost:3000` dan backend di `http://localhost:8080` (atau sesuai `PORT`).

## Build & Production

Frontend:

```powershell
npm run build
npm start
```

Backend: buat build binary Go atau jalankan `go run main.go` pada server produksi setelah konfigurasi env.

## API Singkat

- POST /api/auth/register — register user
- POST /api/auth/login — login user
- GET /api/auth/profile — profile
- GET /api/habits — list habits
- POST /api/habits — create habit
- PUT /api/habits/:id — update habit
- DELETE /api/habits/:id — delete habit
- POST /api/habits/:id/log — create habit log
- GET /api/habits/:id/logs — get habit logs
- GET /api/categories — list categories
- POST /api/categories — create category

Pastikan menambahkan header `Authorization: Bearer <token>` pada request yang butuh otentikasi.

## Tips performance & debugging
- Di development Next.js, navigasi pertama ke route bisa terasa lambat karena compile-on-demand. Build production untuk menguji performa nyata.
- Gunakan React Query devtools untuk debugging cache/invalidations.
- Periksa console/network untuk 401/500 ketika API gagal.

## Menambahkan screenshot
Letakkan screenshot di `public/screenshots/` dan sertakan di README seperti:

```md
![Dashboard screenshot](/public/screenshots/dashboard.png)
```

## Kontribusi
- Fork repo, buat branch fitur, push, dan buka pull request. Sertakan deskripsi singkat dan testing steps.

## Lisensi
MIT
