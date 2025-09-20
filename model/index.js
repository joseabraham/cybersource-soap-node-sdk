const AuthorizationRequest = require('./RequestsModels/AuthorizationRequest');
const SubscriptionRequest = require('./RequestsModels/SubscriptionRequest');
const SubscriptionInfoRequest = require('./RequestsModels/SubscriptionInfoRequest');
const ChargeSubscriptionRequest = require('./RequestsModels/ChargeSubscriptionRequest');
const ChargeRequest = require('./RequestsModels/ChargeRequest');
const CaptureRequest = require('./RequestsModels/CaptureRequest');
const BillTo = require('./BillTo');
const Card = require('./Card');
const PurchaseTotals = require('./PurchaseTotals');
const CCAuthService = require('./CCAuthService');
const ErrorObject = require('./ErrorObject');

module.exports = class Models {
  constructor(version = '1.151') {
    this.version = version;
    this.xmlns = `urn:schemas-cybersource-com:transaction-data-${version}`;

    this.AuthorizationRequest = AuthorizationRequest;
    this.SubscriptionRequest = SubscriptionRequest;
    this.SubscriptionInfoRequest = SubscriptionInfoRequest;
    this.ChargeSubscriptionRequest = ChargeSubscriptionRequest;
    this.ChargeRequest = ChargeRequest;
    this.CaptureRequest = CaptureRequest;
    this.BillTo = BillTo;
    this.Card = Card;
    this.PurchaseTotals = PurchaseTotals;
    this.CCAuthService = CCAuthService;
    this.ErrorObject = ErrorObject;
  }
};
