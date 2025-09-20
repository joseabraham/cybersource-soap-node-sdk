#!/usr/bin/env node

/**
 * Interactive Certificate Test (Simple Version)
 *
 * This script provides an interactive way to test certificates using
 * the same approach as test-simple.js but with user prompts.
 */

const inquirer = require('inquirer');
const CyberSourceApi = require('./CybersourceApi');
const fs = require('fs');
const path = require('path');

console.log('🔒 CyberSource SOAP SDK - Simple Certificate Test\n');

// Certificate file paths
const certPaths = {
  keyPemBase64: path.join(__dirname, 'CERTIFICATES', 'key.pem.base64'),
  certPemBase64: path.join(__dirname, 'CERTIFICATES', 'cert.pem.base64'),
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
        { name: 'PEM Base64 Encoded (from CERTIFICATES/ folder)', value: 'pem_base64' },
        { name: 'PEM File Paths (creates temp files)', value: 'pem_files' },
        { name: 'PEM Direct Buffers', value: 'pem_direct' },
        { name: 'Test All Methods', value: 'all' },
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

async function testPEMBase64(config) {
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
    // Read the base64 files
    const privateKeyBuffer = readBase64File(certPaths.keyPemBase64);
    const publicCertBuffer = readBase64File(certPaths.certPemBase64);

    if (!privateKeyBuffer || !publicCertBuffer) {
      throw new Error('Failed to read certificate files');
    }

    // Create actual PEM files
    const tempKeyPath = path.join(__dirname, 'CERTIFICATES', 'temp_private-key.pem');
    const tempCertPath = path.join(__dirname, 'CERTIFICATES', 'temp_certificate.pem');

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

async function runTests() {
  try {
    const config = await promptForConfig();

    console.log('\n🚀 Starting Certificate Tests...\n');
    console.log(`Using certificates from: ${certPaths.keyPemBase64}`);
    console.log(`Using certificates from: ${certPaths.certPemBase64}\n`);

    let successCount = 0;
    let totalTests = 0;

    if (config.testMethod === 'pem_base64' || config.testMethod === 'all') {
      totalTests++;
      if (await testPEMBase64(config)) successCount++;
    }

    if (config.testMethod === 'pem_files' || config.testMethod === 'all') {
      totalTests++;
      if (await testPEMFiles(config)) successCount++;
    }

    if (config.testMethod === 'pem_direct' || config.testMethod === 'all') {
      totalTests++;
      if (await testPEMDirect(config)) successCount++;
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
  testPEMBase64,
  testPEMFiles,
  testPEMDirect,
  runTests,
};
