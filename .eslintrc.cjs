module.exports = {
    env: {
        es2021: true,
        node: true
    },
    extends: 'eslint:recommended',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    // add your custom rules here
    rules: {
        indent: ['error', 4, {
            ignoredNodes: ['TemplateLiteral'],
            SwitchCase: 1
        }],
        quotes: ['error', 'single'],
        semi: ['error', 'never'],
        'comma-dangle': ['error', 'never'],
        'linebreak-style': ['error', 'windows'],
        'template-curly-spacing': 'off',
        'max-len': ['off', { code: 120 }],
        'no-console': 'off',
        'arrow-parens': ['error', 'always'],
        'space-before-function-paren': ['error', 'never'],
        curly: ['error', 'multi-line'],
        'import/no-extraneous-dependencies': 'off',
        'require-await': 0,

        'global-require': 0,
        'import/no-unresolved': 0,
        'import/newline-after-import': 0,
        'no-underscore-dangle': 0
    }
}
