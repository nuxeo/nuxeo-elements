import { html } from 'lit-html';
import { storiesOf } from '@storybook/polymer';
import { text } from '@storybook/addon-knobs';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-input.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-textarea.js';

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
        <nuxeo-textarea label="${label}" placeholder="Placeholder"></nuxeo-textarea>
        <nuxeo-input label="${label}" placeholder="Placeholder"></nuxeo-input>
        <nuxeo-textarea label="${label}" placeholder="Placeholder"></nuxeo-textarea>
      </div>
    </div>
  `;
});
