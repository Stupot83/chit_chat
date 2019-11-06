const expect  = require('chai').expect;
const request = require('request');

describe('Status and content', () => {
  describe ('Create account page', () => {
      it('status', done => {
          request('http://localhost:9000/create-account', (error, response, body) => {
              expect(response.statusCode).to.equal(200);
              done();
          });
      });

      it('content', done => {
        request('http://localhost:9000/create-account' , (error, response, body) => {
            expect(body).to.include("Chit Chat");
            done();
        });
    });
  });

  describe ('Non existent page', () => {
      it('status', done => {
          request('http://localhost:9000/dave', (error, response, body) => {
              expect(response.statusCode).to.equal(404);
              done();
          });
      });
  });
});