import { storiesOf } from '@storybook/polymer';
import { html } from 'lit-html';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-html-editor';

storiesOf('UI/nuxeo-html-editor', module).add(
  'nuxeo-html-editor',
  () => html`
    <style>
      .htmlEditor {
        margin: 20px;
        border: 1px solid #eee;
      }
    </style>
    <div class="htmlEditor">
      <nuxeo-html-editor></nuxeo-html-editor>
    </div>
  `,
);
