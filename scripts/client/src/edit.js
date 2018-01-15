
var layer;
var map;
var layerLabels;
var mwPoints;

function loadMap()
{
	map = L.map('map2D').setView([47.428, -121.780], 10);
    setBasemap("Topographic");
    var basemaps = document.getElementById('basemapsDDL');
    var threeControl = $("#threeControl");
    basemaps.addEventListener('change', function(){
        setBasemap(basemaps.value);
    });
}

function startEdit()
{
	
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

	mwPoints = L.esri.Cluster.featureLayer({
		url: 'https://services2.arcgis.com/1UvBaQ5y1ubjUPmd/arcgis/rest/services/Groundwater_Monitoring_Wells/FeatureServer/0'
	});
    map.addLayer(mwPoints);
	
    samplePoints.bindPopup(function (item) {
        return L.Util.template('<p>Name: {NAME}<br>Basin: {BASIN_GP}<br>Active: {ACTIVE}<br>Hydro Type: {HYDRO_TY}<br>DEPTH: {DEPTH }<br>DATE: {DATE_}<br>LAT: {LAT}<br>LONG: {LONG}<br> </p>', item.feature.properties);
    });
}

  