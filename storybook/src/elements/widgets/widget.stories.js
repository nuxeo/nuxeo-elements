import { html } from 'lit-html';
import { storiesOf } from '@storybook/polymer';
import { boolean, number, text } from '@storybook/addon-knobs';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-selectivity.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-input';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-textarea';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-date-picker';

const data = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8', 'item9', 'item10'];
storiesOf('Widgets', module).add('Vertical Alignment Consistency', () => {
  const label = text('Label', 'Label');
  const placeholder = text('Placeholder', 'Placeholder');
  const required = boolean('Required', false);
  const disabled = boolean('Disabled', false);
  const invalid = boolean('Invalid', false);
  const readonly = boolean('Read only', false);
  const minChars = number('minChars', 0);
  return html`
    <style>
      .container {
        margin: 2rem;
      }
      .row {
        display: flex;
        justify-content: space-between;
      }
      .row > * {
        width: 32%;
      }
    </style>
    <div class="container">
      <div class="row">
        <nuxeo-selectivity
          .data="${data}"
          label="${label}"
          placeholder="${placeholder}"
          ?required="${required}"
          ?disabled="${disabled}"
          ?invalid="${invalid}"
          ?readonly="${readonly}"
          min-chars="${minChars}"
        >
        </nuxeo-selectivity>
        <nuxeo-input label="${label}" placeholder="Placeholder"></nuxeo-input>
        <nuxeo-textarea label="${label}" placeholder="Placeholder"></nuxeo-textarea>
      </div>
      <div class="row">
        <nuxeo-selectivity
          .data="${data}"
          label="${label}"
          placeholder="${placeholder}"
          ?required="${required}"
          ?disabled="${disabled}"
          ?invalid="${invalid}"
          ?readonly="${readonly}"
          min-chars="${minChars}"
          multiple
        >
        </nuxeo-selectivity>
        <nuxeo-date-picker label="${label}" placeholder="Placeholder"></nuxeo-date-picker>
        <nuxeo-textarea label="${label}" placeholder="Placeholder"></nuxeo-textarea>
      </div>
      <div class="row">
        <nuxeo-selectivity
          .data="${data}"
          label="${label}"
          placeholder="${placeholder}"
          ?required="${required}"
          ?disabled="${disabled}"
          ?invalid="${invalid}"
          ?readonly="${readonly}"
          min-chars="${minChars}"
        >
        </nuxeo-selectivity>
        <nuxeo-selectivity
          .data="${data}"
          label="${label}"
          placeholder="${placeholder}"
          ?required="${required}"
          ?disabled="${disabled}"
          ?invalid="${invalid}"
          ?readonly="${readonly}"
          min-chars="${minChars}"
          multiple
        >
        </nuxeo-selectivity>
        <nuxeo-textarea label="${label}" placeholder="Placeholder"></nuxeo-textarea>
      </div>
    </div>
  `;
});
