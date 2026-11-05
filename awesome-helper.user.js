// ==UserScript==
// @name         מתמחים טופ - קטגוריית תוספים
// @name:en      Mitmachim Top - Add-ons Category
// @namespace    https://mitmachim.top/
// @version      1.4.0
// @description  מוסיף לפורום מתמחים טופ קטגוריית תוספים (תוספי כרום + טמפרמונקי) עם חיפוש, מיון, הצמדה וסימון ידני
// @author       Mitmachim Top
// @match        https://mitmachim.top/*
// @icon         https://mitmachim.top/favicon.ico
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @noframes
// ==/UserScript==

(() => {
  'use strict';

  /* ===== הומר אוטומטית מתוסף כרום (Manifest V3) לסקריפט Tampermonkey ===== */
  /* הזרקת ה-CSS (היה content.css בתוסף) */
  const __mtpCss = "@keyframes mtp-wiggle {\n  0%, 70%, 100% { transform: rotate(0) scale(1); }\n  75% { transform: rotate(-14deg) scale(1.15); }\n  80% { transform: rotate(12deg) scale(1.15); }\n  85% { transform: rotate(-8deg) scale(1.1); }\n  90% { transform: rotate(5deg) scale(1.05); }\n}\n@keyframes mtp-glow {\n  0%, 100% { filter: drop-shadow(0 0 0 transparent); }\n  50% { filter: drop-shadow(0 0 4px #4fa3ff); }\n}\n.mtp-nav-icon { display: inline-block; animation: mtp-wiggle 3s ease-in-out infinite, mtp-glow 3s ease-in-out infinite; transform-origin: 50% 60%; }\n.mtp-nav-icon svg { width: 18px; height: 18px; vertical-align: middle; }\na:hover .mtp-nav-icon { animation-duration: .9s; }\n\n#mtp-page { direction: rtl; padding: 1rem 0; }\n#mtp-page .mtp-toolbar { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; margin-bottom: 1rem; }\n#mtp-page .mtp-toolbar .mtp-q { flex: 1 1 220px; min-width: 180px; }\n#mtp-page .mtp-toolbar .mtp-all { flex: none; width: 1em; height: 1em; }\n#mtp-page .mtp-toolbar select { width: auto; }\n#mtp-page .mtp-status { font-size: .85rem; opacity: .75; white-space: nowrap; }\n#mtp-page .mtp-progress { height: 3px; background: var(--bs-primary, #0d6efd); transition: width .2s; margin-bottom: .75rem; border-radius: 2px; }\n#mtp-page .mtp-sub { display: flex; gap: .75rem; align-items: center; padding: .75rem; border: 1px solid var(--bs-border-color, #dee2e6); border-radius: .5rem; margin-bottom: .5rem; cursor: pointer; text-decoration: none; color: inherit; }\n#mtp-page .mtp-sub:hover { background: var(--bs-light, #f8f9fa); }\n#mtp-page .mtp-sub.active { border-color: var(--bs-primary, #0d6efd); }\n#mtp-page .mtp-cat-icon { width: 44px; height: 44px; border-radius: .5rem; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }\n#mtp-page .mtp-row { display: flex; gap: .75rem; padding: .75rem .25rem; border-bottom: 1px solid var(--bs-border-color, #dee2e6); align-items: flex-start; }\n#mtp-page .mtp-avatar { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: .9rem; object-fit: cover; }\n#mtp-page .mtp-title { font-weight: 600; text-decoration: none; }\n#mtp-page .mtp-meta { font-size: .8rem; opacity: .7; display: flex; gap: .75rem; flex-wrap: wrap; }\n#mtp-page .mtp-stats { display: flex; gap: 1rem; font-size: .85rem; margin-inline-start: auto; text-align: center; flex-shrink: 0; }\n#mtp-page .mtp-stats b { display: block; }\n#mtp-page .mtp-badge { font-size: .7rem; padding: .1rem .4rem; border-radius: .3rem; background: #e7f1ff; color: #0b5ed7; }\n#mtp-page .mtp-badge.tm { background: #e8f7ee; color: #157347; }\n#mtp-page mark { padding: 0; background: #fff3a0; }\n#mtp-page .mtp-more { display: block; margin: 1rem auto; }\n#mtp-page .mtp-ov { opacity: 0; transition: opacity .15s; }\n#mtp-page .mtp-row:hover .mtp-ov { opacity: 1; }\n#mtp-page .mtp-ov a { text-decoration: none; }\n.mtp-nav-icon { display: inline-flex !important; align-items: center; justify-content: center; }\n.mtp-nav-icon svg { width: 1.05em; height: 1.05em; }\n.mtp-home-icon svg { width: 100%; height: 100%; }\n.mtp-home-icon { animation-duration: 4s, 4s; }\n\n#mtp-tip { position: fixed; z-index: 99999; background: #000; color: #fff; font-size: .8rem; padding: .25rem .5rem; border-radius: .375rem; pointer-events: none; opacity: 0; transition: opacity .15s; white-space: nowrap; }\n#mtp-tip.show { opacity: .92; }\n#mtp-tip::after { content: ''; position: absolute; top: 50%; margin-top: -5px; border: 5px solid transparent; }\n#mtp-tip[data-side=\"left\"]::after { right: -10px; border-left-color: #000; }\n#mtp-tip[data-side=\"right\"]::after { left: -10px; border-right-color: #000; }\n\n@keyframes mtp-pop { from { transform: scale(.7) translateY(30px); opacity: 0; } to { transform: none; opacity: 1; } }\n@keyframes mtp-float { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-12px) rotate(12deg); } }\n@keyframes mtp-shine { from { background-position: -200px 0; } to { background-position: 200px 0; } }\n#mtp-modal { position: fixed; inset: 0; z-index: 100000; background: rgba(15,30,50,.45); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .3s; }\n#mtp-modal.show { opacity: 1; }\n#mtp-modal.show .mtp-modal-box { animation: mtp-pop .45s cubic-bezier(.2,1.4,.4,1) both; }\n.mtp-modal-box { background: var(--bs-body-bg, #fff); color: var(--bs-body-color, #222); border-radius: 1rem; padding: 1.75rem 2rem; max-width: 440px; width: 92%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,.25); }\n.mtp-modal-box h3 { font-size: 1.25rem; font-weight: 700; margin: .75rem 0 .5rem; color: #1e5fa8; }\n.mtp-modal-box p { font-size: .92rem; opacity: .85; line-height: 1.6; }\n.mtp-modal-anim { display: flex; justify-content: center; gap: .6rem; height: 56px; align-items: flex-end; }\n.mtp-modal-anim span { width: 38px; height: 38px; animation: mtp-float 1.6s ease-in-out infinite; }\n.mtp-modal-anim svg { width: 100%; height: 100%; }\n.mtp-modal-anim .p1 { color: #1e88e5; } .mtp-modal-anim .p2 { color: #43a047; animation-delay: .25s; } .mtp-modal-anim .p3 { color: #fb8c00; animation-delay: .5s; }\n.mtp-modal-bar { height: 8px; background: #e9eef5; border-radius: 4px; overflow: hidden; margin: 1rem 0 .4rem; }\n.mtp-modal-bar div { height: 100%; width: 0; border-radius: 4px; transition: width .3s; background: linear-gradient(90deg, #1e88e5, #64b5f6, #1e88e5); background-size: 200px 100%; animation: mtp-shine 1.2s linear infinite; }\n.mtp-modal-st { font-size: .8rem; opacity: .75; margin-bottom: 1rem; }\n#mtp-modal.done .mtp-modal-bar div { background: #43a047; animation: none; }\n#mtp-modal.done .mtp-modal-anim span { animation-iteration-count: 2; }\n\n#mtp-page .mtp-pin { color: var(--bs-secondary-color, #999); opacity: 0; transition: opacity .15s, transform .15s, color .15s; flex-shrink: 0; line-height: 1; padding: 2px; }\n#mtp-page .mtp-pin svg { width: 14px; height: 14px; }\n#mtp-page .mtp-row:hover .mtp-pin { opacity: .7; }\n#mtp-page .mtp-pin:hover { opacity: 1 !important; transform: scale(1.2); color: #1e88e5; }\n#mtp-page .mtp-pin.on { opacity: 1; color: #1e88e5; transform: rotate(-35deg); }\n#mtp-page .mtp-pin.on:hover { color: #d32f2f; }\n#mtp-page .mtp-pinned { background: rgba(30,136,229,.06); border-radius: .375rem; }\n#mtp-page .mtp-new { font-size: .7rem; font-weight: 700; color: #fff; background: #e53935; padding: .05rem .4rem; border-radius: .3rem; flex-shrink: 0; }\n.mtp-nav-icon { position: relative; }\n.mtp-dot { position: absolute; top: -7px; left: -10px; min-width: 16px; height: 16px; padding: 0 3px; border-radius: 8px; background: #e53935; color: #fff; font-size: 10px; font-weight: 700; line-height: 16px; text-align: center; font-family: system-ui, sans-serif; }\n#mtp-nav.mtp-active .nav-link, #mtp-nav.mtp-active a { color: var(--bs-primary, #0d6efd) !important; }\n";
  (typeof GM_addStyle === 'function'
    ? GM_addStyle
    : (c => { const s = document.createElement('style'); s.textContent = c; (document.head || document.documentElement).appendChild(s); })
  )(__mtpCss);
  /* חיקוי chrome.storage.local מעל GM_getValue / GM_setValue (עם נפילה ל-localStorage) */
  const chrome = {
    storage: {
      local: {
        get(keys, cb) {
          const list = Array.isArray(keys) ? keys : typeof keys === 'string' ? [keys] : Object.keys(keys || {});
          const out = {};
          for (const k of list) {
            let val;
            try { val = typeof GM_getValue === 'function' ? GM_getValue(k, undefined) : JSON.parse(localStorage.getItem('mtp::' + k)); }
            catch (e) { val = undefined; }
            if (val !== undefined && val !== null) out[k] = val;
          }
          try { if (cb) cb(out); } catch (e) { console.warn('[תוספים]', e); }
        },
        set(obj, cb) {
          for (const k in obj) {
            try {
              if (typeof GM_setValue === 'function') GM_setValue(k, obj[k]);
              else localStorage.setItem('mtp::' + k, JSON.stringify(obj[k]));
            } catch (e) { console.warn('[תוספים] שמירת נתונים נכשלה', e); }
          }
          try { if (cb) cb(); } catch (e) {}
        }
      }
    }
  };

  const BASE = location.origin;
  const SOURCE_CID = 70;
  const CACHE_KEY = 'mtp_cache_v3';
  const FULL_AGE = 3 * 24 * 60 * 60 * 1000;  // סריקה מלאה של כל הפורום כל 3 ימים
  const QUICK_EVERY = 4 * 60 * 1000;     // בדיקת תוספים חדשים כל 4 דקות
  const PINS_KEY = 'mtp_pins', SEEN_KEY = 'mtp_seen';
  const CONCURRENCY = 10;
  const HASH = '#mtp-plugins';

  const RX_TM = /טמפר|טמפרמונקי|טמפרמנקי|tamper|monkey|userscript|user\.js|סקריפט|greasy|ויולנט|violent/i;
  const RX_EXT = /תוסף|תוספים|תוספון|extension|הרחבה|כרום|chrome|crx|אקסטנש|אדון|add-?on/i;
  // מחוץ ל'תוכנות להורדה' דורשים מילה חזקה בכותרת, כדי לא לאסוף כל שאלה על כרום
  const RX_STRONG_TM = /טמפרמונקי|טמפרמנקי|טמפר מונקי|tampermonkey|violentmonkey|greasemonkey|userscript|user[. ]js|סקריפט (ל|עבור|ש)?טמפר/i;
  const RX_STRONG_EXT = /תוסף|תוספים|תוספון|extension|הרחבה (ל|עבור )?(כרום|דפדפן|chrome)/i;
  // בקשות / שאלות – לא תוספים (אלא אם סומנו ידנית)
  const RX_REQ = /^\s*[\[(]?\s*(בקשה|בקשת|שאלה|עזרה|בעיה|בירור|דיון|הצעה|מחפש|מחפשת|מישהו)(?=[\s|:\])\-]|$)|\?\s*$/;
  let tree70 = new Set([SOURCE_CID]);
  let metaDone = {};        // נושאים מחוץ ל'תוכנות להורדה' שכבר נבדקו (מפת האתר)
  const userCache = {};

  const PUZZLE_SVG = '<svg viewBox="0 0 512 512" fill="currentColor"><path d="M192 104.8c0-9.2-5.8-17.3-13.2-22.8C167.2 73.3 160 61.3 160 48c0-26.5 28.7-48 64-48s64 21.5 64 48c0 13.3-7.2 25.3-18.8 34c-7.4 5.5-13.2 13.6-13.2 22.8c0 12.8 10.4 23.2 23.2 23.2H336c26.5 0 48 21.5 48 48v56.8c0 12.8 10.4 23.2 23.2 23.2c9.2 0 17.3-5.8 22.8-13.2c8.7-11.6 20.7-18.8 34-18.8c26.5 0 48 28.7 48 64s-21.5 64-48 64c-13.3 0-25.3-7.2-34-18.8c-5.5-7.4-13.6-13.2-22.8-13.2c-12.8 0-23.2 10.4-23.2 23.2V464c0 26.5-21.5 48-48 48H279.2c-12.8 0-23.2-10.4-23.2-23.2c0-9.2 5.8-17.3 13.2-22.8c11.6-8.7 18.8-20.7 18.8-34c0-26.5-28.7-48-64-48s-64 21.5-64 48c0 13.3 7.2 25.3 18.8 34c7.4 5.5 13.2 13.6 13.2 22.8c0 12.8-10.4 23.2-23.2 23.2H48c-26.5 0-48-21.5-48-48V343.2C0 330.4 10.4 320 23.2 320c9.2 0 17.3 5.8 22.8 13.2C54.7 344.8 66.7 352 80 352c26.5 0 48-28.7 48-64s-21.5-64-48-64c-13.3 0-25.3 7.2-34 18.8C40.5 250.2 32.4 256 23.2 256C10.4 256 0 245.6 0 232.8V176c0-26.5 21.5-48 48-48H168.8c12.8 0 23.2-10.4 23.2-23.2z"/></svg>';

  const PIN_SVG = '<svg viewBox="0 0 384 512" fill="currentColor"><path d="M32 32C32 14.3 46.3 0 64 0H320c17.7 0 32 14.3 32 32s-14.3 32-32 32H290.5l11.4 148.2c36.7 19.9 65.7 53.2 79.5 94.7l1 3c3.3 9.8 1.6 20.5-4.4 28.8s-15.7 13.3-26 13.3H32c-10.3 0-19.9-4.9-26-13.3s-7.7-19.1-4.4-28.8l1-3c13.8-41.5 42.8-74.8 79.5-94.7L93.5 64H64C46.3 64 32 49.7 32 32zM160 384h64v96c0 17.7-14.3 32-32 32s-32-14.3-32-32V384z"/></svg>';
  const PUZZLE_OUTLINE = PUZZLE_SVG.replace('fill="currentColor"', 'fill="none" stroke="currentColor" stroke-width="28" stroke-linejoin="round"').replace('viewBox="0 0 512 512"', 'viewBox="-20 -20 552 552"');
  let topics = new Map();   // tid -> topic (רק מזוהים / מסומנים)
  let pool2 = new Map();    // tid -> topic שלא זוהה (לסימון ידני)
  let checked = {};         // tid -> 'tm' | 'ext' | 0  (תוצאת בדיקת תוכן, נשמר לתמיד)
  let overrides = {};       // tid -> 'tm' | 'ext' | 'no'
  let loading = false, progress = 0, lastUpdate = 0, lastQuick = 0, phase = '';
  let pins = {};             // tid -> זמן הצמדה
  let seen = 0;             // מתי המשתמש צפה לאחרונה ברשימה (לסימון 'חדש')
  let openFlag = false, openPath = '';
  const state = { sub: null, q: '', sort: 'new', shown: 50, showAll: false };

  const RX_BODY_TM = /tampermonkey|violentmonkey|greasyfork|\.user\.js|==UserScript==|@match|טמפרמונקי|טמפר מונקי/i;
  const RX_BODY_EXT = /chromewebstore\.google\.com|chrome\.google\.com\/webstore|\.crx\b|chrome:\/\/extensions|מצב מפתחים|developer mode|טען (פריט|תוסף) לא ארוז|load unpacked|manifest\.json|microsoftedge\.microsoft\.com\/addons|addons\.mozilla\.org/i;

  /* ---------- נתונים ---------- */
  const getJSON = async (path, tries = 3) => {
    for (let i = 0; ; i++) {
      try {
        const r = await fetch(BASE + path, { credentials: 'include', headers: { accept: 'application/json' } });
        if (r.status === 429 && i < tries) { await new Promise(res => setTimeout(res, 800 * (i + 1))); continue; }
        if (!r.ok) throw new Error(r.status);
        return r.json();
      } catch (e) { if (i >= tries) throw e; await new Promise(res => setTimeout(res, 400 * (i + 1))); }
    }
  };

  async function pool(items, fn, conc = CONCURRENCY) {
    let i = 0, done = 0;
    await Promise.all(Array.from({ length: Math.min(conc, items.length) }, async () => {
      while (i < items.length) {
        const it = items[i++];
        try { await fn(it); } catch (e) {}
        done++; progress = done / items.length; updateProgress();
        if (done % 25 === 0) render(true);
        if (firstRun) updateModal(false);
      }
    }));
  }

  const classifyTitle = (t) => {
    if (RX_REQ.test(t.title)) return null;
    const hay = `${t.title} ${(t.tags || []).join(' ')}`;
    if (t.cid == null || tree70.has(+t.cid)) {
      if (RX_TM.test(hay)) return 'tm';
      if (RX_EXT.test(hay)) return 'ext';
      return null;
    }
    if (RX_STRONG_TM.test(hay)) return 'tm';
    if (RX_STRONG_EXT.test(hay)) return RX_TM.test(hay) ? 'tm' : 'ext';
    return null;
  };

  const norm = (t, fallbackUser) => {
    const u = t.user || fallbackUser || {};
    return {
      tid: t.tid, cid: t.cid != null ? +t.cid : undefined, title: decode(t.title || ''), slug: t.slug || String(t.tid), mainPid: t.mainPid,
      ts: +t.timestamp || 0, votes: +(t.votes ?? t.upvotes ?? 0), posts: +t.postcount || 0, views: +t.viewcount || 0,
      tags: (t.tags || []).map(x => decode(x.value || x)),
      user: { name: u.displayname || u.username || '', slug: u.userslug || '', pic: u.picture || '',
              txt: u['icon:text'] || (u.username || '?')[0], bg: u['icon:bgColor'] || '#607d8b' },
    };
  };

  const merge = (a, b) => a ? { ...a, ...Object.fromEntries(Object.entries(b).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && !v.length))) } : b;

  function place(t) {
    const o = overrides[t.tid];
    t.type = o === 'no' ? null : (o || classifyTitle(t) || (RX_REQ.test(t.title) ? null : checked[t.tid]) || null);
    if (t.type) { topics.set(t.tid, merge(topics.get(t.tid), t)); pool2.delete(t.tid); }
    else { topics.delete(t.tid); pool2.set(t.tid, merge(pool2.get(t.tid), t)); }
  }

  // fromTree = נושא מקטגוריית תוכנות להורדה (נשמר גם אם לא זוהה, לבדיקת תוכן)
  function add(raw, fallbackUser, fromTree) {
    if (!raw || !raw.tid || raw.deleted) return;
    const t = norm(raw, fallbackUser);
    if (!fromTree && !classifyTitle(t) && !overrides[t.tid] && !checked[t.tid]) return;
    place(t);
  }

  async function checkBody(t) {
    let content = '';
    try {
      if (t.mainPid) content = (await getJSON(`/api/v3/posts/${t.mainPid}/raw`, 1)).response?.content || '';
    } catch (e) {}
    if (!content) {
      const d = await getJSON(`/api/topic/${t.tid}`);
      content = d.posts?.[0]?.content || '';
      if (!t.mainPid) t.mainPid = d.mainPid;
    }
    checked[t.tid] = RX_BODY_TM.test(content) ? 'tm' : RX_BODY_EXT.test(content) ? 'ext' : 0;
    place(pool2.get(t.tid) || t);
  }

  // כל הקטגוריות בפורום (כולל תתי קטגוריות), ומי מהן שייכת ל'תוכנות להורדה'
  async function allCategories() {
    const d = await getJSON('/api/categories');
    const out = [];
    const walk = (arr, in70) => (arr || []).forEach(c => {
      const mine = in70 || +c.cid === SOURCE_CID;
      if (mine) tree70.add(+c.cid);
      if (!c.link) out.push(+c.cid);
      walk(c.children, mine);
    });
    walk(d.categories, false);
    if (!out.includes(SOURCE_CID)) out.push(SOURCE_CID);
    return out;
  }

  const saveCache = () => chrome.storage.local.set({ [CACHE_KEY]: {
    at: lastUpdate, quick: lastQuick, list: [...topics.values()], pool: [...pool2.values()], checked, overrides, metaDone } });

  // מפת האתר – כל הנושאים בפורום (כ-90 אלף) בכ-200 בקשות קלות, כולל הכותרת בכתובת
  async function sitemapTopics() {
    const idx = await (await fetch(BASE + '/sitemap.xml', { credentials: 'include' })).text();
    const maps = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(/^https?:\/\/[^/]+/, '')).filter(l => /topics\.\d+\.xml/.test(l));
    const out = [];
    await pool(maps, async u => {
      const x = await (await fetch(BASE + u, { credentials: 'include' })).text();
      for (const m of x.matchAll(/<loc>[^<]*\/topic\/(\d+)\/([^<]*)<\/loc>/g)) {
        let slug = m[2]; try { slug = decodeURIComponent(slug); } catch (e) {}
        out.push([+m[1], slug.replace(/[-_]+/g, ' ')]);
      }
    }, 6);
    return out;
  }

  async function userOf(uid) {
    if (!uid) return {};
    if (!userCache[uid]) userCache[uid] = getJSON(`/api/v3/users/${uid}`, 1).then(d => d.response || {}).catch(() => ({}));
    return userCache[uid];
  }

  async function scan(quick) {
    const eatTopics = (d, cid) => (d.topics || []).forEach(t => { const c = t.cid ?? cid; add({ ...t, cid: c }, null, tree70.has(+c)); });
    const cids = await allCategories();
    if (quick) {
      // תוספים חדשים: הנושאים האחרונים בכל הפורום (כולל כל הקטגוריות)
      phase = 'בודק תוספים חדשים';
      await pool([1, 2, 3, 4, 5], async p => eatTopics(await getJSON(`/api/recent?page=${p}`)), 5);
    } else {
      // 1. כל העמודים של 'תוכנות להורדה' ותתי הקטגוריות שלה
      phase = 'סורק את תוכנות להורדה';
      const c70 = cids.filter(c => tree70.has(c)), pages = {};
      await pool(c70, async cid => { const d = await getJSON(`/api/category/${cid}?page=1`); eatTopics(d, cid); pages[cid] = d.pagination?.pageCount || 1; });
      const jobs = [];
      for (const cid of c70) for (let p = 2; p <= pages[cid]; p++) jobs.push({ cid, p });
      await pool(jobs, async j => eatTopics(await getJSON(`/api/category/${j.cid}?page=${j.p}`), j.cid));
      // 2. כל שאר הפורום דרך מפת האתר
      phase = 'סורק את כל הפורום';
      progress = 0; render(true);
      const all = await sitemapTopics();
      const cand = all.filter(([tid, slug]) => !topics.has(tid) && !pool2.has(tid) && !metaDone[tid] && !overrides[tid]
        && !RX_REQ.test(slug) && (RX_STRONG_TM.test(slug) || RX_STRONG_EXT.test(slug)));
      if (cand.length) {
        phase = `בודק ${cand.length} נושאים מכל הפורום`;
        await pool(cand, async ([tid]) => {
          const d = (await getJSON(`/api/v3/topics/${tid}`, 1)).response;
          metaDone[tid] = 1;
          if (!d || d.deleted || d.scheduled) return;
          add({ ...d, user: await userOf(d.uid) }, null, tree70.has(+d.cid));
        }, 8);
      }
    }
    // 3. בדיקת תוכן ההודעה הראשונה – רק לנושאים מ'תוכנות להורדה' שעוד לא נבדקו (פעם אחת לכל נושא)
    const todo = [...pool2.values()].filter(t => !(t.tid in checked) && !overrides[t.tid] && tree70.has(+t.cid) && !RX_REQ.test(t.title));
    if (todo.length) {
      phase = `בודק תוכן ${todo.length} נושאים`; progress = 0; render(true);
      let n = 0;
      await pool(todo, async t => { await checkBody(t); if (++n % 100 === 0) saveCache(); }, 12);
    }
  }

  async function refresh(force) {
    if (loading) return;
    const now = Date.now();
    const full = force || !lastUpdate || now - lastUpdate > FULL_AGE;
    if (!full && now - lastQuick < QUICK_EVERY) return;
    loading = true; progress = 0; phase = full ? 'סורק קטגוריות' : 'בודק תוספים חדשים';
    if (full) render();
    try {
      await scan(!full);
      if (full) lastUpdate = Date.now();
      lastQuick = Date.now();
      saveCache();
    } catch (e) { console.warn('[תוספים]', e); }
    loading = false; phase = ''; render(); updateNavDot();
    if (firstRun) { updateModal(true); firstRun = false; }
  }

  function togglePin(tid) {
    if (pins[tid]) delete pins[tid]; else pins[tid] = Date.now();
    chrome.storage.local.set({ [PINS_KEY]: pins });
    render();
  }

  function setOverride(tid, v) {
    if (v) overrides[tid] = v; else delete overrides[tid];
    const t = topics.get(tid) || pool2.get(tid);
    if (t) place(t);
    saveCache(); render();
  }

  /* ---------- עזר ---------- */
  function decode(s) { const el = document.createElement('textarea'); el.innerHTML = s; return el.value; }
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hl = (s, q) => { const e = esc(s); if (!q) return e; const words = q.split(/\s+/).filter(Boolean).map(w => esc(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); return words.length ? e.replace(new RegExp(`(${words.join('|')})`, 'gi'), '<mark>$1</mark>') : e; };
  const ago = ts => { if (!ts) return ''; const d = (Date.now() - ts) / 1000; if (d < 3600) return `לפני ${Math.max(1, d / 60 | 0)} דק'`; if (d < 86400) return `לפני ${d / 3600 | 0} שע'`; if (d < 2592000) return `לפני ${d / 86400 | 0} ימים`; return new Date(ts).toLocaleDateString('he-IL'); };
  const isOpen = () => openFlag;

  /* ---------- סרגל צד ---------- */
  function injectNav() {
    if (document.getElementById('mtp-nav')) return;
    const nav = document.querySelector('#main-nav, [component="sidebar/left"] ul.nav, .sidebar-left ul.nav, nav.sidebar ul');
    if (!nav) return;
    const items = [...nav.querySelectorAll(':scope > li')];
    // תבנית: כפתור רגיל בלי מונה (למשל "אחרונים"), כדי שייראה זהה
    const tpl = items.find(li => li.querySelector('a i') && !li.querySelector('[component*="count"], .badge')) || items[0];
    if (!tpl) return;
    const tplIcon = tpl.querySelector('a i, a .fa, a svg');
    const r = tplIcon?.getBoundingClientRect(), cs = tplIcon && getComputedStyle(tplIcon);
    const li = tpl.cloneNode(true);
    li.id = 'mtp-nav'; li.classList.remove('active');
    ['title', 'data-bs-original-title', 'data-original-title', 'data-bs-toggle', 'aria-describedby'].forEach(at => li.removeAttribute(at));
    li.querySelectorAll('.active').forEach(x => x.classList.remove('active'));
    const a = li.querySelector('a');
    a.href = '/' + HASH; a.removeAttribute('id');
    a.removeAttribute('title'); a.removeAttribute('data-bs-original-title'); a.removeAttribute('data-bs-toggle');
    a.removeAttribute('data-original-title'); a.removeAttribute('aria-describedby');
    a.setAttribute('aria-label', 'תוספים');
    const icon = a.querySelector('i, .fa, svg');
    const span = document.createElement('span');
    span.className = 'mtp-nav-icon';
    span.innerHTML = PUZZLE_SVG;
    if (cs) {
      span.style.fontSize = cs.fontSize; span.style.width = (r.width || 20) + 'px';
      span.style.height = (r.height || 16) + 'px';
    }
    if (icon) icon.replaceWith(span); else a.prepend(span);
    // רק טקסט הניווט הרשמי (מוסתר כשהסרגל סגור, כמו בשאר הכפתורים)
    a.querySelectorAll('.nav-text').forEach(x => x.textContent = 'תוספים');
    a.querySelectorAll('.badge, [component*="count"], [component*="unread"]').forEach(x => x.remove());
    a.addEventListener('mouseenter', () => showTip(a, 'תוספים'));
    a.addEventListener('mouseleave', hideTip);
    nav.appendChild(li);
    updateNavDot();
  }

  let tip;
  function showTip(el, text) {
    if (!tip) { tip = document.createElement('div'); tip.id = 'mtp-tip'; document.body.appendChild(tip); }
    tip.textContent = text; tip.classList.add('show');
    const r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    const rightSide = r.left > innerWidth / 2;
    tip.style.top = (r.top + r.height / 2 - h / 2) + 'px';
    tip.style.left = (rightSide ? r.left - w - 8 : r.right + 8) + 'px';
    tip.dataset.side = rightSide ? 'left' : 'right';
  }
  function hideTip() { tip?.classList.remove('show'); }

  /* ---------- קטגוריה בדף הבית ---------- */
  const fmt = n => n >= 1000 ? (n / 1000).toFixed(n < 10000 ? 1 : 0).replace(/\.0$/, '') + 'k' : String(n);
  let homeSig = '';

  function injectHome() {
    const items = [...document.querySelectorAll('[component="categories/category"]')].filter(x => x.id !== 'mtp-home-cat');
    if (!items.length) return;
    let li = document.getElementById('mtp-home-cat');
    if (!li) {
      const tpl = items.find(x => x.querySelector('[component="category/children"], .category-children') && x.querySelector('[component="topic/teaser"], .teaser')) || items[items.length - 1];
      li = tpl.cloneNode(true);
      li.id = 'mtp-home-cat';
      [...li.classList].filter(c => /^category-\d+$|^unread$/.test(c)).forEach(c => li.classList.remove(c));
      li.querySelectorAll('meta').forEach(m => m.remove());
      li.removeAttribute('data-cid');
      li.querySelectorAll('[data-cid]').forEach(x => x.removeAttribute('data-cid'));
      // כותרת
      const title = li.querySelector('[component="category/title"], h2, .title');
      const tA = title?.querySelector('a') || title;
      if (tA) { tA.textContent = 'תוספים'; if (tA.tagName === 'A') tA.dataset.mtpGo = ''; }
      const desc = li.querySelector('[component="category/description"], .description');
      if (desc) desc.textContent = 'כל התוספים לכרום ותוספי הסקריפט (טמפרמונקי) שפורסמו בפורום';
      // אייקון
      const ic = li.querySelector('[component="category/icon"], .icon, [class*="category-icon"]');
      if (ic) {
        const box = ic.getBoundingClientRect ? tpl.querySelector('[component="category/icon"], .icon, [class*="category-icon"]')?.getBoundingClientRect() : null;
        ic.style.backgroundImage = 'none'; ic.style.backgroundColor = 'transparent'; ic.style.color = '#4a90d9';
        ic.style.display = 'flex'; ic.style.alignItems = 'center'; ic.style.justifyContent = 'center';
        const sz = Math.round((box?.height || 40) * 0.8);
        ic.innerHTML = `<span class="mtp-nav-icon mtp-home-icon" style="width:${sz}px;height:${sz}px">${PUZZLE_OUTLINE}</span>`;
      }
      // תתי קטגוריות
      const kids = li.querySelector('[component="category/children"], .category-children');
      if (kids) {
        const kTpl = kids.querySelector('li, [component="category/child"]') || kids.firstElementChild;
        kids.innerHTML = '';
        [['ext', 'תוספי כרום'], ['tm', 'טמפרמונקי - תוספי סקריפט']].forEach(([k, name]) => {
          const c = kTpl.cloneNode(true);
          const ca = c.querySelector('a') || c;
          ca.querySelectorAll('*').forEach(x => { if (!x.children.length && x.textContent.trim()) x.textContent = ''; });
          const txtEl = [...ca.querySelectorAll('span, a')].reverse().find(x => !x.querySelector('i,svg') && !x.matches('i')) || ca;
          txtEl.textContent = name; if (ca.tagName === 'A') ca.dataset.mtpGo = k;
          kids.appendChild(c);
        });
      }
      // כל קישור אחר בכרטיס → לקטגוריה
      li.querySelectorAll('a').forEach(x => { if (!('mtpGo' in x.dataset) && !x.closest('[component="topic/teaser"], .teaser')) x.dataset.mtpGo = ''; });
      li.querySelectorAll('a[data-mtp-go]').forEach(x => { x.href = '/' + HASH + (x.dataset.mtpGo ? '/' + x.dataset.mtpGo : ''); x.removeAttribute('target'); });
      const anchor = items.find(x => x.querySelector(`a[href*="/category/${SOURCE_CID}/"]`)) || items[items.length - 1];
      anchor.after(li);
      homeSig = '';
    }
    updateHome(li);
  }

  function updateHome(li = document.getElementById('mtp-home-cat')) {
    if (!li) return;
    const all = [...topics.values()];
    const newest = all.reduce((m, t) => !m || t.ts > m.ts ? t : m, null);
    const posts = all.reduce((s, t) => s + (t.posts || 1), 0);
    const sig = `${all.length}|${posts}|${newest?.tid}|${Math.floor(Date.now() / 60000)}`;
    if (sig === homeSig) return; homeSig = sig;
    // מונים: מאתרים את התוויות "נושאים"/"פוסטים"
    li.querySelectorAll('*').forEach(el => {
      if (el.children.length) return;
      const lbl = el.textContent.trim();
      if (lbl !== 'נושאים' && lbl !== 'פוסטים') return;
      const box = el.parentElement;
      const num = [...box.querySelectorAll('*')].find(x => !x.children.length && x !== el && /[\d.,k]/i.test(x.textContent));
      const v = lbl === 'נושאים' ? all.length : posts;
      if (num) { num.textContent = fmt(v); num.title = v; }
    });
    // מונים במובייל (תגיות בלי תווית)
    const mob = li.querySelectorAll('.stats .fw-normal');
    if (mob[0]) { mob[0].textContent = fmt(all.length); mob[0].parentElement.title = all.length; }
    if (mob[1]) { mob[1].textContent = fmt(posts); mob[1].parentElement.title = posts; }
    const teaser = li.querySelector('[component="topic/teaser"], .teaser');
    if (teaser && newest) {
      const u = newest.user;
      const av = u.pic ? `<img src="${esc(u.pic)}" class="avatar avatar-rounded" style="width:18px;height:18px;border-radius:50%" alt="">`
        : `<span class="avatar avatar-rounded" style="width:18px;height:18px;border-radius:50%;background:${esc(u.bg)};color:#fff;font-size:10px;display:inline-flex;align-items:center;justify-content:center">${esc(u.txt)}</span>`;
      teaser.innerHTML = `<div class="d-flex flex-column gap-1">
        <div class="d-flex gap-1 align-items-center small text-secondary">${av}<a class="text-reset" href="/topic/${esc(newest.slug)}">${ago(newest.ts)}</a></div>
        <div class="small text-truncate" style="max-width:260px"><a class="text-reset" href="/topic/${esc(newest.slug)}">${esc(newest.title)}</a></div></div>`;
    }
  }

  /* ---------- חלון סריקה ראשונה ---------- */
  let firstRun = false;
  function showModal() {
    if (document.getElementById('mtp-modal')) return;
    const m = document.createElement('div'); m.id = 'mtp-modal';
    m.innerHTML = `<div class="mtp-modal-box" dir="rtl">
      <div class="mtp-modal-anim"><span class="p1">${PUZZLE_SVG}</span><span class="p2">${PUZZLE_SVG}</span><span class="p3">${PUZZLE_SVG}</span></div>
      <h3>ברוכים הבאים לקטגוריית התוספים!</h3>
      <p>בהתקנה הראשונה מופעלת סריקה של כל הפורום כדי לאתר את כל התוספים לכרום ותוספי הטמפרמונקי שפורסמו בו.<br>הסריקה עשויה להימשך זמן מועט – אפשר להמשיך לגלוש כרגיל בינתיים.</p>
      <div class="mtp-modal-bar"><div></div></div>
      <div class="mtp-modal-st">מתחיל סריקה...</div>
      <button class="btn btn-primary btn-sm mtp-modal-close">המשך גלישה</button></div>`;
    document.body.appendChild(m);
    requestAnimationFrame(() => m.classList.add('show'));
    m.querySelector('.mtp-modal-close').onclick = closeModal;
    m.addEventListener('click', e => { if (e.target === m) closeModal(); });
  }
  function closeModal() { const m = document.getElementById('mtp-modal'); if (!m) return; m.classList.remove('show'); setTimeout(() => m.remove(), 300); }
  function updateModal(done) {
    const m = document.getElementById('mtp-modal'); if (!m) return;
    const w = phase.startsWith('סורק את תוכנות') ? [0, .3] : phase.startsWith('סורק את כל') ? [.3, .5] : phase.startsWith('בודק תוכן') ? [.8, 1] : phase.startsWith('בודק') ? [.5, .8] : [0, .05];
    const pct = done ? 100 : Math.round((w[0] + (w[1] - w[0]) * progress) * 100);
    m.querySelector('.mtp-modal-bar div').style.width = pct + '%';
    m.querySelector('.mtp-modal-st').textContent = done
      ? `הסריקה הושלמה! נמצאו ${topics.size} תוספים 🎉`
      : `${phase || 'סורק'}... ${pct}% · נמצאו עד כה ${topics.size} תוספים`;
    if (done) { m.classList.add('done'); m.querySelector('.mtp-modal-close').textContent = 'לצפייה בתוספים'; m.querySelector('.mtp-modal-close').onclick = () => { closeModal(); open(null); }; }
  }

  /* ---------- דף הקטגוריה ---------- */
  function open(sub) {
    state.sub = sub === undefined ? state.sub : sub;
    const url = location.pathname + location.search + HASH + (state.sub ? '/' + state.sub : '');
    if (!openFlag) history.pushState({ mtp: true }, '', url); else history.replaceState({ mtp: true }, '', url);
    openFlag = true; openPath = location.pathname;
    seenOnClose = Date.now();
    hideTip();
    document.getElementById('mtp-nav')?.classList.add('mtp-active');
    render(); window.scrollTo(0, 0); refresh();
  }
  let seenOnClose = 0;

  function container() {
    const c = document.querySelector('#content, main#panel, [component="content"]') || document.body;
    let p = document.getElementById('mtp-page');
    if (!p) {
      [...c.children].forEach(ch => { ch.dataset.mtpHidden = '1'; ch.style.display = 'none'; });
      p = document.createElement('div'); p.id = 'mtp-page'; c.prepend(p);
      p.innerHTML = skeleton();
      bind(p);
    }
    return p;
  }

  function close() {
    if (openFlag && seenOnClose) { seen = seenOnClose; chrome.storage.local.set({ [SEEN_KEY]: seen }); updateNavDot(); }
    openFlag = false;
    document.getElementById('mtp-nav')?.classList.remove('mtp-active');
    document.getElementById('mtp-page')?.remove();
    document.querySelectorAll('[data-mtp-hidden]').forEach(el => { el.style.display = ''; delete el.dataset.mtpHidden; });
  }

  function skeleton() {
    return `
      <nav aria-label="breadcrumb"><ol class="breadcrumb mb-2">
        <li class="breadcrumb-item"><a href="/">בית</a></li>
        <li class="breadcrumb-item"><a href="#" data-sub="">תוספים</a></li>
        <li class="breadcrumb-item active mtp-crumb" style="display:none"></li></ol></nav>
      <div class="d-flex align-items-center gap-2 mb-3">
        <div class="mtp-cat-icon" style="background:#1e88e5"><span class="mtp-nav-icon">${PUZZLE_SVG}</span></div>
        <div><h1 class="fs-3 mb-0 mtp-h">תוספים</h1>
        <div class="text-secondary small mtp-desc">כל התוספים לכרום ותוספי הסקריפט (טמפרמונקי) שפורסמו בפורום</div></div>
      </div>
      <div class="mtp-subs"></div>
      <div class="mtp-toolbar">
        <input type="search" class="form-control form-control-sm mtp-q" placeholder="חיפוש לפי מילים או שם מפרסם...">
        <select class="form-select form-select-sm mtp-sort">
          <option value="new">מהחדש לישן</option>
          <option value="old">מהישן לחדש</option>
          <option value="votes">המוניטין הגבוה ביותר</option>
        </select>
        <label class="small d-flex align-items-center gap-1 text-nowrap mb-0" title="הצג גם נושאים מ'תוכנות להורדה' שלא זוהו כתוסף, כדי לסמן ידנית"><input type="checkbox" class="form-check-input m-0 mtp-all"> לא מזוהים</label>
        <button class="btn btn-sm btn-outline-secondary mtp-refresh" title="רענון">⟳</button>
        <span class="mtp-status"></span>
      </div>
      <div class="mtp-progress" style="width:0"></div>
      <ul class="list-unstyled mtp-list mb-0"></ul>
      <button class="btn btn-outline-primary btn-sm mtp-more" style="display:none">הצג עוד</button>`;
  }

  function bind(p) {
    let t;
    p.querySelector('.mtp-q').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value.trim(); state.shown = 50; render(); }, 120); });
    p.querySelector('.mtp-sort').addEventListener('change', e => { state.sort = e.target.value; state.shown = 50; render(); });
    p.querySelector('.mtp-all').addEventListener('change', e => { state.showAll = e.target.checked; state.shown = 50; render(); });
    p.addEventListener('click', e => {
      const pn = e.target.closest('[data-pin]');
      if (pn) { e.preventDefault(); e.stopPropagation(); togglePin(+pn.dataset.pin); return; }
      const b = e.target.closest('[data-ov]'); if (!b) return;
      e.preventDefault(); e.stopPropagation(); const [tid, v] = b.dataset.ov.split(':'); setOverride(+tid, v === 'reset' ? null : v);
    });
    p.querySelector('.mtp-refresh').addEventListener('click', () => refresh(true));
    p.querySelector('.mtp-more').addEventListener('click', () => { state.shown += 100; render(); });
    p.addEventListener('click', e => {
      const s = e.target.closest('[data-sub]'); if (!s) return;
      e.preventDefault(); e.stopPropagation(); state.shown = 50; state.showAll = false; const all = p.querySelector('.mtp-all'); if (all) all.checked = false; open(s.dataset.sub && s.dataset.sub !== state.sub ? s.dataset.sub : null); window.scrollTo(0, 0);
    });
  }

  function updateProgress() {
    const bar = document.querySelector('#mtp-page .mtp-progress');
    if (bar) { bar.style.width = loading ? (progress * 100).toFixed(1) + '%' : '0'; }
    if (firstRun) updateModal(false);
  }

  function render(light) {
    injectHome();
    if (!isOpen()) return;
    const p = container();
    const all = [...topics.values()];
    const counts = { ext: all.filter(t => t.type === 'ext').length, tm: all.filter(t => t.type === 'tm').length };
    const titles = { null: 'תוספים', ext: 'תוספי כרום', tm: 'טמפרמונקי - תוספי סקריפט' };
    p.querySelector('.mtp-h').textContent = titles[state.sub];
    const crumb = p.querySelector('.mtp-crumb'); crumb.style.display = state.sub ? '' : 'none'; crumb.textContent = titles[state.sub] || '';

    const subCard = (key, name, desc, color, n) => `
      <a href="#" class="mtp-sub ${state.sub === key ? 'active' : ''}" data-sub="${key}">
        <div class="mtp-cat-icon" style="background:${color}">${PUZZLE_SVG.replace('<svg', '<svg width="20" height="20"')}</div>
        <div class="flex-grow-1"><div class="fw-semibold">${name}</div><div class="small text-secondary">${desc}</div></div>
        <div class="text-center small"><b>${n}</b><div class="text-secondary">נושאים</div></div></a>`;
    p.querySelector('.mtp-subs').innerHTML =
      subCard('ext', 'תוספי כרום', 'הרחבות לדפדפן כרום ודומיו', '#1e88e5', counts.ext) +
      subCard('tm', 'טמפרמונקי - תוספי סקריפט', 'סקריפטים ל-Tampermonkey / Violentmonkey', '#2e7d32', counts.tm);

    let list = state.showAll ? [...pool2.values()] : state.sub ? all.filter(t => t.type === state.sub) : all;
    if (state.q) {
      const words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      list = list.filter(t => { const h = `${t.title} ${t.user.name} ${t.tags.join(' ')}`.toLowerCase(); return words.every(w => h.includes(w)); });
    }
    const S = { new: (a, b) => b.ts - a.ts, old: (a, b) => a.ts - b.ts, votes: (a, b) => b.votes - a.votes || b.ts - a.ts };
    list.sort((a, b) => (pins[b.tid] ? 1 : 0) - (pins[a.tid] ? 1 : 0) || (pins[a.tid] && pins[b.tid] ? pins[b.tid] - pins[a.tid] : 0) || S[state.sort](a, b));

    const pc = Object.keys(pins).length;
    p.querySelector('.mtp-status').textContent = loading
      ? `${phase}... ${(progress*100|0)}% · נמצאו ${all.length} תוספים`
      : `${list.length} תוספים${pc ? ` · ${pc} מוצמדים` : ''}${lastQuick ? ' · עודכן ' + ago(lastQuick) : ''}`;
    updateProgress();

    if (light && document.activeElement === p.querySelector('.mtp-q')) return;
    const q = state.q;
    p.querySelector('.mtp-list').innerHTML = list.slice(0, state.shown).map(t => `
      <li class="mtp-row${pins[t.tid] ? ' mtp-pinned' : ''}" component="category/topic">
        ${t.user.pic ? `<img class="mtp-avatar" src="${esc(t.user.pic)}" alt="">` : `<span class="mtp-avatar" style="background:${esc(t.user.bg)}">${esc(t.user.txt)}</span>`}
        <div class="flex-grow-1" style="min-width:0">
          <div class="d-flex align-items-start gap-2">
            <a class="mtp-title text-reset flex-grow-1" href="/topic/${esc(t.slug)}">${hl(t.title, q)}</a>
            ${seen && t.ts > seen ? '<span class="mtp-new">חדש</span>' : ''}
            <a href="#" class="mtp-pin${pins[t.tid] ? ' on' : ''}" data-pin="${t.tid}" title="${pins[t.tid] ? 'הסר הצמדה' : 'הצמד לראש הרשימה'}">${PIN_SVG}</a>
          </div>
          <div class="mtp-meta mt-1">
            ${t.type ? `<span class="mtp-badge ${t.type}">${t.type === 'tm' ? 'טמפרמונקי' : 'כרום'}</span>` : ''}
            <span class="mtp-ov">${t.type
              ? `<a href="#" data-ov="${t.tid}:${t.type === 'tm' ? 'ext' : 'tm'}" title="העבר לקטגוריה השנייה">⇄</a> <a href="#" data-ov="${t.tid}:no" title="לא תוסף – הסתר">✕</a>`
              : `<a href="#" data-ov="${t.tid}:ext">+ תוסף כרום</a> · <a href="#" data-ov="${t.tid}:tm">+ טמפרמונקי</a>`}</span>
            ${t.user.slug ? `<a class="text-reset" href="/user/${esc(t.user.slug)}">${hl(t.user.name, q)}</a>` : esc(t.user.name)}
            ${t.ts ? `<span title="${new Date(t.ts).toLocaleString('he-IL')}">${ago(t.ts)}</span>` : ''}
            ${t.tags.slice(0, 4).map(g => `<span>#${esc(g)}</span>`).join('')}
          </div>
        </div>
        <div class="mtp-stats d-none d-md-flex">
          <div><b>${t.votes}</b>מוניטין</div><div><b>${t.posts}</b>פוסטים</div><div><b>${t.views}</b>צפיות</div>
        </div>
      </li>`).join('') || `<li class="p-3 text-secondary">${loading ? 'טוען תוספים...' : 'לא נמצאו תוספים'}</li>`;
    p.querySelector('.mtp-more').style.display = list.length > state.shown ? '' : 'none';
  }

  /* ---------- ניווט ---------- */
  const subFromHash = () => { const m = location.hash.match(/^#mtp-plugins(?:\/(ext|tm))?$/); return m ? (m[1] || null) : undefined; };
  window.addEventListener('popstate', () => {
    const sub = subFromHash();
    if (sub !== undefined) { state.sub = sub; openFlag = true; openPath = location.pathname; render(); }
    else if (openFlag) close();
  });
  // לכידת לחיצות לפני ש-NodeBB (ajaxify) מטפל בהן – בשלב ה-capture של window
  window.addEventListener('click', e => {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const a = e.target.closest?.('a[data-mtp-go], #mtp-nav a');
    if (!a) return;
    e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation();
    const go = a.dataset.mtpGo;
    open(go === 'ext' || go === 'tm' ? go : null);
  }, true);
  // NodeBB מחליף תוכן ב-ajaxify – מוודאים שהכפתור והקטגוריה קיימים, וסוגרים/משחזרים את הדף לפי הכתובת
  let raf = 0;
  new MutationObserver(() => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0; injectNav(); injectHome();
      if (openFlag && subFromHash() === undefined) close();            // המשתמש עבר לדף אחר (הכתובת השתנתה)
      else if (openFlag && !document.getElementById('mtp-page')) render(); // NodeBB החליף את התוכן – משחזרים
    });
  }).observe(document.body, { childList: true, subtree: true });
  // רענון אוטומטי של תוספים חדשים כל עוד האתר פתוח
  setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, QUICK_EVERY);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh(); });

  function updateNavDot() {
    const nav = document.getElementById('mtp-nav'); if (!nav) return;
    const n = [...topics.values()].filter(t => t.ts > seen).length;
    let dot = nav.querySelector('.mtp-dot');
    if (seen && n > 0) {
      if (!dot) { dot = document.createElement('span'); dot.className = 'mtp-dot'; nav.querySelector('.mtp-nav-icon')?.appendChild(dot); }
      dot.textContent = n > 99 ? '99+' : n;
    } else dot?.remove();
  }

  chrome.storage.local.get([CACHE_KEY, PINS_KEY, SEEN_KEY], (r) => {
    const c = r[CACHE_KEY];
    pins = r[PINS_KEY] || {}; seen = r[SEEN_KEY] || 0;
    if (c?.list) {
      checked = c.checked || {}; overrides = c.overrides || {}; metaDone = c.metaDone || {};
      c.list.forEach(t => topics.set(t.tid, t)); (c.pool || []).forEach(t => pool2.set(t.tid, t));
      lastUpdate = c.at; lastQuick = c.quick || c.at;
    }
    // רענון רגיל של הדף לא פותח את התוספים – מנקים את הסימון מהכתובת
    if (subFromHash() !== undefined) history.replaceState(history.state, '', location.pathname + location.search);
    injectNav(); injectHome(); updateNavDot();
    if (!c?.list) { firstRun = true; showModal(); }
    refresh(); // רענון שקט ברקע כדי שהכניסה תהיה מיידית
  });
})();
