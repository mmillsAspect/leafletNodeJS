
var layer;
var map;
var layerLabels;
var samplePoints;
var sampleResults;
var selectedSample;

function loadMap()
{
	map = L.map('map2D').setView([47.850, -122.5462], 15);
    setBasemap("Topographic");
    var basemaps = document.getElementById('basemapsDDL');
    var threeControl = $("#threeControl");
    basemaps.addEventListener('change', function(){
        setBasemap(basemaps.value);
    });
	threeControl.prop('disabled', true);
    map.on('zoomend', function() {
		console.log("map.getZoom()", map.getZoom());
        if(map.getZoom() > 14)
        {
            threeControl.prop('disabled', false);
        }
        else
        {            
            threeControl.prop('disabled', true);
        }
    });
}

function getResults(sampleName){
	var newResults = [];
	for(var i=0; i < results.length; i++)
	{
		if(results[i].l === sampleName)
		{
			newResults.push(results[i]);
		}
	}
	return newResults;
}

function buildAnalytesList(newResults)
{
	var analyteList = [];
	
	for(var i=0; i < newResults.length; i++)
	{		
	    var foundAnalyte = false;
		for(var j=0; j< analyteList.length; j++)
		{
			if(newResults[i].c === analyteList[j])
			{
				foundAnalyte = true;
				break;
			}
		}
		if(!foundAnalyte)
		{
			analyteList.push(newResults[i].c);
		}
	}
	analyteList.sort();
	var analyteHtml = "<h5>Select Parameter: &nbsp;<select id='analyteDDL' onchange='buildPlot()'>";
	for(var j=0; j< analyteList.length; j++)
	{ 
		analyteHtml = analyteHtml + "<option>" +  analyteList[j] + "</option>";
	}
	analyteHtml = analyteHtml + "</select></h5>";
	$("#analytesDiv").html(analyteHtml);
}

function sampleClicked(e) {
  // e = event
	sampleSelected = e.target.feature.properties.name;
    sampleResults = getResults( sampleSelected );
  
	$("#exampleModalLabel").html( sampleSelected );
	$("#plotDiv").html("");
	$('#exampleModal').modal('show');
	buildAnalytesList(sampleResults);
	buildPlot();
}

function buildPlot(){
	console.log();
	var selectedAnalyte = $("#analyteDDL").val();
	var xvals = [];
	var yvals = [];
	var unit = "";
	for(var i=0; i < sampleResults.length; i++)
	{
		if(sampleResults[i].c === selectedAnalyte)
		{
			unit = sampleResults[i].u;
			console.log("Date", sampleResults[i].d.split(" ")[0].split("/")[2] + "-" + sampleResults[i].d.split(" ")[0].split("/")[0] + "-" + sampleResults[i].d.split(" ")[0].split("/")[1]);
			yvals.push(sampleResults[i].r);
			xvals.push(sampleResults[i].d.split(" ")[0].split("/")[2] + "-" + sampleResults[i].d.split(" ")[0].split("/")[0] + "-" + sampleResults[i].d.split(" ")[0].split("/")[1]);			
		}
	} 
	
	var trace3 = {
	  x: xvals,
	  y: yvals,
	  mode: 'lines+markers',
	  name: unit
	};

	var data = [ trace3 ];
	
	

var layout = {
  title: sampleSelected + " - " + selectedAnalyte,
  xaxis: {
    title: 'xDate',
    titlefont: {
      size: 12,
      color: '#333333'
    }
  },
  yaxis: {
    title: selectedAnalyte + "(" + unit + ")",
    titlefont: {
      size: 12,
      color: '#333333'
    }
  }
};


	Plotly.newPlot('plotDiv', data, layout);
}

function showInfo() {
	$("#exampleModalLabel").html("Water Quality Data");
	$("#plotDiv").html("Click on each sampling location to see that locations analytical data.");
	$("#analytesDiv").html("");
	$('#exampleModal').modal('show');
}

function setBasemap(basemap) {
    if (layer) {
      map.removeLayer(layer);
    }
    layer = L.esri.basemapLayer(basemap);
    map.addLayer(layer);
    if (layerLabels) {
      map.removeLayer(layerLabels);
    }

    if (basemap === 'ShadedRelief' || basemap === 'Oceans' || basemap === 'Gray' || basemap === 'DarkGray' || basemap === 'Imagery' || basemap === 'Terrain') {
      layerLabels = L.esri.basemapLayer(basemap + 'Labels');
      map.addLayer(layerLabels);
    }

	
	samplePoints = L.geoJson(locations, {
		onEachFeature: function(feature, layer) {
			label = String(feature.properties.name);
			layer.bindTooltip(feature.properties.name)
			layer.on({
				click: sampleClicked
			});
		}
	}).addTo(map);
	
    if(scene)
    {
        var extent = map.getBounds();
        var width = window.innerWidth;
        var height = window.innerHeight;
        var mapurl = layer._url.toString().replace("/tile/{z}/{y}/{x}", "").replace("{s}", "services");
        createTerrain(width, height, extent, mapurl);
    }
}

  