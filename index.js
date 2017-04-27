const express = require('express');
const winston = require('winston');
const fs = require('fs');
const htmlparser = require('htmlparser2');

const app = express();

// Let Heroku decide the port number to use
const PORT = process.env.PORT || 8080;

app.get('api/products/:productId', (req, res) => {
  res.send('Received: ', req.params.productId);
});

app.get('/', (req, res) => {
  winston.info('Request made to root');
  res.send('Looplist Challenge');
});

const server = app.listen(PORT, () => {
  winston.info(`Example app listening on port ${PORT}`);
});

module.exports.server = server;

let onTitle = false;
let onName = false;
let onDescriptionHeader = false;
let lookingForDescriptionParagraph = false;
let onDescriptionParagraph = false;

const parser = new htmlparser.Parser({
  onopentag: (name, attribs) => {
    if (name === 'title') {
      onTitle = true;
    } else if (name === 'img' && attribs.class === 'product-image-main') {
      winston.info('image: ', attribs.src);
    } else if (name === 'h2' && attribs.class === 'product-name') {
      onName = true;
    } else if (name === 'strong') {
      onDescriptionHeader = true;
    } else if (lookingForDescriptionParagraph && name === 'p') {
      onDescriptionParagraph = true;
    }
  },

  ontext: (text) => {
    if (onTitle) {
      winston.info('title: ', text);
    } else if (onName) {
      winston.info('name: ', text);
    } else if (onDescriptionHeader && text === 'Description:') {
      lookingForDescriptionParagraph = true;
    } else if (onDescriptionParagraph) {
      winston.info('description: ', text);
    }
  },

  onclosetag: (name) => {
    if (name === 'title') {
      onTitle = false;
    } else if (name === 'h2' && onName) {
      onName = false;
    } else if (name === 'strong' && onDescriptionHeader) {
      onDescriptionHeader = false;
    } else if (name === 'p' && lookingForDescriptionParagraph) {
      onDescriptionParagraph = false;
      lookingForDescriptionParagraph = false;
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
