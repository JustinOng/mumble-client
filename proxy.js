var net = require('net');
 
var LOCAL_PORT  = 64738;
var REMOTE_PORT = 64738;
var REMOTE_ADDR = "removed";
 
var server = net.createServer(function (socket) {
    socket.on('data', function (msg) {
        var serviceSocket = new net.Socket();
        serviceSocket.connect(parseInt(REMOTE_PORT), REMOTE_ADDR, function () {
            console.log('>> From proxy to remote', msg);
            serviceSocket.write(msg);
        });
        serviceSocket.on("data", function (data) {
            console.log('<< From remote to proxy', data);
            socket.write(data);
        });
    });
});
 
server.listen(LOCAL_PORT);
console.log("TCP server accepting connection on port: " + LOCAL_PORT);