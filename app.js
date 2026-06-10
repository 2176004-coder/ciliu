/* 词流 · 本地离线版 —— 纯前端，无需服务器，双击 index.html 即可使用。
   核心数据存于浏览器 IndexedDB；查词使用本地 ECDICT 词典。 */
(function () {
  'use strict';

  // ---------- 图标（内联 SVG，离线可用） ----------
  var I = {
    bookOpen: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    bookMarked: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
    plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    x: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    arrowLeft: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    arrowRight: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    sparkles: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/></svg>',
    library: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 6l4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>',
    bookMarkedBig: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
    download: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    upload: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    loader: '<svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',
    volume: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
    volumeX: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>',
    search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    settings: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
  };

  // 考试等级标签 → 简短中文（用于词表小徽章）
  var LEVEL_LABEL = { cet4: '四级', cet6: '六级', ky: '考研', ielts: '雅思', toefl: '托福', gre: 'GRE', gk: '高考', zk: '中考' };
  var LEVEL_ORDER = ['gre', 'toefl', 'ielts', 'ky', 'cet6', 'cet4', 'gk', 'zk'];
  function levelOf(lemma) {
    var rec = DICT.get(String(lemma).toLowerCase());
    if (!rec || !rec.tag) return '';
    var toks = rec.tag.split(' ');
    for (var i = 0; i < LEVEL_ORDER.length; i++) { if (toks.indexOf(LEVEL_ORDER[i]) >= 0) return LEVEL_LABEL[LEVEL_ORDER[i]]; }
    return '';
  }

  // ---------- 朗读（Web Speech API，离线、免费） ----------
  var TTS_OK = ('speechSynthesis' in window) && (typeof SpeechSynthesisUtterance !== 'undefined');
  // 优先选用的优质英文语音
  var GOOD_VOICE = [/google us english/i, /google uk english/i, /samantha/i, /^alex$/i, /daniel/i, /karen/i, /moira/i, /tessa/i, /serena/i, /allison/i, /\bava\b/i, /\bsiri\b/i, /microsoft\s+(aria|jenny|guy|davis|david|zira|mark|hazel|susan|george|sonia|libby)/i];
  // 需要避开的"特效/搞怪"语音（沙哑、机器人、耳语等）
  var BAD_VOICE = /albert|bad news|bahh|bells|boing|bubbles|cellos|wobble|eddy|flo|fred|good news|grandma|grandpa|jester|junior|kathy|organ|reed|rocko|ralph|sandy|shelley|superstar|trinoids|whisper|zarvox|deranged|hysterical|pipe organ|novelty/i;
  var _voice = null, _voiceTried = false;
  function pickEnVoice() {
    if (!TTS_OK) return null;
    if (_voice) return _voice;
    var vs = window.speechSynthesis.getVoices() || [];
    if (!vs.length) return null;
    var en = vs.filter(function (v) { return /^en/i.test(v.lang || ''); });
    if (!en.length) return null;
    // 1) 已知优质语音（按偏好顺序）
    for (var i = 0; i < GOOD_VOICE.length; i++) {
      for (var j = 0; j < en.length; j++) {
        if (GOOD_VOICE[i].test(en[j].name || '')) { _voice = en[j]; return _voice; }
      }
    }
    // 2) 排除特效音后，优先默认 / 本地语音 / en-US
    var clean = en.filter(function (v) { return !BAD_VOICE.test(v.name || ''); });
    var pool = clean.length ? clean : en;
    _voice = pool.filter(function (v) { return v.default; })[0] ||
             pool.filter(function (v) { return /en[-_]US/i.test(v.lang || '') && v.localService; })[0] ||
             pool.filter(function (v) { return /en[-_]US/i.test(v.lang || ''); })[0] ||
             pool[0];
    return _voice;
  }
  function speak(text) {
    if (!TTS_OK || !text) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(text));
      u.lang = 'en-US'; u.rate = 0.95;
      var v = pickEnVoice(); if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  if (TTS_OK) {
    window.speechSynthesis.onvoiceschanged = function () { _voice = null; pickEnVoice(); };
  }

  // ---------- 词典加载 ----------
  var DICT = new Map();   // 小写单词 -> {w, phon, pos, trans}
  var LEMMA = new Map();  // 变形 -> 原形
  var DICT_READY = false;

  // 内置常用不规则变形（变形→原形）。完整 ECDICT 自带变形表时会被其覆盖/补充；
  // mini 版没有变形数据，靠这份表 + ruleForms() 兜底。
  var IRREGULARS = {
    is:'be',am:'be',are:'be',was:'be',were:'be',been:'be',being:'be',
    has:'have',had:'have',having:'have',does:'do',did:'do',doing:'do',done:'do',
    went:'go',gone:'go',goes:'go',came:'come',sees:'see',saw:'see',seen:'see',
    knew:'know',known:'know',thought:'think',took:'take',taken:'take',made:'make',
    got:'get',gotten:'get',gave:'give',given:'give',found:'find',told:'tell',said:'say',
    felt:'feel',became:'become',begun:'begin',began:'begin',kept:'keep',held:'hold',
    brought:'bring',bought:'buy',caught:'catch',taught:'teach',sought:'seek',fought:'fight',
    left:'leave',lost:'lose',meant:'mean',met:'meet',paid:'pay',ran:'run',rose:'rise',risen:'rise',
    sat:'sit',sang:'sing',sung:'sing',sank:'sink',spoke:'speak',spoken:'speak',spent:'spend',
    stood:'stand',stole:'steal',stolen:'steal',struck:'strike',swam:'swim',swum:'swim',
    threw:'throw',thrown:'throw',understood:'understand',woke:'wake',woken:'wake',wore:'wear',worn:'wear',
    won:'win',wrote:'write',written:'write',drew:'draw',drawn:'draw',drank:'drink',drunk:'drink',
    drove:'drive',driven:'drive',ate:'eat',eaten:'eat',fell:'fall',fallen:'fall',flew:'fly',flown:'fly',
    forgot:'forget',forgotten:'forget',froze:'freeze',frozen:'freeze',grew:'grow',grown:'grow',
    hid:'hide',hidden:'hide',led:'lead',lay:'lie',lain:'lie',rode:'ride',ridden:'ride',
    rang:'ring',rung:'ring',sold:'sell',sent:'send',shook:'shake',shaken:'shake',shone:'shine',
    shot:'shoot',shut:'shut',slept:'sleep',slid:'slide',spread:'spread',sprang:'spring',
    chose:'choose',chosen:'choose',built:'build',burnt:'burn',dealt:'deal',dug:'dig',
    bound:'bind',bit:'bite',bitten:'bite',bled:'bleed',blew:'blow',blown:'blow',bent:'bend',
    bred:'breed',crept:'creep',cut:'cut',fed:'feed',fled:'flee',hung:'hang',hurt:'hurt',
    knelt:'kneel',laid:'lay',lent:'lend',lit:'light',put:'put',quit:'quit',read:'read',
    set:'set',sewn:'sew',swept:'sweep',swung:'swing',torn:'tear',tore:'tear',trod:'tread',
    wept:'weep',wound:'wind',
    children:'child',men:'man',women:'woman',people:'person',feet:'foot',teeth:'tooth',
    geese:'goose',mice:'mouse',oxen:'ox',lives:'life',leaves:'leaf',wolves:'wolf',
    knives:'knife',wives:'wife',selves:'self',shelves:'shelf',thieves:'thief',halves:'half',
    better:'good',best:'good',worse:'bad',worst:'bad',further:'far',furthest:'far',
    farther:'far',farthest:'far',more:'much',most:'much',less:'little',least:'little'
  };

  function buildDict() {
    Object.keys(IRREGULARS).forEach(function (k) { LEMMA.set(k, IRREGULARS[k]); });
    if (typeof window.ECDICT_RAW === 'string' && window.ECDICT_RAW.length) {
      var lines = window.ECDICT_RAW.split('\n');
      for (var i = 0; i < lines.length; i++) {
        var ln = lines[i];
        if (!ln) continue;
        var p = ln.split('\t');
        // 格式: word \t phon \t pos \t freq \t tag \t trans
        //  6 段=含标签；5 段=含词频无标签；4 段=最早版本
        var freq = 0, tag = '', trans;
        if (p.length >= 6) { freq = parseInt(p[3], 10) || 0; tag = p[4] || ''; trans = p[5] || ''; }
        else if (p.length === 5) { freq = parseInt(p[3], 10) || 0; trans = p[4] || ''; }
        else { trans = p[3] || ''; }
        DICT.set(p[0].toLowerCase(), { w: p[0], phon: p[1] || '', pos: p[2] || '', freq: freq, tag: tag, trans: trans.replace(/\\n/g, '\n') });
      }
    }
    if (typeof window.LEMMA_RAW === 'string' && window.LEMMA_RAW.length) {
      var ll = window.LEMMA_RAW.split('\n');
      for (var j = 0; j < ll.length; j++) {
        var q = ll[j].split('\t');
        if (q.length >= 2) LEMMA.set(q[0].toLowerCase(), q[1].toLowerCase());
      }
    }
    DICT_READY = DICT.size > 0;
  }

  // 基于规则生成可能的原形候选（不规则形由 LEMMA 映射覆盖）
  function ruleForms(s) {
    var out = [];
    function add(x) { if (x && x.length > 1) out.push(x); }
    if (s.length > 4 && /ies$/.test(s)) add(s.slice(0, -3) + 'y');
    if (s.length > 3 && /es$/.test(s)) { add(s.slice(0, -2)); add(s.slice(0, -1)); }
    if (s.length > 3 && /s$/.test(s) && !/ss$/.test(s)) add(s.slice(0, -1));
    if (s.length > 4 && /ied$/.test(s)) add(s.slice(0, -3) + 'y');
    if (s.length > 3 && /ed$/.test(s)) {
      var b = s.slice(0, -2);
      add(b); add(s.slice(0, -1));
      if (b.length > 2 && b[b.length - 1] === b[b.length - 2]) add(b.slice(0, -1));
    }
    if (s.length > 4 && /ing$/.test(s)) {
      var c = s.slice(0, -3);
      add(c); add(c + 'e');
      if (c.length > 2 && c[c.length - 1] === c[c.length - 2]) add(c.slice(0, -1));
    }
    if (s.length > 4 && /est$/.test(s)) { add(s.slice(0, -3)); add(s.slice(0, -2)); }
    if (s.length > 3 && /er$/.test(s)) { add(s.slice(0, -2)); add(s.slice(0, -1)); }
    if (s.length > 3 && /ly$/.test(s)) add(s.slice(0, -2));
    return out;
  }

  // 撇号缩写还原 → 词典里有的基础词。null=不是缩写
  var CONTRACTION_SPECIAL = { "won't": 'will', "can't": 'can', "shan't": 'shall', "ain't": 'be', "let's": 'let', "y'all": 'you' };
  function expandContraction(surface) {
    var s = String(surface).replace(/[’]/g, "'");
    if (s.indexOf("'") < 0) return null;
    var low = s.toLowerCase();
    if (CONTRACTION_SPECIAL[low]) return CONTRACTION_SPECIAL[low];
    if (/n't$/.test(low)) return low.replace(/n't$/, '');          // wouldn't→would, don't→do, isn't→is
    var m = low.match(/^([a-z]+)'(s|re|ll|ve|d|m)$/);              // I'd→i, you're→you, it's→it, we've→we
    if (m) return m[1];
    if (/s'$/.test(low)) return low.slice(0, -1);                  // dogs'→dogs（复数所有格）
    return low.split("'")[0];
  }

  // 查词：返回 {entry, lemma} 或 null
  function lookupWord(surface) {
    var s = surface.toLowerCase();
    var order = [];
    if (LEMMA.has(s)) order.push(LEMMA.get(s)); // 优先词典自带的原形映射（最可靠）
    order.push(s);
    var exp = expandContraction(surface);       // 缩写 → 基础词，再走一遍原形映射
    if (exp) {
      if (LEMMA.has(exp)) order.push(LEMMA.get(exp));
      order.push(exp);
      var rfe = ruleForms(exp);
      for (var m2 = 0; m2 < rfe.length; m2++) order.push(rfe[m2]);
    }
    var rf = ruleForms(s);
    for (var k = 0; k < rf.length; k++) order.push(rf[k]);
    var seen = {};
    for (var i = 0; i < order.length; i++) {
      var cand = order[i];
      if (seen[cand]) continue; seen[cand] = 1;
      var e = DICT.get(cand);
      if (e) return { entry: e, lemma: cand };
    }
    return null;
  }

  // ---------- 状态与存储 ----------
  var K_ART = 'lexis_articles', K_VOC = 'lexis_vocabulary', K_KNOWN = 'lexis_known',
    K_PROGRESS = 'lexis_read_progress', K_AUTOSPEAK = 'lexis_autospeak', K_SETTINGS = 'lexis_settings',
    K_CUSTOM = 'lexis_custom_books', K_STATS = 'lexis_stats', K_SYNC_META = 'lexis_sync_meta';

  // 间隔重复（Leitner 盒）：答对升一级，按天数间隔安排下次；答错回到 0、稍后再练
  var DAY_MS = 86400000;
  var SRS_INTERVALS = [0, 1, 3, 7, 16, 35]; // 各级间隔（天）；升过最后一级即「掌握」毕业
  var SRS_MASTER = SRS_INTERVALS.length;    // 6 级 → 毕业到已掌握

  // 阅读设置：可选档位 → 实际值
  var SETTINGS_DEFAULT = { fontSize: 'm', lineHeight: 'm', pageWidth: 'm', theme: 'paper', highlight: true, anim: true, readMode: 'paged', autoKnown: true, sound: true, valorantRank: false, syncAuto: false, syncArticles: false };
  var FS_MAP = { s: '16px', m: '18px', l: '21px', xl: '24px' };
  var LH_MAP = { s: '1.5', m: '1.7', l: '1.95' };
  var PW_MAP = { s: '640px', m: '768px', l: '900px' };
  var THEMES = [
    { id: 'paper', name: '纸张' }, { id: 'white', name: '纯白' },
    { id: 'green', name: '护眼' }, { id: 'dark', name: '夜间' }
  ];
  var state = {
    tab: 'reading', articles: [], vocabulary: [], known: [],
    currentArticleId: null, currentBook: null, composing: false,
    newTitle: '', newContent: '', newBook: '',
    selected: null, lookup: null,
    vocabTab: 'learning', vocabSearch: '', vocabSort: 'recent', vocabSel: {}, searchInLib: true,
    bookOpen: null, bookTab: 'unlearned', bookShowLimit: 500,
    customBooks: [], composingBook: false, newBookName: '', newBookWords: '', addWordsTo: null,
    composingStudySet: false, newStudySetName: '', newStudySetWords: '',
    stats: null, reviewView: 'home',
    autoSpeak: true,
    review: null,
    importing: null,
    editingId: null,
    settings: null,
    showSettings: false,
    showRankGuide: false,
    rankUp: null,
    transExpanded: false,
    readProgress: {},
    articlePage: 0,
    booting: true,
    bootMsg: '正在准备离线词典和本地数据…',
    storageMode: 'pending',
    storageError: '',
    storageNotice: '',
    pageTurn: '',
    wheelLock: 0
  };

  var DB_NAME = 'lexis_local_db_v2';
  var DB_STORE = 'kv';
  var dbPromise = null;
  var lastSaveError = '';
  var syncApplying = false;
  var syncTimer = null;
  var syncBusy = false;
  var syncLoopStarted = false;

  function parseStoredJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function openDB() {
    if (!('indexedDB' in window)) return Promise.reject(new Error('当前浏览器不支持 IndexedDB'));
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      var req = window.indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('打开 IndexedDB 失败')); };
      req.onblocked = function () { reject(new Error('本地数据库被其他页面占用，请关闭其它词流页面后重试')); };
    });
    return dbPromise;
  }

  function idbGet(key) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(DB_STORE, 'readonly');
        var req = tx.objectStore(DB_STORE).get(key);
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { reject(req.error || new Error('读取本地数据库失败')); };
      });
    });
  }

  function idbSet(key, value) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(DB_STORE, 'readwrite');
        tx.oncomplete = resolve;
        tx.onerror = function () { reject(tx.error || new Error('写入本地数据库失败')); };
        tx.objectStore(DB_STORE).put(value, key);
      });
    });
  }

  function loadSettings() {
    try { var s = localStorage.getItem(K_AUTOSPEAK); if (s !== null) state.autoSpeak = s === '1'; } catch (e) {}
    var saved = {};
    try { var raw = localStorage.getItem(K_SETTINGS); if (raw) saved = JSON.parse(raw) || {}; } catch (e) {}
    state.settings = {};
    Object.keys(SETTINGS_DEFAULT).forEach(function (k) {
      state.settings[k] = (saved && saved[k] !== undefined) ? saved[k] : SETTINGS_DEFAULT[k];
    });
    loadSyncMeta();
  }
  function saveSettings(skipMark) {
    try { localStorage.setItem(K_SETTINGS, JSON.stringify(state.settings)); } catch (e) {}
    if (!skipMark) markLocalChanged();
  }
  function loadSyncMeta() {
    var meta = {};
    try { var raw = localStorage.getItem(K_SYNC_META); if (raw) meta = JSON.parse(raw) || {}; } catch (e) {}
    if (!meta.clientId) meta.clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    if (typeof meta.localUpdatedAt !== 'number') meta.localUpdatedAt = 0;
    state.syncMeta = meta;
    saveSyncMeta();
  }
  function ensureSyncMeta() { if (!state.syncMeta) loadSyncMeta(); return state.syncMeta; }
  function saveSyncMeta() { try { localStorage.setItem(K_SYNC_META, JSON.stringify(state.syncMeta || {})); } catch (e) {} }
  function markLocalChanged() {
    if (syncApplying || state.booting) return;
    var meta = ensureSyncMeta();
    meta.localUpdatedAt = Date.now();
    saveSyncMeta();
    scheduleAutoSync(1600);
  }
  function settingsSig() { var s = state.settings || SETTINGS_DEFAULT; return [s.fontSize, s.lineHeight, s.pageWidth].join('-'); }
  function isMobileLike() {
    if ((window.innerWidth || 0) <= 700) return true;
    return !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  }
  function applySettings() {
    var s = state.settings || SETTINGS_DEFAULT;
    var r = document.documentElement;
    r.style.setProperty('--reader-fs', FS_MAP[s.fontSize] || FS_MAP.m);
    r.style.setProperty('--reader-lh', LH_MAP[s.lineHeight] || LH_MAP.m);
    r.style.setProperty('--reader-maxw', PW_MAP[s.pageWidth] || PW_MAP.m);
    document.body.setAttribute('data-theme', s.theme || 'paper');
    document.body.classList.toggle('no-highlight', !s.highlight);
    document.body.classList.toggle('no-anim', !s.anim);
    document.body.classList.toggle('mobile-lite', isMobileLike());
  }
  // 改设置：写状态→存→应用→清分页缓存（影响排版的项）→重渲染
  function setSetting(key, val) {
    if (!state.settings) state.settings = {};
    if (state.settings[key] === val) return;
    state.settings[key] = val;
    saveSettings(key === 'syncAuto');
    applySettings();
    if (key === 'fontSize' || key === 'lineHeight' || key === 'pageWidth' || key === 'readMode' || key === 'theme') {
      ARTICLE_PAGE_CACHE = {}; FALLBACK_PAGE_CACHE = {};
    }
    if (key === 'syncAuto' && val) scheduleAutoSync(400);
    render();
  }

  function normalizeLoadedData() {
    if (!Array.isArray(state.articles)) state.articles = [];
    if (!Array.isArray(state.vocabulary)) state.vocabulary = [];
    if (!Array.isArray(state.known)) state.known = [];
    if (!state.readProgress || typeof state.readProgress !== 'object' || Array.isArray(state.readProgress)) state.readProgress = {};
    if (!Array.isArray(state.customBooks)) state.customBooks = [];
    state.customBooks.forEach(function (b) { if (!Array.isArray(b.words)) b.words = []; });
    if (!state.stats || typeof state.stats !== 'object' || Array.isArray(state.stats)) state.stats = defaultStats();
    if (!state.stats.days || typeof state.stats.days !== 'object') state.stats.days = {};
    if (typeof state.stats.goal !== 'number' || state.stats.goal < 1) state.stats.goal = 20;
    if (typeof state.stats.streak !== 'number') state.stats.streak = 0;
    if (typeof state.stats.reviewBook !== 'string') state.stats.reviewBook = 'all';
    // 迁移：旧文章无 book 字段 → 每篇各成一本书（书名=标题）
    var migrated = false;
    state.articles.forEach(function (art) {
      if (!art.book) { art.book = art.title || '未命名'; migrated = true; }
    });
    if (migrated) saveArticles();
  }

  function ieltsArticleKey(article) {
    if (!article) return '';
    var book = String(article.book || article.title || '');
    var id = String(article.id || '');
    var title = String(article.title || '');
    var source = String(article.source || '');
    var bm = book.match(/IELTS\s+(\d+)/i) ||
      title.match(/Cambridge\s+IELTS\s+(\d+)/i) ||
      id.match(/ielts[_-](\d+)[_-]/i) ||
      source.match(/IELTS\s*(\d+)/i) ||
      source.match(/剑桥雅思真题\s*(\d+)/i);
    var tm = id.match(/[_-]t(\d+)[_-]p(\d+)/i) ||
      title.match(/Test\s+(\d+)\s+-\s+Passage\s+(\d+)/i);
    if (!bm || !tm) return '';
    return bm[1] + ':' + tm[1] + ':' + tm[2];
  }

  function getBundledIeltsPack() {
    if (window.LEXIS_IELTS_ARTICLE_PACK && Array.isArray(window.LEXIS_IELTS_ARTICLE_PACK.articles)) {
      return Promise.resolve(window.LEXIS_IELTS_ARTICLE_PACK);
    }
    return fetch('ielts-reading-article-pack.json', { cache: 'no-store' }).then(function (res) {
      if (!res.ok) return null;
      return res.json();
    }).catch(function () { return null; });
  }

  function repairIeltsArticlesFromPack(pack) {
    if (!pack || !Array.isArray(pack.articles) || !state.articles.length) return 0;
    var fixed = {};
    pack.articles.forEach(function (a) {
      var key = ieltsArticleKey(a);
      if (key) fixed[key] = a;
    });
    var changed = 0, now = Date.now();
    state.articles.forEach(function (a) {
      var key = ieltsArticleKey(a);
      var f = key ? fixed[key] : null;
      if (!f) return;
      if (a.book !== f.book || a.title !== f.title || a.content !== f.content) {
        a.book = f.book;
        a.title = f.title;
        a.content = f.content;
        a.updatedAt = now;
        changed++;
      }
    });
    if (changed) {
      ARTICLE_PAGE_CACHE = {};
      FALLBACK_PAGE_CACHE = {};
      saveArticles();
      state.storageNotice = '已自动修复 ' + changed + ' 篇雅思阅读的乱码文本。';
    }
    return changed;
  }

  function repairBundledIeltsArticles() {
    if (!state.articles.some(function (a) { return !!ieltsArticleKey(a); })) return Promise.resolve(0);
    return getBundledIeltsPack().then(function (pack) {
      return repairIeltsArticlesFromPack(pack);
    });
  }

  function loadLocalFallback() {
    state.storageMode = 'localStorage';
    state.articles = parseStoredJSON(K_ART, []);
    state.vocabulary = parseStoredJSON(K_VOC, []);
    state.known = parseStoredJSON(K_KNOWN, []);
    state.readProgress = parseStoredJSON(K_PROGRESS, {});
    state.customBooks = parseStoredJSON(K_CUSTOM, []);
    state.stats = parseStoredJSON(K_STATS, null);
    normalizeLoadedData();
  }

  function load() {
    loadSettings();
    if (!('indexedDB' in window)) {
      loadLocalFallback();
      state.storageError = '当前浏览器不支持大容量本地数据库，已退回旧保存方式。长书可能无法保存。';
      return Promise.resolve();
    }

    return Promise.all([idbGet(K_ART), idbGet(K_VOC), idbGet(K_KNOWN), idbGet(K_PROGRESS), idbGet(K_CUSTOM), idbGet(K_STATS)]).then(function (vals) {
      var oldArticles = parseStoredJSON(K_ART, null);
      var oldVocab = parseStoredJSON(K_VOC, null);
      var oldKnown = parseStoredJSON(K_KNOWN, null);
      var oldProgress = parseStoredJSON(K_PROGRESS, null);
      var oldCustom = parseStoredJSON(K_CUSTOM, null);
      var oldStats = parseStoredJSON(K_STATS, null);
      var migrated = [];

      state.articles = Array.isArray(vals[0]) ? vals[0] : (Array.isArray(oldArticles) ? oldArticles : []);
      state.vocabulary = Array.isArray(vals[1]) ? vals[1] : (Array.isArray(oldVocab) ? oldVocab : []);
      state.known = Array.isArray(vals[2]) ? vals[2] : (Array.isArray(oldKnown) ? oldKnown : []);
      state.readProgress = vals[3] && typeof vals[3] === 'object' ? vals[3] : (oldProgress && typeof oldProgress === 'object' ? oldProgress : {});
      state.customBooks = Array.isArray(vals[4]) ? vals[4] : (Array.isArray(oldCustom) ? oldCustom : []);
      state.stats = (vals[5] && typeof vals[5] === 'object') ? vals[5] : (oldStats && typeof oldStats === 'object' ? oldStats : null);
      state.storageMode = 'indexedDB';
      normalizeLoadedData();

      if (vals[0] === undefined && oldArticles) migrated.push(idbSet(K_ART, state.articles));
      if (vals[1] === undefined && oldVocab) migrated.push(idbSet(K_VOC, state.vocabulary));
      if (vals[2] === undefined && oldKnown) migrated.push(idbSet(K_KNOWN, state.known));
      if (vals[3] === undefined && oldProgress) migrated.push(idbSet(K_PROGRESS, state.readProgress));
      if (vals[4] === undefined && oldCustom) migrated.push(idbSet(K_CUSTOM, state.customBooks));
      if (vals[5] === undefined && oldStats) migrated.push(idbSet(K_STATS, state.stats));
      if (migrated.length) state.storageNotice = '已升级为大容量本地保存，旧数据已迁移。';
      return Promise.all(migrated);
    }).catch(function (e) {
      loadLocalFallback();
      state.storageError = '大容量本地保存不可用，已退回旧保存方式。原因：' + (e && e.message ? e.message : e);
    });
  }

  function saveAutoSpeak() { try { localStorage.setItem(K_AUTOSPEAK, state.autoSpeak ? '1' : '0'); } catch (e) {} markLocalChanged(); }
  function notifySaveFailure(label, err) {
    var msg = label + '保存失败：' + (err && err.message ? err.message : err) + '。建议立即导出备份，或删减一些长文章后再试。';
    state.storageError = msg;
    if (lastSaveError !== msg) {
      lastSaveError = msg;
      setTimeout(function () { alert(msg); }, 0);
    }
  }
  function saveCore(key, value, label) {
    if (state.storageMode === 'indexedDB') {
      idbSet(key, value).catch(function (e) { notifySaveFailure(label, e); });
      markLocalChanged();
      return;
    }
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { notifySaveFailure(label, e); }
    markLocalChanged();
  }
  function saveArticles() { saveCore(K_ART, state.articles, '文章'); }
  function saveCustomBooks() { saveCore(K_CUSTOM, state.customBooks, '自建词书'); }
  function saveStats() { saveCore(K_STATS, state.stats, '学习记录'); }
  function saveVocab() { saveCore(K_VOC, state.vocabulary, '生词'); }
  function saveKnown() { saveCore(K_KNOWN, state.known, '已掌握词'); }
  function saveProgress() { saveCore(K_PROGRESS, state.readProgress, '阅读进度'); }

  function savedFormsSet() {
    var set = new Set();
    state.vocabulary.forEach(function (v) {
      set.add(v.lemma.toLowerCase());
      (v.forms || []).forEach(function (f) { set.add(f.toLowerCase()); });
    });
    return set;
  }
  function knownSet() {
    var set = new Set();
    state.known.forEach(function (l) { set.add(String(l).toLowerCase()); });
    return set;
  }

  // ---------- 词书（基于 ECDICT 考试标签） ----------
  var BOOKS = [
    { tag: 'zk', name: '中考' }, { tag: 'gk', name: '高考' },
    { tag: 'cet4', name: '四级 CET-4' }, { tag: 'cet6', name: '六级 CET-6' },
    { tag: 'ky', name: '考研' }, { tag: 'ielts', name: '雅思 IELTS' },
    { tag: 'toefl', name: '托福 TOEFL' }, { tag: 'gre', name: 'GRE' }
  ];
  var BOOK_INDEX = null;
  function buildBookIndex() {
    if (BOOK_INDEX) return BOOK_INDEX;
    BOOK_INDEX = {};
    BOOKS.forEach(function (b) { BOOK_INDEX[b.tag] = []; });
    DICT.forEach(function (rec, key) {
      if (!rec.tag) return;
      var toks = rec.tag.split(' ');
      for (var i = 0; i < toks.length; i++) { if (BOOK_INDEX[toks[i]]) BOOK_INDEX[toks[i]].push(key); }
    });
    Object.keys(BOOK_INDEX).forEach(function (t) {
      BOOK_INDEX[t].sort(compareByFreq);
    });
    return BOOK_INDEX;
  }
  // 把词书里的某个词加入生词库
  function addBookWord(word) {
    var ll = String(word).toLowerCase();
    if (state.vocabulary.some(function (v) { return v.lemma.toLowerCase() === ll; })) return;
    if (state.known.map(function (l) { return String(l).toLowerCase(); }).indexOf(ll) >= 0) return;
    state.vocabulary.unshift(makeVocabFromLemma(ll));
    saveVocab(); render();
  }

  // ---------- 自建词书 ----------
  function getCustomBook(id) { return state.customBooks.find(function (b) { return b.id === id; }); }
  // 把一段粘贴文本解析成词条（按行/逗号/空白拆，查词典还原原形，去重）
  function parseWordList(text) {
    // 按行/逗号/分号拆（保留词组内的空格），结尾括号注释去掉，单词再还原原形，去重
    var raw = String(text || '').split(/[\n,;，；、]+/);
    var out = [], seen = {};
    raw.forEach(function (line) {
      var t = line.replace(/\s*\([^)]*\)\s*$/, '');                 // 去掉结尾括号注释，如 cat (pet)
      t = t.replace(/[^a-zA-Z'’/ \-]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (!t) return;
      var lemma = t;
      if (!/[\s/]/.test(t)) { var r = lookupWord(t); if (r) lemma = r.lemma.toLowerCase(); } // 仅单个词还原原形
      if (!seen[lemma]) { seen[lemma] = 1; out.push(lemma); }
    });
    return out;
  }
  function createCustomBook(name, text) {
    var words = parseWordList(text);
    var book = { id: 'cb_' + Date.now(), name: String(name || '').trim() || '未命名词书', words: words, createdAt: Date.now() };
    state.customBooks.unshift(book);
    saveCustomBooks();
    return book;
  }
  function ensureLearningWords(words) {
    var known = knownSet(), have = {};
    state.vocabulary.forEach(function (v) { have[String(v.lemma).toLowerCase()] = 1; });
    var added = 0;
    words.forEach(function (w) {
      var ll = String(w || '').toLowerCase();
      if (!ll || known.has(ll) || have[ll]) return;
      state.vocabulary.unshift(makeVocabFromLemma(ll));
      have[ll] = 1;
      added++;
    });
    if (added) saveVocab();
    return added;
  }
  function createStudySetFromReview() {
    var nameEl = document.getElementById('study-set-name');
    var wordsEl = document.getElementById('study-set-words');
    if (nameEl) state.newStudySetName = nameEl.value;
    if (wordsEl) state.newStudySetWords = wordsEl.value;
    var words = parseWordList(state.newStudySetWords);
    if (!words.length) { alert('先粘贴一些单词，再创建学习集。'); return; }
    var book = createCustomBook(state.newStudySetName, state.newStudySetWords);
    var added = ensureLearningWords(words);
    if (!state.stats) state.stats = defaultStats();
    state.stats.reviewBook = book.id;
    saveStats();
    state.composingStudySet = false;
    state.newStudySetName = '';
    state.newStudySetWords = '';
    state.reviewView = 'home';
    render();
    if (!added) setTimeout(function () { alert('学习集已创建；这些词可能已经在生词库或已掌握里。'); }, 0);
  }
  function addWordsToBook(id, text) {
    var book = getCustomBook(id); if (!book) return 0;
    var have = {}; book.words.forEach(function (w) { have[w] = 1; });
    var added = 0;
    parseWordList(text).forEach(function (w) { if (!have[w]) { book.words.push(w); have[w] = 1; added++; } });
    if (added) saveCustomBooks();
    return added;
  }
  function removeBookWord(id, word) {
    var book = getCustomBook(id); if (!book) return;
    var ll = String(word).toLowerCase();
    book.words = book.words.filter(function (w) { return w !== ll; });
    saveCustomBooks(); render();
  }
  function deleteCustomBook(id) {
    state.customBooks = state.customBooks.filter(function (b) { return b.id !== id; });
    if (state.bookOpen === id) state.bookOpen = null;
    saveCustomBooks(); render();
  }
  function renameCustomBook(id, name) {
    var book = getCustomBook(id); if (!book) return;
    var nm = String(name || '').trim();
    if (!nm) return;
    book.name = nm;
    saveCustomBooks(); render();
  }

  // 解析单词原形（带缓存），用于判定状态与归类
  var lemmaCache = {};
  function resolveLemma(surface) {
    var s = surface.toLowerCase();
    if (lemmaCache[s]) return lemmaCache[s];
    var r = lookupWord(surface);
    var lem = r ? r.lemma : s;
    lemmaCache[s] = lem;
    return lem;
  }

  // 返回某个词面的状态：'green'(生词) | 'known'(已掌握) | 'new'(新词)
  function wordStatus(surface, savedSet, knSet) {
    var s = surface.toLowerCase();
    if (savedSet.has(s)) return 'green';
    var lem = resolveLemma(surface);
    if (savedSet.has(lem)) return 'green';
    if (knSet.has(lem) || knSet.has(s)) return 'known';
    return 'new';
  }

  // ---------- 工具 ----------
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function wordCount(t) { return (t.trim().match(/\S+/g) || []).length; }

  function countSavedInText(text) {
    var set = savedFormsSet();
    var tokens = text.match(/[a-zA-Z]+(?:['’\-][a-zA-Z]+)*/g) || [];
    var uniq = new Set();
    tokens.forEach(function (t) {
      var s = t.toLowerCase();
      var lemma = resolveLemma(t);
      if (set.has(s) || set.has(lemma)) uniq.add(lemma);
    });
    return uniq.size;
  }

  function highlightInSentence(sentence, surface) {
    if (!surface) return esc(sentence);
    var re = new RegExp('(' + surface.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    var parts = sentence.split(re);
    return parts.map(function (part) {
      if (part.toLowerCase() === surface.toLowerCase()) return '<strong class="hl">' + esc(part) + '</strong>';
      return esc(part);
    }).join('');
  }

  // ---------- 渲染文章正文（可点词、已存词高亮） ----------
  var RENDER_SENTENCES = [];
  var STATUS_CLASS = { green: 'word-learning', known: 'word-known', 'new': 'word-new' };
  var ARTICLE_PAGE_CACHE = {};
  var FALLBACK_PAGE_CACHE = {};
  var PAGINATION_VERSION = 'height-v4.2';
  var measureTimer = null;
  function pageWordLimit() {
    var h = window.innerHeight || 800;
    var w = window.innerWidth || 768;
    if (w < 560) return h < 720 ? 96 : 128;
    if (h < 760) return 170;
    if (h < 920) return 225;
    return 265;
  }

  function splitParagraphIntoPages(p, limit) {
    var sentences = p.match(/[^.!?…]+[.!?…]+["'”’]?\s*|[^.!?…]+$/g) || [p];
    var pages = [], buf = [], wc = 0;
    sentences.forEach(function (s) {
      var n = wordCount(s);
      if (buf.length && wc + n > limit) {
        pages.push(buf.join(' ').trim());
        buf = []; wc = 0;
      }
      buf.push(s.trim()); wc += n;
    });
    if (buf.length) pages.push(buf.join(' ').trim());
    return pages;
  }

  function fallbackArticlePages(article) {
    if (!article) return [''];
    var limit = pageWordLimit();
    var key = 'fallback:' + article.id + ':' + article.content.length + ':' + (article.updatedAt || article.createdAt || 0) + ':' + limit + ':' + settingsSig();
    if (FALLBACK_PAGE_CACHE[key]) return FALLBACK_PAGE_CACHE[key];
    var paragraphs = article.content.split(/\n\s*\n/).map(function (p) { return p.replace(/\n/g, ' ').trim(); }).filter(Boolean);
    var pages = [], buf = [], wc = 0;
    paragraphs.forEach(function (p) {
      var n = wordCount(p);
      if (n > limit) {
        if (buf.length) { pages.push(buf.join('\n\n')); buf = []; wc = 0; }
        pages = pages.concat(splitParagraphIntoPages(p, limit));
      } else {
        if (buf.length && wc + n > limit) {
          pages.push(buf.join('\n\n'));
          buf = []; wc = 0;
        }
        buf.push(p); wc += n;
      }
    });
    if (buf.length) pages.push(buf.join('\n\n'));
    if (!pages.length) pages = [''];
    FALLBACK_PAGE_CACHE[key] = pages;
    return pages;
  }

  function pageCacheKey(article) {
    return [
      PAGINATION_VERSION,
      article.id,
      article.content.length,
      article.updatedAt || article.createdAt || 0,
      Math.round(window.innerWidth || 0),
      Math.round(window.innerHeight || 0),
      settingsSig()
    ].join(':');
  }

  function getArticlePages(article) {
    if (!article) return [''];
    return ARTICLE_PAGE_CACHE[pageCacheKey(article)] || fallbackArticlePages(article);
  }

  function splitLongSentence(sentence) {
    var s = String(sentence || '').trim();
    if (!s) return [];
    if (wordCount(s) <= 58) return [s];
    var words = s.split(/\s+/), chunks = [];
    for (var i = 0; i < words.length; i += 42) chunks.push(words.slice(i, i + 42).join(' '));
    return chunks;
  }

  function articleUnits(article) {
    var units = [];
    String(article.content || '').split(/\n\s*\n/).map(function (p) {
      return p.replace(/\n/g, ' ').trim();
    }).filter(Boolean).forEach(function (para, pi) {
      var sentences = para.match(/[^.!?…]+[.!?…]+["'”’]?\s*|[^.!?…]+$/g) || [para];
      sentences.forEach(function (sentence) {
        splitLongSentence(sentence).forEach(function (chunk) {
          units.push({ pi: pi, text: chunk });
        });
      });
    });
    return units;
  }

  function unitsToText(units, start, end) {
    var paras = [], buf = [], last = null;
    for (var i = start; i < end; i++) {
      var u = units[i];
      if (!u) continue;
      if (last !== null && u.pi !== last) {
        if (buf.length) paras.push(buf.join(' ').trim());
        buf = [];
      }
      buf.push(u.text);
      last = u.pi;
    }
    if (buf.length) paras.push(buf.join(' ').trim());
    return paras.join('\n\n');
  }

  function pageMeasureBox(width) {
    var el = document.getElementById('page-measure');
    if (!el) {
      el = document.createElement('div');
      el.id = 'page-measure';
      el.className = 'reading-content font-reading measure-reader';
      document.body.appendChild(el);
    }
    el.style.width = Math.max(220, Math.floor(width)) + 'px';
    return el;
  }

  function measureArticlePages(article) {
    var shell = document.querySelector('.page-shell');
    if (!shell) return null;
    var cs = window.getComputedStyle(shell);
    var padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
    var padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
    var width = shell.clientWidth - padX;
    var maxHeight = shell.clientHeight - padY - 6;
    if (width < 220 || maxHeight < 160) return null;
    var units = articleUnits(article);
    if (!units.length) return [''];
    var meas = pageMeasureBox(width);
    var saved = savedFormsSet();
    var known = knownSet();
    function fits(start, end) {
      meas.innerHTML = renderContentHTML(unitsToText(units, start, end), false, saved, known);
      return meas.scrollHeight <= maxHeight;
    }
    var pages = [], start = 0;
    while (start < units.length) {
      var first = start + 1;
      if (!fits(start, first)) {
        pages.push(unitsToText(units, start, first));
        start = first;
        continue;
      }
      var lo = first, hi = units.length, best = first;
      while (lo <= hi) {
        var mid = Math.floor((lo + hi) / 2);
        if (fits(start, mid)) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      pages.push(unitsToText(units, start, best));
      start = best;
    }
    meas.innerHTML = '';
    return pages.length ? pages : [''];
  }

  function samePages(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  function scheduleHeightPagination() {
    if (state.tab !== 'reading' || state.composing || !state.currentArticleId || !isPaged()) return;
    if (isMobileLike()) {
      if (measureTimer) { clearTimeout(measureTimer); measureTimer = null; }
      return;
    }
    var cur = state.articles.find(function (a) { return a.id === state.currentArticleId; });
    if (!cur) return;
    var key = pageCacheKey(cur);
    if (ARTICLE_PAGE_CACHE[key]) return;
    if (measureTimer) clearTimeout(measureTimer);
    measureTimer = setTimeout(function () {
      measureTimer = null;
      var article = state.articles.find(function (a) { return a.id === state.currentArticleId; });
      if (!article) return;
      var k = pageCacheKey(article);
      var measured = measureArticlePages(article);
      if (!measured) return;
      var old = ARTICLE_PAGE_CACHE[k] || fallbackArticlePages(article);
      ARTICLE_PAGE_CACHE[k] = measured;
      if (state.articlePage >= measured.length) state.articlePage = Math.max(0, measured.length - 1);
      if (!samePages(old, measured)) render();
    }, 40);
  }

  function progressStorageKey(key) {
    return 'article:' + key;
  }

  function progressOf(id) {
    var direct = (state.readProgress && state.readProgress[id]) || null;
    if (direct) return direct;
    var art = state.articles.find(function (a) { return a.id === id; });
    if (!art) return {};
    return (state.readProgress && state.readProgress[progressStorageKey(articlePackKey(art))]) || {};
  }

  function progressText(id) {
    var p = progressOf(id);
    return p.pct ? ('读到 ' + Math.max(1, Math.min(100, p.pct)) + '%') : '未读';
  }

  function progressPct(id) {
    var p = progressOf(id);
    return Math.max(0, Math.min(100, p.pct || 0));
  }

  function openArticle(id, restore) {
    var a = state.articles.find(function (x) { return x.id === id; });
    if (!a) return;
    state.currentBook = shelfNameForArticle(a);
    state.currentArticleId = id;
    var pr = progressOf(id);
    state.articlePage = restore && pr.page ? pr.page : 0;
    window.scrollTo(0, 0);
    render();
    if (restore && pr.scroll) {
      setTimeout(function () { window.scrollTo(0, pr.scroll || 0); }, 0);
    }
  }

  function updateReadingProgress(force) {
    if (state.tab !== 'reading' || state.composing || !state.currentArticleId) return;
    var cur = state.articles.find(function (a) { return a.id === state.currentArticleId; });
    if (!cur) return;
    var pages = getArticlePages(cur);
    var doc = document.documentElement;
    var max = Math.max(1, doc.scrollHeight - window.innerHeight);
    var y = Math.max(0, window.pageYOffset || doc.scrollTop || 0);
    var pagePct = Math.max(0, Math.min(1, y / max));
    var page = Math.max(0, Math.min(pages.length - 1, state.articlePage || 0));
    var pct;
    if (!isPaged()) {
      // 滚动模式：按整页滚动比例
      pct = Math.round(pagePct * 100);
      if (pagePct > 0.94) pct = 100;
    } else {
      pct = document.body.classList.contains('reader-fixed')
        ? Math.round(((page + 1) / Math.max(1, pages.length)) * 100)
        : Math.round(((page + pagePct) / Math.max(1, pages.length)) * 100);
      if (page >= pages.length - 1 && pagePct > 0.94) pct = 100;
    }
    var old = progressOf(cur.id);
    if (!force && old.page === page && Math.abs((old.scroll || 0) - y) < 120 && old.pct === pct) return;
    var prog = { page: page, scroll: y, pct: pct, updatedAt: Date.now(), done: pct >= 95 };
    state.readProgress[cur.id] = prog;
    state.readProgress[progressStorageKey(articlePackKey(cur))] = prog;
    saveProgress();
  }

  var progressTimer = null;
  function scheduleProgressSave() {
    if (progressTimer) return;
    progressTimer = setTimeout(function () {
      progressTimer = null;
      updateReadingProgress(false);
    }, 500);
  }

  function setArticlePage(page) {
    var cur = state.articles.find(function (a) { return a.id === state.currentArticleId; });
    if (!cur) return;
    var pages = getArticlePages(cur);
    var next = Math.max(0, Math.min(pages.length - 1, page));
    if (next === (state.articlePage || 0)) return;
    autoMarkCurrentPage(); // 离开本页前，未标记词记为已掌握
    updateReadingProgress(true);
    state.pageTurn = next > (state.articlePage || 0) ? 'turn-next' : 'turn-prev';
    state.articlePage = next;
    window.scrollTo(0, 0);
    var pageProg = {
      page: next,
      scroll: 0,
      pct: Math.round(((next + 1) / Math.max(1, pages.length)) * 100),
      updatedAt: Date.now(),
      done: next >= pages.length - 1
    };
    state.readProgress[cur.id] = pageProg;
    state.readProgress[progressStorageKey(articlePackKey(cur))] = pageProg;
    saveProgress();
    render();
    setTimeout(function () { state.pageTurn = ''; }, 380);
  }

  function isPaged() { return (state.settings || SETTINGS_DEFAULT).readMode !== 'scroll'; }

  // 把一段文字里仍是「新词(蓝)」且词典里有的词，自动记为已掌握
  function autoMarkKnownInText(text) {
    if (!state.settings || !state.settings.autoKnown || !text) return 0;
    var saved = savedFormsSet(), known = knownSet();
    var tokens = text.match(/[a-zA-Z]+(?:['’\-][a-zA-Z]+)*/g) || [];
    var toAdd = {};
    tokens.forEach(function (tok) {
      if (wordStatus(tok, saved, known) !== 'new') return;
      var r = lookupWord(tok);
      if (!r) return; // 词典里查不到的（人名/拼写错误等）不记
      if (!known.has(r.lemma) && !toAdd[r.lemma]) toAdd[r.lemma] = 1;
    });
    var added = Object.keys(toAdd);
    if (!added.length) return 0;
    var beforeRankCount = state.known.length;
    added.forEach(function (lem) { state.known.push(lem); });
    saveKnown();
    maybeShowRankUp(beforeRankCount);
    return added.length;
  }
  // 标记「当前页」(仅翻页模式) —— 离开本页/本章前调用
  function autoMarkCurrentPage() {
    if (!isPaged() || !state.settings || !state.settings.autoKnown) return;
    var cur = state.articles.find(function (a) { return a.id === state.currentArticleId; });
    if (!cur) return;
    var pages = getArticlePages(cur);
    var pg = Math.max(0, Math.min(pages.length - 1, state.articlePage || 0));
    autoMarkKnownInText(pages[pg]);
  }

  // 当前章在本书中的相邻章
  function chapterSiblings() {
    var cur = state.articles.find(function (a) { return a.id === state.currentArticleId; });
    if (!cur) return { cur: null, prev: null, next: null };
    var chapters = groupBooks().map[shelfNameForArticle(cur)] || [cur];
    var ci = chapters.findIndex(function (a) { return a.id === cur.id; });
    return {
      cur: cur, idx: ci, list: chapters,
      prev: ci > 0 ? chapters[ci - 1] : null,
      next: (ci >= 0 && ci < chapters.length - 1) ? chapters[ci + 1] : null
    };
  }

  // 打开某章并落到指定位置：'start'=第一页，'end'=最后一页
  function openChapterAt(id, where) {
    var a = state.articles.find(function (x) { return x.id === id; });
    if (!a) return;
    autoMarkCurrentPage(); // 离开本章前标记当前页
    updateReadingProgress(true);
    state.currentBook = shelfNameForArticle(a);
    state.currentArticleId = id;
    var pages = getArticlePages(a);
    state.articlePage = where === 'end' ? Math.max(0, pages.length - 1) : 0;
    state.pageTurn = where === 'end' ? 'turn-prev' : 'turn-next';
    window.scrollTo(0, 0);
    updateReadingProgress(true);
    render();
    setTimeout(function () { state.pageTurn = ''; }, 380);
  }

  // 翻页：章内正常翻；到边界且有相邻章则跨章连续翻
  function turnPage(delta) {
    var cur = state.articles.find(function (a) { return a.id === state.currentArticleId; });
    if (!cur) return;
    var pages = getArticlePages(cur);
    var target = (state.articlePage || 0) + delta;
    if (target >= 0 && target <= pages.length - 1) { setArticlePage(target); return; }
    var sib = chapterSiblings();
    if (target > pages.length - 1 && sib.next) openChapterAt(sib.next.id, 'start');
    else if (target < 0 && sib.prev) openChapterAt(sib.prev.id, 'end');
    // 否则已在全书首/尾，不动
  }

  function renderContentHTML(content, collectSentences, savedArg, knownArg) {
    if (collectSentences) RENDER_SENTENCES = [];
    var saved = savedArg || savedFormsSet();
    var known = knownArg || knownSet();
    var paragraphs = content.split(/\n\s*\n/).map(function (p) { return p.replace(/\n/g, ' ').trim(); }).filter(Boolean);
    var html = '';
    paragraphs.forEach(function (para) {
      var sentences = para.match(/[^.!?…]+[.!?…]+["'”’]?\s*|[^.!?…]+$/g) || [para];
      html += '<p>';
      sentences.forEach(function (sentence) {
        var sTrim = sentence.trim();
        var si = collectSentences ? RENDER_SENTENCES.length : 0;
        if (collectSentences) RENDER_SENTENCES.push(sTrim);
        var tokens = sentence.match(/[a-zA-Z]+(?:['’\-][a-zA-Z]+)*|[^a-zA-Z]+/g) || [];
        tokens.forEach(function (token) {
          if (/^[a-zA-Z]/.test(token)) {
            var st = wordStatus(token, saved, known);
            var active = collectSentences && state.selected && state.selected.surface === token && state.selected.si === si;
            html += '<span class="' + STATUS_CLASS[st] + (active ? ' word-active' : '') +
              '" data-w="' + esc(token) + '" data-si="' + si + '">' + esc(token) + '</span>';
          } else {
            html += esc(token);
          }
        });
      });
      html += '</p>';
    });
    return html;
  }

  function renderContent(content) {
    return renderContentHTML(content, true);
  }

  // ---------- 主渲染 ----------
  var app = document.getElementById('app');

  function render() {
    var html = '';
    if (state.booting) {
      app.innerHTML = '<div class="boot-screen">' +
        '<div class="brand"><h1 class="font-display">词流<span class="dot">.</span></h1><span class="ver font-mono">1.8.4 · local</span></div>' +
        '<div class="loading font-cjk">' + I.loader + '<span>' + esc(state.bootMsg || '正在加载…') + '</span></div>' +
        '</div>';
      return;
    }
    document.body.classList.toggle('reader-fixed', state.tab === 'reading' && !!state.currentArticleId && !state.composing && isPaged());
    if (!DICT_READY) {
      html += '<div class="banner">⚠ 词典数据（ecdict.js）未加载或为空，查词功能不可用。请确认 ecdict.js 与 index.html 在同一文件夹。</div>';
    } else if (window.ECDICT_SAMPLE) {
      html += '<div class="banner">当前使用的是「常用词样本词典」（约 ' + DICT.size + ' 词），仅供试用。完整 ECDICT 词库生成后会替换 ecdict.js，届时可离线查更多生僻词。</div>';
    }
    if (state.storageNotice) html += '<div class="banner ok">' + esc(state.storageNotice) + '</div>';
    if (state.storageError) html += '<div class="banner danger">' + esc(state.storageError) + '</div>';
    if (state.importing) {
      html += '<div class="banner">' + I.loader + ' ' + esc(state.importing) + '</div>';
    }
    html += '<header><div class="wrap-wide head-inner">' +
      '<div class="brand"><h1 class="font-display">词流<span class="dot">.</span></h1>' +
      '<span class="ver font-mono">1.8.4 · local</span></div>' +
      '<nav>' +
        tabBtn('reading', '阅读', I.bookOpen) +
        tabBtn('vocab', '词汇', I.bookMarked) +
        tabBtn('review', '复习', I.sparkles) +
        '<span style="width:8px"></span>' +
        '<button class="icon-btn" id="btn-settings" title="阅读设置">' + I.settings + '</button>' +
        (TTS_OK ? '<button class="icon-btn" id="btn-autospeak" title="' + (state.autoSpeak ? '点词自动朗读：开' : '点词自动朗读：关') + '" style="' + (state.autoSpeak ? 'color:var(--accent)' : 'opacity:0.55') + '">' + (state.autoSpeak ? I.volume : I.volumeX) + '</button>' : '') +
        '<button class="icon-btn" id="btn-export" title="导出备份">' + I.download + '</button>' +
        '<button class="icon-btn" id="btn-import" title="导入备份">' + I.upload + '</button>' +
        '<input type="file" id="import-file" accept="application/json,.json" class="hidden">' +
      '</nav></div></header>';

    html += '<main>';
    if (state.tab === 'reading') html += renderReading();
    else if (state.tab === 'review') html += renderReview();
    else html += renderVocab();
    html += '</main>';

    if (state.selected) html += renderPanel();
    if (state.showSettings) html += renderSettings();
    if (state.showRankGuide) html += renderRankGuide();
    if (state.rankUp) html += renderRankUp();

    app.innerHTML = html;
    bind();
    scheduleHeightPagination();
  }

  // 一行分段选择器
  function segRow(label, key, opts) {
    var cur = (state.settings || SETTINGS_DEFAULT)[key];
    var btns = opts.map(function (o) {
      return '<button class="seg' + (cur === o.val ? ' on' : '') + '" data-set="' + key + '" data-val="' + o.val + '">' + esc(o.label) + '</button>';
    }).join('');
    return '<div class="set-row"><span class="set-label font-cjk">' + esc(label) + '</span><div class="seg-group">' + btns + '</div></div>';
  }
  function toggleRow(label, key, isAutoSpeak) {
    var on = isAutoSpeak ? state.autoSpeak : (state.settings || SETTINGS_DEFAULT)[key];
    return '<div class="set-row"><span class="set-label font-cjk">' + esc(label) + '</span>' +
      '<button class="switch' + (on ? ' on' : '') + '" data-toggle="' + esc(key) + '" role="switch" aria-checked="' + (on ? 'true' : 'false') + '"><span class="knob"></span></button></div>';
  }
  function renderJsonbinSync(m) {
    var configured = !!(m.masterKey && m.binId);
    if (!configured) {
      return '<p class="cloud-hint font-cjk">到 jsonbin.io 免费注册拿到 Master Key。第一台设备点「创建云存档」，把生成的同步码填到其它设备「连接」。</p>' +
        '<input class="cloud-input font-mono" id="sync-key" placeholder="粘贴 jsonbin Master Key">' +
        '<div class="set-actions" style="margin:8px 0"><button class="btn-pill" id="cloud-create">创建云存档（第一台）</button></div>' +
        '<div class="cloud-or font-cjk">— 另一台设备：填同一个 Key + 同步码 —</div>' +
        '<input class="cloud-input font-mono" id="sync-bin" placeholder="粘贴同步码（存档编号）">' +
        '<div class="set-actions" style="margin-top:8px"><button class="btn-pill ghost-pill" id="cloud-connect">连接已有存档</button></div>';
    }
    var when = m.lastSyncedAt ? new Date(m.lastSyncedAt).toLocaleString() : '尚未同步';
    return '<div class="cloud-code font-mono">同步码：' + esc(m.binId) + '</div>' +
      '<p class="cloud-hint font-cjk">在另一台设备填入同一个 Master Key 和上面这个同步码即可。上次同步：' + esc(when) + '</p>' +
      '<div class="set-actions" style="margin:8px 0;flex-wrap:wrap">' +
        '<button class="btn-pill ghost-pill" id="set-sync-push">立即上传</button>' +
        '<button class="btn-pill ghost-pill" id="set-sync-pull">立即拉取</button>' +
        '<button class="btn-pill ghost-pill" id="cloud-disconnect">断开</button>' +
      '</div>' + toggleRow('自动同步', 'syncAuto') + toggleRow('同步文章库（同步码不传正文；阅读进度会同步）', 'syncArticles');
  }
  function renderFirebaseSync(m) {
    var signedIn = !!(m.fbConfig && m.fbUid);
    if (signedIn) {
      var when = m.lastSyncedAt ? new Date(m.lastSyncedAt).toLocaleString() : '尚未同步';
      return '<p class="cloud-hint font-cjk">已登录：<b>' + esc(m.fbEmail || m.fbUid) + '</b>。另一台设备用同一个谷歌账号登录即可同步。上次同步：' + esc(when) + '</p>' +
        '<div class="set-actions" style="margin:8px 0;flex-wrap:wrap">' +
          '<button class="btn-pill ghost-pill" id="set-sync-push">立即上传</button>' +
          '<button class="btn-pill ghost-pill" id="set-sync-pull">立即拉取</button>' +
          '<button class="btn-pill ghost-pill" id="fb-signout">退出登录</button>' +
        '</div>' + toggleRow('自动同步', 'syncAuto') + toggleRow('同步文章库（含书的正文；阅读进度始终同步）', 'syncArticles');
    }
    return '<p class="cloud-hint font-cjk">在 Firebase 控制台建项目 → 开 Firestore + 谷歌登录 → 复制 firebaseConfig 粘进下框，保存后用谷歌登录。具体步骤见同步指南。</p>' +
      '<textarea class="cloud-input font-mono" id="fb-config" rows="6" placeholder="粘贴 firebaseConfig = { apiKey: \'...\', authDomain: \'...\', projectId: \'...\', appId: \'...\' }">' + (m.fbConfig ? esc(JSON.stringify(m.fbConfig, null, 0)) : '') + '</textarea>' +
      '<div class="set-actions" style="margin-top:8px">' +
        '<button class="btn-pill ghost-pill" id="fb-save-config">保存配置</button>' +
        '<button class="btn-pill" id="fb-signin"' + (m.fbConfig ? '' : ' disabled') + '>用谷歌登录</button>' +
      '</div>';
  }
  function renderCloudSync() {
    var m = ensureSyncMeta();
    var provider = m.provider || (m.masterKey && m.binId ? 'jsonbin' : 'firebase');
    var out = '<div class="set-row" style="display:block"><span class="set-label font-cjk" style="display:block;margin-bottom:8px">云同步</span>' +
      '<div class="seg-group" style="margin-bottom:10px">' +
        '<button class="seg' + (provider === 'firebase' ? ' on' : '') + '" data-syncprovider="firebase">Firebase</button>' +
        '<button class="seg' + (provider === 'jsonbin' ? ' on' : '') + '" data-syncprovider="jsonbin">同步码</button>' +
      '</div>';
    out += (provider === 'firebase') ? renderFirebaseSync(m) : renderJsonbinSync(m);
    out += '</div>';
    return out;
  }
  function renderSettings() {
    var themeOpts = THEMES.map(function (t) { return { val: t.id, label: t.name }; });
    return '<div class="set-mask" id="set-mask"><div class="set-card font-cjk">' +
      '<div class="set-head"><span class="font-display">阅读设置</span><button class="icon-btn" id="set-close" title="关闭">' + I.x + '</button></div>' +
      '<div class="set-body">' +
        segRow('字号', 'fontSize', [{ val: 's', label: '小' }, { val: 'm', label: '标准' }, { val: 'l', label: '大' }, { val: 'xl', label: '特大' }]) +
        segRow('行距', 'lineHeight', [{ val: 's', label: '紧凑' }, { val: 'm', label: '标准' }, { val: 'l', label: '宽松' }]) +
        segRow('页面宽度', 'pageWidth', [{ val: 's', label: '窄' }, { val: 'm', label: '标准' }, { val: 'l', label: '宽' }]) +
        segRow('主题', 'theme', themeOpts) +
        segRow('翻页方式', 'readMode', [{ val: 'paged', label: '翻页' }, { val: 'scroll', label: '滚动' }]) +
        toggleRow('翻页时未标记词记为已掌握', 'autoKnown') +
        toggleRow('显示生词高亮', 'highlight') +
        toggleRow('翻页动画', 'anim') +
        toggleRow('复习音效', 'sound') +
        toggleRow('瓦罗兰特段位', 'valorantRank') +
        toggleRow('点词自动朗读', 'autoSpeak', true) +
        '<div class="set-row"><span class="set-label font-cjk">本地备份</span><div class="set-actions">' +
          '<button class="btn-pill ghost-pill" id="set-export">' + I.download + '导出</button>' +
          '<button class="btn-pill ghost-pill" id="set-import">' + I.upload + '导入</button>' +
        '</div></div>' +
        '<div class="set-row"><span class="set-label font-cjk">本地书籍</span><div class="set-actions">' +
          '<button class="btn-pill ghost-pill" id="set-import-ielts">导入雅思阅读</button>' +
        '</div></div>' +
        renderCloudSync() +
      '</div></div></div>';
  }

  function tabBtn(key, label, icon) {
    return '<button class="tab' + (state.tab === key ? ' active' : '') + '" data-tab="' + key + '">' + icon + label + '</button>';
  }

  var IELTS_SHELF = '剑桥雅思阅读合集';
  function rawBookName(a) {
    return (a && (a.book || a.title)) || '未分类';
  }
  function ieltsNumberFromBook(name) {
    var m = String(name || '').match(/Cambridge\s+IELTS\s+(\d+)\s+Reading/i) ||
      String(name || '').match(/剑桥雅思(?:真题)?\s*(\d+)/i) ||
      String(name || '').match(/IELTS\s+(\d+)/i);
    return m ? parseInt(m[1], 10) : 0;
  }
  function isIeltsBookName(name) {
    return !!ieltsNumberFromBook(name);
  }
  function shelfNameForBook(name) {
    name = name || '未分类';
    return isIeltsBookName(name) ? IELTS_SHELF : name;
  }
  function shelfNameForArticle(a) {
    return shelfNameForBook(rawBookName(a));
  }
  function sectionNameForArticle(a) {
    var raw = rawBookName(a);
    var n = ieltsNumberFromBook(raw);
    return n ? ('剑桥雅思 ' + n) : '';
  }
  function ieltsTestPassageFromArticle(a) {
    var s = String((a && a.title) || '') + ' ' + String((a && a.id) || '') + ' ' + String((a && a.source) || '');
    var m = s.match(/Test\s*([1-4])\s*[-–—_: ]+\s*Passage\s*([123])/i) ||
      s.match(/t([1-4])[_-]p([123])/i);
    return m ? { test: parseInt(m[1], 10), passage: parseInt(m[2], 10) } : { test: 99, passage: 99 };
  }
  function compareChaptersForShelf(x, y) {
    var sx = sectionNameForArticle(x), sy = sectionNameForArticle(y);
    if (sx || sy) {
      var nx = ieltsNumberFromBook(sx), ny = ieltsNumberFromBook(sy);
      if (nx !== ny) return nx - ny;
      var tx = ieltsTestPassageFromArticle(x), ty = ieltsTestPassageFromArticle(y);
      if (tx.test !== ty.test) return tx.test - ty.test;
      if (tx.passage !== ty.passage) return tx.passage - ty.passage;
    }
    return (x.createdAt || 0) - (y.createdAt || 0);
  }

  // 按书架入口分组：剑桥雅思阅读合并成一个入口，内部再按册数分段
  function groupBooks() {
    var map = {}, order = [], sections = {}, sectionOrder = {};
    state.articles.forEach(function (a) {
      var b = shelfNameForArticle(a);
      if (!map[b]) { map[b] = []; order.push(b); sections[b] = {}; sectionOrder[b] = []; }
      map[b].push(a);
      var sec = sectionNameForArticle(a);
      if (sec) {
        if (!sections[b][sec]) { sections[b][sec] = []; sectionOrder[b].push(sec); }
        sections[b][sec].push(a);
      }
    });
    order.forEach(function (b) {
      map[b].sort(compareChaptersForShelf);
      sectionOrder[b].sort(function (x, y) { return ieltsNumberFromBook(x) - ieltsNumberFromBook(y); });
      sectionOrder[b].forEach(function (s) { sections[b][s].sort(compareChaptersForShelf); });
    });
    order.sort(function (b1, b2) { return recentOf(map[b2]) - recentOf(map[b1]); });
    return { order: order, map: map, sections: sections, sectionOrder: sectionOrder };
  }
  function recentOf(list) { var m = 0; list.forEach(function (a) { if ((a.createdAt || 0) > m) m = a.createdAt || 0; }); return m; }

  function targetUnknownRate() {
    var userWords = state.known.length + state.vocabulary.length;
    if (userWords < 800) return 0.10;
    if (userWords < 2000) return 0.14;
    if (userWords < 4000) return 0.18;
    if (userWords < 7000) return 0.22;
    return 0.26;
  }
  function freqWeight(freq) {
    if (!isFinite(freq)) return 0;
    if (freq <= 1000) return 1;
    if (freq <= 3000) return 0.86;
    if (freq <= 6000) return 0.7;
    if (freq <= 10000) return 0.52;
    if (freq <= 20000) return 0.34;
    return 0.16;
  }
  function articleLearningProfile(article, savedSet, knSet) {
    var tokens = String(article.content || '').match(/[a-zA-Z]+(?:['’\-][a-zA-Z]+)*/g) || [];
    var seen = {}, profile = {
      total: 0, mastered: 0, learning: 0, fresh: 0,
      commonWeight: 0, commonCount: 0, commonWords: []
    };
    tokens.forEach(function (tok) {
      var raw = tok.toLowerCase();
      var r = lookupWord(tok);
      var lemma = r ? r.lemma.toLowerCase() : resolveLemma(tok).toLowerCase();
      if (seen[lemma]) return;
      var inLearning = savedSet.has(raw) || savedSet.has(lemma);
      var inKnown = knSet.has(raw) || knSet.has(lemma);
      var de = DICT.get(lemma);
      if (!inLearning && !inKnown && !de) return;
      seen[lemma] = 1;
      profile.total++;
      if (inKnown) {
        profile.mastered++;
      } else if (inLearning) {
        profile.learning++;
      } else {
        profile.fresh++;
      }
      if (!inKnown) {
        var freq = dictFreq(lemma);
        var w = freqWeight(freq);
        if (w > 0) {
          profile.commonWeight += w;
          profile.commonCount++;
          profile.commonWords.push({ lemma: lemma, freq: freq });
        }
      }
    });
    profile.unmastered = profile.learning + profile.fresh;
    profile.unknownRate = profile.total ? profile.unmastered / profile.total : 0;
    profile.knownRate = profile.total ? profile.mastered / profile.total : 0;
    profile.commonRate = profile.unmastered ? profile.commonWeight / profile.unmastered : 0;
    profile.commonWords.sort(function (a, b) { return a.freq - b.freq; });
    return profile;
  }
  function recommendationReason(profile) {
    if (profile.learning >= 5) return '复现你生词本里的词';
    if (profile.commonRate >= 0.65) return '生词常见度高，值得优先读';
    if (profile.unknownRate <= 0.12) return '难度温和，适合顺读';
    if (profile.knownRate >= 0.55) return '已掌握覆盖不错';
    return '难度接近当前水平';
  }
  function readingRecommendations(limit) {
    if (!state.articles.length) return [];
    var saved = savedFormsSet(), known = knownSet();
    var target = targetUnknownRate();
    var recs = [];
    state.articles.forEach(function (a) {
      var profile = articleLearningProfile(a, saved, known);
      if (profile.total < 60) return;
      var pct = progressPct(a.id);
      if (pct >= 95) return;
      var fit = Math.max(0, 1 - Math.abs(profile.unknownRate - target) / 0.18);
      var savedBoost = Math.min(14, profile.learning * 1.7);
      var progressBoost = pct ? Math.max(-8, 6 - pct / 8) : 8;
      var score = fit * 42 + profile.commonRate * 34 + profile.knownRate * 10 + savedBoost + progressBoost;
      if (profile.unknownRate > target + 0.24) score -= 18;
      recs.push({ article: a, profile: profile, score: score, progress: pct, reason: recommendationReason(profile) });
    });
    recs.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return (a.profile.unknownRate - b.profile.unknownRate) || ((a.article.createdAt || 0) - (b.article.createdAt || 0));
    });
    return recs.slice(0, limit || 3);
  }
  function renderReadingRecommendations() {
    var recs = readingRecommendations(3);
    if (!recs.length) return '';
    var target = Math.round(targetUnknownRate() * 100);
    var out = '<section class="reading-recs">' +
      '<div class="rec-head">' +
        '<div><h3 class="font-display">推荐阅读</h3>' +
        '<p class="font-mono">按你的词汇量匹配，目标生词率约 ' + target + '%</p></div>' +
      '</div><div class="rec-grid">';
    recs.forEach(function (r, i) {
      var a = r.article, p = r.profile;
      var useful = p.commonWords.slice(0, 4).map(function (w) { return w.lemma; });
      out += '<button class="rec-card" data-open="' + a.id + '">' +
        '<span class="rec-rank font-mono">#' + (i + 1) + '</span>' +
        '<span class="rec-book font-mono">' + esc(shelfNameForArticle(a)) + '</span>' +
        '<span class="rec-title font-display">' + esc(a.title) + '</span>' +
        '<span class="rec-reason">' + esc(r.reason) + '</span>' +
        '<span class="rec-stats font-mono">' +
          '<em>生词率 ' + Math.round(p.unknownRate * 100) + '%</em>' +
          '<em>已掌握 ' + Math.round(p.knownRate * 100) + '%</em>' +
          '<em>' + p.learning + ' 个生词本词</em>' +
        '</span>' +
        (useful.length ? '<span class="rec-words font-mono">' + useful.map(esc).join(' · ') + '</span>' : '') +
      '</button>';
    });
    out += '</div></section>';
    return out;
  }

  function renderReading() {
    if (state.composing) {
      var editing = !!state.editingId;
      return '<div class="wrap" style="padding-top:32px;padding-bottom:32px">' +
        '<div class="row between" style="margin-bottom:24px">' +
          '<h2 class="page-title font-display">' + (editing ? '编辑章节' : '新章节') + '</h2>' +
          '<div class="row gap2">' +
            '<button class="btn-ghost" id="import-article">' + I.upload + (editing ? '继续导入' : '导入 txt/PDF/EPUB/JSON') + '</button>' +
            '<input type="file" id="article-file" accept=".txt,.pdf,.epub,.json,application/json" class="hidden">' +
            '<button class="btn-ghost" id="cancel-compose">' + I.x + '取消</button>' +
          '</div>' +
        '</div>' +
        '<input class="input-title font-display" id="new-book" placeholder="书名（同名归为一本书）" value="' + esc(state.newBook) + '" style="font-size:18px;color:var(--accent);margin-bottom:12px">' +
        '<input class="input-title font-display" id="new-title" placeholder="章节标题（可选）" value="' + esc(state.newTitle) + '">' +
        '<textarea class="compose font-reading" id="new-content" placeholder="粘贴英文内容，或点右上角导入文件...">' + esc(state.newContent) + '</textarea>' +
        '<div class="row" style="justify-content:flex-end;margin-top:24px">' +
          '<button class="btn-pill" id="create-article"' + (state.newContent.trim() ? '' : ' disabled') + '>' + (editing ? '保存' : '开始阅读') + '</button>' +
        '</div></div>';
    }

    // 阅读某一章
    var cur = state.articles.find(function (a) { return a.id === state.currentArticleId; });
    if (cur) {
      var chapters = groupBooks().map[shelfNameForArticle(cur)] || [cur];
      var ci = chapters.findIndex(function (a) { return a.id === cur.id; });
      var prev = ci > 0 ? chapters[ci - 1] : null;
      var next = ci >= 0 && ci < chapters.length - 1 ? chapters[ci + 1] : null;

      // 滚动模式：整章连续下拉，底部章节导航
      if (!isPaged()) {
        var sp = progressPct(cur.id);
        var navHtml = '<div class="chap-nav">' +
          (prev ? '<button class="chap-nav-btn" data-open="' + prev.id + '">' + I.arrowLeft + '<span><em>上一章</em>' + esc(prev.title) + '</span></button>' : '<span></span>') +
          (next ? '<button class="chap-nav-btn next" data-open="' + next.id + '"><span><em>下一章</em>' + esc(next.title) + '</span>' + I.arrowRight + '</button>' : '<span></span>') +
          '</div>';
        return '<div class="wrap reader-scroll">' +
          '<div class="row between reader-top">' +
            '<button class="btn-ghost" id="back-chapters">' + I.arrowLeft + '目录' + (chapters.length > 1 ? ' ' + (ci + 1) + '/' + chapters.length : '') + '</button>' +
            '<span class="progress-mini font-mono">读到 ' + sp + '%</span>' +
            '<button class="icon-btn" id="edit-article" title="编辑 / 续写">' + I.plus + '</button>' +
          '</div>' +
          '<div class="readbar"><div style="width:' + sp + '%"></div></div>' +
          '<h1 class="article-title font-display">' + esc(cur.title) + '</h1>' +
          '<article class="reading-content font-reading scroll-mode" id="article-body">' + renderContent(cur.content) + '</article>' +
          navHtml +
          '</div>';
      }

      var pages = getArticlePages(cur);
      if (state.articlePage >= pages.length) state.articlePage = Math.max(0, pages.length - 1);
      var pg = Math.max(0, Math.min(pages.length - 1, state.articlePage || 0));
      var pp = Math.round(((pg + 1) / Math.max(1, pages.length)) * 100);
      var atFirst = pg <= 0, atLast = pg >= pages.length - 1;
      var canPrev = !atFirst || !!prev, canNext = !atLast || !!next;
      var showEdges = pages.length > 1 || prev || next;
      return '<div class="wrap reader-wrap">' +
        '<div class="row between reader-top">' +
          '<button class="btn-ghost" id="back-chapters">' + I.arrowLeft + '目录' + (chapters.length > 1 ? ' ' + (ci + 1) + '/' + chapters.length : '') + '</button>' +
          '<span class="page-mini font-mono">' + (pg + 1) + ' / ' + pages.length + '</span>' +
          '<div class="row gap2">' +
            '<span class="progress-mini font-mono">读到 ' + pp + '%</span>' +
            '<button class="icon-btn" id="edit-article" title="编辑 / 续写">' + I.plus + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="readbar"><div style="width:' + pp + '%"></div></div>' +
        '<h1 class="article-title font-display">' + esc(cur.title) + '</h1>' +
        '<div class="page-shell ' + esc(state.pageTurn || '') + '">' +
          (showEdges ? '<button class="page-edge left" data-page="prev"' + (canPrev ? '' : ' disabled') + ' title="' + (atFirst && prev ? '上一章：' + esc(prev.title) : '上一页') + '">' + I.arrowLeft + '</button>' : '') +
          '<article class="reading-content font-reading ' + esc(state.pageTurn || '') + '" id="article-body">' + renderContent(pages[pg]) + '</article>' +
          (showEdges ? '<button class="page-edge right" data-page="next"' + (canNext ? '' : ' disabled') + ' title="' + (atLast && next ? '下一章：' + esc(next.title) : '下一页') + '">' + I.arrowRight + '</button>' : '') +
          (atLast ? '<div class="chap-end font-mono">' + (next ? '本章完 · 翻页进入「' + esc(next.title) + '」' : '· 全书完 ·') + '</div>' : '') +
        '</div>' +
        '</div>';
    }

    // 某本书的章节目录
    if (state.currentBook) {
      var g = groupBooks();
      var currentShelf = shelfNameForBook(state.currentBook);
      if (currentShelf !== state.currentBook) state.currentBook = currentShelf;
      var list = g.map[state.currentBook];
      if (list && list.length) {
        var secOrder = (g.sectionOrder && g.sectionOrder[state.currentBook]) || [];
        var sections = (g.sections && g.sections[state.currentBook]) || {};
        var canAddChapter = state.currentBook !== IELTS_SHELF;
        var renderChapterCard = function (a, i) {
          var n = countSavedInText(a.content);
          return '<div class="card chap-card" data-open="' + a.id + '">' +
            '<button class="del" data-del-art="' + a.id + '">' + I.trash + '</button>' +
            '<span class="chap-no font-mono">' + (i + 1) + '</span>' +
            '<div class="chap-body">' +
              '<h3 class="font-display">' + esc(a.title) + '</h3>' +
              '<p class="preview font-reading">' + esc(a.content.slice(0, 110)) + '…</p>' +
              '<div class="meta font-mono"><span>' + wordCount(a.content) + ' 词</span><span>·</span>' +
              '<span style="color:' + (n > 0 ? 'var(--accent)' : 'var(--inkMuted)') + '">' + n + ' 个生词</span><span>·</span><span>' + progressText(a.id) + '</span></div>' +
            '</div></div>';
        };
        var bout = '<div class="wrap" style="padding-top:32px;padding-bottom:32px">' +
          '<div class="row between" style="margin-bottom:8px">' +
            '<button class="btn-ghost" id="back-shelf">' + I.arrowLeft + '书架</button>' +
            (canAddChapter ? '<button class="btn-pill" id="new-chapter">' + I.plus + '新章节</button>' : '<span></span>') +
          '</div>' +
          '<h2 class="page-title font-display" style="margin-bottom:6px">' + esc(state.currentBook) + '</h2>' +
          '<p class="font-mono" style="font-size:12px;color:var(--inkMuted);margin:0 0 24px">' + (secOrder.length ? secOrder.length + ' 组 · ' + list.length + ' 篇文章' : list.length + ' 章') + '</p>';
        if (secOrder.length) {
          bout += '<div class="chap-sections">';
          secOrder.forEach(function (sec) {
            var secList = sections[sec] || [];
            bout += '<section class="chap-section">' +
              '<div class="chap-section-head"><h3 class="font-display">' + esc(sec.replace(/\s+Reading$/i, '')) + '</h3><span class="font-mono">' + secList.length + ' 篇</span></div>' +
              '<div class="stack">';
            secList.forEach(function (a, i) { bout += renderChapterCard(a, i); });
            bout += '</div></section>';
          });
          bout += '</div></div>';
        } else {
          bout += '<div class="stack">';
          list.forEach(function (a, i) { bout += renderChapterCard(a, i); });
          bout += '</div></div>';
        }
        return bout;
      }
      state.currentBook = null; // 书已空，回书架
    }

    // 书架
    var gb = state.articles.length ? groupBooks() : { order: [], map: {} };
    var allWords = 0, allSaved = 0;
    state.articles.forEach(function (a) { allWords += wordCount(a.content); allSaved += countSavedInText(a.content); });
    var out = '<div class="wrap-wide shelf-page">' +
      '<div class="shelf-head">' +
        '<div><h2 class="page-title font-display">我的书架</h2>' +
        '<p class="shelf-sub font-mono">' + gb.order.length + ' 本书 · ' + state.articles.length + ' 篇内容 · ' + allWords + ' 词 · ' + allSaved + ' 个生词</p></div>' +
        '<div class="shelf-actions">' +
          '<button class="btn-ghost" id="import-article">' + I.upload + '导入文件/文章包</button>' +
          '<input type="file" id="article-file" accept=".txt,.pdf,.epub,.json,application/json" class="hidden">' +
          '<button class="btn-pill" id="new-article">' + I.plus + '新建</button>' +
        '</div>' +
      '</div>';
    if (!state.articles.length) {
      out += emptyState(I.library, '书架还是空的', '粘贴一段英文或导入文件，开始你的阅读', '粘贴文本', 'new-article-2');
    } else {
      out += renderReadingRecommendations();
      out += '<div class="shelf">';
      gb.order.forEach(function (b) {
        var list = gb.map[b];
        var saved = 0, words = 0, totalPct = 0;
        list.forEach(function (a) { saved += countSavedInText(a.content); words += wordCount(a.content); totalPct += progressPct(a.id); });
        var bookPct = list.length ? Math.round(totalPct / list.length) : 0;
        var isIeltsShelf = b === IELTS_SHELF;
        var cover = isIeltsShelf ? 'IELTS' : (((b.match(/IELTS\s+(\d+)/i) || [])[1]) || list.length);
        var series = isIeltsShelf ? 'Cambridge Collection' : (/IELTS/i.test(b) ? 'IELTS Reading' : 'Local Book');
        var countLabel = isIeltsShelf ? '文章' : '章节';
        out += '<div class="book-spine" data-openbook="' + esc(b) + '">' +
          '<button class="del" data-del-book="' + esc(b) + '">' + I.trash + '</button>' +
          '<div class="bs-cover"><span' + (isIeltsShelf ? ' class="long"' : '') + '>' + esc(cover) + '</span><em>BOOK</em></div>' +
          '<div class="bs-info">' +
            '<span class="series font-mono">' + esc(series) + '</span>' +
            '<h3 class="font-display">' + esc(b) + '</h3>' +
          '</div>' +
          '<div class="bs-meta font-mono">' +
            '<span class="bs-stat"><b>' + list.length + '</b><em>' + countLabel + '</em></span>' +
            '<span class="bs-stat"><b>' + words + '</b><em>词数</em></span>' +
            '<span class="bs-stat hot"><b>' + saved + '</b><em>生词</em></span>' +
            '<span class="bs-stat"><b>' + (bookPct ? bookPct + '%' : '0%') + '</b><em>' + (bookPct ? '进度' : '未读') + '</em></span>' +
          '</div>' +
          '<div class="bs-progress"><span style="width:' + bookPct + '%"></span></div>' +
        '</div>';
      });
      out += '</div>';
    }
    out += '</div>';
    return out;
  }

  // 词频排名（越小越常见；未知排最后）
  function dictFreq(lemma) {
    var e = DICT.get(String(lemma).toLowerCase());
    return (e && e.freq > 0) ? e.freq : Infinity;
  }
  function compareByFreq(a, b) {
    var fa = dictFreq(a), fb = dictFreq(b);
    if (fa !== fb) return fa - fb;
    return String(a).toLowerCase().localeCompare(String(b).toLowerCase());
  }
  // 用词典补全旧条目缺失的释义/音标/词性（修复早期不完整词典时存下的空记录）
  function enrich(lemma, stored) {
    var de = DICT.get(String(lemma).toLowerCase());
    var t = (stored && stored.translation) ? stored.translation : '';
    if (!t || /^（词典中(未找到|无释义)/.test(t)) t = de ? de.trans : t;
    return {
      translation: t,
      phon: (stored && stored.phon) ? stored.phon : (de ? de.phon : ''),
      pos: (stored && stored.pos) ? stored.pos : (de ? de.pos : ''),
      freq: de ? de.freq : 0
    };
  }
  function sortList(arr, getLemma, getOrder) {
    if (state.vocabSort === 'alpha') arr.sort(function (a, b) { return getLemma(a).toLowerCase() < getLemma(b).toLowerCase() ? -1 : 1; });
    else if (state.vocabSort === 'freq') arr.sort(function (a, b) { return compareByFreq(getLemma(a), getLemma(b)); });
    else if (state.vocabSort === 'recent' || state.vocabSort === 'added') arr.sort(function (a, b) { return getOrder(b) - getOrder(a); });
    else arr.sort(function (a, b) { return getOrder(b) - getOrder(a); });
    return arr;
  }

  // 生词列表（搜索+排序后）
  function learningList() {
    var q = state.searchInLib ? state.vocabSearch.trim().toLowerCase() : ''; // 添加模式下不过滤列表
    var arr = state.vocabulary.slice();
    if (q) arr = arr.filter(function (v) {
      return v.lemma.toLowerCase().indexOf(q) >= 0 || (enrich(v.lemma, v).translation || '').toLowerCase().indexOf(q) >= 0;
    });
    return sortList(arr, function (v) { return v.lemma; }, function (v) { return v.createdAt || 0; });
  }
  // 已掌握列表（释义实时取自词典）
  function knownDisplayList() {
    var q = state.vocabSearch.trim().toLowerCase();
    var arr = state.known.map(function (l, i) {
      var w = String(l), e = DICT.get(w.toLowerCase());
      return { lemma: w, order: i, phon: e ? e.phon : '', pos: e ? e.pos : '', translation: e ? e.trans : '' };
    });
    if (q) arr = arr.filter(function (w) {
      return w.lemma.toLowerCase().indexOf(q) >= 0 || w.translation.toLowerCase().indexOf(q) >= 0;
    });
    return sortList(arr, function (w) { return w.lemma; }, function (w) { return w.order; });
  }

  // 词书界面（词汇 → 词书 子标签）
  function renderBooks() {
    // 新建词书表单
    if (state.composingBook) {
      return '<div class="row between" style="margin-bottom:16px">' +
          '<button class="btn-ghost" id="book-back">' + I.arrowLeft + '所有词书</button>' +
          '<span class="font-display" style="font-size:18px">新建词书</span></div>' +
        '<input class="input-title font-display" id="cb-name" placeholder="词书名称，如 A-level 商务" value="' + esc(state.newBookName) + '" style="font-size:20px;margin-bottom:14px">' +
        '<textarea class="compose font-reading" id="cb-words" placeholder="粘贴单词或词组，每行一个（或用逗号分隔），自动去重…" style="min-height:240px">' + esc(state.newBookWords) + '</textarea>' +
        '<div class="row" style="justify-content:flex-end;margin-top:16px;gap:10px">' +
          '<button class="btn-ghost" id="cb-cancel">' + I.x + '取消</button>' +
          '<button class="btn-pill" id="cb-create"' + (state.newBookWords.trim() ? '' : ' disabled') + '>' + I.check + ' 创建</button>' +
        '</div>';
    }

    // 打开了某本书（自建 cb_… 或内置 tag）
    if (state.bookOpen) {
      var custom = getCustomBook(state.bookOpen);
      if (custom) return renderOneBook({ id: custom.id, name: custom.name, words: custom.words.slice(), custom: true });
      var idxO = buildBookIndex();
      if (idxO[state.bookOpen]) {
        var bk = BOOKS.find(function (b) { return b.tag === state.bookOpen; });
        return renderOneBook({ id: state.bookOpen, name: bk ? bk.name : state.bookOpen, words: idxO[state.bookOpen], custom: false });
      }
      state.bookOpen = null;
    }

    // 词书列表：我的词书 + 自建区 + 内置区
    var known = knownSet();
    var out = '';

    var myL = state.vocabulary.length, myK = state.known.length;
    out += '<div class="book-grid" style="margin-bottom:18px"><button class="book-card mybook" data-book="my">' +
      '<span class="bk-name font-display">我的词书</span>' +
      '<span class="bk-meta font-mono">' + myL + ' 生词 · ' + myK + ' 已掌握</span></button></div>';

    out += '<div class="row between" style="margin:2px 0 12px">' +
      '<span class="font-display" style="font-size:16px">自建词书</span>' +
      '<button class="btn-pill" id="cb-new">' + I.plus + '新建词书</button></div>';
    if (!state.customBooks.length) {
      out += '<p class="font-cjk" style="color:var(--inkMuted);margin:0 0 22px;font-size:14px">还没有自建词书。点「新建词书」，粘贴一批单词（如 A-level 商务词），就能在这里专门背。</p>';
    } else {
      out += '<div class="book-grid">';
      state.customBooks.forEach(function (b) {
        var learned = 0;
        for (var i = 0; i < b.words.length; i++) { if (known.has(b.words[i])) learned++; }
        out += '<button class="book-card" data-book="' + esc(b.id) + '">' +
          '<span class="bk-name font-display">' + esc(b.name) + '</span>' +
          '<span class="bk-meta font-mono">' + b.words.length + ' 词 · 已掌握 ' + learned + '</span></button>';
      });
      out += '</div>';
    }

    var idx = buildBookIndex();
    var avail = BOOKS.filter(function (b) { return (idx[b.tag] || []).length; });
    out += '<div class="row between" style="margin:24px 0 12px"><span class="font-display" style="font-size:16px">考试词书</span></div>';
    if (!avail.length) {
      out += '<p class="font-cjk list-empty" style="padding:8px 0">当前词典里没有考试标签数据。用更新后的「制作完整词典.html」重跑 ecdict.csv 替换 ecdict.js 即可启用。</p>';
    } else {
      out += '<div class="book-grid">';
      avail.forEach(function (b) {
        var list = idx[b.tag];
        var learned2 = 0;
        for (var i = 0; i < list.length; i++) { if (known.has(list[i])) learned2++; }
        out += '<button class="book-card" data-book="' + b.tag + '">' +
          '<span class="bk-name font-display">' + b.name + '</span>' +
          '<span class="bk-meta font-mono">' + list.length + ' 词 · 已掌握 ' + learned2 + '</span></button>';
      });
      out += '</div>';
    }
    return out;
  }

  // 单本词书视图（自建/内置通用）：未掌握/已掌握分页 + 排序 + 搜索
  function renderOneBook(book) {
    var known = knownSet();
    var tab = state.bookTab === 'learned' ? 'learned' : 'unlearned';
    var unlearned = [], learned = [];
    book.words.forEach(function (w) { (known.has(w) ? learned : unlearned).push(w); });
    var list = tab === 'learned' ? learned : unlearned;

    // 排序
    var recentRank = {}; book.words.forEach(function (w, i) { recentRank[w] = i; });
    list = list.slice();
    if (state.vocabSort === 'alpha') list.sort(function (a, b) { return a < b ? -1 : 1; });
    else if (state.vocabSort === 'freq') list.sort(compareByFreq);
    else if (book.custom) list.sort(function (a, b) { return recentRank[b] - recentRank[a]; }); // 最近：后加的在前
    // 内置书「最近」无意义，保持词典常见度顺序

    // 搜索
    var q = state.vocabSearch.trim().toLowerCase();
    if (q) list = list.filter(function (w) {
      return w.indexOf(q) >= 0 || ((DICT.get(w) || {}).trans || '').toLowerCase().indexOf(q) >= 0;
    });
    var limit = Math.max(500, state.bookShowLimit || 500);
    var shown = list.slice(0, limit);

    var head = '<div class="row between" style="margin-bottom:12px">' +
      '<button class="btn-ghost" id="book-back">' + I.arrowLeft + '所有词书</button>' +
      '<span class="font-display" style="font-size:18px">' + esc(book.name) + '</span>' +
      (book.custom ? '<div class="row gap1"><button class="btn-ghost" id="cb-rename" title="重命名词书">' + I.edit + '</button>' +
        '<button class="btn-ghost" id="cb-del" title="删除整本词书">' + I.trash + '</button></div>' : '<span style="width:34px"></span>') +
      '</div>';

    // 未掌握 / 已掌握 子标签
    head += '<div class="subtabs" style="margin-bottom:12px">' +
      '<button class="subtab' + (tab === 'unlearned' ? ' active' : '') + '" data-btab="unlearned">未掌握 ' + unlearned.length + '</button>' +
      '<button class="subtab' + (tab === 'learned' ? ' active' : '') + '" data-btab="learned">已掌握 ' + learned.length + '</button>' +
      '</div>';

    // 自建书：添加更多词
    if (book.custom) {
      if (state.addWordsTo === book.id) {
        head += '<textarea class="compose font-reading" id="cb-addwords" placeholder="粘贴要加入本书的单词…" style="min-height:90px;margin-bottom:8px"></textarea>' +
          '<div class="row" style="justify-content:flex-end;gap:8px;margin-bottom:12px">' +
          '<button class="btn-ghost" id="cb-addcancel">取消</button>' +
          '<button class="btn-pill" id="cb-addsave">' + I.check + ' 加入</button></div>';
      } else {
        head += '<div class="row" style="margin-bottom:12px"><button class="btn-ghost" id="cb-addmore">' + I.plus + '添加单词</button></div>';
      }
    }

    // 搜索 + 排序
    head += '<div class="vtoolbar">' +
      '<div class="vinput"><span class="vin-ico">' + I.search + '</span>' +
        '<input id="vsearch" placeholder="在本词书里搜索…" value="' + esc(state.vocabSearch) + '"></div>' +
      '<select class="sort" id="vsort">' +
        '<option value="recent"' + (state.vocabSort === 'recent' ? ' selected' : '') + '>' + (book.custom ? '最近' : '默认') + '</option>' +
        '<option value="freq"' + (state.vocabSort === 'freq' ? ' selected' : '') + '>常见优先</option>' +
        '<option value="alpha"' + (state.vocabSort === 'alpha' ? ' selected' : '') + '>字母</option>' +
      '</select></div>';

    if (!shown.length) {
      return head + '<div class="list-empty" style="padding:30px 0">' +
        (q ? '没有匹配的词。' : (tab === 'learned' ? '这本书还没有已掌握的词。' : '这本书的词都掌握啦 🎉')) + '</div>';
    }

    var body = '<div class="vlist">';
    shown.forEach(function (w) {
      var rec = DICT.get(w) || {};
      var inKnown = tab === 'learned';
      var act = inKnown
        ? '<button class="bk-add" data-unknow="' + esc(w) + '" title="移回未掌握">移回</button>'
        : '<button class="bk-add" data-grad="' + esc(w) + '" title="标为已掌握">✓ 掌握</button>';
      var addV = (!inKnown && !savedFormsSet().has(w)) ? '<button class="bk-add" data-addbook="' + esc(w) + '" title="加入学习集">+生词</button>' : '';
      body += '<div class="vrow">' +
        '<div class="vrow-main"><div class="vrow-head">' +
          '<span class="w font-display">' + esc(rec.w || w) + '</span>' +
          (rec.phon ? '<span class="p font-mono">/' + esc(rec.phon) + '/</span>' : '') + '</div>' +
          '<div class="t font-cjk" title="' + esc(rec.trans || '') + '">' + esc((rec.trans || '').replace(/\n/g, ' / ') || '（词典中未找到）') + '</div></div>' +
        '<div class="row-actions" style="opacity:1">' +
          (TTS_OK ? '<button data-speak="' + esc(w) + '" title="朗读">' + I.volume + '</button>' : '') +
          addV + act +
          (book.custom ? '<button data-delbookword="' + esc(w) + '" title="从词书移除">' + I.x + '</button>' : '') +
        '</div></div>';
    });
    body += '</div>';
    if (list.length > limit) {
      var more = Math.min(500, list.length - limit);
      body += '<div class="list-empty" style="padding:18px 0">' +
        '<button class="btn-ghost" id="book-more">' + I.plus + '再展开 ' + more + ' 个</button>' +
        '<div class="font-mono" style="font-size:12px;color:var(--inkMuted);margin-top:8px">已显示 ' + limit + ' / ' + list.length + ' 个</div>' +
        '</div>';
    }
    return head + body;
  }

  function renderVocab() {
    var nL = state.vocabulary.length, nK = state.known.length;
    var title = state.bookOpen === 'my' ? '我的词书' : '词汇';
    var out = '<div class="wrap vocab-wrap">' +
      '<div class="vocab-head">' +
        '<h2 class="page-title font-display">' + title + '</h2>' +
        '<span class="vocab-count font-mono">' + nL + ' 生词 · ' + nK + ' 已掌握</span>' +
      '</div>';
    if (state.composingBook) return out + renderBooks() + '</div>';      // 新建词书表单
    if (state.bookOpen === 'my') return out + renderMyBook() + '</div>'; // 我的词书（个人生词库）
    if (state.bookOpen) return out + renderBooks() + '</div>';           // 单本自建/考试词书
    return out + renderBooks() + '</div>';                               // 书架
  }

  // 「我的词书」= 个人生词库（保留全部功能：加词/批量/学习/例句）
  function renderMyBook() {
    var isLearning = state.vocabTab !== 'known';
    var nL = state.vocabulary.length, nK = state.known.length;
    var selIds = Object.keys(state.vocabSel).filter(function (k) { return state.vocabSel[k]; });
    var selLearn = selIds.filter(function (k) { return k.indexOf('known:') !== 0; });
    var nSel = selIds.length;

    var out = '<div class="row" style="margin-bottom:12px">' +
      '<button class="btn-ghost" id="book-back">' + I.arrowLeft + '所有词书</button></div>' +
      '<div class="subtabs" style="margin-bottom:12px">' +
        '<button class="subtab' + (isLearning ? ' active' : '') + '" data-mytab="learning">生词 ' + nL + '</button>' +
        '<button class="subtab' + (!isLearning ? ' active' : '') + '" data-mytab="known">已掌握 ' + nK + '</button>' +
      '</div>';

    // 工具栏：搜索 / 添加 分段切换 + 输入框 + 排序
    var addMode = isLearning && !state.searchInLib;
    out += '<div class="vtoolbar">';
    if (isLearning) {
      out += '<div class="seg">' +
        '<button class="seg-btn' + (!addMode ? ' on' : '') + '" id="seg-search">' + I.search + '搜索</button>' +
        '<button class="seg-btn' + (addMode ? ' on' : '') + '" id="seg-add">' + I.plus + '添加</button>' +
        '</div>';
    }
    out += '<div class="vinput">' +
      '<span class="vin-ico">' + (addMode ? I.plus : I.search) + '</span>' +
      '<input id="vsearch" placeholder="' + (addMode ? '输入英文单词，回车加入生词…' : '搜索单词或中文释义…') + '" value="' + esc(state.vocabSearch) + '">' +
      (addMode ? '<button class="vin-add" id="add-word-btn">加入</button>' : '') +
      '</div>';
    if (!addMode) {
      var recentSelected = isLearning && (state.vocabSort === 'recent' || state.vocabSort === 'added');
      var addedSelected = !isLearning && (state.vocabSort === 'added' || state.vocabSort === 'recent');
      out += '<select class="sort" id="vsort">' +
        (isLearning
          ? '<option value="recent"' + (recentSelected ? ' selected' : '') + '>最近添加</option>'
          : '<option value="added"' + (addedSelected ? ' selected' : '') + '>添加时间</option>') +
        '<option value="freq"' + (state.vocabSort === 'freq' ? ' selected' : '') + '>常见优先</option>' +
        '<option value="alpha"' + (state.vocabSort === 'alpha' ? ' selected' : '') + '>字母</option>' +
        '</select>';
    }
    out += '</div>';

    // 批量操作栏
    if (nSel > 0) {
      out += '<div class="bulk-bar"><span>已选 ' + nSel + ' 个</span><span class="sp"></span>';
      if (isLearning) {
        if (selLearn.length) out += '<button class="bulk-btn" data-bulk="review">学习选中</button>';
        out += '<button class="bulk-btn" data-bulk="graduate">标为已掌握</button>' +
               '<button class="bulk-btn ghost" data-bulk="delete">删除</button>';
      } else {
        out += '<button class="bulk-btn" data-bulk="tolearn">移回生词</button>' +
               '<button class="bulk-btn ghost" data-bulk="delete">删除</button>';
      }
      out += '<button class="bulk-btn ghost" data-bulk="clear">取消</button></div>';
    }

    function rowHTML(lemma, key, phon, pos, translation, actionsHTML, on, misses) {
      var oneLine = (translation || '').replace(/\n/g, ' / ');
      var lv = levelOf(lemma);
      return '<div class="vrow' + (on ? ' sel' : '') + '">' +
        '<div class="vchk' + (on ? ' on' : '') + '" data-sel="' + esc(key) + '">' + I.check + '</div>' +
        '<div class="vrow-main">' +
          '<div class="vrow-head">' +
            '<span class="w font-display">' + esc(lemma) + '</span>' +
            (phon ? '<span class="p font-mono">/' + esc(phon) + '/</span>' : '') +
            (pos ? '<span class="pos-tag font-cjk">' + esc(pos) + '</span>' : '') +
            (lv ? '<span class="lv-badge font-cjk">' + lv + '</span>' : '') +
            (misses ? '<span class="hard-badge font-cjk">错 ' + misses + '</span>' : '') +
          '</div>' +
          '<div class="t font-cjk" title="' + esc(translation || '') + '">' +
            (oneLine ? esc(oneLine) : '<span style="color:var(--inkMuted)">（词典中无释义）</span>') + '</div>' +
        '</div>' +
        '<div class="row-actions">' +
          (TTS_OK ? '<button data-speak="' + esc(lemma) + '" title="朗读">' + I.volume + '</button>' : '') +
          actionsHTML + '</div></div>';
    }

    if (isLearning) {
      var ll = learningList();
      if (!ll.length) {
        out += '<div class="list-empty">' + (state.vocabSearch ? '没有匹配的生词。' : '还没有生词。阅读时点开单词，关闭即存为生词。') + '</div>';
      } else {
        out += '<div class="vlist">';
        ll.forEach(function (e) {
          var key = e.id, on = !!state.vocabSel[key], inf = enrich(e.lemma, e);
          var acts = '<button data-grad="' + esc(e.lemma) + '" title="标为已掌握">' + I.check + '</button>' +
            '<button data-del-voc="' + e.id + '" title="删除">' + I.trash + '</button>';
          out += rowHTML(e.lemma, key, inf.phon, inf.pos, inf.translation, acts, on, e.misses || 0);
        });
        out += '</div>';
      }
    } else {
      var kl = knownDisplayList();
      if (!kl.length) {
        out += '<div class="list-empty">' + (state.vocabSearch ? '没有匹配的已掌握词。' : '还没有已掌握的词。在阅读或生词卡里点「已掌握」即可。') + '</div>';
      } else {
        out += '<div class="vlist">';
        kl.forEach(function (w) {
          var key = 'known:' + w.lemma.toLowerCase(), on = !!state.vocabSel[key];
          var acts = '<button data-tolearn="' + esc(w.lemma) + '" title="移回生词">' + I.bookMarked + '</button>' +
            '<button data-del-known="' + esc(w.lemma) + '" title="删除">' + I.trash + '</button>';
          out += rowHTML(w.lemma, key, w.phon, w.pos, w.translation, acts, on, 0);
        });
        out += '</div>';
      }
    }

    return out;
  }

  // ---------- 学习集模式 ----------
  var MODES = [
    { id: 'flash', title: '单词卡', desc: '像卡片一样翻面自测，适合快速过一遍' },
    { id: 'learn', title: '学习', desc: '选择、例句、书写混合推进，优先安排到期词' },
    { id: 'write', title: '书写', desc: '看释义和例句拼出单词，专治眼熟手生' },
    { id: 'test', title: '测试', desc: '固定 10 题混合测验，做完给出正确率' },
    { id: 'match', title: '配对', desc: '单词和释义连连看，轻量热身或收尾' }
  ];

  var RANKS = [
    { min: 0, code: 'R0', name: '启程', next: 500 },
    { min: 500, code: 'A1', name: '入门读者', next: 1500 },
    { min: 1500, code: 'A2', name: '基础读者', next: 3000 },
    { min: 3000, code: 'B1', name: '稳定读者', next: 6000 },
    { min: 6000, code: 'B2', name: '熟练读者', next: 9000 },
    { min: 9000, code: 'C1', name: '高阶读者', next: 13000 },
    { min: 13000, code: 'C2', name: '深度读者', next: 18000 },
    { min: 18000, code: 'MAX', name: '自由阅读', next: null }
  ];

  var VALORANT_RANKS = [
    { min: 0, code: '黑铁1', name: '', next: 300 },
    { min: 300, code: '黑铁2', name: '', next: 600 },
    { min: 600, code: '黑铁3', name: '', next: 900 },
    { min: 900, code: '青铜1', name: '', next: 1200 },
    { min: 1200, code: '青铜2', name: '', next: 1500 },
    { min: 1500, code: '青铜3', name: '', next: 1900 },
    { min: 1900, code: '白银1', name: '', next: 2300 },
    { min: 2300, code: '白银2', name: '', next: 2700 },
    { min: 2700, code: '白银3', name: '', next: 3200 },
    { min: 3200, code: '黄金1', name: '', next: 3700 },
    { min: 3700, code: '黄金2', name: '', next: 4300 },
    { min: 4300, code: '黄金3', name: '', next: 5000 },
    { min: 5000, code: '铂金1', name: '', next: 5800 },
    { min: 5800, code: '铂金2', name: '', next: 6600 },
    { min: 6600, code: '铂金3', name: '', next: 7600 },
    { min: 7600, code: '钻石1', name: '', next: 8600 },
    { min: 8600, code: '钻石2', name: '', next: 9700 },
    { min: 9700, code: '钻石3', name: '', next: 10900 },
    { min: 10900, code: '超凡1', name: '', next: 12100 },
    { min: 12100, code: '超凡2', name: '', next: 13400 },
    { min: 13400, code: '超凡3', name: '', next: 14800 },
    { min: 14800, code: '神话1', name: '', next: 16200 },
    { min: 16200, code: '神话2', name: '', next: 17600 },
    { min: 17600, code: '神话3', name: '', next: 19000 },
    { min: 19000, code: '赋能', name: '', next: null }
  ];

  var LEARNING_RANK_REVIEWS = {
    R0: '起步阶段，只认得最高频的那几百个词，能看懂路牌、菜单、单词卡级别的内容。',
    A1: '能读懂简单的短句和日常用语，看简易绘本、基础对话没问题。大致相当于 CEFR A1。',
    A2: '能读懂简单短文和简易读物的大意，熟悉话题能跟上。大致相当于 A2 / 中考水平。',
    B1: '能读一般文章和简易小说，抓得住主旨，长难句偶尔卡壳。大致相当于 B1 / 高考·CET-4。',
    B2: '大多数常见内容、新闻、流行小说都能读懂。大致相当于 B2 / CET-6·雅思 6。',
    C1: '能比较顺地读原版小说和专业文章，开始享受英文阅读。大致相当于 C1 / 雅思 7·托福 100。',
    C2: '接近母语者的阅读，抽象、学术、文学内容都拿得下。大致相当于 C2 / 雅思 8+。',
    MAX: '自由阅读，几乎任何真实英文材料都能无障碍读懂。'
  };

  var VALORANT_MAJOR_REVIEWS = {
    '黑铁': '入门：只认得最高频词，能看懂路牌、菜单、单词卡级别的内容。',
    '青铜': '能读懂简单句子和基础日常用语。大致相当于 CEFR A1-A2。',
    '白银': '能读懂简单短文、简易读物的大意。大致相当于 A2 / 中考水平。',
    '黄金': '能读一般文章和简易小说，抓得住主旨。大致相当于 B1 / 高考·CET-4。',
    '铂金': '多数常见内容和新闻都能读懂，长难句偶尔卡。大致相当于 B1+-B2 / CET-6。',
    '钻石': '能比较顺地读原版小说和科普文章。大致相当于 B2-C1 / 雅思 6.5-7。',
    '超凡': '专业文章和文学作品基本能读懂。大致相当于 C1 / 雅思 7+·托福 100。',
    '神话': '接近母语者阅读，抽象、学术、文学游刃有余。大致相当于 C1-C2 / 雅思 8。',
    '赋能': '自由阅读，几乎任何真实英文材料都能无障碍读懂。大致相当于 C2。'
  };

  function rankRangeLabel(r) {
    return r.next ? r.min + ' - ' + (r.next - 1) + ' 词' : r.min + '+ 词';
  }

  function valorantMajor(code) {
    return code === '赋能' ? '赋能' : String(code).replace(/[123]$/, '');
  }

  // 等级配色（只影响外观，不动词汇量门槛）
  var VAL_TIER_COLORS = {
    '黑铁': '#7d7d7d', '青铜': '#a9743b', '白银': '#9aa7ad', '黄金': '#e2b13c',
    '铂金': '#3fa6a6', '钻石': '#c77fd6', '超凡': '#3fae6b', '神话': '#d14b4b', '赋能': '#e9c46a'
  };
  var LEARN_RANK_COLORS = {
    R0: '#8a7758', A1: '#7e9b6b', A2: '#5f9e8f', B1: '#4f86b8', B2: '#6f6fc0',
    C1: '#a368c0', C2: '#c77b3a', MAX: '#d14b4b'
  };
  function rankColor(code, game) {
    if (game) return VAL_TIER_COLORS[valorantMajor(code)] || '#c77b3a';
    return LEARN_RANK_COLORS[code] || '#c77b3a';
  }
  // 徽章上显示的短标记
  function rankBadge(code, game) {
    if (!game) return code; // R0 / A1 / MAX
    var major = valorantMajor(code);
    var tier = (String(code).match(/[123]$/) || [''])[0];
    return major.charAt(0) + (tier || ''); // 黑1 / 钻3 / 赋
  }

  function rankForCount(count, game) {
    var ranks = game ? VALORANT_RANKS : RANKS;
    var rank = ranks[0];
    for (var i = 0; i < ranks.length; i++) {
      if (count >= ranks[i].min) rank = ranks[i];
    }
    var next = rank.next;
    var span = next ? Math.max(1, next - rank.min) : 1;
    var pct = next ? Math.max(0, Math.min(100, Math.round((count - rank.min) / span * 100))) : 100;
    return {
      count: count,
      code: rank.code,
      name: rank.name,
      game: game,
      min: rank.min,
      next: next,
      need: next ? Math.max(0, next - count) : 0,
      pct: pct,
      color: rankColor(rank.code, game),
      badge: rankBadge(rank.code, game)
    };
  }

  function masteryRank() {
    return rankForCount(state.known.length, !!(state.settings && state.settings.valorantRank));
  }

  function rankFullName(rank) {
    return rank.code + (rank.name ? ' · ' + rank.name : '');
  }

  function maybeShowRankUp(beforeCount) {
    if (state.booting || syncApplying) return;
    var afterCount = state.known.length;
    if (afterCount <= beforeCount) return;
    var game = !!(state.settings && state.settings.valorantRank);
    var before = rankForCount(beforeCount, game);
    var to = rankForCount(afterCount, game);
    if (before.code === to.code) return;
    state.rankUp = {
      from: before,
      to: to,
      gained: afterCount - beforeCount,
      at: Date.now()
    };
    sfxRankUp();
  }

  function renderRankCard(rank) {
    var title = rank.game ? '瓦罗兰特段位' : '词汇水平';
    var c = rank.color || 'var(--accent)';
    var name = '<span style="color:' + c + '">' + esc(rank.code) + '</span>' + (rank.name ? ' ' + esc(rank.name) : '');
    var nextText = rank.game ? '距离下一段还差 ' : '距离下一档还差 ';
    var maxText = rank.game ? '已到最高段位，继续扩大阅读面' : '已到最高档，继续扩大阅读面';
    return '<div class="rank-card" style="--rk:' + c + '">' +
      '<div class="rank-top">' +
        '<div><div class="rank-eyebrow font-cjk">' + title + '</div>' +
        '<div class="rank-name font-display">' + name + '</div></div>' +
        '<div class="rank-count font-cjk">已掌握 <b>' + rank.count + '</b> 词</div>' +
      '</div>' +
      '<div class="rank-bar"><span style="width:' + rank.pct + '%;background:' + c + '"></span></div>' +
      '<div class="rank-foot"><div class="rank-note font-cjk">' + (rank.next ? nextText + rank.need + ' 词' : maxText) + '</div>' +
        '<button class="rank-guide-btn font-cjk" id="rank-guide-open">查看段位</button></div>' +
      '</div>';
  }

  function renderLearningRankGuide(cur) {
    var out = '<div class="rank-guide-list">';
    RANKS.forEach(function (r) {
      var active = r.code === cur.code;
      var col = rankColor(r.code, false);
      out += '<div class="rank-guide-row' + (active ? ' active' : '') + '"' + (active ? ' style="border-color:' + col + ';box-shadow:inset 3px 0 0 ' + col + '"' : '') + '>' +
        '<div class="rank-guide-main"><span class="font-display" style="color:' + col + '">' + esc(r.code) + '</span><b>' + esc(r.name) + '</b><em>' + rankRangeLabel(r) + '</em></div>' +
        '<p>' + esc(LEARNING_RANK_REVIEWS[r.code] || '') + '</p>' +
        '</div>';
    });
    out += '</div>';
    return out;
  }

  function renderValorantRankGuide(cur) {
    var groups = [];
    var byMajor = {};
    VALORANT_RANKS.forEach(function (r) {
      var m = valorantMajor(r.code);
      if (!byMajor[m]) { byMajor[m] = { name: m, ranks: [] }; groups.push(byMajor[m]); }
      byMajor[m].ranks.push(r);
    });
    var out = '<div class="rank-guide-list">';
    groups.forEach(function (g) {
      var activeGroup = g.ranks.some(function (r) { return r.code === cur.code; });
      var col = VAL_TIER_COLORS[g.name] || 'var(--accent)';
      out += '<div class="rank-guide-row' + (activeGroup ? ' active' : '') + '"' + (activeGroup ? ' style="border-color:' + col + ';box-shadow:inset 3px 0 0 ' + col + '"' : '') + '>' +
        '<div class="rank-guide-main"><span class="font-display" style="color:' + col + '">' + esc(g.name) + '</span><b>' + esc(VALORANT_MAJOR_REVIEWS[g.name] || '') + '</b></div>' +
        '<div class="rank-steps">';
      g.ranks.forEach(function (r) {
        out += '<span class="rank-step' + (r.code === cur.code ? ' current' : '') + '"' + (r.code === cur.code ? ' style="border-color:' + col + ';background:' + col + '22"' : '') + '>' +
          '<b>' + esc(r.code) + '</b><em>' + rankRangeLabel(r) + '</em></span>';
      });
      out += '</div></div>';
    });
    out += '</div>';
    return out;
  }

  function renderRankGuide() {
    var cur = masteryRank();
    var title = cur.game ? '瓦罗兰特段位图鉴' : '词汇水平图鉴';
    var sub = cur.game ? '每个大段位都有自己的学习状态评价。' : '当前使用普通学习等级；可在设置里切换成瓦罗兰特段位。';
    return '<div class="set-mask" id="rank-mask"><div class="rank-guide-card font-cjk">' +
      '<div class="set-head"><span class="font-display">' + title + '</span><button class="icon-btn" id="rank-guide-close" title="关闭">' + I.x + '</button></div>' +
      '<div class="rank-guide-body">' +
        '<div class="rank-guide-current"><span>当前</span><b class="font-display">' + esc(cur.code) + (cur.name ? ' · ' + esc(cur.name) : '') + '</b><em>已掌握 ' + cur.count + ' 词</em></div>' +
        '<p class="rank-guide-sub">' + esc(sub) + '</p>' +
        (cur.game ? renderValorantRankGuide(cur) : renderLearningRankGuide(cur)) +
      '</div></div></div>';
  }

  function renderRankUp() {
    var up = state.rankUp;
    if (!up || !up.to) return '';
    var cur = up.to;
    var c = cur.color || 'var(--accent)';
    var title = cur.game ? '段位晋升' : '词汇水平提升';
    var next = cur.next ? '下一目标 ' + cur.next + ' 词，还差 ' + cur.need + ' 词。' : '已到最高档，继续扩大阅读面。';
    return '<div class="set-mask rank-up-mask" id="rank-up-mask"><div class="rank-up-card font-cjk" style="--rk:' + c + '">' +
      '<button class="icon-btn rank-up-x" id="rank-up-close" title="关闭">' + I.x + '</button>' +
      '<div class="rank-up-kicker">' + esc(title) + '</div>' +
      '<div class="rank-up-emblem font-display" style="background:' + c + '">' + esc(cur.badge) + '</div>' +
      '<h2 class="font-display">' + esc(rankFullName(cur)) + '</h2>' +
      '<p class="rank-up-summary">已掌握 <b>' + cur.count + '</b> 词，本次新增 <b>' + up.gained + '</b> 词。</p>' +
      '<div class="rank-up-flow"><span>' + esc(rankFullName(up.from)) + '</span><b>→</b><span style="color:' + c + '">' + esc(rankFullName(cur)) + '</span></div>' +
      '<div class="rank-bar rank-up-bar"><span style="width:' + cur.pct + '%;background:' + c + '"></span></div>' +
      '<p class="rank-up-next">' + esc(next) + '</p>' +
      '<div class="rank-up-actions"><button class="btn-ghost" id="rank-up-guide">查看段位</button><button class="btn-pill" id="rank-up-continue">继续阅读</button></div>' +
      '</div></div>';
  }


  function reviewBookWords(id) {
    if (!id || id === 'all') return null;
    var custom = getCustomBook(id);
    if (custom) return custom.words || [];
    var idx = buildBookIndex();
    return idx[id] || [];
  }

  function reviewBookWordSet(id) {
    var words = reviewBookWords(id);
    if (!words) return null;
    var set = new Set();
    words.forEach(function (w) { set.add(String(w).toLowerCase()); });
    return set;
  }

  function reviewBookCount(id) {
    var set = reviewBookWordSet(id);
    if (!set) return state.vocabulary.length;
    var n = 0;
    state.vocabulary.forEach(function (v) { if (set.has(String(v.lemma).toLowerCase())) n++; });
    return n;
  }

  function reviewBookOptions() {
    var opts = [{ id: 'all', name: '全部生词', count: state.vocabulary.length }];
    state.customBooks.forEach(function (b) {
      var c = reviewBookCount(b.id);
      if (c > 0 || (b.words && b.words.length)) opts.push({ id: b.id, name: b.name || '未命名学习集', count: c });
    });
    BOOKS.forEach(function (b) {
      var c = reviewBookCount(b.tag);
      if (c > 0) opts.push({ id: b.tag, name: b.name, count: c });
    });
    return opts;
  }

  function currentReviewBookId() {
    var id = (state.stats && state.stats.reviewBook) || 'all';
    var ok = reviewBookOptions().some(function (o) { return o.id === id; });
    return ok ? id : 'all';
  }

  function studySetEntries(id) {
    var set = reviewBookWordSet(id || 'all');
    return state.vocabulary.filter(function (v) {
      return !set || set.has(String(v.lemma).toLowerCase());
    });
  }

  function studySetIds(id) {
    return studySetEntries(id).map(function (e) { return e.id; });
  }

  function studySetMasteredCount(id) {
    var set = reviewBookWordSet(id || 'all');
    if (!set) return state.known.length;
    var n = 0;
    state.known.forEach(function (w) { if (set.has(String(w).toLowerCase())) n++; });
    return n;
  }

  function currentStudySetOption(opts, selectedId) {
    opts = opts || reviewBookOptions();
    selectedId = selectedId || currentReviewBookId();
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].id === selectedId) return opts[i];
    }
    return opts[0] || { id: 'all', name: '全部生词', count: 0 };
  }

  function renderStudySetSelect(opts, selectedId) {
    var html = '<div class="daily-filter"><label class="font-cjk" for="review-book-select">学习集</label>' +
      '<select class="sort" id="review-book-select">';
    opts.forEach(function (o) {
      html += '<option value="' + esc(o.id) + '"' + (o.id === selectedId ? ' selected' : '') + '>' +
        esc(o.name) + '（' + o.count + '词）</option>';
    });
    html += '</select></div>';
    return html;
  }

  function renderStudySetComposer() {
    return '<div class="studyset-form">' +
      '<div class="studyset-form-head">' +
        '<div><div class="study-kicker font-cjk">新建学习集</div>' +
        '<h3 class="font-display">粘贴一组词，马上开始练</h3></div>' +
        '<button class="btn-ghost" id="study-set-cancel">' + I.x + '取消</button>' +
      '</div>' +
      '<input class="input-title font-display" id="study-set-name" placeholder="学习集名称，如 雅思错词 / 剑20 Test 1" value="' + esc(state.newStudySetName) + '">' +
      '<textarea class="compose font-reading" id="study-set-words" placeholder="每行一个单词，也可以用逗号分隔。创建后会自动加入生词库并选中这个学习集。">' + esc(state.newStudySetWords) + '</textarea>' +
      '<div class="row" style="justify-content:flex-end;margin-top:14px;gap:10px">' +
        '<button class="btn-ghost" id="study-set-cancel-2">取消</button>' +
        '<button class="btn-pill" id="study-set-create"' + (parseWordList(state.newStudySetWords).length ? '' : ' disabled') + '>' + I.check + '创建学习集</button>' +
      '</div></div>';
  }

  function modeIcon(id) {
    return '<span class="mode-icon mi-' + esc(id) + '" aria-hidden="true"></span>';
  }

  function modeLabel(mode) {
    for (var i = 0; i < MODES.length; i++) {
      if (MODES[i].id === mode) return MODES[i].title;
    }
    return mode === 'match' ? '配对' : '复习';
  }

  function renderReviewHeader(title, sub, actions) {
    return '<div class="review-set-header">' +
      '<div class="review-title-block"><div class="review-eyebrow font-cjk">复习</div>' +
        '<h2 class="font-display">' + esc(title) + '</h2>' +
        (sub ? '<p class="font-cjk">' + sub + '</p>' : '') +
      '</div>' +
      '<div class="review-top-actions">' + (actions || '') + '</div>' +
      '</div>';
  }

  function renderReview() {
    var r = state.review;
    if (r) {
      if (r.mode === 'match') return renderMatch();
      while (r.idx < r.queue.length && !curEntry()) r.idx++;
      return (r.idx >= r.queue.length) ? reviewDone() : reviewCard();
    }
    if (state.reviewView === 'stats') return renderStats();

    var nL = state.vocabulary.length;
    var reviewBookOpts = reviewBookOptions();
    var reviewBookId = currentReviewBookId();
    var selectedBook = currentStudySetOption(reviewBookOpts, reviewBookId);
    reviewBookId = selectedBook.id || 'all';
    var setIds = studySetIds(reviewBookId);
    var due = dueIds(reviewBookId).length;
    var masteredInSet = studySetMasteredCount(reviewBookId);
    var bookLabel = selectedBook ? selectedBook.name : '全部生词';
    var goal = (state.stats && state.stats.goal) || 20;
    var done = todayCount();
    var ring = Math.max(0, Math.min(100, Math.round(done / Math.max(1, goal) * 100)));
    var streak = (state.stats && state.stats.streak) || 0;
    var startCount = due || setIds.length;
    var cue = due > 0 ? ('今天到期 ' + due + ' 词，优先按记忆进度推进。') : '今天没有到期词，可以自由练习这一组。';
    var rank = masteryRank();
    var actions = '<button class="review-action-btn" id="study-set-new">' + I.plus + '新建学习集</button>' +
      '<button class="review-action-btn" id="rev-stats">' + I.sparkles + '学习记录</button>';
    var out = '<div class="review-app-shell"><div class="review-stage">';
    out += renderReviewHeader(nL ? bookLabel : '复习', nL ? ('学习中 ' + setIds.length + ' 词 · 已掌握 ' + masteredInSet + ' 词 · 连续 ' + streak + ' 天') : '创建学习集，或在阅读时点词加入生词库。', actions);
    if (state.composingStudySet) {
      out += renderStudySetComposer() + '</div></div>';
      return out;
    }
    if (!nL) {
      out += '<div class="review-empty-panel"><div class="circle">' + I.sparkles + '</div>' +
        '<h3 class="font-display">还没有可复习的词</h3>' +
        '<p class="font-cjk">先去阅读点词，或直接新建一个学习集。</p></div></div></div>';
      return out;
    }

    out += '<div class="review-set-tools">' +
      renderStudySetSelect(reviewBookOpts, reviewBookId) +
      '<div class="review-stat-pills">' +
        '<span>今日 ' + done + ' / ' + goal + '</span>' +
        '<span>待学习 ' + due + '</span>' +
        '<span>' + esc(rank.code) + '</span>' +
      '</div></div>';

    out += '<div class="mode-grid">';
    MODES.forEach(function (m) {
      out += '<button class="mode-card" data-mode="' + m.id + '">' +
        modeIcon(m.id) +
        '<span class="mc-copy"><span class="mc-title font-display">' + m.title + '</span>' +
        '<span class="mc-desc font-cjk">' + m.desc + '</span></span></button>';
    });
    out += '</div>';
    var preview = studySetEntries(reviewBookId)[0] || null;
    var previewWord = preview ? preview.lemma : '已掌握';
    out += '<button class="study-preview-card" data-mode="flash">' +
      '<span class="study-preview-top"><span class="font-cjk">显示提示</span>' +
        '<span class="font-cjk">' + esc(cue) + '</span></span>' +
      '<span class="study-preview-word font-display">' + esc(previewWord) + '</span>' +
      '<span class="study-preview-shortcuts font-cjk"><b>快捷键</b><span>按</span><kbd>空格键</kbd><span>或单击卡片以翻页</span></span>' +
      '</button>';
    out += '<div class="review-bottom-bar">' +
      '<div class="track-chip font-cjk"><span>跟踪进度</span><span class="fake-toggle"><i style="width:' + ring + '%"></i></span></div>' +
      '<div class="review-mark-actions">' +
        '<button class="review-round bad" data-mode="flash" title="单词卡">×</button>' +
        '<span class="review-count font-mono">' + done + ' / ' + Math.max(goal, startCount) + '</span>' +
        '<button class="review-round good" id="start-today" title="继续学习">✓</button>' +
      '</div>' +
      '<div class="review-mini-actions"><button id="rev-stats-mini" title="学习记录">↻</button><button id="study-set-new-mini" title="新建学习集">＋</button></div>' +
      '</div>';
    out += '</div></div>';
    return out;
  }

  // ---------- 学习统计面板 ----------
  function renderStats() {
    var s = state.stats || defaultStats();
    var due = dueIds().length;
    var nL = state.vocabulary.length, nK = state.known.length;
    var goal = s.goal || 20, done = todayCount();
    var rank = masteryRank();

    var out = '<div class="wrap" style="padding-top:32px;padding-bottom:40px">' +
      '<div class="row between" style="margin-bottom:20px">' +
        '<button class="btn-ghost" id="stats-back">' + I.arrowLeft + '返回</button>' +
        '<h2 class="page-title font-display" style="margin:0;font-size:22px">学习统计</h2>' +
        '<span style="width:60px"></span>' +
      '</div>';

    // 数字卡
    out += '<div class="stat-grid">' +
      statTile('🔥 ' + (s.streak || 0), '连续天数') +
      statTile(done + ' / ' + goal, '今日学习') +
      statTile('' + due, '待学习') +
      statTile('' + nK, '已掌握') +
      statTile('' + nL, '学习中') +
      statTile(rank.code, rank.game ? '瓦罗兰特段位' : '水平 · ' + rank.name) +
      statTile('' + totalReviews(), '累计练习') +
      '</div>';

    // 每日目标
    out += '<div class="goal-row"><span class="font-cjk">每日目标</span>' +
      '<div class="goal-ctrl"><button class="goal-btn" id="goal-dec">−</button>' +
      '<span class="goal-val font-display">' + goal + '</span>' +
      '<button class="goal-btn" id="goal-inc">+</button></div></div>';

    // 热力图（近 12 周）
    out += '<h3 class="font-display" style="font-size:15px;margin:24px 0 10px;color:var(--inkSoft)">最近 12 周</h3>';
    out += renderHeatmap();

    // 近 7 天正确率
    out += '<h3 class="font-display" style="font-size:15px;margin:24px 0 10px;color:var(--inkSoft)">近 7 天</h3>';
    out += renderWeekBars();

    out += '</div>';
    return out;
  }
  function statTile(big, label) {
    return '<div class="stat-tile"><div class="st-num font-display">' + big + '</div><div class="st-lab font-cjk">' + label + '</div></div>';
  }
  function totalReviews() {
    var s = state.stats; if (!s || !s.days) return 0;
    var n = 0; Object.keys(s.days).forEach(function (k) { n += (s.days[k].r || 0); });
    return n;
  }
  function renderHeatmap() {
    var s = state.stats || defaultStats();
    var days = s.days || {};
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var startDow = today.getDay(); // 今天是周几（让最后一列含今天）
    var weeks = 12, cols = [];
    // 从 (weeks*7 - 1 - startDow) 天前开始，对齐到周日列首
    var startOffset = (weeks - 1) * 7 + startDow;
    var html = '<div class="heat">';
    for (var c = 0; c < weeks; c++) {
      html += '<div class="heat-col">';
      for (var d = 0; d < 7; d++) {
        var offset = startOffset - (c * 7 + d);
        if (offset < 0) { html += '<span class="heat-cell empty"></span>'; continue; }
        var ts = today.getTime() - offset * DAY_MS;
        var key = dayStr(ts);
        var cnt = days[key] ? days[key].r : 0;
        var lv = cnt === 0 ? 0 : cnt < 5 ? 1 : cnt < 15 ? 2 : cnt < 30 ? 3 : 4;
        html += '<span class="heat-cell l' + lv + (offset === 0 ? ' today' : '') + '" title="' + key + '：' + cnt + ' 词"></span>';
      }
      html += '</div>';
    }
    html += '</div>';
    html += '<div class="heat-legend font-mono"><span>少</span>' +
      '<span class="heat-cell l0"></span><span class="heat-cell l1"></span><span class="heat-cell l2"></span><span class="heat-cell l3"></span><span class="heat-cell l4"></span>' +
      '<span>多</span></div>';
    return html;
  }
  function renderWeekBars() {
    var s = state.stats || defaultStats(), days = s.days || {};
    var out = '<div class="weekbars">';
    for (var i = 6; i >= 0; i--) {
      var ts = Date.now() - i * DAY_MS, key = dayStr(ts);
      var d = days[key] || { r: 0, c: 0 };
      var acc = d.r ? Math.round(d.c / d.r * 100) : 0;
      var label = ['日', '一', '二', '三', '四', '五', '六'][new Date(ts).getDay()];
      out += '<div class="wb-col"><div class="wb-track"><div class="wb-fill" style="height:' + (d.r ? Math.max(6, acc) : 0) + '%"></div></div>' +
        '<div class="wb-acc font-mono">' + (d.r ? acc + '%' : '–') + '</div>' +
        '<div class="wb-day font-cjk">' + label + '</div></div>';
    }
    out += '</div>';
    return out;
  }

  // ---------- 学习卡片（翻卡 / 选择题 / 挖空 / 书写） ----------
  function reviewCard() {
    var r = state.review, e = curEntry();
    var inf = enrich(e.lemma, e);
    var ctx = (e.contexts && e.contexts[0]) ? e.contexts[0] : null;
    var pct = Math.round(r.idx / Math.max(1, r.queue.length) * 100);
    var spk = TTS_OK ? '<button class="pop-spk" id="speak-review" title="朗读">' + I.volume + '</button>' : '';

    var out = '<div class="review-app-shell review-live"><div class="review-stage">' +
      renderReviewHeader(modeLabel(r.mode), '剩余 ' + (r.queue.length - r.idx) + ' · ' + r.idx + ' / ' + r.queue.length,
        '<button class="review-action-btn" id="exit-review">' + I.arrowLeft + '退出</button>') +
      '<div class="rev-progress"><div style="width:' + pct + '%"></div></div>';

    out += '<div class="rev-card' + (r.mode === 'flash' && r.phase === 'back' ? ' flip-in' : '') + '">';

    if (r.mode === 'flash') {
      out += '<div class="rev-word-row"><span class="rev-word font-display">' + esc(e.lemma) + '</span>' + spk + '</div>';
      if (ctx) out += '<p class="rev-ctx font-reading">' + highlightInSentence(ctx.sentence, ctx.surface) + '</p>';
      if (r.phase === 'front') {
        out += '<div class="rev-actions"><button class="btn-pill" id="flip" style="padding:11px 26px">显示释义</button></div>' +
          '<p class="font-cjk" style="color:var(--inkMuted);font-size:12px;margin-top:14px">先回想一下意思，再翻面核对</p>';
      } else {
        out += '<div class="rev-reveal">' +
          (inf.phon ? '<span class="pop-phon font-mono">/' + esc(inf.phon) + '/</span> ' : '') +
          (inf.pos ? '<span class="pos-tag font-cjk">' + esc(inf.pos) + '</span>' : '') +
          '<p class="rev-trans font-cjk">' + (inf.translation ? esc(inf.translation) : '（无释义）') + '</p></div>' +
          '<div class="rev-rate">' +
            '<button class="rate-btn bad" id="flash-keep">不认识</button>' +
            '<button class="rate-btn good" id="flash-know">认识</button>' +
          '</div>';
      }
    } else if (r.questionKind === 'write') {
      var clue = ctx && ctx.sentence ? ctx.sentence.replace(new RegExp(escapeReg(ctx.surface || e.lemma), 'i'), '＿＿＿＿') : '';
      var typed = r.typed || '';
      var okWrite = r.writeChecked && writeAnswerOk(r, e);
      out += '<p class="rev-prompt font-cjk">根据释义写出这个单词</p>' +
        '<p class="write-sense font-cjk">' + esc(shortSense(inf.translation) || '（无释义）') + '</p>' +
        (clue ? '<p class="rev-ctx font-reading">' + esc(clue) + '</p>' : '') +
        '<div class="write-box">' +
          '<input class="write-input font-display" id="write-answer" value="' + esc(typed) + '" placeholder="type the word" autocomplete="off" autocapitalize="none" spellcheck="false"' + (r.writeChecked ? ' disabled' : '') + '>' +
        '</div>';
      if (r.writeChecked) {
        out += '<div class="write-result ' + (okWrite ? 'ok' : 'bad') + ' font-cjk">' +
          (okWrite ? '拼写正确' : '正确答案：<b class="font-display">' + esc(writeAnswerLabel(e)) + '</b>') +
          '</div>' +
          '<div class="rev-actions"><button class="btn-pill" id="write-next" style="padding:11px 26px">继续</button></div>';
      } else {
        out += '<div class="rev-actions"><button class="btn-pill" id="write-check" style="padding:11px 26px">检查</button></div>';
      }
    } else { // 题目模式：选择 / 例句挖空
      var ch = r.choices;
      if (ch.kind === 'cloze') {
        out += '<p class="rev-prompt font-cjk">选出空格处的单词</p>' +
          '<p class="rev-ctx font-reading">' + esc(ch.sentence) + '</p>';
      } else {
        out += '<div class="rev-word-row"><span class="rev-word font-display">' + esc(e.lemma) + '</span>' + spk + '</div>';
        if (ctx) out += '<p class="rev-ctx font-reading">' + highlightInSentence(ctx.sentence, ctx.surface) + '</p>';
        out += '<p class="rev-prompt font-cjk">选出正确的释义</p>';
      }
      out += '<div class="rev-choices">';
      ch.options.forEach(function (op, i) {
        var cls = 'choice';
        if (r.picked !== null) {
          if (i === ch.correctIdx) cls += ' correct';
          else if (i === r.picked) cls += ' wrong';
          else cls += ' dim';
        }
        out += '<button class="' + cls + ' font-cjk" data-choice="' + i + '"' + (r.picked !== null ? ' disabled' : '') + '>' + esc(op) + '</button>';
      });
      out += '</div>';
      if (r.picked !== null) {
        var ok = r.picked === ch.correctIdx;
        out += '<div class="rev-actions"><button class="btn-pill" id="mc-next" style="padding:11px 26px">' +
          (ok ? '答对了 · 继续' : '正确答案已标出 · 继续') + '</button></div>';
      }
    }

    out += '</div></div></div>';
    return out;
  }

  // ---------- 配对游戏 ----------
  function renderMatch() {
    var r = state.review;
    if (r.matched >= r.pairs) {
      return '<div class="review-app-shell review-live"><div class="review-stage">' +
        '<div class="review-empty-panel"><div class="circle">' + I.check + '</div>' +
        '<h3 class="font-display">配对完成</h3>' +
        '<p class="font-cjk">' + r.pairs + ' 组　·　用了 ' + r.moves + ' 步</p>' +
        '<div class="row" style="justify-content:center;gap:10px">' +
          '<button class="review-action-btn primary" id="match-again">再来一组</button>' +
          '<button class="review-action-btn" id="exit-review">返回</button></div></div></div></div>';
    }
    var out = '<div class="review-app-shell review-live"><div class="review-stage">' +
      renderReviewHeader('配对', '配对 ' + r.matched + ' / ' + r.pairs,
        '<button class="review-action-btn" id="exit-review">' + I.arrowLeft + '退出</button>') +
      '<p class="rev-prompt font-cjk" style="text-align:center;margin-top:8px">点一个单词，再点它的释义</p>' +
      '<div class="match-grid">';
    r.tiles.forEach(function (t, i) {
      var cls = 'match-tile ' + (t.kind === 'w' ? 'tw' : 'tm');
      if (t.matched) cls += ' matched';
      else if (i === r.firstIdx) cls += ' sel';
      else if (r.wrong && r.wrong.indexOf(i) >= 0) cls += ' wrong';
      out += '<button class="' + cls + ' font-cjk" data-tile="' + i + '"' + (t.matched ? ' disabled' : '') + '>' + esc(t.text) + '</button>';
    });
    out += '</div></div></div>';
    return out;
  }

  function reviewDone() {
    var r = state.review;
    var summary = (r.mode === 'flash')
      ? '认识并移出 ' + r.stats.graduated + ' 词　·　还需再练 ' + r.stats.stillLearning + ' 词'
      : '答对 ' + r.stats.correct + ' / ' + r.stats.answered + ' 题';
    return '<div class="review-app-shell review-live"><div class="review-stage">' +
      '<div class="review-empty-panel"><div class="circle">' + I.check + '</div>' +
      '<h3 class="font-display">学习完成</h3>' +
      '<p class="font-cjk">' + summary + '</p>' +
      '<button class="review-action-btn primary" id="exit-review">返回</button></div></div></div>';
  }

  function emptyState(icon, title, sub, actionLabel, actionId) {
    return '<div class="empty"><div class="circle">' + icon + '</div>' +
      '<h3 class="font-display">' + title + '</h3><p class="font-cjk">' + sub + '</p>' +
      (actionLabel ? '<button class="btn-pill" id="' + actionId + '">' + actionLabel + '</button>' : '') + '</div>';
  }

  // 浮窗定位：贴在所点单词附近，自动避让屏幕边缘
  function popoverStyle(rect) {
    var W = 300, MAXH = 330, GAP = 8;
    var vw = window.innerWidth, vh = window.innerHeight;
    var r = rect || { left: vw / 2 - W / 2, right: vw / 2, top: vh / 2, bottom: vh / 2 };
    var left = Math.max(GAP, Math.min(r.left, vw - W - GAP));
    var below = (r.bottom + MAXH + GAP <= vh) || (r.top - MAXH - GAP < GAP);
    if (below) return 'left:' + left + 'px;top:' + (r.bottom + GAP) + 'px;';
    return 'left:' + left + 'px;bottom:' + (vh - r.top + GAP) + 'px;';
  }

  // 把整段释义拆成"义项"：先按换行，单行再按分号拆
  function senseLines(trans) {
    var t = String(trans || '').trim();
    var lines = t.split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (lines.length <= 1) lines = t.split(/[;；]/).map(function (s) { return s.trim(); }).filter(Boolean);
    return lines;
  }
  // 取义项开头的词性标记 → 大类 n/v/adj/adv
  function leadPosClass(line) {
    var m = line.match(/^\s*(n|vt|vi|v|adj|adv|ad|a|prep|conj|pron|num|art|int|aux|abbr)\b\.?/i);
    if (!m) return '';
    var p = m[1].toLowerCase();
    if (p === 'n') return 'n';
    if (p === 'v' || p === 'vt' || p === 'vi' || p === 'aux') return 'v';
    if (p === 'adj' || p === 'a') return 'adj';
    if (p === 'adv' || p === 'ad') return 'adv';
    return '';
  }
  // 据句子里词的位置猜词性（离线启发式，主攻名/动）
  var DET_WORDS = { the: 1, a: 1, an: 1, this: 1, that: 1, these: 1, those: 1, his: 1, her: 1, my: 1, your: 1, its: 1, their: 1, our: 1, some: 1, any: 1, no: 1, every: 1, each: 1, another: 1, one: 1 };
  var TOVERB_WORDS = { to: 1, will: 1, would: 1, can: 1, could: 1, shall: 1, should: 1, may: 1, might: 1, must: 1, do: 1, does: 1, did: 1, let: 1, please: 1, don: 1 };
  var SUBJ_WORDS = { i: 1, you: 1, we: 1, they: 1, he: 1, she: 1, it: 1 };
  function guessContextPos(sentence, surface) {
    var low = String(surface).toLowerCase();
    if (/ly$/.test(low) && low.length > 4) return 'adv';
    if (!sentence) return '';
    var words = sentence.split(/\s+/);
    var idx = -1;
    for (var i = 0; i < words.length; i++) {
      if (words[i].replace(/[^a-zA-Z'’\-]/g, '').toLowerCase() === low) { idx = i; break; }
    }
    if (idx < 0) return '';
    var prev = idx > 0 ? words[idx - 1].replace(/[^a-zA-Z'’\-]/g, '').toLowerCase() : '';
    if (DET_WORDS[prev]) return 'n';
    if (TOVERB_WORDS[prev]) return 'v';
    if (SUBJ_WORDS[prev]) return 'v';
    return '';
  }
  // 选出与上下文词性匹配的"主释义"，其余归入 rest
  function conciseTrans(trans, ctxPos) {
    var lines = senseLines(trans);
    if (lines.length <= 1) return { primary: lines[0] || '', rest: [] };
    var pick = -1;
    if (ctxPos) {
      for (var i = 0; i < lines.length; i++) { if (leadPosClass(lines[i]) === ctxPos) { pick = i; break; } }
    }
    if (pick < 0) pick = 0;
    var rest = [];
    for (var j = 0; j < lines.length; j++) { if (j !== pick) rest.push(lines[j]); }
    return { primary: lines[pick], rest: rest };
  }

  function renderPanel() {
    var sel = state.selected, lk = state.lookup || {};
    var d = lk.data || {};
    var spk = TTS_OK ? '<button class="pop-spk" id="speak-word" title="朗读">' + I.volume + '</button>' : '';
    var diffLemma = d.lemma && d.lemma.toLowerCase() !== sel.surface.toLowerCase();

    var html = '<div class="popover" id="popover" style="' + popoverStyle(sel.rect) + '">';
    html += '<div class="pop-head"><div><span class="pop-word font-display">' + esc(sel.surface) + '</span>' +
      (diffLemma ? '<span class="pop-lemma font-display">· ' + esc(d.lemma) + '</span>' : '') + '</div>' + spk + '</div>';

    var meta = [];
    if (d.phon) meta.push('<span class="pop-phon font-mono">/' + esc(d.phon) + '/</span>');
    if (d.pos) meta.push('<span class="pos-tag font-cjk">' + esc(d.pos) + '</span>');
    if (meta.length) html += '<div class="pop-meta">' + meta.join('') + '</div>';

    if (d.translation) {
      var ct = conciseTrans(d.translation, guessContextPos(sel.sentence, sel.surface));
      html += '<div class="pop-trans font-cjk">' + esc(ct.primary);
      if (ct.rest.length) {
        if (state.transExpanded) {
          html += '<div class="pop-trans-rest">' + ct.rest.map(function (l) { return esc(l); }).join('<br>') + '</div>' +
            '<button class="pop-more" id="trans-toggle">收起</button>';
        } else {
          html += ' <button class="pop-more" id="trans-toggle">+' + ct.rest.length + ' 更多</button>';
        }
      }
      html += '</div>';
    } else {
      html += '<div class="pop-trans font-cjk"><span style="color:var(--inkMuted)">（无释义）</span></div>';
    }

    html += '<div class="pop-foot">';
    if (sel.status === 'known') {
      html += '<button class="pop-btn ghost font-display" id="demote">' + I.bookMarked + ' 移回生词</button>';
    } else if (sel.status === 'green') {
      html += '<button class="pop-btn ghost font-display" id="mark-known">' + I.check + ' 已掌握</button>';
    } else { // 新词：主=加入生词，次=已掌握
      html += '<button class="pop-btn green font-display" id="add-learning">' + I.sparkles + ' 加入生词</button>' +
        '<button class="pop-btn ghost small font-display" id="mark-known">' + I.check + ' 我已掌握</button>';
    }
    html += '</div></div>';
    return html;
  }

  // ---------- 交互逻辑 ----------
  function handleWordClick(surface, si, rect) {
    commitNewIfPending(); // 切换到新词前，先把上一个未处理的新词存为生词
    var sentence = RENDER_SENTENCES[si] || '';
    var st = wordStatus(surface, savedFormsSet(), knownSet());
    var rc = rect ? { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom } : null;
    state.selected = { surface: surface, sentence: sentence, si: si, status: st, handled: false, rect: rc };
    state.transExpanded = false; // 每次点新词默认收起多余义项

    // 释义：已在生词库的优先用已存数据，否则查词典
    var sl = surface.toLowerCase(), lem = resolveLemma(surface);
    var existing = state.vocabulary.find(function (v) {
      return v.lemma.toLowerCase() === sl || v.lemma.toLowerCase() === lem ||
        (v.forms || []).map(function (f) { return f.toLowerCase(); }).indexOf(sl) >= 0;
    });
    if (existing) {
      state.lookup = { loading: false, error: null, data: {
        lemma: existing.lemma, phon: existing.phon, pos: existing.pos,
        translation: existing.translation, definition_en: existing.definition_en
      } };
    } else {
      var r = lookupWord(surface);
      if (r) {
        state.lookup = { loading: false, error: null, data: {
          lemma: r.lemma, phon: r.entry.phon, pos: r.entry.pos, translation: r.entry.trans, definition_en: ''
        } };
      } else {
        state.lookup = { loading: false, error: null, data: {
          lemma: lem, phon: '', pos: '',
          translation: '（词典中未找到，可能是专有名词、缩写或拼写变体）', definition_en: ''
        } };
      }
    }
    if (state.autoSpeak) speak((state.lookup.data && state.lookup.data.lemma) || surface);
    render();
  }

  // 把当前「新词」存为生词（绿色）。用于关闭面板/切词时的自动归类。
  function addGreen(sel, d) {
    if (!sel || !d) return;
    var lemma = d.lemma || sel.surface;
    var idx = state.vocabulary.findIndex(function (v) { return v.lemma.toLowerCase() === lemma.toLowerCase(); });
    if (idx >= 0) {
      var entry = Object.assign({}, state.vocabulary[idx]);
      var forms = new Set(entry.forms || []); forms.add(sel.surface); entry.forms = Array.from(forms);
      entry.contexts = (entry.contexts || []).concat([{ sentence: sel.sentence, surface: sel.surface, at: Date.now() }]);
      state.vocabulary[idx] = entry;
    } else {
      state.vocabulary.unshift({
        id: 'vocab_' + Date.now(), lemma: lemma,
        translation: d.translation || '', pos: d.pos || '', phon: d.phon || '',
        definition_en: d.definition_en || '',
        forms: [sel.surface],
        contexts: [{ sentence: sel.sentence, surface: sel.surface, at: Date.now() }],
        createdAt: Date.now(),
        misses: 0
      });
    }
    saveVocab();
  }

  function commitNewIfPending() {
    var sel = state.selected;
    if (sel && sel.status === 'new' && !sel.handled) {
      addGreen(sel, state.lookup && state.lookup.data);
      sel.handled = true;
    }
  }

  function lemmaOf(sel) {
    var d = state.lookup && state.lookup.data;
    return ((d && d.lemma) || resolveLemma(sel.surface)).toLowerCase();
  }

  // 加入生词（绿色）：显式存为生词并关闭
  function markLearning() {
    var sel = state.selected; if (!sel) return;
    addGreen(sel, state.lookup && state.lookup.data);
    sel.handled = true;
    state.selected = null; state.lookup = null; render();
  }

  // 标为已掌握：移出生词库、加入已掌握集合（无色）
  function markKnown() {
    var sel = state.selected; if (!sel) return;
    var lemma = lemmaOf(sel);
    var beforeRankCount = state.known.length;
    state.vocabulary = state.vocabulary.filter(function (v) { return v.lemma.toLowerCase() !== lemma; });
    if (state.known.map(function (l) { return String(l).toLowerCase(); }).indexOf(lemma) < 0) state.known.push(lemma);
    sel.handled = true;
    saveVocab(); saveKnown();
    maybeShowRankUp(beforeRankCount);
    state.selected = null; state.lookup = null; render();
  }

  // 移回生词：从已掌握集合移除、重新加入生词库（绿色）
  function demoteToLearning() {
    var sel = state.selected; if (!sel) return;
    var lemma = lemmaOf(sel);
    state.known = state.known.filter(function (l) { return String(l).toLowerCase() !== lemma; });
    addGreen(sel, state.lookup && state.lookup.data);
    sel.handled = true;
    saveKnown();
    state.selected = null; state.lookup = null; render();
  }

  function closePanel() { commitNewIfPending(); state.selected = null; state.lookup = null; render(); }

  // ---------- 词汇库管理 ----------
  function makeVocabFromLemma(lemma) {
    var e = DICT.get(String(lemma).toLowerCase());
    return {
      id: 'vocab_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6), lemma: String(lemma),
      translation: e ? e.trans : '', pos: e ? e.pos : '', phon: e ? e.phon : '', definition_en: '',
      forms: [String(lemma)], contexts: [], createdAt: Date.now(), misses: 0
    };
  }
  // 生词 → 已掌握（按原形）
  function graduateLemma(lemma, opts) {
    var ll = String(lemma).toLowerCase();
    var beforeRankCount = state.known.length;
    var added = false;
    state.vocabulary = state.vocabulary.filter(function (v) { return v.lemma.toLowerCase() !== ll; });
    if (state.known.map(function (l) { return String(l).toLowerCase(); }).indexOf(ll) < 0) {
      state.known.push(ll);
      added = true;
    }
    if (added && !(opts && opts.silentRankUp)) maybeShowRankUp(beforeRankCount);
  }
  // 已掌握 → 生词
  function knownToLearning(lemma) {
    var ll = String(lemma).toLowerCase();
    state.known = state.known.filter(function (l) { return String(l).toLowerCase() !== ll; });
    if (!state.vocabulary.some(function (v) { return v.lemma.toLowerCase() === ll; })) {
      state.vocabulary.unshift(makeVocabFromLemma(lemma));
    }
  }
  function clearSel() { state.vocabSel = {}; }

  // 手动添加生词（从词典取释义；查不到也允许添加）
  function addManualWord(text) {
    var raw = (text || '').trim();
    if (!raw) return;
    var word = raw.toLowerCase();
    var lemma = resolveLemma(word);
    // 已存在？
    if (state.vocabulary.some(function (v) { return v.lemma.toLowerCase() === lemma; })) {
      alert('「' + lemma + '」已在生词库里了。'); return;
    }
    if (state.known.map(function (l) { return String(l).toLowerCase(); }).indexOf(lemma) >= 0) {
      if (!confirm('「' + lemma + '」在已掌握里。要移回生词库吗？')) return;
      knownToLearning(lemma); saveVocab(); saveKnown();
      state.vocabSearch = ''; render(); return;
    }
    var e = DICT.get(lemma) || DICT.get(word);
    state.vocabulary.unshift({
      id: 'vocab_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      lemma: e ? e.w.toLowerCase() : lemma,
      translation: e ? e.trans : '', pos: e ? e.pos : '', phon: e ? e.phon : '', definition_en: '',
      forms: [word], contexts: [], createdAt: Date.now(), misses: 0
    });
    state.vocabSearch = '';
    saveVocab();
    if (!e) setTimeout(function () { alert('已添加「' + lemma + '」（词典中未找到释义，可稍后自行核对）。'); }, 0);
    render();
  }

  function bulkAction(type) {
    if (type === 'clear') { clearSel(); render(); return; }
    if (type === 'review') { reviewSelected('learn'); return; }
    var keys = Object.keys(state.vocabSel).filter(function (k) { return state.vocabSel[k]; });
    var beforeRankCount = state.known.length;
    keys.forEach(function (k) {
      if (k.indexOf('known:') === 0) {
        var lemma = k.slice(6);
        if (type === 'tolearn') knownToLearning(lemma);
        else if (type === 'delete') state.known = state.known.filter(function (l) { return String(l).toLowerCase() !== lemma; });
      } else {
        var entry = state.vocabulary.find(function (v) { return v.id === k; });
        if (type === 'graduate') { if (entry) graduateLemma(entry.lemma, { silentRankUp: true }); }
        else if (type === 'delete') state.vocabulary = state.vocabulary.filter(function (v) { return v.id !== k; });
      }
    });
    clearSel();
    if (type === 'graduate') maybeShowRankUp(beforeRankCount);
    saveVocab(); saveKnown(); render();
  }

  // 搜索时整页重渲染并保持搜索框焦点
  function reRenderVocabList() {
    render();
    var el = document.getElementById('vsearch');
    if (el) { el.focus(); var v = el.value; el.setSelectionRange(v.length, v.length); }
  }

  // ---------- 导入文件（txt / pdf / epub） ----------
  var _scripts = {};
  function loadScript(url) {
    if (_scripts[url]) return _scripts[url];
    _scripts[url] = new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = url; s.onload = res; s.onerror = function () { delete _scripts[url]; rej(new Error('缺少本地解析库：' + url)); };
      document.head.appendChild(s);
    });
    return _scripts[url];
  }
  function normalizeZipPath(base, href) {
    href = decodeURIComponent(String(href || '').split('#')[0]);
    if (!href) return '';
    var stack = String(base || '').split('/').filter(Boolean);
    href.split('/').forEach(function (part) {
      if (!part || part === '.') return;
      if (part === '..') stack.pop();
      else stack.push(part);
    });
    return stack.join('/');
  }
  function cleanImportedText(text) {
    return String(text || '')
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
  }
  // 用一组章节 [{title,text}] 直接建一本书并进入目录
  function buildBookFromChapters(bookTitle, chapters) {
    state.importing = null;
    var base = Date.now();
    chapters.forEach(function (c, i) {
      state.articles.unshift({
        id: 'art_' + (base + i),
        book: bookTitle,
        title: c.title || ('第 ' + (i + 1) + ' 章'),
        content: cleanImportedText(c.text),
        createdAt: base + i, // 升序保持章节顺序
        updatedAt: base + i
      });
    });
    saveArticles();
    state.currentBook = shelfNameForBook(bookTitle); state.currentArticleId = null; state.composing = false;
    render();
  }

  // 纯文本按"章节标题行"自动分章；找不到（<2 处）返回 null
  function splitTxtChapters(text) {
    var lines = String(text).replace(/\r\n/g, '\n').split('\n');
    // 中文：第N章/回/节/卷/部/篇/集；英文：Chapter/Part/Book + 数字/罗马数字/英文数词；独立的序章/楔子/前言等
    var cnRe = /^第\s*[0-9零一二三四五六七八九十百千两壹贰叁肆伍陆柒捌玖拾]+\s*[章回节卷部篇集]/;
    var enRe = /^(chapter|part|book|section)\s+([0-9]+|[ivxlcdm]+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty)\b/i;
    var spRe = /^(prologue|epilogue|foreword|preface|introduction|序章|楔子|序言|前言|引子|后记|尾声|番外)\s*$/i;
    function isHead(ln) { return ln.length <= 40 && (cnRe.test(ln) || enRe.test(ln) || spRe.test(ln)); }

    var marks = [];
    for (var i = 0; i < lines.length; i++) {
      var ln = lines[i].trim();
      if (ln) { if (isHead(ln)) marks.push(i); }
    }
    if (marks.length < 2) return null;

    var chapters = [];
    var pre = lines.slice(0, marks[0]).join('\n').trim();
    if (pre.replace(/\s/g, '').length > 30) chapters.push({ title: '前言', text: pre });
    for (var m = 0; m < marks.length; m++) {
      var start = marks[m];
      var end = m + 1 < marks.length ? marks[m + 1] : lines.length;
      var head = lines[start].trim();
      var body = lines.slice(start + 1, end).join('\n').trim();
      chapters.push({ title: head, text: body });
    }
    return chapters.length >= 2 ? chapters : null;
  }

  function importFile(file) {
    if (!file) return;
    var ext = (file.name.match(/\.(\w+)$/) || [])[1];
    ext = ext ? ext.toLowerCase() : '';
    if (ext === 'json') { importData(file); return; }
    var title = file.name.replace(/\.(txt|pdf|epub|json)$/i, '');
    var done = function (text) {
      state.importing = null;
      text = cleanImportedText(text);
      if (!text) { alert('没能从文件里提取到文本（可能是扫描版 PDF 或受保护文件）。'); render(); return; }
      // 已有内容则追加（继续导入/续写），否则作为新内容
      if (state.newContent.trim()) {
        state.newContent = state.newContent.replace(/\s+$/, '') + '\n\n' + text;
      } else {
        state.newContent = text;
        if (!state.newTitle) state.newTitle = title;
      }
      state.composing = true;
      render();
    };
    var fail = function (err) { state.importing = null; alert('导入失败：' + (err && err.message ? err.message : err)); render(); };

    if (ext === 'txt') {
      state.importing = '正在读取 TXT…'; render();
      file.text().then(function (text) {
        // 续导入 → 直接追加；否则尝试自动分章
        if (state.composing && state.newContent.trim()) { done(text); return; }
        var chs = splitTxtChapters(text);
        if (chs && chs.length >= 2) { buildBookFromChapters(title, chs); return; }
        done(text);
      }).catch(fail);
    } else if (ext === 'pdf') {
      state.importing = '正在解析 PDF…'; render();
      extractPdf(file).then(done).catch(fail);
    } else if (ext === 'epub') {
      state.importing = '正在解析 EPUB…'; render();
      extractEpub(file).then(function (chapters) {
        // 续导入（compose 中已有内容）→ 合并为一段文本，沿用旧流程
        if (state.composing && state.newContent.trim()) {
          done(chapters.map(function (c) { return c.text; }).join('\n\n'));
          return;
        }
        if (!chapters.length) { done(''); return; }
        // 单章 → 当普通文章导入（进 compose 让用户填书名）
        if (chapters.length === 1) {
          if (!state.newBook) state.newBook = title;
          done(chapters[0].text);
          return;
        }
        buildBookFromChapters(title, chapters); // 多章 → 直接建一本书
      }).catch(fail);
    } else {
      alert('只支持 txt / pdf / epub / json 文件。');
    }
  }
  function extractPdf(file) {
    var PDFURL = 'vendor/pdf.min.js';
    var WORKER = 'vendor/pdf.worker.min.js';
    return loadScript(PDFURL).then(function () {
      if (!window.pdfjsLib) throw new Error('PDF 解析库没有正确加载');
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER;
      return file.arrayBuffer();
    }).then(function (buf) {
      return window.pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      var out = [];
      var chain = Promise.resolve();
      for (var i = 1; i <= pdf.numPages; i++) {
        (function (n) {
          chain = chain.then(function () { return pdf.getPage(n); })
            .then(function (page) { return page.getTextContent(); })
            .then(function (tc) { out.push(tc.items.map(function (it) { return it.str; }).join(' ')); });
        })(i);
      }
      return chain.then(function () { return out.join('\n\n'); });
    });
  }
  function extractEpub(file) {
    var JSZURL = 'vendor/jszip.min.js';
    var zip;
    return loadScript(JSZURL).then(function () { return file.arrayBuffer(); })
      .then(function (buf) { if (!window.JSZip) throw new Error('EPUB 解析库没有正确加载'); return buf; })
      .then(function (buf) { return window.JSZip.loadAsync(buf); })
      .then(function (z) { zip = z; return zip.file('META-INF/container.xml').async('string'); })
      .then(function (container) {
        var opfPath = (container.match(/full-path="([^"]+)"/) || [])[1];
        if (!opfPath || !zip.file(opfPath)) throw new Error('无法解析 EPUB 结构');
        var base = opfPath.indexOf('/') >= 0 ? opfPath.replace(/[^/]+$/, '') : '';
        return zip.file(opfPath).async('string').then(function (opf) {
          var doc = new DOMParser().parseFromString(opf, 'application/xml');
          var items = {};
          Array.prototype.forEach.call(doc.getElementsByTagName('item'), function (it) {
            items[it.getAttribute('id')] = { href: it.getAttribute('href'), type: it.getAttribute('media-type') || '', props: it.getAttribute('properties') || '' };
          });
          var spine = Array.prototype.map.call(doc.getElementsByTagName('itemref'), function (ir) { return ir.getAttribute('idref'); });
          var parts = [];
          var chain = Promise.resolve();
          spine.forEach(function (idref) {
            var it = items[idref];
            if (!it || !/html|xml/i.test(it.type)) return;
            var path = normalizeZipPath(base, it.href);
            var f = zip.file(path) || zip.file(base + it.href);
            if (!f) return;
            chain = chain.then(function () { return f.async('string'); }).then(function (html) {
              var b = new DOMParser().parseFromString(html, 'text/html');
              var got = [], heading = '';
              if (b.body) {
                Array.prototype.forEach.call(b.body.querySelectorAll('script,style,nav,aside,footer,header,svg,form,iframe,object,.footnote,.endnote,.note,[role="doc-noteref"],[role="doc-endnote"]'), function (el) {
                  if (el.parentNode) el.parentNode.removeChild(el);
                });
                var hEl = b.body.querySelector('h1,h2,h3');
                if (hEl) heading = hEl.textContent.replace(/\s+/g, ' ').trim();
                Array.prototype.forEach.call(b.body.querySelectorAll('p,h1,h2,h3,h4,h5,li,blockquote'), function (el) {
                  var t = el.textContent.replace(/\s+/g, ' ').trim(); if (t) got.push(t);
                });
                if (!got.length) { var tt = b.body.textContent.replace(/\s+/g, ' ').trim(); if (tt) got.push(tt); }
              }
              var text = cleanImportedText(got.join('\n\n'));
              if (text.replace(/\s/g, '').length >= 20) parts.push({ title: heading, text: text });
            });
          });
          return chain.then(function () { return parts; });
        });
      });
  }

  function createArticle() {
    if (!state.newContent.trim()) return;
    var book = state.newBook.trim() || '未分类';
    if (state.editingId) { // 保存编辑
      var a = state.articles.find(function (x) { return x.id === state.editingId; });
      if (a) { a.title = state.newTitle.trim() || '未命名章节'; a.content = state.newContent.trim(); a.book = book; a.updatedAt = Date.now(); }
      state.currentArticleId = state.editingId; state.currentBook = shelfNameForBook(book); state.articlePage = 0;
      state.editingId = null; state.composing = false; state.newTitle = ''; state.newContent = ''; state.newBook = '';
      saveArticles(); render(); return;
    }
    var art = { id: 'art_' + Date.now(), book: book, title: state.newTitle.trim() || '未命名章节', content: state.newContent.trim(), createdAt: Date.now(), updatedAt: Date.now() };
    state.articles.unshift(art);
    state.currentArticleId = art.id; state.currentBook = shelfNameForBook(book); state.composing = false;
    state.newTitle = ''; state.newContent = ''; state.newBook = '';
    saveArticles(); render();
  }
  function enterEdit(id) {
    var a = state.articles.find(function (x) { return x.id === id; });
    if (!a) return;
    state.editingId = id; state.composing = true;
    state.newTitle = a.title; state.newContent = a.content; state.newBook = a.book || '';
    render();
  }

  // ---------- 学习集练习 ----------
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function shortSense(t) {
    if (!t) return '';
    var s = String(t).split(/[\n;；]/)[0].replace(/^\s*\[[^\]]*\]\s*/, '').trim();
    return s.length > 22 ? s.slice(0, 22) + '…' : s;
  }

  // ---------- 日期 / 打卡统计 ----------
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function dayStr(ts) { var d = new Date(ts == null ? Date.now() : ts); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function todayStr() { return dayStr(Date.now()); }
  function defaultStats() { return { streak: 0, lastDay: '', goal: 20, reviewBook: 'all', days: {} }; }
  function endOfTodayTs() { var d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); }
  // 记一次学习：今日计数 + 连续天数 streak
  function recordStudy(ok) {
    if (!state.stats) state.stats = defaultStats();
    var t = todayStr();
    if (!state.stats.days[t]) state.stats.days[t] = { r: 0, c: 0 };
    state.stats.days[t].r++;
    if (ok) state.stats.days[t].c++;
    if (state.stats.lastDay !== t) {
      var y = dayStr(Date.now() - DAY_MS);
      state.stats.streak = (state.stats.lastDay === y) ? (state.stats.streak || 0) + 1 : 1;
      state.stats.lastDay = t;
    }
    saveStats();
  }
  function todayCount() { var d = state.stats && state.stats.days[todayStr()]; return d ? d.r : 0; }

  // ---------- 间隔重复（SRS） ----------
  function srsOf(v) { return (v && v.srs) ? v.srs : { level: 0, due: 0, last: 0, lapses: 0 }; }
  function compareDailyPriority(a, b) {
    var fa = dictFreq(a.lemma), fb = dictFreq(b.lemma);
    if (fa !== fb) return fa - fb;
    return (b.misses || 0) - (a.misses || 0) || (srsOf(a).due || 0) - (srsOf(b).due || 0);
  }
  // 今天（含之前）到期的生词；每日学习会把常见词排在前面
  function dueVocab(bookId) {
    var lim = endOfTodayTs();
    var set = reviewBookWordSet(bookId || 'all');
    return state.vocabulary.filter(function (v) {
      if ((srsOf(v).due || 0) > lim) return false;
      return !set || set.has(String(v.lemma).toLowerCase());
    }).sort(compareDailyPriority);
  }
  function dueIds(bookId) { return dueVocab(bookId).map(function (e) { return e.id; }); }
  // 判分并排下次学习；答对升级、到顶毕业；答错回 0 稍后再练。返回是否毕业
  function srsGrade(entryId, ok) {
    var idx = state.vocabulary.findIndex(function (v) { return v.id === entryId; });
    if (idx < 0) { recordStudy(ok); return false; }
    var v = state.vocabulary[idx];
    var s = { level: 0, due: 0, last: 0, lapses: 0 };
    if (v.srs) { s.level = v.srs.level || 0; s.due = v.srs.due || 0; s.lapses = v.srs.lapses || 0; }
    var now = Date.now();
    if (ok) {
      s.level = (s.level || 0) + 1;
      if (s.level >= SRS_MASTER) { // 毕业 → 已掌握
        graduateLemma(v.lemma); saveVocab(); saveKnown(); recordStudy(true); return true;
      }
      s.due = now + SRS_INTERVALS[s.level] * DAY_MS;
    } else {
      s.lapses = (s.lapses || 0) + 1;
      s.level = 0;
      s.due = now + 10 * 60 * 1000; // 10 分钟后（本轮稍后再练）
      v.misses = (v.misses || 0) + 1; v.lastWrongAt = now;
    }
    s.last = now;
    v.srs = s;
    saveVocab();
    recordStudy(ok);
    return false;
  }

  // ids：要学习的生词 id 列表；mode：flash / learn / write / test / match
  function startReview(ids, mode, opts) {
    if (!ids || !ids.length) return;
    var queue = (opts && opts.keepOrder) ? ids.slice() : shuffle(ids.slice());
    state.review = { mode: mode || 'flash', queue: queue, idx: 0, total: ids.length, phase: 'front', picked: null, choices: null,
      questionKind: null, typed: '', writeChecked: false, stats: { graduated: 0, stillLearning: 0, correct: 0, answered: 0 } };
    clearSel();
    state.tab = 'review';
    prepareCard();
    render();
  }
  function allIds() { return state.vocabulary.map(function (e) { return e.id; }); }
  function reviewAll(mode) { startReview(allIds(), mode); }
  function reviewRandom(n, mode) { startReview(shuffle(allIds()).slice(0, n), mode); }
  function hardIds() {
    return state.vocabulary.slice().filter(function (e) { return (e.misses || 0) > 0; })
      .sort(function (a, b) { return (b.misses || 0) - (a.misses || 0) || (b.lastWrongAt || 0) - (a.lastWrongAt || 0); })
      .map(function (e) { return e.id; });
  }
  function recordMiss(entry) {
    if (!entry) return;
    var idx = state.vocabulary.findIndex(function (v) { return v.id === entry.id; });
    if (idx < 0) return;
    var next = Object.assign({}, state.vocabulary[idx]);
    next.misses = (next.misses || 0) + 1;
    next.lastWrongAt = Date.now();
    state.vocabulary[idx] = next;
    saveVocab();
  }
  function reviewSelected(mode) {
    var ids = Object.keys(state.vocabSel).filter(function (k) { return state.vocabSel[k] && k.indexOf('known:') !== 0; });
    startReview(ids, mode);
  }
  function startStudyMode(mode) {
    var bookId = currentReviewBookId();
    if (mode === 'match') { startMatch(bookId); return; }
    var ids = studySetIds(bookId);
    if (!ids.length) { alert('这个学习集还没有可练的词。'); return; }
    if (mode === 'learn') {
      var due = dueIds(bookId);
      startReview(due.length ? due : ids, 'learn', { keepOrder: due.length > 0 });
      return;
    }
    if (mode === 'test') {
      startReview(shuffle(ids).slice(0, Math.min(10, ids.length)), 'test');
      return;
    }
    startReview(ids, mode);
  }
  function curEntry() {
    var r = state.review; if (!r) return null;
    var id = r.queue[r.idx];
    return state.vocabulary.find(function (v) { return v.id === id; });
  }
  function escapeReg(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function prepareCard() {
    var r = state.review; if (!r) return;
    while (r.idx < r.queue.length && !curEntry()) r.idx++; // 跳过已毕业/被删的
    if (r.idx >= r.queue.length) return;
    var e = curEntry();
    r.picked = null;
    r.typed = '';
    r.writeChecked = false;
    r.questionKind = null;
    if (r.mode === 'flash') { r.phase = 'front'; r.choices = null; }
    else {
      var qt;
      if (r.mode === 'mc') qt = 'mc';
      else if (r.mode === 'cloze') qt = 'cloze';
      else if (r.mode === 'write') qt = 'write';
      else {
        var mix = ['mc', 'cloze', 'write'];
        qt = mix[Math.floor(Math.random() * mix.length)];
      }
      var ch = (qt === 'cloze') ? buildCloze(e) : null;
      if (qt === 'cloze' && !ch) qt = (r.mode === 'cloze') ? 'mc' : 'write';
      if (qt === 'write') {
        r.choices = null;
        r.questionKind = 'write';
        r.phase = 'write';
      } else {
        r.choices = (qt === 'cloze') ? ch : buildMC(e);
        r.questionKind = r.choices.kind;
        r.phase = 'q';
      }
    }
    if (state.autoSpeak && r.questionKind !== 'cloze' && r.questionKind !== 'write') speak(e.lemma); // 挖空/书写别读出答案
  }
  // 选择题：选释义
  function buildMC(e) {
    var correct = shortSense(enrich(e.lemma, e).translation) || '（本词义）';
    var pool = {};
    state.vocabulary.forEach(function (v) { if (v.id !== e.id) { var t = shortSense(enrich(v.lemma, v).translation); if (t) pool[t] = 1; } });
    for (var i = 0; i < state.known.length && Object.keys(pool).length < 80; i++) {
      var de = DICT.get(String(state.known[i]).toLowerCase());
      if (de) { var t2 = shortSense(de.trans); if (t2) pool[t2] = 1; }
    }
    delete pool[correct];
    var cands = shuffle(Object.keys(pool));
    var opts = [correct].concat(cands.slice(0, 3));
    var fb = ['（无关选项）', '——', '…', '　'];
    var fi = 0; while (opts.length < 4) opts.push(fb[fi++] || ('选项' + fi));
    opts = shuffle(opts);
    return { kind: 'mc', options: opts, correctIdx: opts.indexOf(correct) };
  }
  // 例句挖空：选单词填回句子（需要原文例句）
  function buildCloze(e) {
    var ctx = (e.contexts && e.contexts[0]) ? e.contexts[0] : null;
    if (!ctx || !ctx.sentence) return null;
    var surface = ctx.surface || e.lemma;
    var blanked = ctx.sentence.replace(new RegExp(escapeReg(surface), 'i'), '＿＿＿＿');
    var correct = e.lemma;
    var pool = {};
    state.vocabulary.forEach(function (v) { if (v.id !== e.id) pool[v.lemma.toLowerCase()] = v.lemma; });
    delete pool[correct.toLowerCase()];
    var cands = shuffle(Object.keys(pool).map(function (k) { return pool[k]; }));
    var opts = [correct].concat(cands.slice(0, 3));
    var fb = ['—', '…', '　']; var fi = 0; while (opts.length < 4) opts.push(fb[fi++] || ('选项' + fi));
    opts = shuffle(opts);
    return { kind: 'cloze', sentence: blanked, options: opts, correctIdx: opts.indexOf(correct) };
  }
  // 翻面看释义（仅 flash）
  // ---------- 音效（Web Audio 现场合成，离线、无需音频文件） ----------
  var _ac = null;
  function audioCtx() {
    try { if (!_ac) { var C = window.AudioContext || window.webkitAudioContext; if (C) _ac = new C(); } } catch (e) {}
    if (_ac && _ac.state === 'suspended') { try { _ac.resume(); } catch (e) {} }
    return _ac;
  }
  function soundOn() { return !state.settings || state.settings.sound !== false; }
  function tone(freq, startAt, dur, type, peak) {
    var c = audioCtx(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    o.connect(g); g.connect(c.destination);
    var t0 = c.currentTime + (startAt || 0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak || 0.16, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.start(t0); o.stop(t0 + dur + 0.03);
  }
  function sfxCorrect() { if (!soundOn()) return; tone(659, 0, 0.13, 'sine', 0.16); tone(988, 0.1, 0.18, 'sine', 0.16); } // 上扬两音
  function sfxWrong() { if (!soundOn()) return; tone(196, 0, 0.24, 'sawtooth', 0.1); tone(155, 0.07, 0.26, 'sawtooth', 0.09); } // 低沉嗡音
  function sfxDud() { if (!soundOn()) return; tone(294, 0, 0.16, 'triangle', 0.1); } // 中性短音（不认识）
  function sfxFlip() { if (!soundOn()) return; tone(520, 0, 0.05, 'triangle', 0.07); tone(380, 0.05, 0.06, 'triangle', 0.06); } // 翻卡轻响
  function sfxRankUp() {
    if (!soundOn()) return;
    tone(523, 0, 0.12, 'sine', 0.14);
    tone(659, 0.09, 0.14, 'sine', 0.14);
    tone(784, 0.2, 0.16, 'triangle', 0.15);
    tone(1046, 0.36, 0.26, 'triangle', 0.12);
  }

  function flipCard() { var r = state.review; if (r) { sfxFlip(); r.phase = 'back'; render(); } }
  function flashKnow() {
    var r = state.review, e = curEntry(); if (!r || !e) return;
    sfxCorrect();
    var grad = srsGrade(e.id, true);          // 答对：升级，到顶自动毕业
    r.stats.answered++; r.stats.correct++;
    if (grad) r.stats.graduated++; else r.stats.stillLearning++;
    r.idx++; prepareCard(); render();
  }
  function flashKeep() {
    var r = state.review, e = curEntry(); if (!r || !e) return;
    sfxDud();
    srsGrade(e.id, false);                     // 答错：回到 0，稍后再练
    r.stats.answered++; r.stats.stillLearning++;
    r.idx++; prepareCard(); render();
  }
  function pickChoice(i) {
    var r = state.review; if (!r || !r.choices || r.picked !== null) return;
    r.picked = i;
    if (i === r.choices.correctIdx) sfxCorrect(); else sfxWrong();
    render();
  }
  function mcContinue() {
    var r = state.review; if (!r) return;
    var e = curEntry();
    var ok = r.picked === r.choices.correctIdx;
    r.stats.answered++; if (ok) r.stats.correct++;
    if (e) { if (srsGrade(e.id, ok)) r.stats.graduated++; }
    else recordStudy(ok);
    r.idx++; prepareCard(); render();
  }
  function normalizeWrittenAnswer(text) {
    return String(text || '').trim().toLowerCase().replace(/[’]/g, "'").replace(/[^a-z'\-]/g, '');
  }
  function writeAnswerForms(e) {
    var out = [], seen = {};
    function add(x) {
      var raw = String(x || '').trim();
      var key = normalizeWrittenAnswer(raw);
      if (key && !seen[key]) { seen[key] = 1; out.push(raw); }
    }
    add(e && e.lemma);
    if (e && e.contexts && e.contexts[0]) add(e.contexts[0].surface);
    if (e && Array.isArray(e.forms)) e.forms.forEach(add);
    return out;
  }
  function writeAnswerLabel(e) {
    var forms = writeAnswerForms(e);
    return forms.slice(0, 2).join(' / ') || (e && e.lemma) || '';
  }
  function writeAnswerOk(r, e) {
    var ans = normalizeWrittenAnswer(r && r.typed);
    return writeAnswerForms(e).some(function (f) { return ans === normalizeWrittenAnswer(f); });
  }
  function checkWriteAnswer() {
    var r = state.review, e = curEntry(); if (!r || !e || r.questionKind !== 'write') return;
    var input = document.getElementById('write-answer');
    if (input) r.typed = input.value;
    if (!String(r.typed || '').trim()) return;
    r.writeChecked = true;
    if (writeAnswerOk(r, e)) sfxCorrect(); else sfxWrong();
    render();
  }
  function writeContinue() {
    var r = state.review, e = curEntry(); if (!r || !e || r.questionKind !== 'write') return;
    if (!r.writeChecked) { checkWriteAnswer(); return; }
    var ok = writeAnswerOk(r, e);
    r.stats.answered++; if (ok) r.stats.correct++;
    if (srsGrade(e.id, ok)) r.stats.graduated++;
    r.idx++; prepareCard(); render();
  }
  // 综合测验：固定 10 题，混合选择题、挖空与书写
  function reviewTest() { startStudyMode('test'); }
  // 配对游戏
  function startMatch(bookId) {
    if (bookId && typeof bookId !== 'string') bookId = null;
    bookId = bookId || (state.review && state.review.bookId) || currentReviewBookId();
    var entries = shuffle(studySetEntries(bookId).slice()).filter(function (e) { return shortSense(enrich(e.lemma, e).translation); }).slice(0, 6);
    if (entries.length < 2) { alert('有释义的生词太少，至少需要 2 个。'); return; }
    var tiles = [];
    entries.forEach(function (e, pi) {
      tiles.push({ pairId: pi, kind: 'w', text: e.lemma, eid: e.id });
      tiles.push({ pairId: pi, kind: 'm', text: shortSense(enrich(e.lemma, e).translation), eid: e.id });
    });
    shuffle(tiles);
    state.review = { mode: 'match', bookId: bookId, tiles: tiles, pairs: entries.length, firstIdx: null, matched: 0, moves: 0, locked: false, wrong: null };
    clearSel(); state.tab = 'review'; render();
  }
  function matchClick(idx) {
    var r = state.review; if (!r || r.locked) return;
    var t = r.tiles[idx]; if (!t || t.matched) return;
    if (r.firstIdx === null) { r.firstIdx = idx; render(); return; }
    if (r.firstIdx === idx) { r.firstIdx = null; render(); return; }
    r.moves++;
    var a = r.tiles[r.firstIdx];
    if (a.pairId === t.pairId) { a.matched = true; t.matched = true; r.matched++; r.firstIdx = null; sfxCorrect(); if (a.eid) srsGrade(a.eid, true); render(); }
    else {
      r.wrong = [r.firstIdx, idx]; r.locked = true; sfxWrong(); render();
      setTimeout(function () { if (state.review === r) { r.locked = false; r.wrong = null; r.firstIdx = null; render(); } }, 800);
    }
  }

  // ---------- 导出/导入 ----------
  function normalizeProgress(p) {
    if (!p || typeof p !== 'object') return null;
    return {
      page: Math.max(0, parseInt(p.page, 10) || 0),
      scroll: Math.max(0, Number(p.scroll) || 0),
      pct: Math.max(0, Math.min(100, parseInt(p.pct, 10) || 0)),
      updatedAt: Number(p.updatedAt) || 0,
      done: !!p.done
    };
  }
  function newerProgress(a, b) {
    var bb = normalizeProgress(b);
    if (!bb) return normalizeProgress(a);
    var aa = normalizeProgress(a);
    if (!aa) return bb;
    return (bb.updatedAt || 0) >= (aa.updatedAt || 0) ? bb : aa;
  }
  function buildReadProgressIndex() {
    var out = {};
    state.articles.forEach(function (a) {
      var p = progressOf(a.id);
      if (!p || (!p.pct && !p.page && !p.scroll)) return;
      var key = articlePackKey(a);
      if (key) out[key] = newerProgress(out[key], p);
    });
    return out;
  }
  function mergeReadProgress(incoming, incomingIndex, incomingArticles) {
    var merged = Object.assign({}, state.readProgress || {});
    var idx = {};
    if (incoming && typeof incoming === 'object') {
      Object.keys(incoming).forEach(function (k) {
        merged[k] = newerProgress(merged[k], incoming[k]);
      });
    }
    if (incomingIndex && typeof incomingIndex === 'object') {
      Object.keys(incomingIndex).forEach(function (k) {
        idx[k] = newerProgress(idx[k], incomingIndex[k]);
      });
    }
    if (Array.isArray(incomingArticles) && incoming && typeof incoming === 'object') {
      incomingArticles.forEach(function (a) {
        if (!a || !a.id || !incoming[a.id]) return;
        var key = articlePackKey(a);
        if (key) idx[key] = newerProgress(idx[key], incoming[a.id]);
      });
    }
    Object.keys(idx).forEach(function (key) {
      merged[progressStorageKey(key)] = newerProgress(merged[progressStorageKey(key)], idx[key]);
    });
    state.articles.forEach(function (a) {
      var key = articlePackKey(a);
      var p = idx[key] || merged[progressStorageKey(key)];
      if (p) merged[a.id] = newerProgress(merged[a.id], p);
    });
    return merged;
  }

  function cloudPayload() {
    var p = backupPayload();
    // 文章正文只在 Firebase（分块上传，不受 1MB 限制）且开了「同步文章库」时才上传；
    // 阅读进度很小且按文章 ID 存，始终同步；另一台设备导入同一文章后即可接上。
    var canArticles = !!(state.settings && state.settings.syncArticles) && fbActive();
    if (!canArticles) delete p.articles;
    return p;
  }
  function backupPayload() {
    updateReadingProgress(true);
    var meta = ensureSyncMeta();
    if (!meta.localUpdatedAt) {
      meta.localUpdatedAt = Date.now();
      saveSyncMeta();
    }
    return {
      app: '词流',
      version: 6,
      exportedAt: new Date().toISOString(),
      syncUpdatedAt: meta.localUpdatedAt,
      syncClientId: meta.clientId,
      articles: state.articles,
      vocabulary: state.vocabulary,
      known: state.known,
      readProgress: state.readProgress,
      readProgressIndex: buildReadProgressIndex(),
      customBooks: state.customBooks,
      stats: state.stats,
      settings: state.settings,
      autoSpeak: state.autoSpeak
    };
  }

  function syncStamp(d) {
    var n = d && typeof d.syncUpdatedAt === 'number' ? d.syncUpdatedAt : 0;
    if (!n && d && d.exportedAt) {
      var t = Date.parse(d.exportedAt);
      if (!isNaN(t)) n = t;
    }
    return n || 0;
  }

  function applyBackupData(d, ask, opts) {
    opts = opts || {};
    if (!d || (!d.articles && !d.vocabulary)) { alert('文件格式无法识别。'); return false; }
    var summary = (Array.isArray(d.articles) ? d.articles.length : 0) + ' 篇文章，' +
      (Array.isArray(d.vocabulary) ? d.vocabulary.length : 0) + ' 个生词，' +
      (Array.isArray(d.known) ? d.known.length : 0) + ' 个已掌握词';
    if (ask && !confirm('导入将覆盖当前的全部文章和单词。\n\n将导入：' + summary + '\n\n确定继续吗？建议先导出当前数据做备份。')) return false;
    syncApplying = true;
    if (Array.isArray(d.articles)) state.articles = d.articles; // 同步包不含文章时，保留本机文章
    state.articles.forEach(function (art) { if (!art.book) art.book = art.title || '未命名'; });
    state.vocabulary = Array.isArray(d.vocabulary) ? d.vocabulary : [];
    state.known = Array.isArray(d.known) ? d.known : [];
    state.readProgress = mergeReadProgress(d.readProgress, d.readProgressIndex, d.articles);
    state.customBooks = Array.isArray(d.customBooks) ? d.customBooks : [];
    state.customBooks.forEach(function (b) { if (!Array.isArray(b.words)) b.words = []; });
    state.stats = (d.stats && typeof d.stats === 'object') ? d.stats : defaultStats();
    if (!state.stats.days || typeof state.stats.days !== 'object') state.stats.days = {};
    if (typeof state.stats.goal !== 'number') state.stats.goal = 20;
    if (typeof state.stats.reviewBook !== 'string') state.stats.reviewBook = 'all';
    if (d.settings && typeof d.settings === 'object') {
      var keepSyncAuto = state.settings && state.settings.syncAuto;
      state.settings = {};
      Object.keys(SETTINGS_DEFAULT).forEach(function (k) {
        state.settings[k] = k === 'syncAuto'
          ? !!keepSyncAuto
          : (d.settings[k] !== undefined ? d.settings[k] : SETTINGS_DEFAULT[k]);
      });
      saveSettings();
      applySettings();
    }
    if (typeof d.autoSpeak === 'boolean') { state.autoSpeak = d.autoSpeak; saveAutoSpeak(); }
    var meta = ensureSyncMeta();
    var remoteStamp = syncStamp(d) || Date.now();
    meta.localUpdatedAt = remoteStamp;
    meta.lastSyncedAt = Date.now();
    saveSyncMeta();
    lemmaCache = {};
    state.currentArticleId = null; state.currentBook = null; state.composing = false; state.selected = null; state.lookup = null;
    state.bookOpen = null; state.composingBook = false; state.composingStudySet = false; state.addWordsTo = null; state.showSettings = false; state.showRankGuide = false; state.rankUp = null;
    saveArticles(); saveVocab(); saveKnown(); saveProgress(); saveCustomBooks(); saveStats(); render();
    syncApplying = false;
    if (!opts.silent) alert('导入成功：' + summary + '。');
    return true;
  }

  function articlePackKey(a) {
    var book = String(a && a.book || '').trim().toLowerCase();
    var title = String(a && a.title || '').trim().toLowerCase();
    var content = cleanImportedText(a && a.content || '');
    return [book, title, content.length, content.slice(0, 220).toLowerCase()].join('|');
  }

  function importArticlePackData(d, ask) {
    if (!d || !Array.isArray(d.articles)) { alert('文章包格式无法识别。'); return false; }
    var total = d.articles.length;
    if (ask && !confirm('将合并导入文章包：' + (d.title || '未命名文章包') + '\n\n共 ' + total + ' 篇文章。导入只会新增文章，不会覆盖当前生词、已掌握词和阅读进度。\n\n确定继续吗？')) return false;
    var existing = {};
    state.articles.forEach(function (a) { existing[articlePackKey(a)] = true; });
    var usedIds = {};
    state.articles.forEach(function (a) { if (a.id) usedIds[a.id] = true; });
    var base = Date.now();
    var imported = [];
    d.articles.forEach(function (a) {
      var content = cleanImportedText(a && a.content || '');
      if (!content) return;
      var art = {
        id: a.id || ('art_' + (base + imported.length)),
        book: String(a.book || d.title || '导入文章包').trim() || '导入文章包',
        title: String(a.title || ('第 ' + (imported.length + 1) + ' 篇')).trim(),
        content: content,
        createdAt: base + imported.length,
        updatedAt: base + imported.length
      };
      var key = articlePackKey(art);
      if (existing[key]) return;
      while (usedIds[art.id]) art.id = 'art_' + (base + imported.length) + '_' + Math.random().toString(36).slice(2, 6);
      usedIds[art.id] = true;
      existing[key] = true;
      imported.push(art);
    });
    if (!imported.length) { alert('没有新增文章：这些文章可能已经导入过了。'); return false; }
    state.articles = imported.concat(state.articles);
    state.currentBook = shelfNameForArticle(imported[0]);
    state.currentArticleId = null;
    state.tab = 'reading';
    state.composing = false;
    state.selected = null;
    state.lookup = null;
    state.showSettings = false;
    saveArticles();
    render();
    alert('文章包已导入：新增 ' + imported.length + ' 篇，跳过 ' + (total - imported.length) + ' 篇重复/空文章。');
    return true;
  }

  function exportData() {
    var data = backupPayload();
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '词流备份-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function importData(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var d = JSON.parse(reader.result);
        if (d && d.type === 'lexis_article_pack') importArticlePackData(d, true);
        else applyBackupData(d, true);
      } catch (e) { alert('导入失败：文件不是有效的备份 JSON。'); }
    };
    reader.readAsText(file);
  }

  function importBundledIeltsPack() {
    getBundledIeltsPack().then(function (d) {
      if (!d) throw new Error('没有找到雅思阅读文章包');
      if (!d || d.type !== 'lexis_article_pack') throw new Error('文章包格式不对');
      if (!Array.isArray(d.articles) || !d.articles.length) {
        alert('公开版没有内置真题全文。请先运行 tools/make_ielts_pack.py 生成本地私用包，然后点「导入」选择 private/ielts-reading-article-pack.local.json。');
        return false;
      }
      importArticlePackData(d, true);
    }).catch(function (e) {
      alert((e && e.message ? e.message : '导入失败') + '。也可以点「导入」，手动选择 lexis-app/ielts-reading-article-pack.json。');
    });
  }

  function syncUrl() { return 'sync/backup'; }
  // 云同步（jsonbin.io）：配置了 Master Key + 同步码(binId) 即启用
  var JSONBIN_BASE = 'https://api.jsonbin.io/v3/b';
  function cloudCfg() { var m = ensureSyncMeta(); return (m && m.masterKey && m.binId) ? m : null; }
  function cloudCreate(masterKey) {
    return fetch(JSONBIN_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': masterKey, 'X-Bin-Name': '词流存档', 'X-Bin-Private': 'true' },
      body: JSON.stringify(backupPayload())
    }).then(function (res) {
      if (!res.ok) throw new Error('创建失败（' + res.status + '），请检查 Master Key');
      return res.json();
    }).then(function (j) {
      var id = j && j.metadata && j.metadata.id;
      if (!id) throw new Error('未拿到存档编号');
      var meta = ensureSyncMeta();
      meta.masterKey = masterKey; meta.binId = id; meta.lastSyncedAt = Date.now();
      saveSyncMeta();
      return id;
    });
  }
  // ---------- Firebase 云同步（谷歌登录 + Firestore）----------
  var FB_VER = '10.12.2';
  var _fb = { loading: null, app: null };
  function loadFirebase() {
    if (_fb.loading) return _fb.loading;
    var base = 'https://www.gstatic.com/firebasejs/' + FB_VER + '/';
    _fb.loading = loadScript(base + 'firebase-app-compat.js')
      .then(function () { return loadScript(base + 'firebase-auth-compat.js'); })
      .then(function () { return loadScript(base + 'firebase-firestore-compat.js'); });
    return _fb.loading;
  }
  function fbInit() {
    var m = ensureSyncMeta();
    if (!m.fbConfig) return Promise.reject(new Error('请先填入 Firebase 配置'));
    return loadFirebase().then(function () {
      if (!_fb.app) _fb.app = window.firebase.initializeApp(m.fbConfig);
      return _fb.app;
    });
  }
  function fbAuth() { return window.firebase.auth(); }
  function ensureFbUser() {
    return fbInit().then(function () {
      var u = fbAuth().currentUser;
      if (u) return u;
      return new Promise(function (resolve, reject) {
        var done = false;
        var unsub = fbAuth().onAuthStateChanged(function (user) {
          if (done) return; done = true; try { unsub(); } catch (e) {}
          user ? resolve(user) : reject(new Error('未登录 Firebase'));
        });
        setTimeout(function () { if (!done) { done = true; try { unsub(); } catch (e) {} reject(new Error('登录状态已过期，请重新登录')); } }, 6000);
      });
    });
  }
  function fbSignIn() {
    return fbInit().then(function () {
      return fbAuth().signInWithPopup(new window.firebase.auth.GoogleAuthProvider());
    }).then(function (res) {
      var m = ensureSyncMeta();
      m.fbUid = res.user.uid; m.fbEmail = res.user.email || ''; m.provider = 'firebase';
      saveSyncMeta();
      return res.user;
    });
  }
  function fbSignOutNow() {
    var p = (window.firebase && _fb.app) ? fbAuth().signOut() : Promise.resolve();
    return p.then(function () { var m = ensureSyncMeta(); m.fbUid = null; m.fbEmail = null; saveSyncMeta(); });
  }
  function fbDocRef() { return window.firebase.firestore().collection('users').doc(ensureSyncMeta().fbUid); }
  function fbChunksCol() { return fbDocRef().collection('chunks'); }
  // 把整份 JSON 串切成若干块，每块的 UTF-8 字节数 <= maxBytes（Firestore 单文档上限 1MB，留足余量）。
  // 不会把一个 Unicode 代理对（emoji 等）切成两半。
  var FB_CHUNK_BYTES = 800000; // 0.8MB / 块，给字段名等开销留余量
  function chunkByBytes(s, maxBytes) {
    var chunks = [], start = 0, bytes = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i), w;
      if (c < 0x80) w = 1;
      else if (c < 0x800) w = 2;
      else if (c >= 0xD800 && c <= 0xDBFF) w = 4; // 高代理：和后面的低代理合成 4 字节
      else w = 3;
      if (bytes + w > maxBytes && i > start) { chunks.push(s.slice(start, i)); start = i; bytes = 0; }
      bytes += w;
      if (c >= 0xD800 && c <= 0xDBFF) i++; // 跳过低代理，避免在代理对中间切开
    }
    if (start < s.length) chunks.push(s.slice(start));
    return chunks;
  }
  // 删除编号 >= keepFrom 的旧分块（上次写得更大、这次变小后要清理掉多余的块）
  function fbClearChunks(keepFrom) {
    return fbChunksCol().get().then(function (snap) {
      var dels = [];
      snap.forEach(function (doc) {
        var idx = parseInt(doc.id, 10);
        if (isNaN(idx) || idx >= keepFrom) dels.push(doc.ref.delete());
      });
      return Promise.all(dels);
    }).catch(function () {});
  }
  function fbWrite(payload) {
    return ensureFbUser().then(function () {
      var str = JSON.stringify(payload);
      var stamp = payload.syncUpdatedAt || Date.now();
      // 小存档：仍写单文档（兼容旧设备），并清掉历史分块
      if (chunkByBytes(str, FB_CHUNK_BYTES).length <= 1) {
        return fbDocRef().set({ blob: str, syncUpdatedAt: stamp, chunkCount: 0, fmt: 2 })
          .then(function () { return fbClearChunks(0); });
      }
      // 大存档（含文章正文）：切块分别写进 chunks 子集合，主文档只存清单
      var parts = chunkByBytes(str, FB_CHUNK_BYTES);
      var n = parts.length;
      var col = fbChunksCol();
      var chain = Promise.resolve();
      parts.forEach(function (p, idx) {
        chain = chain.then(function () { return col.doc(String(idx)).set({ blob: p, i: idx }); });
      });
      // 先写完所有块，再把主文档当作“提交点”写入清单，最后清理多余旧块
      return chain
        .then(function () { return fbDocRef().set({ blob: '', syncUpdatedAt: stamp, chunkCount: n, fmt: 2 }); })
        .then(function () { return fbClearChunks(n); });
    });
  }
  function fbRead() {
    return ensureFbUser().then(function () { return fbDocRef().get(); }).then(function (snap) {
      if (!snap.exists) return null;
      var data = snap.data();
      if (!data) return null;
      var n = data.chunkCount || 0;
      if (!n) { // 旧格式 / 小存档：直接解析主文档的 blob
        if (!data.blob) return null;
        try { return JSON.parse(data.blob); } catch (e) { return null; }
      }
      var col = fbChunksCol();
      var gets = [];
      for (var i = 0; i < n; i++) gets.push(col.doc(String(i)).get());
      return Promise.all(gets).then(function (snaps) {
        var parts = [];
        for (var j = 0; j < snaps.length; j++) {
          var d = snaps[j].exists ? snaps[j].data() : null;
          if (!d || typeof d.blob !== 'string') return null; // 缺块说明上传未完成，放弃这次拉取
          parts[j] = d.blob;
        }
        try { return JSON.parse(parts.join('')); } catch (e) { return null; }
      });
    });
  }
  function fbActive() { var m = ensureSyncMeta(); return !!(m.provider === 'firebase' && m.fbConfig && m.fbUid); }
  function parseFirebaseConfig(text) {
    var cfg = {};
    ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'].forEach(function (k) {
      var mm = String(text).match(new RegExp(k + '\\s*:\\s*[\'"]([^\'"]+)[\'"]'));
      if (mm) cfg[k] = mm[1];
    });
    return (cfg.apiKey && cfg.projectId && cfg.appId && cfg.authDomain) ? cfg : null;
  }

  function canAutoSync() {
    if (!(state.settings && state.settings.syncAuto)) return false;
    if (fbActive()) return true;                              // Firebase
    if (cloudCfg()) return true;                              // 同步码：任意环境可用
    return /^https?:/.test(location.protocol);                // 局域网：需 http(s)
  }
  function hasLocalSyncData() {
    return !!(state.articles.length || state.vocabulary.length || state.known.length || state.customBooks.length);
  }
  function postSyncPayload(payload) {
    var data = payload || backupPayload();
    if (fbActive()) {
      return fbWrite(data).then(function () {
        var meta = ensureSyncMeta(); meta.lastSyncedAt = Date.now(); saveSyncMeta(); return {};
      });
    }
    var body = JSON.stringify(data);
    var cfg = cloudCfg(), req;
    if (cfg) {
      req = fetch(JSONBIN_BASE + '/' + cfg.binId, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Master-Key': cfg.masterKey }, body: body
      });
    } else {
      req = fetch(syncUrl(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body });
    }
    return req.then(function (res) {
      if (!res.ok) throw new Error('同步上传失败（' + res.status + '）');
      return res.json().catch(function () { return {}; });
    }).then(function (r) {
      var meta = ensureSyncMeta();
      meta.lastSyncedAt = Date.now();
      saveSyncMeta();
      return r;
    });
  }
  function syncPush() {
    postSyncPayload(cloudPayload()).then(function () {
      alert('已上传到云端存档。');
    }).catch(function (e) {
      alert((e && e.message) ? e.message : '上传失败，请检查同步码 / Master Key / 网络。');
    });
  }
  function fetchSyncBackup() {
    if (fbActive()) return fbRead();
    var cfg = cloudCfg();
    if (cfg) {
      return fetch(JSONBIN_BASE + '/' + cfg.binId + '/latest', { headers: { 'X-Master-Key': cfg.masterKey } })
        .then(function (res) {
          if (res.status === 404) return null;
          if (!res.ok) throw new Error('拉取失败（' + res.status + '）');
          return res.json();
        }).then(function (j) { return j ? (j.record || null) : null; });
    }
    return fetch(syncUrl()).then(function (res) {
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('同步服务不可用');
      return res.json();
    });
  }
  function autoSyncNow() {
    if (!canAutoSync() || state.booting || syncBusy) return;
    syncBusy = true;
    fetchSyncBackup().then(function (remote) {
      var meta = ensureSyncMeta();
      var localStamp = meta.localUpdatedAt || 0;
      if (!remote) {
        if (hasLocalSyncData()) return postSyncPayload(cloudPayload());
        return null;
      }
      var remoteStamp = syncStamp(remote);
      if (remoteStamp > localStamp + 800) {
        return applyBackupData(remote, false, { silent: true, fromSync: true });
      }
      if (localStamp > remoteStamp + 800 && hasLocalSyncData()) {
        return postSyncPayload(cloudPayload());
      }
      meta.lastSyncedAt = Date.now();
      saveSyncMeta();
      return null;
    }).then(function (r) {
      syncBusy = false;
      return r;
    }).catch(function () {
      syncBusy = false;
    });
  }
  function scheduleAutoSync(delay) {
    if (!canAutoSync() || state.booting) return;
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(function () {
      syncTimer = null;
      autoSyncNow();
    }, delay || 1800);
  }
  function startAutoSyncLoop() {
    if (syncLoopStarted) return;
    syncLoopStarted = true;
    setInterval(function () { if (canAutoSync()) autoSyncNow(); }, 30000);
    setTimeout(function () { if (canAutoSync()) autoSyncNow(); }, 900);
  }
  function syncPull() {
    fetchSyncBackup().then(function (d) {
      if (!d) throw new Error('还没有同步存档');
      applyBackupData(d, true);
    }).then(function (d) {
    }).catch(function (e) {
      alert((e && e.message) ? e.message : '拉取失败。请先在有最新数据的设备上点「上传存档」。');
    });
  }

  // ---------- 事件绑定 ----------
  function bind() {
    // 顶部保存输入框内容（避免重渲染丢失）
    var $ = function (id) { return document.getElementById(id); };

    document.querySelectorAll('[data-tab]').forEach(function (b) {
      b.addEventListener('click', function () { autoMarkCurrentPage(); updateReadingProgress(true); commitNewIfPending(); state.tab = b.getAttribute('data-tab'); state.reviewView = 'home'; state.selected = null; state.lookup = null; render(); });
    });

    if ($('btn-autospeak')) $('btn-autospeak').addEventListener('click', function () {
      state.autoSpeak = !state.autoSpeak; saveAutoSpeak();
      if (state.autoSpeak && state.selected) speak((state.lookup && state.lookup.data && state.lookup.data.lemma) || state.selected.surface);
      render();
    });
    // ----- 阅读设置 -----
    if ($('btn-settings')) $('btn-settings').addEventListener('click', function () { state.showSettings = true; render(); });
    if ($('set-close')) $('set-close').addEventListener('click', function () { state.showSettings = false; render(); });
    if ($('set-mask')) $('set-mask').addEventListener('click', function (e) { if (e.target === this) { state.showSettings = false; render(); } });
    if ($('rank-guide-open')) $('rank-guide-open').addEventListener('click', function () { state.showRankGuide = true; render(); });
    if ($('rank-guide-close')) $('rank-guide-close').addEventListener('click', function () { state.showRankGuide = false; render(); });
    if ($('rank-mask')) $('rank-mask').addEventListener('click', function (e) { if (e.target === this) { state.showRankGuide = false; render(); } });
    if ($('rank-up-close')) $('rank-up-close').addEventListener('click', function () { state.rankUp = null; render(); });
    if ($('rank-up-continue')) $('rank-up-continue').addEventListener('click', function () { state.rankUp = null; render(); });
    if ($('rank-up-guide')) $('rank-up-guide').addEventListener('click', function () { state.rankUp = null; state.showRankGuide = true; render(); });
    if ($('rank-up-mask')) $('rank-up-mask').addEventListener('click', function (e) { if (e.target === this) { state.rankUp = null; render(); } });
    document.querySelectorAll('[data-set]').forEach(function (b) {
      b.addEventListener('click', function () { setSetting(b.getAttribute('data-set'), b.getAttribute('data-val')); });
    });
    document.querySelectorAll('[data-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        var key = b.getAttribute('data-toggle');
        if (key === 'autoSpeak') { state.autoSpeak = !state.autoSpeak; saveAutoSpeak(); render(); }
        else setSetting(key, !(state.settings || SETTINGS_DEFAULT)[key]);
      });
    });

    if ($('btn-export')) $('btn-export').addEventListener('click', exportData);
    if ($('btn-import')) $('btn-import').addEventListener('click', function () { $('import-file').click(); });
    if ($('set-export')) $('set-export').addEventListener('click', exportData);
    if ($('set-import')) $('set-import').addEventListener('click', function () { $('import-file').click(); });
    if ($('set-import-ielts')) $('set-import-ielts').addEventListener('click', importBundledIeltsPack);
    if ($('set-sync-push')) $('set-sync-push').addEventListener('click', syncPush);
    if ($('set-sync-pull')) $('set-sync-pull').addEventListener('click', syncPull);
    if ($('cloud-create')) $('cloud-create').addEventListener('click', function () {
      var key = ($('sync-key') && $('sync-key').value || '').trim();
      if (!key) { alert('请先粘贴 jsonbin 的 Master Key。'); return; }
      var btn = this; btn.disabled = true; btn.textContent = '创建中…';
      cloudCreate(key).then(function (id) {
        if (!state.settings) state.settings = {}; state.settings.syncAuto = true; saveSettings();
        startAutoSyncLoop();
        render();
        setTimeout(function () { alert('云存档已创建。\n\n你的同步码：\n' + id + '\n\n请在另一台设备填入同一个 Master Key 和这个同步码。'); }, 50);
      }).catch(function (e) {
        btn.disabled = false; btn.textContent = '创建云存档（第一台）';
        alert((e && e.message) ? e.message : '创建失败。');
      });
    });
    if ($('cloud-connect')) $('cloud-connect').addEventListener('click', function () {
      var key = ($('sync-key') && $('sync-key').value || '').trim();
      var bin = ($('sync-bin') && $('sync-bin').value || '').trim();
      if (!key || !bin) { alert('请填入 Master Key 和同步码。'); return; }
      var meta = ensureSyncMeta();
      meta.masterKey = key; meta.binId = bin; saveSyncMeta();
      if (!state.settings) state.settings = {}; state.settings.syncAuto = true; saveSettings();
      var btn = this; btn.disabled = true; btn.textContent = '连接中…';
      fetchSyncBackup().then(function (d) {
        if (!d) throw new Error('没找到该同步码对应的存档，请检查是否填错。');
        applyBackupData(d, true);          // 用云端覆盖本机（会先确认）
        startAutoSyncLoop();
      }).catch(function (e) {
        meta.masterKey = null; meta.binId = null; saveSyncMeta(); // 连接失败则回退
        render();
        alert((e && e.message) ? e.message : '连接失败，请检查 Key / 同步码 / 网络。');
      });
    });
    if ($('cloud-disconnect')) $('cloud-disconnect').addEventListener('click', function () {
      if (!confirm('断开云同步？本机数据会保留，只是不再和云端同步。')) return;
      var meta = ensureSyncMeta();
      meta.masterKey = null; meta.binId = null; saveSyncMeta();
      if (state.settings) { state.settings.syncAuto = false; saveSettings(); }
      render();
    });
    // ----- 云同步：方式切换 / Firebase -----
    document.querySelectorAll('[data-syncprovider]').forEach(function (b) {
      b.addEventListener('click', function () { var meta = ensureSyncMeta(); meta.provider = b.getAttribute('data-syncprovider'); saveSyncMeta(); render(); });
    });
    if ($('fb-save-config')) $('fb-save-config').addEventListener('click', function () {
      var txt = ($('fb-config') && $('fb-config').value || '').trim();
      var cfg = parseFirebaseConfig(txt);
      if (!cfg) { alert('没能识别 Firebase 配置。请确认粘贴的是 firebaseConfig，至少包含 apiKey、authDomain、projectId、appId。'); return; }
      var meta = ensureSyncMeta(); meta.fbConfig = cfg; meta.provider = 'firebase'; saveSyncMeta(); render();
    });
    if ($('fb-signin')) $('fb-signin').addEventListener('click', function () {
      var btn = this; btn.disabled = true; btn.textContent = '登录中…';
      fbSignIn().then(function () {
        if (!state.settings) state.settings = {}; state.settings.syncAuto = true; saveSettings();
        startAutoSyncLoop();
        return fetchSyncBackup();
      }).then(function (d) {
        if (d) applyBackupData(d, true);            // 云端已有存档 → 拉取（确认覆盖本机）
        else postSyncPayload(cloudPayload());      // 云端为空 → 上传本机
        render();
      }).catch(function (e) {
        render();
        alert((e && e.message) ? e.message : '谷歌登录失败。请确认已开启 Google 登录，并把本网址加入 Firebase 授权域名。');
      });
    });
    if ($('fb-signout')) $('fb-signout').addEventListener('click', function () {
      if (!confirm('退出谷歌登录？本机数据保留，停止同步。')) return;
      if (state.settings) { state.settings.syncAuto = false; saveSettings(); }
      fbSignOutNow().then(render).catch(render);
    });
    if ($('import-file')) $('import-file').addEventListener('change', function (e) { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ''; });

    if ($('new-article')) $('new-article').addEventListener('click', function () { state.newBook = ''; state.composing = true; render(); });
    if ($('new-chapter')) $('new-chapter').addEventListener('click', function () { state.newBook = state.currentBook === IELTS_SHELF ? '' : (state.currentBook || ''); state.composing = true; render(); });
    if ($('import-article')) $('import-article').addEventListener('click', function () { var f = $('article-file'); if (f) f.click(); });
    if ($('article-file')) $('article-file').addEventListener('change', function (e) { if (e.target.files[0]) importFile(e.target.files[0]); e.target.value = ''; });
    if ($('new-article-2')) $('new-article-2').addEventListener('click', function () { state.newBook = ''; state.composing = true; render(); });
    if ($('cancel-compose')) $('cancel-compose').addEventListener('click', function () { state.composing = false; state.editingId = null; state.newTitle = ''; state.newContent = ''; state.newBook = ''; render(); });
    if ($('edit-article')) $('edit-article').addEventListener('click', function () { enterEdit(state.currentArticleId); });
    if ($('new-book')) $('new-book').addEventListener('input', function (e) { state.newBook = e.target.value; });
    if ($('new-title')) $('new-title').addEventListener('input', function (e) { state.newTitle = e.target.value; });
    if ($('new-content')) $('new-content').addEventListener('input', function (e) {
      state.newContent = e.target.value;
      var btn = $('create-article'); if (btn) btn.disabled = !e.target.value.trim();
    });
    if ($('create-article')) $('create-article').addEventListener('click', createArticle);
    // 阅读章 → 返回该书目录
    if ($('back-chapters')) $('back-chapters').addEventListener('click', function () { autoMarkCurrentPage(); updateReadingProgress(true); state.currentArticleId = null; render(); });
    if ($('back-chapters-2')) $('back-chapters-2').addEventListener('click', function () { autoMarkCurrentPage(); updateReadingProgress(true); state.currentArticleId = null; render(); });
    // 书目录 → 返回书架
    if ($('back-shelf')) $('back-shelf').addEventListener('click', function () { state.currentBook = null; render(); });
    document.querySelectorAll('[data-page]').forEach(function (b) {
      b.addEventListener('click', function () {
        turnPage(b.getAttribute('data-page') === 'next' ? 1 : -1);
      });
    });
    bindPageSwipe();

    document.querySelectorAll('[data-openbook]').forEach(function (c) {
      c.addEventListener('click', function () { state.currentBook = c.getAttribute('data-openbook'); state.currentArticleId = null; render(); });
    });
    document.querySelectorAll('[data-open]').forEach(function (c) {
      c.addEventListener('click', function () {
        updateReadingProgress(true);
        openArticle(c.getAttribute('data-open'), true);
      });
    });
    document.querySelectorAll('[data-del-art]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = b.getAttribute('data-del-art');
        var oldArticle = state.articles.find(function (a) { return a.id === id; });
        state.articles = state.articles.filter(function (a) { return a.id !== id; });
        if (state.readProgress) delete state.readProgress[id];
        if (oldArticle && state.readProgress) delete state.readProgress[progressStorageKey(articlePackKey(oldArticle))];
        if (state.currentArticleId === id) state.currentArticleId = null;
        saveArticles(); saveProgress(); render();
      });
    });
    document.querySelectorAll('[data-del-book]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var name = b.getAttribute('data-del-book');
        var cnt = state.articles.filter(function (a) { return shelfNameForArticle(a) === name; }).length;
        if (!confirm('删除《' + name + '》共 ' + cnt + ' 篇？此操作不可撤销。')) return;
        state.articles.forEach(function (a) {
          if (shelfNameForArticle(a) === name && state.readProgress) {
            delete state.readProgress[a.id];
            delete state.readProgress[progressStorageKey(articlePackKey(a))];
          }
        });
        state.articles = state.articles.filter(function (a) { return shelfNameForArticle(a) !== name; });
        if (state.currentBook === name) state.currentBook = null;
        saveArticles(); saveProgress(); render();
      });
    });
    document.querySelectorAll('[data-del-voc]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-del-voc');
        state.vocabulary = state.vocabulary.filter(function (v) { return v.id !== id; });
        saveVocab(); render();
      });
    });

    // ----- 词汇库：子标签 / 搜索 / 排序 / 单项管理 / 批量 -----
    document.querySelectorAll('[data-vtab]').forEach(function (b) {
      b.addEventListener('click', function () { state.vocabTab = b.getAttribute('data-vtab'); state.vocabSearch = ''; state.searchInLib = true; state.bookOpen = null; state.bookShowLimit = 500; state.composingBook = false; state.addWordsTo = null; clearSel(); render(); });
    });
    document.querySelectorAll('[data-book]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-book');
        state.bookOpen = id; state.vocabSearch = ''; state.bookShowLimit = 500; state.addWordsTo = null;
        if (id === 'my') { state.vocabTab = 'learning'; state.searchInLib = true; state.vocabSort = 'recent'; clearSel(); }
        else { state.bookTab = 'unlearned'; state.vocabSort = 'recent'; }
        render();
      });
    });
    // 我的词书内部：生词 / 已掌握 子标签
    document.querySelectorAll('[data-mytab]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.vocabTab = b.getAttribute('data-mytab');
        state.vocabSearch = '';
        state.searchInLib = true;
        state.vocabSort = state.vocabTab === 'known' ? 'added' : 'recent';
        clearSel();
        render();
      });
    });
    if ($('book-back')) $('book-back').addEventListener('click', function () { state.bookOpen = null; state.bookShowLimit = 500; state.composingBook = false; state.addWordsTo = null; state.vocabSearch = ''; render(); });
    document.querySelectorAll('[data-btab]').forEach(function (b) {
      b.addEventListener('click', function () { state.bookTab = b.getAttribute('data-btab'); state.vocabSearch = ''; state.bookShowLimit = 500; render(); });
    });
    if ($('book-more')) $('book-more').addEventListener('click', function () { state.bookShowLimit = Math.max(500, state.bookShowLimit || 500) + 500; render(); });
    document.querySelectorAll('[data-addbook]').forEach(function (b) {
      b.addEventListener('click', function () { addBookWord(b.getAttribute('data-addbook')); });
    });
    document.querySelectorAll('[data-unknow]').forEach(function (b) {
      b.addEventListener('click', function () {
        var ll = String(b.getAttribute('data-unknow')).toLowerCase();
        state.known = state.known.filter(function (l) { return String(l).toLowerCase() !== ll; });
        saveKnown(); render();
      });
    });
    document.querySelectorAll('[data-delbookword]').forEach(function (b) {
      b.addEventListener('click', function () { removeBookWord(state.bookOpen, b.getAttribute('data-delbookword')); });
    });
    // ----- 自建词书：新建 / 添加 / 删除 -----
    if ($('cb-new')) $('cb-new').addEventListener('click', function () { state.composingBook = true; state.newBookName = ''; state.newBookWords = ''; render(); });
    if ($('cb-cancel')) $('cb-cancel').addEventListener('click', function () { state.composingBook = false; render(); });
    if ($('cb-name')) $('cb-name').addEventListener('input', function (e) { state.newBookName = e.target.value; });
    if ($('cb-words')) $('cb-words').addEventListener('input', function (e) {
      state.newBookWords = e.target.value;
      var btn = $('cb-create'); if (btn) btn.disabled = !e.target.value.trim();
    });
    if ($('cb-create')) $('cb-create').addEventListener('click', function () {
      if (!state.newBookWords.trim()) return;
      var book = createCustomBook(state.newBookName, state.newBookWords);
      state.composingBook = false; state.newBookName = ''; state.newBookWords = '';
      state.bookOpen = book.id; state.bookTab = 'unlearned'; state.vocabSort = 'recent'; state.vocabSearch = '';
      render();
    });
    if ($('cb-rename')) $('cb-rename').addEventListener('click', function () {
      var bk = getCustomBook(state.bookOpen);
      if (!bk) return;
      var nm = prompt('词书改名：', bk.name);
      if (nm !== null && nm.trim()) renameCustomBook(state.bookOpen, nm);
    });
    if ($('cb-del')) $('cb-del').addEventListener('click', function () {
      var bk = getCustomBook(state.bookOpen);
      if (bk && confirm('删除词书《' + bk.name + '》？（不影响已加入生词/已掌握的词）')) deleteCustomBook(state.bookOpen);
    });
    if ($('cb-addmore')) $('cb-addmore').addEventListener('click', function () { state.addWordsTo = state.bookOpen; render(); });
    if ($('cb-addcancel')) $('cb-addcancel').addEventListener('click', function () { state.addWordsTo = null; render(); });
    if ($('cb-addsave')) $('cb-addsave').addEventListener('click', function () {
      var ta = $('cb-addwords'); var txt = ta ? ta.value : '';
      var n = addWordsToBook(state.bookOpen, txt);
      state.addWordsTo = null; render();
      if (!n) setTimeout(function () { alert('没有新词加入（可能都已在书里或无法识别）。'); }, 0);
    });
    if ($('vsearch')) {
      var vs = $('vsearch');
      vs.addEventListener('input', function (e) {
        state.vocabSearch = e.target.value;
        if (state.bookOpen && state.bookOpen !== 'my') state.bookShowLimit = 500;
        // 搜索模式才实时筛选；添加模式只存值、不重渲染（保持焦点）
        if (state.searchInLib || state.vocabTab === 'known') reRenderVocabList();
      });
      vs.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && state.vocabTab !== 'known' && !state.searchInLib) { e.preventDefault(); addManualWord(e.target.value); }
      });
    }
    if ($('seg-search')) $('seg-search').addEventListener('click', function () { if (!state.searchInLib) { state.searchInLib = true; state.vocabSearch = ''; render(); } });
    if ($('seg-add')) $('seg-add').addEventListener('click', function () { if (state.searchInLib) { state.searchInLib = false; state.vocabSearch = ''; render(); } });
    if ($('vsort')) $('vsort').addEventListener('change', function (e) { state.vocabSort = e.target.value; if (state.bookOpen && state.bookOpen !== 'my') state.bookShowLimit = 500; render(); });

    document.querySelectorAll('[data-sel]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-sel');
        if (state.vocabSel[k]) delete state.vocabSel[k]; else state.vocabSel[k] = true;
        render();
      });
    });
    document.querySelectorAll('[data-grad]').forEach(function (b) {
      b.addEventListener('click', function () { graduateLemma(b.getAttribute('data-grad')); saveVocab(); saveKnown(); render(); });
    });
    document.querySelectorAll('[data-tolearn]').forEach(function (b) {
      b.addEventListener('click', function () { knownToLearning(b.getAttribute('data-tolearn')); saveVocab(); saveKnown(); render(); });
    });
    document.querySelectorAll('[data-del-known]').forEach(function (b) {
      b.addEventListener('click', function () {
        var ll = b.getAttribute('data-del-known').toLowerCase();
        state.known = state.known.filter(function (l) { return String(l).toLowerCase() !== ll; });
        saveKnown(); render();
      });
    });
    document.querySelectorAll('[data-bulk]').forEach(function (b) {
      b.addEventListener('click', function () { bulkAction(b.getAttribute('data-bulk')); });
    });

    // 文章正文点词（事件委托）
    var body = $('article-body');
    if (body) {
      body.addEventListener('click', function (e) {
        var t = e.target;
        if (t && t.hasAttribute && t.hasAttribute('data-w')) {
          handleWordClick(t.getAttribute('data-w'), parseInt(t.getAttribute('data-si'), 10), t.getBoundingClientRect());
        }
      });
    }

    function bindTap(id, fn) {
      var el = $(id);
      if (!el) return;
      var firedAt = 0;
      function run(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        var now = Date.now();
        if (now - firedAt < 350) return;
        firedAt = now;
        fn(e);
      }
      if (window.PointerEvent) el.addEventListener('pointerup', run);
      else el.addEventListener('touchend', run, { passive: false });
      el.addEventListener('click', run);
    }

    // 词查询浮窗：移动端用触摸抬起即响应，避免 click 被滚动/关闭浮窗抢走
    bindTap('add-learning', markLearning);
    bindTap('mark-known', markKnown);
    bindTap('demote', demoteToLearning);
    bindTap('trans-toggle', function () { state.transExpanded = !state.transExpanded; render(); });
    bindTap('speak-word', function () {
      var d = state.lookup && state.lookup.data;
      speak((d && d.lemma) || (state.selected && state.selected.surface));
    });

    // 词表朗读按钮
    document.querySelectorAll('[data-speak]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); speak(b.getAttribute('data-speak')); });
    });

    // ----- 手动添加 -----
    if ($('add-word-btn')) $('add-word-btn').addEventListener('click', function () { addManualWord(state.vocabSearch); });
    // ----- 学习集：模式选择 -----
    document.querySelectorAll('[data-mode]').forEach(function (b) {
      b.addEventListener('click', function () {
        startStudyMode(b.getAttribute('data-mode'));
      });
    });
    // ----- 学习集首页：继续学习 / 统计 / 每日目标 -----
    if ($('review-book-select')) $('review-book-select').addEventListener('change', function (e) {
      if (!state.stats) state.stats = defaultStats();
      state.stats.reviewBook = e.target.value || 'all';
      saveStats();
      render();
    });
    if ($('start-today')) $('start-today').addEventListener('click', function () {
      startStudyMode('learn');
    });
    if ($('study-set-new')) $('study-set-new').addEventListener('click', function () {
      state.composingStudySet = true;
      state.newStudySetName = '';
      state.newStudySetWords = '';
      render();
    });
    if ($('study-set-new-mini')) $('study-set-new-mini').addEventListener('click', function () {
      state.composingStudySet = true;
      state.newStudySetName = '';
      state.newStudySetWords = '';
      render();
    });
    if ($('study-set-cancel')) $('study-set-cancel').addEventListener('click', function () { state.composingStudySet = false; render(); });
    if ($('study-set-cancel-2')) $('study-set-cancel-2').addEventListener('click', function () { state.composingStudySet = false; render(); });
    if ($('study-set-name')) $('study-set-name').addEventListener('input', function (e) { state.newStudySetName = e.target.value; });
    if ($('study-set-words')) $('study-set-words').addEventListener('input', function (e) {
      state.newStudySetWords = e.target.value;
      var btn = $('study-set-create');
      if (btn) btn.disabled = !parseWordList(e.target.value).length;
    });
    if ($('study-set-create')) $('study-set-create').addEventListener('click', createStudySetFromReview);
    if ($('rev-stats')) $('rev-stats').addEventListener('click', function () { state.reviewView = 'stats'; render(); });
    if ($('rev-stats-mini')) $('rev-stats-mini').addEventListener('click', function () { state.reviewView = 'stats'; render(); });
    if ($('stats-back')) $('stats-back').addEventListener('click', function () { state.reviewView = 'home'; render(); });
    if ($('goal-dec')) $('goal-dec').addEventListener('click', function () { if (!state.stats) state.stats = defaultStats(); state.stats.goal = Math.max(5, (state.stats.goal || 20) - 5); saveStats(); render(); });
    if ($('goal-inc')) $('goal-inc').addEventListener('click', function () { if (!state.stats) state.stats = defaultStats(); state.stats.goal = Math.min(200, (state.stats.goal || 20) + 5); saveStats(); render(); });
    // ----- 卡片内操作 -----
    if ($('exit-review')) $('exit-review').addEventListener('click', function () { state.review = null; render(); });
    if ($('flip')) $('flip').addEventListener('click', flipCard);
    if ($('flash-know')) $('flash-know').addEventListener('click', flashKnow);
    if ($('flash-keep')) $('flash-keep').addEventListener('click', flashKeep);
    if ($('speak-review')) $('speak-review').addEventListener('click', function () { var e = curEntry(); if (e) speak(e.lemma); });
    var revCardEl = document.querySelector('.rev-card');
    if (revCardEl) revCardEl.addEventListener('click', function (e) {
      if (!state.review || state.review.mode !== 'flash' || state.review.phase !== 'front') return;
      if (e.target && e.target.closest && e.target.closest('button,input,textarea,select,a')) return;
      flipCard();
    });
    document.querySelectorAll('[data-choice]').forEach(function (b) {
      b.addEventListener('click', function () { pickChoice(parseInt(b.getAttribute('data-choice'), 10)); });
    });
    if ($('mc-next')) $('mc-next').addEventListener('click', mcContinue);
    if ($('write-answer')) {
      var wa = $('write-answer');
      wa.addEventListener('input', function (e) { if (state.review) state.review.typed = e.target.value; });
      wa.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        if (state.review && state.review.writeChecked) writeContinue(); else checkWriteAnswer();
      });
      if (state.review && !state.review.writeChecked) setTimeout(function () { try { wa.focus(); } catch (err) {} }, 0);
    }
    if ($('write-check')) $('write-check').addEventListener('click', checkWriteAnswer);
    if ($('write-next')) $('write-next').addEventListener('click', writeContinue);
    // ----- 配对游戏 -----
    document.querySelectorAll('[data-tile]').forEach(function (b) {
      b.addEventListener('click', function () { matchClick(parseInt(b.getAttribute('data-tile'), 10)); });
    });
    if ($('match-again')) $('match-again').addEventListener('click', startMatch);
  }

  // 点浮窗以外的空白处 → 关闭（未点「已掌握」则自动存为生词）；点别的单词由点词逻辑处理
  var lastPopoverTouchAt = 0;
  document.addEventListener('touchstart', function (e) {
    var t = e.target;
    if (t && t.closest && t.closest('#popover')) lastPopoverTouchAt = Date.now();
  }, true);
  document.addEventListener('mousedown', function (e) {
    if (!state.selected) return;
    var t = e.target;
    if (t && t.closest && (t.closest('#popover') || t.closest('[data-w]'))) return;
    closePanel();
  }, true);
  // 滚动时关闭浮窗，避免它与单词错位
  window.addEventListener('scroll', function (e) {
    if (state.selected) {
      var t = e.target;
      if (t && t.closest && t.closest('#popover')) return;
      if (Date.now() - lastPopoverTouchAt > 260) closePanel();
    }
    scheduleProgressSave();
  }, true);
  function canTurnByGesture() {
    return state.tab === 'reading' && !state.composing && !!state.currentArticleId && !state.selected &&
      !state.showSettings && !state.showRankGuide && !state.rankUp && isPaged();
  }
  function isInteractiveGestureTarget(el) {
    if (!el || !el.closest) return false;
    return !!el.closest('button,input,textarea,select,a,.popover,.drawer,.set-card,.rank-guide-card,.rank-up-card');
  }

  var swipe = { active: false, x: 0, y: 0, t: 0, horizontal: false };
  function bindPageSwipe() {
    var shell = document.querySelector('.page-shell');
    if (!shell) return;
    shell.addEventListener('touchstart', function (e) {
      if (!canTurnByGesture() || e.touches.length !== 1 || isInteractiveGestureTarget(e.target)) return;
      var t = e.touches[0];
      swipe.active = true;
      swipe.horizontal = false;
      swipe.x = t.clientX;
      swipe.y = t.clientY;
      swipe.t = Date.now();
    }, { passive: true });
    shell.addEventListener('touchmove', function (e) {
      if (!swipe.active || !e.touches.length) return;
      var t = e.touches[0];
      var dx = t.clientX - swipe.x;
      var dy = t.clientY - swipe.y;
      var ax = Math.abs(dx), ay = Math.abs(dy);
      if (ay > 20 && ay > ax * 1.25) { swipe.active = false; return; }
      if (ax > 12 && ax > ay * 1.15) {
        swipe.horizontal = true;
        if (e.cancelable) e.preventDefault();
      }
    }, { passive: false });
    shell.addEventListener('touchend', function (e) {
      if (!swipe.active) return;
      var t = e.changedTouches && e.changedTouches[0];
      var dx = t ? t.clientX - swipe.x : 0;
      var dy = t ? t.clientY - swipe.y : 0;
      var elapsed = Date.now() - swipe.t;
      var ax = Math.abs(dx), ay = Math.abs(dy);
      var shouldTurn = swipe.horizontal && ax >= 44 && ax > ay * 1.25 && elapsed < 1200;
      swipe.active = false;
      swipe.horizontal = false;
      if (!shouldTurn || !canTurnByGesture()) return;
      if (e.cancelable) e.preventDefault();
      turnPage(dx < 0 ? 1 : -1);
    }, { passive: false });
    shell.addEventListener('touchcancel', function () {
      swipe.active = false;
      swipe.horizontal = false;
    }, { passive: true });
  }

  window.addEventListener('wheel', function (e) {
    if (!canTurnByGesture()) return;
    e.preventDefault();
    var now = Date.now();
    if (now < state.wheelLock || Math.abs(e.deltaY) < 12) return;
    state.wheelLock = now + 360;
    turnPage(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    applySettings();
    if (state.selected) closePanel();
    if (state.tab !== 'reading' || state.composing || !state.currentArticleId) return;
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resizeTimer = null;
      render();
    }, 160);
  });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state.showSettings) { state.showSettings = false; render(); return; }
    if (state.tab === 'review') {
      if (e.target && e.target.closest && e.target.closest('input,textarea,select,button,a')) return;
      if (e.key === 'Escape' && state.review) { state.review = null; render(); return; }
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        var r = state.review;
        if (!r) { startStudyMode('flash'); return; }
        if (r.mode === 'flash') {
          if (r.phase === 'front') flipCard();
          return;
        }
        if (r.questionKind === 'write' && r.writeChecked) { writeContinue(); return; }
        if (r.choices && r.picked !== null) mcContinue();
        return;
      }
    }
    if (!canTurnByGesture()) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); turnPage(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); turnPage(-1); }
  });
  window.addEventListener('beforeunload', function () {
    updateReadingProgress(true);
    if (canAutoSync() && navigator.sendBeacon) {
      try {
        navigator.sendBeacon(syncUrl(), new Blob([JSON.stringify(backupPayload())], { type: 'application/json' }));
      } catch (e) {}
    }
  });

  // ---------- 启动 ----------
  render();
  setTimeout(function () {
    try {
      state.bootMsg = '正在建立离线词典索引…';
      render();
      buildDict();
      state.bootMsg = '正在读取本地数据…';
      render();
      load().then(function () {
        applySettings();
        state.bootMsg = '正在检查雅思阅读文本…';
        render();
        return repairBundledIeltsArticles();
      }).then(function () {
        state.booting = false;
        render();
        startAutoSyncLoop();
      });
    } catch (e) {
      state.booting = false;
      state.storageError = '启动失败：' + (e && e.message ? e.message : e);
      render();
    }
  }, 0);
})();
