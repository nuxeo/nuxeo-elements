import { html } from 'lit';
import { analyse } from '../../../.storybook/analysis';
import { LIST } from '../../data/lists.data.js';
import '@nuxeo/nuxeo-ui-elements/nuxeo-data-grid/nuxeo-data-grid.js';

const docs = analyse('nuxeo-data-grid').notes;

export default {
  title: 'UI/nuxeo-data-grid',
  parameters: {
    docs: { description: { component: docs } },
  },
};

export const Empty = {
  render: () => html`
    <style>
      * {
        font-family: 'Open Sans', Arial, sans-serif;
      }
    </style>
    <nuxeo-data-grid .items="${LIST(0).data}"></nuxeo-data-grid>
  `,
};

export const Default = {
  args: { numberOfItems: 50 },
  render: (args) => html`
    <style>
      * {
        font-family: 'Open Sans', Arial, sans-serif;
      }
      .item {
        display: flex;
        flex-direction: column;
        width: 300px;
        height: 300px;
        margin: 0.5rem;
        padding: 0.5rem;
      }
      .thumbnail {
        overflow: hidden;
        margin-bottom: 0.5rem;
        height: 200px;
        width: 100%;
      }
      img {
        width: 100%;
        min-height: 100%;
      }
      h3,
      p {
        margin: 0;
      }
    </style>
    <nuxeo-data-grid .items="${LIST(args.numberOfItems).data}">
      <template>
        <div class="item">
          <div class="thumbnail">
            <img src="[[item.contextParameters.thumbnail.url]]" />
          </div>
          <h3>[[item.properties.company_name]]</h3>
          <p>[[item.properties.city]]</p>
        </div>
      </template>
    </nuxeo-data-grid>
  `,
};
