/* ============================================================
   Sunda Kelapa — NarrativeLearn  (re-design)
   /lake-lembayung/sunda-kelapa/

   Alur: locked → welcome 1 → welcome 2 → tunggu guru → video →
   tunggu guru → Round 1 (instruksi → aktivitas) → Round 2 (instruksi →
   aktivitas) → kuis 15 soal → hasil. Instruksi & aktivitas tiap ronde
   sengaja dua layar terpisah (#roundIntroPage lalu #roundPage) supaya
   teks bacaan tidak bercampur dalam satu scroll dengan mekanik klik.

   Penilaian: 20 petunjuk = 4 angka + 1 nama + 15 soal kuis.
   Soal kuis dihitung "first try" kalau benar tanpa salah dulu.
   Tidak ada lulus/gagal — hasilnya ditampilkan apa adanya.
   Nyawa: 7, hanya berkurang saat jawaban kuis salah (klik salah di
   Round 1/2 tidak menghukum, sama seperti versi lama). Habis →
   layar tunggu guru; guru yang memulihkan.

   Navigasi "back" (#navBack + gesture swipe) sadar terhadap urutan
   stage internal lewat BACKABLE_STAGES, bukan window.history — lihat
   Nav.goBack(). Ronde/soal kuis yang sudah pernah dilewati ditampilkan
   ULANG dalam mode read-only saat di-back (Round.isDone / mode review
   di Quiz.render), supaya nyawa & skor yang sudah tercatat tidak ikut
   berubah hanya karena siswa melihat lagi ke belakang.

   Coach mark otomatis (lihat COACH, AUTO_COACH_STAGES, maybeAutoCoach):
   muncul sekali per stage yang punya mekanik nyata (video/round/kuis/
   hasil) — bukan di welcome/tunggu-guru/instruksi ronde, yang sudah
   cukup jelas dari teks di layar itu sendiri. #navCoach tetap bisa
   dipakai manual kapan saja, di halaman mana saja, terlepas dari flag
   "sekali" atau toggle developer di bawah.

   Kunci localStorage (kontrak lintas modul, TIDAK BERUBAH):
     lake_bukit_v1 — prasyarat
     lake_sunda_v1 — {v,status,score,maxScore,stars,correct,total,livesUsed,attempts,completedAt}
     nl_student_v1, nl_questions_v1
     lake_sunda_attempt_temp — sessionStorage

   Kunci localStorage BARU (di luar kontrak di atas — khusus coach mark
   otomatis, aman ditambah/dihapus tanpa memengaruhi modul lain):
     lake_sunda_coach_seen_v1 — { [namaStage]: true, ... }
   ============================================================ */

/* ============================================================
   ⚠️ MODE PENGEMBANG — HAPUS SEBELUM LAUNCHING
   DEV_MODE=true → gembok prasyarat dilewati + tombol bulat hijau
   muncul. Satu klik = meloloskan SATU langkah yang sedang tampil
   (gerbang guru, satu petunjuk, satu soal).
   ============================================================ */
var DEV_MODE = true;
/* ====================== AKHIR CATATAN ATAS ====================== */

var KEY_PREREQ = 'lake_bukit_v1';
var KEY_SELF = 'lake_sunda_v1';
var KEY_STUDENT = 'nl_student_v1';
var KEY_ATTEMPT = 'lake_sunda_attempt_temp';
var KEY_COACH_SEEN = 'lake_sunda_coach_seen_v1'; /* BARU — di luar kontrak lama, lihat catatan di kepala file */

var TOTAL_LIVES = 7;

/* ---------------- Cerita: {w} = kata yang bisa diklik, r = ronde ---------------- */
var STORY = [
  [
    { w: 'Three days', r: 1 },
    ' after a flash flood struck Jayakarta Province, ',
    { w: 'Shofia', r: 2 },
    ' returned to Sunda Kelapa Village with several members of the Jayakarta SAR (Search and Rescue) Team. A landslide from Bukit Camar that had fallen into the lake stirred up the water at its source, carrying thick mud into every resident\'s well along the edge of the village. Out of roughly ',
    { w: 'one hundred twenty families', r: 1 },
    ' in the village, ',
    { w: 'eleven wells', r: 1 },
    ' — the main ones they normally relied on — were now all contaminated. Water that used to be clear had turned murky brown and smelled of earth; when tasted, it was sour and left a gritty film on the tongue. Some residents who dared to cook with it still felt nauseous, while children and the elderly began to look weak from a lack of safe drinking water.'
  ],
  [
    'A young mother named ',
    { w: 'Sri', r: 2 },
    ' carried her fussy child while whispering to her neighbor, "It\'s already been ',
    { w: 'two days', r: 1 },
    ' and he\'s only sipping the last of our bottled water. I\'m afraid he\'ll get sick." Her neighbor, ',
    { w: 'Mr. Yanto', r: 2 },
    ', nodded with concern. "I hope the SAR team finds a solution soon."'
  ],
  [
    '"We can\'t wait too long for water aid from the city," said ',
    { w: 'Ms. Aminah', r: 2 },
    ', the head of Sunda Kelapa Village, to ',
    { w: 'Shofia', r: 2 },
    '. "Our bottled water is almost gone — it might only last ',
    { w: 'one more day', r: 1 },
    '."'
  ],
  [
    'Among the members of the Jayakarta SAR Team, ',
    { w: 'Shofia', r: 2 },
    ' was known as the one who understood water and soil best — she had completed ',
    { w: 'three months', r: 1 },
    ' of special training in emergency water provision before joining the team, something few other village volunteers had. She knew that digging an emergency well couldn\'t be done carelessly; choosing the wrong spot could mean the water that came out would also be contaminated, or the ground nearby could still be too unstable after the landslide, making it dangerous to dig.'
  ],
  [
    'After studying the village map and observing the direction of the landslide mud, ',
    { w: 'Shofia', r: 2 },
    ' settled on a spot near a small hill at the western edge of the village, about ',
    { w: 'eight hundred meters', r: 1 },
    ' from the main path of the mudflow, where the ground was still stable. She believed the groundwater at that spot was likely still clean.'
  ],
  [
    'But the challenges didn\'t stop there. The drilling equipment they had was limited, and the terrain at the spot ',
    { w: 'Shofia', r: 2 },
    ' had chosen was difficult for vehicles to reach. Her team worked together with a dozen village youths, carrying the equipment by hand along a footpath ',
    { w: 'almost one kilometer', r: 1 },
    ' long, muddy and slippery from the recent rain.'
  ],
  [
    'On the ',
    { w: 'fourth day', r: 1 },
    ' after the disaster, when the supply of bottled water aid had completely run out, the team worked without rest from morning until evening — drilling nearly ',
    { w: 'nine meters', r: 1 },
    ' deep, checking the depth, and testing the quality of the water that came out every ',
    { w: 'few hours', r: 1 },
    '. As dusk approached, clear water finally began to gush from the emergency well. ',
    { w: 'Shofia', r: 2 },
    ' carefully checked its clarity, tasted a little, then smiled with relief to see the water was clear, fresh, and no longer smelled of mud.'
  ],
  [
    '"The water is safe," she told the residents who had been waiting since morning.'
  ],
  [
    'A small cheer broke out among the residents of Sunda Kelapa Village. Children ran around carrying buckets, while the adults took turns lining up to collect clean water. ',
    { w: 'Ms. Aminah', r: 2 },
    ' thanked ',
    { w: 'Shofia', r: 2 },
    ' and her team, who had helped the village get through the hardest days after the disaster.'
  ],
  [
    'For ',
    { w: 'Shofia', r: 2 },
    ', that small well was more than just a water source. For the whole of Sunda Kelapa Village, it was a sign that hope could still grow, even from ground that had been torn apart by disaster.'
  ]
];

/* Target tiap ronde. Kata {w} lain dengan r yang sama tetap bisa diklik
   sebagai pengecoh — klik salah hanya bergetar, tanpa kehilangan nyawa. */
var ROUND1_TARGETS = ['one hundred twenty families', 'eleven wells', 'eight hundred meters', 'nine meters'];
var ROUND2_TARGETS = ['Shofia'];

var ROUNDS = [
  {
    round: 1,
    title: 'Find the hidden numbers',
    label: 'Round 1 of 2',
    targets: ROUND1_TARGETS,
    prompt: 'Tap the words in the story that are a number or a quantity. A correct tap turns the word green; a wrong one only shakes — no life is lost. Find all four before you move on: this round counts toward your final tally.'
  },
  {
    round: 2,
    title: 'Find the one name that matters',
    label: 'Round 2 of 2',
    targets: ROUND2_TARGETS,
    prompt: 'Same story, new goal: find the name of the SAR team member who located the well site — not an ordinary villager. The other names stay tappable on purpose. No life is lost for a wrong tap, and this round counts too.'
  }
];

/* ---------------- Kuis: 15 soal ---------------- */
var QUIZ = [
  { question: 'How many days after the flash flood did Shofia return to Sunda Kelapa Village?', options: ['One day', 'Two days', 'Three days', 'Five days'], answer: 2, feedback: 'The text states "three days after the flash flood."' },
  { question: 'What was Sri worried about regarding her child, in her conversation with Mr. Yanto?', options: ['Her child was cold', 'Her child was getting sick from too little clean water', 'Her child was afraid of the dark', 'Her child lost a toy'], answer: 1, feedback: 'Sri said her child was "only sipping the last of our bottled water" and she was afraid he would get sick.' },
  { question: 'How deep was the emergency well that was dug?', options: ['Five meters', 'Nine meters', 'Twelve meters', 'Three meters'], answer: 1, feedback: 'The text states the team "drilled nearly nine meters deep."' },
  { question: 'Why was Shofia trusted to choose the location for the emergency well?', options: ['Because she was the village head', 'Because she was the strongest digger', 'Because she had completed special training in emergency water provision', 'Because she was the only team member present'], answer: 2, feedback: 'Shofia "had completed three months of special training in emergency water provision."' },
  { question: 'What caused the wells in Sunda Kelapa Village to become contaminated?', options: ['A leak from a factory\'s waste', 'A landslide from Bukit Camar that fell into the lake', 'An earthquake that damaged the water pipes', 'A long dry season'], answer: 1, feedback: 'A landslide from Bukit Camar fell into the lake, stirred up the water, and carried mud into the wells.' },
  { question: 'How many families in Sunda Kelapa Village were affected?', options: ['Eighty families', 'One hundred families', 'One hundred twenty families', 'One hundred fifty families'], answer: 2, feedback: 'The text states "roughly one hundred twenty families in the village."' },
  { question: 'How many main wells in the village were contaminated?', options: ['Eight wells', 'Eleven wells', 'Fifteen wells', 'Twenty wells'], answer: 1, feedback: 'The text states "eleven wells… were now all contaminated."' },
  { question: 'According to the text, what did the water look like after it was contaminated?', options: ['Clear but salty', 'Murky brown and smelled of earth', 'Green and foamy', 'Still clear but cold'], answer: 1, feedback: 'The text states the water "turned murky brown and smelled of earth."' },
  { question: 'What was the name of the neighbor Sri spoke to?', options: ['Mr. Yanto', 'Mr. Karta', 'Mr. Rosyad', 'Mr. Slamet'], answer: 0, feedback: 'The text states Sri whispered to her neighbor, Mr. Yanto.' },
  { question: 'Who was the head of Sunda Kelapa Village in this story?', options: ['Sri', 'Shofia', 'Ms. Aminah', 'Mr. Yanto'], answer: 2, feedback: 'The text states "Ms. Aminah, the head of Sunda Kelapa Village."' },
  { question: 'What did Ms. Aminah say about the village\'s bottled water supply?', options: ['Still plenty, enough for a week', 'Almost gone, might only last one more day', 'Completely gone since yesterday', 'Just resupplied from the city'], answer: 1, feedback: 'She said it was "almost gone — it might only last one more day."' },
  { question: 'About how far was the emergency well site from the main mudflow path?', options: ['Two hundred meters', 'Five hundred meters', 'Eight hundred meters', 'One kilometer'], answer: 2, feedback: 'The spot was "about eight hundred meters from the main path of the mudflow."' },
  { question: 'How did the team carry their equipment to the drilling site?', options: ['By open-bed truck', 'Carried it together by hand along a footpath', 'By helicopter', 'The equipment was already at the site'], answer: 1, feedback: 'The team carried the equipment by hand along a footpath.' },
  { question: 'On what day after the disaster did clear water finally come out of the emergency well?', options: ['Second day', 'Third day', 'Fourth day', 'Fifth day'], answer: 2, feedback: 'The text states "on the fourth day after the disaster… clear water finally began to gush out."' },
  { question: 'What did Shofia do to make sure the emergency well\'s water was safe to drink?', options: ['Sent a sample to a city laboratory', 'Checked its clarity and tasted a little', 'Waited for the village head\'s permission', 'Asked residents to try it first'], answer: 1, feedback: 'Shofia "carefully checked its clarity, tasted a little."' }
];

var TIPS = [
  'Numbers and quantities are the easiest details to check — scan for them first, then read around them for meaning.',
  'A name matters most when the text tells you what that person did. Read the sentence, not just the word.',
  'When a question asks "why", the answer is usually one sentence away from the fact itself.'
];

var TOTAL_CLUES = ROUND1_TARGETS.length + ROUND2_TARGETS.length + QUIZ.length; /* 20 */

/* ---------------- State ---------------- */
var State = {
  page: 'welcome-1',
  lives: TOTAL_LIVES,
  roundIndex: 0,
  roundFound: [[], []],        /* temuan per ronde — bertahan walau di-back, TIDAK direset tiap render */
  roundSkipped: [false, false],/* ronde ini diakhiri lewat tombol skip? (utk tandai is-missed saat review) */
  quizIndex: 0,
  quizFurthest: 0,             /* soal terjauh yg sudah pernah dijawab benar — dipakai utk mode review saat back */
  quizClean: true,
  quizFirstTry: 0,
  retried: [],                 /* index soal yang butuh percobaan kedua */
  autoCoachEnabled: true       /* toggle developer #devCoachToggle — lihat Revisi 4 */
};

var STAGES = ['welcome-1', 'welcome-2', 'wait-1', 'video', 'wait-2', 'round-1-intro', 'round-1', 'round-2-intro', 'round-2', 'quiz', 'result'];
var STAGE_LABELS = {
  'welcome-1': 'Welcome', 'welcome-2': 'Welcome', 'wait-1': 'Waiting', video: 'Materials',
  'wait-2': 'Waiting', 'round-1-intro': 'Round 1', 'round-1': 'Round 1',
  'round-2-intro': 'Round 2', 'round-2': 'Round 2', quiz: 'Quiz', result: 'Results'
};
/* Subset STAGES yang jadi tujuan sah tombol back (#navBack + swipe).
   Welcome & gerbang guru sengaja tidak termasuk — lihat Nav.goBack(). */
var BACKABLE_STAGES = ['video', 'round-1-intro', 'round-1', 'round-2-intro', 'round-2', 'quiz', 'result'];

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
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* diamkan */ }
}
function readAttempt() {
  try { return parseInt(sessionStorage.getItem(KEY_ATTEMPT) || '1', 10); } catch (e) { return 1; }
}
function bumpAttempt() {
  try { sessionStorage.setItem(KEY_ATTEMPT, String(readAttempt() + 1)); } catch (e) { /* tidak kritis */ }
}

function hasSeenCoach(stage) {
  var seen = readKey(KEY_COACH_SEEN);
  return !!(seen && seen[stage]);
}
function markCoachSeen(stage) {
  var seen = readKey(KEY_COACH_SEEN) || {};
  seen[stage] = true;
  writeKey(KEY_COACH_SEEN, seen);
}

function setPage(page) {
  State.page = page;
  Nav.update();
  FloatBack.sync();
  if (HINTS[page]) hint(HINTS[page], HINTS_ON_DARK[page]);   /* Revisi R3 */
}

function showPage(id) {
  Array.prototype.forEach.call(document.querySelectorAll('.page'), function (el) { el.hidden = el.id !== id; });
  window.scrollTo({ top: 0 });
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

    $('navHome').addEventListener('click', function () { window.location.href = '../index.html'; }); /* Tambahan T1: home/ tidak ada, sama seperti tautan di index_SundaKelapa.html */
    $('navBack').addEventListener('click', function () { Nav.goBack(); });
    $('navAsk').addEventListener('click', function () { Ask.open(); });
    $('navCoach').addEventListener('click', function () { Coach.open(); });
  },

  /* "Back" sadar urutan internal (BACKABLE_STAGES), bukan browser history.
     - Diblokir total selama gerbang guru tampil (Gate.isShown()) — dipertahankan.
     - Di dalam kuis, mundur satu SOAL dulu sebelum keluar ke Round 2.
     - Tidak ada tujuan mundur dari 'video': stage paling awal yang bisa
       di-back, karena 'wait-1' sebelumnya adalah gerbang guru, bukan
       layar siswa yang masuk akal untuk dikunjungi ulang.
     - Ronde/soal yang sudah dilewati tampil ulang read-only (Round.isDone,
       mode review di Quiz.render) — nyawa & skor yang sudah tercatat
       tidak berubah hanya karena dilihat lagi. */
  goBack: function () {
    if (Gate.isShown()) return;
    var page = State.page;

    if (page === 'quiz' && State.quizIndex > 0) {
      Quiz.showQuestion(State.quizIndex - 1);
      return;
    }

    var idx = BACKABLE_STAGES.indexOf(page);
    if (idx <= 0) return; /* di 'video' atau di luar daftar: tidak ada tujuan mundur */
    var target = BACKABLE_STAGES[idx - 1];

    if (target === 'video') { Video.start(); return; }
    if (target === 'round-1-intro') { Round.enterIntro(0); return; }
    if (target === 'round-1') { Round.enterActivity(0); return; }
    if (target === 'round-2-intro') { Round.enterIntro(1); return; }
    if (target === 'round-2') { Round.enterActivity(1); return; }
    if (target === 'quiz') { Quiz.showQuestion(QUIZ.length - 1); return; }
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

  infoTexts: function () {
    return [
      'Stage: ' + (STAGE_LABELS[State.page] || 'Welcome'),
      'Clues: ' + Score.clues() + ' of ' + TOTAL_CLUES,
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

/* ---------------- Skor: 20 petunjuk ---------------- */
var Score = {
  clues: function () { return State.roundFound[0].length + State.roundFound[1].length + State.quizFirstTry; },
  stars: function () {
    var pct = (this.clues() / TOTAL_CLUES) * 100;
    if (pct >= 85) return 3;
    if (pct >= 70) return 2;
    if (pct >= 60) return 1;
    return 0;
  },
  save: function () {
    var clues = this.clues();
    writeKey(KEY_SELF, {
      v: 1,
      status: 'completed',
      /* score/maxScore/stars dipertahankan bentuknya (10 poin per petunjuk,
         seperti versi lama) supaya modul lain tidak rusak. */
      score: clues * 10,
      maxScore: TOTAL_CLUES * 10,
      stars: this.stars(),
      correct: clues,
      total: TOTAL_CLUES,
      livesUsed: TOTAL_LIVES - State.lives,
      attempts: readAttempt(),
      completedAt: new Date().toISOString()
    });
  }
};

/* ---------------- Gerbang guru ----------------
   TeacherAPI global — platform guru tinggal memanggilnya nanti. */
var Gate = {
  mode: null,

  show: function (mode, eyebrow, caption) {
    this.mode = mode;
    $('gateEyebrow').textContent = eyebrow;
    $('gateCaption').textContent = caption;
    $('gate').hidden = false;
    FloatBack.sync();
  },
  hide: function () {
    $('gate').hidden = true;
    this.mode = null;
    FloatBack.sync();
  },
  isShown: function () { return !$('gate').hidden; },

  waitBeforeVideo: function () {
    this.show('wait-1', 'Wait for your teacher', 'Please look at your teacher and wait for further instructions.');
    setPage('wait-1');
  },
  waitAfterVideo: function () {
    this.show('wait-2', 'Video finished', 'Please look at your teacher and wait before the first round begins.');
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
      Round.start();
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
    maybeAutoCoach('video');
  }
};

/* ---------------- Round 1 & 2: instruksi lalu aktivitas ----------------
   Tiap ronde sekarang dua layar (Revisi 2): #roundIntroPage (judul +
   instruksi lengkap + tombol mulai) lalu #roundPage (cerita + kata yang
   bisa diklik + penghitung). Temuan disimpan PER RONDE di
   State.roundFound (bukan direset tiap render) supaya kalau siswa
   mundur (Nav.goBack) ke ronde yang sudah selesai, halamannya tampil
   apa adanya secara read-only, bukan direset kosong (Revisi 1). */
var Round = {
  init: function () {
    var self = this;
    $('roundStartBtn').addEventListener('click', function () { self.enterActivity(State.roundIndex); });
    $('roundContinueBtn').addEventListener('click', function () { self.next(); });
    $('roundSkipBtn').addEventListener('click', function () { self.skip(); });
  },

  start: function () { this.enterIntro(0); },

  isDone: function (idx) {
    return State.roundSkipped[idx] || State.roundFound[idx].length >= ROUNDS[idx].targets.length;
  },

  renderDots: function (id, idx) {
    var dots = $(id);
    dots.innerHTML = '';
    for (var i = 0; i < ROUNDS.length; i++) {
      var d = document.createElement('span');
      d.className = 'dot' + (i < idx ? ' is-done' : i === idx ? ' is-now' : '');
      dots.appendChild(d);
    }
  },

  enterIntro: function (idx) {
    State.roundIndex = idx;
    var config = ROUNDS[idx];
    showPage('roundIntroPage');
    setPage('round-' + config.round + '-intro');
    $('roundIntroLabel').textContent = config.label;
    $('roundIntroTitle').textContent = config.title;
    $('roundIntroPrompt').textContent = config.prompt;
    $('roundStartBtn').textContent = 'Begin round ' + config.round;
    this.renderDots('roundIntroDots', idx);
    window.scrollTo({ top: 0 });
  },

  enterActivity: function (idx) {
    State.roundIndex = idx;
    var config = ROUNDS[idx];
    showPage('roundPage');
    setPage('round-' + config.round);
    $('roundLabel').textContent = config.label;
    $('roundTitle').textContent = config.title;
    this.renderDots('roundDots', idx);
    this.renderStory();
    this.syncActivityUI();
    window.scrollTo({ top: 0 });
    maybeAutoCoach('round-' + config.round);
  },

  renderStory: function () {
    var idx = State.roundIndex;
    var config = ROUNDS[idx];
    var round = config.round;
    var foundWords = State.roundFound[idx];
    var missedWords = State.roundSkipped[idx]
      ? config.targets.filter(function (w) { return foundWords.indexOf(w) === -1; })
      : [];
    var wrap = $('storyText');
    wrap.innerHTML = '';
    var self = this;

    STORY.forEach(function (paragraph) {
      var p = document.createElement('p');
      paragraph.forEach(function (chunk) {
        if (typeof chunk === 'string') {
          p.appendChild(document.createTextNode(chunk));
          return;
        }
        if (chunk.r !== round) {
          p.appendChild(document.createTextNode(chunk.w));
          return;
        }
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'token';
        btn.textContent = chunk.w;
        btn.setAttribute('data-word', chunk.w);
        btn.setAttribute('aria-label', 'Candidate: ' + chunk.w);
        if (foundWords.indexOf(chunk.w) !== -1) {
          btn.classList.add('is-found');
          btn.disabled = true;
        } else if (missedWords.indexOf(chunk.w) !== -1) {
          btn.classList.add('is-missed');
          btn.disabled = true;
        }
        btn.addEventListener('click', function () { self.tap(btn, chunk.w); });
        p.appendChild(btn);
      });
      wrap.appendChild(p);
    });
    wrap.classList.toggle('is-locked', this.isDone(idx));
  },

  /* Sinkronkan counter, chip temuan, feedback, dan tombol skip/continue
     dengan State saat ini — dipakai baik sesudah render pertama, sesudah
     tap/skip, maupun saat ronde ini ditampilkan ulang lewat back. */
  syncActivityUI: function () {
    var idx = State.roundIndex;
    var config = ROUNDS[idx];
    var done = this.isDone(idx);

    this.updateCount();
    var list = $('foundList');
    list.innerHTML = '';
    State.roundFound[idx].forEach(function (word) {
      var chip = document.createElement('span');
      chip.className = 'found-chip';
      chip.textContent = word;
      list.appendChild(chip);
    });

    var feedback = $('roundFeedback');
    if (done) {
      feedback.hidden = false;
      if (State.roundSkipped[idx]) {
        feedback.className = 'feedback is-bad';
        feedback.textContent = 'Round skipped. The ones you missed are underlined in red so you can still see them.';
      } else {
        feedback.className = 'feedback is-good';
        feedback.textContent = config.round === 1
          ? 'All four numbers found. Round 2 reads the same story with a different goal.'
          : 'That is the one — Shofia located the well site. The quiz is next.';
      }
      $('roundContinueBtn').hidden = false;
      $('roundContinueBtn').textContent = idx < ROUNDS.length - 1 ? 'Continue to round 2' : 'Continue to the quiz';
      $('roundSkipBtn').hidden = true;
    } else {
      feedback.hidden = true;
      $('roundContinueBtn').hidden = true;
      $('roundSkipBtn').hidden = false;
    }
  },

  updateCount: function () {
    var idx = State.roundIndex;
    $('roundCount').textContent = State.roundFound[idx].length + ' of ' + ROUNDS[idx].targets.length + ' found';
  },

  tap: function (btn, word) {
    if (Gate.isShown()) return;
    var idx = State.roundIndex;
    var config = ROUNDS[idx];
    var feedback = $('roundFeedback');

    if (config.targets.indexOf(word) === -1) {
      /* Klik salah: hanya bergetar, tanpa kehilangan nyawa. */
      btn.classList.remove('is-shake');
      void btn.offsetWidth;
      btn.classList.add('is-shake');
      feedback.hidden = false;
      feedback.className = 'feedback is-bad';
      feedback.textContent = config.round === 1
        ? '“' + word + '” mentions time, not a quantity the question asks for. Keep looking — nothing is lost.'
        : '“' + word + '” is a villager, not the SAR team member who chose the well site.';
      return;
    }
    if (State.roundFound[idx].indexOf(word) !== -1) return;

    State.roundFound[idx].push(word);
    btn.classList.add('is-found');
    btn.disabled = true;

    /* tandai kemunculan lain dari kata yang sama */
    Array.prototype.forEach.call($('storyText').querySelectorAll('.token[data-word="' + word + '"]'), function (el) {
      el.classList.add('is-found');
      el.disabled = true;
    });

    if (this.isDone(idx)) {
      $('storyText').classList.add('is-locked');
      this.syncActivityUI();
    } else {
      this.updateCount();
      var chip = document.createElement('span');
      chip.className = 'found-chip';
      chip.textContent = word;
      $('foundList').appendChild(chip);
      feedback.hidden = false;
      feedback.className = 'feedback is-good';
      feedback.textContent = 'Correct — “' + word + '” is one of them. (' + State.roundFound[idx].length + ' of ' + config.targets.length + ')';
    }
  },

  skip: function () {
    /* Menyerah di ronde ini: temuan yang sudah ada tetap dihitung,
       sisanya ditandai supaya siswa tetap melihat jawabannya. */
    State.roundSkipped[State.roundIndex] = true;
    this.renderStory();
    this.syncActivityUI();
  },

  next: function () {
    if (State.roundIndex < ROUNDS.length - 1) {
      this.enterIntro(State.roundIndex + 1);
    } else {
      Quiz.start();
    }
  }
};

/* ---------------- Kuis: satu soal per layar ----------------
   State.quizFurthest melacak soal terjauh yang sudah pernah dijawab
   BENAR. Kalau quizIndex < quizFurthest saat render (artinya siswa
   mundur ke soal yang sudah lewat), soal itu ditampilkan dalam mode
   REVIEW: read-only, jawaban benar langsung terlihat, tombol lanjut
   selalu ada — tanpa memanggil answer() sama sekali, jadi nyawa &
   quizFirstTry/retried yang sudah tercatat tidak pernah berubah lagi
   hanya karena dilihat ulang (Revisi 1). */
var Quiz = {
  init: function () {
    var self = this;
    $('quizNextBtn').addEventListener('click', function () {
      State.quizIndex++;
      State.quizFurthest = Math.max(State.quizFurthest, State.quizIndex);
      if (State.quizIndex >= QUIZ.length) Result.show();
      else self.render();
    });
  },

  start: function () {
    showPage('quizPage');
    setPage('quiz');
    State.quizIndex = 0;
    State.quizFurthest = 0;
    this.render();
    maybeAutoCoach('quiz');
  },

  /* Dipakai Nav.goBack() untuk masuk langsung ke soal tertentu (mis.
     soal terakhir saat mundur dari halaman hasil). TIDAK memicu
     maybeAutoCoach — itu murni kunjungan-ulang, bukan awal sesi kuis. */
  showQuestion: function (index) {
    State.quizIndex = index;
    showPage('quizPage');
    setPage('quiz');
    this.render();
  },

  render: function () {
    var idx = State.quizIndex;
    var q = QUIZ[idx];
    var isReview = idx < State.quizFurthest;
    /* Bukan cuma "true" polos: kalau soal LIVE ini sudah pernah tercatat
       salah sebelumnya (mis. siswa sempat salah, lalu back ke soal lain,
       lalu maju lagi ke sini sebelum sempat menjawab benar), quizClean
       harus tetap false — supaya tidak dobel-masuk ke retried[] atau
       salah menambah quizFirstTry seolah ini percobaan pertama. */
    State.quizClean = State.retried.indexOf(idx) === -1;

    $('quizLabel').textContent = 'Question ' + (idx + 1) + ' of ' + QUIZ.length + (isReview ? ' · already answered' : '');
    $('quizQuestion').textContent = q.question;

    var dots = $('quizDots');
    dots.innerHTML = '';
    for (var i = 0; i < QUIZ.length; i++) {
      var d = document.createElement('span');
      d.className = 'dot' + (i < idx ? ' is-done' : i === idx ? ' is-now' : '');
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
      if (isReview) {
        btn.disabled = true;
        if (i === q.answer) btn.classList.add('is-correct');
      } else {
        btn.addEventListener('click', function () { self.answer(i, btn); });
      }
      box.appendChild(btn);
    });

    var feedback = $('quizFeedback');
    if (isReview) {
      feedback.hidden = false;
      feedback.className = 'feedback is-good';
      feedback.textContent = q.feedback;
      $('quizNextBtn').hidden = false;
      $('quizNextBtn').textContent = idx < QUIZ.length - 1 ? 'Next question' : 'See your result';
    } else {
      feedback.hidden = true;
      $('quizNextBtn').hidden = true;
    }
    window.scrollTo({ top: 0 });
  },

  answer: function (index, btn) {
    if (Gate.isShown()) return;
    var q = QUIZ[State.quizIndex];
    var feedback = $('quizFeedback');

    if (index !== q.answer) {
      if (State.retried.indexOf(State.quizIndex) === -1) State.retried.push(State.quizIndex);
      State.quizClean = false;
      btn.classList.add('is-wrong');
      btn.disabled = true;
      feedback.hidden = false;
      feedback.className = 'feedback is-bad';
      feedback.textContent = 'Not that one — that costs one life. Read the question again and try another answer.';
      Nav.loseLife();
      return;
    }

    btn.classList.add('is-correct');
    Array.prototype.forEach.call($('quizOptions').querySelectorAll('.option'), function (b) { b.disabled = true; });
    feedback.hidden = false;
    feedback.className = 'feedback is-good';
    feedback.textContent = q.feedback;
    if (State.quizClean) State.quizFirstTry++;

    $('quizNextBtn').hidden = false;
    $('quizNextBtn').textContent = State.quizIndex < QUIZ.length - 1 ? 'Next question' : 'See your result';
  }
};

/* ---------------- Hasil ---------------- */
var Result = {
  /* Dipanggil sekali saja saat startSession() — bukan di show(), karena
     show() sekarang bisa terpanggil lebih dari sekali (siswa bisa mundur
     ke kuis lalu maju lagi ke hasil lewat Nav.goBack). Kalau listener
     dipasang di dalam show(), tiap pemanggilan ulang akan menumpuk
     listener baru di atas tombol yang sama. */
  init: function () {
    $('resultBackBtn').addEventListener('click', function (e) {
      /* Bug lama: tidak ada preventDefault(), jadi browser sudah pindah
         halaman sebelum fade transitionOverlay sempat terlihat. */
      e.preventDefault();
      var href = this.getAttribute('href');
      $('transitionOverlay').classList.add('is-active');
      setTimeout(function () { window.location.href = href; }, 600); /* 600ms = durasi transisi opacity di CSS */
    });
  },

  show: function () {
    showPage('resultPage');
    setPage('result');
    $('resultPage').setAttribute('data-student', Nav.studentName()); /* Tambahan T3: dipakai #resultPage::before saat dicetak */
    Score.save();

    $('resultScore').innerHTML =
      '<div><dt>Clues</dt><dd>' + Score.clues() + '/' + TOTAL_CLUES + '</dd></div>' +
      '<div><dt>Lives left</dt><dd>' + State.lives + '/' + TOTAL_LIVES + '</dd></div>' +
      '<div><dt>Attempt</dt><dd>' + readAttempt() + '</dd></div>';

    var steps = $('resultSteps');
    steps.innerHTML = '';
    [
      { label: 'Round 1 · numbers', got: State.roundFound[0].length, of: ROUND1_TARGETS.length },
      { label: 'Round 2 · the name', got: State.roundFound[1].length, of: ROUND2_TARGETS.length },
      { label: 'Quiz · first try', got: State.quizFirstTry, of: QUIZ.length }
    ].forEach(function (row, i) {
      var li = document.createElement('li');
      li.className = 'step-item';
      var n = document.createElement('span');
      n.textContent = '0' + (i + 1);
      var label = document.createElement('span');
      label.textContent = row.label;
      var mark = document.createElement('span');
      mark.className = 'step-mark ' + (row.got === row.of ? 'is-good' : 'is-bad');
      mark.textContent = row.got + '/' + row.of;
      li.appendChild(n);
      li.appendChild(label);
      li.appendChild(mark);
      steps.appendChild(li);
    });

    var answers = $('resultAnswers');
    answers.innerHTML = '';
    if (!State.retried.length) {
      var none = document.createElement('li');
      none.className = 'answer-item';
      none.textContent = 'None — every question was right on the first try.';
      answers.appendChild(none);
    } else {
      State.retried.forEach(function (idx) {
        var q = QUIZ[idx];
        var li = document.createElement('li');
        li.className = 'answer-item';
        var qEl = document.createElement('p');
        qEl.className = 'answer-q';
        qEl.textContent = (idx + 1) + '. ' + q.question;
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
    }

    var tips = $('resultTips');
    tips.innerHTML = '';
    TIPS.forEach(function (text) {
      var li = document.createElement('li');
      li.textContent = text;
      tips.appendChild(li);
    });

    maybeAutoCoach('result');
  }
};

var FloatBack = {
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
      if (!inward) return;
      Nav.goBack();
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
    list.push({ module: 'lake_sunda', page: State.page, text: text, at: new Date().toISOString() });
    writeKey('nl_questions_v1', list);
    $('askText').value = '';
    $('askNote').textContent = 'Sent. Your teacher will answer soon.';
    setTimeout(function () { Ask.close(); }, 1100);
  }
};

/* ---------------- Coach mark ----------------
   Tiap langkah: { text, target? }. Kalau target ada dan sedang terlihat di
   DOM, Coach.render() menyorot elemen itu (mode sorotan); kalau tidak, coach
   mark jatuh ke dialog tengah seperti sebelumnya (mode fallback). */
var COACH = {
  /* Revisi R1: kunci 'welcome-1', 'welcome-2', 'wait-1', video, dan
     'wait-2' DIHAPUS dari sini — bukan dibuang, tapi dipindahkan ke
     peta HINTS (dekat helper $() di atas), karena kelimanya sekarang
     memakai notifikasi hint pojok kanan atas, bukan coach mark. */
  'round-1-intro': [
    { text: 'Read the instructions above, then tap the button below when you are ready to start.', target: '#roundStartBtn' }
  ],
  'round-1': [
    { text: 'Tap the words in the story that are a number or a quantity.', target: '#storyText' },
    { text: 'A correct tap turns the word green; a wrong tap only shakes — no life is lost here.', target: '#storyText' },
    { text: 'Find all four before you continue: this round counts toward your twenty clues.', target: '#roundCount' }
  ],
  'round-2-intro': [
    { text: 'Same story, new goal — read the instructions above, then tap below to begin.', target: '#roundStartBtn' }
  ],
  'round-2': [
    { text: 'Same story as Round 1, read with a new goal.', target: '#storyText' },
    { text: 'Find the one name that belongs to the SAR team member who located the well site — the other names are there on purpose.', target: '#storyText' },
    { text: 'Still no penalty for a wrong tap, and this round counts too.', target: '#roundCount' }
  ],
  quiz: [
    { text: 'One question per screen, fifteen in total.', target: '#quizLabel' },
    { text: 'A wrong answer costs one life and stays crossed out; you can still find the right one.', target: '#navHearts' },
    { text: 'Only questions you get right on the first try count toward your twenty clues.' }
  ],
  result: [
    { text: 'This shows your clues found and the lives you have left.', target: '#resultScore' },
    { text: 'Here are the questions you had to retry, with the correct answers.', target: '#resultAnswers' }
  ]
};

/* Stage yang berhak memicu coach mark OTOMATIS saat pertama kali dimasuki.
   welcome-1, welcome-2, wait-1, wait-2, dan video TIDAK termasuk — bukan
   lagi (hanya) karena "sudah cukup jelas dari teks di layar itu sendiri",
   tapi karena aturan baru yang berlaku di seluruh proyek (Revisi R1): tur
   coach mark tidak boleh terbuka otomatis SEBELUM siswa melewati sesi
   video. Kelima layar itu sekarang memakai notifikasi hint ringkas di
   pojok kanan atas sebagai gantinya — lihat peta HINTS dekat helper $().
   'round-1-intro' dan 'round-2-intro' juga tidak termasuk karena
   instruksinya sudah berdiri sendiri di halaman itu, tapi keduanya
   (beda dari lima di atas) tetap bisa dibuka manual lewat #navCoach,
   karena #appShell sudah terlihat saat halaman itu tampil.
   Stage 'round-1' sekarang menjadi coach mark otomatis PERTAMA.
   #navCoach tetap bisa dipakai manual kapan saja di halaman mana pun,
   terlepas dari daftar ini. */
var AUTO_COACH_STAGES = ['round-1', 'round-2', 'quiz', 'result'];
var AUTO_COACH_DELAY = 350; /* ms — beri waktu transisi (blackout/scroll-ke-atas) selesai dulu */

/* Revisi R1: stage 'video' tidak lagi memicu coach mark otomatis, jadi
   catatan "sudah pernah dilihat" untuk stage itu di localStorage sudah
   tak bermakna. Dibersihkan sekali supaya penyimpanan tidak menyimpan
   kunci mati. Aman dipanggil berulang kali (no-op begitu 'video' sudah
   tidak ada di objeknya).
   Bentuk penyimpanan yang SEBENARNYA — dibaca dari hasSeenCoach() /
   markCoachSeen() di atas, bukan ditebak: SATU kunci KEY_COACH_SEEN
   berisi SATU objek JSON { [namaStage]: true, ... }, bukan kunci
   terpisah per stage. Pembersihannya karena itu membaca objek itu,
   menghapus properti 'video', lalu menulis balik objek yang sama —
   bukan localStorage.removeItem pada kunci gabungan yang tidak pernah
   benar-benar dipakai oleh kedua fungsi di atas. */
try {
  var seenCoachCleanup = readKey(KEY_COACH_SEEN);
  if (seenCoachCleanup && seenCoachCleanup.video) {
    delete seenCoachCleanup.video;
    writeKey(KEY_COACH_SEEN, seenCoachCleanup);
  }
} catch (e) { /* tidak kritis */ }

function maybeAutoCoach(stage) {
  if (!State.autoCoachEnabled) return;
  if (AUTO_COACH_STAGES.indexOf(stage) === -1) return;
  /* Produksi: sekali per stage, seumur perangkat (localStorage, key BARU
     KEY_COACH_SEEN — di luar kontrak lama). Mode developer: selalu tampil
     selama toggle #devCoachToggle ON, dan TIDAK ditulis ke localStorage,
     supaya gampang diuji ulang tanpa harus hapus data manual (Revisi 4). */
  if (!DEV_MODE) {
    if (hasSeenCoach(stage)) return;
    markCoachSeen(stage);
  }
  setTimeout(function () {
    if (State.page === stage) Coach.open(stage); /* jaga2: batal kalau siswa sudah pindah lagi sebelum timer selesai */
  }, AUTO_COACH_DELAY);
}

/* Elemen dianggap "terlihat" kalau punya ukuran rendernya sendiri — sekaligus
   menyaring target yang tidak ada di DOM, bersembunyi lewat [hidden]
   (mis. halaman lain yang sedang tidak aktif), atau punya display:none. */
function isElementVisible(el) {
  if (!el) return false;
  var rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

/* Baca nilai env(safe-area-inset-*) lewat custom property di :root, supaya
   kartu callout bisa diklem menjauhi notch / home-indicator di JS. */
function safeInset(customProp) {
  var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(customProp));
  return isNaN(v) ? 0 : v;
}

var Coach = {
  steps: [],
  index: 0,
  activeTarget: null,
  positionTimer: null,

  init: function () {
    var self = this;
    $('coachNext').addEventListener('click', function () { self.next(); });
    $('coachClose').addEventListener('click', function () { self.close(); });
    /* Posisi sorotan & callout dihitung ulang, bukan cuma sekali saat dibuka. */
    window.addEventListener('resize', function () { self.reposition(); });
    window.addEventListener('scroll', function () { self.reposition(); }, true);
  },

  open: function (forcePage) {
    this.steps = COACH[forcePage || State.page] || [{ text: 'Nothing to explain on this screen yet.' }];
    this.index = 0;
    $('coachWrap').hidden = false;
    $('navCoach').classList.add('is-on');
    this.render();
  },

  render: function () {
    var step = this.steps[this.index];
    var targetEl = step.target ? document.querySelector(step.target) : null;
    var canSpotlight = !!(targetEl && isElementVisible(targetEl));
    var wrap = $('coachWrap');
    var card = $('coachCard');
    var self = this;

    this.clearHighlight();
    clearTimeout(this.positionTimer);

    $('coachStep').textContent = 'Step ' + (this.index + 1) + ' of ' + this.steps.length;
    $('coachText').textContent = step.text;
    $('coachNext').textContent = this.index === this.steps.length - 1 ? 'Got it' : 'Continue';

    if (canSpotlight) {
      this.activeTarget = targetEl;
      targetEl.classList.add('coach-target');
      wrap.classList.remove('is-center');
      wrap.classList.add('is-spotlight');
      card.style.visibility = 'hidden'; /* sembunyikan sampai posisinya pasti benar */

      var rect = targetEl.getBoundingClientRect();
      var alreadyInView = rect.top >= 0 && rect.bottom <= window.innerHeight;
      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (alreadyInView) {
        this.positionCallout();
      } else {
        targetEl.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
        this.positionTimer = setTimeout(function () { self.positionCallout(); }, reduceMotion ? 0 : 320);
      }
    } else {
      this.activeTarget = null;
      wrap.classList.remove('is-spotlight');
      wrap.classList.add('is-center');
      card.style.visibility = '';
      card.style.top = '';
      card.style.left = '';
      card.style.width = '';
      $('coachCaret').hidden = true;
    }
  },

  /* Hitung ulang posisi kartu & caret relatif terhadap target saat ini —
     dipanggil setelah scroll-into-view, dan lagi tiap resize/scroll selama
     coach mark masih dalam mode sorotan. */
  positionCallout: function () {
    if (!this.activeTarget || !isElementVisible(this.activeTarget)) {
      /* Target hilang di tengah jalan (halaman berpindah dsb) — jatuh ke fallback. */
      this.render();
      return;
    }
    var target = this.activeTarget;
    var card = $('coachCard');
    var caret = $('coachCaret');
    var gap = 14;   /* jarak kartu ke target */
    var edge = 12;  /* jarak minimum kartu ke tepi viewport */

    var safeT = safeInset('--safe-t') + edge;
    var safeR = safeInset('--safe-r') + edge;
    var safeB = safeInset('--safe-b') + edge;
    var safeL = safeInset('--safe-l') + edge;

    var t = target.getBoundingClientRect();
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    var cardWidth = Math.max(220, Math.min(360, vw - safeL - safeR));
    card.style.width = cardWidth + 'px';
    var cardHeight = card.getBoundingClientRect().height;

    var spaceBelow = vh - t.bottom - safeB;
    var spaceAbove = t.top - safeT;
    var placeBelow = spaceBelow >= cardHeight + gap || spaceBelow >= spaceAbove;

    var top;
    if (placeBelow) {
      top = Math.min(t.bottom + gap, vh - safeB - cardHeight);
      top = Math.max(top, safeT);
    } else {
      top = Math.max(t.top - gap - cardHeight, safeT);
    }

    var left = t.left + t.width / 2 - cardWidth / 2;
    left = Math.max(safeL, Math.min(left, vw - safeR - cardWidth));

    card.style.top = top + 'px';
    card.style.left = left + 'px';
    card.style.visibility = 'visible';

    var caretLeft = t.left + t.width / 2 - left - 6; /* 6 = separuh lebar caret */
    caretLeft = Math.max(10, Math.min(caretLeft, cardWidth - 22));
    caret.style.left = caretLeft + 'px';
    caret.hidden = false;
    caret.classList.toggle('is-caret-top', placeBelow);
    caret.classList.toggle('is-caret-bottom', !placeBelow);
  },

  reposition: function () {
    if (this.activeTarget) this.positionCallout();
  },

  clearHighlight: function () {
    if (this.activeTarget) this.activeTarget.classList.remove('coach-target');
    this.activeTarget = null;
  },

  next: function () {
    if (this.index < this.steps.length - 1) { this.index++; this.render(); }
    else this.close();
  },

  close: function () {
    clearTimeout(this.positionTimer);
    this.clearHighlight();
    $('coachWrap').hidden = true;
    $('coachWrap').classList.remove('is-spotlight', 'is-center');
    $('navCoach').classList.remove('is-on');
  }
};

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
  var coachToggle = $('devCoachToggle');
  if (!panel || !btn) return;
  panel.hidden = false;

  function flashEmpty() {
    btn.classList.add('is-empty');
    setTimeout(function () { btn.classList.remove('is-empty'); }, 400);
  }

  btn.addEventListener('click', function () {
    if (Gate.isShown()) { TeacherAPI.release(); return; }

    if (!$('videoPage').hidden) { Gate.waitAfterVideo(); return; }

    if (!$('roundIntroPage').hidden) { $('roundStartBtn').click(); return; }

    if (!$('roundPage').hidden) {
      if (!$('roundContinueBtn').hidden) { $('roundContinueBtn').click(); return; }
      var idx = State.roundIndex;
      var targets = ROUNDS[idx].targets;
      for (var i = 0; i < targets.length; i++) {
        if (State.roundFound[idx].indexOf(targets[i]) !== -1) continue;
        var token = $('storyText').querySelector('.token[data-word="' + targets[i] + '"]');
        if (token && !token.disabled) { token.click(); return; }
      }
    }

    if (!$('quizPage').hidden) {
      if (!$('quizNextBtn').hidden) { $('quizNextBtn').click(); return; }
      var q = QUIZ[State.quizIndex];
      var target = $('quizOptions').querySelector('.option[data-index="' + q.answer + '"]');
      if (target && !target.disabled) { target.click(); return; }
    }

    flashEmpty();
  });

  /* Tombol developer kedua (Revisi 4): nyala/mati coach mark otomatis,
     murni untuk keperluan testing — lihat maybeAutoCoach(). #navCoach
     manual tetap jalan terlepas dari toggle ini. */
  if (coachToggle) {
    var updateToggleUI = function () {
      var on = State.autoCoachEnabled;
      coachToggle.classList.toggle('is-off', !on);
      var label = 'Auto coach mark: ' + (on ? 'ON' : 'OFF') + ' (tap to toggle)';
      coachToggle.setAttribute('title', label);
      coachToggle.setAttribute('aria-label', label);
    };
    coachToggle.addEventListener('click', function () {
      State.autoCoachEnabled = !State.autoCoachEnabled;
      updateToggleUI();
    });
    updateToggleUI();
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
/* ====================== AKHIR MODE PENGEMBANG ====================== */

/* ---------------- Inisialisasi ---------------- */
(function init() {
  var prereq = readKey(KEY_PREREQ);

  if (!DEV_MODE && (!prereq || prereq.status !== 'completed')) {
    $('lockedPage').hidden = false;
    return;
  }
  $('lockedPage').hidden = true;

  if (DEV_MODE) { initDevPanel(); initDevDrag(); initDevTooltip(); }
  initSwipeBack();

  function startSession() {
    $('appShell').hidden = false;
    Nav.init();
    Video.init();
    Round.init();
    Quiz.init();
    Result.init();
    Ask.init();
    Coach.init();
    Gate.waitBeforeVideo();
    FloatBack.sync();
  }

  $('welcome1').hidden = false;
  setPage('welcome-1');
  FloatBack.sync();
  initWelcome(startSession);
})();