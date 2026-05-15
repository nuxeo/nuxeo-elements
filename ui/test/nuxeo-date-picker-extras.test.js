import { fixture, html } from '@nuxeo/testing-helpers';
import moment from '@nuxeo/moment/min/moment-with-locales.js';
import '../widgets/nuxeo-date-picker.js';

suite('nuxeo-date-picker – extra branches', () => {
  let el;
  let currentLocale;

  setup(async () => {
    currentLocale = moment.locale();
    el = await fixture(
      html`
        <nuxeo-date-picker></nuxeo-date-picker>
      `,
    );
  });

  teardown(() => {
    moment.locale(currentLocale);
  });

  suite('_moment', () => {
    test('uses moment.utc when timezone is Etc/UTC', async () => {
      const utcEl = await fixture(
        html`
          <nuxeo-date-picker timezone="Etc/UTC"></nuxeo-date-picker>
        `,
      );
      const m = utcEl._moment('2024-06-15');
      expect(m.isUTC()).to.be.true;
    });

    test('uses local moment when timezone is empty', () => {
      const m = el._moment('2024-06-15');
      expect(m.isValid()).to.be.true;
    });
  });

  suite('_valueChanged', () => {
    test('sets _inputValue to null when value is falsy', () => {
      el.value = '';
      expect(el._inputValue).to.equal(null);
    });

    test('sets _inputValue to YYYY-MM-DD for valid ISO date', () => {
      el.value = '2024-03-05T10:30:00.000Z';
      expect(el._inputValue).to.match(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('sets _inputValue to empty for invalid date string', () => {
      el._preventInputUpdate = false;
      el._inputValue = '2024-01-01';
      el.value = 'not-a-date';
      expect(el._inputValue).to.satisfy((v) => v === '' || v === null);
    });

    test('pads year/month/day correctly', () => {
      el.value = '0005-01-02T00:00:00.000Z';
      const parts = el._inputValue.split('-');
      expect(parts[0]).to.have.length(4);
      expect(parts[1]).to.have.length(2);
      expect(parts[2]).to.have.length(2);
    });
  });

  suite('_inputValueChanged', () => {
    test('sets value to null for invalid _inputValue', () => {
      el._preventInputUpdate = false;
      el._inputValue = 'invalid';
      expect(el.value).to.equal(null);
    });

    test('does nothing when _preventInputUpdate is true', () => {
      el.value = '2024-06-15T00:00:00.000Z';
      el._preventInputUpdate = true;
      el._inputValue = '2020-01-01';
      expect(el._preventInputUpdate).to.be.false;
    });

    test('sets value to JSON for valid _inputValue', () => {
      el._preventInputUpdate = false;
      el._inputValue = '2024-06-15';
      expect(el.value).to.be.a('string');
      expect(moment(el.value).isValid()).to.be.true;
    });

    test('applies defaultTime when valid', () => {
      el.defaultTime = '10:30:45';
      el._preventInputUpdate = false;
      el._inputValue = '2024-06-15';
      const parsed = moment(el.value);
      expect(parsed.isValid()).to.be.true;
    });

    test('throws for invalid defaultTime', () => {
      el.defaultTime = 'bad-time';
      el._preventInputUpdate = false;
      expect(() => {
        el._inputValue = '2024-06-15';
      }).to.throw('Invalid default time');
    });

    test('skips update when _inputValue is null', () => {
      el.value = '2024-06-15T00:00:00.000Z';
      el._preventInputUpdate = false;
      el._inputValue = null;
      expect(el.value).to.equal('2024-06-15T00:00:00.000Z');
    });
  });

  suite('_getValidity', () => {
    test('returns true when not required and no value', () => {
      el.required = false;
      el.value = null;
      expect(el._getValidity()).to.be.true;
    });

    test('returns false when required and no value', () => {
      el.required = true;
      el.value = null;
      expect(el._getValidity()).to.be.false;
    });

    test('returns true when required and value is set', () => {
      el.required = true;
      el.value = '2024-06-15T00:00:00.000Z';
      expect(el._getValidity()).to.be.true;
    });
  });
});
