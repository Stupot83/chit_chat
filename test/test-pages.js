const expect  = require('chai').expect;
const request = require('request');

describe('Status and content', () => {
  describe ('User page', () => {
    it('status', done => {
        request('http://localhost:9000/user', (error, response, body) => {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('content', done => {
      request('http://localhost:9000/user' , (error, response, body) => {
          expect(body).to.include("Profile");
          done();
      });
    });
  });

  describe ('Create account page', () => {
      it('status', done => {
          request('http://localhost:9000/create-account', (error, response, body) => {
              expect(response.statusCode).to.equal(200);
              done();
          });
      });

      it('content', done => {
        request('http://localhost:9000/create-account' , (error, response, body) => {
            expect(body).to.include("Create Account");
            done();
        });
      });
    });

  describe ('Sign in page', () => {
      it('status', done => {
          request('http://localhost:9000/sign-in', (error, response, body) => {
              expect(response.statusCode).to.equal(200);
              done();
          });
      });
  
      it('content', done => {
        request('http://localhost:9000/sign-in' , (error, response, body) => {
            expect(body).to.include("Sign In");
            done();
        });
    });
  });

  describe ('Sign out', () => {
    it('status', done => {
        request('http://localhost:9000/sign-out', (error, response, body) => {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('content', done => {
      request('http://localhost:9000/sign-out' , (error, response, body) => {
          expect(body).to.include("Sign In");
          done();
      });
  });
});

  describe ('Edit account page', () => {
    it('status', done => {
        request('http://localhost:9000/edit-account', (error, response, body) => {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

   it('content', done => {
      request('http://localhost:9000/edit-account' , (error, response, body) => {
          expect(body).to.include("Your Account");
          done();
      });
    });
  });

  describe ('Deleting your account', () => {
    it('status', done => {
        request('http://localhost:9000/delete-account', (error, response, body) => {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

   it('content', done => {
      request('http://localhost:9000/delete-account' , (error, response, body) => {
          expect(body).to.include("Sign In");
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