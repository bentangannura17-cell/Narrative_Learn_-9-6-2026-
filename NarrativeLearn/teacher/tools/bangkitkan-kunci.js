/* ============================================================
   bangkitkan-kunci.js
   ------------------------------------------------------------
   Membangkitkan ulang teacher/kunci.js dari data soal yang ada di
   dalam script.js tiap modul siswa.

   Jalankan dari folder NarrativeLearn/:
     node teacher/tools/bangkitkan-kunci.js

   Kenapa dibangkitkan, bukan diketik ulang: kunci yang meleset
   satu butir lebih berbahaya daripada tidak ada kunci sama
   sekali. Selama soalnya diambil dari sumber yang sama dengan
   yang dinilai di layar siswa, keduanya tidak mungkin berbeda.

   Cara kerjanya: mencari literal `var NAMA = [ … ];` di dalam
   berkas, memotongnya dengan penghitung kurung yang sadar tanda
   kutip, lalu meng-eval potongan itu sendirian. Berkas modul
   tidak dijalankan utuh — di dalamnya ada pemanggilan DOM yang
   tidak akan hidup di Node.
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');

const AKAR = path.resolve(__dirname, '..', '..');
const TUJUAN = path.join(AKAR, 'teacher', 'kunci.js');

/* Beberapa literal menyebut konstanta yang dideklarasikan di
   baris lain (ORIENTATION_END, ROUND1_TARGETS, …). Baris-baris
   itu dikumpulkan lebih dulu sebagai pembuka eval. */
const PEMBUKA = /^var (?:ORIENTATION_END|COMPLICATION_END|RECALL2_TARGET|ROUND1_TARGETS|ROUND2_TARGETS) = [^\n]*$/gm;

function ambil(sumber, nama, pembuka) {
  const re = new RegExp('var\\s+' + nama + '\\s*=\\s*([\\[{])');
  const m = re.exec(sumber);
  if (!m) throw new Error('tidak menemukan var ' + nama);

  const mulai = m.index + m[0].length - 1;
  const buka = m[1];
  const tutup = buka === '[' ? ']' : '}';

  let dalam = 0, kutip = null, luput = false;
  for (let i = mulai; i < sumber.length; i++) {
    const c = sumber[i];
    if (luput) { luput = false; continue; }
    if (kutip) {
      if (c === '\\') luput = true;
      else if (c === kutip) kutip = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { kutip = c; continue; }
    if (c === buka) dalam++;
    else if (c === tutup && --dalam === 0) {
      /* eslint-disable no-eval */
      return eval(pembuka + '(' + sumber.slice(mulai, i + 1) + ')');
    }
  }
  throw new Error('literal ' + nama + ' tidak tertutup');
}

/* Nama berkas script tiap modul TIDAK dipatok di sini. Modul level 3
   pernah diganti nama sekali (script.js -> script_<Nama>.js) dan setiap
   tempat yang menyebutnya ikut putus — pembangkit ini termasuk. Yang
   dicari adalah satu-satunya berkas script*.js di dalam folder itu,
   jadi penggantian nama berikutnya tidak memutusnya lagi. */
function berkasScript(rel) {
  const dir = path.join(AKAR, rel);
  const cocok = fs.readdirSync(dir).filter((f) => /^script.*\.js$/i.test(f));
  if (cocok.length === 0) throw new Error('tidak ada script*.js di ' + rel);
  if (cocok.length > 1) {
    throw new Error('ada ' + cocok.length + ' berkas script*.js di ' + rel +
                    ' (' + cocok.join(', ') + ') — sisakan satu.');
  }
  return path.join(dir, cocok[0]);
}

function modul(rel) {
  const sumber = fs.readFileSync(berkasScript(rel), 'utf8');
  const pembuka = (sumber.match(PEMBUKA) || []).join('\n') + '\n';
  const baca = (nama) => ambil(sumber, nama, pembuka);
  /* ambil() hanya memahami literal [ dan {. Konstanta angka
     seperti RECALL2_TARGET dibaca lewat pintu terpisah ini. */
  baca.angka = (nama) => {
    const m = new RegExp('var\\s+' + nama + '\\s*=\\s*(-?\\d+(?:\\.\\d+)?)').exec(sumber);
    if (!m) throw new Error('tidak menemukan angka ' + nama);
    return Number(m[1]);
  };
  return baca;
}

const bersih = (s) => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const pilih = (opsi, jawab) => (typeof jawab === 'number' ? opsi[jawab] : jawab);

function soal(daftar, fT, fP, fJ, fC) {
  return daftar.map((q) => {
    const butir = { t: bersih(fT(q)) };
    const opsi = fP ? fP(q) : null;
    if (opsi) butir.p = opsi.map(bersih);
    butir.j = bersih(pilih(opsi || [], fJ(q)));
    if (fC) { const c = fC(q); if (c) butir.c = bersih(c); }
    return butir;
  });
}

const B  = modul('ocean-journey/nusa-barat');
const T  = modul('ocean-journey/nusa-timur');
const S  = modul('ocean-journey/nusa-selatan');
const BC = modul('lake-lembayung/bukit-camar');
const SK = modul('lake-lembayung/sunda-kelapa');
const MJ = modul('lake-lembayung/muara-jati');
const SG = modul('lake-lembayung/singhasari');

const K = {};

/* ---------- Nusa Barat ---------- */
const bBlok = B('STORY_BLOCKS'), bPilih = B('PART_OPTIONS');
K.oj_barat = [
  { judul: 'Label bagian cerita — 3 langkah',
    catatan: 'Siswa membaca satu blok, lalu memilih namanya. Pilihan yang tersedia: ' + bPilih.join(' / ') + '.',
    isi: bBlok.map((b, i) => ({
      t: 'Reading ' + (i + 1) + ' of 3 — ' + b.paragraphs.length + ' paragraf, dibuka dengan: "' +
         bersih(b.paragraphs[0]).slice(0, 70) + '…"',
      j: b.part
    })) },
  { judul: 'Kuis penutup — 10 soal',
    isi: soal(B('QUIZ'), q => q.question, q => q.options, q => q.correct) }
];

/* ---------- Nusa Timur ---------- */
const tPenanda = [];
T('STORY_PARAGRAPHS').forEach((p, i) => {
  p.targets.forEach((t) => tPenanda.push({ t: 'Paragraf ' + (i + 1), j: t }));
});
K.oj_timur = [
  { judul: 'Activity 1 · Time words — ' + tPenanda.length + ' penanda',
    catatan: 'Pengecoh yang sengaja dipasang: ' + T('MARKER_DECOYS').join(', ') + '.',
    isi: tPenanda },
  { judul: 'Activity 2 · Who says it? — 6 kutipan',
    catatan: 'Pilihan penutur: ' + T('SPEAKERS').join(' / ') + '.',
    isi: soal(T('QUOTES'), q => q.text + ' (' + q.context + ')', null, q => q.answer, q => q.feedback) },
  { judul: 'Activity 3 · Kuis — 7 soal',
    isi: soal(T('QUIZ'), q => q.question, q => q.options, q => q.answer, q => q.feedback) }
];

/* ---------- Nusa Selatan ---------- */
K.oj_selatan = [
  { judul: 'Activity 1 · Arti kata — 8 kata',
    isi: S('WORDS').map(w => ({
      t: w.word + ' — ' + bersih(w.context),
      p: w.options.map(bersih),
      j: bersih(w.answer),
      c: bersih(w.definition)
    })) },
  { judul: 'Activity 2 · What does it point to? — 6 kalimat',
    isi: S('POINTS').map(p => ({
      t: bersih(p.quote) + ' → ' + bersih(p.question),
      p: p.options.map(bersih),
      j: bersih(p.answer)
    })) },
  { judul: 'Activity 3 · Kuis rumpang — 6 soal',
    isi: soal(S('QUIZ'), q => q.sentence, q => q.options, q => q.answer, q => q.feedback) }
];

/* ---------- Bukit Camar ---------- */
K.lake_bukit = [
  { judul: 'Activity 1 · Penanda waktu — ' + BC('TIME_MARKERS').length + ' penanda tersedia',
    catatan: 'Siswa cukup menemukan ' + BC.angka('RECALL2_TARGET') + ' dari daftar ini; sisanya tetap sah. ' +
             'Pengecoh: ' + BC('TIME_DECOYS').join(', ') + '.',
    isi: BC('TIME_MARKERS').map(m => ({ t: 'Penanda waktu', j: m })) },
  { judul: 'Activity 2 · Batas struktur cerita — 3 pertanyaan',
    isi: BC('RECALL1_QUESTIONS').map(q => ({
      t: bersih(q.prompt), j: 'Paragraf ' + q.answer, c: bersih(q.correct)
    })) }
];

/* ---------- Sunda Kelapa ---------- */
const skRonde = SK('ROUNDS');
K.lake_sunda = [
  { judul: 'Round 1 · Angka tersembunyi — ' + skRonde[0].targets.length + ' target',
    catatan: 'Klik salah hanya bergetar, tidak mengurangi nyawa.',
    isi: skRonde[0].targets.map(t => ({ t: 'Kata/angka yang harus diketuk', j: t })) },
  { judul: 'Round 2 · Satu nama — ' + skRonde[1].targets.length + ' target',
    isi: skRonde[1].targets.map(t => ({ t: 'Nama anggota tim SAR yang menemukan titik sumur', j: t })) },
  { judul: 'Kuis — 15 soal',
    isi: soal(SK('QUIZ'), q => q.question, q => q.options, q => q.answer, q => q.feedback) }
];

/* ---------- Muara Jati ---------- */
K.lake_muara = [
  { judul: 'Activity · 4 sesi menyusun kartu',
    catatan: 'Urutan benar dibaca dari kiri ke kanan.',
    isi: MJ('SESSIONS').map(s => ({
      t: s.label + ' — ' + s.order.length + ' kartu',
      j: s.order.map((id, i) => (i + 1) + '. ' + bersih(s.cards[id])).join('  |  ')
    })) },
  { judul: 'Kuis — 6 soal',
    isi: soal(MJ('QUIZ'), q => q.question, q => q.options, q => q.answer, q => q.feedback) }
];

/* ---------- Singhasari ---------- */
K.lake_singha = [
  { judul: 'Choose & Justify — 10 skenario (pilihan + alasan)',
    isi: SG('DILEMMAS').map((x, i) => ({
      t: (i + 1) + '. ' + bersih(x.prompt),
      p: x.choices.map(bersih),
      j: bersih(x.choices[x.answer]) + ' — alasan terbaik: ' + bersih(x.reasons[x.reasonAnswer]),
      c: bersih(x.feedback)
    })) },
  { judul: 'Kuis — 4 soal',
    isi: soal(SG('QUIZ'), q => q.question, q => q.options, q => q.answer, q => q.feedback) }
];

const KEPALA = `/* ============================================================
   NarrativeLearn · Platform Guru — kunci.js
   ------------------------------------------------------------
   KUNCI JAWABAN semua perjalanan.

   Berkas ini DIBANGKITKAN dari data di dalam script.js tiap
   modul siswa, jadi isinya persis sama dengan yang dinilai di
   layar siswa. Kalau soal di modul diubah, bangkitkan ulang
   berkas ini — jangan disunting sebelah tangan, karena kunci
   yang meleset lebih berbahaya daripada tidak ada kunci.

     node teacher/tools/bangkitkan-kunci.js

   Bentuk satu butir:
     t = pertanyaan / perintah      p = pilihan (kalau ada)
     j = jawaban benar              c = catatan untuk guru
   ============================================================ */
var GURU_KUNCI = `;

fs.writeFileSync(TUJUAN, KEPALA + JSON.stringify(K, null, 2) + ';\n');

Object.keys(K).forEach((id) => {
  const butir = K[id].reduce((a, b) => a + b.isi.length, 0);
  console.log(id.padEnd(12), K[id].length + ' bagian', butir + ' butir');
});
console.log('\ntertulis: ' + path.relative(AKAR, TUJUAN));
