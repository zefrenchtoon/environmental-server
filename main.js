var http = require("http");
var jsonBody = require("body/json");
var sqlite3 = require('sqlite3');

sqlite3.verbose();
var db;
createDb();

http.createServer(function (req, res) {
	if (req.method === 'GET') {
		readAllRows(function (result) {
			res.setHeader("content-type", "application/json");
			res.end(JSON.stringify(result));
		});
	}
	if (req.method === 'POST') {
		jsonBody(req, res, function (err, body) {
			console.log("received: " + JSON.stringify(body));
			// err is probably an invalid json error
			if (err) {
				res.statusCode = 500;
				return res.end("Unknown Error …");
			}

			//TODO: save data in DB
			insertRows(body);
			res.setHeader("content-type", "text/plain");
			res.end("ok !");

			// I am an echo server
//		res.setHeader("content-type", "application/json");
//		res.end(JSON.stringify(body));
		});
	}
}).listen(9000);

function createDb() {
	console.log("createDb");
	db = new sqlite3.Database('environmental_db.db', createTable);
}

function createTable() {
	console.log("createTable");
	db.run("CREATE TABLE IF NOT EXISTS sensor_data (timestamp INTEGER, temperature REAL, pressure REAL, humidity REAL, altitude REAL)");
}

function insertRows(data) {
	console.log("insertRows");
	db.serialize(function () {
		var stmt = db.prepare("INSERT INTO sensor_data VALUES (?,?,?,?,?)");

		stmt.run(data.timestamp, data.temperature, data.pressure, data.humidity, data.altitude);

		stmt.finalize();
	});
}

function readAllRows(callback) {
	console.log("readAllRows");
	db.serialize(function () {
		db.all("SELECT * FROM sensor_data", function (err, rows) {
			/*var result = [];
			 rows.forEach(function (row) {
			 result.push({
			 "timestamp": row.timestamp,
			 "temperature": row.temperature,
			 "pressure": row.pressure,
			 "humidity": row.humidity,
			 "altitude": row.altitude
			 });
			 });*/
			if (callback) {
				callback(rows);
			}
		});
	});
}

function closeDb() {
	console.log("closeDb");
	db.close();
}
