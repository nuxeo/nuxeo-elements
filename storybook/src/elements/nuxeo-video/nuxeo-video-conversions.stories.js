import { html } from 'lit';
import { storiesOf } from '@storybook/polymer';
import { text } from '@storybook/addon-knobs';
import '@nuxeo/nuxeo-ui-elements/nuxeo-video/nuxeo-video-conversions';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-card';
import DocumentBuilder from '../../data/documents.data';
import videoProperties from '../../data/video.data.js';

storiesOf('UI/nuxeo-video', module).add('Nuxeo Video Converter', () => {
  const document = new DocumentBuilder()
    .setType('File')
    .setProperties({ 'vid:transcodedVideos': videoProperties['vid:transcodedVideos'] })
    .build();
  const label = text('Label', 'Video Conversion');
  return html`
    <nuxeo-card>
      <nuxeo-video-conversions .document="${document}" label="${label}"> </nuxeo-video-conversions>
    </nuxeo-card>
  `;
});
