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
import '../viewers/nuxeo-video-viewer.js';

suite('nuxeo-video-viewer', () => {
  suite('Compute urls', () => {
    let element;

    setup(async () => {
      element = await fixture(html`
        <nuxeo-video-viewer></nuxeo-video-viewer>
      `);
    });

    test('Should compute thumbnail url when thumbnail has viewUrl property', () => {
      const thumbnail = {
        content: {
          viewUrl: 'abc.jpg?changeToken=1-0&clientReason=view',
        },
      };
      expect(element._getThumbnailUrl(thumbnail)).to.equal('abc.jpg?changeToken=1-0&clientReason=view');
    });

    test('Should compute thumbnail url when thumbnail does not have viewUrl property', () => {
      const thumbnail = {
        content: {
          data: 'abc.jpg?changeToken=1-0',
        },
      };
      expect(element._getThumbnailUrl(thumbnail)).to.equal('abc.jpg?changeToken=1-0');
    });

    test('Should compute source url when source has viewUrl property', () => {
      const source = {
        viewUrl: 'abc.jpg?changeToken=1-0&clientReason=view',
      };
      expect(element._getSourceUrl(source)).to.equal('abc.jpg?changeToken=1-0&clientReason=view');
    });

    test('Should compute source url when source does not have viewUrl property', () => {
      const source = {
        data: 'abc.jpg?changeToken=1-0',
      };
      expect(element._getSourceUrl(source)).to.equal('abc.jpg?changeToken=1-0');
    });
  });
});
