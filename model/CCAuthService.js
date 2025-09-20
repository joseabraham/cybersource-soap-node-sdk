/**
 * CCAuthService model for CyberSource SOAP transactions
 * Represents credit card authorization service configuration
 */
module.exports = class CCAuthService {
  constructor(run = true) {
    this.run = run;
  }

  /**
   * Get JSON representation for direct normalRequest usage
   * @returns {Object} Service configuration without XML attributes
   */
  getJSON() {
    return {
      run: this.run,
    };
  }

  /**
   * Get JSON with XML attributes for model-based requests
   * This uses the working pattern: { attributes: { run: true } }
   * @returns {Object} Service configuration with XML attributes
   */
  getJSONWithAttributes() {
    return {
      attributes: { run: this.run },
    };
  }
};
