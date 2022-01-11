import { storiesOf } from '@storybook/polymer';
import { text, select, boolean } from '@storybook/addon-knobs';
import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-card';

const ICONS = {
  attachment: 'nuxeo:attachment',
  dashboard: 'nuxeo:dashboard',
  edit: 'nuxeo:edit',
  none: '',
};

storiesOf('UI/nuxeo-card', module).add('nuxeo-card', () => {
  const heading = text('Heading', 'About Nuxeo');
  const icon = select('Icon', ICONS, ICONS.attachment);
  const collapsible = boolean('Collapsible', false);
  const opened = boolean('Opened', false);
  return html`
    <nuxeo-card heading="${heading}" icon="${icon}" ?collapsible="${collapsible}" ?opened="${opened}">
      ${text(
        'Content',
        `Nuxeo makes it easy to build smart content applications that enhance customer experiences,
        improve decision making, and accelerate products to market.`,
      )}
    </nuxeo-card>
  `;
});
