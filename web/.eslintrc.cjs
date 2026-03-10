module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2022,
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
  },
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/eslint-config-typescript/recommended',
    'eslint:recommended',
  ],
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    // Relax strict TypeScript checks for this migration pass
    '@typescript-eslint/no-explicit-any': 'off',
    // Disable unused-vars checks during this mass-refactor pass
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    // Allow single-word component names in this project
    'vue/multi-word-component-names': 'off',
    // Allow some empty blocks and patterns during iterative refactors
    'no-empty': 'off',
    'no-empty-pattern': 'off',
    // Ignore irregular whitespace errors from copy-pasted files
    'no-irregular-whitespace': 'off',
    // Allow use of Function in some typed tests/helpers
    '@typescript-eslint/ban-types': 'off',
    // Re-enable rules to surface correctness issues for fix-up
    'no-undef': 'error',
    'no-useless-catch': 'error',
    'vue/require-v-for-key': 'error',
  },
};
