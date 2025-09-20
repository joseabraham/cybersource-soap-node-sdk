/**
 * Card model for CyberSource SOAP transactions
 * Supports both direct property access and XML attribute structure
 */
module.exports = class Card {
  constructor(accountNumber, expirationMonth, expirationYear, cvNumber, cardType, moreParams) {
    this.accountNumber = accountNumber;
    this.expirationMonth = expirationMonth;
    this.expirationYear = expirationYear;
    this.cvNumber = cvNumber;
    this.cardType = cardType;
    this.moreParams = moreParams;

    // Add XML namespace attributes that work with CyberSource
    this.attributes = {
      xmlns: 'urn:schemas-cybersource-com:transaction-data-1.151',
    };
  }

  /**
   * Get JSON representation for direct normalRequest usage
   * @returns {Object} Card data without XML attributes
   */
  getJSON() {
    const json = {
      accountNumber: this.accountNumber,
      expirationMonth: this.expirationMonth,
      expirationYear: this.expirationYear,
      cvNumber: this.cvNumber,
    };

    if (this.cardType) {
      json.cardType = this.cardType;
    }

    return json;
  }

  /**
   * Get JSON with XML attributes for model-based requests
   * @returns {Object} Card data with XML namespace attributes
   */
  getJSONWithAttributes() {
    return {
      ...this.getJSON(),
      attributes: this.attributes,
    };
  }
};
