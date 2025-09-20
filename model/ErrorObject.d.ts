export = ReasonCodes;

declare class ReasonCodes {
  lang:string;
  constructor(lang:string)
  getMessage(code:string):string;
}