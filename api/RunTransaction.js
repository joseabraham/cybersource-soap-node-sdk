const soap = require('soap');
const DEBUG = false;
module.exports = (url, Request, wsSecurity) => {
  return new Promise((resolve, reject) => {
    soap.createClient(url, (err, client) => {
      if (err || !client) {
        if (DEBUG) {
          try {
            console.error('[CYBERSOURCE SOAP] createClient error:', (err && err.message) || err);
          } catch (e) {
            void e;
          }
        }
        return reject(err || new Error('Failed to create SOAP client'));
      }
      client.setSecurity(wsSecurity);
      try {
        // Ensure Body gets wsu:Id and ws-security namespace declarations exist
        if (client && client.addBodyAttribute) {
          client.addBodyAttribute({
            'xmlns:wsu':
              'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd',
            'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
            'wsu:Id': 'id-' + Date.now(),
          });
        }
      } catch (e) {
        void e;
      }
      client.TransactionProcessor.portXML.runTransaction(
        Request,
        (error, result, rawResponse, soapHeader, rawRequest) => {
          if (DEBUG) {
            try {
              console.log('[CYBERSOURCE SOAP] rawRequest =>\n', rawRequest);
              console.log('[CYBERSOURCE SOAP] rawResponse =>\n', rawResponse);
            } catch (e) {
              void e;
            }
          }
          error ? reject(error) : resolve(result);
        }
      );
    });
  });
};
