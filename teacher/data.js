/* ============================================================
   NarrativeLearn · Platform Guru — data.js
   ------------------------------------------------------------
   Satu-satunya tempat menyimpan PENGETAHUAN tentang kegiatan:
   daftar perjalanan, kontrak penyimpanan, dan panduan langkah
   (runbook) yang dibacakan guru di kelas.

   script.js tidak menyimpan satu pun teks kegiatan.

   ALAMAT BERKAS TIDAK ADA DI SINI. Nama berkas tiap platform
   level 3 pernah berubah sekali dan setiap salinan alamat yang
   tersebar ikut putus; sekarang alamatnya cuma ditulis di
   shared/teacher.js dan diambil lewat NLTeacher.jalur(id). Kalau alur
   kelas berubah, yang disunting hanya berkas ini.

   ------------------------------------------------------------
   KONTRAK PENYIMPANAN (dibaca dari situs siswa, satu origin)
   ------------------------------------------------------------
   nl_student_v1       {name, class}
   nl_questions_v1     [{module, page, text, at}]
   nl_teacher_gate_v1  {grant:'wait-1'|'wait-2'|'lives', at}
   <kunci modul>       hasil satu perjalanan — DUA bentuk:
     a. enam modul  {v,status,score,maxScore,stars,correct,total,
                     revealed?,livesUsed,attempts,completedAt}
     b. Bukit Camar {v,status,score,outOf,chancesLeft,completedAt}
   Perbedaan bentuk (b) itu nyata di kode siswa, bukan salah
   ketik — script.js menormalkannya saat membaca.
   ============================================================ */

var GURU_DATA = {

  /* ---------- Dua dunia (level 2) ---------- */
  dunia: {
    ocean: { nama: 'Ocean Journey',        warna: '#1d6a86' },
    lake:  { nama: 'The Lake of Lembayung', warna: '#6b4a86' }
  },

  /* ---------- Berkas materi yang harus ada sebelum kelas ---------- */
  /* Diambil dari <video src> dan <source src> tiap modul. Kalau
     berkasnya belum diunggah, layar video siswa tampil kosong dan
     seluruh kelas berhenti di situ. */
  aset: {
    oj_barat:    ['ocean-journey/nusa-barat/video/materi-nusa-barat.mp4'],
    oj_timur:    ['ocean-journey/nusa-timur/video/materi-nusa-timur.mp4'],
    oj_selatan:  ['ocean-journey/nusa-selatan/video/materi-nusa-selatan.mp4'],
    lake_bukit:  ['lake-lembayung/bukit-camar/video/bukit-camar-review.mp4',
                  'lake-lembayung/bukit-camar/gambar/ (9 gambar paragraf)'],
    lake_sunda:  ['lake-lembayung/sunda-kelapa/assets/materi/video-materi.mp4'],
    lake_muara:  ['lake-lembayung/muara-jati/video/muara-jati-video.mp4'],
    lake_singha: ['lake-lembayung/singhasari/video/materi-singhasari.mp4']
  },

  /* ---------- Tujuh perjalanan (level 3), berurutan ---------- */
  modul: [
    {
      id: 'oj_barat', kunci: 'oj_barat_v1', prasyarat: null,
      dunia: 'ocean', urutan: 1,
      nama: 'Nusa Barat',
      fokus: 'Genre dan struktur teks naratif',
      langkah: 13, nyawa: 7, skorMaks: 130,
      bentuk: 'penuh',
      alur: ['welcome-1', 'welcome-2', 'wait-1', 'video', 'wait-2', 'steps', 'result'],
      gerbang: ['wait-1', 'wait-2', 'lives'],
      penilaian:
        '13 langkah: 3 label bagian cerita + 10 soal kuis. Benar tanpa salah = 1 poin. ' +
        'Setelah DUA kali salah di satu langkah, jawaban benar ditunjukkan dan langkah itu ' +
        'dihitung 0,5. Tidak ada lulus/gagal. Nyawa 7 — tiap salah kurang satu; habis berarti ' +
        'siswa berhenti di layar tunggu sampai guru memulihkannya.',
      hasilnya: 'Nusa Barat punya tombol "Salin hasil" (teks biasa). Kode hasil gabungan baru ' +
        'muncul di Nusa Selatan, jadi di sesi ini cukup catat skornya dari layar siswa.',
      runbook: [
        { m: 5, judul: 'Pembukaan dan pengondisian',
          aba: 'Hari ini kita masuk ke Narrative Learn. Kalian akan menyeberangi samudra — perjalanan pertama namanya Nusa Barat. Buka alamat situsnya dulu, jangan ditekan apa-apa sebelum saya minta.',
          guru: ['Tulis alamat situs di papan.',
                 'Pastikan semua perangkat menyala, terang layar cukup, dan suara menyala untuk video.',
                 'Ingatkan: satu perangkat satu siswa — progres disimpan di perangkat itu sendiri.'],
          awas: ['Kalau ada siswa memakai mode penyamaran/incognito, progresnya hilang saat tab ditutup.'] },

        { m: 4, judul: 'Isi nama dan kelas',
          aba: 'Layar pertama menanyakan nama. Tulis nama lengkap dan kelas kalian, apa adanya. Nama ini yang saya pakai untuk mengenali hasil kalian nanti.',
          guru: ['Tunggu sampai semua sudah lewat dari layar identitas.',
                 'Sebutkan format kelas yang seragam, misalnya "XI IPA 2", supaya rekap nanti rapi.'],
          awas: ['Tombol "Lewati untuk sekarang" tidak menyimpan apa pun — hasil siswa itu jadi tanpa nama. Minta semua mengisi.'] },

        { m: 3, judul: 'Menyusuri peta ke Ocean Journey',
          aba: 'Peta bisa digeser ke kiri dan ke kanan. Geser ke kiri, cari samudra, lalu ketuk kartu Ocean Journey. Di dalamnya pilih kartu nomor satu: Nusa Barat.',
          guru: ['Tampilkan peta di proyektor sambil menerangkan.',
                 'Tiga titik di bawah layar bisa dipakai melompat kalau ada siswa tersesat.'],
          awas: ['Perjalanan kedua dan ketiga masih terkunci — itu memang benar, bukan kerusakan.'] },

        { m: 4, judul: 'Dua layar sambutan',
          aba: 'Baca dua layar sambutan sampai habis. Di situ dijelaskan apa yang akan kalian kerjakan dan berapa nyawa yang kalian punya.',
          guru: ['Terangkan aturan nyawa: 7 nyawa, tiap jawaban salah berkurang satu.',
                 'Tegaskan tidak ada lulus atau gagal — yang dinilai prosesnya.'],
          awas: [] },

        { m: 6, judul: 'GERBANG 1 — kelas menunggu guru', kunciAlur: 'wait-1',
          aba: 'Berhenti di layar ini. Sebelum videonya jalan, kita bahas dulu: apa itu teks naratif, dan tiga bagiannya — orientation, complication, resolution.',
          guru: ['Jelaskan tiga bagian teks naratif di papan (5 menit cukup).',
                 'Minta dua contoh cerita rakyat dari siswa, bongkar bagiannya bersama.',
                 'Setelah selesai, buka gerbangnya.'],
          awas: ['Semua siswa harus sudah sampai di layar tunggu sebelum gerbang dibuka.'],
          aksi: { sinyal: 'wait-1', label: 'Buka video untuk kelas' } },

        { m: 8, judul: 'Video materi',
          aba: 'Tonton videonya sampai habis. Boleh dijeda kalau ada yang mau dicatat, tapi jangan dilewati.',
          guru: ['Pantau: layar siswa harus menampilkan pemutar video, bukan kotak kosong.',
                 'Kalau kotaknya kosong, berkas video belum diunggah — putar dari proyektor sebagai gantinya.'],
          awas: ['Video yang selesai otomatis membawa siswa ke gerbang kedua.'] },

        { m: 5, judul: 'GERBANG 2 — cek pemahaman', kunciAlur: 'wait-2',
          aba: 'Sebelum aktivitas, saya tanya cepat: bagian mana yang memperkenalkan tokoh? Bagian mana yang menghadirkan masalah?',
          guru: ['Ajukan 2–3 pertanyaan lisan ke siswa yang berbeda.',
                 'Terangkan aturan aktivitas: setelah dua kali salah, jawaban benar ditunjukkan dan langkah itu dihitung setengah.',
                 'Baru buka gerbangnya.'],
          awas: [],
          aksi: { sinyal: 'wait-2', label: 'Mulai aktivitas' } },

        { m: 12, judul: 'Aktivitas · 3 blok cerita',
          aba: 'Baca satu blok, lalu tentukan: ini orientation, complication, atau resolution. Kalau ragu, cari kalimat pembukanya — biasanya di situ petunjuknya.',
          guru: ['Berkeliling. Jangan menyebut jawaban; tunjuk kalimat kuncinya saja.',
                 'Blok 2 dibuka dengan "But in the last few years…" — penanda complication yang paling jelas.'],
          awas: ['Kalau banyak yang salah di blok yang sama, hentikan sebentar dan bahas bersama.'] },

        { m: 15, judul: 'Aktivitas · Kuis 10 soal',
          aba: 'Sepuluh soal terakhir. Tombol Next aktif begitu satu soal dijawab, benar atau salah, jadi kalian tidak akan tertahan.',
          guru: ['Pantau papan pertanyaan di panel ini — siswa bisa bertanya tanpa mengangkat tangan.',
                 'Siapkan tombol "Pulihkan nyawa" untuk siswa yang kehabisan.'],
          awas: ['Soal 7 (abrasion) dan soal 8 (brackish) paling sering meleset — dua kosakata baru.'] },

        { m: 5, judul: 'Layar hasil',
          aba: 'Layar hasil menunjukkan berapa langkah yang kalian selesaikan dan berapa nyawa tersisa. Tekan "Salin hasil", lalu tunjukkan ke saya.',
          guru: ['Catat skor di panel Rekap, atau minta siswa menempel hasilnya di grup kelas.',
                 'Perjalanan kedua (Nusa Timur) otomatis terbuka setelah ini.'],
          awas: [] },

        { m: 5, judul: 'Refleksi dan penutup',
          aba: 'Satu kalimat saja: bagian cerita mana yang paling sulit kalian kenali, dan kenapa?',
          guru: ['Kumpulkan 3–4 jawaban lisan.',
                 'Umumkan perjalanan berikutnya: Nusa Timur — bahasa dan penanda waktu.',
                 'Ingatkan siswa memakai perangkat yang sama di pertemuan berikutnya.'],
          awas: ['Progres tersimpan per perangkat. Ganti perangkat berarti mulai dari nol.'] }
      ]
    },

    {
      id: 'oj_timur', kunci: 'oj_timur_v1', prasyarat: 'oj_barat_v1',
      dunia: 'ocean', urutan: 2,
      nama: 'Nusa Timur',
      fokus: 'Bahasa: penanda waktu, kata kerja, dan dialog',
      langkah: 19, nyawa: 7, skorMaks: 190,
      bentuk: 'penuh',
      alur: ['welcome-1', 'welcome-2', 'wait-1', 'video', 'wait-2', 'markers', 'quotes', 'quiz', 'result'],
      gerbang: ['wait-1', 'wait-2', 'lives'],
      penilaian:
        '19 langkah: 6 penanda waktu + 6 kutipan "Who says it?" + 7 soal kuis. ' +
        'Di Activity 1, dua kali salah membuat satu penanda langsung ditandai dan dihitung 0,5. ' +
        'Nyawa 7 dipakai bersama seluruh aktivitas.',
      hasilnya: 'Ada tombol "Salin hasil" berupa teks. Kode hasil gabungan Ocean Journey baru terbit di Nusa Selatan.',
      runbook: [
        { m: 4, judul: 'Pembukaan dan cek prasyarat',
          aba: 'Perjalanan kedua. Yang belum menyelesaikan Nusa Barat, kartunya masih terkunci — datang ke saya.',
          guru: ['Buka panel Progres untuk melihat siapa yang belum tuntas di perangkat ini.',
                 'Siswa yang tertinggal: dampingi menyelesaikan Nusa Barat, atau pasangkan dengan teman.'],
          awas: ['Kunci berurutan itu disengaja. Jangan dibuka paksa kecuali memang perlu.'] },

        { m: 4, judul: 'Dua layar sambutan',
          aba: 'Hari ini fokusnya bahasa: kata-kata yang menunjukkan WAKTU, dan siapa yang mengucapkan sebuah kalimat.',
          guru: ['Ingatkan cerita Nusa Barat masih cerita yang sama — hanya lensanya berganti.'],
          awas: [] },

        { m: 6, judul: 'GERBANG 1 — kelas menunggu guru', kunciAlur: 'wait-1',
          aba: 'Berhenti dulu. Kita bahas apa itu time marker: kata atau frasa yang memberi tahu KAPAN sesuatu terjadi.',
          guru: ['Tulis contoh di papan: "For many years", "One day", "A few months later".',
                 'Tulis juga pengecohnya: "Every afternoon", "many times", "slowly" — keterangan, tapi bukan penanda urutan waktu cerita.',
                 'Baru buka gerbangnya.'],
          awas: ['Perbedaan penanda waktu dan keterangan cara adalah sumber kesalahan terbesar di modul ini.'],
          aksi: { sinyal: 'wait-1', label: 'Buka video untuk kelas' } },

        { m: 8, judul: 'Video materi',
          aba: 'Tonton sampai habis.',
          guru: ['Pastikan berkas video sudah ada; kalau tidak, putar dari proyektor.'],
          awas: [] },

        { m: 5, judul: 'GERBANG 2 — cek pemahaman', kunciAlur: 'wait-2',
          aba: 'Sebut satu penanda waktu dari video tadi. Satu orang satu.',
          guru: ['Kumpulkan 4–5 jawaban cepat.', 'Buka gerbangnya.'],
          awas: [],
          aksi: { sinyal: 'wait-2', label: 'Mulai aktivitas' } },

        { m: 12, judul: 'Activity 1 · Enam penanda waktu',
          aba: 'Ketuk kata atau frasa di cerita yang menunjukkan waktu. Ada enam. Yang mirip tapi bukan penanda waktu sengaja dipasang untuk menguji kalian.',
          guru: ['Jangan sebut jawabannya. Arahkan: "Baca ulang paragraf dua, kalimat pertama."',
                 'Kunci jawabannya ada di panel Kunci Jawaban kalau ada siswa yang benar-benar buntu.'],
          awas: ['Dua kali salah di satu penanda: penanda itu langsung ditandai dan dihitung setengah.'] },

        { m: 12, judul: 'Activity 2 · Who says it?',
          aba: 'Enam kutipan, satu per layar. Tentukan siapa yang mengucapkannya. Konteks di bawah kutipan adalah petunjuk utama.',
          guru: ['Empat pilihan penutur: Grandpa Bahri, Mutiara, orang Nusa Timur, orang Nusa Selatan.',
                 'Ingatkan membaca baris konteksnya — di situ letak jawabannya.'],
          awas: [] },

        { m: 14, judul: 'Activity 3 · Kuis 7 soal',
          aba: 'Tujuh soal penutup. Gabungan penanda waktu, kata kerja, dan dialog.',
          guru: ['Pantau papan pertanyaan.', 'Pulihkan nyawa siswa yang kehabisan.'],
          awas: [] },

        { m: 5, judul: 'Layar hasil',
          aba: 'Salin hasil kalian dan tunjukkan ke saya.',
          guru: ['Catat di panel Rekap.', 'Nusa Selatan otomatis terbuka.'],
          awas: [] },

        { m: 5, judul: 'Refleksi dan penutup',
          aba: 'Penanda waktu mana yang tadi paling menipu kalian?',
          guru: ['Tutup dengan mengaitkan ke perjalanan berikutnya: kosakata.'],
          awas: [] }
      ]
    },

    {
      id: 'oj_selatan', kunci: 'oj_selatan_v1', prasyarat: 'oj_timur_v1',
      dunia: 'ocean', urutan: 3,
      nama: 'Nusa Selatan',
      fokus: 'Kosakata: memaknai kata di dalam konteks cerita',
      langkah: 20, nyawa: 7, skorMaks: 200,
      bentuk: 'penuh',
      alur: ['welcome-1', 'welcome-2', 'wait-1', 'video', 'wait-2', 'words', 'points', 'quiz', 'result'],
      gerbang: ['wait-1', 'wait-2', 'lives'],
      penilaian:
        '20 langkah: 8 kata (arti + bunyi) + 6 kalimat "What does it point to?" + 6 soal rumpang. ' +
        'Dua kali salah di satu langkah: jawaban ditunjukkan, langkah dihitung 0,5.',
      hasilnya:
        'PENTING — di modul inilah tombol "Salin kode hasil" muncul. Kodenya berisi hasil ' +
        'ketiga perjalanan Ocean Journey sekaligus (Nusa Barat, Nusa Timur, Nusa Selatan) ' +
        'beserta nama dan kelas. Kode itu yang ditempel guru di panel Rekap.',
      runbook: [
        { m: 4, judul: 'Pembukaan dan cek prasyarat',
          aba: 'Perjalanan ketiga, penutup samudra. Setelah ini kalian menyeberang ke danau.',
          guru: ['Cek siapa yang belum menuntaskan Nusa Timur.'],
          awas: [] },

        { m: 4, judul: 'Dua layar sambutan',
          aba: 'Fokus hari ini: menebak arti kata dari kalimat di sekitarnya, tanpa membuka kamus.',
          guru: ['Terangkan strategi context clue dengan satu contoh di papan.'],
          awas: [] },

        { m: 6, judul: 'GERBANG 1 — kelas menunggu guru', kunciAlur: 'wait-1',
          aba: 'Sebelum video: kalau ada kata asing di sebuah kalimat, apa yang kalian lakukan lebih dulu?',
          guru: ['Ajarkan urutannya: baca kalimat sebelum dan sesudahnya, cari kata yang mirip, baru tebak.',
                 'Buka gerbangnya.'],
          awas: [],
          aksi: { sinyal: 'wait-1', label: 'Buka video untuk kelas' } },

        { m: 8, judul: 'Video materi',
          aba: 'Tonton sampai habis.',
          guru: ['Pastikan berkas video tersedia.'],
          awas: [] },

        { m: 5, judul: 'GERBANG 2 — cek pemahaman', kunciAlur: 'wait-2',
          aba: 'Cepat: apa arti "mangrove" menurut kalimat di cerita, bukan menurut kamus?',
          guru: ['Kumpulkan beberapa jawaban, luruskan seperlunya.', 'Buka gerbangnya.'],
          awas: [],
          aksi: { sinyal: 'wait-2', label: 'Mulai aktivitas' } },

        { m: 14, judul: 'Activity 1 · Delapan kata',
          aba: 'Delapan kata, satu per layar. Pilih artinya, lalu dengarkan bunyinya.',
          guru: ['Kalau pelafalan tidak berbunyi, perangkat itu tidak mendukung suara — bacakan sendiri.',
                 'Minta siswa mengucap ulang keras-keras setiap kata.'],
          awas: ['Kata "brackish" dan "abrasion" adalah kata yang sama dengan kuis Nusa Barat — sambungkan.'] },

        { m: 12, judul: 'Activity 2 · What does it point to?',
          aba: 'Enam kalimat. Kata yang ditebalkan menunjuk ke sesuatu — tentukan apa.',
          guru: ['Ini latihan rujukan kata ganti (they, their, it). Ingatkan mencari kata bendanya di kalimat sebelumnya.'],
          awas: [] },

        { m: 12, judul: 'Activity 3 · Kuis rumpang 6 soal',
          aba: 'Enam kalimat rumpang. Isi dengan kata yang paling tepat.',
          guru: ['Pantau papan pertanyaan dan nyawa.'],
          awas: [] },

        { m: 6, judul: 'Layar hasil dan KODE HASIL',
          aba: 'Di layar ini ada DUA tombol. "Salin hasil" untuk teks biasa, dan "Salin kode hasil" — kode panjang berisi seluruh nilai Ocean Journey kalian. Tekan tombol kode itu, lalu kirim ke saya.',
          guru: ['Tentukan satu jalur pengumpulan: grup kelas, formulir, atau tempel langsung di panel ini.',
                 'Buka panel Rekap, tempel kodenya satu per satu — nama, kelas, dan tiga nilai langsung terisi.'],
          awas: ['Kode hanya terbit di Nusa Selatan. Kalau sesi ini terlewat, nilai Ocean Journey harus dicatat manual.'] },

        { m: 4, judul: 'Refleksi dan penutup',
          aba: 'Samudra selesai. Pertemuan berikutnya kita naik ke Bukit Camar — pintu menuju Danau Lembayung.',
          guru: ['Pastikan semua kode sudah masuk sebelum kelas bubar.'],
          awas: [] }
      ]
    },

    {
      id: 'lake_bukit', kunci: 'lake_bukit_v1', prasyarat: 'oj_selatan_v1',
      dunia: 'lake', urutan: 1,
      nama: 'Bukit Camar',
      fokus: 'Jembatan dua dunia: menutup samudra, membuka danau',
      langkah: 6, nyawa: 7, skorMaks: 6,
      bentuk: 'ringkas',
      alur: ['welcome-1', 'welcome-2', 'review', 'material', 'activity', 'closing'],
      gerbang: ['review-1', 'video-selesai', 'review-2', 'lives'],
      penilaian:
        '6 pertanyaan: 3 pertanyaan batas struktur cerita + 3 penanda waktu yang harus ditemukan. ' +
        'Skor = jumlah yang benar pada percobaan PERTAMA. Kesempatan (chances) 7, dipakai bersama.',
      hasilnya:
        'Bukit Camar menyimpan bentuk hasil yang BERBEDA dari enam modul lain: ' +
        '{score, outOf, chancesLeft} — tanpa bintang, tanpa attempts. Panel Rekap sudah ' +
        'menormalkannya, jadi tampil setara di tabel.',
      catatanTeknis:
        'Gerbang modul ini terbelah dua di kodenya sendiri: ReviewGate (dua tahap ' +
        'menunggu) dan HeartsGate (kesempatan habis) — bukan objek Gate seperti enam ' +
        'modul lain. shared/teacher.js menerjemahkan keduanya ke tiga nama yang sama, ' +
        'jadi tombol "Buka video", "Mulai aktivitas", dan "Pulihkan nyawa" berlaku di ' +
        'sini persis seperti di modul lain. Batasnya tetap sama: satu peramban.',
      runbook: [
        { m: 5, judul: 'Pembukaan — menyambung dua dunia',
          aba: 'Samudra sudah kalian seberangi. Hari ini kita naik ke bukit, dan dari puncaknya kalian akan melihat danau. Ceritanya berganti: bukan lagi mangrove, tapi longsor dan banjir bandang.',
          guru: ['Tarik benang merah: sama-sama tentang hutan yang hilang dan akibatnya.',
                 'Cek siapa yang belum menuntaskan Nusa Selatan — kartunya masih terkunci.'],
          awas: [] },

        { m: 4, judul: 'Dua layar sambutan',
          aba: 'Baca dua layar sambutan. Perhatikan: di modul ini istilahnya bukan "nyawa", tapi "chances" — kesempatan.',
          guru: ['Terangkan bahwa modul ini lebih pendek: 6 pertanyaan saja, tapi bacaannya panjang (13 paragraf).'],
          awas: [] },

        { m: 8, judul: 'GERBANG REVIEW 1 — sebelum video', kunciAlur: 'wait-1',
          aba: 'Layar review menahan kalian di sini. Kita ulang dulu tiga bagian cerita: orientation, complication, resolution — sekarang di cerita yang baru.',
          guru: ['Ulang cepat struktur naratif; hubungkan dengan Nusa Barat.',
                 'Gerbang review pertama modul ini menerima sinyal "Buka video" seperti modul lain.'],
          awas: [],
          aksi: { sinyal: 'wait-1', label: 'Buka video untuk kelas' } },

        { m: 8, judul: 'Video review',
          aba: 'Tonton video review sampai habis.',
          guru: ['Pastikan berkas video ada.'],
          awas: [] },

        { m: 5, judul: 'GERBANG REVIEW 2 — sebelum bacaan', kunciAlur: 'wait-2',
          aba: 'Sebelum membaca: cerita ini punya 13 paragraf. Tugas kalian nanti menandai di paragraf berapa tiap bagian berakhir.',
          guru: ['Minta siswa menyiapkan cara menghitung paragraf — nomornya tampil di layar.'],
          awas: [],
          aksi: { sinyal: 'wait-2', label: 'Mulai aktivitas' } },

        { m: 18, judul: 'Bacaan + Activity 1 · Batas struktur',
          aba: 'Baca sampai habis, lalu jawab: di paragraf berapa orientation berakhir? Complication? Di paragraf berapa resolution mulai?',
          guru: ['Kunci jawabannya ada di panel Kunci Jawaban — jangan disebut, pakai untuk mengarahkan.',
                 'Petunjuknya: perubahan waktu dan perubahan keadaan menandai pergantian bagian.'],
          awas: ['Bacaannya panjang. Beri waktu baca yang cukup sebelum menuntut jawaban.'] },

        { m: 12, judul: 'Activity 2 · Tiga penanda waktu',
          aba: 'Temukan tiga penanda waktu di dalam cerita. Yang mirip tapi bukan penanda urutan waktu ada di sana sebagai pengecoh.',
          guru: ['Pengecohnya: "long before", "every month", "that night", "That day".'],
          awas: [] },

        { m: 5, judul: 'Layar penutup',
          aba: 'Layar penutup menunjukkan berapa yang kalian jawab benar pada percobaan pertama. Tekan tombol selesai supaya tersimpan.',
          guru: ['Siswa HARUS menekan tombol selesai — tanpa itu, hasilnya tidak tersimpan dan Sunda Kelapa tetap terkunci.'],
          awas: ['Ini kesalahan yang paling sering terjadi di modul ini.'] },

        { m: 5, judul: 'Refleksi dan penutup',
          aba: 'Apa persamaan cerita mangrove dan cerita longsor tadi?',
          guru: ['Arahkan ke gagasan yang sama: hutan yang hilang, bencana yang datang.',
                 'Umumkan: pertemuan berikutnya masuk Danau Lembayung lewat Sunda Kelapa.'],
          awas: [] }
      ]
    },

    {
      id: 'lake_sunda', kunci: 'lake_sunda_v1', prasyarat: 'lake_bukit_v1',
      dunia: 'lake', urutan: 2,
      nama: 'Sunda Kelapa',
      fokus: 'Pemahaman level literal: menemukan yang tersurat',
      langkah: 20, nyawa: 7, skorMaks: 200,
      bentuk: 'penuh',
      alur: ['welcome-1', 'welcome-2', 'wait-1', 'video', 'wait-2', 'round-1', 'round-2', 'quiz', 'result'],
      gerbang: ['wait-1', 'wait-2', 'lives'],
      penilaian:
        '20 petunjuk: 4 angka (Round 1) + 1 nama (Round 2) + 15 soal kuis. ' +
        'Klik salah di Round 1 dan 2 TIDAK mengurangi nyawa, hanya bergetar. ' +
        'Nyawa 7 hanya berkurang di kuis.',
      hasilnya: 'Tombol "Salin hasil" berupa teks biasa.',
      runbook: [
        { m: 5, judul: 'Pembukaan',
          aba: 'Kita turun ke desa pertama di tepi danau: Sunda Kelapa. Desa ini kehilangan air bersih setelah longsor. Tugas kalian hari ini sederhana tapi menuntut ketelitian — menemukan yang TERTULIS di teks.',
          guru: ['Terangkan istilah pemahaman literal: jawabannya ada di teks, bukan ditebak.'],
          awas: [] },

        { m: 4, judul: 'Dua layar sambutan',
          aba: 'Baca sambutannya. Modul ini yang paling panjang kuisnya: 15 soal.',
          guru: ['Ingatkan siswa mengatur napas — ini sesi terpanjang.'],
          awas: [] },

        { m: 6, judul: 'GERBANG 1 — kelas menunggu guru', kunciAlur: 'wait-1',
          aba: 'Berhenti. Kita bahas dulu bedanya membaca "yang tertulis" dan membaca "yang tersirat". Hari ini hanya yang tertulis.',
          guru: ['Beri satu contoh pendek di papan.', 'Buka gerbangnya.'],
          awas: [],
          aksi: { sinyal: 'wait-1', label: 'Buka video untuk kelas' } },

        { m: 8, judul: 'Video materi',
          aba: 'Tonton sampai habis.',
          guru: ['Berkasnya di assets/materi/video-materi.mp4 — pastikan ada.'],
          awas: [] },

        { m: 5, judul: 'GERBANG 2 — cek pemahaman', kunciAlur: 'wait-2',
          aba: 'Kalau saya tanya "berapa jumlah keluarga yang terdampak", di mana kalian mencarinya?',
          guru: ['Jawaban yang diharapkan: di dalam teks, di kalimat yang menyebut angka.', 'Buka gerbangnya.'],
          awas: [],
          aksi: { sinyal: 'wait-2', label: 'Mulai aktivitas' } },

        { m: 10, judul: 'Round 1 · Empat angka tersembunyi',
          aba: 'Ketuk kata di cerita yang berupa angka atau jumlah. Ada empat. Salah ketuk tidak mengurangi nyawa — jadi berani saja.',
          guru: ['Tekankan tidak ada hukuman di ronde ini; dorong siswa mencoba.',
                 'Kunci jawabannya tersedia di panel Kunci Jawaban.'],
          awas: [] },

        { m: 8, judul: 'Round 2 · Satu nama',
          aba: 'Cerita yang sama, target baru: temukan nama anggota tim SAR yang menemukan titik sumur — bukan warga biasa.',
          guru: ['Nama-nama lain sengaja bisa diketuk. Itu ujian ketelitian.'],
          awas: [] },

        { m: 25, judul: 'Kuis · 15 soal',
          aba: 'Lima belas soal. Semua jawabannya ADA di teks. Kalau ragu, gulir ke atas dan baca ulang.',
          guru: ['Ini bagian terpanjang — beri jeda 1 menit di tengah kalau kelas mulai lelah.',
                 'Pantau papan pertanyaan; siapkan tombol pulihkan nyawa.'],
          awas: ['Beberapa soal menanyakan angka yang mirip (9 meter vs 800 meter). Ingatkan membaca ulang.'] },

        { m: 5, judul: 'Layar hasil',
          aba: 'Salin hasil kalian.',
          guru: ['Catat di panel Rekap.', 'Muara Jati otomatis terbuka.'],
          awas: [] },

        { m: 4, judul: 'Refleksi dan penutup',
          aba: 'Soal mana yang jawabannya paling susah ditemukan, padahal ada di teks?',
          guru: ['Sambungkan ke pertemuan berikutnya: Muara Jati, yang tersirat.'],
          awas: [] }
      ]
    },

    {
      id: 'lake_muara', kunci: 'lake_muara_v1', prasyarat: 'lake_sunda_v1',
      dunia: 'lake', urutan: 3,
      nama: 'Muara Jati',
      fokus: 'Pemahaman level inferensial: menyimpulkan yang tersirat',
      langkah: 10, nyawa: 7, skorMaks: 110,
      bentuk: 'penuh',
      alur: ['welcome-1', 'welcome-2', 'wait-1', 'video', 'wait-2', 'activity', 'quiz', 'result'],
      gerbang: ['wait-1', 'wait-2', 'lives'],
      penilaian:
        '10 langkah: 4 sesi menyusun kartu + 6 soal kuis. Satu langkah dihitung benar ' +
        'hanya kalau selesai TANPA kehilangan nyawa di langkah itu. Nyawa 7 dipakai bersama.',
      hasilnya: 'Tombol "Salin hasil" berupa teks biasa.',
      runbook: [
        { m: 5, judul: 'Pembukaan',
          aba: 'Desa kedua: Muara Jati, yang jembatannya hanyut. Hari ini kalian tidak mencari yang tertulis, tapi menyimpulkan yang TIDAK ditulis.',
          guru: ['Beri satu contoh inferensi sederhana di papan: "Bajunya basah dan payungnya patah." — apa yang terjadi?'],
          awas: [] },

        { m: 4, judul: 'Dua layar sambutan',
          aba: 'Baca sambutannya. Aktivitasnya menyusun kartu cerita, empat sesi, makin lama makin panjang.',
          guru: ['Terangkan aturan keras modul ini: satu sesi dihitung benar hanya kalau selesai tanpa kehilangan nyawa.'],
          awas: ['Aturan ini lebih ketat dari modul lain. Sampaikan sejak awal supaya siswa berhati-hati.'] },

        { m: 6, judul: 'GERBANG 1 — kelas menunggu guru', kunciAlur: 'wait-1',
          aba: 'Berhenti. Kita bahas: apa itu urutan sebab-akibat, dan kenapa cerita tidak bisa diacak.',
          guru: ['Tulis empat kalimat acak di papan, minta kelas mengurutkannya bersama.', 'Buka gerbangnya.'],
          awas: [],
          aksi: { sinyal: 'wait-1', label: 'Buka video untuk kelas' } },

        { m: 8, judul: 'Video materi',
          aba: 'Tonton sampai habis.',
          guru: ['Pastikan berkas video ada.'],
          awas: [] },

        { m: 5, judul: 'GERBANG 2 — cek pemahaman', kunciAlur: 'wait-2',
          aba: 'Kalau saya bilang "jembatan itu hanyut", apa yang PASTI terjadi sesudahnya menurut kalian?',
          guru: ['Kumpulkan tebakan; luruskan bahwa inferensi harus punya dasar di teks.', 'Buka gerbangnya.'],
          awas: [],
          aksi: { sinyal: 'wait-2', label: 'Mulai aktivitas' } },

        { m: 22, judul: 'Aktivitas · 4 sesi menyusun kartu',
          aba: 'Susun kartu-kartu ini jadi cerita yang runtut. Sesi 1 empat kartu, terakhir delapan kartu. Pikirkan dulu sebelum menggeser.',
          guru: ['Ingatkan lagi: kehilangan nyawa di satu sesi membuat sesi itu tidak dihitung.',
                 'Urutan benar tiap sesi ada di panel Kunci Jawaban.',
                 'Untuk siswa yang buntu, tanyakan: "Mana yang pasti terjadi paling awal?"'],
          awas: ['Sesi 4 (8 kartu) paling banyak memakan nyawa. Beri peringatan sebelum masuk.'] },

        { m: 12, judul: 'Kuis · 6 soal',
          aba: 'Enam soal. Semua menanyakan yang tersirat — jawabannya tidak tertulis langsung.',
          guru: ['Pantau nyawa; banyak siswa masuk kuis dengan nyawa tipis.'],
          awas: [] },

        { m: 4, judul: 'Layar hasil',
          aba: 'Salin hasil kalian.',
          guru: ['Catat di panel Rekap.', 'Singhasari otomatis terbuka.'],
          awas: [] },

        { m: 4, judul: 'Refleksi dan penutup',
          aba: 'Sebutkan satu hal yang kalian simpulkan hari ini, padahal tidak ditulis di cerita.',
          guru: ['Sambungkan ke Singhasari: menimbang dan menilai.'],
          awas: [] }
      ]
    },

    {
      id: 'lake_singha', kunci: 'lake_singha_v1', prasyarat: 'lake_muara_v1',
      dunia: 'lake', urutan: 4,
      nama: 'Singhasari',
      fokus: 'Pemahaman level evaluatif: menimbang dan menilai bacaan',
      langkah: 24, nyawa: 7, skorMaks: 240,
      bentuk: 'penuh',
      alur: ['welcome-1', 'welcome-2', 'wait-1', 'video', 'wait-2', 'story', 'activity', 'quiz', 'result'],
      gerbang: ['wait-1', 'wait-2', 'lives'],
      penilaian:
        '24 langkah: 10 pilihan + 10 alasan + 4 soal kuis. Alasan yang kurang tepat TIDAK ' +
        'menghukum — alasan terbaik langsung ditunjukkan beserta penjelasannya. ' +
        'Nyawa 7 hanya berkurang saat jawaban kuis salah.',
      hasilnya:
        'Layar hasil Singhasari menampilkan RINGKASAN SELURUH PERJALANAN — ketujuh modul ' +
        'sekaligus. Ini layar terbaik untuk difoto sebagai bukti tuntas satu rangkaian.',
      runbook: [
        { m: 5, judul: 'Pembukaan — perjalanan terakhir',
          aba: 'Perjalanan ketujuh, yang terakhir. Hari ini kalian tidak menjawab benar atau salah saja — kalian menilai apakah sebuah keputusan itu adil.',
          guru: ['Sampaikan bahwa ini tingkat pemahaman tertinggi dalam rangkaian.'],
          awas: [] },

        { m: 4, judul: 'Dua layar sambutan',
          aba: 'Baca sambutannya. Sepuluh skenario, dan setiap skenario minta dua hal: pilihan kalian, dan ALASANNYA.',
          guru: ['Tegaskan: alasan yang kurang tepat tidak menghukum. Yang penting siswa berani memilih.'],
          awas: [] },

        { m: 7, judul: 'GERBANG 1 — kelas menunggu guru', kunciAlur: 'wait-1',
          aba: 'Berhenti. Pertanyaan besar hari ini: apakah adil selalu berarti sama rata?',
          guru: ['Buka diskusi singkat. Ini fondasi seluruh aktivitas hari ini.',
                 'Contoh: satu botol air, satu orang haus dan satu tidak — dibagi dua atau tidak?',
                 'Buka gerbangnya.'],
          awas: ['Jangan lewati diskusi ini. Tanpa fondasinya, siswa menebak-nebak di 10 skenario.'],
          aksi: { sinyal: 'wait-1', label: 'Buka video untuk kelas' } },

        { m: 8, judul: 'Video materi',
          aba: 'Tonton sampai habis.',
          guru: ['Pastikan berkas video ada.'],
          awas: [] },

        { m: 5, judul: 'GERBANG 2 — cek pemahaman', kunciAlur: 'wait-2',
          aba: 'Satu kalimat: menurut kalian, apa dasar yang paling adil untuk membagi bantuan bencana?',
          guru: ['Kumpulkan 3–4 jawaban.', 'Buka gerbangnya.'],
          awas: [],
          aksi: { sinyal: 'wait-2', label: 'Mulai aktivitas' } },

        { m: 12, judul: 'Membaca teks cerita',
          aba: 'Baca ceritanya lebih dulu. Sepuluh skenario nanti semuanya bersumber dari sini.',
          guru: ['Beri waktu baca yang jujur. Jangan buru-buru.'],
          awas: [] },

        { m: 25, judul: 'Choose & Justify · 10 skenario',
          aba: 'Tiap skenario: pilih dulu adil atau tidak adil, lalu pilih alasan terbaik. Kalau alasan kalian meleset, alasan terbaik akan ditunjukkan — baca penjelasannya, jangan dilewati.',
          guru: ['Ini bagian paling berharga. Berkeliling dan tanyakan "kenapa kamu pilih itu?" secara lisan.',
                 'Kalau kelas ramai berdebat, itu tanda bagus — beri ruang 2 menit.',
                 'Kunci lengkap ada di panel Kunci Jawaban, termasuk penjelasan tiap skenario.'],
          awas: ['Beberapa siswa akan tidak setuju dengan kunci. Terima itu — minta mereka membela alasannya.'] },

        { m: 10, judul: 'Kuis · 4 soal',
          aba: 'Empat soal penutup tentang pesan cerita.',
          guru: ['Nyawa hanya berkurang di sini.'],
          awas: [] },

        { m: 6, judul: 'Layar hasil + ringkasan perjalanan',
          aba: 'Layar terakhir menampilkan seluruh perjalanan kalian, dari Nusa Barat sampai Singhasari. Foto layar itu dan kirim ke saya.',
          guru: ['Kumpulkan tangkapan layar sebagai bukti tuntas.',
                 'Gunakan panel Rekap untuk menyatukan nilai akhir.'],
          awas: [] },

        { m: 6, judul: 'Refleksi penutup rangkaian',
          aba: 'Tujuh perjalanan sudah kalian tempuh. Satu kalimat: apa yang kalian bawa pulang dari cerita-cerita ini?',
          guru: ['Kumpulkan jawaban; ini penutup seluruh rangkaian, beri ruang lebih.',
                 'Tutup dengan mengaitkan mangrove, longsor, dan keadilan — satu gagasan yang sama.'],
          awas: [] }
      ]
    }
  ],

  /* ---------- Daftar periksa sebelum kelas ---------- */
  /* Butir bertanda "kritis" adalah hal yang, kalau terlewat,
     menghentikan seluruh kelas — bukan sekadar merepotkan. */
  persiapan: [
    { kritis: true,  t: 'DEV_MODE sudah dimatikan',
      d: 'Ketujuh berkas script.js modul siswa masih memuat "var DEV_MODE = true;". Selama itu menyala, gembok prasyarat dilewati dan tombol hijau pelolos langkah muncul di layar siswa. Ubah menjadi false sebelum dipakai di kelas.' },
    { kritis: true,  t: 'Situs guru dan situs siswa satu alamat',
      d: 'Panel ini membaca data siswa lewat penyimpanan peramban, yang terikat pada satu asal (origin). Letakkan folder teacher/ di dalam situs yang sama — bukan situs terpisah, dan bukan dibuka lewat file:// kalau siswa memakai http://.' },
    { kritis: true,  t: 'Berkas video sudah diunggah',
      d: 'Tiap modul memanggil satu berkas video. Kalau berkasnya belum ada, layar video siswa tampil kosong dan kelas berhenti di sana. Daftar lengkapnya ada di kartu modul.' },
    { kritis: false, t: 'Berkas di folder shared/ tersedia',
      d: 'Peta dan kedua hub memanggil shared/tokens.css, shared/hub.css, shared/progress.js, dan shared/hub.js; ketujuh modul memanggil shared/teacher.js. Tanpa teacher.js, tombol kendali kelas tidak sampai ke satu modul pun.' },
    { kritis: false, t: 'Satu perangkat satu siswa',
      d: 'Progres disimpan di peramban perangkat itu. Berbagi perangkat berarti hasil tertimpa; ganti perangkat berarti mulai dari nol.' },
    { kritis: false, t: 'Jangan pakai mode penyamaran',
      d: 'Di mode penyamaran/incognito seluruh progres hilang begitu tab ditutup.' },
    { kritis: false, t: 'Suara dan volume perangkat siap',
      d: 'Video materi dan pelafalan kata di Nusa Selatan butuh suara. Sarankan earphone kalau tersedia.' },
    { kritis: false, t: 'Jalur pengumpulan hasil sudah ditentukan',
      d: 'Tentukan sejak awal: kode hasil ditempel langsung di panel ini, dikirim lewat grup kelas, atau difoto. Kode hasil gabungan Ocean Journey hanya terbit di layar hasil Nusa Selatan.' }
  ],

  /* ---------- Arti nama layar pada pertanyaan siswa ---------- */
  /* Nilai "page" pada nl_questions_v1 memakai nama teknis;
     ini terjemahannya supaya guru tahu siswa sedang di mana. */
  layar: {
    'welcome-1': 'Layar sambutan 1',
    'welcome-2': 'Layar sambutan 2',
    'wait-1':    'Menunggu guru (sebelum video)',
    'video':     'Video materi',
    'wait-2':    'Menunggu guru (sesudah video)',
    'steps':     'Aktivitas — 13 langkah',
    'markers':   'Activity 1 — penanda waktu',
    'quotes':    'Activity 2 — Who says it?',
    'words':     'Activity 1 — arti kata',
    'points':    'Activity 2 — What does it point to?',
    'round-1':   'Round 1 — angka tersembunyi',
    'round-2':   'Round 2 — satu nama',
    'story':     'Membaca teks cerita',
    'activity':  'Aktivitas',
    'quiz':      'Kuis',
    'review':    'Gerbang review',
    'material':  'Bacaan',
    'closing':   'Layar penutup',
    'result':    'Layar hasil'
  },

  /* ---------- Sinyal gerbang yang bisa dikirim ---------- */
  sinyal: [
    { id: 'wait-1', nama: 'Buka video',
      d: 'Melepas siswa dari layar tunggu pertama dan memutar video materi.' },
    { id: 'wait-2', nama: 'Mulai aktivitas',
      d: 'Melepas siswa dari layar tunggu kedua dan memulai aktivitas inti.' },
    { id: 'lives',  nama: 'Pulihkan nyawa',
      d: 'Mengembalikan nyawa siswa yang habis. Progres tidak dihapus, siswa lanjut dari tempatnya berhenti.' }
  ]
};
