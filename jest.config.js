module.exports = {
  verbose: false,
  silent: true,
  forceExit: true,
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
      isolatedModules: true,
    },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '/.+test/.+.(test|spec).(ts|js)',
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
};
