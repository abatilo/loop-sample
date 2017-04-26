const express = require('express');
const winston = require('winston');
const fs = require('fs');

const app = express();

// Let Heroku decide the port number to use
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  winston.info('Request made to root');
  res.send('Here4Now backend');
});

const server = app.listen(PORT, () => {
  winston.info(`Example app listening on port ${PORT}`);
});

let rawHTML = '';
fs.readFile('./sample_html.html', 'utf8', (err, data) => {
    if (err) {
      winston.error('There was an error trying to read the sample file');
    }
    rawHTML = data;
    winston.info(rawHTML);
});

module.exports.server = server;
