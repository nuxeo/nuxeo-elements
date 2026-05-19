import { fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-data-list/nuxeo-data-list.js';

suite('nuxeo-data-list', () => {
  let element;

  setup(async () => {
    element = await fixture(
      html`
        <nuxeo-data-list></nuxeo-data-list>
      `,
    );
    element.$.list.items = [{ title: 'Doc1' }, { title: 'Doc2' }, { title: 'Doc3' }];
    element.$.list.selectIndex = sinon.spy();
    element.$.list.focusItem = sinon.spy();
  });

  suite('_keydown', () => {
    test('should call _select(-1, 0) on ArrowUp', () => {
      const spy = sinon.spy(element, '_select');
      element._keydown({ key: 'ArrowUp' });
      expect(spy).to.have.been.calledWith(-1, 0);
      spy.restore();
    });

    test('should call _select(-1, 0) on k key', () => {
      const spy = sinon.spy(element, '_select');
      element._keydown({ key: 'k' });
      expect(spy).to.have.been.calledWith(-1, 0);
      spy.restore();
    });

    test('should call _select(1, 0) on ArrowDown', () => {
      const spy = sinon.spy(element, '_select');
      element._keydown({ key: 'ArrowDown' });
      expect(spy).to.have.been.calledWith(1, 0);
      spy.restore();
    });

    test('should call _select(1, 0) on j key', () => {
      const spy = sinon.spy(element, '_select');
      element._keydown({ key: 'j' });
      expect(spy).to.have.been.calledWith(1, 0);
      spy.restore();
    });

    test('should not call _select on unknown key', () => {
      const spy = sinon.spy(element, '_select');
      element._keydown({ key: 'x' });
      expect(spy).to.not.have.been.called;
      spy.restore();
    });

    test('should call _select(-1, 0) on Up key (legacy)', () => {
      const spy = sinon.spy(element, '_select');
      element._keydown({ key: 'Up' });
      expect(spy).to.have.been.calledWith(-1, 0);
      spy.restore();
    });

    test('should call _select(1, 0) on Down key (legacy)', () => {
      const spy = sinon.spy(element, '_select');
      element._keydown({ key: 'Down' });
      expect(spy).to.have.been.calledWith(1, 0);
      spy.restore();
    });
  });

  suite('_select', () => {
    test('should select next item when within bounds', () => {
      element.selectedItem = element.$.list.items[0];
      element._select(1, 0);
      expect(element.$.list.selectIndex).to.have.been.calledWith(1);
      expect(element.$.list.focusItem).to.have.been.calledWith(1);
    });

    test('should not select when index goes below 0', () => {
      element.selectedItem = element.$.list.items[0];
      element._select(-1, 0);
      expect(element.$.list.selectIndex).to.not.have.been.called;
    });

    test('should not select when index exceeds items length', () => {
      element.selectedItem = element.$.list.items[2];
      element._select(1, 0);
      expect(element.$.list.selectIndex).to.not.have.been.called;
    });

    test('should apply focusOffset correctly', () => {
      element.selectedItem = element.$.list.items[0];
      element._select(1, 2);
      expect(element.$.list.focusItem).to.have.been.calledWith(3);
    });
  });

  suite('selectNext', () => {
    test('should call _select(1, 0)', () => {
      const spy = sinon.spy(element, '_select');
      element.selectNext();
      expect(spy).to.have.been.calledWith(1, 0);
      spy.restore();
    });
  });

  suite('selectPrevious', () => {
    test('should call _select(-1, 0)', () => {
      const spy = sinon.spy(element, '_select');
      element.selectPrevious();
      expect(spy).to.have.been.calledWith(-1, 0);
      spy.restore();
    });
  });

  suite('_selectedItemIndex', () => {
    test('should return index of selectedItem when set', () => {
      element.selectedItem = element.$.list.items[1];
      expect(element._selectedItemIndex()).to.equal(1);
    });

    test('should return 0 when no selectedItem', () => {
      element.selectedItem = null;
      expect(element._selectedItemIndex()).to.equal(0);
    });

    test('should return 0 when selectedItem is undefined', () => {
      element.selectedItem = undefined;
      expect(element._selectedItemIndex()).to.equal(0);
    });
  });

  suite('_removeFilter', () => {
    test('should dispatch column-filter-changed event with correct detail', () => {
      const spy = sinon.spy();
      element.addEventListener('column-filter-changed', spy);
      const mockEvent = {
        model: {
          filter: { path: 'dc:title', expression: 'ILIKE', value: 'test' },
        },
      };
      element._removeFilter(mockEvent);
      expect(spy).to.have.been.calledOnce;
      const detail = spy.firstCall.args[0].detail;
      expect(detail.value).to.equal('');
      expect(detail.filterBy).to.equal('dc:title');
      expect(detail.filterExpression).to.equal('ILIKE');
    });

    test('should dispatch composed and bubbling event', () => {
      const spy = sinon.spy();
      element.addEventListener('column-filter-changed', spy);
      element._removeFilter({ model: { filter: { path: 'dc:title', expression: '' } } });
      const event = spy.firstCall.args[0];
      expect(event.composed).to.be.true;
      expect(event.bubbles).to.be.true;
    });
  });

  suite('_onScrollTo', () => {
    test('should call scrollToIndex with the provided index', () => {
      const stub = sinon.stub(element, 'scrollToIndex');
      element._onScrollTo({ detail: { index: 5 } });
      expect(stub).to.have.been.calledWith(5);
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

    test('should return true when element has offsetWidth', async () => {
      Object.defineProperty(element, 'offsetWidth', { value: 100, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 0, configurable: true });
      expect(element.visible).to.be.true;
    });

    test('should return true when element has offsetHeight', async () => {
      Object.defineProperty(element, 'offsetWidth', { value: 0, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });
      expect(element.visible).to.be.true;
    });
  });
});
