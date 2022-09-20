import {ViewBase} from "../../src/view/view-base.js";

export default class Case extends ViewBase {
    preLoad() {
        this.setProperty("age", 20);
    }


    getHTMLPath(repoName, displayType) {
        return `/templates/designer-repo/${repoName}-${displayType}.html`;
    }

    async updateContent() {
        const file = this.getHTMLPath(this.dataset.repo, this.getProperty("displayType"))
        const html = await fetch(file).then(result => result.text);
        const ul = this.querySelector("ul");
        ul.innerHTML = html;
    }
}