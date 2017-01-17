var express = require('express');
var mongo = require('mongodb');
var app = express();
var port = process.env.PORT || 8080;
var router = express.Router();

// Functions
var connectToMongoDB = function(callback) {
  mongo.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
    if (err) {
      console.log(err);
      throw err;
    } else {
      console.log('MongoDB connect successful.');    
    }
  });
};

var insertDocument = function(collectionName,json) {
   mongo.connect('mongodb://127.0.0.1:27017/GardenData', function(err, db) {
     if (err) {
       console.log(err);
       throw err;
     } else {
       console.log('MongoDB connect successful.');   
       db.collection(collectionName).insertOne(json);
     }
    db.close();
  });
};

// Routes for the API

router.get('/', function(req,res) {
  res.json({ message: 'API get test successful' });
});

// Register routes
app.use('/api', router);

// Start the server
app.listen(port);
console.log('Example app listening on port ' + port);

// Test insert upon running app.js
var testJson = {
  hour: "2017-01-16T18:00:00.000",
  temperature: {
    0 : 50.4,
    1 : 50.5,
    2 : 50.5,
    3 : 50.4,
    4 : 50.6
  }
};
insertDocument('SensorData',testJson);
