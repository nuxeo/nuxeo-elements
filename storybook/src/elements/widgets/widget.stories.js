import { html } from 'lit-html';
import { storiesOf } from '@storybook/polymer';
import { text } from '@storybook/addon-knobs';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-input.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-textarea.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-date-picker.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-selectivity.js';
import { cities as CITIES } from '../../data/lists.data';

storiesOf('Widgets', module).add('Vertical Alignment Consistency', () => {
  const label = text('Label', 'Label');
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
        <nuxeo-input label="${label}" placeholder="Placeholder"></nuxeo-input>
        <nuxeo-date-picker label="${label}" placeholder="Placeholder"></nuxeo-date-picker>
        <nuxeo-textarea label="${label}" placeholder="Placeholder"></nuxeo-textarea>
      </div>
      <div class="row">
        <nuxeo-selectivity .data="${CITIES}" label="${label}" placeholder="Placeholder" min-chars="0">
        </nuxeo-selectivity>
        <nuxeo-selectivity .data="${CITIES}" label="${label}" placeholder="Placeholder" min-chars="0" multiple>
        </nuxeo-selectivity>
        <nuxeo-input label="${label}" placeholder="Placeholder"></nuxeo-input>
      </div>
    </div>
  `;
});
