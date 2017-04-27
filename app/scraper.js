const request = require('request-promise');
const htmlparser = require('htmlparser2');

const baseUrl = 'https://looplist-product-sample.herokuapp.com/products/';

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
      title = text;
    } else if (onName) {
      name = text;
    } else if (onDescriptionHeader && text === 'Description:') {
      lookingForDescriptionParagraph = true;
    } else if (onDescriptionParagraph) {
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

  onend: () => {
    lookingForDescriptionParagraph = false;
    onDescriptionHeader = false;
    onDescriptionParagraph = false;
    onName = false;
    onTitle = false;

    description = '';
    image = '';
    name = '';
    title = '';
  },
}, { decodeEntities: true });

const scrapeLoopSample = (productId, res) => {
  const requestUrl = baseUrl + productId;
  request.get(requestUrl, (err, resp, body) => {
    if (resp && resp.statusCode === 200) {
      parser.write(body);
      parser.end();
      res.status(resp.statusCode).send({ title, name, image, description });
    } else {
      res.status(500).send('There was an internal server error');
    }
  });
};

module.exports.scrapeLoopSample = scrapeLoopSample;
