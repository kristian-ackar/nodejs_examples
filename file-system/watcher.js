const fs = require('fs');

fs.watchFile('target.txt', function() {
    console.log('File just changed');
});
