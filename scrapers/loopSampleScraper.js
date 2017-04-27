const request = require('request');

// https://github.com/fb55/htmlparser2/wiki/Parser-options
const htmlparser = require('htmlparser2');

const baseUrl = 'https://looplist-product-sample.herokuapp.com/products/';

// Here are our state flags for handling the HTML stream
let lookingForDescriptionParagraph = false;
let onDescriptionHeader = false;
let onDescriptionParagraph = false;
let onName = false;
let onTitle = false;

// We use these module level variables to work with the parser
// TODO(aaron): I believe using "let" keeps these variables scoped to this file. Confirm this.
// TODO(aaron): My understanding for Node is that there's a single event queue, which means
//              I shouldn't need to worry about other threads modifying these in the traditional
//              race condition sense. What happens if two requests happen in quick succession?
let description = '';
let image = '';
let name = '';
let title = '';

// htmlparser2 runs as a streaming HTML parser
// This is great because it means that we can typically take what we want in a single pass through
// the HTML which scales well at O(n). I could write a multi-pass parser that would arguably
// be cleaner to read but much less efficient
//
// For this specific source, the scraper works by setting state flags which will inform us how to
// process the incoming text.
//
// I made this a module level variable so that we don't need to re-alloc for it on every request
// TODO(aaron): Learn about how the JS GC works.
//
// Unfortunately, almost any web scraping is heavily dependent on the DOM not changing
const parser = new htmlparser.Parser({
  onopentag: (tagName, attribs) => {
    // Set the appropriate read ahead flags since the opening tag gives us an idea of what to
    // expect
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
    // On the stream end, explicitly reset all flags
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

const parse = (body) => {
  parser.write(body);
  return { title, name, image, description };
};

const clear = () => {
  parser.end();
};

// We take "res" as a variable here so that we can async respond to the request
const scrape = (productId, res) => {
  const requestUrl = baseUrl + productId;
  // TODO(aaron): Learn more HTTP status codes:
  //              https://httpstatusdogs.com/
  request.get(requestUrl, (err, resp, body) => {
    if (resp && resp.statusCode === 200) {
      res.status(resp.statusCode).send(parse(body));
      clear();
    } else {
      res.status(500).send({ error: 'Invalid product Id' });
    }
  });
};

module.exports.parse = parse;
module.exports.clear = clear;
module.exports.scrape = scrape;
