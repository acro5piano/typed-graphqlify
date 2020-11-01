module.exports = {
  testRegex: '.*\\.test\\.tsx?$',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
      },
    },
  },
  moduleFileExtensions: ['ts', 'js'],
  collectCoverage: false,
  collectCoverageFrom: ['<rootDir>/src/*.ts'],
  coverageDirectory: './coverage/',
  automock: false,
}
