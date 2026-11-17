/* Findora Songwünsche – Vanilla JS, kein Build-Schritt */
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const main = $("#main");
  const ICON = {
    wish: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>',
    people: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05A4.2 4.2 0 0 1 17 16.5V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6 6 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z"/></svg>',
    reply: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>',
    spotify: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.4a.62.62 0 0 1-.86.2c-2.35-1.43-5.3-1.76-8.79-.96a.62.62 0 1 1-.28-1.21c3.81-.87 7.08-.5 9.72 1.11.3.18.39.57.2.86zm1.22-2.72a.78.78 0 0 1-1.07.26c-2.69-1.65-6.79-2.13-9.97-1.17a.78.78 0 1 1-.45-1.49c3.63-1.1 8.15-.57 11.24 1.33.37.22.48.7.25 1.07zm.1-2.83C14.7 8.93 9.38 8.75 6.3 9.69a.94.94 0 1 1-.54-1.8c3.53-1.07 9.4-.86 13.1 1.34a.94.94 0 0 1-.96 1.62z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.6c.27 0 .53.04.77.12V9.77a5.68 5.68 0 0 0-.77-.05A5.69 5.69 0 1 0 15.54 15.4V9.1a7.33 7.33 0 0 0 4.29 1.38V7.4a4.28 4.28 0 0 1-3.23-1.58z"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12zm-12.91 4.72-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z"/></svg>'
  };
  const TITLES = { rangliste: "Rangliste", videos: "Videos", personen: "Personen", follower: "Follower", kommentare: "Kommentare" };
  const SEARCH_PH = { rangliste: "Suchen", personen: "Person oder Song suchen", kommentare: "Kommentare suchen" };

  // Filter-Definitionen je Ansicht (Einzelauswahl je Gruppe, erster Wert = Standard)
  const STATUS_OPTS = [["offen", "Offen"], ["alle", "Alle"], ["geplant", "Geplant"], ["erledigt", "Erledigt"], ["geparkt", "Geparkt"]];
  const REAKT_OPTS = [["alle", "Alle"], ["geliked", "Von mir geliked"], ["beantwortet", "Von mir beantwortet"], ["unbeantwortet", "Noch unbeantwortet"]];
  const KART_OPTS = [["alle", "Alle Kommentare"], ["wuensche", "Mit Songwunsch"], ["ohne", "Ohne Songwunsch"], ["tim", "Meine Antworten"]];
  const SORTS = {
    rangliste: [["wuensche", "Meiste Wünsche"], ["personen", "Meiste Personen"], ["likes", "Meiste Likes"], ["neueste", "Neueste zuerst"]],
    personen: [["wuensche", "Meiste Wünsche"], ["songs", "Meiste Songs"], ["likes", "Meiste Likes"]],
    kommentare: [["neueste", "Neueste zuerst"], ["likes", "Meiste Likes"]]
  };
  const DEF = { status: "offen", reakt: "alle", teil: null, kart: "alle", kreakt: "alle", kteil: null };

  let D = null, CM = {}, SM = {};
  const saved = (() => { try { return JSON.parse(localStorage.getItem("fsw-state-v3") || "{}"); } catch { return {}; } })();
  const S = Object.assign({ view: "rangliste", sort: { rangliste: "wuensche", personen: "wuensche", kommentare: "neueste" }, q: "" }, DEF,
    { view: "rangliste", sort: Object.assign({ rangliste: "wuensche", personen: "wuensche", kommentare: "neueste" }, saved.sort || {}) });
  // Filter werden bewusst nicht gespeichert: App startet immer mit der Standardansicht.
  const save = () => { try { localStorage.setItem("fsw-state-v3", JSON.stringify({ sort: S.sort })); } catch {} };

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => (n ?? 0).toLocaleString("de-DE");
  const fmtK = (n) => n >= 100000 ? (n / 1000).toLocaleString("de-DE", { maximumFractionDigits: 0 }) + "K" : n >= 10000 ? (n / 1000).toLocaleString("de-DE", { maximumFractionDigits: 1 }) + "K" : fmt(n);
  const norm = (s) => String(s ?? "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const tt = (u) => "https://www.tiktok.com/@" + encodeURIComponent(u);
  const plural = (n, a, b) => `${fmt(n)} ${n === 1 ? a : b}`;
  const svg = (ic, size) => ic.replace("<svg", `<svg width="${size}" height="${size}"`);
  const alterText = (k) => {
    const m = (k.alter || "").match(/^(\d+)\s*([smhdw])/i);
    if (!m) return k.alter || "";
    const n = +m[1], u = m[2].toLowerCase();
    return "vor " + n + " " + ({ s: "Sek.", m: "Min.", h: "Std.", d: n === 1 ? "Tag" : "Tagen", w: n === 1 ? "Woche" : "Wochen" }[u]);
  };
  const alterTextH = (h) => h < 1 ? "vor < 1 Std." : h < 24 ? `vor ${Math.round(h)} Std.` : `vor ${Math.round(h / 24)} ${Math.round(h / 24) === 1 ? "Tag" : "Tagen"}`;
  const hue = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
  const statusLabel = (s) => s.status === "erledigt" ? `Erledigt · Teil ${s.status_teil}` : s.status === "geplant" ? `Teil ${s.status_teil}` : s.status === "geparkt" ? "Geparkt" : "Offen";
  const statusBadge = (s, showOffen) => (s.status === "offen" && !showOffen) ? "" : `<span class="badge b-${s.status}">${esc(statusLabel(s))}</span>`;
  const timIcons = (liked, answered) => (liked || answered) ? `<span class="tim">${liked ? `<span class="liked" title="von dir geliked">${svg(ICON.heart, 12)}</span>` : ""}${answered ? `<span class="answered" title="von dir beantwortet">${svg(ICON.reply, 12)}</span>` : ""}</span>` : "";
  const videosText = (n) => n === 1 ? "aus 1 Video" : `aus ${n} Videos`;

  // ---------- Daten ----------
  async function load(force) {
    const btn = $("#reload"); btn.classList.add("spin");
    try {
      const r = await fetch("data.json" + (force ? "?t=" + Date.now() : ""), { cache: force ? "no-store" : "default" });
      if (!r.ok) throw new Error(r.status);
      D = await r.json();
      CM = Object.fromEntries(D.kommentare.map((k) => [k.id, k]));
      SM = Object.fromEntries(D.songs.map((s) => [s.id, s]));
      for (const s of D.songs) {
        const ks = s.kommentare.map((id) => CM[id]);
        s._search = norm([s.title, s.artist, ...ks.flatMap((k) => ["@" + k.user, k.name, k.text, k.tim_antwort])].join(" "));
      }
      $("#stand").textContent = "Stand " + D.meta.stand_text;
      render();
    } catch (e) {
      main.innerHTML = `<div class="empty">Daten konnten nicht geladen werden.<br>Bitte Internet prüfen und neu laden.</div>`;
    } finally { btn.classList.remove("spin"); }
  }

  // ---------- Filter-Logik ----------
  const optLabel = (opts, v) => (opts.find((o) => o[0] === v) || [, v])[1];
  function activeFilters() {
    const out = [];
    if (S.view === "rangliste") {
      if (S.status !== DEF.status) out.push({ key: "status", label: S.status === "alle" ? "Alle Songs" : optLabel(STATUS_OPTS, S.status) });
      if (S.reakt !== "alle") out.push({ key: "reakt", label: optLabel(REAKT_OPTS, S.reakt) });
      if (S.teil) out.push({ key: "teil", label: `Teil ${S.teil}` });
    } else if (S.view === "kommentare") {
      if (S.kart !== "alle") out.push({ key: "kart", label: optLabel(KART_OPTS, S.kart) });
      if (S.kreakt !== "alle") out.push({ key: "kreakt", label: optLabel(REAKT_OPTS, S.kreakt) });
      if (S.kteil) out.push({ key: "kteil", label: `Teil ${S.kteil}` });
    }
    return out;
  }
  function renderToolbar() {
    const hasSearch = S.view in SEARCH_PH;
    $("#toolbar").hidden = !hasSearch;
    $("#search").placeholder = SEARCH_PH[S.view] || "Suchen";
    $("#filter-btn").hidden = !(S.view === "rangliste" || S.view === "kommentare");
    $("#sort-btn").hidden = !SORTS[S.view];
    const af = activeFilters();
    const fc = $("#filter-count");
    fc.hidden = !af.length; fc.textContent = af.length;
    $("#filter-btn").classList.toggle("on", af.length > 0);
    const chips = $("#active-chips");
    chips.hidden = !af.length;
    chips.innerHTML = af.map((f) => `<button class="achip" data-remove="${f.key}">${esc(f.label)}<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>`).join("") +
      (af.length > 1 ? `<button class="achip ghost" data-remove="all">Alle zurücksetzen</button>` : "");
  }

  // ---------- Bottom-Sheet ----------
  function openBSheet(title, bodyFn, footHtml) {
    $("#bsheet-title").textContent = title;
    const draw = () => { $("#bsheet-body").innerHTML = bodyFn(); };
    $("#bsheet").__draw = draw; draw();
    $("#bsheet-foot").innerHTML = footHtml || "";
    $("#bsheet-foot").hidden = !footHtml;
    $("#backdrop").hidden = false; $("#bsheet").hidden = false;
    requestAnimationFrame(() => { $("#backdrop").classList.add("show"); $("#bsheet").classList.add("show"); });
  }
  function closeBSheet() {
    $("#backdrop").classList.remove("show"); $("#bsheet").classList.remove("show");
    setTimeout(() => { $("#backdrop").hidden = true; $("#bsheet").hidden = true; }, 220);
  }
  const optList = (group, opts, cur, counts) => `<div class="group">${opts.map(([v, l]) => `<button class="row-opt ${cur === v ? "sel" : ""}" data-set="${group}" data-v="${v}"><span>${esc(l)}</span><span class="opt-right">${counts && counts[v] != null ? `<span class="opt-count">${fmt(counts[v])}</span>` : ""}${cur === v ? `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>` : `<span class="opt-spacer"></span>`}</span></button>`).join("")}</div>`;
  const teilGrid = (group, cur) => `<div class="teil-grid"><button class="tg ${!cur ? "sel" : ""}" data-set="${group}" data-v="">Alle</button>${D.videos.map((v) => `<button class="tg ${cur === v.teil ? "sel" : ""}" data-set="${group}" data-v="${v.teil}">${v.teil}</button>`).join("")}</div>`;
  function filterSheetBody() {
    if (S.view === "kommentare") {
      return `<div class="g-label">Anzeigen</div>${optList("kart", KART_OPTS, S.kart)}
        <div class="g-label">Meine Reaktion</div>${optList("kreakt", REAKT_OPTS, S.kreakt)}
        <div class="g-label">Video</div>${teilGrid("kteil", S.kteil)}
        <div class="sheet-count">${plural(filteredKommentare().length, "Kommentar", "Kommentare")}</div>`;
    }
    const counts = Object.fromEntries(STATUS_OPTS.map(([v]) => [v, v === "alle" ? D.songs.length : D.songs.filter((s) => s.status === v).length]));
    return `<div class="g-label">Status</div>${optList("status", STATUS_OPTS, S.status, counts)}
      <div class="g-label">Meine Reaktion</div>${optList("reakt", REAKT_OPTS, S.reakt)}
      <div class="g-label">Gewünscht unter Teil</div>${teilGrid("teil", S.teil)}
      <div class="sheet-count">${plural(filteredSongs().length, "Song", "Songs")}</div>`;
  }
  function openFilter() {
    openBSheet("Filter", filterSheetBody, `<button class="fbtn ghost" data-act="freset">Zurücksetzen</button><button class="fbtn primary" data-act="fdone">Fertig</button>`);
  }
  function openSort() {
    openBSheet("Sortieren", () => optList("sort", SORTS[S.view], S.sort[S.view]));
  }
  function resetFilters(key) {
    const keys = key === "all" || !key ? (S.view === "kommentare" ? ["kart", "kreakt", "kteil"] : ["status", "reakt", "teil"]) : [key];
    for (const k of keys) S[k] = DEF[k];
  }

  // ---------- Rangliste ----------
  function filteredSongs() {
    const q = norm(S.q.trim());
    const list = D.songs.filter((s) => {
      if (S.status !== "alle" && s.status !== S.status) return false;
      if (S.teil && !s.teile.includes(S.teil)) return false;
      if (S.reakt === "geliked" && !s.geliked) return false;
      if (S.reakt === "beantwortet" && !s.beantwortet) return false;
      if (S.reakt === "unbeantwortet" && s.beantwortet) return false;
      if (q && !q.split(/\s+/).every((w) => s._search.includes(w))) return false;
      return true;
    });
    const by = {
      wuensche: (a, b) => b.wuensche - a.wuensche || b.personen - a.personen || b.likes_max - a.likes_max || b.likes_summe - a.likes_summe,
      personen: (a, b) => b.personen - a.personen || b.wuensche - a.wuensche || b.likes_summe - a.likes_summe,
      likes: (a, b) => b.likes_summe - a.likes_summe || b.likes_max - a.likes_max || b.wuensche - a.wuensche,
      neueste: (a, b) => (a.neueste_h ?? 1e9) - (b.neueste_h ?? 1e9) || b.wuensche - a.wuensche
    }[S.sort.rangliste];
    return list.sort((a, b) => by(a, b) || a.title.localeCompare(b.title, "de"));
  }
  const keyMetric = (s) => {
    const k = S.sort.rangliste;
    if (k === "likes") return [fmt(s.likes_summe), "Likes"];
    if (k === "personen") return [fmt(s.personen), s.personen === 1 ? "Person" : "Personen"];
    return [fmt(s.wuensche), s.wuensche === 1 ? "Wunsch" : "Wünsche"];
  };
  const subLine = (s) => {
    const parts = [];
    const k = S.sort.rangliste;
    if (k !== "wuensche") parts.push(plural(s.wuensche, "Wunsch", "Wünsche"));
    if (k !== "personen") parts.push(plural(s.personen, "Person", "Personen"));
    if (k !== "likes") parts.push(`${fmt(s.likes_summe)} Likes`);
    if (k === "neueste" && s.neueste_h != null) parts.unshift(alterTextH(s.neueste_h));
    return parts.join(" · ");
  };
  function topCard(s, i) {
    const [v, l] = keyMetric(s);
    return `<button class="top-card" data-song="${esc(s.id)}">
      <div class="tc-rank">#${i + 1}</div>
      <div class="tc-main">
        <div class="tc-title">${esc(s.title)}</div>
        <div class="tc-artist">${esc(s.artist || "Interpret unklar")}</div>
        <div class="tc-meta">${subLine(s)} · ${videosText(s.teile.length)} ${timIcons(s.geliked, s.beantwortet)}</div>
      </div>
      <div class="metric"><b>${v}</b><span>${l}</span></div>
    </button>`;
  }
  function songRow(s, i) {
    const [v, l] = keyMetric(s);
    return `<button class="row" data-song="${esc(s.id)}">
      <span class="row-rank">${i + 1}</span>
      <span class="row-main">
        <span class="row-title">${esc(s.title)}${timIcons(s.geliked, s.beantwortet)}</span>
        <span class="row-sub">${esc(s.artist || "Interpret unklar")}${statusBadge(s, false)}${s.auto ? '<span class="badge b-auto">auto</span>' : ""}</span>
        <span class="row-meta">${subLine(s)} · ${videosText(s.teile.length)}</span>
      </span>
      <span class="metric sm"><b>${v}</b><span>${l}</span></span>
    </button>`;
  }
  function counterText(n) {
    const lbl = { offen: ["offener Songwunsch", "offene Songwünsche"], alle: ["Song", "Songs"], geplant: ["geplanter Song", "geplante Songs"], erledigt: ["erledigter Song", "erledigte Songs"], geparkt: ["geparkter Song", "geparkte Songs"] }[S.status];
    return `${fmt(n)} ${n === 1 ? lbl[0] : lbl[1]}`;
  }
  function renderRangliste() {
    const list = filteredSongs();
    const pristine = !activeFilters().length && !S.q.trim() && S.sort.rangliste === "wuensche";
    const sortL = optLabel(SORTS.rangliste, S.sort.rangliste);
    let html = "";
    if (pristine && D.meta.geplant.length) {
      html += `<div class="next-card">
        <div class="nc-label">Als Nächstes</div>
        ${D.meta.geplant.map((p) => `<button class="nc-row" data-song="${esc(p.id)}"><span class="nc-teil">Teil ${p.teil}</span><span class="nc-song"><b>${esc(p.title)}</b> <span>${esc(p.artist || "")}</span></span><svg viewBox="0 0 24 24" width="18" height="18" class="chev"><path fill="currentColor" d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg></button>`).join("")}
      </div>`;
    }
    html += `<div class="list-head"><span>${counterText(list.length)}</span><span class="muted">${esc(sortL)}</span></div>`;
    if (!list.length) {
      html += `<div class="empty">Keine Songs gefunden.${activeFilters().length ? '<br><button class="link-btn" data-remove="all">Filter zurücksetzen</button>' : ""}</div>`;
    } else if (pristine) {
      html += `<div class="top3">${list.slice(0, 3).map(topCard).join("")}</div>`;
      if (list.length > 3) html += `<div class="group list-group">${list.slice(3).map((s, i) => songRow(s, i + 3)).join("")}</div>`;
    } else {
      html += `<div class="group list-group">${list.map(songRow).join("")}</div>`;
    }
    if (pristine && D.meta.geparkt_ohne_wuensche.length) html += `<div class="foot-note">Geparkt ohne Kommentar-Wünsche: ${D.meta.geparkt_ohne_wuensche.map((g) => esc(g.title)).join(", ")}</div>`;
    html += `<div class="foot-note">${fmt(D.meta.kommentare_erfasst)} von ${fmt(D.meta.kommentare_angezeigt)} Kommentaren erfasst · ${fmt(D.meta.wunsch_kommentare)} Wunsch-Kommentare · ${fmt(D.meta.verschiedene_songs)} Songs insgesamt. Zustimmende Antworten („ja bitte“) zählen als Wunsch.</div>`;
    main.innerHTML = html;
  }

  // ---------- Kommentar-Karte ----------
  function commentCard(k, opts = {}) {
    const songs = opts.songs !== false && k.songs.length ? `<div class="song-chips">${k.songs.map((id) => SM[id] ? `<button class="song-chip" data-song="${esc(id)}">${svg(ICON.wish, 13)}${esc(SM[id].title)}</button>` : "").join("")}</div>` : "";
    return `<div class="cmt ${k.von_tim ? "tim" : ""}">
      <div class="cmt-head">
        <a class="cmt-user" href="${tt(k.user)}" target="_blank" rel="noopener">@${esc(k.user)}</a>
        ${k.von_tim ? '<span class="badge b-geplant">Du</span>' : ""}
        <span class="cmt-time">Teil ${k.teil} · ${esc(alterText(k))}</span>
      </div>
      ${k.ist_antwort && k.antwort_auf ? `<div class="cmt-to">Antwort an @${esc(k.antwort_auf)}</div>` : ""}
      <div class="cmt-text ${k.text ? "" : "leer"}">${k.text ? esc(k.text) : "(nur Sticker/Bild)"}</div>
      <div class="cmt-foot">
        <span class="stat">${svg(ICON.heart, 13)} ${fmt(k.likes)}</span>
        ${k.geliked ? `<span class="stat pink">${svg(ICON.heart, 13)} von dir geliked</span>` : ""}
        ${k.auto ? '<span class="badge b-auto">auto erkannt</span>' : ""}
      </div>
      ${k.beantwortet ? `<div class="reply"><b>Deine Antwort</b>${k.tim_antwort ? esc(k.tim_antwort) : "(beantwortet)"}</div>` : ""}
      ${songs}
    </div>`;
  }

  // ---------- Detail ----------
  function openSong(id, push = true) {
    const s = SM[id];
    if (!s) return;
    const ks = s.kommentare.map((c) => CM[c]).sort((a, b) => b.likes - a.likes);
    const rang = D.songs.indexOf(s) + 1;
    $("#sheet-body").innerHTML = `
      <div class="d-eyebrow">${statusBadge(s, true)}<span>Platz ${rang} nach Wünschen</span></div>
      <div class="d-title">${esc(s.title)}</div>
      <div class="d-artist">${esc(s.artist || "Interpret unklar")}</div>
      <a class="spotify" href="${esc(s.spotify_url)}" target="_blank" rel="noopener">${svg(ICON.spotify, 22)} In Spotify öffnen</a>
      <div class="sp-note">${s.spotify_ist_track ? "Direkter Link zum Track" : "Öffnet die Spotify-Suche"}</div>
      <div class="dgrid">
        <div><b>${s.wuensche}</b><span>Wünsche</span></div>
        <div><b>${s.personen}</b><span>Personen</span></div>
        <div><b>${fmt(s.likes_summe)}</b><span>Likes</span></div>
        <div><b>${fmt(s.likes_max)}</b><span>max Likes</span></div>
      </div>
      <div class="group info-group">
        <div class="info-row"><span>Gewünscht unter</span><b>${s.teile.map((t) => "Teil " + t).join(", ")}</b></div>
        <div class="info-row"><span>Von dir geliked</span><b>${s.geliked ? "Ja" : "Nein"}</b></div>
        <div class="info-row"><span>Von dir beantwortet</span><b>${s.beantwortet ? "Ja" : "Nein"}</b></div>
        ${s.neueste_h != null ? `<div class="info-row"><span>Letzter Wunsch</span><b>${alterTextH(s.neueste_h)}</b></div>` : ""}
      </div>
      ${s.hinweis ? `<div class="hint">${esc(s.hinweis)}</div>` : ""}
      ${s.auto ? `<div class="hint">Automatisch erkannt – noch nicht von Hand geprüft.</div>` : ""}
      <div class="g-label">Wer hat's gewünscht? · ${ks.length}</div>
      <div class="group cmt-group">${ks.map((k) => commentCard(k, { songs: false })).join("")}</div>`;
    $("#sheet").hidden = false;
    $("#sheet-body").scrollTop = 0;
    if (push) history.pushState({ song: id }, "", "#song=" + encodeURIComponent(id));
  }
  function closeSheet() { $("#sheet").hidden = true; }

  // ---------- Videos ----------
  function renderVideos() {
    const v = D.videos;
    const sumViews = v.reduce((a, x) => a + (x.aufrufe || 0), 0);
    const maxViews = Math.max(...v.map((x) => x.aufrufe || 0));
    main.innerHTML = `
      <div class="kpis">
        <div class="kpi"><b>${fmt(D.meta.profil.follower)}</b><span>Follower</span></div>
        <div class="kpi"><b>${esc(D.meta.profil.likes)}</b><span>Likes</span></div>
        <div class="kpi"><b>${fmtK(sumViews)}</b><span>Aufrufe</span></div>
      </div>
      <div class="group list-group">${[...v].reverse().map((x) => `
        <div class="vrow">
          <div class="vrow-top">
            <span class="vnum">${x.teil}</span>
            <span class="row-main"><span class="row-title">${esc(x.titel)}</span><span class="row-sub">${esc(x.interpret || "")}</span></span>
            <span class="metric sm"><b>${fmtK(x.aufrufe || 0)}</b><span>Aufrufe</span></span>
          </div>
          <div class="bar"><i style="width:${Math.max(2, (100 * (x.aufrufe || 0)) / maxViews)}%"></i></div>
          <div class="vrow-meta">${fmtK(x.likes || 0)} Likes · ${fmt(x.kommentare_angezeigt ?? x.kommentare_erfasst)} Kommentare · ${plural(x.wunsch_kommentare, "Wunsch", "Wünsche")}</div>
          <div class="vrow-actions">
            ${x.wunsch_kommentare ? `<button class="pill-btn accent" data-teil="${x.teil}">${plural(x.verschiedene_songs, "Song", "Songs")} ansehen</button>` : `<span class="muted small">Keine Songwünsche</span>`}
            <a class="pill-btn" href="${esc(x.url)}" target="_blank" rel="noopener">${ICON.tiktok} Auf TikTok</a>
          </div>
        </div>`).join("")}</div>
      <div class="foot-note">Aufrufe Stand ${esc(D.meta.stand_text)}. Kommentare = von TikTok angezeigt (${fmt(D.meta.kommentare_erfasst)} davon erfasst).</div>`;
  }

  // ---------- Personen ----------
  function personen() {
    const m = new Map();
    for (const k of D.kommentare) {
      if (!k.songs.length || k.von_tim) continue;
      let p = m.get(k.user);
      if (!p) { p = { user: k.user, name: k.name, wuensche: 0, likes: 0, songs: new Map(), teile: new Set(), beantwortet: false, geliked: false, texte: [] }; m.set(k.user, p); }
      p.wuensche += 1; p.likes += k.likes; p.teile.add(k.teil); p.texte.push(k.text);
      p.beantwortet ||= k.beantwortet; p.geliked ||= k.geliked;
      for (const id of k.songs) p.songs.set(id, (p.songs.get(id) || 0) + 1);
    }
    return [...m.values()];
  }
  function renderPersonen() {
    const q = norm(S.q.trim());
    const ps = personen().filter((p) => !q || norm([p.user, "@" + p.user, p.name, ...p.texte, ...[...p.songs.keys()].map((id) => SM[id] ? SM[id].title + " " + SM[id].artist : "")].join(" ")).includes(q));
    const by = { wuensche: (a, b) => b.wuensche - a.wuensche || b.songs.size - a.songs.size || b.likes - a.likes, likes: (a, b) => b.likes - a.likes || b.wuensche - a.wuensche, songs: (a, b) => b.songs.size - a.songs.size || b.wuensche - a.wuensche };
    ps.sort((a, b) => by[S.sort.personen](a, b) || a.user.localeCompare(b.user));
    const k = S.sort.personen;
    main.innerHTML = `
      <div class="list-head"><span>${plural(ps.length, "Person", "Personen")} mit Songwünschen</span><span class="muted">${esc(optLabel(SORTS.personen, k))}</span></div>
      <div class="group list-group">${ps.map((p) => {
        const [v, l] = k === "likes" ? [fmt(p.likes), "Likes"] : k === "songs" ? [p.songs.size, p.songs.size === 1 ? "Song" : "Songs"] : [p.wuensche, p.wuensche === 1 ? "Wunsch" : "Wünsche"];
        return `<div class="prow">
          <div class="prow-top">
            <span class="avatar" style="background:hsl(${hue(p.user)} 45% 55%)">${esc((p.name || p.user).trim().charAt(0).toUpperCase() || "?")}</span>
            <span class="row-main">
              <span class="row-title">${esc(p.name || p.user)}${timIcons(p.geliked, p.beantwortet)}</span>
              <a class="row-sub link" href="${tt(p.user)}" target="_blank" rel="noopener">@${esc(p.user)}</a>
              <span class="row-meta">${videosText(p.teile.size)} · ${fmt(p.likes)} Likes</span>
            </span>
            <span class="metric sm"><b>${v}</b><span>${l}</span></span>
          </div>
          <div class="song-chips">${[...p.songs.entries()].map(([id, n]) => SM[id] ? `<button class="song-chip" data-song="${esc(id)}">${esc(SM[id].title)}${n > 1 ? ` <span class="muted">×${n}</span>` : ""}</button>` : "").join("")}</div>
        </div>`;
      }).join("") || '<div class="empty">Niemand gefunden.</div>'}</div>`;
  }

  // ---------- Follower ----------
  function renderFollower() {
    const f = D.follower;
    const acc = [...f.accounts].sort((a, b) => b.follower - a.follower);
    const shots = acc.filter((a) => /screenshot/i.test(a.quelle || "")).length;
    const blau = acc.filter((a) => a.verifiziert).length;
    main.innerHTML = `
      <div class="hero">
        <div class="big">${fmt(f.gesamt)}</div>
        <div class="muted">Follower</div>
      </div>
      <div class="kpis">
        <div class="kpi"><b>${fmt(f.geladen + shots)}</b><span>geprüft</span></div>
        <div class="kpi"><b>${fmt(blau)}</b><span>blauer Haken</span></div>
        <div class="kpi"><b>${acc.length ? fmtK(acc[0].follower) : "–"}</b><span>größter</span></div>
      </div>
      <div class="g-label">Größte Accounts, die dir folgen</div>
      <div class="group list-group">${acc.map((a, i) => `
        <a class="prow" href="${tt(a.user)}" target="_blank" rel="noopener">
          <div class="prow-top">
            <span class="avatar" style="background:hsl(${hue(a.user)} 45% 55%)">${esc((a.name || a.user).trim().charAt(0).toUpperCase())}</span>
            <span class="row-main">
              <span class="row-title">${esc(a.name || "@" + a.user)} ${a.verifiziert ? `<span class="verified">${ICON.check}</span>` : ""}</span>
              <span class="row-sub">${a.name ? "@" + esc(a.user) : (a.verifiziert ? "verifiziert" : "kein blauer Haken")}</span>
              <span class="row-meta">${[a.likes ? esc(a.likes) + " Likes" : "", a.folgt != null ? "folgt " + fmt(a.folgt) : "", a.notiz ? esc(a.notiz) : ""].filter(Boolean).join(" · ")}</span>
              ${a.quelle ? `<span class="row-meta faint">Quelle: ${esc(a.quelle)}</span>` : ""}
            </span>
            <span class="metric sm"><b>${fmt(a.follower)}</b><span>Follower</span></span>
          </div>
        </a>`).join("")}</div>
      <div class="hint">${esc(f.hinweis)}</div>
      <div class="foot-note">Hier stehen nur echte, geprüfte Daten. Kein blauer Haken = auf dem Profil/Screenshot keiner sichtbar.</div>`;
  }

  // ---------- Kommentare ----------
  function filteredKommentare() {
    const q = norm(S.q.trim());
    const ks = D.kommentare.filter((k) => {
      if (S.kteil && k.teil !== S.kteil) return false;
      if (S.kart === "wuensche" && !k.songs.length) return false;
      if (S.kart === "ohne" && (k.songs.length || k.von_tim)) return false;
      if (S.kart === "tim" && !k.von_tim) return false;
      if (S.kreakt === "geliked" && !k.geliked) return false;
      if (S.kreakt === "beantwortet" && !k.beantwortet) return false;
      if (S.kreakt === "unbeantwortet" && (k.beantwortet || k.von_tim)) return false;
      if (q && !norm([k.user, "@" + k.user, k.name, k.text, k.tim_antwort, ...k.songs.map((id) => SM[id] ? SM[id].title + " " + SM[id].artist : "")].join(" ")).includes(q)) return false;
      return true;
    });
    return ks.sort(S.sort.kommentare === "likes" ? (a, b) => b.likes - a.likes : (a, b) => (a.alter_h ?? 1e9) - (b.alter_h ?? 1e9) || b.teil - a.teil);
  }
  function renderKommentare() {
    const ks = filteredKommentare();
    main.innerHTML = `
      <div class="list-head"><span>${plural(ks.length, "Kommentar", "Kommentare")}</span><span class="muted">${esc(optLabel(SORTS.kommentare, S.sort.kommentare))}</span></div>
      <div class="group cmt-group">${ks.map((k) => commentCard(k)).join("") || '<div class="empty">Keine Kommentare gefunden.</div>'}</div>`;
  }

  // ---------- Router ----------
  function render() {
    if (!D) return;
    $("#view-title").textContent = TITLES[S.view];
    document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("active", b.dataset.view === S.view));
    renderToolbar();
    ({ rangliste: renderRangliste, videos: renderVideos, personen: renderPersonen, follower: renderFollower, kommentare: renderKommentare })[S.view]();
    save();
  }
  function setView(v) { S.view = v; S.q = ""; $("#search").value = ""; $("#search-clear").hidden = true; window.scrollTo(0, 0); render(); }
  const rerender = () => { const y = window.scrollY; render(); window.scrollTo(0, y); };

  // ---------- Events ----------
  $("#tabs").addEventListener("click", (e) => { const b = e.target.closest("button[data-view]"); if (b) setView(b.dataset.view); });
  document.addEventListener("click", (e) => {
    const rm = e.target.closest("[data-remove]");
    if (rm) { resetFilters(rm.dataset.remove); rerender(); return; }
  });
  main.addEventListener("click", (e) => {
    const songBtn = e.target.closest("[data-song]");
    if (songBtn) { openSong(songBtn.dataset.song); return; }
    const teilBtn = e.target.closest("[data-teil]");
    if (teilBtn) { resetFilters("all"); S.view = "rangliste"; S.teil = +teilBtn.dataset.teil; S.q = ""; $("#search").value = ""; $("#search-clear").hidden = true; window.scrollTo(0, 0); render(); }
  });
  $("#bsheet").addEventListener("click", (e) => {
    const o = e.target.closest("[data-set]");
    if (o) {
      const g = o.dataset.set, v = o.dataset.v;
      if (g === "sort") { S.sort[S.view] = v; closeBSheet(); window.scrollTo(0, 0); render(); return; }
      S[g] = (g === "teil" || g === "kteil") ? (v ? +v : null) : v;
      $("#bsheet").__draw(); rerender(); return;
    }
    const a = e.target.closest("[data-act]");
    if (a && a.dataset.act === "freset") { resetFilters("all"); $("#bsheet").__draw(); rerender(); }
    if (a && a.dataset.act === "fdone") closeBSheet();
  });
  $("#backdrop").addEventListener("click", closeBSheet);
  $("#filter-btn").addEventListener("click", openFilter);
  $("#sort-btn").addEventListener("click", openSort);
  $("#sheet-body").addEventListener("click", (e) => { const b = e.target.closest("[data-song]"); if (b) openSong(b.dataset.song); });
  let t;
  $("#search").addEventListener("input", (e) => {
    S.q = e.target.value; $("#search-clear").hidden = !S.q;
    clearTimeout(t); t = setTimeout(rerender, 120);
  });
  $("#search").addEventListener("keydown", (e) => { if (e.key === "Enter") e.target.blur(); });
  $("#search-clear").addEventListener("click", () => { S.q = ""; $("#search").value = ""; $("#search-clear").hidden = true; render(); });
  $("#sheet-close").addEventListener("click", () => { if (history.state && history.state.song) history.back(); else closeSheet(); });
  window.addEventListener("popstate", (e) => { if (e.state && e.state.song) openSong(e.state.song, false); else closeSheet(); });
  $("#reload").addEventListener("click", () => load(true));
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && D) load(false); });

  if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  if (location.hash.startsWith("#song=")) history.replaceState(null, "", location.pathname);
  load(false);
})();
