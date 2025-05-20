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
        this.setTask();
    }
}


// ##################### View ####################
class View {
    constructor(presenter) {
        this.p = presenter;
        this.setHandlers();
    }

    setHandlers() {
        document.getElementById("antworten").addEventListener("click", this.checkEvent.bind(this), false);
        document.getElementById("start").addEventListener("click", this.start.bind(this), false);
    }

    async start() {
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
            this.p.checkAnswer(index);
        }
    }
}