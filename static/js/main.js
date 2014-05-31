/*
 * Main Script
 *
 * Copyright (c) 2014 Cisco Systems 
 *   Alex Holden <a@lexholden.com> <ajonasho@cisco.com>
 *   Matt Weeks <maweeks@cisco.com>
 *
 */

/*
 *	And then do all this on doc.ready
 *
 */

var macpriority = [];
var macpriorityval = ""
var total_devices = 0;

var changed = false;

$(document).ready(function() {
	loadSlider();
	createHeatmap();
	//refreshData();
	//getOpenStackData();
	
	$("#slider").bind("valuesChanged", function(e, data) {
		//console.log("Movement - Min: " + data.values.min + " Max: " + data.values.max);
		refreshData(data.values.min, data.values.max)
	})
	
	//getTemp();
	//getHumid();
	//getTotalDevices()

});

function refreshData(min, max) {
	heatmap.store.setDataSet({ max: 100, data: []});
	total_devices = 0;
	//console.log(new Date("2014-05-19T12:52:57.707-0700"));
	//console.log(min + "    to    " + max);
	//console.log("changed");
	for (var i in data) {
		//console.log(new Date(data[i]["time"]) > min)
		var date = new Date(data[i]["time"]);
		//console.log(new Date())
		if ( date >= min && date <= max) {
			heatmap.store.addDataPoint(data[i]["x"] * 9 - 300/* * 5 + 50*/, data[i]["y"] * 9 - 300 /** 5 - 80*/, 10)
			total_devices ++;
		}
		//console.log(data[i])
	}

	$("#devtotal").html("No. of Devices: " + total_devices);
	
	//console.log(data[7]);
	//var current = data.filter(function(d) {withinTimestamp(d, min, max)});
	//console.log(current);

	//console.log("Changed Data")

	// if (changed == true) {
	// 	console.log("changed, so updating");
	// 	changed = false;
	// 	refreshData();
	// }
}

function withinTimestamp(element, min, max) {
	var date = new Date(element["time"]);
	return date >= min && date <= max;
}

function loadSlider() {
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

	$("#slider").dateRangeSlider({ "defaultValues":{  "min": new Date(2014, 4, 20, 9, 0, 0), "max": new Date(2014, 04, 20, 17, 0, 0) }, "bounds": { "min": new Date(2014, 4, 19, 0, 0, 0),  "max": new Date(2014, 4, 23, 0, 0, 0) }, 
		"scales": [{
	      first: function(value){ return value; },
	      end: function(value) {return value; },
	      next: function(value){
	        var next = new Date(value);
	        return new Date(next.setDate(value.getDate() + 1));
	      },
	      label: function(value){
	        return months[value.getMonth()] + " " + value.getDate();
	      },
	      format: function(tickContainer, tickStart, tickEnd){
	        tickContainer.addClass("tickerLabel");
	      }
	    }], 

	    formatter:function(val){
        	var days = val.getDate(), time = val.getTime();
        	var hours = val.getHours();
        	var minutes = val.getMinutes();//time / (60000 * 60)  
        	if (minutes < 30) {
        		minutes = "00";
        		//minutes = "0" + minutes;
        	}
        	else if (minutes < 60) {
        		minutes = 30
        	}
        	return hours + ":" + minutes;
      	},
      	"wheelMode": "scroll", "wheelSpeed": 30
      });
}


/**
 *	Adds a new heatmap
 */
function createHeatmap() {
	var config = {
		"width": 5000,//window.screen.width,//$('#pane-center').width(),
		"height": 5000,//window.screen.height,//$('#pane-center').height(),
		"radius": 40,
		"element": document.getElementById("background"),
		"visible": true,
		"opacity": 40,
		"gradient": { 0.0: "rgb(0,0,197)", 0.3: "rgb(0,255,255)", 0.6: "rgb(0,255,0)", 0.8: "yellow", 1: "rgb(255,0,0)" }
	};

	heatmap = h337.create(config);

	heatmap.store.setDataSet({ max: 100, data: []});

	//getServerData(saveCpuUtil, "get cpu");
	
	// for (var i = 0; i < 200; i++) {
	// 	heatmap.store.addDataPoint(Math.random() * 2000, Math.random() * 1000, Math.random() * 100 );
	// }

	
	// heatmap.store.addDataPoint(500, 600, 30);
	// heatmap.store.addDataPoint(900, 300, 50);

	//setTimeout(function() {updateHeatmapReal();}, 3000)
}

function getTotalDevices() {
	var token;
	$.ajax({
	    url: "http://10.10.30.24:8082/apic-em",
	    type: "GET",
	    //data: '{"start_time":"2014-05-19T14:18:40.990-0700", "end_time":"2014-05-19T14:18:40.990-0700"}',
	    success: function( data ) {
	    		totals = JSON.parse(data);
	    		console.log
	    		
    			$("#today").html("Unique Devices Today: " + totals["unique_devices"]);
	    	}
	});
	setTimeout(getTotalDevices, 60000);
}



function updateHeatmapReal(data) {
	heatmap.store.setDataSet({ max: 100, data: []});
	heatmap.store.addDataPoint(node_heat_x, node_heat_y, value);
	// This condition will never be met now, kept in in case.
	if (data) {
		util = JSON.parse(data);
		for (var i in util) {
			var node = "#circle" + i;
			//console.log(node);
			var node_heat_x = $(node).position()['left'] + offsetx;
			var node_heat_y = $(node).position()['top'] + offsety;
			heatmap.store.addDataPoint(node_heat_x, node_heat_y, util[i]/*getElementHeat(Object.keys(servers)[i])*/);
		}
	}
	else {
		for (var i in clusterdata["servers"]) {
			if (clusterdata["servers"][i]["statistics"]["cpu_util"] && clusterdata["servers"][i]["status"] != "SHUTOFF") {
				var node = "#circle" + i;
				var latestdate = Object.keys(clusterdata["servers"][i]["statistics"]["cpu_util"]).sort().pop()
				var value = clusterdata["servers"][i]["statistics"]["cpu_util"][latestdate];
				var node_heat_x = $(node).position()['left'] + offsetx;
				var node_heat_y = $(node).position()['top'] + offsety;
				heatmap.store.addDataPoint(node_heat_x, node_heat_y, value);
			}
		}
		//console.log(heatmap.store.exportDataSet())
		setTimeout(updateHeatmapReal, 1000);
	}
}

/**
 *	Pulls server data, but does it directly using the OpenStack APIs, so doesn't need to be on the same host. The APIs are much slower this way, so not used for now.
 */
function getTotalDevices() {
	var token;
	$.ajax({
	    url: "http://10.10.30.23:8082/location/unique",
	    type: "GET",
	    //data: '{"start_time":"2014-05-19T14:18:40.990-0700", "end_time":"2014-05-19T14:18:40.990-0700"}',
	    success: function( data ) {
	    		totals = JSON.parse(data);
	    		
    			$("#today").html("Unique Devices Today: " + totals["unique_devices"]);
	    	}
	});
	setTimeout(getTotalDevices, 60000);
}

function getHistoryData() {
	var token;
	$.ajax({
	    url: "http://10.10.30.23:8082/location/history/bc:f5:ac:e3:1e:34",
	    type: "GET",
	    //data: '{"start_time":"2014-05-19T14:18:40.990-0700", "end_time":"2014-05-19T14:18:40.990-0700"}',
	    success: function( data ) {
	    	//console.log(data)
	    	var cmxdata = JSON.parse(data);
	    	console.log(cmxdata);
	    	//$("#devtotal").html("No. of Devices: " + cmxdata.length)
	    	heatmap.store.setDataSet({ max: 100, data: []});
	    	//console.log("new poll");
	    	var devlabs = 0
	    	for (i in cmxdata) {
	    		if (cmxdata[i]["x"] > 50 && cmxdata[i]["x"] < 100) {
	    			//console.log(cmxdata[i]);
	    		}
	    		//if (cmxdata[i]["mac"] == "40:b0:fa:c1:3a:85" /*|| cmxdata[i]["mac"] == "bc:f5:ac:e3:1e:34" && cmxdata[i]["currentlyTracked"] == true*/) {
	    			//console.log(cmxdata[i])
	    			heatmap.store.addDataPoint(cmxdata[i]["x"] * 9 - 300/* * 5 + 50*/, cmxdata[i]["y"] * 9 - 300 /** 5 - 80*/, 25)
	    		//}


	    		//console.log(cmxdata[i])
	    		
	    	}
	    	setTimeout(getHistoryData, 500);
	    	
	        // console.log(data);
	    }
	});
}



/**
 *	Pulls server data, but does it directly using the OpenStack APIs, so doesn't need to be on the same host. The APIs are much slower this way, so not used for now.
 */
function getOpenStackData() {
	var token;
	$.ajax({
	    url: "http://10.10.30.23:8082/location",
	    type: "GET",
	    success: function( data ) {
	    	//console.log("New Data");
	    	var cmxdata = JSON.parse(data);
	    	
	    	heatmap.store.setDataSet({ max: 100, data: []});
	    	//console.log("new poll");
	    	macpriority = []
	    	var devlabs = 0;
	    	var springroll = 0;
	    	var arcade = 0;
	    	var theatre = 0
	    	$(".point").remove();
	    	for (i in cmxdata) {
	    		if (cmxdata[i]["x"] > 115 && cmxdata[i]["x"] < 165 && cmxdata[i]["y"] > 80 && cmxdata[i]["y"] < 100) {
	    			devlabs++
	    			if (macpriorityval = "labs") {
	    				macpriority.push(cmxdata[i]["mac"]);
	    			}
	    			//console.log(cmxdata[i])
	    		}
	    		if (cmxdata[i]["x"] > 175 && cmxdata[i]["x"] < 190 && cmxdata[i]["y"] > 80 && cmxdata[i]["y"] < 100) {
	    			springroll++
	    			if (macpriorityval = "spring") {
	    				macpriority.push(cmxdata[i]["mac"]);
	    			}
	    		}
	    		if (cmxdata[i]["x"] > 60 && cmxdata[i]["x"] < 110 && cmxdata[i]["y"] > 70 && cmxdata[i]["y"] < 120) {
	    			arcade++
	    			if (macpriorityval = "arcade") {
	    				macpriority.push(cmxdata[i]["mac"]);
	    			}
	    		}
	    		if (cmxdata[i]["x"] > 190 && cmxdata[i]["x"] < 250 && cmxdata[i]["y"] > 80 && cmxdata[i]["y"] < 100) {
	    			theatre++
	    			if (macpriorityval = "theat") {
	    				macpriority.push(cmxdata[i]["mac"]);
	    			}
	    		}
	    		//if (cmxdata[i]["mac"] == "40:b0:fa:c1:3a:85" /*|| cmxdata[i]["mac"] == "bc:f5:ac:e3:1e:34" && cmxdata[i]["currentlyTracked"] == true*/) {
	    			//console.log(cmxdata[i])
	    			heatmap.store.addDataPoint(cmxdata[i]["x"] * 9 - 300/* * 5 + 50*/, cmxdata[i]["y"] * 9 - 300 /** 5 - 80*/, 25)
	    		//}
	    		//console.log(cmxdata[i])
	    		
	    		if (cmxdata[i]["mac"] == "3c:a9:f4:4d:40:5c" || cmxdata[i]["mac"] == "4c:b1:99:55:7e:b4" || cmxdata[i]["mac"] == "8c:70:5a:c9:40:50" || cmxdata[i]["mac"] == "10:a5:d0:08:c3:57") {
	    			$("body").append("<div class='point glyphicon glyphicon-remove' style='left: " + Math.round(cmxdata[i]["x"] * 9 - 300) + "px; top: " + Math.round(cmxdata[i]["y"] * 9 - 300) + "px'> ")
	    		}
	    		
	    		
	    	}

	    	var list = ""

	    	for (i in macpriority) {
	    		list += macpriority[i] + "<br />"
	    	}

	    	$("#macpri").html(list);

			$("#devtotal").html("No. of Devices: " + cmxdata.length);
			$("#devlabs").html("Lab Space: " + devlabs);
			$("#springroll").html("Springroll: " + springroll);
			$("#arcade").html("Arcade: " + arcade);
			$("#theatre").html("Theatre: " + theatre);

	    	setTimeout(getOpenStackData, 500);
	    	
	        // console.log(data);
	    }
	});
}


// t https://10.10.20.21/api/contextaware/v1/location/clients/
// headers = {'Authorization': 'Basic ZGV2dXNlcjpkZXZ1c2Vy'}
//     headers['Accept'] = 'application/json'