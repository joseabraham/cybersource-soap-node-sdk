const reasonCodes = require('../json/reasonCodes.json');
module.exports = class ReasonCodes {
  constructor(lang) {
    this.lang = lang;
  }

  getMessage(code) {
    return reasonCodes[this.lang][code];
  }
};
