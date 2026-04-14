import { html } from 'lit';
import { analyse } from '../../../.storybook/analysis';
import { LIST } from '../../data/lists.data.js';
import '@nuxeo/nuxeo-ui-elements/nuxeo-data-list/nuxeo-data-list.js';
import '@nuxeo/nuxeo-ui-elements/nuxeo-document-thumbnail/nuxeo-document-thumbnail.js';

const docs = analyse('nuxeo-data-list').notes;

export default {
  title: 'UI/nuxeo-data-list',
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
    <nuxeo-data-list .items="${LIST(0).data}"></nuxeo-data-list>
  `,
};

export const Default = {
  args: { numberOfItems: 50 },
  render: (args) => html`
    <style>
      * {
        font-family: 'Open Sans', Arial, sans-serif;
      }
      .list-item {
        padding: 5px;
      }
    </style>
    <nuxeo-data-list .items="${LIST(args.numberOfItems).data}">
      <template>
        <div tabindex$="{{tabIndex}}" class="list-item">
          <div class="list-item-title">[[item.properties.company_name]]</div>
        </div>
      </template>
    </nuxeo-data-list>
  `,
};

export const WithThumbnail = {
  args: { numberOfItems: 50 },
  render: (args) => html`
    <style>
      * {
        font-family: 'Open Sans', Arial, sans-serif;
      }
      .list-item {
        display: flex;
        justify-content: left;
        align-items: center;
        padding: 5px;
      }
      nuxeo-document-thumbnail {
        display: block;
      }
    </style>
    <nuxeo-data-list .items="${LIST(args.numberOfItems).data}">
      <template>
        <div tabindex$="{{tabIndex}}" class="list-item">
          <nuxeo-document-thumbnail document="[[item]]"></nuxeo-document-thumbnail>
          <div class="list-item-title">[[item.properties.company_name]]</div>
        </div>
      </template>
    </nuxeo-data-list>
  `,
};
