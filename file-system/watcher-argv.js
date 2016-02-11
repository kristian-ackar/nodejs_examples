const fs = require('fs');
var filename = process.argv[2];

if (!filename) {
    throw Error('A file to watch must be specified!');
}

fs.watchFile(filename, function() {
    console.log('File just changed');
});

console.log('Now watching ' + filename + ' for changes...');

