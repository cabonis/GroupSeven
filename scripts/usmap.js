export default class UsMap {

    constructor(id) {
        
        const size = {
            viewbox: {width: 1000, height:500},
            margins: {top: 20, right: 20, bottom: 20, left: 20}
        };

        var active = d3.select(null);

        const projection = d3.geoAlbersUsa()
            .scale(1000)
            .translate([size.viewbox.width / 2, size.viewbox.height / 2]);

        const geoPathGenerator = d3.geoPath()
            .projection(projection);

        const svg = d3.select("#" + id).append("svg")
            .attr("viewBox", `0, 0, ${size.viewbox.width}, ${size.viewbox.height}`);

        svg.append("rect")
            .attr("class", "background")
            .attr("width", size.viewbox.width)
            .attr("height", size.viewbox.height)
            .on("click", reset);

        const g = svg.append("g");;

        d3.json("/data/us.json").then(us => {

            g.selectAll("path")
                .data(topojson.feature(us, us.objects.states).features)
                .enter().append("path")
                .attr("d", geoPathGenerator)
                .attr("class", "feature")
                .on("click", clicked);

            g.append("path")
                .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
                .attr("class", "mesh")
                .attr("d", geoPathGenerator);
        });

        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", zoomed);

        function clicked(d) {
            if (active.node() === this) return reset();
            active.classed("active", false);
            active = d3.select(this).classed("active", true);

            var bounds = geoPathGenerator.bounds(d),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / size.viewbox.width, dy / size.viewbox.height))),
                translate = [size.viewbox.width / 2 - scale * x, size.viewbox.height / 2 - scale * y];

            svg.transition()
                .duration(750)
                .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) );
        }

        function reset() {
            active.classed("active", false);
            active = d3.select(null);

            svg.transition()
                .duration(750)
                .call( zoom.transform, d3.zoomIdentity );
        }

        function zoomed() {
            g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
            g.attr("transform", d3.event.transform);
        }
    }  
}