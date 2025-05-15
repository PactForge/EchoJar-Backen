const fs = require('fs');
const Filter = require('bad-words');

const profanityWords = fs.readFileSync('profanity-words.txt', 'utf8').split('\n');
const filter = new Filter();
filter.addWords(...profanityWords);

module.exports = filter;
