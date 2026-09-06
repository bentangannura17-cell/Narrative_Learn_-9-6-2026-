/* ============================================================
   NarrativeLearn · Panel Guru — teacher/script.js
   ------------------------------------------------------------
   Mesin panel. Semua TEKS kegiatan ada di data.js, semua KUNCI
   jawaban ada di kunci.js; berkas ini hanya menggerakkannya.

   Prinsip yang dijaga di sini:

   1. Panel MEMBACA data siswa, dan hanya MENULIS pada kunci
      miliknya sendiri (nl_guru_*) ditambah satu kunci sinyal
      (nl_teacher_gate_v1). Satu-satunya penulisan lain ke ranah
      siswa dilakukan lewat tombol yang jelas-jelas merusak
      (Buka semua kunci, Hapus progres) dan selalu bertanya
      lebih dulu.

   2. Hasil modul punya DUA bentuk (lihat data.js). Semua
      pembacaan lewat normalHasil() supaya sisa panel tidak
      perlu tahu bedanya.

   3. Tidak ada permintaan jaringan sama sekali.
   ============================================================ */
(function () {
  'use strict';

  /* ==========================================================
     0. Pintasan
     ========================================================== */
  var D = GURU_DATA;
  var K = { SESI: 'nl_guru_sesi_v1', REKAP: 'nl_guru_rekap_v1',
            PIN: 'nl_guru_pin_v1', JAWAB: 'nl_guru_terjawab_v1',
            GATE: 'nl_teacher_gate_v1', SISWA: 'nl_student_v1',
            TANYA: 'nl_questions_v1' };

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }

  /* Penyimpanan bisa ditolak peramban (mode penyamaran ketat,
     kuota penuh, izin dimatikan). Semua akses lewat dua pintu
     ini supaya kegagalan tidak menghentikan panel. */
  function baca(kunci) {
    try {
      var raw = localStorage.getItem(kunci);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function tulis(kunci, nilai) {
    try { localStorage.setItem(kunci, JSON.stringify(nilai)); return true; }
    catch (e) { pesan('Penyimpanan peramban menolak. Data terakhir tidak tersimpan.'); return false; }
  }
  function buang(kunci) {
    try { localStorage.removeItem(kunci); } catch (e) {}
  }

  var jamPesan;
  function pesan(teks) {
    var t = $('toast');
    t.textContent = teks;
    t.classList.add('is-on');
    clearTimeout(jamPesan);
    jamPesan = setTimeout(function () { t.classList.remove('is-on'); }, 3400);
  }

  function modulOleh(id) {
    for (var i = 0; i < D.modul.length; i++) if (D.modul[i].id === id) return D.modul[i];
    return null;
  }
  function menitModul(m) {
    return m.runbook.reduce(function (a, s) { return a + s.m; }, 0);
  }
  function tanggal(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' +
           d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }
  function jam(detik) {
    var m = Math.floor(detik / 60), s = detik % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  function angka(v) {
    if (v == null) return '—';
    return (v % 1 === 0) ? String(v) : v.toFixed(1);
  }

  /* ==========================================================
     1. Bentuk hasil — penyeragam
     ----------------------------------------------------------
     Enam modul menyimpan {correct,total,stars,livesUsed,attempts};
     Bukit Camar menyimpan {score,outOf,chancesLeft}. Perbedaan itu
     ada di kode siswa dan tidak akan diubah dari sini, jadi
     diseragamkan saat dibaca.
     ========================================================== */
  /* Penyeragamnya sendiri tinggal di shared/teacher.js, karena
     ketujuh modul siswa memakai kanal yang sama dan bentuk hasil
     yang ditafsirkan dua kali cepat atau lambat ditafsirkan
     berbeda. `m` tetap dikirim dari sini: langkah dan nyawa tiap
     perjalanan adalah profil pengajaran, dan itu milik data.js. */
  function normalHasil(m, mentah) {
    return NLTeacher.normalHasil(m, mentah);
  }

  /* ==========================================================
     2. Keadaan panel
     ========================================================== */
  var sesi = baca(K.SESI) || { modul: D.modul[0].id, kelas: '', jumlah: null,
                               mulai: null, langkah: {}, siap: [] };
  if (!sesi.langkah) sesi.langkah = {};
  if (!sesi.siap) sesi.siap = [];
  function simpanSesi() { tulis(K.SESI, sesi); }

  function modulKini() { return modulOleh(sesi.modul) || D.modul[0]; }

  function jejakLangkah() {
    var id = modulKini().id;
    if (!sesi.langkah[id]) sesi.langkah[id] = { i: 0, selesai: [] };
    return sesi.langkah[id];
  }

  /* ==========================================================
     3. Gerbang PIN
     ----------------------------------------------------------
     Sengaja TIDAK memakai kriptografi. Sidik jari sederhana ini
     hanya menahan orang yang mengintip localStorage sekilas —
     dan itu memang seluruh maksudnya. Kunci jawaban tetap bisa
     dibaca siapa pun yang membuka kunci.js lewat alamatnya, jadi
     jangan perlakukan PIN ini sebagai pengaman.
     ========================================================== */
  function sidik(teks) {
    var h = 2166136261;
    for (var i = 0; i < teks.length; i++) {
      h ^= teks.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h.toString(36);
  }

  var terbuka = false;

  function pinTerpasang() {
    var p = baca(K.PIN);
    return !!(p && p.h);
  }
  function kunciPanel() {
    if (!pinTerpasang()) { pesan('Belum ada PIN. Pasang dulu di tab Bantuan.'); return; }
    terbuka = false;
    $('lock').hidden = false;
    $('lockInput').value = '';
    $('lockErr').hidden = true;
    $('lockInput').focus();
  }
  function bukaPanel() {
    terbuka = true;
    $('lock').hidden = true;
  }

  $('lockForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var p = baca(K.PIN);
    if (p && sidik($('lockInput').value) === p.h) { bukaPanel(); pesan('Panel terbuka.'); }
    else { $('lockErr').hidden = false; $('lockInput').select(); }
  });
  $('lockForget').addEventListener('click', function () {
    if (!confirm('Lepas PIN dan hapus SELURUH data panel (sesi, rekap, penanda pertanyaan)?\n\nProgres siswa tidak ikut terhapus.')) return;
    buang(K.PIN); buang(K.SESI); buang(K.REKAP); buang(K.JAWAB);
    location.reload();
  });
  $('btnKunci').addEventListener('click', kunciPanel);

  /* ==========================================================
     4. Tab
     ========================================================== */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  function keTab(nama) {
    tabs.forEach(function (t) { t.classList.toggle('is-on', t.dataset.panel === nama); });
    Array.prototype.forEach.call(document.querySelectorAll('.panel'), function (p) {
      p.classList.toggle('is-on', p.id === 'p-' + nama);
    });
    window.scrollTo(0, 0);
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { keTab(t.dataset.panel); });
  });

  /* ==========================================================
     5. Pemilih perjalanan
     ========================================================== */
  function isiPemilih() {
    var s = $('pickModul');
    s.textContent = '';
    ['ocean', 'lake'].forEach(function (w) {
      var g = document.createElement('optgroup');
      g.label = D.dunia[w].nama;
      D.modul.filter(function (m) { return m.dunia === w; }).forEach(function (m) {
        var o = document.createElement('option');
        o.value = m.id;
        o.textContent = m.urutan + '. ' + m.nama + ' — ' + m.fokus;
        g.appendChild(o);
      });
      s.appendChild(g);
    });
    s.value = sesi.modul;

    var ms = $('mModul');
    ms.textContent = '';
    D.modul.forEach(function (m) {
      var o = document.createElement('option');
      o.value = m.id;
      o.textContent = D.dunia[m.dunia].nama + ' · ' + m.nama;
      ms.appendChild(o);
    });
  }

  $('pickModul').addEventListener('change', function () {
    sesi.modul = this.value;
    simpanSesi();
    gambarSemua();
    pesan('Perjalanan hari ini: ' + modulKini().nama + '.');
  });

  /* ==========================================================
     6. Persiapan
     ========================================================== */
  function gambarSiap() {
    var wadah = $('daftarSiap');
    wadah.textContent = '';

    D.persiapan.forEach(function (butir, i) {
      var sudah = sesi.siap.indexOf(i) >= 0;
      var li = el('li', sudah ? 'is-done' : '');

      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = sudah;
      cb.id = 'siap' + i;
      cb.addEventListener('change', function () {
        var at = sesi.siap.indexOf(i);
        if (cb.checked && at < 0) sesi.siap.push(i);
        if (!cb.checked && at >= 0) sesi.siap.splice(at, 1);
        simpanSesi();
        gambarSiap();
      });

      var teks = el('div');
      var b = el('b');
      b.appendChild(document.createTextNode(butir.t + ' '));
      if (butir.kritis) b.appendChild(el('span', 'tag tag--bad', 'kritis'));
      var lab = document.createElement('label');
      lab.setAttribute('for', cb.id);
      lab.appendChild(b);
      teks.appendChild(lab);
      teks.appendChild(el('span', 'checks__d', butir.d));

      li.appendChild(cb);
      li.appendChild(teks);
      wadah.appendChild(li);
    });

    var n = sesi.siap.length, total = D.persiapan.length;
    $('siapBar').style.width = (n / total * 100) + '%';
    $('siapTxt').textContent = n + ' dari ' + total;

    var kritisKurang = D.persiapan.filter(function (b, i) {
      return b.kritis && sesi.siap.indexOf(i) < 0;
    }).length;
    $('siapNote').textContent = kritisKurang
      ? 'Masih ada ' + kritisKurang + ' butir kritis yang belum dicentang. Kelas bisa berhenti di tengah jalan.'
      : (n === total ? 'Semua siap. Buka tab Panduan Langkah.' : 'Butir kritis sudah aman. Sisanya boleh dikerjakan sambil jalan.');
  }

  function gambarKartuModul() {
    var m = modulKini();
    var c = $('kartuModul');
    c.textContent = '';

    c.appendChild(el('p', 'eyebrow', D.dunia[m.dunia].nama + ' · perjalanan ke-' + m.urutan));
    c.appendChild(el('h3', '', m.nama));
    c.appendChild(el('p', '', m.fokus));

    var dl = el('dl', 'kv');
    [['Perkiraan waktu', menitModul(m) + ' menit'],
     ['Jumlah langkah nilai', String(m.langkah)],
     ['Nyawa / kesempatan', String(m.nyawa)],
     ['Prasyarat', m.prasyarat ? (modulOleh(m.prasyarat.replace(/_v1$/, '')) || {}).nama || m.prasyarat : 'tidak ada']
    ].forEach(function (r) {
      var d = el('div');
      d.appendChild(el('dt', '', r[0]));
      d.appendChild(el('dd', '', r[1]));
      dl.appendChild(d);
    });
    c.appendChild(dl);

    c.appendChild(el('p', 'eyebrow', 'Cara penilaian'));
    c.appendChild(el('p', 'note', m.penilaian));

    c.appendChild(el('p', 'eyebrow', 'Pengumpulan hasil'));
    c.appendChild(el('p', 'note', m.hasilnya));

    if (m.catatanTeknis) {
      c.appendChild(el('p', 'eyebrow', 'Catatan teknis'));
      c.appendChild(el('p', 'note', m.catatanTeknis));
    }

    c.appendChild(el('p', 'eyebrow', 'Berkas materi yang harus ada'));
    var ul = el('ul', 'bul');
    (D.aset[m.id] || []).forEach(function (a) {
      var li = el('li');
      li.appendChild(el('code', '', a));
      ul.appendChild(li);
    });
    c.appendChild(ul);

    var row = el('div', 'rowbtn');
    /* Alamatnya diminta ke kanal, tidak ditulis ulang di data.js:
       nama berkas level 3 pernah berubah dan memutus semua salinan
       alamat yang tersebar. Sekarang cuma ada satu salinan. */
    var a = el('a', 'btn btn--ghost btn--sm', 'Buka layar siswa →');
    a.href = NLTeacher.jalur(m.id);
    a.target = '_blank';
    a.rel = 'noopener';
    row.appendChild(a);
    var a2 = el('a', 'btn btn--ghost btn--sm', 'Buka hub ' + D.dunia[m.dunia].nama);
    a2.href = NLTeacher.jalur(m.dunia);
    a2.target = '_blank';
    a2.rel = 'noopener';
    row.appendChild(a2);
    c.appendChild(row);
  }

  /* ---------- Sesi & jam ---------- */
  var jamSesi;
  function mulaiSesi() {
    sesi.kelas = $('inKelas').value.trim();
    sesi.jumlah = parseInt($('inJumlah').value, 10) || null;
    sesi.mulai = Date.now();
    simpanSesi();
    gambarSesi();
    keTab('panduan');
    pesan('Sesi dimulai. Jam berjalan.');
  }
  function hentiSesi() {
    if (!confirm('Hentikan sesi? Jam berhenti, tetapi centang langkah dan rekap tetap tersimpan.')) return;
    sesi.mulai = null;
    simpanSesi();
    gambarSesi();
  }

  function gambarSesi() {
    var jalan = !!sesi.mulai;
    $('clockWrap').hidden = !jalan;
    $('btnSesi').textContent = jalan ? 'Hentikan sesi' : 'Mulai sesi';
    $('btnSesi2').textContent = jalan ? 'Hentikan sesi' : 'Mulai sesi';
    $('inKelas').value = sesi.kelas || '';
    $('inJumlah').value = sesi.jumlah || '';

    var m = modulKini();
    $('sesiNote').textContent = jalan
      ? 'Sesi berjalan sejak ' + new Date(sesi.mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
        '. Perkiraan durasi ' + menitModul(m) + ' menit.'
      : 'Sesi belum dimulai. Perkiraan durasi ' + m.nama + ': ' + menitModul(m) + ' menit.';

    clearInterval(jamSesi);
    if (jalan) { detakJam(); jamSesi = setInterval(detakJam, 1000); }
  }

  function detakJam() {
    if (!sesi.mulai) return;
    var lewat = Math.floor((Date.now() - sesi.mulai) / 1000);
    $('clock').textContent = jam(lewat);
    var target = menitModul(modulKini()) * 60;
    $('clockCap').textContent = lewat > target
      ? 'lewat ' + Math.round((lewat - target) / 60) + ' mnt'
      : 'sisa ' + Math.round((target - lewat) / 60) + ' mnt';
  }

  $('btnSesi').addEventListener('click', function () { sesi.mulai ? hentiSesi() : mulaiSesi(); });
  $('btnSesi2').addEventListener('click', function () { sesi.mulai ? hentiSesi() : mulaiSesi(); });
  $('inKelas').addEventListener('change', function () { sesi.kelas = this.value.trim(); simpanSesi(); });
  $('inJumlah').addEventListener('change', function () { sesi.jumlah = parseInt(this.value, 10) || null; simpanSesi(); });

  /* ==========================================================
     7. Panduan langkah
     ========================================================== */
  function gambarPanduan() {
    var m = modulKini();
    var jejak = jejakLangkah();
    var wadah = $('daftarLangkah');
    wadah.textContent = '';

    $('panduanLede').textContent =
      D.dunia[m.dunia].nama + ' · ' + m.nama + ' — ' + m.runbook.length +
      ' langkah, perkiraan ' + menitModul(m) + ' menit. Langkah yang sedang berjalan terbuka sendiri; ketuk judul langkah lain untuk melompat.';

    m.runbook.forEach(function (s, i) {
      var sudah = jejak.selesai.indexOf(i) >= 0;
      var kini = i === jejak.i;

      var li = el('li', 'step' + (kini ? ' is-now' : '') + (sudah ? ' is-done' : ''));

      /* --- baris judul --- */
      var bar = el('button', 'step__bar');
      bar.type = 'button';
      bar.setAttribute('aria-expanded', String(kini));

      var no = el('span', 'step__no');
      no.appendChild(el('i', '', String(i + 1)));
      bar.appendChild(no);
      bar.appendChild(el('span', 'step__ttl', s.judul));
      if (s.aksi || s.kunciAlur) bar.appendChild(el('span', 'step__gate', 'gerbang'));
      bar.appendChild(el('span', 'step__min', '± ' + s.m + ' mnt'));
      bar.addEventListener('click', function () {
        jejak.i = i; simpanSesi(); gambarPanduan();
      });
      li.appendChild(bar);

      /* --- isi --- */
      var body = el('div', 'step__body');

      var say = el('div', 'say');
      say.appendChild(el('b', 'say__cap', 'Aba-aba untuk kelas'));
      say.appendChild(el('p', 'say__txt', '“' + s.aba + '”'));
      body.appendChild(say);

      if (s.guru && s.guru.length) body.appendChild(bagian('Yang dikerjakan guru', s.guru, ''));
      if (s.awas && s.awas.length) body.appendChild(bagian('Perhatikan', s.awas, 'sub--awas'));

      if (s.aksi) {
        var tombol = el('button', 'btn btn--solid', s.aksi.label);
        tombol.type = 'button';
        tombol.addEventListener('click', function () { kirimSinyal(s.aksi.sinyal); });
        var box = el('div', 'rowbtn');
        box.appendChild(tombol);
        var ket = el('p', 'note', 'Berlaku untuk perangkat yang membuka situs ini di peramban yang sama. Untuk perangkat siswa, beri aba-aba lisan.');
        body.appendChild(box);
        body.appendChild(ket);
      } else if (s.kunciAlur) {
        body.appendChild(el('p', 'note', 'Modul ini tidak memantau sinyal panel. Gerbangnya dibuka siswa sendiri setelah aba-aba lisan.'));
      }

      li.appendChild(body);
      wadah.appendChild(li);
    });

    var n = jejak.selesai.length;
    $('langkahBar').style.width = (n / m.runbook.length * 100) + '%';
    $('langkahTxt').textContent = n + ' dari ' + m.runbook.length + ' langkah selesai';

    $('btnPrev').disabled = jejak.i <= 0;
    $('btnNext').textContent = jejak.i >= m.runbook.length - 1
      ? 'Tandai selesai — tutup panduan'
      : 'Selesai — langkah berikutnya →';
  }

  function bagian(judul, daftar, cls) {
    var d = el('div', 'sub ' + (cls || ''));
    d.appendChild(el('p', 'sub__cap', judul));
    var ul = el('ul');
    daftar.forEach(function (t) { ul.appendChild(el('li', '', t)); });
    d.appendChild(ul);
    return d;
  }

  $('btnNext').addEventListener('click', function () {
    var m = modulKini(), jejak = jejakLangkah();
    if (jejak.selesai.indexOf(jejak.i) < 0) jejak.selesai.push(jejak.i);
    if (jejak.i < m.runbook.length - 1) jejak.i++;
    else pesan('Seluruh langkah ' + m.nama + ' selesai.');
    simpanSesi();
    gambarPanduan();
    var aktif = document.querySelector('.step.is-now');
    if (aktif) aktif.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });

  $('btnPrev').addEventListener('click', function () {
    var jejak = jejakLangkah();
    if (jejak.i > 0) jejak.i--;
    simpanSesi();
    gambarPanduan();
  });

  $('btnResetPanduan').addEventListener('click', function () {
    if (!confirm('Ulang panduan ' + modulKini().nama + ' dari langkah pertama?')) return;
    sesi.langkah[modulKini().id] = { i: 0, selesai: [] };
    simpanSesi();
    gambarPanduan();
  });

  $('btnCetakPanduan').addEventListener('click', function () { keTab('panduan'); setTimeout(function () { window.print(); }, 60); });
  $('btnCetakRekap').addEventListener('click', function () { keTab('rekap'); setTimeout(function () { window.print(); }, 60); });
  $('btnCetakKunci').addEventListener('click', function () { keTab('kunci'); setTimeout(function () { window.print(); }, 60); });

  /* ==========================================================
     8. Kendali kelas
     ========================================================== */
  function kirimSinyal(id) {
    NLTeacher.kirim(id);
    var s = D.sinyal.filter(function (x) { return x.id === id; })[0];
    pesan('Sinyal terkirim: ' + (s ? s.nama : id) + '.');
    gambarSinyal();
  }

  function gambarSinyal() {
    var wadah = $('daftarSinyal');
    var kini = NLTeacher.perintah();
    wadah.textContent = '';

    D.sinyal.forEach(function (s) {
      var aktif = kini && kini.grant === s.id;
      var b = el('button', 'signal' + (aktif ? ' is-sent' : ''));
      b.type = 'button';
      var teks = el('span');
      teks.appendChild(el('b', '', s.nama));
      teks.appendChild(el('span', '', s.d));
      b.appendChild(teks);
      if (aktif) b.appendChild(el('em', '', 'terkirim'));
      b.addEventListener('click', function () { kirimSinyal(s.id); });
      wadah.appendChild(b);
    });

    $('sinyalKini').textContent = kini
      ? (D.sinyal.filter(function (x) { return x.id === kini.grant; })[0] || { nama: kini.grant }).nama +
        ' · ' + tanggal(kini.at)
      : 'belum ada';
  }

  $('btnHapusSinyal').addEventListener('click', function () {
    NLTeacher.hapusPerintah();
    gambarSinyal();
    pesan('Sinyal dihapus.');
  });

  function gambarProgres() {
    var t = $('tblProgres');
    t.textContent = '';

    var thead = el('thead');
    var tr = el('tr');
    ['Perjalanan', 'Keadaan', 'Nilai', 'Nyawa', 'Selesai'].forEach(function (h) {
      tr.appendChild(el('th', '', h));
    });
    thead.appendChild(tr);
    t.appendChild(thead);

    var tb = el('tbody');
    D.modul.forEach(function (m) {
      var h = normalHasil(m, baca(m.kunci));
      var terkunci = m.prasyarat && !(baca(m.prasyarat) || {}).status;
      var r = el('tr');

      var c1 = el('td');
      c1.appendChild(el('b', '', m.nama));
      c1.appendChild(document.createTextNode(' '));
      c1.appendChild(el('span', 'tag tag--' + m.dunia, D.dunia[m.dunia].nama.split(' ')[0]));
      r.appendChild(c1);

      var c2 = el('td');
      c2.appendChild(el('span', 'pill ' + (h ? 'pill--done' : terkunci ? 'pill--none' : ''),
        h ? (h.dibukaGuru ? 'dibuka guru' : 'selesai') : terkunci ? 'terkunci' : 'terbuka'));
      r.appendChild(c2);

      r.appendChild(el('td', 'num', h ? angka(h.benar) + '/' + h.dari + (h.persen != null ? ' · ' + h.persen + '%' : '') : '—'));
      r.appendChild(el('td', 'num', h && h.nyawa != null ? h.nyawa + '/' + m.nyawa : '—'));
      r.appendChild(el('td', 'num', h ? tanggal(h.selesai) : '—'));
      tb.appendChild(r);
    });
    t.appendChild(tb);
  }

  $('btnMuatProgres').addEventListener('click', function () { gambarProgres(); pesan('Progres dimuat ulang.'); });

  $('btnBukaSemua').addEventListener('click', function () {
    if (!confirm('Menandai KETUJUH perjalanan sebagai selesai di perangkat INI, supaya modul mana pun bisa dibuka untuk peragaan.\n\n' +
                 'Hasil palsu ini ditandai "dibuka guru" dan tidak boleh dipakai sebagai nilai. Lanjutkan?')) return;
    D.modul.forEach(function (m) {
      if ((baca(m.kunci) || {}).status === 'completed') return;
      tulis(m.kunci, { v: 1, status: 'completed', guruBuka: true,
                       score: 0, maxScore: m.skorMaks, stars: 0,
                       correct: 0, total: m.langkah, livesUsed: 0, attempts: 0,
                       completedAt: new Date().toISOString() });
    });
    gambarProgres();
    pesan('Semua kunci dibuka di perangkat ini.');
  });

  $('btnHapusProgres').addEventListener('click', function () {
    if (!confirm('Menghapus SELURUH progres siswa di perangkat ini: ketujuh hasil perjalanan, identitas siswa, dan pertanyaan.\n\nTidak bisa dibatalkan. Lanjutkan?')) return;
    D.modul.forEach(function (m) { buang(m.kunci); buang(m.id + '_attempt_temp'); });
    buang(K.SISWA); buang(K.TANYA); buang(K.GATE);
    gambarProgres(); gambarSiswa(); gambarTanya(true); gambarSinyal();
    pesan('Progres perangkat ini dihapus.');
  });

  function gambarSiswa() {
    var s = baca(K.SISWA);
    var dl = $('kvSiswa');
    dl.textContent = '';
    [['Nama', s && s.name ? s.name : 'belum diisi'],
     ['Kelas', s && s.class ? s.class : 'belum diisi']].forEach(function (r) {
      var d = el('div');
      d.appendChild(el('dt', '', r[0]));
      d.appendChild(el('dd', '', r[1]));
      dl.appendChild(d);
    });
  }
  $('btnMuatSiswa').addEventListener('click', function () { gambarSiswa(); pesan('Identitas dimuat ulang.'); });

  /* ==========================================================
     9. Papan pertanyaan
     ========================================================== */
  function tandaTanya(q) { return (q.module || '') + '|' + (q.at || '') + '|' + (q.text || '').slice(0, 40); }

  /* Papan ini digambar ulang tiap dua detik. Menggambar ulang
     tanpa perubahan akan membuang fokus tombol yang sedang
     ditekan guru, jadi sidik isinya dibandingkan lebih dulu. */
  var sidikTanya = null;

  function gambarTanya(paksa) {
    var daftar = NLTeacher.pertanyaan();
    var terjawab = baca(K.JAWAB) || [];
    var hanyaBelum = $('chkBelum').checked;

    var sidikBaru = daftar.length + '/' + terjawab.length + '/' + hanyaBelum + '/' +
                    (daftar.length ? tandaTanya(daftar[daftar.length - 1]) : '');
    if (!paksa && sidikBaru === sidikTanya) return;
    sidikTanya = sidikBaru;

    var wadah = $('daftarTanya');
    wadah.textContent = '';

    var tampil = daftar.slice().reverse().filter(function (q) {
      return !hanyaBelum || terjawab.indexOf(tandaTanya(q)) < 0;
    });

    if (!tampil.length) {
      wadah.appendChild(el('p', 'empty', daftar.length
        ? 'Semua pertanyaan sudah ditandai terjawab.'
        : 'Belum ada pertanyaan dari perangkat ini.'));
    }

    tampil.forEach(function (q) {
      var tanda = tandaTanya(q);
      var sudah = terjawab.indexOf(tanda) >= 0;
      var m = modulOleh(q.module);

      var box = el('div', 'q' + (sudah ? ' is-done' : ''));
      var meta = el('div', 'q__meta');
      meta.appendChild(el('span', '', m ? m.nama : (q.module || 'modul tak dikenal')));
      meta.appendChild(el('span', '', D.layar[q.page] || q.page || 'layar tak dikenal'));
      meta.appendChild(el('span', '', tanggal(q.at)));
      box.appendChild(meta);
      box.appendChild(el('p', 'q__txt', q.text || ''));

      var act = el('div', 'q__act');
      var b = el('button', 'btn btn--ghost btn--sm', sudah ? 'Buka lagi' : 'Tandai terjawab');
      b.type = 'button';
      b.addEventListener('click', function () {
        var list = baca(K.JAWAB) || [];
        var at = list.indexOf(tanda);
        if (at >= 0) list.splice(at, 1); else list.push(tanda);
        tulis(K.JAWAB, list);
        gambarTanya(true);
      });
      act.appendChild(b);
      box.appendChild(act);
      wadah.appendChild(box);
    });

    var belum = daftar.filter(function (q) { return terjawab.indexOf(tandaTanya(q)) < 0; }).length;
    var pip = $('pipTanya');
    pip.hidden = belum === 0;
    pip.textContent = String(belum);
  }

  $('chkBelum').addEventListener('change', function () { gambarTanya(true); });
  $('btnMuatTanya').addEventListener('click', function () { gambarTanya(true); pesan('Papan dimuat ulang.'); });
  $('btnHapusTanya').addEventListener('click', function () {
    if (!confirm('Kosongkan papan? Seluruh pertanyaan siswa di perangkat ini dihapus.')) return;
    buang(K.TANYA); buang(K.JAWAB);
    gambarTanya(true);
    pesan('Papan dikosongkan.');
  });

  /* ==========================================================
     10. Rekap nilai
     ========================================================== */
  var rekap = baca(K.REKAP) || [];
  function simpanRekap() { tulis(K.REKAP, rekap); }

  /* Nama pendek pada kode hasil -> id modul. Bentuk payload v1
     dibuat di ocean-journey/nusa-selatan/script.js dan hanya
     memuat tiga modul Ocean Journey; kunci penuh dan id modul
     ikut diterima supaya kode versi mana pun tetap terbaca. */
  var PETA_KODE = {
    barat: 'oj_barat', timur: 'oj_timur', selatan: 'oj_selatan',
    bukit: 'lake_bukit', sunda: 'lake_sunda', muara: 'lake_muara', singha: 'lake_singha'
  };
  D.modul.forEach(function (m) { PETA_KODE[m.id] = m.id; PETA_KODE[m.kunci] = m.id; });

  function bacaKode(teks) {
    var mentah = null;
    try { mentah = JSON.parse(decodeURIComponent(escape(atob(teks)))); }
    catch (e) {
      try { mentah = JSON.parse(teks); } catch (e2) { return null; }
    }
    if (!mentah || typeof mentah !== 'object') return null;

    var siswa = { nama: mentah.name || '(tanpa nama)', kelas: mentah['class'] || '', hasil: {} };
    Object.keys(mentah).forEach(function (k) {
      var id = PETA_KODE[k];
      if (!id) return;
      var m = modulOleh(id);
      var h = normalHasil(m, mentah[k]);
      if (h) siswa.hasil[id] = h;
    });
    return siswa;
  }

  function gabung(siswa, sumber) {
    var kunciNama = (siswa.nama + '|' + siswa.kelas).toLowerCase();
    var ada = null;
    for (var i = 0; i < rekap.length; i++) {
      if ((rekap[i].nama + '|' + rekap[i].kelas).toLowerCase() === kunciNama) { ada = rekap[i]; break; }
    }
    if (!ada) {
      ada = { nama: siswa.nama, kelas: siswa.kelas, hasil: {}, sumber: sumber, at: new Date().toISOString() };
      rekap.push(ada);
    }
    Object.keys(siswa.hasil).forEach(function (id) { ada.hasil[id] = siswa.hasil[id]; });
    ada.sumber = sumber;
    ada.at = new Date().toISOString();
    return ada;
  }

  $('btnBacaKode').addEventListener('click', function () {
    var baris = $('inKode').value.split(/[\r\n]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (!baris.length) { $('kodeNote').textContent = 'Tempel dulu kodenya.'; return; }

    var ok = 0, gagal = 0, tanpaNama = 0;
    baris.forEach(function (b) {
      var s = bacaKode(b);
      if (!s) { gagal++; return; }
      if (s.nama === '(tanpa nama)') tanpaNama++;
      gabung(s, 'kode');
      ok++;
    });
    simpanRekap();
    gambarRekap();
    $('inKode').value = '';
    $('kodeNote').textContent = ok + ' kode terbaca' +
      (gagal ? ', ' + gagal + ' gagal dibaca (bukan kode hasil yang sah)' : '') +
      (tanpaNama ? '. ' + tanpaNama + ' di antaranya tanpa nama — siswa melewati layar identitas.' : '.');
    pesan(ok + ' kode masuk ke rekap.');
  });

  $('btnAmbilPerangkat').addEventListener('click', function () {
    var s = baca(K.SISWA);
    var siswa = { nama: (s && s.name) || '(tanpa nama)', kelas: (s && s.class) || '', hasil: {} };
    var n = 0;
    D.modul.forEach(function (m) {
      var h = normalHasil(m, baca(m.kunci));
      if (h && !h.dibukaGuru) { siswa.hasil[m.id] = h; n++; }
    });
    if (!n) { $('kodeNote').textContent = 'Perangkat ini belum punya satu pun hasil yang selesai.'; return; }
    gabung(siswa, 'perangkat');
    simpanRekap();
    gambarRekap();
    $('kodeNote').textContent = n + ' hasil diambil dari perangkat ini untuk ' + siswa.nama + '.';
    pesan('Hasil perangkat ini masuk ke rekap.');
  });

  /* ---------- Tambah manual ---------- */
  $('btnManual').addEventListener('click', function () {
    $('mNama').value = '';
    $('mKelas').value = sesi.kelas || '';
    $('mModul').value = sesi.modul;
    $('mSkor').value = '';
    $('mNyawa').value = '';
    $('modal').hidden = false;
    $('mNama').focus();
  });
  $('mBatal').addEventListener('click', function () { $('modal').hidden = true; });
  $('mSimpan').addEventListener('click', function () {
    var nama = $('mNama').value.trim();
    if (!nama) { pesan('Nama harus diisi.'); return; }
    var m = modulOleh($('mModul').value);
    var benar = parseFloat($('mSkor').value);
    if (isNaN(benar)) { pesan('Isi jumlah langkah yang selesai.'); return; }
    var nyawa = parseInt($('mNyawa').value, 10);

    var siswa = { nama: nama, kelas: $('mKelas').value.trim(), hasil: {} };
    siswa.hasil[m.id] = {
      benar: benar, dari: m.langkah,
      persen: Math.round(benar / m.langkah * 100),
      nyawa: isNaN(nyawa) ? null : nyawa,
      bintang: null, coba: null,
      selesai: new Date().toISOString(), dibukaGuru: false
    };
    gabung(siswa, 'manual');
    simpanRekap();
    gambarRekap();
    $('modal').hidden = true;
    pesan('Nilai ' + nama + ' tersimpan.');
  });

  /* ---------- Tabel ---------- */
  function gambarRekap() {
    var cari = ($('cariSiswa').value || '').toLowerCase();
    var baris = rekap.filter(function (r) {
      return !cari || (r.nama + ' ' + r.kelas).toLowerCase().indexOf(cari) >= 0;
    }).sort(function (a, b) { return a.nama.localeCompare(b.nama, 'id'); });

    var t = $('tblRekap');
    t.textContent = '';

    var thead = el('thead');
    var tr = el('tr');
    tr.appendChild(el('th', '', 'Nama'));
    tr.appendChild(el('th', '', 'Kelas'));
    D.modul.forEach(function (m) { tr.appendChild(el('th', '', m.urutan + '. ' + m.nama)); });
    tr.appendChild(el('th', '', 'Tuntas'));
    tr.appendChild(el('th', '', ''));
    thead.appendChild(tr);
    t.appendChild(thead);

    var tb = el('tbody');
    baris.forEach(function (r) {
      var row = el('tr');
      row.appendChild(el('td', '', r.nama));
      row.appendChild(el('td', '', r.kelas || '—'));

      var tuntas = 0;
      D.modul.forEach(function (m) {
        var h = r.hasil[m.id];
        if (h) tuntas++;
        var td = el('td', 'num');
        if (!h) td.appendChild(el('span', 'pill pill--none', '—'));
        else {
          td.appendChild(document.createTextNode(angka(h.benar) + '/' + h.dari));
          if (h.persen != null) {
            td.appendChild(document.createElement('br'));
            td.appendChild(el('span', 'pill' + (h.persen >= 70 ? ' pill--done' : ''), h.persen + '%'));
          }
        }
        row.appendChild(td);
      });

      row.appendChild(el('td', 'num', tuntas + '/' + D.modul.length));

      var aksi = el('td', 'num');
      var b = el('button', 'btn btn--ghost btn--sm', 'Hapus');
      b.type = 'button';
      b.addEventListener('click', function () {
        if (!confirm('Hapus ' + r.nama + ' dari rekap?')) return;
        rekap.splice(rekap.indexOf(r), 1);
        simpanRekap();
        gambarRekap();
      });
      aksi.appendChild(b);
      row.appendChild(aksi);

      tb.appendChild(row);
    });
    t.appendChild(tb);

    $('rekapNote').textContent = rekap.length
      ? baris.length + ' dari ' + rekap.length + ' siswa ditampilkan. Rekap tersimpan di peramban ini — ekspor CSV supaya tidak hilang.'
      : 'Rekap masih kosong. Tempel kode hasil, ambil dari perangkat ini, atau tambah manual.';

    var pip = $('pipRekap');
    pip.hidden = rekap.length === 0;
    pip.textContent = String(rekap.length);

    gambarRingkas();
  }

  function gambarRingkas() {
    var dl = $('kvRekap');
    dl.textContent = '';

    var m = modulKini();
    var punya = rekap.filter(function (r) { return r.hasil[m.id]; });
    var nilai = punya.map(function (r) { return r.hasil[m.id].persen; })
                     .filter(function (v) { return v != null; });
    var rata = nilai.length ? Math.round(nilai.reduce(function (a, b) { return a + b; }, 0) / nilai.length) : null;
    var tuntasSemua = rekap.filter(function (r) {
      return D.modul.every(function (x) { return r.hasil[x.id]; });
    }).length;

    var belum = sesi.jumlah ? Math.max(0, sesi.jumlah - punya.length) : null;

    [['Siswa di rekap', String(rekap.length)],
     [m.nama + ' — sudah setor', String(punya.length)],
     [m.nama + ' — rata-rata', rata != null ? rata + '%' : '—'],
     [m.nama + ' — tertinggi', nilai.length ? Math.max.apply(null, nilai) + '%' : '—'],
     [m.nama + ' — terendah', nilai.length ? Math.min.apply(null, nilai) + '%' : '—'],
     ['Belum setor', belum != null ? String(belum) : 'isi jumlah hadir'],
     ['Tuntas 7 perjalanan', String(tuntasSemua)]
    ].forEach(function (r) {
      var d = el('div');
      d.appendChild(el('dt', '', r[0]));
      d.appendChild(el('dd', '', r[1]));
      dl.appendChild(d);
    });
  }

  $('cariSiswa').addEventListener('input', gambarRekap);

  /* ---------- Ekspor / impor ---------- */
  function unduh(namaBerkas, isi, tipe) {
    var blob = new Blob([isi], { type: tipe + ';charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = namaBerkas;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function sel(v) {
    var s = v == null ? '' : String(v);
    return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  $('btnCsv').addEventListener('click', function () {
    if (!rekap.length) { pesan('Rekap masih kosong.'); return; }

    var kepala = ['Nama', 'Kelas'];
    D.modul.forEach(function (m) {
      kepala.push(m.nama + ' — langkah', m.nama + ' — persen', m.nama + ' — nyawa', m.nama + ' — selesai');
    });
    kepala.push('Perjalanan tuntas');

    var baris = [kepala.map(sel).join(',')];
    rekap.slice().sort(function (a, b) { return a.nama.localeCompare(b.nama, 'id'); }).forEach(function (r) {
      var kol = [r.nama, r.kelas];
      var tuntas = 0;
      D.modul.forEach(function (m) {
        var h = r.hasil[m.id];
        if (h) tuntas++;
        kol.push(h ? angka(h.benar) + '/' + h.dari : '',
                 h && h.persen != null ? h.persen : '',
                 h && h.nyawa != null ? h.nyawa + '/' + m.nyawa : '',
                 h ? tanggal(h.selesai) : '');
      });
      kol.push(tuntas + '/' + D.modul.length);
      baris.push(kol.map(sel).join(','));
    });

    /* BOM supaya Excel membaca UTF-8 dengan benar */
    unduh('rekap-narrative-learn-' + new Date().toISOString().slice(0, 10) + '.csv',
          '﻿' + baris.join('\r\n'), 'text/csv');
    pesan('CSV diunduh.');
  });

  $('btnJsonOut').addEventListener('click', function () {
    if (!rekap.length) { pesan('Rekap masih kosong.'); return; }
    unduh('rekap-narrative-learn-' + new Date().toISOString().slice(0, 10) + '.json',
          JSON.stringify({ v: 1, dibuat: new Date().toISOString(), kelas: sesi.kelas || null, rekap: rekap }, null, 2),
          'application/json');
    pesan('JSON diunduh.');
  });

  $('btnJsonIn').addEventListener('click', function () {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'application/json,.json';
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        var isi;
        try { isi = JSON.parse(r.result); } catch (e) { pesan('Berkas bukan JSON yang sah.'); return; }
        var masuk = Array.isArray(isi) ? isi : isi.rekap;
        if (!Array.isArray(masuk)) { pesan('Berkas tidak memuat daftar rekap.'); return; }
        var n = 0;
        masuk.forEach(function (r2) {
          if (!r2 || !r2.nama) return;
          gabung({ nama: r2.nama, kelas: r2.kelas || '', hasil: r2.hasil || {} }, r2.sumber || 'impor');
          n++;
        });
        simpanRekap();
        gambarRekap();
        pesan(n + ' siswa digabungkan ke rekap.');
      };
      r.readAsText(f);
    });
    inp.click();
  });

  /* ==========================================================
     11. Kunci jawaban
     ========================================================== */
  function gambarKunci() {
    var m = modulKini();
    var bagianList = GURU_KUNCI[m.id] || [];
    var wadah = $('daftarKunci');
    wadah.textContent = '';

    $('kunciLede').textContent = D.dunia[m.dunia].nama + ' · ' + m.nama +
      ' — ' + bagianList.length + ' bagian aktivitas.';

    if (!bagianList.length) {
      wadah.appendChild(el('p', 'empty', 'Modul ini tidak punya kunci jawaban terstruktur.'));
      return;
    }

    bagianList.forEach(function (b) {
      var box = el('section', 'card kbagian');
      box.appendChild(el('h3', '', b.judul));
      if (b.catatan) box.appendChild(el('p', 'note', b.catatan));

      b.isi.forEach(function (it) {
        var d = el('div', 'kitem');
        d.appendChild(el('p', 'kitem__t', it.t));
        if (it.p && it.p.length) {
          var ol = el('ol', 'kitem__p');
          it.p.forEach(function (o) { ol.appendChild(el('li', '', o)); });
          d.appendChild(ol);
        }
        d.appendChild(el('b', 'kitem__j', it.j));
        if (it.c) d.appendChild(el('p', 'kitem__c', it.c));
        box.appendChild(d);
      });

      wadah.appendChild(box);
    });
  }

  $('btnSembunyi').addEventListener('click', function () {
    var on = document.body.classList.toggle('is-hidden-keys');
    this.textContent = on ? 'Tampilkan jawaban' : 'Sembunyikan jawaban';
    pesan(on ? 'Jawaban disembunyikan — arahkan penunjuk untuk mengintip satu per satu.' : 'Jawaban ditampilkan.');
  });

  /* ==========================================================
     12. Bantuan
     ========================================================== */
  function gambarBantuan() {
    var ol = $('urutanModul');
    ol.textContent = '';
    D.modul.forEach(function (m) {
      var li = el('li');
      li.appendChild(el('b', '', D.dunia[m.dunia].nama + ' · ' + m.nama));
      li.appendChild(document.createElement('br'));
      li.appendChild(el('span', 'note', m.fokus + ' — kunci ' + m.kunci));
      ol.appendChild(li);
    });
    $('pinNote').textContent = pinTerpasang()
      ? 'PIN terpasang. Tombol gembok di bilah atas mengunci panel.'
      : 'Belum ada PIN. Panel terbuka untuk siapa pun yang tahu alamatnya.';
  }

  $('btnSetPin').addEventListener('click', function () {
    var v = $('inPin').value.trim();
    if (v.length < 4) { pesan('PIN minimal 4 karakter.'); return; }
    tulis(K.PIN, { h: sidik(v) });
    $('inPin').value = '';
    gambarBantuan();
    pesan('PIN tersimpan.');
  });
  $('btnHapusPin').addEventListener('click', function () {
    buang(K.PIN);
    gambarBantuan();
    pesan('PIN dilepas.');
  });

  $('btnResetPanel').addEventListener('click', function () {
    if (!confirm('Hapus data panel: sesi, rekap, PIN, dan penanda pertanyaan terjawab?\n\nProgres siswa TIDAK ikut terhapus.')) return;
    buang(K.SESI); buang(K.REKAP); buang(K.PIN); buang(K.JAWAB);
    location.reload();
  });

  /* ==========================================================
     13. Penyetelan awal
     ========================================================== */
  function gambarSemua() {
    gambarSiap();
    gambarKartuModul();
    gambarSesi();
    gambarPanduan();
    gambarSinyal();
    gambarProgres();
    gambarSiswa();
    gambarTanya(true);
    gambarRekap();
    gambarKunci();
    gambarBantuan();
  }

  function boot() {
    isiPemilih();
    gambarSemua();
    if (pinTerpasang()) kunciPanel(); else bukaPanel();
  }
  boot();

  /* Pertanyaan siswa dan hasil modul bisa berubah saat panel
     sedang terbuka. Peristiwa storage menangkap perubahan dari
     TAB LAIN pada peramban yang sama; jajak dua detik menangkap
     perubahan dari tab ini sendiri, yang tidak memicu peristiwa
     itu. Keduanya murah karena hanya membaca localStorage. */
  window.addEventListener('storage', function (e) {
    if (!e.key) return;
    if (e.key === K.TANYA || e.key === K.JAWAB) gambarTanya(true);
    if (e.key === K.SISWA) gambarSiswa();
    if (e.key === K.GATE) gambarSinyal();
    if (D.modul.some(function (m) { return m.kunci === e.key; })) gambarProgres();
  });

  setInterval(function () {
    if (!terbuka) return;
    gambarTanya();
    if ($('p-kendali').classList.contains('is-on')) { gambarProgres(); gambarSinyal(); }
  }, 2000);

  /* Pintasan papan ketik: 1–7 melompat antar tab, N menandai
     langkah selesai. Berguna saat panel dipegang sambil mengajar. */
  document.addEventListener('keydown', function (e) {
    if (!terbuka) return;
    var t = e.target.tagName;
    if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key >= '1' && e.key <= '7') {
      var tab = tabs[+e.key - 1];
      if (tab) { keTab(tab.dataset.panel); e.preventDefault(); }
    }
    if ((e.key === 'n' || e.key === 'N') && $('p-panduan').classList.contains('is-on')) {
      $('btnNext').click();
      e.preventDefault();
    }
  });
})();
