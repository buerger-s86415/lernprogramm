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
            {
                frage: "x² * x²",
                antworten: ["x²", "x²²", "4x²", "x⁴"],
                loesung: 3
            },
            {
                frage: "2 + 2",
                antworten: ["3", "4", "5", "2"],
                loesung: 1
            }
        ];
    }

    getTask(nr) {
        return this.fragen[nr % this.fragen.length]; // zyklisch
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
        this.setTask(); // nächste Frage
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
