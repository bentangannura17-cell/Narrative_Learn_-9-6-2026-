# Panel Guru — Narrative Learn

Situs pendamping guru untuk **memandu jalannya kegiatan** Narrative Learn.
HTML, CSS, dan JavaScript murni — tanpa framework, tanpa CDN, tanpa server,
tanpa satu pun permintaan jaringan.

```
teacher/
  index.html    kerangka tujuh tab
  style.css     token & tata letak (mengikuti bahasa rupa modul level 3)
  script.js     mesin panel
  data.js       daftar perjalanan + panduan langkah (runbook)
  kunci.js      kunci jawaban — DIBANGKITKAN, jangan disunting tangan
  favicon.svg
  tools/
    bangkitkan-kunci.js   pembangkit kunci.js

shared/
  teacher.js    kanal yang dibaca panel DAN ketujuh modul siswa
```

---

## Menjalankan

Panel **harus satu alamat (origin)** dengan situs siswa. Penyimpanan peramban
terikat pada satu asal, jadi panel di alamat lain tidak akan melihat satu pun
data siswa.

Dari folder `NarrativeLearn/`:

```sh
python3 -m http.server 8000
```

Lalu buka `http://localhost:8000/teacher/`.

Membuka lewat `file://` juga bisa, asalkan situs siswa dibuka lewat `file://`
yang sama — jangan dicampur dengan `http://`.

---

## Tujuh tab

| Tab | Isinya |
|---|---|
| **Persiapan** | Daftar periksa sebelum kelas (tiga butir kritis), kartu profil perjalanan, tombol mulai sesi. |
| **Panduan Langkah** | Runbook per perjalanan: aba-aba siap baca, tindakan guru, hal yang perlu diawasi, tombol gerbang menempel di langkahnya. Bisa dicetak. |
| **Kendali Kelas** | Kirim sinyal gerbang, baca progres tujuh perjalanan di perangkat ini, alat buka/hapus kunci. |
| **Pertanyaan** | Pertanyaan siswa dari tombol "Ask a question", diperbarui sendiri. |
| **Rekap Nilai** | Tempel kode hasil, ambil dari perangkat, tambah manual; tabel, ringkasan, ekspor CSV/JSON. |
| **Kunci Jawaban** | Kunci lengkap tiap perjalanan, dengan mode sembunyi dan cetak. |
| **Bantuan** | Pemasangan, kontrak data, batas yang perlu diketahui, PIN, bersih-bersih. |

Pintasan papan ketik: **1–7** melompat antar tab, **N** menandai langkah selesai.

---

## Data yang disentuh

Dibaca dari situs siswa:

| Kunci | Isi |
|---|---|
| `nl_student_v1` | `{name, class}` |
| `nl_questions_v1` | `[{module, page, text, at}]` |
| `oj_barat_v1` … `lake_singha_v1` | hasil tujuh perjalanan |

Ditulis panel:

| Kunci | Isi |
|---|---|
| `nl_teacher_gate_v1` | `{grant: 'wait-1' \| 'wait-2' \| 'lives', at}` |
| `nl_guru_sesi_v1` | sesi berjalan: kelas, langkah, centang |
| `nl_guru_rekap_v1` | daftar siswa dan nilainya |
| `nl_guru_pin_v1` | sidik PIN panel |
| `nl_guru_terjawab_v1` | penanda pertanyaan yang sudah dijawab |

Panel tidak pernah mengirim apa pun ke luar perangkat.

Ketiga hal yang dipakai bersama dengan sisi siswa — kontrak sinyal, kotak
pertanyaan, dan penyeragam bentuk hasil — tinggal di `shared/teacher.js`
(`NLTeacher`), bukan disalin di kedua sisi.

### Dua bentuk hasil

Enam modul menyimpan `{score, maxScore, stars, correct, total, livesUsed, attempts, completedAt}`.
**Bukit Camar** menyimpan `{score, outOf, chancesLeft, completedAt}` — tanpa bintang,
tanpa `attempts`. Perbedaan itu ada di kode siswa; `NLTeacher.normalHasil()` di
`shared/teacher.js` menyeragamkannya saat dibaca, jadi sisa panel tidak perlu
tahu bedanya.

### Kode hasil

Tombol "Salin kode hasil" di layar hasil **Nusa Selatan** menghasilkan base64 dari:

```json
{ "v": 1, "name": "…", "class": "…", "barat": {…}, "timur": {…}, "selatan": {…} }
```

Pembacanya di `script.js` juga menerima nama pendek modul Danau (`bukit`, `sunda`,
`muara`, `singha`), id modul penuh, nama kunci penyimpanan, dan JSON polos —
supaya kode versi mana pun tetap terbaca.

---

## Batas yang perlu diketahui

1. **Sinyal gerbang tidak menyeberang perangkat.** Ini sifat penyimpanan
   peramban, bukan kekurangan panel. Kendali sungguhan lintas perangkat butuh
   server kecil. Selama belum ada, aba-aba lisan sudah memadai — layar tunggu
   memang dirancang supaya siswa menoleh ke guru.

2. **Ketujuh modul memantau sinyal.** Dulu hanya Nusa Barat. Pemantaunya
   sekarang tinggal di `shared/teacher.js`, dimuat tiap modul satu baris
   sesudah script-nya sendiri — satu salinan, bukan tujuh. Kode pelajaran
   ketujuh modul tidak disunting: `Gate` dan `TeacherAPI` milik mereka
   dipanggil apa adanya dari kanal itu. Pemantau bawaan Nusa Barat dimatikan
   dari luar supaya satu sinyal tidak dikerjakan dua kali, dan sinyal yang
   lebih tua daripada saat halaman siswa dimuat diabaikan — siswa yang memuat
   ulang tidak melompati gerbangnya sendiri.

3. **`DEV_MODE` masih `true` di ketujuh modul siswa.** Selama itu menyala,
   gembok prasyarat dilewati dan tombol pelolos langkah tampil di layar siswa.
   Tombol itu juga memanggil `TeacherAPI.release()`, jadi siswa bisa membuka
   sendiri gerbang "tunggu guru" — matikan sebelum kendali kelas dipakai
   sungguhan.

4. **Folder `shared/` sudah lengkap.** `tokens.css`, `shell.css`, `hub.css`,
   `progress.js`, `hub.js`, dan `teacher.js` semuanya ada, jadi peta dan kedua
   hub berjalan. Panel tetap menyediakan tautan langsung ke tiap modul.

5. **PIN panel adalah penghalang, bukan pengamanan.** Siapa pun yang membuka
   `teacher/kunci.js` lewat alamatnya tetap bisa membaca kunci jawaban. Untuk
   pengamanan sungguhan, panel harus pindah ke alamat terpisah dengan otentikasi
   di sisi server.

---

## Menyunting isi

**Alur kelas berubah** → sunting `data.js` saja. Seluruh teks aba-aba, tindakan
guru, perkiraan waktu, dan daftar periksa ada di sana; `script.js` tidak menyimpan
satu pun teks kegiatan.

**Soal di modul siswa berubah** → jangan sunting `kunci.js` dengan tangan.
Jalankan dari folder `NarrativeLearn/`:

```sh
node teacher/tools/bangkitkan-kunci.js
```

Pembangkit membaca literal soal langsung dari `script.js` tiap modul, jadi kunci
tidak mungkin melenceng dari yang dinilai di layar siswa.
