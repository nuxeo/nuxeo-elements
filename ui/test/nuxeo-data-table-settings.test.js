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

    test('should reset order back to the declared column position (WEBUI-2086)', () => {
      element.columns = [
        { name: 'Title', hidden: false, hiddenBack: false, order: 2 },
        { name: 'Modified', hidden: false, hiddenBack: false, order: 0 },
        { name: 'Author', hidden: false, hiddenBack: false, order: 1 },
      ];
      element._resetSettings();
      expect(element.columns.map((column) => column.order)).to.deep.equal([0, 1, 2]);
    });

    test('should reset width to the layout-declared width and clear the resized flag (WEBUI-2086)', () => {
      const declared = document.createElement('div');
      declared.setAttribute('width', '150px');
      declared.name = 'Title';
      declared.hidden = false;
      declared.hiddenBack = false;
      declared.width = '480px';
      declared.resized = true;
      element.columns = [declared];

      element._resetSettings();

      expect(element.columns[0].width).to.equal('150px');
      expect(element.columns[0].resized).to.be.false;
    });

    test('should reset width to null when the layout declares none (WEBUI-2086)', () => {
      element.columns = [{ name: 'Title', hidden: false, hiddenBack: false, width: '480px', resized: true }];
      element._resetSettings();
      expect(element.columns[0].width).to.be.null;
      expect(element.columns[0].resized).to.be.false;
    });

    test('should dispatch a single settings-changed with source reset (WEBUI-2086)', () => {
      const spy = sinon.spy();
      element.addEventListener('settings-changed', spy);
      element.columns = [
        { name: 'Title', hidden: true, hiddenBack: false, order: 1 },
        { name: 'Modified', hidden: false, hiddenBack: false, order: 0 },
      ];

      element._resetSettings();

      expect(spy).to.have.been.calledOnce;
      const event = spy.firstCall.args[0];
      expect(event.detail.source).to.equal('reset');
      expect(event.composed).to.be.true;
      expect(event.bubbles).to.be.true;
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

    test('should restore visibility only, leaving width and order untouched (WEBUI-2086)', () => {
      element.columns = [
        { name: 'Title', hidden: true, hiddenBack: false, order: 1, width: '480px', resized: true },
        { name: 'Modified', hidden: true, hiddenBack: false, order: 0, width: '90px', resized: true },
      ];

      element._onSettingsClosed();

      expect(element.columns[0].hidden).to.be.false;
      expect(element.columns[0].width).to.equal('480px');
      expect(element.columns[0].order).to.equal(1);
      expect(element.columns[1].resized).to.be.true;
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
