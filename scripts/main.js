import EventBus from './eventbus.js'
import Slider from './slider.js';
import UsMap from './usmap.js'; 
import GaugeFactory from './gauge.js'; 

let slider = new Slider("date-slider");

let map = new UsMap("hotspots");

let gaugeFactory = new GaugeFactory();
let gauge1 = gaugeFactory.createGauge("cases");
let gauge2 = gaugeFactory.createGauge("deaths");
let gauge3 = gaugeFactory.createGauge("vaccines");
let gauge4 = gaugeFactory.createGauge("hospitals");

// Event bus test
EventBus.subscribe("DateChanged", (date) => {
    document.getElementById("selected-date").innerHTML = date;
    gauge1.percent = Math.random();
    gauge2.percent = Math.random();
    gauge3.percent = Math.random();
    gauge4.percent = Math.random();
});