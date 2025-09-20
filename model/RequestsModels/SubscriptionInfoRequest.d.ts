import { PurchaseTotals } from '../PurchaseTotals';

export interface SubscriptionInfoRequestOptions {
  subscriptionID: string;
  currency?: string;
  xmlns?: string;
}

export class SubscriptionInfoRequest {
  subscriptionID: string;
  currency: string;
  xmlns: string;
  purchaseTotals: PurchaseTotals;
  recurringSubscriptionInfo: {
    subscriptionID: string;
    attributes: {
      xmlns: string;
    };
  };
  paySubscriptionRetrieveService: {
    attributes: {
      run: boolean;
    };
  };

  constructor(subscriptionID: string, currency?: string, xmlns?: string);

  getJSON(): {
    merchantID: string;
    merchantReferenceCode: string;
    purchaseTotals: any;
    recurringSubscriptionInfo: any;
    paySubscriptionRetrieveService: any;
  };

  getJSONWithAttributes(merchantID: string): {
    merchantID: string;
    merchantReferenceCode: string;
    purchaseTotals: any;
    recurringSubscriptionInfo: any;
    paySubscriptionRetrieveService: any;
  };
}
