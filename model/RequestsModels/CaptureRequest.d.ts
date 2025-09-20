import PurchaseTotals = require("../PurchaseTotals");

export = CaptureRequest;

declare class CaptureRequest {
  merchantID:string;
  merchantReferenceCode:string;
  purchaseTotals:PurchaseTotals;
  ccCaptureService: any;

  constructor(merchantReferenceCode:string,authorization:string)
  
  getJSON():any;
}

