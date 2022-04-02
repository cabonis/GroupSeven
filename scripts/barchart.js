import InfoCard from './infocard.js';

export default class BarChart extends InfoCard {

  #barChartSvg;

  constructor(id, title) {
      super(id, title);
      this.#barChartSvg = new BarChartSvg(this.contentId);
  }

  update(data) {
      this.#barChartSvg.update(data);
  }
}


class BarChartSvg {

    #width;
    #height;    
    #chart;
    #xScale;
    #yScale;

    constructor(id){

        this.#width = 400;
        this.#height = 450;
        const margin = { top: 20, right: 20, bottom: 20, left: 30 }

        const svg = d3.select("#" + id)
            .append("svg")
            .attr("viewBox", `0, 0, ${this.#width + margin.right + margin.left}, ${this.#height + margin.top + margin.bottom}`); 
        
        this.#chart = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        this.#xScale = d3.scaleBand()
            .domain([0, 100])
            .range([ 0, this.#width ])
            .padding(0.2);
        
        this.xAxis = this.#chart.append("g")
            .attr("transform", "translate(" + 0 + "," + this.#height + ")")
            .attr("class", "barchart axis");

        this.#yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([this.#height, 0]);
        
        this.yAxis = this.#chart.append("g")
            .attr("transform", "translate(" + 0 + "," + 0 + ")")
            .attr("class", "barchart axis");
    }

    update(data) {
        this.#xScale.domain(data.map(d => d.name));
        this.xAxis.transition().duration(1000).call(d3.axisBottom(this.#xScale));

        this.#yScale.domain([0, d3.max(data, d => +d.value)]);
        this.yAxis.transition().duration(1000).call(d3.axisLeft(this.#yScale));

        this.#chart.selectAll("rect")
            .data(data)
            .join("rect")
            .transition()
            .duration(1000)
                .attr("x", d => this.#xScale(d.name))
                .attr("y", d => this.#yScale(d.value))
                .attr("width", this.#xScale.bandwidth())
                .attr("height", d => this.#height - this.#yScale(d.value))
                .attr("class", "bar");
    }
}