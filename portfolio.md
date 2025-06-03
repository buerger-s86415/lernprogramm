# Lernportfolio – Belegarbeit Webprogrammierung

## Ziel

Im Modul "Webprogrammierung" an der HTW Dresden sollte ein webbasiertes Lernprogramm als Progressive Web App (PWA) umgesetzt werden. Eine Aufgabenkategorie musste zusätzlich dynamisch per REST-API angebunden werden.

---

## Vorgehen

### 1. Planung & Grundstruktur
- HTML-Grundgerüst inkl. Navigation, Aufgabenbereich, Start-/Statistikseite
- CSS für responsive Darstellung auf Desktop und Mobil
- Kategorienauswahl als Radio-Buttons umgesetzt

### 2. Architektur: MVP
- Trennung in Model, View und Presenter (eigene JS-Klassen)
- `Model`: Aufgabenverwaltung, REST-API
- `View`: Darstellung + DOM-Manipulation
- `Presenter`: Logik & Zustand

### 3. Kategorien
- `mathe`: gerendert mit **KaTeX**
- `noten`: Darstellung über **VexFlow EasyScore**
- `web`: klassische Multiple-Choice-Fragen
- `quiz`: Aufgaben über REST (HTW-Webquiz-Server)

### 4. Fortschritt und Statistik
- Fortschrittsbalken mit drei Farben (✅, ❌, offen)
- Speicherung von Ergebnisläufen im localStorage
- Testatseite zeigt Zusammenfassung + Statistikverlauf

### 5. PWA & Offlinefähigkeit
- Manifest mit Icons für Installierbarkeit
- Service Worker (`sw.js`) zum Cachen lokaler Dateien
- Offline-Nutzung für alle **lokalen** Kategorien möglich

---

## Probleme und Lösungen

| Problem | Lösung |
|--------|--------|
| REST-Authentifizierung schlug fehl | Manuelle Base64-Kodierung im Header mit `fetch()` |
| Fortschrittsanzeige lief nicht korrekt | Prozentberechnung angepasst, DOM-Elemente überprüft |
| Kategorie-Wechsel setzte View nicht zurück | `resetStats()` + Kategorie-Check in View implementiert |
| Noten wurden nicht gerendert | Fehler lag an `EasyScore`-Nutzung – `voice.setStrict(false)` löste Problem |
| Offline-Modus funktionierte nicht | Cache-Strategie im Service Worker verbessert |

---

## Erkenntnisse

- Sicherheit bei fetch(), Header-Handling und CORS
- PWA-Mechanik: Service Worker, Caching, Manifest
- VexFlow & KaTeX sind leistungsfähige, aber empfindliche Tools (ich stand ewig auf dem schlauch ... )
- Debugging ist im Zusammenspiel von HTML/CSS/JS gut im Browser möglich (live server VS Code)
- MVP macht den Code sehr viel übersichtlicher

---

## KI-Unterstützung

**ChatGPT-4o** wurde in folgenden Bereichen eingesetzt:

- Architektur-Vorschläge (MVP)
- REST-Anbindung mit Basic Auth
- Fehlerbehebung im Service Worker und View
- Erklärung und Hilfe bei VexFlow-Notation

Die Vorschläge wurden durchdacht geprüft, angepasst und im eigenen Code umgesetzt.
