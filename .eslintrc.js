module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true,
    'node': true
  },
  'extends': ['eslint:recommended', 'plugin:inferno/recommended'],
  'parserOptions': {
    'ecmaFeatures': {
      'experimentalObjectRestSpread': true,
      'jsx': true
    },
    'sourceType': 'module'
  },
  'plugins': [
    /*'inferno'*/
    'react'
  ],
  'rules': {
    'no-console': [
      'off'
    ],
    'indent': [
      'error',
      2,
      {
        'SwitchCase': 1,
        'MemberExpression': 1 //this determines what indent level should happen chained function calls 
        //promise
        //  .then
        //  .then
      }
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'never'
    ],
    'no-unused-vars': [
      'error', {
        'vars': 'all',
        'args': 'none',
        'caughtErrors': 'none'
      }
    ]
  }
}
