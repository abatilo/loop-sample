const express = require('express');
const winston = require('winston');
const scraper = require('./app/scraper');

const app = express();

// Let Heroku decide the port number to use
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  winston.info('Request made to root');
  res.send('Looplist Challenge');
});

app.get('/api/products/:productId', (req, res) => {
  scraper.scrapeLoopSample(req.params.productId, res);
});

const server = app.listen(PORT);
module.exports.server = server;
