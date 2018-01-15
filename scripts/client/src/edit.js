
var layer;
var map;
var layerLabels;
var mwPoints;

function loadMap()
{
	
	$('#btnClose').show();
	$('#btnSave').hide();
	$('#btnCancel').hide();
	map = L.map('map2D').setView([47.13276408, -122.42813534], 10);
    setBasemap("Topographic");
    var basemaps = document.getElementById('basemapsDDL');
    var threeControl = $("#threeControl");
    basemaps.addEventListener('change', function(){
        setBasemap(basemaps.value);
    });
}

function startEdit()
{
	
	map.on('click', function(e) {
		showEditModal(e);
  });
	
}

function saveEdit()
{
	var newFeatures = [{
		"geometry":{"x":$('#longInput').val(),"y":$('#latInput').val(),"spatialReference":{"wkid":4326}},
		"attributes":{
			"NAME": $('#nameInput').val(),
			"BASIN_GP": $('#basinInput').val(),
			"ACTIVE":$('#activeInput').val(),
			"HYDRO_TY":$('#hydroInput').val(),
			"DEPTH": $('#depthInput').val(),
			"LAT": $('#latInput').val(),
			"LONG": $('#longInput').val()
		}
	}];
	
	var postData = {
		features: JSON.stringify(newFeatures),
		rollbackOnFailure:false,
		f:"pjson",
		token:"NCwBKd774QLehHHL8mhwI2YQqIIs7g6smWa1Yu7PTpV3HuoWXZ5aEvG6OpDnzOBM7nRfXffKJZNaoDfkUPI7GwTOCmUVqGGs7JMteTOqn44Id6goYpmKZKxge1odGpUkh4x8iR2A678goQ4kgF5tyofV7Rx82UDuaJqU-a8Mcw7gDL1nETNdPkt_YMUl3LvpcjrSxMMALLhJAWjLpg9zEc7wWbRm8BjOOxkabKxDNm87K4NP15JH-2fANLzJB3e0"
	};
	
	$.ajax({
	  type: "POST",
	  url: "https://services.arcgis.com/PV0gqqATVfCt173z/arcgis/rest/services/Monitoring_Wells/FeatureServer/0/addFeatures",
	  data: postData,
	  success: function(s){
		  map.removeLayer(mwPoints);
		  addFeatureLayer();		  
	  },
	});

	map.off('click');
	$('#exampleModal').modal('hide');
}

function cancelEdit()
{
	map.off('click');
	$('#exampleModal').modal('hide');
}

function showEditModal(e)
{
	console.log("click e", e)
	$("#exampleModalLabel").html("Add Monitoring Well");
	$("#plotDiv").html('<div class="form-group"><label for="nameInput">Name: </label> <input type="text" class="form-control" id="nameInput"  placeholder="Enter Name"></div><div class="form-group"><label for="basinInput">Basin: </label>    <input type="text" class="form-control" id="basinInput"  placeholder="Enter Basin">  </div>  <div class="form-group"><label for="activeInput">Active: </label>    <input type="text" class="form-control" id="activeInput"  placeholder="(Yes or No)">  </div>  <div class="form-group"><label for="hydroInput">Hydro Type: </label>    <input type="text" class="form-control" id="hydroInput"  placeholder="Enter Hydro Type (ex. Groundwater)">  </div>  <div class="form-group"><label for="depthInput">DEPTH: </label><input type="text" class="form-control" id="depthInput"  placeholder="Enter Depth"></div><div class="form-group"><label for=latInput">LATITUDE: </label><input type="text" class="form-control" id="latInput"  placeholder="Enter Latitude"></div><div class="form-group"><label for=longInput">LONGITUDE: </label><input type="text" class="form-control" id="longInput"  placeholder="Enter Longitude"></div>');
	$("#analytesDiv").html("");
	$('#exampleModal').modal('show');
	
	$('#btnClose').hide();
	$('#btnSave').show();
	$('#btnCancel').show();
	
	$('#latInput').val(e.latlng.lat);
	$('#longInput').val(e.latlng.lng);
	

}

function showInfo() {
	$("#exampleModalLabel").html("Pierce County - Monitoring Wells with Add Feature");
	$("#plotDiv").html("Click to view the details of each monitoring well and press the '+ Add Well' button to add a well location. After clicking on the button, simply click the map where you want the well to be and fill out the information required and press save.");
	$("#analytesDiv").html("");
	$('#exampleModal').modal('show');
	
	$('#btnClose').show();
	$('#btnSave').hide();
	$('#btnCancel').hide();
	
}


function deleteFeature(id)
{
	map.closePopup();
	mwPoints.deleteFeatures([id], function(error, response) {
    });
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

	addFeatureLayer();
}

function addFeatureLayer(){
	mwPoints = L.esri.Cluster.featureLayer({
		url: 'https://services.arcgis.com/PV0gqqATVfCt173z/arcgis/rest/services/Monitoring_Wells/FeatureServer/0'
	});
    map.addLayer(mwPoints);
	
    mwPoints.bindPopup(function (item) {
        return L.Util.template('<p>Name: {NAME}<br>Basin: {BASIN_GP}<br>Active: {ACTIVE}<br>Hydro Type: {HYDRO_TY}<br>DEPTH: {DEPTH}<br>LAT: {LAT}<br>LONG: {LONG}<br><br> <a onclick="deleteFeature({OBJECTID})">Delete Well</a> </p>', item.feature.properties);
    });
}

  