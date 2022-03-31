import EventBus from './eventbus.js'
import Slider from './slider.js';
import UsMap from './usmap.js'; 
import Gauge from './gauge.js'; 
import BarChart from './barchart.js';
import GaugeCard from './infocard.js';

let slider = new Slider("date-slider");
let map = new UsMap("hotspots");

let card = new GaugeCard("cases");
let gauge1 = new Gauge("cases", {interval:[0, .04]});
let gauge2 = new Gauge("deaths", {interval:[0, .04]});
let gauge3 = new Gauge("vaccines");
let gauge4 = new Gauge("hospitals");

let barchart = new BarChart("vaccinations");
barchart.update(randBarData());

// Event bus test
EventBus.subscribe("DateChanged", (date) => {
    gauge1.percent = Math.random();
    gauge2.percent = Math.random();
    gauge3.percent = Math.random();
    gauge4.percent = Math.random();
    barchart.update(randBarData());
});


function randBarData(){
    return [
        {name:"1st Dose", value: Math.random() * 100},
        {name:"2nd Dose", value: Math.random() * 100},
        {name:"Booster", value: Math.random() * 100}
    ];
}