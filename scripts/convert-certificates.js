#!/usr/bin/env node

/* eslint-disable no-console */

/**
 * Certificate Conversion Script
 *
 * This script converts P12 certificates to PEM format and handles base64-encoded
 * certificates. This is the typical workflow when CyberSource provides a P12 file.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Certificate file paths
const certPaths = {
  // P12 files (what CyberSource typically provides)
  p12File: path.join(__dirname, '../CERTIFICATES', 'certificate.p12'),
  p12Base64: path.join(__dirname, '../CERTIFICATES', 'certificate.p12.base64'),

  // Base64 PEM files (if you have them)
  keyPemBase64: path.join(__dirname, '../CERTIFICATES', 'key.pem.base64'),
  certPemBase64: path.join(__dirname, '../CERTIFICATES', 'cert.pem.base64'),

  // Output PEM files
  keyPem: path.join(__dirname, '../CERTIFICATES', 'private-key.pem'),
  certPem: path.join(__dirname, '../CERTIFICATES', 'certificate.pem'),
};

function convertP12ToPem(p12Path, passphrase = '') {
  console.log('🔄 Converting P12 certificate to PEM files...\n');

  try {
    if (!fs.existsSync(p12Path)) {
      console.log(`⏭️  P12 File: SKIPPED - P12 file not found at ${p12Path}`);
      return false;
    }

    console.log(`📋 P12 file found: ${p12Path}`);
    console.log(`📋 Using passphrase: ${passphrase ? 'Yes' : 'No'}`);

    // Convert P12 to private key PEM
    console.log('🔑 Extracting private key...');
    const keyCommand = `openssl pkcs12 -in "${p12Path}" -out "${certPaths.keyPem}" -nocerts -nodes${passphrase ? ` -passin pass:${passphrase}` : ''}`;
    execSync(keyCommand, { stdio: 'pipe' });

    // Convert P12 to certificate PEM
    console.log('📜 Extracting certificate...');
    const certCommand = `openssl pkcs12 -in "${p12Path}" -out "${certPaths.certPem}" -clcerts -nokeys${passphrase ? ` -passin pass:${passphrase}` : ''}`;
    execSync(certCommand, { stdio: 'pipe' });

    console.log('\n✅ Successfully converted P12 to PEM:');
    console.log(`   Private Key: ${certPaths.keyPem}`);
    console.log(`   Certificate: ${certPaths.certPem}`);

    // Verify the files
    const keyContent = fs.readFileSync(certPaths.keyPem, 'utf8');
    const certContent = fs.readFileSync(certPaths.certPem, 'utf8');

    console.log('\n📋 Certificate Information:');
    console.log(`   Private Key Length: ${keyContent.length} characters`);
    console.log(`   Certificate Length: ${certContent.length} characters`);

    if (keyContent.includes('BEGIN PRIVATE KEY') || keyContent.includes('BEGIN RSA PRIVATE KEY')) {
      console.log('✅ Private Key is valid PEM format');
    } else {
      console.log('⚠️  Private Key may not be in standard PEM format');
    }

    if (certContent.includes('BEGIN CERTIFICATE')) {
      console.log('✅ Certificate is valid PEM format');
    } else {
      console.log('⚠️  Certificate may not be in standard PEM format');
    }

    return true;
  } catch (error) {
    console.error('❌ Error converting P12 to PEM:', error.message);
    if (error.message.includes('bad decrypt')) {
      console.log('💡 Tip: The passphrase might be incorrect. Try with the correct passphrase.');
    }
    return false;
  }
}

function convertBase64ToPem() {
  console.log('🔄 Converting Base64 certificates to PEM files...\n');

  try {
    // Read base64 files
    const keyBase64 = fs.readFileSync(certPaths.keyPemBase64, 'utf8').trim();
    const certBase64 = fs.readFileSync(certPaths.certPemBase64, 'utf8').trim();

    console.log('📋 Base64 file info:');
    console.log(`   Key base64 length: ${keyBase64.length} characters`);
    console.log(`   Cert base64 length: ${certBase64.length} characters`);

    // Decode base64 to buffer
    const keyBuffer = Buffer.from(keyBase64, 'base64');
    const certBuffer = Buffer.from(certBase64, 'base64');

    console.log('📋 Decoded buffer info:');
    console.log(`   Key buffer length: ${keyBuffer.length} bytes`);
    console.log(`   Cert buffer length: ${certBuffer.length} bytes`);

    // Write as PEM files
    fs.writeFileSync(certPaths.keyPem, keyBuffer);
    fs.writeFileSync(certPaths.certPem, certBuffer);

    console.log('\n✅ Successfully converted certificates:');
    console.log(`   Private Key: ${certPaths.keyPem}`);
    console.log(`   Certificate: ${certPaths.certPem}`);

    // Verify the files
    const keyContent = keyBuffer.toString();
    const certContent = certBuffer.toString();

    console.log('\n📋 Certificate Information:');
    console.log(`   Private Key Length: ${keyBuffer.length} bytes`);
    console.log(`   Certificate Length: ${certBuffer.length} bytes`);

    console.log('\n📋 Private Key Preview:');
    console.log(keyContent.substring(0, 200) + '...');

    console.log('\n📋 Certificate Preview:');
    console.log(certContent.substring(0, 200) + '...');

    if (keyContent.includes('BEGIN PRIVATE KEY') || keyContent.includes('BEGIN RSA PRIVATE KEY')) {
      console.log('\n✅ Private Key appears to be valid PEM format');
    } else {
      console.log('\n⚠️  Private Key may not be in standard PEM format');
    }

    if (certContent.includes('BEGIN CERTIFICATE')) {
      console.log('✅ Certificate appears to be valid PEM format');
    } else {
      console.log('⚠️  Certificate may not be in standard PEM format');
    }

    return true;
  } catch (error) {
    console.error('❌ Error converting certificates:', error.message);
    return false;
  }
}

function createTestScript() {
  console.log('\n📝 Creating test script for PEM files...\n');

  const testScript = `#!/usr/bin/env node

const CyberSourceApi = require('../CybersourceApi');

async function testPEMFiles() {
  console.log('🔐 Testing with PEM files from CERTIFICATES/ folder\\n');
  
  try {
    const api = new CyberSourceApi(
      '', // Empty password when using certificates
      'tc_pa_016025XXX', // Your merchant ID
      'development',
      'en',
      '1.151',
      'USD',
      {
        privateKeyPath: './CERTIFICATES/private-key.pem',
        publicCertPath: './CERTIFICATES/certificate.pem',
        passphrase: 'test123' // Your passphrase
      }
    );

    // Test transaction
    const billTo = new api.Models.BillTo(
      'John', 'Doe', '123 Main St', 'City', 'CA', '12345', 'US', 'john@example.com'
    );
    const card = new api.Models.Card('4111111111111111', '12', '2025', '123', '001');
    const authRequest = new api.Models.AuthorizationRequest('TEST-PEM-' + Date.now(), billTo, card);

    const result = await api.authorizeCharge(authRequest, 10.00);
    console.log('✅ Success:', result.message);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testPEMFiles();
`;

  fs.writeFileSync(path.join(__dirname, '../test-pem-files.js'), testScript);
  console.log('✅ Created test-pem-files.js');
  console.log('   Run: node test-pem-files.js');
}

// Main function
function main() {
  console.log('🔧 CyberSource Certificate Converter\n');
  console.log('This tool converts certificates to PEM format for easier testing.\n');

  // Get passphrase from environment variable or prompt user
  const passphrase = process.env.CYBERSOURCE_P12_PASSPHRASE || 'test123';

  if (process.env.CYBERSOURCE_P12_PASSPHRASE) {
    console.log('🔐 Using passphrase from environment variable CYBERSOURCE_P12_PASSPHRASE');
  } else {
    console.log('⚠️  Using default passphrase "test123"');
    console.log(
      '   Set CYBERSOURCE_P12_PASSPHRASE environment variable for your actual passphrase'
    );
  }
  console.log('');

  let success = false;

  // Try P12 conversion first (most common workflow)
  if (fs.existsSync(certPaths.p12File)) {
    console.log('📁 Found P12 file - attempting conversion...\n');
    success = convertP12ToPem(certPaths.p12File, passphrase);
  } else if (fs.existsSync(certPaths.p12Base64)) {
    console.log('📁 Found P12 base64 file - attempting conversion...\n');
    // Convert base64 to P12 first, then to PEM
    try {
      const p12Base64 = fs.readFileSync(certPaths.p12Base64, 'utf8').trim();
      const p12Buffer = Buffer.from(p12Base64, 'base64');
      const tempP12Path = path.join(__dirname, '../CERTIFICATES', 'temp_certificate.p12');
      fs.writeFileSync(tempP12Path, p12Buffer);
      success = convertP12ToPem(tempP12Path, passphrase);
      fs.unlinkSync(tempP12Path); // Clean up temp file
    } catch (error) {
      console.log('❌ Failed to convert P12 base64:', error.message);
    }
  } else {
    console.log('📁 No P12 file found - trying base64 PEM conversion...\n');
    success = convertBase64ToPem();
  }

  if (success) {
    createTestScript();
    console.log('\n🎉 Conversion completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run test:certificates (comprehensive test)');
    console.log('2. Run: npm run test:certificates-interactive (interactive test)');
    console.log('3. Run: npm run test:credentials (original interactive test)');
    console.log('4. Run: node test-pem-files.js (simple PEM test)');
  } else {
    console.log('\n❌ Conversion failed. Please check your certificate files.');
    console.log('\nExpected files:');
    console.log('  - CERTIFICATES/certificate.p12 (P12 file from CyberSource)');
    console.log('  - CERTIFICATES/certificate.p12.base64 (P12 as base64)');
    console.log('  - CERTIFICATES/key.pem.base64 (PEM private key as base64)');
    console.log('  - CERTIFICATES/cert.pem.base64 (PEM certificate as base64)');
    console.log('\n💡 Tips:');
    console.log(
      '  - Set CYBERSOURCE_P12_PASSPHRASE environment variable for your actual passphrase'
    );
    console.log('  - Make sure the P12 file is not corrupted');
    console.log('  - Verify the passphrase is correct');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { convertP12ToPem, convertBase64ToPem, createTestScript };
