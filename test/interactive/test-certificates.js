#!/usr/bin/env node

/**
 * CyberSource Certificate Test Script
 *
 * This script tests all certificate authentication methods using the actual
 * certificate files in the CERTIFICATES/ folder.
 */

const CyberSourceApi = require('./CybersourceApi');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  merchantID: 'tc_pa_016025XXX',
  environment: 'development',
  language: 'en',
  version: '1.151',
  currency: 'USD',
};

// Certificate file paths
const certPaths = {
  keyPem: path.join(__dirname, 'CERTIFICATES', 'key.pem.base64'),
  certPem: path.join(__dirname, 'CERTIFICATES', 'cert.pem.base64'),
  // Add P12 path if you have one
  // p12Path: path.join(__dirname, 'CERTIFICATES', 'certificate.p12')
};

// Helper function to decode base64 file
function decodeBase64File(filePath) {
  try {
    const base64Content = fs.readFileSync(filePath, 'utf8').trim();
    return Buffer.from(base64Content, 'base64');
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

// Helper function to create test transaction
function createTestTransaction(api, testName) {
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
  const authRequest = new api.Models.AuthorizationRequest(
    `TEST-${testName}-${Date.now()}`,
    billTo,
    card
  );
  return authRequest;
}

async function testUsernamePassword() {
  console.log('🔐 Testing: Username/Password Authentication\n');

  try {
    const api = new CyberSourceApi(
      'test-password', // This will fail, but we're testing the method
      config.merchantID,
      config.environment,
      config.language,
      config.version,
      config.currency
    );

    const authRequest = createTestTransaction(api, 'USERNAME');
    const result = await api.authorizeCharge(authRequest, 10.0);
    console.log('✅ Username/Password: SUCCESS -', result.message);
  } catch (error) {
    console.log('❌ Username/Password: FAILED -', error.message);
  }
}

async function testPEMBase64() {
  console.log('\n🔐 Testing: PEM Base64 Encoded Authentication\n');

  try {
    // Read and decode the base64 files
    const privateKeyBuffer = decodeBase64File(certPaths.keyPem);
    const publicCertBuffer = decodeBase64File(certPaths.certPem);

    if (!privateKeyBuffer || !publicCertBuffer) {
      throw new Error('Failed to read certificate files');
    }

    // Convert to base64 strings
    const privateKeyBase64 = privateKeyBuffer.toString('base64');
    const publicCertBase64 = publicCertBuffer.toString('base64');

    const api = new CyberSourceApi(
      '', // Empty password when using certificates
      config.merchantID,
      config.environment,
      config.language,
      config.version,
      config.currency,
      {
        privateKeyPemBase64: privateKeyBase64,
        publicCertPemBase64: publicCertBase64,
        passphrase: 'test123', // Use the passphrase you provided
      }
    );

    const authRequest = createTestTransaction(api, 'PEM-BASE64');
    const result = await api.authorizeCharge(authRequest, 10.0);
    console.log('✅ PEM Base64: SUCCESS -', result.message);
  } catch (error) {
    console.log('❌ PEM Base64: FAILED -', error.message);
    if (error.message.includes('unsupported')) {
      console.log(
        '   This might be due to certificate format issues. Let\'s try PEM file paths instead.'
      );
    }
  }
}

async function testPEMFiles() {
  console.log('\n🔐 Testing: PEM File Path Authentication\n');

  try {
    // First, let's create actual PEM files from the base64 content
    const privateKeyBuffer = decodeBase64File(certPaths.keyPem);
    const publicCertBuffer = decodeBase64File(certPaths.certPem);

    if (!privateKeyBuffer || !publicCertBuffer) {
      throw new Error('Failed to read certificate files');
    }

    // Create temporary PEM files
    const tempKeyPath = path.join(__dirname, 'CERTIFICATES', 'temp_private_key.pem');
    const tempCertPath = path.join(__dirname, 'CERTIFICATES', 'temp_certificate.pem');

    fs.writeFileSync(tempKeyPath, privateKeyBuffer);
    fs.writeFileSync(tempCertPath, publicCertBuffer);

    const api = new CyberSourceApi(
      '', // Empty password when using certificates
      config.merchantID,
      config.environment,
      config.language,
      config.version,
      config.currency,
      {
        privateKeyPath: tempKeyPath,
        publicCertPath: tempCertPath,
        passphrase: 'test123', // Use the passphrase you provided
      }
    );

    const authRequest = createTestTransaction(api, 'PEM-FILES');
    const result = await api.authorizeCharge(authRequest, 10.0);
    console.log('✅ PEM Files: SUCCESS -', result.message);

    // Clean up temporary files
    fs.unlinkSync(tempKeyPath);
    fs.unlinkSync(tempCertPath);
  } catch (error) {
    console.log('❌ PEM Files: FAILED -', error.message);
  }
}

async function testPEMDirect() {
  console.log('\n🔐 Testing: PEM Direct Buffer Authentication\n');

  try {
    // Read and decode the base64 files
    const privateKeyBuffer = decodeBase64File(certPaths.keyPem);
    const publicCertBuffer = decodeBase64File(certPaths.certPem);

    if (!privateKeyBuffer || !publicCertBuffer) {
      throw new Error('Failed to read certificate files');
    }

    const api = new CyberSourceApi(
      '', // Empty password when using certificates
      config.merchantID,
      config.environment,
      config.language,
      config.version,
      config.currency,
      {
        privateKeyPEM: privateKeyBuffer,
        publicCertPEM: publicCertBuffer,
        passphrase: 'test123', // Use the passphrase you provided
      }
    );

    const authRequest = createTestTransaction(api, 'PEM-DIRECT');
    const result = await api.authorizeCharge(authRequest, 10.0);
    console.log('✅ PEM Direct: SUCCESS -', result.message);
  } catch (error) {
    console.log('❌ PEM Direct: FAILED -', error.message);
  }
}

async function testEnvironmentVariables() {
  console.log('\n🔐 Testing: Environment Variables Authentication\n');

  try {
    // Set environment variables for testing
    process.env.DEV_CYBERSOURCE_PRIVATE_KEY_PEM = decodeBase64File(certPaths.keyPem).toString();
    process.env.DEV_CYBERSOURCE_PUBLIC_CERT_PEM = decodeBase64File(certPaths.certPem).toString();
    process.env.DEV_CYBERSOURCE_CERT_PASSPHRASE = 'test123';

    const api = new CyberSourceApi(
      '', // Empty password when using certificates
      config.merchantID,
      config.environment,
      config.language,
      config.version,
      config.currency
      // No certOptions - will use environment variables
    );

    const authRequest = createTestTransaction(api, 'ENV-VARS');
    const result = await api.authorizeCharge(authRequest, 10.0);
    console.log('✅ Environment Variables: SUCCESS -', result.message);
  } catch (error) {
    console.log('❌ Environment Variables: FAILED -', error.message);
  } finally {
    // Clean up environment variables
    delete process.env.DEV_CYBERSOURCE_PRIVATE_KEY_PEM;
    delete process.env.DEV_CYBERSOURCE_PUBLIC_CERT_PEM;
    delete process.env.DEV_CYBERSOURCE_CERT_PASSPHRASE;
  }
}

async function inspectCertificates() {
  console.log('🔍 Inspecting Certificate Files\n');

  try {
    const privateKeyBuffer = decodeBase64File(certPaths.keyPem);
    const publicCertBuffer = decodeBase64File(certPaths.certPem);

    if (privateKeyBuffer && publicCertBuffer) {
      console.log('✅ Private Key Buffer Length:', privateKeyBuffer.length);
      console.log('✅ Public Cert Buffer Length:', publicCertBuffer.length);

      // Check if they look like PEM files
      const privateKeyStr = privateKeyBuffer.toString();
      const publicCertStr = publicCertBuffer.toString();

      console.log('✅ Private Key starts with:', privateKeyStr.substring(0, 50) + '...');
      console.log('✅ Public Cert starts with:', publicCertStr.substring(0, 50) + '...');

      if (
        privateKeyStr.includes('BEGIN PRIVATE KEY') ||
        privateKeyStr.includes('BEGIN RSA PRIVATE KEY')
      ) {
        console.log('✅ Private Key appears to be valid PEM format');
      } else {
        console.log('⚠️  Private Key may not be in PEM format');
      }

      if (publicCertStr.includes('BEGIN CERTIFICATE')) {
        console.log('✅ Public Cert appears to be valid PEM format');
      } else {
        console.log('⚠️  Public Cert may not be in PEM format');
      }
    } else {
      console.log('❌ Failed to read certificate files');
    }
  } catch (error) {
    console.log('❌ Error inspecting certificates:', error.message);
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 CyberSource Certificate Test Script\n');
  console.log('Using certificates from CERTIFICATES/ folder\n');

  // First inspect the certificates
  await inspectCertificates();

  console.log('\n' + '='.repeat(60) + '\n');

  // Run all tests
  await testUsernamePassword();
  await testPEMBase64();
  await testPEMFiles();
  await testPEMDirect();
  await testEnvironmentVariables();

  console.log('\n' + '='.repeat(60));
  console.log('🏁 All tests completed!');
}

// Run if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testUsernamePassword,
  testPEMBase64,
  testPEMFiles,
  testPEMDirect,
  testEnvironmentVariables,
  inspectCertificates,
};
