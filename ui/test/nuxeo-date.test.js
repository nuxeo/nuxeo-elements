/**
@license
©2023 Hyland Software, Inc. and its affiliates. All rights reserved. 
All Hyland product names are registered or unregistered trademarks of Hyland Software, Inc. or its affiliates.

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
import { config } from '@nuxeo/nuxeo-elements';
import '../widgets/nuxeo-date.js';

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
    config.set('dateTimeFormat', 'LLL');
    const element = await fixture(
      html`
        <nuxeo-date datetime=${moment()} format="LLL"></nuxeo-date>
      `,
    );

    const tooltip = element.shadowRoot.querySelector('nuxeo-tooltip');
    expect(tooltip.hidden).to.be.true;
  });

  test('Should hide the nuxeo-tooltip if provided tooltipFormat matches globalconfig format', async () => {
    config.set('dateFormat', 'LLL');
    const element = await fixture(
      html`
        <nuxeo-date datetime=${moment()} tooltipFormat="LLL"></nuxeo-date>
      `,
    );

    const tooltip = element.shadowRoot.querySelector('nuxeo-tooltip');
    expect(tooltip.hidden).to.be.true;
  });

  test('Should hide the nuxeo-tooltip if globalconfig dateFormat and dateTimeFormat are same', async () => {
    config.set('dateFormat', 'LLL');
    config.set('dateTimeFormat', 'LLL');
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
