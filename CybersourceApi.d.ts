import AuthorizationRequest = require("./model/RequestsModels/AuthorizationRequest");
import Models = require("./model");
import Configuration = require("./model/Configuration");
import SubscriptionRequest = require("./model/RequestsModels/SubscriptionRequest");
import CaptureRequest = require("./model/RequestsModels/CaptureRequest");
import ChargeSubscriptionRequest = require("./model/RequestsModels/ChargeSubscriptionRequest");
import ChargeRequest = require("./model/RequestsModels/ChargeRequest");
export = CyberSourceApi;

/*~ Write your module's methods and properties in this class */
declare class CyberSourceApi {
  password: string;
  merchantID: string;
  environment: string;
  language: string;
  version: string;
  currency: string;
  Models: Models;
  constructor(
    password: string,
    merchantID: string,
    environment: string,
    language: string,
    version: string,
    currency: string
  );

  getConfiguration(): Configuration;

  normalRequest(request_object: Object): Promise<any>;
  authorizeCharge(
    authorizationRequest: AuthorizationRequest,
    amount: number
  ): Promise<any>;
  subscribeCard(subscriptionRequest: SubscriptionRequest): Promise<any>;
  chargeSubscribedCard(
    chargeSubscriptionRequest: ChargeSubscriptionRequest,
    amount: number
  ): Promise<any>;
  chargeCard(chargeRequest: ChargeRequest, amount: number): Promise<any>;
  captureCharge(captureRequest: CaptureRequest, amount: number): Promise<any>;
}
