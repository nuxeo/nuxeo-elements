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
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { config } from '@nuxeo/nuxeo-elements';
import { RoutingBehavior, setRouter } from '../nuxeo-routing-behavior.js';

function setNuxeoRouterKey(entityType, value) {
  config.set(`router.key.${entityType}`, value);
}

suite('Nuxeo.RoutingBehavior', () => {
  // define nuxeo-routed-element
  customElements.define(
    'nuxeo-routed-element',
    class extends mixinBehaviors([RoutingBehavior], Nuxeo.Element) {
      static get is() {
        return 'nuxeo-routed-element';
      }
    },
  );

  setup(async () => {
    await customElements.whenDefined('nuxeo-routed-element');
  });

  suite('urlFor', () => {
    let el;
    let router;
    setup(async () => {
      await customElements.whenDefined('nuxeo-routed-element');
      // Mock router
      router = {
        document: (path, tab) => `${path.startsWith('/') ? 'path' : 'uid/'}${path}${tab ? `?p=${tab}` : ''}`,
      };
      setRouter(router);
      sinon.spy(router, 'document');
      el = await fixture(
        html`
          <nuxeo-routed-element></nuxeo-routed-element>
        `,
      );
    });

    teardown(async () => setRouter(null));

    test('should generate url for named route', async () => {
      router.useHashbang = false;
      router.baseUrl = '';
      expect(el.urlFor('document', '/default-domain/workspaces/ws')).to.equal(`/path/default-domain/workspaces/ws`);
      expect(router.document.calledOnce).to.be.true;
    });

    test('should generate url for named route when using hashbang', async () => {
      router.useHashbang = true;
      router.baseUrl = '';
      expect(el.urlFor('document', '/default-domain/workspaces/ws')).to.equal(`/#!/path/default-domain/workspaces/ws`);
      expect(router.document.calledOnce).to.be.true;
    });

    test('should generate url for named route when using base URL', async () => {
      router.useHashbang = false;
      router.baseUrl = 'base';
      expect(el.urlFor('document', '/default-domain/workspaces/ws')).to.equal(`base/path/default-domain/workspaces/ws`);
      expect(router.document.calledOnce).to.be.true;
    });

    test('should generate url for named route when using hashbang and base URL', async () => {
      router.useHashbang = true;
      router.baseUrl = 'base';
      expect(el.urlFor('document', '/default-domain/workspaces/ws')).to.equal(
        `base/#!/path/default-domain/workspaces/ws`,
      );
      expect(router.document.calledOnce).to.be.true;
    });

    test('should generate url for named route when passing a param', async () => {
      router.useHashbang = false;
      router.baseUrl = '';
      expect(el.urlFor('document', '/default-domain/workspaces/ws', 'view')).to.equal(
        `/path/default-domain/workspaces/ws?p=view`,
      );
      expect(router.document.calledOnce).to.be.true;
    });

    test('should generate url from object', async () => {
      router.useHashbang = false;
      router.baseUrl = '';
      expect(el.urlFor({ 'entity-type': 'document', uid: 'abc123', path: '/default-domain/workspaces/ws' })).to.equal(
        `/path/default-domain/workspaces/ws`,
      );
      expect(router.document.calledOnce).to.be.true;
    });

    test('should generate url from object when using hashbang', async () => {
      router.useHashbang = true;
      router.baseUrl = '';
      expect(el.urlFor({ 'entity-type': 'document', uid: 'abc123', path: '/default-domain/workspaces/ws' })).to.equal(
        `/#!/path/default-domain/workspaces/ws`,
      );
      expect(router.document.calledOnce).to.be.true;
    });

    test('should generate url from object when using base URL', async () => {
      router.useHashbang = false;
      router.baseUrl = 'base';
      expect(el.urlFor({ 'entity-type': 'document', uid: 'abc123', path: '/default-domain/workspaces/ws' })).to.equal(
        `base/path/default-domain/workspaces/ws`,
      );
      expect(router.document.calledOnce).to.be.true;
    });

    test('should generate url from object using hashbang and base URL', async () => {
      router.useHashbang = true;
      router.baseUrl = 'base';
      expect(el.urlFor({ 'entity-type': 'document', uid: 'abc123', path: '/default-domain/workspaces/ws' })).to.equal(
        `base/#!/path/default-domain/workspaces/ws`,
      );
      expect(router.document.calledOnce).to.be.true;
    });

    test('should generate url from object when passing a param', async () => {
      router.useHashbang = false;
      router.baseUrl = '';
      expect(
        el.urlFor({ 'entity-type': 'document', uid: 'abc123', path: '/default-domain/workspaces/ws' }, 'view'),
      ).to.equal(`/path/default-domain/workspaces/ws?p=view`);
      expect(router.document.calledOnce).to.be.true;
    });

    test('should generate empty url from undefined route', async () => {
      router.useHashbang = false;
      router.baseUrl = '';
      expect(el.urlFor()).to.equal('');
      expect(router.document.notCalled).to.be.true;
    });

    suite('with route key for "document" entity-type set to "uid"', async () => {
      setup(async () => {
        setNuxeoRouterKey('document', 'uid');
      });

      teardown(async () => {
        setNuxeoRouterKey('document'); // reset document key to undefined
      });

      test('should generate url from object', async () => {
        router.useHashbang = false;
        router.baseUrl = '';
        expect(el.urlFor({ 'entity-type': 'document', uid: 'abc123', path: '/default-domain/workspaces/ws' })).to.equal(
          `/uid/abc123`,
        );
        expect(router.document.calledOnce).to.be.true;
      });
    });
  });
});
