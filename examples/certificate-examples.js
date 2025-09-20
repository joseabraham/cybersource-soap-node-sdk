#!/usr/bin/env node

/* eslint-disable no-console */

/**
 * CyberSource Certificate Examples
 *
 * This file demonstrates how to use different certificate authentication methods
 * with the CyberSource SOAP SDK.
 */

const CyberSourceApi = require('../CybersourceApi');
const fs = require('fs');

// Example configuration
const config = {
  merchantID: 'your-merchant-id',
  environment: 'development', // or 'production'
  language: 'en',
  version: '1.151',
  currency: 'USD',
};

async function exampleUsernamePassword() {
  console.log('🔐 Example: Username/Password Authentication\n');

  try {
    const api = new CyberSourceApi(
      'your-password',
      config.merchantID,
      config.environment,
      config.language,
      config.version,
      config.currency
    );

    // Test transaction
    const billTo = new api.Models.BillTo(
      'John',
      'Doe',
      '123 Main St',
      'City',
      'CA',
      '12345',
      'US',
      'john@example.com'
    );
    const card = new api.Models.Card('4111111111111111', '12', '2025', '123', '001');
    const authRequest = new api.Models.AuthorizationRequest('TEST-001', billTo, card);

    const result = await api.authorizeCharge(authRequest, 10.0);
    console.log('✅ Success:', result.message);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function exampleP12FilePath() {
  console.log('🔐 Example: P12 File Path Authentication\n');

  try {
    const api = new CyberSourceApi(
      '', // Empty password when using certificates
      config.merchantID,
      config.environment,
      config.language,
      config.version,
      config.currency,
      {
        p12Path: '/path/to/your/certificate.p12',
        p12Passphrase: 'your-p12-passphrase',
      }
    );

    // Test transaction
    const billTo = new api.Models.BillTo(
      'John',
      'Doe',
      '123 Main St',
      'City',
      'CA',
      '12345',
      'US',
      'john@example.com'
    );
    const card = new api.Models.Card('4111111111111111', '12', '2025', '123', '001');
    const authRequest = new api.Models.AuthorizationRequest('TEST-002', billTo, card);

    const result = await api.authorizeCharge(authRequest, 10.0);
    console.log('✅ Success:', result.message);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function exampleP12Base64() {
  console.log('🔐 Example: P12 Base64 Encoded Authentication\n');

  try {
    // Read P12 file and convert to base64
    const p12Buffer = fs.readFileSync('/path/to/your/certificate.p12');
    const p12Base64 = p12Buffer.toString('base64');

    const api = new CyberSourceApi(
      '', // Empty password when using certificates
      config.merchantID,
      config.environment,
      config.language,
      config.version,
      config.currency,
      {
        p12Base64,
        p12Passphrase: 'your-p12-passphrase',
      }
    );

    // Test transaction
    const billTo = new api.Models.BillTo(
      'John',
      'Doe',
      '123 Main St',
      'City',
      'CA',
      '12345',
      'US',
      'john@example.com'
    );
    const card = new api.Models.Card('4111111111111111', '12', '2025', '123', '001');
    const authRequest = new api.Models.AuthorizationRequest('TEST-003', billTo, card);

    const result = await api.authorizeCharge(authRequest, 10.0);
    console.log('✅ Success:', result.message);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function examplePEMFilePath() {
  console.log('🔐 Example: PEM File Path Authentication\n');

  try {
    const api = new CyberSourceApi(
      '', // Empty password when using certificates
      config.merchantID,
      config.environment,
      config.language,
      config.version,
      config.currency,
      {
        privateKeyPath: '/path/to/private-key.pem',
        publicCertPath: '/path/to/certificate.pem',
        passphrase: 'optional-passphrase', // Only if private key is encrypted
      }
    );

    // Test transaction
    const billTo = new api.Models.BillTo(
      'John',
      'Doe',
      '123 Main St',
      'City',
      'CA',
      '12345',
      'US',
      'john@example.com'
    );
    const card = new api.Models.Card('4111111111111111', '12', '2025', '123', '001');
    const authRequest = new api.Models.AuthorizationRequest('TEST-004', billTo, card);

    const result = await api.authorizeCharge(authRequest, 10.0);
    console.log('✅ Success:', result.message);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function examplePEMBase64() {
  console.log('🔐 Example: PEM Base64 Encoded Authentication\n');

  try {
    // Read PEM files and convert to base64
    const privateKey = fs.readFileSync('/path/to/private-key.pem').toString('base64');
    const publicCert = fs.readFileSync('/path/to/certificate.pem').toString('base64');

    const api = new CyberSourceApi(
      '', // Empty password when using certificates
      config.merchantID,
      config.environment,
      config.language,
      config.version,
      config.currency,
      {
        privateKeyPemBase64: privateKey,
        publicCertPemBase64: publicCert,
        passphrase: 'optional-passphrase', // Only if private key is encrypted
      }
    );

    // Test transaction
    const billTo = new api.Models.BillTo(
      'John',
      'Doe',
      '123 Main St',
      'City',
      'CA',
      '12345',
      'US',
      'john@example.com'
    );
    const card = new api.Models.Card('4111111111111111', '12', '2025', '123', '001');
    const authRequest = new api.Models.AuthorizationRequest('TEST-005', billTo, card);

    const result = await api.authorizeCharge(authRequest, 10.0);
    console.log('✅ Success:', result.message);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function exampleEnvironmentVariables() {
  console.log('🔐 Example: Environment Variables Authentication\n');

  try {
    // Set environment variables before running:
    // export DEV_CYBERSOURCE_P12_PATH="/path/to/certificate.p12"
    // export DEV_CYBERSOURCE_P12_PASSPHRASE="your-passphrase"
    // OR
    // export DEV_CYBERSOURCE_PRIVATE_KEY_PATH="/path/to/private-key.pem"
    // export DEV_CYBERSOURCE_PUBLIC_CERT_PATH="/path/to/certificate.pem"
    // export DEV_CYBERSOURCE_CERT_PASSPHRASE="optional-passphrase"

    const api = new CyberSourceApi(
      '', // Empty password when using certificates
      config.merchantID,
      config.environment,
      config.language,
      config.version,
      config.currency
      // No certOptions - will use environment variables
    );

    // Test transaction
    const billTo = new api.Models.BillTo(
      'John',
      'Doe',
      '123 Main St',
      'City',
      'CA',
      '12345',
      'US',
      'john@example.com'
    );
    const card = new api.Models.Card('4111111111111111', '12', '2025', '123', '001');
    const authRequest = new api.Models.AuthorizationRequest('TEST-006', billTo, card);

    const result = await api.authorizeCharge(authRequest, 10.0);
    console.log('✅ Success:', result.message);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Run examples
async function runExamples() {
  console.log('🚀 CyberSource Certificate Examples\n');
  console.log('Note: Update the configuration and file paths before running these examples.\n');

  await exampleUsernamePassword();
  console.log('\n' + '='.repeat(50) + '\n');

  await exampleP12FilePath();
  console.log('\n' + '='.repeat(50) + '\n');

  await exampleP12Base64();
  console.log('\n' + '='.repeat(50) + '\n');

  await examplePEMFilePath();
  console.log('\n' + '='.repeat(50) + '\n');

  await examplePEMBase64();
  console.log('\n' + '='.repeat(50) + '\n');

  await exampleEnvironmentVariables();
}

// Run if called directly
if (require.main === module) {
  runExamples().catch(console.error);
}

module.exports = {
  exampleUsernamePassword,
  exampleP12FilePath,
  exampleP12Base64,
  examplePEMFilePath,
  examplePEMBase64,
  exampleEnvironmentVariables,
};
