# CyberSource Certificate Setup Guide

This guide explains how to set up and use P12 certificates and PEM certificates with the CyberSource SOAP SDK.

## Quick Start (Recommended Workflow)

**What CyberSource gives you:**

1. `certificate.p12` file (binary format)
2. Passphrase for the certificate

**What you need to do:**

1. Convert P12 to PEM format (one-time setup)
2. Use PEM format with the SDK (recommended)

**Step-by-step:**

1. Place `certificate.p12` in the `CERTIFICATES/` folder
2. Run: `npm run convert:certificates` (converts P12 → PEM)
3. Run: `npm run test:certificates` (test your setup)

**Why PEM?** PEM format is more reliable, easier to debug, and works consistently across all environments.

## Table of Contents

1. [P12 Certificate Setup](#p12-certificate-setup)
2. [PEM Certificate Setup](#pem-certificate-setup)
3. [Environment Variables](#environment-variables)
4. [Testing Your Certificates](#testing-your-certificates)
5. [Certificate Conversion Tools](#certificate-conversion-tools)
6. [Code Examples](#code-examples)
7. [Troubleshooting](#troubleshooting)

## P12 Certificate Setup

### Prerequisites

1. **Install node-forge dependency**:

   ```bash
   npm install node-forge
   ```

2. **Obtain P12 certificate from CyberSource**:
   - Log into your CyberSource Business Center
   - Navigate to Administration > Security Settings > Digital Certificates
   - Download your P12 certificate file (typically named `certificate.p12`)
   - Note the passphrase used when creating the certificate

### Typical Workflow

**What CyberSource provides:**

- `certificate.p12` file (binary format)
- Passphrase for the certificate

**What you need to do:**

1. **Option A**: Use P12 directly (recommended for production)
2. **Option B**: Convert P12 to PEM format for easier debugging/testing

**Conversion Steps (P12 → PEM):**

```bash
# Convert P12 to PEM using OpenSSL
openssl pkcs12 -in certificate.p12 -out private-key.pem -nocerts -nodes
openssl pkcs12 -in certificate.p12 -out certificate.pem -clcerts -nokeys

# Or use our conversion tool
npm run convert:certificates
```

### Method 1: Direct Code Configuration

```javascript
const CyberSourceApi = require('cybersource-soap-sdk');

// Initialize with P12 certificate
const api = new CyberSourceApi(
  '', // Empty password when using certificates
  'your-merchant-id',
  'development', // or 'production'
  'en',
  '1.151',
  'USD',
  {
    p12Path: '/path/to/your/certificate.p12',
    p12Passphrase: 'your-p12-passphrase',
  }
);
```

### Method 2: Base64 Encoded P12

```javascript
const fs = require('fs');

// Read P12 file and convert to base64
const p12Buffer = fs.readFileSync('/path/to/your/certificate.p12');
const p12Base64 = p12Buffer.toString('base64');

const api = new CyberSourceApi('', 'your-merchant-id', 'development', 'en', '1.151', 'USD', {
  p12Base64: p12Base64,
  p12Passphrase: 'your-p12-passphrase',
});
```

## PEM Certificate Setup

### Converting P12 to PEM

If you have a P12 certificate, you can convert it to PEM format:

```bash
# Extract private key
openssl pkcs12 -in certificate.p12 -nocerts -out private-key.pem -nodes

# Extract certificate
openssl pkcs12 -in certificate.p12 -clcerts -nokeys -out certificate.pem

# If the private key is encrypted, decrypt it
openssl rsa -in private-key.pem -out private-key-decrypted.pem
```

### Method 1: Direct Code Configuration

```javascript
const api = new CyberSourceApi('', 'your-merchant-id', 'development', 'en', '1.151', 'USD', {
  privateKeyPath: '/path/to/private-key.pem',
  publicCertPath: '/path/to/certificate.pem',
  passphrase: 'optional-passphrase', // Only if private key is encrypted
});
```

### Method 2: Base64 Encoded PEM

```javascript
const fs = require('fs');

const privateKey = fs.readFileSync('/path/to/private-key.pem').toString('base64');
const publicCert = fs.readFileSync('/path/to/certificate.pem').toString('base64');

const api = new CyberSourceApi('', 'your-merchant-id', 'development', 'en', '1.151', 'USD', {
  privateKeyPemBase64: privateKey,
  publicCertPemBase64: publicCert,
  passphrase: 'optional-passphrase',
});
```

## Environment Variables

You can also configure certificates using environment variables:

### Development Environment

```bash
# P12 Certificate
export DEV_CYBERSOURCE_P12_PATH="/path/to/certificate.p12"
export DEV_CYBERSOURCE_P12_PASSPHRASE="your-passphrase"

# Or PEM Certificates
export DEV_CYBERSOURCE_PRIVATE_KEY_PATH="/path/to/private-key.pem"
export DEV_CYBERSOURCE_PUBLIC_CERT_PATH="/path/to/certificate.pem"
export DEV_CYBERSOURCE_CERT_PASSPHRASE="optional-passphrase"

# Or Base64 Encoded
export DEV_CYBERSOURCE_P12_BASE64="base64-encoded-p12-content"
export DEV_CYBERSOURCE_PRIVATE_KEY_PEM_BASE64="base64-encoded-private-key"
export DEV_CYBERSOURCE_PUBLIC_CERT_PEM_BASE64="base64-encoded-certificate"
```

### Production Environment

```bash
# P12 Certificate
export PROD_CYBERSOURCE_P12_PATH="/path/to/certificate.p12"
export PROD_CYBERSOURCE_P12_PASSPHRASE="your-passphrase"

# Or PEM Certificates
export PROD_CYBERSOURCE_PRIVATE_KEY_PATH="/path/to/private-key.pem"
export PROD_CYBERSOURCE_PUBLIC_CERT_PATH="/path/to/certificate.pem"
export PROD_CYBERSOURCE_CERT_PASSPHRASE="optional-passphrase"
```

## Testing Your Certificates

The SDK provides several comprehensive testing tools to verify your certificate setup:

### Quick Test (Recommended)

```bash
npm run test:certificates
```

This runs all available certificate methods automatically using your certificates from the `CERTIFICATES/` folder.

### Interactive Testing

```bash
npm run test:certificates-interactive
```

This provides an interactive menu where you can:

- Choose specific certificate methods to test
- Test P12 certificates (if you have them)
- Test PEM certificates (base64, file paths, direct buffers)
- Test environment variable configuration
- Test username/password authentication

### Original Interactive Test

```bash
npm run test:credentials
```

This is the original comprehensive test suite that includes:

- Basic authorization testing
- Different card number scenarios
- Error scenario testing
- Transaction type testing
- Validation and edge case testing
- All certificate authentication methods

### Available Test Methods

The testing tools support these reliable authentication methods:

1. **Username/Password Authentication**
   - Traditional CyberSource username/password
   - Good for testing basic connectivity

2. **PEM Base64 Encoded** ⭐ (Recommended)
   - PEM certificates as base64 strings
   - Uses `key.pem.base64` and `cert.pem.base64` from `CERTIFICATES/` folder
   - Most reliable and consistent

3. **PEM File Paths**
   - Direct paths to PEM certificate files
   - Creates temporary files from base64 sources
   - Good for debugging

4. **PEM Direct Buffers**
   - PEM certificates as Buffer objects
   - Most efficient for programmatic use
   - Best for production applications

5. **Environment Variables**
   - Configuration via environment variables
   - Best for production deployments
   - Secure and flexible

**Note:** P12 direct usage has been removed due to passphrase complexity and reliability issues. We recommend converting P12 to PEM format first.

## Certificate Conversion Tools

### Convert P12 to PEM Files (Recommended)

```bash
# Using default passphrase (test123)
npm run convert:certificates

# Using your actual passphrase
CYBERSOURCE_P12_PASSPHRASE="your-actual-passphrase" npm run convert:certificates
```

This tool automatically detects and converts:

1. **P12 files** (what CyberSource typically provides) → PEM format
2. **P12 base64** → PEM format
3. **PEM base64** → PEM format (fallback)

**What it does:**

- Converts P12 certificates to separate PEM files
- Creates `private-key.pem` and `certificate.pem` in the `CERTIFICATES/` folder
- Validates the certificate format
- Creates a simple test script for PEM files
- Shows detailed certificate information
- Uses environment variable for passphrase (more secure)

### Manual Conversion

If you prefer to convert manually:

```bash
# Convert base64 to PEM files
node scripts/convert-certificates.js

# This will create:
# - CERTIFICATES/private-key.pem
# - CERTIFICATES/certificate.pem
# - test-pem-files.js (simple test script)
```

### File Structure

**Typical workflow (P12 from CyberSource):**

```
CERTIFICATES/
├── certificate.p12         # P12 file from CyberSource (what you get)
├── private-key.pem         # Converted PEM private key (created by converter)
└── certificate.pem         # Converted PEM certificate (created by converter)
```

**Alternative workflow (if you have base64 files):**

```
CERTIFICATES/
├── certificate.p12         # P12 file (if you have one)
├── certificate.p12.base64  # P12 as base64 (if you have one)
├── key.pem.base64          # PEM private key as base64 (if you have one)
├── cert.pem.base64         # PEM certificate as base64 (if you have one)
├── private-key.pem         # Converted PEM private key (created by converter)
└── certificate.pem         # Converted PEM certificate (created by converter)
```

## Code Examples

### Complete Example with P12 Certificate

```javascript
const CyberSourceApi = require('cybersource-soap-sdk');

async function testWithP12() {
  try {
    // Initialize with P12 certificate
    const api = new CyberSourceApi(
      '', // Empty password
      'your-merchant-id',
      'development',
      'en',
      '1.151',
      'USD',
      {
        p12Path: './certificates/your-certificate.p12',
        p12Passphrase: 'your-passphrase',
      }
    );

    // Test with a simple authorization
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
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testWithP12();
```

### Complete Example with Environment Variables

```javascript
const CyberSourceApi = require('cybersource-soap-sdk');

async function testWithEnvVars() {
  try {
    // Initialize without certOptions - will use environment variables
    const api = new CyberSourceApi(
      '', // Empty password
      process.env.CYBERSOURCE_MERCHANT_ID,
      process.env.NODE_ENV === 'production' ? 'production' : 'development',
      'en',
      '1.151',
      'USD'
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
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testWithEnvVars();
```

## Troubleshooting

### Common Issues

1. **"Failed to process P12 certificate"**
   - Ensure `node-forge` is installed: `npm install node-forge`
   - Verify the P12 file is not corrupted
   - Check that the passphrase is correct

2. **"Invalid CyberSource certificate configuration"**
   - Ensure both private key and certificate are provided
   - Check file paths are correct
   - Verify PEM format is valid

3. **"Could not extract certificate from P12"**
   - P12 file might be password protected - provide the correct passphrase
   - P12 file might be corrupted - try re-downloading from CyberSource

4. **"WSSecurity error"**
   - Check that the certificate matches your merchant ID
   - Ensure you're using the correct environment (development vs production)
   - Verify the certificate hasn't expired

### Debug Mode

Enable debug mode to see detailed certificate processing:

```javascript
// Set DEBUG to true in Configuration.js
const DEBUG = true;
```

### Testing Certificate Setup

Use the credential test tool to verify your certificate setup:

```bash
node test/interactive/credential-test.js
```

Select "P12 Certificate" when prompted for authentication method.

## Security Best Practices

1. **Never commit certificates to version control**
2. **Use environment variables for production**
3. **Store certificates in secure locations with proper permissions**
4. **Rotate certificates regularly**
5. **Use different certificates for development and production**

## Support

If you encounter issues with certificate setup:

1. Check the CyberSource Business Center for certificate status
2. Verify your merchant account has certificate authentication enabled
3. Contact CyberSource support for certificate-related issues
4. Check the SDK logs for detailed error messages
