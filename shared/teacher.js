/* ============================================================
   NARRATIVE LEARN — shared/teacher.js
   ------------------------------------------------------------
   KANAL YANG DIBACA KEDUA SISI.

   Satu berkas dipakai dua tempat yang berbeda:

     teacher/index.html      panel guru  — MENGIRIM perintah,
                             membaca pertanyaan dan hasil
     7 platform level 3      layar siswa — MENERIMA perintah

   Dimuat di panel SEBELUM data.js, dan di tiap platform SESUDAH
   script platformnya sendiri:

     <script src="../shared/teacher.js"></script>          panel
     <script src="script_NusaBarat.js"></script>           platform
     <script src="../../shared/teacher.js"></script>

   Urutan di platform wajib begitu: berkas ini membaca Gate dan
   TeacherAPI yang baru ada setelah script platform dijalankan.

   ------------------------------------------------------------
   TIGA HAL YANG DIMILIKI BERKAS INI
   ------------------------------------------------------------
   1. KONTRAK GERBANG. Sebelum ini hanya Nusa Barat yang memantau
      nl_teacher_gate_v1; enam platform lain punya Gate dan
      TeacherAPI tapi tidak punya pemantaunya, jadi tombol di
      panel cuma berlaku untuk satu platform. Pemantau itu
      sekarang tinggal di sini — satu salinan, bukan tujuh.

   2. KOTAK PERTANYAAN. nl_questions_v1 dibaca panel dan ditulis
      ketujuh platform; bentuknya dijaga di satu tempat.

   3. SATU BENTUK HASIL. Enam platform menyimpan
      {correct, total, stars, livesUsed, attempts}; Bukit Camar
      menyimpan {score, outOf, chancesLeft}. Perbedaan itu ada di
      kode siswa dan tidak diubah dari sini — diseragamkan saat
      dibaca, sehingga panel tidak perlu tahu bedanya.

   ------------------------------------------------------------
   KUNCI PENYIMPANAN
   ------------------------------------------------------------
     nl_teacher_gate_v1   panel -> platform  { grant, at }
     nl_questions_v1      platform -> panel  [{module, page, text, at}]
     oj_barat_v1 ... lake_singha_v1          hasil tujuh platform
     nl_student_v1        { name, class }

   ------------------------------------------------------------
   BATAS YANG HARUS DIKETAHUI
   ------------------------------------------------------------
   Semuanya localStorage, yang TERIKAT PADA SATU ASAL DI SATU
   PERAMBAN. Panel harus berada di situs yang sama dengan halaman
   siswa, dan perintahnya tidak menyeberang ke HP lain. Untuk
   lintas perangkat, jalurnya kode hasil yang ditempel di tab
   "Rekap Nilai". Menghapus batas ini butuh backend; titik
   sambungnya sudah disiapkan di shared/progress.js (NL.kirim).
   ============================================================ */
(function (global) {
  'use strict';

  var KUNCI_PERINTAH = 'nl_teacher_gate_v1';
  var KUNCI_TANYA    = 'nl_questions_v1';
  var KUNCI_SISWA    = 'nl_student_v1';
  var DETAK          = 1200;

  /* ==========================================================
     TUJUH PLATFORM
     ----------------------------------------------------------
     Termasuk NAMA BERKASNYA. Nama berkas level 3 pernah berubah
     sekali (index.html -> index_<Nama>.html) dan setiap tautan
     yang menyebutnya di tempat lain ikut putus. Menaruhnya di
     satu tempat berarti perubahan berikutnya cukup disunting di
     sini.

     Yang TIDAK ada di sini: jumlah langkah dan nyawa tiap
     perjalanan. Itu profil pengajaran, bukan urusan kanal, dan
     sudah tinggal di teacher/data.js. Menyalinnya ke sini berarti
     dua daftar yang bisa berbeda — persis penyakit yang membuat
     tautan level 3 putus dulu. normalHasil() menerima profil itu
     dari pemanggilnya.
     ========================================================== */
  var MODUL = [
    { id:'oj_barat',    kunci:'oj_barat_v1',    dunia:'ocean', urutan:1, nama:'Nusa Barat',
      folder:'ocean-journey/nusa-barat',    berkas:'index_NusaBarat.html' },
    { id:'oj_timur',    kunci:'oj_timur_v1',    dunia:'ocean', urutan:2, nama:'Nusa Timur',
      folder:'ocean-journey/nusa-timur',    berkas:'index_NusaTimur.html' },
    { id:'oj_selatan',  kunci:'oj_selatan_v1',  dunia:'ocean', urutan:3, nama:'Nusa Selatan',
      folder:'ocean-journey/nusa-selatan',  berkas:'index_NusaSelatan.html' },
    { id:'lake_bukit',  kunci:'lake_bukit_v1',  dunia:'lake',  urutan:1, nama:'Bukit Camar',
      folder:'lake-lembayung/bukit-camar',  berkas:'Index_BukitCamar.html' },
    { id:'lake_sunda',  kunci:'lake_sunda_v1',  dunia:'lake',  urutan:2, nama:'Sunda Kelapa',
      folder:'lake-lembayung/sunda-kelapa', berkas:'index_SundaKelapa.html' },
    { id:'lake_muara',  kunci:'lake_muara_v1',  dunia:'lake',  urutan:3, nama:'Muara Jati',
      folder:'lake-lembayung/muara-jati',   berkas:'index_MuaraJati.html' },
    { id:'lake_singha', kunci:'lake_singha_v1', dunia:'lake',  urutan:4, nama:'Singhasari',
      folder:'lake-lembayung/singhasari',   berkas:'index_Singhasari.html' }
  ];

  var DUNIA = {
    ocean: { nama:'Ocean Journey',        folder:'ocean-journey' },
    lake:  { nama:'The Lake of Lembayung', folder:'lake-lembayung' }
  };

  var GERBANG = ['wait-1', 'wait-2', 'lives'];

  function olehId(id) {
    for (var i = 0; i < MODUL.length; i++) if (MODUL[i].id === id) return MODUL[i];
    return null;
  }

  /* ==========================================================
     PENYIMPANAN YANG TIDAK PERNAH MELEMPAR
     ----------------------------------------------------------
     Mode penyamaran ketat dan kuota penuh membuat localStorage
     menolak. Halaman harus tetap berjalan tanpa progres, bukan
     berhenti dengan layar kosong.
     ========================================================== */
  function baca(k) {
    try { var m = localStorage.getItem(k); return m ? JSON.parse(m) : null; }
    catch (e) { return null; }
  }
  function tulis(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) { return false; }
  }
  function buang(k) {
    try { localStorage.removeItem(k); return true; } catch (e) { return false; }
  }

  /* ==========================================================
     1. KONTRAK GERBANG
     ========================================================== */
  var Kanal = {
    GERBANG: GERBANG,

    /* Dipanggil panel. Bentuk { grant, at } dipertahankan persis
       seperti yang sudah ditulis panel sejak awal; `id` dan `modul`
       ditambahkan sebagai keterangan, dan sisi siswa tetap bekerja
       tanpa keduanya. */
    kirim: function (grant, modul) {
      var perintah = {
        grant: grant,
        at: new Date().toISOString(),
        id: 'g_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        modul: modul || '*'
      };
      return tulis(KUNCI_PERINTAH, perintah) ? perintah : null;
    },

    perintah: function () { return baca(KUNCI_PERINTAH); },

    hapusPerintah: function () { return buang(KUNCI_PERINTAH); }
  };

  /* ==========================================================
     2. KOTAK PERTANYAAN
     ========================================================== */
  Kanal.pertanyaan = function () {
    var l = baca(KUNCI_TANYA);
    return Array.isArray(l) ? l : [];
  };
  Kanal.tulisPertanyaan = function (daftar) {
    return tulis(KUNCI_TANYA, Array.isArray(daftar) ? daftar : []);
  };

  Kanal.siswa = function () {
    var s = baca(KUNCI_SISWA);
    return (s && typeof s === 'object') ? s : null;
  };

  /* ==========================================================
     3. SATU BENTUK HASIL
     ----------------------------------------------------------
     `m` boleh entri MODUL di berkas ini atau entri GURU_DATA.modul
     milik panel — yang dibaca hanya `langkah` dan `nyawa`, dan
     keduanya ada di kedua bentuk.
     ========================================================== */
  Kanal.normalHasil = function (m, mentah) {
    if (!mentah || mentah.status !== 'completed') return null;
    m = m || {};

    var benar, dari, nyawa, bintang, coba;

    if (typeof mentah.outOf === 'number') {
      /* Bentuk ringkas — hanya Bukit Camar. */
      benar   = mentah.score;
      dari    = mentah.outOf;
      nyawa   = typeof mentah.chancesLeft === 'number' ? mentah.chancesLeft : null;
      bintang = null;
      coba    = null;
    } else {
      /* Bentuk penuh — enam platform lainnya. */
      benar   = typeof mentah.correct === 'number' ? mentah.correct : null;
      dari    = typeof mentah.total   === 'number' ? mentah.total : m.langkah;
      nyawa   = typeof mentah.livesUsed === 'number' && typeof m.nyawa === 'number'
                  ? (m.nyawa - mentah.livesUsed) : null;
      bintang = typeof mentah.stars === 'number' ? mentah.stars : null;
      coba    = mentah.attempts || null;
    }

    return {
      benar: benar, dari: dari,
      persen: (benar != null && dari > 0) ? Math.round(benar / dari * 100) : null,
      nyawa: nyawa, bintang: bintang, coba: coba,
      selesai: mentah.completedAt || null,
      /* dibukaPaksa ditulis "Buka semua kunci" di shared/progress.js;
         guruBuka dipertahankan karena versi panel sebelumnya memakainya. */
      dibukaGuru: mentah.guruBuka === true || mentah.dibukaPaksa === true
    };
  };

  /* Rekaman mentah satu platform, apa adanya. */
  Kanal.rekaman = function (id) {
    var m = olehId(id);
    return m ? baca(m.kunci) : null;
  };

  /* Rekaman yang sudah diseragamkan. `profil` opsional — berikan
     entri GURU_DATA.modul kalau `nyawa` dan `langkah` ikut diminta. */
  Kanal.hasil = function (id, profil) {
    var m = olehId(id);
    return m ? Kanal.normalHasil(profil || m, baca(m.kunci)) : null;
  };

  Kanal.MODUL = MODUL;
  Kanal.DUNIA = DUNIA;
  Kanal.olehId = olehId;

  /* Alamat satu platform atau satu hub, relatif terhadap akar situs.
     `dari` menyebut kedalaman pemanggil: panel dan hub ada satu
     tingkat di bawah akar, jadi '../'. */
  Kanal.jalur = function (id, dari) {
    var awal = dari == null ? '../' : dari;
    var m = olehId(id);
    if (m) return awal + m.folder + '/' + m.berkas;
    if (DUNIA[id]) return awal + DUNIA[id].folder + '/index.html';
    return null;
  };

  global.NLTeacher = Kanal;

  /* ==========================================================
     ==========  MULAI DARI SINI: HANYA SISI SISWA  ===========
     ----------------------------------------------------------
     Panel memuat berkas yang sama, tapi tidak berada di dalam
     folder platform mana pun — jadi seluruh bagian di bawah ini
     tidak pernah menyala di sana.
     ========================================================== */
  var SAYA = (function () {
    var bagian = location.pathname.split('/');
    for (var i = bagian.length - 1; i >= 0; i--) {
      for (var j = 0; j < MODUL.length; j++) {
        if (MODUL[j].folder.split('/').pop() === bagian[i]) return MODUL[j];
      }
    }
    return null;
  })();

  Kanal.saya = SAYA;
  if (!SAYA) return;

  /* ----------------------------------------------------------
     Nusa Barat sudah punya pemantau sendiri di dalam Gate. Kalau
     dibiarkan, dua pemantau melepas gerbang yang sama dan video
     bisa mulai dua kali. Pemantau bawaannya dimatikan dari sini —
     bukan dihapus dari berkasnya — supaya platform itu tetap utuh
     kalau berkas ini tidak ikut dimuat.
     ---------------------------------------------------------- */
  if (typeof Gate !== 'undefined' && Gate && typeof Gate.stopPolling === 'function') {
    Gate.stopPolling();
    Gate.startPolling = function () {};
  }

  /* offsetParent SELALU null untuk elemen position:fixed, dan
     #reviewPage di Bukit Camar memang fixed — memakainya sebagai
     ukuran "terlihat" membuat gerbang itu tidak pernah terbaca.
     Yang dipakai di sini keterlihatan yang sebenarnya: elemennya
     sendiri, lalu setiap induknya, tidak boleh hidden atau
     display:none. */
  function terlihat(id) {
    var el = document.getElementById(id);
    if (!el) return false;
    if (typeof el.checkVisibility === 'function') return el.checkVisibility();
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      if (n.hidden) return false;
      var g = getComputedStyle(n);
      if (g.display === 'none' || g.visibility === 'hidden') return false;
    }
    return true;
  }

  /* Enam platform memakai Gate yang sama: Gate.mode berisi
     'wait-1' | 'wait-2' | 'lives'. Bukit Camar berbeda — gerbangnya
     terbelah menjadi ReviewGate (dua tahap menunggu) dan HeartsGate
     (kesempatan habis) — jadi keadaannya diterjemahkan ke tiga nama
     yang sama supaya panel cuma perlu tahu satu kosakata. */
  function mode() {
    if (typeof ReviewGate !== 'undefined' && ReviewGate) {
      if (typeof HeartsGate !== 'undefined' && HeartsGate.isShown && HeartsGate.isShown()) return 'lives';
      if (terlihat('reviewPage')) {
        if (terlihat('reviewWaiting1')) return 'wait-1';
        if (terlihat('reviewWaiting2')) return 'wait-2';
      }
      return null;
    }
    if (typeof Gate !== 'undefined' && Gate && Gate.isShown && Gate.isShown()) {
      return Gate.mode || null;
    }
    return null;
  }
  Kanal.mode = mode;

  function jalankan(grant) {
    var m = mode();
    if (!m) return false;
    if (grant && grant !== 'auto' && grant !== m) return false;
    if (typeof TeacherAPI === 'undefined' || !TeacherAPI) return false;

    /* Bukit Camar: tiga pintu berbeda untuk tiga keadaan. */
    if (typeof ReviewGate !== 'undefined' && ReviewGate) {
      if (m === 'wait-1' && TeacherAPI.unlockVideo)    { TeacherAPI.unlockVideo();    return true; }
      if (m === 'wait-2' && TeacherAPI.unlockNext)     { TeacherAPI.unlockNext();     return true; }
      if (m === 'lives'  && TeacherAPI.restoreChances) { TeacherAPI.restoreChances(); return true; }
      return false;
    }

    if (m === 'lives') {
      if (TeacherAPI.restoreLives) { TeacherAPI.restoreLives(); return true; }
      return false;
    }
    if (TeacherAPI.release) { TeacherAPI.release(); return true; }
    return false;
  }

  /* ----------------------------------------------------------
     PERINTAH LAMA TIDAK BOLEH IKUT TERBAWA
     ----------------------------------------------------------
     Kalau siswa memuat ulang halaman, perintah terakhir guru masih
     tergeletak di localStorage. Tanpa penjaga, halaman itu langsung
     melompati gerbangnya sendiri begitu terbuka. Karena itu hanya
     perintah yang LEBIH BARU dari saat halaman ini dimuat yang
     dikerjakan, dan tiap perintah cuma sekali.

     Panel menulis { grant, at } tanpa id, jadi cap perintahnya
     disusun dari keduanya kalau id memang tidak ada.
     ---------------------------------------------------------- */
  var SEJAK = Date.now();
  var sudah = {};

  function cap(p) { return p.id || (p.grant + '@' + p.at); }

  (function () {
    var awal = baca(KUNCI_PERINTAH);
    if (awal && awal.grant) sudah[cap(awal)] = true;
  })();

  function periksa() {
    var p = baca(KUNCI_PERINTAH);
    if (!p || !p.grant) return;

    var c = cap(p);
    if (sudah[c]) return;
    if (p.modul && p.modul !== '*' && p.modul !== SAYA.id) return;

    /* Perintah tanpa cap waktu yang sah dianggap sudah lewat: lebih
       baik gerbang tertahan sedetik lagi daripada terbuka sendiri. */
    var waktu = Date.parse(p.at || '');
    if (isNaN(waktu) || waktu < SEJAK - 2000) { sudah[c] = true; return; }

    if (jalankan(p.grant)) sudah[c] = true;
  }

  var jam = setInterval(periksa, DETAK);

  /* Perintah yang datang saat tab ini di latar belakang: peristiwa
     `storage` menyalakannya seketika, tanpa menunggu detak berikutnya. */
  global.addEventListener('storage', function (e) {
    if (!e.key || e.key === KUNCI_PERINTAH) periksa();
  });

  /* Terjangkau dari konsol saat menyiapkan kelas:
     NLTeacher.mode() harus menyebut gerbang yang sedang tampil. */
  Kanal.berhenti = function () { clearInterval(jam); };
})(window);
