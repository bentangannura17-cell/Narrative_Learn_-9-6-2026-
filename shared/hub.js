/* ============================================================
   NARRATIVE LEARN — shared/hub.js
   ------------------------------------------------------------
   Bagian hub (level 2) yang SAMA untuk Ocean Journey dan
   The Lake of Lembayung: kunci berurutan, progres, panel menu,
   pesan singkat, dan transisi masuk-keluar dari peta induk.

   Yang TIDAK ada di sini adalah mesin geraknya. Kedua hub
   bergerak dengan cara yang berbeda — Ocean menggeser mendatar
   sepanjang tiga panel, Lake menuruni lalu menggeser dua baris —
   jadi bagian itu tinggal di script.js masing-masing.

   Dimuat SESUDAH shared/progress.js dan SEBELUM script.js:

     <script src="../shared/progress.js"></script>
     <script src="../shared/hub.js"></script>
     <script src="script.js"></script>

   Dipakai begini:

     var hub = NLHub.mulai({
       dunia:  'ocean',
       rute:   { '1': 'nusa-barat/index_NusaBarat.html', ... },
       ganti:  function (kartu, terbuka) { ... }   // opsional
     });
     hub.terapkan();          // baca ulang progres
     hub.pesan('...');        // tampilkan pesan singkat

   ------------------------------------------------------------
   YANG DIHARAPKAN ADA DI HALAMAN
   ------------------------------------------------------------
     .dcard[data-id]     tombol mulai tiap perjalanan, berisi
                         .dcard__title dan .dcard__desc
     #toast              baris pesan singkat
     #menuBtn #sheet #sheetBackdrop #sheetClose #sheetList
     #btnUnlock #btnReset
     .back-btn, .sheet__home   jalan pulang ke peta induk

   Semuanya opsional kecuali .dcard: halaman yang tidak punya
   panel menu tetap berjalan, bagian itu saja yang dilewati.
   ============================================================ */
(function (global) {
  'use strict';

  var LAMA_ZOOM = 420;   // harus sama dengan durasi transisi di style.css

  function ambil(sel)   { return document.querySelector(sel); }
  function semua(sel)   { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  var ICO = {
    go:   '<svg class="ico" viewBox="0 0 24 24"><path d="M4 12h14M12 6l6 6-6 6"/></svg>',
    lock: '<svg class="ico" viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/></svg>',
    done: '<svg class="ico" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
  };

  function mulai(opsi) {
    var DUNIA = opsi.dunia;
    var RUTE  = opsi.rute || {};
    var kurangiGerak = global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Kartu diurutkan menurut data-id, bukan menurut urutannya di HTML.
       Ocean menaruh panel Nusa Barat paling kanan, jadi urutan DOM-nya
       justru terbalik dari urutan perjalanan; kalau kartu dibaca apa
       adanya, "selesaikan yang sebelumnya dulu" akan menyebut nama
       yang salah. */
    var kartu = semua('.dcard').sort(function (a, b) {
      return (+a.dataset.id) - (+b.dataset.id);
    });

    var judul = kartu.map(function (c) {
      return c.querySelector('.dcard__title').textContent.trim();
    });

    var toastEl = ambil('#toast');
    var jamToast;
    function pesan(teks) {
      if (!toastEl) return;
      toastEl.textContent = teks;
      toastEl.classList.add('is-on');
      clearTimeout(jamToast);
      jamToast = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3200);
    }

    /* ==========================================================
       KUNCI & PROGRES
       ----------------------------------------------------------
       Yang dikunci di sini HANYA perjalanannya. Jalan pulang ke
       peta induk dan jalan masuk ke hub ini tidak pernah dikunci
       — lihat bagian "PROGRES DITAMPILKAN, BUKAN MENGUNCI" di
       script.js peta induk.
       ========================================================== */
    function terbukaKe(i) { return NL.terbuka(DUNIA, kartu[i].dataset.id); }

    /* Ada dua sebab sebuah perjalanan terkunci, dan siswa perlu tahu
       yang mana: dunianya belum terbuka, atau perjalanan sebelumnya
       di dunia ini belum tuntas. */
    function alasan(i) {
      var sebelum = NL.duniaSebelum(DUNIA);
      if (!NL.duniaTerbuka(DUNIA) && sebelum) {
        return 'Selesaikan seluruh ' + NL.NAMA_DUNIA[sebelum] + ' dulu.';
      }
      return 'Selesaikan “' + judul[i - 1] + '” dulu.';
    }

    function terapkan() {
      kartu.forEach(function (c, i) {
        var id      = c.dataset.id;
        var terbuka = terbukaKe(i);
        var tuntas  = NL.sudahSelesai(DUNIA, id);
        var descEl  = c.querySelector('.dcard__desc');

        if (descEl && !descEl.dataset.orig) descEl.dataset.orig = descEl.textContent;

        c.classList.toggle('is-locked', !terbuka);
        c.classList.toggle('is-done', terbuka && tuntas);

        if (terbuka) {
          c.setAttribute('href', RUTE[id] || '#');
          c.removeAttribute('aria-disabled');
          if (descEl) descEl.textContent = descEl.dataset.orig;
        } else {
          c.setAttribute('href', '#');
          c.setAttribute('aria-disabled', 'true');
          if (descEl) descEl.textContent = alasan(i);
        }

        if (typeof opsi.ganti === 'function') opsi.ganti(c, terbuka, tuntas, i);
      });

      bangunPanel();
    }

    /* Menekan kartu yang terkunci tidak berpindah halaman, tapi juga
       tidak diam saja: siswa diberi tahu apa yang menahannya. */
    kartu.forEach(function (c, i) {
      c.addEventListener('click', function (e) {
        if (terbukaKe(i)) return;
        e.preventDefault();
        pesan('Perjalanan ini masih terkunci. ' + alasan(i));
      });
    });

    /* ==========================================================
       PANEL DAFTAR — jalur cadangan tanpa peta
       ----------------------------------------------------------
       Peta bergerak itu menyenangkan, tapi ia juga satu-satunya
       cara mencapai perjalanan kalau tidak ada daftar biasa. Panel
       ini yang menampung siswa dengan layar kecil, jari yang sulit
       menggeser, atau pembaca layar.
       ========================================================== */
    var panel      = ambil('#sheet');
    var latar      = ambil('#sheetBackdrop');
    var tombolMenu = ambil('#menuBtn');
    var tombolTutup= ambil('#sheetClose');
    var daftar     = ambil('#sheetList');

    function bangunPanel() {
      if (!daftar) return;
      daftar.innerHTML = '';

      kartu.forEach(function (c, i) {
        var id      = c.dataset.id;
        var terbuka = terbukaKe(i);
        var tuntas  = NL.sudahSelesai(DUNIA, id);
        var descEl  = c.querySelector('.dcard__desc');
        var sub     = terbuka
          ? (descEl ? descEl.dataset.orig : '')
          : 'Terkunci · ' + alasan(i);

        var node = document.createElement(terbuka ? 'a' : 'button');
        node.className = 'sheet__item' + (terbuka ? '' : ' is-locked') + (terbuka && tuntas ? ' is-done' : '');
        if (terbuka) node.setAttribute('href', RUTE[id] || '#');
        else node.type = 'button';

        node.innerHTML =
          '<span class="sheet__mark" aria-hidden="true">' + (i + 1) + '</span>' +
          '<span class="sheet__txt"><strong></strong><em></em></span>' +
          '<span class="sheet__state" aria-hidden="true">' +
            (!terbuka ? ICO.lock : (tuntas ? ICO.done : ICO.go)) + '</span>';

        node.querySelector('strong').textContent = judul[i];
        node.querySelector('em').textContent = sub;

        if (!terbuka) {
          node.addEventListener('click', function () {
            pesan('Perjalanan ini masih terkunci. ' + alasan(i));
          });
        }
        daftar.appendChild(node);
      });
    }

    function bukaPanel() {
      bangunPanel();
      panel.hidden = false; latar.hidden = false;
      requestAnimationFrame(function () {
        panel.classList.add('is-on'); latar.classList.add('is-on');
      });
      tombolMenu.setAttribute('aria-expanded', 'true');
    }

    function tutupPanel() {
      panel.classList.remove('is-on'); latar.classList.remove('is-on');
      tombolMenu.setAttribute('aria-expanded', 'false');
      setTimeout(function () { panel.hidden = true; latar.hidden = true; }, 320);
      tombolMenu.focus();
    }

    if (panel && tombolMenu) {
      tombolMenu.addEventListener('click', function () {
        if (tombolMenu.getAttribute('aria-expanded') === 'true') tutupPanel(); else bukaPanel();
      });
      if (latar) latar.addEventListener('click', tutupPanel);
      if (tombolTutup) tombolTutup.addEventListener('click', tutupPanel);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !panel.hidden) tutupPanel();
      });
    }

    var btnBuka = ambil('#btnUnlock');
    if (btnBuka) btnBuka.addEventListener('click', function () {
      var nyala = NL.bukaSemua(!NL.semuaTerbuka());
      pesan(nyala ? 'Semua perjalanan dibuka.' : 'Kunci berurutan diaktifkan lagi.');
      terapkan();
    });

    var btnReset = ambil('#btnReset');
    if (btnReset) btnReset.addEventListener('click', function () {
      NL.reset();
      terapkan();
      pesan('Progres diatur ulang.');
    });

    /* ==========================================================
       TRANSISI MASUK & KELUAR (level 1 <-> level 2)
       ----------------------------------------------------------
       Peta induk membesarkan dirinya ke arah penanda dunia ini
       sebelum berpindah, dan menitipkan aba-aba lewat
       sessionStorage. Halaman ini melanjutkan gerakan itu: mulai
       dari keadaan membesar lalu mengecil ke ukuran normal.
       Aba-abanya dihapus begitu dipakai, supaya menekan Back dari
       sebuah platform tidak memutar ulang animasinya.

       Kembali ke level 1 TIDAK PERNAH bersyarat — animasinya boleh
       gagal, tapi perpindahannya tetap terjadi.
       ========================================================== */
    (function transisiMasuk() {
      if (kurangiGerak) return;
      var aba;
      try {
        aba = sessionStorage.getItem('nl:zoom');
        sessionStorage.removeItem('nl:zoom');
      } catch (e) { return; }
      if (aba !== DUNIA) return;

      document.body.classList.add('is-entering');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          document.body.classList.remove('is-entering');
        });
      });
    })();

    semua('.back-btn, .sheet__home').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
        if (kurangiGerak) return;            // biarkan tautannya bekerja apa adanya
        e.preventDefault();
        document.body.classList.add('is-leaving');
        setTimeout(function () { location.href = a.getAttribute('href'); }, LAMA_ZOOM);
      });
    });

    /* Progres bisa berubah saat siswa kembali dari sebuah platform.
       pageshow menangkap juga kasus "kembali" dari bfcache, sekaligus
       membersihkan sisa kelas animasi supaya halaman tidak tertinggal
       dalam keadaan memudar. */
    global.addEventListener('pageshow', function () {
      document.body.classList.remove('is-entering', 'is-leaving');
      terapkan();
    });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) terapkan();
    });

    return {
      kartu: kartu,
      judul: judul,
      terapkan: terapkan,
      pesan: pesan,
      terbukaKe: terbukaKe,
      alasan: alasan,
      kurangiGerak: kurangiGerak
    };
  }


  /* ==========================================================
     GAMBAR SENDIRI (PNG / JPG)
     ----------------------------------------------------------
     Tiap pemandangan yang digambar dengan kode punya SLOT: kalau
     berkas gambar dengan nama yang benar ada di folder assets,
     gambar itu yang dipakai; kalau tidak ada, gambar bawaan tetap
     tampil. Tidak ada yang perlu diubah di kode — cukup taruh
     berkasnya.

     Yang dicoba, berurutan: .jpg, lalu .png, lalu .webp. Berkas
     pertama yang berhasil dimuat itulah yang dipakai.

     Pencariannya sengaja dijalankan SETELAH halaman selesai
     dimuat. Kalau dijalankan lebih awal, permintaan untuk berkas
     yang belum ada ikut mengantre di depan berkas yang benar-benar
     dibutuhkan, dan halaman jadi lebih lambat tampil di jaringan
     pelan. Gambar bawaan sudah terlihat sejak detik pertama, jadi
     tidak ada yang menunggu.

     UKURAN. Tiap slot menyebutkan ukurannya sendiri dalam satuan
     LAYAR, bukan piksel — lihat assets/README.md di tiap dunia.
     Gambarnya dipasang dengan background-size:cover, jadi:

       - lebarnya SELALU pas, tidak pernah terpotong mendatar.
         Ini penting: kalau terpotong mendatar, pulau atau desa
         akan bergeser keluar dari panelnya sendiri.
       - tingginya yang terpotong, dari atas dan bawah sama
         banyak, sebanyak selisih rasio layar siswa dengan rasio
         gambarnya.

     Karena itu isi yang penting harus ditaruh di pita tengah.
     Angka pastinya ada di assets/README.md.
     ========================================================== */
  var EKSTENSI = ['.jpg', '.png', '.webp'];

  function pasangSlot(slot, i) {
    if (i >= EKSTENSI.length) return;      // tidak ada berkasnya: gambar bawaan tetap dipakai
    var alamat = slot.dasar + EKSTENSI[i];
    var uji = new Image();
    uji.onload = function () {
      slot.el.style.backgroundImage = 'url("' + alamat + '")';
      slot.el.classList.add('has-foto');
    };
    uji.onerror = function () { pasangSlot(slot, i + 1); };
    uji.src = alamat;
  }

  function gambar(daftar) {
    if (!daftar || !daftar.length) return;

    function jalan() {
      daftar.forEach(function (slot) {
        if (slot && slot.el && slot.dasar) pasangSlot(slot, 0);
      });
    }
    if (document.readyState === 'complete') setTimeout(jalan, 0);
    else window.addEventListener('load', function () { setTimeout(jalan, 0); });
  }

  global.NLHub = { mulai: mulai, gambar: gambar };
})(window);
