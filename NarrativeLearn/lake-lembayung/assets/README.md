# Gambar The Lake of Lembayung

Taruh berkas gambarmu **langsung di folder ini** dengan nama persis seperti di
tabel. Tidak ada yang perlu diubah di kode: begitu berkasnya ada, gambar itu
menggantikan pemandangan yang digambar kode. Kalau berkasnya tidak ada, gambar
bawaan tetap tampil.

Format yang dicoba berurutan: **`.jpg` → `.png` → `.webp`**.

## Slot yang tersedia

| Nama berkas | Ukuran | Isi | Transparan? |
|---|---|---|---|
| `langit.*`  | 2 layar × 1 layar | Langit senja di baris atas | boleh |
| `puncak.*`  | 1 layar × 1 layar | Pandangan dari puncak menara: Bukit Camar di kanan, Sunda Kelapa di kiri, danau di antaranya | JPG penuh |
| `atap.*`    | 2 layar × 1 layar | Pandangan dari atap rumah: Singhasari di separuh kiri, Muara Jati di separuh kanan | JPG penuh |
| `genting.*` | 2 layar × pita bawah | Genting atap tempat siswa berdiri | boleh |

**`atap` selebar dua layar dan dipakai bersama** oleh Muara Jati dan
Singhasari. Itu memang satu pemandangan utuh: menggeser di baris bawah bukan
berpindah tempat berdiri, hanya menoleh. Jadi jangan membuatnya sebagai dua
gambar terpisah — sambungannya akan terlihat.

Pastikan **Sunda Kelapa TIDAK terlihat** di gambar `atap`: dari ketinggian atap
rumah ia sudah tertutup lengkung bumi. Itu bagian dari cerita turunnya.

## Ukuran dalam piksel

"1 layar" = lebar layar HP, dengan rancangan layar 6:18:

| Slot | Rasio | Ukuran disarankan | Ukuran maksimum wajar |
|---|---|---|---|
| `puncak` | 6:18 = **1:3** | 800 × 2400 | 1080 × 3240 |
| `langit`, `atap` | 12:18 = **2:3** | 1600 × 2400 | 2160 × 3240 |
| `genting` | 12 : pita bawah | 1600 × 360 | 2160 × 480 |

## Pita aman — bagian ini penting

Gambar dipasang dengan `background-size: cover`: **lebarnya selalu pas dan
tidak pernah terpotong**, karena kalau terpotong mendatar, desa akan bergeser
keluar dari petaknya dan tombol mulai menunjuk tempat yang salah.

Yang terpotong adalah **tingginya**, dari atas dan bawah sama banyak:

| Layar siswa | Tinggi gambar yang terpotong |
|---|---|
| 6:18 (1:3) — rancanganmu | 0% |
| 9:20 — Android umum | 26% |
| 9:19.5 — iPhone 14/15 | 28% |
| 9:16 — HP lama | 41% |

**Taruh semua yang penting di pita tengah, yaitu 59% tinggi gambar.**

Untuk menggeser bagian mana yang dipertahankan, tambahkan di `style.css`:

```css
.scene--atap .scene__art{ --foto-posisi: center 60%; }
```

## Ukuran berkas

- JPG kualitas 75–82, **di bawah 400 KB per berkas** kalau bisa
- `.webp` biasanya 30% lebih kecil pada mutu yang sama

## Mencoba dulu

Folder `contoh/` berisi gambar uji bergaris ukur. Salin ke folder ini untuk
mencoba:

```bash
cp contoh/puncak.jpg puncak.jpg
cp contoh/atap.jpg   atap.jpg
```
