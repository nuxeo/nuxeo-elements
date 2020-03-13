import { html } from 'lit-html';
import { storiesOf } from '@storybook/polymer';
import '@nuxeo/nuxeo-ui-elements/nuxeo-video/nuxeo-video-info';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-card';
import DocumentBuilder from '../../data/documents.data';
import videoProperties from '../../data/video.data.js';

storiesOf('UI/nuxeo-video', module).add('Nuxeo Video Info', () => {
  const document = new DocumentBuilder()
    .setType('File')
    .setProperties({ 'vid:info': videoProperties['vid:info'] })
    .build();
  return html`
    <nuxeo-card>
      <nuxeo-video-info .document="${document}"></nuxeo-video-info>
    </nuxeo-card>
  `;
});
