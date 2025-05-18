# Lernprogramm – Belegarbeit Webprogrammierung (HTW Dresden)

## 🧾 Projektbeschreibung

Dies ist ein webbasiertes Lernprogramm, umgesetzt als Progressive Web App (PWA). Die Anwendung dient der interaktiven Beantwortung von Fragen aus verschiedenen Themenkategorien. Sie kann auf Mobilgeräten installiert und offline genutzt werden.

Ziel der Anwendung ist es, Fragen zufällig darzustellen, die Antworten auszuwerten und dem Nutzer den Lernfortschritt sowie eine Statistik anzuzeigen.

---

## ✅ Erfüllte Anforderungen laut Aufgabenstellung

- HTML5 zur Strukturierung
- CSS3 zur Gestaltung inkl. responsive Design (mobile Ansicht)
- JavaScript (ECMAScript, strict mode) zur Steuerung
- DOM-Manipulation (Anzeige von Fragen, Antworten, Fortschritt)
- Datenhaltung per JSON (lokale Fragen)
- Nutzung einer REST-API für externe Fragen (vorbereitet)
- Model-View-Presenter-Architektur (MVP)
- Anzeige des Lernfortschritts per Progressbar
- Anzeige einer Auswertungsstatistik
- Kategorienauswahl per Radiobuttons
- Unterstützung mehrerer Fragetypen (z. B. Mathe)
- PWA mit Service Worker und manifest.json
- Offline-Nutzung über Cache
- Bereitstellung auf dem Webserver der HTW Dresden

---

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
│   └── header.jpg
└── README.md
```

---

## 🚀 Nutzungshinweise

- Die Anwendung kann im Browser geöffnet werden:
  [`https://www.informatik.htw-dresden.de/~sxxxxx/Lernprogramm/`](https://www.informatik.htw-dresden.de/~sxxxxx/Lernprogramm/)
- Alternativ kann sie auf mobilen Geräten **installiert** werden (PWA-Icon erscheint im Browser)
- Die Bedienung erfolgt über:
  - Kategorien auswählen
  - Start-Button klicken
  - Frage beantworten
  - Fortschritt verfolgen

---

## 📦 Technisches

- HTML5 + CSS3 (Media Queries)
- JavaScript (strict mode)
- JSON zur Datenstrukturierung
- MVP-Architektur
- Cache über Service Worker (sw.js)
- manifest.json für PWA-Installierbarkeit
- keine externen Frameworks (pures JS & CSS)

---

## ⚠️ Hinweise & bekannte Probleme

- Die REST-API-Anbindung ist vorbereitet, aber noch nicht vollständig eingebunden
- Die Mathe-Anzeige mit KaTeX ist optional geplant
- Barrierefreiheit (a11y) ist noch nicht vollständig umgesetzt

---

## 🤖 Nutzung von KI (ChatGPT)

Für Planung, Strukturierung und Codierung wurde ChatGPT (GPT-4, Mai 2025) unterstützend eingesetzt, insbesondere für:

- DOM-Manipulation
- manifest.json
- Technische Erklärungen (README, Aufbau, Begriffe)

Alle erstellten Inhalte wurden verstanden, geprüft und im Kontext der Aufgabenstellung angepasst.

---

## 👨‍💻 Entwickler

- **Name:** Kevin Bürger
- **Matrikelnummer:** s86415
- **Studiengang:** IA23

---

## 📌 Weiterentwicklungsideen

- Speicherung des Fortschritts im `localStorage`
- Mehrnutzerbetrieb mit Logins
- Kategorie Notenlernen mit Web Audio API + virtueller Klaviatur
- REST-API vollständig integrieren (inkl. Antwortvalidierung)
