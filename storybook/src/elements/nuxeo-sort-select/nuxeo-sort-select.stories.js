import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-sort-select.js';

const options = [
  { field: 'dc:title', label: 'Title', order: 'asc' },
  { field: 'dc:created', label: 'Created', order: 'asc' },
  { field: 'dc:modified', label: 'Modified', order: 'desc' },
  { field: 'dc:lastContributor', label: 'Last contributor', order: 'asc' },
];

export default {
  title: 'UI/nuxeo-sort-select',
};

export const Default = {
  render: () => html`
    <style>
      .container {
        margin: 2rem;
      }
    </style>
    <div class="container">
      <nuxeo-sort-select .options="${options}"></nuxeo-sort-select>
    </div>
  `,
};
