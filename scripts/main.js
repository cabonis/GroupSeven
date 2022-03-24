
import UsMap from './usmap.js'; 
import GaugeFactory from './gauge.js'; 

let map = new UsMap("hotspots");

let factory = new GaugeFactory();
let defaults = factory.getDefaultConfig();

let gauge1 = factory.createGauge("cases", defaults);
let gauge2 = factory.createGauge("deaths", defaults);
let gauge3 = factory.createGauge("vaccines", defaults);
let gauge4 = factory.createGauge("secondVaccines", defaults);

setInterval(() => {
    gauge1.percent = Math.random();
    gauge2.percent = Math.random();
    gauge3.percent = Math.random();
    gauge4.percent = Math.random();
}, 1000);