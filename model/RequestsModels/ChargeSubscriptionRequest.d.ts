import PurchaseTotals = require("../PurchaseTotals");

export = ChargeSubscriptionRequest;

declare class ChargeSubscriptionRequest {
  merchantID:string;
  merchantReferenceCode:string;
  ccAuthService:any;
  ccCaptureService:any;
  recurringSubscriptionInfo:any;
  purchaseTotals:PurchaseTotals;

  constructor(merchantReferenceCode:string,token:string)

  getJSON():any;
}
