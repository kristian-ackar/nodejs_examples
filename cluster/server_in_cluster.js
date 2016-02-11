'use strict'

// Core modules
var cluster = require("cluster");
var os = require("os");

if (cluster.isMaster) {
    // Get number of CPUs (CPU cores)
    let numOfCPUs = os.cpus().length;
    let cpus = os.cpus();

    console.log("Setting up " + numOfCPUs + " workers...");

    cpus.forEach(function(cpu) {
        cluster.fork();
    });

    cluster.on("online", function(worker) {
        console.log("Worker " + worker.process.pid + " ready!");
    });

    cluster.on("exit", function(worker, code, signal) {
        // Start a new worker
        console.log("Starting new worker...");
        cluster.fork();
    });
} else {
    var app = require("express")();

    app.all("/*", function(req, res) {
        res.send("Process " + process.pid + " processed this request");
        res.end();
    });

    var server = app.listen(8000, function() {
        console.log("Process ' + process.pid + ' is listening to all incoming requests");
    });
}
