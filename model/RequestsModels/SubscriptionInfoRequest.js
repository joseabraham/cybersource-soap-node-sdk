const PurchaseTotals = require('../PurchaseTotals');

module.exports = class SubscriptionInfoRequest {
  constructor(
    subscriptionID,
    currency = 'USD',
    xmlns = 'urn:schemas-cybersource-com:transaction-data-1.151'
  ) {
    if (!subscriptionID) {
      throw new Error('subscriptionID is required for SubscriptionInfoRequest');
    }

    this.subscriptionID = subscriptionID;
    this.currency = currency;
    this.xmlns = xmlns;
    this.merchantReferenceCode = `SI-${Date.now()}`; // Generate unique reference code

    // Create purchaseTotals with proper structure (no amount needed for info requests)
    this.purchaseTotals = new PurchaseTotals(currency, '0.00', this.xmlns);

    // Create recurringSubscriptionInfo with proper structure
    this.recurringSubscriptionInfo = {
      subscriptionID: this.subscriptionID,
      attributes: {
        xmlns: this.xmlns,
      },
    };

    // Create paySubscriptionRetrieveService
    this.paySubscriptionRetrieveService = {
      attributes: {
        run: true,
      },
    };
  }

  getJSON() {
    return {
      merchantID: this.merchantID,
      merchantReferenceCode: this.merchantReferenceCode,
      purchaseTotals: this.purchaseTotals.getOnlyCurrencyJSON(),
      recurringSubscriptionInfo: this.recurringSubscriptionInfo,
      paySubscriptionRetrieveService: this.paySubscriptionRetrieveService,
    };
  }

  getJSONWithAttributes(merchantID) {
    // Update the xmlns in recurringSubscriptionInfo to match the current version
    this.recurringSubscriptionInfo.attributes.xmlns = this.xmlns;

    // Update the xmlns in purchaseTotals to match the current version
    this.purchaseTotals.xmlns = this.xmlns;
    this.purchaseTotals.attributes.xmlns = this.xmlns;

    return {
      merchantID,
      merchantReferenceCode: this.merchantReferenceCode,
      purchaseTotals: this.purchaseTotals.getJSONWithAttributes(),
      recurringSubscriptionInfo: this.recurringSubscriptionInfo,
      paySubscriptionRetrieveService: this.paySubscriptionRetrieveService,
    };
  }
};
