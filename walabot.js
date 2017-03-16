var child = require('child_process'),
    path = require('path'),
    net = require('net'),
    fs = require('fs');

var options = {
    encoding: 'UTF-8'
};

exports.pythonVersion = function() {
    var script = path.resolve(__dirname, 'python/version.py');
    return child.execSync('python ' + script, options);
};

exports.detector = Detector;

function Detector(conf) {
    var port = 4003;
    if (conf) {
        if (conf.port) {
            port = conf.port;
        }
    }
    var script = path.resolve(__dirname, 'python/WalabotService.py');
    var command = 'python ' + script + ' ' + port;
    child.exec(command, options, function(error, stdout, stderr) {
        if (error) {
            console.log(stderr);
        }
    });
    this.client = new net.Socket({
        readable: true
    });
    currclient = this.client;

    setTimeout(function() {
        console.log('ready');
        currclient.connect(port, '127.0.0.1');
    }, 5000); //wait 5 seconds

    this.callback = null;
    var self = this;
    var marqueur = 'TARGETS';
    var tmp_image = null;
    this.client.on('error', function(err) {
        if (err) {
            self.callback(null, err);
        }
    });
    this.client.on('data', function(data) {
        var str = data.toString('UTF-8');
        var pos = str.indexOf(marqueur);
        if (pos >= 0) {
            if (tmp_image !== null) {
                tmp_image += str.substring(0, pos);
                if (self.callback !== null) {
                    self.callback(tmp_image);
                }
            }
            tmp_image = str.substring(pos + marqueur.length);
        } else {
            tmp_image += str;
        }
    });
};
Detector.prototype.frame = function(callback) {
    this.callback = callback;
};
