/* ============================================================
   Muara Jati — NarrativeLearn  (re-design)
   /lake-lembayung/muara-jati/

   Alur: locked → welcome 1 → welcome 2 → tunggu guru 1 → video →
   tunggu guru 2 → 4 sesi menyusun kartu (tiap sesi: halaman
   instruksi dulu, baru halaman kartu interaktif) → kuis 6 soal →
   hasil.

   Penilaian: 10 LANGKAH = 4 sesi kartu + 6 soal kuis. Satu langkah
   dihitung benar kalau selesai TANPA kehilangan nyawa di langkah itu.
   Tidak ada lulus/gagal — hasilnya ditampilkan apa adanya.

   Nyawa: 7, dibagi bersama seluruh sesi kartu + kuis (sama seperti
   modul Bukit Camar). Habis → layar tunggu guru; guru memulihkan.

   Navigasi mundur (lihat Router di bawah): SPA ini tidak pernah
   membuat entry browser-history baru per stage, jadi tombol/gesture
   Back TIDAK memakai window.history sama sekali — dipakai stack
   navigasi internal sederhana yang di-push tiap kali masuk stage
   konten nyata (video, activity, quiz, result) dan di-pop saat
   pengguna menekan Back. Gerbang tunggu-guru & welcome sengaja
   tidak ikut masuk stack itu: keduanya bukan tujuan "kembali" yang
   wajar, dan Back memang harus tetap tidak aktif selama gerbang
   tampil.

   Kunci localStorage (kontrak lintas modul, tidak berubah):
     lake_sunda_v1  — prasyarat
     lake_muara_v1  — {v,status,score,maxScore,stars,correct,total,livesUsed,attempts,completedAt}
     nl_student_v1  — identitas siswa
     nl_questions_v1 — pertanyaan siswa ke guru
     lake_muara_attempt_temp — sessionStorage, hitungan attempt sementara
   ============================================================ */

/* ============================================================
   ⚠️ MODE PENGEMBANG — HAPUS SEBELUM LAUNCHING
   Blok bertanda ini ada di tiga file (.html/.css/.js).
   DEV_MODE=true → gembok prasyarat dilewati + panel hijau
   mengambang muncul, sekarang berisi DUA tombol: kiri meloloskan
   SATU langkah yang sedang tampil per klik (seperti semula);
   kanan menyalakan/mematikan coach mark otomatis (poin revisi #3)
   supaya lebih mudah menguji bagian lain tanpa gangguan overlay.
   ============================================================ */
var DEV_MODE = true;
/* ====================== AKHIR CATATAN ATAS ====================== */

var KEY_PREREQ = 'lake_sunda_v1';
var KEY_SELF = 'lake_muara_v1';
var KEY_STUDENT = 'nl_student_v1';
var KEY_ATTEMPT = 'lake_muara_attempt_temp';

var TOTAL_LIVES = 7;
var QUIZ_COUNT = 6;
var SESSION_COUNT = 4;
var TOTAL_STEPS = SESSION_COUNT + QUIZ_COUNT; /* 10 */
var LEGACY_MAX_SCORE = 110; /* dipertahankan supaya modul lain tidak rusak */

/* ---------------- Data: 4 sesi kartu (teks diringkas untuk layar HP) ---------------- */
var SESSIONS = [
  {
    label: 'Session 1 of 4 · Easy',
    done: 'Session 1 complete. Three sessions to go.',
    order: ['c1', 'c2', 'c3', 'c4'],
    cards: {
      c1: 'Before the flood, the wooden bridge still stood firm.',
      c2: 'A big flood tore the bridge down. The village was cut off.',
      c3: 'Mr. Rosyad asked Aksara to lead the emergency bridge.',
      c4: 'After five days, the bamboo bridge was finished.'
    }
  },
  {
    label: 'Session 2 of 4 · Medium',
    done: 'Session 2 complete. You are halfway across the bridge.',
    order: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'],
    cards: {
      d1: 'Before the flood, the wooden bridge still stood firm.',
      d2: 'A big flood tore the bridge down. The village was cut off.',
      d3: 'Food ran low, and Grandpa Danu fell ill.',
      d4: 'Mr. Rosyad assigned Aksara to lead the bridge.',
      d5: 'Aksara chose a bamboo suspension bridge, not planks.',
      d6: 'After five days, Grandpa Danu could cross for treatment.'
    }
  },
  {
    label: 'Session 3 of 4 · Hard',
    done: 'Session 3 complete. One more session to go.',
    order: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'],
    cards: {
      e1: 'The flood tore the bridge down; the village was cut off.',
      e2: 'Mr. Rosyad assigned Aksara to lead the bridge.',
      e3: 'Aksara decided on a suspension bridge, not planks.',
      e4: 'Day one: gathering bamboo, mapping anchor points.',
      e5: 'Day two: main frame up; one lashing loosened.',
      e6: 'Day three: heavy rain, rising water, work halted.',
      e7: 'The water receded; every lashing was rechecked.',
      e8: 'The bridge was finished; Grandpa Danu was carried across.'
    }
  },
  {
    label: 'Session 4 of 4 · Hard',
    done: 'All four sessions complete. The quiz is next.',
    order: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'],
    cards: {
      f1: 'Aksara studies the swift current and the tall banks.',
      f2: 'Time is short, so he picks a suspension bridge.',
      f3: 'Day one: the team gathers bamboo and maps anchor points.',
      f4: 'Day two: a lashing loosens under a light test load.',
      f5: 'Aksara pauses the work to recheck the nearby knots.',
      f6: 'Day three afternoon: rain and rising water halt the work.',
      f7: 'Next day: every rain-soaked lashing is rechecked.',
      f8: 'After five days the bridge is done; Grandpa Danu crosses.'
    }
  }
];

/* ---------------- Data: kuis 6 soal (utuh) ---------------- */
var QUIZ = [
  {
    question: 'Why did Aksara choose to build a bamboo suspension bridge instead of a straight plank bridge?',
    options: ['Because bamboo is cheaper', 'Because there was no time to build support piers in the fast-flowing riverbed', 'Because the residents asked for it', 'Because plank bridges are banned by the disaster agency'],
    answer: 1,
    feedback: 'Aksara only said "we don\'t have time to build support piers on the riverbed" — the swift current was his real reason, implied rather than stated.'
  },
  {
    question: 'When a lashing briefly loosened on the second day, Aksara halted work without explaining much. What can be inferred about his attitude?',
    options: ['He panicked and was unsure of his plan', 'He is careful and puts structural safety first, even if it slows the work', 'He was looking for an excuse to rest', 'He does not trust his team'],
    answer: 1,
    feedback: 'His action fits his background as a former construction intern — he knew a weak lashing was dangerous, even without a long explanation.'
  },
  {
    question: 'What prompted Mr. Rosyad to assign Aksara to build the emergency bridge?',
    options: ['Aksara happened to be free at the time', 'Grandpa Danu was sick and needed medicine, while the food supply was running low', 'Aksara asked for the assignment himself', 'The old bridge was already scheduled for repair'],
    answer: 1,
    feedback: 'Two urgent things arrived at once: food supplies running low, and Grandpa Danu needing the clinic across the river.'
  },
  {
    question: 'What would likely have happened if Aksara had pushed on as the water began to rise on the third day?',
    options: ['The bridge would have been finished sooner', 'The team risked injury from the swift current and an unstable structure', 'There was no risk, since bamboo is light', 'The residents would have been more satisfied'],
    answer: 1,
    feedback: 'This is about predicting consequences — the text stresses that the team\'s safety came first precisely because the risk was real.'
  },
  {
    question: 'Why did Aksara recheck the rain-soaked lashings before letting anyone use the bridge?',
    options: ['Because he wanted the work to look longer', 'Because rain can weaken a lashing, and he wanted the bridge to be truly safe', 'Because the residents forced him to check again', 'Because all the wet bamboo had to be replaced'],
    answer: 1,
    feedback: 'The text only says he made sure nothing had weakened — the safety of the people crossing is the implied reason.'
  },
  {
    question: 'The resident\'s words, "Thank you for not forgetting us," most strongly suggest that…',
    options: ['The residents had felt anxious about being forgotten while isolated', 'The residents did not believe the bridge would be finished on time', 'The residents wanted Aksara to stay longer', 'The residents knew from the start it would take five days'],
    answer: 0,
    feedback: 'The remark implies the worry the residents felt while cut off — inferred from "not forgetting us," not stated outright.'
  }
];

var RECAP = [
  'Orientation, complication, and resolution are one flow — a change in one part sets the next in motion.',
  'Sequencing: the order of events can be traced through time markers and cause-and-effect logic.',
  'Inferring and predicting: some information is never stated outright — read it from the clues around it.'
];

/* ---------------- Arsip: teks & aset cerita (tidak dirender, disimpan untuk naskah video) ---------------- */
var ARCHIVE = {
  vocabulary: [
    { word: 'isolated', meaning: 'cut off from the outside world, unable to be reached as usual' },
    { word: 'emergency bridge', meaning: 'a temporary bridge built quickly to meet an urgent need' },
    { word: 'current', meaning: 'the fast-moving flow of water in a river' },
    { word: 'safety', meaning: 'a state of being secure, free from danger or accidents' }
  ],
  images: {
    0: { src: 'gambar/muara-jati-p01.jpg', audio: 'audio/muara-jati-p01.mp3' },
    1: { src: 'gambar/muara-jati-p02.jpg', audio: 'audio/muara-jati-p02.mp3' },
    2: { src: 'gambar/muara-jati-p03.jpg', audio: 'audio/muara-jati-p03.mp3' },
    3: { src: 'gambar/muara-jati-p04.jpg', audio: 'audio/muara-jati-p04.mp3' },
    4: { src: 'gambar/muara-jati-p05.jpg', audio: 'audio/muara-jati-p05.mp3' },
    5: { src: 'gambar/muara-jati-p06.jpg', audio: 'audio/muara-jati-p06.mp3' },
    6: { src: 'gambar/muara-jati-p07.jpg', audio: 'audio/muara-jati-p07.mp3' },
    7: { src: 'gambar/muara-jati-p08.jpg', audio: 'audio/muara-jati-p08.mp3' },
    8: { src: 'gambar/muara-jati-p09.jpg', audio: 'audio/muara-jati-p09.mp3' },
    9: { src: 'gambar/muara-jati-p10.jpg', audio: 'audio/muara-jati-p10.mp3' },
    10: { src: 'gambar/muara-jati-p11.jpg', audio: 'audio/muara-jati-p11.mp3' }
  }
};

/* ---------------- State ---------------- */
var State = {
  page: 'welcome-1',
  lives: TOTAL_LIVES,
  steps: [],            /* {label, clean:boolean} per langkah selesai */
  sessionIndex: 0,
  sessionClean: true,
  order: [],            /* urutan kartu saat ini (array id) */
  locked: {},           /* id kartu yang sudah terkunci benar */
  quizIndex: 0,
  quizClean: true,
  quizLog: []           /* {question, chosen, correct, wasClean} */
};

var STAGES = ['welcome-1', 'welcome-2', 'wait-1', 'video', 'wait-2', 'activity', 'quiz', 'result'];

function $(id) { return document.getElementById(id); }

/* ---------------- Hint (Revisi R3) ----------------
   Notifikasi instruksi satu baris di pojok kanan atas. Menutup
   sendiri setelah HINT_MS, atau langsung saat ditekan. Sengaja
   TIDAK memblokir apa pun: pointer-events hanya aktif di pilnya,
   jadi "tap layar untuk lanjut" tetap bisa dilakukan di area lain
   tanpa lebih dulu menutup hint ini.

   Berbeda dari coach mark: coach mark adalah tur bertahap dengan
   sorotan dan tombol; hint hanya satu kalimat yang lewat. Instruksi
   yang butuh lebih dari satu kalimat TETAP milik coach mark.

   Parameter onDark dipakai saat hint tampil di atas #gate yang gelap. */
var HINT_MS = 3000;

function hint(message, onDark) {
  var host = $('hintHost');
  if (!host || !message) return;

  /* Satu hint pada satu waktu: pesan lama diusir dulu supaya tidak
     menumpuk kalau siswa berpindah layar dengan cepat. */
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

/* Peta instruksi per layar — teks ini DIPINDAHKAN dari objek COACH
   (lihat Revisi R1), bukan ditulis baru. Diperpendek seperlunya agar
   muat satu-dua baris di pil. */
var HINTS = {
  'welcome-1': 'Tap anywhere to continue',
  'welcome-2': 'Tap to see your path',
  'wait-1':    'Wait for your teacher',
  'video':     'Press play when you are ready',
  'wait-2':    'Wait for your teacher'
};
var HINTS_ON_DARK = { 'wait-1': true, 'wait-2': true };

function readKey(key) {
  try {
    var raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function writeKey(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* penuh/diblokir — diamkan */ }
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
  FloatBack.sync();
}

function showPage(id) {
  Array.prototype.forEach.call(document.querySelectorAll('.page'), function (el) { el.hidden = el.id !== id; });
  window.scrollTo({ top: 0 });
}

function shuffled(list) {
  var arr = list.slice();
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  /* jangan pernah mulai dari urutan yang sudah benar */
  if (arr.join() === list.join() && arr.length > 1) { var a = arr[0]; arr[0] = arr[1]; arr[1] = a; }
  return arr;
}

/* ---------------- Router: navigasi Back internal (REVISI #1) ----------------
   Root cause dari tombol Back yang rusak: aplikasi ini berpindah "halaman"
   murni lewat toggle `hidden` (State.page), tidak pernah lewat pushState
   atau hash routing, sehingga tidak ada entry browser-history baru per
   stage. window.history.back() akibatnya keluar dari modul, bukan mundur
   satu langkah di dalamnya.

   Perbaikannya memakai stack navigasi internal (bukan pushState) karena:
   1) Arsitektur SPA ini SUDAH sepenuhnya berbasis state JS + toggle hidden,
      bukan URL — menambah pushState berarti menambah lapisan sinkronisasi
      (popstate listener, serialisasi State yang punya banyak field mutable
      seperti sessionIndex/order/locked/quizIndex) untuk masalah yang bisa
      diselesaikan lebih sederhana.
   2) pushState akan membuat tombol Back kita bentrok dengan tombol back
      NATIVE browser/OS — dengan stack internal, kontrol kita (navBack,
      floatBack, swipe) benar-benar independen dari history asli, jadi
      tidak ada risiko efek samping di history dokumen yang sebenarnya.
   3) Granularitas yang diminta adalah per STAGE (video → activity → quiz →
      hasil), persis unit yang sudah ada di STAGES — stack string sederhana
      sudah cukup, tanpa perlu menyimpan snapshot state penuh per entry.

   Hanya 4 stage konten nyata yang masuk stack: video, activity, quiz,
   result. Gerbang tunggu-guru tidak ikut (bukan tujuan "kembali" yang
   wajar, dan dikontrol guru — lihat Gate.isShown() di bawah), begitu pula
   welcome (nav belum ada di sana). "visited" dipakai untuk membedakan
   MASUK PERTAMA KALI (harus reset/acak ulang via *.start) dari MASUK
   ULANG lewat balik-lalu-maju lagi (harus *.resume, tanpa reset) — supaya
   sesi/soal yang sudah dinilai tidak pernah ternilai dua kali. */
var Router = {
  stack: [],
  visited: {},

  enter: function (stage) {
    if (this.stack[this.stack.length - 1] !== stage) this.stack.push(stage);
    this.visited[stage] = true;
    setPage(stage);
  },

  hasVisited: function (stage) { return !!this.visited[stage]; },
  canGoBack: function () { return this.stack.length > 1; },

  back: function () {
    if (Gate.isShown() || !this.canGoBack()) return;
    this.stack.pop();
    var prev = this.stack[this.stack.length - 1];
    setPage(prev);
    if (prev === 'video') Video.resume();
    else if (prev === 'activity') Activity.resumeCards();
    else if (prev === 'quiz') Quiz.resume();
    else if (prev === 'result') showPage('resultPage');
  }
};

/* ---------------- Navigator ---------------- */
var Nav = {
  init: function () {
    $('navStudent').textContent = this.studentName();
    this.renderLives();
    this.update();

    /* Tambahan T1: path kembali ke hub diperbaiki dari '../home/index.html'
       (folder home/ tidak ada) ke '../index.html', konsisten dengan
       perbaikan yang sama di index.html (#lockedPage, #resultBackBtn,
       .float-back) dan di FloatBack/initSwipeBack di bawah. */
    $('navHome').addEventListener('click', function () { window.location.href = '../index.html'; });
    $('navBack').addEventListener('click', function () {
      if (Gate.isShown()) return;
      if (Router.canGoBack()) Router.back();
      else window.location.href = '../index.html';
    });
    $('navAsk').addEventListener('click', function () { Ask.open(); });
    $('navCoach').addEventListener('click', function () { Coach.open(); });
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

  update: function () {
    var idx = STAGES.indexOf(State.page);
    if (idx < 0) idx = 0;
    $('navProgressFill').style.width = ((idx + 1) / STAGES.length) * 100 + '%';
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
    Gate.hide();
  }
};

/* ---------------- Skor: 10 langkah ---------------- */
var Score = {
  push: function (label, clean) { State.steps.push({ label: label, clean: clean }); },
  clean: function () {
    var n = 0;
    State.steps.forEach(function (s) { if (s.clean) n++; });
    return n;
  },
  stars: function () {
    var pct = (this.clean() / TOTAL_STEPS) * 100;
    if (pct >= 85) return 3;
    if (pct >= 70) return 2;
    if (pct >= 60) return 1;
    return 0;
  },
  save: function () {
    var clean = this.clean();
    writeKey(KEY_SELF, {
      v: 1,
      status: 'completed',
      /* score/maxScore/stars dipertahankan bentuknya (dipetakan dari x/10)
         supaya modul lain yang membaca kunci ini tidak rusak. */
      score: Math.round((clean / TOTAL_STEPS) * LEGACY_MAX_SCORE),
      maxScore: LEGACY_MAX_SCORE,
      stars: this.stars(),
      correct: clean,
      total: TOTAL_STEPS,
      livesUsed: TOTAL_LIVES - State.lives,
      attempts: readAttempt(),
      completedAt: new Date().toISOString()
    });
  }
};

/* ---------------- Gerbang guru: tunggu 1, tunggu 2, nyawa habis ----------------
   TeacherAPI global — platform guru nanti tinggal memanggilnya
   (WebSocket/BroadcastChannel/polling), tanpa membongkar bagian ini. */
var Gate = {
  mode: null, /* 'wait-1' | 'wait-2' | 'lives' */

  show: function (mode, eyebrow, caption) {
    this.mode = mode;
    $('gateEyebrow').textContent = eyebrow;
    $('gateCaption').textContent = caption;
    $('gate').hidden = false;
  },
  hide: function () {
    $('gate').hidden = true;
    this.mode = null;
  },
  isShown: function () { return !$('gate').hidden; },

  waitBeforeVideo: function () {
    this.show('wait-1', 'Wait for your teacher', 'Please pay attention to your teacher and wait for further instructions.');
    setPage('wait-1');
    if (HINTS['wait-1']) hint(HINTS['wait-1'], HINTS_ON_DARK['wait-1']);   /* Revisi R3 */
  },
  waitAfterVideo: function () {
    this.show('wait-2', 'Video finished', 'Please pay attention to your teacher and wait before the activity begins.');
    setPage('wait-2');
    if (HINTS['wait-2']) hint(HINTS['wait-2'], HINTS_ON_DARK['wait-2']);   /* Revisi R3 */
  },
  outOfLives: function () {
    this.show('lives', 'Out of lives', 'All seven lives are used up. Ask your teacher to give them back before you continue.');
  },

  /* Akses guru: lanjut dari layar tunggu yang sedang tampil. */
  release: function () {
    if (this.mode === 'wait-1') {
      var self = this;
      Blackout.cut(function () {
        self.hide();
        Video.start();
      });
      return;
    }
    if (this.mode === 'wait-2') {
      this.hide();
      Activity.start();
      return;
    }
    if (this.mode === 'lives') Nav.restoreLives();
  }
};

var TeacherAPI = {
  release: function () { Gate.release(); },
  restoreLives: function () { Nav.restoreLives(); }
};

/* Potong ke hitam sebentar supaya tidak ada halaman lain yang sempat terlihat. */
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

/* ---------------- Video ---------------- */
var Video = {
  init: function () {
    var el = $('videoEl');
    el.addEventListener('error', function () { $('videoPlate').classList.add('is-empty'); });
    el.addEventListener('ended', function () {
      /* Kalau activity SUDAH pernah dicapai sebelumnya, video ini sedang
         diputar ulang lewat tombol Back (lihat Router) — jangan munculkan
         lagi gerbang tunggu-guru ke-2 (siswa sudah pernah dilepas guru),
         langsung saja kembalikan ke activity persis di kondisi terakhir. */
      if (Router.hasVisited('activity')) {
        Router.enter('activity');
        Activity.resumeCards();
      } else {
        Gate.waitAfterVideo();
      }
    });
  },
  start: function () {
    Router.enter('video');
    showPage('videoPage');
    /* Revisi R1: CoachAuto.maybeOpen('video') DIHAPUS dari sini — coach
       mark otomatis tidak lagi boleh muncul sebelum sesi video
       terlewati. Digantikan hint satu kalimat (Revisi R3). */
    if (HINTS.video) hint(HINTS.video, HINTS_ON_DARK.video);
  },
  /* Ditampilkan lagi lewat tombol Back — video tidak perlu direset apa pun,
     elemen <video> menyimpan posisi putarnya sendiri. */
  resume: function () {
    showPage('videoPage');
  }
};

/* ---------------- Activity: reorder the events ----------------
   REVISI #2: instruksi (act-prompt) & tombol aksinya kini berada di
   halaman TERSENDIRI (#activityIntroPage) sebelum halaman kartu
   interaktif (#activityPage), diterapkan pada keempat sesi — bukan
   cuma sesi pertama. showIntro() menampilkan instruksi + label/dots
   sesi tanpa menyentuh urutan kartu; showCards() barulah mengacak &
   mereset kunci, lalu menampilkan kartunya. */
var Activity = {
  init: function () {
    var self = this;
    $('actIntroContinueBtn').addEventListener('click', function () { self.showCards(); });
    $('actCheckBtn').addEventListener('click', function () { self.check(); });
    $('actContinueBtn').addEventListener('click', function () { self.continueNext(); });
    this.initDrag();
  },

  start: function () {
    Router.enter('activity');
    this.showIntro();
  },

  /* Halaman (a): instruksi sesi ini saja — kartu belum diacak/dirender. */
  showIntro: function () {
    var session = SESSIONS[State.sessionIndex];
    this.renderChrome(session);
    showPage('activityIntroPage');
    window.scrollTo({ top: 0 });
  },

  /* Halaman (b): kartu interaktif — acak baru, kunci direset. Coach mark
     otomatis (REVISI #3) hanya benar-benar terbuka sekali (lihat
     CoachAuto.seen), jadi aman dipanggil di setiap sesi 1–4. */
  showCards: function () {
    var session = SESSIONS[State.sessionIndex];
    State.order = shuffled(session.order);
    State.locked = {};
    State.sessionClean = true;

    this.renderChrome(session);
    $('actNote').hidden = true;
    $('actFeedback').hidden = true;
    $('actCheckBtn').hidden = false;
    $('actContinueBtn').hidden = true;

    this.renderCards();
    showPage('activityPage');
    window.scrollTo({ top: 0 });
    CoachAuto.maybeOpen('activity');
  },

  /* Ditampilkan lagi lewat tombol Back (dari kuis). Satu-satunya jalan
     meninggalkan stage "activity" adalah setelah sesi TERAKHIR selesai
     terkunci, jadi State.order/State.locked yang sedang ada di memori
     sudah pasti mencerminkan itu — cukup dirender ulang, TIDAK diacak
     ulang dan TIDAK menambah skor, supaya 10 langkah tidak pernah
     bertambah dua kali. */
  resumeCards: function () {
    var session = SESSIONS[State.sessionIndex];
    this.renderChrome(session);
    this.renderCards();

    var allLocked = session.order.every(function (id) { return !!State.locked[id]; });
    $('actNote').hidden = true;
    $('actFeedback').hidden = true;
    $('actCheckBtn').hidden = allLocked;
    $('actContinueBtn').hidden = !allLocked;
    if (allLocked) {
      $('actContinueBtn').textContent = State.sessionIndex < SESSION_COUNT - 1 ? 'Next session' : 'Continue to the quiz';
    }
    showPage('activityPage');
  },

  /* Label sesi & dots dipakai di DUA halaman (intro & kartu) — disatukan
     di sini supaya keduanya selalu sinkron dan logikanya tidak dobel. */
  renderChrome: function (session) {
    $('actLabel').textContent = session.label;
    $('actIntroLabel').textContent = session.label;
    [$('actDots'), $('actIntroDots')].forEach(function (dots) {
      dots.innerHTML = '';
      for (var i = 0; i < SESSION_COUNT; i++) {
        var d = document.createElement('span');
        d.className = 'dot' + (i < State.sessionIndex ? ' is-done' : i === State.sessionIndex ? ' is-now' : '');
        dots.appendChild(d);
      }
    });
  },

  renderCards: function () {
    var session = SESSIONS[State.sessionIndex];
    var list = $('actCards');
    list.innerHTML = '';
    var self = this;

    State.order.forEach(function (id, i) {
      var row = document.createElement('li');
      row.className = 'card-row' + (State.locked[id] ? ' is-locked' : '');
      row.setAttribute('data-id', id);

      var grip = document.createElement('span');
      grip.className = 'card-grip';
      grip.setAttribute('aria-hidden', 'true');
      grip.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.7"/><circle cx="15" cy="5" r="1.7"/><circle cx="9" cy="12" r="1.7"/><circle cx="15" cy="12" r="1.7"/><circle cx="9" cy="19" r="1.7"/><circle cx="15" cy="19" r="1.7"/></svg>';
      row.appendChild(grip);

      var order = document.createElement('span');
      order.className = 'card-order';
      order.textContent = String(i + 1);
      row.appendChild(order);

      var text = document.createElement('span');
      text.className = 'card-text';
      text.textContent = session.cards[id];
      row.appendChild(text);

      var moves = document.createElement('span');
      moves.className = 'card-moves';
      var up = document.createElement('button');
      up.type = 'button';
      up.className = 'card-move';
      up.textContent = '▲';
      up.setAttribute('aria-label', 'Move up: ' + session.cards[id]);
      up.disabled = i === 0;
      up.addEventListener('click', function () { self.move(id, -1); });
      var down = document.createElement('button');
      down.type = 'button';
      down.className = 'card-move';
      down.textContent = '▼';
      down.setAttribute('aria-label', 'Move down: ' + session.cards[id]);
      down.disabled = i === State.order.length - 1;
      down.addEventListener('click', function () { self.move(id, 1); });
      moves.appendChild(up);
      moves.appendChild(down);
      row.appendChild(moves);

      list.appendChild(row);
    });
  },

  move: function (id, delta) {
    if (State.locked[id]) return;
    var from = State.order.indexOf(id);
    var to = from + delta;
    if (to < 0 || to >= State.order.length) return;
    if (State.locked[State.order[to]]) return; /* jangan tukar dengan kartu terkunci */
    State.order.splice(from, 1);
    State.order.splice(to, 0, id);
    this.renderCards();
  },

  /* Drag lewat pointer events: pegang grip, geser, baris disusun ulang
     saat pointer melewati tengah baris lain. */
  initDrag: function () {
    var list = $('actCards');
    var self = this;
    var dragId = null;

    list.addEventListener('pointerdown', function (e) {
      var grip = e.target.closest ? e.target.closest('.card-grip') : null;
      if (!grip) return;
      var row = grip.closest('.card-row');
      if (!row || row.classList.contains('is-locked')) return;
      dragId = row.getAttribute('data-id');
      row.classList.add('is-dragging');
      /* Revisi R7: zona geser dimatikan selama kartu sedang diseret,
         supaya seretan yang dimulai dekat tepi layar tidak salah
         terbaca sebagai gestur mundur. Dihidupkan lagi di endDrag(). */
      document.body.classList.toggle('is-dragging-card', true);
      /* Revisi R7: getaran singkat saat kartu diangkat — dibungkus
         pemeriksaan karena tidak semua peranti mendukungnya, dan gagal
         di sini tidak boleh menghentikan seretan. Sengaja hanya SEKALI
         di sini (saat pengangkatan dimulai), bukan di setiap gerakan. */
      if (navigator.vibrate) { try { navigator.vibrate(10); } catch (e) {} }
      grip.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    list.addEventListener('pointermove', function (e) {
      if (!dragId) return;
      var rows = list.querySelectorAll('.card-row');
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var id = r.getAttribute('data-id');
        if (id === dragId || State.locked[id]) continue;
        var box = r.getBoundingClientRect();
        if (e.clientY > box.top && e.clientY < box.bottom) {
          var target = State.order.indexOf(id);
          var current = State.order.indexOf(dragId);
          if (target !== current) {
            State.order.splice(current, 1);
            State.order.splice(target, 0, dragId);
            self.renderCards();
            var moved = list.querySelector('.card-row[data-id="' + dragId + '"]');
            if (moved) moved.classList.add('is-dragging');
          }
          break;
        }
      }
    });

    function endDrag() {
      if (!dragId) return;
      var row = list.querySelector('.card-row[data-id="' + dragId + '"]');
      if (row) row.classList.remove('is-dragging');
      document.body.classList.toggle('is-dragging-card', false);   /* Revisi R7 */
      dragId = null;
    }
    list.addEventListener('pointerup', endDrag);
    list.addEventListener('pointercancel', endDrag);
  },

  check: function () {
    if (Gate.isShown()) return;
    var session = SESSIONS[State.sessionIndex];
    var feedback = $('actFeedback');
    var wrong = 0;

    State.order.forEach(function (id, i) {
      if (session.order[i] === id) State.locked[id] = true;
      else wrong++;
    });
    this.renderCards();

    if (wrong > 0) {
      State.sessionClean = false;
      feedback.hidden = false;
      feedback.className = 'feedback is-bad';
      feedback.textContent = wrong === 1
        ? 'One card is still out of place. The rest are locked in — try again.'
        : wrong + ' cards are still out of place. The correct ones are locked in — try again.';
      Nav.loseLife();
      return;
    }

    Score.push(session.label.split(' · ')[0], State.sessionClean);
    feedback.hidden = false;
    feedback.className = 'feedback is-good';
    feedback.textContent = session.done;
    $('actCheckBtn').hidden = true;
    $('actContinueBtn').hidden = false;
    $('actContinueBtn').textContent = State.sessionIndex < SESSION_COUNT - 1 ? 'Next session' : 'Continue to the quiz';
  },

  continueNext: function () {
    if (State.sessionIndex < SESSION_COUNT - 1) {
      State.sessionIndex++;
      this.showIntro();
    } else if (Router.hasVisited('quiz')) {
      /* Kuis sudah pernah dimulai sebelumnya (pengguna sempat menekan Back
         ke activity, lalu maju lagi) — lanjutkan tanpa mengulang dari soal
         1, supaya skor/log kuis tidak tercatat dua kali. */
      Router.enter('quiz');
      Quiz.resume();
    } else {
      Quiz.start();
    }
  }
};

/* ---------------- Quiz ---------------- */
var Quiz = {
  init: function () {
    var self = this;
    $('quizNextBtn').addEventListener('click', function () {
      State.quizIndex++;
      if (State.quizIndex >= QUIZ_COUNT) Result.show();
      else self.render();
    });
  },

  start: function () {
    Router.enter('quiz');
    showPage('quizPage');
    State.quizIndex = 0;
    this.render();
    CoachAuto.maybeOpen('quiz');
  },

  render: function () {
    State.quizClean = true;
    var q = QUIZ[State.quizIndex];
    $('quizLabel').textContent = 'Question ' + (State.quizIndex + 1) + ' of ' + QUIZ_COUNT;
    $('quizQuestion').textContent = q.question;
    $('quizFeedback').hidden = true;
    $('quizNextBtn').hidden = true;

    var dots = $('quizDots');
    dots.innerHTML = '';
    for (var i = 0; i < QUIZ_COUNT; i++) {
      var d = document.createElement('span');
      d.className = 'dot' + (i < State.quizIndex ? ' is-done' : i === State.quizIndex ? ' is-now' : '');
      dots.appendChild(d);
    }

    var box = $('quizOptions');
    box.innerHTML = '';
    var self = this;
    var keys = ['A', 'B', 'C', 'D'];
    q.options.forEach(function (text, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option';
      btn.setAttribute('data-index', String(i));
      btn.innerHTML = '<span class="option-key">' + keys[i] + '</span><span></span>';
      btn.lastChild.textContent = text;
      btn.addEventListener('click', function () { self.answer(i, btn); });
      box.appendChild(btn);
    });
    window.scrollTo({ top: 0 });
  },

  answer: function (index, btn) {
    if (Gate.isShown()) return;
    var q = QUIZ[State.quizIndex];
    var feedback = $('quizFeedback');

    if (index !== q.answer) {
      State.quizClean = false;
      btn.classList.add('is-wrong');
      btn.disabled = true;
      feedback.hidden = false;
      feedback.className = 'feedback is-bad';
      feedback.textContent = 'Not that one. Read the question again and try another answer.';
      Nav.loseLife();
      return;
    }

    btn.classList.add('is-correct');
    Array.prototype.forEach.call($('quizOptions').querySelectorAll('.option'), function (b) { b.disabled = true; });
    feedback.hidden = false;
    feedback.className = 'feedback is-good';
    feedback.textContent = q.feedback;

    State.quizLog.push({ index: State.quizIndex, clean: State.quizClean });
    Score.push('Question ' + (State.quizIndex + 1), State.quizClean);

    $('quizNextBtn').hidden = false;
    $('quizNextBtn').textContent = State.quizIndex < QUIZ_COUNT - 1 ? 'Next question' : 'See your result';
  },

  /* Ditampilkan lagi lewat tombol Back (dari hasil). Satu-satunya jalan
     meninggalkan stage "quiz" adalah setelah soal TERAKHIR terjawab
     benar, jadi di sini cukup dibangun ulang tampilan dasarnya lewat
     render() lalu ditumpuk keadaan "sudah terjawab" di atasnya — tanpa
     memanggil Score.push/quizLog.push lagi.

     Catatan off-by-one: klik "See your result" pada soal terakhir
     men-INCREMENT State.quizIndex dari 5 ke 6 (di luar batas array
     QUIZ) SEBELUM memanggil Result.show() (lihat listener quizNextBtn
     di init()) — jadi begitu kembali ke sini quizIndex perlu dijepit
     dulu ke soal valid terakhir sebelum dipakai me-render apa pun. */
  resume: function () {
    if (State.quizIndex >= QUIZ_COUNT) State.quizIndex = QUIZ_COUNT - 1;
    this.render();
    var q = QUIZ[State.quizIndex];
    var entry = null;
    State.quizLog.forEach(function (e) { if (e.index === State.quizIndex) entry = e; });
    if (!entry) { showPage('quizPage'); return; }

    Array.prototype.forEach.call($('quizOptions').querySelectorAll('.option'), function (b, i) {
      b.disabled = true;
      if (i === q.answer) b.classList.add('is-correct');
    });
    var feedback = $('quizFeedback');
    feedback.hidden = false;
    feedback.className = 'feedback is-good';
    feedback.textContent = q.feedback;
    $('quizNextBtn').hidden = false;
    $('quizNextBtn').textContent = 'See your result';
    showPage('quizPage');
  }
};

/* ---------------- Result ---------------- */
var Result = {
  /* Listener tombol "Back to the hill map" dipindah ke init() (dipanggil
     sekali saat startup) alih-alih di dalam show() — sebab show() kini
     BISA terpanggil lebih dari sekali (mis. kuis←balik←activity←maju lagi
     akan lewat sini lagi), dan kalau listener-nya ada di show() dia akan
     ter-attach berulang setiap kunjungan. */
  init: function () {
    $('resultBackBtn').addEventListener('click', function () {
      $('transitionOverlay').classList.add('is-active');
    });
  },

  show: function () {
    Router.enter('result');
    showPage('resultPage');
    Score.save();
    $('resultPage').setAttribute('data-student', Nav.studentName());   /* Tambahan T3: dibaca oleh @media print */

    var clean = Score.clean();
    $('resultScore').innerHTML =
      '<div><dt>Clean steps</dt><dd>' + clean + '/' + TOTAL_STEPS + '</dd></div>' +
      '<div><dt>Lives left</dt><dd>' + State.lives + '/' + TOTAL_LIVES + '</dd></div>' +
      '<div><dt>Attempt</dt><dd>' + readAttempt() + '</dd></div>';

    var steps = $('resultSteps');
    steps.innerHTML = '';
    State.steps.forEach(function (s, i) {
      var li = document.createElement('li');
      li.className = 'step-item';
      var n = document.createElement('span');
      n.textContent = (i + 1) < 10 ? '0' + (i + 1) : String(i + 1);
      var label = document.createElement('span');
      label.textContent = s.label;
      var mark = document.createElement('span');
      mark.className = 'step-mark ' + (s.clean ? 'is-good' : 'is-bad');
      mark.textContent = s.clean ? 'first try' : 'retried';
      li.appendChild(n);
      li.appendChild(label);
      li.appendChild(mark);
      steps.appendChild(li);
    });

    var answers = $('resultAnswers');
    answers.innerHTML = '';
    State.quizLog.forEach(function (entry) {
      var q = QUIZ[entry.index];
      var li = document.createElement('li');
      li.className = 'answer-item';
      var qEl = document.createElement('p');
      qEl.className = 'answer-q';
      qEl.textContent = (entry.index + 1) + '. ' + q.question;
      var right = document.createElement('p');
      right.className = 'answer-right';
      right.textContent = 'Correct answer: ' + q.options[q.answer];
      var yours = document.createElement('p');
      yours.className = 'answer-yours';
      yours.textContent = entry.clean ? 'You had it on the first try.' : 'You found it after another try.';
      li.appendChild(qEl);
      li.appendChild(right);
      li.appendChild(yours);
      answers.appendChild(li);
    });

    var recap = $('resultRecap');
    recap.innerHTML = '';
    RECAP.forEach(function (text) {
      var li = document.createElement('li');
      li.textContent = text;
      recap.appendChild(li);
    });

    CoachAuto.maybeOpen('result');
  }
};

/* Tombol back mengambang sembunyi saat gerbang tampil / app belum siap. */
var FloatBack = {
  /* #floatBack sebelumnya adalah <a href="../home/index.html"> polos TANPA
     listener JS sama sekali — artinya setiap klik SELALU keluar modul,
     tidak pernah mundur satu stage. init() ini menambahkan penanganan
     klik yang sama seperti #navBack: mundur lewat Router kalau bisa,
     kalau tidak baru biarkan href aslinya membawa ke hill map (Tambahan
     T1: href itu sendiri sudah diperbaiki di index.html, dari
     "../home/index.html" yang foldernya tidak ada, menjadi "../index.html"). */
  init: function () {
    $('floatBack').addEventListener('click', function (e) {
      if (Gate.isShown()) { e.preventDefault(); return; }
      if (Router.canGoBack()) {
        e.preventDefault();
        Router.back();
      }
      /* else: tidak ada apa-apa untuk di-preventDefault — biarkan href
         asli jalan ke ../index.html (Tambahan T1), sama seperti fallback
         #navBack. */
    });
  },
  sync: function () {
    var hide = Gate.isShown() || $('appShell').hidden;
    $('floatBack').classList.toggle('is-hidden', hide);
  }
};

/* ---------------- Swipe-back (gaya Android) ---------------- */
function initSwipeBack() {
  var MIN = 60;
  var start = null;
  var side = null;

  Array.prototype.forEach.call(document.querySelectorAll('.swipe-zone'), function (zone) {
    zone.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { start = null; return; }
      start = e.touches[0].clientX;
      side = zone.getAttribute('data-swipe');
    }, { passive: true });

    zone.addEventListener('touchend', function (e) {
      if (start === null) return;
      var dx = e.changedTouches[0].clientX - start;
      var inward = side === 'left' ? dx > MIN : dx < -MIN;
      start = null;
      if (!inward || Gate.isShown()) return;
      if (Router.canGoBack()) Router.back();
      else window.location.href = '../index.html';   /* Tambahan T1 */
    }, { passive: true });
  });
}

/* ---------------- Ask a question ---------------- */
var Ask = {
  init: function () {
    var self = this;
    $('askCancel').addEventListener('click', function () { self.close(); });
    $('askSend').addEventListener('click', function () { self.send(); });
  },
  open: function () {
    $('askPanel').hidden = false;
    $('askNote').textContent = 'Your teacher will see this on their own screen.';
    $('askText').focus();
  },
  close: function () { $('askPanel').hidden = true; },
  send: function () {
    var text = $('askText').value.trim();
    if (!text) { $('askNote').textContent = 'Write your question first, then send.'; return; }
    var list = readKey('nl_questions_v1');
    if (!Array.isArray(list)) list = [];
    list.push({ module: 'lake_muara', page: State.page, text: text, at: new Date().toISOString() });
    writeKey('nl_questions_v1', list);
    $('askText').value = '';
    $('askNote').textContent = 'Sent. Your teacher will answer soon.';
    setTimeout(function () { Ask.close(); }, 1100);
  }
};

/* ---------------- Coach mark ----------------
   REVISI #3 — audit target null: quiz mempertahankan satu step tanpa
   target sebab isinya tentang halaman BERIKUTNYA (tidak ada elemen
   valid di halaman ini untuk disorot); activity sudah lengkap
   targetnya sejak semula. "result" dipecah dari 1 step jadi 3 supaya
   tiap kalimat menyorot elemen yang benar-benar dibicarakannya
   (skor+nyawa / daftar langkah / daftar jawaban — sebelumnya ketiganya
   digabung tapi cuma menyorot satu elemen).

   Revisi R1 — kunci 'welcome-1', 'welcome-2', 'wait-1', video, dan
   'wait-2' yang dulu ada di sini sudah DIPINDAHKAN, bukan dihapus:
   teksnya kini hidup di peta HINTS (dekat helper hint(), atas file
   ini), sebab layar-layar itu tidak pernah bisa menampilkan overlay
   coach mark ini sama sekali — #coachOverlay ada di dalam #appShell
   yang masih tersembunyi selama welcome & gerbang tunggu. COACH
   sekarang hanya berisi tahap yang diizinkan AUTO_COACH_STAGES (lihat
   CoachAuto, di bawah): activity, quiz, result. */
var COACH = {
  activity: [
    { text: 'A set of story cards appears, shuffled out of order.', target: '#actCards' },
    { text: 'Drag a row by the six-dot grip until the events run in the order they happened.', target: '.card-grip' },
    { text: 'Or tap the ▲▼ buttons instead to move a row up or down.', target: '.card-moves' },
    { text: 'Tap “Check order” — rows already in the right place lock instantly; the rest can still be moved.', target: '#actCheckBtn' },
    { text: 'Four sessions run from easy to hard. A wrong check costs one life.', target: '#actDots' },
    { text: 'These same lives carry into the quiz, so spend them carefully.', target: '#navHearts' }
  ],
  quiz: [
    { text: 'One question at a time, six in total.', target: '#quizDots' },
    { text: 'A wrong answer costs one life and stays crossed out — you can still find the right one.', target: '#quizOptions' },
    { text: 'At the end you get a summary of every step and every answer.', target: null }
  ],
  result: [
    { text: 'Your ten steps and remaining lives are summed up here.', target: '#resultScore' },
    { text: 'Every one of your ten steps is listed here, in order.', target: '#resultSteps' },
    { text: 'And here is each quiz question with its correct answer.', target: '#resultAnswers' }
  ]
};

/* ---------------- Coach mark otomatis (REVISI #3 / Revisi R1) ----------------
   Terbuka sendiri saat pertama kali masuk ke halaman yang butuh
   tutorial. Sejak Revisi R1, aturan projek-lebar berlaku di sini:
   tur ini HANYA boleh mulai otomatis SETELAH siswa melewati sesi
   video — welcome-1, welcome-2, wait-1, video, dan wait-2 tidak lagi
   memakai coach mark sama sekali, instruksinya sudah dipindahkan ke
   komponen hint (lihat peta HINTS dekat helper hint(), atas file
   ini). Ini sekaligus mengubah sesuatu yang dulu cuma "kebetulan
   struktur DOM" (welcome-1/welcome-2 memang tidak bisa menampilkan
   #coachOverlay karena berada di dalam #appShell yang masih
   tersembunyi) menjadi ATURAN eksplisit lewat AUTO_COACH_STAGES di
   bawah — supaya kalau nanti #appShell atau markup welcome berubah,
   perilakunya tidak diam-diam kembali seperti semula.
   "seen" memastikan tiap halaman hanya otomatis terbuka SEKALI per
   sesi belajar (mis. activity tidak terbuka lagi di sesi 2–4) — tombol
   navCoach tetap bisa membuka ulang kapan pun secara manual, terlepas
   dari flag ini. "enabled" dikendalikan lewat toggle di panel developer. */
/* Revisi R1: daftar tahap yang boleh membuka tur SENDIRI. Sengaja
   ditulis eksplisit, bukan hanya mengandalkan absennya kunci di COACH,
   supaya kalau nanti seseorang menambahkan entri COACH untuk welcome
   atau video, tur itu tetap tidak akan terbuka otomatis. Aturannya:
   coach mark otomatis baru boleh mulai SETELAH sesi video terlewati,
   seragam dengan enam platform lain. */
var AUTO_COACH_STAGES = ['activity', 'quiz', 'result'];

var CoachAuto = {
  enabled: true,
  seen: {},
  maybeOpen: function (page) {
    if (!this.enabled) return;
    if (AUTO_COACH_STAGES.indexOf(page) === -1) return;   /* Revisi R1 */
    if (this.seen[page] || !COACH[page]) return;
    this.seen[page] = true;
    Coach.open(page);
  }
};

var Coach = {
  steps: [],
  index: 0,
  _reposition: null,

  init: function () {
    var self = this;
    $('coachNext').addEventListener('click', function () { self.next(); });
    $('coachClose').addEventListener('click', function () { self.close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !$('coachOverlay').hidden) self.close();
    });
  },

  open: function (forcePage) {
    this.steps = COACH[forcePage || State.page] || [{ text: 'Nothing to explain on this screen yet.', target: null }];
    this.index = 0;
    $('coachOverlay').hidden = false;
    $('navCoach').classList.add('is-on');
    this.render();

    var self = this;
    this._reposition = function () { self.position(); };
    window.addEventListener('resize', this._reposition);
    window.addEventListener('scroll', this._reposition);

    $('coachCallout').focus();
  },

  render: function () {
    var step = this.steps[this.index];
    $('coachStep').textContent = 'Step ' + (this.index + 1) + ' of ' + this.steps.length;
    $('coachText').textContent = step.text;
    $('coachNext').textContent = this.index === this.steps.length - 1 ? 'Got it' : 'Continue';
    this.position();
  },

  /* Sorot elemen target: .coach-hole digelapkan-di-sekitarnya lewat box-shadow,
     .coach-callout ditaruh di ruang kosong terdekat (bawah, atau atas kalau
     tidak muat). target null atau elemen yang belum ada di DOM → perlakukan
     sama, callout di tengah layar tanpa sorotan. */
  position: function () {
    var step = this.steps[this.index];
    var hole = $('coachHole');
    var callout = $('coachCallout');
    var target = step && step.target ? document.querySelector(step.target) : null;

    if (!target) {
      hole.classList.add('is-hidden');
      callout.style.cssText = 'top:50%; left:50%; transform:translate(-50%,-50%);';
      return;
    }

    hole.classList.remove('is-hidden');
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });

    requestAnimationFrame(function () {
      var r = target.getBoundingClientRect();
      var pad = 6;
      hole.style.top = (r.top - pad) + 'px';
      hole.style.left = (r.left - pad) + 'px';
      hole.style.width = (r.width + pad * 2) + 'px';
      hole.style.height = (r.height + pad * 2) + 'px';

      var cRect = callout.getBoundingClientRect();
      var below = window.innerHeight - r.bottom > cRect.height + 20;
      callout.style.top = (below ? r.bottom + 14 : r.top - cRect.height - 14) + 'px';
      callout.style.left = Math.min(Math.max(r.left, 12), window.innerWidth - cRect.width - 12) + 'px';
      callout.style.transform = 'none';
    });
  },

  next: function () {
    if (this.index < this.steps.length - 1) { this.index++; this.render(); }
    else this.close();
  },

  close: function () {
    $('coachOverlay').hidden = true;
    $('navCoach').classList.remove('is-on');
    if (this._reposition) {
      window.removeEventListener('resize', this._reposition);
      window.removeEventListener('scroll', this._reposition);
      this._reposition = null;
    }
  }
};

/* ---------------- Welcome ---------------- */
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

function initWelcome(onDone) {
  var w1 = $('welcome1');
  var w2 = $('welcome2');
  if (!w1 || !w2) { onDone(); return; }

  Array.prototype.forEach.call(document.querySelectorAll('.welcome-bg'), function (img) {
    img.addEventListener('error', function () { img.style.display = 'none'; });
  });
  var plateImg = $('welcome2Image');
  if (plateImg) {
    plateImg.addEventListener('error', function () { plateImg.closest('.plate').classList.add('is-empty'); });
  }

  var step1Done = false;
  onTap(w1, function () {   /* Revisi R6: click -> onTap */
    if (step1Done) return;
    step1Done = true;
    w1.hidden = true;
    w2.hidden = false;
    if (HINTS['welcome-2']) hint(HINTS['welcome-2']);   /* Revisi R3 */
    setPage('welcome-2');
  });

  var roadmapShown = false;
  var step2Done = false;
  onTap(w2, function () {   /* Revisi R6: click -> onTap */
    if (step2Done) return;
    if (!roadmapShown) {
      roadmapShown = true;
      $('welcome2Intro').hidden = true;
      var roadmap = $('welcome2Roadmap');
      roadmap.hidden = false;
      $('welcome2Tap').textContent = 'tap to start the lesson';
      hint('Tap again to start');   /* Revisi R3 */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { roadmap.classList.add('is-visible'); });
      });
      return;
    }
    step2Done = true;
    w2.hidden = true;
    onDone();
  });
}

/* ============================================================
   MODE PENGEMBANG — hapus fungsi-fungsi ini beserta panelnya di
   HTML/CSS sebelum launching.
   ============================================================ */
function initDevPanel() {
  var panel = $('devPanel');
  var btn = $('devAnswer');
  if (!panel || !btn) return;
  panel.hidden = false;

  function flashEmpty() {
    btn.classList.add('is-empty');
    setTimeout(function () { btn.classList.remove('is-empty'); }, 400);
  }

  btn.addEventListener('click', function () {
    /* Satu langkah per klik, urut dari gerbang paling depan. */
    if (Gate.isShown()) { TeacherAPI.release(); return; }

    if (!$('videoPage').hidden) {
      /* Cerminan persis logika 'ended' asli di Video.init — kalau activity
         sudah pernah dicapai (video ini sedang diputar ulang lewat Back),
         jangan munculkan lagi gerbang tunggu-guru ke-2. */
      if (Router.hasVisited('activity')) { Router.enter('activity'); Activity.resumeCards(); }
      else { Gate.waitAfterVideo(); }
      return;
    }

    if (!$('activityIntroPage').hidden) { $('actIntroContinueBtn').click(); return; }

    if (!$('activityPage').hidden) {
      if (!$('actContinueBtn').hidden) { $('actContinueBtn').click(); return; }
      State.order = SESSIONS[State.sessionIndex].order.slice();
      Activity.renderCards();
      Activity.check();
      return;
    }

    if (!$('quizPage').hidden) {
      if (!$('quizNextBtn').hidden) { $('quizNextBtn').click(); return; }
      var q = QUIZ[State.quizIndex];
      var target = $('quizOptions').querySelector('.option[data-index="' + q.answer + '"]');
      if (target && !target.disabled) { target.click(); return; }
    }

    flashEmpty();
  });
}

/* REVISI #4 — tombol kedua di panel developer: toggle on/off untuk
   CoachAuto.enabled (dipakai oleh coach mark otomatis di REVISI #3).
   Ikon dipinjam dari #navCoach (lingkaran + kilau) supaya jelas
   tombol ini soal coach mark; saat nonaktif ikon dicoret + latar
   abu-abu, meniru gaya .dev-btn.is-empty yang sudah ada di tombol
   sebelah untuk state "kosong/nonaktif". */
function initDevCoachToggle() {
  var btn = $('devCoachToggle');
  if (!btn) return;

  function icon(off) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>' +
      (off ? '<path d="M5 5l14 14"/>' : '') +
      '</svg>';
  }

  function render() {
    var off = !CoachAuto.enabled;
    btn.innerHTML = icon(off);
    btn.classList.toggle('is-off', off);
    btn.setAttribute('aria-pressed', String(!off));
    var label = off ? 'Turn automatic coach mark on' : 'Turn automatic coach mark off';
    btn.title = label;
    btn.setAttribute('aria-label', label);
  }

  btn.addEventListener('click', function () {
    CoachAuto.enabled = !CoachAuto.enabled;
    render();
  });

  render();
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

  panel.addEventListener('click', function (e) {
    if (dragged) { e.preventDefault(); e.stopImmediatePropagation(); dragged = false; }
  }, true);
}

/* Digeneralisasi supaya menangani KEDUA tombol dev (bukan cuma devAnswer
   seperti semula) — posisi tooltip selalu dihitung dari tombol yang
   sedang di-hover/focus itu sendiri, jadi otomatis pas untuk tombol
   kiri maupun kanan di panel persegi panjang yang baru. */
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

  function wire(btn, getText) {
    if (!btn) return;
    btn.addEventListener('mouseenter', function () { clearTimeout(timer); timer = setTimeout(function () { place(btn, getText()); }, 300); });
    btn.addEventListener('mouseleave', hide);
    btn.addEventListener('focus', function () { place(btn, getText()); });
    btn.addEventListener('blur', hide);
  }

  wire($('devAnswer'), function () { return '(' + State.page + ')'; });
  wire($('devCoachToggle'), function () { return CoachAuto.enabled ? 'Coach mark: auto ON' : 'Coach mark: auto OFF'; });
}
/* ====================== AKHIR MODE PENGEMBANG ====================== */

/* ---------------- Inisialisasi ---------------- */
(function init() {
  var prereq = readKey(KEY_PREREQ);

  if (!DEV_MODE && (!prereq || prereq.status !== 'completed')) {
    $('lockedPage').hidden = false;
    return;
  }

  if (DEV_MODE) { initDevPanel(); initDevCoachToggle(); initDevDrag(); initDevTooltip(); }
  initSwipeBack();

  function startSession() {
    $('appShell').hidden = false;
    Nav.init();
    Video.init();
    Activity.init();
    Quiz.init();
    Result.init();
    Ask.init();
    Coach.init();
    FloatBack.init();
    Gate.waitBeforeVideo();
    FloatBack.sync();
  }

  $('welcome1').hidden = false;
  if (HINTS['welcome-1']) hint(HINTS['welcome-1']);   /* Revisi R3 */
  setPage('welcome-1');
  FloatBack.sync();
  initWelcome(startSession);
})();