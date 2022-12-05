module.exports = {
  
    moduleFileExtensions: ['js'],
  
    testEnvironment: 'node',
  
    testMatch: ['**/tests/**/?(*.)+(spec).+(js)'],
  
    transformIgnorePatterns: ['<rootDir>/node_modules/(?!@assemblyscript/.*)'],
  
    transform: { '^.+\\.(js|jsx)$': 'babel-jest' },
  };