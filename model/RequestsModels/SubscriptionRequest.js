module.exports = class SubscriptionRequest {
  constructor(
    merchantReferenceCode,
    billTo,
    card,
    amount,
    numberOfPayments,
    startDate,
    cardType,
    automaticRenew,
    frequency
  ) {
    this.merchantReferenceCode = merchantReferenceCode;
    this.billTo = billTo;
    this.card = card;
    this.amount = amount;
    this.numberOfPayments = numberOfPayments;
    this.startDate = startDate;
    this.cardType = cardType;
    this.automaticRenew = automaticRenew;
    this.frequency = frequency;
    this.recurringSubscriptionInfo = {
      attributes: {
        xmlns: 'urn:schemas-cybersource-com:transaction-data-1.151',
      },
      amount,
      numberOfPayments,
      automaticRenew,
      frequency,
      startDate,
    };

    this.paySubscriptionCreateService = {
      attributes: {
        run: true,
      },
    };
  }

  getJSON() {
    return {
      merchantID: this.merchantID,
      merchantReferenceCode: this.merchantReferenceCode,
      billTo: this.billTo.getJSON(),
      purchaseTotals: this.purchaseTotals.getOnlyCurrencyJSON(),
      card: this.card.getJSON(),
      recurringSubscriptionInfo: this.recurringSubscriptionInfo,
      paySubscriptionCreateService: this.paySubscriptionCreateService,
    };
  }

  /**
   * Get JSON with XML attributes for model-based requests
   * @param {string} merchantID - The merchant ID
   * @returns {Object} Request data with XML namespace attributes
   */
  getJSONWithAttributes(merchantID) {
    return {
      merchantID,
      merchantReferenceCode: this.merchantReferenceCode,
      billTo: this.billTo.getJSON(),
      purchaseTotals: this.purchaseTotals.getOnlyCurrencyJSON(),
      card: this.card.getJSONWithAttributes(),
      recurringSubscriptionInfo: this.recurringSubscriptionInfo,
      paySubscriptionCreateService: this.paySubscriptionCreateService,
    };
  }
};
