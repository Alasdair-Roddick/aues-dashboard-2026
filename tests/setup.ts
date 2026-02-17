// Test setup file
// This file is run before each test file

// Mock environment variables for testing
// Using @ts-expect-error because NODE_ENV is read-only in type definitions
// but can be set in Node.js environment
// @ts-expect-error - Setting NODE_ENV for test environment
process.env.NODE_ENV = 'test';
