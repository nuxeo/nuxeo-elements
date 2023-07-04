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
      expect(element._computeObjectSource()).to.eql('d287f/@preview/?changeToken=18-0&clientReason=view');
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
      expect(element._computePdfSource()).to.eql('file:content/abc.pdf?changeToken=11-0&clientReason=view');
    });

    test('Should compute pdf source if blob does not have view url', () => {
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
      expect(element._computePdfSource()).to.eql('file:content/abc.pdf?changeToken=11-0');
    });
  });
});
