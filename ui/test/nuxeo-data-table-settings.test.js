import { fixture, html } from '@nuxeo/testing-helpers';
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

  suite('layout settings dialog (ELEMENTS-2017)', () => {
    const dialog = () => element.shadowRoot.querySelector('#columnsSettingsPopup');
    const buttons = () => [...dialog().querySelectorAll('paper-button')];

    test('is titled with the layout settings and lists the columns under a Visible Columns heading', () => {
      expect(
        dialog()
          .querySelector('h2')
          .textContent.trim(),
      ).to.equal(element.i18n('tableSettings.columnSettings'));
      const heading = dialog().querySelector('h3.subheading');
      expect(heading.textContent.trim()).to.equal(element.i18n('tableSettings.columnSettings.visibleColumns'));
      expect(heading.compareDocumentPosition(dialog().querySelector('paper-dialog-scrollable'))).to.equal(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });

    test('shows Reset Columns, Reset Layout and Done, with Done as the only primary button', () => {
      expect(buttons().map((b) => b.textContent.trim())).to.deep.equal([
        element.i18n('tableSettings.columnSettings.reset'),
        element.i18n('tableSettings.columnSettings.resetLayout'),
        element.i18n('tableSettings.columnSettings.done'),
      ]);
      expect(buttons().map((b) => b.classList.contains('primary'))).to.deep.equal([false, false, true]);
    });

    test('Reset Columns still restores the visibility only', () => {
      element.columns = [
        { name: 'Title', hidden: true, hiddenBack: false, alwaysVisible: false, width: '400px', order: 1 },
        { name: 'Modified', hidden: false, hiddenBack: true, alwaysVisible: false, width: null, order: 0 },
      ];
      const layoutSpy = sinon.spy();
      element.addEventListener('reset-layout', layoutSpy);

      buttons()[0].click();

      expect(element.columns.map((c) => c.hidden)).to.deep.equal([false, true]);
      expect(element.columns.map((c) => c.width)).to.deep.equal(['400px', null]);
      expect(element.columns.map((c) => c.order)).to.deep.equal([1, 0]);
      expect(layoutSpy).to.not.have.been.called;
    });

    test('Reset Layout asks the table to reset its layout and leaves the visibility alone', () => {
      const spy = sinon.spy();
      element.addEventListener('reset-layout', spy);
      const settingsSpy = sinon.spy();
      element.addEventListener('settings-changed', settingsSpy);
      const before = element.columns.map((c) => c.hidden);

      element.shadowRoot.querySelector('#resetLayout').click();

      expect(spy).to.have.been.calledOnce;
      // handled by the table that renders the dialog, and by nothing above it
      expect(spy.firstCall.args[0].bubbles).to.be.false;
      expect(spy.firstCall.args[0].composed).to.be.false;
      expect(element.columns.map((c) => c.hidden)).to.deep.equal(before);
      expect(settingsSpy).to.not.have.been.called;
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
});
