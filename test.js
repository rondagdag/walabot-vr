var walabot = require('./walabot');

// Numéro de port facultatif
var detector = new walabot.detector({
    port: 8091
});
detector.frame(function(data) {
    // image est au format base64
    console.log(data);
});
