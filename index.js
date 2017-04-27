const express = require('express');
const winston = require('winston');
const htmlparser = require('htmlparser2');
const request = require('request-promise');

const app = express();

// Let Heroku decide the port number to use
const PORT = process.env.PORT || 8080;

let lookingForDescriptionParagraph = false;
let onDescriptionHeader = false;
let onDescriptionParagraph = false;
let onName = false;
let onTitle = false;

let description = '';
let image = '';
let name = '';
let title = '';

const parser = new htmlparser.Parser({
  onopentag: (tagName, attribs) => {
    if (tagName === 'title') {
      onTitle = true;
    } else if (tagName === 'img' && attribs.class === 'product-image-main') {
      winston.info('image: ', attribs.src);
      image = attribs.src;
    } else if (tagName === 'h2' && attribs.class === 'product-name') {
      onName = true;
    } else if (tagName === 'strong') {
      onDescriptionHeader = true;
    } else if (lookingForDescriptionParagraph && tagName === 'p') {
      onDescriptionParagraph = true;
    }
  },

  ontext: (text) => {
    if (onTitle) {
      winston.info('title: ', text);
      title = text;
    } else if (onName) {
      winston.info('name: ', text);
      name = text;
    } else if (onDescriptionHeader && text === 'Description:') {
      lookingForDescriptionParagraph = true;
    } else if (onDescriptionParagraph) {
      winston.info('description: ', text);
      description = text;
    }
  },

  onclosetag: (tagName) => {
    if (tagName === 'title') {
      onTitle = false;
    } else if (tagName === 'h2' && onName) {
      onName = false;
    } else if (tagName === 'strong' && onDescriptionHeader) {
      onDescriptionHeader = false;
    } else if (tagName === 'p' && lookingForDescriptionParagraph) {
      onDescriptionParagraph = false;
      lookingForDescriptionParagraph = false;
    }
  },
}, { decodeEntities: true });

app.get('/', (req, res) => {
  winston.info('Request made to root');
  res.send('Looplist Challenge');
});

app.get('/api/products/:productId', (req, res) => {
  const baseUrl = 'https://looplist-product-sample.herokuapp.com/products/';
  const requestUrl = baseUrl + req.params.productId;
  request.get(requestUrl, (err, resp, body) => {
    if (resp && resp.statusCode === 200) {
      parser.write(body);
      res.status(resp.statusCode).send({ title, name, image, description });
    } else {
      res.status(resp.statusCode).send('There was an internal server failure');
    }
  });
});

const server = app.listen(PORT);
module.exports.server = server;
