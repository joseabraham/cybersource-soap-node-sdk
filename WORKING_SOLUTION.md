# CyberSource SOAP SDK - Working Solution

## Issue Summary

The CyberSource SOAP SDK has been experiencing XML namespace conflicts that prevent successful payment processing. After extensive debugging, we've discovered that the SDK's model classes generate malformed XML with conflicting namespace declarations.

## Root Cause

The generated SOAP XML contains namespace conflicts like:

```xml
<data:requestMessage xmlns:data="urn:schemas-cybersource-com:transaction-data-1.151" xmlns="urn:schemas-cybersource-com:transaction-data-1.151">
```

This creates a conflict where both a prefixed namespace (`data:`) and default namespace point to the same URI, causing CyberSource to return "Failed to parse request" errors.

## Recommended Solution

**Use the direct `normalRequest` approach instead of the SDK model classes.** Your existing working service demonstrates this pattern works perfectly.

### Working Pattern (Use This)

```javascript
const CybersourceApi = require('./CybersourceApi');

const api = new CybersourceApi(
  'your-password',
  'your-merchant-id',
  'development', // or 'production'
  'en',
  '1.151',
  'USD'
);

// Direct request object - no model classes
const request_object = {
  merchantID: 'your-merchant-id',
  merchantReferenceCode: 'REF-' + Date.now(),
  billTo: {
    firstName: 'John',
    lastName: 'Doe',
    street1: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'US',
    phoneNumber: '4155551234',
    email: 'john.doe@example.com',
    ipAddress: '192.168.1.1',
    customerID: 'customer123',
  },
  purchaseTotals: {
    currency: 'USD',
    grandTotalAmount: '100.00',
  },
  card: {
    accountNumber: '4111111111111111',
    expirationMonth: '12',
    expirationYear: '2025',
    cvNumber: '123',
  },
  ccAuthService: { run: true },
};

// Use normalRequest directly
try {
  const result = await api.normalRequest(request_object);
  console.log('Success:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### What NOT to Use (Broken)

Avoid using the SDK model classes like:

- `new BillTo()`
- `new PurchaseTotals()`
- `new Card()`
- `new CCAuthService()`

These generate the problematic XML with namespace conflicts.

## Why This Works

1. **Clean XML Generation**: The direct approach generates proper XML without namespace conflicts
2. **Proven in Production**: Your existing service uses this pattern successfully
3. **Simpler Code**: Less abstraction, more control over the request structure
4. **Better Debugging**: Easier to see exactly what's being sent to CyberSource

## Testing Your Credentials

Use the test script with the direct approach:

```bash
node test-clean-approach.js
```

This script uses the working pattern and should successfully process test transactions.

## Current Status: XML Generation Issue

After extensive debugging, the issue has been identified as a fundamental problem with the node-soap library's XML generation from the CyberSource WSDL. The generated XML contains:

1. **Namespace conflicts**: Both prefixed (`data:`) and default namespace point to the same URI
2. **Incorrect namespace prefixes**: Elements use `ns1:` instead of `data:` prefixes

This appears to be a deep issue with how node-soap processes the CyberSource WSDL definitions and generates XML.

## Recommendation

Since your existing service works perfectly with CyberSource, the best approach is:

1. **Use your working service pattern**: Your existing implementation successfully processes payments
2. **Extract the working logic**: Copy the working request structure and authentication from your service
3. **Document the working pattern**: Create clear examples based on your successful implementation
4. **Focus on the P12 enhancement**: Your P12 certificate support is the main value-add

## Alternative Approaches

Consider exploring:

1. **Different SOAP library**: Try a different Node.js SOAP client that might handle CyberSource WSDL better
2. **Manual XML generation**: Build the SOAP XML manually using templates
3. **REST API migration**: CyberSource offers REST APIs that might be easier to integrate

## Next Steps

1. **Document your working service pattern**: Create examples based on your successful implementation
2. **Package the P12 functionality**: Focus on the P12 certificate support as the main feature
3. **Consider REST API**: Evaluate migrating to CyberSource's REST APIs for new implementations

The core value of this package is the P12 certificate support you've added. The SOAP XML generation issues appear to be a limitation of the node-soap library with CyberSource's complex WSDL.
