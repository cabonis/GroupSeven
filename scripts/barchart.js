export default class BarChart{

    constructor(id){

        this.width = 400;
        this.height = 450;
        this.margin = { top: 20, right: 20, bottom: 20, left: 30 }

        const viewboxWidth = this.width + this.margin.right + this.margin.left;
        const viewboxHeight = this.height + this.margin.top + this.margin.bottom;

        const svg = d3.select("#" + id)
            .append("svg")
            .attr("viewBox", `0, 0, ${viewboxWidth}, ${viewboxHeight}`); 
        
        this.chart = svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.x = d3.scaleBand()
            .domain([0, 100])
            .range([ 0, this.width ])
            .padding(0.2);
        
        this.xAxis = this.chart.append("g")
            .attr("transform", "translate(" + 0 + "," + this.height + ")")
            .attr("class", "barchart axis");

        this.y = d3.scaleLinear()
            .domain([0, 100])
            .range([this.height, 0]);
        
        this.yAxis = this.chart.append("g")
            .attr("transform", "translate(" + 0 + "," + 0 + ")")
            .attr("class", "barchart axis");
    }

    update(data) {
        this.x.domain(data.map(d => d.name));
        this.xAxis.transition().duration(1000).call(d3.axisBottom(this.x));

        this.y.domain([0, d3.max(data, d => +d.value)]);
        this.yAxis.transition().duration(1000).call(d3.axisLeft(this.y));

        this.chart.selectAll("rect")
            .data(data)
            .join("rect")
            .transition()
            .duration(1000)
                .attr("x", d => this.x(d.name))
                .attr("y", d => this.y(d.value))
                .attr("width", this.x.bandwidth())
                .attr("height", d => this.height - this.y(d.value))
                .attr("class", "feature");
    }
}