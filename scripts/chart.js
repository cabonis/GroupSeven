import {InfoCard, ChartSvg} from './framework.js';

const formatMonthYear = d3.timeFormat("%b %Y");

export default class Chart extends InfoCard {

  #bar = "bar-chart";
  #line = "line-chart";
  #config = {};

  #chart;
  #lastData;

  constructor(id, title, isBar = true) {

      super(id, title, () => this.#getSettingsDialog(), (m) => this.#processSettingsUpdate(m));

      this.#config.isBar = isBar;

      if(isBar){
          this.#chart = new BarChartSvg(this.contentId);
      }
      else {
        this.#chart = new LineChartSvg(this.contentId);
      }
  }

  #getSettingsDialog(){

    const settingsTemplate = `
      <div class="form-check">
          <input class="form-check-input" type="radio" name="chart-type" id="${this.#bar}">
          <label class="form-check-label" for="${this.#bar}">Current Vaccinations</label>
      </div>
      <div class="form-check">
          <input class="form-check-input" type="radio" name="chart-type" id="${this.#line}">
          <label class="form-check-label" for="${this.#line}">Vaccination Trend</label>
      </div>`;

    const currentConfig = this.#config.isBar ? this.#bar : this.#line;    
    const div = document.createElement("div");
    div.innerHTML = settingsTemplate;   
    div.querySelector(`#${currentConfig}`).checked = true;
    return div;
  }
  
  #processSettingsUpdate(modal) {    
    let isUpdated = false;
    const isBar = modal.querySelector(`#${this.#bar}`).checked;

    if(isBar && !this.#config.isBar) {
        this.#chart.remove();
        this.#chart = new BarChartSvg(this.contentId);
        isUpdated = true;
    }
    else if(!isBar && this.#config.isBar) {
        this.#chart.remove();
        this.#chart = new LineChartSvg(this.contentId);
        isUpdated = true;
    }

    if(isUpdated) {
        this.#config.isBar = isBar;
        this.#chart.update(this.#lastData);
    }    
  }

  update(data) {
      this.#lastData = data;
      this.#chart.update(data);
  }
}

class LineChartSvg extends ChartSvg {

    #xScale;
    #xAxis;
    #xAxisGenerator;
    #yScale;
    #yAxis;
    #yAxisGenerator
    #lineGenerator;
        
    constructor(id) {
        
        const width = 400;
        const height = 450;
        const margin = { top: 20, right: 20, bottom: 20, left: 35 }

        super(id, width, height, margin);

        this.#xScale = d3.scaleLinear()
            .range([0, this.width ]);

        this.#xAxis = this.chart.append("g")
            .attr("transform", `translate(0, ${height})`)
            .attr("class", "linechart axis");

        this.#xAxisGenerator = d3.axisBottom(this.#xScale)
            .tickFormat(d3.timeFormat("%b %Y"))
            .ticks(3);

        this.#yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        this.#yAxis = this.chart.append("g")
            .attr("transform", `translate(0, 0)`)
            .attr("class", "linechart axis");

        this.#yAxisGenerator = d3.axisLeft(this.#yScale);

        this.#lineGenerator = d3.line()
            .x((d) => this.#xScale(d.date))
            .y((d) => this.#yScale(+d.value));
    }

    update(data) {

        let sumstat = d3.nest()
            .key((d) => d.name)
            .sortValues((a, b) => b.date - a.date)
            .entries(data); 

        this.#xAxisGenerator.ticks(sumstat[0].values.length);

        this.#xScale.domain(d3.extent(data, (d) => d.date));
        this.#xAxis.transition()
            .duration(this.animationDuration)
            .call(this.#xAxisGenerator);
    
        this.#yAxis.transition()
            .duration(this.animationDuration)
            .call(this.#yAxisGenerator);

        this.chart.selectAll(".line")
            .data(sumstat, d => d.key)
            .join("path")
            .transition()
            .duration(this.animationDuration)
            .attr("class", "line")
            .attr("d", (d) => this.#lineGenerator(d.values));

        this.chart.selectAll("circle")
            .data(data)
            .join("circle")
            .transition()
            .duration(this.animationDuration)
            .attr("class", "linepoint")
            .attr("cx", (d) => this.#xScale(d.date))
            .attr("cy", (d) => this.#yScale(d.value))
            .attr("r", 6); 
    }
}


class BarChartSvg extends ChartSvg {
    
    #xScale;
    #xAxis;
    #yScale;
    #yAxis;

    constructor(id){

        const width = 400;
        const height = 450;
        const margin = { top: 20, right: 20, bottom: 20, left: 35 }

        super(id, width, height, margin);

        this.#xScale = d3.scaleBand()
            .domain([0, 100])
            .range([ 0, this.width ])
            .padding(0.2);
        
        this.#xAxis = this.chart.append("g")
            .attr("transform", `translate(0, ${height})`)
            .attr("class", "barchart axis");

        this.#yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);
        
        this.#yAxis = this.chart.append("g")
            .attr("transform", `translate(0, 0)`)
            .attr("class", "barchart axis");
    }

    update(data) {

        let maxDate = d3.max(data, d => d.date);
        let recentData = data.filter(d => d.date == maxDate);

        this.#xScale.domain(recentData.map(d => d.name));
        this.#xAxis.transition().duration(this.animationDuration).call(d3.axisBottom(this.#xScale));

        this.#yAxis.transition().duration(this.animationDuration).call(d3.axisLeft(this.#yScale));

        this.chart.selectAll("rect")
            .data(recentData)
            .join("rect")
            .transition()
            .duration(this.animationDuration)
                .attr("x", d => this.#xScale(d.name))
                .attr("y", d => this.#yScale(d.value))
                .attr("width", this.#xScale.bandwidth())
                .attr("height", d => this.height - this.#yScale(d.value))
                .attr("class", "bar");
    }
}