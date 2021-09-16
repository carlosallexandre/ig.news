module.exports = {
  testPathIgnorePatterns: ['/node_modules/', '/.next'],
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.ts'
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": '<rootDir>/node_modules/babel-jest'
  },
  moduleNameMapper: {
    '\\.(scss|css|sass)$': 'identity-obj-proxy',
  },
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.tsx'],
  coveragePathIgnorePatterns: [
    'src/pages/_app.tsx',
    'src/pages/_document.tsx'
  ],
  coverageReporters: ['lcov', 'json'],
  testEnvironment: 'jsdom'
}