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
        this.fragen = [
            { frage: "x² * x²", antworten: ["x⁴", "x²", "4x²", "x²²"] },
            { frage: "2 + 2", antworten: ["4", "3", "5", "2"] },
            { frage: "5 * 6", antworten: ["30", "11", "56", "35"] },
            { frage: "Wurzel aus 49", antworten: ["7", "6", "8", "9"] },
            { frage: "3³", antworten: ["27", "9", "81", "12"] },
            { frage: "10 / 2", antworten: ["5", "2", "10", "0.2"] },
            { frage: "x^2 + 2x + 1 = ?", antworten: ["(x+1)²", "x³", "x²", "x+1"] },
            { frage: "a² + b² = ?", antworten: ["c²", "2ab", "a²b²", "a+b"] },
            { frage: "sin(90°)", antworten: ["1", "0", "0.5", "√2/2"] },
            { frage: "log₁₀(100)", antworten: ["2", "10", "1", "0.01"] }
        ];
    }

    getTask(nr) {
        const aufgabe = this.fragen[nr % this.fragen.length];
        const { gemischt, loesungIndex } = this.mischeAntworten(aufgabe.antworten);
        return {
            frage: aufgabe.frage,
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

    setTask() {
        this.task = this.m.getTask(this.currentIndex);
        this.v.renderText(this.task.frage);
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

    start() {
        this.p.setTask();
    }

    renderText(text) {
        const frageDiv = document.getElementById("frage");
        frageDiv.textContent = text;
    }

    renderButtons(antworten) {
        const buttons = document.querySelectorAll("#antworten button");
        antworten.forEach((text, i) => {
            buttons[i].textContent = text;
            buttons[i].setAttribute("data-index", i);
        });
    }

    checkEvent(event) {
        if (event.target.nodeName === "BUTTON") {
            const index = Number(event.target.getAttribute("data-index"));
            this.p.checkAnswer(index);
        }
    }
}