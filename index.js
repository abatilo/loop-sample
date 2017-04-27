const express = require('express');
const loopSampleScraper = require('./scrapers/loopSampleScraper');

const app = express();

// Let Heroku decide the port number to use
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('Looplist Challenge');
});

// An end point for specifically scraping the Looplist Product Sample website
app.get('/api/products/:productId', (req, res) => {
  loopSampleScraper.scrape(req.params.productId, res);
});

const server = app.listen(PORT);
module.exports.server = server;
