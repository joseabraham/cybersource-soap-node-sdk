#!/usr/bin/env node

const inquirer = require('inquirer');
const CybersourceApi = require('../../CybersourceApi');
const fs = require('fs');

console.log('🔒 CyberSource SOAP SDK - Credential Test Tool\n');
console.log('This tool helps you test your CyberSource credentials quickly.');
console.log('Your credentials will NOT be saved anywhere.\n');

async function promptCredentials() {
  const questions = [
    {
      type: 'input',
      name: 'merchantID',
      message: 'Enter your CyberSource Merchant ID:',
      validate: input => input.length > 0 || 'Merchant ID is required',
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter your CyberSource Password (or leave empty if using P12 cert):',
      mask: '*',
    },
    {
      type: 'list',
      name: 'environment',
      message: 'Select environment:',
      choices: ['development', 'production'],
      default: 'development',
    },
    {
      type: 'list',
      name: 'authMethod',
      message: 'Select authentication method:',
      choices: [
        { name: 'Username/Password', value: 'password' },
        { name: 'P12 Certificate', value: 'p12' },
      ],
    },
  ];

  const answers = await inquirer.prompt(questions);

  if (answers.authMethod === 'p12') {
    const certMethodQuestions = [
      {
        type: 'list',
        name: 'certMethod',
        message: 'Select certificate method:',
        choices: [
          { name: 'PEM File Paths', value: 'pem_path' },
          { name: 'PEM Base64 Encoded', value: 'pem_base64' },
          { name: 'Environment Variables', value: 'env_vars' },
        ],
      },
    ];

    const certMethodAnswers = await inquirer.prompt(certMethodQuestions);
    Object.assign(answers, certMethodAnswers);

    if (answers.certMethod === 'p12_path') {
      const p12Questions = [
        {
          type: 'input',
          name: 'p12Path',
          message: 'Path to your P12 certificate file:',
          validate: input => {
            if (!input) return 'P12 certificate path is required';
            if (!fs.existsSync(input)) return 'File does not exist';
            return true;
          },
        },
        {
          type: 'password',
          name: 'p12Passphrase',
          message: 'P12 certificate passphrase:',
          mask: '*',
        },
      ];
      const p12Answers = await inquirer.prompt(p12Questions);
      Object.assign(answers, p12Answers);
    } else if (answers.certMethod === 'p12_base64') {
      const p12Base64Questions = [
        {
          type: 'input',
          name: 'p12Base64',
          message: 'P12 certificate as base64 string:',
          validate: input => input.length > 0 || 'Base64 string is required',
        },
        {
          type: 'password',
          name: 'p12Passphrase',
          message: 'P12 certificate passphrase:',
          mask: '*',
        },
      ];
      const p12Base64Answers = await inquirer.prompt(p12Base64Questions);
      Object.assign(answers, p12Base64Answers);
    } else if (answers.certMethod === 'pem_path') {
      const pemQuestions = [
        {
          type: 'input',
          name: 'privateKeyPath',
          message: 'Path to your private key file (.pem):',
          validate: input => {
            if (!input) return 'Private key path is required';
            if (!fs.existsSync(input)) return 'File does not exist';
            return true;
          },
        },
        {
          type: 'input',
          name: 'publicCertPath',
          message: 'Path to your public certificate file (.pem):',
          validate: input => {
            if (!input) return 'Public certificate path is required';
            if (!fs.existsSync(input)) return 'File does not exist';
            return true;
          },
        },
        {
          type: 'password',
          name: 'passphrase',
          message: 'Certificate passphrase (leave empty if none):',
          mask: '*',
        },
      ];
      const pemAnswers = await inquirer.prompt(pemQuestions);
      Object.assign(answers, pemAnswers);
    } else if (answers.certMethod === 'pem_base64') {
      const pemBase64Questions = [
        {
          type: 'input',
          name: 'privateKeyPemBase64',
          message: 'Private key as base64 string:',
          validate: input => input.length > 0 || 'Base64 string is required',
        },
        {
          type: 'input',
          name: 'publicCertPemBase64',
          message: 'Public certificate as base64 string:',
          validate: input => input.length > 0 || 'Base64 string is required',
        },
        {
          type: 'password',
          name: 'passphrase',
          message: 'Certificate passphrase (leave empty if none):',
          mask: '*',
        },
      ];
      const pemBase64Answers = await inquirer.prompt(pemBase64Questions);
      Object.assign(answers, pemBase64Answers);
    } else if (answers.certMethod === 'env_vars') {
      console.log('\n📝 Environment Variables Setup:');
      console.log('Set the following environment variables:');
      console.log(`\nFor ${answers.environment === 'production' ? 'PROD' : 'DEV'} environment:`);
      console.log(
        `${answers.environment === 'production' ? 'PROD' : 'DEV'}_CYBERSOURCE_P12_PATH="/path/to/certificate.p12"`
      );
      console.log(
        `${answers.environment === 'production' ? 'PROD' : 'DEV'}_CYBERSOURCE_P12_PASSPHRASE="your-passphrase"`
      );
      console.log('\nOr for PEM certificates:');
      console.log(
        `${answers.environment === 'production' ? 'PROD' : 'DEV'}_CYBERSOURCE_PRIVATE_KEY_PATH="/path/to/private-key.pem"`
      );
      console.log(
        `${answers.environment === 'production' ? 'PROD' : 'DEV'}_CYBERSOURCE_PUBLIC_CERT_PATH="/path/to/certificate.pem"`
      );
      console.log(
        `${answers.environment === 'production' ? 'PROD' : 'DEV'}_CYBERSOURCE_CERT_PASSPHRASE="optional-passphrase"`
      );
      console.log('\nPress Enter to continue...');
      await inquirer.prompt([{ type: 'input', name: 'continue', message: '' }]);
    }
  }

  const additionalQuestions = [
    {
      type: 'list',
      name: 'version',
      message: 'CyberSource API Version:',
      choices: ['1.151', '1.155', '1.160'],
      default: '1.151',
    },
    {
      type: 'list',
      name: 'currency',
      message: 'Default currency:',
      choices: ['USD', 'EUR', 'GBP', 'CAD', 'JPY'],
      default: 'USD',
    },
    {
      type: 'list',
      name: 'language',
      message: 'Response language:',
      choices: ['en', 'es'],
      default: 'en',
    },
  ];

  const additionalAnswers = await inquirer.prompt(additionalQuestions);
  return { ...answers, ...additionalAnswers };
}

async function testCredentials(config) {
  console.log('\n🧪 Testing credentials...\n');

  try {
    // Prepare certificate options based on the selected method
    let certOptions = null;

    if (config.authMethod === 'p12') {
      if (config.certMethod === 'p12_path') {
        certOptions = {
          p12Path: config.p12Path,
          p12Passphrase: config.p12Passphrase,
        };
        console.log('🔐 Using P12 certificate from file path');
      } else if (config.certMethod === 'p12_base64') {
        certOptions = {
          p12Base64: config.p12Base64,
          p12Passphrase: config.p12Passphrase,
        };
        console.log('🔐 Using P12 certificate from base64 string');
      } else if (config.certMethod === 'pem_path') {
        certOptions = {
          privateKeyPath: config.privateKeyPath,
          publicCertPath: config.publicCertPath,
          passphrase: config.passphrase || undefined,
        };
        console.log('🔐 Using PEM certificates from file paths');
      } else if (config.certMethod === 'pem_base64') {
        certOptions = {
          privateKeyPemBase64: config.privateKeyPemBase64,
          publicCertPemBase64: config.publicCertPemBase64,
          passphrase: config.passphrase || undefined,
        };
        console.log('🔐 Using PEM certificates from base64 strings');
      } else if (config.certMethod === 'env_vars') {
        console.log('🔐 Using certificates from environment variables');
        // certOptions will be null, so it will use environment variables
      }
    }

    // Initialize API
    const api = new CybersourceApi(
      config.password || '', // Empty if using certificates
      config.merchantID,
      config.environment,
      config.language,
      config.version,
      config.currency,
      certOptions
    );

    // Test with a simple authorization request using the working structure
    const billTo = {
      firstName: 'Test',
      lastName: 'User',
      street1: '123 Test Street',
      city: 'Test City',
      state: 'CA',
      postalCode: '12345',
      country: 'US',
      phoneNumber: '123456789',
      email: 'test@example.com',
      ipAddress: '10.11.14.40',
      customerID: '',
    };

    const purchaseTotals = {
      currency: config.currency,
      grandTotalAmount: '1.00',
      attributes: {
        xmlns: 'urn:schemas-cybersource-com:transaction-data-1.151',
      },
    };

    const card = {
      accountNumber: '4111111111111111',
      expirationMonth: '12',
      expirationYear: '2025',
      cvNumber: '123',
      attributes: {
        xmlns: 'urn:schemas-cybersource-com:transaction-data-1.151',
      },
    };

    const request_object = {
      merchantID: config.merchantID,
      merchantReferenceCode: 'TEST-REF-' + Date.now(),
      billTo,
      purchaseTotals,
      card,
      ccAuthService: { attributes: { run: true } },
    };

    console.log('⏳ Sending test authorization request...');

    const result = await api.normalRequest(request_object);

    console.log('✅ SUCCESS! Your credentials are working correctly.');
    console.log(`Authorization code: ${result.authorization}`);
    console.log(`Response: ${result.message}`);
  } catch (error) {
    console.log('❌ FAILED! There was an issue with your credentials or configuration.');

    if (error.code) {
      switch (error.code) {
      case 102:
        console.log('🔑 Error: Invalid merchant ID or password');
        break;
      case 104:
        console.log('🔑 Error: Merchant account not found');
        break;
      case 150:
        console.log('⚠️  Error: General system failure');
        break;
      case 151:
        console.log('⚠️  Error: System timeout');
        break;
      case 152:
        console.log('⚠️  Error: Service temporarily unavailable');
        break;
      default:
        console.log(`⚠️  Error Code: ${error.code}`);
        console.log(`Message: ${error.message}`);
      }
    } else {
      console.log('Network or configuration error:');
      console.log(error.message || error);
    }

    if (config.environment === 'development') {
      console.log('\n💡 Tips for sandbox/development environment:');
      console.log('- Make sure you have a CyberSource test account');
      console.log('- Verify your test credentials are correct');
      console.log('- Check that your IP is whitelisted (if applicable)');
    } else {
      console.log('\n💡 Tips for production environment:');
      console.log('- Verify your production credentials');
      console.log('- Ensure your account is active and properly configured');
      console.log('- Check with CyberSource support if issues persist');
    }
  }
}

async function runTests() {
  try {
    const config = await promptCredentials();
    await testCredentials(config);
  } catch (error) {
    console.log('\n❌ An error occurred:');
    console.log(error.message);
  }

  console.log('\n🏁 Test completed!');
  process.exit(0);
}

// Helper function to prepare certificate options
function prepareCertOptions(config) {
  let certOptions = null;

  if (config.authMethod === 'p12') {
    if (config.certMethod === 'p12_path') {
      certOptions = { p12Path: config.p12Path, p12Passphrase: config.p12Passphrase };
    } else if (config.certMethod === 'p12_base64') {
      certOptions = { p12Base64: config.p12Base64, p12Passphrase: config.p12Passphrase };
    } else if (config.certMethod === 'pem_path') {
      certOptions = {
        privateKeyPath: config.privateKeyPath,
        publicCertPath: config.publicCertPath,
        passphrase: config.passphrase,
      };
    } else if (config.certMethod === 'pem_base64') {
      certOptions = {
        privateKeyPemBase64: config.privateKeyPemBase64,
        publicCertPemBase64: config.publicCertPemBase64,
        passphrase: config.passphrase,
      };
    }
  }

  return certOptions;
}

// Test different card numbers and scenarios
async function testCardScenarios(config) {
  console.log('\n🃏 Testing Different Card Numbers and Scenarios\n');

  const testCards = [
    {
      name: 'Visa Success',
      card: {
        accountNumber: '4111111111111111',
        expirationMonth: '12',
        expirationYear: '2025',
        cvNumber: '123',
      },
      expected: 'success',
    },
    {
      name: 'Mastercard Success',
      card: {
        accountNumber: '5555555555554444',
        expirationMonth: '12',
        expirationYear: '2025',
        cvNumber: '123',
      },
      expected: 'success',
    },
    {
      name: 'American Express Success',
      card: {
        accountNumber: '378282246310005',
        expirationMonth: '12',
        expirationYear: '2025',
        cvNumber: '1234',
      },
      expected: 'success',
    },
    {
      name: 'Declined Card',
      card: {
        accountNumber: '4000000000000002',
        expirationMonth: '12',
        expirationYear: '2025',
        cvNumber: '123',
      },
      expected: 'declined',
    },
    {
      name: 'Invalid Card Number',
      card: {
        accountNumber: '1234567890123456',
        expirationMonth: '12',
        expirationYear: '2025',
        cvNumber: '123',
      },
      expected: 'error',
    },
    {
      name: 'Expired Card',
      card: {
        accountNumber: '4111111111111111',
        expirationMonth: '01',
        expirationYear: '2020',
        cvNumber: '123',
      },
      expected: 'error',
    },
  ];

  for (const testCard of testCards) {
    console.log(`\n🧪 Testing: ${testCard.name}`);
    console.log(
      `Card: ${testCard.card.accountNumber} (${testCard.card.expirationMonth}/${testCard.card.expirationYear})`
    );

    try {
      const certOptions = prepareCertOptions(config);
      const api = new CybersourceApi(
        config.password || '',
        config.merchantID,
        config.environment,
        config.language,
        config.version,
        config.currency,
        certOptions
      );

      const billTo = {
        firstName: 'Test',
        lastName: 'User',
        street1: '123 Test Street',
        city: 'Test City',
        state: 'CA',
        postalCode: '12345',
        country: 'US',
        phoneNumber: '123456789',
        email: 'test@example.com',
        ipAddress: '10.11.14.40',
        customerID: '',
      };

      const purchaseTotals = {
        currency: config.currency,
        grandTotalAmount: '1.00',
        attributes: {
          xmlns: 'urn:schemas-cybersource-com:transaction-data-1.151',
        },
      };

      const card = {
        ...testCard.card,
        attributes: {
          xmlns: 'urn:schemas-cybersource-com:transaction-data-1.151',
        },
      };

      const request_object = {
        merchantID: config.merchantID,
        merchantReferenceCode: `CARD-TEST-${Date.now()}`,
        billTo,
        purchaseTotals,
        card,
        ccAuthService: { attributes: { run: true } },
      };

      const result = await api.normalRequest(request_object);

      if (testCard.expected === 'success') {
        console.log(`✅ ${testCard.name}: SUCCESS - ${result.message}`);
      } else {
        console.log(`⚠️  ${testCard.name}: Unexpected success - ${result.message}`);
      }
    } catch (error) {
      if (testCard.expected === 'declined' || testCard.expected === 'error') {
        console.log(`✅ ${testCard.name}: Expected failure - ${error.message || error.code}`);
      } else {
        console.log(`❌ ${testCard.name}: Unexpected failure - ${error.message || error.code}`);
      }
    }
  }
}

// Test error scenarios
async function testErrorScenarios(config) {
  console.log('\n⚠️  Testing Error Scenarios\n');

  const errorTests = [
    {
      name: 'Invalid Merchant ID',
      test: async () => {
        const invalidApi = new CybersourceApi(
          config.password || '',
          'INVALID_MERCHANT_ID',
          config.environment,
          config.language,
          config.version,
          config.currency
        );
        return await invalidApi.normalRequest({
          merchantID: 'INVALID_MERCHANT_ID',
          merchantReferenceCode: 'ERROR-TEST-1',
          ccAuthService: { attributes: { run: true } },
        });
      },
    },
    {
      name: 'Missing Required Fields',
      test: async () => {
        const api = new CybersourceApi(
          config.password || '',
          config.merchantID,
          config.environment,
          config.language,
          config.version,
          config.currency
        );
        return await api.normalRequest({
          merchantID: config.merchantID,
          merchantReferenceCode: 'ERROR-TEST-2',
          ccAuthService: { attributes: { run: true } },
          // Missing billTo, card, purchaseTotals
        });
      },
    },
    {
      name: 'Invalid Amount Format',
      test: async () => {
        const api = new CybersourceApi(
          config.password || '',
          config.merchantID,
          config.environment,
          config.language,
          config.version,
          config.currency
        );
        const billTo = {
          firstName: 'Test',
          lastName: 'User',
          street1: '123 Test St',
          city: 'Test City',
          state: 'CA',
          postalCode: '12345',
          country: 'US',
          email: 'test@example.com',
        };
        const card = {
          accountNumber: '4111111111111111',
          expirationMonth: '12',
          expirationYear: '2025',
          cvNumber: '123',
          attributes: { xmlns: 'urn:schemas-cybersource-com:transaction-data-1.151' },
        };
        const purchaseTotals = {
          currency: config.currency,
          grandTotalAmount: 'INVALID_AMOUNT', // Invalid amount
          attributes: { xmlns: 'urn:schemas-cybersource-com:transaction-data-1.151' },
        };

        return await api.normalRequest({
          merchantID: config.merchantID,
          merchantReferenceCode: 'ERROR-TEST-3',
          billTo,
          card,
          purchaseTotals,
          ccAuthService: { attributes: { run: true } },
        });
      },
    },
  ];

  for (const errorTest of errorTests) {
    console.log(`\n🧪 Testing: ${errorTest.name}`);

    try {
      const certOptions = prepareCertOptions(config);
      const api = new CybersourceApi(
        config.password || '',
        config.merchantID,
        config.environment,
        config.language,
        config.version,
        config.currency,
        certOptions
      );

      await errorTest.test(api);
      console.log(`⚠️  ${errorTest.name}: Expected failure but got success`);
    } catch (error) {
      console.log(`✅ ${errorTest.name}: Expected failure - ${error.message || error.code}`);
    }
  }
}

// Test different transaction types
async function testTransactionTypes(config) {
  console.log('\n💳 Testing Different Transaction Types\n');

  try {
    const certOptions = prepareCertOptions(config);
    const api = new CybersourceApi(
      config.password || '',
      config.merchantID,
      config.environment,
      config.language,
      config.version,
      config.currency,
      certOptions
    );

    // Test 1: Authorization
    console.log('\n🧪 Testing Authorization...');
    const billTo = new api.Models.BillTo(
      'John',
      'Doe',
      '123 St',
      'City',
      'CA',
      '12345',
      'US',
      'john@test.com'
    );
    const card = new api.Models.Card('4111111111111111', '12', '2025', '123');
    const authRequest = new api.Models.AuthorizationRequest(
      'AUTH-TEST-' + Date.now(),
      billTo,
      card
    );

    try {
      const authResult = await api.authorizeCharge(authRequest, 10.0);
      console.log('✅ Authorization: SUCCESS -', authResult.message);

      // Test 2: Charge (Authorization + Capture)
      console.log('\n🧪 Testing Charge (Auth + Capture)...');
      const chargeRequest = new api.Models.ChargeRequest('CHARGE-TEST-' + Date.now(), billTo, card);
      const chargeResult = await api.chargeCard(chargeRequest, 15.0);
      console.log('✅ Charge: SUCCESS -', chargeResult.message);
    } catch (error) {
      console.log('❌ Transaction failed:', error.message || error.code);
    }

    // Test 3: Subscription Creation
    console.log('\n🧪 Testing Subscription Creation...');
    try {
      const subRequest = new api.Models.SubscriptionRequest(
        'SUB-TEST-' + Date.now(),
        billTo,
        card,
        10.0, // amount
        12, // numberOfPayments
        '20251030', // startDate (YYYYMMDD) - October 30, 2025
        '001', // cardType (Visa)
        false, // automaticRenew
        'monthly' // frequency
      );
      const subResult = await api.subscribeCard(subRequest);
      console.log('✅ Subscription: SUCCESS -', subResult.message);
      console.log('   Subscription ID:', subResult.token);

      // Test 4: Get Subscription Info (using a test subscription ID)
      console.log('\n🧪 Testing Get Subscription Info...');
      const subInfoRequest = new api.Models.SubscriptionInfoRequest(subResult.token);
      try {
        const subInfoResult = await api.getSubscriptionInfo(subInfoRequest);
        console.log('✅ Get Subscription Info: SUCCESS -', subInfoResult.message);
        console.log('   Subscription ID:', subResult.token);
      } catch (error) {
        console.log('⚠️  Get Subscription Info: EXPECTED FAILURE -', error.message);
        console.log('   This is expected since the subscription ID does not exist');
      }

      // Test 5: Charge Subscription (if subscription was successful)
      if (subResult.token) {
        console.log('\n🧪 Testing Charge Subscription...');
        const chargeSubRequest = new api.Models.ChargeSubscriptionRequest(
          'CHARGE-SUB-TEST-' + Date.now(),
          subResult.token
        );
        const chargeSubResult = await api.chargeSubscribedCard(chargeSubRequest, 20.0);
        console.log('✅ Charge Subscription: SUCCESS -', chargeSubResult.message);
      }
    } catch (error) {
      console.log('❌ Subscription failed:', error.message || error.code);
    }
  } catch (error) {
    console.log('❌ Transaction type testing failed:', error.message || error.code);
  }
}

// Test input validation and edge cases
async function testValidationAndEdgeCases(config) {
  console.log('\n🔍 Testing Input Validation and Edge Cases\n');

  const validationTests = [
    {
      name: 'Very Long Merchant Reference Code',
      test: () => {
        const longRef = 'A'.repeat(50); // Very long reference
        return { merchantReferenceCode: longRef };
      },
    },
    {
      name: 'Special Characters in Name',
      test: () => {
        return {
          billTo: {
            firstName: 'José María',
            lastName: 'O\'Connor-Smith',
            street1: '123 Main St. #456',
            city: 'San José',
            state: 'CA',
            postalCode: '12345-6789',
            country: 'US',
            email: 'test+tag@example.com',
          },
        };
      },
    },
    {
      name: 'Different Currency Codes',
      test: () => {
        return {
          purchaseTotals: {
            currency: 'EUR',
            grandTotalAmount: '1.00',
            attributes: { xmlns: 'urn:schemas-cybersource-com:transaction-data-1.151' },
          },
        };
      },
    },
    {
      name: 'Minimal Required Data',
      test: () => {
        return {
          billTo: {
            firstName: 'A',
            lastName: 'B',
            street1: '1',
            city: 'C',
            state: 'D',
            postalCode: '12345',
            country: 'US',
            email: 'a@b.com',
          },
        };
      },
    },
  ];

  for (const validationTest of validationTests) {
    console.log(`\n🧪 Testing: ${validationTest.name}`);

    try {
      const certOptions = prepareCertOptions(config);
      const api = new CybersourceApi(
        config.password || '',
        config.merchantID,
        config.environment,
        config.language,
        config.version,
        config.currency,
        certOptions
      );

      const testData = validationTest.test();

      const billTo = testData.billTo || {
        firstName: 'Test',
        lastName: 'User',
        street1: '123 Test Street',
        city: 'Test City',
        state: 'CA',
        postalCode: '12345',
        country: 'US',
        email: 'test@example.com',
      };

      const purchaseTotals = testData.purchaseTotals || {
        currency: config.currency,
        grandTotalAmount: '1.00',
        attributes: { xmlns: 'urn:schemas-cybersource-com:transaction-data-1.151' },
      };

      const card = {
        accountNumber: '4111111111111111',
        expirationMonth: '12',
        expirationYear: '2025',
        cvNumber: '123',
        attributes: { xmlns: 'urn:schemas-cybersource-com:transaction-data-1.151' },
      };

      const request_object = {
        merchantID: config.merchantID,
        merchantReferenceCode: testData.merchantReferenceCode || `VALIDATION-TEST-${Date.now()}`,
        billTo,
        purchaseTotals,
        card,
        ccAuthService: { attributes: { run: true } },
        ...testData,
      };

      const result = await api.normalRequest(request_object);
      console.log(`✅ ${validationTest.name}: SUCCESS - ${result.message}`);
    } catch (error) {
      console.log(`❌ ${validationTest.name}: FAILED - ${error.message || error.code}`);
    }
  }
}

// Test all certificate methods
async function testCertificateMethods(config) {
  console.log('\n🔐 Testing All Certificate Methods\n');

  const certificateMethods = [
    {
      name: 'Username/Password Authentication',
      test: async () => {
        const api = new CybersourceApi(
          config.password || 'test-password',
          config.merchantID,
          config.environment,
          config.language,
          config.version,
          config.currency
        );
        return api;
      },
    },
    {
      name: 'P12 File Path',
      test: async () => {
        if (!config.p12Path) {
          throw new Error('P12 path not provided in config');
        }
        const api = new CybersourceApi(
          '',
          config.merchantID,
          config.environment,
          config.language,
          config.version,
          config.currency,
          {
            p12Path: config.p12Path,
            p12Passphrase: config.p12Passphrase,
          }
        );
        return api;
      },
    },
    {
      name: 'P12 Base64 Encoded',
      test: async () => {
        if (!config.p12Base64) {
          throw new Error('P12 base64 not provided in config');
        }
        const api = new CybersourceApi(
          '',
          config.merchantID,
          config.environment,
          config.language,
          config.version,
          config.currency,
          {
            p12Base64: config.p12Base64,
            p12Passphrase: config.p12Passphrase,
          }
        );
        return api;
      },
    },
    {
      name: 'PEM File Paths',
      test: async () => {
        if (!config.privateKeyPath || !config.publicCertPath) {
          throw new Error('PEM paths not provided in config');
        }
        const api = new CybersourceApi(
          '',
          config.merchantID,
          config.environment,
          config.language,
          config.version,
          config.currency,
          {
            privateKeyPath: config.privateKeyPath,
            publicCertPath: config.publicCertPath,
            passphrase: config.passphrase,
          }
        );
        return api;
      },
    },
    {
      name: 'PEM Base64 Encoded',
      test: async () => {
        if (!config.privateKeyPemBase64 || !config.publicCertPemBase64) {
          throw new Error('PEM base64 not provided in config');
        }
        const api = new CybersourceApi(
          '',
          config.merchantID,
          config.environment,
          config.language,
          config.version,
          config.currency,
          {
            privateKeyPemBase64: config.privateKeyPemBase64,
            publicCertPemBase64: config.publicCertPemBase64,
            passphrase: config.passphrase,
          }
        );
        return api;
      },
    },
    {
      name: 'Environment Variables',
      test: async () => {
        const api = new CybersourceApi(
          '',
          config.merchantID,
          config.environment,
          config.language,
          config.version,
          config.currency
          // No certOptions - will use environment variables
        );
        return api;
      },
    },
  ];

  for (const method of certificateMethods) {
    console.log(`\n🧪 Testing: ${method.name}`);

    try {
      const api = await method.test();

      // Test with a simple authorization request
      const billTo = {
        firstName: 'Test',
        lastName: 'User',
        street1: '123 Test Street',
        city: 'Test City',
        state: 'CA',
        postalCode: '12345',
        country: 'US',
        phoneNumber: '123456789',
        email: 'test@example.com',
        ipAddress: '10.11.14.40',
        customerID: '',
      };

      const purchaseTotals = {
        currency: config.currency,
        grandTotalAmount: '1.00',
        attributes: {
          xmlns: 'urn:schemas-cybersource-com:transaction-data-1.151',
        },
      };

      const card = {
        accountNumber: '4111111111111111',
        expirationMonth: '12',
        expirationYear: '2025',
        cvNumber: '123',
        attributes: {
          xmlns: 'urn:schemas-cybersource-com:transaction-data-1.151',
        },
      };

      const request_object = {
        merchantID: config.merchantID,
        merchantReferenceCode: `CERT-TEST-${Date.now()}`,
        billTo,
        purchaseTotals,
        card,
        ccAuthService: { attributes: { run: true } },
      };

      const result = await api.normalRequest(request_object);
      console.log(`✅ ${method.name}: SUCCESS - ${result.message}`);
    } catch (error) {
      if (error.message.includes('not provided in config')) {
        console.log(`⏭️  ${method.name}: SKIPPED - ${error.message}`);
      } else {
        console.log(`❌ ${method.name}: FAILED - ${error.message || error.code}`);
      }
    }
  }
}

// Additional test options
async function showTestMenu() {
  const { testType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'testType',
      message: 'What would you like to test?',
      choices: [
        { name: 'Test Credentials (Authorization)', value: 'auth' },
        { name: 'Test Different Card Numbers', value: 'cards' },
        { name: 'Test Error Scenarios', value: 'errors' },
        { name: 'Test Transaction Types', value: 'transactions' },
        { name: 'Test Validation & Edge Cases', value: 'validation' },
        { name: 'Test All Certificate Methods', value: 'certificates' },
        { name: 'Run All Tests', value: 'all' },
        { name: 'Exit', value: 'exit' },
      ],
    },
  ]);

  switch (testType) {
  case 'auth':
    await runTests();
    break;
  case 'cards': {
    const cardConfig = await promptCredentials();
    await testCardScenarios(cardConfig);
    break;
  }
  case 'errors': {
    const errorConfig = await promptCredentials();
    await testErrorScenarios(errorConfig);
    break;
  }
  case 'transactions': {
    const transactionConfig = await promptCredentials();
    await testTransactionTypes(transactionConfig);
    break;
  }
  case 'validation': {
    const validationConfig = await promptCredentials();
    await testValidationAndEdgeCases(validationConfig);
    break;
  }
  case 'certificates': {
    const certConfig = await promptCredentials();
    await testCertificateMethods(certConfig);
    break;
  }
  case 'all': {
    const allConfig = await promptCredentials();
    console.log('\n🚀 Running All Tests...\n');
    await testCredentials(allConfig);
    await testCardScenarios(allConfig);
    await testErrorScenarios(allConfig);
    await testTransactionTypes(allConfig);
    await testValidationAndEdgeCases(allConfig);
    await testCertificateMethods(allConfig);
    break;
  }
  case 'exit':
    console.log('👋 Goodbye!');
    process.exit(0);
    break;
  }
}

// Start the interactive test
if (require.main === module) {
  showTestMenu();
}
