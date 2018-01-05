
var layer;
var map;
var layerLabels;
var samplePoints;

function loadMap()
{
	map = L.map('map2D').setView([45.528, -122.680], 13);
    setBasemap("Topographic");
    var basemaps = document.getElementById('basemapsDDL');
    var threeControl = $("#threeControl");
    basemaps.addEventListener('change', function(){
        setBasemap(basemaps.value);
    });
    map.on('zoomend', function() {
        if(map.getZoom() > 15)
        {
            threeControl.prop('disabled', false);
        }
        else
        {            
            threeControl.prop('disabled', true);
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
    samplePoints = L.esri.featureLayer('http://gismaps.kingcounty.gov/arcgis/rest/services/WLRD/gw_wells/MapServer/0');
    map.addLayer(samplePoints);

    samplePoints.bindPopup(function (feature) {
        return L.Util.template('<p>Location: {LOC_NAME}<br>Source Type: {SRC_TYPE}<br>Well Depth: {WELL_DEPTH}</p>', feature.properties);
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

  