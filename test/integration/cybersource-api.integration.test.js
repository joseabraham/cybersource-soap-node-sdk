const CybersourceApi = require('../../CybersourceApi');

// Mock the RunTransaction module at the module level
jest.mock('../../api/RunTransaction', () => {
  return jest.fn();
});

const mockRunTransaction = require('../../api/RunTransaction');

describe('CybersourceApi Integration Tests', () => {
  let api;

  beforeEach(() => {
    jest.clearAllMocks();
    api = new CybersourceApi('test-password', 'test-merchant', 'development', 'en', '1.151', 'USD');
  });

  describe('Full Transaction Flow', () => {
    test('should complete authorize and capture flow', async () => {
      // Mock successful authorization response
      const mockAuthResponse = {
        reasonCode: 100,
        requestID: 'AUTH-12345-TEST',
        ccAuthReply: {
          reasonCode: 100,
          authorizationCode: 'AUTH123456',
        },
      };

      // Mock successful capture response
      const mockCaptureResponse = {
        reasonCode: 100,
        requestID: 'CAPTURE-12345-TEST',
        ccCaptureReply: {
          reasonCode: 100,
        },
      };

      // Set up the mock to return different responses for each call
      mockRunTransaction
        .mockResolvedValueOnce(mockAuthResponse) // First call: authorization
        .mockResolvedValueOnce(mockCaptureResponse); // Second call: capture

      // Create test data
      const billTo = new api.Models.BillTo(
        'John',
        'Doe',
        '123 Test Street',
        'Test City',
        'CA',
        '12345',
        'US',
        'john.doe@test.com'
      );

      const card = new api.Models.Card('4111111111111111', '12', '2025', '123');

      const authRequest = new api.Models.AuthorizationRequest('TEST-REF-001', billTo, card);

      // Execute authorization
      const authResult = await api.authorizeCharge(authRequest, 100.0);

      expect(authResult.code).toBe(100);
      expect(authResult.authorization).toBe('AUTH-12345-TEST');
      expect(authResult.message).toBeDefined();

      // Verify authorization was called with correct parameters
      expect(mockRunTransaction).toHaveBeenCalledWith(
        expect.stringContaining('ics2wstesta.ic3.com'),
        expect.objectContaining({
          merchantReferenceCode: 'TEST-REF-001',
          merchantID: 'test-merchant',
          purchaseTotals: expect.objectContaining({
            currency: 'USD',
            grandTotalAmount: '100.00',
          }),
        }),
        expect.any(Object) // WSSecurity object
      );

      // Execute capture
      const captureRequest = new api.Models.CaptureRequest(
        'TEST-REF-001',
        authResult.authorization
      );

      const captureResult = await api.captureCharge(captureRequest, 100.0);

      expect(captureResult.code).toBe(100);
      expect(captureResult.message).toBeDefined();

      // Verify capture was called
      expect(mockRunTransaction).toHaveBeenCalledTimes(2);
    });

    test('should handle declined transactions', async () => {
      const mockDeclinedResponse = {
        reasonCode: 202, // Top-level decline for chargeCard
        requestID: 'DECLINED-12345-TEST',
      };

      mockRunTransaction.mockResolvedValue(mockDeclinedResponse);

      const billTo = new api.Models.BillTo(
        'John',
        'Doe',
        '123 Test Street',
        'Test City',
        'CA',
        '12345',
        'US',
        'john.doe@test.com'
      );

      const card = new api.Models.Card(
        '4000000000000002', // Test card number that triggers decline
        '12',
        '2025',
        '123'
      );

      const chargeRequest = new api.Models.ChargeRequest('TEST-REF-002', billTo, card);

      await expect(api.chargeCard(chargeRequest, 100.0)).rejects.toMatchObject({
        code: 202,
        message: expect.any(String),
      });
    });

    test('should handle subscription flow', async () => {
      // Mock subscription creation response
      const mockSubscriptionResponse = {
        reasonCode: 100,
        requestID: 'SUB-TOKEN-12345',
        paySubscriptionCreateReply: {
          reasonCode: 100,
          subscriptionID: 'SUBSCRIPTION_TOKEN_123',
        },
      };

      // Mock subscription charge response
      const mockChargeSubResponse = {
        reasonCode: 100,
        requestID: 'CHARGE-SUB-12345',
        ccAuthReply: {
          reasonCode: 100,
        },
        ccCaptureReply: {
          reasonCode: 100,
        },
      };

      mockRunTransaction
        .mockResolvedValueOnce(mockSubscriptionResponse)
        .mockResolvedValueOnce(mockChargeSubResponse);

      const billTo = new api.Models.BillTo(
        'Jane',
        'Smith',
        '456 Another St',
        'Another City',
        'NY',
        '54321',
        'US',
        'jane.smith@test.com'
      );

      const card = new api.Models.Card('5555555555554444', '01', '2026', '456');

      const subscriptionRequest = new api.Models.SubscriptionRequest(
        'SUB-REF-001',
        billTo,
        card,
        25.0, // amount
        6, // numberOfPayments
        '20251030', // startDate (YYYYMMDD) - October 30, 2025
        '001', // cardType (Visa)
        false, // automaticRenew
        'monthly' // frequency
      );

      const subscriptionResult = await api.subscribeCard(subscriptionRequest);

      expect(subscriptionResult.code).toBe(100);
      expect(subscriptionResult.token).toBe('SUB-TOKEN-12345');

      // Test charging the subscribed card
      const chargeSubRequest = new api.Models.ChargeSubscriptionRequest(
        'CHARGE-SUB-001',
        subscriptionResult.token
      );

      const chargeResult = await api.chargeSubscribedCard(chargeSubRequest, 50.0);
      expect(chargeResult.code).toBe(100);

      expect(mockRunTransaction).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      const networkError = new Error('Network timeout');
      mockRunTransaction.mockRejectedValue(networkError);

      const billTo = new api.Models.BillTo(
        'John',
        'Doe',
        '123 St',
        'City',
        'CA',
        '12345',
        'US',
        'john@test.com'
      );
      const card = new api.Models.Card('4111111111111111', '12', '2025', '123');
      const chargeRequest = new api.Models.ChargeRequest('REF-001', billTo, card);

      await expect(api.chargeCard(chargeRequest, 100.0)).rejects.toMatchObject({
        code: 500,
        message: expect.any(String),
        data: networkError,
      });
    });

    test('should handle invalid merchant credentials', async () => {
      const mockInvalidCredsResponse = {
        reasonCode: 102, // Invalid merchant ID or password
      };

      mockRunTransaction.mockResolvedValue(mockInvalidCredsResponse);

      const billTo = new api.Models.BillTo(
        'John',
        'Doe',
        '123 St',
        'City',
        'CA',
        '12345',
        'US',
        'john@test.com'
      );
      const card = new api.Models.Card('4111111111111111', '12', '2025', '123');
      const chargeRequest = new api.Models.ChargeRequest('REF-001', billTo, card);

      await expect(api.chargeCard(chargeRequest, 100.0)).rejects.toMatchObject({
        code: 102,
        message: expect.any(String),
      });
    });

    test('should handle malformed responses', async () => {
      const malformedResponse = {
        // Missing reasonCode - this will be treated as "not 100" and rejected
        requestID: 'MALFORMED-123',
      };

      mockRunTransaction.mockResolvedValue(malformedResponse);

      const billTo = new api.Models.BillTo(
        'John',
        'Doe',
        '123 St',
        'City',
        'CA',
        '12345',
        'US',
        'john@test.com'
      );
      const card = new api.Models.Card('4111111111111111', '12', '2025', '123');
      const chargeRequest = new api.Models.ChargeRequest('REF-001', billTo, card);

      await expect(api.chargeCard(chargeRequest, 100.0)).rejects.toMatchObject({
        code: undefined, // reasonCode is undefined in malformed response
        message: undefined, // ErrorObject.getMessage(undefined) returns undefined
        data: malformedResponse,
      });
    });
  });

  describe('Configuration Integration', () => {
    test('should use correct URLs for different environments', () => {
      const devApi = new CybersourceApi('pass', 'merchant', 'development', 'en', '1.151', 'USD');
      const prodApi = new CybersourceApi('pass', 'merchant', 'production', 'en', '1.151', 'USD');

      expect(devApi.getConfiguration().url).toContain('ics2wstesta.ic3.com');
      expect(prodApi.getConfiguration().url).toContain('ics2wsa.ic3.com');
    });

    test('should initialize with correct currency and language settings', () => {
      const config = api.getConfiguration();

      expect(config.currency).toBe('USD');
      expect(config.language).toBe('en');
      expect(config.merchantID).toBe('test-merchant');
      expect(config.environment).toBe('development');
    });
  });

  describe('Request Structure Validation', () => {
    test('should build correct authorization request structure', async () => {
      const mockResponse = {
        reasonCode: 100,
        requestID: 'TEST-123',
        ccAuthReply: { reasonCode: 100 },
      };

      mockRunTransaction.mockResolvedValue(mockResponse);

      const billTo = new api.Models.BillTo(
        'John',
        'Doe',
        '123 St',
        'City',
        'CA',
        '12345',
        'US',
        'john@test.com'
      );
      const card = new api.Models.Card('4111111111111111', '12', '2025', '123');
      const authRequest = new api.Models.AuthorizationRequest('REF-123', billTo, card);

      await api.authorizeCharge(authRequest, 150.75);

      // Verify the request structure passed to RunTransaction
      const callArgs = mockRunTransaction.mock.calls[0];
      const requestObject = callArgs[1];

      expect(requestObject).toMatchObject({
        merchantID: 'test-merchant',
        merchantReferenceCode: 'REF-123',
        purchaseTotals: {
          currency: 'USD',
          grandTotalAmount: '150.75',
        },
        billTo: {
          firstName: 'John',
          lastName: 'Doe',
          street1: '123 St',
          city: 'City',
          state: 'CA',
          postalCode: '12345',
          country: 'US',
          email: 'john@test.com',
        },
        card: {
          accountNumber: '4111111111111111',
          expirationMonth: '12',
          expirationYear: '2025',
          cvNumber: '123',
        },
        ccAuthService: {
          attributes: { run: true },
        },
      });
    });

    test('should build correct charge request structure', async () => {
      const mockResponse = {
        reasonCode: 100,
        requestID: 'CHARGE-123',
      };

      mockRunTransaction.mockResolvedValue(mockResponse);

      const billTo = new api.Models.BillTo(
        'Jane',
        'Smith',
        '456 Ave',
        'Town',
        'NY',
        '54321',
        'US',
        'jane@test.com'
      );
      const card = new api.Models.Card('5555555555554444', '01', '2026', '456');
      const chargeRequest = new api.Models.ChargeRequest('CHARGE-REF-123', billTo, card);

      await api.chargeCard(chargeRequest, 99.99);

      const callArgs = mockRunTransaction.mock.calls[0];
      const requestObject = callArgs[1];

      expect(requestObject.ccAuthService).toEqual({ attributes: { run: true } });
      expect(requestObject.ccCaptureService).toEqual({ attributes: { run: true } });
      expect(requestObject.purchaseTotals.grandTotalAmount).toBe('99.99');
    });
  });
});
