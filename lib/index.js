var docusign  = require('docusign-esign')
  , Promise   = require('bluebird')
  , urljoin   = require('url-join')
  , config    = require('config')
  , rp        = require('request-promise')
  , _         = require('lodash')
  ;

class DocuSign {
  constructor(options = {}) {
    this.bearer = options.bearer;

    this.login = _.memoize(this.login);
  }

  creds() {
    if (config.has('sdk.docusign')) {
      return Promise.resolve(config.get('sdk.docusign'));
    }

    return rp
            .post({
                url     : urljoin(config.get('account.url'), 'docusign/creds')
              , method  : 'POST'
              , json    : true
              , headers : { 'authorization' : this.bearer }
            })
            .promise()
            .then((result = {}) => result.data);
  }

  login() {
    return this
            .creds()
            .then((creds = {}) => {
              return Promise
                        .fromCallback((cb) => {
                          let client = new docusign.ApiClient();
                          client.setBasePath(`https://${creds.environment}.docusign.net/restapi`);

                          // create JSON formatted auth header
                          var ds_creds = {
                              Username      : creds.email
                            , Password      : creds.password
                            , IntegratorKey : creds.integrator_key
                          };

                          client.addDefaultHeader('X-DocuSign-Authentication', JSON.stringify(ds_creds));

                          docusign.Configuration.default.setDefaultApiClient(client);

                          let auth = new docusign.AuthenticationApi();

                          // login has some optional parameters we can set
                          var opts = {
                            apiPassword           : 'true'
                            , includeAccountIdGuid  : 'true'
                          };

                          auth.login(opts, cb);
                        })
                        .then((res) => {
                          // list of user account(s)
                          // note that a given user may be a member of multiple accounts
                          let accounts    = res.loginAccounts
                          , account     = _.first(accounts)
                          // , id          = account.accountId
                          , base_url    = account.baseUrl
                          , domain      = _.first(base_url.split('/v2'))
                          ;

                          // below code required for production, no effect in demo (same domain)
                          docusign.Configuration.default.defaultApiClient.setBasePath(domain);

                          return account;
                        });
            })
  }

  sendTemplate(payload) {
    return this
            .login()
            .then((account) => {
              // create a new envelope object that we will manage the signature request through
              let def = new docusign.EnvelopeDefinition();

              // send the envelope by setting |status| to 'sent'. To save as a draft set to 'created'
              _.extend(def, { status : 'sent' }, _.pick(payload, ['emailSubject', 'templateId']))

              def.templateRoles = _.map(payload.roles, (r) => {
                let ret = new docusign.TemplateRole();
                ret.roleName = r.roleName;
                ret.name = r.name;
                ret.email = r.email;

                return ret;
              });

              // use the |accountId| we retrieved through the Login API to create the Envelope
              var accountId = account.accountId;

              // instantiate a new EnvelopesApi object
              var envelopesApi = new docusign.EnvelopesApi();

              // call the createEnvelope() API
              return Promise
                      .fromCallback((cb) => {
                        let api = new docusign.EnvelopesApi();

                        api.createEnvelope(account.accountId, { 'envelopeDefinition' : def }, cb);
                      });
            });
  }
}

module.exports = DocuSign;
