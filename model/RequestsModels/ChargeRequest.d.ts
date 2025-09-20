import BillTo = require("../BillTo");
import Card = require("../Card");
import PurchaseTotals = require("../PurchaseTotals");

export = ChargeRequest;

/*~ Write your module's methods and properties in this class */
declare class ChargeRequest {
    merchantID:string;
    merchantReferenceCode:string;
    billTo:BillTo;
    card:Card;
    ccAuthService:any;
    ccCaptureService:any;
    purchaseTotals:PurchaseTotals;

    constructor(merchantReferenceCode:string,billTo:BillTo,card:Card)
    
    getJSON():any;
}