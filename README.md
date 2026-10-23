# Waluku — Sales Commission Sheet

Aplikasi web untuk mencatat hasil campaign tiap sales, menghitung revenue/komisi secara otomatis, dan mengekspor laporan ke **PDF hitam-putih**.

Contoh isi tabel yang didukung (sama seperti spreadsheet referensi):

| CAMPAIGN     | CLICKS | SALES | REVENUE |
| ------------ | -----: | ----: | ------: |
| **TOTAL**    |    110 |    10 |    $300 |
| GARONG(Enda) |     50 |     3 |     $90 |
| GARONG(Asep) |     50 |     6 |    $180 |
| GARONG(Udin) |     10 |     1 |     $30 |

## Fitur

- Input baris campaign: produk/campaign dan nama sales ditulis terpisah, ditampilkan sebagai `GARONG(Enda)`.
- **Revenue otomatis** = jumlah sales × rate per sale. Mengubah rate langsung menghitung ulang semua baris dan total.
- Baris **TOTAL** selalu di paling atas: total clicks, sales, dan revenue.
- Menu **Configuration**: rate per sale (default 30), mata uang (USD/IDR), judul laporan, dan periode.
- Tambah/hapus baris, data contoh sekali klik, dan reset sheet.
- **Export PDF** langsung terunduh: A4, tabel + total, teks dan garis hitam, latar putih (tanpa warna).
- Data tersimpan otomatis di `localStorage` browser, jadi tetap ada setelah halaman di-refresh.

## Teknologi

- [Next.js 16](https://nextjs.org/) (App Router, TypeScript, Turbopack)
- React 19
- Tailwind CSS v4
- jsPDF + jspdf-autotable untuk PDF di sisi browser
- Node.js sebagai runtime

## Prasyarat

- **Node.js 20.9 atau lebih baru** (disarankan Node.js 22/24 LTS). Cek dengan:
  ```bash
  node -v
  npm -v
  ```
- Koneksi internet saat `npm install` pertama kali.

## Instalasi

Jalankan di folder project:

```bash
npm install
```

## Menjalankan (development)

```bash
npm run dev
```

Buka <http://localhost:3000> di browser.

Jika port 3000 sedang dipakai:

```bash
npm run dev -- -p 3001
```

lalu buka <http://localhost:3001>.

## Build & menjalankan versi production

```bash
npm run build
npm start
```

Buka <http://localhost:3000>. Hentikan server dengan `Ctrl + C`.

Perintah lain:

```bash
npm run typecheck   # cek TypeScript tanpa build
```

## Cara pakai

1. **Isi tabel**
   - Kolom **Campaign**: tulis produk (mis. `GARONG`) dan nama sales (mis. `Enda`) pada dua isian di sel yang sama.
   - Kolom **Clicks** dan **Sales**: angka non-negatif. Klik isian untuk langsung memilih angkanya.
   - Kolom **Revenue** dihitung otomatis dan tidak bisa diedit.
   - Klik **Add row** untuk menambah baris. Tombol tempat sampah menghapus baris (klik sekali lagi untuk konfirmasi).
2. **Atur rate komisi**
   - Klik **Configuration**.
   - Isi **Rate per sale** — misalnya `30` berarti setiap 1 sale bernilai $30.
   - Pilih **Currency** (USD atau IDR), lalu atur **Report title** dan **Period** (periode hanya informasi di PDF).
   - Klik **Save changes**. Semua revenue dan total langsung dihitung ulang.
   - Di dialog yang sama tersedia **Load example data** (mengisi ulang data contoh) dan **Clear sheet** (mengosongkan semua baris).
3. **Export PDF**
   - Klik **Export PDF**. File `sales-commission-YYYY-MM-DD.pdf` langsung terunduh.
   - PDF berformat A4 portrait, hitam-putih murni, berisi judul, periode, rate per sale, dan tabel dengan baris TOTAL.
   - Jika browser memblokir unduhan, izinkan unduhan untuk alamat aplikasi ini.
4. **Penyimpanan**
   - Data disimpan di browser (key `waluku.sales-sheet.v1`), bukan di server.
   - Data akan hilang jika Anda menghapus data situs, memakai mode incognito, atau berganti browser/perangkat.
   - **Clear sheet** hanya mengosongkan baris; pengaturan tetap tersimpan sampai diubah lagi.

## Struktur project

```
app/
  layout.tsx          # root layout + metadata
  page.tsx            # halaman utama
  globals.css         # Tailwind + token warna
components/
  SalesSheet.tsx      # state, penyimpanan, ringkasan, toolbar
  SalesTable.tsx      # tabel editable + baris TOTAL
  SettingsDialog.tsx  # menu Configuration
lib/
  calc.ts             # perhitungan dan format angka/mata uang
  storage.ts          # localStorage, default, data contoh
  pdf.ts              # pembuatan PDF hitam-putih
  types.ts            # tipe bersama
```

## Rumus

- `Revenue baris = sales × rate per sale`
- `Total revenue = Σ revenue baris` (setara dengan total sales × rate)
- `Total clicks` dan `Total sales` adalah penjumlahan seluruh baris.

Contoh data bawaan: rate `$30`, sales 3 + 6 + 1 = 10 → total revenue **$300**.

## Troubleshooting

| Masalah | Solusi |
| --- | --- |
| `next: not found` atau versi Node error | Pastikan Node.js ≥ 20.9, lalu jalankan `npm install` ulang. |
| Port 3000 sudah dipakai | `npm run dev -- -p 3001` (atau `npm start -- -p 3001`). |
| Data kembali ke contoh setelah refresh | Penyimpanan browser diblokir/incognito, atau data situs dihapus. |
| PDF tidak terunduh | Izinkan download di browser, lalu klik Export PDF lagi. |
| Ingin mulai dari nol | Configuration → **Clear sheet** (atau **Load example data** untuk data contoh). |
| Perlu membuka dari HP/perangkat lain | Jalankan `npm run dev -- -H 0.0.0.0`, lalu akses `http://IP-komputer:3000`. Data tetap terpisah per browser. |
