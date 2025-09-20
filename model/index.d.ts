import AuthorizationRequest = require("./RequestsModels/AuthorizationRequest");
import SubscriptionRequest = require("./RequestsModels/SubscriptionRequest");
import SubscriptionInfoRequest = require("./RequestsModels/SubscriptionInfoRequest");
import BillTo from "./BillTo";
import Card from "./Card";
import PurchaseTotals from "./PurchaseTotals";
import ErrorObject from "./ErrorObject";
import CaptureRequest = require("./RequestsModels/CaptureRequest");
import ChargeSubscriptionRequest = require("./RequestsModels/ChargeSubscriptionRequest");
import ChargeRequest = require("./RequestsModels/ChargeRequest");
export = Models;

/*~ Write your module's methods and properties in this class */
declare class Models {
    AuthorizationRequest = AuthorizationRequest;
    SubscriptionRequest = SubscriptionRequest;
    SubscriptionInfoRequest = SubscriptionInfoRequest;
    ChargeSubscriptionRequest = ChargeSubscriptionRequest;
    CaptureRequest = CaptureRequest;
    ChargeRequest = ChargeRequest;
    BillTo = BillTo;
    Card = Card;
    PurchaseTotals = PurchaseTotals;
    ErrorObject = ErrorObject;
    constructor()
}