import EventBus from './eventbus.js'
import Slider from './slider.js';
import UsMap from './usmap.js'; 
import Gauge from './gauge.js'; 
import BarChart from './barchart.js';

let slider = new Slider("date-slider");
let map = new UsMap("hotspots", "Hot Spots");
let gauge1 = new Gauge("cases", "Cases", {interval:[0, .04]});
let gauge2 = new Gauge("deaths", "Deaths", {interval:[0, .04]});
let gauge3 = new Gauge("hospital-staffing", "Hospital Staffing");
let gauge4 = new Gauge("hospital-capacity", "Hospital Capacity");
let chart = new BarChart("vaccinations", "Vaccinations");


chart.update(randBarData());

// Event bus test
EventBus.subscribe("DateChanged", () => {
    gauge1.update(Math.random());
    gauge2.update(Math.random());
    gauge3.update(Math.random());
    gauge4.update(Math.random());
    chart.update(randBarData());
});


function randBarData(){
    return [
        {name:"1st Dose", value: Math.random() * 100},
        {name:"2nd Dose", value: Math.random() * 100},
        {name:"Booster", value: Math.random() * 100}
    ];
}