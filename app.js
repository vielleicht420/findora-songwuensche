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
  const STATUS = { offen: "offen", geplant: "geplant", erledigt: "erledigt", geparkt: "geparkt" };
  const TITLES = { rangliste: "Rangliste", videos: "Videos", personen: "Personen", follower: "Follower", kommentare: "Kommentare" };

  let D = null, CM = {}, SM = {};
  const saved = (() => { try { return JSON.parse(localStorage.getItem("fsw-state") || "{}"); } catch { return {}; } })();
  const S = Object.assign({
    view: "rangliste", sort: "wuensche", status: [], teil: null, tim: null, q: "",
    psort: "wuensche", ksort: "neueste", kfilter: "alle", kteil: null
  }, saved, { q: "" });
  const save = () => { const { q, ...rest } = S; try { localStorage.setItem("fsw-state", JSON.stringify(rest)); } catch {} };

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => (n ?? 0).toLocaleString("de-DE");
  const fmtK = (n) => n >= 100000 ? (n / 1000).toLocaleString("de-DE", { maximumFractionDigits: 0 }) + "K" : n >= 10000 ? (n / 1000).toLocaleString("de-DE", { maximumFractionDigits: 1 }) + "K" : fmt(n);
  const norm = (s) => String(s ?? "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const tt = (u) => "https://www.tiktok.com/@" + encodeURIComponent(u);
  const alterText = (k) => {
    const a = k.alter || "";
    const m = a.match(/^(\d+)\s*([smhdw])/i);
    if (!m) return a;
    const n = +m[1], u = m[2].toLowerCase();
    return "vor " + n + " " + ({ s: "Sek.", m: "Min.", h: n === 1 ? "Std." : "Std.", d: n === 1 ? "Tag" : "Tagen", w: n === 1 ? "Woche" : "Wochen" }[u]);
  };
  const hue = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
  const statusBadge = (s) => {
    const label = s.status === "erledigt" ? `erledigt · Teil ${s.status_teil}` : s.status === "geplant" ? `geplant · Teil ${s.status_teil}` : STATUS[s.status];
    return `<span class="badge b-${s.status}">${esc(label)}</span>`;
  };
  const timIcons = (liked, answered) => (liked || answered) ? `<span class="tim">${liked ? `<span class="liked" title="von dir geliked">${ICON.heart}</span>` : ""}${answered ? `<span class="answered" title="von dir beantwortet">${ICON.reply}</span>` : ""}</span>` : "";

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
      $("#stand").textContent = "Stand: " + D.meta.stand_text;
      render();
    } catch (e) {
      main.innerHTML = `<div class="empty">Daten konnten nicht geladen werden.<br>Bitte Internet prüfen und neu laden.</div>`;
    } finally { btn.classList.remove("spin"); }
  }

  // ---------- Rangliste ----------
  function filteredSongs() {
    const q = norm(S.q.trim());
    let list = D.songs.filter((s) => {
      if (S.status.length && !S.status.includes(s.status)) return false;
      if (S.teil && !s.teile.includes(S.teil)) return false;
      if (S.tim === "geliked" && !s.geliked) return false;
      if (S.tim === "beantwortet" && !s.beantwortet) return false;
      if (S.tim === "unbeantwortet" && s.beantwortet) return false;
      if (q && !q.split(/\s+/).every((w) => s._search.includes(w.replace(/^@/, "@")))) return false;
      return true;
    });
    const by = {
      wuensche: (a, b) => b.wuensche - a.wuensche || b.personen - a.personen || b.likes_max - a.likes_max || b.likes_summe - a.likes_summe,
      personen: (a, b) => b.personen - a.personen || b.wuensche - a.wuensche || b.likes_summe - a.likes_summe,
      likes: (a, b) => b.likes_summe - a.likes_summe || b.likes_max - a.likes_max || b.wuensche - a.wuensche,
      neueste: (a, b) => (a.neueste_h ?? 1e9) - (b.neueste_h ?? 1e9) || b.wuensche - a.wuensche
    }[S.sort];
    return list.sort((a, b) => by(a, b) || a.title.localeCompare(b.title, "de"));
  }

  function songCard(s, i) {
    const rc = S.sort === "wuensche" || S.sort === "likes" || S.sort === "personen" ? (i < 3 ? ` r${i + 1}` : "") : "";
    const neu = S.sort === "neueste" && s.neueste_h != null ? `<span class="stat">${esc(alterTextH(s.neueste_h))}</span>` : "";
    return `<button class="card" data-song="${esc(s.id)}">
      <div class="song">
        <div class="rank${rc}">${i + 1}</div>
        <div class="song-main">
          <div class="song-title">${esc(s.title)}</div>
          <div class="song-artist">${esc(s.artist || "Interpret unklar")}</div>
          <div class="meta-row">${statusBadge(s)}${s.auto ? '<span class="badge b-auto">auto erkannt</span>' : ""}${s.teile.map((t) => `<span class="teil-pill">T${t}</span>`).join("")}</div>
          <div class="stats">
            <span class="stat">${ICON.wish}<b>${s.wuensche}</b> ${s.wuensche === 1 ? "Wunsch" : "Wünsche"}</span>
            <span class="stat">${ICON.people}<b>${s.personen}</b></span>
            <span class="stat">${ICON.heart}<b>${fmt(s.likes_summe)}</b>${s.wuensche > 1 && s.likes_max ? ` <span>(max ${fmt(s.likes_max)})</span>` : ""}</span>
            ${neu}
            ${timIcons(s.geliked, s.beantwortet)}
          </div>
        </div>
      </div>
    </button>`;
  }
  const alterTextH = (h) => h < 1 ? "vor <1 Std." : h < 24 ? `vor ${Math.round(h)} Std.` : `vor ${Math.round(h / 24)} ${Math.round(h / 24) === 1 ? "Tag" : "Tagen"}`;

  function renderRangliste() {
    const list = filteredSongs();
    const anyFilter = S.status.length || S.teil || S.tim || S.q;
    const teile = D.videos.map((v) => v.teil);
    const planned = D.meta.geplant.length ? `<div class="section-h">Als Nächstes</div><div class="planned">${D.meta.geplant.map((p) => `<button class="card" data-song="${esc(p.id)}"><div class="p-teil">Teil ${p.teil}</div><div class="p-title">${esc(p.title)}</div><div class="p-artist">${esc(p.artist || "")}</div></button>`).join("")}</div>` : "";
    main.innerHTML = `
      ${!anyFilter ? planned : ""}
      <div class="controls">
        <div class="seg" data-group="sort">
          ${[["wuensche", "Wünsche"], ["personen", "Personen"], ["likes", "Likes"], ["neueste", "Neueste"]].map(([k, l]) => `<button data-v="${k}" class="${S.sort === k ? "on" : ""}">${l}</button>`).join("")}
        </div>
        <div class="chips" data-group="status">
          <span class="chip-label">Status</span>
          ${["offen", "geplant", "erledigt", "geparkt"].map((k) => `<button class="chip ${S.status.includes(k) ? "on" : ""}" data-v="${k}"><span class="dot" style="background:var(--s-${k})"></span>${STATUS[k]}</button>`).join("")}
        </div>
        <div class="chips" data-group="tim">
          <span class="chip-label">Ich</span>
          ${[["geliked", ICON.heart.replace("<svg", '<svg width="14" height="14"') + "von mir geliked"], ["beantwortet", ICON.reply.replace("<svg", '<svg width="14" height="14"') + "beantwortet"], ["unbeantwortet", "unbeantwortet"]].map(([k, l]) => `<button class="chip ${S.tim === k ? "on" : ""}" data-v="${k}">${l}</button>`).join("")}
        </div>
        <div class="chips" data-group="teil">
          <span class="chip-label">Teil</span>
          ${teile.map((t) => `<button class="chip ${S.teil === t ? "on" : ""}" data-v="${t}">Teil ${t}</button>`).join("")}
        </div>
      </div>
      <div class="resultline"><span>${list.length} von ${D.songs.length} Songs</span>${anyFilter ? '<button class="link-btn" data-act="reset">Filter zurücksetzen</button>' : ""}</div>
      <div class="list">${list.map(songCard).join("") || '<div class="empty">Keine Songs für diese Filter.</div>'}</div>
      ${!anyFilter && D.meta.geparkt_ohne_wuensche.length ? `<div class="note"><b>Geparkt ohne Kommentar-Wünsche:</b> ${D.meta.geparkt_ohne_wuensche.map((g) => `${esc(g.title)} – ${esc(g.artist || "")}`).join(" · ")}</div>` : ""}
      <div class="note">${fmt(D.meta.kommentare_erfasst)} von ${fmt(D.meta.kommentare_angezeigt)} Kommentaren erfasst · ${fmt(D.meta.wunsch_kommentare)} Wunsch-Kommentare · ${fmt(D.meta.wunsch_nennungen)} Nennungen · ${fmt(D.meta.verschiedene_songs)} verschiedene Songs. Antworten wie „ja bitte“ zählen als Wunsch für den Song, dem sie zustimmen.</div>`;
  }

  // ---------- Detail ----------
  function commentCard(k, opts = {}) {
    const songs = opts.songs !== false && k.songs.length ? `<div class="song-chips">${k.songs.map((id) => SM[id] ? `<button class="song-chip" data-song="${esc(id)}">${esc(SM[id].title)}</button>` : "").join("")}</div>` : "";
    return `<div class="card cmt ${k.von_tim ? "tim" : ""}">
      <div class="cmt-head">
        <a class="cmt-user" href="${tt(k.user)}" target="_blank" rel="noopener">@${esc(k.user)}</a>
        ${k.name && k.name !== k.user ? `<span class="cmt-name">${esc(k.name)}</span>` : ""}
        ${k.von_tim ? '<span class="badge b-geplant">du</span>' : ""}
      </div>
      ${k.ist_antwort && k.antwort_auf ? `<div class="cmt-name">↳ Antwort an @${esc(k.antwort_auf)}</div>` : ""}
      <div class="cmt-text ${k.text ? "" : "leer"}">${k.text ? esc(k.text) : "(nur Sticker/Bild)"}</div>
      <div class="cmt-foot">
        <span class="teil-pill">Teil ${k.teil}</span>
        <span class="stat">${ICON.heart.replace("<svg", '<svg width="14" height="14"')} ${fmt(k.likes)}</span>
        <span>${esc(alterText(k))}</span>
        ${k.geliked ? `<span class="stat" style="color:var(--pink)">${ICON.heart.replace("<svg", '<svg width="14" height="14"')} von dir geliked</span>` : ""}
        ${k.auto ? '<span class="badge b-auto">auto erkannt</span>' : ""}
      </div>
      ${k.beantwortet ? `<div class="reply"><b>Deine Antwort</b>${k.tim_antwort ? esc(k.tim_antwort) : "(beantwortet)"}</div>` : ""}
      ${songs}
    </div>`;
  }

  function openSong(id, push = true) {
    const s = SM[id];
    if (!s) return;
    const ks = s.kommentare.map((c) => CM[c]).sort((a, b) => b.likes - a.likes);
    const rang = D.songs.indexOf(s) + 1;
    $("#sheet-body").innerHTML = `
      <div class="meta-row">${statusBadge(s)}<span class="teil-pill">Platz ${rang} nach Wünschen</span></div>
      <div class="d-title">${esc(s.title)}</div>
      <div class="d-artist">${esc(s.artist || "Interpret unklar")}</div>
      <a class="spotify" href="${esc(s.spotify_url)}" target="_blank" rel="noopener">${ICON.spotify} In Spotify öffnen</a>
      <div class="sp-note">${s.spotify_ist_track ? "Direkter Link zum Track" : "Öffnet die Spotify-Suche"}</div>
      ${s.hinweis ? `<div class="hint">${esc(s.hinweis)}</div>` : ""}
      ${s.auto ? `<div class="hint" style="margin-top:8px">Automatisch erkannt – noch nicht von Hand geprüft.</div>` : ""}
      <div class="dgrid">
        <div><b>${s.wuensche}</b><span>Wünsche</span></div>
        <div><b>${s.personen}</b><span>Personen</span></div>
        <div><b>${fmt(s.likes_summe)}</b><span>Likes</span></div>
        <div><b>${fmt(s.likes_max)}</b><span>max Likes</span></div>
      </div>
      <div class="meta-row">${s.teile.map((t) => `<span class="teil-pill">gewünscht unter Teil ${t}</span>`).join("")}${timIcons(s.geliked, s.beantwortet)}</div>
      <div class="section-h">Wer hat's gewünscht?</div>
      <div class="list">${ks.map((k) => commentCard(k, { songs: false })).join("")}</div>`;
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
        <div class="kpi"><div class="v">${fmt(D.meta.profil.follower)}</div><div class="l">Follower</div></div>
        <div class="kpi"><div class="v">${esc(D.meta.profil.likes)}</div><div class="l">Likes gesamt</div></div>
        <div class="kpi"><div class="v">${fmtK(sumViews)}</div><div class="l">Aufrufe</div></div>
      </div>
      <div class="list">${[...v].reverse().map((x) => `
        <div class="card">
          <div class="video-top">
            <div class="video-num"><div><small>Teil</small>${x.teil}</div></div>
            <div class="song-main"><div class="song-title">${esc(x.titel)}</div><div class="song-artist">${esc(x.interpret || "")}</div></div>
          </div>
          <div class="bar"><i style="width:${Math.max(2, (100 * (x.aufrufe || 0)) / maxViews)}%"></i></div>
          <div class="vgrid">
            <div><b>${fmtK(x.aufrufe || 0)}</b><span>Aufrufe</span></div>
            <div><b>${fmtK(x.likes || 0)}</b><span>Likes</span></div>
            <div><b>${fmt(x.kommentare_angezeigt ?? x.kommentare_erfasst)}</b><span>Kommentare</span></div>
            <div><b>${fmt(x.wunsch_kommentare)}</b><span>Wünsche</span></div>
          </div>
          <div class="card-actions">
            <button class="btn btn-accent" data-teil="${x.teil}" ${x.wunsch_kommentare ? "" : "disabled style='opacity:.45'"}>${x.verschiedene_songs} ${x.verschiedene_songs === 1 ? "Song" : "Songs"} ansehen</button>
            <a class="btn btn-ghost" href="${esc(x.url)}" target="_blank" rel="noopener">${ICON.tiktok} TikTok</a>
          </div>
        </div>`).join("")}</div>
      <div class="note">Aufrufe Stand ${esc(D.meta.stand_text)}. Kommentare = von TikTok angezeigt (${fmt(D.meta.kommentare_erfasst)} davon erfasst).</div>`;
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
    let ps = personen().filter((p) => !q || norm([p.user, "@" + p.user, p.name, ...p.texte, ...[...p.songs.keys()].map((id) => SM[id] ? SM[id].title + " " + SM[id].artist : "")].join(" ")).includes(q));
    const by = { wuensche: (a, b) => b.wuensche - a.wuensche || b.songs.size - a.songs.size || b.likes - a.likes, likes: (a, b) => b.likes - a.likes || b.wuensche - a.wuensche, songs: (a, b) => b.songs.size - a.songs.size || b.wuensche - a.wuensche };
    ps.sort((a, b) => by[S.psort](a, b) || a.user.localeCompare(b.user));
    main.innerHTML = `
      <div class="controls"><div class="seg" data-group="psort">
        ${[["wuensche", "Wünsche"], ["songs", "Songs"], ["likes", "Likes"]].map(([k, l]) => `<button data-v="${k}" class="${S.psort === k ? "on" : ""}">${l}</button>`).join("")}
      </div></div>
      <div class="resultline"><span>${ps.length} Personen mit Songwünschen</span></div>
      <div class="list">${ps.map((p, i) => `
        <div class="card">
          <div class="person">
            <div class="avatar" style="background:hsl(${hue(p.user)} 65% 50%)">${esc((p.name || p.user).trim().charAt(0).toUpperCase() || "?")}</div>
            <div class="person-main">
              <div class="person-name">${i + 1}. ${esc(p.name || p.user)}</div>
              <a class="person-handle" href="${tt(p.user)}" target="_blank" rel="noopener">@${esc(p.user)}</a>
              <div class="meta-row">${[...p.teile].sort((a, b) => a - b).map((t) => `<span class="teil-pill">T${t}</span>`).join("")}${timIcons(p.geliked, p.beantwortet)}</div>
            </div>
            <div class="count"><b>${p.wuensche}</b><span>${p.wuensche === 1 ? "Wunsch" : "Wünsche"}</span><br><span>${ICON.heart.replace("<svg", '<svg width="11" height="11"')} ${fmt(p.likes)}</span></div>
          </div>
          <div class="song-chips">${[...p.songs.entries()].map(([id, n]) => SM[id] ? `<button class="song-chip" data-song="${esc(id)}">${esc(SM[id].title)}${n > 1 ? ` ×${n}` : ""}</button>` : "").join("")}</div>
        </div>`).join("") || '<div class="empty">Niemand gefunden.</div>'}</div>`;
  }

  // ---------- Follower ----------
  function renderFollower() {
    const f = D.follower;
    const acc = [...f.accounts].sort((a, b) => b.follower - a.follower);
    main.innerHTML = `
      <div class="card" style="text-align:center;padding:20px">
        <div class="big">${fmt(f.gesamt)}</div>
        <div class="stand" style="font-size:13px">Follower · Stand ${esc(D.meta.stand_text)}</div>
      </div>
      <div class="kpis" style="margin-top:10px">
        <div class="kpi"><div class="v">${fmt(f.geladen)}</div><div class="l">geprüft</div></div>
        <div class="kpi"><div class="v">${fmt(f.blauer_haken)}</div><div class="l">blauer Haken</div></div>
        <div class="kpi"><div class="v">${acc.length ? fmt(acc[0].follower) : "–"}</div><div class="l">größter Account</div></div>
      </div>
      <div class="hint">${esc(f.hinweis)}</div>
      <div class="section-h">Größte Accounts unter den geprüften</div>
      <div class="list">${acc.map((a, i) => `
        <a class="card person" href="${tt(a.user)}" target="_blank" rel="noopener" style="text-decoration:none">
          <div class="avatar" style="background:hsl(${hue(a.user)} 65% 50%)">${esc(a.user.charAt(0).toUpperCase())}</div>
          <div class="person-main">
            <div class="person-name">${i + 1}. @${esc(a.user)} ${a.verifiziert ? `<span class="verified">${ICON.check}</span>` : ""}</div>
            <div class="person-handle">${a.verifiziert ? "verifiziert · " : "kein blauer Haken"}${a.notiz ? " · " + esc(a.notiz) : ""}</div>
          </div>
          <div class="count"><b>${fmt(a.follower)}</b><span>Follower</span></div>
        </a>`).join("")}</div>
      <div class="note">Hier stehen nur echte, geprüfte Daten. Wenn dir in der App jemand mit vielen Followern oder blauem Haken auffällt: Screenshot schicken, dann wird er ergänzt.</div>`;
  }

  // ---------- Kommentare ----------
  function renderKommentare() {
    const q = norm(S.q.trim());
    let ks = D.kommentare.filter((k) => {
      if (S.kteil && k.teil !== S.kteil) return false;
      switch (S.kfilter) {
        case "wuensche": if (!k.songs.length) return false; break;
        case "ohne": if (k.songs.length || k.von_tim) return false; break;
        case "geliked": if (!k.geliked) return false; break;
        case "beantwortet": if (!k.beantwortet) return false; break;
        case "unbeantwortet": if (k.beantwortet || k.von_tim) return false; break;
        case "tim": if (!k.von_tim) return false; break;
      }
      if (q && !norm([k.user, "@" + k.user, k.name, k.text, k.tim_antwort, ...k.songs.map((id) => SM[id] ? SM[id].title + " " + SM[id].artist : "")].join(" ")).includes(q)) return false;
      return true;
    });
    ks.sort(S.ksort === "likes" ? (a, b) => b.likes - a.likes : (a, b) => (a.alter_h ?? 1e9) - (b.alter_h ?? 1e9) || b.teil - a.teil);
    const shown = ks.slice(0, 150);
    main.innerHTML = `
      <div class="controls">
        <div class="seg" data-group="ksort">${[["neueste", "Neueste"], ["likes", "Meiste Likes"]].map(([k, l]) => `<button data-v="${k}" class="${S.ksort === k ? "on" : ""}">${l}</button>`).join("")}</div>
        <div class="chips" data-group="kfilter">${[["alle", "Alle"], ["wuensche", "Mit Songwunsch"], ["ohne", "Ohne Wunsch"], ["geliked", "von mir geliked"], ["beantwortet", "beantwortet"], ["unbeantwortet", "unbeantwortet"], ["tim", "meine Antworten"]].map(([k, l]) => `<button class="chip ${S.kfilter === k ? "on" : ""}" data-v="${k}">${l}</button>`).join("")}</div>
        <div class="chips" data-group="kteil"><span class="chip-label">Teil</span>${D.videos.map((v) => `<button class="chip ${S.kteil === v.teil ? "on" : ""}" data-v="${v.teil}">Teil ${v.teil}</button>`).join("")}</div>
      </div>
      <div class="resultline"><span>${ks.length} Kommentare${ks.length > shown.length ? ` · die ersten ${shown.length} angezeigt` : ""}</span></div>
      <div class="list">${shown.map((k) => commentCard(k)).join("") || '<div class="empty">Keine Kommentare gefunden.</div>'}</div>`;
  }

  // ---------- Router ----------
  function render() {
    if (!D) return;
    $("#view-title").textContent = TITLES[S.view];
    document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("active", b.dataset.view === S.view));
    $("#search-wrap").hidden = S.view === "videos" || S.view === "follower";
    $("#search").placeholder = S.view === "personen" ? "@Name oder Song suchen …" : S.view === "kommentare" ? "Kommentartext, @Name, Song …" : "Song, Interpret, @Name, Kommentar …";
    ({ rangliste: renderRangliste, videos: renderVideos, personen: renderPersonen, follower: renderFollower, kommentare: renderKommentare })[S.view]();
    save();
  }
  function setView(v) { S.view = v; window.scrollTo(0, 0); render(); }

  // ---------- Events ----------
  $("#tabs").addEventListener("click", (e) => { const b = e.target.closest("button[data-view]"); if (b) setView(b.dataset.view); });
  main.addEventListener("click", (e) => {
    const songBtn = e.target.closest("[data-song]");
    if (songBtn) { openSong(songBtn.dataset.song); return; }
    const teilBtn = e.target.closest("[data-teil]");
    if (teilBtn) { S.teil = +teilBtn.dataset.teil; S.status = []; S.tim = null; S.q = ""; $("#search").value = ""; $("#search-clear").hidden = true; setView("rangliste"); return; }
    if (e.target.closest("[data-act=reset]")) { Object.assign(S, { status: [], teil: null, tim: null, q: "" }); $("#search").value = ""; $("#search-clear").hidden = true; render(); return; }
    const b = e.target.closest("[data-group] [data-v]");
    if (!b) return;
    const g = b.parentElement.dataset.group, v = b.dataset.v;
    if (g === "sort" || g === "psort" || g === "ksort") S[g] = v;
    else if (g === "status") S.status = S.status.includes(v) ? S.status.filter((x) => x !== v) : [...S.status, v];
    else if (g === "tim") S.tim = S.tim === v ? null : v;
    else if (g === "teil") S.teil = S.teil === +v ? null : +v;
    else if (g === "kteil") S.kteil = S.kteil === +v ? null : +v;
    else if (g === "kfilter") S.kfilter = v;
    const y = window.scrollY; render(); window.scrollTo(0, y);
  });
  $("#sheet-body").addEventListener("click", (e) => { const b = e.target.closest("[data-song]"); if (b) openSong(b.dataset.song); });
  let t;
  $("#search").addEventListener("input", (e) => {
    S.q = e.target.value; $("#search-clear").hidden = !S.q;
    clearTimeout(t); t = setTimeout(render, 120);
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
