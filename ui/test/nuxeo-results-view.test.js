/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../search/nuxeo-results-view.js';

suite('nuxeo-results-view', () => {
  let element;

  setup(async () => {
    element = await fixture(
      html`
        <nuxeo-results-view></nuxeo-results-view>
      `,
    );
  });

  suite('ready', () => {
    test('sets _nxProvider to the internal page provider', () => {
      expect(element._nxProvider).to.equal(element.$.provider);
    });
  });

  suite('_expandIcon', () => {
    test('returns arrow-down when opened is true', () => {
      expect(element._expandIcon(true)).to.equal('hardware:keyboard-arrow-down');
    });

    test('returns arrow-right when opened is false', () => {
      expect(element._expandIcon(false)).to.equal('hardware:keyboard-arrow-right');
    });
  });

  suite('_countParams', () => {
    test('counts non-empty params', () => {
      expect(element._countParams({ a: 'x', b: 'y', c: '' })).to.equal(2);
    });

    test('counts non-empty arrays only', () => {
      expect(element._countParams({ a: [1, 2], b: [], c: 'z' })).to.equal(2);
    });

    test('returns 0 for empty object', () => {
      expect(element._countParams({})).to.equal(0);
    });

    test('excludes null and undefined values', () => {
      expect(element._countParams({ a: null, b: undefined, c: 'valid' })).to.equal(1);
    });

    test('excludes zero and false values', () => {
      expect(element._countParams({ a: 0, b: false, c: 'yes' })).to.equal(1);
    });
  });

  suite('_getFilterCount', () => {
    test('returns 0 when _params is null', () => {
      element._params = null;
      expect(element._getFilterCount()).to.equal(0);
    });

    test('returns count minus original params count', () => {
      element._params = { ecm_fulltext: 'hello', dc_creator: 'admin' };
      element._paramsCount = 1;
      expect(element._getFilterCount()).to.equal(1);
    });

    test('subtracts highlight key if present', () => {
      element._params = { ecm_fulltext: 'hello', highlight: 'dc:title', dc_creator: 'admin' };
      element._paramsCount = 1;
      expect(element._getFilterCount()).to.equal(1);
    });

    test('returns 0 when all params are original', () => {
      element._params = { ecm_fulltext: 'hello' };
      element._paramsCount = 1;
      expect(element._getFilterCount()).to.equal(0);
    });
  });

  suite('_computeHideCounter', () => {
    test('returns hidden when opened is true', () => {
      element._params = { ecm_fulltext: 'test' };
      element._paramsCount = 0;
      expect(element._computeHideCounter(true)).to.equal('hidden');
    });

    test('returns hidden when count is 0', () => {
      element._params = {};
      element._paramsCount = 0;
      expect(element._computeHideCounter(false)).to.equal('hidden');
    });

    test('returns empty string when closed and count > 0', () => {
      element._params = { ecm_fulltext: 'test', other: 'val' };
      element._paramsCount = 0;
      expect(element._computeHideCounter(false)).to.equal('');
    });
  });

  suite('_paramsChanged', () => {
    test('parses string params', () => {
      element.params = '{"foo":"bar"}';
      element._paramsChanged();
      expect(element._params).to.deep.equal({ foo: 'bar' });
      expect(element._paramsCount).to.equal(1);
    });

    test('clones object params', () => {
      const obj = { a: '1', b: '2' };
      element.params = obj;
      element._paramsChanged();
      expect(element._params).to.deep.equal(obj);
      expect(element._params).to.not.equal(obj);
      expect(element._paramsCount).to.equal(2);
    });

    test('sets empty object when params is null', () => {
      element.params = null;
      element._paramsChanged();
      expect(element._params).to.deep.equal({});
      expect(element._paramsCount).to.equal(0);
    });

    test('sets empty object when params is undefined', () => {
      element.params = undefined;
      element._paramsChanged();
      expect(element._params).to.deep.equal({});
      expect(element._paramsCount).to.equal(0);
    });
  });

  suite('_visibilityOrAutoChanged', () => {
    test('calls _search when visible and auto', () => {
      const stub = sinon.stub(element, '_search');
      element.visible = true;
      element.auto = true;
      expect(stub).to.have.been.called;
      stub.restore();
    });

    test('does not call _search when not visible', () => {
      const stub = sinon.stub(element, '_search');
      element.visible = false;
      element.auto = true;
      expect(stub).to.not.have.been.called;
      stub.restore();
    });

    test('does not call _search when auto is false', () => {
      const stub = sinon.stub(element, '_search');
      element.visible = true;
      element.auto = false;
      expect(stub).to.not.have.been.called;
      stub.restore();
    });
  });

  suite('_onError', () => {
    test('calls notify with error detail and stops propagation', () => {
      const stub = sinon.stub(element, 'notify');
      const e = {
        detail: { error: 'Something went wrong' },
        stopPropagation: sinon.stub(),
      };
      element._onError(e);
      expect(stub).to.have.been.calledWith('Something went wrong');
      expect(e.stopPropagation).to.have.been.called;
      stub.restore();
    });
  });

  suite('_clear', () => {
    test('calls form.clear when form exists', () => {
      const fakeForm = { clear: sinon.stub(), aggregations: null };
      sinon.stub(element, '$$').callsFake((sel) => {
        if (sel === '#form') return { element: fakeForm };
        return null;
      });
      element.params = { a: '1' };
      element._paramsChanged();
      element.auto = false;
      element.visible = false;
      element._clear();
      expect(fakeForm.clear).to.have.been.calledOnce;
      element.$$.restore();
    });

    test('resets aggregations when auto is false', () => {
      element.auto = false;
      element.visible = false;
      element.aggregations = { bucket: [1, 2] };
      element._clear();
      expect(element.aggregations).to.deep.equal({});
    });

    test('does not reset aggregations when auto is true', () => {
      element.auto = true;
      element.visible = false;
      element.aggregations = { bucket: [1, 2] };
      sinon.stub(element, '_search');
      element._clear();
      expect(element.aggregations).to.deep.equal({ bucket: [1, 2] });
      element._search.restore();
    });

    test('triggers search when not auto and visible', () => {
      const stub = sinon.stub(element, '_search');
      element.auto = false;
      element.visible = true;
      element._clear();
      expect(stub).to.have.been.called;
      stub.restore();
    });

    test('does not trigger search when not visible', () => {
      const stub = sinon.stub(element, '_search');
      element.auto = false;
      element.visible = false;
      element._clear();
      expect(stub).to.not.have.been.called;
      stub.restore();
    });
  });

  suite('_aggregationsChanged', () => {
    test('sets aggregations on form when form exists', () => {
      const fakeForm = { aggregations: null };
      sinon.stub(element, '$$').callsFake((sel) => {
        if (sel === '#form') return { element: fakeForm };
        return null;
      });
      element.aggregations = { myAgg: [1, 2] };
      element._aggregationsChanged();
      expect(fakeForm.aggregations).to.deep.equal({ myAgg: [1, 2] });
      element.$$.restore();
    });

    test('does nothing when form is not available', () => {
      sinon.stub(element, '$$').returns(null);
      element.aggregations = { myAgg: [1] };
      element._aggregationsChanged();
      element.$$.restore();
    });
  });

  suite('_searchFormChanged', () => {
    test('sets _nxProvider and provider from searchForm', () => {
      const fakeProvider = { provider: 'my_provider' };
      const searchForm = { nxProvider: fakeProvider, searchName: 'mySearch', results: null };
      element._searchFormChanged(searchForm);
      expect(element._nxProvider).to.equal(fakeProvider);
      expect(element.provider).to.equal('my_provider');
      expect(element.searchName).to.equal('mySearch');
    });

    test('does nothing when searchForm is null', () => {
      const prev = element._nxProvider;
      element._searchFormChanged(null);
      expect(element._nxProvider).to.equal(prev);
    });
  });

  suite('_navigateFromSearch', () => {
    test('calls searchForm.displayQueue when searchForm exists', () => {
      const fakeForm = {
        nxProvider: { provider: 'test_provider' },
        searchName: 'test',
        displayQueue: sinon.stub(),
        results: null,
      };
      element.searchForm = fakeForm;
      element._navigateFromSearch({ detail: { index: 3 } });
      expect(fakeForm.displayQueue).to.have.been.calledWith(3);
    });

    test('does nothing when searchForm is null', () => {
      element.searchForm = null;
      element._navigateFromSearch({ detail: { index: 0 } });
    });
  });

  suite('_resultsChanged', () => {
    test('forwards results-changed event', () => {
      const spy = sinon.spy();
      element.addEventListener('results-changed', spy);
      element._resultsChanged({ detail: { value: [1, 2, 3] } });
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[0].detail).to.deep.equal({ value: [1, 2, 3] });
    });

    test('sets searchForm.results when searchForm and results exist', () => {
      const fakeResults = { results: [{ uid: 'a' }] };
      sinon.stub(element, '$$').callsFake((sel) => {
        if (sel === '#results') return fakeResults;
        return null;
      });
      const fakeForm = {
        nxProvider: { provider: 'test_pp' },
        searchName: 'test',
        results: null,
      };
      element.searchForm = fakeForm;
      element._resultsChanged({ detail: {} });
      expect(fakeForm.results).to.deep.equal([{ uid: 'a' }]);
      element.$$.restore();
    });
  });

  suite('form getter', () => {
    test('returns null when #form element is not found', () => {
      sinon.stub(element, '$$').returns(null);
      expect(element.form).to.be.null;
      element.$$.restore();
    });

    test('returns element property of #form', () => {
      const fakeEl = { clear: sinon.stub() };
      sinon.stub(element, '$$').returns({ element: fakeEl });
      expect(element.form).to.equal(fakeEl);
      element.$$.restore();
    });
  });

  suite('results getter', () => {
    test('returns results element', () => {
      sinon.stub(element, '$$').callsFake((sel) => {
        if (sel === '#results') return { reset: sinon.stub(), fetch: sinon.stub() };
        return null;
      });
      expect(element.results).to.exist;
      element.$$.restore();
    });
  });
});
