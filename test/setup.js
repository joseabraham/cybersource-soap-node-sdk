// Jest test setup file
// Global test configurations and utilities

// Set test environment variables
process.env.NODE_ENV = 'test';

// Global test utilities
global.testUtils = {
  createMockConfiguration: () => ({
    password: 'test-password',
    merchantID: 'test-merchant',
    environment: 'development',
    language: 'en',
    version: '1.151',
    currency: 'USD',
  }),

  createMockBillTo: () => ({
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Test St',
    city: 'Test City',
    state: 'CA',
    postalCode: '12345',
    country: 'US',
    email: 'john.doe@test.com',
  }),

  createMockCard: () => ({
    accountNumber: '4111111111111111',
    expirationMonth: '12',
    expirationYear: '2025',
    cvNumber: '123',
  }),
};

// Mock console methods in tests to reduce noise
global.originalConsole = { ...console };
beforeEach(() => {
  jest.clearAllMocks();
});
