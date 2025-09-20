const soap = require('soap');
const fs = require('fs');
const DEBUG = false;

function extractPemByTypes(pemBuffer, types) {
  if (!pemBuffer) return null;
  const text = pemBuffer.toString().replace(/\r\n/g, '\n');
  for (const type of types) {
    const beginMarker = `-----BEGIN ${type}-----`;
    const endMarker = `-----END ${type}-----`;
    const b = text.indexOf(beginMarker);
    if (b !== -1) {
      const e = text.indexOf(endMarker, b);
      if (e !== -1) {
        const block = text.substring(b, e + endMarker.length);
        return Buffer.from(block);
      }
    }
  }
  return null;
}
module.exports = class Configuration {
  constructor(password, merchantID, environment, language, version, currency, certOptions = null) {
    this.password = password;
    this.merchantID = merchantID;
    this.environment = environment;
    this.language = language;
    this.version = version;
    this.currency = currency;
    this.certOptions = certOptions;

    if (environment === 'production') {
      this.url = `https://ics2wsa.ic3.com/commerce/1.x/transactionProcessor/CyberSourceTransaction_${version}.wsdl`;
    } else if (environment === 'development') {
      this.url = `https://ics2wstesta.ic3.com/commerce/1.x/transactionProcessor/CyberSourceTransaction_${version}.wsdl`;
    }

    this.options = {
      hasNonce: true,
    };
  }

  getWsSecurity() {
    const certSettings = this._getCertSettings();
    if (DEBUG) {
      try {
        console.log('certSettings --> ', certSettings);
      } catch (e) {
        void e;
      }
    }
    if (certSettings) {
      const {
        privateKeyPemBase64,
        publicCertPemBase64,
        privateKeyPath,
        publicCertPath,
        privateKeyPEM,
        publicCertPEM,
        passphrase,
        // P12 certificate support
        p12Path,
        p12Base64,
        p12Passphrase,
      } = certSettings;

      let privateKey = null;
      let publicCert = null;

      // Handle P12 certificates first
      if (p12Path || p12Base64) {
        try {
          const p12Buffer = p12Base64 ? Buffer.from(p12Base64, 'base64') : fs.readFileSync(p12Path);
          const p12Data = this._extractFromP12(p12Buffer, p12Passphrase);
          if (p12Data) {
            privateKey = p12Data.privateKey;
            publicCert = p12Data.publicCert;
          }
        } catch (error) {
          if (DEBUG) {
            console.error('Error processing P12 certificate:', error.message);
          }
          throw new Error(`Failed to process P12 certificate: ${error.message}`);
        }
      }

      // Fallback to PEM certificates if P12 not available or failed
      if (!privateKey && !publicCert) {
        if (privateKeyPemBase64) privateKey = Buffer.from(privateKeyPemBase64, 'base64');
        if (publicCertPemBase64) publicCert = Buffer.from(publicCertPemBase64, 'base64');

        if (!privateKey && privateKeyPEM) privateKey = privateKeyPEM;
        if (!publicCert && publicCertPEM) publicCert = publicCertPEM;

        if (!privateKey && privateKeyPath) privateKey = fs.readFileSync(privateKeyPath);
        if (!publicCert && publicCertPath) publicCert = fs.readFileSync(publicCertPath);
      }

      // Sanitize blocks (avoid Bag Attributes or extra lines in key)
      const keyBlock = extractPemByTypes(privateKey, [
        'ENCRYPTED PRIVATE KEY',
        'PRIVATE KEY',
        'RSA PRIVATE KEY',
        'EC PRIVATE KEY',
      ]);
      const certBlock = extractPemByTypes(publicCert, ['CERTIFICATE']);

      if ((keyBlock || privateKey) && (certBlock || publicCert)) {
        const wsOpts = {
          hasTimeStamp: false,
          signatureAlgorithm: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
          signerOptions: {
            digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1',
            signatureAlgorithm: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
            prefix: 'ds',
            existingPrefixes: {
              wsse: 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd',
              wsu: 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd',
              soap: 'http://schemas.xmlsoap.org/soap/envelope/',
            },
            inclusiveNamespacesPrefixList: 'soap soapenv urn',
          },
        };
        if (DEBUG) {
          try {
            console.log('Using WSSecurityCert (X509) for CyberSource SOAP');
          } catch (e) {
            void e;
          }
        }
        const security = new soap.WSSecurityCert(
          keyBlock || privateKey,
          certBlock || publicCert,
          passphrase || '',
          wsOpts
        );
        try {
          if (security && security.signer) {
            // Ensure wsu:Id is used on Body and inclusive namespaces are applied
            security.signer.idMode = 'wssecurity';
            security.signer.inclusiveNamespacesPrefixList = ['soap', 'soapenv', 'urn'];
            // Be explicit about algorithms expected by CyberSource SOAP (per working SoapUI sample)
            if (!security.signer.signatureAlgorithm) {
              security.signer.signatureAlgorithm = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1';
            }
            if (!security.signer.canonicalizationAlgorithm) {
              security.signer.canonicalizationAlgorithm = 'http://www.w3.org/2001/10/xml-exc-c14n#';
            }
          }
        } catch (e) {
          void e;
        }
        return security;
      }
      // If settings exist but we couldn’t build a valid pair, throw to avoid silent fallback
      throw new Error(
        'Invalid CyberSource certificate configuration: could not parse key/cert PEMs'
      );
    }
    if (DEBUG) {
      try {
        console.log('Using WSSecurity (UsernameToken) for CyberSource SOAP');
      } catch (e) {
        void e;
      }
    }
    return new soap.WSSecurity(this.merchantID, this.password, this.options);
  }

  _extractFromP12(p12Buffer, passphrase) {
    try {
      // Try to use node-forge for P12 parsing
      const forge = require('node-forge');
      const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, passphrase || '');

      // Find the private key and certificate
      let privateKey = null;
      let publicCert = null;

      // Look for private key
      for (let i = 0; i < p12.safeContents.length; i++) {
        const safeContents = p12.safeContents[i];
        for (let j = 0; j < safeContents.safeBags.length; j++) {
          const bag = safeContents.safeBags[j];
          if (bag.type === forge.pki.oids.pkcs8ShroudedKeyBag) {
            privateKey = forge.pki.privateKeyToPem(bag.key);
          } else if (bag.type === forge.pki.oids.certBag) {
            publicCert = forge.pki.certificateToPem(bag.cert);
          }
        }
      }

      if (privateKey && publicCert) {
        return {
          privateKey: Buffer.from(privateKey),
          publicCert: Buffer.from(publicCert),
        };
      }

      return null;
    } catch (error) {
      if (DEBUG) {
        console.error('Error extracting from P12:', error.message);
      }
      throw new Error(`Failed to extract certificate from P12: ${error.message}`);
    }
  }

  _getCertSettings() {
    // First check if certOptions were passed directly to constructor
    if (this.certOptions) {
      return this.certOptions;
    }

    // Fallback to environment variables
    const envPrefix = this.environment === 'production' ? 'PROD' : 'DEV';
    const certSettings = {
      privateKeyPath: process.env[`${envPrefix}_CYBERSOURCE_PRIVATE_KEY_PATH`],
      publicCertPath: process.env[`${envPrefix}_CYBERSOURCE_PUBLIC_CERT_PATH`],
      privateKeyPemBase64: process.env[`${envPrefix}_CYBERSOURCE_PRIVATE_KEY_PEM_BASE64`],
      publicCertPemBase64: process.env[`${envPrefix}_CYBERSOURCE_PUBLIC_CERT_PEM_BASE64`],
      privateKeyPEM: process.env[`${envPrefix}_CYBERSOURCE_PRIVATE_KEY_PEM`],
      publicCertPEM: process.env[`${envPrefix}_CYBERSOURCE_PUBLIC_CERT_PEM`],
      passphrase: process.env[`${envPrefix}_CYBERSOURCE_CERT_PASSPHRASE`],
      // P12 certificate support
      p12Path: process.env[`${envPrefix}_CYBERSOURCE_P12_PATH`],
      p12Base64: process.env[`${envPrefix}_CYBERSOURCE_P12_BASE64`],
      p12Passphrase: process.env[`${envPrefix}_CYBERSOURCE_P12_PASSPHRASE`],
    };

    // Check if any certificate settings are provided
    const hasCertSettings = Object.values(certSettings).some(value => value !== undefined);
    return hasCertSettings ? certSettings : null;
  }

  getMerchantID() {
    return this.merchantID;
  }

  getCurrency() {
    return this.currency;
  }
};
