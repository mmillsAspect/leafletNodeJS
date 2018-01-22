var url = require('url');
var path = require('path');
var when = require('when');
const sql = require('mssql/msnodesqlv8');
var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'google',
  httpAdapter: 'https', // Default
  apiKey: '', // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};

var sqlConnection = {
	database: '',
	server: '',
	driver: 'msnodesqlv8',
	options: {
		trustedConnection: true
	}
};

const pool = new sql.ConnectionPool(sqlConnection);
	
function getProjectData()
{
	var d = when.defer();
	pool.request().query('select * from dt_proj where Lat is NULL', (err, result) => {
			d.resolve(result); 
	})
	return d.promise;
}

function getCoordinates(location)
{
	var d = when.defer();
	var geocoder = NodeGeocoder(options);
	geocoder.geocode(location)
	  .then(function(res) {
		  if(res[0])
		  {
			d.resolve([res[0].latitude, res[0].longitude]);
		  }
		  else{
			d.resolve([0, 0]);
		  }
	  })
	  .catch(function(err) {	
			d.resolve([0, 0]);
	  });
	return d.promise;
}

function updateSql(record, coordinates) 
{	
	var d = when.defer();
	var latitude = coordinates[0].toString() == "0" ? "NULL" : coordinates[0].toString();
	var longitude = coordinates[1].toString() == "0" ? "NULL" : coordinates[1].toString();
	var updateQuery = 'update dt_proj set lat = ' + latitude + ', Long = ' + longitude + ' where prjKey = ' + record.prjKey.toString();
	pool.request().query(updateQuery , (err, result) => {
			d.resolve(result); 
	});
	return d.promise;
}

function finalSql() 
{	
	var d = when.defer();
	var updateQuery = "update dt_proj set ProjectLocation = geography::Point(Lat, Long, 4326), CoordinateSource='Google' where Lat is not NULL";
	pool.request().query(updateQuery , (err, result) => {
			d.resolve(result); 
	})
	return d.promise;
}

function updateRecord(recordSet, position)
{
	var record = recordSet[position];
	getCoordinates(record.prjLocation).then(function(coordinates)
	{				
		updateSql(record, coordinates).then(function(result)
		{
			position = position + 1;
			if(position >= recordSet.length){
				finalSql().then(function(result)
				{
					console.log("Update complete");
				});
			}
			else{
				updateRecord(recordSet, position);
			}
		});		
	});
}

function startProjectDataUpdate()
{
	console.log("Lets start this thing!");
	getProjectData().then(function(result)
	{
		if(result.recordsets[0].length > 0)
			updateRecord(result.recordsets[0], 0);
		else
			console.log("Nothing to update");
	});
}

pool.connect().then(() => {
	console.log("Connected!");
	startProjectDataUpdate();
});
