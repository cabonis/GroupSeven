export class InfoCard {

    constructor(id, title, settingsDialogGenerator = null, settingsProcessor = null) {

        const settingsId = id + "-settings";
        this.contentId = id + "-content";

        const cardTemplate = `
        <div class="card infocard h-100">
            <div class="card-header py-0">
                <div class="row">
                    <div class="col-10 pt-1">
                        <h5>${title}</h5>
                    </div>
                    <div class="col-2 p-0">
                        <button class="bi-gear-fill float-end" id="${settingsId}"></button>
                    </div>
                </div>
            </div>                                        
            <div class="card-body" id="${this.contentId}"></div>
        </div>`;

        const div = document.createElement("div");
        div.innerHTML = cardTemplate;
        document.getElementById(id).appendChild(div);
        
        const settingsButton = div.querySelector(`#${settingsId}`)
        if(settingsDialogGenerator && settingsProcessor) {
            settingsButton.addEventListener("click", () => {
                new Modal(title + " Settings", settingsDialogGenerator, settingsProcessor);
            });
        }
        else{
            settingsButton.classList.add("d-none");
        }
    }    
}

export class ChartSvg {
    
    #width;
    #height;
    #margin;
    #chart;
    #svg;
    #animationDuration = 500;

    constructor(id, width, height, margin) {

        this.#svg = d3.select("#" + id)
            .append("svg")
            .attr("viewBox", `0, 0, ${width + margin.right + margin.left}, ${height + margin.top + margin.bottom}`); 
        
        this.#chart = this.#svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        this.#width = width;
        this.#height = height;
        this.#margin = margin;
    }

    get chart() {
        return this.#chart;
    }           

    get width() {
        return this.#width;
    }

    get height() {
        return this.#height;
    }

    get margin() {
        return this.#margin;
    }

    get animationDuration() {
        return this.#animationDuration;
    }

    remove() {
        this.#svg.remove();
    }
}

class Modal {

    constructor(title, dialogGenerator, settingsProcessor) {

        const modalTemplate = `
        <div class="modal fade" tabindex="-1" data-bs-backdrop="static" id="settings-modal">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">${title}</h5>
              </div>
              <div class="modal-body" id="settings-content"></div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
              </div>
            </div>
          </div>
        </div>`;

        const div = document.createElement("div");
        div.innerHTML = modalTemplate;
        
        const settingsContent = div.querySelector("#settings-content")
        const settingsDialog = dialogGenerator();
        settingsContent.appendChild(settingsDialog);

        document.body.appendChild(div);

        const modalElement = div.querySelector("#settings-modal")
        modalElement.addEventListener('hidden.bs.modal', onClosed);

        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        function onClosed(){
            modalElement.removeEventListener('hidden.bs.modal', onClosed);
            settingsProcessor(modalElement);
            modal.dispose();
            div.remove();
        }
    }
}

export class EventBus {

    static #subscriptions = {}

    static subscribe(eventType, callback) {

        if(!this.#subscriptions[eventType]) {
            this.#subscriptions[eventType] = [];
        }

        this.#subscriptions[eventType].push(callback);
    }

    static publish(eventType, arg) {

        if(!this.#subscriptions[eventType]) {
            return;
        }

        Object.values(this.#subscriptions[eventType]).forEach(callback => callback(arg));
    }
}

