import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/nuxeo-video/nuxeo-video-conversions';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-card';
import DocumentBuilder from '../../data/documents.data';
import videoProperties from '../../data/video.data.js';

export default {
  title: 'UI/nuxeo-video',
};

export const NuxeoVideoConverter = {
  args: { label: 'Video Conversion' },
  render: (args) => {
    const document = new DocumentBuilder()
      .setType('File')
      .setProperties({ 'vid:transcodedVideos': videoProperties['vid:transcodedVideos'] })
      .build();
    return html`
      <nuxeo-card>
        <nuxeo-video-conversions .document="${document}" label="${args.label}"> </nuxeo-video-conversions>
      </nuxeo-card>
    `;
  },
};
