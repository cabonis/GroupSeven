import EventBus from './eventbus.js'
import InfoCard from './infocard.js';

export default class UsMap extends InfoCard {

  #usMapSvg;

  constructor(id, title) {
      super(id, title);
      this.#usMapSvg = new UsMapSvg(this.contentId);
  }

  update(hotspots) {
      this.#usMapSvg.update(hotspots);
  }
}

class UsMapSvg {

    #chart;
    #active;
    #counties;
    #geoGen;

    constructor(id) {
        
        const self = this;

        const width = 1000;
        const height = 500;

        self.#active = d3.select(null);

        self.#geoGen = d3.geoPath()
            .projection(d3.geoAlbersUsa()
                .scale(width)
                .translate([width / 2, height / 2]));

        const svg = d3.select("#" + id).append("svg")
            .attr("viewBox", `0, 0, ${width}, ${height}`);

        svg.append("rect")
            .attr("class", "background")
            .attr("width", width)
            .attr("height", height)
            .on("click", reset);

        self.#chart = svg.append("g");        

        d3.json("./data/us.json").then(us => {

            const counties = topojson.feature(us, us.objects.counties).features;

            this.#counties = counties.reduce((map, obj) => {
                map[obj.id] = obj;
                return map;
            }, {});

            self.#chart.append("g")
                .attr("id", "counties")
                .selectAll("path")
                .data(counties)    
                .enter().append("path")
                .attr("d", this.#geoGen)
                .attr("class", "county-boundary")
                .on("click", reset);

            self.#chart.append("g")
                .attr("id", "states")
                .selectAll("path")
                .data(topojson.feature(us, us.objects.states).features)
                .enter().append("path")
                .attr("d", this.#geoGen)
                .attr("class", "state")
                .on("click", clicked);

            self.#chart.append("g").append("path")
                .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
                .attr("id", "state-borders")
                .attr("d", this.#geoGen);
        });

        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", () => {
                self.#chart.style("stroke-width", 1.5 / d3.event.transform.k + "px");
                self.#chart.attr("transform", d3.event.transform);
        });

        function clicked(d) {
                
            if (self.#active.node() === this) return reset();
        
                self.#active.classed("active", false);
                self.#active = d3.select(this).classed("active", true);
        
                const bounds = self.#geoGen.bounds(d),
                    dx = bounds[1][0] - bounds[0][0],
                    dy = bounds[1][1] - bounds[0][1],
                    x = (bounds[0][0] + bounds[1][0]) / 2,
                    y = (bounds[0][1] + bounds[1][1]) / 2,
                    scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
                    translate = [width / 2 - scale * x, height / 2 - scale * y];
        
                self.#chart.transition()
                    .duration(750)
                    .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) );

                EventBus.publish("ContextChanged", d.id);
        }
        
        function reset() {
            
            self.#active.classed("active", false);
            self.#active = d3.select(null);        
            self.#chart.transition()
                    .duration(750)
                    .call( zoom.transform, d3.zoomIdentity );
            EventBus.publish("ContextChanged", 0);
        }
            
    }

    update(hotspotIds){
        
        if(!this.#counties) { return; }

        const continentalUsCutoff = 57000;

        hotspotIds = hotspotIds.filter(h => h < continentalUsCutoff);
        
        this.#chart.selectAll("circle")
            .data(hotspotIds, d => d)            
            .join(enter => enter.append("circle")
                                .attr("class", "hotspot")
                                .call(enter => enter.attr("transform", (d) => `translate(${this.#geoGen.centroid(this.#counties[d])})`)
                                    .transition()
                                    .duration(400)
                                    .attr("r", 12)
                                    .transition()
                                    .duration(400)
                                    .attr("r", 6)));
    } 
}