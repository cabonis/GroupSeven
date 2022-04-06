import TimeControl from './timecontrol.js';
import UsMap from './usmap.js'; 
import Gauge from './gauge.js'; 
import Chart from './chart.js';
import TestDataProvider from './dataprovider.js';

let uiElements = {};
uiElements.timecontrol = new TimeControl("slider", "nav");
uiElements.map = new UsMap("hotspots", "Hot Spots");
uiElements.chart = new Chart("vaccinations", "Vaccinations");
uiElements.gauges = [
    new Gauge("cases", "Cases", {interval:[0, .04]}),
    new Gauge("deaths", "Deaths", {interval:[0, .04]}),
    new Gauge("hospital-staffing", "Hospital Staffing"),
    new Gauge("hospital-capacity", "Hospital Capacity")
];

let dataprovider = new TestDataProvider(uiElements);
dataprovider.initialize();