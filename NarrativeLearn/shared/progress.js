/* ============================================================
   NARRATIVE LEARN — shared/progress.js
   ------------------------------------------------------------
   Satu-satunya tempat progres siswa dibaca dan ditulis.
   Dimuat SEBELUM script.js halaman:

     <script src="../../shared/progress.js"></script>
     <script src="script.js"></script>

   Semua fungsi ada di dalam objek global bernama NL.

   ------------------------------------------------------------
   YANG PALING SERING DIPAKAI
   ------------------------------------------------------------
     NL.selesai('ocean', 1)                    tandai selesai
     NL.selesai('ocean', 1, {skor:8, dari:10}) selesai + nilai
     NL.sudahSelesai('ocean', 1)               true / false
     NL.terbuka('ocean', 2)                    boleh dibuka?
     NL.muatMateri('content.json')             ambil materi (Promise)

   ------------------------------------------------------------
   BENTUK DATA YANG TERSIMPAN
   ------------------------------------------------------------
     {
       id: "nl_k3f9x2...",              identitas HP ini
       dibuat: "2026-08-16T09:00:00Z",
       bukaSemua: false,
       progres: {
         "ocean:1": { selesai:true, waktu:"...", kunjungan:3, skor:8, dari:10 },
         "lake:2":  { selesai:false, waktu:null, kunjungan:1 }
       }
     }

   Bentuk ini SENGAJA dibuat seperti ini sejak sekarang supaya
   nanti, saat dashboard guru dipasang, datanya tinggal dikirim
   apa adanya. Lihat bagian "TITIK SAMBUNG BACKEND" di bawah.

   ------------------------------------------------------------
   BATASNYA — penting
   ------------------------------------------------------------
   Semua ini tersimpan di localStorage, yang terikat pada satu
   peramban di satu HP. Kalau siswa ganti HP, memakai mode
   penyamaran, atau membersihkan data peramban, progresnya
   HILANG. Itu batas nyata yang hanya bisa dihapus oleh backend.
   ============================================================ */

(function (global) {
  'use strict';

  var KUNCI = 'nl:v1';

  /* ---------- localStorage yang tidak pernah melempar error ----------
     Di mode penyamaran Safari, localStorage bisa gagal menulis.
     Kalau itu terjadi, halaman harus tetap jalan (tanpa progres),
     bukan berhenti dengan layar kosong. */
  function baca() {
    try {
      var mentah = localStorage.getItem(KUNCI);
      if (mentah) return JSON.parse(mentah);
    } catch (e) {}
    return null;
  }

  function tulis(data) {
    try { localStorage.setItem(KUNCI, JSON.stringify(data)); return true; }
    catch (e) { return false; }
  }

  function idBaru() {
    var s = 'nl_';
    var huruf = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 12; i++) s += huruf[Math.floor(Math.random() * huruf.length)];
    return s;
  }

  /* ---------- Muat, atau buat kalau belum ada ---------- */
  var data = baca();

  if (!data || typeof data !== 'object') {
    data = { id: idBaru(), dibuat: new Date().toISOString(), bukaSemua: false, progres: {} };

    /* Pindahan dari format lama (nl:done:ocean:1). Berjalan sekali saja,
       supaya progres uji coba yang sudah ada tidak hilang. */
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('nl:done:') === 0 && localStorage.getItem(k) === '1') {
          var bagian = k.split(':');           // ["nl","done","ocean","1"]
          data.progres[bagian[2] + ':' + bagian[3]] =
            { selesai: true, waktu: null, kunjungan: 1 };
        }
      }
      if (localStorage.getItem('nl:unlockall') === '1') data.bukaSemua = true;
    } catch (e) {}

    tulis(data);
  }

  if (!data.progres) data.progres = {};
  if (!data.id) data.id = idBaru();

  function kunci(dunia, nomor) { return dunia + ':' + nomor; }

  /* Urutan dan ukuran tiap dunia. Kalau jumlah platform berubah,
     UBAH DI SINI SAJA — seluruh proyek ikut. */
  var URUTAN     = ['ocean', 'lake'];
  var JUMLAH     = { ocean: 3, lake: 4 };
  var NAMA_DUNIA = { ocean: 'Ocean Journey', lake: 'The Lake of Lembayung' };

  /* Nama tiap platform level 3, berurutan. Ditaruh di sini supaya peta
     induk bisa menampilkan status kunci ketujuhnya tanpa perlu memuat
     halaman hub-nya dulu — dan supaya nama itu cuma ditulis di SATU
     tempat. Judul di kartu hub tetap ditulis di HTML masing-masing hub;
     yang di sini dipakai untuk daftar ringkas di peta induk. */
  var PLATFORM = {
    ocean: ['Nusa Barat', 'Nusa Timur', 'Nusa Selatan'],
    lake:  ['Bukit Camar', 'Sunda Kelapa', 'Muara Jati', 'Singhasari']
  };

  /* ==========================================================
     JEMBATAN KE KUNCI ASLI TIAP PLATFORM
     ----------------------------------------------------------
     Ketujuh platform daun sudah punya rantai kuncinya sendiri,
     dipakai jauh sebelum berkas ini ada:

         oj_barat_v1 -> oj_timur_v1 -> oj_selatan_v1
           -> lake_bukit_v1 -> lake_sunda_v1
           -> lake_muara_v1 -> lake_singha_v1

     Tiap platform membaca kunci platform SEBELUMNYA untuk
     memutuskan boleh dibuka atau tidak, lalu menulis kuncinya
     sendiri berbentuk { v, status, score, ... } begitu siswa lulus.

     Kalau NL hanya memakai catatannya sendiri, akan ada DUA
     sumber kebenaran yang bisa berbeda: kartu di hub tampak
     terkunci padahal platformnya sudah tuntas dikerjakan. Karena
     itu kunci-kunci di bawah inilah yang dijadikan sumber
     kebenaran, dan NL menyerapnya setiap kali data dibaca ulang.
     ========================================================== */
  var KUNCI_PLATFORM = {
    'ocean:1': 'oj_barat_v1',
    'ocean:2': 'oj_timur_v1',
    'ocean:3': 'oj_selatan_v1',
    'lake:1':  'lake_bukit_v1',
    'lake:2':  'lake_sunda_v1',
    'lake:3':  'lake_muara_v1',
    'lake:4':  'lake_singha_v1'
  };

  function bacaKunciPlatform(nama) {
    try {
      var mentah = localStorage.getItem(nama);
      return mentah ? JSON.parse(mentah) : null;
    } catch (e) { return null; }
  }

  /* Kunci platform -> catatan NL. Hanya menambah: catatan NL yang
     sudah bertanda selesai tidak ditimpa, supaya nilai yang lebih
     rinci (bintang, percobaan) tidak hilang. */
  function serapKunciPlatform() {
    var berubah = false;
    for (var k in KUNCI_PLATFORM) {
      if (!Object.prototype.hasOwnProperty.call(KUNCI_PLATFORM, k)) continue;
      var rekaman = bacaKunciPlatform(KUNCI_PLATFORM[k]);
      if (!rekaman || rekaman.status !== 'completed') continue;

      /* Kunci yang ditulis "Buka semua kunci" hanya MEMBUKA gerbang,
         bukan menandai kelulusan. Kalau ikut diserap, ketujuh platform
         langsung tercatat selesai — dan catatan palsu itu tidak hilang
         lagi walau tombolnya dimatikan, karena serap hanya menambah.
         Penanda `dibukaPaksa` sudah ada sejak awal untuk membedakan
         keduanya; di sinilah pembedaan itu dipakai. */
      if (rekaman.dibukaPaksa) continue;

      var r = data.progres[k] || { kunjungan: 0 };
      if (r.selesai) continue;
      r.selesai = true;
      r.waktu = rekaman.completedAt || new Date().toISOString();
      if (typeof rekaman.score    === 'number') r.skor      = rekaman.score;
      if (typeof rekaman.maxScore === 'number') r.dari      = rekaman.maxScore;
      if (typeof rekaman.stars    === 'number') r.bintang   = rekaman.stars;
      if (typeof rekaman.attempts === 'number') r.percobaan = rekaman.attempts;
      data.progres[k] = r;
      berubah = true;
    }
    if (berubah) tulis(data);
  }

  /* Arah sebaliknya. Platform yang menandai selesai lewat NL saja
     tetap harus mengisi kunci aslinya, kalau tidak gerbang di
     platform berikutnya tidak akan terbuka. Platform yang sudah
     menulis kuncinya sendiri tidak terpengaruh: rekaman yang
     sudah berstatus completed tidak disentuh. */
  function tulisKunciPlatform(dunia, nomor, r) {
    var nama = KUNCI_PLATFORM[dunia + ':' + nomor];
    if (!nama) return;

    var rekaman = bacaKunciPlatform(nama);
    if (rekaman && rekaman.status === 'completed') return;
    if (!rekaman) rekaman = { v: 1 };

    rekaman.status = 'completed';
    rekaman.completedAt = r.waktu || new Date().toISOString();
    if (typeof r.skor === 'number') rekaman.score    = r.skor;
    if (typeof r.dari === 'number') rekaman.maxScore = r.dari;
    try { localStorage.setItem(nama, JSON.stringify(rekaman)); } catch (e) {}
  }

  /* "Buka semua kunci" harus ikut membuka gerbang DI DALAM tiap
     platform, bukan cuma kartu di hub — gerbang itu membaca kunci
     platform sebelumnya, bukan NL. Kunci yang belum ada diisi
     dengan penanda `dibukaPaksa` supaya masih bisa dibedakan dari
     kelulusan yang sebenarnya. */
  function bukaKunciPlatform() {
    for (var k in KUNCI_PLATFORM) {
      if (!Object.prototype.hasOwnProperty.call(KUNCI_PLATFORM, k)) continue;
      var nama = KUNCI_PLATFORM[k];
      if (bacaKunciPlatform(nama)) continue;
      try {
        localStorage.setItem(nama, JSON.stringify({
          v: 1, status: 'completed', dibukaPaksa: true,
          completedAt: new Date().toISOString()
        }));
      } catch (e) {}
    }
  }

  /* Kebalikan dari bukaKunciPlatform(): hanya kunci yang lahir dari
     "Buka semua kunci" yang dicabut. Tanpa ini, mematikan tombolnya
     mengunci lagi kartu di hub tapi gerbang DI DALAM tiap platform
     tetap terbuka — dua sumber kebenaran yang saling bertentangan. */
  function tutupKunciPaksa() {
    for (var k in KUNCI_PLATFORM) {
      if (!Object.prototype.hasOwnProperty.call(KUNCI_PLATFORM, k)) continue;
      var nama = KUNCI_PLATFORM[k];
      var rekaman = bacaKunciPlatform(nama);
      if (rekaman && rekaman.dibukaPaksa) {
        try { localStorage.removeItem(nama); } catch (e) {}
      }
    }
  }

  /* Atur ulang progres harus menghapus kunci platform juga. Kalau
     tidak, catatan NL kosong tapi kunci lama masih ada, lalu
     serapKunciPlatform() langsung mengisinya kembali dan tombolnya
     tampak tidak berfungsi. */
  function hapusKunciPlatform() {
    for (var k in KUNCI_PLATFORM) {
      if (!Object.prototype.hasOwnProperty.call(KUNCI_PLATFORM, k)) continue;
      try { localStorage.removeItem(KUNCI_PLATFORM[k]); } catch (e) {}
    }
  }

  serapKunciPlatform();

  /* ==========================================================
     API
     ========================================================== */
  var NL = {

    /* Identitas HP ini. Belum dipakai untuk apa-apa hari ini —
       tapi tanpa ini, dashboard guru nanti cuma melihat tumpukan
       progres tanpa tahu milik siapa. */
    id: function () { return data.id; },

    /* Catat bahwa satu perjalanan sudah selesai.
       `nilai` opsional, bebas isinya: {skor:8, dari:10}, {menit:12}, dst. */
    selesai: function (dunia, nomor, nilai) {
      var k = kunci(dunia, nomor);
      var r = data.progres[k] || { kunjungan: 0 };
      r.selesai = true;
      r.waktu = new Date().toISOString();
      if (nilai && typeof nilai === 'object') {
        for (var f in nilai) if (Object.prototype.hasOwnProperty.call(nilai, f)) r[f] = nilai[f];
      }
      data.progres[k] = r;
      tulis(data);
      tulisKunciPlatform(dunia, nomor, r);
      kirimKeServer(dunia, nomor, r);
      return r;
    },

    /* Catat bahwa siswa membuka perjalanan ini (belum tentu selesai).
       Berguna nanti untuk guru: "dibuka tapi tidak pernah tuntas". */
    dibuka: function (dunia, nomor) {
      var k = kunci(dunia, nomor);
      var r = data.progres[k] || { selesai: false, waktu: null, kunjungan: 0 };
      r.kunjungan = (r.kunjungan || 0) + 1;
      r.terakhirDibuka = new Date().toISOString();
      data.progres[k] = r;
      tulis(data);
      return r;
    },

    sudahSelesai: function (dunia, nomor) {
      var r = data.progres[kunci(dunia, nomor)];
      return !!(r && r.selesai);
    },

    /* Seluruh catatan satu perjalanan, atau null. */
    catatan: function (dunia, nomor) {
      return data.progres[kunci(dunia, nomor)] || null;
    },

    /* ------------------------------------------------------
       URUTAN SELURUH RANGKAIAN

       Ketujuh platform adalah SATU rangkaian, bukan dua rantai
       terpisah: Ocean 1,2,3 lalu Lake 1,2,3,4.

       Aturan ini sengaja ditaruh di sini, bukan di halaman peta,
       karena peta bukan satu-satunya pintu masuk. Siswa bisa
       menyimpan alamat halaman mana pun. Kalau aturannya hanya
       ada di peta induk, alamat langsung ke platform pertama
       Lake akan menembus kuncinya.
       ------------------------------------------------------ */
    URUTAN: URUTAN,
    JUMLAH: JUMLAH,
    NAMA_DUNIA: NAMA_DUNIA,
    PLATFORM: PLATFORM,

    /* Keadaan satu platform level 3 dalam satu kata, untuk ditampilkan
       sebagai status — bukan sebagai penghalang. Peta induk memakai ini
       untuk memberi tahu siswa apa yang sudah, sedang, dan belum bisa
       dikerjakan, sementara tautan ke hub-nya sendiri selalu terbuka. */
    keadaan: function (dunia, nomor) {
      if (NL.sudahSelesai(dunia, nomor)) return 'selesai';
      return NL.terbuka(dunia, nomor) ? 'terbuka' : 'terkunci';
    },

    duniaTuntas: function (w) {
      return NL.jumlahSelesai(w, JUMLAH[w] || 0) === (JUMLAH[w] || 0);
    },

    duniaSebelum: function (w) {
      var i = URUTAN.indexOf(w);
      return i > 0 ? URUTAN[i - 1] : null;
    },

    duniaTerbuka: function (w) {
      if (data.bukaSemua) return true;
      var sebelum = NL.duniaSebelum(w);
      return !sebelum || NL.duniaTuntas(sebelum);
    },

    /* Boleh dibuka? Tiga syarat berlapis:
         1. dunianya sendiri sudah boleh dibuka, DAN
         2. perjalanan 1 selalu boleh, atau
         3. perjalanan sebelumnya sudah selesai.                */
    terbuka: function (dunia, nomor) {
      if (data.bukaSemua) return true;
      if (!NL.duniaTerbuka(dunia)) return false;
      if (Number(nomor) <= 1) return true;
      return NL.sudahSelesai(dunia, Number(nomor) - 1);
    },

    /* Berapa yang sudah selesai dari satu dunia. */
    jumlahSelesai: function (dunia, total) {
      var n = 0;
      for (var i = 1; i <= total; i++) if (NL.sudahSelesai(dunia, i)) n++;
      return n;
    },

    /* Jalan darurat: siswa yang datanya terhapus tidak boleh terblokir. */
    bukaSemua: function (nyala) {
      data.bukaSemua = (nyala !== false);
      tulis(data);
      if (data.bukaSemua) bukaKunciPlatform(); else tutupKunciPaksa();
      return data.bukaSemua;
    },
    semuaTerbuka: function () { return !!data.bukaSemua; },

    /* Identitas siswa (nl_student_v1) sengaja TIDAK ikut terhapus —
       siswa yang ingin mengulang materi tidak seharusnya kehilangan
       namanya. */
    reset: function () {
      data = { id: data.id, dibuat: data.dibuat, bukaSemua: false, progres: {} };
      tulis(data);
      hapusKunciPlatform();
    },

    /* Seluruh isi. Inilah yang nanti dikirim ke dashboard guru. */
    semua: function () { return JSON.parse(JSON.stringify(data)); },

    /* ------------------------------------------------------
       IDENTITAS SISWA

       Disimpan di kuncinya sendiri, 'nl_student_v1', TERPISAH dari
       progres — bukan di dalam 'nl:v1'. Alasannya: platform level 3
       sudah membaca kunci itu apa adanya lewat
       JSON.parse(localStorage.getItem('nl_student_v1')), jadi
       bentuknya harus persis { name, class } dan tidak boleh
       dibungkus ulang.

       "Atur ulang progres" sengaja TIDAK menghapus ini: siswa yang
       ingin mengulang materi tidak seharusnya kehilangan namanya.
       ------------------------------------------------------ */
    siswa: function () {
      try {
        var mentah = localStorage.getItem('nl_student_v1');
        if (!mentah) return null;
        var s = JSON.parse(mentah);
        return (s && s.name) ? s : null;
      } catch (e) { return null; }
    },

    simpanSiswa: function (nama, kelas) {
      var s = { name: String(nama || '').trim(), class: String(kelas || '').trim() };
      try { localStorage.setItem('nl_student_v1', JSON.stringify(s)); } catch (e) {}
      return s;
    },

    /* ------------------------------------------------------
       Memuat materi dari file terpisah.

       Materi sengaja TIDAK ditulis di dalam HTML supaya bisa
       diubah tanpa menyentuh halamannya. Nanti saat ada
       backend, cukup ganti alamatnya:

           NL.muatMateri('content.json')                 sekarang
           NL.muatMateri(API + '/materi/teluk-awal')     nanti

       Catatan: fetch tidak bisa membaca file lewat file://.
       Halaman HARUS dibuka lewat Live Server, bukan diklik
       dua kali dari folder. Pesan errornya sudah dijelaskan
       di bawah supaya tidak membingungkan.
       ------------------------------------------------------ */
    muatMateri: function (alamat) {
      return fetch(alamat, { cache: 'no-cache' })
        .then(function (r) {
          if (!r.ok) throw new Error('Materi tidak ditemukan (' + r.status + '): ' + alamat);
          return r.json();
        })
        .catch(function (e) {
          if (location.protocol === 'file:') {
            throw new Error(
              'Materi tidak bisa dimuat karena halaman dibuka langsung dari folder. ' +
              'Buka lewat Live Server di VS Code (klik kanan index.html → Open with Live Server).'
            );
          }
          throw e;
        });
    }
  };

  /* ==========================================================
     TITIK SAMBUNG BACKEND
     ----------------------------------------------------------
     Hari ini tidak melakukan apa-apa. Nanti, saat dashboard guru
     dipasang, cukup isi NL.kirim di satu tempat (misalnya di
     halaman induk) dan SELURUH platform langsung ikut melapor —
     tanpa satu pun dari 7 platform disentuh:

         NL.kirim = function (rekaman) {
           fetch(API + '/progres', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(rekaman)
           });
         };

     `rekaman` berbentuk:
         { id, dunia, nomor, selesai, waktu, skor, ... }
     ========================================================== */
  NL.kirim = null;

  function kirimKeServer(dunia, nomor, r) {
    if (typeof NL.kirim !== 'function') return;
    var rekaman = { id: data.id, dunia: dunia, nomor: Number(nomor) };
    for (var f in r) if (Object.prototype.hasOwnProperty.call(r, f)) rekaman[f] = r[f];
    try { NL.kirim(rekaman); } catch (e) {}
  }

  /* ==========================================================
     MENYEGARKAN DATA
     ----------------------------------------------------------
     localStorage dibaca SEKALI saat berkas ini dimuat, lalu
     disimpan di variabel `data`. Itu cepat, tapi ada dua keadaan
     yang membuat salinan itu basi:

       1. Siswa menekan tombol Back peramban. Halaman dipulihkan
          dari bfcache LENGKAP dengan keadaan JavaScript-nya —
          termasuk `data` yang lama. Tanpa penyegaran, hub akan
          menampilkan kunci seperti sebelum platform dikerjakan,
          padahal progresnya sudah tersimpan.

       2. Siswa membuka dua tab sekaligus dan menyelesaikan
          sesuatu di tab lain.

     Keduanya ditangani di sini, satu kali, untuk semua halaman.
     Berkas ini dimuat sebelum script tiap halaman, jadi penyegaran
     ini selalu berjalan lebih dulu daripada penangan pageshow
     milik halaman yang membaca ulang keadaan kunci.
     ========================================================== */
  function segarkan() {
    var baru = baca();
    if (baru && typeof baru === 'object') {
      data = baru;
      if (!data.progres) data.progres = {};
      if (!data.id) data.id = idBaru();
    }
    serapKunciPlatform();
  }
  NL.muatUlang = segarkan;

  global.addEventListener('pageshow', function (e) { if (e.persisted) segarkan(); });
  global.addEventListener('storage', function (e) { if (!e.key || e.key === KUNCI) segarkan(); });

  global.NL = NL;
})(window);
