const PORT = 8080;

// Include libriaries
var server = require("http").createServer(requestHandler);

var io = require("socket.io").listen(server);
var static = require("node-static");

// All files in the current folder are accessible from the web
var fileServer = new static.Server("./");

// Http server listens on port {$PORT}
// Go to http://localhost:{$PORT}
server.listen(PORT, function() {
    console.log("Server listening on port " + PORT);
});

// If the URL of the socket server is opened in a browser
function requestHandler(req, res) {
    fileServer.serve(req, res); // this will return the correct file

    req.addListener("end", function() {
        console.log("Ended");
    });
}

// Listen for incoming connections from clients
io.sockets.on("connection", function(socket) {
    // Start listening for mouse move events
    socket.on("mousemove", function(data) {
        // This line sends the event (broadcasts it) to everyone except the originating client
        socket.broadcast.emit("moving", data);
    });
});
