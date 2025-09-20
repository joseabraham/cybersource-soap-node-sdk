const Card = require('../../../model/Card');

describe('Card Model', () => {
  const mockData = {
    accountNumber: '4111111111111111',
    expirationMonth: '12',
    expirationYear: '2025',
    cvNumber: '123',
    cardType: 'visa',
    moreParams: { additionalData: 'test' },
  };

  describe('Constructor', () => {
    test('should create Card instance with all properties', () => {
      const card = new Card(
        mockData.accountNumber,
        mockData.expirationMonth,
        mockData.expirationYear,
        mockData.cvNumber,
        mockData.cardType,
        mockData.moreParams
      );

      expect(card.accountNumber).toBe(mockData.accountNumber);
      expect(card.expirationMonth).toBe(mockData.expirationMonth);
      expect(card.expirationYear).toBe(mockData.expirationYear);
      expect(card.cvNumber).toBe(mockData.cvNumber);
      expect(card.cardType).toBe(mockData.cardType);
      expect(card.moreParams).toEqual(mockData.moreParams);
    });

    test('should handle minimal required parameters', () => {
      const card = new Card(
        mockData.accountNumber,
        mockData.expirationMonth,
        mockData.expirationYear,
        mockData.cvNumber
      );

      expect(card.accountNumber).toBe(mockData.accountNumber);
      expect(card.expirationMonth).toBe(mockData.expirationMonth);
      expect(card.expirationYear).toBe(mockData.expirationYear);
      expect(card.cvNumber).toBe(mockData.cvNumber);
      expect(card.cardType).toBeUndefined();
      expect(card.moreParams).toBeUndefined();
    });
  });

  describe('getJSON', () => {
    test('should return correct JSON representation with all fields', () => {
      const card = new Card(
        mockData.accountNumber,
        mockData.expirationMonth,
        mockData.expirationYear,
        mockData.cvNumber,
        mockData.cardType
      );

      const json = card.getJSON();

      expect(json).toEqual({
        accountNumber: mockData.accountNumber,
        expirationMonth: mockData.expirationMonth,
        expirationYear: mockData.expirationYear,
        cvNumber: mockData.cvNumber,
        cardType: mockData.cardType,
      });
    });

    test('should handle undefined optional fields', () => {
      const card = new Card(
        mockData.accountNumber,
        mockData.expirationMonth,
        mockData.expirationYear,
        mockData.cvNumber
      );

      const json = card.getJSON();

      expect(json.accountNumber).toBe(mockData.accountNumber);
      expect(json.expirationMonth).toBe(mockData.expirationMonth);
      expect(json.expirationYear).toBe(mockData.expirationYear);
      expect(json.cvNumber).toBe(mockData.cvNumber);
      expect(json.cardType).toBeUndefined();
    });
  });

  describe('Card validation scenarios', () => {
    test('should handle different card number formats', () => {
      const cardNumbers = [
        '4111111111111111', // Visa
        '5555555555554444', // MasterCard
        '378282246310005', // American Express
        '6011111111111117', // Discover
      ];

      cardNumbers.forEach(number => {
        const card = new Card(number, '12', '2025', '123');
        expect(card.accountNumber).toBe(number);
        expect(card.getJSON().accountNumber).toBe(number);
      });
    });

    test('should handle different expiration formats', () => {
      const expirations = [
        { month: '01', year: '2025' },
        { month: '12', year: '2030' },
        { month: '6', year: '25' },
      ];

      expirations.forEach(exp => {
        const card = new Card('4111111111111111', exp.month, exp.year, '123');
        expect(card.expirationMonth).toBe(exp.month);
        expect(card.expirationYear).toBe(exp.year);
      });
    });

    test('should handle different CV numbers', () => {
      const cvNumbers = ['123', '1234', '12'];

      cvNumbers.forEach(cv => {
        const card = new Card('4111111111111111', '12', '2025', cv);
        expect(card.cvNumber).toBe(cv);
        expect(card.getJSON().cvNumber).toBe(cv);
      });
    });
  });
});
