#!/usr/bin/env node

/**
 * Interactive Certificate Test Script
 *
 * This script provides an interactive way to test all certificate authentication methods
 * including P12, PEM, and environment variables.
 */

const inquirer = require('inquirer');
const CyberSourceApi = require('../../CybersourceApi');
const fs = require('fs');
const path = require('path');

console.log('🔒 CyberSource SOAP SDK - Interactive Certificate Test\n');

// Certificate file paths
const certPaths = {
  keyPemBase64: path.join(__dirname, '../../CERTIFICATES', 'key.pem.base64'),
  certPemBase64: path.join(__dirname, '../../CERTIFICATES', 'cert.pem.base64'),
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

async function promptForConfig() {
  const questions = [
    {
      type: 'input',
      name: 'merchantID',
      message: 'Enter your CyberSource Merchant ID:',
      default: 'tc_pa_016025XXX',
      validate: input => input.length > 0 || 'Merchant ID is required',
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
      name: 'testMethod',
      message: 'Select test method:',
      choices: [
        { name: 'Username/Password Authentication', value: 'username' },
        { name: 'PEM Base64 Encoded (from CERTIFICATES/ folder)', value: 'pem_base64' },
        { name: 'PEM File Paths (creates temp files)', value: 'pem_files' },
        { name: 'PEM Direct Buffers', value: 'pem_direct' },
        { name: 'Environment Variables', value: 'env_vars' },
        { name: 'Test All Available Methods', value: 'all' },
      ],
    },
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

  return await inquirer.prompt(questions);
}

async function testUsernamePassword(config) {
  console.log('\n🔐 Testing: Username/Password Authentication\n');

  try {
    const api = new CyberSourceApi(
      'test-password', // This will fail, but we're testing the method
      config.merchantID,
      config.environment,
      config.language,
      config.version,
      config.currency
    );

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
      'TEST-USERNAME-' + Date.now(),
      billTo,
      card
    );

    const result = await api.authorizeCharge(authRequest, 10.0);
    console.log('✅ Username/Password: SUCCESS -', result.message);
    return true;
  } catch (error) {
    console.log('❌ Username/Password: FAILED -', error.message);
    return false;
  }
}

async function testPEMBase64(config) {
  console.log('\n🔐 Testing: PEM Base64 Encoded Authentication\n');

  try {
    const privateKeyBuffer = readBase64File(certPaths.keyPemBase64);
    const publicCertBuffer = readBase64File(certPaths.certPemBase64);

    if (!privateKeyBuffer || !publicCertBuffer) {
      throw new Error('Failed to read certificate files');
    }

    console.log('📋 Certificate Info:');
    console.log(`   Private Key Length: ${privateKeyBuffer.length} bytes`);
    console.log(`   Public Cert Length: ${publicCertBuffer.length} bytes`);

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
        passphrase: 'test123',
      }
    );

    console.log('🧪 Testing transaction...');

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
      'TEST-PEM-BASE64-' + Date.now(),
      billTo,
      card
    );

    const result = await api.authorizeCharge(authRequest, 10.0);
    console.log('✅ PEM Base64: SUCCESS -', result.message);
    return true;
  } catch (error) {
    console.log('❌ PEM Base64: FAILED -', error.message);
    return false;
  }
}

async function testPEMFiles(config) {
  console.log('\n🔐 Testing: PEM File Path Authentication\n');

  try {
    const privateKeyBuffer = readBase64File(certPaths.keyPemBase64);
    const publicCertBuffer = readBase64File(certPaths.certPemBase64);

    if (!privateKeyBuffer || !publicCertBuffer) {
      throw new Error('Failed to read certificate files');
    }

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
        passphrase: 'test123',
      }
    );

    console.log('🧪 Testing transaction...');

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
      'TEST-PEM-FILES-' + Date.now(),
      billTo,
      card
    );

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

async function testPEMDirect(config) {
  console.log('\n🔐 Testing: PEM Direct Buffer Authentication\n');

  try {
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
        passphrase: 'test123',
      }
    );

    console.log('🧪 Testing transaction...');

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
      'TEST-PEM-DIRECT-' + Date.now(),
      billTo,
      card
    );

    const result = await api.authorizeCharge(authRequest, 10.0);
    console.log('✅ PEM Direct: SUCCESS -', result.message);
    return true;
  } catch (error) {
    console.log('❌ PEM Direct: FAILED -', error.message);
    return false;
  }
}

async function testEnvironmentVariables(config) {
  console.log('\n🔐 Testing: Environment Variables Authentication\n');

  try {
    const privateKeyBuffer = readBase64File(certPaths.keyPemBase64);
    const publicCertBuffer = readBase64File(certPaths.certPemBase64);

    if (!privateKeyBuffer || !publicCertBuffer) {
      throw new Error('Failed to read certificate files');
    }

    // Set environment variables for testing
    process.env.DEV_CYBERSOURCE_PRIVATE_KEY_PEM = privateKeyBuffer.toString();
    process.env.DEV_CYBERSOURCE_PUBLIC_CERT_PEM = publicCertBuffer.toString();
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
      'TEST-ENV-VARS-' + Date.now(),
      billTo,
      card
    );

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

async function runTests() {
  try {
    const config = await promptForConfig();

    console.log('\n🚀 Starting Certificate Tests...\n');
    console.log(`Using certificates from: ${certPaths.keyPemBase64}`);
    console.log(`Using certificates from: ${certPaths.certPemBase64}\n`);

    let successCount = 0;
    let totalTests = 0;

    const testMethods = {
      username: testUsernamePassword,
      pem_base64: testPEMBase64,
      pem_files: testPEMFiles,
      pem_direct: testPEMDirect,
      env_vars: testEnvironmentVariables,
    };

    if (config.testMethod === 'all') {
      // Test all available methods
      for (const [, testFn] of Object.entries(testMethods)) {
        totalTests++;
        if (await testFn(config)) {
          successCount++;
        }
      }
    } else {
      // Test specific method
      totalTests = 1;
      if (await testMethods[config.testMethod](config)) {
        successCount = 1;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`🏁 Tests completed! ${successCount}/${totalTests} successful`);

    if (successCount === totalTests) {
      console.log('🎉 All tests passed! Your certificates are working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Check the error messages above.');
    }
  } catch (error) {
    console.log('\n❌ An error occurred:');
    console.log(error.message);
  }
}

// Run if called directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testUsernamePassword,
  testPEMBase64,
  testPEMFiles,
  testPEMDirect,
  testEnvironmentVariables,
  runTests,
};
