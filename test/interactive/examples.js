#!/usr/bin/env node

const CybersourceApi = require('../../CybersourceApi');

console.log('🎯 CyberSource SOAP SDK - Usage Examples\n');

// Example 1: Basic Authorization and Capture
async function exampleAuthorizationAndCapture() {
  console.log('📝 Example 1: Authorization and Capture Flow\n');

  // Initialize the API (replace with your credentials)
  const api = new CybersourceApi(
    'your-password',
    'your-merchant-id',
    'development', // or 'production'
    'en',
    '1.151',
    'USD'
  );

  try {
    // Create billing information
    const billTo = new api.Models.BillTo(
      'John', // firstName
      'Doe', // lastName
      '123 Main St', // street1
      'Anytown', // city
      'CA', // state
      '12345', // postalCode
      'US', // country
      'john@example.com' // email
    );

    // Create card information
    const card = new api.Models.Card(
      '4111111111111111', // accountNumber
      '12', // expirationMonth
      '2025', // expirationYear
      '123' // cvNumber
    );

    // Create authorization request
    const authRequest = new api.Models.AuthorizationRequest(
      'ORDER-' + Date.now(), // merchantReferenceCode
      billTo,
      card
    );

    console.log('⏳ Sending authorization request...');

    // Authorize the charge
    const authResult = await api.authorizeCharge(authRequest, 100.0);

    console.log('✅ Authorization successful!');
    console.log(`Authorization ID: ${authResult.authorization}`);
    console.log(`Message: ${authResult.message}\n`);

    // Now capture the authorized amount
    const captureRequest = new api.Models.CaptureRequest(
      'ORDER-' + Date.now(),
      authResult.authorization
    );

    console.log('⏳ Sending capture request...');

    const captureResult = await api.captureCharge(captureRequest, 100.0);

    console.log('✅ Capture successful!');
    console.log(`Message: ${captureResult.message}\n`);
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Code:', error.code);
  }
}

// Example 2: Direct Charge (Auth + Capture in one step)
async function exampleDirectCharge() {
  console.log('📝 Example 2: Direct Charge (Auth + Capture)\n');

  const api = new CybersourceApi(
    'your-password',
    'your-merchant-id',
    'development',
    'en',
    '1.151',
    'USD'
  );

  try {
    const billTo = new api.Models.BillTo(
      'Jane',
      'Smith',
      '456 Oak Ave',
      'Another City',
      'NY',
      '54321',
      'US',
      'jane@example.com'
    );

    const card = new api.Models.Card(
      '5555555555554444', // Mastercard test number
      '01',
      '2026',
      '456'
    );

    const chargeRequest = new api.Models.ChargeRequest('CHARGE-' + Date.now(), billTo, card);

    console.log('⏳ Sending charge request...');

    const result = await api.chargeCard(chargeRequest, 50.0);

    console.log('✅ Charge successful!');
    console.log(`Message: ${result.message}\n`);
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Code:', error.code);
  }
}

// Example 3: Subscription (Tokenization)
async function exampleSubscription() {
  console.log('📝 Example 3: Subscription/Tokenization Flow\n');

  const api = new CybersourceApi(
    'your-password',
    'your-merchant-id',
    'development',
    'en',
    '1.151',
    'USD'
  );

  try {
    const billTo = new api.Models.BillTo(
      'Bob',
      'Johnson',
      '789 Pine St',
      'Some City',
      'TX',
      '67890',
      'US',
      'bob@example.com'
    );

    const card = new api.Models.Card('4111111111111111', '03', '2027', '789');

    // Create subscription to tokenize the card
    const subscriptionRequest = new api.Models.SubscriptionRequest(
      'SUB-' + Date.now(),
      billTo,
      card,
      15.0, // amount
      3, // numberOfPayments
      '20251030', // startDate (YYYYMMDD) - October 30, 2025
      '001', // cardType (Visa)
      false, // automaticRenew
      'monthly' // frequency
    );

    console.log('⏳ Creating subscription token...');

    const subscriptionResult = await api.subscribeCard(subscriptionRequest);

    console.log('✅ Subscription created!');
    console.log(`Token: ${subscriptionResult.token}`);
    console.log(`Message: ${subscriptionResult.message}\n`);

    // Now charge using the token
    const chargeSubRequest = new api.Models.ChargeSubscriptionRequest(
      'TOKEN-CHARGE-' + Date.now(),
      subscriptionResult.token
    );

    console.log('⏳ Charging using token...');

    const chargeResult = await api.chargeSubscribedCard(chargeSubRequest, 25.0);

    console.log('✅ Token charge successful!');
    console.log(`Message: ${chargeResult.message}\n`);
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Code:', error.code);
  }
}

// Example 4: P12 Certificate Authentication
function exampleP12Setup() {
  console.log('📝 Example 4: P12 Certificate Setup\n');

  console.log('For P12 certificate authentication, you need to:');
  console.log('1. Convert your .p12 file to separate .pem files:');
  console.log('   openssl pkcs12 -in cert.p12 -out private-key.pem -nocerts -nodes');
  console.log('   openssl pkcs12 -in cert.p12 -out certificate.pem -nokeys -clcerts\n');

  console.log('2. Set up Meteor settings (if using Meteor) or environment variables:');
  console.log(`
// For Meteor settings.json
{
  "dev": {
    "cybersourceCert": {
      "privateKeyPath": "/path/to/private-key.pem",
      "publicCertPath": "/path/to/certificate.pem",
      "passphrase": "your-cert-passphrase" // optional
    }
  }
}
`);

  console.log('3. Initialize API normally (password can be empty):');
  console.log(`
const api = new CybersourceApi(
  '', // password not needed for P12
  'your-merchant-id',
  'development',
  'en',
  '1.151',
  'USD'
);
`);
}

// Error codes reference
function showErrorCodes() {
  console.log('📝 Common CyberSource Error Codes:\n');

  const errorCodes = {
    100: 'Success - Transaction was successful',
    101: 'Request is missing one or more required fields',
    102: 'One or more fields contains invalid data',
    104: 'Merchant ID not found',
    110: 'Partial amount was approved',
    150: 'General system failure',
    151: 'System timeout',
    152: 'Service temporarily unavailable',
    200: 'Soft decline - try again',
    201: 'Issuer declined the transaction',
    202: 'Expired card',
    203: 'General decline by issuer',
    204: 'Insufficient funds',
    205: 'Stolen or lost card',
    207: 'Issuer unavailable',
    208: 'Inactive card',
    210: 'Credit limit exceeded',
    211: 'Invalid CVN',
    221: 'Customer matched on processor\'s negative file',
    230: 'Cardholder not enrolled in service',
    231: 'Account takeover protection triggered',
    232: 'Processor failure',
    233: 'General decline',
    234: 'Fraud prevention triggered',
    236: 'Processor declined',
    240: 'Invalid card type',
    475: 'Customer failed authentication',
  };

  Object.entries(errorCodes).forEach(([code, message]) => {
    console.log(`${code}: ${message}`);
  });
}

// Main menu
function showExamples() {
  console.log('Choose an example to run:\n');
  console.log('1. Authorization and Capture Flow');
  console.log('2. Direct Charge');
  console.log('3. Subscription/Tokenization');
  console.log('4. P12 Certificate Setup Guide');
  console.log('5. Error Codes Reference');
  console.log('\nNote: Make sure to update the credentials in each example before running!\n');
}

if (require.main === module) {
  const arg = process.argv[2];

  switch (arg) {
  case '1':
  case 'auth':
    exampleAuthorizationAndCapture();
    break;
  case '2':
  case 'charge':
    exampleDirectCharge();
    break;
  case '3':
  case 'subscription':
    exampleSubscription();
    break;
  case '4':
  case 'p12':
    exampleP12Setup();
    break;
  case '5':
  case 'errors':
    showErrorCodes();
    break;
  default:
    showExamples();
  }
}
