const BillTo = require('../../../model/BillTo');

describe('BillTo Model', () => {
  const mockData = {
    firstName: 'John',
    lastName: 'Doe',
    street1: '123 Test Street',
    city: 'Test City',
    state: 'CA',
    postalCode: '12345',
    country: 'US',
    email: 'john.doe@test.com',
  };

  describe('Constructor', () => {
    test('should create BillTo instance with all properties', () => {
      const billTo = new BillTo(
        mockData.firstName,
        mockData.lastName,
        mockData.street1,
        mockData.city,
        mockData.state,
        mockData.postalCode,
        mockData.country,
        mockData.email
      );

      expect(billTo.firstName).toBe(mockData.firstName);
      expect(billTo.lastName).toBe(mockData.lastName);
      expect(billTo.street1).toBe(mockData.street1);
      expect(billTo.city).toBe(mockData.city);
      expect(billTo.state).toBe(mockData.state);
      expect(billTo.postalCode).toBe(mockData.postalCode);
      expect(billTo.country).toBe(mockData.country);
      expect(billTo.email).toBe(mockData.email);
    });

    test('should handle undefined/null values', () => {
      const billTo = new BillTo();

      expect(billTo.firstName).toBeUndefined();
      expect(billTo.lastName).toBeUndefined();
      expect(billTo.street1).toBeUndefined();
      expect(billTo.city).toBeUndefined();
      expect(billTo.state).toBeUndefined();
      expect(billTo.postalCode).toBeUndefined();
      expect(billTo.country).toBeUndefined();
      expect(billTo.email).toBeUndefined();
    });
  });

  describe('getJSON', () => {
    test('should return correct JSON representation', () => {
      const billTo = new BillTo(
        mockData.firstName,
        mockData.lastName,
        mockData.street1,
        mockData.city,
        mockData.state,
        mockData.postalCode,
        mockData.country,
        mockData.email
      );

      const json = billTo.getJSON();

      expect(json).toEqual({
        firstName: mockData.firstName,
        lastName: mockData.lastName,
        street1: mockData.street1,
        city: mockData.city,
        state: mockData.state,
        postalCode: mockData.postalCode,
        country: mockData.country,
        email: mockData.email,
      });
    });

    test('should handle partial data', () => {
      const billTo = new BillTo('Jane', 'Smith');
      const json = billTo.getJSON();

      expect(json.firstName).toBe('Jane');
      expect(json.lastName).toBe('Smith');
      expect(json.street1).toBeUndefined();
      expect(json.city).toBeUndefined();
    });
  });

  describe('Email validation scenarios', () => {
    test('should accept valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'firstname+lastname@example.org',
      ];

      validEmails.forEach(email => {
        const billTo = new BillTo('John', 'Doe', '123 St', 'City', 'CA', '12345', 'US', email);
        expect(billTo.email).toBe(email);
        expect(billTo.getJSON().email).toBe(email);
      });
    });
  });
});
