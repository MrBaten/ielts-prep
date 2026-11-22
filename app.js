(function () {
  "use strict";

  var D = window.IELTS_DATA;
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var TABS = ["today", "cards", "write", "speak", "practice", "progress"];

  // ================= utilities =================
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function keyOf(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (day < 10 ? "0" + day : day);
  }
  function dateOf(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
  function addDays(k, n) { var d = dateOf(k); d.setDate(d.getDate() + n); return keyOf(d); }
  function diffDays(a, b) { return Math.round((dateOf(b) - dateOf(a)) / 864e5); }
  function today() { return keyOf(new Date()); }
  function pretty(k) { var d = dateOf(k); return WD[d.getDay()] + ", " + d.getDate() + " " + MON[d.getMonth()] + " " + d.getFullYear(); }
  function short(k) { var d = dateOf(k); return d.getDate() + " " + MON[d.getMonth()]; }
  function startOfToday() { var d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function fmtMin(m) { return m >= 60 ? Math.floor(m / 60) + " h" + (m % 60 ? " " + (m % 60) + " min" : "") : m + " min"; }
  function fmtClock(sec) { sec = Math.max(0, Math.round(sec)); var m = Math.floor(sec / 60), s = sec % 60; return m + ":" + (s < 10 ? "0" : "") + s; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  function band(x) { return x == null || x === "" || isNaN(x) ? "–" : Number(x).toFixed(1); }
  function norm(s) { return String(s || "").toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9%'. -]/g, "").replace(/\s+/g, " ").replace(/^the |^a |^an /, "").trim(); }
  var $ = function (id) { return document.getElementById(id); };

  var ICON = {
    sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v4"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>'
  };

  var toastTimer;
  function toast(msg) {
    var t = $("toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 3200);
  }
  function setSync(t) { $("sync").textContent = t; }

  // ================= storage =================
  var LS = "ielts-tracker-v2";
  var S = { docs: {}, cloud: null, pending: {}, inflight: {}, timers: {} };

  function loadLocal() {
    try {
      var o = JSON.parse(localStorage.getItem(LS) || "null");
      if (o && o.docs) { S.docs = o.docs; return; }
      var old = JSON.parse(localStorage.getItem("study-routine-v1") || "null");
      if (old) {
        Object.keys(old.days || {}).forEach(function (k) { S.docs[k] = old.days[k]; });
        if (old.settings) S.docs.settings = old.settings;
      }
    } catch (e) { /* storage unavailable */ }
  }
  var lsTimer;
  function saveLocal() {
    clearTimeout(lsTimer);
    lsTimer = setTimeout(function () { try { localStorage.setItem(LS, JSON.stringify({ docs: S.docs })); } catch (e) {} }, 300);
  }
  function get(id) { return S.docs[id]; }
  function put(id, body) {
    S.docs[id] = body; saveLocal();
    if (!S.cloud) return;
    S.pending[id] = { body: body };
    clearTimeout(S.timers[id]);
    S.timers[id] = setTimeout(function () { flush(id); }, 700);
  }
  function del(id) {
    delete S.docs[id]; saveLocal();
    if (!S.cloud) return;
    S.pending[id] = { del: true };
    clearTimeout(S.timers[id]);
    S.timers[id] = setTimeout(function () { flush(id); }, 100);
  }
  function flush(id) {
    if (S.inflight[id] || !S.pending[id] || !S.cloud) return;
    var p = S.pending[id]; delete S.pending[id];
    S.inflight[id] = true;
    var ref = S.cloud.doc(id);
    (p.del ? ref.delete() : ref.set(p.body)).then(function () {
      S.inflight[id] = false;
      if (S.pending[id]) flush(id);
    }, function (err) {
      S.inflight[id] = false;
      var code = err && err.code;
      if (code === "unavailable") {
        if (!S.pending[id]) S.pending[id] = p;
        setTimeout(function () { flush(id); }, 800 + Math.random() * 800);
      } else if (code === "quota_exceeded") {
        toast("Your account storage for this page is full. Delete some old essays or sessions.");
      } else {
        setSync("Couldn't save to your account. Your work is kept on this device.");
      }
    });
  }
  function docsWithPrefix(pre) {
    return Object.keys(S.docs).filter(function (k) { return k.indexOf(pre) === 0; }).map(function (k) { return Object.assign({ id: k }, S.docs[k]); });
  }

  // ================= settings =================
  function settings() {
    return Object.assign({ holiday: 5, exam: "2027-02-14", target: 6.5, stretch: 7.5, newPerDay: 15 }, get("settings") || {});
  }
  function setSettings(patch) {
    var s = settings(); Object.assign(s, patch); s.updated = new Date().toISOString();
    put("settings", s);
  }

  // ================= routine =================
  var TYPES = [
    { id: "tired", name: "Tired", hint: "30 min" },
    { id: "normal", name: "Normal", hint: "1–2 hr" },
    { id: "good", name: "Good", hint: "2–3 hr" },
    { id: "holiday", name: "Holiday", hint: "4–5 hr" }
  ];
  var I = {
    vocabRead: { id: "vocabRead", t: "Vocabulary or reading", m: 15 },
    speak: { id: "speak", t: "Speaking practice (record and replay)", m: 15 },
    weak: { id: "weak", t: "Your weakest skill", m: 30 },
    test: { id: "test", t: "Reading or listening test", m: 30 },
    vocab: { id: "vocab", t: "Vocabulary", m: 15 },
    essay: { id: "essay", t: "Task 2 essay or a full listening test", m: 40 },
    mock: { id: "mock", t: "Full timed mock test", m: 165 },
    review: { id: "review", t: "Review mistakes from the mock", m: 60 },
    prof: { id: "prof", t: "Professor shortlist and CV", m: 60 },
    replies: { id: "replies", t: "Answer professor replies", m: 15 },
    email1: { id: "email1", t: "Email 1 professor (personal, CV and paper link)", m: 30 },
    sop: { id: "sop", t: "Statement of purpose or documents", m: 45 },
    shortlist: { id: "shortlist", t: "Find more matching professors", m: 45 },
    email3: { id: "email3", t: "Email 3 professors", m: 60 },
    docs: { id: "docs", t: "Statement of purpose and scholarship documents", m: 120 },
    tracker: { id: "tracker", t: "Update your application tracker", m: 30 }
  };
  function isAppsMode(k) { return k > settings().exam; }
  function tasksFor(k, type) {
    if (isAppsMode(k)) {
      if (type === "tired") return [I.replies, I.speak];
      if (type === "normal") return [I.email1, I.sop, I.speak];
      if (type === "good") return [I.email1, I.sop, I.speak, I.shortlist];
      return [I.email3, I.docs, I.tracker];
    }
    if (type === "tired") return [I.vocabRead, I.speak];
    if (type === "normal") return [I.weak, I.test, I.speak, I.vocab];
    if (type === "good") return [I.weak, I.test, I.speak, I.vocab, I.essay];
    var mo = dateOf(k).getMonth();
    return (mo === 10 || mo === 11) ? [I.mock, I.review] : [I.mock, I.review, I.prof];
  }
  function defaultType(k) { return dateOf(k).getDay() === +settings().holiday ? "holiday" : "normal"; }
  function dayRec(k) {
    var r = get(k);
    return { type: (r && r.type) || defaultType(k), done: (r && Array.isArray(r.done)) ? r.done.slice() : [] };
  }
  function scoreOf(k) {
    var r = dayRec(k), list = tasksFor(k, r.type), min = 0, total = 0, n = 0;
    list.forEach(function (it) { total += it.m; if (r.done.indexOf(it.id) !== -1) { min += it.m; n++; } });
    return { min: min, total: total, n: n, count: list.length, full: list.length > 0 && n === list.length, floor: min >= 30 };
  }
  function writeDay(k, r) { put(k, { type: r.type, done: r.done, updated: new Date().toISOString() }); }
  function autoTick(ids) {
    var k = today(), r = dayRec(k), list = tasksFor(k, r.type).map(function (i) { return i.id; });
    var hit = ids.filter(function (id) { return list.indexOf(id) !== -1 && r.done.indexOf(id) === -1; });
    if (!hit.length) return;
    r.done = r.done.concat(hit); writeDay(k, r);
    toast("Ticked in today's routine: " + hit.map(function (id) { return I[id].t; }).join(", "));
  }

  // ================= flashcards (spaced repetition) =================
  function srs() { var s = get("srs") || {}; return { cards: Object.assign({}, s.cards || {}), log: Object.assign({}, s.log || {}), newLog: Object.assign({}, s.newLog || {}) }; }
  function saveSrs(s) {
    var cut = addDays(today(), -90);
    [s.log, s.newLog].forEach(function (m) { Object.keys(m).forEach(function (k) { if (k < cut) delete m[k]; }); });
    put("srs", { cards: s.cards, log: s.log, newLog: s.newLog, updated: new Date().toISOString() });
  }
  // ---- card data (built-in cards are built once; your own cards are read fresh) ----
  var EX = window.IELTS_EX || {}, PRE = null, PRE_IDX = null;
  function exsOf(c) { return [c.ex, c.ex2, c.ex3].filter(function (x) { return x && String(x).trim(); }); }
  function preCards() {
    if (!PRE) {
      PRE = D.CARDS.map(function (a) { var e = EX[a[0]] || []; return { id: a[0], w: a[1], pos: a[2], def: a[3], ex: a[4], bn: a[5], topic: a[6], pre: true, lvl: e[0] || "B2", exs: [a[4], e[1], e[2]].filter(Boolean) }; });
      PRE_IDX = {}; PRE.forEach(function (c) { PRE_IDX[c.id] = c; });
    }
    return PRE;
  }
  function mineCard(id, d) { var c = Object.assign({ id: id }, d); c.topic = c.topic || "mine"; c.lvl = c.lvl || "B2"; c.exs = exsOf(c); return c; }
  function allCards() { return preCards().concat(docsWithPrefix("c_").map(function (d) { return mineCard(d.id, d); })); }
  function cardById(id) { preCards(); if (PRE_IDX[id]) return PRE_IDX[id]; var d = get(id); return d ? mineCard(id, d) : undefined; }

  // ---- levels, statuses and filters ----
  var LEVELS = [["all", "All levels"], ["basic", "Basic (A2–B1)"], ["inter", "Intermediate (B2)"], ["adv", "Advanced (C1–C2)"]];
  function lvlGroup(l) { return (l === "A2" || l === "B1") ? "basic" : (l === "B2" ? "inter" : "adv"); }
  function lvlName(l) { return { basic: "Basic", inter: "Intermediate", adv: "Advanced" }[lvlGroup(l)]; }
  var STATUSES = [["all", "Any status"], ["new", "Not started"], ["learning", "Learning now"], ["learnt", "Learnt"], ["mastered", "Mastered (21+ days)"], ["practised", "Practised (any)"], ["difficult", "Difficult (forgotten 2+ times)"], ["due", "Due now"]];
  var POS = [["all", "All word types"], ["noun", "Nouns"], ["verb", "Verbs"], ["adj", "Adjectives"], ["adv", "Adverbs"], ["phrase", "Phrases & linkers"]];
  function posGroup(p) { p = String(p || ""); if (p.indexOf("noun") === 0) return "noun"; if (p.indexOf("verb") === 0) return "verb"; if (p.indexOf("adj") === 0) return "adj"; if (p.indexOf("adv") === 0) return "adv"; return "phrase"; }
  function level(st) {
    if (!st) return "new";
    if (!st.reps) return "learning";
    return st.ivl >= 21 ? "mastered" : "review";
  }
  function matchStatus(st, f, now) {
    switch (f) {
      case "new": return !st;
      case "learning": return !!st && level(st) === "learning";
      case "learnt": return !!st && level(st) === "review";
      case "mastered": return !!st && level(st) === "mastered";
      case "practised": return !!st;
      case "difficult": return !!st && (st.lapses || 0) >= 2;
      case "due": return !!st && st.due <= now;
      default: return true;
    }
  }
  function filterCards(f) {
    var s = srs(), now = Date.now(), q = (f.q || "").toLowerCase().trim();
    return allCards().filter(function (c) {
      return (f.deck === "all" || !f.deck || c.topic === f.deck) &&
        (!f.level || f.level === "all" || lvlGroup(c.lvl) === f.level) &&
        (!f.pos || f.pos === "all" || posGroup(c.pos) === f.pos) &&
        matchStatus(s.cards[c.id], f.status || "all", now) &&
        (!q || c.w.toLowerCase().indexOf(q) !== -1 || c.def.toLowerCase().indexOf(q) !== -1 || (c.bn || "").indexOf(q) !== -1);
    });
  }

  // ---- scheduling: Anki-style learning steps (1, 5, 10 min) before a card graduates ----
  function schedule(prev, q) {
    var st = prev ? Object.assign({}, prev) : { ivl: 0, ease: 2.5, reps: 0, lapses: 0, step: 0 };
    var now = Date.now(), MIN = 60000;
    if (!st.reps) {
      // learning (new or relearning): failures here do not lower ease
      if (q === 0) { st.step = 0; st.due = now + MIN; }
      else if (q === 1) { st.due = now + 5 * MIN; }
      else if (q === 2) {
        if (!st.step) { st.step = 1; st.due = now + 10 * MIN; }
        else { st.reps = 1; st.step = 0; st.ivl = st.lastIvl ? Math.max(1, Math.round(st.lastIvl * 0.5)) : 1; st.due = startOfToday() + st.ivl * 864e5; }
      } else { st.reps = 1; st.step = 0; st.ivl = st.lastIvl ? Math.max(2, Math.round(st.lastIvl * 0.7)) : 4; st.due = startOfToday() + st.ivl * 864e5; }
    } else if (q === 0) {
      st.lapses = (st.lapses || 0) + 1; st.lastIvl = st.ivl; st.reps = 0; st.step = 0; st.ivl = 0;
      st.ease = Math.max(1.3, st.ease - 0.2); st.due = now + 10 * MIN;
    } else {
      var ivl;
      if (q === 1) { ivl = Math.max(st.ivl + 1, Math.round(st.ivl * 1.2)); st.ease = Math.max(1.3, st.ease - 0.15); }
      else if (q === 2) { ivl = Math.max(st.ivl + 1, Math.round(st.ivl * st.ease)); }
      else { ivl = Math.max(st.ivl + 2, Math.round(st.ivl * st.ease * 1.3)); st.ease = st.ease + 0.15; }
      st.ivl = Math.min(ivl, 365); st.reps = (st.reps || 0) + 1; st.due = startOfToday() + st.ivl * 864e5;
    }
    st.last = now;
    return st;
  }
  function ivlLabel(prev, q) {
    var n = schedule(prev, q), ms = n.due - Date.now();
    if (ms < 3600000) return Math.max(1, Math.round(ms / 60000)) + " min";
    var d = n.ivl;
    return d < 30 ? d + "d" : Math.round(d / 30) + " mo";
  }
  function deckCards(deck) { return filterCards({ deck: deck || "all", level: ui.cards.level || "all" }); }
  function dueCount(deck) {
    var s = srs(), now = Date.now();
    return allCards().filter(function (c) { var st = s.cards[c.id]; return (deck === "all" || !deck || c.topic === deck) && st && st.due <= now; }).length;
  }
  function newLeft() { var s = srs(); return Math.max(0, settings().newPerDay - (s.newLog[today()] || 0)); }
  function buildQueue(deck) {
    var s = srs(), now = Date.now(), cards = deckCards(deck);
    var due = cards.filter(function (c) { var st = s.cards[c.id]; return st && st.due <= now; })
      .sort(function (a, b) { return s.cards[a.id].due - s.cards[b.id].due; });
    var fresh = cards.filter(function (c) { return !s.cards[c.id]; }).slice(0, newLeft());
    return due.concat(fresh).map(function (c) { return c.id; });
  }

  // ================= bands, mocks, weakest skill =================
  function overallBand(l, r, w, s) {
    var v = [l, r, w, s].map(Number);
    if (v.some(function (x) { return isNaN(x) || x <= 0; })) return null;
    var avg = (v[0] + v[1] + v[2] + v[3]) / 4;
    return Math.floor(avg * 2 + 0.5) / 2;
  }
  function rawToBand(raw, table) {
    raw = Number(raw); if (isNaN(raw) || raw < 0 || raw > 40) return null;
    for (var i = 0; i < table.length; i++) if (raw >= table[i][0]) return table[i][1];
    return raw > 0 ? 2 : 0;
  }
  function mocks() { var m = get("mocks"); return ((m && m.list) || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }); }
  var SKILLS = [["L", "Listening", "practice"], ["R", "Reading", "practice"], ["W", "Writing", "write"], ["S", "Speaking", "speak"]];
  function weakest() {
    var m = mocks(); if (!m.length) return null;
    var last = m[m.length - 1], best = null;
    ["W", "S", "R", "L"].forEach(function (k) {
      var v = Number(last[k]);
      if (!isNaN(v) && (best === null || v < best.band)) best = { key: k, band: v };
    });
    if (!best) return null;
    var sk = SKILLS.filter(function (s) { return s[0] === best.key; })[0];
    return { key: best.key, name: sk[1], tab: sk[2], band: best.band };
  }
  function drills() { var d = get("drills"); return (d && d.list) || []; }
  function drillBank() { var b = get("drillbank"); return ((b && b.list) || []).slice().reverse(); }
  function saveToBank(d) {
    var b = get("drillbank"), list = ((b && b.list) || []).slice();
    var id = uid(); list.push({ id: id, date: today(), data: d, score: null, total: allQs(d).length });
    while (list.length > 20) list.shift();
    put("drillbank", { list: list, updated: new Date().toISOString() });
    return id;
  }
  function markBank(id, score) {
    var b = get("drillbank"); if (!b || !b.list) return;
    var list = b.list.map(function (x) { return x.id === id ? Object.assign({}, x, { score: score }) : x; });
    put("drillbank", { list: list, updated: new Date().toISOString() });
  }
  function drillPrompt(kind, typeId, topicIn, section) {
    var D4x = window.IELTS_DATA4 || { RQ: [], LQ: [] }, list = kind === "reading" ? D4x.RQ : D4x.LQ;
    var topic = (topicIn || "").trim() ? topicIn.trim() : "any typical IELTS topic (science, history, society, environment, psychology, technology, education, work)";
    var picked;
    if (typeId === "mixed") {
      picked = list.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 3);
      if (kind === "reading" && picked.some(function (t) { return t.id === "ynng"; }) && picked.some(function (t) { return t.id === "tfng"; })) picked = picked.filter(function (t) { return t.id !== "tfng"; }).concat([list.filter(function (t) { return t.id === "sent"; })[0]]);
    } else picked = list.filter(function (t) { return t.id === typeId; }).slice(0, 1);
    if (!picked.length) picked = list.slice(0, 1);
    var groupRules = picked.map(function (t, i) { return (i + 1) + ". " + t.spec; }).join("\n");
    var schema = '"groups": [{"type": "the group type id", "instructions": "the IELTS instruction line, including any word limit", "options": ["optional shared list for matching, word boxes and map letters"], "outline": {"style": "form | notes | table | flowchart | summary", "rows": [["cell", "cell with a gap like [1]"]]}, "map": {"cols": 3, "rows": 3, "cells": [{"r": 0, "c": 0, "t": "label"}]}, "questions": [{"q": "...", "options": ["only for multiple choice or TRUE/FALSE style"], "answer": "... or an array for choose-two", "alt": ["accepted variants"], "explanation": "why, quoting or pointing to the evidence"}]}]';
    var common = 'Leave out "options", "outline" or "map" when a group does not use them. In an outline, [1] means the group’s first question, [2] its second, and so on; every question must appear exactly once as a gap. Every answer must be clearly supported by the text. Names, places and figures must be invented.';
    if (kind === "reading") {
      return 'Write an original IELTS Academic Reading practice set.\nTopic: ' + topic + '.\nPassage: 450 to 550 words, formal academic style, 5 paragraphs labelled A to E. Paraphrase between passage and questions, as the real test does.\nQuestion groups, in this order:\n' + groupRules + '\n' + common + '\nReply with only JSON: {"title": "...", "paragraphs": [{"label": "A", "text": "..."}], ' + schema + '}';
    }
    return 'Write an original IELTS Listening practice script for ' + (section || "Section 1: an everyday conversation") + '. Topic: ' + topic + '.\nLength: 350 to 450 words of natural spoken English, with small hesitations and at least two typical IELTS distractors (a speaker correcting a number, date or spelling, or rejecting the first option mentioned). Answers must be heard in the same order as the questions.\nQuestion groups, in this order:\n' + groupRules + '\n' + common + '\nReply with only JSON: {"title": "...", "context": "one line describing the situation", "lines": [{"speaker": "name or role", "text": "one turn of speech"}], ' + schema + '}';
  }
  function loadDrill(d, bankId) {
    var p = ui.practice; stopSay();
    p.data = d; p.kind = d.kind; p.bankId = bankId; p.sampleId = null; p.answers = {}; p.checked = false; p.plays = 0; p.playing = false; p.script = false;
    tSet("practice", 0, "up"); if (p.kind === "reading") tStart("practice");
    render();
    setTimeout(function () { var el = document.querySelector(".passage") || document.querySelector(".qgroup"); if (el && el.scrollIntoView) el.closest("section").scrollIntoView({ behavior: "smooth", block: "start" }); }, 30);
  }
  function validDrill(d) { return d && groupsOf(d).some(function (g) { return g.questions && g.questions.length; }); }
  async function runDrill(kind, typeId) {
    var p = ui.practice;
    try {
      var d = await aiCall("genDrill", drillPrompt(kind, typeId, p.topic, p.lsec), "default");
      if (!validDrill(d)) throw { code: "invalid_json" };
      d.kind = kind; d.type = typeId === "mixed" ? "Mixed set" : typeName(kind, typeId);
      loadDrill(d, saveToBank(d));
    } catch (e) { aiFail(e); }
  }
  function addDrill(entry) {
    var list = drills().concat([entry]); if (list.length > 300) list = list.slice(-300);
    put("drills", { list: list, updated: new Date().toISOString() });
  }

  // ================= Claude capabilities =================
  var AI = null, TTS = null, DICT = null, ttsOff = false;
  var dictState = "idle";

  // ---------- AI through your own API key (installed app outside Claude) ----------
  var KEY_LS = "ielts-ai-key";
  function keyCfg() { try { var c = JSON.parse(localStorage.getItem(KEY_LS) || "null"); return c && c.key ? c : null; } catch (e) { return null; } }
  function parseJsonLoose(t) {
    t = String(t || "").trim();
    try { return JSON.parse(t); } catch (e) {}
    var f = t.match(/```(?:json)?\s*([\s\S]*?)```/); if (f) { try { return JSON.parse(f[1]); } catch (e) {} }
    var a = t.search(/[\[{]/), b = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
    if (a !== -1 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch (e) {} }
    return undefined;
  }
  function httpErr(s) { return { code: s === 401 || s === 403 ? "bad_key" : s === 402 ? "no_credit" : s === 429 ? "rate_limited" : "upstream_error" }; }
  function makeKeyAI(cfg) {
    async function json(prompt, opts) {
      opts = opts || {};
      if (!navigator.onLine) throw { code: "offline" };
      var quick = opts.modelTier === "quick", text = "";
      var full = prompt + "\n\nReply with only the JSON value, with no other text.";
      try {
        if (cfg.provider === "anthropic") {
          var r = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST", signal: opts.signal,
            headers: { "x-api-key": cfg.key, "anthropic-version": "2023-06-01", "content-type": "application/json", "anthropic-dangerous-direct-browser-access": "true" },
            body: JSON.stringify({ model: quick ? "claude-haiku-5-5" : "claude-sonnet-5-5", max_tokens: 8000, messages: [{ role: "user", content: full }] })
          });
          if (!r.ok) throw httpErr(r.status);
          var d = await r.json();
          text = (d.content || []).filter(function (b) { return b.type === "text"; }).map(function (b) { return b.text; }).join("");
        } else {
          var r2 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST", signal: opts.signal,
            headers: { "Authorization": "Bearer " + cfg.key, "content-type": "application/json", "HTTP-Referer": location.origin, "X-Title": "IELTS Prep Tracker" },
            body: JSON.stringify({ model: quick ? "anthropic/claude-haiku-5.5" : "anthropic/claude-sonnet-5.5", max_tokens: 8000, messages: [{ role: "user", content: full }] })
          });
          if (!r2.ok) throw httpErr(r2.status);
          var d2 = await r2.json();
          text = (d2.choices && d2.choices[0] && d2.choices[0].message && d2.choices[0].message.content) || "";
        }
      } catch (e) {
        if (e && e.name === "AbortError") throw { code: "cancelled" };
        if (e && e.code) throw e;
        throw { code: navigator.onLine ? "network" : "offline" };
      }
      var v = parseJsonLoose(text);
      if (v === undefined) throw { code: "invalid_json" };
      return v;
    }
    return { json: json, keyBased: true };
  }
  function aiReady() { return !!AI && (!AI.keyBased || navigator.onLine); }

  // speech-to-text through the browser (installed app; needs internet on most phones)
  function makeWebSpeech() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return null;
    var rec = null, state = "idle", hf = [], hp = [], hs = [];
    function setState(s, reason) { state = s; hs.forEach(function (h) { h({ state: s, reason: reason }); }); }
    return {
      webSpeech: true,
      start: function () {
        return new Promise(function (res, rej) {
          try {
            rec = new SR(); rec.lang = "en-GB"; rec.continuous = true; rec.interimResults = true;
            rec.onstart = function () { setState("listening"); res(); };
            rec.onresult = function (e) {
              var interim = "";
              for (var i = e.resultIndex; i < e.results.length; i++) {
                var r = e.results[i];
                if (r.isFinal) { var t = r[0].transcript.trim(); if (t) hf.forEach(function (h) { h({ text: " " + t }); }); }
                else interim += r[0].transcript;
              }
              hp.forEach(function (h) { h({ text: interim }); });
            };
            rec.onerror = function (e) {
              var c = (e.error === "not-allowed" || e.error === "service-not-allowed") ? "not_granted" : (e.error === "network" ? "network" : "upstream_error");
              if (state === "starting") rej({ code: c });
              setState("idle", c);
            };
            rec.onend = function () { hp.forEach(function (h) { h({ text: "" }); }); if (state !== "idle") setState("idle", "stopped"); };
            setState("starting"); rec.start();
          } catch (e) { setState("idle", "upstream_error"); rej({ code: "unavailable" }); }
        });
      },
      stop: function () { try { if (rec) rec.stop(); } catch (e) {} return Promise.resolve(); },
      active: function () { return state !== "idle"; },
      onFinal: function (h) { hf.push(h); }, onPartial: function (h) { hp.push(h); }, onState: function (h) { hs.push(h); }
    };
  }

  function aiErrMsg(e) {
    var code = e && e.code;
    if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].indexOf(code) !== -1) {
      AI = null; return "AI features are turned off for this page.";
    }
    var m = {
      cancelled: "",
      rate_limited: "Too many AI requests, or your Claude usage limit is reached. Try again later.",
      refused: "Claude declined this request. Try different wording.",
      invalid_json: "The AI answer came back in the wrong format. Please try again.",
      empty_completion: "The AI gave an empty answer. Please try again.",
      session_expired: "Please sign in to Claude again.",
      prompt_too_large: "That text is too long to send. Try a shorter piece.",
      not_available: "AI features need the Claude version, or an API key in Progress → AI settings.",
      offline: "You’re offline. AI features work again when you’re back online.",
      bad_key: "Your API key was rejected. Check it in Progress → AI settings.",
      no_credit: "Your API account has run out of credit.",
      network: "Couldn’t reach the AI service. Check your internet connection."
    };
    return code in m ? m[code] : "Something went wrong with the AI request. Please try again.";
  }
  async function aiCall(key, prompt, tier) {
    if (!AI) throw { code: "not_available" };
    if (!aiReady()) throw { code: "offline" };
    var ctl = new AbortController();
    ui.busy = { key: key, ctl: ctl }; render();
    try {
      return await AI.json(prompt, { modelTier: tier || "default", cache: false, signal: ctl.signal });
    } finally {
      if (ui.busy && ui.busy.key === key) ui.busy = null;
    }
  }
  function aiFail(e) { var m = aiErrMsg(e); if (m) toast(m); render(); }
  function busyBlock(key) {
    if (!ui.busy || ui.busy.key !== key) return "";
    return '<div class="thinking"><span>Claude is thinking<span class="dots"></span> this can take up to a minute.</span><button class="btn ghost small" data-act="stopAi">Stop</button></div>';
  }
  function aiNote() {
    if (aiReady()) return "";
    if (window.claude) return '<p class="note">AI features (marking, feedback, new drills) switch on when you allow Claude for this page.</p>';
    if (AI && !navigator.onLine) return '<p class="note">You’re offline: AI features come back when you’re online. Everything else works.</p>';
    return '<p class="note">AI features (marking, feedback, new drills): add an API key in <a href="#progress">Progress → AI settings</a>, or use the Claude version.</p>';
  }

  var persisted = null;
  function askPersist() {
    if (window.claude || persisted !== null || !navigator.storage || !navigator.storage.persist) return;
    navigator.storage.persisted().then(function (p) { if (p) { persisted = true; return; } return navigator.storage.persist().then(function (g) { persisted = !!g; }); }).catch(function () { persisted = false; });
  }
  function markBackup() { try { localStorage.setItem("ielts-last-backup", String(Date.now())); } catch (e) {} }
  function backupDue() {
    if (window.claude) return false;
    var n = 0, last = 0; try { last = +localStorage.getItem("ielts-last-backup") || 0; } catch (e) {}
    n = Object.keys(srs().cards).length;
    return n >= 20 && Date.now() - last > 14 * 864e5;
  }
  function hasLocalVoice() {
    try { return speechSynthesis.getVoices().some(function (v) { return /^en/i.test(v.lang) && v.localService; }); } catch (e) { return false; }
  }
  function canSay() { return !ttsOff && (TTS || ("speechSynthesis" in window)); }
  function sayFallback(text, rate, pitch) {
    return new Promise(function (res, rej) {
      if (!("speechSynthesis" in window)) return rej({ code: "unavailable" });
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "en-GB"; u.rate = rate || 1; u.pitch = pitch || 1;
      var vs = speechSynthesis.getVoices();
      var v = vs.filter(function (x) { return /en-GB/i.test(x.lang); })[0] || vs.filter(function (x) { return /^en/i.test(x.lang); })[0];
      if (v) u.voice = v;
      u.onend = function () { res(); };
      u.onerror = function () { res(); };
      speechSynthesis.speak(u);
    });
  }
  function say(text, rate) {
    if (ttsOff) return Promise.resolve();
    if (TTS) {
      return TTS.speak(String(text).slice(0, 1900), { language: "en-GB", rate: rate || 1 }).catch(function (e) {
        if (e && e.code === "not_granted") { ttsOff = true; render(); }
        else if (e && e.code !== "stopped") toast("Couldn't play audio right now.");
      });
    }
    try { speechSynthesis.cancel(); } catch (e) {}
    return sayFallback(text, rate);
  }
  function stopSay() {
    if (TTS) TTS.stop().catch(function () {});
    try { speechSynthesis.cancel(); } catch (e) {}
  }
  function speakBtn(text) {
    if (!canSay()) return "";
    return '<button class="iconbtn speak" data-act="say" data-text="' + esc(text) + '" aria-label="Listen to pronunciation">' + ICON.sound + "</button>";
  }

  // ================= timers =================
  var T = {};
  function tSet(name, total, mode) { T[name] = { total: total, mode: mode, acc: 0, at: 0, running: false }; }
  function tStart(name) { var t = T[name]; if (t && !t.running) { t.running = true; t.at = Date.now(); } }
  function tPause(name) { var t = T[name]; if (t && t.running) { t.acc += Date.now() - t.at; t.running = false; } }
  function tElapsed(name) { var t = T[name]; if (!t) return 0; return (t.acc + (t.running ? Date.now() - t.at : 0)) / 1000; }
  function tLeft(name) { var t = T[name]; return t ? t.total - tElapsed(name) : 0; }
  function tText(name) {
    var t = T[name]; if (!t) return "0:00";
    if (t.mode === "up") return fmtClock(tElapsed(name));
    var left = tLeft(name);
    return left >= 0 ? fmtClock(left) : "+" + fmtClock(-left);
  }
  function tClass(name) {
    var t = T[name]; if (!t || t.mode === "up") return "timer";
    var left = tLeft(name);
    return "timer" + (left < 0 ? " over" : (left < Math.min(300, t.total * 0.15) ? " low" : ""));
  }
  function paintTimers() {
    var els = document.querySelectorAll("[data-timer]");
    for (var i = 0; i < els.length; i++) {
      var n = els[i].getAttribute("data-timer");
      els[i].textContent = tText(n); els[i].className = tClass(n);
    }
  }
  setInterval(function () {
    paintTimers();
    // speaking part 2 flow: prep -> talk -> done
    if (ui.speak.phase === "prep" && tLeft("speak") <= 0) {
      ui.speak.phase = "talk"; tSet("speak", 120, "down"); tStart("speak");
      toast("Start speaking now: 2 minutes."); if (ui.tab === "speak") render();
    } else if (ui.speak.phase === "talk" && ui.speak.part === 2 && tLeft("speak") <= 0) {
      tPause("speak"); ui.speak.phase = "done"; ui.speak.secs = 120;
      toast("Time's up. In the real test the examiner stops you here."); if (ui.tab === "speak") render();
    }
  }, 250);

  // ================= UI state =================
  var ui = {
    tab: "today",
    sel: today(),
    busy: null,
    confirm: null,
    cards: { mode: "home", deck: "all", level: "all", search: "", session: null, spell: null, quiz: null, cloze: null, b: { deck: "all", level: "all", status: "all", pos: "all" }, add: { w: "", pos: "", def: "", ex: "", ex2: "", ex3: "", bn: "", topic: "mine", lvl: "B2" }, showAll: false },
    write: { task: 2, pi: Math.floor(Math.random() * D.TASK2.length), p1: 0, custom: null, text: "", result: null, view: null, plan: false, savedId: null },
    speak: { part: 2, idx: Math.floor(Math.random() * D.PART2.length), p1: Math.floor(Math.random() * D.PART1.length), phase: "idle", notes: "", text: "", partial: "", result: null, view: null, secs: 0, savedId: null },
    practice: { kind: "reading", rtype: "tfng", ltype: "lform", lsec: "Section 1: an everyday conversation", topic: "", data: null, answers: {}, checked: false, exam: true, plays: 0, playing: false, script: false },
    progress: { form: { date: today(), L: "", R: "", W: "", S: "", Lraw: "", Rraw: "" }, mfilter: "all", mform: { skill: "Writing", wrong: "", right: "", note: "" }, mquiz: null, restore: false, restoreText: "", backupText: "" }
  };
  try { var dr = JSON.parse(localStorage.getItem("ielts-drafts") || "null"); if (dr) { ui.write.text = dr.write || ""; ui.speak.text = dr.speak || ""; } } catch (e) {}
  var draftTimer;
  function saveDrafts() {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(function () { try { localStorage.setItem("ielts-drafts", JSON.stringify({ write: ui.write.text, speak: ui.speak.text })); } catch (e) {} }, 400);
  }
  tSet("write", 40 * 60, "down");
  tSet("speak", 60, "down");
  tSet("practice", 20 * 60, "up");

  // ================= text analysis =================
  function textStats(t) {
    var words = t.match(/[A-Za-z][A-Za-z'’-]*|\d+(?:[.,]\d+)?%?/g) || [];
    var paras = t.split(/\n+/).filter(function (p) { return p.trim(); }).length;
    var sents = (t.match(/[^.!?]+[.!?]+/g) || []).length || (t.trim() ? 1 : 0);
    var low = " " + t.toLowerCase().replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ") + " ";
    var linkers = D.LINKERS.filter(function (l) { return low.indexOf(" " + l + " ") !== -1; });
    var freq = {};
    words.forEach(function (w) { w = w.toLowerCase(); if (w.length >= 4 && D.STOP.indexOf(w) === -1) freq[w] = (freq[w] || 0) + 1; });
    var rep = Object.keys(freq).filter(function (w) { return freq[w] >= 4; }).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 3).map(function (w) { return w + " ×" + freq[w]; });
    var fill = (t.match(/\b(um+|uh+|erm+|er|you know|i mean|basically|actually|like)\b/gi) || []).length;
    return { words: words.length, paras: paras, sents: sents, avg: sents ? Math.round(words.length / sents) : 0, linkers: linkers, rep: rep, fillers: fill };
  }

  // ================= render =================
  var view = $("view");
  function render() {
    var st = settings(), t = today();
    var toExam = diffDays(t, st.exam);
    $("countdown").textContent = toExam > 0 ? toExam + " days to exam" : (toExam === 0 ? "Exam today" : "Exam done");
    $("targetChip").textContent = "Target " + band(st.target) + (st.stretch > st.target ? " · aim " + band(st.stretch) : "");
    $("phaseLine").textContent = isAppsMode(t) ? "Applications phase" : "IELTS Academic · exam " + short(st.exam);
    var links = document.querySelectorAll(".tabbar a");
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute("data-tab") === ui.tab) links[i].setAttribute("aria-current", "page"); else links[i].removeAttribute("aria-current");
    }
    var due = dueCount("all"), b = $("dueBadge");
    b.hidden = !due; b.textContent = due > 99 ? "99+" : due;
    var fn = { today: viewToday, cards: viewCards, write: viewWrite, speak: viewSpeak, practice: viewPractice, progress: viewProgress }[ui.tab];
    view.innerHTML = fn();
    paintTimers();
  }
  function softRender() {
    var a = document.activeElement;
    if (a && view.contains(a) && /^(TEXTAREA|INPUT|SELECT)$/.test(a.tagName) && a.type !== "checkbox" && a.type !== "radio") return;
    render();
  }
  function confirmBlock(key, text) {
    if (!ui.confirm || ui.confirm.key !== key) return "";
    return '<div class="confirm"><span>' + esc(text) + '</span><div class="row"><button class="btn danger small" data-act="confirmYes">Yes, delete</button><button class="btn ghost small" data-act="confirmNo">Cancel</button></div></div>';
  }

  // ---------------- TODAY ----------------
  function viewToday() {
    var t = today(), k = ui.sel, r = dayRec(k), list = tasksFor(k, r.type), s = scoreOf(k);
    var due = dueCount("all"), weak = weakest(), st = settings();
    var sr = srs(), reviews7 = 0;
    for (var i = 0; i < 7; i++) reviews7 += sr.log[addDays(t, -i)] || 0;
    var wk = addDays(t, -6);
    var essays7 = docsWithPrefix("e_").filter(function (e) { return e.date >= wk; });
    var speaks7 = docsWithPrefix("s_").filter(function (e) { return e.date >= wk; }).length;
    var drills7 = drills().filter(function (d) { return d.date >= wk; });
    var dAcc = drills7.length ? Math.round(100 * drills7.reduce(function (a, d) { return a + d.score; }, 0) / Math.max(1, drills7.reduce(function (a, d) { return a + d.total; }, 0))) : null;
    var graded = essays7.filter(function (e) { return e.result && e.result.overall; });
    var essayAvg = graded.length ? (graded.reduce(function (a, e) { return a + Number(e.result.overall); }, 0) / graded.length) : null;

    var h = backupDue() ? '<section class="card notice"><b>Back up your progress</b><p class="note">It has been over 2 weeks. A backup file keeps your words safe if the phone is reset.</p><div class="row"><button class="btn small" data-act="downloadBackup">Save backup file</button><button class="btn ghost small" data-act="snoozeBackup">Later</button></div></section>' : "";
    h += '<section class="card"><div class="row between"><h2>Focus today</h2><span class="note">' + esc(pretty(t)) + '</span></div><div class="tiles">';
    h += '<button class="tile' + (due > 30 ? " alert" : "") + '" data-act="go" data-tab="cards"><b>' + due + '</b><span>flashcards due' + (newLeft() ? " · " + newLeft() + " new" : "") + '</span></button>';
    if (weak) {
      var gap = st.target - weak.band;
      h += '<button class="tile' + (gap > 0 ? " alert" : "") + '" data-act="go" data-tab="' + weak.tab + '"><b>' + esc(weak.name) + '</b><span>weakest skill · ' + band(weak.band) + (gap > 0 ? ", " + gap.toFixed(1) + " below target" : "") + '</span></button>';
    } else {
      h += '<button class="tile" data-act="go" data-tab="progress"><b>?</b><span>weakest skill: log a mock test to find it</span></button>';
    }
    h += '<button class="tile" data-act="go" data-tab="write"><b>' + essays7.length + '</b><span>' + (essays7.length === 1 ? "essay" : "essays") + ' this week' + (essayAvg ? " · avg " + band(Math.round(essayAvg * 2) / 2) : "") + '</span></button>';
    h += '</div><p class="note">Last 7 days: ' + plural(reviews7, "card review") + ' · ' + plural(speaks7, "speaking session") + ' · ' + plural(drills7.length, "drill") + (dAcc !== null ? " (" + dAcc + "% correct)" : "") + '.</p></section>';

    // routine
    var label = k === t ? "Today" : (k === addDays(t, -1) ? "Yesterday" : (k === addDays(t, 1) ? "Tomorrow" : WD[dateOf(k).getDay()]));
    h += '<section class="card"><h2>Routine</h2><div class="datebar"><button class="iconbtn" data-act="dayPrev" aria-label="Previous day">' + ICON.prev + '</button><div class="label">' + label + '<small>' + esc(pretty(k)) + '</small></div><button class="iconbtn" data-act="dayNext" aria-label="Next day">' + ICON.next + '</button></div>';
    if (k !== t) h += '<button class="btn ghost small" data-act="dayToday">Back to today</button>';
    h += '<div class="seg" role="group" aria-label="What kind of day is it?">';
    TYPES.forEach(function (ty) { h += '<button type="button" data-act="setType" data-type="' + ty.id + '" aria-pressed="' + (ty.id === r.type) + '">' + ty.name + '<span>' + ty.hint + '</span></button>'; });
    h += '</div><div class="row between small num"><span>' + s.n + ' of ' + s.count + ' done</span><span>' + s.min + ' / ' + s.total + ' min</span></div>';
    h += '<div class="bar" aria-hidden="true"><i style="width:' + (s.total ? Math.round(s.min / s.total * 100) : 0) + '%"></i></div>';
    h += '<span class="floor ' + (s.floor ? "met" : "not") + '">' + (s.full ? "All done. Good work." : (s.floor ? "30-minute floor met" : "30-minute floor not met yet")) + '</span><ul class="tasks">';
    list.forEach(function (it) {
      var on = r.done.indexOf(it.id) !== -1;
      h += '<li><label class="task' + (on ? " done" : "") + '" for="cb-' + it.id + '"><input type="checkbox" id="cb-' + it.id + '" data-ch="tick" data-id="' + it.id + '"' + (on ? " checked" : "") + '><span class="t">' + esc(it.t) + '</span><span class="m">' + fmtMin(it.m) + '</span></label></li>';
    });
    h += '</ul><p class="note">Some items tick themselves: 20 card reviews, a marked essay, a saved speaking session, a finished drill or a logged mock test.</p></section>';

    // record
    var streak = 0, cur = scoreOf(t).floor ? t : addDays(t, -1);
    while (scoreOf(cur).floor && streak < 400) { streak++; cur = addDays(cur, -1); }
    var met = 0, mins = 0;
    for (var j = 0; j < 7; j++) { var sc = scoreOf(addDays(t, -j)); if (sc.floor) met++; mins += sc.min; }
    h += '<section class="card"><h2>Last 14 days</h2><div class="tiles">';
    h += '<div class="tile"><b>' + streak + '</b><span>day streak</span></div><div class="tile"><b>' + met + '/7</b><span>days met the floor</span></div><div class="tile"><b>' + (mins >= 60 ? Math.floor(mins / 60) + "h" + (mins % 60 ? " " + (mins % 60) + "m" : "") : mins + "m") + '</b><span>studied, last 7 days</span></div></div><div class="strip">';
    for (var d = 13; d >= 0; d--) {
      var dk = addDays(t, -d), sc2 = scoreOf(dk);
      h += '<button class="day' + (sc2.full ? " full" : (sc2.floor ? " partial" : "")) + (dk === k ? " sel" : "") + '" data-act="pickDay" data-day="' + dk + '" aria-label="' + esc(pretty(dk)) + ': ' + sc2.min + ' minutes"></button>';
    }
    h += '</div><div class="row between note"><span>' + short(addDays(t, -13)) + '</span><span>Today</span></div><div class="legend"><span><i></i>Not met</span><span><i class="p"></i>30+ min</span><span><i class="f"></i>All tasks done</span></div></section>';
    return h;
  }

  // ---------------- CARDS ----------------
  var autoPlay = false;
  try { autoPlay = localStorage.getItem("ielts-autoplay") === "1"; } catch (e) {}
  function deckName(k) { return k === "all" ? "All decks" : (D.TOPICS[k] || k); }
  function sessHead(closeAct, i, n, extra) {
    var pct = n ? Math.round(i / n * 100) : 0;
    return '<div class="sesshead"><button class="iconbtn" data-act="' + closeAct + '" aria-label="Close">✕</button><div class="bar grow" aria-hidden="true"><i style="width:' + pct + '%"></i></div><span class="note num">' + Math.min(i + 1, n) + '/' + n + '</span>' + (extra || "") + '</div>';
  }
  function chipRow(act, items, current, counts) {
    var h = '<div class="deckbar" role="group">';
    items.forEach(function (it) {
      var n = counts ? counts[it[0]] : null;
      if (counts && !n && it[0] !== "all" && it[0] !== "mine") return;
      h += '<button class="deckchip" data-act="' + act + '" data-v="' + it[0] + '" aria-pressed="' + (current === it[0]) + '">' + esc(it[1]) + (n != null ? ' <span>' + n + '</span>' : "") + '</button>';
    });
    return h + '</div>';
  }
  function viewCards() {
    var c = ui.cards;
    if (c.mode === "review") return viewReview();
    if (c.mode === "spell") return viewSpell();
    if (c.mode === "quiz") return viewQuiz();
    if (c.mode === "match") return viewMatch();
    if (c.mode === "cloze") return viewCloze();
    if (c.mode === "browse") return viewBrowse();
    var s = srs(), cards = deckCards(c.deck), now = Date.now();
    var counts = { due: 0, learning: 0, review: 0, mastered: 0, "new": 0, difficult: 0 };
    cards.forEach(function (x) { var st = s.cards[x.id]; counts[level(st)]++; if (st && st.due <= now) counts.due++; if (st && (st.lapses || 0) >= 2) counts.difficult++; });
    var q = buildQueue(c.deck).length, total = Math.max(1, cards.length);
    var fresh = Math.min(newLeft(), counts["new"]);
    var scope = deckName(c.deck) + (c.level !== "all" ? " · " + LEVELS.filter(function (l) { return l[0] === c.level; })[0][1] : "");
    var h = '<section class="card hero"><div class="row between"><div><div class="note">' + esc(scope) + '</div><div class="hero-num num">' + q + '</div><div class="note">' + (q ? "cards ready · " + counts.due + " due, " + fresh + " new" : "All caught up. Try a drill below.") + '</div></div><div class="streakbox"><b class="num">' + (s.log[today()] || 0) + '</b><span>reviewed today</span></div></div>';
    h += '<div class="stack" aria-hidden="true"><i class="m" style="width:' + (counts.mastered / total * 100) + '%"></i><i class="l" style="width:' + ((counts.learning + counts.review) / total * 100) + '%"></i></div>';
    h += '<div class="legend"><span><i class="f"></i>Mastered ' + counts.mastered + '</span><span><i class="p"></i>Learnt or learning ' + (counts.learning + counts.review) + '</span><span><i></i>Not started ' + counts["new"] + '</span></div>';
    h += '<button class="btn big wide" data-act="startReview"' + (q ? "" : " disabled") + '>' + (q ? "Start review" : "Nothing due right now") + '</button></section>';

    // level filter
    var lc = { all: 0, basic: 0, inter: 0, adv: 0 };
    filterCards({ deck: c.deck }).forEach(function (x) { lc.all++; lc[lvlGroup(x.lvl)]++; });
    h += '<div class="filterlabel">Level</div>' + chipRow("setLevel", LEVELS, c.level, lc);
    // deck filter
    var dc = { all: 0 };
    filterCards({ level: c.level }).forEach(function (x) { dc.all++; dc[x.topic] = (dc[x.topic] || 0) + 1; });
    h += '<div class="filterlabel">Deck</div>' + chipRow("setDeck", [["all", "All decks"]].concat(Object.keys(D.TOPICS).map(function (k) { return [k, D.TOPICS[k]]; })), c.deck, dc);

    h += '<div class="modes">';
    h += modeTile("cloze", "Gap-fill", "Recall the word inside a real sentence: the most effective drill", "✎");
    h += modeTile("match", "Match game", "Pair 6 words with their meanings against the clock", "⚡");
    h += modeTile("spell", "Spelling drill", "Hear a word, type it: trains Listening spelling", "🎧");
    h += modeTile("quiz", "Meaning quiz", "Pick the right word for each meaning", "✓");
    h += modeTile("difficult", "Difficult words", counts.difficult ? counts.difficult + " words you keep forgetting" : "Words you forget twice appear here", "!");
    h += modeTile("browse", "Browse & filter", "Filter by level, status and type; add your own words", "⌕");
    h += '</div><p class="note">Drills use the level and deck you pick above. In Browse you can also filter by what you have learnt.</p>';
    return h;
  }
  function modeTile(m, title, sub, mark) {
    return '<button class="mode" data-act="mode" data-m="' + m + '"><span class="mark" aria-hidden="true">' + mark + '</span><b>' + esc(title) + '</b><span>' + esc(sub) + '</span></button>';
  }
  function browseFilter() { var b = ui.cards.b; return { deck: b.deck, level: b.level, status: b.status, pos: b.pos, q: ui.cards.search }; }
  function viewBrowse() {
    var c = ui.cards, b = c.b, s = srs(), a = c.add;
    var shown = filterCards(browseFilter());
    var h = '<section class="card"><div class="row between"><button class="textbtn" data-act="cardsHome">← Flashcards</button><span class="note">' + allCards().length + ' words in total</span></div><h2>Find words</h2>';
    h += '<input type="text" placeholder="Search English, meaning or বাংলা" data-in="cardSearch" value="' + esc(c.search) + '" aria-label="Search words">';
    h += '<div class="grid2">';
    h += '<label class="field">Status<select data-ch="b_status">' + STATUSES.map(function (o) { return '<option value="' + o[0] + '"' + (b.status === o[0] ? " selected" : "") + '>' + esc(o[1]) + '</option>'; }).join("") + '</select></label>';
    h += '<label class="field">Level<select data-ch="b_level">' + LEVELS.map(function (o) { return '<option value="' + o[0] + '"' + (b.level === o[0] ? " selected" : "") + '>' + esc(o[1]) + '</option>'; }).join("") + '</select></label>';
    h += '<label class="field">Deck<select data-ch="b_deck"><option value="all">All decks</option>' + Object.keys(D.TOPICS).map(function (k) { return '<option value="' + k + '"' + (b.deck === k ? " selected" : "") + '>' + esc(D.TOPICS[k]) + '</option>'; }).join("") + '</select></label>';
    h += '<label class="field">Word type<select data-ch="b_pos">' + POS.map(function (o) { return '<option value="' + o[0] + '"' + (b.pos === o[0] ? " selected" : "") + '>' + esc(o[1]) + '</option>'; }).join("") + '</select></label>';
    h += '</div><div class="row between"><b class="num">' + shown.length + ' words match</b>' + (b.status !== "all" || b.level !== "all" || b.deck !== "all" || b.pos !== "all" || c.search ? '<button class="textbtn" data-act="clearFilters">Clear filters</button>' : "") + '</div>';
    if (shown.length) {
      h += '<div class="grid2"><button class="btn" data-act="studyFiltered">Study these (' + Math.min(shown.length, 40) + ')</button><button class="btn ghost" data-act="drillFiltered" data-m="cloze">Gap-fill these</button><button class="btn ghost" data-act="drillFiltered" data-m="quiz">Quiz these</button><button class="btn ghost" data-act="drillFiltered" data-m="match">Match these</button></div>';
    }
    h += '</section>';

    var limit = c.showAll ? shown.length : 40;
    h += '<section class="card"><div class="wordlist">';
    shown.slice(0, limit).forEach(function (x) {
      var st = s.cards[x.id], lv = level(st);
      h += '<details><summary>' + esc(x.w) + ' <span class="muted small">' + esc(x.pos || "") + '</span><span class="cefr">' + esc(x.lvl) + '</span><span class="lvl ' + lv + '">' + (lv === "review" ? "learnt" : lv) + '</span></summary><div class="body"><div>' + esc(x.def) + '</div>';
      h += '<ol class="exlist">' + x.exs.map(function (e) { return '<li><span>' + esc(e) + '</span>' + speakBtn(e) + '</li>'; }).join("") + '</ol>';
      if (x.bn) h += '<details><summary class="small muted">বাংলা অর্থ দেখুন</summary><div class="bn">' + esc(x.bn) + '</div></details>';
      h += '<div class="row">' + speakBtn(x.w) + (st ? '<span class="note">' + (st.due > Date.now() ? "Next review " + short(keyOf(new Date(st.due))) : "Due now") + ((st.lapses || 0) ? " · forgotten " + st.lapses + "×" : "") + '</span>' : "") + '<span class="grow"></span><button class="btn ghost small" data-act="cardNow" data-id="' + x.id + '">Review soon</button>' + (x.pre ? "" : '<button class="btn danger small" data-act="cardDel" data-id="' + x.id + '">Delete</button>') + '</div>' + confirmBlock("card:" + x.id, "Delete this card and its progress?") + '</div></details>';
    });
    if (!shown.length) h += '<p class="empty">No words match these filters.</p>';
    h += '</div>' + (shown.length > limit ? '<button class="btn ghost" data-act="showAllCards">Show all ' + shown.length + '</button>' : "") + '</section>';

    h += '<section class="card"><h2>Add your own word</h2><div class="row"><input type="text" class="grow" placeholder="Word or phrase you met" data-in="add_w" value="' + esc(a.w) + '" aria-label="Word">';
    if (aiReady()) h += '<button class="btn ghost" data-act="addFill"' + (ui.busy ? " disabled" : "") + '>Fill with AI</button>';
    h += '</div>' + busyBlock("addFill");
    if (a.w || a.def) {
      h += '<div class="grid2"><label class="field">Part of speech<input type="text" data-in="add_pos" value="' + esc(a.pos) + '"></label><label class="field">Level<select data-ch="add_lvl">' + ["A2", "B1", "B2", "C1", "C2"].map(function (l) { return '<option' + ((a.lvl || "B2") === l ? " selected" : "") + '>' + l + '</option>'; }).join("") + '</select></label></div>';
      h += '<label class="field">Deck<select data-ch="add_topic">' + Object.keys(D.TOPICS).map(function (k) { return '<option value="' + k + '"' + (a.topic === k ? " selected" : "") + '>' + esc(D.TOPICS[k]) + '</option>'; }).join("") + '</select></label>';
      h += '<label class="field">Meaning (English)<input type="text" data-in="add_def" value="' + esc(a.def) + '"></label>';
      h += '<label class="field">Example sentence 1<input type="text" data-in="add_ex" value="' + esc(a.ex) + '"></label><label class="field">Example sentence 2<input type="text" data-in="add_ex2" value="' + esc(a.ex2 || "") + '"></label><label class="field">Example sentence 3<input type="text" data-in="add_ex3" value="' + esc(a.ex3 || "") + '"></label>';
      h += '<label class="field">Bangla meaning (optional)<input type="text" data-in="add_bn" value="' + esc(a.bn) + '"></label><button class="btn" data-act="addSave">Save card</button>';
    }
    return h + aiNote() + '</section>';
  }
  function reviewControls() {
    var sess = ui.cards.session, s = srs(), st = s.cards[sess.queue[sess.i]];
    if (!sess.revealed) return '<button class="btn big wide" data-act="reveal">Show answer</button><p class="note center">Tap the card to flip · keyboard: space</p>';
    var h = '<div class="rate">';
    [["again", "Again", 0], ["hard", "Hard", 1], ["good", "Good", 2], ["easy", "Easy", 3]].forEach(function (b) {
      h += '<button class="' + b[0] + '" data-act="rate" data-q="' + b[2] + '">' + b[1] + '<span>' + ivlLabel(st, b[2]) + '</span></button>';
    });
    h += '</div><p class="note center">Swipe the card: right = Good, left = Again · keys 1–4. New words come back after a few minutes before they move to days.</p>';
    if (aiReady()) {
      h += '<details class="practise"' + (sess.use || sess.check ? " open" : "") + '><summary class="textbtn">Practise: write a sentence with this word</summary><div class="row" style="margin-top:8px"><input type="text" class="grow" placeholder="Your sentence" data-in="useIt" value="' + esc(sess.use || "") + '" aria-label="Your sentence"><button class="btn ghost small" data-act="checkUse"' + (ui.busy ? " disabled" : "") + '>Check</button></div>' + busyBlock("checkUse");
      if (sess.check) h += '<div class="fix"><b style="color:' + (sess.check.ok ? "var(--good)" : "var(--bad)") + '">' + (sess.check.ok ? "Correct use" : "Not quite") + '</b><span>' + esc(sess.check.feedback) + '</span>' + (sess.check.better ? '<span class="muted">Better: ' + esc(sess.check.better) + '</span>' : "") + '</div>';
      h += '</details>';
    }
    return h;
  }
  function viewReview() {
    var sess = ui.cards.session, s = srs();
    if (sess.i >= sess.queue.length) {
      var acc = sess.done ? Math.round(100 * (sess.done - sess.again) / sess.done) : 0;
      return '<section class="card hero center"><div class="hero-num">🎉</div><h2>Session complete</h2><div class="tiles"><div class="tile"><b>' + sess.done + '</b><span>cards reviewed</span></div><div class="tile"><b>' + acc + '%</b><span>remembered first time</span></div><div class="tile"><b>' + sess.again + '</b><span>marked Again</span></div></div><div class="grid2"><button class="btn" data-act="mode" data-m="cloze">Gap-fill drill</button><button class="btn ghost" data-act="cardsHome">Done</button></div></section>';
    }
    var id = sess.queue[sess.i], x = cardById(id);
    if (!x) { sess.i++; return viewReview(); }
    var st = s.cards[id], lv = level(st);
    var autoBtn = '<button class="iconbtn' + (autoPlay ? " on" : "") + '" data-act="toggleAuto" aria-pressed="' + autoPlay + '" aria-label="Auto-play pronunciation">' + ICON.sound + '</button>';
    var h = '<section class="card session">' + sessHead("cardsHome", sess.i, sess.queue.length, canSay() ? autoBtn : "");
    h += '<div class="flipwrap" id="flipwrap"><div class="swipe-tag again" id="tagAgain">Again</div><div class="swipe-tag good" id="tagGood">Good</div>';
    h += '<div class="flipcard' + (sess.revealed ? " flipped" : "") + '" id="flipcard" tabindex="0" role="button" aria-label="Flashcard: ' + esc(x.w) + '. Tap to flip.">';
    h += '<div class="face front"><div class="row between full"><span class="chip quiet">' + esc(D.TOPICS[x.topic] || "") + '</span><span><span class="cefr">' + esc(x.lvl) + '</span> <span class="lvl ' + lv + '">' + (lv === "review" ? "learnt" : lv) + '</span></span></div><div class="word">' + esc(x.w) + '</div><div class="pos">' + esc(x.pos || "") + ' · ' + esc(lvlName(x.lvl)) + '</div>' + speakBtn(x.w) + '<div class="hint">Do you know it? Say the meaning, then tap.</div></div>';
    h += '<div class="face back"><div class="row"><div class="word sm grow">' + esc(x.w) + '</div>' + speakBtn(x.w) + '</div><div class="def">' + esc(x.def) + '</div>';
    h += '<ol class="exlist">' + x.exs.map(function (e) { return '<li><span>' + highlightWord(e, x.w) + '</span>' + speakBtn(e) + '</li>'; }).join("") + '</ol>';
    if (x.bn) h += sess.bn ? '<div class="bn">' + esc(x.bn) + '</div>' : '<button class="textbtn" data-act="showBn">বাংলা অর্থ দেখুন</button>';
    h += '</div></div></div><div id="sessControls" class="controls">' + reviewControls() + '</div></section>';
    return h;
  }
  // find the word (or its inflected form) inside a sentence
  function findInSentence(sentence, word) {
    var w = String(word).replace(/^(a|an|the|to|be) /i, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    var m = new RegExp("\\b(" + w + ")(s|es|ed|d|ing|ly)?\\b", "i").exec(sentence);
    if (!m && w.indexOf(" ") === -1 && w.length > 4) {
      var stem = w.slice(0, Math.max(4, w.length - (/e$/.test(w) ? 1 : 2)));
      m = new RegExp("\\b(" + stem + "[a-z]*)\\b", "i").exec(sentence);
    }
    if (!m && w.indexOf(" ") !== -1) {
      var parts = w.split(" "), first = parts[0], rest = parts.slice(1).join(" ");
      m = new RegExp("\\b(" + first + "[a-z]*\\s+" + rest + ")\\b", "i").exec(sentence);
    }
    return m ? { index: m.index, text: m[0] } : null;
  }
  function highlightWord(sentence, word) {
    var f = findInSentence(sentence, word);
    if (!f) return esc(sentence);
    return esc(sentence.slice(0, f.index)) + "<mark>" + esc(f.text) + "</mark>" + esc(sentence.slice(f.index + f.text.length));
  }
  function viewCloze() {
    var cz = ui.cards.cloze;
    if (cz.i >= cz.items.length) {
      return '<section class="card hero center"><div class="hero-num">' + cz.score + '/' + cz.items.length + '</div><h2>Gap-fill done</h2>' + (cz.wrong.length ? '<p class="note">Now due for review: ' + cz.wrong.map(esc).join(", ") + '</p>' : '<p class="note">Every word recalled in context.</p>') + '<div class="grid2"><button class="btn" data-act="mode" data-m="cloze">Another round</button><button class="btn ghost" data-act="cardsHome">Done</button></div></section>';
    }
    var it = cz.items[cz.i], x = cardById(it.id);
    var blank = it.ans.charAt(0) + it.ans.slice(1).replace(/[A-Za-z]/g, "_");
    var h = '<section class="card session">' + sessHead("cardsHome", cz.i, cz.items.length, '<span class="chip">' + cz.score + ' ✓</span>');
    h += '<div class="flash"><p class="note">Fill the gap with the right word (the first letter is given).</p><div class="clozes">' + esc(it.s.slice(0, it.index)) + '<span class="gap">' + esc(blank) + '</span>' + esc(it.s.slice(it.index + it.ans.length)) + '</div>';
    h += '<p class="note">Meaning: ' + esc(x.def) + (cz.hint ? ' · ' + esc(x.pos) + ', ' + it.ans.length + ' letters' : "") + '</p></div>';
    if (!cz.result) {
      h += '<input type="text" class="bigin" id="clozeInput" autocomplete="off" autocapitalize="off" spellcheck="false" data-in="cloze" value="' + esc(cz.input) + '" placeholder="Type the missing word" aria-label="Missing word"><div class="grid2"><button class="btn big" data-act="clozeCheck">Check</button><button class="btn ghost" data-act="clozeHint">Hint</button></div>';
    } else {
      h += '<div class="verdict ' + cz.result + '"><b>' + (cz.result === "right" ? "Correct!" : "Not quite") + '</b><span>' + (cz.result === "right" ? "" : "You wrote: " + esc(cz.input || "(nothing)") + " · ") + 'Answer: <b>' + esc(it.ans) + '</b></span></div><div class="row">' + speakBtn(it.s) + '<span class="note grow">' + esc(it.s) + '</span></div><button class="btn big wide" data-act="clozeNext">Next</button>';
    }
    return h + '</section>';
  }
  function flipCard() {
    var sess = ui.cards.session; if (!sess) return;
    var el = $("flipcard"); if (!el) return;
    var wasRevealed = sess.revealed;
    sess.revealed = true;
    el.classList.toggle("flipped");
    if (!wasRevealed) { var ctr = $("sessControls"); if (ctr) ctr.innerHTML = reviewControls(); }
  }
  function viewSpell() {
    var sp = ui.cards.spell;
    if (sp.i >= sp.items.length) {
      return '<section class="card hero center"><div class="hero-num">' + sp.score + '/' + sp.items.length + '</div><h2>Spelling drill done</h2>' + (sp.wrong.length ? '<p class="note">Practise these: ' + sp.wrong.map(esc).join(", ") + '</p>' : '<p class="note">Perfect spelling.</p>') + '<div class="grid2"><button class="btn" data-act="mode" data-m="spell">Another round</button><button class="btn ghost" data-act="cardsHome">Done</button></div></section>';
    }
    var x = cardById(sp.items[sp.i]);
    var h = '<section class="card session">' + sessHead("cardsHome", sp.i, sp.items.length, '<span class="chip">' + sp.score + ' ✓</span>');
    h += '<div class="flash center">';
    if (canSay()) h += '<button class="bigplay" data-act="spellSay" aria-label="Play the word">' + ICON.sound + '</button><button class="textbtn" data-act="spellSaySlow">Play slowly</button><p class="note">Clue: ' + esc(x.def) + '</p>';
    else h += '<p class="note">Audio isn’t available here, so use the meaning as your clue.</p><div class="def">' + esc(x.def) + '</div>';
    h += '</div>';
    if (!sp.result) h += '<input type="text" class="bigin" id="spellInput" autocomplete="off" autocapitalize="off" spellcheck="false" data-in="spell" value="' + esc(sp.input) + '" placeholder="Type what you hear" aria-label="Your spelling"><button class="btn big wide" data-act="spellCheck">Check</button>';
    else h += '<div class="verdict ' + sp.result + '"><b>' + (sp.result === "right" ? "Correct!" : "Not quite") + '</b><span>' + (sp.result === "right" ? "" : "You wrote: " + esc(sp.input || "(nothing)") + " · ") + 'Answer: <b>' + esc(x.w) + '</b></span></div><button class="btn big wide" data-act="spellNext">Next</button>';
    return h + '</section>';
  }
  function viewQuiz() {
    var qz = ui.cards.quiz;
    if (qz.i >= qz.items.length) {
      return '<section class="card hero center"><div class="hero-num">' + qz.score + '/' + qz.items.length + '</div><h2>Quiz done</h2><p class="note">Words you missed are now due for review.</p><div class="grid2"><button class="btn" data-act="mode" data-m="quiz">Another quiz</button><button class="btn ghost" data-act="cardsHome">Done</button></div></section>';
    }
    var it = qz.items[qz.i], x = cardById(it.id);
    var h = '<section class="card session">' + sessHead("cardsHome", qz.i, qz.items.length, '<span class="chip">' + qz.score + ' ✓</span>');
    h += '<div class="flash center"><p class="note">Which word means…</p><div class="def">' + esc(x.def) + '</div></div><div class="optlist">';
    it.opts.forEach(function (oid, n) {
      var o = cardById(oid), cls = "opt";
      if (qz.picked != null) { if (oid === it.id) cls += " right"; else if (n === qz.picked) cls += " wrong"; }
      h += '<button class="' + cls + '" data-act="quizPick" data-n="' + n + '"' + (qz.picked != null ? " disabled" : "") + '>' + esc(o.w) + '</button>';
    });
    h += '</div>';
    if (qz.picked != null) h += '<p class="note">' + esc(x.ex || "") + '</p><button class="btn big wide" data-act="quizNext">Next</button>';
    return h + '</section>';
  }
  function viewMatch() {
    var m = ui.cards.match;
    var h = '<section class="card session"><div class="sesshead"><button class="iconbtn" data-act="cardsHome" aria-label="Close">✕</button><span class="grow note">' + m.done.length + ' of ' + m.items.length + ' pairs · ' + plural(m.mistakes, "mistake") + '</span><span data-timer="match" class="timer small">0:00</span></div>';
    if (m.done.length === m.items.length) {
      var secs = Math.round(m.secs), best = m.best;
      h += '<div class="center"><div class="hero-num">' + fmtClock(secs) + '</div><h2>' + (m.newBest ? "New best time!" : "All matched") + '</h2><p class="note">' + plural(m.mistakes, "mistake") + ' · best ' + (best ? fmtClock(best) : "–") + '</p></div><div class="grid2"><button class="btn" data-act="mode" data-m="match">Play again</button><button class="btn ghost" data-act="cardsHome">Done</button></div>';
      return h + '</section>';
    }
    h += '<div class="matchgrid"><div class="col">';
    m.left.forEach(function (id) {
      var x = cardById(id), cls = "mt word-t";
      if (m.done.indexOf(id) !== -1) cls += " done"; else if (m.pick && m.pick.side === "L" && m.pick.id === id) cls += " sel"; else if (m.wrong && m.wrong.L === id) cls += " wrong";
      h += '<button class="' + cls + '" data-act="matchPick" data-side="L" data-id="' + id + '"' + (m.done.indexOf(id) !== -1 ? " disabled" : "") + '>' + esc(x.w) + '</button>';
    });
    h += '</div><div class="col">';
    m.right.forEach(function (id) {
      var x = cardById(id), cls = "mt def-t";
      if (m.done.indexOf(id) !== -1) cls += " done"; else if (m.pick && m.pick.side === "R" && m.pick.id === id) cls += " sel"; else if (m.wrong && m.wrong.R === id) cls += " wrong";
      h += '<button class="' + cls + '" data-act="matchPick" data-side="R" data-id="' + id + '"' + (m.done.indexOf(id) !== -1 ? " disabled" : "") + '>' + esc(x.def) + '</button>';
    });
    h += '</div></div><p class="note center">Tap a word, then its meaning.</p>';
    return h + '</section>';
  }

  // ---------------- WRITING ----------------
  var W4 = window.IELTS_DATA4 || {};
  if (W4.TYPE_NAMES) Object.assign(D.TYPE_NAMES, W4.TYPE_NAMES);
  if (W4.PLANS) Object.assign(D.PLANS, W4.PLANS);
  var T1ALL = D.TASK1.map(function (t) { return { kind: "table", q: t.q, charts: [{ kind: "table", unit: t.unit, cols: t.cols, rows: t.rows }] }; }).concat(W4.TASK1X || []);
  var T2ALL = D.TASK2.concat(W4.TASK2X || []);
  var T2TYPES = [["all", "Any type"], ["opinion", "Opinion (agree or disagree)"], ["discussion", "Discuss both views"], ["advdis", "Advantages vs disadvantages"], ["posneg", "Positive or negative development"], ["problem", "Problem and solution / causes"], ["twopart", "Two-part (direct) question"]];
  function t1List() { var k = ui.write.t1kind || "all"; var l = T1ALL.filter(function (t) { return k === "all" || t.kind === k; }); return l.length ? l : T1ALL; }
  function t2List() { var k = ui.write.t2type || "all"; var l = T2ALL.filter(function (t) { return k === "all" || t.type === k; }); return l.length ? l : T2ALL; }
  function currentWritePrompt() {
    var w = ui.write;
    if (w.custom && w.custom.task === w.task) return w.custom;
    if (w.task === 1) { var l = t1List(), t1 = l[w.p1 % l.length]; return { task: 1, type: "task1", kind: t1.kind, q: t1.q, charts: t1.charts }; }
    var l2 = t2List(), t2 = l2[w.pi % l2.length]; return { task: 2, type: t2.type, q: t2.q };
  }
  function promptCharts(p) { return p.charts || (p.cols ? [{ kind: "table", unit: p.unit, cols: p.cols, rows: p.rows }] : []); }
  function planFor(p) {
    if (p.task === 1) return D.PLANS[p.kind === "process" ? "task1_process" : p.kind === "map" ? "task1_map" : "task1_trend"] || D.PLANS.task1;
    return D.PLANS[p.type] || D.PLANS.opinion;
  }
  function typeLabel(p) { return p.task === 1 ? (D.TYPE_NAMES["task1_" + (p.kind || "table")] || "Academic Task 1") : (D.TYPE_NAMES[p.type] || "Task 2"); }
  function chartText(p) {
    return promptCharts(p).map(function (c) {
      if (c.kind === "process") return "PROCESS STAGES:\n" + c.steps.map(function (s, i) { return (i + 1) + ". " + s; }).join("\n");
      if (c.kind === "map") return c.maps.map(function (m) { return "MAP " + m.title + " (rows from north to south):\n" + m.grid.map(function (r) { return r.join(" | "); }).join("\n"); }).join("\n");
      return (c.kind || "table").toUpperCase() + " DATA (" + (c.unit || "") + "):\n" + [c.cols].concat(c.rows).map(function (r) { return r.join(" | "); }).join("\n");
    }).join("\n\n");
  }
  var PAL = ["var(--accent)", "#d08a2e", "#6a7fd1", "#c25b7a", "#4aa3a8", "#8c8c3c"];
  function lineSvg(c) {
    var W = 340, H = 200, L = 34, R = 18, T = 12, B = 26, xs = c.cols.slice(1), vals = [];
    c.rows.forEach(function (r) { r.slice(1).forEach(function (v) { vals.push(+v); }); });
    var hi = niceMax(Math.max.apply(null, vals)), lo = 0;
    var x = function (i) { return L + i * (W - L - R) / Math.max(1, xs.length - 1); }, y = function (v) { return T + (hi - v) / (hi - lo) * (H - T - B); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Line graph">';
    for (var g = 0; g <= 4; g++) { var gv = lo + (hi - lo) * g / 4; s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(gv) + '" y2="' + y(gv) + '" stroke="var(--line)"/><text x="' + (L - 4) + '" y="' + (y(gv) + 3) + '" text-anchor="end" font-size="9" fill="var(--muted)">' + (Math.round(gv * 10) / 10) + '</text>'; }
    xs.forEach(function (t, i) { s += '<text x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="9" fill="var(--muted)">' + esc(t) + '</text>'; });
    c.rows.forEach(function (r, ri) { var col = PAL[ri % PAL.length]; s += '<polyline fill="none" stroke="' + col + '" stroke-width="2" points="' + r.slice(1).map(function (v, i) { return x(i) + "," + y(+v); }).join(" ") + '"/>' + r.slice(1).map(function (v, i) { return '<circle cx="' + x(i) + '" cy="' + y(+v) + '" r="2.5" fill="' + col + '"/>'; }).join(""); });
    return s + '</svg>' + legend(c.rows.map(function (r) { return r[0]; }));
  }
  function barSvg(c) {
    var W = 340, H = 200, L = 34, R = 10, T = 12, B = 34, groups = c.rows, series = c.cols.slice(1), vals = [];
    groups.forEach(function (r) { r.slice(1).forEach(function (v) { vals.push(+v); }); });
    var hi = niceMax(Math.max.apply(null, vals)), gw = (W - L - R) / groups.length, bw = Math.min(22, (gw - 8) / series.length);
    var y = function (v) { return T + (hi - v) / hi * (H - T - B); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Bar chart">';
    for (var g = 0; g <= 4; g++) { var gv = hi * g / 4; s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(gv) + '" y2="' + y(gv) + '" stroke="var(--line)"/><text x="' + (L - 4) + '" y="' + (y(gv) + 3) + '" text-anchor="end" font-size="9" fill="var(--muted)">' + Math.round(gv) + '</text>'; }
    groups.forEach(function (r, gi) {
      var gx = L + gi * gw + (gw - bw * series.length) / 2;
      r.slice(1).forEach(function (v, si) { s += '<rect x="' + (gx + si * bw) + '" y="' + y(+v) + '" width="' + (bw - 2) + '" height="' + (y(0) - y(+v)) + '" rx="2" fill="' + PAL[si % PAL.length] + '"/>'; });
      s += '<text x="' + (L + gi * gw + gw / 2) + '" y="' + (H - 18) + '" text-anchor="middle" font-size="9" fill="var(--muted)">' + esc(String(r[0]).slice(0, 14)) + '</text>';
    });
    return s + '</svg>' + (series.length > 1 ? legend(series) : "");
  }
  function pieSvg(c) {
    var years = c.cols.slice(1), h = '<div class="pies">';
    years.forEach(function (yr, yi) {
      var tot = c.rows.reduce(function (a, r) { return a + (+r[yi + 1]); }, 0), ang = -Math.PI / 2, s = '<svg viewBox="0 0 120 120" role="img" aria-label="Pie chart ' + esc(yr) + '">';
      c.rows.forEach(function (r, ri) {
        var v = +r[yi + 1], a2 = ang + v / tot * Math.PI * 2, large = a2 - ang > Math.PI ? 1 : 0;
        var p1 = [60 + 52 * Math.cos(ang), 60 + 52 * Math.sin(ang)], p2 = [60 + 52 * Math.cos(a2), 60 + 52 * Math.sin(a2)], mid = (ang + a2) / 2;
        s += '<path d="M60,60 L' + p1.join(",") + ' A52,52 0 ' + large + ',1 ' + p2.join(",") + ' Z" fill="' + PAL[ri % PAL.length] + '" stroke="var(--surface)" stroke-width="1.5"/>';
        if (v / tot > 0.06) s += '<text x="' + (60 + 34 * Math.cos(mid)) + '" y="' + (63 + 34 * Math.sin(mid)) + '" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">' + v + '%</text>';
        ang = a2;
      });
      h += '<figure>' + s + '</svg><figcaption>' + esc(yr) + '</figcaption></figure>';
    });
    return h + '</div>' + legend(c.rows.map(function (r) { return r[0]; }));
  }
  function niceMax(v) { var m = Math.pow(10, Math.floor(Math.log10(Math.max(v, 1e-9)))), steps = [1, 2, 2.5, 5, 10]; for (var i = 0; i < steps.length; i++) { var s = steps[i] * m / 4 * 4; if (s >= v * 1.05) return s; } return 10 * m; }
  function legend(names) { return '<div class="clegend">' + names.map(function (n, i) { return '<span><i style="background:' + PAL[i % PAL.length] + '"></i>' + esc(n) + '</span>'; }).join("") + '</div>'; }
  function tableHtml(p) {
    var cs = promptCharts(p); if (!cs.length) return "";
    return cs.map(function (c) {
      var h = '<div class="t1chart">';
      if (c.kind === "line") h += lineSvg(c);
      else if (c.kind === "bar") h += barSvg(c);
      else if (c.kind === "pie") h += pieSvg(c);
      else if (c.kind === "process") h += '<div class="outline flowchart">' + c.steps.map(function (st, i) { return (i ? '<div class="arrow" aria-hidden="true">↓</div>' : "") + '<div class="fbox"><b>' + (i + 1) + '</b> ' + esc(st) + '</div>'; }).join("") + '</div>';
      else if (c.kind === "map") h += '<div class="maps">' + c.maps.map(function (m) { return '<figure><figcaption>' + esc(m.title) + '</figcaption><div class="mapgrid" style="grid-template-columns:repeat(' + m.grid[0].length + ',1fr)">' + m.grid.map(function (r) { return r.map(function (t) { return '<div class="mland">' + esc(t) + '</div>'; }).join(""); }).join("") + '</div></figure>'; }).join("") + '</div><p class="note center">N ↑</p>';
      if (c.cols && (c.kind === "table" || !c.kind)) {
        h += '<div class="tablewrap"><table class="data"><thead><tr>' + c.cols.map(function (x) { return "<th>" + esc(x) + "</th>"; }).join("") + '</tr></thead><tbody>' + c.rows.map(function (r) { return "<tr>" + r.map(function (x) { return "<td>" + esc(x) + "</td>"; }).join("") + "</tr>"; }).join("") + '</tbody></table></div>';
      }
      if (c.unit) h += '<p class="note">Units: ' + esc(c.unit) + '. Practice data, made up.</p>';
      return h + '</div>';
    }).join("");
  }
  function statsHtml(t, task) {
    var s = textStats(t), min = task === 1 ? 150 : 250;
    var h = '<span class="chip' + (s.words >= min ? "" : " warn") + '">' + s.words + ' / ' + min + ' words</span><span class="chip quiet">' + s.paras + ' paragraphs</span><span class="chip quiet">' + s.avg + ' words per sentence</span><span class="chip quiet">' + s.linkers.length + ' linking phrases</span>';
    if (s.rep.length) h += '<span class="chip warn">Repeated: ' + esc(s.rep.join(", ")) + '</span>';
    return h;
  }
  function resultHtml(res, kind) {
    if (!res) return "";
    var h = '<div class="result"><div class="bandbig"><b>' + band(res.overall || res.band) + '</b><span class="muted">estimated band (AI, not official)</span></div>';
    if (res.summary) h += '<p>' + esc(res.summary) + '</p>';
    (res.criteria || []).forEach(function (c) {
      var v = Number(c.band) || 0;
      h += '<div class="crit"><div class="row between"><span>' + esc(c.name) + '</span><b>' + band(c.band) + '</b></div><div class="bar' + (v < settings().target ? " warn" : "") + '"><i style="width:' + Math.round(v / 9 * 100) + '%"></i></div><span class="note">' + esc(c.comment) + '</span></div>';
    });
    if (res.pron_note) h += '<p class="note">Pronunciation: ' + esc(res.pron_note) + '</p>';
    if (res.fixes && res.fixes.length) {
      h += '<h3>Fix these</h3>';
      res.fixes.forEach(function (f, i) {
        h += '<div class="fix"><span class="o">' + esc(f.original) + '</span><span class="c">' + esc(f.corrected) + '</span><span class="muted small">' + esc(f.why) + '</span><button class="textbtn" style="justify-self:start" data-act="fixToMistake" data-kind="' + kind + '" data-i="' + i + '">Save to mistake log</button></div>';
      });
    }
    if (res.upgrades && res.upgrades.length) {
      h += '<h3>Vocabulary upgrades</h3><div class="hist">';
      res.upgrades.forEach(function (u) { h += '<div class="fix"><span><span class="muted">' + esc(u.from) + '</span> → <b>' + esc(u.to) + '</b></span>' + (u.example ? '<span class="muted small">' + esc(u.example) + '</span>' : "") + '</div>'; });
      h += '</div><button class="btn ghost" data-act="upgradesToCards" data-kind="' + kind + '">Add these to my flashcards</button>';
    }
    if (res.model_intro) h += '<h3>Stronger introduction</h3><div class="model">' + esc(res.model_intro) + '</div>';
    if (res.model_answer) h += '<div class="row between"><h3>Model answer (band 8 style)</h3>' + (canSay() ? '<button class="btn ghost small" data-act="sayModel" data-kind="' + kind + '">' + ICON.sound + ' Listen and shadow</button>' : "") + '</div><div class="model">' + esc(res.model_answer) + '</div>';
    if (res.follow_ups && res.follow_ups.length) h += '<h3>Part 3 follow-up questions</h3><ul class="plan">' + res.follow_ups.map(function (q) { return "<li>" + esc(q) + "</li>"; }).join("") + '</ul>';
    if (res.next_focus) h += '<div class="prompt"><b>Next focus:</b> ' + esc(res.next_focus) + '</div>';
    return h + '</div>';
  }
  function viewWrite() {
    var w = ui.write;
    if (w.view) {
      var e = get(w.view);
      if (!e) { w.view = null; return viewWrite(); }
      return '<section class="card"><div class="row between"><button class="textbtn" data-act="closeView">← Back</button><span class="note">' + esc(pretty(e.date)) + ' · Task ' + e.task + ' · ' + e.words + ' words</span></div><div class="prompt">' + esc(e.prompt) + '</div><div class="model">' + esc(e.text) + '</div>' + (e.result ? resultHtml(e.result, "essayView") : '<p class="note">Saved without AI marking.</p>') + '<button class="btn danger" data-act="delEssay" data-id="' + esc(w.view) + '">Delete essay</button>' + confirmBlock("essay:" + w.view, "Delete this essay?") + '</section>';
    }
    var p = currentWritePrompt();
    var h = '<section class="card"><div class="row between"><h2>Writing</h2><div class="seg" style="min-width:180px"><button data-act="wTask" data-n="1" aria-pressed="' + (w.task === 1) + '">Task 1<span>20 min</span></button><button data-act="wTask" data-n="2" aria-pressed="' + (w.task === 2) + '">Task 2<span>40 min</span></button></div></div>';
    h += '<label class="field">Question type<select data-ch="' + (w.task === 1 ? "t1kind" : "t2type") + '">' + (w.task === 1 ? W4.T1KINDS || [["all", "Any type"]] : T2TYPES).map(function (o) { var cur = w.task === 1 ? (w.t1kind || "all") : (w.t2type || "all"); return '<option value="' + o[0] + '"' + (cur === o[0] ? " selected" : "") + '>' + esc(o[1]) + '</option>'; }).join("") + '</select></label>';
    h += '<span class="chip quiet" style="justify-self:start">' + esc(typeLabel(p)) + '</span><div class="prompt">' + esc(p.q) + '</div>' + tableHtml(p);
    h += '<div class="row"><button class="btn ghost small" data-act="nextPrompt">Another question</button>' + (aiReady() ? '<button class="btn ghost small" data-act="aiPrompt"' + (ui.busy ? " disabled" : "") + '>New question with AI</button>' : "") + '<button class="btn ghost small" data-act="togglePlan">' + (w.plan ? "Hide" : "Show") + ' plan</button></div>' + busyBlock("aiPrompt");
    if (w.plan) h += '<ol class="plan">' + planFor(p).map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + '</ol>';
    h += '</section>';

    h += '<section class="card"><div class="row between"><span data-timer="write" class="timer">40:00</span><div class="row"><button class="btn ghost small" data-act="wTimer" data-op="start">Start</button><button class="btn ghost small" data-act="wTimer" data-op="pause">Pause</button><button class="btn ghost small" data-act="wTimer" data-op="reset">Reset</button></div></div>';
    h += '<textarea class="essay" id="essayBox" data-in="essay" placeholder="Write your answer here. Plan for 3–5 minutes first." aria-label="Your answer">' + esc(w.text) + '</textarea>';
    h += '<div class="stats" id="essayStats">' + statsHtml(w.text, w.task) + '</div>';
    if (aiReady()) h += '<button class="btn wide" data-act="grade"' + (ui.busy ? " disabled" : "") + '>Mark my answer (AI band estimate)</button>';
    h += busyBlock("grade") + '<div class="grid2"><button class="btn ghost" data-act="saveEssay">Save without marking</button><button class="btn ghost" data-act="newEssay">Start a new answer</button></div>' + aiNote() + '</section>';
    if (w.result) h += '<section class="card"><h2>Feedback</h2>' + resultHtml(w.result, "essay") + '</section>';

    var essays = docsWithPrefix("e_").sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    h += '<section class="card"><h2>My essays (' + essays.length + ')</h2>';
    var graded = essays.filter(function (e) { return e.result && e.result.overall; }).reverse();
    if (graded.length >= 2) h += sparkline(graded.map(function (e) { return Number(e.result.overall); }), "AI band estimates, oldest to newest");
    if (!essays.length) h += '<p class="empty">Your saved essays will appear here.</p>';
    h += '<div class="hist">';
    essays.slice(0, 30).forEach(function (e) {
      h += '<button data-act="viewEssay" data-id="' + esc(e.id) + '"><span class="chip quiet">T' + e.task + '</span><span class="grow">' + esc(e.prompt) + '</span><b class="num">' + (e.result ? band(e.result.overall) : "–") + '</b></button>';
    });
    return h + '</div></section>';
  }
  function sparkline(vals, label) {
    var W = 300, H = 60, lo = 4, hi = 9;
    var pts = vals.map(function (v, i) { return [10 + i * (W - 20) / Math.max(1, vals.length - 1), H - 8 - (v - lo) / (hi - lo) * (H - 16)]; });
    var tg = H - 8 - (settings().target - lo) / (hi - lo) * (H - 16);
    var last = pts[pts.length - 1];
    return '<div class="chart"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(label) + '"><line x1="0" x2="' + W + '" y1="' + tg + '" y2="' + tg + '" stroke="var(--warn)" stroke-dasharray="4 4"/><polyline fill="none" stroke="var(--accent)" stroke-width="2" points="' + pts.map(function (p) { return p.join(","); }).join(" ") + '"/><circle cx="' + last[0] + '" cy="' + last[1] + '" r="4" fill="var(--accent)"/></svg></div><p class="note">' + esc(label) + '. Dashed line: your target ' + band(settings().target) + '.</p>';
  }

  // ---------------- SPEAKING ----------------
  function viewSpeak() {
    var sp = ui.speak;
    if (sp.view) {
      var e = get(sp.view);
      if (!e) { sp.view = null; return viewSpeak(); }
      return '<section class="card"><div class="row between"><button class="textbtn" data-act="closeSpeakView">← Back</button><span class="note">' + esc(pretty(e.date)) + ' · Part ' + e.part + '</span></div><div class="prompt">' + esc(e.prompt) + '</div><div class="model">' + esc(e.text) + '</div>' + (e.result ? resultHtml(e.result, "speakView") : "") + '<button class="btn danger" data-act="delSpeak" data-id="' + esc(sp.view) + '">Delete session</button>' + confirmBlock("speak:" + sp.view, "Delete this session?") + '</section>';
    }
    var h = '<section class="card"><div class="row between"><h2>Speaking</h2></div><div class="seg">';
    [1, 2, 3].forEach(function (n) { h += '<button data-act="sPart" data-n="' + n + '" aria-pressed="' + (sp.part === n) + '">Part ' + n + '<span>' + ["", "4–5 min", "3–4 min", "4–5 min"][n] + '</span></button>'; });
    h += '</div>';
    var cue = D.PART2[sp.idx % D.PART2.length], p1 = D.PART1[sp.p1 % D.PART1.length];
    if (sp.part === 1) {
      h += '<p class="note">Answer each question in 2–3 sentences: answer, reason, example.</p><div class="prompt"><b>' + esc(p1.topic) + '</b><ol class="plan">' + p1.qs.map(function (q) { return "<li>" + esc(q) + "</li>"; }).join("") + '</ol></div><div class="row"><button class="btn ghost small" data-act="nextP1">Another topic</button>' + (canSay() ? '<button class="btn ghost small" data-act="sayQs">' + ICON.sound + ' Hear the questions</button>' : "") + '</div>';
    } else {
      h += '<div class="cue"><h3>' + esc(cue.cue) + '</h3><span class="small">You should say:</span><ul>' + cue.say.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + '</ul><span class="small">and explain ' + esc(cue.explain) + '.</span></div>';
      if (sp.part === 3) h += '<div class="prompt"><b>Part 3 discussion</b><ol class="plan">' + cue.p3.map(function (q) { return "<li>" + esc(q) + "</li>"; }).join("") + '</ol></div>';
      h += '<div class="row"><button class="btn ghost small" data-act="nextCue">Another topic</button>' + (canSay() && sp.part === 3 ? '<button class="btn ghost small" data-act="sayP3">' + ICON.sound + ' Hear the questions</button>' : "") + '</div>';
    }
    var fw = ((window.IELTS_DATA4 || {}).SPEAK_TYPES || {})[sp.part] || [];
    if (fw.length) h += '<details class="frames"><summary class="textbtn">Answer frameworks for Part ' + sp.part + ' question types (' + fw.length + ')</summary>' + fw.map(function (f) { return '<div class="frame"><b>' + esc(f.t) + '</b><span>' + esc(f.how) + '</span><span class="muted small">e.g. ' + esc(f.ex) + '</span>' + (canSay() ? speakBtn(f.ex) : "") + '</div>'; }).join("") + '</details>';
    h += '</section>';

    // practice area
    h += '<section class="card">';
    if (sp.part === 2) {
      var lab = { idle: "Ready", prep: "Preparation: make notes", talk: "Speak now", done: "Finished" }[sp.phase];
      h += '<div class="row between"><div><div class="note">' + lab + '</div><span data-timer="speak" class="timer">1:00</span></div><div class="row">';
      if (sp.phase === "idle" || sp.phase === "done") h += '<button class="btn" data-act="startPrep">' + (sp.phase === "done" ? "Try again" : "Start 1-minute prep") + '</button>';
      if (sp.phase === "prep") h += '<button class="btn ghost" data-act="skipPrep">Start speaking now</button>';
      if (sp.phase === "talk") h += '<button class="btn ghost" data-act="endTalk">I’ve finished</button>';
      h += '</div></div>';
      if (sp.phase === "prep" || sp.notes) h += '<textarea rows="3" data-in="notes" placeholder="Notes: key words only" aria-label="Preparation notes">' + esc(sp.notes) + '</textarea>';
    } else {
      h += '<div class="row between"><span data-timer="speak" class="timer">0:00</span><div class="row"><button class="btn ghost small" data-act="sTimer" data-op="start">Start</button><button class="btn ghost small" data-act="sTimer" data-op="pause">Stop</button><button class="btn ghost small" data-act="sTimer" data-op="reset">Reset</button></div></div>';
    }
    h += '<div class="row between"><b>Your answer</b>' + (DICT ? '<button class="btn ' + (dictState !== "idle" ? "mic on" : "ghost") + ' small" data-act="mic">' + ICON.mic + (dictState !== "idle" ? " Stop dictation" : " Speak to type") + '</button>' : "") + '</div>';
    if (!DICT) h += '<p class="note">Speak out loud, then type what you said. On a phone, tap the microphone on your keyboard to dictate your answer.</p>';
    h += '<div class="partial" id="partial">' + esc(sp.partial) + '</div><textarea rows="7" id="speakText" data-in="speakText" placeholder="Your spoken answer appears here" aria-label="Your spoken answer">' + esc(sp.text) + '</textarea>';
    var secs = speakSecs(), stt = textStats(sp.text);
    h += '<div class="stats" id="speakStats">' + speakStatsHtml(stt, secs) + '</div>';
    if (aiReady()) h += '<button class="btn wide" data-act="speakFeedback"' + (ui.busy ? " disabled" : "") + '>Get feedback (AI band estimate)</button>';
    h += busyBlock("speakFeedback") + '<div class="grid2"><button class="btn ghost" data-act="saveSpeak">Save session</button><button class="btn ghost" data-act="newSpeak">Clear</button></div>' + aiNote() + '</section>';
    if (sp.result) h += '<section class="card"><h2>Feedback</h2>' + resultHtml(sp.result, "speak") + '</section>';

    var list = docsWithPrefix("s_").sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    h += '<section class="card"><h2>My sessions (' + list.length + ')</h2>';
    if (!list.length) h += '<p class="empty">Saved speaking sessions appear here.</p>';
    h += '<div class="hist">';
    list.slice(0, 30).forEach(function (e) { h += '<button data-act="viewSpeak" data-id="' + esc(e.id) + '"><span class="chip quiet">P' + e.part + '</span><span class="grow">' + esc(e.prompt) + '</span><b class="num">' + (e.result ? band(e.result.band) : "–") + '</b></button>'; });
    return h + '</div></section>';
  }
  function speakSecs() { var sp = ui.speak; if (sp.part === 2) return sp.phase === "talk" ? tElapsed("speak") : (sp.secs || 0); return tElapsed("speak"); }
  function speakStatsHtml(s, secs) {
    var wpm = secs > 15 ? Math.round(s.words / (secs / 60)) : null;
    return '<span class="chip quiet">' + s.words + ' words</span>' + (wpm ? '<span class="chip' + (wpm < 100 ? " warn" : "") + '">' + wpm + ' words/min</span>' : "") + '<span class="chip' + (s.fillers > 3 ? " warn" : " quiet") + '">' + s.fillers + ' possible fillers</span>' + (s.rep.length ? '<span class="chip warn">Repeated: ' + esc(s.rep.join(", ")) + '</span>' : "");
  }
  function speakPrompt() {
    var sp = ui.speak;
    if (sp.part === 1) { var p = D.PART1[sp.p1 % D.PART1.length]; return "Part 1 – " + p.topic + ": " + p.qs.join(" "); }
    var c = D.PART2[sp.idx % D.PART2.length];
    if (sp.part === 3) return "Part 3 – " + c.p3.join(" ");
    return "Part 2 – " + c.cue + " You should say: " + c.say.join("; ") + "; and explain " + c.explain + ".";
  }

  // ---------------- PRACTICE ----------------
  var D4 = window.IELTS_DATA4 || { RQ: [], LQ: [], SAMPLES: [] };
  var LSECTIONS = ["Section 1: an everyday conversation", "Section 2: a talk about a local service or event", "Section 3: students discussing an assignment", "Section 4: a short academic lecture"];
  function qtypes(kind) { return kind === "reading" ? D4.RQ : D4.LQ; }
  function qtypeById(kind, id) { return qtypes(kind).filter(function (t) { return t.id === id; })[0]; }
  function typeName(kind, id) { var t = qtypeById(kind, id); return t ? t.name : String(id || ""); }
  function groupsOf(d) {
    if (!d) return [];
    if (d.groups && d.groups.length) return d.groups;
    return [{ type: d.type, instructions: d.instructions, questions: d.questions || [] }];
  }
  function allQs(d) { var out = []; groupsOf(d).forEach(function (g, gi) { (g.questions || []).forEach(function (q, i) { out.push({ g: g, q: q, key: gi + "-" + i }); }); }); return out; }
  function groupTypeName(d, g) { return typeName(d.kind, g.type) || d.type; }
  // weakest question type first, so "Practise my weakest" can pick it
  function typeAccuracy(kind) {
    var by = {}; drills().filter(function (x) { return x.kind === kind; }).forEach(function (x) { var k = x.type; by[k] = by[k] || { s: 0, t: 0 }; by[k].s += x.score; by[k].t += x.total; });
    return by;
  }
  function weakestType(kind) {
    var by = typeAccuracy(kind), list = qtypes(kind).slice();
    var untried = list.filter(function (t) { return !by[t.name]; });
    if (untried.length) return untried[0].id;
    list.sort(function (a, b) { return by[a.name].s / by[a.name].t - by[b.name].s / by[b.name].t; });
    return list[0] ? list[0].id : "mixed";
  }
  function viewPractice() {
    var p = ui.practice, types = qtypes(p.kind), cur = p.kind === "reading" ? p.rtype : p.ltype;
    var h = '<section class="card"><h2>Reading and Listening drills</h2><div class="seg"><button data-act="pKind" data-k="reading" aria-pressed="' + (p.kind === "reading") + '">Reading</button><button data-act="pKind" data-k="listening" aria-pressed="' + (p.kind === "listening") + '">Listening</button></div>';
    h += '<label class="field">Question type (' + types.length + ' official types)<select data-ch="' + (p.kind === "reading" ? "rtype" : "ltype") + '"><option value="mixed"' + (cur === "mixed" ? " selected" : "") + '>Mixed exam-style set (3 types)</option>' + types.map(function (t) { return '<option value="' + t.id + '"' + (t.id === cur ? " selected" : "") + '>' + esc(t.name) + '</option>'; }).join("") + '</select></label>';
    var tt = qtypeById(p.kind, cur);
    h += '<div class="tipbox"><b>' + esc(tt ? tt.name : "Mixed set") + '</b><span>' + esc(tt ? tt.tip : "Like the real test: one passage or recording with several question types. Read each instruction and word limit carefully.") + '</span></div>';
    if (p.kind === "listening") h += '<label class="field">Section<select data-ch="lsec">' + LSECTIONS.map(function (t) { return '<option' + (t === p.lsec ? " selected" : "") + '>' + esc(t) + '</option>'; }).join("") + '</select></label><label class="choice"><input type="checkbox" data-ch="exam"' + (p.exam ? " checked" : "") + '> Exam mode: play the recording once only</label>';
    h += '<label class="field">Topic (optional)<input type="text" data-in="ptopic" value="' + esc(p.topic) + '" placeholder="e.g. urban farming, sleep science, a museum tour"></label>';
    if (aiReady()) {
      h += '<div class="grid2"><button class="btn" data-act="genDrill"' + (ui.busy ? " disabled" : "") + '>Create this drill</button><button class="btn ghost" data-act="genWeakest"' + (ui.busy ? " disabled" : "") + '>Practise my weakest type</button></div>';
      h += '<p class="note">Every new drill is saved below, so you can repeat it offline.</p><button class="btn ghost wide" data-act="prepOffline"' + (ui.busy ? " disabled" : "") + '>Prepare 4 drills for offline (2 Reading, 2 Listening)</button>' + (ui.prep ? '<p class="note">Saving drill ' + ui.prep + ' of 4…</p>' : "") + busyBlock("prepOffline");
    } else h += aiNote();
    h += busyBlock("genDrill") + '</section>';
    if (p.data && p.data.kind === p.kind) h += p.kind === "reading" ? readingHtml() : listeningHtml();
    var samples = D4.SAMPLES.filter(function (s) { return s.kind === p.kind; });
    if (samples.length) {
      h += '<section class="card"><h2>Built-in ' + p.kind + ' sets</h2><p class="note">Always available offline. Together they cover every ' + p.kind + ' question type.</p><div class="hist">';
      samples.forEach(function (s) {
        var sc = (get("samplescores") || {})[s.id];
        h += '<button data-act="openSample" data-id="' + s.id + '"><span class="chip ' + (sc ? "" : "quiet") + '">' + (sc ? sc : "new") + '</span><span class="grow">' + esc(s.title) + '<span class="note block">' + esc(groupsOf(s).map(function (g) { return groupTypeName(s, g); }).join(" · ")) + '</span></span></button>';
      });
      h += '</div></section>';
    }
    var bank = drillBank().filter(function (b) { return b.data.kind === p.kind; });
    if (bank.length) {
      h += '<section class="card"><h2>Saved ' + p.kind + ' drills (' + bank.length + ')</h2><p class="note">These work offline. Generate a few while you have internet, then practise on the bus.</p><div class="hist">';
      bank.forEach(function (b) { h += '<button data-act="openDrill" data-id="' + esc(b.id) + '"><span class="chip ' + (b.score != null ? "" : "quiet") + '">' + (b.score != null ? b.score + "/" + b.total : "new") + '</span><span class="grow">' + esc(b.data.title) + '<span class="note block">' + esc(groupsOf(b.data).map(function (g) { return groupTypeName(b.data, g); }).join(" · ")) + '</span></span><span class="note">' + esc(short(b.date)) + '</span></button>'; });
      h += '</div></section>';
    }
    h += drillStatsHtml();
    return h;
  }
  function choiceKey(s) { var m = /^\s*([A-Za-z]|[ivx]+)[\s.)]/.exec(String(s || "")); return m ? m[1].toLowerCase() : norm(s); }
  function sameChoice(a, ans) { return choiceKey(a) === choiceKey(ans) || norm(a) === norm(ans); }
  function answerOk(q, a, g) {
    if (a == null || a === "") return false;
    var hasChoices = (q.options && q.options.length) || (g && g.options && g.options.length);
    if (Array.isArray(q.answer)) {
      var chosen = Array.isArray(a) ? a : [a];
      if (chosen.length !== q.answer.length) return false;
      return q.answer.every(function (x) { return chosen.some(function (c) { return sameChoice(c, x); }); });
    }
    if (hasChoices) return sameChoice(a, q.answer);
    var acc = [q.answer].concat(q.alt || []).map(norm);
    return acc.indexOf(norm(a)) !== -1;
  }
  function ansLabel(q) { return Array.isArray(q.answer) ? q.answer.join(" and ") : String(q.answer); }
  function inputFor(g, q, key, inline) {
    var p = ui.practice, val = p.answers[key], dis = p.checked ? " disabled" : "";
    var opts = q.options && q.options.length ? q.options : (g.options || []);
    if (Array.isArray(q.answer)) {
      var arr = Array.isArray(val) ? val : [];
      return '<p class="note">Choose ' + q.answer.length + '.</p>' + opts.map(function (o) { return '<label class="choice"><input type="checkbox" data-ch="ansm" data-q="' + key + '" value="' + esc(o) + '"' + (arr.indexOf(o) !== -1 ? " checked" : "") + dis + '><span>' + esc(o) + '</span></label>'; }).join("");
    }
    if (q.options && q.options.length) {
      return q.options.map(function (o) { return '<label class="choice"><input type="radio" name="q' + key + '" data-ch="ans" data-q="' + key + '" value="' + esc(o) + '"' + (val === o ? " checked" : "") + dis + '><span>' + esc(o) + '</span></label>'; }).join("");
    }
    if (opts.length) {
      return '<select class="' + (inline ? "inl" : "") + '" data-ch="ans" data-q="' + key + '"' + dis + ' aria-label="Answer"><option value="">' + (inline ? "–" : "Choose…") + '</option>' + opts.map(function (o) { return '<option value="' + esc(o) + '"' + (val === o ? " selected" : "") + '>' + esc(inline ? choiceKey(o).toUpperCase() : o) + '</option>'; }).join("") + '</select>';
    }
    return '<input type="text" class="' + (inline ? "inl" : "") + '" data-in="ans" data-q="' + key + '" value="' + esc(val || "") + '"' + dis + ' placeholder="' + (inline ? "" : "Your answer") + '" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Answer">';
  }
  function outlineHtml(g, gi, base) {
    var o = g.outline, st = o.style || "notes", p = ui.practice;
    var fill = function (cell) {
      return esc(cell).replace(/\[(\d+)\]/g, function (m, n) {
        var i = +n - 1, q = (g.questions || [])[i]; if (!q) return m;
        var key = gi + "-" + i, mark = "";
        if (p.checked) mark = answerOk(q, p.answers[key], g) ? ' ok' : ' bad';
        return '<span class="gapin' + mark + '"><b>' + (base + i + 1) + '</b>' + inputFor(g, q, key, true) + '</span>';
      });
    };
    var h = '<div class="outline ' + st + '">' + (o.title ? '<b>' + esc(o.title) + '</b>' : "");
    if (st === "table") {
      var hd = o.rows[0] || [];
      h += o.rows.slice(1).map(function (r) { return '<div class="trow"><div class="trh">' + fill(r[0]) + '</div>' + r.slice(1).map(function (c, ci) { return '<div class="frow"><span class="muted small">' + esc(hd[ci + 1] || "") + '</span><span>' + fill(c) + '</span></div>'; }).join("") + '</div>'; }).join("");
    } else if (st === "form") {
      h += o.rows.map(function (r) { return '<div class="frow"><span>' + fill(r[0]) + '</span><span>' + fill(r.slice(1).join(" ")) + '</span></div>'; }).join("");
    } else if (st === "flowchart") {
      h += o.rows.map(function (r, i) { return (i ? '<div class="arrow" aria-hidden="true">↓</div>' : "") + '<div class="fbox">' + fill(r.join(" ")) + '</div>'; }).join("");
    } else {
      h += o.rows.map(function (r) { return '<p>' + fill(r.join(" ")) + '</p>'; }).join("");
    }
    return h + '</div>';
  }
  function mapHtml(m) {
    var cells = {}; (m.cells || []).forEach(function (c) { cells[c.r + "," + c.c] = c.t; });
    var h = '<div class="mapgrid" style="grid-template-columns:repeat(' + (m.cols || 3) + ',1fr)">';
    for (var r = 0; r < (m.rows || 3); r++) for (var c = 0; c < (m.cols || 3); c++) {
      var t = cells[r + "," + c] || "";
      h += '<div class="' + (/^[A-H]$/.test(t) ? "mletter" : "mland") + '">' + esc(t) + '</div>';
    }
    return h + '</div><p class="note center">N ↑</p>';
  }
  function groupsHtml(d) {
    var p = ui.practice, h = "", base = 0;
    groupsOf(d).forEach(function (g, gi) {
      var qs = g.questions || [], from = base + 1, to = base + qs.length;
      h += '<div class="qgroup"><div class="qghead"><b>Questions ' + from + (to > from ? "–" + to : "") + '</b><span class="chip quiet">' + esc(groupTypeName(d, g)) + '</span></div>' + (g.instructions ? '<p class="note">' + esc(g.instructions) + '</p>' : "");
      if (g.map) h += mapHtml(g.map);
      if (g.outline) {
        if (g.options && g.options.length && !g.map) h += '<div class="wordbox">' + g.options.map(function (o) { return '<span>' + esc(o) + '</span>'; }).join("") + '</div>';
        h += outlineHtml(g, gi, base);
        if (p.checked) h += qs.map(function (q, i) { var ok = answerOk(q, p.answers[gi + "-" + i], g); return '<div class="expl ' + (ok ? "r" : "w") + '"><b>' + (base + i + 1) + '. ' + (ok ? "Correct" : "Answer: " + esc(ansLabel(q))) + '.</b> ' + esc(q.explanation || "") + '</div>'; }).join("");
      } else {
        if (g.options && g.options.length && !g.map && !qs.some(function (q) { return q.options; })) h += '<div class="wordbox list">' + g.options.map(function (o) { return '<span>' + esc(o) + '</span>'; }).join("") + '</div>';
        qs.forEach(function (q, i) {
          var key = gi + "-" + i, cls = "q", ok = null;
          if (p.checked) { ok = answerOk(q, p.answers[key], g); cls += ok ? " right" : " wrong"; }
          h += '<div class="' + cls + '"><div class="qt">' + (base + i + 1) + '. ' + esc(q.q) + '</div>' + inputFor(g, q, key, false);
          if (p.checked) h += '<div class="expl"><b>' + (ok ? "Correct" : "Answer: " + esc(ansLabel(q))) + '.</b> ' + esc(q.explanation || "") + '</div>';
          h += '</div>';
        });
      }
      h += '</div>';
      base = to;
    });
    return h;
  }
  function readingHtml() {
    var p = ui.practice, d = p.data;
    var h = '<section class="card"><div class="row between"><h2>' + esc(d.title) + '</h2><span data-timer="practice" class="timer">0:00</span></div><p class="note">Aim for about 20 minutes per passage, as in the real test.</p><div class="passage">';
    (d.paragraphs || []).forEach(function (pg) { h += '<p><b>' + esc(pg.label) + '</b>' + esc(pg.text) + '</p>'; });
    h += '</div></section><section class="card"><h2>Questions</h2>' + groupsHtml(d) + checkRow() + '</section>';
    return h;
  }
  function listeningHtml() {
    var p = ui.practice, d = p.data;
    var h = '<section class="card"><div class="row between"><h2>' + esc(d.title) + '</h2><span data-timer="practice" class="timer">0:00</span></div><p class="note">' + esc(d.context || "") + '</p>';
    if (!canSay()) h += '<p class="note">Audio isn’t available here. Read the transcript instead, then answer from memory.</p>';
    else {
      var locked = p.exam && p.plays >= 1 && !p.checked;
      h += '<div class="row"><button class="btn" data-act="playL"' + (p.playing || locked ? " disabled" : "") + '>' + ICON.sound + (p.plays ? " Play again" : " Play recording") + '</button>' + (p.playing ? '<button class="btn ghost" data-act="stopL">Stop</button>' : "") + '</div>' + (locked ? '<p class="note">Exam mode: you’ve heard it once. Check your answers to unlock replay and the transcript.</p>' : "");
    }
    h += '<p class="note">Read all the questions first, as you would in the test. Spelling counts.</p>' + groupsHtml(d) + checkRow();
    if (p.checked || !canSay()) {
      h += '<details' + (p.script ? " open" : "") + '><summary class="textbtn">Show transcript</summary><div class="passage">';
      (d.lines || []).forEach(function (l) { h += '<p><b>' + esc(l.speaker) + ':</b> ' + esc(l.text) + '</p>'; });
      h += '</div></details>';
    }
    return h + '</section>';
  }
  function drillScore(d) { var p = ui.practice; return allQs(d).filter(function (x) { return answerOk(x.q, p.answers[x.key], x.g); }).length; }
  function checkRow() {
    var p = ui.practice;
    if (!p.checked) return '<button class="btn wide" data-act="checkDrill">Check answers</button>';
    var tot = allQs(p.data).length, sc = drillScore(p.data);
    return '<div class="bandbig"><b>' + sc + '/' + tot + '</b><span class="muted">correct (' + Math.round(100 * sc / Math.max(1, tot)) + '%) · wrong answers saved to your mistake log</span></div>' + (aiReady() ? '<button class="btn" data-act="genDrill"' + (ui.busy ? " disabled" : "") + '>Next drill</button>' : "");
  }
  function drillStatsHtml() {
    var list = drills(); if (!list.length) return "";
    var by = {};
    list.forEach(function (d) { var k = (d.kind === "listening" ? "Listening · " : "Reading · ") + String(d.type).split(":")[0]; by[k] = by[k] || { s: 0, t: 0, n: 0 }; by[k].s += d.score; by[k].t += d.total; by[k].n++; });
    var h = '<section class="card"><h2>Accuracy by question type</h2><div class="typebars">';
    Object.keys(by).sort(function (a, b) { return by[a].s / by[a].t - by[b].s / by[b].t; }).forEach(function (k) {
      var pc = Math.round(100 * by[k].s / Math.max(1, by[k].t));
      h += '<div><div class="row"><span>' + esc(k) + '</span><b class="num">' + pc + '%</b><span class="note">' + by[k].t + ' questions</span></div><div class="bar' + (pc < 70 ? " warn" : "") + '"><i style="width:' + pc + '%"></i></div></div>';
    });
    var untried = ["reading", "listening"].map(function (k) { var by2 = typeAccuracy(k); return qtypes(k).filter(function (t) { return !by2[t.name]; }).length; });
    return h + '</div><p class="note">The lowest bar is the type to practise next.' + (untried[0] + untried[1] ? ' Not tried yet: ' + untried[0] + ' Reading and ' + untried[1] + ' Listening types.' : " You have tried every type.") + '</p></section>';
  }

  // ---------------- PROGRESS ----------------
  function viewProgress() {
    var pr = ui.progress, st = settings(), m = mocks();
    var h = '<section class="card"><h2>Band progress</h2>';
    if (!m.length) h += '<p class="empty">Log your first mock test below to see your bands and your weakest skill.</p>';
    else {
      var last = m[m.length - 1], ov = overallBand(last.L, last.R, last.W, last.S);
      h += '<div class="bandbig"><b>' + band(ov) + '</b><span class="muted">latest overall (' + esc(short(last.date)) + ') · target ' + band(st.target) + '</span></div><div class="grid4">';
      SKILLS.forEach(function (s) {
        var v = Number(last[s[0]]), gap = v - st.target;
        h += '<div class="tile' + (gap < 0 ? " alert" : "") + '"><b>' + band(v) + '</b><span>' + s[1] + (gap < 0 ? " · " + gap.toFixed(1) : " · on target") + '</span></div>';
      });
      h += '</div>' + bandChart(m, st);
    }
    h += '</section>';

    // log mock
    var f = pr.form, live = overallBand(f.L, f.R, f.W, f.S);
    h += '<section class="card"><h2>Log a mock test</h2><label class="field">Date<input type="date" data-in="mf_date" value="' + esc(f.date) + '"></label>';
    h += '<div class="grid2"><label class="field">Listening correct (of 40)<input type="number" min="0" max="40" data-in="mf_Lraw" value="' + esc(f.Lraw) + '"></label><label class="field">Listening band<input type="number" step="0.5" min="0" max="9" data-in="mf_L" value="' + esc(f.L) + '"></label>';
    h += '<label class="field">Reading correct (of 40)<input type="number" min="0" max="40" data-in="mf_Rraw" value="' + esc(f.Rraw) + '"></label><label class="field">Reading band<input type="number" step="0.5" min="0" max="9" data-in="mf_R" value="' + esc(f.R) + '"></label>';
    h += '<label class="field">Writing band<input type="number" step="0.5" min="0" max="9" data-in="mf_W" value="' + esc(f.W) + '"></label><label class="field">Speaking band<input type="number" step="0.5" min="0" max="9" data-in="mf_S" value="' + esc(f.S) + '"></label></div>';
    h += '<p class="note" id="mockLive">Overall: <b>' + band(live) + '</b>. Raw scores convert to bands with commonly used Academic tables; real tests vary slightly.</p><button class="btn" data-act="saveMock">Save mock test</button>';
    if (m.length) {
      h += '<div class="tablewrap"><table class="data"><thead><tr><th>Date</th><th>L</th><th>R</th><th>W</th><th>S</th><th>Overall</th><th></th></tr></thead><tbody>';
      m.slice().reverse().forEach(function (x) {
        h += '<tr><td>' + esc(short(x.date)) + '</td><td>' + band(x.L) + '</td><td>' + band(x.R) + '</td><td>' + band(x.W) + '</td><td>' + band(x.S) + '</td><td><b>' + band(overallBand(x.L, x.R, x.W, x.S)) + '</b></td><td><button class="textbtn" data-act="delMock" data-id="' + esc(x.id) + '">Delete</button></td></tr>';
      });
      h += '</tbody></table></div>' + (ui.confirm && ui.confirm.key.indexOf("mock:") === 0 ? confirmBlock(ui.confirm.key, "Delete this mock test?") : "");
    }
    h += '</section>';

    // mistakes
    var ms = docsWithPrefix("m_").sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var filtered = ms.filter(function (x) { return pr.mfilter === "all" || x.skill === pr.mfilter; });
    h += '<section class="card"><div class="row between"><h2>Mistake log (' + ms.length + ')</h2>' + (ms.length ? '<button class="btn ghost small" data-act="mQuiz">Quiz me</button>' : "") + '</div>';
    if (pr.mquiz) {
      var mq = pr.mquiz;
      if (mq.i >= mq.items.length) h += '<div class="prompt">Done. Reviewing old mistakes is one of the fastest ways to stop repeating them.</div><button class="btn ghost small" data-act="mQuizEnd">Close quiz</button>';
      else {
        var it = get(mq.items[mq.i]) || {};
        h += '<div class="fix"><span class="note">' + esc(it.skill) + ' · ' + (mq.i + 1) + '/' + mq.items.length + '</span><span class="o">' + esc(it.wrong) + '</span>' + (mq.show ? '<span class="c">' + esc(it.right) + '</span><span class="muted small">' + esc(it.note || "") + '</span>' : '<span class="note">How should it be? Say it, then reveal.</span>') + '</div><div class="row">' + (mq.show ? '<button class="btn small" data-act="mNext">Next</button>' : '<button class="btn small" data-act="mShow">Reveal</button>') + '<button class="btn ghost small" data-act="mQuizEnd">Stop</button></div>';
      }
    }
    var mf = pr.mform;
    h += '<details><summary class="textbtn">Add a mistake</summary><div class="grid2" style="margin-top:8px"><label class="field">Skill<select data-ch="mf_skill">' + ["Listening", "Reading", "Writing", "Speaking", "Vocabulary"].map(function (s) { return '<option' + (s === mf.skill ? " selected" : "") + '>' + s + '</option>'; }).join("") + '</select></label><span></span></div><label class="field">What I did wrong<input type="text" data-in="mm_wrong" value="' + esc(mf.wrong) + '"></label><label class="field">Correct version<input type="text" data-in="mm_right" value="' + esc(mf.right) + '"></label><label class="field">Rule or note (optional)<input type="text" data-in="mm_note" value="' + esc(mf.note) + '"></label><button class="btn small" data-act="saveMistake" style="justify-self:start">Save mistake</button></details>';
    h += '<label class="field">Show<select data-ch="mfilter"><option value="all">All skills</option>' + ["Listening", "Reading", "Writing", "Speaking", "Vocabulary"].map(function (s) { return '<option' + (s === pr.mfilter ? " selected" : "") + '>' + s + '</option>'; }).join("") + '</select></label>';
    if (!filtered.length) h += '<p class="empty">Mistakes from drills and AI feedback land here automatically, or add your own.</p>';
    filtered.slice(0, 50).forEach(function (x) {
      h += '<div class="mistake"><div class="row between"><span class="note">' + esc(x.skill) + ' · ' + esc(short(x.date)) + (x.source ? " · " + esc(x.source) : "") + '</span><button class="textbtn" data-act="delMistake" data-id="' + esc(x.id) + '">Delete</button></div><span class="o" style="color:var(--bad)">' + esc(x.wrong) + '</span><span style="color:var(--good);font-weight:600">' + esc(x.right) + '</span>' + (x.note ? '<span class="muted small">' + esc(x.note) + '</span>' : "") + '</div>';
    });
    h += '</section>';

    // settings
    h += '<section class="card"><h2>Settings</h2><div class="grid2"><label class="field">Weekly holiday<select data-ch="set_holiday">' + WD.map(function (d, i) { return '<option value="' + i + '"' + (+st.holiday === i ? " selected" : "") + '>' + ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][i] + '</option>'; }).join("") + '</select></label>';
    h += '<label class="field">Exam date<input type="date" data-ch="set_exam" value="' + esc(st.exam) + '"></label>';
    h += '<label class="field">Target band<select data-ch="set_target">' + [6, 6.5, 7, 7.5, 8].map(function (b) { return '<option value="' + b + '"' + (+st.target === b ? " selected" : "") + '>' + band(b) + '</option>'; }).join("") + '</select></label>';
    h += '<label class="field">Stretch goal<select data-ch="set_stretch">' + [6.5, 7, 7.5, 8, 8.5].map(function (b) { return '<option value="' + b + '"' + (+st.stretch === b ? " selected" : "") + '>' + band(b) + '</option>'; }).join("") + '</select></label>';
    h += '<label class="field">New flashcards per day<select data-ch="set_new">' + [5, 10, 15, 20, 30].map(function (b) { return '<option value="' + b + '"' + (+st.newPerDay === b ? " selected" : "") + '>' + b + '</option>'; }).join("") + '</select></label></div><p class="note">After the exam date, the Today routine switches to application tasks.</p></section>';

    // AI settings (installed app only)
    if (!window.claude) {
      var kc = keyCfg(), af = pr.ai || (pr.ai = { provider: (kc && kc.provider) || "openrouter", key: "" });
      h += '<section class="card"><h2>AI settings (online)</h2><p class="note">' + (kc ? (navigator.onLine ? "AI is on: " : "AI is set up but you’re offline: ") + (kc.provider === "anthropic" ? "Anthropic" : "OpenRouter") + " key ending " + esc(kc.key.slice(-4)) + "." : "Add an API key to use essay marking, speaking feedback and new drills in this app when you’re online.") + '</p>';
      h += '<div class="grid2"><label class="field">Provider<select data-ch="ai_provider"><option value="openrouter"' + (af.provider === "openrouter" ? " selected" : "") + '>OpenRouter</option><option value="anthropic"' + (af.provider === "anthropic" ? " selected" : "") + '>Anthropic (Claude API)</option></select></label><span></span></div>';
      h += '<label class="field">API key<input type="password" autocomplete="off" data-in="ai_key" value="' + esc(af.key) + '" placeholder="' + (kc ? "Saved: paste a new key to replace it" : (af.provider === "anthropic" ? "sk-ant-…" : "sk-or-…")) + '"></label>';
      h += '<div class="row"><button class="btn small" data-act="aiSaveKey">Save key</button>' + (kc ? '<button class="btn ghost small" data-act="aiTest"' + (ui.busy ? " disabled" : "") + '>Test</button><button class="btn danger small" data-act="aiRemoveKey">Remove key</button>' : "") + '</div>' + busyBlock("aiTest");
      h += '<p class="note">Your key is stored only on this phone, never on GitHub. Each AI request is charged to your API account, roughly a few US cents for an essay marking [estimate]. Set a monthly spending limit in your provider’s dashboard. Marking uses Claude Sonnet 5.5; quick tasks use Claude Haiku 5.5.</p></section>';
    }

    // backup
    var lastB = 0; try { lastB = +localStorage.getItem("ielts-last-backup") || 0; } catch (e) {}
    h += '<section class="card"><h2>Backup and offline use</h2>' + (!window.claude ? '<p class="note">' + (persisted === true ? "✓ Storage is protected: the phone won’t clear your progress to free space." : persisted === false ? "Storage isn’t protected yet. Install the app to the home screen so the phone keeps your data." : "") + ' Last backup: ' + (lastB ? Math.round((Date.now() - lastB) / 864e5) + " days ago" : "never") + '.</p>' : "") + (!canSay() || (!TTS && !hasLocalVoice()) ? '<p class="note">Pronunciation offline: install an English voice in your phone settings (Android: Settings → Text-to-speech → Google → Install voice data → English UK).</p>' : "") + '<button class="btn ghost wide" data-act="downloadBackup">Save backup file</button><p class="note">' + (window.claude ? "Your progress saves to your Claude account." : "This offline copy saves on this device only.") + ' To move progress between the Claude version and the offline app, tap Copy backup on one, then Restore on the other. Restoring merges: nothing is lost.</p>' + (installEvt ? '<button class="btn" data-act="installApp">Install as an app</button>' : "") + '<div class="grid2"><button class="btn ghost" data-act="copyBackup">Copy backup</button><button class="btn ghost" data-act="showRestore">Restore from backup</button></div>';
    if (pr.backupText) h += '<textarea rows="4" readonly aria-label="Backup text">' + esc(pr.backupText) + '</textarea><p class="note">Copying was blocked here. Select the text above and copy it yourself.</p>';
    if (pr.restore) h += '<textarea rows="4" data-in="restoreText" placeholder="Paste a backup here" aria-label="Backup to restore">' + esc(pr.restoreText) + '</textarea><button class="btn" data-act="doRestore">Restore (adds to what you have)</button>';
    return h + '</section>';
  }
  function bandChart(m, st) {
    var W = 360, H = 200, L = 28, R = 10, Tp = 14, B = 26, lo = 4, hi = 9;
    var x = function (i) { return L + (m.length === 1 ? (W - L - R) / 2 : i * (W - L - R) / (m.length - 1)); };
    var y = function (v) { return Tp + (hi - v) / (hi - lo) * (H - Tp - B); };
    var s = '<div class="chart"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Overall band by mock test">';
    for (var b = lo; b <= hi; b++) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(b) + '" y2="' + y(b) + '" stroke="var(--line)"/><text x="' + (L - 8) + '" y="' + (y(b) + 4) + '" text-anchor="end" font-size="12" fill="var(--muted)">' + b + '</text>';
    [[st.target, "target"], [st.stretch, "stretch"]].forEach(function (t, i) {
      if (t[0] > st.target || i === 0) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(t[0]) + '" y2="' + y(t[0]) + '" stroke="' + (i ? "var(--muted)" : "var(--warn)") + '" stroke-dasharray="5 5"/><text x="' + (W - R) + '" y="' + (y(t[0]) - 5) + '" text-anchor="end" font-size="12" fill="' + (i ? "var(--muted)" : "var(--warn)") + '">' + t[1] + ' ' + band(t[0]) + '</text>';
    });
    var pts = m.map(function (r, i) { return [x(i), y(overallBand(r.L, r.R, r.W, r.S) || lo), overallBand(r.L, r.R, r.W, r.S), r.date]; });
    if (pts.length > 1) s += '<polyline fill="none" stroke="var(--accent)" stroke-width="2.5" points="' + pts.map(function (p) { return p[0] + "," + p[1]; }).join(" ") + '"/>';
    pts.forEach(function (p, i) {
      var lastOne = i === pts.length - 1;
      s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (lastOne ? 5 : 3.5) + '" fill="var(--accent)"/>';
      if (lastOne || pts.length <= 8) s += '<text x="' + p[0] + '" y="' + (p[1] - 9) + '" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink)">' + band(p[2]) + '</text>';
      if (pts.length <= 8 || lastOne || i === 0) s += '<text x="' + p[0] + '" y="' + (H - 10) + '" text-anchor="' + (pts.length > 1 && lastOne ? "end" : (pts.length > 1 && i === 0 ? "start" : "middle")) + '" font-size="11" fill="var(--muted)">' + esc(short(p[3])) + '</text>';
    });
    return s + '</svg></div>';
  }

  // ================= actions =================
  var ACT = {
    go: function (el) { location.hash = el.getAttribute("data-tab"); },
    say: function (el) { say(el.getAttribute("data-text")); },
    stopAi: function () { if (ui.busy) ui.busy.ctl.abort(); },
    confirmNo: function () { ui.confirm = null; render(); },
    confirmYes: function () { var c = ui.confirm; ui.confirm = null; if (c && c.run) c.run(); render(); },

    // today
    dayPrev: function () { ui.sel = addDays(ui.sel, -1); render(); },
    dayNext: function () { ui.sel = addDays(ui.sel, 1); render(); },
    dayToday: function () { ui.sel = today(); render(); },
    pickDay: function (el) { ui.sel = el.getAttribute("data-day"); render(); },
    setType: function (el) { var r = dayRec(ui.sel); r.type = el.getAttribute("data-type"); writeDay(ui.sel, r); render(); },

    // cards
    deck: function (el) { ui.cards.deck = el.getAttribute("data-deck"); ui.cards.showAll = false; render(); },
    setDeck: function (el) { ui.cards.deck = el.getAttribute("data-v"); render(); },
    setLevel: function (el) { ui.cards.level = el.getAttribute("data-v"); render(); },
    mode: function (el) {
      var m = el.getAttribute("data-m");
      if (m === "browse") { ui.cards.mode = "browse"; ui.cards.showAll = false; render(); window.scrollTo(0, 0); return; }
      if (m === "spell") return startSpell();
      if (m === "quiz") return startQuiz();
      if (m === "match") return startMatch();
      if (m === "cloze") return startCloze();
      if (m === "difficult") {
        var s = srs(), ids = deckCards(ui.cards.deck).filter(function (c) { var st = s.cards[c.id]; return st && (st.lapses || 0) >= 2; }).map(function (c) { return c.id; });
        if (!ids.length) { toast("No difficult words yet. Words you forget twice will collect here."); return; }
        return startSession(shuffle(ids).slice(0, 40));
      }
    },
    clearFilters: function () { ui.cards.b = { deck: "all", level: "all", status: "all", pos: "all" }; ui.cards.search = ""; render(); },
    studyFiltered: function () { var ids = filterCards(browseFilter()).map(function (c) { return c.id; }); var s = srs(); ids.sort(function (a, b) { return ((s.cards[a] || {}).due || 0) - ((s.cards[b] || {}).due || 0); }); startSession(ids.slice(0, 40)); },
    drillFiltered: function (el) {
      var pool = filterCards(browseFilter()), m = el.getAttribute("data-m");
      if (m === "cloze") return startCloze(pool);
      if (m === "quiz") return startQuiz(pool);
      if (m === "match") return startMatch(pool);
    },
    clozeCheck: function () { clozeCheck(); },
    clozeHint: function () { ui.cards.cloze.hint = true; render(); var i = $("clozeInput"); if (i) i.focus(); },
    clozeNext: function () { var cz = ui.cards.cloze; cz.i++; cz.input = ""; cz.result = null; cz.hint = false; render(); var i = $("clozeInput"); if (i) i.focus(); },
    startReview: function () {
      var q = buildQueue(ui.cards.deck);
      if (!q.length) { toast("Nothing to review here right now."); return; }
      startSession(q);
    },
    reveal: function () { flipCard(); },
    showBn: function (el) {
      ui.cards.session.bn = true;
      var x = cardById(ui.cards.session.queue[ui.cards.session.i]);
      var d = document.createElement("div"); d.className = "bn"; d.textContent = x.bn; el.replaceWith(d);
    },
    toggleAuto: function (el) {
      autoPlay = !autoPlay; try { localStorage.setItem("ielts-autoplay", autoPlay ? "1" : "0"); } catch (e) {}
      el.classList.toggle("on", autoPlay); el.setAttribute("aria-pressed", String(autoPlay));
      toast(autoPlay ? "Words will be read aloud automatically." : "Auto-play off.");
    },
    rate: function (el) { rateCard(+el.getAttribute("data-q")); },
    cardsHome: function () { ui.cards.mode = "home"; ui.cards.session = null; tPause("match"); render(); window.scrollTo(0, 0); },
    checkUse: async function () {
      var sess = ui.cards.session, x = cardById(sess.queue[sess.i]);
      if (!sess.use || sess.use.trim().length < 3) { toast("Write a sentence first."); return; }
      try {
        sess.check = await aiCall("checkUse", 'You are an IELTS teacher. A learner wrote a sentence using the word "' + x.w + '" (meaning: ' + x.def + ').\nSentence: "' + sess.use + '"\nIs the word used correctly and naturally, and is the grammar correct? Reply with only JSON: {"ok": true or false, "feedback": "one or two short sentences", "better": "an improved version of their sentence, or empty string if already good"}', "quick");
        render();
      } catch (e) { aiFail(e); }
    },
    spellSay: function () { var sp = ui.cards.spell; say(cardById(sp.items[sp.i]).w); },
    spellSaySlow: function () { var sp = ui.cards.spell; say(cardById(sp.items[sp.i]).w, 0.7); },
    spellCheck: function () { spellCheck(); },
    spellNext: function () {
      var sp = ui.cards.spell; sp.i++; sp.input = ""; sp.result = null; render();
      if (sp.i < sp.items.length) { say(cardById(sp.items[sp.i]).w); var inp = $("spellInput"); if (inp) inp.focus(); }
    },
    quizPick: function (el) {
      var qz = ui.cards.quiz, it = qz.items[qz.i], n = +el.getAttribute("data-n");
      qz.picked = n;
      if (it.opts[n] === it.id) qz.score++;
      else { var s = srs(); if (s.cards[it.id]) { s.cards[it.id].due = Date.now(); saveSrs(s); } }
      render();
    },
    quizNext: function () { var qz = ui.cards.quiz; qz.i++; qz.picked = null; render(); },
    matchPick: function (el) {
      var m = ui.cards.match, side = el.getAttribute("data-side"), id = el.getAttribute("data-id");
      if (m.done.indexOf(id) !== -1) return;
      m.wrong = null;
      if (!m.pick || m.pick.side === side) { m.pick = { side: side, id: id }; render(); return; }
      var L = side === "L" ? id : m.pick.id, R = side === "R" ? id : m.pick.id;
      m.pick = null;
      if (L === R) {
        m.done.push(L);
        if (m.done.length === m.items.length) {
          tPause("match"); m.secs = tElapsed("match");
          var best = 0; try { best = +localStorage.getItem("ielts-match-best") || 0; } catch (e) {}
          m.newBest = !best || m.secs < best;
          if (m.newBest) { best = Math.round(m.secs); try { localStorage.setItem("ielts-match-best", String(best)); } catch (e) {} }
          m.best = best;
        }
      } else {
        m.mistakes++; m.wrong = { L: L, R: R };
        var s = srs(); [L, R].forEach(function (cid) { if (s.cards[cid]) s.cards[cid].due = Math.min(s.cards[cid].due, Date.now()); }); saveSrs(s);
        setTimeout(function () { if (m.wrong && m.wrong.L === L) { m.wrong = null; if (ui.tab === "cards" && ui.cards.mode === "match") render(); } }, 700);
      }
      render();
    },
    addFill: async function () {
      var a = ui.cards.add;
      if (!a.w.trim()) { toast("Type a word first."); return; }
      try {
        var r = await aiCall("addFill", 'Make an IELTS Academic vocabulary flashcard for the English word or phrase "' + a.w.trim() + '". Reply with only JSON: {"w": "the word in its base form", "pos": "part of speech", "def": "simple English definition, under 15 words", "ex": "natural example sentence in an academic IELTS Writing context", "ex2": "second example in an everyday or Speaking context", "ex3": "third example in a different context, e.g. a chart description or news", "lvl": "CEFR level: A2, B1, B2, C1 or C2", "bn": "short Bangla meaning", "topic": "one of: ' + Object.keys(D.TOPICS).filter(function (k) { return k !== "mine"; }).join(", ") + '"}', "quick");
        a.w = r.w || a.w; a.pos = r.pos || ""; a.def = r.def || ""; a.ex = r.ex || ""; a.ex2 = r.ex2 || ""; a.ex3 = r.ex3 || ""; a.bn = r.bn || "";
        a.lvl = /^(A2|B1|B2|C1|C2)$/.test(r.lvl) ? r.lvl : "B2";
        a.topic = D.TOPICS[r.topic] ? r.topic : "mine";
        render();
      } catch (e) { aiFail(e); }
    },
    addSave: function () {
      var a = ui.cards.add;
      if (!a.w.trim() || !a.def.trim()) { toast("Add the word and its meaning."); return; }
      put("c_" + uid(), { w: a.w.trim(), pos: a.pos.trim(), def: a.def.trim(), ex: a.ex.trim(), ex2: (a.ex2 || "").trim(), ex3: (a.ex3 || "").trim(), lvl: a.lvl || "B2", bn: a.bn.trim(), topic: a.topic || "mine", added: today() });
      ui.cards.add = { w: "", pos: "", def: "", ex: "", ex2: "", ex3: "", bn: "", topic: "mine", lvl: "B2" };
      toast("Card saved. It joins your next review as a new card."); render();
    },
    cardNow: function (el) {
      var id = el.getAttribute("data-id"), s = srs();
      s.cards[id] = Object.assign(s.cards[id] || { ivl: 0, ease: 2.5, reps: 0, lapses: 0 }, { due: Date.now() });
      saveSrs(s); toast("This card is now due."); render();
    },
    cardDel: function (el) {
      var id = el.getAttribute("data-id");
      ui.confirm = { key: "card:" + id, run: function () { del(id); var s = srs(); delete s.cards[id]; saveSrs(s); } };
      render();
    },
    showAllCards: function () { ui.cards.showAll = true; render(); },

    // writing
    wTask: function (el) { ui.write.task = +el.getAttribute("data-n"); tSet("write", (ui.write.task === 1 ? 20 : 40) * 60, "down"); render(); },
    nextPrompt: function () { var w = ui.write; w.custom = null; if (w.task === 1) w.p1++; else w.pi++; render(); },
    togglePlan: function () { ui.write.plan = !ui.write.plan; render(); },
    aiPrompt: async function () {
      var w = ui.write;
      try {
        if (w.task === 2) {
          var want = w.t2type && w.t2type !== "all" ? w.t2type : null;
          var r = await aiCall("aiPrompt", 'Write one new, original IELTS Academic Writing Task 2 question in the style of the real test, on a common IELTS theme (education, environment, technology, work, health, society, cities, crime, media, culture). ' + (want ? 'The question type must be: ' + D.TYPE_NAMES[want] + '. ' : "") + 'Avoid these themes this time: ' + T2ALL.slice(0, 6).map(function (t) { return t.q.split(".")[0]; }).join("; ") + '. Reply with only JSON: {"type": "opinion" | "discussion" | "advdis" | "posneg" | "problem" | "twopart", "q": "the full question including the final instruction sentence"}', "quick");
          w.custom = { task: 2, type: D.PLANS[r.type] ? r.type : (want || "opinion"), q: r.q };
        } else {
          var kinds = ["table", "line", "bar", "pie", "process", "map"], k = w.t1kind && w.t1kind !== "all" ? w.t1kind : kinds[Math.floor(Math.random() * kinds.length)];
          var shape = {
            table: '"charts": [{"kind": "table", "unit": "...", "cols": ["first column label", "year or category", "..."], "rows": [["row label", "number", "..."]]}] with 3 to 6 rows',
            line: '"charts": [{"kind": "line", "unit": "...", "cols": ["Series", "year1", "year2", "...5 or 6 time points"], "rows": [["series name", "number", "..."]]}] with 2 to 4 series',
            bar: '"charts": [{"kind": "bar", "unit": "...", "cols": ["Category", "group1", "group2"], "rows": [["category", "number", "number"]]}] with 4 to 6 categories',
            pie: '"charts": [{"kind": "pie", "unit": "%", "cols": ["Category", "year1", "year2"], "rows": [["category", "percent", "percent"]]}] where each year column adds up to exactly 100, with 4 or 5 categories',
            process: '"charts": [{"kind": "process", "steps": ["stage 1", "..."]}] with 6 to 9 short stages of a natural or manufacturing process',
            map: '"charts": [{"kind": "map", "maps": [{"title": "earlier year", "grid": [["feature", "feature", "feature"], ["...3 rows of 3 short features"]]}, {"title": "later year or now", "grid": [["..."]]}]}] showing how a town, campus or park changed, with at least 4 changed cells'
          }[k];
          var r1 = await aiCall("aiPrompt", 'Write one original IELTS Academic Writing Task 1 question of type: ' + k + '. Use made-up but realistic data on a varied subject (energy, transport, spending, population, tourism, education, environment). Reply with only JSON: {"q": "the full task text in real IELTS wording, ending with the standard instruction to summarise the main features (and make comparisons where relevant, except for a process)", ' + shape + '}', "quick");
          if (!r1 || !r1.charts || !r1.charts.length) throw { code: "invalid_json" };
          w.custom = { task: 1, type: "task1", kind: k, q: r1.q, charts: r1.charts };
        }
        render();
      } catch (e) { aiFail(e); }
    },
    wTimer: function (el) {
      var op = el.getAttribute("data-op");
      if (op === "start") tStart("write"); else if (op === "pause") tPause("write"); else tSet("write", (ui.write.task === 1 ? 20 : 40) * 60, "down");
      paintTimers();
    },
    grade: async function () {
      var w = ui.write, p = currentWritePrompt(), s = textStats(w.text);
      if (s.words < 60) { toast("Write at least 60 words before marking."); return; }
      var mins = Math.round(tElapsed("write") / 60);
      var prompt = 'You are a strict, experienced IELTS examiner. Assess this IELTS Academic Writing Task ' + p.task + ' response using the public IELTS band descriptors for ' + (p.task === 1 ? "Task Achievement" : "Task Response") + ', Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy. Score realistically in 0.5 steps; do not inflate. Apply the under-length penalty if it has fewer than ' + (p.task === 1 ? 150 : 250) + ' words.\n\nQUESTION:\n' + p.q + (p.task === 1 ? "\n" + chartText(p) : "") + '\n\nRESPONSE (' + s.words + ' words' + (mins ? ', written in about ' + mins + ' minutes' : "") + '):\n' + w.text + '\n\nThe learner is from Bangladesh and is aiming for band ' + settings().target + ' or higher.\nReply with only JSON in exactly this shape:\n{"overall": 6.5, "criteria": [{"name": "' + (p.task === 1 ? "Task Achievement" : "Task Response") + '", "band": 6.5, "comment": "one or two specific sentences"}, {"name": "Coherence and Cohesion", "band": 6.5, "comment": "..."}, {"name": "Lexical Resource", "band": 6.5, "comment": "..."}, {"name": "Grammatical Range and Accuracy", "band": 6.5, "comment": "..."}], "summary": "two sentences on the main reason for this band", "fixes": [{"original": "an exact short phrase or sentence copied from the response", "corrected": "the corrected version", "why": "the rule, in a few words"}], "upgrades": [{"from": "a plain word or phrase the learner used", "to": "a more precise academic alternative", "example": "a short sentence using it"}], "model_intro": "a band-8 rewrite of their introduction (or overview for Task 1)", "next_focus": "one concrete thing to practise next"}\nGive up to 6 fixes (the most important errors) and up to 6 upgrades.';
      try {
        var r = await aiCall("grade", prompt, "default");
        w.result = r;
        var id = w.savedId || ("e_" + uid());
        put(id, { date: today(), task: p.task, ptype: p.type, prompt: p.q, text: w.text, words: s.words, minutes: mins, result: r });
        w.savedId = id;
        autoTick(p.task === 2 ? ["essay"] : []);
        render();
      } catch (e) { aiFail(e); }
    },
    saveEssay: function () {
      var w = ui.write, p = currentWritePrompt(), s = textStats(w.text);
      if (s.words < 20) { toast("Write a bit more before saving."); return; }
      var id = w.savedId || ("e_" + uid());
      put(id, { date: today(), task: p.task, ptype: p.type, prompt: p.q, text: w.text, words: s.words, minutes: Math.round(tElapsed("write") / 60), result: w.result || null });
      w.savedId = id; toast("Essay saved."); render();
    },
    newEssay: function () { var w = ui.write; w.text = ""; w.result = null; w.savedId = null; w.custom = null; if (w.task === 1) w.p1++; else w.pi++; tSet("write", (w.task === 1 ? 20 : 40) * 60, "down"); saveDrafts(); render(); },
    viewEssay: function (el) { ui.write.view = el.getAttribute("data-id"); render(); window.scrollTo(0, 0); },
    closeView: function () { ui.write.view = null; render(); },
    delEssay: function (el) { var id = el.getAttribute("data-id"); ui.confirm = { key: "essay:" + id, run: function () { del(id); ui.write.view = null; if (ui.write.savedId === id) ui.write.savedId = null; } }; render(); },
    fixToMistake: function (el) {
      var kind = el.getAttribute("data-kind"), res = resultFor(kind), f = res && res.fixes && res.fixes[+el.getAttribute("data-i")];
      if (!f) return;
      put("m_" + uid(), { skill: kind.indexOf("speak") === 0 ? "Speaking" : "Writing", wrong: f.original, right: f.corrected, note: f.why, date: today(), source: "AI feedback" });
      el.textContent = "Saved"; el.disabled = true;
    },
    upgradesToCards: function (el) {
      var res = resultFor(el.getAttribute("data-kind")); if (!res || !res.upgrades) return;
      var have = allCards().map(function (c) { return c.w.toLowerCase(); }), n = 0;
      res.upgrades.forEach(function (u) {
        if (!u.to || have.indexOf(String(u.to).toLowerCase()) !== -1) return;
        put("c_" + uid(), { w: u.to, pos: "", def: "a better way to say “" + u.from + "”", ex: u.example || "", bn: "", topic: "mine", added: today() }); n++;
      });
      toast(n ? n + " new cards added to My words." : "These are already in your cards."); el.disabled = true;
    },
    sayModel: function (el) { var res = resultFor(el.getAttribute("data-kind")); if (res && res.model_answer) say(res.model_answer, 0.95); },

    // speaking
    sPart: function (el) { var sp = ui.speak; sp.part = +el.getAttribute("data-n"); sp.phase = "idle"; sp.secs = 0; tSet("speak", sp.part === 2 ? 60 : 0, sp.part === 2 ? "down" : "up"); render(); },
    nextCue: function () { var sp = ui.speak; sp.idx++; sp.phase = "idle"; sp.notes = ""; sp.result = null; sp.savedId = null; tSet("speak", sp.part === 2 ? 60 : 0, sp.part === 2 ? "down" : "up"); render(); },
    nextP1: function () { var sp = ui.speak; sp.p1++; sp.result = null; sp.savedId = null; render(); },
    sayQs: function () { var p = D.PART1[ui.speak.p1 % D.PART1.length]; say(p.qs.join(" ... ")); },
    sayP3: function () { var c = D.PART2[ui.speak.idx % D.PART2.length]; say(c.p3.join(" ... ")); },
    startPrep: function () { var sp = ui.speak; sp.phase = "prep"; sp.notes = ""; sp.text = ""; sp.result = null; sp.savedId = null; sp.secs = 0; tSet("speak", 60, "down"); tStart("speak"); render(); },
    skipPrep: function () { var sp = ui.speak; sp.phase = "talk"; tSet("speak", 120, "down"); tStart("speak"); render(); },
    endTalk: function () { var sp = ui.speak; sp.secs = tElapsed("speak"); tPause("speak"); sp.phase = "done"; render(); },
    sTimer: function (el) { var op = el.getAttribute("data-op"); if (op === "start") tStart("speak"); else if (op === "pause") tPause("speak"); else tSet("speak", 0, "up"); paintTimers(); },
    mic: function () {
      if (!DICT) return;
      if (DICT.webSpeech && !navigator.onLine && !DICT.active()) { toast("Speech-to-type needs internet on most phones. Type your answer for now."); return; }
      if (DICT.active()) { DICT.stop().catch(function () {}); return; }
      DICT.start().catch(function (e) {
        var c = e && e.code;
        if (c === "not_granted" || c === "unavailable") { DICT = null; render(); toast("Speech-to-text isn’t available. You can type your answer."); }
        else if (c === "rate_limited") toast("Speech-to-text is busy. Try again in a moment.");
        else if (c !== "stopped" && c !== "dismissed") toast("Couldn’t start speech-to-text.");
      });
    },
    speakFeedback: async function () {
      var sp = ui.speak, s = textStats(sp.text), secs = Math.round(speakSecs());
      if (s.words < 25) { toast("Your answer is too short to assess. Say a bit more."); return; }
      var target = sp.part === 2 ? "about 250 words, natural spoken style" : "about 60–80 words per question, natural spoken style";
      var prompt = 'You are an experienced IELTS Speaking examiner. Below is a transcript of a learner\'s spoken answer, produced by speech-to-text or typed afterwards, so ignore punctuation and capitalisation. Pronunciation cannot be judged from text: say so briefly and give one general tip.\nAssess Fluency and Coherence, Lexical Resource, and Grammatical Range and Accuracy using the public IELTS descriptors. Be realistic; do not inflate.\n\nTASK: ' + speakPrompt() + '\nSPEAKING TIME: ' + (secs ? secs + " seconds" : "unknown") + ', ' + s.words + ' words, ' + s.fillers + ' possible filler words.\nTRANSCRIPT:\n' + sp.text + '\n\nReply with only JSON in exactly this shape:\n{"band": 6.0, "criteria": [{"name": "Fluency and Coherence", "band": 6.0, "comment": "specific comment"}, {"name": "Lexical Resource", "band": 6.0, "comment": "..."}, {"name": "Grammatical Range and Accuracy", "band": 6.0, "comment": "..."}], "pron_note": "one sentence", "summary": "two sentences", "fixes": [{"original": "exact phrase from the transcript", "corrected": "better version", "why": "short rule"}], "upgrades": [{"from": "plain phrase used", "to": "more natural or idiomatic phrase", "example": "short example"}], "model_answer": "a band-8 answer to the same task, ' + target + ', using ideas a person from Bangladesh might naturally use", "follow_ups": ["three Part 3 style follow-up questions"], "next_focus": "one concrete thing to practise"}\nGive up to 5 fixes and up to 5 upgrades.';
      try {
        var r = await aiCall("speakFeedback", prompt, "default");
        sp.result = r;
        var id = sp.savedId || ("s_" + uid());
        put(id, { date: today(), part: sp.part, prompt: speakPrompt(), text: sp.text, seconds: secs, result: r });
        sp.savedId = id;
        autoTick(["speak"]);
        render();
      } catch (e) { aiFail(e); }
    },
    saveSpeak: function () {
      var sp = ui.speak;
      if (textStats(sp.text).words < 5) { toast("Add your answer first."); return; }
      var id = sp.savedId || ("s_" + uid());
      put(id, { date: today(), part: sp.part, prompt: speakPrompt(), text: sp.text, seconds: Math.round(speakSecs()), result: sp.result || null });
      sp.savedId = id; autoTick(["speak"]); toast("Session saved."); render();
    },
    newSpeak: function () { var sp = ui.speak; sp.text = ""; sp.notes = ""; sp.result = null; sp.savedId = null; sp.phase = "idle"; sp.partial = ""; tSet("speak", sp.part === 2 ? 60 : 0, sp.part === 2 ? "down" : "up"); saveDrafts(); render(); },
    viewSpeak: function (el) { ui.speak.view = el.getAttribute("data-id"); render(); window.scrollTo(0, 0); },
    closeSpeakView: function () { ui.speak.view = null; render(); },
    delSpeak: function (el) { var id = el.getAttribute("data-id"); ui.confirm = { key: "speak:" + id, run: function () { del(id); ui.speak.view = null; } }; render(); },

    // practice
    pKind: function (el) { ui.practice.kind = el.getAttribute("data-k"); render(); },
    prepOffline: async function () {
      var plan = [["reading", "mixed"], ["reading", weakestType("reading")], ["listening", "mixed"], ["listening", weakestType("listening")]], made = 0;
      try {
        for (var i = 0; i < plan.length; i++) {
          ui.prep = i + 1;
          var d = await aiCall("prepOffline", drillPrompt(plan[i][0], plan[i][1], "", LSECTIONS[(i * 2 + new Date().getDate()) % 4]), "default");
          if (validDrill(d)) { d.kind = plan[i][0]; d.type = plan[i][1] === "mixed" ? "Mixed set" : typeName(plan[i][0], plan[i][1]); saveToBank(d); made++; }
        }
        ui.prep = 0; toast(made + " drills saved. They work without internet."); render();
      } catch (e) { ui.prep = 0; if (made) toast(made + " drills saved before it stopped."); aiFail(e); }
    },
    genDrill: function () { var p = ui.practice; return runDrill(p.kind, p.kind === "reading" ? p.rtype : p.ltype); },
    genWeakest: function () { var p = ui.practice, id = weakestType(p.kind); if (p.kind === "reading") p.rtype = id; else p.ltype = id; return runDrill(p.kind, id); },
    openSample: function (el) {
      var s = D4.SAMPLES.filter(function (x) { return x.id === el.getAttribute("data-id"); })[0]; if (!s) return;
      loadDrill(s, null); ui.practice.sampleId = s.id;
    },
    checkDrill: function () {
      var p = ui.practice, d = p.data;
      p.checked = true; tPause("practice"); stopSay(); p.playing = false;
      var total = 0, sc = 0;
      groupsOf(d).forEach(function (g, gi) {
        var gs = 0, qs = g.questions || [];
        qs.forEach(function (q, i) {
          var a = p.answers[gi + "-" + i];
          if (answerOk(q, a, g)) gs++;
          else put("m_" + uid(), { skill: p.kind === "reading" ? "Reading" : "Listening", wrong: (q.q || "") + " → I answered: " + (Array.isArray(a) ? a.join(", ") : (a || "(blank)")), right: ansLabel(q), note: q.explanation || groupTypeName(d, g), date: today(), source: groupTypeName(d, g) });
        });
        if (qs.length) addDrill({ date: today(), kind: p.kind, type: groupTypeName(d, g), score: gs, total: qs.length });
        sc += gs; total += qs.length;
      });
      if (p.bankId) markBank(p.bankId, sc);
      if (p.sampleId) { var ss = Object.assign({}, get("samplescores") || {}); ss[p.sampleId] = sc + "/" + total; put("samplescores", ss); }
      autoTick(["test"]);
      render();
    },
    playL: function () {
      var p = ui.practice, lines = (p.data.lines || []).filter(function (l) { return l.text; });
      if (!lines.length) return;
      p.plays++; p.playing = true; tStart("practice"); render();
      var speakers = []; lines.forEach(function (l) { if (speakers.indexOf(l.speaker) === -1) speakers.push(l.speaker); });
      var voices = ["buttery", "airy", "glassy", "rounded"];
      var done = function () { p.playing = false; if (ui.tab === "practice") softRender(); };
      if (TTS) {
        TTS.speak(lines.slice(0, 100).map(function (l) { return { text: String(l.text).slice(0, 1900), voice: voices[speakers.indexOf(l.speaker) % 4], language: "en-GB" }; })).then(done, function (e) {
          done(); if (e && e.code === "not_granted") { ttsOff = true; render(); } else if (e && e.code !== "stopped") toast("Audio stopped early.");
        });
      } else {
        try { speechSynthesis.cancel(); } catch (e) {}
        var i = 0, pitches = [1, 1.25, 0.85, 1.1];
        (function nextLine() {
          if (!p.playing || i >= lines.length) return done();
          var l = lines[i++];
          sayFallback(l.text, 0.95, pitches[speakers.indexOf(l.speaker) % 4]).then(nextLine);
        })();
      }
    },
    openDrill: function (el) {
      var id = el.getAttribute("data-id"), b = drillBank().filter(function (x) { return x.id === id; })[0]; if (!b) return;
      loadDrill(b.data, id);
    },
    stopL: function () { ui.practice.playing = false; stopSay(); render(); },

    // progress
    saveMock: function () {
      var f = ui.progress.form;
      if (overallBand(f.L, f.R, f.W, f.S) === null) { toast("Enter all four bands (or raw scores for Listening and Reading)."); return; }
      var m = get("mocks"), list = ((m && m.list) || []).concat([{ id: uid(), date: f.date || today(), L: +f.L, R: +f.R, W: +f.W, S: +f.S }]);
      put("mocks", { list: list, updated: new Date().toISOString() });
      if ((f.date || today()) === today()) autoTick(["mock"]);
      ui.progress.form = { date: today(), L: "", R: "", W: "", S: "", Lraw: "", Rraw: "" };
      toast("Mock test saved."); render();
    },
    delMock: function (el) {
      var id = el.getAttribute("data-id");
      ui.confirm = { key: "mock:" + id, run: function () { var m = get("mocks"); put("mocks", { list: ((m && m.list) || []).filter(function (x) { return x.id !== id; }), updated: new Date().toISOString() }); } };
      render();
    },
    saveMistake: function () {
      var mf = ui.progress.mform;
      if (!mf.wrong.trim() || !mf.right.trim()) { toast("Fill in the mistake and the correct version."); return; }
      put("m_" + uid(), { skill: mf.skill, wrong: mf.wrong.trim(), right: mf.right.trim(), note: mf.note.trim(), date: today(), source: "" });
      ui.progress.mform = { skill: mf.skill, wrong: "", right: "", note: "" }; toast("Mistake saved."); render();
    },
    delMistake: function (el) { del(el.getAttribute("data-id")); render(); },
    mQuiz: function () { var ids = shuffle(docsWithPrefix("m_").map(function (x) { return x.id; })).slice(0, 5); ui.progress.mquiz = { items: ids, i: 0, show: false }; render(); },
    mShow: function () { ui.progress.mquiz.show = true; render(); },
    mNext: function () { var q = ui.progress.mquiz; q.i++; q.show = false; render(); },
    mQuizEnd: function () { ui.progress.mquiz = null; render(); },
    snoozeBackup: function () { try { localStorage.setItem("ielts-last-backup", String(Date.now() - 7 * 864e5)); } catch (e) {} render(); },
    downloadBackup: function () {
      var text = JSON.stringify({ app: "ielts-tracker", v: 2, at: new Date().toISOString(), docs: S.docs });
      try {
        var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
        a.download = "ielts-backup-" + today() + ".json"; document.body.appendChild(a); a.click(); a.remove();
        markBackup(); toast("Backup file saved to Downloads.");
      } catch (e) { ui.progress.backupText = text; render(); }
    },
    copyBackup: function () {
      var text = JSON.stringify({ app: "ielts-tracker", v: 2, at: new Date().toISOString(), docs: S.docs }); markBackup();
      try {
        navigator.clipboard.writeText(text).then(function () { toast("Backup copied. Paste it into a note or email to yourself."); }, function () { ui.progress.backupText = text; render(); });
      } catch (e) { ui.progress.backupText = text; render(); }
    },
    showRestore: function () { ui.progress.restore = !ui.progress.restore; render(); },
    doRestore: function () {
      var o; try { o = JSON.parse(ui.progress.restoreText); } catch (e) { toast("That doesn’t look like a backup."); return; }
      if (!o || !o.docs) { toast("That doesn’t look like a backup."); return; }
      var ids = Object.keys(o.docs).filter(function (k) { var m = mergeDoc(k, S.docs[k], o.docs[k]); return m !== null; });
      var i = 0;
      (function step() {
        if (i >= ids.length) { toast("Restored and merged " + ids.length + " items."); render(); return; }
        var k = ids[i++]; var m = mergeDoc(k, S.docs[k], o.docs[k]); if (m) put(k, m); setTimeout(step, 120);
      })();
      ui.progress.restore = false; ui.progress.restoreText = "";
    },
    aiSaveKey: function () {
      var af = ui.progress.ai || {}, key = (af.key || "").trim();
      if (key.length < 20) { toast("Paste your full API key first."); return; }
      try { localStorage.setItem(KEY_LS, JSON.stringify({ provider: af.provider || "openrouter", key: key })); } catch (e) { toast("Couldn’t save the key on this device."); return; }
      AI = makeKeyAI(keyCfg()); af.key = ""; toast("Key saved. Tap Test to check it."); render();
    },
    aiRemoveKey: function () { try { localStorage.removeItem(KEY_LS); } catch (e) {} AI = null; toast("Key removed from this device."); render(); },
    aiTest: async function () {
      try { var r = await aiCall("aiTest", 'Reply with only this JSON: {"ok": true}', "quick"); toast(r && r.ok ? "AI connection works." : "Connected, but the answer looked odd."); render(); }
      catch (e) { aiFail(e); }
    },
    installApp: function () {
      if (!installEvt) return;
      installEvt.prompt(); installEvt.userChoice.then(function () { installEvt = null; render(); }, function () {});
    }
  };
  function mergeDoc(k, mine, theirs) {
    // returns the merged doc, or null when nothing changes
    if (!theirs || typeof theirs !== "object") return null;
    if (!mine) return theirs;
    if (JSON.stringify(mine) === JSON.stringify(theirs)) return null;
    if (k === "srs") {
      var out = { cards: Object.assign({}, mine.cards || {}), log: Object.assign({}, mine.log || {}), newLog: Object.assign({}, mine.newLog || {}), updated: new Date().toISOString() };
      Object.keys(theirs.cards || {}).forEach(function (id) { var a = out.cards[id], b = theirs.cards[id]; if (!a || (b.last || 0) > (a.last || 0)) out.cards[id] = b; });
      ["log", "newLog"].forEach(function (f) { Object.keys(theirs[f] || {}).forEach(function (d) { out[f][d] = Math.max(out[f][d] || 0, theirs[f][d] || 0); }); });
      return out;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(k)) {
      var done = (mine.done || []).slice(); (theirs.done || []).forEach(function (x) { if (done.indexOf(x) === -1) done.push(x); });
      return { type: mine.type || theirs.type, done: done, updated: new Date().toISOString() };
    }
    if (k === "mocks" || k === "drills") {
      var seen = {}, list = [];
      (mine.list || []).concat(theirs.list || []).forEach(function (x) { var key = x.id || (x.date + x.kind + x.type + x.score); if (!seen[key]) { seen[key] = 1; list.push(x); } });
      return { list: list, updated: new Date().toISOString() };
    }
    if ((theirs.updated || "") > (mine.updated || "")) return theirs;
    return null;
  }
  function resultFor(kind) {
    if (kind === "essay") return ui.write.result;
    if (kind === "speak") return ui.speak.result;
    if (kind === "essayView") return (get(ui.write.view) || {}).result;
    if (kind === "speakView") return (get(ui.speak.view) || {}).result;
    return null;
  }
  function rateCard(q) {
    var sess = ui.cards.session; if (!sess || !sess.revealed) return;
    var id = sess.queue[sess.i], s = srs(), prev = s.cards[id];
    if (!prev) s.newLog[today()] = (s.newLog[today()] || 0) + 1;
    s.cards[id] = schedule(prev, q);
    s.log[today()] = (s.log[today()] || 0) + 1;
    saveSrs(s);
    sess.done++; if (q === 0) sess.again++;
    if (s.cards[id].due - Date.now() < 30 * 60000) sess.queue.push(id);
    sess.i++; sess.revealed = false; sess.bn = false; sess.check = null; sess.use = "";
    if (s.log[today()] === 20) autoTick(["vocab", "vocabRead"]);
    render();
    if (autoPlay && sess.i < sess.queue.length) { var nx = cardById(sess.queue[sess.i]); if (nx) say(nx.w); }
  }
  function startSession(ids) {
    if (!ids.length) { toast("No words to study."); return; }
    ui.cards.mode = "review"; ui.cards.session = { queue: ids.slice(), i: 0, done: 0, again: 0, revealed: false, bn: false, use: "", check: null };
    render(); window.scrollTo(0, 0);
    if (autoPlay) { var x = cardById(ids[0]); if (x) say(x.w); }
  }
  function defaultPool(min) {
    var s = srs(), deck = deckCards(ui.cards.deck), seen = deck.filter(function (c) { return s.cards[c.id]; });
    return seen.length >= min ? seen : (deck.length >= min ? deck : allCards());
  }
  function startSpell(pool) {
    pool = (pool || defaultPool(10)).filter(function (c) { return c.w.indexOf(" ") === -1 && /^[a-z-]+$/i.test(c.w); });
    if (pool.length < 3) pool = allCards().filter(function (c) { return c.w.indexOf(" ") === -1; });
    ui.cards.mode = "spell"; ui.cards.spell = { items: shuffle(pool).slice(0, 10).map(function (c) { return c.id; }), i: 0, input: "", result: null, score: 0, wrong: [] };
    render(); window.scrollTo(0, 0);
    var x = cardById(ui.cards.spell.items[0]); if (x) say(x.w);
    var inp = $("spellInput"); if (inp) inp.focus();
  }
  function startQuiz(pool) {
    var cards = allCards(); pool = shuffle(pool && pool.length ? pool : defaultPool(10)).slice(0, 10);
    ui.cards.mode = "quiz";
    ui.cards.quiz = {
      i: 0, score: 0, picked: null, items: pool.map(function (c) {
        var same = cards.filter(function (o) { return o.id !== c.id && o.topic === c.topic && posGroup(o.pos) === posGroup(c.pos); });
        if (same.length < 3) same = cards.filter(function (o) { return o.id !== c.id && o.topic === c.topic; });
        var others = shuffle(same.length >= 3 ? same : cards.filter(function (o) { return o.id !== c.id; })).slice(0, 3);
        return { id: c.id, opts: shuffle([c.id].concat(others.map(function (o) { return o.id; }))) };
      })
    };
    render(); window.scrollTo(0, 0);
  }
  function startMatch(pool) {
    pool = pool && pool.length >= 3 ? pool : defaultPool(6);
    var items = shuffle(pool).slice(0, 6).map(function (c) { return c.id; });
    ui.cards.mode = "match";
    ui.cards.match = { items: items, left: shuffle(items), right: shuffle(items), pick: null, done: [], wrong: null, mistakes: 0 };
    tSet("match", 0, "up"); tStart("match");
    render(); window.scrollTo(0, 0);
  }
  function startCloze(pool) {
    pool = shuffle(pool && pool.length ? pool : defaultPool(10));
    var items = [];
    for (var i = 0; i < pool.length && items.length < 10; i++) {
      var c = pool[i], sents = shuffle(c.exs);
      for (var j = 0; j < sents.length; j++) {
        var f = findInSentence(sents[j], c.w);
        if (f) { items.push({ id: c.id, s: sents[j], index: f.index, ans: f.text }); break; }
      }
    }
    if (!items.length) { toast("No sentences found for these words."); return; }
    ui.cards.mode = "cloze"; ui.cards.cloze = { items: items, i: 0, input: "", result: null, score: 0, wrong: [], hint: false };
    render(); window.scrollTo(0, 0);
    var inp = $("clozeInput"); if (inp) inp.focus();
  }
  function clozeCheck() {
    var cz = ui.cards.cloze; if (!cz || cz.result) return;
    var it = cz.items[cz.i], ok = norm(cz.input) === norm(it.ans);
    cz.result = ok ? "right" : "wrong";
    var s = srs();
    if (ok) cz.score++;
    else { cz.wrong.push(it.ans); if (s.cards[it.id]) { s.cards[it.id].due = Math.min(s.cards[it.id].due, Date.now()); saveSrs(s); } }
    render();
  }
  function spellCheck() {
    var sp = ui.cards.spell; if (!sp || sp.result) return;
    var x = cardById(sp.items[sp.i]);
    var ok = norm(sp.input) === norm(x.w);
    sp.result = ok ? "right" : "wrong";
    if (ok) sp.score++; else sp.wrong.push(x.w);
    render();
  }

  // ================= events =================
  view.addEventListener("click", function (e) {
    askPersist();
    var el = e.target.closest("[data-act]");
    if (!el || !view.contains(el) || el.disabled) return;
    var fn = ACT[el.getAttribute("data-act")];
    if (fn) { e.preventDefault(); fn(el, e); }
  });
  view.addEventListener("change", function (e) {
    var el = e.target, k = el.getAttribute("data-ch"); if (!k) return;
    var v = el.value;
    if (k === "tick") {
      var r = dayRec(ui.sel), id = el.getAttribute("data-id"), i = r.done.indexOf(id);
      if (el.checked && i === -1) r.done.push(id); if (!el.checked && i !== -1) r.done.splice(i, 1);
      writeDay(ui.sel, r); render();
    } else if (k === "deck") { ui.cards.deck = v; ui.cards.showAll = false; render(); }
    else if (k === "add_topic") ui.cards.add.topic = v;
    else if (k === "add_lvl") ui.cards.add.lvl = v;
    else if (k.indexOf("b_") === 0) { ui.cards.b[k.slice(2)] = v; ui.cards.showAll = false; render(); }
    else if (k === "rtype") { ui.practice.rtype = v; render(); }
    else if (k === "t1kind") { ui.write.t1kind = v; ui.write.p1 = 0; ui.write.custom = null; render(); }
    else if (k === "t2type") { ui.write.t2type = v; ui.write.pi = 0; ui.write.custom = null; render(); }
    else if (k === "lsec") { ui.practice.lsec = v; }
    else if (k === "ansm") { var cur = ui.practice.answers[el.getAttribute("data-q")]; cur = Array.isArray(cur) ? cur.slice() : []; var ix = cur.indexOf(v); if (el.checked && ix === -1) cur.push(v); if (!el.checked && ix !== -1) cur.splice(ix, 1); ui.practice.answers[el.getAttribute("data-q")] = cur; }
    else if (k === "ltype") { ui.practice.ltype = v; render(); }
    else if (k === "exam") ui.practice.exam = el.checked;
    else if (k === "ans") { ui.practice.answers[el.getAttribute("data-q")] = v; }
    else if (k === "mf_skill") ui.progress.mform.skill = v;
    else if (k === "mfilter") { ui.progress.mfilter = v; render(); }
    else if (k === "ai_provider") { ui.progress.ai = ui.progress.ai || {}; ui.progress.ai.provider = v; render(); }
    else if (k === "set_holiday") { setSettings({ holiday: +v }); render(); }
    else if (k === "set_exam") { if (/^\d{4}-\d{2}-\d{2}$/.test(v)) { setSettings({ exam: v }); render(); } }
    else if (k === "set_target") { setSettings({ target: +v }); render(); }
    else if (k === "set_stretch") { setSettings({ stretch: +v }); render(); }
    else if (k === "set_new") { setSettings({ newPerDay: +v }); render(); }
  });
  view.addEventListener("input", function (e) {
    var el = e.target, k = el.getAttribute("data-in"); if (!k) return;
    var v = el.value;
    if (k === "essay") { ui.write.text = v; saveDrafts(); var st = $("essayStats"); if (st) st.innerHTML = statsHtml(v, ui.write.task); }
    else if (k === "speakText") { ui.speak.text = v; saveDrafts(); var ss = $("speakStats"); if (ss) ss.innerHTML = speakStatsHtml(textStats(v), speakSecs()); }
    else if (k === "notes") ui.speak.notes = v;
    else if (k === "cardSearch") { ui.cards.search = v; var pos = el.selectionStart; render(); var ni = view.querySelector('[data-in="cardSearch"]'); if (ni) { ni.focus(); try { ni.setSelectionRange(pos, pos); } catch (x) {} } }
    else if (k.indexOf("add_") === 0) { var was = !!(ui.cards.add.w || ui.cards.add.def); ui.cards.add[k.slice(4)] = v; if (k === "add_w" && !was && v) { render(); var ai2 = view.querySelector('[data-in="add_w"]'); if (ai2) { ai2.focus(); ai2.setSelectionRange(v.length, v.length); } } }
    else if (k === "useIt") ui.cards.session.use = v;
    else if (k === "spell") ui.cards.spell.input = v;
    else if (k === "cloze") ui.cards.cloze.input = v;
    else if (k === "ptopic") ui.practice.topic = v;
    else if (k === "ans") ui.practice.answers[el.getAttribute("data-q")] = v;
    else if (k.indexOf("mf_") === 0) {
      var f = ui.progress.form, fk = k.slice(3); f[fk] = v;
      if (fk === "Lraw") { var lb = rawToBand(v, D.LISTENING_BANDS); if (lb !== null && v !== "") { f.L = lb; var li = view.querySelector('[data-in="mf_L"]'); if (li) li.value = lb; } }
      if (fk === "Rraw") { var rb = rawToBand(v, D.READING_BANDS); if (rb !== null && v !== "") { f.R = rb; var ri = view.querySelector('[data-in="mf_R"]'); if (ri) ri.value = rb; } }
      var ml = $("mockLive"); if (ml) ml.innerHTML = "Overall: <b>" + band(overallBand(f.L, f.R, f.W, f.S)) + "</b>. Raw scores convert to bands with commonly used Academic tables; real tests vary slightly.";
    }
    else if (k.indexOf("mm_") === 0) ui.progress.mform[k.slice(3)] = v;
    else if (k === "restoreText") ui.progress.restoreText = v;
    else if (k === "ai_key") { ui.progress.ai = ui.progress.ai || {}; ui.progress.ai.key = v; }
  });
  view.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.getAttribute("data-in") === "spell") { e.preventDefault(); spellCheck(); }
    if (e.key === "Enter" && e.target.getAttribute("data-in") === "cloze") { e.preventDefault(); if (ui.cards.cloze.result) ACT.clozeNext(); else clozeCheck(); }
    if (e.key === "Enter" && e.target.getAttribute("data-in") === "useIt") { e.preventDefault(); ACT.checkUse(); }
  });
  document.addEventListener("keydown", function (e) {
    if (ui.tab !== "cards" || ui.cards.mode !== "review") return;
    var tag = (document.activeElement && document.activeElement.tagName) || "";
    if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    var sess = ui.cards.session; if (!sess || sess.i >= sess.queue.length) return;
    if (e.key === " ") { e.preventDefault(); flipCard(); }
    else if (sess.revealed && /^[1-4]$/.test(e.key)) { e.preventDefault(); rateCard(+e.key - 1); }
  });
  // swipe to rate flashcards
  var drag = null;
  view.addEventListener("pointerdown", function (e) {
    var card = e.target.closest("#flipcard");
    if (!card || e.target.closest("button")) return;
    drag = { x: e.clientX, y: e.clientY, dx: 0, wrap: $("flipwrap"), moved: false };
    try { card.setPointerCapture(e.pointerId); } catch (x) {}
  });
  view.addEventListener("pointermove", function (e) {
    if (!drag) return;
    drag.dx = e.clientX - drag.x;
    if (Math.abs(drag.dx) > 8 || Math.abs(e.clientY - drag.y) > 8) drag.moved = true;
    var sess = ui.cards.session;
    if (!sess || !sess.revealed || !drag.wrap) return;
    drag.wrap.style.transition = "none";
    drag.wrap.style.transform = "translateX(" + drag.dx + "px) rotate(" + (drag.dx / 18) + "deg)";
    var ta = $("tagAgain"), tg = $("tagGood");
    if (ta) ta.style.opacity = Math.min(1, Math.max(0, -drag.dx / 90));
    if (tg) tg.style.opacity = Math.min(1, Math.max(0, drag.dx / 90));
  });
  function endDrag() {
    if (!drag) return;
    var d = drag; drag = null;
    var sess = ui.cards.session;
    if (!d.moved) { flipCard(); return; }
    if (!d.wrap) return;
    if (sess && sess.revealed && Math.abs(d.dx) > 90) {
      d.wrap.style.transition = "transform .18s ease-out";
      d.wrap.style.transform = "translateX(" + (d.dx > 0 ? 600 : -600) + "px) rotate(" + (d.dx > 0 ? 20 : -20) + "deg)";
      setTimeout(function () { rateCard(d.dx > 0 ? 2 : 0); }, 170);
    } else {
      d.wrap.style.transition = "transform .2s ease";
      d.wrap.style.transform = "";
      var ta = $("tagAgain"), tg = $("tagGood"); if (ta) ta.style.opacity = 0; if (tg) tg.style.opacity = 0;
    }
  }
  view.addEventListener("pointerup", endDrag);
  view.addEventListener("pointercancel", function () { if (drag && drag.wrap) { drag.wrap.style.transform = ""; } drag = null; });
  view.addEventListener("keydown", function (e) {
    if ((e.key === "Enter") && e.target.id === "flipcard") { e.preventDefault(); flipCard(); }
  });

  function route() {
    var h = (location.hash || "").replace("#", "");
    ui.tab = TABS.indexOf(h) !== -1 ? h : "today";
    ui.confirm = null;
    render();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  // keep "today" right past midnight
  var lastToday = today();
  setInterval(function () { var t = today(); if (t !== lastToday) { if (ui.sel === lastToday) ui.sel = t; lastToday = t; softRender(); } }, 60000);

  // ================= start =================
  function wireDict(d) {
    DICT = d; if (!d) return;
      d.onFinal(function (ev) {
        var sp = ui.speak, add = ev.text || "";
        if (!sp.text) add = add.replace(/^\s+/, "");
        sp.text += add; sp.partial = ""; saveDrafts();
        var ta = $("speakText"); if (ta) ta.value = sp.text;
        var pp = $("partial"); if (pp) pp.textContent = "";
        var ss = $("speakStats"); if (ss) ss.innerHTML = speakStatsHtml(textStats(sp.text), speakSecs());
      });
      d.onPartial(function (ev) { ui.speak.partial = ev.text || ""; var pp = $("partial"); if (pp) pp.textContent = ui.speak.partial; });
      d.onState(function (ev) {
        dictState = ev.state;
        if (ev.state === "idle" && (ev.reason === "not_granted" || ev.reason === "unavailable")) DICT = null;
        if (ui.tab === "speak") softRender();
      });
      softRender();
  }
  var installEvt = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); installEvt = e; if (ui.tab === "progress") softRender(); });
  if ("serviceWorker" in navigator && !window.claude && (location.protocol === "https:" || location.hostname === "localhost")) {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
  window.addEventListener("online", function () { softRender(); });
  window.addEventListener("offline", function () { softRender(); });
  loadLocal();
  route();

  (async function connect() {
    if (!window.claude || typeof window.claude.use !== "function") {
      var cfg = keyCfg(); AI = cfg ? makeKeyAI(cfg) : null;
      wireDict(makeWebSpeech());
      setSync("Saved on this device · works offline");
      softRender();
      return;
    }
    var use = function (n) { return window.claude.use(n).catch(function () { return null; }); };
    use("sample").then(function (s) { AI = s; if (s) softRender(); });
    use("tts").then(function (t) { TTS = t; if (t) softRender(); });
    use("dictation").then(function (d) { wireDict(d); });
    try {
      setSync("Connecting to your account…");
      var db = await use("db"), user = await use("user");
      var id = user ? await user.id() : null;
      if (!db || !id) { setSync("Saved on this device"); return; }
      var col = db.collection("data/users/" + id);
      var timer = setTimeout(function () { setSync("Can’t reach your account yet. Your work is saved on this device."); }, 10000);
      col.onSnapshot(function (snap) {
        var first = !S.cloud;
        S.cloud = col;
        snap.docChanges().forEach(function (ch) {
          var did = ch.doc.id;
          if (S.pending[did] || S.inflight[did]) return;
          if (ch.type === "removed") delete S.docs[did];
          else { var data = ch.doc.data(); if (data) S.docs[did] = JSON.parse(JSON.stringify(data)); }
        });
        saveLocal();
        if (!snap.metadata.fromCache) { clearTimeout(timer); setSync("Saved to your account · syncs across your devices"); }
        if (first) {
          // push anything that only exists on this device (e.g. made before signing in)
          var inCloud = {}; snap.docs.forEach(function (d) { inCloud[d.id] = true; });
          Object.keys(S.docs).filter(function (k) { return !inCloud[k]; }).slice(0, 200).forEach(function (k, n) { setTimeout(function () { put(k, S.docs[k]); }, 150 * n); });
        }
        softRender();
      }, function () { clearTimeout(timer); S.cloud = null; setSync("Saved on this device"); });
    } catch (e) { setSync("Saved on this device"); }
  })();
})();
