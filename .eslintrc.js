module.exports = {
    env: {
        node: true
    },
    extends: ['eslint:recommended', 'plugin:flowtype/recommended'],
    rules: {
        indent: ['error', 4],
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        semi: ['error', 'always']
    },
    globals: {
        module: true,
        process: true,
        Promise: true
    },
    parserOptions: {
        ecmaVersion: 2017,
        ecmaFeatures: {
            experimentalObjectRestSpread: true
        }
    },
    plugins: ['import', 'flowtype']
};
