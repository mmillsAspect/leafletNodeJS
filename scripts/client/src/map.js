
var layer;
var map;
var layerLabels;
var samplePoints;

function loadMap()
{
	map = L.map('map2D').setView([47.428, -121.780], 10);
    setBasemap("Topographic");
    var basemaps = document.getElementById('basemapsDDL');
    var threeControl = $("#threeControl");
    basemaps.addEventListener('change', function(){
        setBasemap(basemaps.value);
    });
    map.on('zoomend', function() {
        if(map.getZoom() > 15)
        {
            threeControl.prop('enabled', false);
        }
        else
        {            
            threeControl.prop('enabled', true);
        }
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

	samplePoints = L.esri.Cluster.featureLayer({
		url: 'https://gismaps.kingcounty.gov/arcgis/rest/services/WLRD/gw_wells/MapServer/0'
	});
    map.addLayer(samplePoints);

    samplePoints.bindPopup(function (item) {
        return L.Util.template('<p>Location: {LOC_NAME}<br>Source Type: {SRC_TYPE}<br>Well Depth: {WELL_DEPTH}</p>', item.feature.properties);
    });
    if(scene)
    {
        var extent = map.getBounds();
        var width = window.innerWidth;
        var height = window.innerHeight;
        var mapurl = layer._url.toString().replace("/tile/{z}/{y}/{x}", "").replace("{s}", "services");
        createTerrain(width, height, extent, mapurl);
    }
}

  