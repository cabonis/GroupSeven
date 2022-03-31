class InfoCard {

    constructor(id, title) {

        const settings = id + "-settings";
        const content = id + "-content";
        
        const cardTemplate = `
        <div class="card h-100">
            <div class="card-header container-fluid">
                <div class="row">
                    <div class="col">
                        <h5>${title}</h5>
                    </div>
                    <div class="col-2">
                        <button class="bi-gear-fill float-right" id="${settings}"></button>
                    </div>
                </div>
            </div>                                        
            <div class="card-body" id="${content}"></div>
        </div>`;

        document.getElementById(id).innerHTML = cardTemplate;
        document.getElementById(content).innerHTML = this.#showConent();
        document.getElementById(settings).addEventListener("click", () => this.#doSomething());
    }

    #doSomething() {
    }

    #showConent() {
        if(this.getConent) {
            return this.getConent();
        }
        return "";
    }
}

export default class GaugeCard extends InfoCard {

    constructor(id) {
        super(id, "Cases");
    }

    getConent() {
        return `
        <a href="#Foo" class="btn btn-default" data-toggle="collapse">Toggle Foo</a>
        <div id="Foo" class="collapse">
            This div (Foo) is hidden by default
        </div>
        <div id="Foo" class="collapse in">
            This div (Bar) is shown by default and can toggle
        </div>
        `;
    }

}