import { fakeServer } from '@nuxeo/testing-helpers';
import './nuxeo-demo-theme.js';
import './i18n.js';
import './routing.js';

// Create mock server so story modules can register handlers at import time
window.nuxeo.mock = fakeServer.create();

const preview = {
  parameters: {
    backgrounds: {
      values: [
        { name: 'Default', value: '#f5f5f5' },
        { name: 'Dark', value: '#060826' },
        { name: 'Kawai', value: '#f8d3e0' },
        { name: 'Light', value: '#f7f7f7' },
      ],
    },
  },
};

export default preview;
