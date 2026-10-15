# LLM GS · Ruang AI

Frontend React 19 + Vite dan backend Python FastAPI dipisahkan dalam dua folder.

```text
LLM_GS/
├── backend/
│   ├── auth.py
│   ├── database.py
│   ├── main.py
│   ├── model.py
│   ├── server.py
│   ├── user.py
│   ├── requirements.txt
│   ├── tests/
│   ├── .env.example
│   ├── .env                 # lokal, tidak di-commit
│   └── notsolusindo.db
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

Alur pengembangan: browser → React/Vite (`5173`) → FastAPI (`3142`) → Ollama (`11434`).

## Backend

Gunakan Python 3.10+. Dari root proyek:

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Jika belum memiliki `backend/.env`, salin contoh berikut (jangan menimpa `.env` yang sudah ada):

```sh
cp .env.example .env
```

Ganti `SECRET_KEY` dengan nilai acak yang kuat. File `.env` lama pada proyek ini sudah dipindahkan ke `backend/.env`. Database lama juga dipindahkan ke `backend/notsolusindo.db`, sehingga akun yang ada tetap tersedia. Keduanya dibaca berdasarkan lokasi file Python, bukan direktori terminal.

Jalankan dari folder `backend`:

```sh
python server.py
```

API: `http://localhost:3142`, dokumentasi: `http://localhost:3142/docs`.
Dari root juga bisa menjalankan `python backend/server.py` dengan virtual environment aktif.

Jika virtual environment lama masih berada di root, gunakan `source .venv/bin/activate` dari root lalu `python backend/server.py`. Tidak perlu memindahkan virtual environment tersebut.

## Ollama dan akun

Pastikan Ollama berjalan di komputer backend (`ollama serve` jika belum aktif). Di terminal lain:

```sh
ollama pull deepseek-r1:7b
```

Gunakan akun yang sudah ada. Untuk membuat akun, jalankan dari `backend` dengan virtual environment aktif:

```sh
python -c "from getpass import getpass; from database import init_db, create_user; init_db(); print('Berhasil' if create_user(input('Username: '), getpass('Password: ')) else 'Username sudah ada')"
```

Registrasi publik belum tersedia.

## Frontend

Gunakan Node.js 22.12+ atau 24. Buka terminal kedua, dari root proyek:

```sh
cd frontend
npm ci
npm run dev
```

Buka URL Vite (default `http://localhost:5173`). Proxy Vite meneruskan `/user` dan `/model` ke FastAPI di port `3142`. Kedua server harus berjalan. Login, lalu kirim pesan untuk mencoba LLM.

## Build

Dari root proyek:

```sh
npm --prefix frontend run build
```

Hasil build berada di `frontend/dist/`. Untuk menjalankan hasil build melalui FastAPI, jalankan atau restart backend setelah build lalu buka `http://localhost:3142`. Fasilitas ini opsional; source React dan Python tetap terpisah.

## Pengujian

Dari `backend` dengan virtual environment aktif:

```sh
pip install httpx
python -m unittest discover -s tests -v
```

Tes memakai mock Ollama dan verifikasi login; tidak membutuhkan model aktif atau mengubah akun database proyek.

## Perilaku aplikasi

- Login JWT, logout, percakapan baru, sidebar percakapan, saran prompt, status loading, dan pesan error.
- Token dan percakapan berada dalam memori tab. Refresh menghapus sesi/riwayat; logout membersihkannya.
- JWT berlaku 15 menit. Masuk kembali jika kedaluwarsa.
- Setiap request mengirim hingga 40 pesan sebelumnya; riwayat antarpercakapan tidak dicampur.
- Balasan berupa teks biasa, tanpa mengeksekusi HTML model.
- Font Google opsional; tersedia fallback sans-serif.

## Git

Jalankan Git dari root proyek. `.env`, `.venv/`, `node_modules/`, dan `dist/` diabaikan. Commit mencakup folder `backend/` dan `frontend/` beserta dokumentasi.
