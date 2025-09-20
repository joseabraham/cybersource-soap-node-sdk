module.exports = class ChargeSubscriptionRequest {
  constructor(merchantReferenceCode, token) {
    this.merchantReferenceCode = merchantReferenceCode;
    this.ccAuthService = {
      attributes: { run: true },
    };
    this.ccCaptureService = {
      attributes: { run: true },
    };
    this.recurringSubscriptionInfo = {
      subscriptionID: token,
      frequency: 'on-demand',
    };
  }

  getJSON() {
    return {
      merchantID: this.merchantID,
      merchantReferenceCode: this.merchantReferenceCode,
      purchaseTotals: this.purchaseTotals.getJSON(),
      recurringSubscriptionInfo: this.recurringSubscriptionInfo,
      ccAuthService: this.ccAuthService,
      ccCaptureService: this.ccCaptureService,
    };
  }
};
