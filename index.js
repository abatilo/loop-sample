/* const express = require('express'); */
const winston = require('winston');
const fs = require('fs');
const htmlparser = require('htmlparser2');

/* const app = express(); */

// Let Heroku decide the port number to use
/* const PORT = process.env.PORT || 8080; */

/* app.get('/', (req, res) => { */
/*   winston.info('Request made to root'); */
/*   res.send('Looplist Challenge'); */
/* }); */

/* const server = app.listen(PORT, () => { */
/*   winston.info(`Example app listening on port ${PORT}`); */
/* }); */

/* module.exports.server = server; */

let onTitle = false;

const parser = new htmlparser.Parser({
  onopentag: (name) => {
    if (name === 'title') {
      onTitle = true;
    }
  },

  ontext: (text) => {
    if (onTitle) {
      winston.info(text);
    }
  },

  onclosetag: (name) => {
    if (name === 'title') {
      onTitle = false;
    }
  },
}, { decodeEntities: true });

let rawHTML = '';
fs.readFile('./sample_html.html', 'utf8', (err, data) => {
  if (err) {
    winston.error('There was an error trying to read the sample file');
  }
  rawHTML = data;

  parser.write(rawHTML);
  parser.end();
});

