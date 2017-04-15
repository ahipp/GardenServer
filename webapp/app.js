// Setup package references
var express = require('express');
var bodyParser = require('body-parser');
var mongojs = require('mongojs')
var db = mongojs('GardenData');
var gpio = require("pi-gpio");

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

// Global variables
var recordDataInterval = 10; // seconds
var commandStatus = {};
commandStatus['automatedControl'] = true;
commandStatus['fishTankHeaterEnabled'] = false;
commandStatus['soilCoilHeaterEnabled'] = false;

var pinNumbers = {};
pinNumbers['tankHeater'] = 11;
pinNumbers['coilHeater'] = 12;
gpio.setDirection(pinNumbers['tankHeater'], 'output');
gpio.setDirection(pinNumbers['coilHeater'], 'output');

var recordData = function() { 
	console.log('recordData');
}

var manageControls = function() {
	// With automated control enabled, use data to determine whether
	// each heater should be turned on or off.
	if (commandStatus['automatedControl']) {
		console.log('Automated control enabled');
	}
}

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
	gpio.write(pinNumbers['coilHeater'], (toggle) ? 1 : 0);
}

var switchPin = function(pinNumber, toggle) {
	gpio.open(pinNumber, 'output', function(err) {
		gpio.write(pinNumber, (toggle) ? 1 : 0, function() {
			gpio.close(pinNumber);
		});
	});
	readPin(pinNumber);
}

// This doesn't work. Maybe because I'm trying to do it on output pins? 
// Gotta figure that out later.
var readPin = function(pinNumber) {
	gpio,read(pinNumber, function(err, value) {
		if(err) throw err;
		console.log(value);
	});
}
	
// ******************
// Routes for the API
// ******************

// issueCommand
// Sets a command item to be read in by the server cycle
app.post('/issueCommand', function(req, res) {
	var command = req.body.command;
	console.log('Issuing ' + command);	
	setCommand(command);
	res.json(command + ' issued');
});

// getSetting
// Get the current value of a setting
app.get('/getSetting', function(req, res) {
	res.json(commandStatus[req.query.setting]);
});

// getAllSettings
// Get a full object enumerating the value of all settings
app.get('/getAllSettings', function(req, res) {
	console.log(commandStatus);
	res.json(commandStatus);
});

// Serve up the homepage
app.get('/', function(req,res) {
	res.sendFile('Pages/index.html', { root : __dirname});
});

// Start the server
app.listen(port);
console.log('GardenServer App listening on port ' + port);
setInterval(recordData, recordDataInterval * 1000);
setInterval(manageControls, 10000);



