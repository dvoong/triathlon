console.log("main.js");
console.log(data);

function log_scale(msg, scale, min, max){
    console.log(msg);
    console.log(max);
    console.log(scale);
    console.log(scale(min));
    console.log(scale(max));
    console.log(scale(max / 2));
    console.log(scale(min - 1));
    console.log(scale(max + 1));
}
		
var margin = {
    top: 100, 
    right: 100, 
    bottom: 100, 
    left: 100};

var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;		

console.log("width: " + width);
console.log("height: " + height);

var last_position = d3.max(data, function(d){return d.position;});
var position_scale = d3.scale.linear().domain([1, last_position]).range([0, width]);
var position_axis = d3.svg.axis().scale(position_scale).orient("bottom");
var longest_time = d3.max(data, function(d){return d.time;});
var time_scale = d3.scale.linear().domain([6000, longest_time]).range([height, 0]);
var format_time = function(d, seconds){
    if(seconds === undefined){
	var seconds = false;
    }
    var hours = Math.floor(d / 3600);
    var minutes = Math.floor((d - (hours * 3600)) / 60);
    var output = hours + ":"
    if(minutes >= 10)
	output += minutes;
    else
	output += "0" + minutes;
    if(seconds){
	var seconds = d - hours * 3600 - (minutes * 60);
	output += ":";
	if(seconds >= 10)
	    output += Math.round(seconds);
	else
	    output += "0" + Math.round(seconds);
    }
    return output
};
var time_axis = d3.svg.axis().scale(time_scale).orient("left").ticks(10).tickFormat(function(d){return format_time(d);});

for(i=0; i<10; i++){
    var d = data[i];
    console.log(format_time(d.time));
}

var chart = d3.select("body").append("svg").attr("class", "chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

chart.append("g").attr("class", "x axis")
    .attr("transform", "translate(0, " + height + ")")
    .call(position_axis)
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("dy", "3.5em")
    .text("Position");

chart.append("g")
    .attr("class", "y axis")
    .call(time_axis)
    .append("text")
    .text("Time")
    .attr("dy", "-1em")
    .attr("text-anchor", "end");

chart.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return position_scale(d.position); })
    .attr("y", function(d) { return time_scale(d.time); })
    .attr("height", function(d) { return height - time_scale(d.time); })
    .attr("width", width / data.length);

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d, index) {
	    var html = "Name: " + d.name;
	    html += "<br>";
	    html += "Position: " + d.position;
	    html += "<br>";
	    html += "Time: " + format_time(d.time, true);
	    return html;
	});

chart.call(tip);

chart.selectAll(".bar")
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);

$(document).ready(function(){
	console.log("document ready");
	
    });

