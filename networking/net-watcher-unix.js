'use strict';

const
fs = require('fs'),
net = require('net'),

filename = process.argv[2],
socketFile = process.argv[3] || '/tmp/watcher.sock',

server = net.createServer(function(connection) {
	// reporting
	console.log('Subscriber connected');
	connection.write('Now watching "' + filename + '" for changes...\n');

	let watcher = fs.watchFile(filename, function() {
		connection.write('File "' + filename + '" changed: ' + Date.now() + '\n');
	});

	// cleanup
	connection.on('close', function() {
		console.log('Subscriber disconnected');
		//fs.unwatchFile(filename, watcher); // second param is listener to remove, but watcher obj apparently isn't listener
		//watcher.close() // watchr obj don't have fn close (but ret obj of watch fn have)
	});
});

if (!filename) {
	throw Error('No target filename was specified.');
}

server.listen(socketFile, function() {
	console.log('Listening for subscribers...');
});