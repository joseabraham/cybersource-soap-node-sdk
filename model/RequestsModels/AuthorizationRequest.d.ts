import BillTo = require("../BillTo");
import Card = require("../Card");
import PurchaseTotals = require("../PurchaseTotals");

export = AuthorizationRequest;

/*~ Write your module's methods and properties in this class */
declare class AuthorizationRequest {
    merchantID:string;
    merchantReferenceCode:string;
    billTo:BillTo;
    card:Card;
    ccAuthService:any;
    purchaseTotals:PurchaseTotals;

    constructor(merchantReferenceCode:string,billTo:BillTo,card:Card)
    
    getJSON():any;
}