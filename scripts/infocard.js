export default class InfoCard {

    constructor(id, title) {

        this.settingsId = id + "-settings";
        this.contentId = id + "-content";

        const cardTemplate = `
        <div class="card infocard h-100">
            <div class="card-header py-0">
                <div class="row">
                    <div class="col-10 pt-1">
                        <h5>${title}</h5>
                    </div>
                    <div class="col-2 p-0">
                        <button class="bi-gear-fill float-end" id="${this.settingsId}"></button>
                    </div>
                </div>
            </div>                                        
            <div class="card-body" id="${this.contentId}"></div>
        </div>
        `;

        document.getElementById(id).innerHTML = cardTemplate;
        //document.getElementById(this.settingsId).addEventListener("click", () => {});
    }
}