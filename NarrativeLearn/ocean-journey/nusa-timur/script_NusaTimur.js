/* ============================================================
   Nusa Timur — NarrativeLearn  (re-design)
   /ocean-journey/nusa-timur/

   Alur: locked → welcome 1 → welcome 2 → tunggu guru → video →
   tunggu guru → materi cerita (baca dulu, tanpa tap) → Activity 1
   (enam penanda waktu, teks yang sama jadi interaktif) → Activity 2
   (Who Says It?, satu kutipan per layar) → Activity 3 (kuis 7 soal)
   → hasil. Tombol back (& swipe tepi layar) punya riwayat stage
   sendiri di State.history — lihat bagian "Back & edge-swipe".

   Penilaian: 19 langkah = 6 penanda + 6 kutipan + 7 soal.
   Benar tanpa salah = 1 langkah. Setelah DUA kali salah pada langkah
   yang sama, jawaban benar ditunjukkan dan langkah itu dihitung
   SETENGAH (0.5). Tidak ada lulus/gagal.
   Di Activity 1, "dua kali salah" berarti satu penanda yang belum
   ditemukan langsung ditandai dan dihitung setengah.
   Nyawa: 7 — setiap jawaban salah mengurangi satu. Habis → layar
   tunggu guru; guru yang memulihkan.

   Kunci localStorage (kontrak lintas modul, tidak berubah):
     oj_barat_v1 — prasyarat
     oj_timur_v1 — {v,status,score,maxScore,stars,correct,total,livesUsed,attempts,completedAt}
     nl_student_v1, nl_questions_v1
     oj_timur_attempt_temp — sessionStorage
   ============================================================ */

/* ============================================================
   ⚠️ MODE PENGEMBANG — HAPUS SEBELUM LAUNCHING
   Kotak kiri (hijau) = meloloskan SATU langkah yang tampil.
   Kotak kanan = toggle ON/OFF coach mark otomatis (poin 3), untuk QA.
   ============================================================ */
var DEV_MODE = true;
/* ====================== AKHIR CATATAN ATAS ====================== */

var KEY_PREREQ = 'oj_barat_v1';
var KEY_SELF = 'oj_timur_v1';
var KEY_STUDENT = 'nl_student_v1';
var KEY_ATTEMPT = 'oj_timur_attempt_temp';

var TOTAL_LIVES = 7;
var REVEAL_AFTER_WRONG = 2;

/* ---------------- Cerita + penanda waktu (teks resmi, jangan diubah) ----------------
   `targets` = frasa penanda waktu di paragraf itu, urut baca. */
var STORY_PARAGRAPHS = [
  {
    text: 'Near the coast of Jayakarta Province, there were three small islands: Nusa Barat, Nusa Timur, and Nusa Selatan. Thick mangrove forests grew around the islands. The mangrove forest looked like a green belt that hugged the beach. Most people there were fishermen and coconut farmers. On Nusa Barat, there lived a brother and a sister, Sagara and Mutiara. Every afternoon, they played on the beach and watched the mangrove roots. The roots held the mud like giant fingers.',
    targets: []
  },
  {
    text: 'The people of the three islands respected Grandpa Bahri. He was the oldest man on Nusa Barat, and he knew the most about mangroves. "These mangroves are our fence," Grandpa Bahri said one afternoon to Sagara and Mutiara. "Their roots hold the waves. They keep the beach soil safe." For many years, life on the three islands was calm. Big waves from the open sea always broke first in the mangrove forest before they came to the houses.',
    targets: ['For many years']
  },
  {
    text: 'But in the last few years, things started to change. On Nusa Timur, some people cut the mangroves to make charcoal, because mangrove charcoal sold well in the city. On Nusa Selatan, other people cut the mangrove forest to make shrimp and fish ponds. Little by little, the green belt around the three islands became thinner. Grandpa Bahri warned the people many times, but many people thought the mangrove forest was still big enough.',
    targets: ['in the last few years']
  },
  {
    text: 'One day, the east wind season came, stronger than before. Big waves rolled to the three islands. On the beaches with no mangroves, there were no roots to break the waves. The sea water hit the beach directly. Day after day, the waves took away the sand and land from the beach, and it washed into the sea — this is called abrasion. The beach line slowly moved back, and some coconut trees near the beach fell down because the water took the soil away.',
    targets: ['One day', 'Day after day']
  },
  {
    text: 'The damage did not stop there. Big waves broke the pond walls on Nusa Selatan, so the new shrimp and fish ponds were destroyed by the sea water. In some villages, sea water went into the wells. The well water became brackish — a little salty and not good to drink. The houses closest to the beach were in danger every time the sea rose. Finally, the people of the three islands understood: their fence was gone.',
    targets: []
  },
  {
    text: 'Grandpa Bahri called the people from the three islands to a meeting at the Nusa Barat hall. "The waves did not change. We changed," he said slowly. "Before, the mangrove roots held the waves and kept the coast safe. If we cut all the mangroves, the waves come straight to our houses." Mutiara raised her hand and asked, "But Grandpa, what about the people who need charcoal and fish ponds?"',
    targets: []
  },
  {
    text: 'The people answered that question together in the meeting. The people of Nusa Timur agreed to stop cutting mangroves for charcoal. They made charcoal from coconut shells instead, because there were many coconuts on the three islands, and people usually threw the shells away. The people of Nusa Selatan agreed to move their ponds far from the beach, so they could plant mangroves again along the coast as a fence for the ponds and the villages. Everyone, including children like Sagara and Mutiara, planted thousands of mangrove seedlings along the damaged beach.',
    targets: []
  },
  {
    text: 'A few months later, the seedlings started to grow. Their young roots slowly held the beach mud. It would take many years for the green belt to become thick again, but now the people of the three islands protected it together. One afternoon, Grandpa Bahri stood on the beach with Sagara and Mutiara. He looked far at the hills on the mainland of Jayakarta. "Remember, children," he said, "it is the same on land. If people cut the trees on the hills, the waves will not come — but the land will come down."',
    targets: ['A few months later', 'One afternoon']
  }
];

/* Pengecoh yang tetap bisa diketuk: menyebut waktu, tapi bukan penanda urutan. */
var MARKER_DECOYS = ['Every afternoon', 'one afternoon', 'many times', 'every time', 'Finally', 'slowly'];

var TIME_MARKERS = [];
STORY_PARAGRAPHS.forEach(function (p) {
  p.targets.forEach(function (t) { TIME_MARKERS.push(t); });
});
var TOTAL_MARKERS = TIME_MARKERS.length; /* 6 */

/* ---------------- Activity 2: Who Says It? ---------------- */
var SPEAKERS = ['Grandpa Bahri', 'Mutiara', 'The people of Nusa Timur', 'The people of Nusa Selatan'];

var QUOTES = [
  {
    text: '“These mangroves are our fence.”',
    context: 'Said one afternoon on the beach, to Sagara and Mutiara.',
    answer: 'Grandpa Bahri',
    feedback: 'Grandpa Bahri is the oldest man on Nusa Barat and the one who knows the most about mangroves.'
  },
  {
    text: '“But Grandpa, what about the people who need charcoal and fish ponds?”',
    context: 'Asked with a raised hand, during the meeting at the Nusa Barat hall.',
    answer: 'Mutiara',
    feedback: 'The word “Grandpa” is the clue: only Sagara and Mutiara call him that, and the text says Mutiara raised her hand.'
  },
  {
    text: '“The waves did not change. We changed.”',
    context: 'Said slowly, opening the meeting at the hall.',
    answer: 'Grandpa Bahri',
    feedback: 'This is the sentence that turns the whole story around, and Grandpa Bahri is the one who calls the meeting.'
  },
  {
    text: '“We will stop cutting mangroves for charcoal. We will use coconut shells instead.”',
    context: 'An agreement made at the meeting by the islanders who sold charcoal in the city.',
    answer: 'The people of Nusa Timur',
    feedback: 'Nusa Timur is the island where people cut mangroves for charcoal, so they are the ones who change to coconut shells.'
  },
  {
    text: '“We will move our ponds far from the beach and plant mangroves along the coast again.”',
    context: 'An agreement made at the meeting by the islanders whose pond walls the waves broke.',
    answer: 'The people of Nusa Selatan',
    feedback: 'Nusa Selatan is the island of shrimp and fish ponds, and the ponds broken by the waves were theirs.'
  },
  {
    text: '“Remember, children — it is the same on land. If people cut the trees on the hills, the land will come down.”',
    context: 'Said on the beach at the end of the story, looking at the hills of the mainland.',
    answer: 'Grandpa Bahri',
    feedback: 'The closing lesson comes from Grandpa Bahri, said to Sagara and Mutiara — the “children” in the sentence.'
  }
];

/* ---------------- Activity 3: kuis 7 soal ---------------- */
var QUIZ = [
  {
    question: 'Which of these is a time word — a phrase that tells you when something happens?',
    options: ['For many years', 'The mangrove forest', 'Grandpa Bahri', 'Coconut shells'],
    answer: 0,
    feedback: '“For many years” tells you how long the calm lasted, so it marks time.'
  },
  {
    question: 'Which time word signals that the problem is about to begin?',
    options: ['Every afternoon', 'But in the last few years', 'A few months later', 'One afternoon'],
    answer: 1,
    feedback: '“But in the last few years” is where the story turns from calm to trouble.'
  },
  {
    question: '“Day after day, the waves took away the sand.” What does this time phrase tell you?',
    options: ['It happened once', 'It repeated over a long stretch of time', 'It happened in one morning', 'It will happen next year'],
    answer: 1,
    feedback: 'A repeated phrase like “day after day” shows the damage built up slowly rather than all at once.'
  },
  {
    question: 'Where in a narrative do you usually meet time words such as “A few months later”?',
    options: ['Wherever the story moves forward in time', 'Only in the very first sentence', 'Only inside quotation marks', 'Only in the title'],
    answer: 0,
    feedback: 'Time words appear wherever the story jumps forward, which is why they help you follow the order of events.'
  },
  {
    question: 'The text says Mutiara “raised her hand and asked”. What does this tell you about the quote that follows?',
    options: ['It is the narrator speaking', 'Mutiara is the speaker', 'Grandpa Bahri is the speaker', 'Nobody is speaking'],
    answer: 1,
    feedback: 'A reporting phrase like “Mutiara raised her hand and asked” names the speaker right before the quote.'
  },
  {
    question: 'In a story, quotation marks around a sentence usually mean…',
    options: ['Someone is speaking those exact words', 'The writer is unsure about it', 'The sentence is a title', 'The sentence is a time word'],
    answer: 0,
    feedback: 'Quotation marks hold the exact words a character says, which is why you can ask who says them.'
  },
  {
    question: 'What is the message Grandpa Bahri leaves at the end of the story?',
    options: ['Charcoal should never be made at all', 'Ponds are always bad for the coast', 'Cutting trees on the hills brings the land down, just as cutting mangroves brings the waves in', 'The waves have become stronger than before'],
    answer: 2,
    feedback: 'He draws the same lesson for the hills as for the coast: remove what holds the ground, and the danger follows.'
  }
];

var TIPS = [
  'Time words are the spine of a story: find them and the order of events comes free.',
  'A reporting phrase — “she asked”, “he said slowly” — names the speaker without you having to guess.',
  'When no name is given, look at what the speaker cares about. That usually tells you which group is talking.'
];

var TOTAL_STEPS = TOTAL_MARKERS + QUOTES.length + QUIZ.length; /* 19 */
var LEGACY_MAX_SCORE = TOTAL_STEPS * 10; /* 190, seperti versi lama */

/* ---------------- State ---------------- */
var State = {
  page: 'welcome-1',
  lives: TOTAL_LIVES,
  /* Riwayat & status sesi untuk back button (poin 1) dan coach mark
     otomatis (poin 3) — sengaja disimpan di sini, BUKAN di localStorage:
     ini cuma untuk sesi yang sedang berjalan, tidak ikut kontrak data
     lama (oj_timur_v1 dkk.) dan tidak boleh mengubahnya. */
  history: [],       /* stack nama stage yang sudah dikunjungi, untuk goBack() */
  entered: {},        /* stage yang start()/show()-nya sudah pernah jalan penuh sekali */
  coachSeen: {},       /* stage yang coach mark otomatisnya sudah pernah tampil */
  markerFound: [],      /* frasa yang sudah ditemukan sendiri */
  markerRevealed: [],   /* frasa yang ditandai setelah dua kali salah */
  markerWrong: 0,       /* salah beruntun pada percobaan berjalan */
  quoteIndex: 0,
  quoteWrong: 0,
  quoteScore: 0,
  quoteReview: [],
  quizIndex: 0,
  quizWrong: 0,
  quizScore: 0,
  quizReview: []
};

var STAGES = ['welcome-1', 'welcome-2', 'wait-1', 'video', 'wait-2', 'story', 'markers', 'quotes', 'quiz', 'result'];

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
  pushHistory(page);
  Coach.maybeAutoOpen(page);
  if (HINTS[page]) hint(HINTS[page]);   /* Revisi R3 */
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
   Notifikasi instruksi satu baris di pojok kanan atas. Menutup
   sendiri setelah HINT_MS, atau langsung saat ditekan. Sengaja
   TIDAK memblokir apa pun: pointer-events hanya aktif di pilnya,
   jadi "tap layar untuk lanjut" tetap bisa dilakukan di area lain
   tanpa lebih dulu menutup hint ini.

   Catatan: sebelum revisi ini, teks instruksi untuk welcome & gerbang
   tunggu memang ada di objek COACH tapi TIDAK PERNAH sampai ke siswa —
   tidak masuk COACH_AUTO_STAGES, dan tombol #navCoach yang bisa
   membukanya berada di dalam #appShell yang masih tersembunyi di
   layar-layar itu. Hint inilah yang akhirnya menyampaikannya. */
var HINT_MS = 3000;

function hint(message) {
  var host = $('hintHost');
  if (!host || !message) return;

  /* Satu hint pada satu waktu: pesan lama diusir dulu supaya tidak
     menumpuk kalau siswa berpindah layar dengan cepat. */
  Array.prototype.forEach.call(host.children, function (old) { dismiss(old); });

  var el = document.createElement('button');
  el.type = 'button';
  el.className = 'hint';
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

/* Ganti scrollIntoView: geser jendela dengan offset navigator. */
function scrollToEl(el, extra) {
  if (!el) return;
  var nav = $('nav');
  var offset = (nav ? nav.offsetHeight : 0) + (extra || 16);
  var y = window.pageYOffset + el.getBoundingClientRect().top - offset;
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
}

/* ---------------- Navigator ---------------- */
var Nav = {
  init: function () {
    $('navStudent').textContent = this.studentName();
    this.renderLives();
    this.update();
    this.updateSteps();

    $('navHome').addEventListener('click', function () { window.location.href = '../index.html'; });   /* Tambahan T1: folder home/ tidak ada, hub ada di ../index.html */
    $('navBack').addEventListener('click', function () { goBack(); });
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

  updateSteps: function () {
    var el = $('navSteps');
    if (!el) return;
    var val = Score.display();
    el.textContent = val + ' of ' + TOTAL_STEPS;
    el.setAttribute('aria-label', val + ' of ' + TOTAL_STEPS + ' steps completed');
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

/* ---------------- Skor: 19 langkah, yang dibocorkan dihitung setengah ---------------- */
var Score = {
  markers: function () { return State.markerFound.length + State.markerRevealed.length * 0.5; },
  total: function () { return this.markers() + State.quoteScore + State.quizScore; },
  revealedCount: function () {
    var n = State.markerRevealed.length;
    State.quoteReview.forEach(function (r) { if (r.revealed) n++; });
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
         maks 190 seperti versi lama) supaya modul lain tidak rusak.
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

/* ---------------- Gerbang guru ---------------- */
var Gate = {
  mode: null,

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
    this.show('wait-1', 'Wait for your teacher', 'Please look at your teacher and wait for further instructions.');
    setPage('wait-1');
  },
  waitAfterVideo: function () {
    this.show('wait-2', 'Video finished', 'Please look at your teacher and wait before the first activity.');
    setPage('wait-2');
  },
  outOfLives: function () {
    this.show('lives', 'Out of lives', 'All seven lives are used up. Ask your teacher to give them back — your progress stays where it is.');
  },

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
      Story.start();
      return;
    }
    if (this.mode === 'lives') Nav.restoreLives();
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

/* ---------------- Materi: video ---------------- */
var Video = {
  init: function () {
    var el = $('videoEl');
    el.addEventListener('error', function () { $('videoPlate').classList.add('is-empty'); });
    el.addEventListener('ended', function () { Gate.waitAfterVideo(); });
  },
  start: function () {
    showPage('videoPage');
    setPage('video');
  }
};

/* ---------------- Materi: cerita (dipisah dari Activity 1) ----------------
   Halaman baca-saja. Sumber teksnya PERSIS sama dengan STORY_PARAGRAPHS
   yang dipakai Markers.render() di bawah — tidak ada salinan kedua yang
   bisa berbeda di kemudian hari. */
var Story = {
  init: function () {
    $('storyContinueBtn').addEventListener('click', function () { Markers.start(); });
    this.render();
  },

  start: function () {
    showPage('storyPage');
    setPage('story');
  },

  render: function () {
    var wrap = $('storyReadText');
    wrap.innerHTML = '';
    STORY_PARAGRAPHS.forEach(function (para) {
      var p = document.createElement('p');
      p.textContent = para.text;
      wrap.appendChild(p);
    });
  }
};

/* ---------------- Activity 1: enam penanda waktu ---------------- */
var Markers = {
  init: function () {
    var self = this;
    $('markerContinueBtn').addEventListener('click', function () { Quotes.start(); });
    this.render();

    var text = $('storyText');
    text.addEventListener('click', function (e) {
      var token = e.target.closest ? e.target.closest('.token') : null;
      if (token) self.tap(token);
    });
    text.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var token = e.target.closest ? e.target.closest('.token') : null;
      if (token) { e.preventDefault(); self.tap(token); }
    });
  },

  start: function () {
    showPage('markerPage');
    setPage('markers');
    this.updateDots();
  },

  /* Susun paragraf: penanda asli + pengecoh sama-sama bisa diketuk. */
  render: function () {
    var wrap = $('storyText');
    wrap.innerHTML = '';

    STORY_PARAGRAPHS.forEach(function (para) {
      var candidates = para.targets.concat(MARKER_DECOYS);
      var matches = [];
      candidates.forEach(function (phrase) {
        var from = 0;
        var idx;
        while ((idx = para.text.indexOf(phrase, from)) !== -1) {
          matches.push({ start: idx, end: idx + phrase.length, phrase: phrase, valid: para.targets.indexOf(phrase) !== -1 });
          from = idx + phrase.length;
        }
      });
      matches.sort(function (a, b) { return a.start - b.start || (b.end - b.start) - (a.end - a.start); });

      var clean = [];
      var lastEnd = -1;
      matches.forEach(function (m) {
        if (m.start >= lastEnd) { clean.push(m); lastEnd = m.end; }
      });

      var p = document.createElement('p');
      var cursor = 0;
      clean.forEach(function (m) {
        if (m.start > cursor) p.appendChild(document.createTextNode(para.text.slice(cursor, m.start)));
        /* span, bukan button: teks penanda dua kata harus bisa ikut
           berganti baris seperti teks biasa. */
        var span = document.createElement('span');
        span.className = 'token';
        span.textContent = m.phrase;
        span.setAttribute('data-word', m.phrase);
        span.setAttribute('data-valid', m.valid ? 'true' : 'false');
        span.setAttribute('role', 'button');
        span.setAttribute('tabindex', '0');
        span.setAttribute('aria-label', 'Candidate time word: ' + m.phrase);
        p.appendChild(span);
        cursor = m.end;
      });
      if (cursor < para.text.length) p.appendChild(document.createTextNode(para.text.slice(cursor)));
      wrap.appendChild(p);
    });
  },

  updateDots: function () {
    var dots = $('markerDots');
    dots.innerHTML = '';
    var done = State.markerFound.length + State.markerRevealed.length;
    for (var i = 0; i < TOTAL_MARKERS; i++) {
      var d = document.createElement('span');
      d.className = 'dot' + (i < done ? ' is-done' : i === done ? ' is-now' : '');
      dots.appendChild(d);
    }
    $('markerProgressLabel').textContent = done + ' of ' + TOTAL_MARKERS + ' found';
    Nav.updateSteps();
  },

  chip: function (word, revealed) {
    var chip = document.createElement('span');
    chip.className = 'found-chip';
    chip.textContent = revealed ? word + ' · ½' : word;
    if (revealed) chip.style.borderColor = 'var(--ink-3)';
    $('foundList').appendChild(chip);
  },

  tap: function (btn) {
    if (Gate.isShown() || this.done) return;
    if (btn.classList.contains('is-done')) return;
    var word = btn.getAttribute('data-word');
    var valid = btn.getAttribute('data-valid') === 'true';
    var feedback = $('markerFeedback');

    if (!valid) {
      State.markerWrong++;
      btn.classList.add('is-missed', 'is-done');
      btn.removeAttribute('tabindex');
      Nav.loseLife();
      feedback.hidden = false;
      feedback.className = 'feedback is-bad';

      if (State.markerWrong >= REVEAL_AFTER_WRONG) {
        /* Dua kali salah: satu penanda yang belum ditemukan ditandai,
           dihitung setengah, lalu hitungan salah dimulai lagi. */
        State.markerWrong = 0;
        var next = null;
        for (var i = 0; i < TIME_MARKERS.length; i++) {
          var phrase = TIME_MARKERS[i];
          if (State.markerFound.indexOf(phrase) === -1 && State.markerRevealed.indexOf(phrase) === -1) { next = phrase; break; }
        }
        if (next) {
          State.markerRevealed.push(next);
          var el = $('storyText').querySelector('.token[data-word="' + next + '"][data-valid="true"]');
          if (el) {
            el.classList.add('is-found', 'is-done');
            el.removeAttribute('tabindex');
            scrollToEl(el, 40);
          }
          this.chip(next, true);
          feedback.textContent = 'Two misses — “' + next + '” is marked for you. That one counts as half a step.';
          toast('Time word revealed · half a step');
          this.updateDots();
          this.checkDone();
          return;
        }
      }
      feedback.textContent = '“' + word + '” mentions time, but it does not move the story forward. Read the sentence around it and try another.';
      return;
    }

    if (State.markerFound.indexOf(word) !== -1 || State.markerRevealed.indexOf(word) !== -1) return;

    State.markerFound.push(word);
    State.markerWrong = 0;
    btn.classList.add('is-found', 'is-done');
    btn.removeAttribute('tabindex');
    this.chip(word, false);
    this.updateDots();

    feedback.hidden = false;
    feedback.className = 'feedback is-good';
    feedback.textContent = 'Correct — “' + word + '” tells you when. (' + (State.markerFound.length + State.markerRevealed.length) + ' of ' + TOTAL_MARKERS + ')';
    this.checkDone();
  },

  checkDone: function () {
    if (State.markerFound.length + State.markerRevealed.length < TOTAL_MARKERS) return;
    this.done = true;
    $('storyText').classList.add('is-locked');
    $('markerContinueBtn').hidden = false;
    $('markerContinueBtn').textContent = 'Continue to Who says it?';
  }
};

/* ---------------- Activity 2: Who Says It? ---------------- */
var Quotes = {
  init: function () {
    var self = this;
    $('quoteNextBtn').addEventListener('click', function () {
      State.quoteIndex++;
      if (State.quoteIndex >= QUOTES.length) Quiz.start();
      else self.render();
    });
  },

  start: function () {
    showPage('quotePage');
    setPage('quotes');
    if (!State.entered.quotes) {
      State.entered.quotes = true;
      State.quoteIndex = 0;
      this.render();
    }
  },

  render: function () {
    State.quoteWrong = 0;
    var q = QUOTES[State.quoteIndex];
    $('quoteLabel').textContent = 'Quote ' + (State.quoteIndex + 1) + ' of ' + QUOTES.length;
    $('quoteText').textContent = q.text;
    $('quoteContext').textContent = q.context;
    $('quoteFeedback').hidden = true;
    $('quoteNextBtn').hidden = true;

    var dots = $('quoteDots');
    dots.innerHTML = '';
    for (var i = 0; i < QUOTES.length; i++) {
      var d = document.createElement('span');
      d.className = 'dot' + (i < State.quoteIndex ? ' is-done' : i === State.quoteIndex ? ' is-now' : '');
      dots.appendChild(d);
    }

    var box = $('quoteOptions');
    box.innerHTML = '';
    var keys = ['A', 'B', 'C', 'D'];
    var self = this;
    SPEAKERS.forEach(function (name, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option';
      btn.setAttribute('data-value', name);
      var key = document.createElement('span');
      key.className = 'option-key';
      key.textContent = keys[i];
      var label = document.createElement('span');
      label.textContent = name;
      btn.appendChild(key);
      btn.appendChild(label);
      btn.addEventListener('click', function () { self.answer(name, btn); });
      box.appendChild(btn);
    });
    window.scrollTo({ top: 0 });
  },

  answer: function (name, btn) {
    if (Gate.isShown()) return;
    var q = QUOTES[State.quoteIndex];
    var feedback = $('quoteFeedback');
    var box = $('quoteOptions');

    if (name === q.answer) {
      btn.classList.add('is-correct');
      Array.prototype.forEach.call(box.querySelectorAll('.option'), function (b) { b.disabled = true; });
      State.quoteScore += State.quoteWrong === 0 ? 1 : 0.5;
      if (State.quoteWrong > 0) State.quoteReview.push({ index: State.quoteIndex, revealed: false });
      feedback.hidden = false;
      feedback.className = 'feedback is-good';
      feedback.textContent = (State.quoteWrong === 0 ? '' : 'Right this time — this step counts as half. ') + q.feedback;
      this.finish();
      return;
    }

    State.quoteWrong++;
    btn.classList.add('is-wrong');
    btn.disabled = true;
    Nav.loseLife();
    feedback.hidden = false;
    feedback.className = 'feedback is-bad';

    if (State.quoteWrong >= REVEAL_AFTER_WRONG) {
      var right = box.querySelector('.option[data-value="' + q.answer + '"]');
      if (right) right.classList.add('is-correct');
      Array.prototype.forEach.call(box.querySelectorAll('.option'), function (b) { b.disabled = true; });
      State.quoteScore += 0.5;
      State.quoteReview.push({ index: State.quoteIndex, revealed: true });
      feedback.textContent = 'Two misses — the speaker is marked in green. ' + q.feedback + ' This step counts as half.';
      toast('Answer revealed · half a step');
      this.finish();
      return;
    }
    feedback.textContent = 'Not that one. Look at the context line under the quote and try again.';
  },

  finish: function () {
    Nav.updateSteps();
    $('quoteNextBtn').hidden = false;
    $('quoteNextBtn').textContent = State.quoteIndex < QUOTES.length - 1 ? 'Next quote' : 'Continue to the quiz';
  }
};

/* ---------------- Activity 3: kuis ---------------- */
var Quiz = {
  init: function () {
    var self = this;
    $('quizNextBtn').addEventListener('click', function () {
      State.quizIndex++;
      if (State.quizIndex >= QUIZ.length) Result.show();
      else self.render();
    });
  },

  start: function () {
    showPage('quizPage');
    setPage('quiz');
    if (!State.entered.quiz) {
      State.entered.quiz = true;
      State.quizIndex = 0;
      this.render();
    }
  },

  render: function () {
    State.quizWrong = 0;
    var q = QUIZ[State.quizIndex];
    $('quizLabel').textContent = 'Question ' + (State.quizIndex + 1) + ' of ' + QUIZ.length;
    $('quizQuestion').textContent = q.question;
    $('quizFeedback').hidden = true;
    $('quizNextBtn').hidden = true;

    var dots = $('quizDots');
    dots.innerHTML = '';
    for (var i = 0; i < QUIZ.length; i++) {
      var d = document.createElement('span');
      d.className = 'dot' + (i < State.quizIndex ? ' is-done' : i === State.quizIndex ? ' is-now' : '');
      dots.appendChild(d);
    }

    var box = $('quizOptions');
    box.innerHTML = '';
    var keys = ['A', 'B', 'C', 'D'];
    var self = this;
    q.options.forEach(function (text, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option';
      btn.setAttribute('data-index', String(i));
      var key = document.createElement('span');
      key.className = 'option-key';
      key.textContent = keys[i];
      var label = document.createElement('span');
      label.textContent = text;
      btn.appendChild(key);
      btn.appendChild(label);
      btn.addEventListener('click', function () { self.answer(i, btn); });
      box.appendChild(btn);
    });
    window.scrollTo({ top: 0 });
  },

  answer: function (index, btn) {
    if (Gate.isShown()) return;
    var q = QUIZ[State.quizIndex];
    var feedback = $('quizFeedback');
    var box = $('quizOptions');

    if (index === q.answer) {
      btn.classList.add('is-correct');
      Array.prototype.forEach.call(box.querySelectorAll('.option'), function (b) { b.disabled = true; });
      State.quizScore += State.quizWrong === 0 ? 1 : 0.5;
      if (State.quizWrong > 0) State.quizReview.push({ index: State.quizIndex, revealed: false });
      feedback.hidden = false;
      feedback.className = 'feedback is-good';
      feedback.textContent = (State.quizWrong === 0 ? '' : 'Right this time — this step counts as half. ') + q.feedback;
      this.finish();
      return;
    }

    State.quizWrong++;
    btn.classList.add('is-wrong');
    btn.disabled = true;
    Nav.loseLife();
    feedback.hidden = false;
    feedback.className = 'feedback is-bad';

    if (State.quizWrong >= REVEAL_AFTER_WRONG) {
      var right = box.querySelector('.option[data-index="' + q.answer + '"]');
      if (right) right.classList.add('is-correct');
      Array.prototype.forEach.call(box.querySelectorAll('.option'), function (b) { b.disabled = true; });
      State.quizScore += 0.5;
      State.quizReview.push({ index: State.quizIndex, revealed: true });
      feedback.textContent = 'Two misses — the answer is marked in green. ' + q.feedback + ' This step counts as half.';
      toast('Answer revealed · half a step');
      this.finish();
      return;
    }
    feedback.textContent = 'Not that one. Read the question again and try another answer.';
  },

  finish: function () {
    Nav.updateSteps();
    $('quizNextBtn').hidden = false;
    $('quizNextBtn').textContent = State.quizIndex < QUIZ.length - 1 ? 'Next question' : 'See your result';
  }
};

/* ---------------- Hasil ---------------- */
var Result = {
  text: '',

  init: function () {
    var self = this;
    $('copyResultBtn').addEventListener('click', function () { self.copy(); });
    $('resultBackBtn').addEventListener('click', function () {
      $('transitionOverlay').classList.add('is-active');
    });
  },

  show: function () {
    showPage('resultPage');
    setPage('result');
    if (State.entered.result) return;
    State.entered.result = true;
    Score.save();
    $('resultPage').setAttribute('data-student', Nav.studentName());   /* Tambahan T3: dipakai kop halaman cetak */

    $('resultScore').innerHTML =
      '<div><dt>Steps</dt><dd>' + Score.display() + '/' + TOTAL_STEPS + '</dd></div>' +
      '<div><dt>Revealed</dt><dd>' + Score.revealedCount() + '</dd></div>' +
      '<div><dt>Lives left</dt><dd>' + State.lives + '/' + TOTAL_LIVES + '</dd></div>';

    var rows = [
      { label: 'Activity 1 · time words', got: Score.markers(), of: TOTAL_MARKERS },
      { label: 'Activity 2 · who says it?', got: State.quoteScore, of: QUOTES.length },
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

    State.markerRevealed.forEach(function (word) {
      any = true;
      var li = document.createElement('li');
      li.className = 'answer-item';
      var qEl = document.createElement('p');
      qEl.className = 'answer-q';
      qEl.textContent = 'Time word revealed for you';
      var right = document.createElement('p');
      right.className = 'answer-right';
      right.textContent = '“' + word + '”';
      li.appendChild(qEl);
      li.appendChild(right);
      answers.appendChild(li);
    });

    State.quoteReview.forEach(function (entry) {
      any = true;
      var q = QUOTES[entry.index];
      var li = document.createElement('li');
      li.className = 'answer-item';
      var qEl = document.createElement('p');
      qEl.className = 'answer-q';
      qEl.textContent = q.text;
      var right = document.createElement('p');
      right.className = 'answer-right';
      right.textContent = 'Speaker: ' + q.answer;
      var why = document.createElement('p');
      why.className = 'answer-yours';
      why.textContent = q.feedback;
      li.appendChild(qEl);
      li.appendChild(right);
      li.appendChild(why);
      answers.appendChild(li);
    });

    State.quizReview.forEach(function (entry) {
      any = true;
      var q = QUIZ[entry.index];
      var li = document.createElement('li');
      li.className = 'answer-item';
      var qEl = document.createElement('p');
      qEl.className = 'answer-q';
      qEl.textContent = (entry.index + 1) + '. ' + q.question;
      var right = document.createElement('p');
      right.className = 'answer-right';
      right.textContent = 'Correct answer: ' + q.options[q.answer];
      var why = document.createElement('p');
      why.className = 'answer-yours';
      why.textContent = q.feedback;
      li.appendChild(qEl);
      li.appendChild(right);
      li.appendChild(why);
      answers.appendChild(li);
    });

    if (!any) {
      var none = document.createElement('li');
      none.className = 'answer-item';
      none.textContent = 'Nothing — all nineteen steps landed on the first try.';
      answers.appendChild(none);
    }

    var tips = $('resultTips');
    tips.innerHTML = '';
    TIPS.forEach(function (text) {
      var li = document.createElement('li');
      li.textContent = text;
      tips.appendChild(li);
    });

    this.text = 'NarrativeLearn · Nusa Timur\n' +
      'Student: ' + Nav.studentName() + '\n' +
      'Steps: ' + Score.display() + '/' + TOTAL_STEPS + '\n' +
      'Time words: ' + Score.markers() + '/' + TOTAL_MARKERS + '\n' +
      'Who says it?: ' + State.quoteScore + '/' + QUOTES.length + '\n' +
      'Quiz: ' + State.quizScore + '/' + QUIZ.length + '\n' +
      'Lives left: ' + State.lives + '/' + TOTAL_LIVES + '\n' +
      'Attempt: ' + readAttempt();

  },

  copy: function () {
    var text = this.text;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Result copied.'); }, function () { Result.fallbackCopy(text); });
    } else {
      this.fallbackCopy(text);
    }
  },

  fallbackCopy: function (text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', 'readonly');
    area.style.cssText = 'position:fixed;top:-1000px;left:-1000px;';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); toast('Result copied.'); }
    catch (e) { toast('Copy failed — select the text manually.'); }
    document.body.removeChild(area);
  }
};

/* ---------------- Back & edge-swipe ---------------- */
/* Dulu goBack() memakai window.history.back(), padahal app ini tidak
   pernah memanggil history.pushState() saat berpindah stage — jadi
   browser tidak tahu apa-apa soal urutan stage di dalam app. Akibatnya
   back bisa langsung keluar dari app sama sekali, atau tidak melakukan
   apa-apa, bukannya kembali ke stage sebelumnya. Sekarang riwayatnya
   dipegang sendiri di State.history, diisi oleh pushHistory() yang
   dipanggil dari setPage() setiap kali stage berganti (lihat atas). */

/* Stage yang boleh jadi TUJUAN back. welcome-1/2 dan wait-1/2 (gerbang
   guru) sengaja TIDAK masuk sini: instruksi welcome sudah cukup jelas
   dari teksnya sendiri, dan gerbang tunggu-guru memang tidak boleh
   didaratkan balik oleh siswa sendiri (mereka tidak bisa melewatinya
   tanpa guru) — dengan begini back otomatis melompatinya dan menuju
   konten sebelum gerbang, tanpa perlu logika skip terpisah. */
var HISTORY_STAGES = ['video', 'story', 'markers', 'quotes', 'quiz', 'result'];

function pushHistory(page) {
  if (HISTORY_STAGES.indexOf(page) === -1) return;
  if (State.history[State.history.length - 1] === page) return; /* jangan dobel kalau stage sama dipanggil ulang */
  State.history.push(page);
}

/* Menampilkan ulang sebuah stage tanpa mengulang reset milik start()-nya
   masing-masing. Quotes/Quiz/Result menjaga dirinya sendiri lewat
   State.entered (lihat modul masing-masing di atas); Video/Story/Markers
   memang sudah tidak pernah me-reset apa pun saat start() dipanggil
   ulang, jadi aman ditampilkan lagi berkali-kali. */
function goToStage(name) {
  switch (name) {
    case 'video': Video.start(); break;
    case 'story': Story.start(); break;
    case 'markers': Markers.start(); break;
    case 'quotes': Quotes.start(); break;
    case 'quiz': Quiz.start(); break;
    case 'result': Result.show(); break;
  }
}

function goBack() {
  if (Gate.isShown()) return;
  if (State.history[State.history.length - 1] === State.page) State.history.pop();
  var prev = State.history[State.history.length - 1];
  if (prev) goToStage(prev);
  else window.location.href = '../index.html'; /* tidak ada lagi riwayat: keluar seperti semula. Tambahan T1: folder home/ tidak ada, path yang benar ../index.html */
}

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
    list.push({ module: 'oj_timur', page: State.page, text: text, at: new Date().toISOString() });
    writeKey('nl_questions_v1', list);
    $('askText').value = '';
    $('askNote').textContent = 'Sent. Your teacher will answer soon.';
    setTimeout(function () { Ask.close(); }, 1100);
  }
};

/* ---------------- Coach mark ---------------- */
/* Revisi R1: kunci 'welcome-1', 'welcome-2', 'wait-1', video, dan
   'wait-2' dicabut dari sini — teksnya TIDAK dibuang, hanya dipindah
   ke peta HINTS (lihat Revisi R3), karena kelima layar itu kini
   memakai notifikasi hint pojok kanan atas, bukan coach mark bertur.
   Objek ini sekarang hanya menyisakan stage yang benar-benar bisa
   membuka coach mark: lewat COACH_AUTO_STAGES (otomatis) atau tombol
   #navCoach (manual, hanya tersedia saat #appShell sudah tampil). */
var COACH = {
  story: [
    { text: 'Read the whole story once, all the way through, before you tap anything.', target: '#storyReadText' },
    { text: 'When you are done reading, continue — the next page turns this same story into an activity.', target: '#storyContinueBtn' }
  ],
  markers: [
    { text: 'Tap the words in the story that tell you when something happens. Six of them count.', target: '#storyText' },
    { text: 'Words with a dashed underline can be tapped, but not all of them move the story forward — read the sentence first.', target: '#storyText .token[data-valid="true"]:not(.is-done)' },
    { text: 'A wrong tap costs one life. After two misses in a row, one of the remaining time words is marked for you and counts as half a step.', target: '#navHearts' },
    { text: 'Every time word you find — or that gets marked for you after two misses — collects here, so you always know how many are left.', target: '#foundList' }
  ],
  quotes: [
    { text: 'One quote per screen. Choose who says it from the four names.', target: '#quoteOptions' },
    { text: 'The line under the quote tells you where in the story it happens — use it.', target: '#quoteContext' },
    { text: 'A wrong answer costs one life; after two misses the speaker is marked and the step counts as half.', target: '#navHearts' }
  ],
  quiz: [
    { text: 'Seven questions, one per screen.', target: '#quizOptions' },
    { text: 'A wrong answer costs one life and stays crossed out; you can still find the right one.', target: '#quizOptions' },
    { text: 'After two misses the answer is shown and that step counts as half.', target: '#navHearts' }
  ],
  result: [
    { text: 'This page shows your nineteen steps, what was revealed for you, and what to carry to Nusa Selatan.', target: '#resultScore' }
  ]
};

/* Coach mark spotlight: lubang & tooltip dihitung dari
   getBoundingClientRect() elemen target saat itu juga — tidak ada
   koordinat yang di-hardcode, jadi otomatis mengikuti kalau ukuran
   atau posisi elemen (mis. navigator) berubah. Fallback saat target
   tidak ada di DOM (mis. semua token sudah .is-done) sudah ditangani
   di position() di bawah: document.querySelector mengembalikan null,
   lalu tooltip otomatis ditengahkan tanpa lubang — lihat `if (!target)`. */

/* Revisi R1: 'video' dikeluarkan dari daftar. Tur coach mark baru
   boleh terbuka sendiri SETELAH sesi video terlewati, seragam dengan
   enam platform lain. Instruksi untuk halaman video kini disampaikan
   lewat hint pojok kanan atas — lihat peta HINTS.
   Stage 'story' menjadi coach mark otomatis PERTAMA yang dilihat siswa. */
var COACH_AUTO_STAGES = ['story', 'markers', 'quotes', 'quiz', 'result'];

var Coach = {
  steps: [],
  index: 0,
  _reposition: null,
  autoEnabled: true,   /* toggle lewat kotak kedua panel developer, poin 4 */

  init: function () {
    var self = this;
    $('coachNext').addEventListener('click', function () { self.next(); });
    $('coachClose').addEventListener('click', function () { self.close(); });
  },

  /* Dipanggil dari setPage() setiap kali stage berganti (lihat atas).
     Tampil sendiri hanya sekali per stage per sesi (State.coachSeen),
     dan hanya kalau autoEnabled masih ON. Tombol #navCoach di navigator
     TIDAK lewat sini — dia selalu memanggil Coach.open() langsung, jadi
     tetap bisa dipakai kapan pun terlepas dari toggle developer ini. */
  maybeAutoOpen: function (stageName) {
    if (!this.autoEnabled) return;
    if (COACH_AUTO_STAGES.indexOf(stageName) === -1) return;
    if (State.coachSeen[stageName]) return;
    State.coachSeen[stageName] = true;
    this.open(stageName);
  },

  open: function (forcePage) {
    this.steps = COACH[forcePage || State.page] || [{ text: 'Nothing to explain on this screen yet.', target: null }];
    this.index = 0;
    $('coachWrap').hidden = false;
    $('navCoach').classList.add('is-on');
    this.render();

    var self = this;
    this._reposition = function () { self.position(); };
    window.addEventListener('resize', this._reposition);
    window.addEventListener('scroll', this._reposition, true);
  },

  render: function () {
    var step = this.steps[this.index];
    $('coachStep').textContent = 'Step ' + (this.index + 1) + ' of ' + this.steps.length;
    $('coachText').textContent = step.text;
    $('coachNext').textContent = this.index === this.steps.length - 1 ? 'Got it' : 'Continue';
    this.position();
  },

  position: function () {
    var step = this.steps[this.index];
    var hole = $('coachHole');
    var overlay = $('coachOverlay');
    var tip = $('coachTip');
    var target = step.target ? document.querySelector(step.target) : null;
    var margin = 12;

    if (!target) {
      hole.hidden = true;
      overlay.classList.add('is-dim');
      tip.classList.add('is-centered');
      tip.style.top = '';
      tip.style.left = '';
      return;
    }

    overlay.classList.remove('is-dim');
    var r = target.getBoundingClientRect();
    var pad = 7;
    hole.hidden = false;
    hole.style.top = (r.top - pad) + 'px';
    hole.style.left = (r.left - pad) + 'px';
    hole.style.width = (r.width + pad * 2) + 'px';
    hole.style.height = (r.height + pad * 2) + 'px';

    tip.classList.remove('is-centered');
    /* Taruh dulu di pojok untuk mengukur ukuran aslinya, baru posisikan
       di bawah lubang (atau di atas kalau ruang bawah tidak cukup). */
    tip.style.left = margin + 'px';
    tip.style.top = margin + 'px';
    var tipRect = tip.getBoundingClientRect();

    var top;
    var below = r.bottom + pad + margin;
    var above = r.top - pad - margin - tipRect.height;
    if (below + tipRect.height <= window.innerHeight - margin) top = below;
    else if (above >= margin) top = above;
    else top = Math.max(margin, Math.min(below, window.innerHeight - tipRect.height - margin));

    var left = r.left + r.width / 2 - tipRect.width / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - tipRect.width - margin));

    tip.style.top = top + 'px';
    tip.style.left = left + 'px';
  },

  next: function () {
    if (this.index < this.steps.length - 1) { this.index++; this.render(); }
    else this.close();
  },

  close: function () {
    $('coachWrap').hidden = true;
    $('navCoach').classList.remove('is-on');
    if (this._reposition) {
      window.removeEventListener('resize', this._reposition);
      window.removeEventListener('scroll', this._reposition, true);
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
  onTap(w1, function () {
    if (step1Done) return;
    step1Done = true;
    w1.hidden = true;
    w2.hidden = false;
    setPage('welcome-2');
  });

  var roadmapShown = false;
  var step2Done = false;
  onTap(w2, function () {
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
   MODE PENGEMBANG — hapus fungsi ini beserta panelnya di
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
    if (Gate.isShown()) { TeacherAPI.release(); return; }
    if (!$('videoPage').hidden) { Gate.waitAfterVideo(); return; }
    if (!$('storyPage').hidden) { $('storyContinueBtn').click(); return; }

    if (!$('markerPage').hidden) {
      if (!$('markerContinueBtn').hidden) { $('markerContinueBtn').click(); return; }
      var token = $('storyText').querySelector('.token[data-valid="true"]:not(.is-done)');
      if (token) { token.click(); return; }
    }

    if (!$('quotePage').hidden) {
      if (!$('quoteNextBtn').hidden) { $('quoteNextBtn').click(); return; }
      var q = QUOTES[State.quoteIndex];
      var speaker = $('quoteOptions').querySelector('.option[data-value="' + q.answer + '"]');
      if (speaker && !speaker.disabled) { speaker.click(); return; }
    }

    if (!$('quizPage').hidden) {
      if (!$('quizNextBtn').hidden) { $('quizNextBtn').click(); return; }
      var item = QUIZ[State.quizIndex];
      var target = $('quizOptions').querySelector('.option[data-index="' + item.answer + '"]');
      if (target && !target.disabled) { target.click(); return; }
    }

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

  panel.addEventListener('click', function (e) {
    if (dragged) { e.preventDefault(); e.stopImmediatePropagation(); dragged = false; }
  }, true);
}

function initDevTooltip() {
  var btn = $('devAnswer');
  var tip = $('devTooltip');
  if (!btn || !tip) return;
  var timer = null;

  function place() {
    tip.textContent = '(' + State.page + ')';
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

  btn.addEventListener('mouseenter', function () { clearTimeout(timer); timer = setTimeout(place, 300); });
  btn.addEventListener('mouseleave', hide);
  btn.addEventListener('focus', place);
  btn.addEventListener('blur', hide);
}

/* Kotak kedua panel developer (poin 4): ON/OFF untuk auto-popup coach
   mark (poin 3) — supaya saat QA klik cepat lewati langkah demi langkah,
   coach mark otomatis tidak terus menyela di setiap stage baru. Toggle
   ini sama sekali tidak menyentuh #navCoach di navigator utama, yang
   tetap selalu bisa dipakai untuk membuka coach mark stage aktif
   secara manual (lihat Coach.maybeAutoOpen di atas). */
function initDevCoachToggle() {
  var btn = $('devCoachToggle');
  if (!btn) return;

  function render() {
    var on = Coach.autoEnabled;
    btn.classList.toggle('is-on', on);
    btn.classList.toggle('is-off', !on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    var label = 'Auto coach mark: ' + (on ? 'ON' : 'OFF') + ' — tap to turn ' + (on ? 'off' : 'on');
    btn.setAttribute('aria-label', label);
    btn.title = label;
  }

  btn.addEventListener('click', function () {
    Coach.autoEnabled = !Coach.autoEnabled;
    render();
    toast('Auto coach mark: ' + (Coach.autoEnabled ? 'ON' : 'OFF'));
  });

  render();
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

  if (DEV_MODE) { initDevPanel(); initDevDrag(); initDevTooltip(); initDevCoachToggle(); }
  initSwipeBack();

  function startSession() {
    $('appShell').hidden = false;
    Nav.init();
    Video.init();
    Story.init();
    Markers.init();
    Quotes.init();
    Quiz.init();
    Result.init();
    Ask.init();
    Coach.init();
    Gate.waitBeforeVideo();
  }

  $('welcome1').hidden = false;
  setPage('welcome-1');
  initWelcome(startSession);
})();