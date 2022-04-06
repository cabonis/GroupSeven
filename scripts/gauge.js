import {InfoCard, ChartSvg} from './framework.js';

export default class Gauge extends InfoCard {

  #daily = "daily-count";
  #average = "rolling-average";

  #gaugeSvg;
  #config = {isDailyCount: true};

  constructor(id, title, options) {
      super(id, title, () => this.#getSettingsDialog(), (m) => this.#processSettingsUpdate(m));      
      this.#gaugeSvg = new GaugeSvg(this.contentId, options);
  }

  #getSettingsDialog(){

    const settingsTemplate = `
      <div class="form-check">
          <input class="form-check-input" type="radio" name="data-granularity" id="${this.#daily}">
          <label class="form-check-label" for="${this.#daily}">Daily Count</label>
      </div>
      <div class="form-check">
          <input class="form-check-input" type="radio" name="data-granularity" id="${this.#average}">
          <label class="form-check-label" for="${this.#average}">7-Day Rolling Average</label>
      </div>`;

    const currentConfig = this.#config.isDailyCount ? this.#daily : this.#average;
    
    const div = document.createElement("div");
    div.innerHTML = settingsTemplate;   
    div.querySelector(`#${currentConfig}`).checked = true;
    return div;
  }
  
  #processSettingsUpdate(modal) {    
    this.#config.isDailyCount = modal.querySelector(`#${this.#daily}`).checked;
  }

  update(data) {
    this.#gaugeSvg.percent = data;
  }
}

class GaugeSvg extends ChartSvg {
  
  #numSections;
  #numTicks;
  #radius;
  #tickPadding;
  #ticks;
  #chart;
  #arcs;
  #needle;
  #scale;

  constructor(id, options) {
    
    if (!options) options = {};
    if (!options.interval) options.interval = [0, 1];
    if (!options.numSections) options.numSections = 7;
    if (!options.numTicks) options.numTicks = 5;

    const width = 200;
    const height = 100;
    const margin = {top: 40, right: 20, bottom: 5, left: 20};

    super(id, width, height, margin);

    const barWidth = 25;
    const barInset = 0;
    const sectionsPadding = .05;

    this.#numSections = options.numSections;
    this.#numTicks = options.numTicks;
    this.#radius = Math.min(width, height * 2) / 2;
    this.#tickPadding = 10;

    this.percent = 0;
    this.interval = options.interval;

    this.#ticks = this.chart.append('g')
    .attr('transform', `translate(${width / 2}, ${height})`);

    this.#chart = this.chart.append('g')
      .attr('transform', `translate(${width / 2}, ${height})`);

    const sectionPercentage = 1 / this.#numSections / 2;
    let cumulativePercent = 0.75;

    this.#arcs = this.#chart.selectAll('.arc')
      .data(d3.range(1, this.#numSections + 1))
      .enter()
      .append('path')
      .attr('class', sectionIndex => `arc gauge-color${sectionIndex}`)
      .attr('d', sectionIndex => {
        const arcStartRad = percToRad(cumulativePercent);
        const arcEndRad = arcStartRad + percToRad(sectionPercentage);
        cumulativePercent += sectionPercentage;

        const startPadRad = sectionIndex === 0 ? 0 : sectionsPadding / 2;
        const endPadRad = sectionIndex === this.#numSections ? 0 : sectionsPadding / 2;
        
        const arc = d3.arc()
          .outerRadius(this.#radius - barInset)
          .innerRadius(this.#radius - barInset - barWidth)
          .startAngle(arcStartRad + startPadRad)
          .endAngle(arcEndRad - endPadRad);

        return arc(this);
      });

    this.#needle = new NeedleSvg(this.#chart, this.#radius, this.animationDuration);

    this.#update();
    this.#drawTicks();
  }

  #update() {
    
    if (!this.#arcs) {
      return;
    }
    
    this.#arcs.classed('active', (d, i) => {
      return i === Math.floor(this.percent * this.#numSections);
    });
  }

  #drawTicks(){
    
    if (!this.#ticks) {
      return;
    }

    this.#ticks.selectAll('.ticks').remove();

    const interval = this.interval;
    const valuePerTick = (interval[1] - interval[0]) / (this.#numTicks - 1);
    const percentPerTick = 1 / (this.#numTicks - 1);

    let tickValues = [];
    for(let i = 0; i < this.#numTicks; i++) {
      tickValues.push(Math.round(i * valuePerTick * 100))
    }

    const tickData = tickValues.map((t, i) => {
      const radians = percToRad((i * percentPerTick) / 2);
      const distance = this.#radius + this.#tickPadding;
      const topX = 0 - (distance * Math.cos(radians));
      const topY = 0 - (distance * Math.sin(radians));      
      return {
        value: t,
        x: topX,
        y: topY
      };
    });    

    this.#ticks.selectAll('.ticks')
      .data(tickData)
      .enter()
      .append('text')
      .attr('class', 'gauge ticks')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .text(d => d.value);
  }

  get interval() {
    if(!this.#scale) {
      return;
    }

    return this.#scale.domain();
  }

  set interval(interval) {
    this.#scale = d3.scaleLinear()
      .domain(interval)
      .range([0, 1])
      .clamp(true);
    this.#drawTicks();
  }

  get percent() {
    return this.#needle.percent;
  }

  set percent(percent) {
    if (this.#needle) {
      this.#needle.update(percent);
    }
    this.#update();
  }

  set value(value) {
    this.percent = this.#scale(value);
  }  
}

class NeedleSvg {

  #element;
  #needleLength;
  #animationDuration
  #needleRadius = 4;  
  #currentPercent = 0;
  #targetPercent = 0;

  constructor(element, needleLength, animationDuration) {    
    this.#element = element;
    this.#needleLength = needleLength;
    this.#animationDuration = animationDuration;

    this.#element.append('path')
      .attr('class', 'gauge needle')
      .attr('d', this.#getPath(this.#targetPercent));
  }

  #getPath(percent) {
    const thetaRad = percToRad(percent / 2);
    const centerX = 0;
    const centerY = 0;
    const topX = centerX - (this.#needleLength * Math.cos(thetaRad));
    const topY = centerY - (this.#needleLength * Math.sin(thetaRad));
    const leftX = centerX - (this.#needleRadius * Math.cos(thetaRad - halfPI));
    const leftY = centerY - (this.#needleRadius * Math.sin(thetaRad - halfPI));
    const rightX = centerX - (this.#needleRadius * Math.cos(thetaRad + halfPI));
    const rightY = centerY - (this.#needleRadius * Math.sin(thetaRad + halfPI));
    return `M ${leftX} ${leftY} L ${topX} ${topY} L ${rightX} ${rightY}`;
  }

  update(percent) {    
    const self = this;
    this.#targetPercent = percent;

    this.#element.transition()
      .ease(d3.easeElasticOut.amplitude(1).period(1))
      .duration(this.#animationDuration)
      .selectAll('.needle')
      .tween('progress', function () {
        const thisElement = this;
        const delta = percent - self.#currentPercent;
        const initialPercent = self.#currentPercent;
        return function (progressPercent) {
          self.#currentPercent = initialPercent + progressPercent * delta;
          return d3.select(thisElement)
            .attr('d', self.#getPath(self.#currentPercent));
        }
      });
  }

  get percent() {
    return this.#targetPercent;
  }
}

const percToDeg = perc => perc * 360;
const degToRad = deg => (deg * Math.PI) / 180;
const percToRad = perc => degToRad(percToDeg(perc));
const halfPI = Math.PI / 2;