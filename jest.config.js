module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-native-community|@react-navigation|expo|@expo)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/types/**',
    '!src/constants/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.(test|spec).{ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/\\\\.cursor/',
    '<rootDir>/\\\\.vscode/',
    '/AppData/',
    '/Users/',
    '/Documents/',
    '/CloneRepo/',
  ],
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};
