/* ============================================================
   Singhasari — NarrativeLearn  (re-design)
   /lake-lembayung/singhasari/

   Alur: locked → welcome 1 → welcome 2 → tunggu guru → video →
   tunggu guru → teks cerita → Choose & Justify (10 skenario) →
   kuis 4 soal → hasil + ringkasan perjalanan.

   Penilaian: 24 langkah = 10 pilihan + 10 alasan + 4 soal kuis.
   Tanpa lulus/gagal. Alasan yang kurang tepat TIDAK menghukum —
   alasan terbaik langsung ditunjukkan beserta penjelasannya.
   Nyawa: 7, hanya berkurang saat jawaban kuis salah. Habis →
   layar tunggu guru; guru yang memulihkan.

   Kunci localStorage (kontrak lintas modul, tidak berubah):
     lake_muara_v1  — prasyarat
     lake_singha_v1 — {v,status,score,maxScore,stars,correct,total,livesUsed,attempts,completedAt}
     nl_student_v1, nl_questions_v1
     lake_singha_attempt_temp — sessionStorage
   ============================================================ */

/* ============================================================
   ⚠️ MODE PENGEMBANG — HAPUS SEBELUM LAUNCHING
   Satu klik tombol hijau = meloloskan SATU langkah yang tampil.
   ============================================================ */
var DEV_MODE = true;
/* ====================== AKHIR CATATAN ATAS ====================== */

var KEY_PREREQ = 'lake_muara_v1';
var KEY_SELF = 'lake_singha_v1';
var KEY_STUDENT = 'nl_student_v1';
var KEY_ATTEMPT = 'lake_singha_attempt_temp';

var TOTAL_LIVES = 7;

/* ---------------- Cerita: 8 bagian bernomor + plat gambar/audio ---------------- */
var STORY = [
  {
    paras: ['Of the three villages around Lake Lembayung, Singhasari was hit hardest. The village sits directly along the main path of water flowing down from Bukit Camar toward the lake, so when the flash flood struck, its current slammed into the village with the greatest force. Dozens of houses were badly damaged, some flattened completely, leaving only foundations and rubble.'],
    image: 'gambar/singhasari-1.jpg',
    audio: 'audio/gambar-1.mp3',
    caption: 'Singhasari village after being hit by the flash flood.'
  },
  {
    paras: [
      'Five days after the disaster, most residents of Singhasari were still sleeping under makeshift tarps or staying with relatives whose homes were in slightly better shape. Some families slept out in the open with no roof at all, because there was nowhere else left to go.',
      'Pak Rosyad personally led the response in this village, helped by several members of the Jayakarta SAR Team who hadn\'t yet been assigned to the other two villages. He knew time was short — the forecast warned that heavy rain could return within days. If temporary shelters weren\'t built soon, the already-exhausted residents would face fresh danger when the next rain arrived.'
    ],
    image: 'gambar/singhasari-2.jpg',
    audio: 'audio/gambar-2.mp3',
    caption: 'Pak Rosyad and the Jayakarta SAR Team record the families who lost their homes.'
  },
  {
    paras: [
      'His team began counting how many families needed temporary shelter. But a problem emerged: the available materials — tarps, bamboo, and donated scrap wood — were limited, not enough to build housing for every family at once.',
      'Tension briefly flared as several residents pushed to be helped first. One man insisted his family should come first because his house was damaged the worst, while another felt his family, with a toddler, deserved priority too.'
    ]
  },
  {
    paras: ['Calmly, Pak Rosyad gathered everyone and proposed a fair approach: families with toddlers, elderly members, or people with disabilities would be helped first, followed by others based on how badly their homes were damaged. He also asked residents whose houses were still livable to temporarily take in their neighbors while they waited their turn.'],
    image: 'gambar/singhasari-3.jpg',
    audio: 'audio/gambar-3.mp3',
    caption: 'Pak Rosyad explains the shelter priority order to the residents.'
  },
  {
    paras: [
      'Most residents accepted the plan without complaint. But not everyone was satisfied. Pak Karta, whose house had been flattened and left with only its foundation, had to wait nearly four days longer, since his family had no toddlers, elderly members, or anyone with special needs. One evening, he came to see Pak Rosyad. "My house was damaged the worst, sir. But I have to wait until last?" he asked, his voice a mix of exhaustion and disappointment.',
      'Pak Rosyad paused before answering. "I understand this is hard, Pak Karta. Your house really is one of the worst hit. But if we prioritize by damage alone, families with toddlers and elderly members could be exposed to the cold and rain far too long — the risk is different for them." He sighed. "I can\'t say this is a decision that satisfies everyone. What I can promise is that you won\'t wait any longer than you have to."'
    ]
  },
  {
    paras: ['Pak Karta wasn\'t fully satisfied with the answer, but he nodded slowly and walked away without arguing further. Four days later, the temporary shelter for his family was finally finished — not the first to be built, but not the last either.'],
    image: 'gambar/singhasari-4.jpg',
    audio: 'audio/gambar-4.mp3',
    caption: 'Pak Karta walks away after hearing Pak Rosyad\'s explanation.'
  },
  {
    paras: [
      'The residents finally agreed to the plan. His team worked with the village\'s young men to put up simple bamboo frames covered with tarps for walls and roofs, lined up on higher ground away from the water\'s path. Each unit took nearly a full day to build securely, so the whole process took almost a week before every family had a place to stay.',
      'When the forecasted rain finally came, most families in Singhasari already had a roof over their heads, however simple. The sound of rain that had once been terrifying now just pattered softly on the tarps — a sign that they were better prepared to face it.'
    ],
    image: 'gambar/singhasari-5.jpg',
    audio: 'audio/gambar-5.mp3',
    caption: 'Temporary shelters lined up neatly on the village field, ready for the next rain.'
  },
  {
    paras: ['Pak Rosyad stood at the edge of the field, looking over the neat rows of temporary shelters. Though the residents\' original homes would take much longer to rebuild, he knew that for the first time since the disaster, most of Singhasari\'s people could sleep a little more at ease.'],
    quote: '"This is only the beginning," he murmured, "but at least, they won\'t be caught in the rain tonight."',
    image: 'gambar/singhasari-6.jpg',
    audio: 'audio/gambar-6.mp3',
    caption: 'Pak Rosyad looks over the rows of temporary shelters from the edge of the field.'
  }
];

/* ---------------- Choose & Justify: 10 skenario ---------------- */
var DILEMMAS = [
  {
    prompt: 'Pak Rosyad made Pak Karta wait longer for a temporary shelter than other families, even though Pak Karta\'s house was damaged the worst. Was that decision fair?',
    choices: ['Fair', 'Not fair'],
    answer: 0,
    reasonQuestion: 'Which reason best explains Pak Rosyad\'s decision?',
    reasons: [
      'Because Pak Rosyad prioritized the health risks faced by toddlers and elderly people, who are more vulnerable to cold and rain',
      'Because the worst-damaged house should automatically be the top priority',
      'Because Pak Rosyad had no clear reason for it',
      'Because every family should have been helped at the same time, with no order at all'
    ],
    reasonAnswer: 0,
    feedback: 'This system doesn\'t satisfy everyone — that\'s what makes it a hard decision, not a perfect one. Risk-based priority protects the most vulnerable, even though it feels hard on those who have to wait.'
  },
  {
    prompt: 'Pak Rosyad asked residents whose houses were still livable to temporarily take in neighbors who had lost their homes. Was that a reasonable request?',
    choices: ['Not reasonable', 'Reasonable'],
    answer: 1,
    reasonQuestion: 'Which reason best explains Pak Rosyad\'s request?',
    reasons: [
      'Because residents whose houses were still intact lost nothing, so it\'s fine to inconvenience them as much as needed',
      'Because building materials were very limited, so temporarily sharing housing helped protect more families sooner',
      'Because Pak Rosyad was the leader, so all his requests had to be followed without question',
      'Because taking in neighbors would never inconvenience anyone'
    ],
    reasonAnswer: 1,
    feedback: 'With limited building materials, temporary cooperation between residents became a bridge until the shelters were finished — not out of obligation or because it was assumed to be no trouble at all, but because the situation was genuinely urgent.'
  },
  {
    prompt: 'Each temporary shelter unit took nearly a full day to build securely, so the process took almost a week — even though the team could have built faster with lighter construction. Was choosing sturdiness over speed the right call?',
    choices: ['Right call', 'Not quite right'],
    answer: 0,
    reasonQuestion: 'Which reason best explains that choice?',
    reasons: [
      'Because building faster would surely have resulted in the same quality anyway',
      'Because residents would never mind waiting, no matter how long',
      'Because a sturdy shelter better withstands the forecasted rain, compared to one that\'s fast but flimsy',
      'Because speed is never an important factor during a disaster'
    ],
    reasonAnswer: 2,
    feedback: 'The forecast of more rain made sturdiness a matter of safety, not just comfort — a little extra time was worth it for shelters that could actually protect people when the rain came.'
  },
  {
    prompt: 'Pak Karta wasn\'t fully satisfied with Pak Rosyad\'s explanation, but chose to nod and walk away without arguing further. Was Pak Karta\'s response wise?',
    choices: ['Not very wise', 'Wise'],
    answer: 1,
    reasonQuestion: 'Which reason best explains Pak Karta\'s response?',
    reasons: [
      'Because he had heard and understood the reasoning, even though it still felt hard — accepting the situation without having to fully agree with it',
      'Because arguing with the village leader is never allowed',
      'Because Pak Karta actually stopped caring about his house',
      'Because protesting would never change anything, so there was no point trying'
    ],
    reasonAnswer: 0,
    feedback: 'The text shows Pak Karta understood Pak Rosyad\'s reasoning, rather than simply submitting or giving up caring — accepting a reasonable explanation is different from just obeying.'
  },
  {
    prompt: 'Pak Rosyad said plainly, "I can\'t say this is a decision that satisfies everyone," instead of assuring Pak Karta that the decision was definitely fair to all. Was Pak Rosyad\'s way of communicating the right one?',
    choices: ['Right', 'Not quite right'],
    answer: 0,
    reasonQuestion: 'Which reason best explains Pak Rosyad\'s way of communicating?',
    reasons: [
      'Because a leader should always sound certain, no matter the reality',
      'Because Pak Rosyad actually wasn\'t sure about his own decision',
      'Because admitting a decision\'s shortcomings means the decision was wrong',
      'Because honesty about a decision\'s limits is more trustworthy than promising everyone will be satisfied'
    ],
    reasonAnswer: 3,
    feedback: 'Pak Rosyad still offered a certainty he could keep ("you won\'t wait any longer than you have to") while being honest about its limits — honesty and confidence work together, not against each other.'
  },
  {
    prompt: 'Pak Rosyad\'s principle — toddlers, elderly people, and people with disabilities are prioritized first — was applied to every family in Singhasari without exception. Was applying it that consistently important?',
    choices: ['Not important', 'Important'],
    answer: 1,
    reasonQuestion: 'Which reason best explains why that consistency mattered?',
    reasons: [
      'Because families who arrived first should still come first, regardless of the rule',
      'Because a rule applied equally to every family makes the process feel fair and accountable, not arbitrary',
      'Because Pak Rosyad only applied it to families he knew well',
      'Because the rule wasn\'t really that important as long as everyone was helped eventually'
    ],
    reasonAnswer: 1,
    feedback: 'One rule for everyone — not based on who arrived first or who was well known — is what makes a priority system feel reasonable, even though the outcome still feels hard for some.'
  },
  {
    prompt: 'The temporary shelters were built in a row on higher ground, away from the water\'s path, rather than closer to residents\' original homes but at risk of another flood. Was that choice of location the right one?',
    choices: ['Right', 'Not quite right'],
    answer: 0,
    reasonQuestion: 'Which reason best explains that choice of location?',
    reasons: [
      'Because distance from the original homes is the most important factor above all else',
      'Because the village field happened to be Pak Rosyad\'s own land',
      'Because higher, safer ground protects residents from the risk of another flood, even if it\'s farther from their original homes',
      'Because the shelter\'s location wasn\'t really worth thinking about'
    ],
    reasonAnswer: 2,
    feedback: 'Rebuilding along the same path as the previous disaster only relocates the risk instead of removing it — higher, safer ground was the sensible choice, even if it meant being a little farther away.'
  },
  {
    prompt: 'Some members of the Jayakarta SAR Team who had finished their work in Sunda Kelapa and Muara Jati were sent to help in Singhasari, since it suffered the worst damage of the three villages. Did moving personnel like this make sense?',
    choices: ['Didn\'t make sense', 'Made sense'],
    answer: 1,
    reasonQuestion: 'Which reason best explains that decision?',
    reasons: [
      'Because sending extra help to the worst-hit village balances the workload according to the most urgent need',
      'Because personnel numbers in every village should always be split evenly, regardless of conditions',
      'Because a village that had finished its response no longer needed any personnel at all',
      'Because the Jayakarta SAR Team was actually short-staffed everywhere at once'
    ],
    reasonAnswer: 0,
    feedback: 'Just like the priority within a single village, moving personnel to where they were needed most — rather than splitting them evenly — reflects the same needs-based thinking, this time across villages.'
  },
  {
    prompt: 'At the end, Pak Rosyad called the temporary shelters "only the beginning," not the final solution, since residents\' original homes still needed rebuilding. Was that outlook the right one for Singhasari\'s situation at the time?',
    choices: ['Right', 'Not quite right'],
    answer: 0,
    reasonQuestion: 'Which reason best explains Pak Rosyad\'s outlook?',
    reasons: [
      'Because the temporary shelters were actually already enough and didn\'t need further thought',
      'Because Pak Rosyad only wanted to sound humble in front of the residents',
      'Because calling it "a beginning" means the shelters failed to meet their purpose',
      'Because recognizing the work isn\'t finished keeps the team ready for the next stage of recovery, instead of stopping once the urgent need is met'
    ],
    reasonAnswer: 3,
    feedback: 'The shelters succeeded at their urgent purpose — protecting residents from the rain that night — while calling it "a beginning" is a reminder that full recovery is still far off. The two aren\'t in conflict.'
  },
  {
    prompt: 'Families with toddlers and elderly members got the first turn for temporary shelter, even though their houses weren\'t necessarily the most damaged. Does prioritizing them based on vulnerability — rather than damage — make sense?',
    choices: ['Doesn\'t make sense', 'Makes sense'],
    answer: 1,
    reasonQuestion: 'Which reason best explains that decision?',
    reasons: [
      'Because families with toddlers or elderly members will always have the most damaged houses',
      'Because toddlers and elderly people face greater health risks from cold and rain, so physical vulnerability is a reasonable factor alongside house damage',
      'Because families without toddlers or elderly members were assumed not to need help at all',
      'Because the order of help was actually determined at random'
    ],
    reasonAnswer: 1,
    feedback: 'Physical vulnerability and house damage are two different things that don\'t always overlap — prioritizing by health risk still makes sense precisely because the two don\'t always align.'
  }
];

/* ---------------- Kuis penutup: 4 soal ---------------- */
var QUIZ = [
  {
    question: 'What is the main message of this story?',
    options: ['Disasters can always be avoided if residents stay alert', 'Fairness doesn\'t always mean everyone is satisfied, but it does mean weighing different risks', 'A village leader should always follow residents\' requests', 'Disaster aid should be divided equally with no criteria'],
    answer: 1,
    feedback: 'The conflict with Pak Karta shows that risk-based fairness doesn\'t always feel fair to everyone — that\'s the point, not avoiding disasters.'
  },
  {
    question: 'What is the main communicative purpose of this type of text?',
    options: ['To give technical instructions', 'To entertain while delivering a value or moral message through a sequence of events', 'To present disaster statistics', 'To invite readers into a debate'],
    answer: 1,
    feedback: 'This is the hallmark of a narrative text — entertaining through story while also delivering a message.'
  },
  {
    question: 'Why did Pak Karta eventually stop arguing even though he wasn\'t fully satisfied?',
    options: ['Because he fully agreed with Pak Rosyad', 'Because he understood the reasoning even though it still felt hard, and chose to accept the situation', 'Because he was forced to by other residents', 'Because he forgot why he was protesting'],
    answer: 1,
    feedback: 'The text describes him as "not fully satisfied… but nodded slowly" — realistic acceptance, not full agreement.'
  },
  {
    question: 'Looking at the pattern across all three villages (Sunda Kelapa, Muara Jati, Singhasari), what do the Jayakarta SAR Team\'s tough decisions have in common?',
    options: ['They always waited for BPBD\'s instructions before acting', 'They always prioritized based on risk or urgency, even if it meant someone had to wait', 'They always split resources evenly with no exceptions', 'They always favoured the requests of the most vocal residents'],
    answer: 1,
    feedback: 'Shofia chose the safest well site, Aksara halted work for safety, Pak Rosyad prioritized health risk — the same pattern: risk-based decisions, not requests.'
  }
];

var TIPS = [
  'A judgement needs a reason. "Fair" or "not fair" only becomes an answer once you can say what it is weighed against.',
  'Look for what a decision protects, not only what it costs. Risk and damage are different measures.',
  'Honesty about a decision\'s limits is part of a good decision, not a weakness in it.'
];

/* Tujuh lokasi berskor untuk ringkasan perjalanan (dibaca dari localStorage) */
var JOURNEY = [
  { key: 'oj_barat_v1', group: 'Ocean Journey', name: 'Nusa Barat', role: 'Genre & structure' },
  { key: 'oj_timur_v1', group: 'Ocean Journey', name: 'Nusa Timur', role: 'Language' },
  { key: 'oj_selatan_v1', group: 'Ocean Journey', name: 'Nusa Selatan', role: 'Vocabulary' },
  { key: 'lake_bukit_v1', group: 'Lake of Lembayung', name: 'Bukit Camar', role: 'Literal' },
  { key: 'lake_muara_v1', group: 'Lake of Lembayung', name: 'Muara Jati', role: 'Inferential' },
  { key: 'lake_sunda_v1', group: 'Lake of Lembayung', name: 'Sunda Kelapa', role: 'Detail hunting' },
  { key: 'lake_singha_v1', group: 'Lake of Lembayung', name: 'Singhasari', role: 'Evaluative' }
];

var TOTAL_STEPS = DILEMMAS.length * 2 + QUIZ.length; /* 24 */
var LEGACY_MAX_SCORE = TOTAL_STEPS * 10;             /* 240, seperti versi lama */

/* ---------------- State ---------------- */
var State = {
  page: 'welcome-1',
  lives: TOTAL_LIVES,
  dilemmaIndex: 0,
  choiceScore: 0,
  reasonScore: 0,
  reviewList: [],   /* skenario yang pilihan/alasannya belum tepat */
  dilemmaAnswers: [], /* {choiceIndex, reasonIndex} per indeks, ditulis sekali soal itu tuntas —
                          dasar rekonstruksi mode read-only/review saat Back/Next (lihat StepHistory) */
  quizIndex: 0,
  quizClean: true,
  quizFirstTry: 0,
  quizTried: [],    /* pilihan salah yang sudah dicoba per indeks kuis, bertahan lintas Back/Next */
  quizSolved: []    /* indeks kuis yang sudah terjawab benar, bertahan lintas Back/Next — dasar review */
};

var STAGES = ['welcome-1', 'welcome-2', 'wait-1', 'video', 'wait-2', 'story', 'activity', 'quiz', 'result'];
/* Revisi R5: label stage ditinjau ulang supaya "Stage: <label>" dijamin
   muat di lencana .nav-info (maks 46vw = 165,6px di layar 360px) tanpa
   pernah terpotong ellipsis. Catatan: audit revisi menyebut label
   'Choose & justify' (23 karakter) sebagai biang keladinya — di berkas
   ini label itu sebenarnya sudah berbunyi 'Activity', jadi tidak ada
   label sepanjang itu yang perlu dipangkas. Yang diubah hanya 'Activity'
   -> 'Decisions': sama-sama sembilan karakter, tetapi jauh lebih jelas
   maknanya bagi siswa yang sedang mengerjakan sepuluh keputusan.
   Label terpanjang sekarang 16 karakter ("Stage: Materials" dan
   "Stage: Decisions"), sekitar 99px — aman dengan margin besar. */
var STAGE_LABELS = {
  'welcome-1': 'Welcome', 'welcome-2': 'Welcome', 'wait-1': 'Waiting', video: 'Materials',
  'wait-2': 'Waiting', story: 'Story', activity: 'Decisions', quiz: 'Quiz', result: 'Results'
};

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

/* Mengusir semua hint yang sedang tampil. Dipanggil hint() sebelum
   memasang pesan baru, dan oleh setPage() setiap kali stage berganti —
   termasuk ke stage yang TIDAK punya hint. Tanpa yang kedua, pesan
   "Wait for your teacher" masih bisa tertinggal di layar cerita kalau
   guru merilis gerbang dalam tiga detik pertama; instruksi yang sudah
   tidak berlaku lebih membingungkan daripada tidak ada instruksi. */
function clearHints() {
  var host = $('hintHost');
  if (!host) return;
  Array.prototype.forEach.call(host.children, function (old) { dismissHint(old); });
}

function dismissHint(node) {
  if (!node || node.dataset.going === '1') return;
  node.dataset.going = '1';
  node.classList.remove('is-in');
  node.classList.add('is-out');
  setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 260);
}

function hint(message, onDark) {
  var host = $('hintHost');
  if (!host || !message) return;

  /* Satu hint pada satu waktu: pesan lama diusir dulu supaya tidak
     menumpuk kalau siswa berpindah layar dengan cepat. */
  clearHints();

  var el = document.createElement('button');
  el.type = 'button';
  el.className = 'hint' + (onDark ? ' is-on-dark' : '');
  el.appendChild(document.createTextNode(message));
  host.appendChild(el);

  requestAnimationFrame(function () {
    requestAnimationFrame(function () { el.classList.add('is-in'); });
  });

  var timer = setTimeout(function () { dismissHint(el); }, HINT_MS);
  el.addEventListener('click', function () { clearTimeout(timer); dismissHint(el); });
}

/* Peta instruksi per layar. Untuk 'video', teksnya DIPINDAHKAN dari
   objek COACH (lihat Revisi R1). Untuk empat layar lainnya, teks ini
   BARU — platform ini memang tidak pernah punya entri COACH untuk
   welcome dan gerbang tunggu, jadi siswa selama ini tidak menerima
   instruksi apa pun di sana. Kalimatnya disamakan dengan enam platform
   lain supaya siswa mengenali pola yang sama di seluruh perjalanan. */
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

/* setPage() ternyata dipanggil untuk KELIMA stage yang butuh hint
   ('welcome-1', 'welcome-2', 'wait-1', 'video', 'wait-2'), jadi satu
   baris di sini cukup — tidak perlu lima panggilan manual yang tersebar.
   Stage lain (story/activity/quiz/result) tidak ada di peta HINTS dan
   memang tetap ditangani coach mark. */
function setPage(page) {
  State.page = page;
  Nav.update();
  FloatBack.sync();
  if (HINTS[page]) hint(HINTS[page], HINTS_ON_DARK[page]);   /* Revisi R3 */
  else clearHints();                                          /* Revisi R3 */
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
    this.updateBackAvailability();

    /* Tambahan T1: '../home/index.html' -> '../index.html'. Folder home/
   tidak pernah ada di proyek ini; peta hub-nya adalah lake-lembayung/index.html
   satu tingkat di atas folder platform. Tautan ini terlewat dari daftar
   tiga tautan di index_Singhasari.html — sama rusaknya, jadi ikut
       diperbaiki. */
$('navHome').addEventListener('click', function () { window.location.href = '../index.html'; });
    /* Back sekarang mundur satu langkah DI DALAM modul lewat StepHistory /
       goBackOneStep() (didefinisikan di bawah), bukan lagi window.history.back().
       SPA ini tidak pernah memanggil pushState(), jadi history browser tidak
       pernah merekam langkah internal (welcome → video → story → activity →
       kuis) — itu sebabnya tombol ini dulu terasa sama saja dengan Home.
       Lihat dokumen revisi poin #1. */
    $('navBack').addEventListener('click', function () { goBackOneStep(); });
    $('navAsk').addEventListener('click', function () { Ask.open(); });
    $('navCoach').addEventListener('click', function () { Coach.open(); });
  },

  /* Nonaktifkan tombol Back kalau memang tak ada langkah sebelumnya untuk
     ditampilkan: di layar 'video' (dikecualikan total dari StepHistory) dan
     di 'story' (entri pertama dalam riwayat) — lihat komentar di StepHistory. */
  updateBackAvailability: function () {
    var btn = $('navBack');
    if (btn) btn.disabled = !StepHistory.canGoBack();
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
      'Steps: ' + Score.correct() + ' of ' + TOTAL_STEPS,
      'Lives: ' + State.lives + '/' + TOTAL_LIVES
    ];
  },

  /* Revisi R5: rotate() kini juga menyetel ulang infoIndex ke 0, supaya
     teks yang tampil dan penunjuk indeksnya tidak pernah berselisih setelah
     dijeda lalu dilanjutkan lagi (lihat pauseRotate/resumeRotate di bawah). */
  rotate: function () {
    var el = $('navInfo');
    var self = this;
    this.infoIndex = 0;
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

  /* Revisi R5: dipakai Coach.open()/close(). Membekukan lencana .nav-info
     pada teks yang sedang tampil — dan memastikan .is-fading dilepas, supaya
     sorotan coach mark tidak pernah menunjuk elemen ber-opacity 0. */
  pauseRotate: function () {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    var el = $('navInfo');
    if (el) el.classList.remove('is-fading');
  },
  resumeRotate: function () {
    if (!this.timer) this.rotate();
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

/* ---------------- Riwayat langkah internal (tombol Back & swipe-back) ----------------
   SPA ini tidak pernah memanggil history.pushState(), jadi window.history milik
   browser tak pernah tahu urutan layar DI DALAM modul. StepHistory menggantikannya
   dengan riwayat sendiri, murni di memori — lihat dokumen revisi poin #1.

   Model: `stack` menyimpan SEMUA layar yang pernah dikunjungi urut waktu (tak
   pernah dibuang), `cursor` menunjuk layar yang sedang tampil — persis seperti
   history browser sungguhan. back()/forward() memindah cursor tanpa mengubah
   isi stack; advance() dipakai untuk progres maju yang benar-benar baru (soal
   berikutnya, stage berikutnya) dan memotong sisa "masa depan" bila cursor
   sedang tidak di ujung (jaga-jaga kalau suatu saat alur ini tak lagi linear).

   'wait-1'/'wait-2' (gerbang tunggu guru) DAN 'video' SENGAJA tidak pernah
   di-push — video diperlakukan sejajar dengan gerbang, bukan cuma karena tak
   bisa "diulang" seperti gerbang, tapi karena satu-satunya jalan maju darinya
   adalah menonton sampai habis (memicu wait-2 lagi via event 'ended', lihat
   Video.init) — kalau video ikut ditaruh di riwayat, me-review-nya lewat Back
   akan memaksa nonton ulang + minta guru merilis gerbang lagi cuma untuk bisa
   melanjutkan, ganjil untuk sekadar "intip sebentar". Akibatnya 'story' jadi
   entri PERTAMA dalam riwayat — dan karena itu juga tidak punya "sebelumnya".
   Back karena itu dinonaktifkan tepat di dua layar: 'video' (dikecualikan
   total) dan 'story' (entri pertama) — lihat Nav.updateBackAvailability(). */
var StepHistory = {
  stack: [],
  cursor: -1,

  advance: function (stage, index) {
    this.stack = this.stack.slice(0, this.cursor + 1);
    this.stack.push({ stage: stage, index: (index === undefined ? null : index) });
    this.cursor = this.stack.length - 1;
    Nav.updateBackAvailability();
  },

  canGoBack: function () { return this.cursor > 0; },
  canGoForward: function () { return this.cursor >= 0 && this.cursor < this.stack.length - 1; },

  back: function () {
    if (!this.canGoBack()) return null;
    this.cursor--;
    Nav.updateBackAvailability();
    return this.stack[this.cursor];
  },
  forward: function () {
    if (!this.canGoForward()) return null;
    this.cursor++;
    Nav.updateBackAvailability();
    return this.stack[this.cursor];
  },
  current: function () { return this.cursor >= 0 ? this.stack[this.cursor] : null; }
};

/* Menampilkan satu layar {stage, index} — dipakai untuk progres maju, Back,
   maupun maju-ulang saat sedang review. Dilemma/Quiz.renderAt() sendiri yang
   memutuskan tampil interaktif (soal yang belum tuntas) atau read-only/review
   (soal yang sudah tuntas dijawab); showStep tidak perlu tahu bedanya. Tidak
   ada cabang 'video' di sini — lihat komentar StepHistory di atas. */
function showStep(target) {
  if (!target) return;
  if (target.stage === 'story') {
    showPage('storyPage'); setPage('story');
  } else if (target.stage === 'activity') {
    showPage('dilemmaPage'); setPage('activity');
    Dilemma.renderAt(target.index);
  } else if (target.stage === 'quiz') {
    showPage('quizPage'); setPage('quiz');
    Quiz.renderAt(target.index);
  } else if (target.stage === 'result') {
    showPage('resultPage'); setPage('result');
  }
  Coach.autoTrigger(target.stage);
}

function goBackOneStep() {
  if (Gate.isShown()) return;
  if (!StepHistory.canGoBack()) return;
  /* Buang progres tak-tuntas di soal yang sedang aktif (kalau ada) SEBELUM
     benar-benar berpindah layar — lihat Dilemma.discardPending(). */
  Dilemma.discardPending();
  showStep(StepHistory.back());
}

function goForwardOneStep() {
  showStep(StepHistory.forward());
}

/* ---------------- Skor: 24 langkah ---------------- */
var Score = {
  correct: function () { return State.choiceScore + State.reasonScore + State.quizFirstTry; },
  stars: function () {
    var pct = (this.correct() / TOTAL_STEPS) * 100;
    if (pct >= 85) return 3;
    if (pct >= 70) return 2;
    if (pct >= 60) return 1;
    return 0;
  },
  save: function () {
    var correct = this.correct();
    writeKey(KEY_SELF, {
      v: 1,
      status: 'completed',
      /* score/maxScore/stars dipertahankan bentuknya (10 poin per langkah,
         maks 240 seperti versi lama) supaya modul lain tidak rusak. */
      score: correct * 10,
      maxScore: LEGACY_MAX_SCORE,
      stars: this.stars(),
      correct: correct,
      total: TOTAL_STEPS,
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
    this.show('wait-2', 'Video finished', 'Please look at your teacher and wait before you start reading.');
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
  /* Revisi R1: Coach.autoTrigger('video') dicabut dari sini. Tur coach
     mark tidak boleh terbuka otomatis sebelum sesi video terlewati;
     layar ini cukup memakai hint ringkas, yang sudah dipicu otomatis
     oleh setPage('video') di bawah (lihat peta HINTS, Revisi R3). */
  start: function () {
    showPage('videoPage');
    setPage('video');
  }
};

/* ---------------- Cerita ---------------- */
var Story = {
  audio: null,
  playingBtn: null,   /* Revisi R7: tombol yang sedang memutar, untuk kelas .is-playing */

  init: function () {
    var self = this;
    $('storyContinueBtn').addEventListener('click', function () { Dilemma.start(); });
    this.render();
  },

  start: function () {
    StepHistory.advance('story');
    showStep(StepHistory.current());
  },

  render: function () {
    var wrap = $('storyText');
    var self = this;

    STORY.forEach(function (part, i) {
      var block = document.createElement('div');
      block.className = 'chapter';

      var num = document.createElement('span');
      num.className = 'chapter-num';
      num.setAttribute('aria-hidden', 'true');
      num.textContent = (i + 1) < 10 ? '0' + (i + 1) : String(i + 1);
      block.appendChild(num);

      var body = document.createElement('div');
      body.className = 'chapter-body';

      part.paras.forEach(function (text) {
        var p = document.createElement('p');
        p.textContent = text;
        body.appendChild(p);
      });
      if (part.quote) {
        var q = document.createElement('p');
        q.className = 'chapter-quote';
        q.textContent = part.quote;
        body.appendChild(q);
      }

      if (part.image) {
        var fig = document.createElement('figure');
        fig.className = 'plate chapter-plate';
        var img = document.createElement('img');
        img.src = part.image;
        img.alt = part.caption || '';
        img.loading = 'lazy';
        img.addEventListener('error', function () { fig.classList.add('is-empty'); });
        fig.appendChild(img);

        var note = document.createElement('span');
        note.className = 'plate-empty';
        note.setAttribute('aria-hidden', 'true');
        note.textContent = part.image;
        fig.appendChild(note);

        if (part.audio) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'chapter-plate-btn';
          btn.setAttribute('aria-label', 'Play the narration for part ' + (i + 1));
          /* Revisi R7: tombolnya kini benar-benar sebuah toggle, jadi
             statusnya diumumkan lewat aria-pressed, bukan hanya lewat warna. */
          btn.setAttribute('aria-pressed', 'false');
          btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';
          btn.addEventListener('click', function () { self.toggle(part.audio, btn); });
          fig.appendChild(btn);
        }
        body.appendChild(fig);

        if (part.caption) {
          var cap = document.createElement('figcaption');
          cap.className = 'chapter-caption';
          cap.textContent = part.caption;
          fig.appendChild(cap);
        }
      }

      block.appendChild(body);
      wrap.appendChild(block);
    });
  },

  /* Revisi R7: menekan tombol yang sedang memutar menghentikannya, dan
     memutar plat lain otomatis menghentikan yang sedang berjalan — jadi
     tidak pernah ada dua audio bertumpuk, sekaligus memberi siswa cara
     membatalkan audio yang salah tekan. */
  toggle: function (src, btn) {
    if (this.playingBtn === btn) { this.stop(); return; }
    this.play(src, btn);
  },

  play: function (src, btn) {
    var self = this;
    this.stop();

    var a = new Audio(src);
    this.audio = a;
    this.playingBtn = btn || null;
    if (this.playingBtn) {
      this.playingBtn.classList.add('is-playing');
      this.playingBtn.setAttribute('aria-pressed', 'true');
    }

    /* Penanda dilepas lagi begitu audio selesai, gagal dimuat, atau
       ditolak browser — supaya .is-playing tidak pernah tersangkut menyala. */
    a.addEventListener('ended', function () { self.stop(); });
    a.addEventListener('error', function () { self.stop(); });

    /* File audio boleh belum ada — kegagalan diabaikan diam-diam. */
    var p = a.play();
    if (p && p.catch) p.catch(function () { self.stop(); });
  },

  stop: function () {
    if (this.audio) { this.audio.pause(); this.audio = null; }
    if (this.playingBtn) {
      this.playingBtn.classList.remove('is-playing');
      this.playingBtn.setAttribute('aria-pressed', 'false');
      this.playingBtn = null;
    }
  }
};

/* ---------------- Choose & Justify ---------------- */
var Dilemma = {
  choicePicked: null,

  init: function () {
    $('dilemmaNextBtn').addEventListener('click', function () {
      var cur = StepHistory.current();
      if (cur && cur.stage === 'activity' && cur.index < State.dilemmaIndex) {
        /* Sedang me-review soal lama (bukan di ujung progres) — cukup maju
           satu langkah di riwayat, jangan sentuh skor atau frontier. */
        goForwardOneStep();
        return;
      }
      State.dilemmaIndex++;
      if (State.dilemmaIndex >= DILEMMAS.length) { Quiz.start(); return; }
      StepHistory.advance('activity', State.dilemmaIndex);
      showStep(StepHistory.current());
    });
  },

  start: function () {
    /* storyContinueBtn selalu bisa diklik kapan saja halaman story tampil —
       termasuk saat itu adalah hasil me-review lewat Back padahal progres
       asli sudah lebih jauh ke dalam activity. Dalam kondisi itu lanjutkan
       maju ke tempat semula alih-alih reset dilemmaIndex ke 0. */
    if (StepHistory.canGoForward()) { goForwardOneStep(); return; }
    State.dilemmaIndex = 0;
    StepHistory.advance('activity', 0);
    showStep(StepHistory.current());
  },

  /* Dipanggil dari showStep(). Status "sudah tuntas" (dan karena itu
     read-only) ditentukan dari ADA-TIDAKNYA catatan di State.dilemmaAnswers[i]
     — bukan dari perbandingan index terhadap frontier. Ini penting: soal
     frontier yang sudah tuntas dijawab (choice + reason) tapi "Next" belum
     sempat ditekan HARUS tetap tampil read-only kalau sempat ditinggal lalu
     dikunjungi lagi lewat Back/Next, bukan interaktif ulang. */
  renderAt: function (i) {
    if (State.dilemmaAnswers[i]) this.renderReview(i);
    else this.renderLive();
  },

  renderLive: function () {
    var d = DILEMMAS[State.dilemmaIndex];
    this.choicePicked = null;

    $('dilemmaLabel').textContent = 'Decision ' + (State.dilemmaIndex + 1) + ' of ' + DILEMMAS.length;
    $('dilemmaPrompt').textContent = d.prompt;
    $('dilemmaFeedback').hidden = true;
    $('dilemmaNextBtn').hidden = true;
    $('reasonBlock').hidden = true;
    $('reasonStepLabel').textContent = 'Step 2 of 2';   /* Revisi R7 */
    $('reasonOptions').innerHTML = '';

    var dots = $('dilemmaDots');
    dots.innerHTML = '';
    for (var i = 0; i < DILEMMAS.length; i++) {
      var dot = document.createElement('span');
      dot.className = 'dot' + (i < State.dilemmaIndex ? ' is-done' : i === State.dilemmaIndex ? ' is-now' : '');
      dots.appendChild(dot);
    }

    var box = $('dilemmaChoices');
    box.innerHTML = '';
    var self = this;
    d.choices.forEach(function (text, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice';
      btn.textContent = text;
      btn.setAttribute('data-index', String(i));
      btn.addEventListener('click', function () { self.pick(i, btn); });
      box.appendChild(btn);
    });
    window.scrollTo({ top: 0 });
  },

  /* Rekonstruksi statis dari State.dilemmaAnswers[i] — semua tombol nonaktif
     dan TANPA listener sama sekali, supaya me-review tidak mungkin mengubah
     State.choiceScore / reasonScore / reviewList. Kelas yang dipasang meniru
     persis logika pick()/reason() versi interaktif di bawah. */
  renderReview: function (i) {
    var d = DILEMMAS[i];
    var a = State.dilemmaAnswers[i];

    $('dilemmaLabel').textContent = 'Decision ' + (i + 1) + ' of ' + DILEMMAS.length + ' · review';
    $('dilemmaPrompt').textContent = d.prompt;

    var dots = $('dilemmaDots');
    dots.innerHTML = '';
    for (var k = 0; k < DILEMMAS.length; k++) {
      var dot = document.createElement('span');
      dot.className = 'dot' + (k < State.dilemmaIndex ? ' is-done' : k === State.dilemmaIndex ? ' is-now' : '');
      dots.appendChild(dot);
    }

    var box = $('dilemmaChoices');
    box.innerHTML = '';
    d.choices.forEach(function (text, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice';
      btn.textContent = text;
      btn.disabled = true;
      btn.setAttribute('data-index', String(idx));
      if (idx === d.answer) btn.classList.add(a.choiceIndex === d.answer ? 'is-good' : 'is-picked');
      else if (idx === a.choiceIndex) btn.classList.add('is-bad');
      box.appendChild(btn);
    });

    $('reasonStepLabel').textContent = 'Step 2 of 2';   /* Revisi R7 */
    $('reasonQuestion').textContent = d.reasonQuestion;
    $('reasonBlock').hidden = false;
    var rbox = $('reasonOptions');
    rbox.innerHTML = '';
    var keys = ['A', 'B', 'C', 'D'];
    d.reasons.forEach(function (text, idx) {
      var opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'option';
      opt.disabled = true;
      opt.setAttribute('data-index', String(idx));
      if (idx === d.reasonAnswer) opt.classList.add('is-correct');
      else if (idx === a.reasonIndex) opt.classList.add('is-wrong');
      var key = document.createElement('span');
      key.className = 'option-key';
      key.textContent = keys[idx];
      var label = document.createElement('span');
      label.textContent = text;
      opt.appendChild(key);
      opt.appendChild(label);
      rbox.appendChild(opt);
    });

    var correct = a.reasonIndex === d.reasonAnswer;
    var feedback = $('dilemmaFeedback');
    feedback.hidden = false;
    feedback.className = 'feedback ' + (correct ? 'is-good' : 'is-bad');
    feedback.textContent = (correct ? '' : 'The best reason is marked in green. ') + d.feedback;

    $('dilemmaNextBtn').hidden = false;
    $('dilemmaNextBtn').textContent = 'Next';
    window.scrollTo({ top: 0 });
  },

  pick: function (index, btn) {
    if (Gate.isShown() || this.choicePicked !== null) return;
    if (State.dilemmaAnswers[State.dilemmaIndex]) return; /* jaga-jaga: soal ini semestinya sudah read-only */
    var d = DILEMMAS[State.dilemmaIndex];
    this.choicePicked = index;

    Array.prototype.forEach.call($('dilemmaChoices').querySelectorAll('.choice'), function (b) { b.disabled = true; });
    if (index === d.answer) {
      btn.classList.add('is-good');
      State.choiceScore++;
    } else {
      btn.classList.add('is-bad');
      var right = $('dilemmaChoices').querySelector('.choice[data-index="' + d.answer + '"]');
      if (right) right.classList.add('is-picked');
      this.markReview('judgement');
    }

    /* Alasan selalu ditanyakan, apa pun pilihannya — inti level evaluatif
       ada di alasannya, bukan di pilihan ya/tidak-nya. */
    $('reasonStepLabel').textContent = 'Step 2 of 2';   /* Revisi R7 */
    $('reasonQuestion').textContent = d.reasonQuestion;
    $('reasonBlock').hidden = false;

    var box = $('reasonOptions');
    box.innerHTML = '';
    var keys = ['A', 'B', 'C', 'D'];
    var self = this;
    d.reasons.forEach(function (text, i) {
      var opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'option';
      opt.setAttribute('data-index', String(i));
      var key = document.createElement('span');
      key.className = 'option-key';
      key.textContent = keys[i];
      var label = document.createElement('span');
      label.textContent = text;
      opt.appendChild(key);
      opt.appendChild(label);
      opt.addEventListener('click', function () { self.reason(i, opt); });
      box.appendChild(opt);
    });
  },

  /* Alasan yang kurang tepat TIDAK menghukum: alasan terbaik langsung
     ditunjukkan beserta penjelasannya, tanpa kehilangan nyawa. */
  reason: function (index, btn) {
    if (Gate.isShown()) return;
    if (State.dilemmaAnswers[State.dilemmaIndex]) return; /* jaga-jaga */
    var d = DILEMMAS[State.dilemmaIndex];
    var feedback = $('dilemmaFeedback');
    var correct = index === d.reasonAnswer;

    Array.prototype.forEach.call($('reasonOptions').querySelectorAll('.option'), function (b) { b.disabled = true; });
    if (correct) {
      btn.classList.add('is-correct');
      State.reasonScore++;
    } else {
      btn.classList.add('is-wrong');
      var right = $('reasonOptions').querySelector('.option[data-index="' + d.reasonAnswer + '"]');
      if (right) right.classList.add('is-correct');
      this.markReview('reason');
    }

    feedback.hidden = false;
    feedback.className = 'feedback ' + (correct ? 'is-good' : 'is-bad');
    feedback.textContent = (correct ? '' : 'The best reason is marked in green. ') + d.feedback;

    $('dilemmaNextBtn').hidden = false;
    $('dilemmaNextBtn').textContent = State.dilemmaIndex < DILEMMAS.length - 1 ? 'Next decision' : 'Continue to the closing quiz';

    /* Commit — sejak baris ini soal State.dilemmaIndex terkunci read-only
       untuk sisa attempt ini (lihat renderAt di atas & discardPending di bawah). */
    State.dilemmaAnswers[State.dilemmaIndex] = { choiceIndex: this.choicePicked, reasonIndex: index };
  },

  /* Dipanggil dari goBackOneStep() SEBELUM benar-benar berpindah layar. Kalau
     soal yang sedang aktif baru separuh dijawab (pilihan sudah diklik, alasan
     belum) — buang jejaknya: kembalikan choiceScore yang sempat bertambah dan
     entri reviewList yang sempat tercatat, supaya soal itu kembali "belum
     pernah dicoba" kalau suatu saat dicapai lagi secara wajar. Soal yang
     SUDAH tuntas (tercatat di State.dilemmaAnswers) sama sekali tidak
     disentuh oleh fungsi ini — lihat dokumen revisi poin #1. */
  discardPending: function () {
    if (State.dilemmaIndex >= DILEMMAS.length) return; /* activity sudah tuntas semua (sedang di quiz/result) — tak ada apa pun untuk dibuang */
    if (this.choicePicked === null) return;
    if (State.dilemmaAnswers[State.dilemmaIndex]) return;
    var d = DILEMMAS[State.dilemmaIndex];
    if (this.choicePicked === d.answer) State.choiceScore--;
    for (var i = State.reviewList.length - 1; i >= 0; i--) {
      if (State.reviewList[i].index === State.dilemmaIndex && !State.reviewList[i].reason) {
        State.reviewList.splice(i, 1);
        break;
      }
    }
    this.choicePicked = null;
  },

  markReview: function (kind) {
    var entry = null;
    for (var i = 0; i < State.reviewList.length; i++) {
      if (State.reviewList[i].index === State.dilemmaIndex) entry = State.reviewList[i];
    }
    if (!entry) {
      entry = { index: State.dilemmaIndex, judgement: false, reason: false };
      State.reviewList.push(entry);
    }
    entry[kind] = true;
  }
};

/* ---------------- Kuis penutup ---------------- */
var Quiz = {
  init: function () {
    $('quizNextBtn').addEventListener('click', function () {
      var cur = StepHistory.current();
      if (cur && cur.stage === 'quiz' && cur.index < State.quizIndex) {
        /* Sedang me-review soal lama — cukup maju satu langkah di riwayat. */
        goForwardOneStep();
        return;
      }
      State.quizIndex++;
      if (State.quizIndex >= QUIZ.length) { Result.show(); return; }
      StepHistory.advance('quiz', State.quizIndex);
      showStep(StepHistory.current());
    });
  },

  start: function () {
    State.quizIndex = 0;
    StepHistory.advance('quiz', 0);
    showStep(StepHistory.current());
  },

  /* Sama seperti Dilemma.renderAt(): status "sudah tuntas" (read-only)
     ditentukan dari State.quizSolved[i], bukan dari perbandingan index —
     soal frontier yang sudah terjawab benar tapi "Next" belum ditekan juga
     tetap harus read-only kalau sempat ditinggal lewat Back. */
  renderAt: function (i) {
    if (State.quizSolved[i]) this.renderReview(i);
    else this.renderLive();
  },

  renderLive: function () {
    var i = State.quizIndex;
    var tried = State.quizTried[i] || [];
    State.quizClean = tried.length === 0;
    var q = QUIZ[i];
    $('quizLabel').textContent = 'Question ' + (i + 1) + ' of ' + QUIZ.length;
    $('quizQuestion').textContent = q.question;
    $('quizFeedback').hidden = true;
    $('quizNextBtn').hidden = true;

    var dots = $('quizDots');
    dots.innerHTML = '';
    for (var k = 0; k < QUIZ.length; k++) {
      var d = document.createElement('span');
      d.className = 'dot' + (k < i ? ' is-done' : k === i ? ' is-now' : '');
      dots.appendChild(d);
    }

    var box = $('quizOptions');
    box.innerHTML = '';
    var keys = ['A', 'B', 'C', 'D'];
    var self = this;
    q.options.forEach(function (text, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option';
      btn.setAttribute('data-index', String(idx));
      var key = document.createElement('span');
      key.className = 'option-key';
      key.textContent = keys[idx];
      var label = document.createElement('span');
      label.textContent = text;
      btn.appendChild(key);
      btn.appendChild(label);
      /* Pilihan yang sudah pernah dicoba & salah di attempt ini tetap
         tersilang & nonaktif — supaya kembali lewat Back/Next tidak membuka
         peluang kehilangan nyawa lagi untuk kesalahan yang persis sama. */
      if (tried.indexOf(idx) !== -1) {
        btn.classList.add('is-wrong');
        btn.disabled = true;
      } else {
        btn.addEventListener('click', function () { self.answer(idx, btn); });
      }
      box.appendChild(btn);
    });
    window.scrollTo({ top: 0 });
  },

  /* Rekonstruksi statis untuk soal yang sudah terjawab benar — semua tombol
     nonaktif, tanpa listener, dari State.quizSolved[i] + quizTried[i]. */
  renderReview: function (i) {
    var q = QUIZ[i];
    $('quizLabel').textContent = 'Question ' + (i + 1) + ' of ' + QUIZ.length + ' · review';
    $('quizQuestion').textContent = q.question;

    var dots = $('quizDots');
    dots.innerHTML = '';
    for (var k = 0; k < QUIZ.length; k++) {
      var d = document.createElement('span');
      d.className = 'dot' + (k < State.quizIndex ? ' is-done' : k === State.quizIndex ? ' is-now' : '');
      dots.appendChild(d);
    }

    var box = $('quizOptions');
    box.innerHTML = '';
    var keys = ['A', 'B', 'C', 'D'];
    var tried = State.quizTried[i] || [];
    q.options.forEach(function (text, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option';
      btn.disabled = true;
      btn.setAttribute('data-index', String(idx));
      if (idx === q.answer) btn.classList.add('is-correct');
      else if (tried.indexOf(idx) !== -1) btn.classList.add('is-wrong');
      var key = document.createElement('span');
      key.className = 'option-key';
      key.textContent = keys[idx];
      var label = document.createElement('span');
      label.textContent = text;
      btn.appendChild(key);
      btn.appendChild(label);
      box.appendChild(btn);
    });

    var feedback = $('quizFeedback');
    feedback.hidden = false;
    feedback.className = 'feedback is-good';
    feedback.textContent = q.feedback;

    $('quizNextBtn').hidden = false;
    $('quizNextBtn').textContent = 'Next';
    window.scrollTo({ top: 0 });
  },

  answer: function (index, btn) {
    if (Gate.isShown()) return;
    var i = State.quizIndex;
    if (State.quizSolved[i]) return; /* jaga-jaga */
    var q = QUIZ[i];
    var feedback = $('quizFeedback');

    if (index !== q.answer) {
      if (!State.quizTried[i]) State.quizTried[i] = [];
      if (State.quizTried[i].indexOf(index) === -1) State.quizTried[i].push(index);
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
    State.quizSolved[i] = true;

    $('quizNextBtn').hidden = false;
    $('quizNextBtn').textContent = i < QUIZ.length - 1 ? 'Next question' : 'See your result';
  }
};

/* ---------------- Hasil + ringkasan perjalanan ---------------- */
var Result = {
  /* Listener resultBackBtn dipindah ke sini, dipanggil sekali saja dari
     startSession() — sebelumnya dipasang ulang setiap kali show() jalan,
     jadi menumpuk listener duplikat kalau show() sempat terpanggil lebih
     dari sekali (catatan tambahan di dokumen revisi). */
  init: function () {
    $('resultBackBtn').addEventListener('click', function () {
      $('transitionOverlay').classList.add('is-active');
    });
  },

  show: function () {
    StepHistory.advance('result');
    showPage('resultPage');
    setPage('result');
    Score.save();

    /* Tambahan T3: dua atribut ini hanya dibaca oleh stylesheet cetak
       (#resultPage::before / ::after). Tanggalnya ikut dicantumkan karena
       penguji perlu tahu kapan sesi itu dikerjakan — arsip tanpa tanggal
       sulit dipakai sebagai bukti. */
    var page = $('resultPage');
    page.setAttribute('data-student', Nav.studentName());
    page.setAttribute('data-printed', new Date().toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    }));

    $('resultScore').innerHTML =
      '<div><dt>Steps</dt><dd>' + Score.correct() + '/' + TOTAL_STEPS + '</dd></div>' +
      '<div><dt>Lives left</dt><dd>' + State.lives + '/' + TOTAL_LIVES + '</dd></div>' +
      '<div><dt>Attempt</dt><dd>' + readAttempt() + '</dd></div>';

    var steps = $('resultSteps');
    steps.innerHTML = '';
    [
      { label: 'Judgements', got: State.choiceScore, of: DILEMMAS.length },
      { label: 'Reasons', got: State.reasonScore, of: DILEMMAS.length },
      { label: 'Closing quiz · first try', got: State.quizFirstTry, of: QUIZ.length }
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
    if (!State.reviewList.length) {
      var none = document.createElement('li');
      none.className = 'answer-item';
      none.textContent = 'None — every judgement and every reason landed on the first try.';
      answers.appendChild(none);
    } else {
      State.reviewList.forEach(function (entry) {
        var d = DILEMMAS[entry.index];
        var li = document.createElement('li');
        li.className = 'answer-item';
        var qEl = document.createElement('p');
        qEl.className = 'answer-q';
        qEl.textContent = (entry.index + 1) + '. ' + d.prompt;
        var right = document.createElement('p');
        right.className = 'answer-right';
        right.textContent = 'Best judgement: ' + d.choices[d.answer] + ' — ' + d.reasons[d.reasonAnswer];
        var why = document.createElement('p');
        why.className = 'answer-yours';
        why.textContent = d.feedback;
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

    /* Ringkasan tujuh lokasi — skor dibaca dari kunci masing-masing modul. */
    var journey = $('resultJourney');
    journey.innerHTML = '';
    JOURNEY.forEach(function (loc, i) {
      var data = readKey(loc.key);
      var li = document.createElement('li');
      li.className = 'step-item';
      var n = document.createElement('span');
      n.textContent = '0' + (i + 1);
      var label = document.createElement('span');
      label.textContent = loc.name + ' · ' + loc.role;
      var mark = document.createElement('span');
      var done = data && data.status === 'completed';
      mark.className = 'step-mark ' + (done ? 'is-good' : 'is-bad');
      if (done && typeof data.correct === 'number' && typeof data.total === 'number') {
        mark.textContent = data.correct + '/' + data.total;
      } else if (done && typeof data.score === 'number') {
        mark.textContent = data.score + ' pts';
      } else {
        mark.textContent = done ? 'done' : 'not yet';
      }
      li.appendChild(n);
      li.appendChild(label);
      li.appendChild(mark);
      journey.appendChild(li);
    });

    Coach.autoTrigger('result');
  }
};

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
    list.push({ module: 'lake_singha', page: State.page, text: text, at: new Date().toISOString() });
    writeKey('nl_questions_v1', list);
    $('askText').value = '';
    $('askNote').textContent = 'Sent. Your teacher will answer soon.';
    setTimeout(function () { Ask.close(); }, 1100);
  }
};

/* ---------------- Coach mark ----------------
   Tiap langkah adalah { text, target }. target adalah CSS selector elemen
   yang disorot (spotlight), atau null bila langkah ini memang tidak
   merujuk elemen spesifik (Coach.render() jatuh ke mode fallback: dialog
   di tengah, persis seperti sebelumnya). 'welcome-1', 'welcome-2', 'wait-1',
   dan 'wait-2' sengaja tidak ada di sini — pada tahap itu #appShell (tempat
   tombol navCoach berada) masih hidden atau tertutup #gate, jadi coach mark
   tidak pernah bisa dibuka di sana sama sekali.

   Revisi R1: 'video' kini IKUT DIKELUARKAN, dengan alasan yang berbeda —
   di sana #appShell sudah tampil dan coach mark sebenarnya bisa dibuka,
   tetapi aturan baru seluruh proyek melarangnya terbuka SENDIRI sebelum
   sesi video terlewati. Tombol #navCoach manual tetap bisa dipakai di
   halaman mana pun. Keempat layar welcome/tunggu di atas plus halaman
   video kini ditangani hint ringkas (Revisi R3) — teks 'video' yang dulu
   ada di sini sudah dipindahkan ke peta HINTS, tidak dibuang.
   Yang tersisa di objek ini: story, activity, quiz, result. */
var COACH = {
  story: [
    { text: 'Read the eight parts from top to bottom.', target: '#storyText' },
    { text: 'Tap the play badge on a picture to hear that part read aloud.', target: '.chapter-plate-btn' },
    { text: 'The activity asks you to judge the decisions in this story, so read the conversation with Pak Karta carefully.', target: null }
  ],
  activity: [
    { text: 'Each decision has two steps: your judgement first, then the reason behind it.', target: '#dilemmaChoices' },
    { text: 'The reason is the real work here — it is always asked, whichever judgement you pick.', target: '#reasonBlock' },
    { text: 'A reason that misses costs no life: the best one is marked in green with an explanation, so you can compare your thinking with it.', target: '#dilemmaFeedback' },
    { text: 'Ten decisions, then four closing questions. Both count toward your twenty-four steps.', target: '#dilemmaDots' }
  ],
  quiz: [
    { text: 'Four closing questions, one per screen.', target: '#quizDots' },
    { text: 'A wrong answer costs one life and stays crossed out; you can still find the right one.', target: '#navHearts' },
    { text: 'Only answers right on the first try count toward your steps.', target: '#navInfo' }
  ],
  result: [
    { text: 'This section shows how many of your 24 steps you got right.', target: '#resultScore' },
    { text: 'These are the decisions worth rereading, together with the best answer.', target: '#resultAnswers' },
    { text: 'And this is your whole journey across all seven locations.', target: '#resultJourney' }
  ]
};

/* Revisi R1: daftar tahap yang boleh membuka tur SENDIRI. Sengaja
   ditulis eksplisit, bukan hanya mengandalkan absennya kunci di COACH,
   karena autoTrigger() juga dipanggil dari goToStep()/showStep() dengan
   stage apa pun yang sedang dituju. Aturannya: coach mark otomatis baru
   boleh mulai SETELAH sesi video terlewati, seragam dengan enam platform
   lain. Stage 'story' menjadi coach mark otomatis PERTAMA yang dilihat
   siswa. */
var AUTO_COACH_STAGES = ['story', 'activity', 'quiz', 'result'];

var Coach = {
  steps: [],
  index: 0,
  mode: null,              /* 'spotlight' | 'fallback' — untuk langkah yang sedang tampil */
  settleTimer: null,
  scrollLocked: false,
  prevOverflow: '',

  /* Stage yang sudah pernah OTOMATIS dibuka pada attempt (sesi) ini — lihat
     autoTrigger() di bawah. Sengaja di memori saja, bukan sessionStorage:
     reload halaman memang memulai attempt baru (lihat init() di paling
     bawah file), jadi wajar kalau coach mark otomatis tampil lagi. */
  shown: {},

  init: function () {
    var self = this;
    $('coachNext').addEventListener('click', function () { self.next(); });
    $('coachClose').addEventListener('click', function () { self.close(); });
    /* Kriteria 2.5: spotlight tetap menempel ke target saat resize/rotasi. */
    window.addEventListener('resize', function () { self.reposition(); });
    window.addEventListener('orientationchange', function () { self.reposition(); });
  },

  /* Dipanggil dari showStep()/Result.show() setiap kali masuk ke suatu
     stage — termasuk saat Back/Next hanya menampilkan ulang stage yang
     sama (lihat komentar `shown` di atas untuk kenapa itu aman: sudah
     tercatat, jadi no-op). #navCoach manual TIDAK lewat sini sama sekali —
     tombol itu memanggil open() langsung, jadi selalu berfungsi apa pun
     status `shown` atau DevCoachToggle di bawah. Lihat dokumen revisi
     poin #3. */
  autoTrigger: function (stage) {
    if (AUTO_COACH_STAGES.indexOf(stage) === -1) return;   /* Revisi R1 */
    if (!COACH[stage]) return;
    if (!DevCoachToggle.enabled) return;
    if (this.shown[stage]) return;
    this.shown[stage] = true;
    this.open(stage);
  },

  open: function (forcePage) {
    this.steps = COACH[forcePage || State.page] || [{ text: 'Nothing to explain on this screen yet.', target: null }];
    this.index = 0;
    $('coachWrap').hidden = false;
    $('navCoach').classList.add('is-on');
    /* Revisi R5: rotasi .nav-info dibekukan selama tur berjalan. Langkah
       ketiga di stage 'quiz' menyorot #navInfo; kalau lencana itu kebetulan
       sedang di tengah animasi .is-fading (opacity 0, 300ms tiap 3,2 detik),
       cincin sorotan akan menunjuk ke sesuatu yang tak terlihat. Membekukan
       rotasi jauh lebih jujur daripada mengejar sinkronisasi waktu. */
    Nav.pauseRotate();
    this.lockScroll();
    this.render();
  },

  render: function () {
    var step = this.steps[this.index];
    $('coachStep').textContent = 'Step ' + (this.index + 1) + ' of ' + this.steps.length;
    $('coachText').textContent = step.text;
    $('coachNext').textContent = this.index === this.steps.length - 1 ? 'Got it' : 'Continue';
    this.showTarget(step.target);
  },

  /* Mode A — spotlight: target ada, ditemukan, dan sedang benar-benar
     tampil. getClientRects().length otomatis bernilai 0 untuk elemen yang
     [hidden] atau punya ancestor [hidden] (kasus nyata: #reasonBlock dan
     #dilemmaFeedback sebelum siswa menjawab) — jadi cukup satu pemeriksaan
     ini untuk menutupi "selector tidak ditemukan" maupun "elemen hidden".
     Mode B — fallback: dialog di tengah seperti sebelumnya. Ini jalur yang
     diharapkan untuk target: null, bukan bug. */
  showTarget: function (selector) {
    var el = selector ? document.querySelector(selector) : null;
    var self = this;
    clearTimeout(this.settleTimer);

    if (el && el.getClientRects().length) {
      this.mode = 'spotlight';
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
      /* Tunggu scroll (terutama yang smooth) selesai dulu sebelum mengukur
         posisi akhir. Kalau langkah sebelumnya juga spotlight, cincin lama
         dibiarkan tampil apa adanya sampai posisi baru siap — tidak
         di-reset ke overlay rata dulu, supaya tidak "berkedip". */
      this.settleTimer = setTimeout(function () {
        self.position(el);
        $('coachWrap').classList.add('is-spotlight');
      }, reduced ? 20 : 320);
    } else {
      this.mode = 'fallback';
      $('coachWrap').classList.remove('is-spotlight');
    }
  },

  /* Teknik cutout: 4 div gelap menutupi atas/bawah/kiri/kanan bounding box
     target (bukan box-shadow pada target — itu terpotong di dalam container
     overflow:hidden/auto yang banyak dipakai di file ini). getBoundingClientRect()
     relatif ke viewport, jadi otomatis berfungsi untuk elemen di dalam
     .nav yang position:sticky sekalipun (langkah quiz menyorot #navHearts/#navInfo). */
  position: function (el) {
    if (this.mode !== 'spotlight' || !el || !el.getClientRects().length) return;
    var r = el.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight, pad = 6;

    setRect($('coachCutoutTop'), 0, 0, vw, r.top - pad);
    setRect($('coachCutoutBottom'), r.bottom + pad, 0, vw, vh - r.bottom - pad);
    setRect($('coachCutoutLeft'), r.top - pad, 0, r.left - pad, r.height + pad * 2);
    setRect($('coachCutoutRight'), r.top - pad, r.right + pad, vw - r.right - pad, r.height + pad * 2);
    setRect($('coachRing'), r.top - pad, r.left - pad, r.width + pad * 2, r.height + pad * 2);

    var callout = $('coachCallout');
    var arrow = $('coachCalloutArrow');
    /* Menempel di bawah target bila muat, pindah ke atas bila mepet ke
       tepi bawah layar; geser horizontal bila mepet ke tepi kiri/kanan. */
    var placeAbove = (vh - r.bottom) < 180 && r.top > 180;
    var top = placeAbove
      ? (r.top - pad - callout.offsetHeight - 12)
      : (r.bottom + pad + 12);
    top = Math.min(Math.max(top, 12), Math.max(12, vh - callout.offsetHeight - 12));
    var left = Math.min(Math.max(r.left, 12), Math.max(12, vw - callout.offsetWidth - 12));

    callout.style.top = top + 'px';
    callout.style.left = left + 'px';
    arrow.className = 'coach-callout-arrow ' + (placeAbove ? 'is-down' : 'is-up');
    arrow.style.left = Math.min(Math.max(r.left + r.width / 2 - left - 7, 14), Math.max(14, callout.offsetWidth - 28)) + 'px';
  },

  /* Dipanggil saat resize/orientationchange selama coach terbuka. Hanya
     menghitung ulang posisi dari rect target yang sekarang — TANPA
     scrollIntoView ulang, supaya layar tidak "melompat" saat pengguna
     sedang memutar layar atau mengubah ukuran jendela. */
  reposition: function () {
    if ($('coachWrap').hidden || this.mode !== 'spotlight') return;
    var step = this.steps[this.index];
    var el = step && step.target ? document.querySelector(step.target) : null;
    if (el) this.position(el);
  },

  next: function () {
    if (this.index < this.steps.length - 1) { this.index++; this.render(); }
    else this.close();
  },
  close: function () {
    clearTimeout(this.settleTimer);
    $('coachWrap').hidden = true;
    $('coachWrap').classList.remove('is-spotlight');
    $('navCoach').classList.remove('is-on');
    Nav.resumeRotate();   /* Revisi R5 — lihat open() di atas */
    this.unlockScroll();
  },

  /* Kunci scroll halaman belakang selama coach terbuka, supaya spotlight
     tidak lepas dari target saat pengguna scroll tanpa sengaja. overflow:
     hidden dipakai (bukan teknik position:fixed+top pada body) karena tetap
     membiarkan scrollIntoView memindahkan posisi scroll secara terprogram
     di antar-langkah, sementara scroll oleh pengguna sendiri tetap terkunci. */
  lockScroll: function () {
    if (this.scrollLocked) return;
    this.scrollLocked = true;
    this.prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
  },
  unlockScroll: function () {
    if (!this.scrollLocked) return;
    this.scrollLocked = false;
    document.documentElement.style.overflow = this.prevOverflow;
  }
};

/* ---------------- Toggle developer: auto-trigger coach mark ----------------
   Sengaja didefinisikan DI LUAR blok "MODE PENGEMBANG" di bawah — logikanya
   (dibaca oleh Coach.autoTrigger) tetap harus berjalan normal di production;
   yang dev-only cuma TOMBOLNYA (#devCoachToggle, digated lewat DEV_MODE lewat
   initDevPanel()). Default true supaya coach mark otomatis (poin #3) aktif
   dari awal seperti seharusnya — toggle ini murni alat bantu testing untuk
   MEMATIKANNYA sementara, bukan syarat supaya fiturnya menyala. */
var DevCoachToggle = {
  enabled: true,
  toggle: function () {
    this.enabled = !this.enabled;
    var btn = $('devCoachToggle');
    if (btn) {
      btn.classList.toggle('is-on', this.enabled);
      btn.setAttribute('aria-pressed', String(this.enabled));
    }
  }
};

function setRect(el, top, left, width, height) {
  el.style.top = top + 'px';
  el.style.left = left + 'px';
  el.style.width = Math.max(0, width) + 'px';
  el.style.height = Math.max(0, height) + 'px';
}

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
      goBackOneStep(); /* konsisten dengan #navBack — lihat dokumen revisi poin #1 */
    }, { passive: true });
  });
}

var FloatBack = {
  sync: function () {
    var hide = Gate.isShown() || $('appShell').hidden;
    $('floatBack').classList.toggle('is-hidden', hide);
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

  /* Revisi R6: 'click' -> onTap() di kedua layar, supaya gulir di
     .welcome-2-body tidak lagi terbaca sebagai "tap untuk lanjut". */
  var step1Done = false;
  onTap(w1, function () {
    if (step1Done) return;
    step1Done = true;
    w1.hidden = true;
    w2.hidden = false;
    setPage('welcome-2');   /* hint 'Tap to see your path' ikut terpicu di sini */
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
      hint('Tap again to start');   /* Revisi R3 — tahap kedua welcome-2 */
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
  var coachToggleBtn = $('devCoachToggle');
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

    if (!$('dilemmaPage').hidden) {
      if (!$('dilemmaNextBtn').hidden) { $('dilemmaNextBtn').click(); return; }
      var d = DILEMMAS[State.dilemmaIndex];
      if ($('reasonBlock').hidden) {
        var choice = $('dilemmaChoices').querySelector('.choice[data-index="' + d.answer + '"]');
        if (choice && !choice.disabled) { choice.click(); return; }
      } else {
        var reason = $('reasonOptions').querySelector('.option[data-index="' + d.reasonAnswer + '"]');
        if (reason && !reason.disabled) { reason.click(); return; }
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

  /* Tombol dev baru (poin #4): cuma toggle DevCoachToggle.enabled, sama
     sekali tidak menyentuh #navCoach manual — itu tetap jalan lewat
     Coach.open() langsung apa pun posisi toggle ini. */
  if (coachToggleBtn) {
    coachToggleBtn.classList.toggle('is-on', DevCoachToggle.enabled);
    coachToggleBtn.setAttribute('aria-pressed', String(DevCoachToggle.enabled));
    coachToggleBtn.addEventListener('click', function () { DevCoachToggle.toggle(); });
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
    Story.init();
    Dilemma.init();
    Quiz.init();
    Ask.init();
    Coach.init();
    Result.init();
    Gate.waitBeforeVideo();
    FloatBack.sync();
  }

  $('welcome1').hidden = false;
  setPage('welcome-1');
  FloatBack.sync();
  initWelcome(startSession);
})();