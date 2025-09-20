import soap = require("soap");
import AuthorizationRequest = require("../model/RequestsModels/AuthorizationRequest");
import SubscriptionRequest = require("../model/RequestsModels/SubscriptionRequest");
export = RunTransaction;

declare function RunTransaction(url:string,authorizationRequest:AuthorizationRequest | SubscriptionRequest,wsSecurity:soap.WSSecurity):Promise<any>;