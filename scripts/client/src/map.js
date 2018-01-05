
var layer;
var map;
var layerLabels;
var serviceLayers;
var services = [];

function loadMap()
{
	map = L.map('map2D').setView([45.528, -122.680], 13);
    setBasemap("Topographic");
    var basemaps = document.getElementById('basemapsDDL');
    basemaps.addEventListener('change', function(){
        setBasemap(basemaps.value);
    });
}

function loadServices()
{
	services = [];
	L.esri.dynamicMapLayer({ url: 'http://gismaps.kingcounty.gov/arcgis/rest/services/Property/KingCo_Parcels/MapServer', opacity: 0.9 }).addTo(map);
	
	var parcels = L.esri.featureLayer({
        url: "http://gismaps.kingcounty.gov/arcgis/rest/services/Property/KingCo_Parcels/MapServer/0",
        style: function () {
          return { color: "#70ca49", weight: 2 };
        }
    }).addTo(map);

	var parcelTemplate = "<h3>{MAJOR}</h3>{MINOR} Acres<br>{PIN}";

	parcels.bindPopup(function(e){
        return L.Util.template(parcelTemplate, e.feature.properties)
      });
	services.push(parcels);
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
	
	for(var i=0; i < services.length; i++)
	{		
      map.removeLayer(services[i]);
	}
	loadServices();

    if(scene)
    {
        var extent = map.getBounds();
        var width = window.innerWidth;
        var height = window.innerHeight;
        var mapurl = layer._url.toString().replace("/tile/{z}/{y}/{x}", "").replace("{s}", "services");
        createTerrain(width, height, extent, mapurl);
    }
}

  