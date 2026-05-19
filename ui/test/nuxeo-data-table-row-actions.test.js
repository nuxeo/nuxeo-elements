import { fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-data-table/nuxeo-data-table-row-actions.js';

suite('nuxeo-data-table-row-actions', () => {
  let element;

  setup(async () => {
    element = await fixture(html`
      <nuxeo-data-table-row-actions editable orderable></nuxeo-data-table-row-actions>
    `);
    element.item = { title: 'Test Item' };
    element.index = 2;
    element.size = 5;
  });

  suite('_beforeBind', () => {
    test('should return early when beforeBind is null', () => {
      element._beforeBind(null, { base: { title: 'item' } }, 0, 5);
    });

    test('should call beforeBind function with correct data', () => {
      const spy = sinon.spy();
      const itemChange = { base: { title: 'Test' } };
      element._beforeBind(spy, itemChange, 2, 5);
      expect(spy).to.have.been.calledOnce;
      const args = spy.firstCall.args;
      expect(args[0]).to.deep.equal({ index: 2, item: { title: 'Test' }, size: 5 });
      expect(args[1]).to.equal(element);
    });

    test('should return early when beforeBind is undefined', () => {
      element._beforeBind(undefined, { base: {} }, 0, 3);
    });
  });

  suite('_editEntry', () => {
    test('should dispatch edit-entry event with item and index', () => {
      const spy = sinon.spy();
      element.addEventListener('edit-entry', spy);
      const mockEvent = { stopPropagation: sinon.spy() };
      element._editEntry(mockEvent);
      expect(mockEvent.stopPropagation).to.have.been.calledOnce;
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[0].detail.item).to.deep.equal({ title: 'Test Item' });
      expect(spy.firstCall.args[0].detail.index).to.equal(2);
    });

    test('should dispatch composed and bubbling event', () => {
      const spy = sinon.spy();
      element.addEventListener('edit-entry', spy);
      element._editEntry({ stopPropagation: () => {} });
      const event = spy.firstCall.args[0];
      expect(event.composed).to.be.true;
      expect(event.bubbles).to.be.true;
    });
  });

  suite('_deleteEntry', () => {
    test('should dispatch delete-entry event with item and index', () => {
      const spy = sinon.spy();
      element.addEventListener('delete-entry', spy);
      const mockEvent = { stopPropagation: sinon.spy() };
      element._deleteEntry(mockEvent);
      expect(mockEvent.stopPropagation).to.have.been.calledOnce;
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[0].detail.item).to.deep.equal({ title: 'Test Item' });
      expect(spy.firstCall.args[0].detail.index).to.equal(2);
    });

    test('should dispatch composed and bubbling event', () => {
      const spy = sinon.spy();
      element.addEventListener('delete-entry', spy);
      element._deleteEntry({ stopPropagation: () => {} });
      const event = spy.firstCall.args[0];
      expect(event.composed).to.be.true;
      expect(event.bubbles).to.be.true;
    });
  });

  suite('moveUp', () => {
    test('should dispatch move-upward event with item and index', () => {
      const spy = sinon.spy();
      element.addEventListener('move-upward', spy);
      const mockEvent = { stopPropagation: sinon.spy() };
      element.moveUp(mockEvent);
      expect(mockEvent.stopPropagation).to.have.been.calledOnce;
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[0].detail.item).to.deep.equal({ title: 'Test Item' });
      expect(spy.firstCall.args[0].detail.index).to.equal(2);
    });
  });

  suite('moveDown', () => {
    test('should dispatch move-downward event with item and index', () => {
      const spy = sinon.spy();
      element.addEventListener('move-downward', spy);
      const mockEvent = { stopPropagation: sinon.spy() };
      element.moveDown(mockEvent);
      expect(mockEvent.stopPropagation).to.have.been.calledOnce;
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[0].detail.item).to.deep.equal({ title: 'Test Item' });
      expect(spy.firstCall.args[0].detail.index).to.equal(2);
    });
  });

  suite('isUpVisible', () => {
    test('should return false when index is 0', () => {
      expect(element.isUpVisible(0)).to.be.false;
    });

    test('should return true when index > 0 and orderable', () => {
      expect(element.isUpVisible(1)).to.be.true;
    });

    test('should return true for larger index values', () => {
      expect(element.isUpVisible(5)).to.be.true;
    });

    test('should return false when not orderable', async () => {
      element.orderable = false;
      expect(element.isUpVisible(2)).to.be.false;
    });
  });

  suite('isDownVisible', () => {
    test('should return false when index is at last position', () => {
      expect(element.isDownVisible(4)).to.be.false;
    });

    test('should return true when index < size - 1', () => {
      expect(element.isDownVisible(2)).to.be.true;
    });

    test('should return true for index 0 with size > 1', () => {
      expect(element.isDownVisible(0)).to.be.true;
    });

    test('should return false when not orderable', async () => {
      element.orderable = false;
      expect(element.isDownVisible(0)).to.be.false;
    });
  });
});
