const chai = require('chai');
const request = require('supertest');
const app = require('../index');
const loopSampleScraper = require('../scrapers/loopSampleScraper');

const expect = chai.expect;

describe('Express endpoint tests', () => {
  beforeEach(() => {
    server = app.server;
  });

  afterEach(() => {
    server.close();
  });

  it('responds to /', (done) => {
    request(server).get('/').expect(200, done);
  });

  it('succeeds to /api/products/:productId', (done) => {
    request(server).get('/api/products/12345').expect(200, done);
  });

  it('fails to /api/products/:productId', (done) => {
    request(server).get('/api/products/12346').expect(500, done);
  });

  it('404 to everything else', (done) => {
    request(server).get('/invalid').expect(404, done);
  });
});

describe('Loop parsing tests', () => { 
  afterEach(() => {
    loopSampleScraper.clear();
  });

  it('Empty string returns empty values', (done) => {
    const expected = {
      'description': '',
      'image': '',
      'name': '',
      'title': '',
    };
    expect(loopSampleScraper.parse('')).to.deep.equal(expected);
    done();
  });

  it('Parse title', (done) => {
    const input = '<title>Testing</title>';
    const expected = {
      'description': '',
      'image': '',
      'name': '',
      'title': 'Testing',
    };
    expect(loopSampleScraper.parse(input)).to.deep.equal(expected);
    done();
  });

  it('Parse image', (done) => {
    const input = '<img class=product-image-main src=url.jpg>';
    const expected = {
      'description': '',
      'image': 'url.jpg',
      'name': '',
      'title': '',
    };
    expect(loopSampleScraper.parse(input)).to.deep.equal(expected);
    done();
  });

  it('Parse name', (done) => {
    const input = '<h2 class=product-name>Name</h2>';
    const expected = {
      'description': '',
      'image': '',
      'name': 'Name',
      'title': '',
    };
    expect(loopSampleScraper.parse(input)).to.deep.equal(expected);
    done();
  });

  it('Parse description', (done) => {
    const input = '<strong>Description:</strong><p>Testing testing</p>';
    const expected = {
      'description': 'Testing testing',
      'image': '',
      'name': '',
      'title': '',
    };
    expect(loopSampleScraper.parse(input)).to.deep.equal(expected);
    done();
  });
});
