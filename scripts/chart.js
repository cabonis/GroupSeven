import {InfoCard, ChartSvg} from './framework.js';

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

    constructor(id) {
        
        const width = 400;
        const height = 450;
        const margin = { top: 20, right: 20, bottom: 20, left: 30 }

        super(id, width, height, margin);

        this.chart.append("text")
            .attr("transform", `translate(${width / 4}, ${height / 2})`)
            .text("Line Chart Placeholder");
    }

    update(data) {

    }
}


class BarChartSvg extends ChartSvg {
    
    #xScale;
    #yScale;

    constructor(id){

        const width = 400;
        const height = 450;
        const margin = { top: 20, right: 20, bottom: 20, left: 30 }

        super(id, width, height, margin);

        this.#xScale = d3.scaleBand()
            .domain([0, 100])
            .range([ 0, this.width ])
            .padding(0.2);
        
        this.xAxis = this.chart.append("g")
            .attr("transform", `translate(0, ${height})`)
            .attr("class", "barchart axis");

        this.#yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);
        
        this.yAxis = this.chart.append("g")
            .attr("transform", `translate(0, 0)`)
            .attr("class", "barchart axis");
    }

    update(data) {
        this.#xScale.domain(data.map(d => d.name));
        this.xAxis.transition().duration(1000).call(d3.axisBottom(this.#xScale));

        this.#yScale.domain([0, d3.max(data, d => +d.value)]);
        this.yAxis.transition().duration(1000).call(d3.axisLeft(this.#yScale));

        this.chart.selectAll("rect")
            .data(data)
            .join("rect")
            .transition()
            .duration(1000)
                .attr("x", d => this.#xScale(d.name))
                .attr("y", d => this.#yScale(d.value))
                .attr("width", this.#xScale.bandwidth())
                .attr("height", d => this.height - this.#yScale(d.value))
                .attr("class", "bar");
    }
}