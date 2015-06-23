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
    top: 50, 
    right: 100, 
    bottom: 50, 
    left: 50};

var width = 960 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;		

console.log("width: " + width);
console.log("height: " + height);

var last_position = d3.max(data, function(d){return d.position;});
var position_scale = d3.scale.linear().domain([1, last_position]).range([0, width]);
var position_axis = d3.svg.axis().scale(position_scale).orient("bottom");
var longest_time = d3.max(data, function(d){return d.time;});
var time_scale = d3.scale.linear().domain([0, longest_time]).range([height, 0]);
log_scale("time_scale", time_scale, 0, longest_time);
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

var chart = d3.select("#participants-chart")
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

var enter_selection = chart.selectAll("g.bar-container")
    .data(data)
    .enter()
    .append("g")
    .classed(".bar-container", true)
    .attr("x", function(d){return position_scale(d.position);})
    .attr("y", function(d){return time_scale(d.time);})
    .attr("height", function(d){return height - time_scale(d.time);})
    .attr("width", width / data.length);

enter_selection.append("rect")
    .classed("swim bar", true)
    .attr("x", function(d){return position_scale(d.position);})
    .attr("y", function(d){return time_scale(d.swim);})
    .attr("height", function(d){return height - time_scale(d.swim);})
    .attr("width", width / data.length);

enter_selection.append("rect")
    .classed("t1 bar", true)
    .attr("x", function(d){return position_scale(d.position);})
    .attr("y", function(d){return time_scale(d.swim + d.t1);})
    .attr("height", function(d){return height - time_scale(d.t1)})
    .attr("width", width / data.length);

enter_selection.append("rect")
    .classed("cycle bar", true)
    .attr("x", function(d){return position_scale(d.position);})
    .attr("y", function(d){return time_scale(d.swim + d.t1 + d.cycle);})
    .attr("height", function(d){return height - time_scale(d.cycle)})
    .attr("width", width / data.length);

enter_selection.append("rect")
    .classed("t2 bar", true)
    .attr("x", function(d){return position_scale(d.position);})
    .attr("y", function(d){return time_scale(d.swim + d.t1 + d.cycle + d.t2);})
    .attr("height", function(d){return height - time_scale(d.t2)})
    .attr("width", width / data.length);

enter_selection.append("rect")
    .classed("run bar", true)
    .attr("x", function(d){return position_scale(d.position);})
    .attr("y", function(d){return time_scale(d.swim + d.t1 + d.cycle + d.t2 + d.run);})
    .attr("height", function(d){return height - time_scale(d.run)})
    .attr("width", width / data.length);

enter_selection.append("rect")
    .classed("time bar", true)
    .attr("x", function(d){return position_scale(d.position);})
    .attr("y", function(d){return time_scale(d.time);})
    .attr("height", function(d){return height - time_scale(d.time)})
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
	var participant_input_form = $("#participant-input-form");
	var participant_selector = $("#participant-selector");
	// disable enter on the dropdown
	participant_input_form.keypress(function(e){
		console.log("keypress");
		if(e.which == 13){
		    e.preventDefault();
		}
	    });
	console.log(participant_selector);
	// on clicking a bar
	chart.selectAll(".bar").on("click", function(e){
		console.log("click");
		console.log(d3.select(this).data()[0].name);
		participant_selector.val(d3.select(this).data()[0].name).change();
	    });
	// on participant selection
	participant_selector.change(function(e){
		console.log("participant selected: " + participant_selector.val());
		var response = $.ajax({
			type: 'GET', 
			url: '/participant/' + participant_selector.val(), 
			success: function(msg){
			    $("#detailed-table").html(msg);
			    chart.selectAll(".bar.selected")
			    .classed("selected", false);
			    // find the bar associated to the name
			    var selected_bar = chart.selectAll(".bar").filter(function(d){
				    return d.name == participant_selector.val();
				});
			    console.log(selected_bar);
			    // set class to selected
			    selected_bar.classed("selected", true);
			},
			async: true,
		    });
	    });

	var component_section = $("section#component-analysis-section");
	var parameters_form = component_section.find("form#analysis-parameters-form");
	console.log(parameters_form);
	var parameters_table = component_section.find("table#analysis-parameters-table");
	console.log(component_section);
	console.log(parameters_table);
	var gender_selector = parameters_table.find("select#gender-selector");
	var cat_selector = parameters_table.find("select#category-selector");
	console.log(gender_selector);
	console.log(cat_selector);
	var parameters_submit_btn = parameters_table.find("button");
	console.log(parameters_submit_btn);
	parameters_form.submit(function(e){
		console.log("form submitted");
		e.preventDefault();
		var gender = gender_selector.val();
		var category = cat_selector.val();
		console.log(gender);
		console.log(category);
		var response = $.ajax({
			type: "GET",
			url: "/analysis/gender/" + gender + "/category/" + category,
			success: function(msg){
			    console.log(msg);
 			    var chart_container = component_section.find("table#component-charts-container");
			    var old_charts = chart_container.find("tr");
			    old_charts.remove();
			    var charts_per_row = 3;
			    var counter = 0;
			    for(component in msg){
				console.log(component);
				var data = msg[component];
 				if(counter % charts_per_row == 0){
				    var row = $(document.createElement("tr"));
				    chart_container.append(row);
 				}
				var cell = $(document.createElement("td"));
				row.append(cell);
				var table_width = 780;
				var td_width = table_width * 1. / charts_per_row;
				var left_margin = 0.1 * td_width;
				var right_margin = left_margin;
				var width = td_width - left_margin - right_margin;
 				var row_height = td_width * 0.8;
 				var top_margin = 0.1 * row_height;
 				var bottom_margin = 3 * top_margin;
 				var height = row_height - top_margin - bottom_margin;
				var chart = d3.selectAll(cell.toArray())
				    .append("svg")
				    .attr("width", td_width)
				    .attr("height", row_height)
				    .append("g")
				    .attr("transform", "translate(" + left_margin + ", " + top_margin + ")");
				var earliest_time = data.histo.min;
				var last_time = data.histo.max;
				var time_scale = d3.scale.linear().domain([earliest_time, last_time]).range([0, width]);
				var time_axis = d3.svg.axis().scale(time_scale).orient("bottom");
				var tick_values = [];
				for(bin in data.histo.bins){
				    tick_values.push(data.histo.bins[bin].middle);
				}
				time_axis.tickValues(tick_values)
				    .tickFormat(function(d){return format_time(d);});
				var count_scale = d3.scale.linear().domain([0, data.histo.max_count]).range([height, 0]);
				var count_axis = d3.svg.axis().scale(count_scale).orient("left");
				
				chart.append("g")
				    .attr("class", "x axis")
				    .attr("transform", "translate(0," + height + ")")
				    .call(time_axis)
				    .selectAll("text")
				    .attr("y", 0)
				    .attr("x", 9)
				    .attr("dy", ".35em")
				    .attr("transform", "rotate(90)")
				    .style("text-anchor", "start");

				chart.append("g")
				    .attr("class", "y axis")
				    .call(count_axis)
				    .append("text")
				    .text(component)
				    .attr("dy", "-1em")
				    .attr("text-anchor", "end");

				chart.selectAll(".bar")
				    .data(data.histo.bins)
				    .enter()
				    .append("rect")
				    .classed("bar", true)
				    .attr("x", function(d){return time_scale(d.lower);})
				    .attr("y", function(d){return count_scale(d.count);})
				    .attr("height", function(d){return height - count_scale(d.count);})
				    .attr("width", function(d){
					    return time_scale(d.upper) - time_scale(d.lower);
					});

 				counter += 1;
				
			    }
			},
		    });
	    });
    });

