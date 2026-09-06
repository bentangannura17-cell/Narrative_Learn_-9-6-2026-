/* ============================================================
   Nusa Selatan — NarrativeLearn  (revisi navigasi & coach mark)
   /ocean-journey/nusa-selatan/

   Alur: locked → welcome 1 → welcome 2 → tunggu guru → video →
   tunggu guru → Activity 1 (delapan kata: menebak → halaman arti
   + bunyi) → Activity 2 (What does it point to?, satu kalimat per
   layar) → Activity 3 (kuis enam kalimat rumpang) → hasil (tiga
   layar berurutan).

   Penilaian: 20 langkah = 8 kata + 6 kalimat + 6 soal.
   Benar tanpa salah = 1 langkah. Setelah DUA kali salah pada
   langkah yang sama, jawaban benar ditunjukkan dan langkah itu
   dihitung SETENGAH (0,5). Tidak ada lulus/gagal — sama dengan
   modul Nusa Barat & Nusa Timur.
   Nyawa: 7 — setiap jawaban salah mengurangi satu. Habis → layar
   tunggu guru; guru yang memulihkan.

   Yang berubah pada revisi ini:
   1. Navigasi mundur punya TUMPUKAN RIWAYAT SENDIRI (objek Flow),
      disambungkan ke history.pushState/popstate supaya tombol back
      fisik Android & gestur tepi mundur SATU langkah di dalam
      pelajaran, bukan menutup pelajaran.
   2. Mundur ke langkah yang sudah dijawab masuk MODE TINJAU:
      pilihan terkunci, skor/nyawa/State.*Review tidak berubah
      sedikit pun, dan tombol maju berbunyi "Back to where I was".
   3. Satu layar satu tugas: #wordPage dipecah jadi menebak
      (#wordPage) + arti & bunyi (#wordMeaningPage); halaman hasil
      dipecah jadi tiga layar.
   4. Coach mark menyala OTOMATIS sekali per tahap, selalu dengan
      sorotan pada elemen nyata (objek Coach + COACH).

   Kunci localStorage (kontrak lintas modul, tidak berubah):
     oj_timur_v1  — prasyarat
     oj_selatan_v1 — {v,status,score,maxScore,stars,correct,total,
                      revealed,livesUsed,attempts,completedAt}
     nl_student_v1, nl_questions_v1
     oj_selatan_attempt_temp — sessionStorage
   Kunci BARU (tidak mengganggu kontrak lama):
     oj_selatan_coach_v1 — {words:true, points:true, ...}

   Aset lokal: gambar/<kata>.jpg, audio/<kata>.mp3,
   video/materi-nusa-selatan.mp4 (lihat catatan di index.html).
   ============================================================ */

/* ============================================================
   ⚠️ MODE PENGEMBANG — HAPUS SEBELUM LAUNCHING
   Kotak kiri  = meloloskan SATU langkah yang tampil.
   Kotak kanan = menyalakan/mematikan coach mark otomatis.
   DEV_MODE juga yang memunculkan nama berkas teknis di plat
   gambar/audio/video; siswa sungguhan tidak pernah melihatnya.
   ============================================================ */
/* ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
   T5 butir 1: NILAI INI HARUS `false` SEBELUM DIPAKAI SISWA.
   Saat true, gerbang prasyarat (Nusa Timur) DILEWATI SEPENUHNYA —
   lihat `if (!DEV_MODE && (!prereq || ...))` di blok init paling
   bawah berkas ini — dan panel pengembang serta nama berkas teknis
   ditampilkan ke siapa pun yang membuka halaman ini.
   ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */
var DEV_MODE = true;
/* ====================== AKHIR CATATAN ATAS ====================== */

var KEY_PREREQ = 'oj_timur_v1';
var KEY_SELF = 'oj_selatan_v1';
var KEY_STUDENT = 'nl_student_v1';
var KEY_ATTEMPT = 'oj_selatan_attempt_temp';
var KEY_COACH = 'oj_selatan_coach_v1';        /* penanda coach mark per tahap */
var KEY_DEV_COACH = 'oj_selatan_dev_coach';   /* sessionStorage — alat pengembang */

var TOTAL_LIVES = 7;
var REVEAL_AFTER_WRONG = 2;

/* ---------------- Activity 1: delapan kata (teks resmi, jangan diubah) ----------------
   `slug` menentukan nama berkas: gambar/<slug>.jpg & audio/<slug>.mp3 */
var WORDS = [
  {
    word: 'mangrove',
    slug: 'mangrove',
    context: '“Mangrove trees grow next to the beach. Their roots are big and strong.”',
    options: [
      'a tree with big roots, near the beach',
      'a big fish that lives near the coast',
      'a fisherman’s boat',
      'a strong rope'
    ],
    answer: 'a tree with big roots, near the beach',
    definition: 'A tree that grows near the beach. It has big roots in the mud.',
    gloss: 'Pohon yang tumbuh di pantai, dengan akar besar yang mencengkeram lumpur.'
  },
  {
    word: 'abrasion',
    slug: 'abrasion',
    context: '“Every day, the waves took away the sand from the beach. People called this abrasion.”',
    options: [
      'when waves take away the sand and land from the beach',
      'when the sea becomes calm and quiet',
      'when fishermen catch a lot of fish',
      'when a strong wind brings rain'
    ],
    answer: 'when waves take away the sand and land from the beach',
    definition: 'When waves take away the sand and land from the beach, again and again.',
    gloss: 'Ketika ombak mengikis dan membawa pergi pasir serta tanah dari pantai, terus-menerus.'
  },
  {
    word: 'brackish',
    slug: 'brackish',
    context: '“The well water became brackish. It was a little salty, and not good to drink.”',
    options: [
      'water that is a little salty and not good to drink',
      'water that is very cold and clean',
      'water that is used to make charcoal',
      'water that comes only from rain'
    ],
    answer: 'water that is a little salty and not good to drink',
    definition: 'Water that is a little salty and not good to drink.',
    gloss: 'Air yang agak asin dan tidak baik untuk diminum.'
  },
  {
    word: 'charcoal',
    slug: 'charcoal',
    context: '“Some people cut down mangrove trees to make charcoal. They sold the charcoal in the city.”',
    options: [
      'black material from burnt wood, for cooking fire',
      'a green plant that grows in the mud',
      'a tool for building pond walls',
      'a type of fish found near mangroves'
    ],
    answer: 'black material from burnt wood, for cooking fire',
    definition: 'Black material from burnt wood. People use it to cook food.',
    gloss: 'Bahan hitam hasil pembakaran kayu, dipakai untuk memasak.'
  },
  {
    word: 'pond wall',
    slug: 'pond_wall',
    context: '“Big waves broke the pond walls on Nusa Selatan. Sea water destroyed the new fish ponds.”',
    options: [
      'a mud wall around a fish pond',
      'a small boat for the pond',
      'a fishing net',
      'a path that goes to the beach'
    ],
    answer: 'a mud wall around a fish pond',
    definition: 'A wall of mud around a fish pond.',
    gloss: 'Tanggul tanah yang dibangun mengelilingi tambak ikan.'
  },
  {
    word: 'coconut shell',
    slug: 'coconut_shell',
    context: '“There were many coconuts on the three islands. So people made charcoal from coconut shells.”',
    options: [
      'the hard part of the coconut',
      'the water inside a coconut',
      'the leaves of a coconut tree',
      'the root of a mangrove tree'
    ],
    answer: 'the hard part of the coconut',
    definition: 'The hard part on the outside of a coconut.',
    gloss: 'Bagian keras di bagian luar buah kelapa (tempurung).'
  },
  {
    word: 'coast',
    slug: 'coast',
    context: '“There were three small islands near the coast. Their names were Nusa Barat, Nusa Timur, and Nusa Selatan.”',
    options: [
      'the land next to the sea',
      'a small hill far from the sea',
      'a boat that sails at night',
      'a kind of strong wind'
    ],
    answer: 'the land next to the sea',
    definition: 'The land that is next to the sea.',
    gloss: 'Daratan yang berbatasan langsung dengan laut (pesisir).'
  },
  {
    word: 'seedling',
    slug: 'seedling',
    context: '“People planted many seedlings on the beach. After a few months, the seedlings started to grow.”',
    options: [
      'a very young plant',
      'a fully grown tree',
      'a small fishing net',
      'a type of sea shell'
    ],
    answer: 'a very young plant',
    definition: 'A very young plant, just starting to grow.',
    gloss: 'Tanaman yang masih sangat muda, baru mulai tumbuh (bibit).'
  }
];

/* ---------------- Activity 2: What does it point to? ---------------- */
var POINTS = [
  {
    quote: '“Every afternoon, <strong>they</strong> played on the beach.”',
    question: 'Who does “they” point to?',
    options: ['Sagara and Mutiara', 'Grandpa Bahri and a fisherman', 'the coconut farmers', 'the mangrove trees'],
    answer: 'Sagara and Mutiara'
  },
  {
    quote: '“<strong>Their roots</strong> stop the big waves.”',
    question: 'Whose roots are these?',
    options: ['the mangroves', 'the coconut trees', 'the fish ponds', 'the village houses'],
    answer: 'the mangroves'
  },
  {
    quote: '“Grandpa Bahri stood on the beach. ‘We must plant mangroves again,’ <strong>he</strong> said.”',
    question: 'Who does “he” point to?',
    options: ['Grandpa Bahri', 'a fisherman from Nusa Timur', 'Sagara', 'a boy from Nusa Selatan'],
    answer: 'Grandpa Bahri'
  },
  {
    quote: '“Big waves always hit the mangrove forest first. Then <strong>they</strong> reached the houses.”',
    question: 'Who or what does “they” point to?',
    options: ['the big waves', 'Sagara and Mutiara', 'the mangroves', 'the fishermen'],
    answer: 'the big waves'
  },
  {
    quote: '“The people of Nusa Timur stopped cutting mangrove trees. <strong>They</strong> made charcoal from coconut shells instead.”',
    question: 'Who does “They” point to?',
    options: ['the people of Nusa Timur', 'the people of Nusa Selatan', 'Sagara and Mutiara', 'Grandpa Bahri'],
    answer: 'the people of Nusa Timur'
  },
  {
    quote: '“A few months later, the seedlings started to grow. <strong>Their</strong> new roots grew into the beach mud.”',
    question: 'Whose roots are these?',
    options: ['the seedlings', 'the coconut trees', 'the fish ponds', 'the pond walls'],
    answer: 'the seedlings'
  }
];

/* ---------------- Activity 3: kuis, kalimat rumpang ---------------- */
var QUIZ = [
  {
    sentence: 'There were no mangrove roots. The waves took away the sand and land from the beach. This is called ___.',
    options: ['abrasion', 'a flood', 'a storm', 'an island'],
    answer: 'abrasion'
  },
  {
    sentence: 'Big waves broke the ___. Sea water destroyed the new fish ponds.',
    options: ['pond wall', 'a boat', 'a bridge', 'a market'],
    answer: 'pond wall'
  },
  {
    sentence: 'People on Nusa Timur made charcoal from ___. They did not cut mangrove trees anymore.',
    options: ['coconut shells', 'plastic bottles', 'dry leaves', 'fish bones'],
    answer: 'coconut shells'
  },
  {
    sentence: 'The ___ trees have big roots. Grandpa Bahri said they protect the beach.',
    options: ['mangrove', 'coconut', 'mango', 'banana'],
    answer: 'mangrove'
  },
  {
    sentence: 'Sea water went into the wells. The water became ___, so people could not drink it.',
    options: ['brackish', 'boiling', 'frozen', 'clean'],
    answer: 'brackish'
  },
  {
    sentence: 'People on Nusa Timur cut mangrove trees to make ___. They sold it in the city.',
    options: ['charcoal', 'seedlings', 'fish ponds', 'pond walls'],
    answer: 'charcoal'
  }
];

var TOTAL_STEPS = WORDS.length + POINTS.length + QUIZ.length; /* 20 */
var LEGACY_MAX_SCORE = TOTAL_STEPS * 10; /* 200, seperti versi lama */

/* ---------------- State ----------------
   `*Log` menyimpan APA yang sudah terjadi di setiap langkah (urutan
   pilihan, tebakan salah, sudah selesai atau belum, teks umpan
   balik). Berkat itu, layar yang ditinjau ulang bisa digambar
   persis seperti saat ditinggalkan — tanpa menghitung ulang skor. */
var State = {
  page: 'welcome-1',
  lives: TOTAL_LIVES,
  reviewing: false,   /* true = sedang melihat langkah yang sudah lewat */
  frontier: null,     /* lokasi terjauh yang pernah dicapai siswa */
  stepsDone: 0,       /* jumlah langkah selesai — dipakai bilah progres */

  wordOrder: [],
  wordIndex: 0,
  wordScore: 0,
  wordLog: [],
  wordReview: [],

  pointIndex: 0,
  pointScore: 0,
  pointLog: [],
  pointReview: [],

  quizIndex: 0,
  quizScore: 0,
  quizLog: [],
  quizReview: []
};

var PRE_STAGES = ['welcome-1', 'welcome-2', 'wait-1', 'video', 'wait-2'];
var ACTIVITY_STAGES = ['words', 'word-meaning', 'points', 'quiz'];
var RESULT_STAGES = ['result', 'result-review', 'result-words'];
var STAGES = PRE_STAGES.concat(ACTIVITY_STAGES, RESULT_STAGES);

/* Revisi R5: label dipendekkan supaya muat di lencana .nav-info tanpa
   terpotong ellipsis. "What it points to" adalah label terpanjang di
   seluruh proyek dan penyumbang terbesar luberan navigator di modul ini.
   Targetnya: label + awalan "Stage: " muat dalam 46vw pada layar 360px,
   yaitu sekitar 22 karakter pada ukuran 11px. */
var STAGE_LABELS = {
  'welcome-1': 'Welcome', 'welcome-2': 'Welcome', 'wait-1': 'Waiting',
  video: 'Materials', 'wait-2': 'Waiting',
  words: 'Word meanings', 'word-meaning': 'Word meanings',
  points: 'Clue words', quiz: 'Quiz',
  result: 'Results', 'result-review': 'Results', 'result-words': 'Results'
};

var WAIT_TEXT = {
  'wait-1': {
    eyebrow: 'Wait for your teacher',
    caption: 'Please look at your teacher and wait for further instructions.'
  },
  'wait-2': {
    eyebrow: 'Video finished',
    caption: 'Great job watching. Please wait for your teacher before the first activity.'
  },
  lives: {
    eyebrow: 'Out of lives',
    caption: 'All seven lives are used up. Nothing is lost — your steps are safe. Ask your teacher to give the lives back, and you will come straight back to this question.'
  }
};

var KEYS = ['A', 'B', 'C', 'D'];

function $(id) { return document.getElementById(id); }

function readKey(key) {
  try {
    var raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function writeKey(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* diamkan */ }
}
function readAttempt() {
  try { return parseInt(sessionStorage.getItem(KEY_ATTEMPT) || '1', 10); } catch (e) { return 1; }
}
function bumpAttempt() {
  try { sessionStorage.setItem(KEY_ATTEMPT, String(readAttempt() + 1)); } catch (e) { /* tidak kritis */ }
}

function setPage(page) {
  State.page = page;
  Nav.update();
}

function showPage(id) {
  Array.prototype.forEach.call(document.querySelectorAll('.page'), function (el) { el.hidden = el.id !== id; });
  window.scrollTo({ top: 0 });
}

function toast(message) {
  var el = $('toast');
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(function () { el.classList.remove('is-visible'); }, 2600);
}

/* ---------------- Hint (Revisi R3) ----------------
   Notifikasi instruksi satu baris di pojok kanan atas. Menutup sendiri
   setelah HINT_MS, atau langsung saat ditekan. Sengaja TIDAK memblokir
   apa pun: pointer-events hanya aktif di pilnya, jadi "tap layar untuk
   lanjut" di welcome tetap bisa dilakukan di area lain tanpa lebih dulu
   menutup hint ini.

   Berbeda dari coach mark: coach mark adalah tur bertahap dengan sorotan
   dan tombol, dan setiap langkahnya WAJIB punya target yang terlihat.
   Hint hanya satu kalimat yang lewat, dan justru dipakai di layar yang
   tidak punya elemen bermakna untuk disorot. */
var HINT_MS = 3000;

function hint(message, onDark) {
  var host = $('hintHost');
  if (!host || !message) return;

  /* Satu hint pada satu waktu: pesan lama diusir dulu supaya tidak
     menumpuk saat siswa berpindah layar dengan cepat — yang di modul ini
     mudah terjadi lewat gestur tepi dan tombol back fisik. */
  Array.prototype.forEach.call(host.children, function (old) { dismiss(old); });

  var el = document.createElement('button');
  el.type = 'button';
  el.className = 'hint' + (onDark ? ' is-on-dark' : '');
  el.appendChild(document.createTextNode(message));
  host.appendChild(el);

  requestAnimationFrame(function () {
    requestAnimationFrame(function () { el.classList.add('is-in'); });
  });

  var timer = setTimeout(function () { dismiss(el); }, HINT_MS);
  el.addEventListener('click', function () { clearTimeout(timer); dismiss(el); });

  function dismiss(node) {
    if (!node || node.dataset.going === '1') return;
    node.dataset.going = '1';
    node.classList.remove('is-in');
    node.classList.add('is-out');
    setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 260);
  }
}

/* Peta instruksi per tahap. Untuk 'video', teksnya DIPINDAHKAN dari
   COACH.video yang dicabut di Revisi R1. Untuk empat tahap lainnya,
   teks ini baru — modul ini memang tidak pernah punya entri COACH untuk
   welcome dan layar tunggu (Coach.canOpen() memblokirnya). Kalimatnya
   disamakan dengan enam platform lain supaya siswa mengenali pola yang
   sama di seluruh perjalanan.

   Kunci di sini SENGAJA sama persis dengan nama tahap di PRE_STAGES,
   supaya kaitnya di Flow.render() cukup satu baris. */
var HINTS = {
  'welcome-1': 'Tap anywhere to continue',
  'welcome-2': 'Tap to see your path',
  'wait-1':    'Wait for your teacher',
  'video':     'Press play when you are ready',
  'wait-2':    'Wait for your teacher'
};
var HINTS_ON_DARK = { 'wait-1': true, 'wait-2': true };

/* Benar-benar terlihat di layar? Dipakai coach mark supaya tidak
   pernah menyorot elemen yang sedang `hidden` atau berukuran nol. */
function isVisible(el) {
  if (!el) return false;
  var node = el;
  while (node && node.nodeType === 1) {
    if (node.hidden) return false;
    node = node.parentNode;
  }
  var rect = el.getBoundingClientRect();
  if (rect.width <= 1 && rect.height <= 1) return false;
  var cs = window.getComputedStyle(el);
  return cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0';
}

function setInert(el, on) {
  if (!el) return;
  try { el.inert = !!on; } catch (e) { /* peramban lama: cukup andalkan jebakan fokus */ }
}

function focusSoftly(el) {
  if (!el || !el.focus) return;
  try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
}

function renderDots(box, total, current) {
  box.innerHTML = '';
  for (var i = 0; i < total; i++) {
    var d = document.createElement('span');
    d.className = 'dot' + (i < current ? ' is-done' : i === current ? ' is-now' : '');
    box.appendChild(d);
  }
}

/* Satu bentuk tombol pilihan untuk ketiga aktivitas. */
function buildOptions(box, values, onPick) {
  box.innerHTML = '';
  values.forEach(function (text, i) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option';
    btn.setAttribute('data-value', text);
    var key = document.createElement('span');
    key.className = 'option-key';
    key.textContent = KEYS[i] || '·';
    var label = document.createElement('span');
    label.textContent = text;
    btn.appendChild(key);
    btn.appendChild(label);
    btn.addEventListener('click', function () { onPick(text, btn); });
    box.appendChild(btn);
  });
}

/* Mencari tombol lewat perbandingan nilai, bukan selector: teks
   jawaban mengandung tanda kutip keriting dan apostrof, dan itu
   bikin querySelector rapuh. */
function optionByValue(box, value) {
  var list = box.querySelectorAll('.option');
  for (var i = 0; i < list.length; i++) {
    if (list[i].getAttribute('data-value') === value) return list[i];
  }
  return null;
}

function lockOptions(box) {
  Array.prototype.forEach.call(box.querySelectorAll('.option'), function (b) { b.disabled = true; });
}

function markCorrect(box, answer) {
  var btn = optionByValue(box, answer);
  if (btn) btn.classList.add('is-correct');
}

/* Menggambar ulang keadaan sebuah langkah dari catatannya. Ini
   inti mode tinjau: tampilannya sama, tetapi tidak ada satu pun
   angka yang disentuh lagi. */
function applyLog(box, log, answer) {
  log.wrong.forEach(function (value) {
    var btn = optionByValue(box, value);
    if (btn) { btn.classList.add('is-wrong'); btn.disabled = true; }
  });
  if (log.done) { markCorrect(box, answer); lockOptions(box); }
}

function showFeedback(el, feedback) {
  if (!feedback) { el.hidden = true; el.className = 'feedback'; el.textContent = ''; return; }
  el.hidden = false;
  el.className = 'feedback ' + feedback.cls;
  el.textContent = feedback.text;
}

/* Tombol maju yang seragam untuk semua aktivitas. Di mode tinjau ia
   selalu jadi jalan pulang ke posisi terjauh siswa. */
function setNextBtn(btn, reviewing, label, done) {
  if (reviewing) {
    btn.hidden = false;
    btn.textContent = 'Back to where I was';
    return;
  }
  btn.hidden = !done;
  if (done) btn.textContent = label;
}

function shuffled(list) {
  var out = list.slice();
  for (var i = out.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = out[i]; out[i] = out[j]; out[j] = t;
  }
  return out;
}

/* ---------------- Riwayat internal ----------------
   Aplikasi ini satu halaman dan DULU memanggil window.history.back()
   tanpa pernah mendorong satu entri pun — itulah sebabnya tombol
   Back terasa mati atau malah melempar siswa keluar. Sekarang
   perpindahan layar disimpan di tumpukan sendiri, dan setiap
   dorongan dicerminkan ke history.pushState() supaya tombol back
   fisik Android dan gestur sistem mundur satu langkah DI DALAM
   pelajaran.

   `ordinal()` memberi setiap lokasi satu nomor urut. Nomor itulah
   yang menentukan apakah sebuah layar berada di belakang titik
   terjauh siswa — dan karena itu harus tampil sebagai mode tinjau. */
var Flow = {
  stack: [],

  make: function (page, index) { return { page: page, index: index || 0 }; },

  current: function () { return this.stack[this.stack.length - 1] || null; },

  ordinal: function (loc) {
    if (!loc) return -1;
    var i = PRE_STAGES.indexOf(loc.page);
    if (i >= 0) return i;
    var base = PRE_STAGES.length;
    if (loc.page === 'words') return base + loc.index * 2;
    if (loc.page === 'word-meaning') return base + loc.index * 2 + 1;
    base += WORDS.length * 2;
    if (loc.page === 'points') return base + loc.index;
    base += POINTS.length;
    if (loc.page === 'quiz') return base + loc.index;
    base += QUIZ.length;
    var r = RESULT_STAGES.indexOf(loc.page);
    if (r >= 0) return base + r;
    return -1;
  },

  isBehind: function (loc) { return this.ordinal(loc) < this.ordinal(State.frontier); },

  pushHistory: function () {
    try { window.history.pushState({ nl: this.stack.length }, ''); } catch (e) { /* diamkan */ }
  },

  start: function (page) {
    this.stack = [this.make(page, 0)];
    State.frontier = this.current();
    /* Satu entri penanda + satu entri kerja: dengan begitu selalu ada
       entri milik kita yang bisa dimundurkan, jadi back fisik tidak
       pernah langsung menutup pelajaran. */
    try {
      window.history.replaceState({ nl: 0 }, '');
      window.history.pushState({ nl: 1 }, '');
    } catch (e) { /* diamkan */ }
    this.render(this.current());
  },

  go: function (page, index) {
    var loc = this.make(page, index);
    this.stack.push(loc);
    if (this.ordinal(loc) > this.ordinal(State.frontier)) State.frontier = loc;
    this.pushHistory();
    this.render(loc);
  },

  /* Perpindahan maju yang aman: kalau siswa sebenarnya sudah pernah
     lebih jauh (mis. kembali lewat layar tunggu), lompat ke posisi
     terjauh, jangan mengulang aktivitas dari awal. */
  forward: function (page, index) {
    if (this.ordinal(State.frontier) > this.ordinal(this.make(page, index))) { this.toFrontier(); return; }
    this.go(page, index);
  },

  toFrontier: function () {
    if (!State.frontier) return;
    this.go(State.frontier.page, State.frontier.index);
  },

  /* Halaman hasil memulai tumpukan baru: mundur dari hasil tidak
     boleh mengembalikan siswa ke kuis yang sudah dinilai. */
  reset: function (page) {
    this.stack = [this.make(page, 0)];
    State.frontier = this.current();
    this.pushHistory();
    this.render(this.current());
  },

  /* Mengembalikan true kalau layar benar-benar BERPINDAH. False
     berarti tidak ada navigasi yang terjadi — pemanggil wajib
     mendorong ulang entri riwayat supaya halaman tidak ikut
     tertutup dan kedalaman riwayat tetap sejajar dengan tumpukan
     ini. Menutup dialog termasuk "tidak berpindah": permintaan
     mundurnya terpakai, tapi layarnya tetap sama. */
  backInternal: function () {
    if (Modals.closeTop()) return false;

    if (Gate.mode === 'lives') {
      toast('Your teacher opens this screen. Ask them for new lives.');
      return false;
    }
    var cur = this.current();
    if (cur && (cur.page === 'wait-1' || cur.page === 'wait-2')) {
      toast('This screen belongs to your teacher. Please wait.');
      return false;
    }
    if (this.stack.length <= 1) {
      Confirm.leaveLesson();
      return false;
    }
    this.stack.pop();
    this.render(this.current());
    return true;
  },

  render: function (loc) {
    if (!loc) return;
    Coach.cancelAuto();
    Coach.close();

    Gate.mode = (loc.page === 'wait-1' || loc.page === 'wait-2') ? loc.page : null;

    /* Halaman hasil tidak pernah masuk mode tinjau: tidak ada yang
       bisa dijawab di sana, jadi labelnya tetap apa adanya. */
    var reviewing = this.isBehind(loc) && RESULT_STAGES.indexOf(loc.page) < 0;
    State.reviewing = reviewing;

    var onWelcome = loc.page === 'welcome-1' || loc.page === 'welcome-2';
    $('welcome1').hidden = loc.page !== 'welcome-1';
    $('welcome2').hidden = loc.page !== 'welcome-2';
    $('appShell').hidden = onWelcome;

    setPage(loc.page);

    switch (loc.page) {
      case 'welcome-1': Welcome.render(1); break;
      case 'welcome-2': Welcome.render(2); break;
      case 'wait-1':
      case 'wait-2': Gate.renderWait(loc.page, reviewing); break;
      case 'video': Video.render(reviewing); break;
      case 'words': Words.render(loc.index, reviewing); break;
      case 'word-meaning': WordMeaning.render(loc.index, reviewing); break;
      case 'points': Points.render(loc.index, reviewing); break;
      case 'quiz': Quiz.render(loc.index, reviewing); break;
      case 'result': showPage('resultPage'); break;
      case 'result-review': showPage('resultReviewPage'); break;
      case 'result-words': showPage('resultWordsPage'); break;
    }

    Coach.maybeAuto(loc.page);
    if (HINTS[loc.page]) hint(HINTS[loc.page], HINTS_ON_DARK[loc.page]);   /* Revisi R3 */
  }
};

/* Satu pintu untuk semua permintaan mundur: tombol #navBack, gestur
   tepi layar, dan tombol back fisik lewat popstate. */
function goBack() {
  if (Modals.closeTop()) return;
  var state = null;
  try { state = window.history.state; } catch (e) { /* diamkan */ }
  if (state && state.nl > 0) { window.history.back(); return; } /* popstate yang mengerjakan */
  Flow.backInternal();
}

function initHistory() {
  window.addEventListener('popstate', function () {
    if (!Flow.backInternal()) Flow.pushHistory();
  });
}

/* ---------------- Navigator ---------------- */
var Nav = {
  infoIndex: 0,
  timer: null,

  init: function () {
    $('navStudent').textContent = this.studentName();
    this.renderLives();
    this.update();
    this.rotate();

    $('navHome').addEventListener('click', function () { Confirm.leaveLesson(); });
    $('navBack').addEventListener('click', function () { goBack(); });
    $('navAsk').addEventListener('click', function () { Ask.open(); });
    $('navCoach').addEventListener('click', function () {
      /* Tombol dua fungsi: buka kalau tertutup, tutup kalau terbuka. */
      if (Coach.isOpen()) { Coach.close(); return; }
      Coach.open(State.page, false);
    });
  },

  studentName: function () {
    var data = readKey(KEY_STUDENT);
    if (data && typeof data === 'object') {
      var keys = ['name', 'nama', 'studentName'];
      for (var i = 0; i < keys.length; i++) {
        if (typeof data[keys[i]] === 'string' && data[keys[i]].trim()) return data[keys[i]].trim();
      }
    }
    if (typeof data === 'string' && data.trim()) return data.trim();
    return 'Student';
  },

  heartSvg: function (broken) {
    if (broken) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
        '<path d="M12 20S4.5 14.3 4.5 9.3C4.5 6.7 6.5 4.9 9 4.9c1.6 0 3 1 3 2.7 0-1.7 1.4-2.7 3-2.7 2.5 0 4.5 1.8 4.5 4.4C19.5 14.3 12 20 12 20Z"/>' +
        '<path d="M15 8l-4 4 3 2-2 4" stroke-linecap="round"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M12 20S4.5 14.3 4.5 9.3C4.5 6.7 6.5 4.9 9 4.9c1.6 0 3 1 3 2.7 0-1.7 1.4-2.7 3-2.7 2.5 0 4.5 1.8 4.5 4.4C19.5 14.3 12 20 12 20Z"/></svg>';
  },

  renderLives: function () {
    var box = $('navHearts');
    var html = '';
    for (var i = 0; i < TOTAL_LIVES; i++) {
      var broken = i >= State.lives;
      html += '<span class="nav-heart ' + (broken ? 'is-broken' : 'is-full') + '">' + this.heartSvg(broken) + '</span>';
    }
    box.innerHTML = html;
    box.setAttribute('aria-label', 'Lives remaining: ' + State.lives + ' of ' + TOTAL_LIVES);
  },

  /* Bilah progres berbasis LANGKAH NYATA. Dulu (idx + 1) / STAGES.length,
     jadi ia melompat dalam potongan besar dan diam selama delapan kata.
     Sekarang: sebelum aktivitas 0–12%, di dalam tiga aktivitas
     12% + langkah selesai/20, halaman hasil 100%. */
  update: function () {
    var pct;
    if (ACTIVITY_STAGES.indexOf(State.page) >= 0) {
      pct = 12 + (State.stepsDone / TOTAL_STEPS) * 83;
    } else if (RESULT_STAGES.indexOf(State.page) >= 0) {
      pct = 100;
    } else {
      var i = PRE_STAGES.indexOf(State.page);
      pct = ((i < 0 ? 0 : i + 1) / PRE_STAGES.length) * 12;
    }
    $('navProgressFill').style.width = pct + '%';
  },

  infoTexts: function () {
    return [
      'Stage: ' + (STAGE_LABELS[State.page] || 'Welcome'),
      'Steps: ' + Score.display() + ' of ' + TOTAL_STEPS,
      'Lives: ' + State.lives + '/' + TOTAL_LIVES
    ];
  },

  rotate: function () {
    var el = $('navInfo');
    var self = this;
    el.textContent = this.infoTexts()[0];
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(function () {
      el.classList.add('is-fading');
      setTimeout(function () {
        var texts = self.infoTexts();
        self.infoIndex = (self.infoIndex + 1) % texts.length;
        el.textContent = texts[self.infoIndex];
        el.classList.remove('is-fading');
      }, 300);
    }, 3200);
  },

  /* Dulu setInterval ini tidak pernah dibersihkan — termasuk saat
     halaman hasil sudah tampil dan tidak ada lagi yang berubah. */
  stopRotate: function () {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    var el = $('navInfo');
    el.classList.remove('is-fading');
    el.textContent = 'Lesson complete';
  },

  loseLife: function () {
    if (State.lives > 0) State.lives--;
    this.renderLives();
    if (State.lives === 0) Gate.outOfLives();
  },

  restoreLives: function () {
    State.lives = TOTAL_LIVES;
    bumpAttempt();
    this.renderLives();
    /* Hanya layar "nyawa habis" yang dilepas di sini; layar tunggu guru
       punya jalannya sendiri lewat Gate.release(). */
    if (Gate.mode === 'lives') Gate.resume();
  }
};

/* ---------------- Skor: 20 langkah, yang dibocorkan dihitung setengah ---------------- */
var Score = {
  total: function () { return State.wordScore + State.pointScore + State.quizScore; },
  revealedCount: function () {
    var n = 0;
    State.wordReview.forEach(function (r) { if (r.revealed) n++; });
    State.pointReview.forEach(function (r) { if (r.revealed) n++; });
    State.quizReview.forEach(function (r) { if (r.revealed) n++; });
    return n;
  },
  display: function () {
    var v = this.total();
    return (v % 1 === 0) ? String(v) : v.toFixed(1);
  },
  stars: function () {
    var pct = (this.total() / TOTAL_STEPS) * 100;
    if (pct >= 85) return 3;
    if (pct >= 70) return 2;
    if (pct >= 60) return 1;
    return 0;
  },
  save: function () {
    writeKey(KEY_SELF, {
      v: 1,
      status: 'completed',
      /* score/maxScore/stars dipertahankan bentuknya (10 poin per langkah,
         maks 200 seperti versi lama) supaya modul lain tidak rusak.
         Bintang tetap disimpan walau tidak ditampilkan ke siswa. */
      score: Math.round(this.total() * 10),
      maxScore: LEGACY_MAX_SCORE,
      stars: this.stars(),
      correct: this.total(),
      total: TOTAL_STEPS,
      revealed: this.revealedCount(),
      livesUsed: TOTAL_LIVES - State.lives,
      attempts: readAttempt(),
      completedAt: new Date().toISOString()
    });
  }
};

/* ---------------- Gerbang guru ----------------
   #waitPage adalah `.page` biasa yang ditampilkan lewat showPage(),
   sama seperti video/words/points/quiz/result, jadi halaman di
   baliknya benar-benar display:none.
   `interrupted` menyimpan lokasi yang terpotong saat nyawa habis
   supaya siswa kembali PERSIS ke soal yang sedang dikerjakannya —
   termasuk halaman arti yang baru. */
var Gate = {
  mode: null,
  interrupted: null,

  init: function () {
    $('waitResumeBtn').addEventListener('click', function () { Flow.toFrontier(); });
  },

  renderWait: function (mode, reviewing) {
    var text = WAIT_TEXT[mode];
    $('waitEyebrow').textContent = text.eyebrow;
    $('waitCaption').textContent = text.caption;
    $('waitResumeBtn').hidden = !reviewing;
    showPage('waitPage');
  },

  isShown: function () { return !$('waitPage').hidden; },

  waitBeforeVideo: function () { Flow.forward('wait-1'); },
  waitAfterVideo: function () { Flow.forward('wait-2'); },

  outOfLives: function () {
    this.interrupted = Flow.current();
    Fade.swap(function () {
      Gate.mode = 'lives';
      var text = WAIT_TEXT.lives;
      $('waitEyebrow').textContent = text.eyebrow;
      $('waitCaption').textContent = text.caption;
      $('waitResumeBtn').hidden = true;
      /* SENGAJA tanpa setPage(): progress bar tetap menunjuk tahap yang
         sedang dikerjakan siswa, tidak melompat karena kehabisan nyawa. */
      showPage('waitPage');
      toast('Your steps are safe. Ask your teacher for new lives.');
    });
  },

  /* Kembali ke aktivitas yang terinterupsi (kasus nyawa habis). */
  resume: function () {
    var loc = this.interrupted || Flow.current();
    this.interrupted = null;
    Fade.swap(function () {
      Gate.mode = null;
      Flow.render(loc);
    });
  },
  /* Nama lama dipertahankan supaya pemanggil di luar berkas ini
     (alat guru) tidak patah. */
  hide: function () { this.resume(); },

  release: function () {
    if (this.mode === 'wait-1') {
      Blackout.cut(function () {
        Gate.mode = null;
        Flow.forward('video');
      });
      return;
    }
    if (this.mode === 'wait-2') {
      this.mode = null;
      Words.start();
      Flow.forward('words', 0);
      return;
    }
    if (this.mode === 'lives') { Nav.restoreLives(); return; }
    toast('Nothing to unlock on this screen.');
  }
};

var TeacherAPI = {
  release: function () { Gate.release(); },
  restoreLives: function () { Nav.restoreLives(); }
};

var Blackout = {
  cut: function (mid) {
    var el = $('blackout');
    el.hidden = false;
    setTimeout(function () {
      mid();
      setTimeout(function () { el.hidden = true; }, 260);
    }, 240);
  }
};

/* Pergantian layar yang halus untuk kejadian yang bukan navigasi
   biasa (nyawa habis, lalu pulih). */
var Fade = {
  swap: function (mid) {
    var el = $('transitionOverlay');
    el.classList.add('is-quick');
    el.classList.add('is-active');
    setTimeout(function () {
      mid();
      setTimeout(function () {
        el.classList.remove('is-active');
        setTimeout(function () { el.classList.remove('is-quick'); }, 320);
      }, 60);
    }, 300);
  }
};

/* ---------------- Materi: video ---------------- */
var Video = {
  failed: false,
  timer: null,

  init: function () {
    var el = $('videoEl');
    el.addEventListener('error', function () { Video.fail(); });
    var source = el.querySelector('source');
    if (source) source.addEventListener('error', function () { Video.fail(); });
    el.addEventListener('ended', function () { Gate.waitAfterVideo(); });

    $('videoNextBtn').addEventListener('click', function () {
      if (State.reviewing) { Flow.toFrontier(); return; }
      Gate.waitAfterVideo();
    });
  },

  /* Dulu berkas video yang hilang = jalan buntu: `ended` tidak pernah
     menyala, jadi Gate.waitAfterVideo() tidak pernah terpanggil dan
     siswa terjebak. Sekarang ada pesan sopan + jalan keluar yang
     TETAP lewat gerbang guru. */
  fail: function () {
    if (this.failed) return;
    this.failed = true;
    clearTimeout(this.timer);
    $('videoPlate').classList.add('is-empty');
    if (State.page === 'video') this.render(State.reviewing);
  },

  render: function (reviewing) {
    showPage('videoPage');
    $('videoFallback').hidden = !this.failed;

    var btn = $('videoNextBtn');
    if (reviewing) {
      btn.hidden = false;
      btn.textContent = 'Back to where I was';
    } else if (this.failed) {
      btn.hidden = false;
      btn.textContent = 'I have finished the video';
      /* Revisi R3: saat video gagal dimuat, hint mengarahkan ke tombol
         keluar — #videoFallback sudah menjelaskannya, tapi paragraf itu
         berada jauh di bawah plat video dan mudah terlewat di layar kecil. */
      hint('Tap the button below to continue');
    } else {
      btn.hidden = true;
    }

    clearTimeout(this.timer);
    if (!this.failed && !reviewing) {
      /* Jaring pengaman kalau berkasnya ada tapi tidak pernah siap. */
      this.timer = setTimeout(function () {
        if ($('videoEl').readyState === 0) Video.fail();
      }, 6000);
    }
  }
};

/* ---------------- Latihan bunyi (halaman arti) ---------------- */
var Pron = {
  speed: 'normal',
  audio: null,
  src: '',

  init: function () {
    var self = this;
    $('pronSlow').addEventListener('click', function () { self.setSpeed('slow'); });
    $('pronNormal').addEventListener('click', function () { self.setSpeed('normal'); });
    $('pronPlay').addEventListener('click', function () { self.play(); });
  },

  setSpeed: function (speed) {
    this.speed = speed;
    $('pronSlow').classList.toggle('is-on', speed === 'slow');
    $('pronNormal').classList.toggle('is-on', speed === 'normal');
    if (this.audio) this.audio.playbackRate = speed === 'slow' ? 0.6 : 1;
  },

  load: function (word, src) {
    this.src = src;
    if (this.audio) { this.audio.pause(); this.audio = null; }
    $('pronWord').textContent = word;
    var note = $('pronNote');
    note.classList.remove('is-bad');
    /* Nama berkas hanya berguna bagi pengembang; anak kelas dasar
       tidak perlu melihat "audio/mangrove.mp3". */
    note.textContent = DEV_MODE ? src : '';
  },

  missing: function () {
    var note = $('pronNote');
    note.classList.add('is-bad');
    note.textContent = DEV_MODE ? (Pron.src + ' — not added yet') : 'Sound coming soon.';
  },

  play: function () {
    if (this.audio) { this.audio.pause(); this.audio = null; }
    var a = new Audio(this.src);
    a.playbackRate = this.speed === 'slow' ? 0.6 : 1;
    this.audio = a;
    a.addEventListener('error', function () { Pron.missing(); });
    var p = a.play();
    if (p && p.catch) p.catch(function () { Pron.missing(); });
  }
};

/* ---------------- Activity 1a: menebak arti ---------------- */
var Words = {
  init: function () {
    $('wordNextBtn').addEventListener('click', function () {
      if (State.reviewing) { Flow.toFrontier(); return; }
      Flow.forward('word-meaning', State.wordIndex);
    });
    var img = $('wordImage');
    img.addEventListener('error', function () { $('wordPlate').classList.add('is-empty'); });
    img.addEventListener('load', function () { $('wordPlate').classList.remove('is-empty'); });
  },

  /* Urutan kata diacak SEKALI saja; kunjungan ulang tidak mengocok
     lagi, supaya mode tinjau menampilkan kata yang sama. */
  start: function () {
    if (State.wordOrder.length) return;
    State.wordOrder = shuffled(WORDS.map(function (_, i) { return i; }));
    State.wordScore = 0;
    State.wordLog = [];
    State.wordReview = [];
  },

  at: function (i) { return WORDS[State.wordOrder[i]]; },
  current: function () { return this.at(State.wordIndex); },

  logFor: function (i) {
    if (!State.wordLog[i]) {
      State.wordLog[i] = { opts: shuffled(this.at(i).options), wrong: [], revealed: false, done: false, feedback: null };
    }
    return State.wordLog[i];
  },

  render: function (i, reviewing) {
    State.wordIndex = i;
    showPage('wordPage');

    var w = this.at(i);
    var log = this.logFor(i);
    var box = $('wordOptions');

    $('wordLabel').textContent = 'Word ' + (i + 1) + ' of ' + WORDS.length;
    renderDots($('wordDots'), WORDS.length, i);
    $('wordTitle').textContent = w.word;
    $('wordContext').textContent = w.context;

    var src = 'gambar/' + w.slug + '.jpg';
    $('wordPlateNote').textContent = DEV_MODE ? 'Word image — ' + src : 'Picture coming soon';
    $('wordPlate').classList.add('is-empty');
    $('wordImage').alt = w.word;
    $('wordImage').src = src;

    buildOptions(box, log.opts, function (value, btn) { Words.answer(value, btn); });
    applyLog(box, log, w.answer);
    if (reviewing) lockOptions(box);
    showFeedback($('wordFeedback'), log.feedback);
    setNextBtn($('wordNextBtn'), reviewing, 'See the meaning', log.done);
  },

  answer: function (value, btn) {
    /* Tiga kunci supaya mundur tidak pernah jadi celah skor. */
    if (State.reviewing || Gate.mode) return;
    var log = State.wordLog[State.wordIndex];
    if (!log || log.done) return;

    var w = this.current();
    var box = $('wordOptions');

    if (value === w.answer) {
      log.done = true;
      btn.classList.add('is-correct');
      lockOptions(box);
      State.wordScore += log.wrong.length === 0 ? 1 : 0.5;
      if (log.wrong.length > 0) State.wordReview.push({ word: w.word, revealed: false });
      log.feedback = {
        cls: 'is-good',
        text: (log.wrong.length === 0 ? 'Correct. ' : 'Right this time — this step counts as half. ') +
          '“' + w.word + '” means: ' + w.definition
      };
      this.finish(log);
      return;
    }

    log.wrong.push(value);
    btn.classList.add('is-wrong');
    btn.disabled = true;
    Nav.loseLife();

    if (log.wrong.length >= REVEAL_AFTER_WRONG) {
      log.done = true;
      log.revealed = true;
      markCorrect(box, w.answer);
      lockOptions(box);
      State.wordScore += 0.5;
      State.wordReview.push({ word: w.word, revealed: true });
      log.feedback = { cls: 'is-bad', text: 'Two misses — the meaning is marked in green. This step counts as half.' };
      toast('Answer revealed · half a step');
      this.finish(log);
      return;
    }

    log.feedback = { cls: 'is-bad', text: 'Not that one. Read the sentence from the story again, and look at the picture.' };
    showFeedback($('wordFeedback'), log.feedback);
  },

  finish: function (log) {
    State.stepsDone++;
    showFeedback($('wordFeedback'), log.feedback);
    setNextBtn($('wordNextBtn'), false, 'See the meaning', true);
    Nav.update();
  }
};

/* ---------------- Activity 1b: halaman arti + bunyi ----------------
   Halaman penuh tersendiri. Dulu blok `hidden` di bawah pilihan
   jawaban, jadi siswa harus menggulir melewati tombol-tombol mati
   untuk sampai ke materi dan latihan bunyinya. */
var WordMeaning = {
  init: function () {
    $('meaningNextBtn').addEventListener('click', function () {
      if (State.reviewing) { Flow.toFrontier(); return; }
      var i = State.wordIndex;
      if (i < WORDS.length - 1) Flow.forward('words', i + 1);
      else Flow.forward('points', 0);
    });
  },

  render: function (i, reviewing) {
    State.wordIndex = i;
    showPage('wordMeaningPage');

    var w = Words.at(i);
    $('meaningLabel').textContent = 'Word ' + (i + 1) + ' of ' + WORDS.length;
    renderDots($('meaningDots'), WORDS.length, i);
    $('meaningTitle').textContent = w.word;
    $('meaningDef').textContent = w.definition;
    $('meaningGloss').textContent = w.gloss;
    Pron.load(w.word, 'audio/' + w.slug + '.mp3');

    var btn = $('meaningNextBtn');
    btn.hidden = false;
    btn.textContent = reviewing ? 'Back to where I was'
      : (i < WORDS.length - 1 ? 'Next word' : 'Continue to Activity 2');
  }
};

/* ---------------- Activity 2: What does it point to? ---------------- */
var Points = {
  init: function () {
    $('pointNextBtn').addEventListener('click', function () {
      if (State.reviewing) { Flow.toFrontier(); return; }
      var i = State.pointIndex;
      if (i < POINTS.length - 1) Flow.forward('points', i + 1);
      else Flow.forward('quiz', 0);
    });
  },

  logFor: function (i) {
    if (!State.pointLog[i]) {
      State.pointLog[i] = { opts: POINTS[i].options.slice(), wrong: [], revealed: false, done: false, feedback: null };
    }
    return State.pointLog[i];
  },

  render: function (i, reviewing) {
    State.pointIndex = i;
    showPage('pointPage');

    var q = POINTS[i];
    var log = this.logFor(i);
    var box = $('pointOptions');

    $('pointLabel').textContent = 'Sentence ' + (i + 1) + ' of ' + POINTS.length;
    renderDots($('pointDots'), POINTS.length, i);
    $('pointQuestion').textContent = q.question;
    $('pointQuote').innerHTML = q.quote;

    buildOptions(box, log.opts, function (value, btn) { Points.answer(value, btn); });
    applyLog(box, log, q.answer);
    if (reviewing) lockOptions(box);
    showFeedback($('pointFeedback'), log.feedback);
    setNextBtn($('pointNextBtn'), reviewing,
      i < POINTS.length - 1 ? 'Next sentence' : 'Continue to the quiz', log.done);
  },

  answer: function (value, btn) {
    if (State.reviewing || Gate.mode) return;
    var i = State.pointIndex;
    var log = State.pointLog[i];
    if (!log || log.done) return;

    var q = POINTS[i];
    var box = $('pointOptions');

    if (value === q.answer) {
      log.done = true;
      btn.classList.add('is-correct');
      lockOptions(box);
      State.pointScore += log.wrong.length === 0 ? 1 : 0.5;
      if (log.wrong.length > 0) State.pointReview.push({ index: i, revealed: false });
      log.feedback = {
        cls: 'is-good',
        text: (log.wrong.length === 0 ? 'Correct. ' : 'Right this time — this step counts as half. ') +
          'The bold word points to “' + q.answer + '”.'
      };
      this.finish(log);
      return;
    }

    log.wrong.push(value);
    btn.classList.add('is-wrong');
    btn.disabled = true;
    Nav.loseLife();

    if (log.wrong.length >= REVEAL_AFTER_WRONG) {
      log.done = true;
      log.revealed = true;
      markCorrect(box, q.answer);
      lockOptions(box);
      State.pointScore += 0.5;
      State.pointReview.push({ index: i, revealed: true });
      log.feedback = { cls: 'is-bad', text: 'Two misses — the answer is marked in green. This step counts as half.' };
      toast('Answer revealed · half a step');
      this.finish(log);
      return;
    }

    log.feedback = { cls: 'is-bad', text: 'Not that one. Read the sentence again and ask: who or what is doing this?' };
    showFeedback($('pointFeedback'), log.feedback);
  },

  finish: function (log) {
    State.stepsDone++;
    showFeedback($('pointFeedback'), log.feedback);
    setNextBtn($('pointNextBtn'), false,
      State.pointIndex < POINTS.length - 1 ? 'Next sentence' : 'Continue to the quiz', true);
    Nav.update();
  }
};

/* ---------------- Activity 3: kuis ---------------- */
var Quiz = {
  init: function () {
    $('quizNextBtn').addEventListener('click', function () {
      if (State.reviewing) { Flow.toFrontier(); return; }
      var i = State.quizIndex;
      if (i < QUIZ.length - 1) Flow.forward('quiz', i + 1);
      else Result.enter();
    });
  },

  logFor: function (i) {
    if (!State.quizLog[i]) {
      State.quizLog[i] = { opts: QUIZ[i].options.slice(), wrong: [], revealed: false, done: false, feedback: null };
    }
    return State.quizLog[i];
  },

  /* Kalimat rumpang: "___" jadi garis emas yang nanti diisi jawabannya. */
  renderSentence: function (sentence, filled) {
    var el = $('quizSentence');
    el.innerHTML = '';
    var parts = sentence.split('___');
    parts.forEach(function (part, i) {
      el.appendChild(document.createTextNode(part));
      if (i < parts.length - 1) {
        var blank = document.createElement('span');
        blank.className = 'blank' + (filled ? ' is-filled' : '');
        blank.textContent = filled || ' ';
        el.appendChild(blank);
      }
    });
  },

  render: function (i, reviewing) {
    State.quizIndex = i;
    showPage('quizPage');

    var q = QUIZ[i];
    var log = this.logFor(i);
    var box = $('quizOptions');

    $('quizLabel').textContent = 'Question ' + (i + 1) + ' of ' + QUIZ.length;
    renderDots($('quizDots'), QUIZ.length, i);
    this.renderSentence(q.sentence, log.done ? q.answer : null);

    buildOptions(box, log.opts, function (value, btn) { Quiz.answer(value, btn); });
    applyLog(box, log, q.answer);
    if (reviewing) lockOptions(box);
    showFeedback($('quizFeedback'), log.feedback);
    setNextBtn($('quizNextBtn'), reviewing,
      i < QUIZ.length - 1 ? 'Next question' : 'See your result', log.done);
  },

  answer: function (value, btn) {
    if (State.reviewing || Gate.mode) return;
    var i = State.quizIndex;
    var log = State.quizLog[i];
    if (!log || log.done) return;

    var q = QUIZ[i];
    var box = $('quizOptions');

    if (value === q.answer) {
      log.done = true;
      btn.classList.add('is-correct');
      lockOptions(box);
      this.renderSentence(q.sentence, q.answer);
      State.quizScore += log.wrong.length === 0 ? 1 : 0.5;
      if (log.wrong.length > 0) State.quizReview.push({ index: i, revealed: false });
      log.feedback = {
        cls: 'is-good',
        text: (log.wrong.length === 0 ? 'Correct. ' : 'Right this time — this step counts as half. ') +
          'The sentence needs “' + q.answer + '”.'
      };
      this.finish(log);
      return;
    }

    log.wrong.push(value);
    btn.classList.add('is-wrong');
    btn.disabled = true;
    Nav.loseLife();

    if (log.wrong.length >= REVEAL_AFTER_WRONG) {
      log.done = true;
      log.revealed = true;
      markCorrect(box, q.answer);
      lockOptions(box);
      this.renderSentence(q.sentence, q.answer);
      State.quizScore += 0.5;
      State.quizReview.push({ index: i, revealed: true });
      log.feedback = { cls: 'is-bad', text: 'Two misses — the answer is marked in green. This step counts as half.' };
      toast('Answer revealed · half a step');
      this.finish(log);
      return;
    }

    log.feedback = { cls: 'is-bad', text: 'Not that one. Read the whole sentence again and try another word.' };
    showFeedback($('quizFeedback'), log.feedback);
  },

  finish: function (log) {
    State.stepsDone++;
    showFeedback($('quizFeedback'), log.feedback);
    setNextBtn($('quizNextBtn'), false,
      State.quizIndex < QUIZ.length - 1 ? 'Next question' : 'See your result', true);
    Nav.update();
  }
};

/* ---------------- Hasil: tiga layar berurutan ---------------- */
var Result = {
  text: '',

  init: function () {
    $('resultNextBtn').addEventListener('click', function () { Flow.forward('result-review'); });
    $('reviewNextBtn').addEventListener('click', function () { Flow.forward('result-words'); });
    $('reviewBackBtn').addEventListener('click', function () { goBack(); });
    $('wordsBackBtn').addEventListener('click', function () { goBack(); });
    $('copyResultBtn').addEventListener('click', function () { Result.copy(Result.text, 'Result copied.'); });
    $('copyCodeBtn').addEventListener('click', function () { Result.copy(Result.code(), 'Result code copied — show it to your teacher.'); });

    /* Dulu tombol ini hanya menyalakan .is-active lalu langsung
       berpindah halaman, jadi animasi 0,6 detiknya tidak pernah
       sempat terlihat. */
    $('resultBackBtn').addEventListener('click', function (e) {
      e.preventDefault();
      leaveTo(this.getAttribute('href'));
    });
  },

  enter: function () {
    Nav.stopRotate();
    Score.save();
    this.build();
    Flow.reset('result');
  },

  build: function () {
    /* Tambahan T3: dipakai kop cetak lewat #resultPage::before (CSS),
       supaya tiap lembar arsip fisik menyebut nama siswa dan kode hasil.
       Result.code() sudah ada dan dipakai, bukan format baru. */
    $('resultPage').setAttribute('data-student', Nav.studentName());
    $('resultPage').setAttribute('data-code', Result.code());

    var barat = readKey('oj_barat_v1');
    var timur = readKey(KEY_PREREQ);
    var journeyDone = !!(barat && barat.status === 'completed') && !!(timur && timur.status === 'completed');
    $('journeyNote').hidden = !journeyDone;

    $('resultScore').innerHTML =
      '<div><dt>Steps</dt><dd>' + Score.display() + '/' + TOTAL_STEPS + '</dd></div>' +
      '<div><dt>Revealed</dt><dd>' + Score.revealedCount() + '</dd></div>' +
      '<div><dt>Lives left</dt><dd>' + State.lives + '/' + TOTAL_LIVES + '</dd></div>';

    var rows = [
      { label: 'Activity 1 · word meanings', got: State.wordScore, of: WORDS.length },
      { label: 'Activity 2 · what it points to', got: State.pointScore, of: POINTS.length },
      { label: 'Activity 3 · quiz', got: State.quizScore, of: QUIZ.length }
    ];
    var steps = $('resultSteps');
    steps.innerHTML = '';
    rows.forEach(function (row, i) {
      var li = document.createElement('li');
      li.className = 'step-item';
      var n = document.createElement('span');
      n.textContent = '0' + (i + 1);
      var label = document.createElement('span');
      label.textContent = row.label;
      var mark = document.createElement('span');
      mark.className = 'step-mark ' + (row.got === row.of ? 'is-good' : 'is-bad');
      mark.textContent = (row.got % 1 === 0 ? row.got : row.got.toFixed(1)) + '/' + row.of;
      li.appendChild(n);
      li.appendChild(label);
      li.appendChild(mark);
      steps.appendChild(li);
    });

    var answers = $('resultAnswers');
    answers.innerHTML = '';
    var any = false;

    function item(title, right, extra) {
      var li = document.createElement('li');
      li.className = 'answer-item';
      var q = document.createElement('p');
      q.className = 'answer-q';
      q.textContent = title;
      li.appendChild(q);
      var r = document.createElement('p');
      r.className = 'answer-right';
      r.textContent = right;
      li.appendChild(r);
      if (extra) {
        var e = document.createElement('p');
        e.className = 'answer-yours';
        e.textContent = extra;
        li.appendChild(e);
      }
      answers.appendChild(li);
      any = true;
    }

    State.wordReview.forEach(function (entry) {
      var w = null;
      WORDS.forEach(function (candidate) { if (candidate.word === entry.word) w = candidate; });
      if (!w) return;
      item(w.word, w.definition, w.gloss);
    });

    State.pointReview.forEach(function (entry) {
      var q = POINTS[entry.index];
      item(q.question, 'It points to: ' + q.answer, q.quote.replace(/<[^>]+>/g, ''));
    });

    State.quizReview.forEach(function (entry) {
      var q = QUIZ[entry.index];
      item('Question ' + (entry.index + 1), 'Correct answer: ' + q.answer, q.sentence);
    });

    if (!any) answers.innerHTML = '<li class="answer-item">Nothing — all twenty steps landed on the first try.</li>';

    var tips = $('resultTips');
    tips.innerHTML = '';
    WORDS.forEach(function (w) {
      var li = document.createElement('li');
      var em = document.createElement('em');
      em.textContent = w.word;
      li.appendChild(em);
      li.appendChild(document.createTextNode(' — ' + w.definition));
      tips.appendChild(li);
    });

    this.text = 'NarrativeLearn · Nusa Selatan\n' +
      'Student: ' + Nav.studentName() + '\n' +
      'Steps: ' + Score.display() + '/' + TOTAL_STEPS + '\n' +
      'Word meanings: ' + State.wordScore + '/' + WORDS.length + '\n' +
      'What it points to: ' + State.pointScore + '/' + POINTS.length + '\n' +
      'Quiz: ' + State.quizScore + '/' + QUIZ.length + '\n' +
      'Lives left: ' + State.lives + '/' + TOTAL_LIVES + '\n' +
      'Attempt: ' + readAttempt();
  },

  /* Kode hasil untuk guru — bentuk payload v1 dipertahankan seperti
     versi sebelumnya supaya alat guru yang sudah ada tetap membacanya. */
  code: function () {
    var student = readKey(KEY_STUDENT);
    var payload = {
      v: 1,
      name: student ? (student.name || null) : null,
      class: student ? (student.class || null) : null,
      barat: readKey('oj_barat_v1'),
      timur: readKey(KEY_PREREQ),
      selatan: readKey(KEY_SELF)
    };
    try { return btoa(unescape(encodeURIComponent(JSON.stringify(payload)))); }
    catch (e) { return JSON.stringify(payload); }
  },

  copy: function (text, okMessage) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { toast(okMessage); },
        function () { Result.fallbackCopy(text, okMessage); }
      );
    } else {
      this.fallbackCopy(text, okMessage);
    }
  },

  fallbackCopy: function (text, okMessage) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', 'readonly');
    area.style.cssText = 'position:fixed;top:-1000px;left:-1000px;';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); toast(okMessage); }
    catch (e) { toast('Copy failed — select the text manually.'); }
    document.body.removeChild(area);
  }
};

/* Meninggalkan pelajaran: transisi dulu, baru pindah — supaya
   animasi 0,6 detik benar-benar terlihat. */
function leaveTo(url) {
  var el = $('transitionOverlay');
  el.classList.add('is-active');
  setTimeout(function () { window.location.href = url; }, 600);
}

/* ---------------- Gestur geser dari tepi layar ---------------- */
function initSwipeBack() {
  var MIN = 60;
  var MAX_DRIFT = 80;
  var startX = null, startY = null, side = null;

  Array.prototype.forEach.call(document.querySelectorAll('.swipe-zone'), function (zone) {
    zone.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { startX = null; return; }
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      side = zone.getAttribute('data-swipe');
    }, { passive: true });

    zone.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = Math.abs(e.changedTouches[0].clientY - startY);
      var inward = side === 'left' ? dx > MIN : dx < -MIN;
      startX = null;
      if (inward && dy < MAX_DRIFT) goBack();
    }, { passive: true });
  });
}

/* ---------------- Tumpukan dialog ----------------
   Menjaga tiga hal yang dulu tidak ada: Escape menutup dialog,
   fokus terkunci di dalam dialog, dan halaman di belakangnya
   di-`inert` supaya tidak bisa dijangkau Tab. */
var Modals = {
  stack: [],

  push: function (entry) {
    entry.opener = document.activeElement;
    this.stack.push(entry);
    this.applyInert();
  },

  pop: function (id) {
    for (var i = this.stack.length - 1; i >= 0; i--) {
      if (this.stack[i].id === id) {
        var entry = this.stack.splice(i, 1)[0];
        this.applyInert();
        if (entry.opener && entry.opener.focus && document.contains(entry.opener)) focusSoftly(entry.opener);
        return;
      }
    }
    this.applyInert();
  },

  top: function () { return this.stack[this.stack.length - 1] || null; },
  isOpen: function () { return this.stack.length > 0; },

  closeTop: function () {
    var entry = this.top();
    if (!entry) return false;
    entry.close();
    return true;
  },

  /* Coach mark sengaja TIDAK mematikan navigator: tombolnya sendiri
     yang dipakai untuk menutup coach mark. */
  applyInert: function () {
    var lockNav = false;
    for (var i = 0; i < this.stack.length; i++) if (this.stack[i].lockNav) lockNav = true;
    setInert($('stage'), this.stack.length > 0);
    setInert($('nav'), lockNav);
  },

  trap: function (e) {
    var entry = this.top();
    if (!entry || e.key !== 'Tab') return;
    var root = $(entry.id);
    if (!root) return;
    var found = root.querySelectorAll('button:not([disabled]), a[href], textarea, input, select, [tabindex]:not([tabindex="-1"])');
    var list = [];
    for (var i = 0; i < found.length; i++) if (isVisible(found[i])) list.push(found[i]);
    if (!list.length) return;

    var first = list[0];
    var last = list[list.length - 1];
    var here = document.activeElement;

    if (list.indexOf(here) < 0) { e.preventDefault(); first.focus(); return; }
    if (e.shiftKey && here === first) { e.preventDefault(); last.focus(); return; }
    if (!e.shiftKey && here === last) { e.preventDefault(); first.focus(); }
  }
};

/* ---------------- Ask a question ---------------- */
var Ask = {
  init: function () {
    $('askCancel').addEventListener('click', function () { Ask.close(); });
    $('askSend').addEventListener('click', function () { Ask.send(); });
    $('askPanel').addEventListener('click', function (e) {
      if (e.target === $('askPanel')) Ask.close();   /* klik latar */
    });
  },

  open: function () {
    if (!$('askPanel').hidden) return;
    if (Coach.isOpen()) Coach.close();
    $('askNote').textContent = 'Your teacher will see this on their own screen.';
    $('askPanel').hidden = false;
    Modals.push({ id: 'askPanel', lockNav: true, close: function () { Ask.close(); } });
    focusSoftly($('askText'));
  },

  close: function () {
    if ($('askPanel').hidden) return;
    $('askPanel').hidden = true;
    Modals.pop('askPanel');
  },

  send: function () {
    var text = $('askText').value.trim();
    if (!text) { $('askNote').textContent = 'Write your question first, then send.'; return; }
    var list = readKey('nl_questions_v1');
    if (!Array.isArray(list)) list = [];
    list.push({ module: 'oj_selatan', page: State.page, text: text, at: new Date().toISOString() });
    writeKey('nl_questions_v1', list);
    $('askText').value = '';
    $('askNote').textContent = 'Sent. Your teacher will answer soon.';
    setTimeout(function () { Ask.close(); }, 1100);
  }
};

/* ---------------- Konfirmasi keluar ---------------- */
var Confirm = {
  onOk: null,

  init: function () {
    $('confirmCancel').addEventListener('click', function () { Confirm.close(); });
    $('confirmOk').addEventListener('click', function () {
      var run = Confirm.onOk;
      Confirm.close();
      if (run) run();
    });
    $('confirmPanel').addEventListener('click', function (e) {
      if (e.target === $('confirmPanel')) Confirm.close();
    });
  },

  ask: function (title, body, okLabel, onOk) {
    if (!$('confirmPanel').hidden) return;
    if (Coach.isOpen()) Coach.close();
    $('confirmTitle').textContent = title;
    $('confirmBody').textContent = body;
    $('confirmOk').textContent = okLabel;
    this.onOk = onOk;
    $('confirmPanel').hidden = false;
    Modals.push({ id: 'confirmPanel', lockNav: true, close: function () { Confirm.close(); } });
    focusSoftly($('confirmCancel'));
  },

  close: function () {
    if ($('confirmPanel').hidden) return;
    $('confirmPanel').hidden = true;
    this.onOk = null;
    Modals.pop('confirmPanel');
  },

  leaveLesson: function () {
    this.ask(
      'Leave the lesson?',
      'Leave the lesson? Your progress on this island will be lost.',
      'Leave',
      /* T1: '../home/index.html' diperbaiki jadi '../index.html' — folder
         home/ tidak ada. Kemunculan ini ditemukan saat audit T1, di luar
         dua lokasi yang disebut di berkas revisi (index.html baris 49
         dan 284), tapi menuju folder rusak yang sama. */
      function () { leaveTo('../index.html'); }
    );
  }
};

/* ---------------- Coach mark ----------------
   Setiap langkah WAJIB punya `target` yang benar-benar terlihat saat
   langkah itu tampil. Langkah tanpa target yang terlihat dilewati —
   tidak ada lagi "kartu teks di tengah layar" yang menyamar jadi
   coach mark. Teksnya sengaja sangat pendek: satu gagasan, satu
   sorotan, lalu lanjut. */
var COACH = {
  words: [
    { target: '#wordTitle', text: 'This is your new word.' },
    { target: '#wordPlate', text: 'The picture is your first clue.' },
    { target: '#wordContext', text: 'This sentence comes from the story.' },
    { target: '#wordOptions', text: 'Pick what the word means.' },
    { target: '#navHearts', text: 'A wrong answer costs one heart.' },
    /* Revisi R1: dipindahkan dari tur 'video' yang dicabut. Diletakkan
       paling akhir dan di aktivitas PERTAMA — di sinilah siswa mungkin
       benar-benar tersangkut, bukan saat menonton video. */
    { target: '#navAsk', text: 'Stuck? Tap here to ask your teacher.' }
  ],
  'word-meaning': [
    { target: '#meaningDef', text: 'Here is what your word means.' },
    { target: '#meaningGloss', text: 'The same idea in Bahasa Indonesia.' },
    { target: '#pronPlay', text: 'Tap here to hear the word.' },
    { target: '#pronSpeeds', text: 'Try slow first, then normal.' },
    { target: '#meaningNextBtn', text: 'Tap here for the next word.' }
  ],
  points: [
    { target: '#pointQuote', text: 'Read this line from the story.' },
    { target: '#pointQuestion', text: 'It asks about the dark word.' },
    { target: '#pointOptions', text: 'Choose who or what it means.' },
    { target: '#navHearts', text: 'A wrong answer costs one heart.' }
  ],
  quiz: [
    { target: '#quizSentence', text: 'One word is missing here.' },
    { target: '#quizOptions', text: 'Pick the word that fits.' },
    { target: '#quizDots', text: 'Six questions. This shows where you are.' }
  ],
  result: [
    { target: '#resultScore', text: 'Here are your twenty steps.' },
    { target: '#resultSteps', text: 'Your score for each activity.' },
    { target: '#resultNextBtn', text: 'Tap to see what to read again.' }
  ],
  'result-review': [
    { target: '#resultAnswers', text: 'Read these ones again at home.' },
    { target: '#reviewNextBtn', text: 'Tap for the words to keep.' }
  ],
  'result-words': [
    { target: '#resultTips', text: 'Keep these eight words in your head.' },
    { target: '#copyCodeBtn', text: 'Show this code to your teacher.' }
  ]
};

/* Revisi R1: 'video' dikeluarkan dari daftar. Tur coach mark baru
   boleh terbuka sendiri SETELAH sesi video terlewati, seragam dengan
   enam platform lain. Instruksi untuk halaman video kini disampaikan
   lewat hint pojok kanan atas — lihat peta HINTS.

   Welcome dan layar tunggu tidak perlu disebut di sini: Coach.canOpen()
   sudah memblokir keduanya lewat $('appShell').hidden dan Gate.mode.
   Stage 'words' menjadi coach mark otomatis PERTAMA yang dilihat siswa. */
var AUTO_COACH = {
  words: true, 'word-meaning': true, points: true, quiz: true,
  result: true, 'result-review': true, 'result-words': true
};

var Coach = {
  steps: [],
  index: 0,
  stage: null,
  timer: null,
  raf: null,
  watching: false,

  init: function () {
    $('coachNext').addEventListener('click', function () { Coach.next(); });
    $('coachClose').addEventListener('click', function () { Coach.close(); });
    $('coachBlock').addEventListener('click', function () { Coach.close(); }); /* klik latar */
  },

  seen: function () {
    var data = readKey(KEY_COACH);
    return (data && typeof data === 'object') ? data : {};
  },
  markSeen: function (stage) {
    var data = this.seen();
    data[stage] = true;
    writeKey(KEY_COACH, data);
  },

  /* Sakelar alat pengembang. sessionStorage, bukan localStorage,
     supaya tidak ikut terbawa ke sesi siswa sungguhan. */
  enabled: function () {
    try { return sessionStorage.getItem(KEY_DEV_COACH) !== '0'; } catch (e) { return true; }
  },
  setEnabled: function (on) {
    try { sessionStorage.setItem(KEY_DEV_COACH, on ? '1' : '0'); } catch (e) { /* diamkan */ }
  },

  isOpen: function () { return !$('coachWrap').hidden; },
  cancelAuto: function () { clearTimeout(this.timer); this.timer = null; },

  canOpen: function (stage) {
    if (!COACH[stage] || !COACH[stage].length) return false;
    if ($('appShell').hidden) return false;
    if (Gate.mode) return false;                                    /* tidak di atas layar tunggu guru */
    if (Modals.isOpen()) return false;                              /* tidak di atas #askPanel */
    if (!$('blackout').hidden) return false;
    if ($('transitionOverlay').classList.contains('is-active')) return false;
    return true;
  },

  /* Menyala sendiri, sekali per tahap. Jeda pendek supaya tidak
     menabrak animasi masuk halaman. */
  maybeAuto: function (stage) {
    this.cancelAuto();
    if (!AUTO_COACH[stage]) return;
    if (!this.enabled()) return;
    if (this.seen()[stage]) return;
    this.timer = setTimeout(function () {
      if (State.page !== stage) return;
      Coach.open(stage, true);
    }, 350);
  },

  open: function (stage, auto) {
    stage = stage || State.page;
    if (this.isOpen()) this.close();
    if (!this.canOpen(stage)) {
      if (!auto) toast('Nothing to explain on this screen.');
      return;
    }

    var steps = [];
    COACH[stage].forEach(function (step) {
      if (isVisible(document.querySelector(step.target))) steps.push(step);
    });
    if (!steps.length) {
      if (!auto) toast('Nothing to explain on this screen.');
      return;
    }

    this.steps = steps;
    this.index = 0;
    this.stage = stage;
    this.markSeen(stage);

    document.body.classList.add('is-coaching');
    $('coachBlock').hidden = false;
    $('coachWrap').hidden = false;
    $('coachHole').hidden = false;
    $('navCoach').classList.add('is-on');
    $('navCoach').setAttribute('aria-pressed', 'true');

    Modals.push({ id: 'coachWrap', lockNav: false, close: function () { Coach.close(); } });
    this.watch();
    this.show();
    focusSoftly($('coachNext'));
  },

  show: function () {
    /* Langkah yang targetnya menghilang di tengah jalan dilewati. */
    while (this.index < this.steps.length && !isVisible(document.querySelector(this.steps[this.index].target))) {
      this.index++;
    }
    if (this.index >= this.steps.length) { this.close(); return; }

    var step = this.steps[this.index];
    $('coachStep').textContent = 'Step ' + (this.index + 1) + ' of ' + this.steps.length;
    $('coachText').textContent = step.text;
    $('coachNext').textContent = this.index === this.steps.length - 1 ? 'Got it' : 'Continue';

    /* Bawa target ke tengah layar DULU — kalau tidak, sorotan bisa
       tergambar di luar layar dan siswa cuma melihat layar gelap. */
    var target = document.querySelector(step.target);
    if (target && target.scrollIntoView) {
      try { target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' }); }
      catch (e) { target.scrollIntoView(); }
    }

    var self = this;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(function () {
      self.raf = requestAnimationFrame(function () { self.place(); });
    });
  },

  /* Menaruh sorotan tepat di atas elemen target, lalu menaruh kartu
     keterangan di sisi yang ruangnya lebih lega (bawah/atas target). */
  place: function () {
    if (!this.isOpen()) return;
    var step = this.steps[this.index];
    if (!step) return;

    var target = document.querySelector(step.target);
    var hole = $('coachHole');
    var tip = $('coachWrap').querySelector('.dialog');
    if (!isVisible(target)) { hole.hidden = true; return; }

    var rect = target.getBoundingClientRect();
    var pad = 8;
    hole.hidden = false;
    hole.style.top = (rect.top - pad) + 'px';
    hole.style.left = (rect.left - pad) + 'px';
    hole.style.width = (rect.width + pad * 2) + 'px';
    hole.style.height = (rect.height + pad * 2) + 'px';

    var tipRect = tip.getBoundingClientRect();
    var spaceBelow = window.innerHeight - rect.bottom;
    var placeBelow = spaceBelow >= tipRect.height + 24 || spaceBelow >= rect.top;

    tip.style.top = placeBelow
      ? Math.min(rect.bottom + pad + 12, window.innerHeight - tipRect.height - 12) + 'px'
      : Math.max(rect.top - pad - 12 - tipRect.height, 12) + 'px';

    var left = rect.left + rect.width / 2 - tipRect.width / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - tipRect.width - 16));
    tip.style.left = left + 'px';
  },

  /* Sorotan ikut berpindah kalau tablet diputar, jendela diubah,
     atau halaman tergulir. */
  watch: function () {
    if (this.watching) return;
    this.watching = true;
    window.addEventListener('resize', Coach.onShift);
    window.addEventListener('orientationchange', Coach.onShift);
    window.addEventListener('scroll', Coach.onShift, true);
  },
  onShift: function () { if (Coach.isOpen()) Coach.place(); },

  next: function () {
    if (this.index < this.steps.length - 1) { this.index++; this.show(); }
    else this.close();
  },

  close: function () {
    var was = this.isOpen();
    $('coachWrap').hidden = true;
    $('coachBlock').hidden = true;
    $('coachHole').hidden = true;
    document.body.classList.remove('is-coaching');
    $('navCoach').classList.remove('is-on');
    $('navCoach').setAttribute('aria-pressed', 'false');
    if (was || Modals.top()) Modals.pop('coachWrap');
  }
};

/* Revisi R1: tahap 'video' tidak lagi memicu coach mark otomatis, jadi
   catatannya di KEY_COACH sudah tak bermakna. Dibersihkan sekali saat
   init supaya penyimpanan tidak menyimpan kunci mati. Aman dipanggil
   berulang kali. */
(function pruneCoachSeen() {
  var data = readKey(KEY_COACH);
  if (data && typeof data === 'object' && data.video) {
    delete data.video;
    writeKey(KEY_COACH, data);
  }
})();

/* ---------------- Papan tik ----------------
   Huruf A–D di setiap `.option` dulu janji kosong: tidak ada satu
   pun keydown handler di seluruh berkas ini. Sekarang huruf itu
   benar-benar bekerja. */
function initKeyboard() {
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (Modals.closeTop()) e.preventDefault();
      return;
    }
    if (Modals.isOpen()) { Modals.trap(e); return; }
    if (e.altKey || e.ctrlKey || e.metaKey) return;

    var page = document.querySelector('.page:not([hidden])');
    if (!page) return;

    var letter = String(e.key || '').toUpperCase();
    var i = KEYS.indexOf(letter);
    if (i >= 0) {
      var box = page.querySelector('.options');
      if (!box) return;
      var options = box.querySelectorAll('.option');
      if (!options[i]) return;
      e.preventDefault();
      if (options[i].disabled) { toast('That answer is already closed.'); return; }
      options[i].click();
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      /* Tombol & tautan sudah ditangani peramban; jangan dobel. */
      var here = document.activeElement;
      if (here && here !== document.body &&
        (here.tagName === 'BUTTON' || here.tagName === 'A' || here.tagName === 'TEXTAREA' || here.tagName === 'INPUT')) return;
      var next = page.querySelector('.js-next:not([hidden])');
      if (next) { e.preventDefault(); next.click(); }
    }
  });
}

/* Revisi R6: welcome-2 kini bisa digulir (isinya tidak lagi dipotong),
   jadi "tap untuk lanjut" harus dibedakan dari "geser untuk membaca".
   Ambangnya sengaja longgar: 12px dan 600ms cukup memaafkan jempol
   yang bergeser sedikit, tapi cukup ketat menolak gulir sungguhan. */
function onTap(el, handler) {
  var sx = 0, sy = 0, st = 0, valid = false;
  el.addEventListener('pointerdown', function (e) {
    sx = e.clientX; sy = e.clientY; st = Date.now(); valid = true;
  });
  el.addEventListener('pointercancel', function () { valid = false; });
  el.addEventListener('pointerup', function (e) {
    if (!valid) return;
    valid = false;
    var moved = Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy);
    if (moved > 12) return;               /* ini gulir, bukan tap */
    if (Date.now() - st > 600) return;    /* ini tahan-lama, bukan tap */
    handler();
  });
}

/* ---------------- Welcome ---------------- */
var Welcome = {
  bound: false,
  roadmapShown: false,

  init: function () {
    if (this.bound) return;
    this.bound = true;

    Array.prototype.forEach.call(document.querySelectorAll('.welcome-bg'), function (img) {
      img.addEventListener('error', function () { img.style.display = 'none'; });
    });
    var plateImg = $('welcome2Image');
    if (plateImg) {
      plateImg.addEventListener('error', function () {
        var plate = plateImg.parentNode;
        if (plate && plate.classList) plate.classList.add('is-empty');
      });
    }

    onTap($('welcome1'), function () { Flow.go('welcome-2'); });
    onTap($('welcome2'), function () { Welcome.advance(); });
  },

  render: function (n) {
    if (n === 1) { this.roadmapShown = false; this.resetRoadmap(); return; }
    if (!this.roadmapShown) this.resetRoadmap();
  },

  /* Revisi R6: logika yang dulu tertanam langsung di handler `click`
     dipisah jadi metode sendiri supaya panel pengembang (initDevPanel)
     bisa memicunya secara langsung. Sejak handler diganti `onTap`,
     memanggil $('welcome2').click() tidak lagi memicu apa pun karena
     onTap mendengarkan pointerdown/pointerup, bukan click. */
  advance: function () {
    if (!this.roadmapShown) { this.showRoadmap(); return; }
    Flow.go('wait-1');
  },

  resetRoadmap: function () {
    $('welcome2Intro').hidden = false;
    var roadmap = $('welcome2Roadmap');
    roadmap.hidden = true;
    roadmap.classList.remove('is-visible');
    $('welcome2Tap').textContent = 'tap to see your path';
  },

  showRoadmap: function () {
    this.roadmapShown = true;
    $('welcome2Intro').hidden = true;
    var roadmap = $('welcome2Roadmap');
    roadmap.hidden = false;
    $('welcome2Tap').textContent = 'tap to start the lesson';
    hint('Tap again to start');   /* Revisi R3 */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { roadmap.classList.add('is-visible'); });
    });
  }
};

/* ============================================================
   MODE PENGEMBANG — hapus fungsi-fungsi ini beserta panelnya di
   HTML/CSS sebelum launching. Tidak ada bagian lain yang
   memanggilnya, jadi seluruh blok bisa dibuang sekaligus.
   ============================================================ */

/* Nama berkas teknis hanya untuk pengembang; siswa melihat kalimat
   ramah yang sudah tertulis di HTML. */
function revealDevNotes() {
  Array.prototype.forEach.call(document.querySelectorAll('[data-dev-note]'), function (el) {
    el.textContent = el.getAttribute('data-dev-note');
  });
}

function initDevPanel() {
  var panel = $('devPanel');
  var btn = $('devAnswer');
  var toggle = $('devCoachToggle');
  if (!panel || !btn || !toggle) return;
  panel.hidden = false;

  function paintToggle() {
    var on = Coach.enabled();
    toggle.classList.toggle('is-off', !on);
    toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    toggle.setAttribute('title', on ? 'Coach mark: ON' : 'Coach mark: OFF');
    $('devCoachOn').hidden = !on;
    $('devCoachOff').hidden = on;
  }
  paintToggle();

  toggle.addEventListener('click', function () {
    var on = Coach.enabled();
    Coach.setEnabled(!on);
    if (on) { Coach.cancelAuto(); Coach.close(); }
    paintToggle();
    toast(on ? 'Coach mark: off' : 'Coach mark: on');
  });

  function flashEmpty() {
    btn.classList.add('is-empty');
    setTimeout(function () { btn.classList.remove('is-empty'); }, 400);
  }

  /* `getAnswer` sengaja fungsi, bukan nilai: indeks aktivitas sudah
     lewat batas begitu aktivitasnya selesai, jadi membacanya di
     halaman lain melempar TypeError dan menghentikan handler ini. */
  function pass(pageId, nextBtnId, box, getAnswer) {
    if ($(pageId).hidden) return false;
    if (!$(nextBtnId).hidden) { $(nextBtnId).click(); return true; }
    var answer = getAnswer();
    var target = optionByValue($(box), answer);
    if (target && !target.disabled) { target.click(); return true; }
    return false;
  }

  btn.addEventListener('click', function () {
    if (Modals.isOpen()) { Modals.closeTop(); return; }
    if (Gate.mode) { TeacherAPI.release(); return; }
    if (State.reviewing) { Flow.toFrontier(); return; }
    if (!$('welcome1').hidden) { Flow.go('welcome-2'); return; }
    if (!$('welcome2').hidden) { Welcome.advance(); return; }
    if (!$('videoPage').hidden) { Gate.waitAfterVideo(); return; }
    if (pass('wordPage', 'wordNextBtn', 'wordOptions', function () { return Words.current().answer; })) return;
    if (!$('wordMeaningPage').hidden) { $('meaningNextBtn').click(); return; }
    if (pass('pointPage', 'pointNextBtn', 'pointOptions', function () { return POINTS[State.pointIndex].answer; })) return;
    if (pass('quizPage', 'quizNextBtn', 'quizOptions', function () { return QUIZ[State.quizIndex].answer; })) return;
    if (!$('resultPage').hidden) { $('resultNextBtn').click(); return; }
    if (!$('resultReviewPage').hidden) { $('reviewNextBtn').click(); return; }
    flashEmpty();
  });
}

function initDevDrag() {
  var panel = $('devPanel');
  if (!panel) return;
  var THRESHOLD = 6;
  var id = null, startX = 0, startY = 0, baseLeft = 0, baseTop = 0, dragged = false;

  function clamp(v, min, max) { return Math.min(Math.max(v, min), Math.max(min, max)); }

  function move(e) {
    if (e.pointerId !== id) return;
    var dx = e.clientX - startX, dy = e.clientY - startY;
    if (!dragged && (Math.abs(dx) > THRESHOLD || Math.abs(dy) > THRESHOLD)) {
      dragged = true;
      panel.classList.add('is-dragging');
    }
    if (!dragged) return;
    e.preventDefault();
    var rect = panel.getBoundingClientRect();
    panel.style.left = clamp(baseLeft + dx, 0, window.innerWidth - rect.width) + 'px';
    panel.style.top = clamp(baseTop + dy, 0, window.innerHeight - rect.height) + 'px';
  }
  function up(e) {
    if (e.pointerId !== id) return;
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', up);
    document.removeEventListener('pointercancel', up);
    panel.classList.remove('is-dragging');
    id = null;
  }

  panel.addEventListener('pointerdown', function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.isPrimary === false) return;
    id = e.pointerId;
    dragged = false;
    startX = e.clientX;
    startY = e.clientY;
    var rect = panel.getBoundingClientRect();
    panel.style.left = rect.left + 'px';
    panel.style.top = rect.top + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    baseLeft = rect.left;
    baseTop = rect.top;
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
  });

  /* Penekan klik setelah seret — berlaku untuk KEDUA kotak karena
     dipasang di wadahnya, dalam fase capture. */
  panel.addEventListener('click', function (e) {
    if (dragged) { e.preventDefault(); e.stopImmediatePropagation(); dragged = false; }
  }, true);
}

function initDevTooltip() {
  var tip = $('devTooltip');
  if (!tip) return;
  var timer = null;

  function place(btn, text) {
    tip.textContent = text;
    tip.style.left = '-9999px';
    tip.style.top = '-9999px';
    var b = btn.getBoundingClientRect();
    var t = tip.getBoundingClientRect();
    var left = b.right + 10;
    if (left + t.width > window.innerWidth - 6) left = b.left - 10 - t.width;
    tip.style.left = Math.max(6, left) + 'px';
    tip.style.top = Math.max(6, b.top + b.height / 2 - t.height / 2) + 'px';
    tip.classList.add('is-visible');
  }
  function hide() { clearTimeout(timer); tip.classList.remove('is-visible'); }

  function wire(btn, label) {
    if (!btn) return;
    var show = function () { place(btn, label()); };
    btn.addEventListener('mouseenter', function () { clearTimeout(timer); timer = setTimeout(show, 300); });
    btn.addEventListener('mouseleave', hide);
    btn.addEventListener('focus', show);
    btn.addEventListener('blur', hide);
  }

  wire($('devAnswer'), function () { return '(' + State.page + (State.reviewing ? ' · review' : '') + ')'; });
  wire($('devCoachToggle'), function () { return Coach.enabled() ? 'coach auto: ON' : 'coach auto: OFF'; });
}
/* ====================== AKHIR MODE PENGEMBANG ====================== */

/* ---------------- Inisialisasi ---------------- */
(function init() {
  var prereq = readKey(KEY_PREREQ);

  if (!DEV_MODE && (!prereq || prereq.status !== 'completed')) {
    $('lockedPage').hidden = false;
    return;
  }
  $('lockedPage').hidden = true;

  if (DEV_MODE) { revealDevNotes(); initDevPanel(); initDevDrag(); initDevTooltip(); }

  Welcome.init();
  Nav.init();
  Gate.init();
  Video.init();
  Pron.init();
  Words.init();
  WordMeaning.init();
  Points.init();
  Quiz.init();
  Result.init();
  Ask.init();
  Confirm.init();
  Coach.init();

  initKeyboard();
  initSwipeBack();
  initHistory();

  Flow.start('welcome-1');
})();
