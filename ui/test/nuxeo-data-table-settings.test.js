import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '../nuxeo-data-table/data-table-settings.js';

suite('nuxeo-data-table-settings', () => {
  let element;

  setup(async () => {
    element = await fixture(
      html`
        <nuxeo-data-table-settings></nuxeo-data-table-settings>
      `,
    );
    element.columns = [
      { name: 'Title', hidden: false, hiddenBack: false, alwaysVisible: true },
      { name: 'Modified', hidden: false, hiddenBack: false, alwaysVisible: false },
      { name: 'Author', hidden: true, hiddenBack: true, alwaysVisible: false },
    ];
  });

  suite('toggleColsSettingsPopup', () => {
    test('should call toggle on the dialog', () => {
      const dialog = element.$$('#columnsSettingsPopup');
      const stub = sinon.stub(dialog, 'toggle');
      element.toggleColsSettingsPopup();
      expect(stub).to.have.been.calledOnce;
      stub.restore();
    });
  });

  suite('_columnDisplayChanged', () => {
    test('should dispatch settings-changed when path ends with hidden', () => {
      const spy = sinon.spy();
      element.addEventListener('settings-changed', spy);
      element._columnDisplayChanged({ path: 'columns.1.hidden', value: true });
      expect(spy).to.have.been.calledOnce;
    });

    test('should dispatch composed and bubbling event', () => {
      const spy = sinon.spy();
      element.addEventListener('settings-changed', spy);
      element._columnDisplayChanged({ path: 'columns.0.hidden', value: false });
      const event = spy.firstCall.args[0];
      expect(event.composed).to.be.true;
      expect(event.bubbles).to.be.true;
    });

    test('should NOT dispatch when path does not end with hidden', () => {
      const spy = sinon.spy();
      element.addEventListener('settings-changed', spy);
      element._columnDisplayChanged({ path: 'columns.1.name', value: 'New Name' });
      expect(spy).to.not.have.been.called;
    });

    test('should NOT dispatch when path ends with hiddenBack', () => {
      const spy = sinon.spy();
      element.addEventListener('settings-changed', spy);
      element._columnDisplayChanged({ path: 'columns.1.hiddenBack', value: true });
      expect(spy).to.not.have.been.called;
    });
  });

  // what the column checkbox does when the user clicks it
  const toggle = (idx) => {
    const column = element.columns[idx];
    element._columnToggled({ model: { column }, target: { checked: column.hidden } });
  };

  suite('saving without the choice of where changes apply', () => {
    test('should fire settings-changed at each change while the dialog is open, as before', () => {
      element.toggleColsSettingsPopup();
      const spy = sinon.spy();
      element.addEventListener('settings-changed', spy);
      toggle(1);
      expect(spy.callCount).to.equal(1);
      toggle(2);
      expect(spy.callCount).to.equal(2);
      element._onSettingsClosed();
      expect(spy.callCount).to.equal(2);
    });
  });

  suite('saving when the dialog closes', () => {
    setup(() => {
      element.scopeEnabled = true;
    });

    test('should not fire settings-changed while the dialog is open', () => {
      element.toggleColsSettingsPopup();
      const spy = sinon.spy();
      element.addEventListener('settings-changed', spy);
      toggle(1);
      toggle(2);
      expect(spy).to.not.have.been.called;
    });

    test('should fire settings-changed once when the dialog closes after changes', () => {
      element.toggleColsSettingsPopup();
      const spy = sinon.spy();
      element.addEventListener('settings-changed', spy);
      toggle(1);
      toggle(2);
      element._onSettingsClosed();
      expect(spy).to.have.been.calledOnce;
    });

    test('should not fire settings-changed when the dialog closes without changes', () => {
      element.toggleColsSettingsPopup();
      const spy = sinon.spy();
      element.addEventListener('settings-changed', spy);
      element._onSettingsClosed();
      expect(spy).to.not.have.been.called;
    });

    test('should tell whether column changes are pending when a scope is picked', async () => {
      element.toggleColsSettingsPopup();
      await flush();
      const spy = sinon.spy();
      element.addEventListener('settings-scope-selected', spy);
      toggle(1);
      element.shadowRoot.querySelector('paper-radio-button[name="document"]').click();
      expect(spy.firstCall.args[0].detail).to.deep.equal({ scope: 'document', pendingChanges: true });
    });

    test('should mark a change as pending when the user clicks a column checkbox', async () => {
      element.toggleColsSettingsPopup();
      await flush();
      element.shadowRoot.querySelector('paper-checkbox').click();
      expect(element.pendingChanges).to.be.true;
    });

    test('should not count a change the user undid', () => {
      element.toggleColsSettingsPopup();
      const spy = sinon.spy();
      element.addEventListener('settings-changed', spy);
      toggle(1);
      toggle(1);
      expect(element.pendingChanges).to.be.false;
      element._onSettingsClosed();
      expect(spy).to.not.have.been.called;
    });

    test('should not count columns restored by code while the dialog is open', () => {
      element.toggleColsSettingsPopup();
      const spy = sinon.spy();
      element.addEventListener('settings-changed', spy);
      element.set('columns.1.hidden', true);
      expect(element.pendingChanges).to.be.false;
      element._onSettingsClosed();
      expect(spy).to.not.have.been.called;
    });

    test('should count Reset as a user change when it changes the columns', () => {
      element.set('columns.1.hidden', true);
      element.toggleColsSettingsPopup();
      element._resetClicked();
      expect(element.columns[1].hidden).to.be.false;
      expect(element.pendingChanges).to.be.true;
    });

    test('should save a change back to the opening columns after a scope switch restored others', async () => {
      element.set('columns.1.hidden', true);
      element.toggleColsSettingsPopup();
      await flush();
      element.shadowRoot.querySelector('paper-radio-button[name="document"]').click();
      // the columns saved for the new scope are restored by code
      element.set('columns.1.hidden', false);
      const spy = sinon.spy();
      element.addEventListener('settings-changed', spy);
      toggle(1);
      expect(element.pendingChanges).to.be.true;
      element._onSettingsClosed();
      expect(spy).to.have.been.calledOnce;
    });

    test('should start from the restored columns after a change undone before a scope switch', async () => {
      element.set('columns.1.hidden', true);
      element.toggleColsSettingsPopup();
      await flush();
      toggle(1);
      toggle(1);
      element.shadowRoot.querySelector('paper-radio-button[name="document"]').click();
      element.set('columns.1.hidden', false);
      toggle(1);
      expect(element.pendingChanges).to.be.true;
    });

    test('should save a change undone after picking this document only, which saved it', async () => {
      element.toggleColsSettingsPopup();
      await flush();
      toggle(1);
      const scopeSpy = sinon.spy();
      element.addEventListener('settings-scope-selected', scopeSpy);
      element.shadowRoot.querySelector('paper-radio-button[name="document"]').click();
      expect(scopeSpy.firstCall.args[0].detail.pendingChanges).to.be.true;
      const spy = sinon.spy();
      element.addEventListener('settings-changed', spy);
      toggle(1);
      expect(element.pendingChanges).to.be.true;
      element._onSettingsClosed();
      expect(spy).to.have.been.calledOnce;
    });

    test('should save the default columns when all were hidden and saved for this document only', async () => {
      element.toggleColsSettingsPopup();
      await flush();
      element.columns.forEach((column, idx) => {
        if (!column.hidden) {
          toggle(idx);
        }
      });
      element.shadowRoot.querySelector('paper-radio-button[name="document"]').click();
      const spy = sinon.spy();
      element.addEventListener('settings-changed', spy);
      element._onSettingsClosed();
      expect(element.columns.some((column) => !column.hidden)).to.be.true;
      expect(spy).to.have.been.calledOnce;
    });

    test('should keep changes pending when picking this document only, then all documents', async () => {
      element.toggleColsSettingsPopup();
      await flush();
      toggle(1);
      element.shadowRoot.querySelector('paper-radio-button[name="document"]').click();
      const spy = sinon.spy();
      element.addEventListener('settings-scope-selected', spy);
      element.shadowRoot.querySelector('paper-radio-button[name="all"]').click();
      expect(spy.firstCall.args[0].detail.pendingChanges).to.be.true;
    });

    test('should save a change undone after picking all documents', async () => {
      element.scope = 'document';
      element.toggleColsSettingsPopup();
      await flush();
      toggle(1);
      element.shadowRoot.querySelector('paper-radio-button[name="all"]').click();
      toggle(1);
      expect(element.pendingChanges).to.be.true;
      const spy = sinon.spy();
      element.addEventListener('settings-changed', spy);
      element._onSettingsClosed();
      expect(spy).to.have.been.calledOnce;
    });

    test('should save a change back to the opening columns after a net-zero change while columns load', async () => {
      element.set('columns.1.hidden', true);
      element.scope = 'document';
      element.toggleColsSettingsPopup();
      await flush();
      element.shadowRoot.querySelector('paper-radio-button[name="all"]').click();
      toggle(2);
      toggle(2);
      // the shared columns arrive
      element.set('columns.1.hidden', false);
      toggle(1);
      expect(element.pendingChanges).to.be.true;
    });

    test('should keep changes pending after picking all documents', async () => {
      element.scope = 'document';
      element.toggleColsSettingsPopup();
      await flush();
      toggle(1);
      element.shadowRoot.querySelector('paper-radio-button[name="all"]').click();
      expect(element.pendingChanges).to.be.true;
    });

    test('should report no pending changes once the dialog is closed', () => {
      element.toggleColsSettingsPopup();
      toggle(1);
      element._onSettingsClosed();
      expect(element.pendingChanges).to.be.false;
    });

    test('should fire at once again after the dialog is closed', () => {
      element.toggleColsSettingsPopup();
      element._onSettingsClosed();
      const spy = sinon.spy();
      element.addEventListener('settings-changed', spy);
      toggle(1);
      expect(spy).to.have.been.calledOnce;
    });
  });

  suite('_resetSettings', () => {
    test('should reset hidden to hiddenBack for each column', () => {
      element.columns = [
        { name: 'Title', hidden: true, hiddenBack: false, alwaysVisible: false },
        { name: 'Modified', hidden: true, hiddenBack: false, alwaysVisible: false },
        { name: 'Author', hidden: false, hiddenBack: true, alwaysVisible: false },
      ];
      element._resetSettings();
      expect(element.columns[0].hidden).to.be.false;
      expect(element.columns[1].hidden).to.be.false;
      expect(element.columns[2].hidden).to.be.true;
    });

    test('should handle all columns with same hidden and hiddenBack', () => {
      element.columns = [
        { name: 'A', hidden: false, hiddenBack: false, alwaysVisible: false },
        { name: 'B', hidden: true, hiddenBack: true, alwaysVisible: false },
      ];
      element._resetSettings();
      expect(element.columns[0].hidden).to.be.false;
      expect(element.columns[1].hidden).to.be.true;
    });
  });

  suite('_onSettingsClosed', () => {
    test('should reset settings when ALL columns are hidden', () => {
      element.columns = [
        { name: 'Title', hidden: true, hiddenBack: false, alwaysVisible: false },
        { name: 'Modified', hidden: true, hiddenBack: false, alwaysVisible: false },
        { name: 'Author', hidden: true, hiddenBack: true, alwaysVisible: false },
      ];
      element._onSettingsClosed();
      expect(element.columns[0].hidden).to.be.false;
      expect(element.columns[1].hidden).to.be.false;
      expect(element.columns[2].hidden).to.be.true;
    });

    test('should NOT reset when not all columns are hidden', () => {
      element.columns = [
        { name: 'Title', hidden: false, hiddenBack: false, alwaysVisible: false },
        { name: 'Modified', hidden: true, hiddenBack: false, alwaysVisible: false },
      ];
      element._onSettingsClosed();
      expect(element.columns[0].hidden).to.be.false;
      expect(element.columns[1].hidden).to.be.true;
    });

    test('should NOT reset when at least one column is visible', () => {
      element.columns = [
        { name: 'A', hidden: true, hiddenBack: true, alwaysVisible: false },
        { name: 'B', hidden: false, hiddenBack: false, alwaysVisible: false },
        { name: 'C', hidden: true, hiddenBack: false, alwaysVisible: false },
      ];
      element._onSettingsClosed();
      expect(element.columns[1].hidden).to.be.false;
    });
  });

  suite('canChangeVisibility', () => {
    test('should return true when column is not alwaysVisible', () => {
      expect(element.canChangeVisibility({ name: 'Modified', alwaysVisible: false })).to.be.true;
    });

    test('should return false when column is alwaysVisible', () => {
      expect(element.canChangeVisibility({ name: 'Title', alwaysVisible: true })).to.be.false;
    });

    test('should return true when alwaysVisible is undefined', () => {
      expect(element.canChangeVisibility({ name: 'Test' })).to.be.true;
    });
  });

  suite('scope choice', () => {
    const scopeSection = () => element.shadowRoot.querySelector('.scope');
    const radio = (name) => element.shadowRoot.querySelector(`paper-radio-button[name="${name}"]`);

    test('should be hidden by default and default to all documents', () => {
      expect(scopeSection().hidden).to.be.true;
      expect(element.scope).to.equal('all');
    });

    test('should be shown when scopeEnabled is set', async () => {
      element.scopeEnabled = true;
      await flush();
      expect(scopeSection().hidden).to.be.false;
      expect(element.shadowRoot.querySelector('#scope').getAttribute('aria-labelledby')).to.equal('scopeLabel');
    });

    test('should update scope and fire settings-scope-selected when the user picks an option', async () => {
      element.scopeEnabled = true;
      await flush();
      const spy = sinon.spy();
      element.addEventListener('settings-scope-selected', spy);
      radio('document').click();
      expect(element.scope).to.equal('document');
      expect(spy).to.have.been.calledOnce;
      const event = spy.firstCall.args[0];
      expect(event.detail).to.deep.equal({ scope: 'document', pendingChanges: false });
      expect(event.composed).to.be.true;
      expect(event.bubbles).to.be.true;
    });

    test('should select the matching option when scope is set by code, without firing the event', async () => {
      element.scopeEnabled = true;
      const spy = sinon.spy();
      element.addEventListener('settings-scope-selected', spy);
      element.scope = 'document';
      await flush();
      expect(radio('document').checked).to.be.true;
      expect(radio('all').checked).to.be.false;
      expect(spy).to.not.have.been.called;
    });

    test('should not fire again when the selected option is picked', async () => {
      element.scopeEnabled = true;
      await flush();
      const spy = sinon.spy();
      element.addEventListener('settings-scope-selected', spy);
      radio('all').click();
      expect(spy).to.not.have.been.called;
    });

    test('should ignore an empty or unchanged selection', () => {
      const spy = sinon.spy();
      element.addEventListener('settings-scope-selected', spy);
      element._scopeSelected({ target: { selected: '' } });
      element._scopeSelected({ target: { selected: 'all' } });
      expect(spy).to.not.have.been.called;
      expect(element.scope).to.equal('all');
    });
  });
});
