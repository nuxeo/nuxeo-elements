// Polymer's boot.js defines window.JSCompiler_renameProperty which is referenced
// at class-definition time by properties-mixin.js. Vite's chunk splitting can
// evaluate the mixin before boot.js runs, so we force it first.
import '@polymer/polymer/lib/utils/boot.js';

// Ensure iron-meta custom element is registered before iron-icon (or any other
// Polymer element) tries to create an instance via Base.create at definition time.
import '@polymer/iron-meta/iron-meta.js';

// Expose Quill as a global – nuxeo-html-editor references window.Quill at runtime.
// The side-effect import alone is not enough under Vite's ESM transformation.
import Quill from '@nuxeo/quill/dist/quill.js';

window.Quill = Quill;

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
