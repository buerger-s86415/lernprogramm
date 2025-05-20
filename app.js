"use strict";

document.addEventListener('DOMContentLoaded', () => {
    const model = new Model();
    const presenter = new Presenter();
    const view = new View(presenter);
    presenter.setModelAndView(model, view);
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
        if (korrekt) {
            this.stats.richtig++;
        } else {
            this.stats.falsch++;
        }
        console.log(`Richtig: ${this.stats.richtig}, Falsch: ${this.stats.falsch}`);
        this.currentIndex++;
        setTimeout(() => this.setTask(), 500);
        return korrekt;
    }

    resetStats() {
        this.currentIndex = 0;
        this.stats.richtig = 0;
        this.stats.falsch = 0;
    }
}


// ##################### View ####################
class View {
    constructor(presenter) {
        this.p = presenter;
        this.setHandlers();
        this.hasStarted = false;
    }

    setHandlers() {
        document.getElementById("antworten").addEventListener("click", this.checkEvent.bind(this), false);
        document.getElementById("start").addEventListener("click", this.start.bind(this), false);
        this.lastKategorie = document.querySelector('input[name="kategorie"]:checked').value;
        document.querySelectorAll('input[name="kategorie"]').forEach(radio => {
            radio.addEventListener("change", this.onKategorieChange.bind(this));
        });
    }

    async start() {
        this.hasStarted = true;
        document.getElementById("aufgabe").classList.add("visible");
        document.getElementById("start").style.display = "none";
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
            buttons.forEach(btn => btn.textContent = "");

        } else {
            // Änderung rückgängig machen
            const radios = document.querySelectorAll('input[name="kategorie"]');
            radios.forEach(r => {
                if (r.value === this.lastKategorie) r.checked = true;
            });
        }
    }
}