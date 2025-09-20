#!/usr/bin/env node

/**
 * Simple Certificate Test Script
 *
 * This script tests certificate authentication using the base64 files
 * in the CERTIFICATES/ folder.
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

async function testPEMBase64() {
  console.log('🔐 Testing: PEM Base64 Encoded Authentication\n');

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

    // Check the content
    const privateKeyStr = privateKeyBuffer.toString();
    const publicCertStr = publicCertBuffer.toString();

    console.log(`   Private Key starts with: ${privateKeyStr.substring(0, 50)}...`);
    console.log(`   Public Cert starts with: ${publicCertStr.substring(0, 50)}...`);

    // Convert to base64 strings for the API
    const privateKeyBase64 = privateKeyBuffer.toString('base64');
    const publicCertBase64 = publicCertBuffer.toString('base64');

    console.log('\n🔧 Creating API with certificates...');

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
  } catch (error) {
    console.log('❌ PEM Base64: FAILED -', error.message);
    if (error.message.includes('unsupported')) {
      console.log('   This might be due to certificate format issues.');
      console.log('   Let\'s try creating actual PEM files instead.');
    }
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
    const tempKeyPath = path.join(__dirname, 'CERTIFICATES', 'private-key.pem');
    const tempCertPath = path.join(__dirname, 'CERTIFICATES', 'certificate.pem');

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
  } catch (error) {
    console.log('❌ PEM Files: FAILED -', error.message);
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
  } catch (error) {
    console.log('❌ PEM Direct: FAILED -', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Simple Certificate Test Script\n');
  console.log('Using certificates from CERTIFICATES/ folder\n');

  // Test all methods
  await testPEMBase64();
  await testPEMFiles();
  await testPEMDirect();

  console.log('\n' + '='.repeat(60));
  console.log('🏁 All tests completed!');
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testPEMBase64,
  testPEMFiles,
  testPEMDirect,
};
