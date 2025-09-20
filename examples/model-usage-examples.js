#!/usr/bin/env node

/* eslint-disable no-console */

/**
 * CyberSource SOAP SDK - Model Usage Examples
 *
 * This file demonstrates how to use the updated models with both approaches:
 * 1. Direct normalRequest (simple and recommended)
 * 2. Model-based with XML attributes (for complex scenarios)
 */

const CybersourceApi = require('../CybersourceApi');
const Models = require('../model');

// Example 1: Direct normalRequest approach (RECOMMENDED)
// eslint-disable-next-line no-unused-vars
async function directApproachExample() {
  console.log('📝 Example 1: Direct normalRequest approach');
  console.log('This is the simplest and most reliable method.\n');

  const api = new CybersourceApi(
    'your-password',
    'your-merchant-id',
    'development',
    'en',
    '1.151',
    'USD'
  );

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
    console.log('✅ Success:', result);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Example 2: Model-based approach with working XML attributes
// eslint-disable-next-line no-unused-vars
async function modelBasedApproachExample() {
  console.log('📦 Example 2: Model-based approach with XML attributes');
  console.log('Use this when you need structured model validation.\n');

  const api = new CybersourceApi(
    'your-password',
    'your-merchant-id',
    'development',
    'en',
    '1.151',
    'USD'
  );

  const models = new Models();

  // Create model instances
  const billTo = new models.BillTo(
    'John', // firstName
    'Doe', // lastName
    '123 Main St', // street1
    'San Francisco', // city
    'CA', // state
    '94105', // postalCode
    'US', // country
    'john.doe@example.com', // email
    '4155551234', // phoneNumber
    '192.168.1.1', // ipAddress
    'customer123' // customerID
  );

  const purchaseTotals = new models.PurchaseTotals('USD', '100.00');

  const card = new models.Card(
    '4111111111111111', // accountNumber
    '12', // expirationMonth
    '2025', // expirationYear
    '123' // cvNumber
  );

  const authRequest = new models.AuthorizationRequest(
    'REF-' + Date.now(), // merchantReferenceCode
    billTo,
    card,
    purchaseTotals
  );

  // Get request with XML attributes (this generates working XML)
  const request = authRequest.getJSONWithAttributes('your-merchant-id');

  try {
    const result = await api.normalRequest(request);
    console.log('✅ Success:', result);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Example 3: Using models for data validation and structure
function modelValidationExample() {
  console.log('🔍 Example 3: Using models for data validation');
  console.log('Models provide structure and can be extended with validation.\n');

  const models = new Models();

  // Create and validate card
  const card = new models.Card('4111111111111111', '12', '2025', '123');

  // You can add validation logic
  if (card.accountNumber.length !== 16) {
    console.log('❌ Invalid card number length');
    return;
  }

  if (parseInt(card.expirationYear) < new Date().getFullYear()) {
    console.log('❌ Card expired');
    return;
  }

  console.log('✅ Card validation passed');

  // Show both JSON formats
  console.log('\nDirect format (for normalRequest):');
  console.log(JSON.stringify(card.getJSON(), null, 2));

  console.log('\nWith XML attributes (for model requests):');
  console.log(JSON.stringify(card.getJSONWithAttributes(), null, 2));
}

// Example 4: P12 Certificate Authentication
// eslint-disable-next-line no-unused-vars
async function p12AuthenticationExample() {
  console.log('🔐 Example 4: P12 Certificate Authentication');
  console.log('Using P12 certificates instead of password authentication.\n');

  // Mock Meteor settings for P12 certificates
  global.Meteor = {
    settings: {
      dev: {
        // or 'prod' for production
        cybersourceCert: {
          privateKeyPath: '/path/to/private-key.pem',
          publicCertPath: '/path/to/public-cert.pem',
          passphrase: 'your-certificate-passphrase', // optional
        },
      },
    },
  };

  const api = new CybersourceApi(
    '', // Empty password when using P12
    'your-merchant-id',
    'development',
    'en',
    '1.151',
    'USD'
  );

  const request = {
    merchantID: 'your-merchant-id',
    merchantReferenceCode: 'P12-REF-' + Date.now(),
    billTo: {
      firstName: 'Jane',
      lastName: 'Smith',
      street1: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90210',
      country: 'US',
      email: 'jane.smith@example.com',
      ipAddress: '192.168.1.2',
    },
    purchaseTotals: {
      currency: 'USD',
      grandTotalAmount: '50.00',
    },
    card: {
      accountNumber: '4111111111111111',
      expirationMonth: '06',
      expirationYear: '2026',
      cvNumber: '456',
    },
    ccAuthService: { run: true },
  };

  try {
    const result = await api.normalRequest(request);
    console.log('✅ P12 Authentication Success:', result);
  } catch (error) {
    console.error('❌ P12 Authentication Error:', error.message);
  }
}

// Show all examples
console.log('🚀 CyberSource SOAP SDK - Model Usage Examples\n');
console.log('Choose your approach based on your needs:\n');

modelValidationExample();
console.log('\n' + '='.repeat(60) + '\n');

console.log('For actual API calls, uncomment the examples below:');
console.log('// await directApproachExample();');
console.log('// await modelBasedApproachExample();');
console.log('// await p12AuthenticationExample();');

console.log('\n💡 Recommendation: Use the direct approach for simplicity');
console.log('   Use models when you need validation or complex structure handling');

console.log('\n📚 The model-based approach now generates the correct XML:');
console.log('   <data:ccAuthService run="true"></data:ccAuthService>');
console.log('   instead of the problematic <ns1:run>true</ns1:run>');
