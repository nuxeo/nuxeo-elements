import { storiesOf } from '@storybook/polymer';
import { text, date } from '@storybook/addon-knobs';
import { html } from 'lit-html';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-date-picker';

storiesOf('UI/nuxeo-date-picker', module).add('nuxeo-date-picker', () => {
  const dateTime = date('Date', new Date());
  const label = text('label', 'Choose a date');
  return html`
    <nuxeo-date-picker .value="${new Date(dateTime)}" label="${label}"></nuxeo-date-picker>
  `;
});
