const percToDeg = perc => perc * 360;
const degToRad = deg => (deg * Math.PI) / 180;
const percToRad = perc => degToRad(percToDeg(perc));

export default class GaugeFactory{

  createGauge(id, config = this.getDefaultConfig()){
    return new Gauge(id, config);
  }

  getDefaultConfig(){
    /**                      The configuration to use to initialize the gauge.
     * @animationDelay       The delay in ms before to start the needle animation. By default, the value is 0.
     * @animationDuration    The duration in ms of the needle animation. By default, the value is 3000.
     * @barWidth             The bar width of the gauge. By default, the value is 40.
     * @chartInset           The char inset to use. By default, the value is 10.
     * @interval             The interval (min and max values) of the gauge. By default, the interval is [0, 1].
     * @needleColor          The needle color.
     * @needleRadius         The radius of the needle. By default, the radius is 15.
     * @sectionsCount        The number of sections in the gauge.
     * @sectionsColors       The color to use for each section.
     */
    return {
      animationDelay: 0,
      animationDuration: 1000,
      barWidth: 25,
      chartInset: 0,
      interval: [0, 1],
      needleColor: "black",
      needleRadius: 4,
      sectionsPadding: .05,
      sectionsCount: 7,
      sectionsColors: undefined
    }
  }
}

class Needle {

  constructor(element, config) {    
    this._config = config;
    this._element = element;   
    
    this._element.append('circle')
      .attr('class', 'needle-center')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', config.needleRadius);

    this._element.append('path')
      .attr('class', 'needle')
      .attr('d', this.#getPath(config.percent));

    if (this._config.color) {
      this._element.select('.needle-center')
        .style('fill', config.color);

      this._element.select('.needle')
        .style('fill', config.color);
    }
  }

  update(percent) {    
    const self = this;
    const config = this._config;

    this._element.transition()
      .delay(config.animationDelay)
      .ease(d3.easeElasticOut.amplitude(1).period(1))
      .duration(config.animationDuration)
      .selectAll('.needle')
      .tween('progress', function () {
        const thisElement = this;
        const delta = percent - config.percent;
        const initialPercent = config.percent;
        return function (progressPercent) {
          config.percent = initialPercent + progressPercent * delta;
          return d3.select(thisElement)
            .attr('d', self.#getPath(config.percent));
        }
      });
  }

  #getPath(percent) {
    const config = this._config;
    const halfPI = Math.PI / 2;
    const thetaRad = percToRad(percent / 2);
    const centerX = 0;
    const centerY = 0;
    const topX = centerX - (config.length * Math.cos(thetaRad));
    const topY = centerY - (config.length * Math.sin(thetaRad));
    const leftX = centerX - (config.radius * Math.cos(thetaRad - halfPI));
    const leftY = centerY - (config.radius * Math.sin(thetaRad - halfPI));
    const rightX = centerX - (config.radius * Math.cos(thetaRad + halfPI));
    const rightY = centerY - (config.radius * Math.sin(thetaRad + halfPI));
    return `M ${leftX} ${leftY} L ${topX} ${topY} L ${rightX} ${rightY}`;
  }
}

class Gauge {
  
  constructor(id, config) {
    
    const width = 200;
    const height = 100;
    const margin = {top: 40, right: 20, bottom: 5, left: 20};

    this._config = config;
    this.percent = 0;
    this.interval = [0, 1];

    const sectionPercentage = 1 / config.sectionsCount / 2;

    let totalPercent = 0.75;
    const radius = Math.min(width, height * 2) / 2;

    const viewboxWidth = width + margin.right + margin.left;
    const viewboxHeight = height + margin.top + margin.bottom;

    const svg = d3.select("#" + id).append("svg")
      .attr("viewBox", `0, 0, ${viewboxWidth}, ${viewboxHeight}`);

    this._chart = svg.append('g')
      .attr('transform', `translate(${viewboxWidth / 2}, ${height + margin.top})`);

    this._arcs = this._chart.selectAll('.arc')
      .data(d3.range(1, config.sectionsCount + 1))
      .enter()
      .append('path')
      .attr('class', sectionIndex => `arc gauge-color${sectionIndex}`)
      .attr('d', sectionIndex => {
        const arcStartRad = percToRad(totalPercent);
        const arcEndRad = arcStartRad + percToRad(sectionPercentage);
        totalPercent += sectionPercentage;

        const startPadRad = sectionIndex === 0 ? 0 : config.sectionsPadding / 2;
        const endPadRad = sectionIndex === config.sectionsCount ? 0 : config.sectionsPadding / 2;
        
        const arc = d3.arc()
          .outerRadius(radius - config.chartInset)
          .innerRadius(radius - config.chartInset - config.barWidth)
          .startAngle(arcStartRad + startPadRad)
          .endAngle(arcEndRad - endPadRad);

        return arc(this);
      });

    if(config.sectionsColors) {
      this._arcs.style('fill', sectionIndex => config.sectionsColors[sectionIndex - 1]);
    }

    this._needle = new Needle(this._chart, {
      animationDelay: config.animationDelay,
      animationDuration: config.animationDuration,
      color: config.needleColor,
      length: height,
      percent: this._percent,
      radius: config.needleRadius
    });

    this.#update();
  }

  get interval() {
    return this._scale.domain();
  }

  set interval(interval) {
    this._scale = d3.scaleLinear()
      .domain(interval)
      .range([0, 1])
      .clamp(true);
  }

  get percent() {
    return this._percent;
  }

  set percent(percent) {
    if (this._needle) {
      this._needle.update(percent);
    }
    this._percent = percent;
    this.#update();
  }

  set value(value) {
    this.percent = this._scale(value);
  }

  #update() {
    if (!this._arcs) {
      return;
    }
    
    this._arcs.classed('active', (d, i) => {
      return i === Math.floor(this._percent * this._config.sectionsCount);
    });

    this._chart.classed('min', this._percent === 0);
    this._chart.classed('max', this._percent === 1);
  }
}