const AuthorizationRequest = require('../../../model/RequestsModels/AuthorizationRequest');
const BillTo = require('../../../model/BillTo');
const Card = require('../../../model/Card');
const PurchaseTotals = require('../../../model/PurchaseTotals');
const CCAuthService = require('../../../model/CCAuthService');

describe('AuthorizationRequest Model', () => {
  let mockBillTo, mockCard, mockPurchaseTotals;

  beforeEach(() => {
    mockBillTo = new BillTo(
      'John',
      'Doe',
      '123 Test St',
      'Test City',
      'CA',
      '12345',
      'US',
      'john@test.com'
    );
    mockCard = new Card('4111111111111111', '12', '2025', '123');
    mockPurchaseTotals = new PurchaseTotals('USD', '100.00');
  });

  describe('Constructor', () => {
    test('should create AuthorizationRequest instance with required properties', () => {
      const authRequest = new AuthorizationRequest(
        'REF123',
        mockBillTo,
        mockCard,
        mockPurchaseTotals
      );

      expect(authRequest.merchantReferenceCode).toBe('REF123');
      expect(authRequest.billTo).toBe(mockBillTo);
      expect(authRequest.card).toBe(mockCard);
      expect(authRequest.purchaseTotals).toBe(mockPurchaseTotals);
      expect(authRequest.ccAuthService).toBeInstanceOf(CCAuthService);
      expect(authRequest.ccAuthService.run).toBe(true);
    });

    test('should initialize ccAuthService with correct structure', () => {
      const authRequest = new AuthorizationRequest(
        'REF123',
        mockBillTo,
        mockCard,
        mockPurchaseTotals
      );

      expect(authRequest.ccAuthService).toBeDefined();
      expect(authRequest.ccAuthService).toBeInstanceOf(CCAuthService);
      expect(authRequest.ccAuthService.getJSONWithAttributes()).toEqual({
        attributes: { run: true },
      });
    });
  });

  describe('getJSON', () => {
    test('should return correct JSON representation when all properties are set', () => {
      const authRequest = new AuthorizationRequest(
        'REF123',
        mockBillTo,
        mockCard,
        mockPurchaseTotals
      );

      const json = authRequest.getJSON('MERCHANT123');

      expect(json).toEqual({
        merchantID: 'MERCHANT123',
        merchantReferenceCode: 'REF123',
        billTo: mockBillTo.getJSON(),
        purchaseTotals: mockPurchaseTotals.getJSON(),
        card: mockCard.getJSON(),
        ccAuthService: authRequest.ccAuthService.getJSON(),
      });
    });

    test('should handle case when merchantID is not set', () => {
      const authRequest = new AuthorizationRequest(
        'REF123',
        mockBillTo,
        mockCard,
        mockPurchaseTotals
      );

      const json = authRequest.getJSON();

      expect(json.merchantID).toBeUndefined();
      expect(json.merchantReferenceCode).toBe('REF123');
    });

    test('should call getJSON methods on nested objects', () => {
      const authRequest = new AuthorizationRequest(
        'REF123',
        mockBillTo,
        mockCard,
        mockPurchaseTotals
      );

      // Spy on the getJSON methods
      const billToSpy = jest.spyOn(mockBillTo, 'getJSON');
      const cardSpy = jest.spyOn(mockCard, 'getJSON');
      const purchaseTotalsSpy = jest.spyOn(mockPurchaseTotals, 'getJSON');
      const ccAuthServiceSpy = jest.spyOn(authRequest.ccAuthService, 'getJSON');

      authRequest.getJSON('MERCHANT123');

      expect(billToSpy).toHaveBeenCalled();
      expect(cardSpy).toHaveBeenCalled();
      expect(purchaseTotalsSpy).toHaveBeenCalled();
      expect(ccAuthServiceSpy).toHaveBeenCalled();
    });
  });

  describe('Integration with other models', () => {
    test('should work correctly with valid BillTo and Card objects', () => {
      const authRequest = new AuthorizationRequest(
        'TEST_REF',
        mockBillTo,
        mockCard,
        mockPurchaseTotals
      );

      const json = authRequest.getJSON('TEST_MERCHANT');

      expect(json.billTo.firstName).toBe('John');
      expect(json.billTo.lastName).toBe('Doe');
      expect(json.card.accountNumber).toBe('4111111111111111');
      expect(json.purchaseTotals.currency).toBe('USD');
      expect(json.purchaseTotals.grandTotalAmount).toBe('100.00');
    });
  });
});
