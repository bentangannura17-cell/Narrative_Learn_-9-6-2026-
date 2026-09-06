/* ============================================================
   THE LAKE OF LEMBAYUNG — script.js
   ------------------------------------------------------------
   Hanya mesin geraknya. Kunci berurutan, progres, panel daftar,
   pesan singkat, dan transisi antar level ada di shared/hub.js.

   Panggungnya dua layar mendatar kali dua layar menurun, tapi
   yang boleh ditempuh hanya tiga petak, dan urutannya dijaga:

              .              [ atas  ]        <- awal
                                  |  turun
        [ kiri ] --- geser --- [ kanan ]

   Petak kiri-atas tidak pernah jadi tujuan. Yang menjaganya
   bukan penghalang tak terlihat, melainkan ARAH GERAK yang
   diizinkan di tiap petak — lihat gerbang() di bawah. Cara ini
   dipilih karena mengubah overflow di tengah gerakan membuat
   peramban membuang posisi gulir pada sumbu itu, dan layarnya
   melompat sendiri.
   ============================================================ */
(function () {
  'use strict';

  var WORLD  = 'lake';
  var ROUTES = {
    '1': 'bukit-camar/Index_BukitCamar.html',
    '2': 'sunda-kelapa/index_SundaKelapa.html',
    '3': 'muara-jati/index_MuaraJati.html',
    '4': 'singhasari/index_Singhasari.html'
  };

  /* Petak yang sah, beserta letaknya dalam satuan layar dan arah
     gerak yang boleh dilakukan dari sana. */
  var PETAK = {
    atas:  { kol: 1, baris: 0, gerak: 'pan-y' },        // hanya boleh turun
    kanan: { kol: 1, baris: 1, gerak: 'pan-x pan-y' },  // boleh naik & menggeser
    kiri:  { kol: 0, baris: 1, gerak: 'pan-x' }         // hanya boleh menggeser
  };
  var JALUR = ['atas', 'kanan', 'kiri'];   // urutan perjalanan, bukan letak

  /* Petak mana yang menaungi tombol mana. Dipakai untuk mewarnai
     titik penunjuk sesuai keadaan perjalanan di petak itu. */
  var ISI = { atas: ['1', '2'], kanan: ['3'], kiri: ['4'] };

  var vp    = document.getElementById('viewport');
  var dots  = Array.prototype.slice.call(document.querySelectorAll('.dots__d'));
  var puncak    = document.querySelector('.scene--puncak');
  /* Yang dibesar-kecilkan adalah GAMBARNYA, bukan petaknya.
     Kalau petaknya sendiri yang di-scale, area yang bisa digulir ikut
     melar — panggung 2x2 layar berubah jadi 2,1x2,08 dan snap-nya
     meleset. .scene sudah overflow:hidden, jadi gambar yang membesar
     di dalamnya terpotong rapi tanpa menambah ruang gulir. */
  var puncakArt = document.querySelector('.scene--puncak .scene__art');
  var atapArt   = document.querySelector('.scene--atap .scene__art');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var kolomL = 0, barisT = 0;      // ukuran satu petak, dalam px
  var kini   = '';
  var ticking = false;
  var jamDiam;

  /* ==========================================================
     KUNCI, PROGRES, MENU — semuanya dari shared/hub.js
     ========================================================== */
  var hub = NLHub.mulai({
    dunia: WORLD,
    rute:  ROUTES,
    ganti: function () { warnaiTitik(); }
  });

  function warnaiTitik() {
    JALUR.forEach(function (nama, i) {
      var dot = dots[i];
      if (!dot) return;

      /* Petak "atas" menampung DUA perjalanan sekaligus. Titiknya
         baru dianggap tuntas kalau keduanya tuntas, dan dianggap
         terkunci hanya kalau yang pertama pun belum terbuka. */
      var ids = ISI[nama];
      var semuaTuntas = ids.every(function (id) { return NL.sudahSelesai(WORLD, id); });
      var adaTerbuka  = ids.some(function (id)  { return NL.terbuka(WORLD, id); });

      dot.classList.toggle('is-done', semuaTuntas);
      dot.classList.toggle('is-locked', !adaTerbuka);
    });
  }

  /* ==========================================================
     SLOT GAMBAR SENDIRI
     ----------------------------------------------------------
     Taruh berkasnya di the-lake-of-lembayung/assets/ dengan nama
     di bawah dan gambar itu langsung menggantikan yang digambar
     kode. Ukuran dan pita amannya dijelaskan di assets/README.md.

     Perhatikan bahwa "atap" selebar DUA layar dan dipakai bersama
     oleh Muara Jati dan Singhasari — memang satu pemandangan
     utuh, karena menggeser di baris bawah bukan berpindah tempat
     berdiri, hanya menoleh.
     ========================================================== */
  NLHub.gambar([
    { el: document.querySelector('.skyrow'),                  dasar: 'assets/langit' },  // 2 layar x 1 layar
    { el: document.querySelector('.scene--puncak .scene__art'), dasar: 'assets/puncak' },  // 1 layar x 1 layar
    { el: document.querySelector('.scene--atap .scene__art'),   dasar: 'assets/atap'   },  // 2 layar x 1 layar
    { el: document.querySelector('.atap'),                     dasar: 'assets/genting' }  // 2 layar x pita bawah
  ]);

  /* ==========================================================
     UKURAN & POSISI
     ========================================================== */
  function ukur() {
    kolomL = vp.clientWidth;
    barisT = vp.clientHeight;

    /* Kalau layarnya begitu lebar sampai dua kolom hampir tidak
       ada bedanya, gerak mendatarnya tidak lagi berarti. Tandai
       supaya petunjuk arah berhenti menyuruh menggeser. */
    document.body.classList.toggle('no-scroll', kolomL < 24 || barisT < 24);
  }

  function posisi(nama) {
    var p = PETAK[nama];
    return { left: p.kol * kolomL, top: p.baris * barisT };
  }

  /* Petak terdekat dari posisi gulir sekarang — DI ANTARA YANG SAH
     saja, jadi kalau siswa entah bagaimana sampai di sudut kosong,
     yang terbaca tetap petak sah yang paling dekat. */
  function petakTerdekat() {
    var x = vp.scrollLeft, y = vp.scrollTop;
    var pilih = 'atas', terbaik = Infinity;
    for (var nama in PETAK) {
      if (!Object.prototype.hasOwnProperty.call(PETAK, nama)) continue;
      var p = posisi(nama);
      var d = Math.pow(p.left - x, 2) + Math.pow(p.top - y, 2);
      if (d < terbaik) { terbaik = d; pilih = nama; }
    }
    return pilih;
  }

  function diSudutKosong() {
    return vp.scrollTop < barisT / 2 && vp.scrollLeft < kolomL / 2;
  }

  /* ==========================================================
     GERBANG URUTAN
     ----------------------------------------------------------
     touch-action menolak GERAKAN JARI ke arah yang belum boleh,
     tanpa menyentuh posisi gulir sama sekali. Itu sebabnya cara
     ini dipakai, bukan overflow:hidden.

     Tetikus dan papan ketik tidak tunduk pada touch-action, jadi
     ada jaring pengaman terpisah di diam().
     ========================================================== */
  function gerbang(nama) {
    vp.style.touchAction = (PETAK[nama] || PETAK.atas).gerak;
  }

  /* ==========================================================
     MENGGAMBAR ULANG
     ========================================================== */
  function render() {
    ticking = false;

    /* Seberapa jauh perjalanan turunnya, 0 di puncak dan 1 di atap. */
    var t = barisT ? Math.min(1, Math.max(0, vp.scrollTop / barisT)) : 0;

    if (!reduce) {
      /* Pemandangan puncak membesar lalu memudar saat ditinggalkan,
         dan pemandangan atap datang dari keadaan sedikit membesar
         lalu mengendap. Dua gerakan itu yang membuat perpindahannya
         terbaca sebagai TURUN, bukan sekadar berganti gambar. */
      if (puncakArt) puncakArt.style.transform = 'scale(' + (1 + 0.16 * t).toFixed(4) + ')';
      if (puncak)    puncak.style.opacity       = (1 - 0.9 * t).toFixed(3);
      if (atapArt)   atapArt.style.transform    = 'scale(' + (1.1 - 0.1 * t).toFixed(4) + ')';
    }

    var nama = petakTerdekat();
    if (nama !== kini) {
      kini = nama;
      document.body.setAttribute('data-cell', nama);
      var i = JALUR.indexOf(nama);
      dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
    }
  }

  vp.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(render); }
    clearTimeout(jamDiam);
    jamDiam = setTimeout(diam, 140);
  }, { passive: true });

  /* Dipanggil setelah gerakan berhenti, bukan selagi berlangsung:
     mengubah gerbang di tengah gerakan akan memotong luncurannya. */
  function diam() {
    if (diSudutKosong()) {
      /* Jaring pengaman untuk roda tetikus dan papan ketik, yang
         tidak tunduk pada touch-action. Ditarik kembali ke petak sah
         terdekat alih-alih ditinggal di sudut yang tidak pernah
         jadi tujuan. */
      keTujuan(petakTerdekat(), true);
      return;
    }
    gerbang(petakTerdekat());
  }

  /* ==========================================================
     BERPINDAH PETAK
     ========================================================== */
  function keTujuan(nama, halus) {
    var p = posisi(nama);
    gerbang(nama);   // gerbang dibuka lebih dulu, kalau tidak gerakannya sendiri tertahan
    vp.scrollTo({ left: p.left, top: p.top, behavior: (halus && !reduce) ? 'smooth' : 'auto' });
  }

  /* Melompat dari puncak langsung ke Singhasari berarti memotong
     sudut kosong. Dilewatkan Muara Jati dulu — sekalian
     memperlihatkan jalurnya, bukan cuma memindahkan layar. */
  function keJalur(nama) {
    var dari = JALUR.indexOf(kini);
    var ke   = JALUR.indexOf(nama);
    if (dari === 0 && ke === 2) {
      keTujuan('kanan', true);
      setTimeout(function () { keTujuan('kiri', true); }, reduce ? 0 : 480);
      return;
    }
    if (dari === 2 && ke === 0) {
      keTujuan('kanan', true);
      setTimeout(function () { keTujuan('atas', true); }, reduce ? 0 : 480);
      return;
    }
    keTujuan(nama, true);
  }

  dots.forEach(function (d) {
    d.addEventListener('click', function () { keJalur(d.dataset.go); });
  });

  /* Papan ketik: panah mengikuti jalur yang sama, bukan menggulir
     sedikit demi sedikit ke arah mana pun. */
  vp.addEventListener('keydown', function (e) {
    var tujuan = null;
    if (e.key === 'ArrowDown'  && kini === 'atas')  tujuan = 'kanan';
    if (e.key === 'ArrowUp'    && kini === 'kanan') tujuan = 'atas';
    if (e.key === 'ArrowLeft'  && kini === 'kanan') tujuan = 'kiri';
    if (e.key === 'ArrowRight' && kini === 'kiri')  tujuan = 'kanan';
    if (!tujuan) return;
    e.preventDefault();
    keTujuan(tujuan, true);
  });

  /* ==========================================================
     MULAI
     ========================================================== */
  function boot() {
    ukur();
    hub.terapkan();

    /* Dibuka di petak PUNCAK, kolom kanan. Snap dimatikan sesaat:
       dengan snap menyala, lompatan awal ini kadang ditarik balik
       peramban ke petak terdekat dari titik nol. */
    vp.style.scrollSnapType = 'none';
    var p = posisi('atas');
    vp.scrollLeft = p.left;
    vp.scrollTop  = p.top;
    kini = 'atas';
    document.body.setAttribute('data-cell', 'atas');
    gerbang('atas');
    requestAnimationFrame(function () {
      vp.style.scrollSnapType = '';
      render();
    });
  }
  boot();

  var jamUkur;
  function ukurUlang() {
    var was = kini || 'atas';
    ukur();
    var p = posisi(was);
    vp.scrollLeft = p.left;
    vp.scrollTop  = p.top;
    render();
  }
  window.addEventListener('resize', function () {
    clearTimeout(jamUkur); jamUkur = setTimeout(ukurUlang, 160);
  });
  window.addEventListener('orientationchange', function () {
    setTimeout(ukurUlang, 320);
  });
})();
