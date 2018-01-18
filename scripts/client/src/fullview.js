
var layer;
var map;
var layerLabels;
var samplePoints;
var whereClause = "";

function loadMap()
{
	var ShadedRelief = L.layerGroup();
	L.esri.basemapLayer("ShadedRelief").addTo(ShadedRelief);
	L.esri.basemapLayer("ShadedReliefLabels").addTo(ShadedRelief);
	var Oceans = L.layerGroup();
	L.esri.basemapLayer("Oceans").addTo(Oceans);
	L.esri.basemapLayer("OceansLabels").addTo(Oceans);
	var Gray = L.layerGroup();
	L.esri.basemapLayer("Gray").addTo(Gray);
	L.esri.basemapLayer("GrayLabels").addTo(Gray);
	var DarkGray = L.layerGroup();
	L.esri.basemapLayer("DarkGray").addTo(DarkGray);
	L.esri.basemapLayer("DarkGrayLabels").addTo(DarkGray);
	var Imagery = L.layerGroup();
	L.esri.basemapLayer("Imagery").addTo(Imagery);
	L.esri.basemapLayer("ImageryLabels").addTo(Imagery);
	var Terrain = L.layerGroup();
	L.esri.basemapLayer("Terrain").addTo(Terrain);
	L.esri.basemapLayer("TerrainLabels").addTo(Terrain);
	
	var baseMaps = {
		"Topographic": L.esri.basemapLayer("Topographic"),
		"Streets": L.esri.basemapLayer("Streets"),
		//"National Geographic": L.esri.basemapLayer("NationalGeographic"),
		//"Oceans": Oceans,
		//"Shaded Relief": ShadedRelief,
		//"DarkGray": DarkGray,
		"Imagery": Imagery,
		"Gray": Gray,
		//"Terrain": Terrain
	};
	
	samplePoints = L.esri.Cluster.featureLayer({
		url: 'https://gismaps.kingcounty.gov/arcgis/rest/services/WLRD/gw_wells/MapServer/0'
	});
    samplePoints.bindPopup(function (item) {
        return L.Util.template('<p>Location: {LOC_NAME}<br>Source Type: {SRC_TYPE}<br>Well Depth: {WELL_DEPTH}</p>', item.feature.properties);
    });	
	
	var overlays = {
      "Monitoring Wells": samplePoints
	};
	map = L.map('map2D', {
		  center: [47.428, -121.780],
		  zoom: 10,
		  layers: [baseMaps["Topographic"], samplePoints]
	});
 
	
	L.control.layers(baseMaps, null, {position: 'bottomleft'}).addTo(map);
	L.control.toc(null, overlays, {position: 'topright'}).addTo(map);
	L.control.scale({metric: false, position: 'bottomright'}).addTo(map);	
	L.control.navbar().addTo(map);
}



function filterWells()
{
	whereClause = "";
	if($("#txtSearch").val() !== "")
		whereClause = "LOC_NAME like '%"+$("#txtSearch").val()+"%'";
	samplePoints.setWhere(whereClause);
	return false;
}

var degrees2meters = function(lon,lat) {
        var x = lon * 20037508.34 / 180;
        var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
        y = y * 20037508.34 / 180;
        return [x, y]
}

function printMap(layout)
{
	layout = layout === "portrait" ? "Letter ANSI A Portrait" : "Letter ANSI A Landscape";
	
	var zoomLevel = zoomLev = map.getZoom();
	
	var bounds = map.getBounds();
	var southWest = degrees2meters(bounds._southWest.lng, bounds._southWest.lat);
	var northEast = degrees2meters(bounds._northEast.lng, bounds._northEast.lat);		
	var layers = map._layers;
	var urls = [];
	for (var key in layers) {		
		if(layers[key]._url)
		{
			urls.push(layers[key]._url.replace("http://{s}", "https://services").replace("https://{s}", "https://services").replace("/tile/{z}/{y}/{x}", ""));
		}
	}	
	var operationalLayers = [];
	for(var i=0; i< urls.length; i++)
	{
		operationalLayers.push({"opacity":1,"minScale":0,"maxScale":0,"url":urls[i]});
	}
	operationalLayers.push({"id":"gw_wells","title":"gw_wells","url":"https://gismaps.kingcounty.gov/arcgis/rest/services/WLRD/gw_wells/MapServer"});//,"visibleLayers":[0]});
	
	$("#ajax_loader").show();
	var mapJSON = {"mapOptions":{"showAttribution":true,"extent":{"xmin":southWest[0],"ymin":southWest[1],"xmax":northEast[0],"ymax":northEast[1],"spatialReference":{"wkid":102100}},"spatialReference":{"wkid":102100}},
		"operationalLayers":operationalLayers
		,"exportOptions":{"outputSize":[800,1100],"dpi":96},
		"layoutOptions":{"titleText":"Water Monitoring Map Demo","scaleBarOptions":{"metricUnit":"esriKilometers","metricLabel":"km","nonMetricUnit":"esriMiles","nonMetricLabel":"mi"},"legendOptions":{"operationalLayers":[]}}};

	
	$.ajax({  
	   url:'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task/execute',  
	   type:'POST',  
	   dataType:'json',  
	   data:({  
		  Format:"pdf",  
		  Layout_Template: layout,  
		  Web_Map_as_JSON:JSON.stringify(mapJSON),  
		  f:'json'  
	   }),  
	   success:function(response){  
		  $("#ajax_loader").hide();
		   if(response.error)
		   {
			   alert("Print Failed, ESRI!!");
		   }
		   else{
			  window.open(response.results[0].value.url);
		   }
	   },  
	   error:function(xhr, status, error) {  
		  console.log(error);  
	   }  
	});  
	
}

function showInfo() {
	$("#modalTitle").html("King County - Monitoring Wells");
	$("#modalBody").html("Zoom in and out to see clustering of monitoring wells in King County. Zooming in far enough will reveal individual wells which you can click on to see the wells information.");
	$('#exampleModal').modal('show');
	$('#btnClose').show();
	$('#btnSave').hide();
	$('#btnCancel').hide();
	
}

  