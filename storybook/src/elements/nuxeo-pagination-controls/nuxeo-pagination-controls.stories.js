import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/nuxeo-pagination-controls.js';

export default {
  title: 'UI/nuxeo-pagination-controls',
};

export const NuxeoPagination = {
  args: {
    numberOfPages: 5,
  },
  render: (args) => html`
    <style include="nuxeo-styles">
      nuxeo-pagination-controls {
        margin: 2rem;
      }
    </style>
    <nuxeo-pagination-controls page="1" number-of-pages="${args.numberOfPages}"> </nuxeo-pagination-controls>
  `,
};
