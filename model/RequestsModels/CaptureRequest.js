module.exports = class CaptureRequest {
  constructor(merchantReferenceCode, authorization) {
    this.merchantReferenceCode = merchantReferenceCode;
    this.ccCaptureService = {
      attributes: { run: true },
      authRequestID: authorization,
    };
  }

  getJSON() {
    return {
      merchantID: this.merchantID,
      merchantReferenceCode: this.merchantReferenceCode,
      purchaseTotals: this.purchaseTotals.getJSON(),
      ccCaptureService: this.ccCaptureService,
    };
  }
};
