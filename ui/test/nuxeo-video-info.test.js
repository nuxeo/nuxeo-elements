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
import { fixture, flush, html, isElementVisible } from '@nuxeo/testing-helpers';
import '../nuxeo-video/nuxeo-video-info.js';
import videoProperties from './resources/videoProperties';
/* eslint-disable no-unused-expressions */

suite('nuxeo-video-info', () => {
  let element;

  const document = {
    properties: {
      'vid:info': videoProperties['vid:info'],
    },
  };

  test('Should display 5 slots for video info when video contains info', async () => {
    element = await fixture(html`
      <nuxeo-video-info .document="${document}"></nuxeo-video-info>
    `);
    await flush();
    const items = element.shadowRoot.querySelectorAll('.item div');
    const labels = element.shadowRoot.querySelectorAll('.item label');
    expect(isElementVisible(items[0])).to.be.true;
    expect(isElementVisible(labels[0])).to.be.true;
    expect(items[0].innerText).to.equal(videoProperties['vid:info'].format);
    expect(isElementVisible(items[1])).to.be.true;
    expect(isElementVisible(labels[1])).to.be.true;
    expect(items[1].innerText).to.equal(videoProperties['vid:info'].duration.toString());
    expect(isElementVisible(items[2])).to.be.true;
    expect(isElementVisible(labels[2])).to.be.true;
    expect(items[2].innerText).to.equal(videoProperties['vid:info'].width.toString());
    expect(isElementVisible(items[3])).to.be.true;
    expect(isElementVisible(labels[3])).to.be.true;
    expect(items[3].innerText).to.equal(videoProperties['vid:info'].height.toString());
    expect(isElementVisible(items[4])).to.be.true;
    expect(isElementVisible(labels[4])).to.be.true;
    expect(items[4].innerText).to.equal(videoProperties['vid:info'].frameRate.toString());
  });

  test('Should display 5 empty slots when no video or video does not contain info', async () => {
    element = await fixture(html`
      <nuxeo-video-info></nuxeo-video-info>
    `);
    await flush();
    const items = element.shadowRoot.querySelectorAll('.item div');
    const labels = element.shadowRoot.querySelectorAll('.item label');
    expect(isElementVisible(labels[0])).to.be.true;
    expect(items[0].innerText).to.be.empty;
    expect(isElementVisible(labels[1])).to.be.true;
    expect(items[1].innerText).to.be.empty;
    expect(isElementVisible(labels[2])).to.be.true;
    expect(items[2].innerText).to.be.empty;
    expect(isElementVisible(labels[3])).to.be.true;
    expect(items[3].innerText).to.be.empty;
    expect(isElementVisible(labels[4])).to.be.true;
    expect(items[4].innerText).to.be.empty;
  });
});
