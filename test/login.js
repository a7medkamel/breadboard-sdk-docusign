var assert    = require('chai').should()
  , config    = require('config')
  , DocuSign  = require('../lib/index')
  ;

describe('docusign', () => {
  describe('login', () => {
    it('should return account info', (done) => {
      let ds = new DocuSign();

      ds
        .login()
        .then((account) => {
          account.should.have.property('name', 'DocuSign');
        })
        .asCallback(done);
    });

  });
});
