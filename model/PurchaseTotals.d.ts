export = PurchaseTotals;
declare class PurchaseTotals {
  currency:string;
  grandTotalAmount:string;
  constructor(currency:string,grandTotalAmount:string);
  getJSON():anuy;
  getOnlyCurrencyJSON():any;
}