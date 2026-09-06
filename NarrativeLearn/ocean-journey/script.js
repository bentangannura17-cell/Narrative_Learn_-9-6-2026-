/* ============================================================
   OCEAN JOURNEY — script.js
   ------------------------------------------------------------
   Hanya mesin geraknya. Kunci berurutan, progres, panel daftar,
   pesan singkat, dan transisi antar level ada di shared/hub.js.

   Cara panggungnya bekerja:

     .viewport  jendela selebar layar, digeser dengan jari
     .world     isinya, selebar TIGA layar
     .layer     empat lapis yang bergeser dengan kecepatan beda

   Lapis dengan data-speed 1 bergerak persis seperti gulirnya.
   Yang lebih kecil dari 1 tertinggal — itu yang membuatnya
   terbaca sebagai jauh. Yang lebih besar dari 1 mendahului —
   itu yang membuatnya terbaca sebagai dekat dengan lambung.

   Perjalanan dimulai dari panel PALING KANAN (Nusa Barat) lalu
   bergerak ke kiri, karena kapalnya berlayar ke kanan sementara
   pandangan menoleh ke kiri.
   ============================================================ */
(function () {
  'use strict';

  var WORLD  = 'ocean';
  var ROUTES = {
    '1': 'nusa-barat/index_NusaBarat.html',
    '2': 'nusa-timur/index_NusaTimur.html',
    '3': 'nusa-selatan/index_NusaSelatan.html'
  };

  var vp     = document.getElementById('viewport');
  var snaps  = Array.prototype.slice.call(document.querySelectorAll('.snap'));
  var dots   = Array.prototype.slice.call(document.querySelectorAll('.dots__d'));
  var layers = Array.prototype.slice.call(document.querySelectorAll('.layer'));

  /* Lapis yang kecepatannya persis 1 tidak perlu disentuh sama sekali:
     ia sudah bergerak bersama gulirnya. Menyaringnya di sini berarti
     satu elemen lebih sedikit yang digambar ulang tiap frame. */
  var bergerak = layers.filter(function (l) {
    return parseFloat(l.dataset.speed) !== 1;
  });

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var stops   = [];
  var current = -1;
  var ticking = false;

  /* ==========================================================
     KUNCI, PROGRES, MENU — semuanya dari shared/hub.js
     ========================================================== */
  var hub = NLHub.mulai({
    dunia: WORLD,
    rute:  ROUTES,

    /* Titik penunjuk di bawah layar ikut mengabarkan keadaan tiap
       pulau, supaya siswa tahu ada apa di panel sebelah sebelum
       menggeser ke sana. */
    ganti: function (kartu, terbuka, tuntas) {
      var dot = dots[+kartu.dataset.stop];
      if (!dot) return;
      dot.classList.toggle('is-done', terbuka && tuntas);
      dot.classList.toggle('is-locked', !terbuka);
    }
  });

  /* ==========================================================
     SLOT GAMBAR SENDIRI
     ----------------------------------------------------------
     Taruh berkasnya di ocean-journey/assets/ dengan nama di bawah
     dan gambar itu langsung menggantikan yang digambar kode.
     Tidak ada yang perlu diubah di sini. Ukuran dan pita amannya
     dijelaskan di assets/README.md.

     Lapis-lapisnya sengaja dipisah supaya gerak berlapisnya tetap
     ada: langit bergerak paling lambat, pesisir mengikuti geseran
     apa adanya, kapal tidak bergerak sama sekali. Kalau kamu cuma
     punya SATU gambar panorama, taruh saja sebagai "pesisir" dan
     biarkan slot yang lain kosong — hasilnya tetap benar, hanya
     kedalamannya yang hilang.
     ========================================================== */
  NLHub.gambar([
    { el: document.querySelector('.layer--sky'),   dasar: 'assets/langit'  },  // 3 layar x 1 layar
    { el: document.querySelector('.layer--ridge'), dasar: 'assets/bukit'   },  // 3 layar x 1 layar, PNG transparan
    { el: document.querySelector('.layer--isles'), dasar: 'assets/pesisir' },  // 3 layar x 1 layar
    { el: document.querySelector('.ship'),         dasar: 'assets/kapal'   }   // 1 layar x 1 layar, PNG transparan
  ]);

  /* ==========================================================
     PARALLAX
     ========================================================== */
  function render() {
    ticking = false;
    var s = vp.scrollLeft;

    if (!reduce) {
      for (var i = 0; i < bergerak.length; i++) {
        var sp = parseFloat(bergerak[i].dataset.speed);
        bergerak[i].style.transform =
          'translate3d(' + (s * (1 - sp)).toFixed(2) + 'px,0,0)';
      }
    }

    var dekat = 0, terbaik = Infinity;
    for (var j = 0; j < stops.length; j++) {
      var d = Math.abs(stops[j] - s);
      if (d < terbaik) { terbaik = d; dekat = j; }
    }
    if (dekat !== current) setStop(dekat);
  }

  function setStop(i) {
    current = i;
    document.body.setAttribute('data-stop', String(i));
    dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
    hub.kartu.forEach(function (c) {
      c.classList.toggle('is-active', +c.dataset.stop === i);
    });
  }

  vp.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(render); }
  }, { passive: true });

  /* ==========================================================
     TITIK HENTI
     ========================================================== */
  function ukur() {
    var lebar = vp.clientWidth;
    var maks  = Math.max(0, vp.scrollWidth - lebar);

    stops = snaps.map(function (n) {
      return Math.min(maks, Math.max(0, Math.round(n.offsetLeft)));
    });

    /* Di layar yang sangat lebar, gulirnya bisa jadi terlalu pendek
       sehingga dua perhentian jatuh di angka yang nyaris sama. Kalau
       itu terjadi, tombol titik terasa rusak — ditekan tapi tidak
       pindah. Lebih jujur beralih ke mode "semua tombol tampil". */
    var sempit = false;
    for (var k = 1; k < stops.length; k++) {
      if (stops[k] - stops[k - 1] < 40) { sempit = true; break; }
    }
    document.body.classList.toggle('no-scroll', maks < 24 || sempit);
  }

  function keStop(i, halus) {
    if (typeof stops[i] !== 'number') return;
    vp.scrollTo({ left: stops[i], behavior: (halus && !reduce) ? 'smooth' : 'auto' });
  }

  dots.forEach(function (d) {
    d.addEventListener('click', function () {
      keStop(parseInt(d.dataset.go, 10), true);
    });
  });

  /* Panah kiri-kanan menggerakkan panel, bukan menggulir sedikit demi
     sedikit: pengguna papan ketik harus bisa berpindah pulau secepat
     jari menggeser. */
  vp.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    var tujuan = current + (e.key === 'ArrowRight' ? 1 : -1);
    keStop(Math.min(stops.length - 1, Math.max(0, tujuan)), true);
  });

  /* ==========================================================
     MULAI
     ========================================================== */
  function boot() {
    ukur();
    hub.terapkan();

    /* Dibuka di panel PALING KANAN: di sanalah Nusa Barat, perjalanan
       pertama. Snap sengaja dimatikan sesaat — dengan scroll-snap
       menyala, lompatan awal ini kadang ditarik balik peramban ke
       panel terdekat dari posisi 0. */
    vp.style.scrollSnapType = 'none';
    vp.scrollLeft = stops[stops.length - 1];
    setStop(stops.length - 1);
    requestAnimationFrame(function () {
      vp.style.scrollSnapType = '';
      render();
    });
  }
  boot();

  var jamUkur;
  function ukurUlang() {
    var was = current < 0 ? stops.length - 1 : current;
    ukur();
    vp.scrollLeft = stops[was];
    render();
  }
  window.addEventListener('resize', function () {
    clearTimeout(jamUkur); jamUkur = setTimeout(ukurUlang, 160);
  });
  window.addEventListener('orientationchange', function () {
    setTimeout(ukurUlang, 320);
  });
})();
