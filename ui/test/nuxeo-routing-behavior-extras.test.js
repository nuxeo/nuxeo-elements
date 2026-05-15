/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { RoutingBehavior, setRouter } from '../nuxeo-routing-behavior.js';

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

    test('does not double-slash when path starts with /', () => {
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
