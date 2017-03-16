var opencv = require('./walabot');

var detector = new opencv.detector({
    port: 9009
});

detector.getSensorTargets(function(data, err) {
    console.log(JSON.stringify(data));
});