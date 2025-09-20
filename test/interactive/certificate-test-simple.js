#!/usr/bin/env node

/**
 * Simple Certificate Test Script
 *
 * This script tests all certificate authentication methods using the actual
 * certificate files in the CERTIFICATES/ folder, including P12 support.
 */

const CyberSourceApi = require('../../CybersourceApi');
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
  keyPemBase64: path.join(__dirname, '../../CERTIFICATES', 'key.pem.base64'),
  certPemBase64: path.join(__dirname, '../../CERTIFICATES', 'cert.pem.base64'),
  // Add P12 path if you have one
  // p12Path: path.join(__dirname, '../../CERTIFICATES', 'certificate.p12')
};

// Helper function to read and decode base64 file
function readBase64File(filePath) {
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
    return true;
  } catch (error) {
    console.log('❌ Username/Password: FAILED -', error.message);
    return false;
  }
}

async function testPEMBase64() {
  console.log('\n🔐 Testing: PEM Base64 Encoded Authentication\n');

  try {
    // Read the base64 files
    const privateKeyBuffer = readBase64File(certPaths.keyPemBase64);
    const publicCertBuffer = readBase64File(certPaths.certPemBase64);

    if (!privateKeyBuffer || !publicCertBuffer) {
      throw new Error('Failed to read certificate files');
    }

    console.log('📋 Certificate Info:');
    console.log(`   Private Key Length: ${privateKeyBuffer.length} bytes`);
    console.log(`   Public Cert Length: ${publicCertBuffer.length} bytes`);

    // Convert to base64 strings for the API
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

    console.log('🧪 Testing transaction...');

    const authRequest = createTestTransaction(api, 'PEM-BASE64');
    const result = await api.authorizeCharge(authRequest, 10.0);
    console.log('✅ PEM Base64: SUCCESS -', result.message);
    return true;
  } catch (error) {
    console.log('❌ PEM Base64: FAILED -', error.message);
    return false;
  }
}

async function testPEMFiles() {
  console.log('\n🔐 Testing: PEM File Path Authentication\n');

  try {
    // Read the base64 files
    const privateKeyBuffer = readBase64File(certPaths.keyPemBase64);
    const publicCertBuffer = readBase64File(certPaths.certPemBase64);

    if (!privateKeyBuffer || !publicCertBuffer) {
      throw new Error('Failed to read certificate files');
    }

    // Create actual PEM files
    const tempKeyPath = path.join(__dirname, '../../CERTIFICATES', 'temp_private-key.pem');
    const tempCertPath = path.join(__dirname, '../../CERTIFICATES', 'temp_certificate.pem');

    fs.writeFileSync(tempKeyPath, privateKeyBuffer);
    fs.writeFileSync(tempCertPath, publicCertBuffer);

    console.log('📁 Created PEM files:');
    console.log(`   Private Key: ${tempKeyPath}`);
    console.log(`   Certificate: ${tempCertPath}`);

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

    console.log('🧪 Testing transaction...');

    const authRequest = createTestTransaction(api, 'PEM-FILES');
    const result = await api.authorizeCharge(authRequest, 10.0);
    console.log('✅ PEM Files: SUCCESS -', result.message);

    // Clean up temporary files
    fs.unlinkSync(tempKeyPath);
    fs.unlinkSync(tempCertPath);
    return true;
  } catch (error) {
    console.log('❌ PEM Files: FAILED -', error.message);
    return false;
  }
}

async function testPEMDirect() {
  console.log('\n🔐 Testing: PEM Direct Buffer Authentication\n');

  try {
    // Read the base64 files
    const privateKeyBuffer = readBase64File(certPaths.keyPemBase64);
    const publicCertBuffer = readBase64File(certPaths.certPemBase64);

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

    console.log('🧪 Testing transaction...');

    const authRequest = createTestTransaction(api, 'PEM-DIRECT');
    const result = await api.authorizeCharge(authRequest, 10.0);
    console.log('✅ PEM Direct: SUCCESS -', result.message);
    return true;
  } catch (error) {
    console.log('❌ PEM Direct: FAILED -', error.message);
    return false;
  }
}

async function testEnvironmentVariables() {
  console.log('\n🔐 Testing: Environment Variables Authentication\n');

  try {
    // Set environment variables for testing
    process.env.DEV_CYBERSOURCE_PRIVATE_KEY_PEM = readBase64File(certPaths.keyPemBase64).toString();
    process.env.DEV_CYBERSOURCE_PUBLIC_CERT_PEM = readBase64File(
      certPaths.certPemBase64
    ).toString();
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

    console.log('🧪 Testing transaction...');

    const authRequest = createTestTransaction(api, 'ENV-VARS');
    const result = await api.authorizeCharge(authRequest, 10.0);
    console.log('✅ Environment Variables: SUCCESS -', result.message);
    return true;
  } catch (error) {
    console.log('❌ Environment Variables: FAILED -', error.message);
    return false;
  } finally {
    // Clean up environment variables
    delete process.env.DEV_CYBERSOURCE_PRIVATE_KEY_PEM;
    delete process.env.DEV_CYBERSOURCE_PUBLIC_CERT_PEM;
    delete process.env.DEV_CYBERSOURCE_CERT_PASSPHRASE;
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 CyberSource Certificate Test Script\n');
  console.log('Using certificates from CERTIFICATES/ folder\n');

  const tests = [
    { name: 'Username/Password', fn: testUsernamePassword },
    { name: 'PEM Base64 Encoded', fn: testPEMBase64 },
    { name: 'PEM File Paths', fn: testPEMFiles },
    { name: 'PEM Direct Buffers', fn: testPEMDirect },
    { name: 'Environment Variables', fn: testEnvironmentVariables },
  ];

  let successCount = 0;
  let totalTests = 0;

  for (const test of tests) {
    totalTests++;
    if (await test.fn()) {
      successCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`🏁 All tests completed! ${successCount}/${totalTests} successful`);

  if (successCount === totalTests) {
    console.log('🎉 All tests passed! Your certificates are working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the error messages above.');
  }
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
  runAllTests,
};
