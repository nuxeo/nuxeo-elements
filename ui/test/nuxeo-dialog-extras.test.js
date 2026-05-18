import { fixture, html } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-dialog.js';

suite('nuxeo-dialog extras', () => {
  suite('disconnectedCallback', () => {
    test('calls detached() when _observer is truthy', async () => {
      const el = await fixture(
        html`
          <nuxeo-dialog></nuxeo-dialog>
        `,
      );
      el._observer = {};
      const detachedStub = sinon.stub(el, 'detached');
      const clearSpy = sinon.spy(el, '_clear');
      el.disconnectedCallback();
      expect(detachedStub).to.have.been.calledOnce;
      expect(clearSpy).to.have.been.calledOnce;
      clearSpy.restore();
    });

    test('skips detached() when _observer is falsy', async () => {
      const el = await fixture(
        html`
          <nuxeo-dialog></nuxeo-dialog>
        `,
      );
      el._observer = null;
      sinon.stub(el, 'detached');
      el.disconnectedCallback();
      expect(el.detached).to.not.have.been.called;
    });

    test('always calls _clear on disconnect', async () => {
      const el = await fixture(
        html`
          <nuxeo-dialog></nuxeo-dialog>
        `,
      );
      el._observer = null;
      sinon.stub(el, 'detached');
      const clearSpy = sinon.spy(el, '_clear');
      el.disconnectedCallback();
      expect(clearSpy).to.have.been.calledOnce;
      clearSpy.restore();
    });
  });

  suite('_opened', () => {
    test('does not reparent backdrop when reparent=true but withBackdrop=false', async () => {
      const el = await fixture(
        html`
          <nuxeo-dialog reparent></nuxeo-dialog>
        `,
      );
      const parent = el.parentNode;
      const insertSpy = sinon.spy(parent, 'insertBefore');
      const fakeEvent = { target: { withBackdrop: false, parentNode: parent, backdropElement: null } };
      el._opened(fakeEvent);
      expect(insertSpy).to.not.have.been.called;
      insertSpy.restore();
    });

    test('does not reparent backdrop when reparent=false and not iOS', async () => {
      const el = await fixture(
        html`
          <nuxeo-dialog></nuxeo-dialog>
        `,
      );
      const parent = el.parentNode;
      const fakeBackdrop = document.createElement('div');
      parent.appendChild(fakeBackdrop);
      const insertSpy = sinon.spy(parent, 'insertBefore');
      const fakeEvent = {
        target: {
          withBackdrop: false,
          parentNode: parent,
          backdropElement: fakeBackdrop,
        },
      };
      el._opened(fakeEvent);
      expect(insertSpy).to.not.have.been.called;
      insertSpy.restore();
    });

    test('stamps template on first open when template exists', async () => {
      const el = await fixture(html`
        <nuxeo-dialog>
          <template><div id="stamped-content">Hello</div></template>
        </nuxeo-dialog>
      `);
      expect(el._instance).to.not.be.ok;
      const parent = el.parentNode;
      const fakeEvent = {
        target: {
          withBackdrop: false,
          parentNode: parent,
          backdropElement: document.createElement('div'),
        },
      };
      el._opened(fakeEvent);
      expect(el._instance).to.be.ok;
    });

    test('does not re-stamp when _instance already exists', async () => {
      const el = await fixture(html`
        <nuxeo-dialog>
          <template><div>Hello</div></template>
        </nuxeo-dialog>
      `);
      const parent = el.parentNode;
      const fakeEvent = {
        target: {
          withBackdrop: false,
          parentNode: parent,
          backdropElement: document.createElement('div'),
        },
      };
      el._opened(fakeEvent);
      const firstInstance = el._instance;
      el._opened(fakeEvent);
      expect(el._instance).to.equal(firstInstance);
    });

    test('does nothing when no template is present and _instance is null', async () => {
      const el = await fixture(
        html`
          <nuxeo-dialog></nuxeo-dialog>
        `,
      );
      const parent = el.parentNode;
      const fakeEvent = {
        target: {
          withBackdrop: false,
          parentNode: parent,
          backdropElement: document.createElement('div'),
        },
      };
      el._opened(fakeEvent);
      expect(el._instance).to.not.be.ok;
    });

    test('skips templatize when _templatizerTemplate already set', async () => {
      const el = await fixture(html`
        <nuxeo-dialog>
          <template><div>Content</div></template>
        </nuxeo-dialog>
      `);
      const parent = el.parentNode;
      const fakeEvent = {
        target: {
          withBackdrop: false,
          parentNode: parent,
          backdropElement: document.createElement('div'),
        },
      };
      el._opened(fakeEvent);
      const inst = el._instance;
      el._instance = null;
      el._opened(fakeEvent);
      expect(el._instance).to.be.ok;
      expect(el._instance).to.not.equal(inst);
    });
  });

  suite('_clear', () => {
    test('removes instance children and nullifies _instance', async () => {
      const el = await fixture(html`
        <nuxeo-dialog>
          <template><div>Hello</div></template>
        </nuxeo-dialog>
      `);
      const parent = el.parentNode;
      const fakeEvent = {
        target: {
          withBackdrop: false,
          parentNode: parent,
          backdropElement: document.createElement('div'),
        },
      };
      el._opened(fakeEvent);
      expect(el._instance).to.be.ok;
      el._clear();
      expect(el._instance).to.be.null;
    });

    test('is a no-op when _instance is null', async () => {
      const el = await fixture(
        html`
          <nuxeo-dialog></nuxeo-dialog>
        `,
      );
      el._instance = null;
      expect(() => el._clear()).to.not.throw();
      expect(el._instance).to.be.null;
    });

    test('handles _instance with empty children array', async () => {
      const el = await fixture(
        html`
          <nuxeo-dialog></nuxeo-dialog>
        `,
      );
      el._instance = { children: [] };
      el._clear();
      expect(el._instance).to.be.null;
    });
  });

  suite('_forwardHostPropV2', () => {
    test('forwards prop to instance when _instance exists', async () => {
      const el = await fixture(
        html`
          <nuxeo-dialog></nuxeo-dialog>
        `,
      );
      const fakeInstance = { forwardHostProp: sinon.stub() };
      el._instance = fakeInstance;
      el._forwardHostPropV2('testProp', 42);
      expect(fakeInstance.forwardHostProp).to.have.been.calledWith('testProp', 42);
    });

    test('is a no-op when _instance is null', async () => {
      const el = await fixture(
        html`
          <nuxeo-dialog></nuxeo-dialog>
        `,
      );
      el._instance = null;
      expect(() => el._forwardHostPropV2('testProp', 42)).to.not.throw();
    });
  });
});
