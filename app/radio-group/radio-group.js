import {ViewBase} from "../../src/view/view-base.js";

export default class RadioGroup extends ViewBase {
    preLoad() {
        this.setProperty("people", [
            {
                id: 1,
                title: "John",
                value: 1
            },
            {
                id: 2,
                title: "Samantha",
                value: 2,
                selected: true
            },
            {
                id: 3,
                title: "Rodger",
                value: 3
            },
            {
                id: 4,
                title: "Mike",
                value: 4
            }
        ])

        this.setProperty("selectedPerson", 2);

        this.setProperty("animals", [
            {
                id: 1,
                title: "Dog",
                value: 1
            },
            {
                id: 2,
                title: "Cat",
                value: 2
            },
            {
                id: 3,
                title: "Rat",
                value: 3
            },
            {
                id: 4,
                title: "Donkey",
                value: 4
            }
        ])

        this.setProperty("selectedAnimal", 4);
    }

    load() {
        super.load();
    }
}