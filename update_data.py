#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Erzeugt data.json für die Findora-Songwünsche-App.

Aufruf (im Repo-Ordner):
    python3 update_data.py [pfad/zu/all_comments.jsonl]

Standard-Eingabe: /workspace/all_comments.jsonl (falls vorhanden), sonst ./all_comments.jsonl
Konfiguration:
    config/status.json     Stand, Profilwerte, Aufrufe pro Video, erledigt/geplant/geparkt, Follower
    config/songs.json      Song-Katalog (id, Titel, Interpret, Hinweis, optional Spotify-Track)
    config/zuordnung.json  Welcher Kommentar wünscht welche Songs (Schlüssel siehe kommentar_key)
Kommentare, die noch nicht in zuordnung.json stehen, werden per Titelsuche automatisch zugeordnet
(markiert als "auto") und am Ende zur Kontrolle ausgegeben.
Danach: git add data.json && git commit -m "Daten aktualisiert" && git push
"""
import hashlib, json, os, re, sys, unicodedata
from collections import defaultdict
from urllib.parse import quote

HIER = os.path.dirname(os.path.abspath(__file__))
TIM = "f1ndor4"


def lade(name):
    with open(os.path.join(HIER, "config", name), encoding="utf-8") as f:
        return json.load(f)


def kommentare_pfad():
    if len(sys.argv) > 1:
        return sys.argv[1]
    for p in ("/workspace/all_comments.jsonl", os.path.join(HIER, "all_comments.jsonl")):
        if os.path.exists(p):
            return p
    sys.exit("Keine all_comments.jsonl gefunden – Pfad als Argument angeben.")


def teil_von(video):
    m = re.match(r"Teil (\d+)", video or "")
    return int(m.group(1)) if m else None


def zahl(v):
    s = str(v or "0").strip().upper().replace(",", ".")
    try:
        if s.endswith("K"):
            return int(float(s[:-1]) * 1000)
        if s.endswith("M"):
            return int(float(s[:-1]) * 1_000_000)
        return int(s.replace(".", ""))
    except ValueError:
        return 0


def alter_stunden(a):
    m = re.match(r"(\d+)\s*([smhdw])", (a or "").strip().lower())
    if not m:
        return None
    n, e = int(m.group(1)), m.group(2)
    return {"s": n / 3600, "m": n / 60, "h": n, "d": n * 24, "w": n * 168}[e]


def norm(t):
    t = unicodedata.normalize("NFKD", (t or "").lower())
    t = "".join(c for c in t if not unicodedata.combining(c))
    return " " + re.sub(r"[^a-z0-9ß]+", " ", t).strip() + " "


def kommentar_keys(rows):
    """Stabiler Schlüssel je Kommentar: sha1(video|user|antwort_auf|text)[:12], Duplikate -2, -3 …"""
    gesehen, keys = {}, []
    for r in rows:
        basis = hashlib.sha1("|".join([r["video"], r["user"], r.get("antwort_auf") or "", r.get("text") or ""]).encode()).hexdigest()[:12]
        n = gesehen.get(basis, 0)
        gesehen[basis] = n + 1
        keys.append(basis if n == 0 else f"{basis}-{n + 1}")
    return keys


def main():
    status = lade("status.json")
    katalog = {s["id"]: s for s in lade("songs.json")["songs"]}
    zuordnung = {k: v["songs"] for k, v in lade("zuordnung.json")["zuordnung"].items()}

    unbekannt = sorted({sid for l in zuordnung.values() for sid in l if sid not in katalog}
                       | {sid for sid in list(status["erledigt"]) + list(status["geplant"]) + status["geparkt"] if sid not in katalog})
    if unbekannt:
        sys.exit(f"Song-IDs fehlen in config/songs.json: {unbekannt}")

    with open(kommentare_pfad(), encoding="utf-8") as f:
        rows = [json.loads(l) for l in f if l.strip()]
    keys = kommentar_keys(rows)

    # Auto-Zuordnung über Titel (nur für neue, noch nicht gepflegte Kommentare)
    titel_index = [(norm(s["title"]), sid) for sid, s in katalog.items()
                   if len(norm(s["title"]).strip()) >= 5 and "kein bestimmter" not in s["title"]]

    kommentare, auto_treffer, ohne = [], [], []
    for r, key in zip(rows, keys):
        text = r.get("text") or ""
        ist_tim = r["user"] == TIM
        songs, auto = zuordnung.get(key), False
        if songs is None:
            songs = []
            if not ist_tim and text.strip():
                nt = norm(text)
                songs = [sid for t, sid in titel_index if t in nt]
                if songs:
                    auto = True
                    auto_treffer.append((key, r["user"], text, songs))
                else:
                    ohne.append((key, r["user"], text))
        beantwortet = r.get("tim_hat_geantwortet") == "ja" and not ist_tim
        kommentare.append({
            "id": key,
            "teil": teil_von(r["video"]),
            "user": r["user"],
            "name": r.get("display_name") or r["user"],
            "text": text,
            "likes": zahl(r.get("likes")),
            "alter": r.get("alter"),
            "alter_h": alter_stunden(r.get("alter")),
            "ist_antwort": r.get("ist_antwort") == "ja",
            "antwort_auf": r.get("antwort_auf"),
            "geliked": r.get("von_tim_geliked") == "ja",
            "beantwortet": beantwortet,
            "tim_antwort": r.get("tim_antwort") if beantwortet else None,
            "von_tim": ist_tim,
            "songs": songs,
            "auto": auto,
        })

    erledigt, geplant, geparkt = status["erledigt"], status["geplant"], set(status["geparkt"])

    def song_status(sid):
        if sid in erledigt:
            return "erledigt", erledigt[sid]
        if sid in geplant:
            return "geplant", geplant[sid]
        if sid in geparkt:
            return "geparkt", None
        return "offen", None

    pro_song = defaultdict(list)
    for k in kommentare:
        for sid in k["songs"]:
            pro_song[sid].append(k)

    songs_out = []
    for sid, ks in pro_song.items():
        s = katalog[sid]
        st, teil = song_status(sid)
        if "kein bestimmter" in s["title"]:
            q = s.get("artist") or s["title"]
        else:
            q = f'{s["title"]} {s["artist"]}' if s.get("artist") else s["title"]
        alter = [k["alter_h"] for k in ks if k["alter_h"] is not None]
        songs_out.append({
            "id": sid,
            "title": s["title"],
            "artist": s.get("artist"),
            "artist_klar": s.get("artist_klar", True),
            "hinweis": s.get("hinweis"),
            "status": st,
            "status_teil": teil,
            "wuensche": len(ks),
            "personen": len({k["user"] for k in ks}),
            "likes_summe": sum(k["likes"] for k in ks),
            "likes_max": max(k["likes"] for k in ks),
            "teile": sorted({k["teil"] for k in ks if k["teil"]}),
            "geliked": any(k["geliked"] for k in ks),
            "beantwortet": any(k["beantwortet"] for k in ks),
            "neueste_h": min(alter) if alter else None,
            "auto": all(k["auto"] for k in ks),
            "spotify_url": s.get("spotify_track") or "https://open.spotify.com/search/" + quote(q),
            "spotify_ist_track": bool(s.get("spotify_track")),
            "kommentare": [k["id"] for k in ks],
        })
    songs_out.sort(key=lambda s: (-s["wuensche"], -s["personen"], -s["likes_max"], -s["likes_summe"], s["title"].lower()))
    for i, s in enumerate(songs_out, 1):
        s["rang"] = i

    videos_out = []
    for v in status["videos"]:
        ks = [k for k in kommentare if k["teil"] == v["teil"]]
        wunsch = [k for k in ks if k["songs"]]
        videos_out.append({**v,
                           "kommentare_erfasst": len(ks),
                           "wunsch_kommentare": len(wunsch),
                           "verschiedene_songs": len({sid for k in wunsch for sid in k["songs"]})})

    geparkt_ohne = [{"id": sid, "title": katalog[sid]["title"], "artist": katalog[sid].get("artist")}
                    for sid in status["geparkt"] if sid not in pro_song]
    geplant_liste = [{"id": sid, "teil": t, "title": katalog[sid]["title"], "artist": katalog[sid].get("artist")}
                     for sid, t in sorted(geplant.items(), key=lambda x: x[1])]

    wunsch_k = [k for k in kommentare if k["songs"]]
    data = {
        "meta": {
            "stand": status["stand"],
            "stand_text": status["stand_text"],
            "account": status["account"],
            "serie": status["serie"],
            "profil": status["profil"],
            "kommentare_angezeigt": sum(v.get("kommentare_angezeigt", 0) for v in status["videos"]),
            "kommentare_erfasst": len(kommentare),
            "wunsch_kommentare": len(wunsch_k),
            "wunsch_nennungen": sum(len(k["songs"]) for k in wunsch_k),
            "verschiedene_songs": len(songs_out),
            "geplant": geplant_liste,
            "geparkt_ohne_wuensche": geparkt_ohne,
        },
        "videos": videos_out,
        "songs": songs_out,
        "kommentare": kommentare,
        "follower": status["follower"],
    }
    with open(os.path.join(HIER, "data.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    print(f"data.json geschrieben: {len(songs_out)} Songs, {len(kommentare)} Kommentare, "
          f"{len(wunsch_k)} Wunsch-Kommentare, {data['meta']['wunsch_nennungen']} Nennungen")
    if auto_treffer:
        print(f"\n{len(auto_treffer)} neue Kommentare automatisch zugeordnet – bitte prüfen und in config/zuordnung.json festschreiben:")
        for key, u, t, s in auto_treffer:
            print(f"  {key}  @{u}: {t[:70]!r} -> {s}")
    if ohne:
        print(f"\n{len(ohne)} neue Kommentare ohne erkannten Songwunsch (ggf. von Hand zuordnen, sonst mit songs: [] eintragen):")
        for key, u, t in ohne:
            print(f"  {key}  @{u}: {t[:70]!r}")


if __name__ == "__main__":
    main()
