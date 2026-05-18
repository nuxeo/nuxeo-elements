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
import '../nuxeo-path-suggestion/nuxeo-path-suggestion.js';

suite('nuxeo-path-suggestion', () => {
  let el;

  setup(async () => {
    el = await fixture(html`
      <nuxeo-path-suggestion disabled></nuxeo-path-suggestion>
    `);
    // Stub anything that would trigger real network activity from observers.
    el.$.parent.get = sinon.stub().returns(Promise.resolve({}));
    el.$.provider.fetch = sinon.stub().returns(Promise.resolve({}));
  });

  test('should return the element name', () => {
    expect(Nuxeo.PathSuggestion.is).to.equal('nuxeo-path-suggestion');
  });

  test('should have default property values', () => {
    expect(Nuxeo.PathSuggestion.properties.autoValidate.value).to.be.true;
    expect(Nuxeo.PathSuggestion.properties.allowedPattern.value).to.equal('[^()\\+*%]');
    expect(Nuxeo.PathSuggestion.properties.enrichers.value).to.equal('');
  });

  test('connectedCallback sets dir attribute when missing', () => {
    expect(el.hasAttribute('dir')).to.be.true;
  });

  suite('displayResults / hideResults', () => {
    test('displayResults delegates to typeahead.tryDisplayResults', () => {
      const spy = sinon.spy();
      el.$.typeahead.tryDisplayResults = spy;
      el.displayResults();
      expect(spy).to.have.been.called;
    });

    test('hideResults delegates to typeahead.closeResults', () => {
      const spy = sinon.spy();
      el.$.typeahead.closeResults = spy;
      el.hideResults();
      expect(spy).to.have.been.called;
    });
  });

  suite('_onFocus', () => {
    test('copies value into typeahead.typedValue and shows results', () => {
      // `disabled` is set in setup, so the value observer is a no-op (avoids network calls).
      el.value = '/some/path';
      el.$.typeahead.tryDisplayResults = sinon.spy();
      el._onFocus();
      expect(el.$.typeahead.typedValue).to.equal('/some/path');
      expect(el.$.typeahead.tryDisplayResults).to.have.been.called;
    });
  });

  suite('_childrenChanged', () => {
    test('hides results when only one child matches the typed value', () => {
      el.$.typeahead.typedValue = '/abc';
      el.$.typeahead.closeResults = sinon.spy();
      el.children = [{ path: '/abc' }];
      expect(el.$.typeahead.closeResults).to.have.been.called;
    });

    test('builds data and displays results otherwise', () => {
      el.$.typeahead.typedValue = '/foo';
      el.$.typeahead.tryDisplayResults = sinon.spy();
      el.children = [{ path: '/foo/a' }, { path: '/foo/b' }];
      expect(el.data).to.deep.equal(['/foo/a/', '/foo/b/']);
      expect(el.$.typeahead.tryDisplayResults).to.have.been.called;
    });

    test('does nothing when children is undefined', () => {
      el.$.typeahead.tryDisplayResults = sinon.spy();
      el.children = undefined;
      expect(el.$.typeahead.tryDisplayResults).to.not.have.been.called;
    });
  });

  suite('_queryChildren', () => {
    test('builds NXQL query with parent uid and term', () => {
      el.$.provider.fetch = sinon.spy(() => Promise.resolve());
      el._queryChildren({ uid: 'parent-uid' }, 'docName');
      expect(el.params.queryParams).to.include("ecm:parentId = 'parent-uid'");
      expect(el.params.queryParams).to.include("ecm:name LIKE 'docName'");
      expect(el.$.provider.fetch).to.have.been.called;
    });

    test('builds NXQL query without term filter when term is empty', () => {
      el.$.provider.fetch = sinon.spy(() => Promise.resolve());
      el._queryChildren({ uid: 'parent-uid' }, '');
      expect(el.params.queryParams).to.not.include('ecm:name LIKE');
    });
  });

  suite('_getValidity', () => {
    test('returns true when value equals "/"', () => {
      el.value = '/';
      expect(el._getValidity()).to.be.true;
    });

    test('returns true when parent path matches value (no trailing slash)', () => {
      el.value = '/parent';
      el.parent = { path: '/parent' };
      el.children = null;
      expect(el._getValidity()).to.be.true;
    });

    test('returns true when one of the children matches value', () => {
      el.value = '/parent/child/';
      el.parent = { path: '/parent' };
      el.children = [{ path: '/parent/child' }];
      expect(el._getValidity()).to.be.true;
    });

    test('returns false when value does not match parent or children', () => {
      el.value = '/non/match/';
      el.parent = { path: '/parent' };
      el.children = [{ path: '/parent/child' }];
      expect(el._getValidity()).to.be.false;
    });
  });

  suite('_disabledChanged', () => {
    test('triggers _valueChanged when becoming enabled', () => {
      const spy = sinon.spy(el, '_valueChanged');
      el.disabled = true;
      el._disabledChanged();
      expect(spy).to.not.have.been.called;
      el.disabled = false;
      el._disabledChanged();
      expect(spy).to.have.been.called;
      spy.restore();
    });
  });

  suite('_updateParent', () => {
    test('resolves immediately when parent already matches', async () => {
      el.parent = { path: '/x' };
      el.$.parent.docPath = '/x';
      const result = await el._updateParent('/x');
      expect(result).to.be.undefined;
    });

    test('calls parent.get when newParentPath differs', async () => {
      el.parent = null;
      el.$.parent.docPath = '/old';
      el.$.parent.get = sinon.stub().returns(Promise.resolve({ path: '/new', uid: 'u1' }));
      await el._updateParent('/new');
      expect(el.$.parent.get).to.have.been.called;
      expect(el.parent.path).to.equal('/new');
    });
  });
});
