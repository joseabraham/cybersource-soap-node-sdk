const CybersourceApi = require('../../CybersourceApi');

// Mock the RunTransaction module
jest.mock('../../api/RunTransaction', () => {
  return jest.fn();
});

const mockRunTransaction = require('../../api/RunTransaction');

describe('CybersourceApi', () => {
  let api;
  const mockConfig = {
    password: 'test-password',
    merchantID: 'test-merchant',
    environment: 'development',
    language: 'en',
    version: '1.151',
    currency: 'USD',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    api = new CybersourceApi(
      mockConfig.password,
      mockConfig.merchantID,
      mockConfig.environment,
      mockConfig.language,
      mockConfig.version,
      mockConfig.currency
    );
  });

  describe('Constructor', () => {
    test('should initialize with correct configuration', () => {
      expect(api.configuration).toBeDefined();
      expect(api.configuration.password).toBe(mockConfig.password);
      expect(api.configuration.merchantID).toBe(mockConfig.merchantID);
      expect(api.configuration.environment).toBe(mockConfig.environment);
      expect(api.configuration.language).toBe(mockConfig.language);
      expect(api.configuration.version).toBe(mockConfig.version);
      expect(api.configuration.currency).toBe(mockConfig.currency);
    });

    test('should initialize Models', () => {
      expect(api.Models).toBeDefined();
      expect(api.Models.BillTo).toBeDefined();
      expect(api.Models.Card).toBeDefined();
      expect(api.Models.PurchaseTotals).toBeDefined();
    });

    test('should initialize ErrorObject', () => {
      expect(api.ErrorObject).toBeDefined();
    });
  });

  describe('getConfiguration', () => {
    test('should return configuration object', () => {
      const config = api.getConfiguration();
      expect(config).toBe(api.configuration);
    });
  });

  describe('normalRequest', () => {
    test('should resolve with success response when reasonCode is 100', async () => {
      const mockResponse = {
        reasonCode: 100,
        data: 'test-data',
      };

      mockRunTransaction.mockResolvedValue(mockResponse);

      const request = { test: 'request' };
      const result = await api.normalRequest(request);

      expect(result).toEqual({
        message: expect.any(String),
        code: 100,
        data: mockResponse,
      });
      expect(mockRunTransaction).toHaveBeenCalledWith(
        api.configuration.url,
        request,
        api.configuration.getWsSecurity()
      );
    });

    test('should reject when reasonCode is not 100', async () => {
      const mockResponse = {
        reasonCode: 101,
        data: 'error-data',
      };

      mockRunTransaction.mockResolvedValue(mockResponse);

      const request = { test: 'request' };

      await expect(api.normalRequest(request)).rejects.toEqual({
        message: expect.any(String),
        code: 101,
        data: mockResponse,
      });
    });

    test('should handle RunTransaction errors', async () => {
      const mockError = new Error('Network error');
      mockRunTransaction.mockRejectedValue(mockError);

      const request = { test: 'request' };

      await expect(api.normalRequest(request)).rejects.toEqual({
        message: expect.any(String),
        code: 500,
        data: mockError,
      });
    });
  });

  describe('authorizeCharge', () => {
    test('should process successful authorization', async () => {
      const mockResponse = {
        reasonCode: 100,
        ccAuthReply: {
          reasonCode: 100,
        },
        requestID: 'auth-123',
      };

      mockRunTransaction.mockResolvedValue(mockResponse);

      const authRequest = new api.Models.AuthorizationRequest(
        'REF123',
        new api.Models.BillTo(
          'John',
          'Doe',
          '123 St',
          'City',
          'CA',
          '12345',
          'US',
          'john@test.com'
        ),
        new api.Models.Card('4111111111111111', '12', '2025', '123')
      );

      const result = await api.authorizeCharge(authRequest, 100);

      expect(result).toEqual({
        message: expect.any(String),
        code: 100,
        authorization: 'auth-123',
      });

      // Verify that purchaseTotals and merchantID were set
      expect(authRequest.purchaseTotals).toBeDefined();
      expect(authRequest.purchaseTotals.currency).toBe(mockConfig.currency);
      expect(authRequest.purchaseTotals.grandTotalAmount).toBe('100.00');
      expect(authRequest.merchantID).toBe(mockConfig.merchantID);
    });

    test('should handle authorization failure', async () => {
      const mockResponse = {
        reasonCode: 100,
        ccAuthReply: {
          reasonCode: 201,
        },
      };

      mockRunTransaction.mockResolvedValue(mockResponse);

      const authRequest = new api.Models.AuthorizationRequest(
        'REF123',
        new api.Models.BillTo(
          'John',
          'Doe',
          '123 St',
          'City',
          'CA',
          '12345',
          'US',
          'john@test.com'
        ),
        new api.Models.Card('4111111111111111', '12', '2025', '123')
      );

      await expect(api.authorizeCharge(authRequest, 100)).rejects.toEqual({
        message: expect.any(String),
        code: 201,
        data: mockResponse.ccAuthReply,
      });
    });
  });

  describe('chargeCard', () => {
    test('should process successful charge', async () => {
      const mockResponse = {
        reasonCode: 100,
      };

      mockRunTransaction.mockResolvedValue(mockResponse);

      const chargeRequest = new api.Models.ChargeRequest(
        'REF123',
        new api.Models.BillTo(
          'John',
          'Doe',
          '123 St',
          'City',
          'CA',
          '12345',
          'US',
          'john@test.com'
        ),
        new api.Models.Card('4111111111111111', '12', '2025', '123')
      );

      const result = await api.chargeCard(chargeRequest, 50);

      expect(result).toEqual({
        message: expect.any(String),
        code: 100,
      });

      expect(chargeRequest.purchaseTotals.grandTotalAmount).toBe('50.00');
      expect(chargeRequest.merchantID).toBe(mockConfig.merchantID);
    });
  });
});
