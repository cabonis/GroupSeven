
import UsMap from './usmap.js'; 
import GaugeFactory from './gauge.js'; 

let map = new UsMap("hotspots");

let gaugeFactory = new GaugeFactory();
let gauge1 = gaugeFactory.createGauge("cases");
let gauge2 = gaugeFactory.createGauge("deaths");
let gauge3 = gaugeFactory.createGauge("vaccines");
let gauge4 = gaugeFactory.createGauge("hospitals");

setInterval(() => {
    gauge1.percent = Math.random();
    gauge2.percent = Math.random();
    gauge3.percent = Math.random();
    gauge4.percent = Math.random();
}, 2000);