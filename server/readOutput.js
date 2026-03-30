const fs = require('fs');
const content = fs.readFileSync('allDocs.txt', 'utf16le');
console.log(content.substring(0, 1000));
