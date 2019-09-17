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
import { fixture, html, flush } from '@nuxeo/nuxeo-elements/test/test-helpers.js';
import * as polymer from '@polymer/polymer';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import '../nuxeo-filter.js';
import '../nuxeo-slots.js';

/* eslint-disable no-unused-expressions */

function stamped(filter, clazz) {
  return dom(filter).querySelectorAll(`${clazz || '*'}:not(nuxeo-filter):not(template)`);
}

suite('<nuxeo-filter>', () => {
  test('empty filter', async () => {
    const filter = await fixture(html`
      <div>
        <nuxeo-filter></nuxeo-filter>
        <nuxeo-filter><template></template></nuxeo-filter>
      </div>
    `);
    expect(stamped(filter)).to.be.empty;
  });

  test('facet filter', async () => {
    const filter = await fixture(html`
      <div>
        <!-- single -->
        <nuxeo-filter document='{"facets":["Folderish"]}' facet="Folderish">
          <template>
            <div class="ok"></div>
          </template>
        </nuxeo-filter>
        <nuxeo-filter document='{"facets":["Folderish"]}' facet="Commentable">
          <template>
            <div class="notok"></div>
          </template>
        </nuxeo-filter>

        <!-- multiple -->
        <nuxeo-filter document='{"facets":["Folderish"]}' facet="Folderish, Commentable">
          <template>
            <div class="ok"></div>
          </template>
        </nuxeo-filter>
        <nuxeo-filter document='{"facets":["Commentable"]}' facet="Folderish,Commentable,Versionable">
          <template>
            <div class="ok"></div>
          </template>
        </nuxeo-filter>
        <nuxeo-filter document='{"facets":[]}' facet="Folderish,Commentable">
          <template>
            <div class="notok"></div>
          </template>
        </nuxeo-filter>
      </div>
    `);

    expect(stamped(filter, '.ok').length).to.be.equal(3);
    expect(stamped(filter, 'notok')).to.be.empty;
  });

  test('schema filter', async () => {
    const filter = await fixture(html`
      <div>
        <!-- single -->
        <nuxeo-filter document='{"schemas":["files"]}' schema="files">
          <template>
            <div class="ok"></div>
          </template>
        </nuxeo-filter>
        <nuxeo-filter document='{"schemas":["files"]}' schema="dublincore">
          <template>
            <div class="notok"></div>
          </template>
        </nuxeo-filter>

        <!-- multiple -->
        <nuxeo-filter document='{"schemas":["files"]}' schema="files, dublincore">
          <template>
            <div class="ok"></div>
          </template>
        </nuxeo-filter>
        <nuxeo-filter document='{"schemas":["common"]}' schema="dublincore,common,files">
          <template>
            <div class="ok"></div>
          </template>
        </nuxeo-filter>
        <nuxeo-filter document='{"schemas":[]}' schema="file,common">
          <template>
            <div class="notok"></div>
          </template>
        </nuxeo-filter>
      </div>
    `);

    expect(stamped(filter, '.ok').length).to.be.equal(3);
    expect(stamped(filter, 'notok')).to.be.empty;
  });

  test('type filter', async () => {
    const filter = await fixture(html`
      <div>
        <nuxeo-filter document='{"type":"Folder"}' type="Folder">
          <template>
            <div class="ok"></div>
          </template>
        </nuxeo-filter>
        <nuxeo-filter document='{"type":"Folder"}' type="File">
          <template>
            <div class="notok"></div>
          </template>
        </nuxeo-filter>
        <nuxeo-filter document='{"type":"Folder"}' type="Folder,File">
          <template>
            <div class="ok"></div>
          </template>
        </nuxeo-filter>
      </div>
    `);
    expect(stamped(filter, '.ok').length).to.be.equal(2);
    expect(stamped(filter, 'notok')).to.be.empty;
  });

  test('permission filter', async () => {
    const filter = await fixture(html`
      <div>
        <nuxeo-filter document='{"contextParameters":{"permissions":["Write"]}}' permission="Write">
          <template>
            <div class="ok"></div>
          </template>
        </nuxeo-filter>
        <nuxeo-filter document='{"contextParameters":{"permissions":["Read"]}}' permission="Write">
          <template>
            <div class="notok"></div>
          </template>
        </nuxeo-filter>
      </div>
    `);
    expect(stamped(filter, '.ok').length).to.be.equal(1);
    expect(stamped(filter, 'notok')).to.be.empty;
  });

  test('state filter', async () => {
    const filter = await fixture(html`
      <div>
        <nuxeo-filter document='{"state":"project"}' state="project">
          <template>
            <div class="ok"></div>
          </template>
        </nuxeo-filter>
        <nuxeo-filter document='{"state":"project"}' state="deleted">
          <template>
            <div class="notok"></div>
          </template>
        </nuxeo-filter>
      </div>
    `);
    expect(stamped(filter, '.ok').length).to.be.equal(1);
    expect(stamped(filter, 'notok')).to.be.empty;
  });

  test('path filter', async () => {
    const filter = await fixture(html`
      <div>
        <nuxeo-filter document='{"path":"/default-domain/workspaces/"}' path="/default-domain">
          <template>
            <div class="ok"></div>
          </template>
        </nuxeo-filter>
        <nuxeo-filter document='{"path":"/default-domain/workspaces/"}' path="/another-domain">
          <template>
            <div class="notok"></div>
          </template>
        </nuxeo-filter>
      </div>
    `);
    expect(stamped(filter, '.ok').length).to.be.equal(1);
    expect(stamped(filter, 'notok')).to.be.empty;
  });

  test('user group filter', async () => {
    const filter = await fixture(html`
      <div>
        <nuxeo-filter user='{"extendedGroups":[{"name":"Administrators"}]}' group="Administrators">
          <template>
            <div class="ok"></div>
          </template>
        </nuxeo-filter>

        <nuxeo-filter user='{"extendedGroups":[{"name":"Members"}]}' group="Administrators">
          <template>
            <div class="notok"></div>
          </template>
        </nuxeo-filter>

        <nuxeo-filter user='{"extendedGroups":[{"name":"Members"}]}' group="Administrators,Members">
          <template>
            <div class="ok"></div>
          </template>
        </nuxeo-filter>
      </div>
    `);
    expect(stamped(filter, '.ok').length).to.be.equal(2);
    expect(stamped(filter, 'notok')).to.be.empty;
  });

  test('expression filter', async () => {
    const filter = await fixture(html`
      <div>
        <nuxeo-filter document='{"title":"Title"}' expression="document.title === 'Title'">
          <template>
            <div class="ok"></div>
          </template>
        </nuxeo-filter>

        <nuxeo-filter document='{"title":"Title"}' expression="document.title !== 'Title'">
          <template>
            <div class="notok"></div>
          </template>
        </nuxeo-filter>

        <nuxeo-filter
          document='{"type":"File", "title":"Title"}'
          expression="document.type === 'File' && document.title == 'Title'"
        >
          <template>
            <div class="ok"></div>
          </template>
        </nuxeo-filter>

        <nuxeo-filter
          document='{"facets":["Folderish","Commentable"]}'
          expression="document.facets.indexOf('Folderish') !== -1"
        >
          <template>
            <div class="ok"></div>
          </template>
        </nuxeo-filter>
      </div>
    `);
    expect(stamped(filter, '.ok').length).to.be.equal(3);
    expect(stamped(filter, 'notok')).to.be.empty;
  });

  test('trashed expression filter', async () => {
    const filter = await fixture(html`
      <div>
        <nuxeo-filter document='{"title":"Title", "state": "project"}' expression="!this.isTrashed(document)">
          <template>
            <div class="notDeletedTrashUndefined trashFilter"></div>
          </template>
        </nuxeo-filter>
        <nuxeo-filter document='{"title":"Title", "state": "deleted"}' expression="this.isTrashed(document)">
          <template>
            <div class="deletedTrashUndefined trashFilter"></div>
          </template>
        </nuxeo-filter>
        <nuxeo-filter
          document='{"title":"Title", "state": "project", "isTrashed": false}'
          expression="!this.isTrashed(document)"
        >
          <template>
            <div class="notDeletedTrashFalse trashFilter"></div>
          </template>
        </nuxeo-filter>
        <nuxeo-filter
          document='{"title":"Title", "state": "project", "isTrashed": true}'
          expression="this.isTrashed(document)"
        >
          <template>
            <div class="notDeletedTrashTrue trashFilter"></div>
          </template>
        </nuxeo-filter>
        <nuxeo-filter
          document='{"title":"Title", "state": "deleted", "isTrashed": false}'
          expression="!this.isTrashed(document)"
        >
          <template>
            <div class="deletedTrashFalse trashFilter"></div>
          </template>
        </nuxeo-filter>
        <nuxeo-filter
          document='{"title":"Title", "state": "deleted", "isTrashed": true}'
          expression="this.isTrashed(document)"
        >
          <template>
            <div class="deletedTrashTrue trashFilter"></div>
          </template>
        </nuxeo-filter>
      </div>
    `);
    expect(stamped(filter, '.trashFilter').length).to.be.equal(6);
    expect(stamped(filter, '.notDeletedTrashUndefined').length).to.be.equal(1);
    expect(stamped(filter, '.deletedTrashUndefined').length).to.be.equal(1);
    expect(stamped(filter, '.notDeletedTrashFalse').length).to.be.equal(1);
    expect(stamped(filter, '.notDeletedTrashTrue').length).to.be.equal(1);
    expect(stamped(filter, '.deletedTrashFalse').length).to.be.equal(1);
    expect(stamped(filter, '.deletedTrashTrue').length).to.be.equal(1);
  });

  test('multiple filters', async () => {
    const filter = await fixture(html`
      <div>
        <nuxeo-filter document='{"type":"File", "title":"Title"}' expression="document.title === 'Title'">
          <template>
            <div class="ok"></div>
          </template>
        </nuxeo-filter>

        <nuxeo-filter document='{"type":"File", "title":"Title"}' expression="document.title !== 'Title'">
          <template>
            <div class="notok"></div>
          </template>
        </nuxeo-filter>

        <nuxeo-filter
          document='{"type":"File"}'
          type="File"
          user='{"extendedGroups":[{"name":"Administrators"}]}'
          group="Administrators"
        >
          <template>
            <div class="ok"></div>
          </template>
        </nuxeo-filter>

        <nuxeo-filter document='{"type":"File"}' type="File" user='{"extendedGroups":[]}' group="Administrators">
          <template>
            <div class="notok"></div>
          </template>
        </nuxeo-filter>

        <nuxeo-filter
          document='{"type":"File", "title":"Title", "facets":["Folderish"]}'
          type="File"
          facet="Folderish"
          expression="document.title === 'Title'"
        >
          <template>
            <div class="ok"></div>
          </template>
        </nuxeo-filter>
      </div>
    `);
    expect(stamped(filter, '.ok').length).to.be.equal(3);
    expect(stamped(filter, 'notok')).to.be.empty;
  });

  test('filter removal', async () => {
    const container = await fixture(html`
      <div>
        <nuxeo-filter>
          <template>
            <div class="toRemove"></div>
          </template>
        </nuxeo-filter>
      </div>
    `);
    expect(stamped(container, '.toRemove').length).to.be.equal(1);
    const filter = dom(container).querySelector('nuxeo-filter');
    container.removeChild(filter);
    expect(stamped(container, '.toRemove').length).to.be.equal(0);
  });

  test('filter custom elements', async () => {
    const model = { document: { type: 'Folder' }, text: 'A simple test' };
    const container = await fixture(html`
      <div>
        <nuxeo-slot slot="TEST_SLOT" .model=${model}></nuxeo-slot>
      </div>
    `);

    class CustomElement extends Nuxeo.Element {
      static get is() {
        return 'my-custom-element';
      }

      static get template() {
        return polymer.html`
          <span id="label">[[label]]</span>
        `;
      }

      // eslint-disable-line no-undef
      static get properties() {
        return {
          label: {
            type: String,
            value: 'default',
          },
        };
      }
    }
    customElements.define(CustomElement.is, CustomElement);

    await fixture(html`
      <nuxeo-slot-content id="slot" name="test" slot="TEST_SLOT" order="1" model>
        <template>
          <nuxeo-filter document="[[document]]" type="Folder">
            <template>
              <!--div>Hello</div-->
              <my-custom-element class="custom" document="[[document]]" label="[[text]]"></my-custom-element>
            </template>
          </nuxeo-filter>
        </template>
      </nuxeo-slot-content>
    `);

    await flush();

    const stampedElements = stamped(container, '.custom');
    expect(stampedElements.length).to.be.equal(1);

    let [myElement] = stampedElements;
    expect(stamped(dom(myElement).node.shadowRoot, '#label').length).to.be.equal(1);
    expect(myElement.label).to.be.equal('A simple test');

    const [slot] = stamped(container, 'nuxeo-slot');
    slot.set('model', { document: { type: 'File' }, text: 'A simple test' });

    await flush();

    expect(stamped(dom(myElement).node.shadowRoot, '#label').length).to.be.equal(1);
    slot.set('model', { document: { type: 'Folder' }, text: 'A simple test' });
    await flush();

    [myElement] = stamped(container, '.custom');
    expect(stamped(dom(myElement).node.shadowRoot, '#label').length).to.be.equal(1);
    expect(myElement.label).to.be.equal('A simple test');
  });

  suite('Host data', () => {
    let host;

    setup(async () => {
      host = await fixture(html`
        <div>
          <dom-bind>
            <template>
              <nuxeo-filter document='{"type":"File"}' type="Folder">
                <template>
                  <span class="text">[[text]]</span>
                </template>
              </nuxeo-filter>
            </template>
          </dom-bind>
        </div>
      `);
    });

    test('text should be set', async () => {
      const filter = dom(host).querySelector('nuxeo-filter');
      expect(stamped(host, '.text').length).to.be.equal(0);
      filter.set('__dataHost', {});
      filter.set('__dataHost.__data', { text: 'is this working?' });
      filter.set('document', { type: 'Folder' });
      await flush();
      const span = stamped(host, '.text');
      expect(span.length).to.be.equal(1);
      expect(span[0].innerHTML).to.be.equal('is this working?');
    });

    test('text should be undefined', async () => {
      const filter = dom(host).querySelector('nuxeo-filter');
      filter.set('__dataHost', {});
      filter.set('document', { type: 'File' });
      await flush();
      expect(stamped(host, '.text').length).to.be.equal(0);
      filter.set('document', { type: 'Folder' });
      await flush();
      const span = stamped(host, '.text');
      expect(span.length).to.be.equal(1);
      expect(span[0].innerHTML).to.be.equal(' ');
    });
  });
});
