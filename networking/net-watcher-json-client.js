'use strict';

const
	net = require('net'),
	port = process.argv[3] || 5432,
	client = net.connect({port : port});

client.on('data', function(data) {

	let message = JSON.parse(data);

	if ('watching' === message.type) {
		console.log('Now watching: ' + message.file);
	} else if ('changed' === message.type) {
		let date = new Date(message.timestamp);
		
		console.log('File "' + message.file + '" changed at ' + date);
	} else {
		throw Error('Unrecognized message type: ' + message.type);
	}
});
