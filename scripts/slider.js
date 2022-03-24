export default class Slider{
    
    constructor(id){

        // Get from config
        var startDate = new Date("2019-10-01");
        var endDate = new Date("2022-04-01");

        const formatDate = d3.timeFormat("%b %Y");        

        const margin = {top:0, right:50, bottom:0, left:50};
        const width = 1000;
        const height = 75;

        const svg = d3.select("#" + id)
            .append("svg")
            .attr("viewBox", `0, 0, ${width + margin.right + margin.left}, ${height + margin.top + margin.bottom}`);  

        var currentValue = 0;
        const targetValue = width;
    
        const x = d3.scaleTime()
            .domain([startDate, endDate])
            .range([0, targetValue])
            .clamp(true);

        const slider = svg.append("g")
            .attr("class", "slider")
            .attr("transform", "translate(" + margin.left + "," + height/2 + ")");

        slider.append("line")
            .attr("class", "track")
            .attr("x1", x.range()[0])
            .attr("x2", x.range()[1])
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-inset")
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-overlay")
            .call(d3.drag()
                .on("start.interrupt", function() { slider.interrupt(); })
                .on("start drag", function() {
                    currentValue = d3.event.x;
                    update(x.invert(currentValue)); 
                })
            );

        slider.insert("g", ".track-overlay")
            .attr("class", "ticks")
            .attr("transform", "translate(0," + 18 + ")")
            .selectAll("text")
            .data(x.ticks(10))
            .enter()
            .append("text")
            .attr("x", x)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .text(function(d) { return formatDate(d); });

        const handle = slider.insert("circle", ".track-overlay")
            .attr("class", "handle")
            .attr("r", 9);

        const label = slider.append("text")  
            .attr("class", "label")
            .attr("text-anchor", "middle")
            .text(formatDate(startDate))
            .attr("transform", "translate(0," + (-25) + ")")

        function update(h) {
                handle.attr("cx", x(h));
                label.attr("x", x(h))
                    .text(formatDate(h));
            }
    }
}