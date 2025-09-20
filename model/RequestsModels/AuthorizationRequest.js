const CCAuthService = require('../CCAuthService');

/**
 * AuthorizationRequest model for CyberSource SOAP transactions
 * Supports both direct normalRequest and model-based requests with XML attributes
 */
module.exports = class AuthorizationRequest {
  constructor(merchantReferenceCode, billTo, card, purchaseTotals) {
    this.merchantReferenceCode = merchantReferenceCode;
    this.billTo = billTo;
    this.card = card;
    this.purchaseTotals = purchaseTotals;
    this.ccAuthService = new CCAuthService(true);
  }

  /**
   * Get JSON representation for direct normalRequest usage
   * @param {string} merchantID - The merchant ID
   * @returns {Object} Request data without XML attributes
   */
  getJSON(merchantID) {
    return {
      merchantID,
      merchantReferenceCode: this.merchantReferenceCode,
      billTo: this.billTo.getJSON(),
      purchaseTotals: this.purchaseTotals.getJSON(),
      card: this.card.getJSON(),
      ccAuthService: this.ccAuthService.getJSON(),
    };
  }

  /**
   * Get JSON with XML attributes for model-based requests
   * Uses the working pattern with attributes that generate proper XML
   * @param {string} merchantID - The merchant ID
   * @returns {Object} Request data with XML namespace attributes
   */
  getJSONWithAttributes(merchantID) {
    return {
      merchantID,
      merchantReferenceCode: this.merchantReferenceCode,
      billTo: this.billTo.getJSON(),
      purchaseTotals: this.purchaseTotals.getJSONWithAttributes(),
      card: this.card.getJSONWithAttributes(),
      ccAuthService: this.ccAuthService.getJSONWithAttributes(),
    };
  }
};
