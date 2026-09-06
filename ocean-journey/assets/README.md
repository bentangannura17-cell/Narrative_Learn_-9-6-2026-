# Gambar Ocean Journey

Taruh berkas gambarmu **langsung di folder ini** dengan nama persis seperti di
tabel. Tidak ada yang perlu diubah di kode: begitu berkasnya ada, gambar itu
menggantikan pemandangan yang digambar kode. Kalau berkasnya tidak ada, gambar
bawaan tetap tampil — jadi situs tidak pernah rusak karena gambar belum siap.

Format yang dicoba berurutan: **`.jpg` → `.png` → `.webp`**. Yang pertama
ditemukan itulah yang dipakai.

## Slot yang tersedia

| Nama berkas | Ukuran | Isi | Transparan? |
|---|---|---|---|
| `langit.*`  | 3 layar × 1 layar | Langit, awan, matahari | boleh, PNG |
| `bukit.*`   | 3 layar × 1 layar | Punggungan jauh & Bukit Camar | **harus** PNG transparan |
| `pesisir.*` | 3 layar × 1 layar | Laut + tiga pulau | JPG penuh atau PNG transparan |
| `kapal.*`   | 1 layar × 1 layar | Kapal, tiang, layar | **harus** PNG transparan |

Ketiga lapis pertama bergerak dengan kecepatan berbeda saat layar digeser —
itulah yang memberi rasa jauh-dekat. `kapal` tidak bergerak sama sekali karena
kapal adalah tempat siswa berdiri.

**Kalau kamu hanya punya satu gambar panorama**, taruh saja sebagai
`pesisir.jpg` dan biarkan slot lain kosong. Hasilnya tetap benar, hanya
kedalaman berlapisnya yang hilang.

## Ukuran dalam piksel

"1 layar" = lebar layar HP. Rancanganmu memakai layar 6:18, jadi:

| Slot | Rasio | Ukuran disarankan | Ukuran maksimum wajar |
|---|---|---|---|
| `langit`, `bukit`, `pesisir` | 18:18 = **1:1** | 1800 × 1800 | 2400 × 2400 |
| `kapal` | 6:18 = **1:3** | 800 × 2400 | 1080 × 3240 |

## Pita aman — bagian ini penting

Gambar dipasang dengan `background-size: cover`. Artinya **lebarnya selalu pas
dan tidak pernah terpotong** — ini disengaja, karena kalau terpotong mendatar,
pulau akan bergeser keluar dari panelnya sendiri dan tombol mulai menunjuk
tempat yang salah.

Yang terpotong adalah **tingginya**, dari atas dan bawah sama banyak. Berapa
banyak tergantung layar siswa. Diukur langsung dari halaman ini:

| Layar siswa | Tinggi gambar yang terpotong |
|---|---|
| 6:18 (1:3) — rancanganmu | 0% |
| 9:20 — Android umum | 26% |
| 9:19.5 — iPhone 14/15 | 28% |
| 9:16 — HP lama | 41% |

Jadi: **taruh semua yang penting di pita tengah, yaitu 59% tinggi gambar.**
Untuk gambar 1800 px, itu baris 369–1431. Di luar pita itu isilah dengan
langit, laut, atau apa pun yang tidak masalah kalau hilang.

Kalau kamu lebih suka mempertahankan bagian bawah (misalnya garis cakrawala),
buka `style.css` dan tambahkan pada lapis yang bersangkutan:

```css
.layer--isles{ --foto-posisi: center 38%; }
```

## Ukuran berkas

Gambar selebar tiga layar itu besar. Siswa membukanya lewat data seluler, jadi:

- simpan JPG dengan kualitas 75–82, bukan 100
- **di bawah 400 KB per berkas** kalau bisa; 800 KB sudah terasa lambat
- `.webp` biasanya 30% lebih kecil dari `.jpg` pada mutu yang sama — kalau
  perangkat lunakmu bisa mengekspornya, taruh keduanya (yang `.jpg` jadi
  cadangan untuk peramban tua)

## Mencoba dulu

Folder `contoh/` berisi gambar uji bergaris ukur — bukan karya seni, hanya alat
untuk melihat mekanismenya bekerja dan mengukur pemotongan. Salin salah satunya
ke folder ini (satu tingkat di atas) untuk mencoba:

```bash
cp contoh/pesisir.jpg pesisir.jpg
```

Hapus lagi kalau sudah selesai mencoba.

---

## Gambar di dalam platform (bukan peta)

Folder ini juga dipakai oleh salah satu platform level 3. Namanya berbeda dari
slot peta di atas, dan aturannya juga berbeda — ini gambar biasa di dalam
halaman, bukan latar sepanjang rel.

| Berkas | Dipakai di | Isi |
|---|---|---|
| `nusa-timur-story.jpg` | Nusa Timur | Ilustrasi cerita mangrove tiga pulau |

Selama berkasnya belum ada, `script.js` Nusa Timur memasang placeholder rapi,
bukan ikon gambar rusak.
