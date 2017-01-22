// Setup variables
var express = require('express');
var bodyParser = require('body-parser');
var mongojs = require('mongojs')
var db = mongojs('GardenData');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

// *********
// Functions
// *********

// issueCommand: Set a command in the DB to the given value
var issueCommand = function (commandName, value, callback) {
	console.log('Setting ' + commandName + ' to ' + value + '.');	
	db.collection("commands").update(
		{name: commandName}, // search query
		{$set: {value: value} }, // set "value" attribute to passed value
		{}, // options
		function(error, value, lastErrorObject) {
			var resp;
			if (error) resp = 'Error';
			else resp = 'Success';
			callback(resp);
		}	
	);
}	

// getSetting: Return the current value of a setting from the DB
var getSetting = function(settingName, callback) {
	console.log('Retrieving ' + settingName + ' from DB.');
	db.collection("settings").findOne(
		{name: settingName}, // search query
		{_id: false}, // return the name and value fields
		function(error, returnDoc) {
			var resp;
			if (error) resp = 'Error';
			else resp = returnDoc;
			callback(resp);
		}
	);
};
						

// ******************
// Routes for the API
// ******************

// issueCommand
// Sets a command item in the DB to true, to 
// be read in by the python script and react accordingly
app.post('/issueCommand', function(req, res) {
	issueCommand(req.body.command, true, function (response) {
		console.log(response);
		res.json(response);
	});
});

// getSetting
// Reads in the current value of a setting from the DB
app.get('/getSetting', function(req, res) {
	getSetting(req.query.setting, function(response) {	
		console.log(response);
		res.json(response);
	});
});

// Serve up the homepage
app.get('/', function(req,res) {
	res.sendFile('Pages/index.html', { root : __dirname});
});

// Start the server
app.listen(port);
console.log('GardenServer App listening on port ' + port);
