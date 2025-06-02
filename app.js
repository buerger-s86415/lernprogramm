"use strict";

document.addEventListener('DOMContentLoaded', () => {
    const model = new Model();
    const presenter = new Presenter();
    const view = new View(presenter);
    presenter.setModelAndView(model, view);

    //initial erst prüfen
    updateOnlineStatus();
    //danach über EL
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
});


// #################### Model ####################
class Model {
    constructor() {
        this.alleFragen = null;
        this.zufallsFragen = {};
    }

    async loadLocalQuestions() {
        const res = await fetch("data/fragen.json");
        this.alleFragen = await res.json();
    }

    getLocalTask(kategorie, nr) {
        if (!this.zufallsFragen[kategorie]) {
            const original = this.alleFragen[kategorie];
            this.zufallsFragen[kategorie] = this.shuffle([...original]);
        }

        const fragen = this.zufallsFragen[kategorie];
        if(!fragen || this.alleFragen === 0) return null;

        const aufgabe = fragen[nr % fragen.length];

        if (kategorie === "quiz"){
            return {
                frage: aufgabe.question,
                antworten: aufgabe.options,
                id: aufgabe.id
            };
        }

        const { gemischt, loesungIndex } = this.mischeAntworten(aufgabe.l);
        return {
            frage: aufgabe.a,
            antworten: gemischt,
            loesung: loesungIndex
        };
    }

    mischeAntworten(antworten) {
        const korrekt = antworten[0];
        const gemischt = [...antworten]
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(entry => entry.value);
        const loesungIndex = gemischt.indexOf(korrekt);
        return { gemischt, loesungIndex };
    }

    async checkAnswer(task, chosenIndex, kategorie) {
        if (kategorie === "quiz") {
            const response = await fetch(`https://idefix.informatik.htw-dresden.de/webquiz/api/quizzes/${task.id}/solve`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Basic" + btoa("s86415:IchWohneGanzObenSeit-2023")
                },
                body: JSON.stringify([chosenIndex])
            });

            const result = await response.json();
            return result.correct === true;
        } else {
            return task.loesung === chosenIndex;
        }
    }

    async loadQuizTasks() {
        const res = await fetch("https://idefix.informatik.htw-dresden.de/webquiz/api/quizzes", {
            headers: {
                "Authorization": "Basic" + btoa("s86415:IchWohneGanzObenSeit-2023")
            }
        });

        if(!res.ok) throw new Error("Antowrt nicht OK");

        const quizzes = await res.json();
        console.log("GELADEN:", quizzes);
        this.alleFragen["quiz"] = quizzes.slice(0, 15);
    } catch (err){
        console.error("Fehler beim Laden der Quiz Aufgaben: ", err);
        alert("Quiz-Server nicht erreichbar");
        this.alleFragen["quiz"] = []; // nur leer machen zur sicherheit
    }

    shuffle(array) {
        return array
            .map(item => ({ sort: Math.random(), value: item }))
            .sort((a, b) => a.sort - b.sort)
            .map(entry => entry.value);
    }
}

// ################ Presenter ###################
class Presenter {
    constructor() {
        this.currentIndex = 0;
        this.maxFragen = 15;
        this.stats = {
            richtig: 0,
            falsch: 0
        };
    }

    setModelAndView(m, v) {
        this.m = m;
        this.v = v;
    }

    async setTask() {
        const kategorie = document.querySelector('input[name="kategorie"]:checked').value;

        if (!this.m.alleFragen) {
            this.m.alleFragen = {};
        }

        if(kategorie === "quiz" && !this.m.alleFragen.quiz) {
            await this.m.loadQuizTasks();
        } else if (!this.m.alleFragen[kategorie]) {
            await this.m.loadLocalQuestions();
        }

        this.task = this.m.getLocalTask(kategorie, this.currentIndex);
        this.v.renderText(this.task.frage, kategorie);
        this.v.renderButtons(this.task.antworten);
    }

    async checkAnswer(index) {
        const kategorie = document.querySelector('input[name="kategorie"]:checked').value;

        if(!this.task){
            console.warn("Keine Aufgabe geladen");
            return false;
        }

        const korrekt = await this.m.checkAnswer(this.task, index, kategorie);
        const gesamt = this.stats.richtig + this.stats.falsch + 1;

        if (korrekt) {
            this.stats.richtig++;
        } else {
            this.stats.falsch++;
        }
        console.log(`Richtig: ${this.stats.richtig}, Falsch: ${this.stats.falsch}, gesamt: ${gesamt}`);
        this.currentIndex++;
        this.v.updateProgressBar(this.stats.richtig, this.stats.falsch);
        
        if (this.currentIndex >= this.maxFragen) {
            this.v.showStats(this.stats);
            this.saveStats();
            return;
        } else {
            setTimeout(() => this.setTask(), 500);
        }
        return korrekt;
    }

    resetStats() {
        this.currentIndex = 0;
        this.stats.richtig = 0;
        this.stats.falsch = 0;
    }

    saveStats() {
        const gesamt = this.stats.richtig + this.stats.falsch;
        const eintrag = {
            zeit: new Date().toLocaleString(),
            richtig: this.stats.richtig,
            falsch: this.stats.falsch,
            gesamt: gesamt
        };

        const daten = JSON.parse(localStorage.getItem("statistiken") || "[]");
        daten.push(eintrag);
        localStorage.setItem("statistiken", JSON.stringify(daten));
    }

}

// ##################### View ####################
class View {
    constructor(presenter) {
        this.p = presenter;
        this.setHandlers();
        this.hasStarted = false;
        this.inProgress = false;
        this.isFinished = false;
        this.lastKategorie = document.querySelector('input[name="kategorie"]:checked').value;

        document.querySelectorAll('input[name="kategorie"]').forEach(radio => {
            radio.addEventListener("change", this.onKategorieChange.bind(this));
        });
    }

    setHandlers() {
        document.getElementById("antworten").addEventListener("click", this.checkEvent.bind(this), false);
        document.getElementById("start").addEventListener("click", this.start.bind(this), false);
        document.getElementById("nav-statistik").addEventListener("click", this.showAllStats.bind(this));
        document.getElementById("nav-home").addEventListener("click", this.showStartScreen.bind(this));
        document.getElementById("nav-hilfe").addEventListener("click", this.showHelp.bind(this));
        document.getElementById("nav-info").addEventListener("click", this.showAbout.bind(this));
        this.lastKategorie = document.querySelector('input[name="kategorie"]:checked').value;
        document.querySelectorAll('input[name="kategorie"]').forEach(radio => {
            radio.addEventListener("change", this.onKategorieChange.bind(this));
        });
    }

    async start() {
        this.p.resetStats();
        this.updateProgressBar(0, 0);
        this.hasStarted = true;
        this.inProgress = true;
        this.isFinished = false;

        document.getElementById("aufgabe").classList.add("visible");
        document.getElementById("aufgabe").style.display = "block";
        document.getElementById("start").style.display = "none";
        document.getElementById("statistikbereich").style.display = "none";
        document.getElementById("feedback").textContent = "";
        document.getElementById("fortschritt").style.display = "block";
        document.getElementById("hilfebereich").style.display = "none";


        const antwortContainer = document.getElementById("antworten");
        antwortContainer.innerHTML = `
        <button></button>
        <button></button>
        <button></button>
        <button></button>
        `;

        await this.p.setTask();
    }

    renderText(text, kategorie) {
        const frageDiv = document.getElementById("frage");
        if (kategorie === "mathe" && typeof katex !== "undefined") {
            katex.render(text, frageDiv, { throwOnError: false });
        } else {
            frageDiv.textContent = text;
        }
    }

    renderButtons(antworten) {
        const kategorie = document.querySelector('input[name="kategorie"]:checked').value;
        const buttons = document.querySelectorAll("#antworten button");

        if(buttons.length < antworten.length) return;

        antworten.forEach((text, i) => {
            buttons[i].setAttribute("data-index", i);

            if (kategorie === "mathe" && typeof katex !== "undefined") {
                buttons[i].innerHTML = ""; // leeren
                katex.render(text, buttons[i], { throwOnError: false });
            } else {
                buttons[i].textContent = text;
            }
        });
    }

    checkEvent(event) {
        if (event.target.nodeName === "BUTTON") {
            const index = Number(event.target.getAttribute("data-index"));
            const button = event.target;
            
            this.p.checkAnswer(index).then(isCorrect => {
                //Farbe
                const className = isCorrect ? "correct" : "wrong";
                button.classList.add(className);

                //kurz warten, dann weiter
                setTimeout(()=>{
                    button.classList.remove(className);
                }, 500);
            });
        }
    }

    onKategorieChange(event) {
        const neueKategorie = event.target.value;

        if (!this.hasStarted || this.isFinished) {
            // Wenn kein Durchlauf aktiv, letzte Auswahl merken
            this.lastKategorie = neueKategorie;
            this.showStartScreen(true);
            return;
        }

        const confirmed = confirm("Bei Kategorieänderung wird der Fortschritt zurückgesetzt. Fortfahren?");
        if (confirmed) {
            this.p.resetStats(); // Statistik zurücksetzen
            this.lastKategorie = neueKategorie;
            this.showStartScreen(true);
        } else {
            // Auswahl rückgängig machen
            const radios = document.querySelectorAll('input[name="kategorie"]');
            radios.forEach(r => {
                r.checked = (r.value === this.lastKategorie);
            });
        }
    }

    showStats(stats) {
        const frageDiv = document.getElementById("frage");
        const feedback = document.getElementById("feedback");
        const antworten = document.getElementById("antworten");
        const gesamt = stats.richtig + stats.falsch;

        frageDiv.textContent = "Lektion beendet.";
        antworten.innerHTML = "";
        feedback.textContent = `✅ ${stats.richtig} / ❌ ${stats.falsch} von insgesamt ${gesamt} Fragen`;
        document.getElementById("start").style.display = "inline-block";

        
        this.hasStartet = false;
        this.inProgress = false;
        this.isFinished = true;
    }

    showAllStats() {
        const daten = JSON.parse(localStorage.getItem("statistiken") || "[]");

        // Sichtbarkeit umschalten
        document.getElementById("aufgabe").style.display = "none";
        document.getElementById("start").style.display = "none";
        document.getElementById("statistikbereich").style.display = "block";
        document.getElementById("kategorien").style.display = "none";
        document.getElementById("fortschritt").style.display = "none";
        document.getElementById("hilfebereich").style.display = "none";
        document.getElementById("ueberbereich").style.display = "none";

        const container = document.getElementById("statistikliste");
        container.innerHTML = daten.length === 0
            ? "<p>Keine Statistiken vorhanden.</p>"
            : daten
            .slice()
            .reverse()            
            .map(entry =>
                `<p>🕒 ${entry.zeit}: ✅ ${entry.richtig} / ❌ ${entry.falsch}</p>`
            ).join("");
    }

    showStartScreen(skipConfirm = false) {
        if (this.inProgress && !skipConfirm) {
            const confirmed = confirm("Dein Lernfortschritt geht verloren. Fortfahren?");
            if (!confirmed) return;
        }

        this.p.resetStats();
        this.hasStarted = false;
        this.inProgress = false;

        document.getElementById("aufgabe").classList.remove("visible");
        document.getElementById("aufgabe").style.display = "none";
        document.getElementById("kategorien").style.display = "flex";
        document.getElementById("fortschritt").style.display = "block";
        document.getElementById("start").style.display = "inline-block";
        document.getElementById("statistikbereich").style.display = "none";
        document.getElementById("hilfebereich").style.display = "none";
        document.getElementById("ueberbereich").style.display = "none";
        document.getElementById("frage").textContent = "";
        document.getElementById("feedback").textContent = "";

        const buttons = document.querySelectorAll("#antworten button");
        buttons.forEach(btn => btn.textContent = "");

        // Kategorie zurücksetzen auf letzte auswahl
        const radios = document.querySelectorAll('input[name="kategorie"]');
        radios.forEach(r => r.checked = (r.value === this.lastKategorie));
    }

    showHelp() {
        this.hasStarted = false;
        this.inProgress = false;

        document.getElementById("aufgabe").style.display = "none";
        document.getElementById("statistikbereich").style.display = "none";
        document.getElementById("kategorien").style.display = "none";
        document.getElementById("fortschritt").style.display = "none";
        document.getElementById("start").style.display = "none";
        document.getElementById("hilfebereich").style.display = "block";
        document.getElementById("ueberbereich").style.display = "none";

        // Falls Feedback noch da ist
        document.getElementById("feedback").textContent = "";
    }
    
    showAbout() {
        this.hasStarted = false;
        this.inProgress = false;

        document.getElementById("aufgabe").style.display = "none";
        document.getElementById("statistikbereich").style.display = "none";
        document.getElementById("kategorien").style.display = "none";
        document.getElementById("fortschritt").style.display = "none";
        document.getElementById("start").style.display = "none";
        document.getElementById("hilfebereich").style.display = "none";

        document.getElementById("ueberbereich").style.display = "block";
        document.getElementById("feedback").textContent = "";
    }

    updateProgressBar(richtig, falsch) {
        const gesamt = richtig + falsch;
        const total = 15;

        const grün = (richtig / total) * 100;
        const rot = (falsch / total) * 100;
        const grau = 100 - grün - rot;

        const barGrün = document.querySelector(".bar-green");
        const barRot = document.querySelector(".bar-red");
        const barGrau = document.querySelector(".bar-grey");

        barGrün.style.width = `${grün}%`;
        barRot.style.width = `${rot}%`;
        barGrau.style.width = `${grau}%`;
    }
}

function updateOnlineStatus() {
    const icon = document.querySelector(".status-icon");
    const title = document.querySelector("aside h3");

    if (navigator.onLine) {
        icon.textContent = "📶";
        title.textContent = "Online";
    } else {
        icon.textContent = "❌";
        title.textContent = "Offline";
    }
}
