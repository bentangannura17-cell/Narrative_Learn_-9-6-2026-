/* ============================================================
   Nusa Barat — NarrativeLearn  (re-design)
   /ocean-journey/nusa-barat/

   Alur: welcome 1 → welcome 2 → tunggu guru → video → tunggu guru →
   13 langkah (3 blok cerita berlabel + 10 soal kuis) → hasil.

   Penilaian: 13 langkah. Benar tanpa salah = 1 langkah. Setelah DUA
   kali salah di satu langkah, jawaban benar ditunjukkan dan langkah
   itu dihitung SETENGAH (0.5). Tidak ada lulus/gagal.
   Nyawa: 7 — setiap jawaban salah (label maupun kuis) mengurangi satu.
   Habis → layar tunggu guru; guru yang memulihkan.
   Prev/Next bebas satu langkah; Next aktif begitu langkah dijawab
   (benar atau salah).

   Kunci localStorage (kontrak lintas modul, tidak berubah):
     oj_barat_v1        — {v,status,score,maxScore,stars,correct,total,livesUsed,attempts,completedAt}
     nl_student_v1      — identitas siswa
     nl_teacher_gate_v1 — sinyal akses guru
     nl_questions_v1    — pertanyaan siswa ke guru
   ============================================================ */

/* ============================================================
   Revisi (lihat prompt-revisi-nusa-barat.md untuk detail lengkap):
   - Tiap step 'block' sekarang tampil sebagai DUA LAYAR berurutan
     (baca → aktivitas) lewat State.stepPhase — BUKAN step tambahan.
     TOTAL_STEPS / kontrak oj_barat_v1 di atas tidak berubah.
     Lihat Steps.move() / Steps.render().
   - Coach mark (COACH/Coach di bawah) sekarang punya pemicu otomatis
     (AutoCoach/maybeAutoCoach()) selain tombol manual #navCoach —
     dilacak per jenis layar, hanya di memori (bukan localStorage).
   ============================================================ */

/* ============================================================
   ⚠️ MODE PENGEMBANG — HAPUS SEBELUM LAUNCHING
   Satu klik tombol hijau = meloloskan SATU langkah yang tampil.
   ============================================================ */
var DEV_MODE = true;
/* ====================== AKHIR CATATAN ATAS ====================== */

var KEY_SELF = 'oj_barat_v1';
var KEY_STUDENT = 'nl_student_v1';
var KEY_TEACHER_GATE = 'nl_teacher_gate_v1';
var KEY_ATTEMPT = 'oj_barat_attempt_temp';

var TOTAL_LIVES = 7;
var REVEAL_AFTER_WRONG = 2; /* dua kali salah → jawaban benar ditunjukkan, langkah dihitung setengah */

/* ---------------- Cerita: 3 blok (teks resmi, jangan diubah) ---------------- */
var STORY_BLOCKS = [
  {
    paragraphs: [
      'Near the coast of Jayakarta Province, there were three small islands: Nusa Barat, Nusa Timur, and Nusa Selatan. Thick mangrove forests grew around the islands. The mangrove forest looked like a green belt that hugged the beach. Most people there were fishermen and coconut farmers. On Nusa Barat, there lived a brother and a sister, Sagara and Mutiara. Every afternoon, they played on the beach and watched the mangrove roots. The roots held the mud like giant fingers.',
      'The people of the three islands respected Grandpa Bahri. He was the oldest man on Nusa Barat, and he knew the most about mangroves. "These mangroves are our fence," Grandpa Bahri said one afternoon to Sagara and Mutiara. "Their roots hold the waves. They keep the beach soil safe." For many years, life on the three islands was calm. Big waves from the open sea always broke first in the mangrove forest before they came to the houses.'
    ],
    part: 'Orientation',
    imageAlts: [
      'Sagara and Mutiara playing among the mangrove roots on the beach',
      'Grandpa Bahri talking with Sagara and Mutiara in front of the mangrove forest'
    ]
  },
  {
    paragraphs: [
      'But in the last few years, things started to change. On Nusa Timur, some people cut the mangroves to make charcoal, because mangrove charcoal sold well in the city. On Nusa Selatan, other people cut the mangrove forest to make shrimp and fish ponds. Little by little, the green belt around the three islands became thinner. Grandpa Bahri warned the people many times, but many people thought the mangrove forest was still big enough.',
      'One day, the east wind season came, stronger than before. Big waves rolled to the three islands. On the beaches with no mangroves, there were no roots to break the waves. The sea water hit the beach directly. Day after day, the waves took away the sand and land from the beach, and it washed into the sea — this is called abrasion. The beach line slowly moved back, and some coconut trees near the beach fell down because the water took the soil away.',
      'The damage did not stop there. Big waves broke the pond walls on Nusa Selatan, so the new shrimp and fish ponds were destroyed by the sea water. In some villages, sea water went into the wells. The well water became brackish — a little salty and not good to drink. The houses closest to the beach were in danger every time the sea rose. Finally, the people of the three islands understood: their fence was gone.'
    ],
    part: 'Complication',
    imageAlts: [
      'People cutting down mangrove trees to make charcoal',
      'Big waves eroding the bare beach, with a fallen coconut tree',
      'A broken fish pond wall with sea water flooding into a coastal village'
    ]
  },
  {
    paragraphs: [
      'Grandpa Bahri called the people from the three islands to a meeting at the Nusa Barat hall. "The waves did not change. We changed," he said slowly. "Before, the mangrove roots held the waves and kept the coast safe. If we cut all the mangroves, the waves come straight to our houses." Mutiara raised her hand and asked, "But Grandpa, what about the people who need charcoal and fish ponds?"',
      'The people answered that question together in the meeting. The people of Nusa Timur agreed to stop cutting mangroves for charcoal. They made charcoal from coconut shells instead, because there were many coconuts on the three islands, and people usually threw the shells away. The people of Nusa Selatan agreed to move their ponds far from the beach, so they could plant mangroves again along the coast as a fence for the ponds and the villages. Everyone, including children like Sagara and Mutiara, planted thousands of mangrove seedlings along the damaged beach.',
      'A few months later, the seedlings started to grow. Their young roots slowly held the beach mud. It would take many years for the green belt to become thick again, but now the people of the three islands protected it together. One afternoon, Grandpa Bahri stood on the beach with Sagara and Mutiara. He looked far at the hills on the mainland of Jayakarta. "Remember, children," he said, "it is the same on land. If people cut the trees on the hills, the waves will not come — but the land will come down."'
    ],
    part: 'Resolution',
    imageAlts: [
      'The people of the three islands meeting at the Nusa Barat hall',
      'Sagara, Mutiara, and the villagers planting mangrove seedlings together',
      'Grandpa Bahri, Sagara, and Mutiara looking out at the hills, with young mangrove seedlings growing on the beach nearby'
    ]
  }
];

var PART_OPTIONS = ['Orientation', 'Complication', 'Resolution'];

/* ---------------- Kuis: 10 soal ---------------- */
var QUIZ = [
  { question: 'What is the main goal of a narrative text?', options: ['To entertain and give a message.', 'To give technical steps.', 'To show data.', 'To sell a product.'], correct: 'To entertain and give a message.' },
  { question: 'The part that tells who, where, and when is called…?', options: ['Orientation', 'Complication', 'Resolution', 'Conclusion'], correct: 'Orientation' },
  { question: 'Who do we meet at the start of the story?', options: ['Sagara, Mutiara, and Grandpa Bahri.', 'Sagara, Mutiara, and the fishermen.', 'Grandpa Bahri and the coconut farmers.', 'The fishermen and the coconut farmers.'], correct: 'Sagara, Mutiara, and Grandpa Bahri.' },
  { question: 'The main problem starts when…?', options: ['People cut the mangroves for charcoal and fish ponds.', 'The children play at the beach.', 'Grandpa Bahri tells a story.', 'The people plant seedlings.'], correct: 'People cut the mangroves for charcoal and fish ponds.' },
  { question: 'What did Grandpa Bahri call the mangroves?', options: ['Our fence', 'Our garden', 'Our forest', 'Our treasure'], correct: 'Our fence' },
  { question: 'Why did people on Nusa Timur cut the mangroves?', options: ['To make charcoal to sell in the city.', 'To build new houses.', 'To make furniture.', 'To clear land for farming.'], correct: 'To make charcoal to sell in the city.' },
  { question: 'What is the word for when waves wash away the beach\'s sand and land?', options: ['Abrasion', 'Erosion', 'Pollution', 'Flooding'], correct: 'Abrasion' },
  { question: 'What happened to the well water after the mangroves were cut down?', options: ['It became brackish — a little salty.', 'It dried up completely.', 'It became muddy.', 'It turned green.'], correct: 'It became brackish — a little salty.' },
  { question: 'What did the people of Nusa Timur use instead of mangrove wood to make charcoal?', options: ['Coconut shells', 'Bamboo', 'Rice husks', 'Dead leaves'], correct: 'Coconut shells' },
  { question: 'What did Grandpa Bahri say happens if people cut the trees on the hills?', options: ['The land will come down.', 'The animals will disappear.', 'The rain will stop.', 'The rivers will dry up.'], correct: 'The land will come down.' }
];

var TIPS = [
  'Orientation introduces, complication breaks something, resolution settles it. Every story you meet next has the same three parts.',
  'A clue word can carry a whole part: "But in the last few years…" is where a complication usually begins.',
  'When a story ends with a lesson said out loud, that sentence is usually the message the writer wanted you to keep.'
];

/* ---------------- Langkah: 3 blok + 10 soal = 13 ---------------- */
function buildSteps() {
  var steps = [];
  STORY_BLOCKS.forEach(function (block, i) {
    steps.push({
      type: 'block',
      index: i,
      label: 'Reading ' + (i + 1) + ' of ' + STORY_BLOCKS.length,
      title: 'Which part of the story is this?',
      question: 'Name this block: is it the orientation, the complication, or the resolution?',
      options: PART_OPTIONS,
      correct: block.part
    });
  });
  QUIZ.forEach(function (q, i) {
    steps.push({
      type: 'quiz',
      index: i,
      label: 'Question ' + (i + 1) + ' of ' + QUIZ.length,
      title: 'Closing quiz',
      question: q.question,
      options: q.options,
      correct: q.correct
    });
  });
  return steps;
}

var STEPS = buildSteps();
var TOTAL_STEPS = STEPS.length; /* 13 */
var LEGACY_MAX_SCORE = TOTAL_STEPS * 10; /* 130, seperti versi lama */

/* ---------------- State ---------------- */
var State = {
  page: 'welcome-1',
  lives: TOTAL_LIVES,
  stepIndex: 0,
  /* Untuk step bertipe 'block': 'read' (layar baca) atau 'activity'
     (layar soal "which part"). Diset ulang tiap kali stepIndex berubah
     — lihat Steps.start()/Steps.move(). Tidak relevan untuk 'quiz'. */
  stepPhase: 'read',
  /* per langkah: {answered, wrong, revealed, value} — value 1, 0.5, atau 0 */
  steps: STEPS.map(function () { return { answered: false, wrong: 0, revealed: false, value: 0 }; })
};

var STAGES = ['welcome-1', 'welcome-2', 'wait-1', 'video', 'wait-2', 'steps', 'result'];
var STAGE_LABELS = {
  'welcome-1': 'Welcome', 'welcome-2': 'Welcome', 'wait-1': 'Waiting', video: 'Materials',
  'wait-2': 'Waiting', steps: 'Activity', result: 'Results'
};

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
  $('controls').hidden = page !== 'steps';
  syncControlsHeight(); /* Revisi R7: ukur ulang setiap kali kondisi tampil #controls berganti */
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

   Dibedakan dari toast(): toast adalah umpan balik atas apa yang
   BARU SAJA dilakukan siswa (bawah-tengah, dekat jempol); hint
   adalah instruksi tentang apa yang HARUS dilakukan berikutnya
   (kanan atas, jauh dari area sentuh utama). */
var HINT_MS = 3000;

function hint(message) {
  var host = document.getElementById('hintHost');
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
   (lihat Revisi R1), bukan ditulis baru, supaya kalimat yang sudah
   diuji ke siswa tidak berubah maknanya. Diperpendek seperlunya agar
   muat satu-dua baris di pil. */
var HINTS = {
  'welcome-1': 'Tap anywhere to continue',
  'welcome-2': 'Tap to see your path',
  'wait-1':    'Wait for your teacher',
  'video':     'Press play when you are ready',
  'wait-2':    'Wait for your teacher'
};

/* ---------------- Navigator ---------------- */
var Nav = {
  infoIndex: 0,
  timer: null,

  init: function () {
    $('navStudent').textContent = this.studentName();
    this.renderLives();
    this.update();
    this.rotate();

    /* Tambahan T1: folder "home/" tidak pernah ada di proyek ini — tautan
       lama mengarah ke halaman yang tidak ditemukan. Diperbaiki jadi
       "../index.html", sama seperti perbaikan pada #resultBackBtn dan
       goBack() di bawah. */
    $('navHome').addEventListener('click', function () { window.location.href = '../index.html'; });
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
    var pct = ((idx + 1) / STAGES.length) * 100;
    if (State.page === 'steps') {
      /* di tahap langkah, progres mengikuti langkah yang sudah dijawab */
      var done = 0;
      State.steps.forEach(function (s) { if (s.answered) done++; });
      pct = (5 / STAGES.length) * 100 + (done / TOTAL_STEPS) * (100 / STAGES.length);
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

/* ---------------- Skor ---------------- */
var Score = {
  total: function () {
    var sum = 0;
    State.steps.forEach(function (s) { sum += s.value; });
    return sum;
  },
  revealedCount: function () {
    var n = 0;
    State.steps.forEach(function (s) { if (s.revealed) n++; });
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
         maks 130 seperti versi lama) supaya modul lain tidak rusak. */
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
   Sinyal guru dibaca dari kunci bersama nl_teacher_gate_v1 (di-poll),
   dan TeacherAPI tetap bisa dipanggil langsung dari platform guru. */
var Gate = {
  mode: null,
  poll: null,

  show: function (mode, eyebrow, caption) {
    this.mode = mode;
    $('gateEyebrow').textContent = eyebrow;
    $('gateCaption').textContent = caption;
    $('gate').hidden = false;
    if (mode !== 'lives') this.startPolling();
  },
  hide: function () {
    $('gate').hidden = true;
    this.mode = null;
    this.stopPolling();
  },
  isShown: function () { return !$('gate').hidden; },

  startPolling: function () {
    var self = this;
    this.stopPolling();
    this.poll = setInterval(function () {
      var signal = readKey(KEY_TEACHER_GATE);
      if (signal && signal.grant === self.mode) self.release();
    }, 1500);
  },
  stopPolling: function () {
    if (this.poll) { clearInterval(this.poll); this.poll = null; }
  },

  waitBeforeVideo: function () {
    this.show('wait-1', 'Wait for your teacher', 'Please look at your teacher and wait for further instructions.');
    setPage('wait-1');
    hint(HINTS['wait-1']); /* Revisi R3: menggantikan coach mark wait-1 */
    maybeAutoCoach();
  },
  waitAfterVideo: function () {
    this.show('wait-2', 'Video finished', 'Please look at your teacher and wait before the reading begins.');
    setPage('wait-2');
    hint(HINTS['wait-2']); /* Revisi R3: menggantikan coach mark wait-2 */
    maybeAutoCoach();
  },
  /* Catatan: outOfLives() SENGAJA tidak memanggil setPage() (perilaku
     asli) — State.page tetap mengarah ke step yang sedang berjalan, dan
     COACH memang tidak punya entri 'lives' sendiri, jadi tidak perlu
     maybeAutoCoach() di sini. */
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
      Steps.start();
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
    hint(HINTS['video']); /* Revisi R3: menggantikan coach mark video */
    maybeAutoCoach();
  }
};

/* ---------------- 13 langkah ---------------- */
var Steps = {
  audio: null,

  init: function () {
    var self = this;
    $('prevBtn').addEventListener('click', function () { self.move(-1); });
    $('nextBtn').addEventListener('click', function () { self.move(1); });
  },

  /* Step index 0 selalu blok cerita pertama (lihat buildSteps()) — mulai
     dari phase 'read', kecuali entah bagaimana sudah pernah dijawab. */
  start: function () {
    showPage('stepPage');
    setPage('steps');
    State.stepIndex = 0;
    var first = STEPS[0];
    State.stepPhase = (first.type === 'block' && !State.steps[0].answered) ? 'read' : 'activity';
    this.render();
    maybeAutoCoach();
  },

  /* Dipakai goBack()/updateControls() supaya tombol Prev & swipe-back
     tahu ada "layar sebelumnya" bukan cuma dari stepIndex, tapi juga
     dari phase — lihat move() di bawah. */
  canGoBack: function () {
    if (State.stepIndex > 0) return true;
    var step = STEPS[State.stepIndex];
    return step.type === 'block' && State.stepPhase === 'activity';
  },

  /* Revisi 2: untuk step bertipe 'block', Next/Prev pertama-tama
     memindahkan PHASE (read ⇄ activity) pada step index yang SAMA, baru
     berpindah stepIndex kalau memang sudah di ujung phase-nya. Inilah
     yang membuat "layar baca" terasa seperti layar tersendiri tanpa
     menambah TOTAL_STEPS / mengubah kontrak oj_barat_v1. */
  move: function (delta) {
    var step = STEPS[State.stepIndex];

    if (delta > 0 && step.type === 'block' && State.stepPhase === 'read') {
      State.stepPhase = 'activity';
      this.render();
      maybeAutoCoach();
      return;
    }
    if (delta < 0 && step.type === 'block' && State.stepPhase === 'activity') {
      State.stepPhase = 'read';
      this.render();
      maybeAutoCoach();
      return;
    }

    var target = State.stepIndex + delta;
    if (target < 0) return;
    if (target >= TOTAL_STEPS) {
      Result.show();
      return;
    }
    State.stepIndex = target;
    var newStep = STEPS[target];
    if (newStep.type === 'block') {
      /* Mundur ke, atau maju ke step yang SUDAH dijawab: langsung ke
         activity (tampilkan state terkunci, seperti perilaku lama).
         Maju ke step blok yang baru pertama kali disentuh: mulai 'read'. */
      State.stepPhase = (delta < 0 || State.steps[target].answered) ? 'activity' : 'read';
    } else {
      State.stepPhase = 'activity';
    }
    this.render();
    maybeAutoCoach();
  },

  render: function () {
    var step = STEPS[State.stepIndex];
    var state = State.steps[State.stepIndex];
    var self = this;

    var isRead = step.type === 'block' && State.stepPhase === 'read';

    if (step.type === 'block') {
      $('stepLabel').textContent = isRead ? step.label : 'Activity ' + (step.index + 1) + ' of ' + STORY_BLOCKS.length;
    } else {
      $('stepLabel').textContent = step.label;
    }
    /* Judul netral di layar baca supaya tidak menyebut pertanyaan
       "which part" sebelum ceritanya selesai dibaca; step.title (teks
       resmi) tetap dipakai apa adanya di layar aktivitas & kuis. */
    $('stepTitle').textContent = isRead ? 'Read the story' : step.title;
    $('stepFeedback').hidden = true;

    var dots = $('stepDots');
    dots.innerHTML = '';
    for (var i = 0; i < TOTAL_STEPS; i++) {
      var d = document.createElement('span');
      d.className = 'dot' + (State.steps[i].answered ? ' is-done' : i === State.stepIndex ? ' is-now' : '');
      dots.appendChild(d);
    }

    /* Blok cerita: teks + plat gambar per paragraf — HANYA di layar
       baca. Layar aktivitas (di bawah) sengaja tidak menampilkan
       paragraf ini sama sekali, supaya benar-benar terpisah. */
    var story = $('stepStory');
    story.innerHTML = '';
    if (isRead) {
      var block = STORY_BLOCKS[step.index];
      block.paragraphs.forEach(function (text, p) {
        var chapter = document.createElement('div');
        chapter.className = 'chapter';

        var num = document.createElement('span');
        num.className = 'chapter-num';
        num.setAttribute('aria-hidden', 'true');
        num.textContent = (step.index + 1) + '.' + (p + 1);
        chapter.appendChild(num);

        var body = document.createElement('div');
        body.className = 'chapter-body';
        var para = document.createElement('p');
        para.textContent = text;
        body.appendChild(para);

        var base = 'nusa-barat-' + (step.index + 1) + '-' + (p + 1);
        var fig = document.createElement('figure');
        fig.className = 'plate chapter-plate';
        var img = document.createElement('img');
        img.src = 'gambar/' + base + '.jpg';
        img.alt = block.imageAlts[p] || '';
        img.loading = 'lazy';
        img.addEventListener('error', function () { fig.classList.add('is-empty'); });
        fig.appendChild(img);

        var note = document.createElement('span');
        note.className = 'plate-empty';
        note.setAttribute('aria-hidden', 'true');
        note.textContent = 'gambar/' + base + '.jpg';
        fig.appendChild(note);

        var play = document.createElement('button');
        play.type = 'button';
        play.className = 'chapter-plate-btn';
        play.setAttribute('aria-label', 'Play the narration for paragraph ' + (p + 1));
        play.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';
        play.addEventListener('click', function () { self.play('audio/' + base + '.mp3'); });
        fig.appendChild(play);

        body.appendChild(fig);

        var cap = document.createElement('figcaption');
        cap.className = 'chapter-caption';
        cap.textContent = block.imageAlts[p] || '';
        fig.appendChild(cap);

        chapter.appendChild(body);
        story.appendChild(chapter);
      });
      $('stepQuestionLabel').hidden = true;
      $('stepQuestionLabel').textContent = '';
      $('stepQuestion').hidden = true;
    } else if (step.type === 'block') {
      /* Layar aktivitas dari sebuah block: pengingat singkat saja,
         SENGAJA tidak menyebut block.part (itu jawabannya) atau
         mengulang paragraf ceritanya. */
      $('stepQuestionLabel').hidden = false;
      $('stepQuestionLabel').textContent = 'Based on the reading you just finished';
      $('stepQuestion').hidden = true;
    } else {
      $('stepQuestionLabel').hidden = false;
      $('stepQuestionLabel').textContent = 'Closing quiz · question ' + (step.index + 1);
      $('stepQuestion').hidden = false;
      $('stepQuestion').textContent = step.question;
    }

    /* Pilihan jawaban — tidak dirender sama sekali di layar baca, supaya
       layar baca & layar aktivitas benar-benar terpisah (Revisi 2). */
    var box = $('stepAnswers');
    box.innerHTML = '';
    if (!isRead) {
      var wrapper = document.createElement('div');
      wrapper.className = step.type === 'block' ? 'parts' : 'options';
      var keys = ['A', 'B', 'C', 'D'];

      step.options.forEach(function (text, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('data-value', text);
        if (step.type === 'block') {
          btn.className = 'part';
          btn.textContent = text;
        } else {
          btn.className = 'option';
          var key = document.createElement('span');
          key.className = 'option-key';
          key.textContent = keys[i];
          var label = document.createElement('span');
          label.textContent = text;
          btn.appendChild(key);
          btn.appendChild(label);
        }
        btn.addEventListener('click', function () { self.answer(text, btn); });
        wrapper.appendChild(btn);
      });
      box.appendChild(wrapper);

      /* Langkah yang sudah dijawab: tampilkan kembali hasilnya, terkunci. */
      if (state.answered) {
        this.lock(step, state);
      }
    }

    this.updateControls();
    window.scrollTo({ top: 0 });
  },

  lock: function (step, state) {
    var wrapper = $('stepAnswers').firstChild;
    var right = wrapper.querySelector('[data-value="' + step.correct + '"]');
    Array.prototype.forEach.call(wrapper.children, function (b) { b.disabled = true; });
    if (right) right.classList.add(step.type === 'block' ? 'is-good' : 'is-correct');

    var feedback = $('stepFeedback');
    feedback.hidden = false;
    if (state.value === 1) {
      feedback.className = 'feedback is-good';
      feedback.textContent = 'Answered on the first try.';
    } else if (state.value === 0.5) {
      feedback.className = 'feedback is-bad';
      feedback.textContent = 'The correct answer was shown after two misses, so this step counts as half.';
    } else {
      feedback.className = 'feedback is-good';
      feedback.textContent = 'Answered correctly after a second look.';
    }
  },

  answer: function (value, btn) {
    if (Gate.isShown()) return;
    var step = STEPS[State.stepIndex];
    var state = State.steps[State.stepIndex];
    if (state.answered) return;

    var wrapper = $('stepAnswers').firstChild;
    var feedback = $('stepFeedback');
    var correct = value === step.correct;

    if (correct) {
      state.answered = true;
      state.value = state.wrong === 0 ? 1 : 0.5;
      btn.classList.add(step.type === 'block' ? 'is-good' : 'is-correct');
      Array.prototype.forEach.call(wrapper.children, function (b) { b.disabled = true; });
      feedback.hidden = false;
      feedback.className = 'feedback is-good';
      feedback.textContent = state.wrong === 0
        ? (step.type === 'block'
          ? 'Right — this block is the ' + step.correct.toLowerCase() + '.'
          : 'Right. That is the answer.')
        : 'Right this time. Because it took another try, this step counts as half.';
      this.updateControls();
      Nav.update();
      return;
    }

    /* Salah: satu nyawa, boleh dicoba lagi. Setelah dua kali salah,
       jawaban benar ditunjukkan dan langkah dihitung setengah. */
    state.wrong++;
    btn.classList.add(step.type === 'block' ? 'is-bad' : 'is-wrong');
    btn.disabled = true;
    Nav.loseLife();

    feedback.hidden = false;
    feedback.className = 'feedback is-bad';

    if (state.wrong >= REVEAL_AFTER_WRONG) {
      state.answered = true;
      state.revealed = true;
      state.value = 0.5;
      var right = wrapper.querySelector('[data-value="' + step.correct + '"]');
      if (right) right.classList.add(step.type === 'block' ? 'is-good' : 'is-correct');
      Array.prototype.forEach.call(wrapper.children, function (b) { b.disabled = true; });
      feedback.textContent = 'Two misses — here is the answer, marked in green. This step counts as half.';
      toast('Answer revealed · half a step');
    } else {
      feedback.textContent = step.type === 'block'
        ? 'Not that part. Read the block again: does it introduce, break something, or settle it?'
        : 'Not that one. Read the question again and try another answer.';
    }

    this.updateControls();
    Nav.update();
  },

  updateControls: function () {
    var step = STEPS[State.stepIndex];
    var state = State.steps[State.stepIndex];
    var isRead = step.type === 'block' && State.stepPhase === 'read';

    $('prevBtn').disabled = !this.canGoBack();

    if (isRead) {
      /* Layar baca: Next selalu aktif, cuma berarti "lanjut ke soal". */
      $('nextBtn').disabled = false;
      $('nextBtn').textContent = 'Continue';
    } else {
      $('nextBtn').disabled = !state.answered;
      $('nextBtn').textContent = State.stepIndex === TOTAL_STEPS - 1 ? 'See your result' : 'Next';
    }

    /* Penyebutnya TETAP TOTAL_STEPS (13) — ini menghitung LANGKAH yang
       dinilai (kontrak oj_barat_v1.total), bukan jumlah layar. Layar
       baca ditandai lewat prefiks "Reading ·" saja; lihat ringkasan
       Revisi 2 untuk alasan keputusan ini. */
    $('controlCount').textContent = (isRead ? 'Reading · ' : '') + (State.stepIndex + 1) + ' / ' + TOTAL_STEPS;
  },

  play: function (src) {
    if (this.audio) { this.audio.pause(); this.audio = null; }
    var a = new Audio(src);
    this.audio = a;
    var p = a.play();
    if (p && p.catch) p.catch(function () { toast('Narration for this paragraph is not uploaded yet.'); });
  }
};

/* Revisi R7: tinggi bilah #controls dulu ditebak tetap 76px di CSS
   (lihat --controls-h di style_NusaBarat.css). Kalau teks tombol membungkus di
   layar sempit, tebakan itu meleset dan isi halaman tertutup bilah.
   Fungsi ini mengukur tinggi sungguhan dan menuliskannya ke custom
   property, dipanggil dari setPage() setiap kali #controls berganti
   kondisi tampil (satu-satunya titik yang mengubah bar.hidden), dan
   dari resize supaya rewrap teks di layar yang diputar tetap terukur.
   Sengaja dideklarasikan di scope atas (bukan di dalam startSession())
   supaya setPage() — fungsi tingkat atas yang terpisah dari IIFE init
   — bisa memanggilnya juga. */
function syncControlsHeight() {
  var bar = document.getElementById('controls');
  if (!bar || bar.hidden) return;
  document.documentElement.style.setProperty('--controls-h', bar.offsetHeight + 'px');
}
window.addEventListener('resize', syncControlsHeight);

/* ---------------- Hasil ---------------- */
var Result = {
  show: function () {
    showPage('resultPage');
    setPage('result');
    Score.save();
    /* Tambahan T3: navigator disembunyikan saat cetak, jadi identitas
       siswa dipindah ke sini lewat data-attribute yang dibaca #resultPage::before. */
    $('resultPage').setAttribute('data-student', Nav.studentName());

    var revealed = Score.revealedCount();
    $('resultScore').innerHTML =
      '<div><dt>Steps</dt><dd>' + Score.display() + '/' + TOTAL_STEPS + '</dd></div>' +
      '<div><dt>Revealed</dt><dd>' + revealed + '</dd></div>' +
      '<div><dt>Lives left</dt><dd>' + State.lives + '/' + TOTAL_LIVES + '</dd></div>';

    var steps = $('resultSteps');
    steps.innerHTML = '';
    STEPS.forEach(function (step, i) {
      var state = State.steps[i];
      var li = document.createElement('li');
      li.className = 'step-item';
      var n = document.createElement('span');
      n.textContent = (i + 1) < 10 ? '0' + (i + 1) : String(i + 1);
      var label = document.createElement('span');
      label.textContent = step.type === 'block' ? 'Reading ' + (step.index + 1) + ' · ' + step.correct : 'Question ' + (step.index + 1);
      var mark = document.createElement('span');
      mark.className = 'step-mark ' + (state.value === 1 ? 'is-good' : 'is-bad');
      mark.textContent = state.value === 1 ? 'first try' : state.revealed ? 'revealed · ½' : state.value === 0.5 ? 'retried · ½' : 'not answered';
      li.appendChild(n);
      li.appendChild(label);
      li.appendChild(mark);
      steps.appendChild(li);
    });

    var answers = $('resultAnswers');
    answers.innerHTML = '';
    var any = false;
    STEPS.forEach(function (step, i) {
      var state = State.steps[i];
      if (state.value === 1) return;
      any = true;
      var li = document.createElement('li');
      li.className = 'answer-item';
      var qEl = document.createElement('p');
      qEl.className = 'answer-q';
      qEl.textContent = step.type === 'block'
        ? 'Reading ' + (step.index + 1) + ' — which part is it?'
        : (step.index + 1) + '. ' + step.question;
      var right = document.createElement('p');
      right.className = 'answer-right';
      right.textContent = 'Correct answer: ' + step.correct;
      li.appendChild(qEl);
      li.appendChild(right);
      answers.appendChild(li);
    });
    if (!any) {
      var none = document.createElement('li');
      none.className = 'answer-item';
      none.textContent = 'Nothing — all thirteen steps landed on the first try.';
      answers.appendChild(none);
    }

    var tips = $('resultTips');
    tips.innerHTML = '';
    TIPS.forEach(function (text) {
      var li = document.createElement('li');
      li.textContent = text;
      tips.appendChild(li);
    });

    $('resultBackBtn').addEventListener('click', function () {
      $('transitionOverlay').classList.add('is-active');
    });

    maybeAutoCoach();
  }
};

/* ---------------- Back (tombol navigator & edge-swipe) ---------------- */
function goBack() {
  /* Revisi 1: sebelumnya diam saja di sini (return kosong) selagi Gate
     tampil — terasa seperti tombol rusak. Sekarang tetap diblokir
     (memang disengaja, menjaga alur guru) TAPI dengan umpan balik. */
  if (Gate.isShown()) { toast('Back is off while you wait for your teacher.'); return; }
  if (State.page === 'steps' && Steps.canGoBack()) { Steps.move(-1); return; }
  if (window.history.length > 1) window.history.back();
  /* Tambahan T1: lihat catatan di Nav.init() — "home/" tidak ada, yang
     benar adalah "../index.html". */
  else window.location.href = '../index.html';
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
    list.push({ module: 'oj_barat', page: State.page, text: text, at: new Date().toISOString() });
    writeKey('nl_questions_v1', list);
    $('askText').value = '';
    $('askNote').textContent = 'Sent. Your teacher will answer soon.';
    setTimeout(function () { Ask.close(); }, 1100);
  }
};

/* ---------------- Coach mark ----------------
   Tiap entri COACH sekarang { text, target } — target adalah CSS
   selector elemen nyata di layar yang ingin ditunjuk coach mark.
   Kalau satu langkah memang tidak punya elemen spesifik untuk
   ditunjuk (mis. "tap anywhere" di welcome-1), cukup tulis { text }
   tanpa target — Coach.point() akan otomatis jatuh ke kartu
   tengah-layar biasa (fallback) khusus untuk langkah itu saja. */
var COACH = {
  /* Revisi R1: entri 'welcome-1', 'welcome-2', 'wait-1', 'video', dan
     'wait-2' dicabut dari sini — teksnya TIDAK dibuang, tapi dipindah
     ke peta HINTS (dekat function toast()) dan sekarang tampil sebagai
     notifikasi ringkas pojok kanan atas, bukan coach mark. Lihat
     AUTO_COACH_KEYS di dekat maybeAutoCoach(): coach mark otomatis
     pertama yang dilihat siswa sekarang adalah 'block-read', persis
     di bawah ini. Tombol #navCoach manual tidak terpengaruh sama
     sekali oleh perubahan ini. */

  /* Revisi 2 memecah step 'block' jadi dua layar berurutan (baca lalu
     aktivitas) pada step index yang sama — entri COACH di bawah
     mengikuti pemecahan itu, supaya target tiap kartu adalah elemen
     yang benar-benar terlihat di layarnya masing-masing (sebelumnya
     tiga kartu ini menunjuk ke elemen yang tadinya tampil bersamaan
     di satu layar). Lihat Coach.key(). */
  'block-read': [
    { text: 'Read the block, then name it: orientation, complication, or resolution.', target: '#stepStory' },
    { text: 'Tap the play badge on a picture to hear that paragraph read aloud.', target: '.chapter-plate-btn' }
  ],
  'block-activity': [
    { text: 'Orientation introduces who, where, and when. A complication breaks something. A resolution settles it.', target: '#stepQuestionLabel' },
    { text: 'Pick the part that matches what you just read.', target: '#stepAnswers .parts' }
  ],
  quiz: [
    { text: 'One question at a time, ten in total.', target: '#stepLabel' },
    { text: 'A wrong answer costs one life and stays crossed out; you can still find the right one.', target: '#navHearts' },
    { text: 'After two misses the answer is shown and that step counts as half.', target: '#stepAnswers .options' }
  ],
  result: [
    { text: 'This page shows your thirteen steps, which ones were revealed, and what to carry to Nusa Timur.', target: '#resultScore' }
  ]
};

/* Catatan tambahan (opsional, dikerjakan sekalian): judul tooltip coach
   mark sebelumnya statis "How this works" di semua langkah. Peta kecil
   ini membuatnya kontekstual per jenis layar — lihat Coach.render(). */
var COACH_TITLES = {
  /* Revisi R1: judul untuk 'welcome-1', 'welcome-2', 'wait-1', 'video',
     dan 'wait-2' dicabut bersamaan dengan entrinya di COACH — kelima
     layar itu tidak lagi memakai coach mark sama sekali. */
  'block-read': 'Reading',
  'block-activity': 'Name the part',
  quiz: 'Closing quiz',
  result: 'Your results'
};

var Coach = {
  steps: [],
  index: 0,
  resizeHandler: null,
  settleTimer: null,

  init: function () {
    var self = this;
    $('coachNext').addEventListener('click', function () { self.next(); });
    $('coachClose').addEventListener('click', function () { self.close(); });
  },

  key: function () {
    if (State.page !== 'steps') return State.page;
    var step = STEPS[State.stepIndex];
    if (step.type === 'block') return 'block-' + State.stepPhase; /* 'block-read' atau 'block-activity' */
    return step.type; /* 'quiz' */
  },

  reducedMotion: function () {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  },

  isOpen: function () {
    return !$('coachWrap').hidden;
  },

  open: function () {
    var key = this.key();
    /* Tandai "sudah pernah dilihat" di sini juga (bukan hanya di
       maybeAutoCoach()), supaya membuka manual lewat #navCoach tidak
       ditimpa lagi oleh pemicu otomatis yang masih tertunda untuk
       layar yang sama — lihat maybeAutoCoach() di bawah. */
    AutoCoach.shown[key] = true;
    this.steps = COACH[key] || [{ text: 'Nothing to explain on this screen yet.' }];
    this.index = 0;
    $('coachWrap').hidden = false;
    $('navCoach').classList.add('is-on');
    /* Kunci scroll selagi coach mark aktif, supaya highlight tidak
       "meleset" dari elemen target kalau halaman ikut ter-scroll. */
    document.documentElement.classList.add('no-scroll');

    var self = this;
    this.resizeHandler = function () { self.point(self.currentTarget()); };
    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('orientationchange', this.resizeHandler);

    this.render();
  },

  currentTarget: function () {
    var item = this.steps[this.index];
    return item && item.target;
  },

  render: function () {
    var item = this.steps[this.index] || {};
    $('coachStep').textContent = 'Step ' + (this.index + 1) + ' of ' + this.steps.length;
    $('coachTitle').textContent = COACH_TITLES[this.key()] || 'How this works';
    $('coachText').textContent = item.text || '';
    $('coachNext').textContent = this.index === this.steps.length - 1 ? 'Got it' : 'Continue';
    this.point(item.target);
  },

  /* Cari elemen target di layar dan posisikan spotlight + tooltip di
     dekatnya. Selector kosong ATAU elemen yang tidak ada di DOM sama-
     sama jatuh ke kartu tengah-layar biasa — tidak pernah error. */
  point: function (selector) {
    var wrap = $('coachWrap');
    var spotlight = $('coachSpotlight');
    var tooltip = $('coachTooltip');
    var el = null;
    try { el = selector ? document.querySelector(selector) : null; } catch (e) { el = null; }

    if (!el) {
      wrap.classList.add('is-plain');
      spotlight.hidden = true;
      /* lepas posisi inline dari langkah sebelumnya, supaya aturan
         CSS .is-plain (kartu di tengah) yang berlaku, bukan koordinat lama */
      tooltip.style.top = '';
      tooltip.style.left = '';
      return;
    }

    wrap.classList.remove('is-plain');
    var rect = el.getBoundingClientRect();
    var visible = rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
    var self = this;

    clearTimeout(this.settleTimer);
    if (!visible) {
      spotlight.style.opacity = '0';
      el.scrollIntoView({ behavior: this.reducedMotion() ? 'auto' : 'smooth', block: 'center' });
      this.settleTimer = setTimeout(function () {
        self.place(el, spotlight, tooltip);
        spotlight.style.opacity = '';
      }, this.reducedMotion() ? 0 : 380);
    } else {
      this.place(el, spotlight, tooltip);
    }
  },

  /* Ukur posisi elemen target, letakkan spotlight tepat di atasnya,
     lalu tempelkan tooltip di sisi yang muat (bawah, atau atas kalau
     bawah tidak cukup), dijepit minimal 6px dari tepi layar. Pola
     "geser ke luar layar dulu untuk diukur, lalu jepit ke tepi" ini
     sama seperti initDevTooltip() di bawah — di sini diterapkan ke
     dua sumbu karena kartu ini jauh lebih besar dari tooltip dev. */
  place: function (el, spotlight, tooltip) {
    var pad = 6;
    var r = el.getBoundingClientRect();
    spotlight.style.top = (r.top - pad) + 'px';
    spotlight.style.left = (r.left - pad) + 'px';
    spotlight.style.width = (r.width + pad * 2) + 'px';
    spotlight.style.height = (r.height + pad * 2) + 'px';
    spotlight.hidden = false;

    var GAP = 14, MARGIN = 6;
    var vw = window.innerWidth, vh = window.innerHeight;
    tooltip.style.left = '-9999px';
    tooltip.style.top = '-9999px';
    var t = tooltip.getBoundingClientRect();

    var fitsBelow = r.bottom + GAP + t.height <= vh - MARGIN;
    var fitsAbove = r.top - GAP - t.height >= MARGIN;
    var top = (fitsBelow || !fitsAbove) ? (r.bottom + GAP) : (r.top - GAP - t.height);
    top = Math.max(MARGIN, Math.min(top, vh - t.height - MARGIN));

    var left = r.left + r.width / 2 - t.width / 2;
    left = Math.max(MARGIN, Math.min(left, vw - t.width - MARGIN));

    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
  },

  next: function () {
    if (this.index < this.steps.length - 1) { this.index++; this.render(); }
    else this.close();
  },

  close: function () {
    $('coachWrap').hidden = true;
    $('coachWrap').classList.remove('is-plain');
    $('coachSpotlight').hidden = true;
    $('navCoach').classList.remove('is-on');
    document.documentElement.classList.remove('no-scroll');
    clearTimeout(this.settleTimer);
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      window.removeEventListener('orientationchange', this.resizeHandler);
      this.resizeHandler = null;
    }
  }
};

/* ---------------- Revisi 3: pemicu otomatis coach mark ----------------
   AutoCoach TIDAK menyimpan apa pun ke localStorage — sengaja hanya
   state sesi-berjalan (di memori). Kalau tab ditutup lalu dibuka lagi,
   semua coach mark akan otomatis tampil sekali lagi dari awal. Ini
   pilihan sadar: nilainya cuma untuk kenyamanan SATU sesi belajar;
   menyimpannya permanen berisiko coach mark tidak pernah muncul lagi
   untuk murid yang benar-benar baru membuka modul ini di sesi/
   perangkat lain. Lihat ringkasan akhir untuk alasan lebih lengkap. */
var AutoCoach = {
  enabled: true,
  shown: {},
  timer: null
};

/* Revisi R1: coach mark otomatis hanya boleh terbuka SETELAH sesi
   video terlewati. Layar sebelum itu (welcome, gerbang tunggu, dan
   halaman video sendiri) sekarang memakai hint pojok kanan atas —
   lihat peta HINTS. Daftar ini sengaja eksplisit: maybeAutoCoach()
   dipanggil dari banyak tempat, jadi menyaring di satu titik lebih
   aman daripada mencabut panggilannya satu per satu. Tombol #navCoach
   TIDAK lewat sini — siswa tetap bisa membuka tur manual kapan pun. */
var AUTO_COACH_KEYS = ['block-read', 'block-activity', 'quiz', 'result'];

function maybeAutoCoach() {
  if (!AutoCoach.enabled) return;
  var key = Coach.key();
  if (AUTO_COACH_KEYS.indexOf(key) === -1) return;
  if (!COACH[key]) return; /* layar ini memang belum punya skrip coach */
  if (AutoCoach.shown[key]) return; /* sudah pernah dilihat sesi ini */

  clearTimeout(AutoCoach.timer);
  AutoCoach.timer = setTimeout(function () {
    /* Layar bisa saja sudah berpindah lagi selama jeda ini (navigasi
       cepat), atau sudah ditampilkan manual lewat #navCoach sementara
       menunggu (Coach.open() ikut menandai AutoCoach.shown) — pada
       kedua kasus itu, jangan buka lagi / jangan buka yang salah. */
    if (Coach.key() !== key) return;
    if (AutoCoach.shown[key]) return;
    if (!$('askPanel').hidden) return; /* jangan menyela dialog yang terbuka */
    if (Coach.isOpen()) return;
    Coach.open();
  }, 500);
}

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
  /* Revisi R6: click -> onTap, supaya menggulir welcome-2 di bawah
     tidak salah terbaca sebagai tap. */
  onTap(w1, function () {
    if (step1Done) return;
    step1Done = true;
    w1.hidden = true;
    w2.hidden = false;
    hint(HINTS['welcome-2']); /* Revisi R3: menggantikan coach mark welcome-2 */
    setPage('welcome-2');
    maybeAutoCoach();
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
      hint('Tap again to start'); /* Revisi R3: hint kedua untuk tahap tap kedua */
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

    if (!$('stepPage').hidden) {
      var step = STEPS[State.stepIndex];
      var state = State.steps[State.stepIndex];
      /* Revisi 2: kalau sedang di layar BACA, belum ada pilihan untuk
         diklik di layar ini — langkah dev "lolos" yang masuk akal
         adalah lanjut dulu ke layar aktivitasnya (setara klik Continue). */
      if (step.type === 'block' && State.stepPhase === 'read') { Steps.move(1); return; }
      if (state.answered) { Steps.move(1); return; }
      var target = $('stepAnswers').querySelector('[data-value="' + step.correct + '"]');
      if (target && !target.disabled) { target.click(); return; }
    }

    flashEmpty();
  });

  /* Revisi 4: tombol dev kedua — toggle on/off untuk pemicu otomatis
     coach mark (AutoCoach, Revisi 3). Dibungkus di initDevPanel() juga,
     supaya ikut terhapus bersama sisa mode pengembang sebelum peluncuran. */
  var coachBtn = $('devCoachToggle');
  if (coachBtn) {
    coachBtn.classList.toggle('is-on', AutoCoach.enabled);
    coachBtn.addEventListener('click', function () {
      AutoCoach.enabled = !AutoCoach.enabled;
      coachBtn.classList.toggle('is-on', AutoCoach.enabled);
      toast('Auto coach mark: ' + (AutoCoach.enabled ? 'ON' : 'OFF'));
    });
  }
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
    var stepInfo = '';
    if (State.page === 'steps') {
      stepInfo = ' · ' + (State.stepIndex + 1);
      if (STEPS[State.stepIndex].type === 'block') stepInfo += ' · ' + State.stepPhase;
    }
    tip.textContent = '(' + State.page + stepInfo + ')';
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
/* ====================== AKHIR MODE PENGEMBANG ====================== */

/* ---------------- Inisialisasi ---------------- */
(function init() {
  /* Nusa Barat adalah pulau pertama Ocean Journey — tidak ada prasyarat. */
  if (DEV_MODE) { initDevPanel(); initDevDrag(); initDevTooltip(); }
  initSwipeBack();

  /* Revisi 3: Coach.init() dipindah ke sini (sebelumnya di dalam
     startSession()) supaya tombol Continue/Close di tooltip-nya sudah
     aktif SEBELUM coach mark welcome-1 bisa terbuka otomatis — welcome-1
     tampil sebelum startSession() pernah dipanggil. */
  Coach.init();

  /* Catatan tambahan (opsional): tutup dialog "Ask" atau coach mark yang
     sedang terbuka lewat tombol Escape, untuk aksesibilitas keyboard. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!$('askPanel').hidden) { Ask.close(); return; }
    if (Coach.isOpen()) { Coach.close(); return; }
  });

  function startSession() {
    $('appShell').hidden = false;
    Nav.init();
    Video.init();
    Steps.init();
    Ask.init();
    Gate.waitBeforeVideo();
  }

  $('welcome1').hidden = false;
  setPage('welcome-1');
  hint(HINTS['welcome-1']); /* Revisi R3: menggantikan coach mark welcome-1 */
  maybeAutoCoach();
  initWelcome(startSession);
})();
