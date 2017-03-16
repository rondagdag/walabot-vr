var opencv = require('./walabot');

var detector = new opencv.detector({
    port: 9091
});

setTimeout(function() { 
	console.log('start');
	detector.getSensorTargets(function(data, err) {
   	 console.log(JSON.stringify(data));
	}); 
},10000);
