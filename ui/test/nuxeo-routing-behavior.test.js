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

    suite('with one repository available', async () => {
      setup(async () => {
        Nuxeo.UI.repositories = [{ name: 'repo', href: '/nuxeo/repo/repo/ui/' }];
      });

      teardown(async () => {
        Nuxeo.UI.repositories = [];
      });

      test('should generate document url without repository', async () => {
        router.useHashbang = true;
        router.baseUrl = 'base';
        expect(
          el.urlFor({
            'entity-type': 'document',
            uid: 'abc123',
            path: '/default-domain/workspaces/ws',
            repository: 'repo',
          }),
        ).to.equal(`base/#!/path/default-domain/workspaces/ws`);
        expect(router.document.calledOnce).to.be.true;
      });
    });

    suite('with more than one repository available', async () => {
      setup(async () => {
        Nuxeo.UI.repositories = [
          { name: 'repo1', href: '/nuxeo/repo/repo1/ui/' },
          { name: 'repo2', href: '/nuxeo/repo/repo2/ui/' },
        ];
      });

      teardown(async () => {
        Nuxeo.UI.repositories = [];
      });

      test('should generate document url with repository', async () => {
        router.useHashbang = true;
        router.baseUrl = 'base';
        expect(
          el.urlFor({
            'entity-type': 'document',
            uid: 'abc123',
            path: '/default-domain/workspaces/ws',
            repository: 'repo1',
          }),
        ).to.equal(`${window.origin}/nuxeo/repo/repo1/ui/#!/path/default-domain/workspaces/ws`);
        expect(router.document.calledOnce).to.be.true;
      });
    });
  });
});

suite('RoutingBehavior extras', () => {
  let ctx;
  let router;

  setup(() => {
    router = {
      baseUrl: '/nuxeo/ui',
      useHashbang: true,
      browse: (path) => `/browse${path}`,
      document: (id) => `/doc/${id}`,
      user: (id) => `/user/${id}`,
      navigate: sinon.stub(),
    };
    ctx = Object.create(RoutingBehavior);
    ctx.router = router;
  });

  suite('_generateUrl', () => {
    test('adds hashbang when useHashbang is true', () => {
      const result = ctx._generateUrl('/nuxeo/ui', '/browse');
      expect(result).to.equal('/nuxeo/ui/#!/browse');
    });

    test('omits extra slash when baseUrl ends with /', () => {
      const result = ctx._generateUrl('/nuxeo/ui/', '/browse');
      expect(result).to.equal('/nuxeo/ui/#!/browse');
    });

    test('omits hashbang when useHashbang is false', () => {
      router.useHashbang = false;
      const result = ctx._generateUrl('/nuxeo/ui', '/browse');
      expect(result).to.equal('/nuxeo/ui/browse');
    });

    test('joins base and path without extra separator when both have slashes', () => {
      router.useHashbang = false;
      const result = ctx._generateUrl('/nuxeo/ui/', '/browse');
      expect(result).to.equal('/nuxeo/ui//browse');
    });
  });

  suite('_computeUrlFor', () => {
    let urlFor;

    setup(() => {
      urlFor = RoutingBehavior._computeUrlFor.call(ctx);
    });

    test('returns empty string for falsy route', () => {
      expect(urlFor.call(ctx, null)).to.equal('');
      expect(urlFor.call(ctx, '')).to.equal('');
    });

    test('returns baseUrl + route for absolute path', () => {
      expect(urlFor.call(ctx, '/my/page')).to.equal('/nuxeo/ui/my/page');
    });

    test('returns undefined for unknown named route', () => {
      expect(urlFor.call(ctx, 'unknownRoute')).to.be.undefined;
    });

    test('resolves named route with params', () => {
      const result = urlFor.call(ctx, 'user', 'john');
      expect(result).to.include('/user/john');
    });

    test('returns empty string for empty object route', () => {
      expect(urlFor.call(ctx, {})).to.equal('');
    });

    test('returns undefined when router is null', () => {
      ctx.router = null;
      expect(urlFor.call(ctx, 'user', 'john')).to.be.undefined;
    });

    test('resolves document entity route', () => {
      const doc = {
        'entity-type': 'document',
        path: '/default-domain/doc1',
        uid: 'uid1',
      };
      const result = urlFor.call(ctx, doc);
      expect(result).to.be.a('string');
    });
  });

  suite('_computeNavigateTo', () => {
    let navigateTo;

    setup(() => {
      navigateTo = RoutingBehavior._computeNavigateTo.call(ctx);
    });

    test('logs error when router is null', () => {
      const origError = console.error;
      console.error = sinon.stub();
      ctx.router = null;
      navigateTo.call(ctx, 'someRoute');
      expect(console.error).to.have.been.calledWith('No router defined');
      console.error = origError;
    });

    test('navigates to entity object', () => {
      const doc = {
        'entity-type': 'document',
        path: '/doc',
        uid: 'u1',
      };
      navigateTo.call(ctx, doc);
      expect(router.navigate).to.have.been.called;
    });

    test('navigates using known named route', () => {
      navigateTo.call(ctx, 'user', 'john');
      expect(router.navigate).to.have.been.called;
    });
  });

  suite('_routeEntity', () => {
    test('returns undefined for no arguments', () => {
      expect(ctx._routeEntity()).to.be.undefined;
    });

    test('throws for non-object argument', () => {
      expect(() => ctx._routeEntity('string')).to.throw('not a valid entity object');
    });

    test('throws when no entity-type and no path/uid', () => {
      expect(() => ctx._routeEntity({ name: 'test' })).to.throw('does not have an "entity-type"');
    });

    test('infers document when path + uid present', () => {
      const result = ctx._routeEntity({ path: '/a', uid: 'uid1' });
      expect(result).to.be.a('string');
    });

    test('uses uid for proxy documents', () => {
      const result = ctx._routeEntity({
        'entity-type': 'document',
        path: '/a',
        uid: 'uid1',
        isProxy: true,
      });
      expect(result).to.include('uid1');
    });

    test('uses uid for version documents', () => {
      const result = ctx._routeEntity({
        'entity-type': 'document',
        path: '/a',
        uid: 'uid1',
        isVersion: true,
      });
      expect(result).to.include('uid1');
    });

    test('throws for missing routeVal', () => {
      router.task = (id) => `/task/${id}`;
      expect(() =>
        ctx._routeEntity({
          'entity-type': 'task',
        }),
      ).to.throw('invalid router key');
    });

    test('routes user entity by id', () => {
      const result = ctx._routeEntity({
        'entity-type': 'user',
        id: 'jdoe',
      });
      expect(result).to.include('jdoe');
    });
  });

  suite('setRouter', () => {
    test('dispatches nuxeo-router-changed event', (done) => {
      const handler = () => {
        document.removeEventListener('nuxeo-router-changed', handler);
        done();
      };
      document.addEventListener('nuxeo-router-changed', handler);
      setRouter({ baseUrl: '/test' });
    });
  });
});
