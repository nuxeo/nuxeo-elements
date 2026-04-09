import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/nuxeo-video/nuxeo-video-info';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-card';
import DocumentBuilder from '../../data/documents.data';
import videoProperties from '../../data/video.data.js';

export default {
  title: 'UI/nuxeo-video',
};

export const NuxeoVideoInfo = {
  render: () => {
    const document = new DocumentBuilder()
      .setType('File')
      .setProperties({ 'vid:info': videoProperties['vid:info'] })
      .build();
    return html`
      <nuxeo-card>
        <nuxeo-video-info .document="${document}"></nuxeo-video-info>
      </nuxeo-card>
    `;
  },
};
