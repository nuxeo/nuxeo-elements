/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import { DraggableListBehavior } from '../nuxeo-draggable-list-behavior.js';

const makeBareHost = () => {
  const list = document.createElement('div');
  list.id = 'list';
  list.queryAllEffectiveChildren = (sel) => {
    if (!sel) return [];
    return Array.from(list.querySelectorAll(sel));
  };
  const host = {
    $: { list },
    dropTargetFilter: DraggableListBehavior.dropTargetFilter,
    draggableFilter: DraggableListBehavior.draggableFilter,
    _scrollList: DraggableListBehavior._scrollList,
    modelForElement: (el) => {
      return { item: el && el.dataset && el.dataset.item };
    },
  };
  const desc = Object.getOwnPropertyDescriptor(DraggableListBehavior, 'droptargets');
  Object.defineProperty(host, 'droptargets', desc);
  return host;
};

function makeInteractiveHost() {
  const list = document.createElement('div');
  list.id = 'list';
  list.style.width = '200px';
  list.style.height = '400px';
  list.style.overflow = 'auto';
  list.queryAllEffectiveChildren = (sel) => {
    if (!sel) return [];
    return Array.from(list.querySelectorAll(sel));
  };

  const host = {
    $: { list },
    draggable: true,
    selectedItems: [],
    style: { pointerEvents: '' },
    target: null,
    _mouseDownStarted: null,
    dropTargetFilter: DraggableListBehavior.dropTargetFilter,
    draggableFilter: DraggableListBehavior.draggableFilter,
    _scrollList: DraggableListBehavior._scrollList,
    modelForElement: (el) => {
      return { item: el && el.dataset && el.dataset.item };
    },
    fire: sinon.stub(),
    addEventListener: sinon.stub(),
  };

  const desc = Object.getOwnPropertyDescriptor(DraggableListBehavior, 'droptargets');
  Object.defineProperty(host, 'droptargets', desc);
  return host;
}

suite('Nuxeo.DraggableListBehavior', () => {
  test('default filters return true', () => {
    expect(DraggableListBehavior.dropTargetFilter()).to.be.true;
    expect(DraggableListBehavior.draggableFilter()).to.be.true;
  });

  test('properties block declares draggable as a boolean attribute', () => {
    expect(DraggableListBehavior.properties.draggable.type).to.equal(Boolean);
    expect(DraggableListBehavior.properties.draggable.value).to.be.false;
    expect(DraggableListBehavior.properties.draggable.reflectToAttribute).to.be.true;
  });

  test('dropTargetFilter / draggableFilter property accessors yield bound functions', () => {
    expect(DraggableListBehavior.properties.dropTargetFilter.type).to.equal(Function);
    expect(DraggableListBehavior.properties.draggableFilter.type).to.equal(Function);
  });

  test('droptargets returns the slotted children when filter passes', () => {
    const host = makeBareHost();
    const a = document.createElement('div');
    a.dataset.item = 'a';
    host.$.list.appendChild(a);
    const result = host.droptargets;
    expect(result).to.include(a);
  });

  test('droptargets returns empty when no children', () => {
    const host = makeBareHost();
    const result = host.droptargets;
    expect(result).to.be.an('array').that.is.empty;
  });

  test('droptargets filters out elements that fail dropTargetFilter', () => {
    const host = makeBareHost();
    host.dropTargetFilter = (el) => el.dataset.item === 'keep';
    const a = document.createElement('div');
    a.dataset.item = 'keep';
    const b = document.createElement('div');
    b.dataset.item = 'skip';
    host.$.list.appendChild(a);
    host.$.list.appendChild(b);
    const result = host.droptargets;
    expect(result).to.have.lengthOf(1);
    expect(result[0]).to.equal(a);
  });

  test('_scrollList scrolls down when mouse is near the bottom', () => {
    const host = makeBareHost();
    let scrollTop = 0;
    Object.defineProperty(host.$.list, 'scrollTop', {
      get: () => scrollTop,
      set: (v) => {
        scrollTop = v;
      },
      configurable: true,
    });
    host.$.list.getBoundingClientRect = () => {
      return { top: 0, bottom: 100, left: 0, right: 100, width: 100, height: 100 };
    };
    host._scrollList({ pageY: 95 });
    expect(scrollTop).to.equal(30);
  });

  test('_scrollList scrolls up when mouse is near the top', () => {
    const host = makeBareHost();
    let scrollTop = 50;
    Object.defineProperty(host.$.list, 'scrollTop', {
      get: () => scrollTop,
      set: (v) => {
        scrollTop = v;
      },
      configurable: true,
    });
    host.$.list.getBoundingClientRect = () => {
      return { top: 0, bottom: 1000, left: 0, right: 100, width: 100, height: 1000 };
    };
    host._scrollList({ pageY: 5 });
    expect(scrollTop).to.equal(20);
  });

  test('_scrollList does nothing when mouse is in the middle', () => {
    const host = makeBareHost();
    let scrollTop = 50;
    Object.defineProperty(host.$.list, 'scrollTop', {
      get: () => scrollTop,
      set: (v) => {
        scrollTop = v;
      },
      configurable: true,
    });
    host.$.list.getBoundingClientRect = () => {
      return { top: 0, bottom: 1000, left: 0, right: 100, width: 100, height: 1000 };
    };
    host._scrollList({ pageY: 500 });
    expect(scrollTop).to.equal(50);
  });

  test('_scrollList does not scroll up when mouse is above the container top', () => {
    const host = makeBareHost();
    let scrollTop = 50;
    Object.defineProperty(host.$.list, 'scrollTop', {
      get: () => scrollTop,
      set: (v) => {
        scrollTop = v;
      },
      configurable: true,
    });
    host.$.list.getBoundingClientRect = () => {
      return {
        top: 100,
        bottom: 1000,
        left: 0,
        right: 100,
        width: 100,
        height: 900,
      };
    };
    host._scrollList({ pageY: 50 });
    expect(scrollTop).to.equal(50);
  });

  suite('attached (mousedown interaction)', () => {
    test('mousedown listener is registered during attached', () => {
      const host = makeInteractiveHost();
      DraggableListBehavior.attached.call(host);
      expect(host.addEventListener).to.have.been.calledWith('mousedown', sinon.match.func);
    });

    test('mousedown handler adds document listeners when draggable and filter passes', () => {
      const host = makeInteractiveHost();
      DraggableListBehavior.attached.call(host);
      const mousedownCb = host.addEventListener.firstCall.args[1];

      const addStub = sinon.stub(document, 'addEventListener');
      try {
        mousedownCb({ target: document.createElement('div'), preventDefault: sinon.stub() });
        expect(addStub).to.have.been.calledWith('mousemove', sinon.match.func);
        expect(addStub).to.have.been.calledWith('mouseup', sinon.match.func);
      } finally {
        addStub.restore();
      }
    });

    test('mousedown handler does nothing when draggable is false', () => {
      const host = makeInteractiveHost();
      host.draggable = false;
      DraggableListBehavior.attached.call(host);
      const mousedownCb = host.addEventListener.firstCall.args[1];

      const addStub = sinon.stub(document, 'addEventListener');
      try {
        mousedownCb({ target: document.createElement('div'), preventDefault: sinon.stub() });
        expect(addStub).to.not.have.been.called;
      } finally {
        addStub.restore();
      }
    });

    test('mousedown handler does nothing when draggableFilter returns false', () => {
      const host = makeInteractiveHost();
      host.draggableFilter = () => false;
      DraggableListBehavior.attached.call(host);
      const mousedownCb = host.addEventListener.firstCall.args[1];

      const addStub = sinon.stub(document, 'addEventListener');
      try {
        mousedownCb({ target: document.createElement('div'), preventDefault: sinon.stub() });
        expect(addStub).to.not.have.been.called;
      } finally {
        addStub.restore();
      }
    });

    test('mouseup cleans up listeners and fires event on target', (done) => {
      const host = makeInteractiveHost();
      const targetEl = document.createElement('div');
      targetEl.dataset.item = 'docA';
      host.selectedItems = [{ uid: '1' }];
      host.$.list.appendChild(targetEl);
      host.$.list.getBoundingClientRect = () => {
        return {
          top: 0,
          bottom: 1000,
          left: 0,
          right: 200,
          width: 200,
          height: 1000,
        };
      };

      DraggableListBehavior.attached.call(host);
      const mousedownCb = host.addEventListener.firstCall.args[1];

      const docListeners = {};
      sinon.stub(document, 'addEventListener').callsFake((name, fn) => {
        docListeners[name] = fn;
      });
      sinon.stub(document, 'removeEventListener').callsFake((name) => {
        delete docListeners[name];
      });

      try {
        host._mouseDownStarted = 0;
        mousedownCb({ target: targetEl, preventDefault: sinon.stub() });
        expect(docListeners.mousemove).to.be.a('function');
        expect(docListeners.mouseup).to.be.a('function');

        host.target = targetEl;
        docListeners.mouseup();

        expect(host._mouseDownStarted).to.be.null;
        expect(host.style.pointerEvents).to.equal('');
        expect(host.fire).to.have.been.calledWith('nuxeo-documents-dropped');
      } finally {
        document.addEventListener.restore();
        document.removeEventListener.restore();
      }
      done();
    });

    test('mouseup removes proxy from body', (done) => {
      const host = makeInteractiveHost();
      host.selectedItems = [{ uid: '1' }];
      host.$.list.getBoundingClientRect = () => {
        return {
          top: 0,
          bottom: 1000,
          left: 0,
          right: 200,
          width: 200,
          height: 1000,
        };
      };

      DraggableListBehavior.attached.call(host);
      const mousedownCb = host.addEventListener.firstCall.args[1];

      const docListeners = {};
      sinon.stub(document, 'addEventListener').callsFake((name, fn) => {
        docListeners[name] = fn;
      });
      sinon.stub(document, 'removeEventListener').callsFake((name) => {
        delete docListeners[name];
      });

      try {
        host._mouseDownStarted = 0;
        mousedownCb({ target: document.createElement('div'), preventDefault: sinon.stub() });

        host._mouseDownStarted = Date.now() - 200;
        docListeners.mousemove({
          pageX: 50,
          pageY: 500,
          clientX: 50,
          clientY: 500,
        });

        docListeners.mouseup();
        expect(document.querySelector('nuxeo-drag-proxy')).to.be.null;
      } finally {
        document.addEventListener.restore();
        document.removeEventListener.restore();
      }
      done();
    });
  });

  suite('DragProxy element', () => {
    test('renders a counter and supports setPosition', async () => {
      const proxy = await fixture(
        html`
          <nuxeo-drag-proxy></nuxeo-drag-proxy>
        `,
      );
      proxy.counter = 5;
      proxy.setPosition(123, 456);
      expect(proxy.style.left).to.equal('123px');
      expect(proxy.style.top).to.equal('456px');
      expect(proxy.constructor.is).to.equal('nuxeo-drag-proxy');
    });

    test('is custom element with correct is property', () => {
      expect(Nuxeo.DragProxy).to.exist;
      expect(Nuxeo.DragProxy.is).to.equal('nuxeo-drag-proxy');
    });
  });
});
