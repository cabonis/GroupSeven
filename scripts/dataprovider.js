import {EventBus} from './framework.js';

class DataProvider {

}


export default class TestDataProvider {

    #uiElements;
    #counties = [];
    #hotspots = [];
    #gauges = [];

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

    #randomizeGaugeData(i) {

        const lastValue = this.#gauges[i];
        let newValue = 0;

        if(lastValue) {
            const valueDelta = this.#randomNumber(0, .1, false);
            const sign = (this.#randomNumber(0, 1) >= .5) ? 1 : -1;
            newValue = lastValue + (valueDelta * sign);
            
            if(newValue > 1) {
                newValue = 1;
            }
            if(newValue < 0) {
                newValue = 0;
            }
        }
        else {
            newValue = Math.random();
        }

        this.#gauges[i] = newValue;

        const averageMultiplier = this.#randomNumber(.9, 1.1, false);
        return {
            daily: newValue,
            average: newValue * averageMultiplier
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
        this.#uiElements.gauges.forEach((g, i) => g.update(this.#randomizeGaugeData(i)));
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