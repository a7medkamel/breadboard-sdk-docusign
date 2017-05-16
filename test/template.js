var assert    = require('chai').should()
  , config    = require('config')
  , DocuSign  = require('../index')
  ;

describe('docusign', () => {
  describe('template', () => {
    it('should send without errors', (done) => {
      let ds = new DocuSign(config.get('sdk.docusign'));

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

      ds
        .sendTemplate(payload)
        .then((result) => {
          result.should.have.property('status', 'sent');
          result.should.have.all.keys('envelopeId', 'status', 'statusDateTime', 'uri');
        })
        .asCallback(done);
    }).timeout(5000);

  });
});
