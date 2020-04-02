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
import { html, fixture, isElementVisible, tap } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-collapsible.js';
import '../nuxeo-icons';

suite('nuxeo-collapsible', () => {
  suite('Properties', () => {
    test('Should display nuxeo-collapsible when declaring the element', async () => {
      const nuxeoCollapsible = await fixture(
        html`
          <nuxeo-collapsible></nuxeo-collapsible>
        `,
      );

      expect(isElementVisible(nuxeoCollapsible.shadowRoot.querySelector('button'))).to.be.true;
    });

    test('Should display heading when it is set', async () => {
      const nuxeoCollapsible = await fixture(
        html`
          <nuxeo-collapsible>
            <span class="heading" slot="heading">Content</span>
          </nuxeo-collapsible>
        `,
      );

      const heading = nuxeoCollapsible.shadowRoot.querySelector('slot').assignedElements()[0];
      expect(isElementVisible(heading)).to.be.true;
      expect(heading.innerHTML).to.equal('Content');
    });

    test('Should display chevron when element is declared', async () => {
      const nuxeoCollapsible = await fixture(
        html`
          <nuxeo-collapsible chevron></nuxeo-collapsible>
        `,
      );

      const chevron = nuxeoCollapsible.shadowRoot.querySelector('iron-icon');
      expect(isElementVisible(chevron)).to.be.true;
    });

    test('Should hide collapsed content when "opened" is not set', async () => {
      const nuxeoCollapsible = await fixture(
        html`
          <nuxeo-collapsible>
            <span slot="heading">Content</span>
            <div>Collapsed content</div>
          </nuxeo-collapsible>
        `,
      );

      const content = nuxeoCollapsible.shadowRoot.querySelectorAll('slot')[1].assignedNodes()[2];
      expect(isElementVisible(content)).to.be.false;
    });

    test('Should show collapsed content when "opened" is set', async () => {
      const nuxeoCollapsible = await fixture(
        html`
          <nuxeo-collapsible opened>
            <span slot="heading">Content</span>
            <div>Collapsed content</div>
          </nuxeo-collapsible>
        `,
      );

      const content = nuxeoCollapsible.shadowRoot.querySelectorAll('slot')[1].assignedNodes()[2];
      expect(isElementVisible(content)).to.be.true;
      expect(content.innerHTML).to.equal('Collapsed content');
    });
  });

  suite('Collapse behaviour', () => {
    test('Should show and hide content when heading is tapped', async () => {
      const nuxeoCollapsible = await fixture(
        html`
          <nuxeo-collapsible>
            <span slot="heading">Content</span>
            <div>Collapsed content</div>
          </nuxeo-collapsible>
        `,
      );

      const button = nuxeoCollapsible.shadowRoot.querySelector('button');
      const content = nuxeoCollapsible.shadowRoot.querySelectorAll('slot')[1].assignedElements()[0];
      expect(isElementVisible(content)).to.be.false;

      tap(button);
      expect(isElementVisible(content)).to.be.true;
      expect(content.innerHTML).to.equal('Collapsed content');
    });

    test('Should change the chevron icon when button is toggled', async () => {
      const nuxeoCollapsible = await fixture(
        html`
          <nuxeo-collapsible chevron>
            <span slot="heading">Content</span>
            <div>Collapsed content</div>
          </nuxeo-collapsible>
        `,
      );

      const button = nuxeoCollapsible.shadowRoot.querySelector('button');
      const chevronIcon = button.querySelector('iron-icon');
      expect(isElementVisible(chevronIcon)).to.be.true;
      expect(chevronIcon.icon).to.equal('hardware:keyboard-arrow-down');

      tap(button);
      expect(isElementVisible(chevronIcon)).to.be.true;
      expect(chevronIcon.icon).to.equal('hardware:keyboard-arrow-up');
    });
  });
});
