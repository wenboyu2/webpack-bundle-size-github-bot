module.exports = {
    env: {
        es6: true,
        amd: true,
        jest: true
    },
    extends: 'eslint:recommended',
    rules: {
        indent: ['error', 4],
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        semi: ['error', 'always']
    },
    globals: {
        module: true,
        process: true
    },
    parserOptions: {
        ecmaVersion: 2017,
        ecmaFeatures: {
            experimentalObjectRestSpread: true
        }
    }
};
