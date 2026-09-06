/* ============================================================
   NARRATIVE LEARN — narrative-learn.js
   ------------------------------------------------------------
   Isi berkas ini:
   1. ROUTES        : satu tempat untuk mengatur tujuan tautan
   2. Dekorasi      : pohon, ombak, awan, burung (acak tapi konsisten)
   3. Parallax      : 3 lapis bergerak beda kecepatan saat digeser
   4. Titik henti   : geser bersnap ke Ocean / Beranda / Lake
   5. Chrome        : kartu, indikator, panel daftar
   ============================================================ */
(function () {
  'use strict';

  /* ==========================================================
     1. ROUTES — ubah di sini kalau struktur foldermu berbeda
     ========================================================== */
  var ROUTES = {
    ocean: 'ocean-journey/index.html',
    lake:  'lake-lembayung/index.html'
  };

  ['hsOcean', 'lnkOcean', 'pinOcean'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.setAttribute('href', ROUTES.ocean);
  });
  ['hsLake', 'lnkLake', 'pinLake'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.setAttribute('href', ROUTES.lake);
  });

  /* ==========================================================
     Pintasan & keadaan global
     ========================================================== */
  var vp      = document.getElementById('viewport');
  var artMap  = document.getElementById('artMap');
  var layers  = Array.prototype.slice.call(document.querySelectorAll('.layer'));
  var snaps   = Array.prototype.slice.call(document.querySelectorAll('.snap'));
  var dots    = Array.prototype.slice.call(document.querySelectorAll('.dots__d'));
  var hint    = document.getElementById('dockHint');

  // Kartu & penanda dipilih lewat atribut data-stop, bukan id, supaya
  // mesin ini apa adanya bisa dipakai ulang untuk 3, 4, atau N titik henti
  // di halaman Ocean Journey dan Lake of Lembayung.
  var cards = Array.prototype.slice.call(document.querySelectorAll('.dcard'));
  var pins  = Array.prototype.slice.call(document.querySelectorAll('.pin'));

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SVGNS  = 'http://www.w3.org/2000/svg';

  var stops     = [0, 0, 0];   // scrollLeft untuk tiap titik henti
  var maxScroll = 0;
  var current   = -1;

  /* ==========================================================
     2. DEKORASI
     ----------------------------------------------------------
     Memakai PRNG berbenih (mulberry32) supaya susunan pohon,
     ombak dan awan SELALU SAMA setiap kali halaman dimuat.
     Ganti angka benihnya kalau ingin komposisi lain.
     ========================================================== */
  function makeRng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function el(name, attrs) {
    var n = document.createElementNS(SVGNS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  /* ---------- Pohon ----------
     Zona hanya mencakup daratan (menghindari laut dan danau).
     Pohon yang lebih dekat ke cakrawala digambar lebih kecil dan
     lebih pucat -> perspektif atmosfer. */
  function growTrees() {
    var g = document.getElementById('trees');
    if (!g) return;

    var zones = [
      { x: 1190, y:  920, w:  500, h: 460, n: 18 },   // daratan kiri-tengah
      { x: 1770, y: 1030, w:  500, h: 440, n: 18 },   // daratan depan
      { x: 2320, y: 1090, w: 1380, h: 400, n: 26 },   // tepi bawah danau
      { x: 1280, y:  640, w:  880, h: 230, n: 14 },   // lereng bukit tengah
      { x: 2400, y:  452, w: 1160, h: 118, n: 16 },   // pantai jauh di atas danau
      { x: 3016, y:  806, w:  104, h:  44, n:  5 }    // kaki bukit di pulau
    ];

    var rnd = makeRng(20250816);

    zones.forEach(function (z) {
      for (var i = 0; i < z.n; i++) {
        var x = z.x + rnd() * z.w;
        var y = z.y + rnd() * z.h;

        // skala perspektif: makin ke bawah (makin dekat) makin besar
        var s = 0.40 + 0.80 * Math.min(1, Math.max(0, (y - 420) / 1100));
        s *= 0.82 + rnd() * 0.4;

        var w = 24 * s, h = 54 * s;
        var fade = 0.30 + 0.38 * Math.min(1, (y - 380) / 900);

        g.appendChild(el('path', {
          d: 'M' + x + ',' + y + ' l' + (-w) + ',0 l' + w + ',' + (-h) + ' l' + w + ',' + h + ' z',
          fill: '#1e4835',
          opacity: fade.toFixed(3)
        }));
        g.appendChild(el('path', {
          d: 'M' + x + ',' + y + ' l' + (-w) + ',0 l' + w + ',' + (-h) + ' z',
          fill: '#4e8a66',
          opacity: (fade * 0.85).toFixed(3)
        }));
      }
    });
  }

  /* ---------- Riak ombak ----------
     Batas kanan tiap riak mengikuti garis pantai supaya ombak
     tidak pernah "naik" ke daratan. */
  function coastXAt(y) {
    var pts = [[146, 1250], [520, 1120], [820, 860], [1160, 1010], [1600, 1170]];
    if (y <= pts[0][0]) return pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      if (y <= pts[i][0]) {
        var t = (y - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]);
        return pts[i - 1][1] + t * (pts[i][1] - pts[i - 1][1]);
      }
    }
    return pts[pts.length - 1][1];
  }

  function drawWaves() {
    var g = document.getElementById('waves');
    if (!g) return;
    var rnd = makeRng(777);

    for (var i = 0; i < 58; i++) {
      var y = 240 + rnd() * 1300;
      var limit = coastXAt(y) - 90;
      if (limit < 120) continue;
      var x = 40 + rnd() * (limit - 40);

      var s = 0.45 + 0.9 * Math.min(1, (y - 180) / 1300);
      var w = 44 * s;

      g.appendChild(el('path', {
        d: 'M' + x + ',' + y + ' q ' + (w / 2) + ',' + (-9 * s) + ' ' + w + ',0',
        opacity: (0.08 + rnd() * 0.18).toFixed(3),
        'stroke-width': (6 * s).toFixed(1)
      }));
    }
  }

  /* ---------- Awan jauh + burung jauh (lapis langit) ---------- */
  function drawSky() {
    var svg = document.getElementById('skyDeco');
    if (!svg) return;
    var rnd = makeRng(31415);

    // Hanya paruh kiri lapis langit yang pernah masuk layar
    // (lihat catatan parallax di bawah), jadi awan cukup di situ.
    for (var i = 0; i < 15; i++) {
      var cx = 80 + rnd() * 1900;
      var cy = 120 + rnd() * 420;
      var sc = 0.55 + rnd() * 0.9;
      var g  = el('g', { opacity: (0.10 + rnd() * 0.2).toFixed(3), fill: '#ffffff' });

      for (var b = 0; b < 4; b++) {
        g.appendChild(el('ellipse', {
          cx: cx + (b - 1.5) * 62 * sc,
          cy: cy + (rnd() - 0.5) * 22 * sc,
          rx: (52 + rnd() * 48) * sc,
          ry: (20 + rnd() * 14) * sc
        }));
      }
      svg.appendChild(g);
    }

    for (var k = 0; k < 8; k++) {
      var bx = 140 + rnd() * 1700;
      var by = 130 + rnd() * 300;
      var bs = 0.5 + rnd() * 0.5;
      svg.appendChild(el('path', {
        d: 'M' + bx + ',' + by +
           ' q ' + (9 * bs) + ',' + (-7 * bs) + ' ' + (18 * bs) + ',0' +
           ' q ' + (9 * bs) + ',' + (-7 * bs) + ' ' + (18 * bs) + ',0',
        fill: 'none', stroke: '#ffffff',
        'stroke-width': 2.4 * bs, 'stroke-linecap': 'round',
        opacity: (0.16 + rnd() * 0.2).toFixed(3)
      }));
    }
  }

  /* ---------- Awan dekat + burung dekat (lapis depan) ----------
     Inilah yang menjual kesan "kamu sedang terbang": awan besar
     lewat di bawah kita, burung melintas dekat kamera. */
  function drawFore() {
    var svg = document.getElementById('foreDeco');
    if (!svg) return;
    var rnd = makeRng(2718);

    for (var i = 0; i < 12; i++) {
      var cx = 60 + rnd() * 3700;
      var cy = 320 + rnd() * 280;
      var sc = 1.3 + rnd() * 1.5;
      var g  = el('g', { opacity: (0.07 + rnd() * 0.11).toFixed(3), fill: '#ffffff' });

      for (var b = 0; b < 5; b++) {
        g.appendChild(el('ellipse', {
          cx: cx + (b - 2) * 88 * sc,
          cy: cy + (rnd() - 0.5) * 34 * sc,
          rx: (78 + rnd() * 66) * sc,
          ry: (26 + rnd() * 20) * sc
        }));
      }
      svg.appendChild(g);
    }

    for (var k = 0; k < 4; k++) {
      var bx = 260 + rnd() * 3200;
      var by = 70 + rnd() * 190;
      var bs = 1.4 + rnd() * 1.2;
      svg.appendChild(el('path', {
        d: 'M' + bx + ',' + by +
           ' q ' + (11 * bs) + ',' + (-9 * bs) + ' ' + (22 * bs) + ',0' +
           ' q ' + (11 * bs) + ',' + (-9 * bs) + ' ' + (22 * bs) + ',0',
        fill: 'none', stroke: '#12374d',
        'stroke-width': 3 * bs, 'stroke-linecap': 'round',
        opacity: (0.10 + rnd() * 0.1).toFixed(3)
      }));
    }
  }

  growTrees();
  drawWaves();
  drawSky();
  drawFore();

  /* ==========================================================
     3. PARALLAX
     ----------------------------------------------------------
     Setiap lapis ikut tergulir dengan kecepatan 1. Untuk membuat
     kecepatan berbeda, lapis digeser balik sebesar
     scrollLeft * (1 - speed):
       speed 0.30  -> ikut lambat  (langit, jauh)
       speed 1.00  -> tepat        (peta)
       speed 1.35  -> ikut cepat   (awan dekat, di depan kamera)
     Sengaja memakai transform, bukan left, agar dikerjakan GPU.
     ========================================================== */
  var moving = layers.filter(function (l) {
    return parseFloat(l.dataset.speed) !== 1;
  });

  var ticking = false;

  function render() {
    ticking = false;
    var s = vp.scrollLeft;

    if (!reduce) {
      for (var i = 0; i < moving.length; i++) {
        var sp = parseFloat(moving[i].dataset.speed);
        moving[i].style.transform =
          'translate3d(' + (s * (1 - sp)).toFixed(2) + 'px,0,0)';
      }
    }

    // Titik henti terdekat menentukan kartu mana yang tampil
    var near = 0, best = Infinity;
    for (var j = 0; j < stops.length; j++) {
      var d = Math.abs(stops[j] - s);
      if (d < best) { best = d; near = j; }
    }
    if (near !== current) setStop(near);
  }

  function setStop(i) {
    current = i;
    document.body.setAttribute('data-stop', String(i));
    dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });

    cards.forEach(function (c) { c.classList.toggle('is-active', +c.dataset.stop === i); });
    pins.forEach(function (p) { p.classList.toggle('is-active', +p.dataset.stop === i); });

    // Di halaman ini titik henti tengah tidak punya kartu, jadi petunjuk
    // geser yang mengisi tempatnya.
    if (hint) hint.classList.toggle('is-active', i === 1);
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(render); }
  }
  vp.addEventListener('scroll', onScroll, { passive: true });

  /* ==========================================================
     4. TITIK HENTI
     ----------------------------------------------------------
     Posisi diambil langsung dari elemen .snap di dalam peta,
     jadi koordinat di HTML adalah satu-satunya sumber kebenaran.
     ========================================================== */
  function measure() {
    var vw = vp.clientWidth;
    maxScroll = Math.max(0, vp.scrollWidth - vw);

    stops = snaps.map(function (n) {
      var centre = artMap.offsetLeft + n.offsetLeft + n.offsetWidth / 2;
      return Math.min(maxScroll, Math.max(0, Math.round(centre - vw / 2)));
    });

    // Di layar lebar, posisi henti bisa terjepit ke nilai yang sama
    // karena gulirnya pendek. Kalau itu terjadi, tombol titik terasa
    // rusak (ditekan tapi tidak pindah). Lebih baik beralih ke mode
    // "semua kartu tampil sekaligus".
    var cramped = false;
    for (var k = 1; k < stops.length; k++) {
      if (stops[k] - stops[k - 1] < 40) { cramped = true; break; }
    }
    document.body.classList.toggle('no-scroll', maxScroll < 24 || cramped);
  }

  function goTo(i, smooth) {
    if (typeof stops[i] !== 'number') return;
    vp.scrollTo({ left: stops[i], behavior: (smooth && !reduce) ? 'smooth' : 'auto' });
  }

  dots.forEach(function (d) {
    d.addEventListener('click', function () {
      goTo(parseInt(d.dataset.go, 10), true);
    });
  });

  // Panah kiri/kanan untuk pengguna keyboard
  vp.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    goTo(Math.min(2, Math.max(0, current + (e.key === 'ArrowRight' ? 1 : -1))), true);
  });

  /* ==========================================================
     5. PROGRES — DITAMPILKAN, BUKAN DIPAKAI MENGUNCI
     ----------------------------------------------------------
     Halaman ini adalah level 1: peta, identitas, dan ringkasan
     kemajuan. Tugasnya HANYA mengantar ke level 2 (hub Ocean
     Journey / The Lake of Lembayung). Dari sini tidak ada
     tautan langsung ke satu pun platform permainan (level 3);
     satu-satunya pintu ke sana adalah lewat hub-nya.

     Kedua tautan ke level 2 SELALU terbuka, termasuk saat belum
     ada satu pun perjalanan yang selesai. Sebelumnya The Lake of
     Lembayung dikunci di sini sampai Ocean Journey tuntas, dan
     akibatnya separuh situs tidak bisa dilihat sama sekali.

     Kunci berurutan tetap ada, hanya pindah tempat: yang
     menentukan boleh-tidaknya sebuah permainan DIMULAI adalah
     kartu di hub (level 2) dan gerbang di dalam platformnya
     sendiri (level 3). Di halaman ini kunci itu hanya
     DITAMPILKAN sebagai status, lewat daftar ringkas di tiap
     kartu, supaya siswa tahu apa yang menunggunya sebelum ia
     masuk.
     ========================================================== */
  var toastEl = document.getElementById('toast');
  var jamToast;
  function toast(pesan) {
    if (!toastEl) return;
    toastEl.textContent = pesan;
    toastEl.classList.add('is-on');
    clearTimeout(jamToast);
    jamToast = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3200);
  }

  /* Daftar ringkas platform level 3 di dalam satu kartu dunia.
     Bukan tautan — cuma penunjuk keadaan. Menekan salah satunya
     tetap membuka hub dunia itu, bukan platformnya langsung. */
  function isiDaftarPlatform(c, w) {
    var wadah = c.querySelector('.dcard__stops');
    if (!wadah) return;
    var nama = NL.PLATFORM[w] || [];
    wadah.textContent = '';

    nama.forEach(function (judul, i) {
      var keadaan = NL.keadaan(w, i + 1);
      var b = document.createElement('b');
      b.className = 'dstop is-' + keadaan;
      b.textContent = judul;
      b.setAttribute('aria-label',
        judul + ' — ' + (keadaan === 'selesai'  ? 'sudah selesai'
                       : keadaan === 'terbuka'  ? 'bisa dikerjakan'
                                                : 'masih terkunci'));
      wadah.appendChild(b);
    });
  }

  function terapkanProgres() {
    cards.forEach(function (c) {
      var w      = c.dataset.world;
      var total  = +c.dataset.total;
      var tuntas = NL.duniaTuntas(w);
      var n      = NL.jumlahSelesai(w, total);

      /* Tidak ada is-locked di sini lagi: tautan ke hub selalu hidup. */
      c.classList.remove('is-locked');
      c.removeAttribute('aria-disabled');
      c.classList.toggle('is-done', tuntas);
      c.setAttribute('href', ROUTES[w]);

      /* Baris atas kartu sekaligus jadi penunjuk kemajuan */
      var eb = c.querySelector('.dcard__eyebrow');
      if (!eb.dataset.orig) eb.dataset.orig = eb.textContent;
      eb.textContent = tuntas ? 'Tuntas · ' + total + ' perjalanan'
                     : n > 0  ? n + ' dari ' + total + ' selesai'
                              : eb.dataset.orig;

      isiDaftarPlatform(c, w);
    });

    pins.forEach(function (p) {
      p.classList.remove('is-locked');
      p.setAttribute('href', ROUTES[p.dataset.world]);
    });

    [document.getElementById('lnkOcean'), document.getElementById('lnkLake')].forEach(function (a) {
      if (!a) return;
      var w = a.dataset.world;
      a.classList.remove('is-locked');
      a.setAttribute('href', ROUTES[w]);
      var em = a.querySelector('em');
      if (em) {
        if (!em.dataset.orig) em.dataset.orig = em.textContent;
        var n = NL.jumlahSelesai(w, NL.JUMLAH[w]);
        em.textContent = n > 0 ? em.dataset.orig + ' · ' + n + ' selesai'
                               : em.dataset.orig;
      }
    });
  }

  /* ==========================================================
     5b. TRANSISI ZOOM MENUJU LEVEL 2
     ----------------------------------------------------------
     Peta membesar ke arah penanda dunia yang ditekan, lalu
     halaman hub dibuka dengan zoom masuk yang menyambung dari
     titik yang sama (lihat "TRANSISI MASUK" di script.js tiap
     hub). Aba-abanya dititipkan lewat sessionStorage, bukan
     lewat alamat, supaya alamat hub tetap bersih dan bisa
     ditandai atau dibagikan apa adanya.

     Kalau siswa memilih "kurangi gerakan" di pengaturan HP-nya,
     seluruh animasi dilewati dan halaman langsung berpindah.
     ========================================================== */
  var LAMA_ZOOM = 420;   // harus sama dengan durasi transisi di style.css
  var sedangZoom = false;

  function zoomKeDunia(w, tujuan) {
    if (reduce) { location.href = tujuan; return; }
    if (sedangZoom) return;
    sedangZoom = true;

    /* Titik pusat pembesaran = penanda dunia itu di atas peta, supaya
       gerakannya terasa "masuk ke tempat ini", bukan sekadar layar
       yang membesar. Kalau penandanya sedang di luar layar, pusatnya
       jatuh ke tengah viewport. */
    var pin = pins.filter(function (p) { return p.dataset.world === w; })[0];
    var rv  = vp.getBoundingClientRect();
    var ox  = rv.width / 2;
    var oy  = rv.height / 2;
    if (pin) {
      var rp = pin.getBoundingClientRect();
      if (rp.width) {
        ox = rp.left + rp.width  / 2 - rv.left;
        oy = rp.top  + rp.height / 2 - rv.top;
      }
    }
    vp.style.transformOrigin = ox + 'px ' + oy + 'px';

    try { sessionStorage.setItem('nl:zoom', w); } catch (e) {}
    document.body.classList.add('is-zooming');
    setTimeout(function () { location.href = tujuan; }, LAMA_ZOOM);
  }

  function antar(e) {
    var el = e.currentTarget;
    var w  = el.dataset.world;
    if (!w || !ROUTES[w]) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return; // buka di tab baru
    e.preventDefault();
    zoomKeDunia(w, ROUTES[w]);
  }
  cards.forEach(function (c) { c.addEventListener('click', antar); });
  pins.forEach(function (p) { p.addEventListener('click', antar); });
  [document.getElementById('lnkOcean'), document.getElementById('lnkLake')].forEach(function (a) {
    if (a) a.addEventListener('click', antar);
  });

  /* Kembali dari hub lewat tombol Back peramban memulihkan halaman ini
     dari bfcache LENGKAP dengan kelas is-zooming-nya — layarnya akan
     tampak kosong. Jadi keadaannya dibersihkan tiap kali halaman
     ditampilkan lagi. */
  window.addEventListener('pageshow', function () {
    sedangZoom = false;
    document.body.classList.remove('is-zooming');
    vp.style.transformOrigin = '';
  });

  /* ==========================================================
     6. IDENTITAS SISWA
     ----------------------------------------------------------
     Menulis nl_student_v1 = { name, class }. Platform level 3
     SUDAH membaca kunci itu untuk menyapa siswa dan mengisi kode
     hasil yang disalin ke guru — tanpa layar ini, kode hasil
     terkirim tanpa nama.
     ========================================================== */
  var gate      = document.getElementById('idGate');
  var inNama    = document.getElementById('idNama');
  var inKelas   = document.getElementById('idKelas');
  var btnSimpan = document.getElementById('idSimpan');
  var btnLewati = document.getElementById('idLewati');
  var chip      = document.getElementById('studentChip');

  function tampilkanChip() {
    var s = NL.siswa();
    if (s && s.name) {
      chip.hidden = false;
      chip.textContent = '👋 ' + s.name;
      chip.setAttribute('aria-label', 'Nama: ' + s.name +
        (s.class ? ', kelas ' + s.class : '') + '. Ketuk untuk mengubah.');
    } else {
      chip.hidden = true;
    }
  }

  function periksaIsian() {
    btnSimpan.disabled = inNama.value.trim().length < 2;
  }

  function bukaGate() {
    var s = NL.siswa();
    inNama.value  = (s && s.name)  || '';
    inKelas.value = (s && s.class) || '';
    periksaIsian();
    gate.hidden = false;
    /* Jangan langsung fokus ke input: di HP itu membuka papan ketik
       dan menutupi separuh layar sebelum siswa sempat membaca
       penjelasannya. */
  }

  function tutupGate() { gate.hidden = true; }

  inNama.addEventListener('input', periksaIsian);
  inNama.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); inKelas.focus(); }
  });
  inKelas.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !btnSimpan.disabled) { e.preventDefault(); btnSimpan.click(); }
  });

  btnSimpan.addEventListener('click', function () {
    if (btnSimpan.disabled) return;
    NL.simpanSiswa(inNama.value, inKelas.value);
    tutupGate();
    tampilkanChip();
  });

  /* "Lewati" sengaja TIDAK menyimpan apa pun, jadi layar ini muncul
     lagi di kunjungan berikutnya. Kalau dilewati diam-diam disimpan
     sebagai nama kosong, siswa itu tidak akan pernah ditanya lagi
     dan hasilnya selamanya tanpa nama. */
  btnLewati.addEventListener('click', tutupGate);

  chip.addEventListener('click', bukaGate);

  document.addEventListener('keydown', function (e) {
    /* Esc hanya menutup kalau sudah ada nama tersimpan (mode ubah).
       Saat pertama kali, layar ini gerbang. */
    if (e.key === 'Escape' && !gate.hidden && NL.siswa()) tutupGate();
  });

  /* ==========================================================
     7. PANEL DAFTAR PLATFORM
     ========================================================== */
  var sheet      = document.getElementById('sheet');
  var backdrop   = document.getElementById('sheetBackdrop');
  var menuBtn    = document.getElementById('menuBtn');
  var sheetClose = document.getElementById('sheetClose');

  function openSheet() {
    sheet.hidden = false; backdrop.hidden = false;
    requestAnimationFrame(function () {
      sheet.classList.add('is-on');
      backdrop.classList.add('is-on');
    });
    menuBtn.setAttribute('aria-expanded', 'true');
    document.getElementById('lnkOcean').focus();
  }

  function closeSheet() {
    sheet.classList.remove('is-on');
    backdrop.classList.remove('is-on');
    menuBtn.setAttribute('aria-expanded', 'false');
    setTimeout(function () { sheet.hidden = true; backdrop.hidden = true; }, 320);
    menuBtn.focus();
  }

  menuBtn.addEventListener('click', function () {
    if (menuBtn.getAttribute('aria-expanded') === 'true') closeSheet();
    else openSheet();
  });
  backdrop.addEventListener('click', closeSheet);
  sheetClose.addEventListener('click', closeSheet);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !sheet.hidden) closeSheet();
  });

  /* ==========================================================
     Penyetelan awal
     ========================================================== */
  function boot() {
    measure();
    terapkanProgres();
    tampilkanChip();
    if (!NL.siswa()) bukaGate();
    vp.scrollLeft = stops[1];     // MULAI DARI TENGAH
    setStop(1);
    render();
  }
  boot();

  // Progres berubah saat siswa kembali dari sebuah dunia.
  // pageshow menangkap juga kasus "kembali" dari bfcache.
  window.addEventListener('pageshow', terapkanProgres);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) terapkanProgres();
  });

  // Ukur ulang saat orientasi berubah atau bilah alamat menyusut
  var rz;
  window.addEventListener('resize', function () {
    clearTimeout(rz);
    rz = setTimeout(function () {
      var was = current < 0 ? 1 : current;
      measure();
      vp.scrollLeft = stops[was];
      render();
    }, 160);
  });

  window.addEventListener('orientationchange', function () {
    setTimeout(function () {
      var was = current < 0 ? 1 : current;
      measure();
      vp.scrollLeft = stops[was];
      render();
    }, 320);
  });
})();
