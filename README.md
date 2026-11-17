# Findora Songwünsche

Kleine Web-App (PWA) für die TikTok-Serie **„Songs erklärt“** von [@f1ndor4](https://www.tiktok.com/@f1ndor4):
Rangliste der Songwünsche aus den Kommentaren, Videos, Personen, Follower und alle Kommentare.

**App:** https://vielleicht420.github.io/findora-songwuensche/

## Auf dem iPhone installieren
1. Link oben in **Safari** öffnen.
2. Unten auf **Teilen** (Quadrat mit Pfeil) tippen.
3. **„Zum Home-Bildschirm“** wählen → **Hinzufügen**.
Danach öffnet sich „Songwünsche“ wie eine normale App (Vollbild, funktioniert auch offline mit dem letzten Stand).

## Daten aktualisieren
```bash
python3 update_data.py /pfad/zu/all_comments.jsonl   # erzeugt data.json
git add data.json config && git commit -m "Daten aktualisiert" && git push
```
- `config/status.json` – Stand, Follower/Likes, Aufrufe pro Video, erledigt/geplant/geparkt, Follower-Check
- `config/songs.json` – Song-Katalog (Titel, Interpret, Hinweise, optional Spotify-Track-Link)
- `config/zuordnung.json` – welcher Kommentar welche Songs wünscht

Neue Kommentare, die noch nicht in `zuordnung.json` stehen, werden per Titelsuche automatisch zugeordnet
(in der App als „auto erkannt“ markiert) und vom Skript zur Kontrolle aufgelistet.

Vanilla HTML/CSS/JS, kein Build-Schritt. Gehostet über GitHub Pages (Branch `main`, Root).
