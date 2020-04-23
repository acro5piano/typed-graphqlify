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
  coverageDirectory: './coverage/',
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/*.ts'],
  automock: false,
}
