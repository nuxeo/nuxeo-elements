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
import { fixture, isElementVisible, html } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-html-editor.js';

suite('nuxeo-html-editor', () => {
  test('should display the placeholder when empty', async () => {
    const editor = await fixture(
      html`
        <nuxeo-html-editor></nuxeo-html-editor>
      `,
    );
    expect(editor._editor.root.dataset.placeholder).to.equal('Type here...');
  });

  test('should sync the html value', async () => {
    const editor = await fixture(
      html`
        <nuxeo-html-editor value="Hello"></nuxeo-html-editor>
      `,
    );
    await new Promise((resolve) => {
      editor.addEventListener('value-changed', () => resolve());
      editor._editor.insertText(editor._editor.getLength() - 1, ' world!', 'user');
    });
    expect(editor.value).to.equal(`Hello world!`);
  });

  test('should hide the toolbar when readonly', async () => {
    const editor = await fixture(
      html`
        <nuxeo-html-editor read-only></nuxeo-html-editor>
      `,
    );
    expect(isElementVisible(editor._editor.getModule('toolbar').container)).to.be.false;
  });

  test('should show value when readonly', async () => {
    const editor = await fixture(
      html`
        <nuxeo-html-editor read-only value="Hello"></nuxeo-html-editor>
      `,
    );
    const text = editor.shadowRoot.querySelector('.ql-editor').textContent.trim();
    expect(text).to.equal(`Hello`);
  });
});
