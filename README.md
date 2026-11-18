# EOA Community V5 — WhatsApp Edition

Versi ini mempertahankan desain dan fitur visual EOA Community V5, dengan alur pendaftaran yang dialihkan langsung ke WhatsApp.

## Perubahan dari versi Supabase
- Supabase SDK, `config.js`, dan `database.sql` dihapus.
- Tidak ada login, password, atau akun anggota di website.
- Form pendaftaran meminta nama, kota/daerah, dan minat (opsional), lalu membuka WhatsApp dengan pesan yang sudah disusun.
- Nomor tujuan WhatsApp: `+62 856-0059-9514`.
- Tidak ada database anggota bersama. Data baru diterima pengelola melalui percakapan WhatsApp.

## Fitur V5 yang dipertahankan
- Workspace/dashboard, navigasi sidebar, halaman anggota, pengumuman, dan profil owner.
- Observatorium tata surya dengan kontrol jeda, zoom, dan kecepatan orbit.
- Embed playlist Spotify resmi.
- Mode terang/gelap, suara antarmuka, animasi, dan tampilan responsif.

## Deploy ke GitHub + Vercel
1. Ekstrak ZIP.
2. Upload seluruh isi folder ini ke root repository GitHub (jangan upload folder pembungkusnya).
3. Pastikan `index.html`, `style.css`, `script.js`, dan `eoa-logo.svg` berada langsung di root.
4. Commit changes. Vercel akan menjalankan deployment statis otomatis.

Catatan: pengaturan tema, suara, playlist Spotify, dan beberapa preferensi disimpan di browser perangkat masing-masing. Tanpa backend, perubahan tersebut tidak tersinkron antarperangkat. Pengumuman yang tampil merupakan konten contoh statis.
