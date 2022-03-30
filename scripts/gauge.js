const percToDeg = perc => perc * 360;
const degToRad = deg => (deg * Math.PI) / 180;
const percToRad = perc => degToRad(percToDeg(perc));

export default class GaugeFactory{

  createGauge(id, config = this.getDefaultConfig()){
    return new Gauge(id, config);
  }

  getDefaultConfig(){
    /**                      The configuration to use to initialize the gauge.
     * @interval             The interval (min and max values) of the gauge. By default, the interval is [0, 1].
     * @sectionsCount        The number of sections in the gauge.
     * @numTicks             The number of scale tick marks
     */
    return {
      interval: [0, 1],
      sectionsCount: 7,
      numTicks: 5
    }
  }
}

class Needle {

  #element;
  #needleLength;
  #needleRadius = 4;  
  #percent = 0;

  constructor(element, needleLength) {    
    this.#element = element;
    this.#needleLength = needleLength;

    this.#element.append('path')
      .attr('class', 'gauge needle')
      .attr('d', this.#getPath(this.#percent));
  }

  #getPath(percent) {
    const halfPI = Math.PI / 2;
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
    const animationDuration = 1000;

    this.#element.transition()
      .ease(d3.easeElasticOut.amplitude(1).period(1))
      .duration(animationDuration)
      .selectAll('.needle')
      .tween('progress', function () {
        const thisElement = this;
        const delta = percent - self.#percent;
        const initialPercent = self.#percent;
        return function (progressPercent) {
          self.#percent = initialPercent + progressPercent * delta;
          return d3.select(thisElement)
            .attr('d', self.#getPath(self.#percent));
        }
      });
  }

  get Percent() {
    return this.#percent;
  }
}

class Gauge {
  
  #numSections;
  #numTicks;
  #radius;
  #tickPadding;
  #ticks;
  #chart;
  #arcs;
  #needle;
  #scale;

  constructor(id, interval = [0, 1], numSections = 7, numTicks = 5) {
    
    const width = 200;
    const height = 100;
    const margin = {top: 40, right: 20, bottom: 5, left: 20};

    const barWidth = 25;
    const barInset = 0;
    const sectionsPadding = .05;

    this.#numSections = numSections;
    this.#numTicks = numTicks;
    this.#radius = Math.min(width, height * 2) / 2;
    this.#tickPadding = 10;

    this.Percent = 0;
    this.Interval = [0, 1];

    const viewboxWidth = width + margin.right + margin.left;
    const viewboxHeight = height + margin.top + margin.bottom;

    const svg = d3.select("#" + id).append("svg")
      .attr("viewBox", `0, 0, ${viewboxWidth}, ${viewboxHeight}`);

    this.#ticks = svg.append('g')
      .attr('transform', `translate(${viewboxWidth / 2}, ${height + margin.top})`);

    this.#chart = svg.append('g')
      .attr('transform', `translate(${viewboxWidth / 2}, ${height + margin.top})`);

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

    this.#needle = new Needle(this.#chart, this.#radius);

    this.#update();
    this.#drawTicks();
  }

  #update() {
    
    if (!this.#arcs) {
      return;
    }
    
    this.#arcs.classed('active', (d, i) => {
      return i === Math.floor(this.Percent * this.#numSections);
    });
  }

  #drawTicks(){
    
    if (!this.#ticks) {
      return;
    }

    this.#ticks.selectAll('.ticks').remove();

    const interval = this.Interval;
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

  get Interval() {
    if(!this.#scale) {
      return;
    }

    return this.#scale.domain();
  }

  set Interval(interval) {
    this.#scale = d3.scaleLinear()
      .domain(interval)
      .range([0, 1])
      .clamp(true);
    this.#drawTicks();
  }

  get Percent() {
    return this.#needle.Percent;
  }

  set Percent(percent) {
    if (this.#needle) {
      this.#needle.update(percent);
    }
    this.#update();
  }

  set Value(value) {
    this.Percent = this.#scale(value);
  }  
}