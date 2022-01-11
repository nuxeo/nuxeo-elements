import { html } from 'lit';
import { storiesOf } from '@storybook/polymer';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-date';
import { select, date } from '@storybook/addon-knobs';

storiesOf('UI/nuxeo-date', module).add('Nuxeo Date', () => {
  const dateTime = date('Date', new Date());
  const relativeFormat = select('Format', ['MMM D, YYYY', 'MMMM D, YYYY HH:mm', 'relative'], 'MMM D, YYYY');
  const tooltipFormat = select('Tooltip Format', ['MMMM D, YYYY HH:mm', 'relative'], 'MMMM D, YYYY HH:mm');
  return html`
    <nuxeo-date datetime=${new Date(dateTime)} format="${relativeFormat}" tooltip-format="${tooltipFormat}" />
  `;
});
