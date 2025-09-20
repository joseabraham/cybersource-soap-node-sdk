export = Card;
declare class Card {
  accountNumber:string;
  expirationMonth:string;
  expirationYear:string;
  cvNumber:string;
  cardType:string
  moreParams:any;
  constructor(accountNumber:strring,expirationMonth:string,expirationYear:string,cvNumber:string,cardType:string,moreParams?:any)

  getJSON():any;
}