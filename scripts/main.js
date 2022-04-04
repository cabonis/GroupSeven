import EventBus from './eventbus.js'
import Slider from './slider.js';
import UsMap from './usmap.js'; 
import Gauge from './gauge.js'; 
import BarChart from './barchart.js';
import TestDataProvider from './dataprovider.js';

let uiElements = {};
uiElements.slider = new Slider("date-slider");
uiElements.map = new UsMap("hotspots", "Hot Spots");
uiElements.chart = new BarChart("vaccinations", "Vaccinations");
uiElements.gauges = [
    new Gauge("cases", "Cases", {interval:[0, .04]}),
    new Gauge("deaths", "Deaths", {interval:[0, .04]}),
    new Gauge("hospital-staffing", "Hospital Staffing"),
    new Gauge("hospital-capacity", "Hospital Capacity")
];

let dataprovider = new TestDataProvider(uiElements);
dataprovider.initialize();