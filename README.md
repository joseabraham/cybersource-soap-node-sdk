# CyberSource SOAP Node.js SDK

[![npm version](https://img.shields.io/npm/v/cybersource-soap-node-sdk.svg)](https://www.npmjs.com/package/cybersource-soap-node-sdk)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Downloads](https://img.shields.io/npm/dm/cybersource-soap-node-sdk.svg)](https://www.npmjs.com/package/cybersource-soap-node-sdk)

**Unofficial Node.js SDK for CyberSource SOAP API with P12 certificate support**

A comprehensive Node.js library for integrating with CyberSource's payment processing services via SOAP API. This SDK provides a clean, promise-based interface for credit card processing, subscription management, and tokenization.

## 🚀 Features

- ✅ **Complete SOAP API Coverage**: Authorization, capture, direct charge, subscriptions
- 🔐 **Dual Authentication**: Username/password and P12 certificate support
- 🛡️ **Type Safety**: Full TypeScript definitions included
- 🧪 **Well Tested**: Comprehensive unit and integration tests
- 📚 **Extensive Documentation**: JSDoc comments and usage examples
- 🔧 **Developer Friendly**: Interactive credential testing and examples
- 🌍 **Multi-language**: English and Spanish error messages
- 💳 **Flexible**: Support for multiple currencies and card types

## 📦 Installation

```bash
npm install cybersource-soap-node-sdk
```

## 🏃 Quick Start

### Basic Setup (Username/Password)

```javascript
const CybersourceApi = require('cybersource-soap-node-sdk');

const api = new CybersourceApi(
  'your-password', // CyberSource password
  'your-merchant-id', // CyberSource merchant ID
  'development', // 'development' or 'production'
  'en', // Language: 'en' or 'es'
  '1.151', // API version
  'USD' // Default currency
);
```

### Simple Credit Card Charge (Direct Approach - Recommended)

```javascript
const request = {
  merchantID: 'your-merchant-id',
  merchantReferenceCode: 'REF-' + Date.now(),
  billTo: {
    firstName: 'John',
    lastName: 'Doe',
    street1: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'US',
    phoneNumber: '4155551234',
    email: 'john.doe@example.com',
    ipAddress: '192.168.1.1',
    customerID: 'customer123',
  },
  purchaseTotals: {
    currency: 'USD',
    grandTotalAmount: '100.00',
  },
  card: {
    accountNumber: '4111111111111111',
    expirationMonth: '12',
    expirationYear: '2025',
    cvNumber: '123',
  },
  ccAuthService: { run: true },
};

try {
  const result = await api.normalRequest(request);
  console.log('Authorization successful:', result);
} catch (error) {
  console.error('Payment failed:', error);
}
```

### Model-Based Approach (With Validation)

```javascript
// Create billing information
const billTo = new api.Models.BillTo(
  'John', // firstName
  'Doe', // lastName
  '123 Main Street', // address
  'Anytown', // city
  'CA', // state
  '12345', // postalCode
  'US', // country
  'john.doe@email.com' // email
);

// Create card information
const card = new api.Models.Card(
  '4111111111111111', // accountNumber
  '12', // expirationMonth
  '2025', // expirationYear
  '123' // cvNumber
);

// Create and process charge
const chargeRequest = new api.Models.ChargeRequest('ORDER-123', billTo, card);

try {
  const result = await api.chargeCard(chargeRequest, 100.0);
  console.log('✅ Payment successful:', result.message);
} catch (error) {
  console.error('❌ Payment failed:', error.message, 'Code:', error.code);
}
```

## 🔐 P12 Certificate Authentication

For enhanced security, you can use P12 certificates instead of passwords.

### 1. Convert P12 to PEM Files

```bash
# Extract private key
openssl pkcs12 -in certificate.p12 -out private-key.pem -nocerts -nodes

# Extract certificate
openssl pkcs12 -in certificate.p12 -out certificate.pem -nokeys -clcerts
```

### 2. Configure Certificate Authentication

#### Option A: Using Meteor Settings (if using Meteor)

```json
{
  "dev": {
    "cybersourceCert": {
      "privateKeyPath": "/path/to/private-key.pem",
      "publicCertPath": "/path/to/certificate.pem",
      "passphrase": "optional-passphrase"
    }
  },
  "prod": {
    "cybersourceCert": {
      "privateKeyPath": "/path/to/prod-private-key.pem",
      "publicCertPath": "/path/to/prod-certificate.pem",
      "passphrase": "optional-passphrase"
    }
  }
}
```

#### Option B: Environment Variables (Coming Soon)

```javascript
// Initialize with empty password when using P12
const api = new CybersourceApi('', 'your-merchant-id', 'development', 'en', '1.151', 'USD');
```

## 📖 API Reference

### Main Methods

#### `chargeCard(chargeRequest, amount)`

Process a direct charge (auth + capture in one step)

```javascript
const result = await api.chargeCard(chargeRequest, 100.0);
// Returns: { message: "Success", code: 100 }
```

#### `authorizeCharge(authRequest, amount)`

Authorize a charge without capturing

```javascript
const result = await api.authorizeCharge(authRequest, 100.0);
// Returns: { message: "Success", code: 100, authorization: "auth-id" }
```

#### `captureCharge(captureRequest, amount)`

Capture a previously authorized charge

```javascript
const captureRequest = new api.Models.CaptureRequest('ORDER-123', authorizationId);
const result = await api.captureCharge(captureRequest, 100.0);
```

#### `subscribeCard(subscriptionRequest)`

Tokenize a card for future use

```javascript
const result = await api.subscribeCard(subscriptionRequest);
// Returns: { message: "Success", code: 100, token: "subscription-token" }
```

#### `chargeSubscribedCard(chargeSubRequest, amount)`

Charge a previously tokenized card

```javascript
const result = await api.chargeSubscribedCard(chargeSubRequest, 100.0);
// Returns: { message: "Success", code: 100 }
```

#### `getSubscriptionInfo(subscriptionInfoRequest)`

Retrieve information about a subscription by its ID

```javascript
const subscriptionInfoRequest = new api.Models.SubscriptionInfoRequest('SUB-123456');
const result = await api.getSubscriptionInfo(subscriptionInfoRequest);
// Returns: { message: "Success", code: 100, subscriptionInfo: {...} }
```

#### `normalRequest(requestObject)`

Send a raw request object directly to CyberSource (recommended for flexibility)

```javascript
const result = await api.normalRequest(requestObject);
// Returns: CyberSource response object
```

## 🏗️ Updated Models (v2.0+)

The SDK models have been enhanced to support both direct requests and XML-attribute based requests that generate proper SOAP XML.

### Model Classes Available

- `BillTo` - Billing address and customer information
- `Card` - Credit card details
- `PurchaseTotals` - Transaction amounts and currency
- `CCAuthService` - Authorization service configuration
- `AuthorizationRequest` - Complete authorization request

### Two Model Approaches

#### 1. Simple JSON (for normalRequest)

```javascript
const card = new api.Models.Card('4111111111111111', '12', '2025', '123');
const cardData = card.getJSON();
// Returns: { accountNumber: '4111111111111111', expirationMonth: '12', ... }
```

#### 2. XML Attributes (for complex SOAP requirements)

```javascript
const card = new api.Models.Card('4111111111111111', '12', '2025', '123');
const cardDataWithAttributes = card.getJSONWithAttributes();
// Returns: { accountNumber: '4111111111111111', ..., attributes: { xmlns: '...' } }
```

### Complete Example with Models

```javascript
const models = new (require('cybersource-soap-node-sdk').Models)();

// Create model instances
const billTo = new models.BillTo(
  'John',
  'Doe',
  '123 Main St',
  'San Francisco',
  'CA',
  '94105',
  'US',
  'john@example.com',
  '4155551234',
  '192.168.1.1',
  'customer123'
);

const purchaseTotals = new models.PurchaseTotals('USD', '100.00');
const card = new models.Card('4111111111111111', '12', '2025', '123');

const authRequest = new models.AuthorizationRequest(
  'REF-' + Date.now(),
  billTo,
  card,
  purchaseTotals
);

// Use with normalRequest (generates proper XML)
const result = await api.normalRequest(authRequest.getJSONWithAttributes('your-merchant-id'));
```

## 💳 Additional Examples

### Charge a Previously Tokenized Card

```javascript
const chargeSubRequest = new api.Models.ChargeSubscriptionRequest('CHARGE-123', token);
const result = await api.chargeSubscribedCard(chargeSubRequest, 50.0);
```

### Model Classes

#### `BillTo`

```javascript
new api.Models.BillTo(firstName, lastName, address, city, state, postalCode, country, email);
```

#### `Card`

```javascript
new api.Models.Card(accountNumber, expirationMonth, expirationYear, cvNumber, cardType);
```

#### `PurchaseTotals`

```javascript
new api.Models.PurchaseTotals(currency, grandTotalAmount);
```

## 🧪 Testing Your Integration

### Interactive Credential Testing

Test your credentials quickly:

```bash
npm run test:credentials
```

This interactive tool will guide you through testing your CyberSource configuration, including:

- Basic authorization
- Different card types
- Error scenarios
- Transaction types
- Validation edge cases
- All certificate authentication methods

### Certificate Testing

Test your certificates with comprehensive testing tools:

```bash
# Quick test (recommended)
npm run test:certificates

# Interactive testing with menu
npm run test:certificates-interactive

# Convert base64 certificates to PEM files
npm run convert:certificates
```

### Certificate Examples

Run the certificate examples to see all authentication methods in action:

```bash
npm run examples:certificates
```

This demonstrates:

- Username/Password authentication
- PEM certificates (file path and base64) ⭐ Recommended
- Environment variable configuration

### Run Example Transactions

```bash
# View all examples
node test/interactive/examples.js

# Run specific example
node test/interactive/examples.js charge
```

### Unit Tests

```bash
# Run unit tests (recommended for CI/CD)
npm test

# Run all tests including integration tests
npm run test:all

# Run only unit tests
npm run test:unit

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

**Note**: Integration tests use mocked RunTransaction calls to test the complete API flow without requiring actual CyberSource connectivity.

## 🌐 Supported Environments

- **Sandbox/Development**: `https://ics2wstesta.ic3.com`
- **Production**: `https://ics2wsa.ic3.com`

## 💳 Supported Card Types

- Visa
- MasterCard
- American Express
- Discover
- Diners Club
- JCB

## 📊 Error Codes

| Code | Description                           |
| ---- | ------------------------------------- |
| 100  | Success                               |
| 101  | Missing required field                |
| 102  | Invalid merchant ID or password       |
| 201  | Issuer declined transaction           |
| 202  | Expired card                          |
| 204  | Insufficient funds                    |
| 231  | Account takeover protection triggered |

[View complete error code reference](https://developer.cybersource.com/api-reference-assets/index.html#reason-codes)

## 🛠️ Development

### Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/cybersource-soap-node-sdk.git
cd cybersource-soap-node-sdk

# Install dependencies
npm install

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for your changes
5. Ensure tests pass (`npm test`)
6. Lint your code (`npm run lint`)
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to your branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

**This is an unofficial SDK created by the community.** It is not officially supported by CyberSource or Visa. Use at your own risk.

- Always test thoroughly in a sandbox environment before going to production
- Keep your credentials secure and never commit them to version control
- Follow PCI DSS compliance requirements when handling credit card data
- Review CyberSource's official documentation for the most up-to-date API specifications

## 🆘 Support

- 📚 [CyberSource Official Documentation](https://developer.cybersource.com/)
- 🐛 [Report Issues](https://github.com/yourusername/cybersource-soap-node-sdk/issues)
- 💬 [Discussions](https://github.com/yourusername/cybersource-soap-node-sdk/discussions)

## 🔗 Related Projects

- [CyberSource REST API SDK](https://github.com/CyberSource/cybersource-rest-client-node)
- [CyberSource Official SDKs](https://developer.cybersource.com/hello-world/sandbox.html)

---

## 🙏 Acknowledgments

This project builds upon the original work by [**Jaime Fonseca**](https://www.npmjs.com/~jaimejosu3) who created the first version of the CyberSource SOAP Node.js SDK. His foundational work made this enhanced version possible.

**Made with ❤️ by the community for the community**
