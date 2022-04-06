import { ChartSvg, EventBus } from './framework.js';

const formatMonthYear = d3.timeFormat("%b %Y");
const formatMonthDayYear = d3.timeFormat("%b %d, %Y");  

export default class TimeControl {

    #slider;
    #playPause;

    constructor(sliderId, playPauseId){      

        const sliderControl = `${sliderId}-control`;
        const sliderTemplate = `<div class="card py-4" id="${sliderControl}"></div>`;

        const div = document.createElement("div");
        div.innerHTML = sliderTemplate;
        document.getElementById(sliderId).appendChild(div);


        this.#slider = new SliderSvg(sliderControl);
        this.#playPause = new PlayPause(playPauseId, this.#slider);
    }

    updateTimeRange(range){
        this.#slider.updateTimeRange(range);
    }
}

class PlayPause {

    #isPlaying = false;
    #slider;
    #timer;
    #playBtn;

    constructor(id, slider){

        const playButton = "playpause";

        const playPauseTemplate = `
        <div class="btn-group">
            <button type="button" class="bi-play-fill" id="${playButton}"></button>
        </div>
        `;

        // const playPauseTemplate = `
        // <div class="btn-group">
        //     <button type="button" class="bi-play-fill" id="${playButton}"></button>
        //     <button type="button" class="bi-gear-fill dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown"></button>      
        //     <ul class="dropdown-menu dropdown-menu-end">
        //         <li><h6 class="dropdown-header">Play Speed</h6></li>
        //         <li><hr class="dropdown-divider"></li>
        //         <li><a class="dropdown-item" href="#">1 Day/sec</a></li>
        //         <li><a class="dropdown-item active" href="#">7 Days/sec</a></li>
        //         <li><a class="dropdown-item" href="#">28 Days/sec</a></li>
        //     </ul>
        // </div>
        // `;

        const div = document.createElement("div");
        div.innerHTML = playPauseTemplate;
        document.getElementById(id).appendChild(div);

        this.#slider = slider;
        this.#playBtn = document.getElementById(playButton);
        this.#playBtn.addEventListener("click", () => this.#playPauseClicked());
    }

    #playPauseClicked() {
        
        if(!this.#isPlaying) {
            this.#playBtn.classList.remove("bi-play-fill");
            this.#playBtn.classList.add("bi-pause-fill");
            this.#slider.toggleEnabled(false);
            this.#timer = setInterval(() => this.#updateSlider(), 1000);
            this.#isPlaying = true;
        }
        else {
            this.#playBtn.classList.remove("bi-pause-fill");
            this.#playBtn.classList.add("bi-play-fill");
            this.#slider.toggleEnabled(true)
            clearInterval(this.#timer);
            this.#isPlaying = false;
        }
    }

    #updateSlider() {
        this.#slider.step(1);
    }
}

class SliderSvg extends ChartSvg{
    
    #xScale;
    #handle;
    #label;
    #legend;
    #overlay;
    #track;
    #currentDate;

    constructor(id){
        
        const defaultStartDate = new Date(Date.parse("2020-01-01T00:00:00"));
        const defaultEndDate = new Date();           

        const width = 1000;
        const height = 75;
        const margin = {top: 0, right: 50, bottom: 0, left: 50};        

        super(id, width, height, margin);
    
        this.#xScale = d3.scaleTime()
            .domain([defaultStartDate, defaultEndDate])
            .range([0, width])
            .clamp(true);

        const slider = this.chart.append("g")
            .attr("class", "slider")
            .attr("transform", `translate(0, ${height/2})`);

        const line = slider.append("line")
            .attr("class", "track")
            .attr("x1", this.#xScale.range()[0])
            .attr("x2", this.#xScale.range()[1])

        this.#track = line.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-inset");

        this.#overlay = line.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-overlay")
            .call(d3.drag()
                .on("start.interrupt", () => slider.interrupt())
                .on("start drag", () => this.#updateTimeFocus(this.#xScale.invert(d3.event.x)))
            );

        this.#legend = slider.append("g", ".track-overlay")
            .attr("class", "slider ticks")
            .attr("transform", "translate(0," + 18 + ")")

        this.#handle = slider.insert("circle", ".track-overlay")
            .attr("class", "handle")
            .attr("r", 9);

        this.#label = slider.append("text")  
            .attr("class", "label")
            .attr("text-anchor", "middle")
            .text(formatMonthDayYear(defaultStartDate))
            .attr("transform", "translate(0," + (-25) + ")")

        this.#drawOverlay();
    }

    #updateTimeFocus(d) {
        this.#currentDate = d;
        this.#handle.attr("cx", this.#xScale(d));
        this.#label.attr("x", this.#xScale(d))
            .text(formatMonthDayYear(d));
        EventBus.publish("DateChanged", d);
    }

    #drawOverlay(){
        this.#legend.selectAll('text').remove();        
        this.#legend
            .selectAll("text")
            .data(this.#xScale.ticks(10))
            .enter()
            .append("text")
            .attr("x", this.#xScale)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .text((d) => formatMonthYear(d));
    }

    step(num){
        const timelineEnd = this.#xScale.domain()[1].getTime();
        let date = new Date(this.#currentDate.valueOf());

        if(date.getTime() == timelineEnd) { return; }

        date.setDate(date.getDate() + num);
        if(date.getTime() > timelineEnd) { date = timelineEnd; }
        this.#updateTimeFocus(date);
    }

    toggleEnabled(isEnabled) {
        this.#handle.classed("inactive", !isEnabled);
        this.#overlay.classed("inactive", !isEnabled);
        this.#track.classed("inactive", !isEnabled);
    }

    updateTimeRange([startDate, endDate]) {
        this.#xScale.domain([startDate, endDate]);
        this.#drawOverlay();
        this.#updateTimeFocus(startDate);
    }
}