import { html } from 'lit-html';
import { storiesOf } from '@storybook/polymer';
import { number } from '@storybook/addon-knobs';
import { analyse } from '../../../.storybook/analysis';
import { LIST } from '../../data/lists.data.js';
import '@nuxeo/nuxeo-ui-elements/nuxeo-data-list/nuxeo-data-list.js';
import '@nuxeo/nuxeo-ui-elements/nuxeo-document-thumbnail/nuxeo-document-thumbnail.js';

const docs = analyse('nuxeo-data-list').notes;
const stories = storiesOf('UI/nuxeo-data-list', module);

stories
  .add(
    'Empty',
    () =>
      html`
        <style>
          * {
            font-family: 'Open Sans', Arial, sans-serif;
          }
        </style>
        <nuxeo-data-list .items="${LIST(0).data}"></nuxeo-data-list>
      `,
    { notes: { markdown: docs } },
  )
  .add(
    'Default',
    () => {
      const numberOfItems = number('Number of items', 50);
      return html`
        <style>
          * {
            font-family: 'Open Sans', Arial, sans-serif;
          }
          .list-item {
            padding: 5px;
          }
        </style>
        <nuxeo-data-list .items="${LIST(numberOfItems).data}">
          <template>
            <div tabindex$="{{tabIndex}}" class="list-item">
              <div class="list-item-title">[[item.properties.company_name]]</div>
            </div>
          </template>
        </nuxeo-data-list>
      `;
    },
    { notes: { markdown: docs } },
  )
  .add(
    'With thumbnail',
    () => {
      const numberOfItems = number('Number of items', 50);
      return html`
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
        <nuxeo-data-list .items="${LIST(numberOfItems).data}">
          <template>
            <div tabindex$="{{tabIndex}}" class="list-item">
              <nuxeo-document-thumbnail document="[[item]]"></nuxeo-document-thumbnail>
              <div class="list-item-title">[[item.properties.company_name]]</div>
            </div>
          </template>
        </nuxeo-data-list>
      `;
    },
    { notes: { markdown: docs } },
  );
