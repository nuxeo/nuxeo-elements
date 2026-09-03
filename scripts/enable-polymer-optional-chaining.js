/**
 * Enables standard optional chaining syntax in Polymer CLI's legacy Babylon parser.
 *
 * Polymer Analyzer 3.2.4 bundles a parser that supports optional chaining but does not
 * enable its parser plugin. Preloading this module keeps Polymer lint able to analyze
 * modern JavaScript without excluding affected source files from validation.
 */
const { createRequire } = require('module');

const analyzerParser = require.resolve('polymer-cli/node_modules/polymer-analyzer/lib/javascript/javascript-parser.js');
const analyzerRequire = createRequire(analyzerParser);
const babylon = analyzerRequire('babylon');
const parse = babylon.parse;

babylon.parse = (code, options = {}) => {
  const plugins = options.plugins || [];
  const parseOptions = plugins.includes('optionalChaining')
    ? options
    : { ...options, plugins: [...plugins, 'optionalChaining'] };
  return parse(code, parseOptions);
};
