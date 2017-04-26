const express = require('express');
const winston = require('winston');

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

module.exports.server = server;
