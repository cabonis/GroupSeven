import {EventBus} from './framework.js';

class DataProvider {

}


export default class TestDataProvider {

    #uiElements;
    #counties = [];
    #hotspots = [];

    constructor(uiElements) {
        this.#uiElements = uiElements;
    }

    #randomNumber(min, max, round = true) {
        const rand = Math.random() * (max - min) + min;
        if(round) {
            return Math.round(rand);
        }

        return rand;
    }

    #randomGaugeData() {
        const value = Math.random();
        const multiplier = this.#randomNumber(.85, 1.15, false);
        return {
            daily: value,
            average: value * multiplier
        }
    }

    #randomBarData() {
        return [
            {name:"1st Dose", value: Math.random() * 100},
            {name:"2nd Dose", value: Math.random() * 100},
            {name:"Booster", value: Math.random() * 100}
        ];
    }

    #randomizeHotspots() {
    
        let hotSpotsToAdd = this.#randomNumber(0, 25);
        let hotSpotsToRemove = this.#randomNumber(0, this.#hotspots.length)

        for(let i = 0; i < hotSpotsToRemove; i++) {
            this.#hotspots.shift();
        }

        for(let i = 0; i < hotSpotsToAdd; i++) {
            let id = this.#randomNumber(0, this.#counties.length - 1);
            this.#hotspots.push(this.#counties[id]);
        }

        return this.#hotspots;
    }

    #pushRandomData(){
        this.#uiElements.map.update(this.#randomizeHotspots());
        this.#uiElements.chart.update(this.#randomBarData());
        this.#uiElements.gauges.forEach(g => g.update(this.#randomGaugeData()));
    }

    initialize() {

        d3.json("./data/us.json").then(us => {

            const counties = topojson.feature(us, us.objects.counties).features;
            counties.forEach(c => this.#counties.push(c.id));

            this.#uiElements.timecontrol.updateTimeRange([new Date(Date.parse("2020-01-01T00:00:00")), new Date()]);

            this.#pushRandomData();

            EventBus.subscribe("DateChanged", () => {
                this.#pushRandomData();
            });
        });
    }
}