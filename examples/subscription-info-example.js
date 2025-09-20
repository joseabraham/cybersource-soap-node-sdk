#!/usr/bin/env node

/* eslint-disable no-console */

/**
 * Subscription Info Example
 *
 * This example demonstrates how to retrieve subscription information
 * using the SubscriptionInfoRequest model.
 */

const CyberSourceApi = require('../CybersourceApi');

async function subscriptionInfoExample() {
  console.log('🔍 CyberSource Subscription Info Example\n');

  try {
    // Initialize the API (using certificate authentication)
    const api = new CyberSourceApi(
      '', // Empty password when using certificates
      'tc_pa_016025997', // Your merchant ID
      'development',
      'en',
      '1.151',
      'USD',
      {
        // Use your certificate configuration here
        privateKeyPemBase64: 'your-private-key-base64',
        publicCertPemBase64: 'your-public-cert-base64',
        passphrase: 'test123',
      }
    );

    // Example 1: Get subscription info by subscription ID
    console.log('📋 Example 1: Get Subscription Information\n');

    const subscriptionID = 'SUB-123456789'; // Replace with actual subscription ID
    const subscriptionInfoRequest = new api.Models.SubscriptionInfoRequest(subscriptionID);

    console.log('Request details:');
    console.log('  Subscription ID:', subscriptionID);
    console.log('  Currency:', subscriptionInfoRequest.currency);
    console.log('  Request JSON:', JSON.stringify(subscriptionInfoRequest.getJSON(), null, 2));

    try {
      const result = await api.getSubscriptionInfo(subscriptionInfoRequest);
      console.log('\n✅ Success!');
      console.log('Response:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.log('\n❌ Error:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
    }

    // Example 2: Using different currency
    console.log('\n📋 Example 2: Get Subscription Info with EUR Currency\n');

    const subscriptionInfoRequestEUR = new api.Models.SubscriptionInfoRequest(
      'SUB-987654321',
      'EUR'
    );

    console.log('Request details:');
    console.log('  Subscription ID: SUB-987654321');
    console.log('  Currency:', subscriptionInfoRequestEUR.currency);

    try {
      const resultEUR = await api.getSubscriptionInfo(subscriptionInfoRequestEUR);
      console.log('\n✅ Success!');
      console.log('Response:', JSON.stringify(resultEUR, null, 2));
    } catch (error) {
      console.log('\n❌ Error:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
    }
  } catch (error) {
    console.log('❌ Setup error:', error.message);
  }
}

// Run the example
if (require.main === module) {
  subscriptionInfoExample();
}

module.exports = { subscriptionInfoExample };
