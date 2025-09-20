/**
 * BillTo model for CyberSource SOAP transactions
 * Represents billing address and customer information
 */
module.exports = class BillTo {
  constructor(
    firstName,
    lastName,
    street1,
    city,
    state,
    postalCode,
    country,
    email,
    phoneNumber,
    ipAddress,
    customerID
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.street1 = street1;
    this.city = city;
    this.state = state;
    this.postalCode = postalCode;
    this.country = country;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.ipAddress = ipAddress;
    this.customerID = customerID;
  }

  /**
   * Get JSON representation for direct normalRequest usage
   * @returns {Object} Billing data without XML attributes
   */
  getJSON() {
    const json = {
      firstName: this.firstName,
      lastName: this.lastName,
      street1: this.street1,
      city: this.city,
      state: this.state,
      postalCode: this.postalCode,
      country: this.country,
      email: this.email,
    };

    // Add optional fields if provided
    if (this.phoneNumber) json.phoneNumber = this.phoneNumber;
    if (this.ipAddress) json.ipAddress = this.ipAddress;
    if (this.customerID !== undefined) json.customerID = this.customerID;

    return json;
  }
};
