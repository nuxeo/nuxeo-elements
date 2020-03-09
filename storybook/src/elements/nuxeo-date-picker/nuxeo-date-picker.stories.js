import { storiesOf } from '@storybook/polymer';
import { html } from 'lit-html';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-date-picker';

storiesOf('UI/nuxeo-date-picker', module).addElement('nuxeo-date-picker', ({ knobs }) => {
  const { value } = knobs();
  return html`
    <nuxeo-date-picker .value="${value}"></nuxeo-date-picker>
  `;
});
