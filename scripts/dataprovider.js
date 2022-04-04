import EventBus from './eventbus.js'

class DataProvider {

}


export default class TestDataProvider {

    #uiElements;
    #counties = [];
    #hotspots = [];

    constructor(uiElements) {
        this.#uiElements = uiElements;
    }

    #randomBarData() {
        return [
            {name:"1st Dose", value: Math.random() * 100},
            {name:"2nd Dose", value: Math.random() * 100},
            {name:"Booster", value: Math.random() * 100}
        ];
    }

    #randomizeHotspots() {

        let randomNumber = (min, max) => Math.round(Math.random() * (max - min) + min);
    
        let hotSpotsToAdd = randomNumber(0, 25);
        let hotSpotsToRemove = randomNumber(0, this.#hotspots.length)

        for(let i = 0; i < hotSpotsToRemove; i++) {
            this.#hotspots.shift();
        }

        for(let i = 0; i < hotSpotsToAdd; i++) {
            let id = randomNumber(0, this.#counties.length - 1);
            this.#hotspots.push(this.#counties[id]);
        }

        return this.#hotspots;
    }

    #pushRandomData(){
        this.#uiElements.map.update(this.#randomizeHotspots());
        this.#uiElements.chart.update(this.#randomBarData());
        this.#uiElements.gauges.forEach(g => g.update(Math.random()));
    }

    initialize() {

        d3.json("./data/us.json").then(us => {

            const counties = topojson.feature(us, us.objects.counties).features;
            counties.forEach(c => this.#counties.push(c.id));

            this.#uiElements.slider.updateTimeRange([new Date(Date.parse("2020-01-01T00:00:00")), new Date()]);

            this.#pushRandomData();

            EventBus.subscribe("DateChanged", () => {
                this.#pushRandomData();
            });
        });
    }
}