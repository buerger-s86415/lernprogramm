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
    }

    async loadLocalQuestions() {
        const res = await fetch("data/fragen.json");
        this.alleFragen = await res.json();
    }

    getLocalTask(kategorie, nr) {
        const fragen = this.alleFragen[kategorie];
        const aufgabe = fragen[nr % fragen.length];
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

    checkAnswer(task, chosenIndex) {
        return task.loesung === chosenIndex;
    }
}

// ################ Presenter ###################
class Presenter {
    constructor() {
        this.currentIndex = 0;
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
            await this.m.loadLocalQuestions();
        }

        this.task = this.m.getLocalTask(kategorie, this.currentIndex);
        this.v.renderText(this.task.frage, kategorie);
        this.v.renderButtons(this.task.antworten);
    }

    checkAnswer(index) {
        const korrekt = this.m.checkAnswer(this.task, index);
        const gesamt = this.stats.richtig + this.stats.falsch + 1;
        if (korrekt) {
            this.stats.richtig++;
        } else {
            this.stats.falsch++;
        }
        console.log(`Richtig: ${this.stats.richtig}, Falsch: ${this.stats.falsch}, gesamt: ${gesamt}`);
        this.currentIndex++;
        
        if (this.currentIndex >= 3) {
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
        this.lastKategorie = document.querySelector('input[name="kategorie"]:checked').value;
        document.querySelectorAll('input[name="kategorie"]').forEach(radio => {
            radio.addEventListener("change", this.onKategorieChange.bind(this));
        });
    }

    async start() {
        this.hasStarted = true;
        this.inProgress = true;

        document.getElementById("aufgabe").classList.add("visible");
        document.getElementById("aufgabe").style.display = "block";
        document.getElementById("start").style.display = "none";
        document.getElementById("statistikbereich").style.display = "none";
        document.getElementById("fortschritt").style.display = "block";

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
            const isCorrect = this.p.checkAnswer(index); //true oder false
            
            //Farbe
            const className = isCorrect ? "correct" : "wrong";
            button.classList.add(className);

            //kurz warten, dann weiter
            setTimeout(()=>{
                button.classList.remove(className);
            }, 500);
        }
    }

    onKategorieChange(event) {
        if(!this.hasStarted){
            //wenn kein start, dann keine abfrage
            this.lastKategorie = event.target.value;
            return;
        }

        const confirmed = confirm("Bei Kategorieänderung wird der Fortschritt zurückgesetzt. Fortfahren?");
        if (confirmed) {
            // Zurücksetzen
            this.p.resetStats();
            this.lastKategorie = event.target.value;
            this.hasStarted = false;

            // UI zurücksetzen
            document.getElementById("aufgabe").classList.remove("visible");
            document.getElementById("start").style.display = "inline-block";
            document.getElementById("frage").textContent = "";

            const buttons = document.querySelectorAll("#antworten button");
            buttons.forEach(btn => btn.innerHTML);

        } else {
            // Änderung rückgängig machen
            const radios = document.querySelectorAll('input[name="kategorie"]');
            radios.forEach(r => {
                if (r.value === this.lastKategorie) r.checked = true;
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
        document.getElementById("start").style.display = "inline.block";

        
        this.hasStartet = false;
        this.inProgress = false;
    }

    showAllStats() {
        const daten = JSON.parse(localStorage.getItem("statistiken") || "[]");

        // Sichtbarkeit umschalten
        document.getElementById("aufgabe").style.display = "none";
        document.getElementById("start").style.display = "none";
        document.getElementById("statistikbereich").style.display = "block";
        document.getElementById("kategorien").style.display = "none";
        document.getElementById("fortschritt").style.display = "none";

        const container = document.getElementById("statistikliste");
        container.innerHTML = daten.length === 0
            ? "<p>Keine Statistiken vorhanden.</p>"
            : daten.map(entry =>
                `<p>🕒 ${entry.zeit}: ✅ ${entry.richtig} / ❌ ${entry.falsch}</p>`
            ).join("");
    }

    showStartScreen() {
        if (this.inProgress) {
            const confirmed = confirm("Dein Lernfortschritt geht verloren. Fortfahren?");
            if (!confirmed) return;
            this.p.resetStats();
        }

        this.hasStarted = false;
        this.inProgress = false;

        document.getElementById("aufgabe").classList.remove("visible");
        document.getElementById("aufgabe").style.display = "none";
        document.getElementById("kategorien").style.display = "flex";
        document.getElementById("fortschritt").style.display = "block";
        document.getElementById("start").style.display = "inline-block";
        document.getElementById("statistikbereich").style.display = "none";

        document.getElementById("frage").textContent = "";
        document.getElementById("feedback").textContent = "";

        const buttons = document.querySelectorAll("#antworten button");
        buttons.forEach(btn => btn.textContent = "");

        // Kategorie zurücksetzen auf letzte auswahl
        const radios = document.querySelectorAll('input[name="kategorie"]');
        radios.forEach(r => r.checked = (r.value === this.lastKategorie));
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
