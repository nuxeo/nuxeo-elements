import { storiesOf } from '@storybook/polymer';
import { html } from 'lit-html';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-html-editor';

storiesOf('UI/nuxeo-html-editor', module).addElement(
  'nuxeo-html-editor',
  () => html`
    <nuxeo-html-editor></nuxeo-html-editor>
  `,
);
