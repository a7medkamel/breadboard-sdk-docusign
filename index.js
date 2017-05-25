var DocuSign  = require('./lib/index')
  , config    = require('config')
  , _         = require('lodash')
  ;

class SDK {
  constructor(options = {}) {
    let { bearer } = options;

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
          ds = obj.$ = new DocuSign({ bearer });
        }

        if (_.has(obj, prop)) {
          if (prop == 'login') {
            return ds[prop];
          }

          if (_.isFunction(ds[prop])) {
            return (...args) => {
              return ds
              .login()
              .then((account) => {
                return ds[prop](...args);
              });
            };
          }
        }

        return ds[prop];
      }
    };

    this.docusign = new Proxy({}, proxy);
  }
}

module.exports = {
  sdk : (...args) => new SDK(...args)
}
