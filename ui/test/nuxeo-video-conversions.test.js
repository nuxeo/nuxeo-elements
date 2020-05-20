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
import { fixture, html, isElementVisible } from '@nuxeo/testing-helpers';
import '../nuxeo-video/nuxeo-video-conversions.js';
import videoProperties from './resources/videoProperties';

suite('nuxeo-video-conversions', () => {
  suite('Displaying element when no parameters provided', () => {
    let element;

    setup(async () => {
      element = await fixture(html`
        <nuxeo-video-conversions></nuxeo-video-conversions>
      `);
    });

    test('Should not display the label when label is not provided', () => {
      expect(isElementVisible(element.root.querySelector('h3'))).to.be.false;
    });

    test('Should not display any other element when no document provided', () => {
      expect(isElementVisible(element.shadowRoot.querySelector('.flex'))).to.be.false;
    });
  });

  suite('Displaying video properties', () => {
    let element;
    const document = {
      properties: {
        'vid:transcodedVideos': videoProperties['vid:transcodedVideos'],
      },
    };

    setup(async () => {
      element = await fixture(html`
        <nuxeo-video-conversions .document="${document}" label="video conversions"> </nuxeo-video-conversions>
      `);
    });

    test('Should display the label when the label is provided', () => {
      const label = element.shadowRoot.querySelector('h3');
      expect(isElementVisible(label)).to.be.true;
      expect(label.innerText).to.equal('video conversions');
    });

    test('Should display the video properties when the video contains conversion content', () => {
      const label = element.shadowRoot.querySelector('.item label');
      const span = element.shadowRoot.querySelectorAll('.item span')[0];
      const vProperties = videoProperties['vid:transcodedVideos'][0];

      expect(isElementVisible(label)).to.be.true;
      expect(label.innerText).to.equal(vProperties.name);
      expect(isElementVisible(span)).to.be.true;
      expect(span.innerText).to.equal(`${vProperties.info.width} x ${vProperties.info.height}`);
    });

    test('Should display an anchor tag when the video contains content', () => {
      const anchor = element.shadowRoot.querySelector('a');
      expect(isElementVisible(anchor)).to.be.true;
      expect(anchor.href).to.equal(`http://localhost:9876/${videoProperties['vid:transcodedVideos'][0].content.data}`);
    });
  });
});
