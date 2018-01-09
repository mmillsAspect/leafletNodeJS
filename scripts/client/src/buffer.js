
var layer;
var map;
var layerLabels;
var samplePoints;
var parcelLots;
var featureCollection;

function loadMap()
{
	map = L.map('map2D').setView([47.428, -121.780], 10);
    setBasemap("Topographic");
    var basemaps = document.getElementById('basemapsDDL');
    //var threeControl = $("#threeControl");
	$("#threeControl").hide();
	$("#twoControl").hide();
    basemaps.addEventListener('change', function(){
        setBasemap(basemaps.value);
    });
    //map.on('zoomend', function() {
    //    if(map.getZoom() > 15)
    //    {
    //        threeControl.prop('enabled', false);
    //    }
    //    else
    //    {            
    //        threeControl.prop('enabled', true);
    //    }
    //});
	addControls();   
}

function addControls()
{
	var drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Initialise the draw control and pass it the FeatureGroup of editable layers
    var drawControl = new L.Control.Draw({
        draw: {			
            point: false,
            line: false,
            polygon: false,
            marker: false,
			circle: false
        },
        edit: {
            featureGroup: drawnItems,
            remove: true
        },
        delete: {
            featureGroup: drawnItems,
            remove: true
        }
    });
    map.addControl(drawControl);
	
	$(".leaflet-draw-edit-edit").css("display", "none");
	$(".leaflet-draw-edit-remove").css("display", "none");
    map.on('draw:created', function (e) {
        var layer = e.layer;
        var geoJson = layer.toGeoJSON()		
		var query = new L.esri.query({
			url: "http://gismaps.kingcounty.gov/arcgis/rest/services/Property/KingCo_Parcels/MapServer/0/"
		});
		query.intersects(layer);
		query.run(function(error, result, response){
			if(featureCollection)
			{
				map.removeLayer(featureCollection);				
			}
			featureCollection = L.geoJson(result);
			featureCollection.bindPopup(function (item) {
				return L.Util.template('<p>OBJECTID: {OBJECTID}<br>MAJOR: {MAJOR}<br>MINOR: {MINOR}</p><br>PIN: {PIN}</p>', item.feature.properties);
			});
			
			map.addLayer(featureCollection);
		});		
    });
}

function setBasemap(basemap) {
    
    layer = L.esri.basemapLayer(basemap);
    map.addLayer(layer);
    if (layerLabels) {
      map.removeLayer(layerLabels);
    }

    if (basemap === 'ShadedRelief' || basemap === 'Oceans' || basemap === 'Gray' || basemap === 'DarkGray' || basemap === 'Imagery' || basemap === 'Terrain') {
      layerLabels = L.esri.basemapLayer(basemap + 'Labels');
      map.addLayer(layerLabels);
    }
	/*
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
	*/
}

  