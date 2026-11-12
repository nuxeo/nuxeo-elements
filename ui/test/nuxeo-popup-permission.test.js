/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import moment from '@nuxeo/moment/min/moment-with-locales.js';
import { config } from '@nuxeo/nuxeo-elements';
import { fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-document-permissions/nuxeo-popup-permission.js';

suite('nuxeo-popup-permission', () => {
  let el;
  let previousTimezone;
  let previousLocale;

  setup(async () => {
    previousTimezone = config.get('timezone');
    previousLocale = moment.locale();
    moment.locale('en');
    config.set('timezone', undefined);
    el = await fixture(html`
      <nuxeo-popup-permission></nuxeo-popup-permission>
    `);
  });

  teardown(() => {
    config.set('timezone', previousTimezone);
    moment.locale(previousLocale);
  });

  test('displays the configured calendar days and preserves unchanged permission instants', () => {
    config.set('timezone', 'Pacific/Pago_Pago');
    const begin = '2026-11-01T02:00:00.000Z';
    const end = '2026-12-31T23:30:00.000Z';
    el.ace = { id: 'ace-1', username: 'members', permission: 'Read', begin, end };
    el._computeParams(el.ace, false);
    expect(el.params.begin).to.equal('2026-10-31');
    expect(el.params.end).to.equal('2026-12-31');
    expect(el._serializePermissionDate(el.params.begin, begin)).to.equal(begin);
    expect(el._serializePermissionDate(el.params.end, end, true)).to.equal(end);
    // Moving away and back emits an ISO timestamp from the picker, rather than a date-only string.
    expect(el._serializePermissionDate('2026-10-31T11:00:00.000Z', begin)).to.equal(begin);
    expect(el._serializePermissionDate('2026-12-31T11:00:00.000Z', end, true)).to.equal(end);
    expect(el._serializePermissionDate('2026-11-01T11:00:00.000Z', begin)).to.equal('2026-11-01T00:00:00-11:00');
    expect(el._serializePermissionDate(end, end, true)).to.equal(end);
  });

  test('ends a changed permission on the selected zone day across DST changes', () => {
    config.set('timezone', 'America/New_York');
    expect(el._serializePermissionDate('2026-03-08')).to.equal('2026-03-08T00:00:00-05:00');
    expect(el._serializePermissionDate('2026-03-08T05:00:00.000Z', null, true)).to.equal('2026-03-08T23:59:59-04:00');
    expect(el._serializePermissionDate('2026-11-01', null, true)).to.equal('2026-11-01T23:59:59-05:00');
  });

  test('serializes permission dates and editor days with ASCII digits without changing the locale', () => {
    config.set('timezone', 'Asia/Tokyo');
    const begin = '2026-01-19T15:00:00.000Z';
    el.ace = { id: 'ace-1', username: 'members', permission: 'Read', begin, end: null };
    el._computeParams(el.ace, false);
    expect(el.params.begin).to.equal('2026-01-20');
    // The child pickers initialize their browser locale when the ACE is loaded.
    moment.locale('ar');
    expect(el._serializePermissionDate('2026-01-21', begin)).to.equal('2026-01-21T00:00:00+09:00');
    expect(el._serializePermissionDate('2026-01-21', null, true)).to.equal('2026-01-21T23:59:59+09:00');
    expect(el._serializePermissionDate('2026-01-20', begin)).to.equal(begin);
    expect(moment.locale()).to.equal('ar');
  });

  test('includes the repeated final hour when permission expiry falls on a midnight DST fallback', () => {
    config.set('timezone', 'Africa/Cairo');
    expect(el._serializePermissionDate('2026-10-29', null, true)).to.equal('2026-10-29T23:59:59+02:00');
  });

  test('expires after the final occurrence of the selected day when the following midnight repeats', () => {
    config.set('timezone', 'America/St_Johns');
    expect(el._serializePermissionDate('2009-10-31', null, true)).to.equal('2009-10-31T23:59:59-03:30');
  });

  test('returns a local permission label by default', () => {
    expect(el._computeNewPermissionLabel(false)).to.equal(el.i18n('popupPermission.newLocalPermission'));
  });

  test('keeps UTC picker edits distinct from the initial day in a UTC-minus-five browser', () => {
    const originalTimezone = config.get('timezone');
    const format = moment.fn.format;
    // Model the browser-local calendar day independently of the test runner's host timezone.
    const localDay = sinon.stub(moment.fn, 'format').callsFake(function formatInBrowser(pattern) {
      const date = pattern === 'YYYY-MM-DD' && !this.isUTC() ? this.clone().utcOffset(-300) : this;
      return format.call(date, pattern);
    });
    try {
      config.set('timezone', 'Etc/UTC');
      const begin = '2026-01-20T05:00:00.000Z';
      el.ace = { id: 'ace-1', username: 'members', permission: 'Read', begin, end: null };
      el._computeParams(el.ace, false);
      expect(el.params.begin).to.equal('2026-01-20');
      expect(el._serializePermissionDate('2026-01-21T00:00:00.000Z', begin)).to.equal('2026-01-21T00:00:00Z');
      expect(el._serializePermissionDate('2026-01-20T00:00:00.000Z', begin)).to.equal(begin);
      expect(el._serializePermissionDate(begin, begin)).to.equal(begin);
    } finally {
      localDay.restore();
      config.set('timezone', originalTimezone);
    }
  });

  test('returns an external permission label when sharing externally', () => {
    expect(el._computeNewPermissionLabel(true)).to.equal(el.i18n('popupPermission.newExternalPermission'));
  });
  test('preserves the exact access window on an unchanged update', () => {
    const begin = '2026-11-01T02:00:00.000Z';
    const end = '2026-12-31T23:30:00.000Z';
    el.ace = { id: 'ace-1', username: 'members', permission: 'Read', begin, end };
    el._computeParams(el.ace, false);
    const execute = sinon.stub(el.$.replaceOp, 'execute').resolves();
    el._doSend(false);
    expect(el.params.begin).to.equal(begin);
    expect(el.params.end).to.equal(end);
    expect(execute.calledOnce).to.be.true;
    execute.restore();
  });

  test('serializes changed local calendar dates and empty dates', () => {
    expect(el._serializePermissionDate('')).to.equal(null);
    expect(el._serializePermissionDate('2026-01-20')).to.equal(moment('2026-01-20').format());
    expect(el._serializePermissionDate('2026-01-20', null, true)).to.equal(
      moment('2026-01-20')
        .endOf('day')
        .format(),
    );
  });

  test('preserves the access window after returning to the original calendar days', () => {
    const begin = '2026-11-01T02:00:00.000Z';
    const end = '2026-12-31T23:30:00.000Z';
    el.ace = { id: 'ace-1', username: 'members', permission: 'Read', begin, end };
    el._computeParams(el.ace, false);
    el.params.begin = moment(begin)
      .add(1, 'day')
      .startOf('day')
      .toJSON();
    expect(el._serializePermissionDate(el.params.begin, begin)).not.to.equal(begin);
    el.params.begin = moment(begin)
      .startOf('day')
      .toJSON();
    el.params.end = moment(end)
      .startOf('day')
      .toJSON();
    const execute = sinon.stub(el.$.replaceOp, 'execute').resolves();
    try {
      el._doSend(false);
      expect(el.params.begin).to.equal(begin);
      expect(el.params.end).to.equal(end);
      expect(execute.calledOnce).to.be.true;
    } finally {
      execute.restore();
    }
  });

  test('preserves the original access window when retrying a failed update', async () => {
    const begin = '2026-11-01T02:00:00.000Z';
    const end = '2026-12-31T23:30:00.000Z';
    el.ace = { id: 'ace-1', username: 'members', permission: 'Read', begin, end };
    el._computeParams(el.ace, false);
    const attempts = [];
    const execute = sinon.stub(el.$.replaceOp, 'execute').callsFake(() => {
      attempts.push({ begin: el.params.begin, end: el.params.end });
      const response = attempts.length === 1 ? Promise.reject(new Error('Request failed')) : Promise.resolve();
      // _doSend does not await execute; consume the simulated failure as the operation element does.
      response.catch(() => null);
      return response;
    });
    try {
      el._doSend(false);
      await Promise.resolve();
      el._doSend(false);
      expect(attempts).to.deep.equal([
        { begin, end },
        { begin, end },
      ]);
      expect(execute.calledTwice).to.be.true;
    } finally {
      execute.restore();
    }
  });
});
