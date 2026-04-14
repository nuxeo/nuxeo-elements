export default [
  {
    files: ['ui/**/*.js'],
    languageOptions: {
      globals: {
        d3: 'readonly',
        Quill: 'readonly',
        Selectivity: 'readonly',
        saulis: 'readonly',
      },
    },
  },
];