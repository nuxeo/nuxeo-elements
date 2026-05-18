import { fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-data-grid/nuxeo-data-grid.js';

suite('nuxeo-data-grid', () => {
  let element;

  setup(async () => {
    element = await fixture(
      html`
        <nuxeo-data-grid></nuxeo-data-grid>
      `,
    );
    element.$.list.scrollTop = 10;
  });

  suite('_handleKeyDown', () => {
    test('should reset scrollTop to 0 on Tab when at last visible index', () => {
      element._lastIndexValue = 5;
      Object.defineProperty(element.$.list, 'lastVisibleIndex', {
        get: () => 5,
        configurable: true,
      });
      element.$.list.scrollTop = 100;
      element._handleKeyDown({ key: 'Tab' });
      expect(element.$.list.scrollTop).to.equal(0);
    });

    test('should reset scrollTop on Tab when lastVisibleIndex is lastIndexValue - 1', () => {
      element._lastIndexValue = 5;
      Object.defineProperty(element.$.list, 'lastVisibleIndex', {
        get: () => 4,
        configurable: true,
      });
      element.$.list.scrollTop = 100;
      element._handleKeyDown({ key: 'Tab' });
      expect(element.$.list.scrollTop).to.equal(0);
    });

    test('should not reset scrollTop on Tab when not at last index', () => {
      element._lastIndexValue = 10;
      Object.defineProperty(element.$.list, 'lastVisibleIndex', {
        get: () => 3,
        configurable: true,
      });
      const spy = sinon.spy();
      Object.defineProperty(element.$.list, 'scrollTop', {
        get: () => 100,
        set: spy,
        configurable: true,
      });
      element._handleKeyDown({ key: 'Tab' });
      expect(spy).to.not.have.been.called;
    });

    test('should not modify scrollTop on non-Tab keys', () => {
      const spy = sinon.spy();
      Object.defineProperty(element.$.list, 'scrollTop', {
        get: () => 50,
        set: spy,
        configurable: true,
      });
      element._handleKeyDown({ key: 'ArrowDown' });
      expect(spy).to.not.have.been.called;
    });

    test('should not modify scrollTop on Enter key', () => {
      const spy = sinon.spy();
      Object.defineProperty(element.$.list, 'scrollTop', {
        get: () => 75,
        set: spy,
        configurable: true,
      });
      element._handleKeyDown({ key: 'Enter' });
      expect(spy).to.not.have.been.called;
    });
  });

  suite('_lastIndexChanged', () => {
    test('should set _lastIndexValue to the given lastIndex', () => {
      element._lastIndexChanged(42);
      expect(element._lastIndexValue).to.equal(42);
    });

    test('should set _lastIndexValue to 0', () => {
      element._lastIndexChanged(0);
      expect(element._lastIndexValue).to.equal(0);
    });

    test('should update _lastIndexValue when called multiple times', () => {
      element._lastIndexChanged(10);
      expect(element._lastIndexValue).to.equal(10);
      element._lastIndexChanged(20);
      expect(element._lastIndexValue).to.equal(20);
    });
  });

  suite('_removeFilter', () => {
    test('should dispatch column-filter-changed event with correct detail', () => {
      const spy = sinon.spy();
      element.addEventListener('column-filter-changed', spy);
      const mockEvent = {
        model: {
          filter: { path: 'dc:creator', expression: 'LIKE', value: 'admin' },
        },
      };
      element._removeFilter(mockEvent);
      expect(spy).to.have.been.calledOnce;
      const detail = spy.firstCall.args[0].detail;
      expect(detail.value).to.equal('');
      expect(detail.filterBy).to.equal('dc:creator');
      expect(detail.filterExpression).to.equal('LIKE');
    });

    test('should dispatch composed and bubbling event', () => {
      const spy = sinon.spy();
      element.addEventListener('column-filter-changed', spy);
      element._removeFilter({ model: { filter: { path: 'dc:title', expression: '' } } });
      const event = spy.firstCall.args[0];
      expect(event.composed).to.be.true;
      expect(event.bubbles).to.be.true;
    });

    test('should set empty string as value', () => {
      const spy = sinon.spy();
      element.addEventListener('column-filter-changed', spy);
      element._removeFilter({ model: { filter: { path: 'dc:title', expression: 'ILIKE' } } });
      expect(spy.firstCall.args[0].detail.value).to.equal('');
    });
  });

  suite('_onScrollTo', () => {
    test('should call scrollToIndex with the provided index', () => {
      const stub = sinon.stub(element, 'scrollToIndex');
      element._onScrollTo({ detail: { index: 7 } });
      expect(stub).to.have.been.calledWith(7);
      stub.restore();
    });

    test('should call scrollToIndex with 0', () => {
      const stub = sinon.stub(element, 'scrollToIndex');
      element._onScrollTo({ detail: { index: 0 } });
      expect(stub).to.have.been.calledWith(0);
      stub.restore();
    });
  });

  suite('draggableFilter', () => {
    test('should return true when element is selected', () => {
      expect(element.draggableFilter({ selected: true })).to.be.true;
    });

    test('should return false when element is not selected', () => {
      expect(element.draggableFilter({ selected: false })).to.be.false;
    });

    test('should return undefined when selected is not set', () => {
      expect(element.draggableFilter({})).to.be.undefined;
    });
  });

  suite('visible getter', () => {
    test('should return false when element has no dimensions', () => {
      Object.defineProperty(element, 'offsetWidth', { value: 0, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 0, configurable: true });
      expect(element.visible).to.be.false;
    });

    test('should return true when element has offsetWidth', () => {
      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 0, configurable: true });
      expect(element.visible).to.be.true;
    });

    test('should return true when element has offsetHeight', () => {
      Object.defineProperty(element, 'offsetWidth', { value: 0, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 150, configurable: true });
      expect(element.visible).to.be.true;
    });
  });

  suite('properties', () => {
    test('should default multiSelection to true', () => {
      expect(element.multiSelection).to.be.true;
    });

    test('should default displayNavigation to false', () => {
      expect(element.displayNavigation).to.be.false;
    });

    test('should default _lastIndex to 0', () => {
      expect(element._lastIndex).to.equal(0);
    });

    test('should default _lastIndexValue to 0', () => {
      expect(element._lastIndexValue).to.equal(0);
    });
  });
});
