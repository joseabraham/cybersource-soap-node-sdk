/**
 * PurchaseTotals model for CyberSource SOAP transactions
 * Supports both direct property access and XML attribute structure
 */
module.exports = class PurchaseTotals {
  constructor(
    currency,
    grandTotalAmount,
    xmlns = 'urn:schemas-cybersource-com:transaction-data-1.151'
  ) {
    this.currency = currency;
    this.grandTotalAmount = grandTotalAmount;
    this.xmlns = xmlns;

    // Add XML namespace attributes that work with CyberSource
    this.attributes = {
      xmlns: this.xmlns,
    };
  }

  /**
   * Get JSON representation for direct normalRequest usage
   * @returns {Object} Purchase totals data without XML attributes
   */
  getJSON() {
    return {
      currency: this.currency,
      grandTotalAmount: this.grandTotalAmount,
    };
  }

  /**
   * Get JSON with XML attributes for model-based requests
   * @returns {Object} Purchase totals data with XML namespace attributes
   */
  getJSONWithAttributes() {
    return {
      ...this.getJSON(),
      attributes: this.attributes,
    };
  }

  /**
   * Get only currency for partial requests
   * @returns {Object} Currency only
   */
  getOnlyCurrencyJSON() {
    return {
      currency: this.currency,
    };
  }
};
