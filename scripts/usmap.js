import {InfoCard, ChartSvg, EventBus, Tooltip} from './framework.js';


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

class UsMapSvg extends ChartSvg{

    #map;
    #active;
    #counties;
    #geoGen;
    #fips;

    constructor(id) {

        const width = 1000;
        const height = 500;
        const margin = {top:0, left: 0, right:0, bottom:0};

        super(id, width, height, margin);

        var self = this;
        self.#active = d3.select(null);

        self.#geoGen = d3.geoPath()
            .projection(d3.geoAlbersUsa()
                .scale(width)
                .translate([width / 2, height / 2]));

        this.chart.append("rect")
            .attr("class", "map-background")
            .attr("width", width)
            .attr("height", height)
            .on("click", reset);

        this.#map = this.chart.append("g");      
        
        Promise.all([
            d3.json("./data/us.json"),
            d3.csv("./data/fips-by-state.csv")
        ]).then(data => {

            const us = data[0];
            this.#fips = data[1].reduce((map, obj) => {
                map[obj.fips] = `${obj.name}, ${obj.state}`;
                return map;
            }, {});

            const counties = topojson.feature(us, us.objects.counties).features;

            this.#counties = counties.reduce((map, obj) => {
                map[obj.id] = obj;
                return map;
            }, {});

            self.#map.append("g")
                .attr("id", "counties")
                .selectAll("path")
                .data(counties)    
                .enter().append("path")
                .attr("d", this.#geoGen)
                .attr("class", "county-boundary")
                .on("click", reset);

            self.#map.append("g")
                .attr("id", "states")
                .selectAll("path")
                .data(topojson.feature(us, us.objects.states).features)
                .enter().append("path")
                .attr("d", this.#geoGen)
                .attr("class", "state")
                .on("click", clicked);

            self.#map.append("g").append("path")
                .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
                .attr("id", "state-borders")
                .attr("d", this.#geoGen);
        });

        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", () => {
                self.#map.style("stroke-width", 1.5 / d3.event.transform.k + "px");
                self.#map.attr("transform", d3.event.transform);
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
        
                self.#map.transition()
                    .duration(self.animationDuration)
                    .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) );

                EventBus.publish("ContextChanged", d.id);
        }
        
        function reset() {
            
            self.#active.classed("active", false);
            self.#active = d3.select(null);        
            self.#map.transition()
                    .duration(self.animationDuration)
                    .call( zoom.transform, d3.zoomIdentity );
            EventBus.publish("ContextChanged", 0);
        }
            
    }

    update(hotspotIds){
        
        let self = this;
        if(!this.#counties) { return; }

        const continentalUsCutoff = 57000;

        hotspotIds = hotspotIds.filter(h => h < continentalUsCutoff);

        function lookupFips(id) {
            let fipsid = id.toString();
            if(fipsid.length<=4){
                fipsid=0+fipsid
            }
            return self.#fips[fipsid];
        }
        
        this.#map.selectAll("circle")
            .data(hotspotIds, d => d)            
            .join(enter => enter.append("circle")
                                .attr("class", "hotspot")   
                                .on("mouseenter", (d) => Tooltip.show(lookupFips(d), d3.event))
                                .on("mousemove", () => Tooltip.move(d3.event))
                                .on("mouseout", () => Tooltip.hide())                             
                                .call(enter => enter.attr("transform", (d) => `translate(${this.#geoGen.centroid(this.#counties[d])})`)
                                    .transition()
                                    .duration(this.animationDuration / 2)
                                    .attr("r", 12)
                                    .transition()
                                    .duration(this.animationDuration / 2)
                                    .attr("r", 6)));                            
                                    
    } 
}