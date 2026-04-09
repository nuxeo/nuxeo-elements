import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-html-editor';

export default {
  title: 'UI/nuxeo-html-editor',
};

export const NuxeoHtmlEditor = {
  render: () => html`
    <style>
      .htmlEditor {
        margin: 20px;
        border: 1px solid #eee;
      }
    </style>
    <div class="htmlEditor">
      <nuxeo-html-editor> </nuxeo-html-editor>
    </div>
  `,
};
