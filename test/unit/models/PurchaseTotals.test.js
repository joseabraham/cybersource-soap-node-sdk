const PurchaseTotals = require('../../../model/PurchaseTotals');

describe('PurchaseTotals Model', () => {
  const mockData = {
    currency: 'USD',
    grandTotalAmount: '100.00',
  };

  describe('Constructor', () => {
    test('should create PurchaseTotals instance with all properties', () => {
      const purchaseTotals = new PurchaseTotals(mockData.currency, mockData.grandTotalAmount);

      expect(purchaseTotals.currency).toBe(mockData.currency);
      expect(purchaseTotals.grandTotalAmount).toBe(mockData.grandTotalAmount);
    });

    test('should handle undefined values', () => {
      const purchaseTotals = new PurchaseTotals();

      expect(purchaseTotals.currency).toBeUndefined();
      expect(purchaseTotals.grandTotalAmount).toBeUndefined();
    });
  });

  describe('getJSON', () => {
    test('should return correct JSON representation', () => {
      const purchaseTotals = new PurchaseTotals(mockData.currency, mockData.grandTotalAmount);

      const json = purchaseTotals.getJSON();

      expect(json).toEqual({
        currency: mockData.currency,
        grandTotalAmount: mockData.grandTotalAmount,
      });
    });

    test('should handle partial data', () => {
      const purchaseTotals = new PurchaseTotals('EUR');
      const json = purchaseTotals.getJSON();

      expect(json.currency).toBe('EUR');
      expect(json.grandTotalAmount).toBeUndefined();
    });
  });

  describe('getOnlyCurrencyJSON', () => {
    test('should return only currency in JSON format', () => {
      const purchaseTotals = new PurchaseTotals(mockData.currency, mockData.grandTotalAmount);

      const json = purchaseTotals.getOnlyCurrencyJSON();

      expect(json).toEqual({
        currency: mockData.currency,
      });
      expect(json.grandTotalAmount).toBeUndefined();
    });

    test('should work with undefined grandTotalAmount', () => {
      const purchaseTotals = new PurchaseTotals('GBP');
      const json = purchaseTotals.getOnlyCurrencyJSON();

      expect(json).toEqual({
        currency: 'GBP',
      });
    });
  });

  describe('Currency and amount validation scenarios', () => {
    test('should handle different currency codes', () => {
      const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];

      currencies.forEach(currency => {
        const purchaseTotals = new PurchaseTotals(currency, '50.00');
        expect(purchaseTotals.currency).toBe(currency);
        expect(purchaseTotals.getJSON().currency).toBe(currency);
        expect(purchaseTotals.getOnlyCurrencyJSON().currency).toBe(currency);
      });
    });

    test('should handle different amount formats', () => {
      const amounts = ['0.01', '100.00', '1234.56', '10000.00'];

      amounts.forEach(amount => {
        const purchaseTotals = new PurchaseTotals('USD', amount);
        expect(purchaseTotals.grandTotalAmount).toBe(amount);
        expect(purchaseTotals.getJSON().grandTotalAmount).toBe(amount);
      });
    });

    test('should handle string and number amounts', () => {
      const stringAmount = '99.99';
      const numberAmount = 99.99;

      const purchaseTotalsString = new PurchaseTotals('USD', stringAmount);
      const purchaseTotalsNumber = new PurchaseTotals('USD', numberAmount);

      expect(purchaseTotalsString.grandTotalAmount).toBe(stringAmount);
      expect(purchaseTotalsNumber.grandTotalAmount).toBe(numberAmount);
    });
  });
});
