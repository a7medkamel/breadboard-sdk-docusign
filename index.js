var DocuSign  = require('./lib/index')
  , config    = require('config')
  ;

let proxy = {
  set: (obj, prop, value) => {
    return true;
  },
  get: (obj, prop) => {
    if (prop == '$') {
      return;
    }

    let ds = obj.$;
    if (!ds) {
      ds = obj.$ = new DocuSign(config.get('sdk.docusign'));
    }

    if (prop == 'login') {
      return ds[prop];
    }

    return (...args) => {
      return ds
              .login()
              .then((account) => {
                return ds[prop](...args);
              });
    };
  }
};

class SDK {
  constructor(options = {}) {
    let { bearer } = options;

    this.docusign = new Proxy({}, proxy);
  }
}

module.exports = {
  sdk : (...args) => new SDK(...args);
}
