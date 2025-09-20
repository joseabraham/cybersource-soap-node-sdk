import BillTo = require("../BillTo");
import Card = require("../Card");
import PurchaseTotals = require("../PurchaseTotals");

export = SubscriptionRequest;
declare class SubscriptionRequest{
  merchantID:string;
  merchantReferenceCode:string;
  billTo:BillTo;
  purchaseTotals:PurchaseTotals;
  card:Card;
  recurringSubscriptionInfo:string;
  paySubscriptionCreateService:string;
  constructor(merchantReferenceCode:string,billTo:BillTo,card:Card)
  getJSON():any;
}