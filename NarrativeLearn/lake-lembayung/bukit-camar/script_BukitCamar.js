/* ============================================================
   Bukit Camar — NarrativeLearn  (re-design)
   /lake-lembayung/bukit-camar/

   Alur: locked → welcome 1 → welcome 2 → review gate (guru) →
   material → activity 1 → activity 2 → closing. Empat halaman
   terakhir dulu hidup sebagai satu overlay .sheet mengambang di
   atas cerita; sekarang masing-masing halaman sejajar penuh yang
   ditukar lewat [hidden], pola yang sama dengan locked/welcome/
   appShell — lihat Revisi UI §3.

   Kunci localStorage (tidak berubah dari versi lama):
     oj_selatan_v1  — prasyarat dari Ocean Journey
     lake_bukit_v1  — status penyelesaian modul ini
     nl_student_v1  — identitas siswa lintas modul
     nl_questions_v1 — pertanyaan siswa ke guru (baru)

   Revisi lanjutan (lihat revisi-bukit-camar-prompt.md):
     - Revisi 1: navBack sekarang memundurkan STATE INTERNAL modul
       (Nav.goBack), bukan window.history. Berhenti di stage 'material'
       — tidak menembus 'review' (gerbang guru sekali-jalan) atau
       welcome-1/2 (nav belum ada di sana).
     - Revisi 3: Coach Mark tampil OTOMATIS sekali per stage begitu
       transisi ke stage itu selesai (Coach.maybeAutoOpen), di atas
       akses manual navCoach yang sudah ada. Status "sudah otomatis
       tampil" cuma di memori (Coach.autoShown), reset tiap reload.
     - Revisi 2: teks cerita Activity 2 sekarang di dalam panel
       referensi buka-tutup (#act2StoryPanel), bukan mengalir bebas
       di halaman — mekanik "ketuk penanda waktu" di dalam teks tidak
       berubah sama sekali.
   ============================================================ */

/* ============================================================
   ⚠️ MODE PENGEMBANG — HAPUS SEBELUM LAUNCHING
   Blok bertanda ini ada di tiga file (.html/.css/.js).
   DEV_MODE=true → gembok prasyarat dilewati + dua tombol dev muncul:
     - devAnswer (bulat)         → meloloskan/menjawab BENAR untuk
       satu langkah yang SEDANG tampil (satu pertanyaan, satu
       penanda, satu gerbang guru), bukan melompati semuanya sekaligus.
     - devCoachToggle (persegi)  → Revisi 4: nyalakan/matikan seluruh
       sistem Coach Mark (auto-trigger Revisi 3 + akses manual
       navCoach), supaya testing tahap-tahap lain lebih cepat tanpa
       harus menutup kartu tur berulang kali.
   ============================================================ */
var DEV_MODE = true;
/* ====================== AKHIR CATATAN ATAS ====================== */

/* ---------------- Data cerita (teks dikunci, jangan diubah) ---------------- */
var STORY_PARAGRAPHS = [
  'In Jayakarta Province, there is a large lake called Lake Lembayung. On its eastern shore stands a green hill named Bukit Camar, ringed by three quiet villages: Sunda Kelapa Village, Muara Jati Village, and Singhasari Village. The air there always feels cool, mixed with the scent of damp earth and leaves, while the trickle of small streams down the hillside forms a natural music that accompanies the villagers\' daily life. For years, the people of the three villages lived side by side with the lake and the hill. They caught fish in the lake, grew vegetables on the hillside, and drew clean water from springs flowing down from the dense trees at the top of Bukit Camar.',
  'In Sunda Kelapa Village stood a volunteer rescue team called the Jayakarta SAR Team. The team had been formed long before the great disaster struck, led by Pak Rosyad, a former fisherman who had known every corner of the lake for decades. Its members were trained young villagers, including the quick and fearless Aksara, and Shofia, who was skilled at reading the condition of the land and water. Though based in the village, the team regularly coordinated with the district\'s Regional Disaster Management Agency (BPBD) and joined shared training every month.',
  'But in recent years, something began to change on Bukit Camar. Illegal logging became widespread. Some of the forest was cut down to sell as timber, while other parts were cleared into farmland without permits. The big trees that once held the soil together with their roots grew fewer and fewer. Pak Rosyad repeatedly reported the situation to the BPBD and warned the villagers, but the changes on the hill happened too slowly to be recognized as a real danger.',
  'The rainy season arrived early that year. Rain fell without stopping from evening until late at night, soaking the soil of Bukit Camar, which had already lost most of its trees. Without the tree roots that once held the soil together, the hillside slowly became saturated with water, far beyond what it could hold.',
  'Just before dawn, while most of the villagers were still fast asleep, the soil on Bukit Camar could finally no longer bear its own weight. A massive landslide occurred, carrying earth, rocks, and fallen trees straight down into Lake Lembayung. The lake\'s water, suddenly forced beyond its volume, surged over its banks with tremendous force, creating a flash flood that swept down into the surrounding villages — and Sunda Kelapa Village, the closest to the landslide, was the first and hardest hit.',
  'In the darkness, with the rain still not letting up, a villager who happened to still be awake heard the roar and quickly sounded the warning drum. The sound spread from house to house, giving Muara Jati Village and Singhasari Village a little time to prepare before the water truly arrived. But for Sunda Kelapa Village itself, there was almost no time left at all.',
  'Pak Rosyad immediately radioed the district BPBD post, asking for extra personnel and equipment. But in the darkness and the strong current, he knew his team could not do much more that night — moving carelessly when visibility was near zero would only add new victims. All they could do was help the nearest villagers reach higher ground, while waiting for the sky to grow light.',
  'As dawn began to break and the rain eased, the Jayakarta SAR Team — now joined by several BPBD personnel from the district — began combing the affected area, one section at a time. They found many villagers who had held on through the night on rooftops or in tall trees. But not everyone was so fortunate. In a few places, especially the part of Sunda Kelapa Village closest to the landslide, the team found that not everyone had made it through safely.',
  'When the sun had fully risen, the initial search operation slowly wound down. The Jayakarta SAR Team stood on high ground, looking out over the three villages, now soaked, mud-covered, and grieving. Houses were damaged, roads were blocked with landslide debris, and the lake that was usually calm was now murky and brown.',
  '"We\'ve done what we could tonight," Pak Rosyad said quietly, his voice heavy with exhaustion. "But our work is far from over. These three villages need different kinds of help now, and that will take time."',
  'Aksara looked toward Sunda Kelapa Village, thinking of the villagers\' wells that might already be contaminated with mud. Shofia thought of the small bridge in Muara Jati Village that might have been swept away by the current. And they all knew that in Singhasari Village, the houses closest to the waterway must have suffered the worst damage.',
  '"Where should we start?" Aksara asked quietly. "With what\'s most urgent," Shofia answered. "Sunda Kelapa\'s water supply first, before anyone falls ill from not having enough to drink."',
  'That day marked the beginning of a new chapter for the Jayakarta SAR Team — no longer about saving lives in the middle of the night, but about helping the three villages rise again, one by one, from the wounds left behind by the disaster.'
];

var TIME_MARKERS = ['For years', 'in recent years', 'Just before dawn', 'As dawn began to break', 'When the sun had fully risen'];
var TIME_DECOYS = ['long before', 'every month', 'from evening until late at night', 'that night', 'That day'];
var ALL_CANDIDATES = TIME_MARKERS.concat(TIME_DECOYS);

var ORIENTATION_END = 2;
var COMPLICATION_END = 7;
var RECALL2_TARGET = 3;

/* Rencana gambar per paragraf: 'wide' 16:9, 'square' 1:1,
   'portrait' 2:3 (mengambang di sisi teks), 'none' teks saja. */
var IMAGE_PLAN = ['wide', 'square', 'none', 'portrait', 'wide', 'none', 'square', 'portrait', 'wide', 'none', 'square', 'none', 'wide'];

/* Nama file dipertahankan persis seperti versi lama — unggah ke folder
   gambar/ dengan nama yang sama dan placeholder-nya otomatis hilang. */
var IMAGE_SOURCES = {
  0: { src: 'gambar/bukit-camar-p1.jpg', alt: 'Lake Lembayung and the green Bukit Camar hill, surrounded by three quiet villages' },
  1: { src: 'gambar/bukit-camar-p2.jpg', alt: 'The Jayakarta SAR Team gathered, led by Pak Rosyad together with Aksara and Shofia' },
  3: { src: 'gambar/bukit-camar-p4.jpg', alt: 'Heavy rain pours over the slopes of Bukit Camar, which has lost its trees' },
  4: { src: 'gambar/bukit-camar-p5.jpg', alt: 'A massive landslide crashes down into Lake Lembayung, triggering a flash flood toward the villages' },
  6: { src: 'gambar/bukit-camar-p7.jpg', alt: 'Pak Rosyad radios the BPBD amid the darkness and the strong current' },
  7: { src: 'gambar/bukit-camar-p8.jpg', alt: 'The Jayakarta SAR Team combs the affected area as dawn begins to break' },
  8: { src: 'gambar/bukit-camar-p9.jpg', alt: 'The SAR team stands on high ground, looking out over three villages soaked in mud' },
  10: { src: 'gambar/bukit-camar-p11.jpg', alt: 'Aksara and Shofia consider the urgent needs of the people of Sunda Kelapa and Muara Jati' },
  12: { src: 'gambar/bukit-camar-p13.jpg', alt: 'The Jayakarta SAR Team begins a new chapter: helping three villages recover from disaster' }
};

var RECALL1_QUESTIONS = [
  {
    prompt: 'In which paragraph does the <em>orientation</em> part of this story end?',
    answer: ORIENTATION_END,
    correct: 'Exactly right. Paragraphs 1–' + ORIENTATION_END + ' introduce the setting, the characters, and the villagers\' life before the disaster.',
    incorrect: 'Not quite — orientation ends at paragraph ' + ORIENTATION_END + '. Paragraphs 1–' + ORIENTATION_END + ' introduce the setting, the characters, and the villagers\' life before the disaster.'
  },
  {
    prompt: 'Next, in which paragraph does the <em>complication</em> (problem) part of this story end?',
    answer: COMPLICATION_END,
    correct: 'Correct. Paragraphs ' + (ORIENTATION_END + 1) + '–' + COMPLICATION_END + ' raise and build up the problem: illegal logging, the landslide, the flash flood, right up to the team having to wait because they could not act in the dark.',
    incorrect: 'Not quite — complication ends at paragraph ' + COMPLICATION_END + '. Those paragraphs build up the problem, right up to the team having to wait for dawn before they could act.'
  },
  {
    prompt: 'Finally, in which paragraph does the <em>resolution</em> part of this story begin?',
    answer: COMPLICATION_END + 1,
    correct: 'Exactly. From paragraph ' + (COMPLICATION_END + 1) + ' on, the team acts on the aftermath — searching, combing the area, then planning how to help the three villages.',
    incorrect: 'Not quite — resolution begins at paragraph ' + (COMPLICATION_END + 1) + '. In that paragraph the team starts acting on the aftermath as soon as dawn arrives.'
  }
];

var TOTAL_QUESTIONS = RECALL1_QUESTIONS.length + RECALL2_TARGET;
var TOTAL_CHANCES = 7;

/* ---------------- State ---------------- */
var State = {
  page: 'welcome-1',
  chances: TOTAL_CHANCES,
  answered: 0,        /* soal yang sudah selesai (dari 6) */
  firstTryCorrect: 0, /* dasar skor: benar pada percobaan pertama */
  act1Index: 0,
  act1Tried: false,   /* sudah pernah salah di soal yang sedang tampil */
  markersFound: [],
  act1Done: false,
  act2Done: false
};

/* 'activity' dulu satu nilai untuk Aktivitas 1 & 2 sekaligus — dipecah
   jadi 'activity-1'/'activity-2' begitu keduanya jadi halaman terpisah
   (Revisi UI §3), yang sekaligus merapikan nav-info dan membuat Coach
   Mark per-halaman jalan tanpa logika kondisional tambahan (§2). */
var STAGES = ['welcome-1', 'welcome-2', 'review', 'material', 'activity-1', 'activity-2', 'closing'];
var STAGE_LABELS = {
  'welcome-1': 'Welcome', 'welcome-2': 'Welcome', review: 'Review',
  material: 'Reading', 'activity-1': 'Activity 1', 'activity-2': 'Activity 2', closing: 'Closing'
};

/* Revisi 1: urutan tahap yang bisa DITUJU tombol navBack — subset dari
   STAGES. 'welcome-1'/'welcome-2' tidak termasuk karena #nav (dan
   tombol Back itu sendiri) belum ada di DOM yang terlihat sampai
   startSession() berjalan. 'review' juga sengaja tidak termasuk:
   itu gerbang guru SEKALI JALAN — videoUnlocked/nextUnlocked di
   ReviewGate tidak pernah direset, jadi kalau Back membawa siswa
   balik ke sana, unlockNext() jadi no-op permanen (macet, tidak bisa
   maju lagi). 'material' dengan begitu jadi titik paling awal yang
   bisa dituju Back — lihat Nav.goBack(). */
var BACK_STAGES = ['material', 'activity-1', 'activity-2', 'closing'];
var BACK_PAGE_ID = {
  material: 'materialPage1',
  'activity-1': 'activityPage1',
  'activity-2': 'activityPage2',
  closing: 'closingPage1'
};

function $(id) { return document.getElementById(id); }

/* ---------------- Hint (Revisi R3) ----------------
   Notifikasi instruksi satu baris di pojok kanan atas, menggantikan
   Coach Mark otomatis di welcome-1, welcome-2, dan seluruh gerbang
   review (lihat Revisi R1 — coach mark otomatis baru boleh mulai
   setelah sesi video terlewati). Menutup sendiri setelah HINT_MS, atau
   langsung saat ditekan. Sengaja TIDAK memblokir apa pun: pointer-events
   hanya aktif di pilnya sendiri, jadi "tap layar untuk lanjut" tetap
   bisa dilakukan di area lain tanpa lebih dulu menutup hint ini.
   Parameter onDark dipakai saat hint tampil di atas gerbang gelap
   (#reviewWaiting1/#reviewWaiting2), di mana pil putih terlalu
   menyilaukan. */
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
   (lihat Revisi R1), bukan ditulis baru, supaya kalimat yang sudah
   diuji ke siswa tidak berubah maknanya. Diperpendek seperlunya agar
   muat satu-dua baris di pil. */
var HINTS = {
  'welcome-1':     'Tap anywhere to continue',
  'welcome-2':     'Tap to see the plan',
  'review-wait-1': 'Wait for your teacher',
  'review-video':  'Press play when you are ready',
  'review-wait-2': 'Wait for your teacher'
};

function readKey(key) {
  var raw = localStorage.getItem(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}
function writeKey(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function setPage(page) {
  State.page = page;
  Nav.update();
}

function prefersReducedMotion() {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

/* Ganti scrollIntoView: geser jendela ke posisi elemen dengan offset
   navigator, supaya target tidak tertutup header yang sticky. */
function scrollToEl(el, extra) {
  if (!el) return;
  var nav = $('nav');
  var offset = (nav ? nav.offsetHeight : 0) + (extra || 12);
  var y = window.pageYOffset + el.getBoundingClientRect().top - offset;
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
}

/* Transisi antar-halaman: pudar ke warna latar (var(--bg)) lewat
   #transitionOverlay, tukar [hidden], lalu pudar kembali. Dipakai
   konsisten di seluruh alur review → material → activity-1 →
   activity-2 → closing supaya terasa satu alur, bukan lompatan
   (Revisi UI §3). `after` (opsional) berjalan tepat setelah halaman
   baru terlihat — dipakai saat sebuah langkah butuh mengukur/scroll
   ke elemen yang baru saja berhenti disembunyikan. */
function transitionSwap(hideEl, showEl, after) {
  var overlay = $('transitionOverlay');
  var wait = prefersReducedMotion() ? 0 : 600;
  overlay.classList.add('is-active');
  setTimeout(function () {
    if (hideEl) hideEl.hidden = true;
    if (showEl) showEl.hidden = false;
    window.scrollTo({ top: 0 });
    if (typeof after === 'function') after();
    overlay.classList.remove('is-active');
  }, wait);
}

/* ---------------- Render cerita ---------------- */
function findMatches(text) {
  var found = [];
  ALL_CANDIDATES.forEach(function (phrase) {
    var idx = text.indexOf(phrase);
    if (idx !== -1) found.push({ start: idx, end: idx + phrase.length, phrase: phrase });
  });
  found.sort(function (a, b) { return a.start - b.start; });
  var out = [];
  var lastEnd = -1;
  found.forEach(function (m) {
    if (m.start >= lastEnd) { out.push(m); lastEnd = m.end; }
  });
  return out;
}

function fillParagraph(target, text) {
  var matches = findMatches(text);
  if (!matches.length) { target.appendChild(document.createTextNode(text)); return; }
  var cursor = 0;
  matches.forEach(function (m) {
    if (m.start > cursor) target.appendChild(document.createTextNode(text.slice(cursor, m.start)));
    var span = document.createElement('span');
    span.className = 'marker';
    span.setAttribute('data-marker', m.phrase);
    span.setAttribute('data-valid', TIME_MARKERS.indexOf(m.phrase) !== -1 ? 'true' : 'false');
    span.setAttribute('tabindex', '0');
    span.setAttribute('role', 'button');
    span.setAttribute('aria-label', 'Time marker candidate: ' + m.phrase);
    span.setAttribute('aria-pressed', 'false');
    span.textContent = m.phrase;
    target.appendChild(span);
    cursor = m.end;
  });
  if (cursor < text.length) target.appendChild(document.createTextNode(text.slice(cursor)));
}

function buildPlate(index, treatment, portraitCount) {
  var info = IMAGE_SOURCES[index] || {};
  var plate = document.createElement('figure');
  plate.className = 'plate para-plate is-' + treatment + (treatment === 'portrait' && portraitCount % 2 ? ' is-right' : '');
  plate.style.margin = plate.style.margin; /* biarkan CSS yang mengatur */

  var img = document.createElement('img');
  img.src = info.src || '';
  img.alt = info.alt || ('Illustration for paragraph ' + (index + 1));
  img.loading = 'lazy';
  img.addEventListener('error', function () { plate.classList.add('is-empty'); });
  if (!info.src) plate.classList.add('is-empty');
  plate.appendChild(img);

  var note = document.createElement('span');
  note.className = 'plate-empty';
  note.setAttribute('aria-hidden', 'true');
  note.textContent = (info.src || 'gambar/…') + ' — paragraph ' + (index + 1);
  plate.appendChild(note);
  return plate;
}

function renderStory() {
  var wrap = $('storyText');
  var portraitCount = 0;

  STORY_PARAGRAPHS.forEach(function (text, i) {
    var block = document.createElement('div');
    block.className = 'para';

    var num = document.createElement('span');
    num.className = 'para-num';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = (i + 1) < 10 ? '0' + (i + 1) : String(i + 1);
    block.appendChild(num);

    var body = document.createElement('div');
    body.className = 'para-body';

    var treatment = IMAGE_PLAN[i] || 'none';
    if (treatment !== 'none' && treatment !== 'portrait') body.appendChild(buildPlate(i, treatment, 0));

    var p = document.createElement('p');
    p.setAttribute('data-paragraph', String(i + 1));
    if (treatment === 'portrait') {
      p.appendChild(buildPlate(i, treatment, portraitCount));
      portraitCount++;
    }
    fillParagraph(p, text);
    body.appendChild(p);

    block.appendChild(body);
    wrap.appendChild(block);
  });
}

function initScrollReveal() {
  var blocks = document.querySelectorAll('.para');
  if (!blocks.length) return;
  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(blocks, function (el) { el.classList.add('is-in-view'); });
    return;
  }
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('is-in-view'); });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  Array.prototype.forEach.call(blocks, function (el) { obs.observe(el); });
}

/* ---------------- Navigator ---------------- */
var Nav = {
  infoIndex: 0,
  timer: null,

  init: function () {
    $('navStudent').textContent = this.studentName();
    this.renderHearts();
    this.update();
    this.rotate();
    this.syncHeight();
    window.addEventListener('resize', this.syncHeight);

    $('navHome').addEventListener('click', function () { window.location.href = '../index.html'; }); /* Revisi T1: folder home/ tidak ada */
    /* Revisi 1: navBack dulu pakai window.history.back(), padahal
       seluruh perpindahan tahap di modul ini lewat toggle [hidden]
       (transitionSwap), bukan pushState — jadi browser tidak pernah
       mencatat riwayat untuk itu. Diganti total: panggil Nav.goBack(),
       fungsi berdiri sendiri yang memundurkan STATE INTERNAL modul,
       supaya gampang dipakai ulang (mis. gesture swipe-to-back nanti). */
    $('navBack').addEventListener('click', function () { Nav.goBack(); });
    $('navAsk').addEventListener('click', function () { Ask.open(); });
    $('navCoach').addEventListener('click', function () { Coach.open(); });
  },

  /* Ukur tinggi navigator sungguhan dan simpan ke --nav-h, dipakai
     .hunt-bar (style_BukitCamar.css) supaya pita counter Aktivitas 2 menempel
     tepat di bawah navigator saat digulir, bukan menimpanya. */
  syncHeight: function () {
    var nav = $('nav');
    if (nav) document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
  },

  studentName: function () {
    var data = readKey('nl_student_v1');
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

  renderHearts: function () {
    var box = $('navHearts');
    var html = '';
    for (var i = 0; i < TOTAL_CHANCES; i++) {
      var broken = i >= State.chances;
      html += '<span class="nav-heart ' + (broken ? 'is-broken' : 'is-full') + '">' + this.heartSvg(broken) + '</span>';
    }
    box.innerHTML = html;
    box.setAttribute('aria-label', 'Chances remaining: ' + State.chances + ' of ' + TOTAL_CHANCES);
  },

  update: function () {
    var idx = STAGES.indexOf(State.page);
    if (idx < 0) idx = 0;
    $('navProgressFill').style.width = ((idx + 1) / STAGES.length) * 100 + '%';
    this.syncBackButton();
  },

  /* Revisi 1 §2: navBack dimatikan (native disabled, bukan cuma
     class) selama layar dikontrol penuh oleh guru — stage 'review'
     (menunggu guru membuka tiap langkah) dan saat HeartsGate.isShown()
     (kesempatan habis, menunggu guru memulihkan) — supaya siswa tidak
     bisa "kabur" dari gerbang guru lewat Back. Dipanggil dari update()
     (tiap setPage) dan dari loseChance()/restoreChances() di bawah,
     karena dua fungsi itu mengubah HeartsGate tanpa lewat setPage(). */
  syncBackButton: function () {
    $('navBack').disabled = (State.page === 'review') || HeartsGate.isShown();
  },

  /* Revisi 1 §1: mundur satu tahap memakai state internal modul
     (BACK_STAGES), bukan riwayat browser. §3: dialog yang sedang
     terbuka (Ask/Coach) ditutup dulu — baru mundur tahap kalau Back
     ditekan lagi sesudahnya. */
  goBack: function () {
    if (!$('askPanel').hidden) { Ask.close(); return; }
    if (!$('coachWrap').hidden) { Coach.close(); return; }
    if (HeartsGate.isShown()) return;
    if (State.page === 'review') return;

    var idx = BACK_STAGES.indexOf(State.page);
    if (idx <= 0) return; // sudah di titik paling awal (material), atau tahap ini bukan tujuan Back

    var fromStage = State.page;
    var toStage = BACK_STAGES[idx - 1];

    /* Balik ke material: pastikan tombol lanjut kelihatan lagi,
       apa pun status act1Done-nya — lihat guard di Act1.start(). */
    if (toStage === 'material') $('storyContinueBtn').hidden = false;

    transitionSwap($(BACK_PAGE_ID[fromStage]), $(BACK_PAGE_ID[toStage]));
    setPage(toStage);
  },

  infoTexts: function () {
    return [
      'Stage: ' + (STAGE_LABELS[State.page] || 'Welcome'),
      'Question ' + State.answered + ' of ' + TOTAL_QUESTIONS,
      'Score: ' + State.firstTryCorrect + '/' + TOTAL_QUESTIONS + ' first try'
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

  /* Hati berkurang saat jawaban salah; habis → gerbang tunggu guru. */
  loseChance: function () {
    if (State.chances > 0) State.chances--;
    this.renderHearts();
    if (State.chances === 0) HeartsGate.show();
    this.syncBackButton();
  },
  restoreChances: function () {
    State.chances = TOTAL_CHANCES;
    this.renderHearts();
    HeartsGate.hide();
    this.syncBackButton();
  }
};

/* ---------------- Gerbang: hati habis (guru yang memulihkan) ----------------
   TeacherAPI global sengaja dipakai supaya platform guru nanti tinggal
   memanggil salah satu fungsinya (WebSocket/BroadcastChannel/polling). */
var HeartsGate = {
  show: function () { $('heartsGate').hidden = false; },
  hide: function () { $('heartsGate').hidden = true; },
  isShown: function () { return !$('heartsGate').hidden; }
};

/* ---------------- Gerbang review: video yang dikontrol guru ---------------- */
var ReviewGate = {
  videoUnlocked: false,
  nextUnlocked: false,

  init: function () {
    var self = this;
    var video = $('reviewVideoEl');
    if (video) {
      video.addEventListener('ended', function () { self.videoEnded(); });
      video.addEventListener('error', function () {
        video.hidden = true;
        $('reviewVideoFallback').hidden = false;
      });
    }
    $('reviewPage').hidden = false;
    setPage('review');
    hint(HINTS['review-wait-1'], true); // Revisi R3 (gantikan Coach.maybeAutoOpen('review') — lihat Revisi R1)
  },

  unlockVideo: function () {
    if ($('reviewPage').hidden || this.videoUnlocked) return;
    this.videoUnlocked = true;
    $('reviewWaiting1').hidden = true;
    $('reviewVideoWrap').hidden = false;
    hint(HINTS['review-video']); // Revisi R3
  },

  videoEnded: function () {
    $('reviewVideoWrap').hidden = true;
    $('reviewWaiting2').hidden = false;
    hint(HINTS['review-wait-2'], true); // Revisi R3
  },

  unlockNext: function () {
    if ($('reviewPage').hidden || this.nextUnlocked || $('reviewWaiting2').hidden) return;
    this.nextUnlocked = true;
    transitionSwap($('reviewPage'), $('materialPage1'), function () { Coach.maybeAutoOpen('material'); });
    setPage('material');
  }
};

var TeacherAPI = {
  unlockVideo: function () { ReviewGate.unlockVideo(); },
  videoEnded: function () { ReviewGate.videoEnded(); },
  unlockNext: function () { ReviewGate.unlockNext(); },
  restoreChances: function () { Nav.restoreChances(); }
};

/* ---------------- Activity 1: struktur cerita (halaman tersendiri) ----------------
   Dulu render ke dalam #act1 di bawah #sheet yang mengambang di atas
   cerita. Sekarang activityPage1 adalah halaman penuh sejajar dengan
   materialPage1 (Revisi UI §3) — soal ini tidak butuh melihat cerita
   lagi, jadi tidak kehilangan apa pun dengan jadi halaman tersendiri. */
var Act1 = {
  init: function () {
    var self = this;
    $('act1NextBtn').addEventListener('click', function () {
      State.act1Index++;
      self.render();
    });
  },

  start: function () {
    /* Revisi 1 (saran tambahan): storyContinueBtn bisa diklik lagi
       setelah Back membawa siswa balik ke material (lihat
       Nav.goBack()). Kalau Activity 1 sudah selesai sebelumnya,
       JANGAN render ulang soal terakhir sebagai soal segar/interaktif
       — itu akan membuka celah State.answered/firstTryCorrect
       terhitung dobel. Langsung lanjut ke tahap berikutnya yang
       sesuai, seolah-olah siswa menekan "lanjut" biasa. */
    if (State.act1Done) {
      if (State.act2Done) Closing.show(); else Act2.start();
      return;
    }
    this.render();
    transitionSwap($('materialPage1'), $('activityPage1'), function () { Coach.maybeAutoOpen('activity-1'); });
    setPage('activity-1');
  },

  render: function () {
    State.act1Tried = false;
    var q = RECALL1_QUESTIONS[State.act1Index];
    $('act1Progress').textContent = 'Question ' + (State.act1Index + 1) + ' of ' + RECALL1_QUESTIONS.length;
    $('act1Prompt').innerHTML = q.prompt;
    $('act1Feedback').hidden = true;
    $('act1NextBtn').hidden = true;

    var box = $('act1Options');
    box.innerHTML = '';
    box.setAttribute('data-answer', String(q.answer));
    var self = this;
    STORY_PARAGRAPHS.forEach(function (_, i) {
      var n = i + 1;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'num';
      btn.textContent = String(n);
      btn.setAttribute('data-num', String(n));
      btn.setAttribute('aria-label', 'Paragraph ' + n);
      btn.addEventListener('click', function () { self.answer(n, btn); });
      box.appendChild(btn);
    });
  },

  answer: function (n, btn) {
    if (HeartsGate.isShown() || State.act1Done) return; // jaga-jaga tambahan, lihat catatan di start()
    var q = RECALL1_QUESTIONS[State.act1Index];
    var feedback = $('act1Feedback');
    var correct = n === q.answer;

    if (!correct) {
      /* Salah: kehilangan satu hati, soal tetap terbuka supaya siswa
         boleh mencoba lagi — jawaban tidak langsung dibocorkan. */
      State.act1Tried = true;
      btn.classList.add('is-wrong');
      btn.disabled = true;
      feedback.hidden = false;
      feedback.className = 'feedback is-bad';
      feedback.textContent = q.incorrect;
      Nav.loseChance();
      return;
    }

    btn.classList.add('is-correct');
    Array.prototype.forEach.call($('act1Options').querySelectorAll('.num'), function (b) { b.disabled = true; });
    feedback.hidden = false;
    feedback.className = 'feedback is-good';
    feedback.textContent = q.correct;

    State.answered++;
    if (!State.act1Tried) State.firstTryCorrect++;

    if (State.act1Index < RECALL1_QUESTIONS.length - 1) {
      $('act1NextBtn').hidden = false;
    } else {
      State.act1Done = true;
      setTimeout(function () { Act2.start(); }, 900);
    }
  }
};

/* ---------------- Activity 2: penanda waktu (halaman tersendiri) ----------------
   Aktivitas ini TIDAK berdiri sendiri dari cerita: caranya kerja adalah
   menandai span .marker yang bisa diketuk di dalam #storyText yang sama
   dipakai halaman Material. Daripada menyalin cerita (dua salinan yang
   perlu disinkronkan), #storyText DIPINDAH (appendChild) dari
   materialPage1 ke activityPage2 sekali saat aktivitas ini mulai — jadi
   ceritanya sungguh jadi "bagian dari halaman ini", bukan mengintip
   halaman lain di baliknya (Revisi UI §3), dan status "ditemukan" tetap
   satu-satunya sumber kebenaran karena elemennya memang elemen yang sama. */
var Act2 = {
  init: function () {
    var self = this;
    var text = $('storyText');
    text.addEventListener('click', function (e) {
      var span = e.target.closest ? e.target.closest('.marker') : null;
      if (span) self.tap(span);
    });
    text.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var span = e.target.closest ? e.target.closest('.marker') : null;
      if (span) { e.preventDefault(); self.tap(span); }
    });
  },

  start: function () {
    /* Revisi 2: #storyText dipindah ke DALAM #act2StoryPanel (panel
       referensi buka-tutup), bukan langsung ke activityPage2 seperti
       sebelumnya — mekanik "ketuk marker di dalam teks" di bawah ini
       sama sekali tidak berubah, cuma wadahnya yang sekarang bisa
       ditutup siswa. Dibuka paksa (open=true) tiap start() supaya
       aktivitas selalu langsung terlihat, walau panel sempat ditutup
       manual sebelumnya. */
    var panel = $('act2StoryPanel');
    panel.open = true;
    panel.appendChild($('storyText'));
    $('storyText').classList.add('is-hunting');
    setPage('activity-2');
    transitionSwap($('activityPage1'), $('activityPage2'), function () {
      var first = document.querySelector('#storyText .marker[data-valid="true"]');
      scrollToEl(first, 90);
      Coach.maybeAutoOpen('activity-2');
    });
  },

  tap: function (span) {
    if (State.act2Done || HeartsGate.isShown()) return;
    if ($('activityPage2').hidden) return;
    var phrase = span.getAttribute('data-marker');
    var valid = span.getAttribute('data-valid') === 'true';
    var feedback = $('act2Feedback');

    if (!valid) {
      span.classList.add('is-tried');
      feedback.hidden = false;
      feedback.className = 'feedback is-bad';
      feedback.textContent = '“' + phrase + '” mentions a time, but it is not a sequence marker here. Read the sentence around it and try another dashed word.';
      Nav.loseChance();
      return;
    }
    if (State.markersFound.indexOf(phrase) !== -1) return;

    State.markersFound.push(phrase);
    span.classList.add('is-found');
    span.setAttribute('aria-pressed', 'true');
    $('act2Count').textContent = String(State.markersFound.length);

    var chip = document.createElement('span');
    chip.className = 'markbar-item';
    chip.textContent = phrase;
    $('act2Found').appendChild(chip);

    State.answered++;
    State.firstTryCorrect++;

    feedback.hidden = false;
    feedback.className = 'feedback is-good';

    if (State.markersFound.length >= RECALL2_TARGET) {
      State.act2Done = true;
      $('storyText').classList.remove('is-hunting');
      Array.prototype.forEach.call(document.querySelectorAll('#storyText .marker[data-valid="true"]'), function (el) {
        if (!el.classList.contains('is-found')) el.classList.add('is-revealed');
      });
      feedback.textContent = 'That is three. The remaining time markers in the text are marked too, so you can see them all.';
      setTimeout(function () { Closing.show(); }, 900);
    } else {
      feedback.textContent = 'Correct — “' + phrase + '” is a time marker. (' + State.markersFound.length + ' of ' + RECALL2_TARGET + ')';
    }
  }
};

/* ---------------- Closing (halaman tersendiri) ---------------- */
var Closing = {
  init: function () {
    $('closingFinishBtn').addEventListener('click', function () {
      var btn = $('closingFinishBtn');
      if (btn.disabled) return;
      btn.disabled = true;
      btn.textContent = 'Saving…';
      writeKey('lake_bukit_v1', {
        v: 1,
        status: 'completed',
        score: State.firstTryCorrect,
        outOf: TOTAL_QUESTIONS,
        chancesLeft: State.chances,
        completedAt: new Date().toISOString()
      });
      $('transitionOverlay').classList.add('is-active');
      setTimeout(function () { window.location.href = '../index.html'; }, 900); /* Revisi T1: folder home/ tidak ada */
    });
  },

  show: function () {
    var card = $('scorecard');
    card.innerHTML =
      '<div><dt>Answered</dt><dd>' + State.answered + '/' + TOTAL_QUESTIONS + '</dd></div>' +
      '<div><dt>Right first try</dt><dd>' + State.firstTryCorrect + '/' + TOTAL_QUESTIONS + '</dd></div>' +
      '<div><dt>Chances left</dt><dd>' + State.chances + '/' + TOTAL_CHANCES + '</dd></div>';
    $('closingPage1').setAttribute('data-student', Nav.studentName()); /* Tambahan T3: dipakai stylesheet cetak (style_BukitCamar.css) untuk menulis nama siswa di kop halaman */
    transitionSwap($('activityPage2'), $('closingPage1'), function () { Coach.maybeAutoOpen('closing'); });
    setPage('closing');
  }
};

/* ---------------- Ask a question (disimpan, menunggu platform guru) ---------------- */
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
    list.push({ module: 'lake_bukit', page: State.page, text: text, at: new Date().toISOString() });
    writeKey('nl_questions_v1', list);
    $('askText').value = '';
    $('askNote').textContent = 'Sent. Your teacher will answer soon.';
    setTimeout(function () { Ask.close(); }, 1100);
  }
};

/* ---------------- Coach mark: tur singkat per halaman, dengan spotlight ----------------
   Setiap langkah kini { text, target } — target berupa selector CSS
   elemen yang disorot sungguhan (getBoundingClientRect → #coachSpotlight),
   atau null untuk langkah yang memang tidak merujuk elemen spesifik
   (mis. "tap anywhere to continue" di halaman welcome). Lihat Revisi
   UI §2. Sengaja TIDAK menyorot span .marker yang valid secara khusus
   di activity-2 — cukup ".marker" pertama apa pun, supaya spotlight
   tidak diam-diam membocorkan mana penanda waktu yang benar. */
var COACH = {
  /* Revisi R1: entri 'welcome-1', 'welcome-2', dan 'review' DIHAPUS
     dari sini — bukan dibuang, teksnya sudah dipindah ke peta HINTS
     (Revisi R3) karena tiga tahap itu sekarang memakai notifikasi
     ringkas, bukan Coach Mark. AUTO_COACH_STAGES di bawah (dipakai
     Coach.maybeAutoOpen) adalah penjaga strukturalnya: coach mark
     otomatis cuma boleh mulai di empat kunci yang tersisa di sini. */
  material: [
    { text: 'Read the story from top to bottom. Numbers in the margin mark each paragraph — you will need them in the first activity.', target: '.para-num' },
    { text: 'Tap "Continue to the activities" at the end when you are ready.', target: '#storyContinueBtn' }
  ],
  'activity-1': [
    { text: 'Tap the number of the paragraph you think is the answer.', target: '#act1Options' },
    { text: 'A wrong answer costs one heart at the top of the screen. Seven hearts in total.', target: '#navHearts' }
  ],
  'activity-2': [
    { text: 'Tap the dashed words in the story to find the time markers. Not every dashed word is a correct answer, so read the sentence around it first.', target: '.marker' }
  ],
  closing: [
    { text: 'Tap Done to save your progress and return to the lake map.', target: '#closingFinishBtn' }
  ]
};

/* Revisi R5-a: daftar tahap yang boleh membuka tur SENDIRI. Sengaja
   ditulis eksplisit, bukan hanya mengandalkan absennya kunci di COACH,
   supaya kalau nanti seseorang menambahkan entri COACH untuk welcome
   atau review, tur itu tetap tidak akan terbuka otomatis. Aturannya:
   coach mark otomatis baru boleh mulai setelah sesi video terlewati.
   Di platform ini "sesi video" = seluruh #reviewPage. */
var AUTO_COACH_STAGES = ['material', 'activity-1', 'activity-2', 'closing'];

var Coach = {
  steps: [],
  index: 0,
  settleTimer: null,
  fadeTimer: null,
  trackFn: null,
  enabled: true,  /* Revisi 4: devCoachToggle mematikan seluruh sistem lewat flag ini */
  autoShown: {},  /* Revisi 3 §1: status "sudah tampil otomatis" per tahap — memori
                      runtime saja (sengaja bukan localStorage), reset tiap reload */

  init: function () {
    var self = this;
    $('coachNext').addEventListener('click', function () { self.next(); });
    $('coachClose').addEventListener('click', function () { self.close(); });
  },

  /* Revisi 3 §1 (diperbarui Revisi R1): dipanggil sekali di akhir
     setiap transisi tahap — lihat Act1.start()/Act2.start()/
     Closing.show() di atas, dan unlockNext() di ReviewGate untuk
     tahap 'material'. ReviewGate.init() TIDAK LAGI memanggil ini
     untuk stage 'review': welcome-1, welcome-2, dan seluruh
     #reviewPage sekarang memakai notifikasi ringkas hint() (Revisi
     R3) sebagai gantinya, supaya tur Coach Mark yang lebih panjang
     baru muncul setelah siswa melewati sesi video. Membuka tur
     sendiri hanya kalau tahap itu ada di AUTO_COACH_STAGES, punya
     step di COACH, dan belum pernah tampil otomatis di sesi ini —
     sekali ditandai, tidak akan otomatis muncul lagi walau siswa
     balik ke tahap itu lewat Nav.goBack(). Ikon navCoach tetap
     manggil open() langsung (di bawah), jadi selalu bisa dipakai
     ulang secara manual di tahap mana pun yang punya entri COACH. */
  maybeAutoOpen: function (stage) {
    if (!this.enabled) return;
    if (AUTO_COACH_STAGES.indexOf(stage) === -1) return;   /* Revisi R1 */
    if (this.autoShown[stage]) return;
    if (!COACH[stage] || !COACH[stage].length) return;
    this.autoShown[stage] = true;
    this.open();
  },

  open: function () {
    if (!this.enabled) return; // Revisi 4: mati total kalau di-toggle off lewat devCoachToggle
    this.steps = COACH[State.page] || [{ text: 'Nothing to explain on this screen yet.', target: null }];
    this.index = 0;
    $('coachWrap').hidden = false;
    $('navCoach').classList.add('is-on');
    this.render();
  },

  render: function () {
    var self = this;
    var step = this.steps[this.index];
    $('coachStep').textContent = 'Step ' + (this.index + 1) + ' of ' + this.steps.length;
    $('coachText').textContent = step.text;
    $('coachNext').textContent = this.index === this.steps.length - 1 ? 'Got it' : 'Continue';

    var wasOn = $('coachSpotlight').classList.contains('is-on');
    this.stopTracking();
    clearTimeout(this.settleTimer);
    clearTimeout(this.fadeTimer);

    var target = step.target ? document.querySelector(step.target) : null;

    if (!target) {
      $('coachSpotlight').classList.remove('is-on');
      $('coachWrap').classList.remove('has-spotlight');
      this.resetCard();
      return;
    }

    /* Revisi 2: target activity-2 ('.marker') sekarang bisa duduk di
       dalam #act2StoryPanel yang bisa ditutup siswa — kalau sedang
       tertutup, target tidak terukur (rect kosong). Buka paksa dulu
       supaya spotlight tetap benar. Aman untuk target lain: closest()
       cuma kena kalau memang ada <details> leluhurnya. */
    var enclosingDetails = target.closest ? target.closest('details') : null;
    if (enclosingDetails && !enclosingDetails.open) enclosingDetails.open = true;

    $('coachWrap').classList.add('has-spotlight');
    $('coachSpotlight').classList.remove('is-on');

    /* Kalau cincin sebelumnya sedang tampil, beri jeda pudar (200ms)
       dulu sebelum menggeser & mengukur ulang di target baru, supaya
       tidak terasa "meloncat" instan dari posisi lama ke posisi baru. */
    var fadeWait = prefersReducedMotion() ? 0 : (wasOn ? 200 : 0);
    this.fadeTimer = setTimeout(function () {
      scrollToEl(target, 90);
      var settleWait = prefersReducedMotion() ? 0 : 340;
      self.settleTimer = setTimeout(function () {
        self.placeSpotlight(target);
        self.placeCard(target);
        $('coachSpotlight').classList.add('is-on');
        self.startTracking(target);
      }, settleWait);
    }, fadeWait);
  },

  placeSpotlight: function (target) {
    var ring = $('coachSpotlight');
    var r = target.getBoundingClientRect();
    var pad = 7;
    ring.style.top = (r.top - pad) + 'px';
    ring.style.left = (r.left - pad) + 'px';
    ring.style.width = (r.width + pad * 2) + 'px';
    ring.style.height = (r.height + pad * 2) + 'px';
  },

  /* Adaptasi dari place() di initDevTooltip (script_BukitCamar.js) — di sana
     kartu diletakkan kiri/kanan tombol; di sini atas/bawah target,
     karena kartu Coach jauh lebih lebar/berisi teks. */
  placeCard: function (target) {
    var card = $('coachCard');
    card.style.position = 'fixed';
    card.style.left = '6px';
    card.style.top = '-9999px';
    var r = target.getBoundingClientRect();
    var c = card.getBoundingClientRect();
    var margin = 14;
    var spaceBelow = window.innerHeight - r.bottom;
    var spaceAbove = r.top;
    var top = (spaceBelow >= c.height + margin || spaceBelow >= spaceAbove) ? r.bottom + margin : r.top - margin - c.height;
    top = Math.min(Math.max(6, top), window.innerHeight - c.height - 6);
    var left = Math.min(Math.max(6, r.left), window.innerWidth - c.width - 6);
    card.style.top = top + 'px';
    card.style.left = left + 'px';
  },

  resetCard: function () {
    var card = $('coachCard');
    card.style.position = '';
    card.style.top = '';
    card.style.left = '';
  },

  /* Latar boleh digulir selagi tur terbuka (dialog-wrap lama pun
     tidak menguncinya) — jadi cincin & kartu perlu ikut mengukur
     ulang saat scroll/resize, bukan cuma sekali saat langkah dibuka. */
  startTracking: function (target) {
    var self = this;
    this.trackFn = function () { self.placeSpotlight(target); self.placeCard(target); };
    window.addEventListener('scroll', this.trackFn, { passive: true });
    window.addEventListener('resize', this.trackFn);
  },
  stopTracking: function () {
    if (this.trackFn) {
      window.removeEventListener('scroll', this.trackFn);
      window.removeEventListener('resize', this.trackFn);
      this.trackFn = null;
    }
  },

  next: function () {
    if (this.index < this.steps.length - 1) { this.index++; this.render(); }
    else this.close();
  },

  close: function () {
    clearTimeout(this.settleTimer);
    clearTimeout(this.fadeTimer);
    this.stopTracking();
    $('coachSpotlight').classList.remove('is-on');
    $('coachWrap').classList.remove('has-spotlight');
    this.resetCard();
    $('coachWrap').hidden = true;
    $('navCoach').classList.remove('is-on');
  }
};

/* Revisi R6: pembeda tap-vs-geser untuk welcome-1/2. Sebelum revisi
   ini keduanya cuma layar diam (overflow:hidden) yang tidak pernah
   digulir, jadi 'click' polos aman dipakai. Sekarang welcome-2-body
   boleh digulir (lihat style_BukitCamar.css .welcome-2-body) supaya paragraf
   pengantar tidak lagi terpotong di jendela pendek, jadi gerakan
   gulir bisa salah terbaca sebagai "tap untuk lanjut" kalau masih
   memakai 'click' — onTap() membedakan keduanya lewat jarak gerak
   (>12px = geser) dan durasi tekan (>600ms = tahan-lama), dua ambang
   yang sengaja longgar supaya jempol yang bergeser sedikit saat
   menekan masih dianggap tap. */
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

/* ---------------- Halaman sambutan ---------------- */
function initWelcome(onDone) {
  var w1 = $('welcome1');
  var w2 = $('welcome2');
  if (!w1 || !w2) { onDone(); return; }

  Array.prototype.forEach.call(document.querySelectorAll('.welcome-bg'), function (img) {
    img.addEventListener('error', function () { img.style.display = 'none'; });
  });
  var plateImg = document.querySelector('.welcome-2-plate img');
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
    hint(HINTS['welcome-2']); // Revisi R3 (gantikan Coach.maybeAutoOpen('welcome-2') — lihat Revisi R1)
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
  var coachBtn = $('devCoachToggle');
  if (!panel || !btn) return;
  panel.hidden = false;

  function flashEmpty() {
    btn.classList.add('is-empty');
    setTimeout(function () { btn.classList.remove('is-empty'); }, 400);
  }

  btn.addEventListener('click', function () {
    /* Satu langkah per klik, urut dari gerbang paling depan. */
    if (HeartsGate.isShown()) { TeacherAPI.restoreChances(); return; }

    var review = $('reviewPage');
    if (review && !review.hidden) {
      if (!$('reviewWaiting1').hidden) { TeacherAPI.unlockVideo(); return; }
      if (!$('reviewVideoWrap').hidden) { TeacherAPI.videoEnded(); return; }
      if (!$('reviewWaiting2').hidden) { TeacherAPI.unlockNext(); return; }
    }

    if (!$('materialPage1').hidden && !$('storyContinueBtn').hidden && $('activityPage1').hidden) {
      $('storyContinueBtn').click();
      return;
    }

    if (!$('activityPage1').hidden) {
      var box = $('act1Options');
      var open = box.querySelector('.num:not([disabled])');
      if (open) {
        var target = box.querySelector('.num[data-num="' + box.getAttribute('data-answer') + '"]');
        if (target && !target.disabled) { target.click(); return; }
      }
      if (!$('act1NextBtn').hidden) { $('act1NextBtn').click(); return; }
    }

    if (!$('activityPage2').hidden && !State.act2Done) {
      /* Revisi 2: buka paksa panel referensi dulu kalau sedang
         tertutup, supaya klik sintetis di bawah ini selalu kena
         marker yang benar-benar terlihat. */
      var storyPanel = $('act2StoryPanel');
      if (storyPanel && !storyPanel.open) storyPanel.open = true;
      var next = document.querySelector('#storyText .marker[data-valid="true"]:not(.is-found)');
      if (next) { next.click(); return; }
    }

    flashEmpty();
  });

  /* Revisi 4: tombol dev baru — nyalakan/matikan seluruh sistem Coach
     Mark (auto-trigger Revisi 3 + akses manual navCoach), supaya
     testing tahap lain lebih cepat tanpa harus menutup kartu tur
     berulang kali. Coach.open() sendiri yang memeriksa flag
     `enabled`, jadi cukup ubah flag-nya di sini. */
  if (coachBtn) {
    coachBtn.addEventListener('click', function () {
      Coach.enabled = !Coach.enabled;
      coachBtn.classList.toggle('is-off', !Coach.enabled);
      coachBtn.setAttribute('aria-pressed', String(Coach.enabled));
      if (!Coach.enabled && !$('coachWrap').hidden) Coach.close();
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

/* Revisi 4: direfactor supaya tooltip-on-hover yang sudah ada untuk
   devAnswer juga berlaku untuk devCoachToggle — satu #devTooltip
   dipakai bersama, teksnya berganti sesuai tombol yang di-hover
   (wire() dipanggil sekali per tombol, logika posisi tetap sama). */
function initDevTooltip() {
  var tip = $('devTooltip');
  if (!tip) return;

  function wire(btn, getText) {
    if (!btn) return;
    var timer = null;

    function place() {
      tip.textContent = getText();
      tip.style.left = '-9999px';
      tip.style.top = '-9999px';
      var b = btn.getBoundingClientRect();
      var t = tip.getBoundingClientRect();
      var left = b.right + 10;
      if (left + t.width > window.innerWidth - 6) left = b.left - 10 - t.width;
      var top = b.top + b.height / 2 - t.height / 2;
      tip.style.left = Math.max(6, left) + 'px';
      tip.style.top = Math.max(6, top) + 'px';
      tip.classList.add('is-visible');
    }
    function hide() { clearTimeout(timer); tip.classList.remove('is-visible'); }

    btn.addEventListener('mouseenter', function () { clearTimeout(timer); timer = setTimeout(place, 300); });
    btn.addEventListener('mouseleave', hide);
    btn.addEventListener('focus', place);
    btn.addEventListener('blur', hide);
  }

  wire($('devAnswer'), function () { return '(' + State.page + ')'; });
  wire($('devCoachToggle'), function () { return 'Coach Mark: ' + (Coach.enabled ? 'on' : 'off'); });
}
/* ====================== AKHIR MODE PENGEMBANG ====================== */

/* ---------------- Inisialisasi ---------------- */
(function init() {
  var locked = $('lockedPage');
  var welcome = $('welcome1');
  var shell = $('appShell');
  var prerequisite = readKey('oj_selatan_v1');

  if (!DEV_MODE && (!prerequisite || prerequisite.status !== 'completed')) {
    locked.hidden = false;
    return;
  }

  if (DEV_MODE) { initDevPanel(); initDevDrag(); initDevTooltip(); }

  /* Revisi 3 §1: Coach.init() dipindah ke sini (dari dalam
     startSession()) supaya sudah aktif SEBELUM welcome-1 tampil di
     bawah — auto-trigger welcome-1 butuh tombol "Continue"/"Close"
     di kartu Coach yang sudah tersambung, bukan baru tersambung nanti
     saat startSession() berjalan (yang jauh lebih belakangan). */
  Coach.init();

  function startSession() {
    shell.hidden = false;
    Nav.init();
    renderStory();
    initScrollReveal();
    Act1.init();
    Act2.init();
    Ask.init();
    Closing.init();

    $('storyContinueBtn').addEventListener('click', function () {
      $('storyContinueBtn').hidden = true;
      Act1.start();
    });

    ReviewGate.init();
  }

  welcome.hidden = false;
  setPage('welcome-1');
  hint(HINTS['welcome-1']); // Revisi R3 (gantikan Coach.maybeAutoOpen('welcome-1') — lihat Revisi R1)
  initWelcome(startSession);
})();
