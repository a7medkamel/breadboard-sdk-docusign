var assert    = require('chai').should()
  , config    = require('config')
  , DocuSign  = require('../index')
  ;

describe('docusign', () => {
  describe('login', () => {
    it('returns account info', (done) => {
      let ds = new DocuSign(config.get('sdk.docusign'));

      ds
        .login()
        .then((account) => {
          account.should.have.property('name', 'DocuSign');
        })
        .asCallback(done);
    });

  });
});
