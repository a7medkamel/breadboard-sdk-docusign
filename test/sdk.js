var assert    = require('chai').should()
  , config    = require('config')
  , DocuSign  = require('../lib/index')
  , sdk       = require('../index').sdk().docusign
  ;

describe('docusign', () => {
  describe('sdk', () => {
    it('should return instance of DocuSign object', (done) => {
      sdk
        .login()
        .then((account) => {
          account.should.have.property('name', 'DocuSign');
        })
        .asCallback(done);
    });

    it('should call login for us if we call sendTemplate', (done) => {
      let payload =
      {
          templateId    : config.get('sdk.docusign.$test.template_id')
        , emailSubject  : 'Please sign this document sent from Breadboard'
        , roles         : [{
            roleName    : 'integrator'
          , name        : 'Sr Trouble'
          , email       : config.get('sdk.docusign.$test.email')
        }]
      };

      sdk
        .sendTemplate(payload)
        .then((result) => {
          result.should.have.property('status', 'sent');
          result.should.have.all.keys('envelopeId', 'status', 'statusDateTime', 'uri');
        })
        .asCallback(done);
    }).timeout(5000);
  });
});
