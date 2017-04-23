var walabot = require('./walabot');
var http    = require("http");              // http server core module
var express = require("express");           // web framework external module
var serveStatic = require('serve-static');  // serve static files
var socketIo = require("socket.io");        // web socket external module
var detector = new walabot.detector({
    port: 8091
});


var app = express();
app.use(serveStatic('basic', {'index': ['index.html']}));

// Start Express http server
var port = process.env.PORT || 12000;
var webServer = http.createServer(app).listen(port);

// Start Socket.io so it attaches itself to Express server
var socketServer = socketIo.listen(webServer, {"log level":1});

console.log('Server started on port', port);

socketServer.on('connection', function (socket) {
  console.log('Connection received');

  socket.on('broadcast', function (data) {
    //console.log(data);
    socket.broadcast.emit('broadcast', data);
  }); 
});

Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
var width = 100;
var height = 100;
var rMax = 400;
var phi = 45;

 detector.frame(function(data) {    
      //console.log(data);
      var sendQueue = [];
      //console.log(data);
      if (!data) { return; }     
      var result = JSON.parse(data);
      if (!result.targets) { return; }
      console.log(result.targets);

      result.targets.forEach(function addQueue(element, index, array) {
          color = "pink";
          switch(index) {
                case 1:
                    color = "orange";
                    break;
                case 2:
                    color = "green";
                    break;
                case 3:
                    color = "pink";
                    break;
                default:
                    color = "pink";
        }
        if (index == 0) 
        {
            //x = width / 2 * (
            //        element.y / (rMax * Math.sin(Math.radians(phi))) + 1)
            //z = height * (1 - element.z / rMax)
            
            x = (width / 2 * (
                    element.y / (rMax * Math.sin(Math.radians(phi))) + 1)) - (width / 2)
            z = height * (element.z / rMax)
            sendQueue.push(
                {
                    id: "egg" + index,                
                    components: [ [ "position" , x  + " " + 10 + " " + -z ], [ "rotation" , "0 180 0 " ],
                    [ "obj-model" , "obj: #bunnyrabbit-obj; mtl: #bunnyrabbit-mtl" ]]
                    //[ "obj-model" , "obj: #" + color + "egg-obj; mtl: #" + color + "egg-mtl" ]]
                }
            );
        }
      });        
        socketServer.local.emit('broadcast', sendQueue);
        //console.log(sendQueue);
    });




//listen on port
webServer.listen(port, function () {
    console.log('listening on http://localhost:' + port);
});
