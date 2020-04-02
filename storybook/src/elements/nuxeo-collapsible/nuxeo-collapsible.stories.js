import { html } from 'lit-html';
import { storiesOf } from '@storybook/polymer';
import { boolean, text } from '@storybook/addon-knobs';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-collapsible';

const stories = storiesOf('UI/nuxeo-collapsible', module);

stories.add('Default', () => {
  const heading = text('Heading', 'Nuxeo');
  const animation = boolean('Animation', true);
  const opened = boolean('opened', false);

  return html`
    <style>
      :root {
        display: block;
        width: 300px;
        margin: 2rem;
      }

      .heading {
        font-weight: bold;
      }

      p {
        margin: 0;
      }
    </style>
    <nuxeo-collapsible ?animation="${animation}" ?opened="${opened}">
      <span class="heading" slot="heading">${heading}</span>
      <p>Build Smarter Solutions for Today's Content Challenges</p>
    </nuxeo-collapsible>
  `;
});
