module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  globals: {
    wx: true,
  },
  extends: [
    'airbnb',
    'prettier',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:import/typescript',
  ],
  plugins: ['prettier', 'react-hooks', '@typescript-eslint'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': [
      2,
      {
        args: 'none',
      },
    ],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'import/no-unresolved': 0,
    'import/prefer-default-export': 0,
    'import/no-extraneous-dependencies': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    'react/jsx-filename-extension': [
      1,
      { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    ],
    'no-param-reassign': 0,
    'react/prop-types': 0, // ts 不需要prop-type
    'import/extensions': 0,
    '@typescript-eslint/interface-name-prefix': [2, { prefixWithI: 'always' }],
    'react/jsx-props-no-spreading': 0,
    'react/jsx-one-expression-per-line': 0,
    '@typescript-eslint/camelcase': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'no-restricted-globals': ['error', 'event'], // 禁用的全局变量
    'jsx-a11y/no-noninteractive-element-interactions': 0, // 非交互性的标签，允许绑定事件
    '@typescript-eslint/no-use-before-define': [
      // 允许function的提升使用
      'error',
      { functions: false, classes: true },
    ],
    'react/jsx-wrap-multilines': 0, // 多行jsx 需要用()包裹
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-underscore-dangle': 0,
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaFeatures: {
      jsx: true,
    },
  },
};
