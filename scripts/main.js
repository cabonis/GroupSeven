import EventBus from './eventbus.js'
import Slider from './slider.js';
import UsMap from './usmap.js'; 
import GaugeFactory from './gauge.js'; 
import BarChart from './barchart.js';

let slider = new Slider("date-slider");

let map = new UsMap("hotspots");

let gaugeFactory = new GaugeFactory();
let gauge1 = gaugeFactory.createGauge("cases");
let gauge2 = gaugeFactory.createGauge("deaths");
let gauge3 = gaugeFactory.createGauge("vaccines");
let gauge4 = gaugeFactory.createGauge("hospitals");

let barchart = new BarChart("vaccinations");


// Event bus test
EventBus.subscribe("DateChanged", (date) => {
    gauge1.Percent = Math.random();
    gauge2.Percent = Math.random();
    gauge3.Percent = Math.random();
    gauge4.Percent = Math.random();

    barchart.update([
        {name:"1st Dose", value: Math.random() * 100},
        {name:"2nd Dose", value: Math.random() * 100},
        {name:"Booster", value: Math.random() * 100}]
    );
});