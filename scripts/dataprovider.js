import {EventBus} from './framework.js';

class DataProvider {

}


export default class TestDataProvider {

    #uiElements;
    #counties = [];
    #hotspots = [];
    #gauges = [];
    #vaccineScales = {}

    constructor(uiElements) {
        this.#uiElements = uiElements;

        this.#vaccineScales.dose1 = d3.scaleTime()
        .domain([new Date(Date.parse("2020-12-11T00:00:00")), new Date()])
        .range([0, 87])
        .clamp(true);

        this.#vaccineScales.dose2 = d3.scaleTime()
        .domain([new Date(Date.parse("2021-01-01T00:00:00")), new Date()])
        .range([0, 85])
        .clamp(true);

        this.#vaccineScales.booster = d3.scaleTime()
        .domain([new Date(Date.parse("2021-10-20T00:00:00")), new Date()])
        .range([0, 72])
        .clamp(true);
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

    #randomVaccineDataTrend(start) {     
        var self = this;

        function randomVaccineData(date) {
            return [
                {name:"1st Dose", date:date, value: self.#vaccineScales.dose1(date)},
                {name:"2nd Dose", date:date, value: self.#vaccineScales.dose2(date)},
                {name:"Booster", date:date, value: self.#vaccineScales.booster(date)}
            ];
        }

        let minusOneMonth = new Date(start.valueOf());
        minusOneMonth.setMonth(start.getMonth() - 1);
        let minusTwoMonths = new Date(start.valueOf())
        minusTwoMonths.setMonth(start.getMonth() - 2);

        let data1 = randomVaccineData(start);
        let data2 = randomVaccineData(minusOneMonth);
        let data3 = randomVaccineData(minusTwoMonths);
        return data1.concat(data2).concat(data3);
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

    #pushRandomData(date){
        this.#uiElements.map.update(this.#randomizeHotspots());
        this.#uiElements.chart.update(this.#randomVaccineDataTrend(date));
        this.#uiElements.gauges.forEach((g, i) => g.update(this.#randomizeGaugeData(i)));
    }

    initialize() {

        d3.json("./data/us.json").then(us => {

            const counties = topojson.feature(us, us.objects.counties).features;
            counties.forEach(c => this.#counties.push(c.id));

            let start = new Date(Date.parse("2020-01-01T00:00:00"));
            let end = new Date();

            this.#uiElements.timecontrol.updateTimeRange([start, end]);

            this.#pushRandomData(start);

            EventBus.subscribe("DateChanged", (date) => {
                this.#pushRandomData(date);
            });
        });
    }
}