module.exports = class ChargeRequest {
  constructor(merchantReferenceCode, billTo, card) {
    this.merchantReferenceCode = merchantReferenceCode;
    this.billTo = billTo;
    this.card = card;
    this.ccAuthService = {
      attributes: { run: true },
    };
    this.ccCaptureService = {
      attributes: { run: true },
    };
  }

  getJSON() {
    return {
      merchantID: this.merchantID,
      merchantReferenceCode: this.merchantReferenceCode,
      billTo: this.billTo.getJSON(),
      purchaseTotals: this.purchaseTotals.getJSON(),
      card: this.card.getJSON(),
      ccAuthService: this.ccAuthService,
      ccCaptureService: this.ccCaptureService,
    };
  }
};
