const express = require('express');
const winston = require('winston');
const request = require('request-promise');
const scraper = require('./app/scraper');

const app = express();
const baseUrl = 'https://looplist-product-sample.herokuapp.com/products/';

// Let Heroku decide the port number to use
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  winston.info('Request made to root');
  res.send('Looplist Challenge');
});

app.get('/api/products/:productId', (req, res) => {
  const requestUrl = baseUrl + req.params.productId;
  request.get(requestUrl, (err, resp, body) => {
    if (resp && resp.statusCode === 200) {
      res.status(resp.statusCode).send(scraper.scrapeLoopSample(body));
    } else {
      res.status(500).send('There was an internal server failure');
    }
  });
});

const server = app.listen(PORT);
module.exports.server = server;
