var child = require('child_process'),
    path = require('path'),
    net = require('net'),
    fs = require('fs');

var options = {
    encoding: 'UTF-8'
};

exports.detector = Detector;

function Detector(conf) {
    this.port = 4004;
    if (conf) {
        if (conf.port) {
            this.port = conf.port;
        }
    }
    var script = path.resolve(__dirname, 'python/WalabotService.py');
    var command = 'python ' + script + ' ' + this.port;
    child.exec(command, options, function(error, stdout, stderr) {
        if (error) {
            console.log(stderr);
        }
    });
    this.clients = [];
};
Detector.prototype.connect = function(callback, code, send) {
    var client = new net.Socket({
        readable: true,
        writable: true
    });
    client.on('error', function(err) {
        if (err) {
            callback(null, err);
        }
    });
    client.connect(this.port, '127.0.0.1');
    this.clients.push(client);
    var self = this;
    client.on('data', function(res) {
        var message = res.toString('UTF-8');
        if (message == 'BUFFER OK') {
            client.write(send);
        } else {
            self.disconnect(client);
            var retour = JSON.parse(message);
            if (retour.error) {
                callback(null, retour.error);
            } else {
                callback(retour);
            }
        }
    });
    if (code == 'STOP') {
        client.write(code);
    } else if (send) {
        var buffer = send.length;
        client.write(code + buffer);
    }
};
Detector.prototype.disconnect = function(client) {
    var idx = this.clients.indexOf(client);
    if (idx >= 0) {
        this.clients.slice(idx);
    }
    client.destroy();
};

Detector.prototype.getSensorTargets = function(callback) {
    var send = '';
    this.connect(callback, 'SENSORTARGETS', send);
};

Detector.prototype.close = function(callback) {
    this.connect(callback, 'STOP');
    callback('Socket closed');
};

exports.pythonVersion = function() {
    var script = path.resolve(__dirname, 'python/version.py');
    return child.execSync('python ' + script, options);
};