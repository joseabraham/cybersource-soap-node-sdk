const Configuration = require('./model/Configuration');
const RunTransaction = require('./api/RunTransaction');
const Models = require('./model/index');

/**
 * CyberSource SOAP API Client
 *
 * This class provides a Node.js interface to the CyberSource SOAP API for payment processing.
 * It supports both username/password authentication and P12 certificate authentication.
 *
 * @class CyberSourceApi
 * @example
 * // Initialize with username/password
 * const api = new CyberSourceApi(
 *   'your-password',
 *   'your-merchant-id',
 *   'development',
 *   'en',
 *   '1.151',
 *   'USD'
 * );
 *
 * @example
 * // Initialize with P12 certificate
 * const api = new CyberSourceApi(
 *   '', // empty password when using certificates
 *   'your-merchant-id',
 *   'development',
 *   'en',
 *   '1.151',
 *   'USD',
 *   {
 *     p12Path: '/path/to/certificate.p12',
 *     p12Passphrase: 'your-passphrase'
 *   }
 * );
 *
 * @example
 * // Initialize with PEM certificates
 * const api = new CyberSourceApi(
 *   '', // empty password when using certificates
 *   'your-merchant-id',
 *   'development',
 *   'en',
 *   '1.151',
 *   'USD',
 *   {
 *     privateKeyPath: '/path/to/private-key.pem',
 *     publicCertPath: '/path/to/certificate.pem',
 *     passphrase: 'optional-passphrase'
 *   }
 * );
 */
module.exports = class CyberSourceApi {
  /**
   * Create a CyberSource API client
   *
   * @param {string} password - CyberSource password (can be empty if using P12 certificates)
   * @param {string} merchantID - CyberSource merchant ID
   * @param {string} environment - Environment ('development' for sandbox, 'production' for live)
   * @param {string} language - Response language ('en' for English, 'es' for Spanish)
   * @param {string} version - CyberSource API version (e.g., '1.151')
   * @param {string} currency - Default currency code (e.g., 'USD', 'EUR')
   * @param {Object} [certOptions] - Certificate options for P12 or PEM authentication
   * @param {string} [certOptions.p12Path] - Path to P12 certificate file
   * @param {string} [certOptions.p12Base64] - P12 certificate as base64 string
   * @param {string} [certOptions.p12Passphrase] - Passphrase for P12 certificate
   * @param {string} [certOptions.privateKeyPath] - Path to private key PEM file
   * @param {string} [certOptions.publicCertPath] - Path to public certificate PEM file
   * @param {string} [certOptions.passphrase] - Passphrase for private key
   */
  constructor(password, merchantID, environment, language, version, currency, certOptions = null) {
    this.configuration = new Configuration(
      password,
      merchantID,
      environment,
      language,
      version,
      currency,
      certOptions
    );
    this.Models = new Models(version);
    this.ErrorObject = new this.Models.ErrorObject(language);
  }

  /**
   * Get the configuration object
   *
   * @returns {Configuration} The configuration object containing API settings
   */
  getConfiguration() {
    return this.configuration;
  }

  /**
   * Send a generic request to CyberSource
   *
   * This is a low-level method that can be used for custom requests.
   * Most users should use the specific methods like authorizeCharge, chargeCard, etc.
   *
   * @param {Object} request_object - The request object to send to CyberSource
   * @returns {Promise<Object>} Promise that resolves with the response or rejects with an error
   * @example
   * const customRequest = {
   *   merchantID: 'your-merchant-id',
   *   merchantReferenceCode: 'REF123',
   *   // ... other request fields
   * };
   * const result = await api.normalRequest(customRequest);
   */
  normalRequest(request_object) {
    return new Promise((resolve, reject) => {
      RunTransaction(this.configuration.url, request_object, this.configuration.getWsSecurity())
        .then(response => {
          if (response.reasonCode === 100) {
            resolve({
              message: this.ErrorObject.getMessage(response.reasonCode),
              code: response.reasonCode,
              data: response || '',
            });
          } else {
            reject({
              message: this.ErrorObject.getMessage(response.reasonCode),
              code: response.reasonCode,
              data: response,
            });
          }
        })
        .catch(error => {
          reject({
            message: this.ErrorObject.getMessage(500),
            code: 500,
            data: error,
          });
        });
    });
  }

  /**
   * Authorize a charge (without capturing it)
   *
   * This method authorizes a payment but does not capture it. You'll need to call
   * captureCharge separately to complete the transaction.
   *
   * @param {AuthorizationRequest} authorizationRequest - The authorization request object
   * @param {number} amount - The amount to authorize
   * @returns {Promise<Object>} Promise that resolves with authorization details
   * @throws {Object} Error object with code, message, and data properties
   * @example
   * const billTo = new api.Models.BillTo('John', 'Doe', '123 St', 'City', 'CA', '12345', 'US', 'john@test.com');
   * const card = new api.Models.Card('4111111111111111', '12', '2025', '123');
   * const authRequest = new api.Models.AuthorizationRequest('REF123', billTo, card);
   *
   * try {
   *   const result = await api.authorizeCharge(authRequest, 100.00);
   *   console.log('Authorization ID:', result.authorization);
   * } catch (error) {
   *   console.error('Authorization failed:', error.message);
   * }
   */
  authorizeCharge(authorizationRequest, amount) {
    return new Promise((resolve, reject) => {
      authorizationRequest.purchaseTotals = new this.Models.PurchaseTotals(
        this.configuration.currency,
        amount.toFixed(2) + ''
      );
      authorizationRequest.merchantID = this.configuration.merchantID;
      RunTransaction(
        this.configuration.url,
        authorizationRequest.getJSONWithAttributes(this.configuration.merchantID),
        this.configuration.getWsSecurity()
      )
        .then(res => {
          if (res.reasonCode == 100) {
            if (res.ccAuthReply.reasonCode == 100) {
              resolve({
                message: this.ErrorObject.getMessage(res.ccAuthReply.reasonCode),
                code: res.ccAuthReply.reasonCode,
                authorization: res.requestID,
              });
            } else {
              reject({
                message: this.ErrorObject.getMessage(res.ccAuthReply.reasonCode),
                code: res.ccAuthReply.reasonCode,
                data: res.ccAuthReply,
              });
            }
          } else {
            reject({
              message: this.ErrorObject.getMessage(res.reasonCode),
              code: res.reasonCode,
              data: res,
            });
          }
        })
        .catch(e => {
          reject({
            message: this.ErrorObject.getMessage(500),
            code: 500,
            data: e,
          });
        });
    });
  }

  /**
   * Capture a previously authorized charge
   *
   * @param {CaptureRequest} captureRequest - The capture request object
   * @param {number} amount - The amount to capture (should not exceed authorized amount)
   * @returns {Promise<Object>} Promise that resolves with capture confirmation
   * @throws {Object} Error object with code, message, and data properties
   * @example
   * const captureRequest = new api.Models.CaptureRequest('REF123', authorizationId);
   * const result = await api.captureCharge(captureRequest, 100.00);
   */
  captureCharge(captureRequest, amount) {
    return new Promise((resolve, reject) => {
      captureRequest.purchaseTotals = new this.Models.PurchaseTotals(
        this.configuration.currency,
        amount.toFixed(2) + ''
      );
      captureRequest.merchantID = this.configuration.merchantID;
      RunTransaction(
        this.configuration.url,
        captureRequest.getJSON(),
        this.configuration.getWsSecurity()
      )
        .then(res => {
          if (res.reasonCode == 100) {
            resolve({
              message: this.ErrorObject.getMessage(res.reasonCode),
              code: res.reasonCode,
            });
          } else {
            reject({
              message: this.ErrorObject.getMessage(res.reasonCode),
              code: res.reasonCode,
              data: res,
            });
          }
        })
        .catch(e => {
          reject({
            message: this.ErrorObject.getMessage(500),
            code: 500,
            data: e,
          });
        });
    });
  }

  /**
   * Create a subscription (tokenize a card) for future use
   *
   * @param {SubscriptionRequest} subscriptionRequest - The subscription request object
   * @returns {Promise<Object>} Promise that resolves with subscription token
   * @throws {Object} Error object with code, message, and data properties
   * @example
   * const subscriptionRequest = new api.Models.SubscriptionRequest('SUB123', billTo, card);
   * const result = await api.subscribeCard(subscriptionRequest);
   * console.log('Token:', result.token);
   */
  subscribeCard(subscriptionRequest) {
    return new Promise((resolve, reject) => {
      subscriptionRequest.purchaseTotals = new this.Models.PurchaseTotals(
        this.configuration.currency,
        subscriptionRequest.amount ? subscriptionRequest.amount.toString() : '0.00'
      );
      subscriptionRequest.merchantID = this.configuration.merchantID;
      RunTransaction(
        this.configuration.url,
        subscriptionRequest.getJSONWithAttributes(this.configuration.merchantID),
        this.configuration.getWsSecurity()
      )
        .then(res => {
          if (res.reasonCode == 100) {
            resolve({
              message: this.ErrorObject.getMessage(res.reasonCode),
              code: res.reasonCode,
              token: res.requestID,
            });
          } else {
            reject({
              message: this.ErrorObject.getMessage(res.reasonCode),
              code: res.reasonCode,
              data: res,
            });
          }
        })
        .catch(e => {
          reject({
            message: this.ErrorObject.getMessage(500),
            code: 500,
            data: e,
          });
        });
    });
  }

  /**
   * Get subscription information by subscription ID
   *
   * @param {SubscriptionInfoRequest} subscriptionInfoRequest - The subscription info request object
   * @returns {Promise<Object>} Promise that resolves with subscription information
   * @throws {Object} Error object with code, message, and data properties
   * @example
   * const subscriptionInfoRequest = new api.Models.SubscriptionInfoRequest('SUB-123456');
   * const result = await api.getSubscriptionInfo(subscriptionInfoRequest);
   * console.log('Subscription Info:', result);
   */
  getSubscriptionInfo(subscriptionInfoRequest) {
    return new Promise((resolve, reject) => {
      // Set the xmlns to match the API version
      subscriptionInfoRequest.xmlns = this.Models.xmlns;
      subscriptionInfoRequest.merchantID = this.configuration.merchantID;
      RunTransaction(
        this.configuration.url,
        subscriptionInfoRequest.getJSONWithAttributes(this.configuration.merchantID),
        this.configuration.getWsSecurity()
      )
        .then(res => {
          if (res.reasonCode == 100) {
            resolve({
              message: this.ErrorObject.getMessage(res.reasonCode),
              code: res.reasonCode,
              subscriptionInfo: res,
            });
          } else {
            reject({
              message: this.ErrorObject.getMessage(res.reasonCode),
              code: res.reasonCode,
              data: res,
            });
          }
        })
        .catch(e => {
          reject({
            message: this.ErrorObject.getMessage(500),
            code: 500,
            data: e,
          });
        });
    });
  }

  /**
   * Charge a previously subscribed card using its token
   *
   * @param {ChargeSubscriptionRequest} chargeSubscriptionRequest - The charge subscription request object
   * @param {number} amount - The amount to charge
   * @returns {Promise<Object>} Promise that resolves with charge confirmation
   * @throws {Object} Error object with code, message, and data properties
   * @example
   * const chargeSubRequest = new api.Models.ChargeSubscriptionRequest('CHARGE123', token);
   * const result = await api.chargeSubscribedCard(chargeSubRequest, 50.00);
   */
  chargeSubscribedCard(chargeSubscriptionRequest, amount) {
    return new Promise((resolve, reject) => {
      chargeSubscriptionRequest.purchaseTotals = new this.Models.PurchaseTotals(
        this.configuration.currency,
        amount.toFixed(2) + ''
      );
      chargeSubscriptionRequest.merchantID = this.configuration.merchantID;
      RunTransaction(
        this.configuration.url,
        chargeSubscriptionRequest.getJSON(),
        this.configuration.getWsSecurity()
      )
        .then(res => {
          if (res.reasonCode == 100) {
            resolve({
              message: this.ErrorObject.getMessage(res.reasonCode),
              code: res.reasonCode,
            });
          } else {
            reject({
              message: this.ErrorObject.getMessage(res.reasonCode),
              code: res.reasonCode,
              data: res,
            });
          }
        })
        .catch(e => {
          reject({
            message: this.ErrorObject.getMessage(500),
            code: 500,
            data: e,
          });
        });
    });
  }

  /**
   * Charge a card directly (authorization + capture in one step)
   *
   * This is the most commonly used method for processing payments.
   * It combines authorization and capture into a single transaction.
   *
   * @param {ChargeRequest} chargeRequest - The charge request object
   * @param {number} amount - The amount to charge
   * @returns {Promise<Object>} Promise that resolves with charge confirmation
   * @throws {Object} Error object with code, message, and data properties
   * @example
   * const billTo = new api.Models.BillTo('John', 'Doe', '123 St', 'City', 'CA', '12345', 'US', 'john@test.com');
   * const card = new api.Models.Card('4111111111111111', '12', '2025', '123');
   * const chargeRequest = new api.Models.ChargeRequest('REF123', billTo, card);
   *
   * try {
   *   const result = await api.chargeCard(chargeRequest, 100.00);
   *   console.log('Charge successful:', result.message);
   * } catch (error) {
   *   console.error('Charge failed:', error.message);
   * }
   */
  chargeCard(chargeRequest, amount) {
    return new Promise((resolve, reject) => {
      chargeRequest.purchaseTotals = new this.Models.PurchaseTotals(
        this.configuration.currency,
        amount.toFixed(2) + ''
      );
      chargeRequest.merchantID = this.configuration.merchantID;
      RunTransaction(
        this.configuration.url,
        chargeRequest.getJSON(),
        this.configuration.getWsSecurity()
      )
        .then(res => {
          if (res.reasonCode == 100) {
            resolve({
              message: this.ErrorObject.getMessage(res.reasonCode),
              code: res.reasonCode,
            });
          } else {
            reject({
              message: this.ErrorObject.getMessage(res.reasonCode),
              code: res.reasonCode,
              data: res,
            });
          }
        })
        .catch(e => {
          reject({
            message: this.ErrorObject.getMessage(500),
            code: 500,
            data: e,
          });
        });
    });
  }
};
