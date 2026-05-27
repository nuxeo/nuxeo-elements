/**
 @license
 ©2023 Hyland Software, Inc. and its affiliates. All rights reserved. 
All Hyland product names are registered or unregistered trademarks of Hyland Software, Inc. or its affiliates.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import { fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-document-preview.js';
import '../nuxeo-video/nuxeo-video-conversions.js';
import '../nuxeo-video/nuxeo-video-info.js';

suite('nuxeo-document-preview', () => {
  let element;

  setup(async () => {
    element = await fixture(
      html`
        <nuxeo-document-preview></nuxeo-document-preview>
      `,
    );
  });

  suite('Update blob data', () => {
    test('Should update blob data with clientReason parameter as view', () => {
      element.document = {
        properties: {
          'file:content': {
            appLinks: [],
            data: 'file1.jpeg?changeToken=13-0',
            digest: '2e7d1a1ba7018c048bebdf1d07481ee3',
            digestAlgorithm: 'MD5',
            encoding: null,
            length: '5763',
            'mime-type': 'image/jpeg',
            name: 'kitten1 (4).jpeg',
            viewUrl: 'file1.jpeg?changeToken=13-0&clientReason=view',
          },
        },
        schemas: [
          {
            name: 'image',
          },
        ],
      };
      element.xpath = 'file:content';
      expect(element._blob.viewUrl).to.equal('file1.jpeg?changeToken=13-0&clientReason=view');
    });

    test('Should compute image source when title = FullHD', () => {
      element.document = {
        properties: {
          'file:content': {
            appLinks: [],
            data: 'file1.jpeg?changeToken=13-0',
            digest: '2e7d1a1ba7018c048bebdf1d07481ee3',
            digestAlgorithm: 'MD5',
            encoding: null,
            length: '5763',
            'mime-type': 'image/jpeg',
            name: 'kitten1 (4).jpeg',
          },
          'picture:views': [
            {
              content: {
                data: 'file1.jpeg?changeToken=13-0',
                viewUrl: 'file1.jpeg?changeToken=13-0&clientReason=view',
              },
              description: 'file 1',
              thumbnail: 'thumbnail_file_1',
              height: 500,
              width: 500,
              info: {
                width: 66,
                height: 66,
                format: 'jpeg',
              },
              title: 'FullHD',
              tag: null,
            },
          ],
        },
        schemas: [
          {
            name: 'image',
          },
        ],
      };
      element.xpath = 'file:content';
      expect(element._computeImageSource()).to.equal('file1.jpeg?changeToken=13-0&clientReason=view');
    });

    test('Should compute video source if there are  transcoded video', () => {
      element.document = {
        properties: {
          'file:content': {
            appLinks: [],
            data: 'file1.jpeg?changeToken=13-0',
            digest: '2e7d1a1ba7018c048bebdf1d07481ee3',
            digestAlgorithm: 'MD5',
            encoding: null,
            length: '5763',
            'mime-type': 'image/jpeg',
            name: 'kitten1 (4).jpeg',
          },
          'vid:transcodedVideos': [
            {
              content: {
                data: 'vid1.mp4?changeToken=9-0',
                'mime-type': 'video/mp4',
                viewUrl: 'vid1.mp4?changeToken=9-0&clientReason=view',
              },
              info: {
                width: 66,
                height: 66,
                format: 'jpeg',
              },
              name: 'vid1.mp4',
            },
          ],
        },
        schemas: [
          {
            name: 'video',
          },
        ],
      };
      element.xpath = 'file:content';
      element._blob.data = 'vid1.mp4?changeToken=9-0';
      expect(element._computeVideoSources()).to.eql([
        {
          viewUrl: 'vid1.mp4?changeToken=9-0&clientReason=view',
          type: 'video/mp4',
          data: 'vid1.mp4?changeToken=9-0',
        },
      ]);
    });

    test('Should compute audio source if there are  audio files', () => {
      element.document = {
        properties: {
          'file:content': {
            appLinks: [],
            data: 'file_example_MP3_700KB.mp3?changeToken=1-0',
            digest: '2e7d1a1ba7018c048bebdf1d07481ee3',
            digestAlgorithm: 'MD5',
            encoding: null,
            length: '5763',
            'mime-type': 'audio/mpeg',
            name: 'file_example_MP3_700KB.mp3',
            viewUrl: 'file_example_MP3_700KB.mp3?changeToken=1-0&clientReason=view',
          },
        },
        schemas: [
          {
            name: 'audio',
          },
        ],
      };
      element.xpath = 'file:content';
      element._blob.data = 'file_example_MP3_700KB.mp3?changeToken=1-0';
      expect(element._computeAudioSource()).to.eql('file_example_MP3_700KB.mp3?changeToken=1-0&clientReason=view');
    });

    test('Should compute rendition if there are renditions available', () => {
      element.document = {
        properties: {
          'file:content': {
            appLinks: [],
            data: 'abc.docx?changeToken=1-0',
            digest: '2e7d1a1ba7018c048bebdf1d07481ee3',
            digestAlgorithm: 'MD5',
            encoding: null,
            length: '5763',
            'mime-type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            name: 'file_example_MP3_700KB.mp3',
            viewUrl: 'abc.docx?changeToken=1-0&clientReason=view',
            downloadUrl: 'abc.docx?changeToken=1-0&clientReason=download',
          },
        },
        schemas: [
          {
            name: 'file',
          },
        ],
        contextParameters: {
          renditions: [
            {
              downloadUrl: 'd287f/@rendition/pdf?clientReason=download',
              viewUrl: 'd287f/@rendition/pdf?clientReason=view',
              url: 'd287f/@rendition/pdf',
              icon: 'pdf.png',
              name: 'pdf',
              kind: null,
            },
          ],
        },
      };
      element.xpath = 'file:content';
      expect(element._computeRendition(element.document, element.xpath, 'pdf')).to.eql(
        'd287f/@rendition/pdf?clientReason=view',
      );
    });

    test('Should compute object source if preview is available', () => {
      element.document = {
        properties: {
          'file:content': {
            appLinks: [],
            data: 'nos-gitty-mp-4.0-SNAPSHOT.zip?changeToken=1-0',
            digest: '2e7d1a1ba7018c048bebdf1d07481ee3',
            digestAlgorithm: 'MD5',
            encoding: null,
            length: '5763',
            'mime-type': 'application/zip',
            name: 'nos-gitty-mp-4.0-SNAPSHOT.zip',
            viewUrl: 'nos-gitty-mp-4.0-SNAPSHOT.zip?changeToken=1-0&clientReason=view',
            downloadUrl: 'nos-gitty-mp-4.0-SNAPSHOT.zip?changeToken=1-0&clientReason=download',
          },
        },
        schemas: [
          {
            name: 'file',
          },
        ],
        contextParameters: {
          preview: {
            downloadUrl: 'd287f/@preview/?changeToken=18-0&clientReason=download',
            viewUrl: 'd287f/@preview/?changeToken=18-0&clientReason=view',
            url: 'd287f/@preview/?changeToken=18-0',
          },
        },
      };
      element.xpath = 'file:content';
      // The blob mime-type is application/zip, so _computeObjectSource rewrites the preview URL to
      // include the @blob/<xpath>/@preview/ segment (see nuxeo-document-preview.js:370-374). The
      // test was written before that rewrite was added; assert against the current contract.
      expect(element._computeObjectSource()).to.eql(
        'd287f/@blob/file:content/@preview/?changeToken=18-0&clientReason=view',
      );
    });

    test('Should compute pdf source if blob has view url', () => {
      element.document = {
        properties: {
          'file:content': {
            appLinks: [],
            data: 'file:content/abc.pdf?changeToken=11-0',
            digest: '2e7d1a1ba7018c048bebdf1d07481ee3',
            digestAlgorithm: 'MD5',
            encoding: null,
            length: '5763',
            'mime-type': 'application/pdf',
            name: 'abc.pdf',
            viewUrl: 'file:content/abc.pdf?changeToken=11-0&clientReason=view',
            downloadUrl: 'file:content/abc.pdf?changeToken=11-0&clientReason=download',
          },
        },
        schemas: [
          {
            name: 'file',
          },
        ],
        contextParameters: {
          preview: {
            url: 'file:content/abc.pdf?changeToken=11-0',
          },
        },
      };
      element.xpath = 'file:content';
      // _computePdfSource takes the blob as an argument (see nuxeo-document-preview.js:403). The
      // test must pass the blob explicitly because the property observer chain that populates
      // `element._blob` does not run synchronously when we set `document` programmatically.
      expect(element._computePdfSource(element.document.properties['file:content'])).to.eql(
        'file:content/abc.pdf?changeToken=11-0&clientReason=view',
      );
    });

    test('Should compute pdf source if blob does not have view url', () => {
      // _computePdfSource falls back to `blob.url` when `blob.viewUrl` is not present
      // (see nuxeo-document-preview.js:403-405). This test exercises that fallback by passing a
      // blob with only the `url` field populated.
      element.document = {
        properties: {
          'file:content': {
            appLinks: [],
            data: 'file:content/abc.pdf?changeToken=11-0',
            url: 'file:content/abc.pdf?changeToken=11-0',
            digest: '2e7d1a1ba7018c048bebdf1d07481ee3',
            digestAlgorithm: 'MD5',
            encoding: null,
            length: '5763',
            'mime-type': 'application/pdf',
            name: 'abc.pdf',
          },
        },
        schemas: [
          {
            name: 'file',
          },
        ],
        contextParameters: {
          preview: {
            url: 'file:content/abc.pdf?changeToken=11-0',
          },
        },
      };
      element.xpath = 'file:content';
      expect(element._computePdfSource(element.document.properties['file:content'])).to.eql(
        'file:content/abc.pdf?changeToken=11-0',
      );
    });
  });
});

suite('nuxeo-video layouts coverage', () => {
  test('hits nuxeo-video-info static getters and renders', async () => {
    const VideoInfo = customElements.get('nuxeo-video-info');
    expect(VideoInfo).to.exist;
    // Access static getter directly to guarantee template/function counters are exercised.
    expect(VideoInfo.template).to.exist;
    expect(VideoInfo.properties).to.have.property('document');

    const element = await fixture(
      html`
        <nuxeo-video-info .document="${{ properties: { 'vid:info': { format: 'mp4' } } }}"></nuxeo-video-info>
      `,
    );
    expect(element.shadowRoot.querySelectorAll('.item')).to.have.length(5);
  });

  test('hits nuxeo-video-conversions template and _getDownloadUrl branches', async () => {
    const VideoConversions = customElements.get('nuxeo-video-conversions');
    expect(VideoConversions).to.exist;
    // Access static getter directly to guarantee template/function counters are exercised.
    expect(VideoConversions.template).to.exist;
    expect(VideoConversions.properties).to.have.property('document');

    const element = await fixture(
      html`
        <nuxeo-video-conversions
          .document="${{
            properties: {
              'vid:transcodedVideos': [
                {
                  name: 'mp4',
                  content: { length: '42', downloadUrl: 'video.mp4?clientReason=download', data: 'video-data' },
                  info: { width: 100, height: 50 },
                },
              ],
            },
          }}"
          label="conversions"
        ></nuxeo-video-conversions>
      `,
    );
    expect(element.shadowRoot.querySelector('h3').innerText).to.equal('conversions');
    expect(element._getDownloadUrl({ content: { downloadUrl: 'direct', data: 'fallback' } })).to.equal('direct');
    expect(element._getDownloadUrl({ content: { data: 'fallback' } })).to.equal('fallback');
  });
});

const defaultBlob = {
  'mime-type': 'application/octet-stream',
  data: 'http://d',
  viewUrl: 'http://v',
};

const mkDoc = (extraProps, ctxParams) => {
  return {
    schemas: [],
    properties: Object.assign({ 'file:content': defaultBlob }, extraProps),
    contextParameters: ctxParams || {},
  };
};

suite('nuxeo-document-preview extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-document-preview></nuxeo-document-preview>
      `,
    );
  });

  suite('_computeRendition', () => {
    test('returns rendition viewUrl', () => {
      const doc = {
        contextParameters: {
          renditions: [{ name: 'pdf', viewUrl: 'http://r/v', url: 'http://r/u' }],
        },
      };
      expect(el._computeRendition(doc, 'file:content', 'pdf')).to.equal('http://r/v');
    });

    test('falls back to rendition url', () => {
      const doc = {
        contextParameters: {
          renditions: [{ name: 'pdf', url: 'http://r/u' }],
        },
      };
      expect(el._computeRendition(doc, 'file:content', 'pdf')).to.equal('http://r/u');
    });

    test('returns falsy when no matching rendition', () => {
      const doc = { contextParameters: { renditions: [{ name: 'txt', url: 'http://r' }] } };
      expect(el._computeRendition(doc, 'file:content', 'pdf')).to.not.be.ok;
    });

    test('returns falsy for non-default xpath', () => {
      const doc = { contextParameters: { renditions: [{ name: 'pdf', url: 'http://r' }] } };
      expect(el._computeRendition(doc, 'other:xpath', 'pdf')).to.not.be.ok;
    });

    test('returns falsy when no contextParameters', () => {
      expect(el._computeRendition({}, 'file:content', 'pdf')).to.not.be.ok;
    });

    test('returns falsy when no renditions', () => {
      expect(el._computeRendition({ contextParameters: {} }, 'file:content', 'pdf')).to.not.be.ok;
    });
  });

  suite('_computeAudioSource', () => {
    test('returns viewUrl when available', () => {
      el._blob = { viewUrl: 'http://audio/v', data: 'http://audio/d' };
      expect(el._computeAudioSource()).to.equal('http://audio/v');
    });

    test('falls back to data', () => {
      el._blob = { data: 'http://audio/d' };
      expect(el._computeAudioSource()).to.equal('http://audio/d');
    });

    test('returns undefined for no blob', () => {
      el._blob = null;
      expect(el._computeAudioSource()).to.be.undefined;
    });
  });

  suite('_computePdfSource', () => {
    test('returns viewUrl when available', () => {
      expect(el._computePdfSource({ viewUrl: 'http://a', url: 'http://b' })).to.equal('http://a');
    });

    test('falls back to url', () => {
      expect(el._computePdfSource({ url: 'http://b' })).to.equal('http://b');
    });
  });

  suite('stop', () => {
    test('does nothing when no video/audio elements', () => {
      el.stop();
    });
  });

  suite('_computeImageSource - direct calls', () => {
    test('returns FullHD view url', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({
        'picture:views': [{ title: 'FullHD', content: { viewUrl: 'http://img/fullhd', data: 'http://img/data' } }],
      });
      el._blob = { 'mime-type': 'image/png', data: 'http://fallback' };
      expect(el._computeImageSource()).to.equal('http://img/fullhd');
    });

    test('falls back to data when no viewUrl on FullHD', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({
        'picture:views': [{ title: 'FullHD', content: { data: 'http://img/data' } }],
      });
      el._blob = {};
      expect(el._computeImageSource()).to.equal('http://img/data');
    });

    test('returns blob data fallback for image', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({});
      el._blob = { 'mime-type': 'image/jpeg', data: 'http://blob/data' };
      expect(el._computeImageSource()).to.equal('http://blob/data');
    });

    test('returns blob viewUrl for image', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({});
      el._blob = { 'mime-type': 'image/jpeg', viewUrl: 'http://blob/view', data: 'http://blob/data' };
      expect(el._computeImageSource()).to.equal('http://blob/view');
    });

    test('returns undefined for non-image blob', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({});
      el._blob = { 'mime-type': 'application/pdf', data: 'http://pdf' };
      expect(el._computeImageSource()).to.be.undefined;
    });

    test('skips picture:views without FullHD', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({
        'picture:views': [{ title: 'Thumbnail', content: { data: 'x' } }],
      });
      el._blob = { 'mime-type': 'image/png', data: 'http://fallback' };
      expect(el._computeImageSource()).to.equal('http://fallback');
    });
  });

  suite('_computeVideoSources - direct calls', () => {
    test('returns transcoded videos', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({
        'vid:transcodedVideos': [
          { content: { viewUrl: 'http://v/view', data: 'http://v/data', 'mime-type': 'video/mp4' } },
        ],
      });
      const sources = el._computeVideoSources();
      expect(sources).to.have.length(1);
    });

    test('filters out null conversions', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({ 'vid:transcodedVideos': [null, { content: null }] });
      expect(el._computeVideoSources()).to.have.length(0);
    });

    test('falls back to blob for video', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({});
      el._blob = { 'mime-type': 'video/mp4', viewUrl: 'http://v', data: 'http://d' };
      const sources = el._computeVideoSources();
      expect(sources).to.have.length(1);
    });

    test('returns undefined for non-video', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({});
      el._blob = { 'mime-type': 'application/pdf', data: 'http://d' };
      expect(el._computeVideoSources()).to.be.undefined;
    });
  });

  suite('_computeStoryboard - direct calls', () => {
    test('returns storyboard for file:content', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({ 'vid:storyboard': [{ timecode: 0 }] });
      expect(el._computeStoryboard()).to.have.length(1);
    });

    test('returns undefined when no storyboard', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({});
      expect(el._computeStoryboard()).to.be.undefined;
    });
  });

  suite('_computeObjectSource - direct calls', () => {
    test('returns preview viewUrl with xpath', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({}, { preview: { viewUrl: 'http://p/@preview/file' } });
      el._blob = { 'mime-type': 'application/pdf' };
      const result = el._computeObjectSource();
      expect(result).to.include('@blob/file:content/@preview/');
    });

    test('falls back to blob viewUrl', () => {
      el.document = mkDoc({});
      el._blob = { viewUrl: 'http://blob/v', url: 'http://blob/u' };
      expect(el._computeObjectSource()).to.equal('http://blob/v');
    });

    test('falls back to blob url', () => {
      el.document = mkDoc({});
      el._blob = { url: 'http://blob/u' };
      expect(el._computeObjectSource()).to.equal('http://blob/u');
    });
  });
});
