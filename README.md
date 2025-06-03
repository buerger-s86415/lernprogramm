# Lernprogramm – Belegarbeit Webprogrammierung (HTW Dresden)

## 🧾 Projektbeschreibung

Dies ist ein webbasiertes Lernprogramm, umgesetzt als Progressive Web App (PWA). Die Anwendung dient der interaktiven Beantwortung von Fragen aus verschiedenen Themenkategorien. Sie kann auf Mobilgeräten installiert und offline genutzt werden.

Ziel der Anwendung ist es, Fragen zufällig darzustellen, die Antworten auszuwerten und dem Nutzer den Lernfortschritt sowie eine Statistik anzuzeigen.

---

- Auswahl aus mehreren Aufgabenkategorien:
  - Mathematik (gerendert mit **KaTeX**)
  - Notenlesen (gerendert mit **VexFlow**)
  - Webtechnologien (Multiple-Choice)
  - Quizfragen per REST-API von externem Server
- Zufällig gemischte Antwortmöglichkeiten
- Fortschrittsanzeige mit Farbverlauf (grün/rot/grau)
- Abschlusstestatistik + Speicherung der Ergebnisse im localStorage
- Offlinefähig (via Service Worker)
- Responsives Design für verschiedene Endgeräte
- PWA-fähig (installierbar, offline nutzbar, Manifest, Icons)

## 🌐 Externer Quiz-Server
Fragen der Kategorie `Quiz` werden über folgende REST-Schnittstelle geladen:
- GET `https://idefix.informatik.htw-dresden.de/webquiz/api/quizzes`
- POST `https://idefix.informatik.htw-dresden.de/webquiz/api/quizzes/{id}/solve


Authentifizierung via **Basic Auth** (Benutzername: `s86415`). Die Antworten werden serverseitig überprüft.

## 🗂️ Dateistruktur

```
Lernprogramm/
├── index.html
├── style.css
├── app.js
├── sw.js
├── manifest.json
├── data/
│   └── fragen.json
├── assets/
│   ├── icon.png
|   ├── ... (weitere icons)
│   └── header.jpg
└── README.md

---

## 🚀 Nutzung

1. Projekt ins Verzeichnis `~/public_html/Lernprogramm` auf dem HTW-Webserver laden
2. Aufruf im Browser:  
   `https://www.informatik.htw-dresden.de/~s86415/Lernprogramm/`
3. Installieren über Browser-Prompt möglich (PWA)

---

## 📦 Technisches

- **Architektur:** Model-View-Presenter (MVP)
- **JS ohne Framework**, strikt im ECMAScript-Modus
- `app.js`: Aufgabenlogik und Interaktion
- `style.css`: flexibles Layout, einfache Animationen
- `sw.js`: Service Worker für Offline-Nutzung
- `manifest.json`: Konfiguration für PWA

---

## 🤖 Nutzung von KI (ChatGPT)

Für Planung, Strukturierung und Codierung wurde ChatGPT (GPT-4, Mai 2025) unterstützend eingesetzt, insbesondere für:

- Hilfe bei der REST-Anbindung und Basic Auth
- Fehlerbehebung im Offline-Modus (Service Worker Debugging)
- Implementierung von VexFlow und KaTeX

Alle erstellten Inhalte wurden verstanden, geprüft und im Kontext der Aufgabenstellung angepasst.

---

## 👨‍💻 Entwickler

- **Name:** Kevin Bürger
- **Matrikelnummer:** s86415
- **Studiengang:** IA23

---

- Mehrnutzerbetrieb mit Logins
- Kategorie Notenlernen mit Web Audio API + virtueller Klaviatur
