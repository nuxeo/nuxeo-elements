/**
 @license
 (C) Copyright Nuxeo Corp. (http://nuxeo.com/)

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
            viewData: 'file1.jpeg?changeToken=13-0&clientReason=view',
          },
        },
        schemas: [
          {
            name: 'image',
          },
        ],
      };
      element.xpath = 'file:content';
      expect(element._blob.viewData).to.equal('file1.jpeg?changeToken=13-0&clientReason=view');
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
                viewData: 'file1.jpeg?changeToken=13-0&clientReason=view',
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
                viewData: 'vid1.mp4?changeToken=9-0&clientReason=view',
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
          viewData: 'vid1.mp4?changeToken=9-0&clientReason=view',
          type: 'video/mp4',
        },
      ]);
    });
  });
});
