/**
@license
(C) Copyright Nuxeo Corp. (http://nuxeo.com/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import { html, fixture } from '@nuxeo/testing-helpers';
import moment from '@nuxeo/moment';
import '../widgets/nuxeo-date.js';

function setNuxeoConfigDateFormat(format, value) {
  window.Nuxeo = window.Nuxeo || {};
  window.Nuxeo.UI = window.Nuxeo.UI || {};
  window.Nuxeo.UI.config = window.Nuxeo.UI.config || {};
  window.Nuxeo.UI.config[format] = window.Nuxeo.UI.config[format] || value;
}

suite('nuxeo-date', async () => {
  test('Should hide the nuxeo-tooltip when provided format and tooltipFormat are equal', async () => {
    const element = await fixture(
      html`
        <nuxeo-date datetime=${moment()} format="LLL" tooltipFormat="LLL"></nuxeo-date>
      `,
    );

    const tooltip = element.shadowRoot.querySelector('nuxeo-tooltip');
    expect(tooltip.hidden).to.be.true;
  });

  test('Should hide the nuxeo-tooltip if provided format matches globalconfig tooltipFormat', async () => {
    setNuxeoConfigDateFormat('dateTimeFormat', 'LLL');
    const element = await fixture(
      html`
        <nuxeo-date datetime=${moment()} format="LLL"></nuxeo-date>
      `,
    );

    const tooltip = element.shadowRoot.querySelector('nuxeo-tooltip');
    expect(tooltip.hidden).to.be.true;
  });

  test('Should hide the nuxeo-tooltip if provided tooltipFormat matches globalconfig format', async () => {
    setNuxeoConfigDateFormat('dateFormat', 'LLL');
    const element = await fixture(
      html`
        <nuxeo-date datetime=${moment()} tooltipFormat="LLL"></nuxeo-date>
      `,
    );

    const tooltip = element.shadowRoot.querySelector('nuxeo-tooltip');
    expect(tooltip.hidden).to.be.true;
  });

  test('Should hide the nuxeo-tooltip if globalconfig dateFormat and dateTimeFormat are same', async () => {
    setNuxeoConfigDateFormat('dateFormat', 'LLL');
    setNuxeoConfigDateFormat('dateTimeFormat', 'LLL');
    const element = await fixture(
      html`
        <nuxeo-date datetime=${moment()}></nuxeo-date>
      `,
    );

    const tooltip = element.shadowRoot.querySelector('nuxeo-tooltip');
    expect(tooltip.hidden).to.be.true;
  });

  test('Should show the nuxeo-tooltip if its a different format', async () => {
    const element = await fixture(
      html`
        <nuxeo-date datetime=${moment()} format="relative" tooltipFormat="LLL"></nuxeo-date>
      `,
    );

    const tooltip = element.shadowRoot.querySelector('nuxeo-tooltip');
    expect(tooltip.hidden).to.be.false;
  });
});
