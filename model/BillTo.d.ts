export = BillTo;

declare class BillTo {
  firstName:string;
  lastName:string;
  street1:string;
  city:string;
  state:string;
  postalCode:string;
  country:string;
  email:string;
  constructor(firstName:string,lastName:string,street1:string,city:string,state:string,postalCode:string,country:string,email:string)
  getJSON():any
}