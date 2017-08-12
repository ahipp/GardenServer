// Setup package references
// Stell Packagebezuege ein
var express = require('express');
var bodyParser = require('body-parser');
var mongojs = require('mongojs');
// Either need to fix some source code on this, or more likely, change
// out this node package since it appears to be no longer supported
var gpio = require("pi-gpio");

var collections = ['tempSensor1', 'tempSensor2'];
var db = mongojs('GardenData', collections);

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

// Global variables
// Globalische Variablen
var recordDataInterval = 10; // seconds
var commandStatus = {};
commandStatus['automatedControl'] = true;
commandStatus['fishTankHeaterEnabled'] = false;
commandStatus['soilCoilHeaterEnabled'] = false;

var pinNumbers = {};
pinNumbers['tankHeater'] = 11;
pinNumbers['coilHeater'] = 12;
pinNumbers['temp1'] = 15;
pinNumbers['temp2'] = 16;
gpio.setDirection(pinNumbers['tankHeater'], 'output');
gpio.setDirection(pinNumbers['coilHeater'], 'output');
gpio.setDirection(pinNumbers['temp1'], 'input');
gpio.setDirection(pinNumbers['temp2'], 'input');

var recordData = function() { 
	console.log('recordData');
	var temp1Reading = readPin(pinNumbers['temp1']);
	var temp2Reading = readPin(pinNumbers['temp2']);
	var currentTimestamp = new Date();
	
	// Write data out to mongoDB
	// Schreib Daten zur MongoDB
	db.tempSensor1.insert({'timeStamp': currentTimestamp, 'value': temp1Reading});
	db.tempSensor2.insert({'timeStamp': currentTimestamp, 'value': temp2Reading});
}

/* Automated control is going to be step 2. Step 1, just get it to set
 * controls from POST calls and return temperature data from GET calls
var manageControls = function() {
	// With automated control enabled, use data to determine whether
	// each heater should be turned on or off.
	// Wenn die automatische Kontrol aktiviert wird, Daten werden verwendet,
	// um ob jede Heizkoerper ein- oder ausschaltet soll festzulegen.
	if (commandStatus['automatedControl']) {
		console.log('Automated control enabled');
		var queryGTTimestamp = new Date(new Date().getTime() - (1 * 60 * 60 * 1000));
		db.tempSensor1.find({'timeStamp': {'$gte' : queryGTTimestamp}}, {_id: 0}, function(err, docs) {
			console.log(docs);
		});
	}
}
* */

var setCommand = function(command) {
	console.log(command + ' applied at ' + Date().toLocaleString());
	switch(command) {
		case 'automatedControlOn': 
			commandStatus['automatedControl'] = true; 
			break;
		case 'automatedControlOff': 
			commandStatus['automatedControl'] = false; 
			break;
		case 'fishTankHeaterOn': 
			commandStatus['fishTankHeaterEnabled'] = true; 
			switchTankHeater(true);
			break;
		case 'fishTankHeaterOff': 
			commandStatus['fishTankHeaterEnabled'] = false; 
			switchTankHeater(false);
			break;
		case 'soilCoilHeaterOn': 
			commandStatus['soilCoilHeaterEnabled'] = true; 
			switchCoilHeater(true);
			break;
		case 'soilCoilHeaterOff': 
			commandStatus['soilCoilHeaterEnabled'] = false; 
			switchCoilHeater(false);
			break;
		default: console.log(command + ' not recognized.');
	}
}

var switchTankHeater = function(toggle) {
	var switchText = (toggle) ? 'on' : 'off';
	console.log('Switch tank heater ' + switchText + ' at ' + Date());
	switchPin(pinNumbers['tankHeater'], toggle);
}

var switchCoilHeater = function(toggle) {
	var switchText = (toggle) ? 'on' : 'off';
	console.log('Switch coil heater ' + switchText + ' at ' + Date());
	switchPin(pinNumbers['coilHeater'], toggle);
}

var switchPin = function(pinNumber, toggle) {
	gpio.open(pinNumber, 'output', function(err) {
		gpio.write(pinNumber, (toggle) ? 1 : 0, function() {
			gpio.close(pinNumber);
		});
	});
	readPin(pinNumber);
}

var readPin = function(pinNumber) {
	gpio.open(pinNumber, 'input', function(err) {
		gpio.read(pinNumber, function(err, value) {
			if(err) {
				console.log('Error reading pin ' + pinNumber);
				console.log(err);
			}
			else {
				console.log('Pin number ' + pinNumber + ' value is ' + value);
			}
			gpio.close(pinNumber);
		});
	});
}
	
// ******************
// Routes for the API
// Routen fuer die Programmierschnittstelle
// ******************

// issueCommand
// Sets a command item to be read in by the server cycle
// Stellt einen Befehl, den der Serverzeitraum liest ein.
app.post('/issueCommand', function(req, res) {
	var command = req.body.command;
	console.log('Issuing ' + command);	
	setCommand(command);
	res.json(command + ' issued');
});

// Get the current value of a setting
// Erhaelt den akutellen Wert einer Einstellung
app.get('/getSetting', function(req, res) {
	res.json(commandStatus[req.query.setting]);
});

// Get a full object enumerating the value of all settings
// Erhaelt ein Objekt, das alle Einstellungswerte zaehlt auf
app.get('/getAllSettings', function(req, res) {
	console.log(commandStatus);
	res.json(commandStatus);
});

// Get the current temperature value from a sensor
// Erhaelt den aktuellen Wert vom Sensor
app.get('/getTemperature', function(req, res) {
	// var sensorValue = readPin(pinNumbers[req.sensorName]);
	var sensorValue = 70 + (Math.random() * 10);
	res.json(sensorValue);
});

// Serve up the homepage
// Stellt die Startseite ein
app.get('/', function(req,res) {
	res.sendFile('Pages/index.html', { root : __dirname});
});

// Start the server
// Fangt den Server an
app.listen(port);
console.log('GardenServer App listening on port ' + port);
// setInterval(recordData, recordDataInterval * 1000);
// setInterval(manageControls, 100000);



