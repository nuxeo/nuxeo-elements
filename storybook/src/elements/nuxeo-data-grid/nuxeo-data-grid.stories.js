import { html } from 'lit';
import { storiesOf } from '@storybook/polymer';
import { number } from '@storybook/addon-knobs';
import { analyse } from '../../../.storybook/analysis';
import { LIST } from '../../data/lists.data.js';
import '@nuxeo/nuxeo-ui-elements/nuxeo-data-grid/nuxeo-data-grid.js';

const docs = analyse('nuxeo-data-grid').notes;

const stories = storiesOf('UI/nuxeo-data-grid', module);

stories
  .add(
    'Empty',
    () => html`
      <style>
        * {
          font-family: 'Open Sans', Arial, sans-serif;
        }
      </style>
      <nuxeo-data-grid .items="${LIST(0).data}"></nuxeo-data-grid>
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
        <nuxeo-data-grid .items="${LIST(numberOfItems).data}">
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
      `;
    },
    { notes: { markdown: docs } },
  );
