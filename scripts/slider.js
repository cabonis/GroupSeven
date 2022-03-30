import EventBus from './eventbus.js'

const formatMonthYear = d3.timeFormat("%b %Y");
const formatMonthDayYear = d3.timeFormat("%b %d, %Y");  

export default class Slider{
    
    #chart;
    #xScale;
    #handle;
    #label;
    #legend;

    constructor(id){

        const defaultStartDate = new Date(-1);
        const defaultEndDate = new Date();           

        const width = 1000;
        const height = 75;
        const margin = {top: 0, right: 50, bottom: 0, left: 50};        

        const svg = d3.select("#" + id)
            .append("svg")
            .attr("viewBox", `0, 0, ${width + margin.right + margin.left}, ${height + margin.top + margin.bottom}`);  

        var currentValue = 0;
    
        this.#xScale = d3.scaleTime()
            .domain([defaultStartDate, defaultEndDate])
            .range([0, width])
            .clamp(true);

        this.#chart = svg.append("g")
            .attr("class", "slider")
            .attr("transform", "translate(" + margin.left + "," + height/2 + ")");

        this.#chart.append("line")
            .attr("class", "track")
            .attr("x1", this.#xScale.range()[0])
            .attr("x2", this.#xScale.range()[1])
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-inset")
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-overlay")
            .call(d3.drag()
                .on("start.interrupt", () => this.#chart.interrupt())
                .on("start drag", () => {
                    currentValue = d3.event.x;
                    this.#updateTimeFocus(this.#xScale.invert(currentValue)); 
                })
            );

        this.#legend = this.#chart.append("g", ".track-overlay")
            .attr("class", "slider ticks")
            .attr("transform", "translate(0," + 18 + ")")

        this.#handle = this.#chart.insert("circle", ".track-overlay")
            .attr("class", "handle")
            .attr("r", 9);

        this.#label = this.#chart.append("text")  
            .attr("class", "label")
            .attr("text-anchor", "middle")
            .text(formatMonthDayYear(defaultStartDate))
            .attr("transform", "translate(0," + (-25) + ")")

        this.#drawOverlay();
    }

    #updateTimeFocus(d) {
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

    updateTimeRange([startDate, endDate]) {
        this.#xScale.domain([startDate, endDate]);
        this.#drawOverlay();
        this.#updateTimeFocus(startDate);
    }
}