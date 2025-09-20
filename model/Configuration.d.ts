import soap = require("soap");

export = Configuration;

declare class Configuration {
  password:string;
  merchantID:string;
  environment:string;
  language:string;
  version:string;
  currency:string;
  url:string;
  options:any;
  constructor(password:string,merchantID:string,environment:string,language:string,version:string,currency:string)

  getWsSecurity():soap.WSSecurity;

  getMerchantID():string;

  getCurrency():string;
}