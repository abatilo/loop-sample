const chai = require('chai');
const request = require('supertest');
const app = require('../index');

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
    request(server)
      .get('/api/products/12345')
      .expect(200)
      .end((err, res) => {
        const expectedResponse = { 
          title: "New Products - Acme", 
          name: "Acme FPWC-2 fake plastic watering can, 2 gallon, green",
          image: "http://placekitten.com/g/300/300",
          description: "A green plastic watering can for a fake Chinese rubber plant in the fake plastic earth.",
        };
        expect(res.body).to.deep.equal(expectedResponse);
        done();
      });
  });

  it('fails to /api/products/:productId', (done) => {
    request(server).get('/api/products/12346').expect(500, done);
  });

  it('404 to everything else', (done) => {
    request(server).get('/invalid').expect(404, done);
  });
});
