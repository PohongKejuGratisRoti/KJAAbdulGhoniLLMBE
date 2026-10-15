# LLM GS · Ruang AI

Frontend React 19 + Vite dengan backend FastAPI, autentikasi JWT, dan Ollama DeepSeek R1 7B.

## Menjalankan backend

Gunakan Python 3.10+ dan Node.js 22.12+ atau 24.

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Atur `SECRET_KEY` di `.env` pada root proyek (gunakan nilai acak yang kuat). Jangan commit file ini.
Pastikan Ollama berjalan, lalu siapkan model:

```sh
ollama pull deepseek-r1:7b
```

Gunakan akun database yang sudah ada. Untuk membuat akun baru secara lokal:

```sh
python - <<'PY'
from getpass import getpass
from database import init_db, create_user
init_db()
print('Berhasil' if create_user(input('Username: '), getpass('Password: ')) else 'Username sudah ada')
PY
```

Jalankan dari root proyek agar path database dan `.env` benar:

```sh
python server.py
```

API tersedia di `http://localhost:3142`, dokumentasi di `/docs`.

## Frontend saat pengembangan

Dari terminal kedua:

```sh
cd frontend
npm install
npm run dev
```

Buka URL yang ditampilkan Vite (default `http://localhost:5173`). Vite meneruskan `/user` dan `/model` ke backend port 3142. Login menggunakan akun yang tersedia, kemudian kirim pesan.

## Build frontend untuk FastAPI

```sh
cd frontend
npm run build
cd ..
python server.py
```

Buka `http://localhost:3142`. Restart backend setelah build pertama agar aset terpasang.

## Perilaku aplikasi

- Login JWT, logout, percakapan baru, beralih percakapan, saran prompt, status loading, dan penanganan error.
- Token dan percakapan disimpan dalam memori tab. Refresh menghapus sesi/riwayat; logout membersihkannya.
- Sesi JWT berlaku 15 menit; jika kedaluwarsa, masuk kembali untuk melanjutkan.
- Setiap permintaan mengirim hingga 40 pesan sebelumnya; backend tidak lagi mencampur riwayat pengguna dalam list global.
- Balasan ditampilkan sebagai teks biasa (termasuk kode/Markdown), tanpa mengeksekusi HTML model.
- Registrasi publik belum tersedia; akun dibuat pengelola melalui database.
- Font Google bersifat opsional; browser memakai font sans-serif jika tidak tersedia.

## Pemeriksaan backend

```sh
pip install httpx
python -m unittest discover -s tests
```

Pengujian memakai mock Ollama dan autentikasi/database sementara; tidak membutuhkan model aktif atau mengubah database proyek.
