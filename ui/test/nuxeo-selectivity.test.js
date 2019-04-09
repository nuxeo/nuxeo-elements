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
import { fixture, html } from '@nuxeo/nuxeo-elements/test/test-helpers.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import '../widgets/nuxeo-selectivity.js';

suite('<nuxeo-selectivity>', () => {
  let selectivityWidget;
  const data = ['Berlin', 'Lisbon', 'London', 'Rennes', 'Rome'];
  setup(async () => {
    selectivityWidget = await fixture(html`
      <nuxeo-selectivity placeholder="No city selected" .data=${data} allow-clear></nuxeo-selectivity>
    `);
  });

  test('Its value can be set programmatically multiple times', () => {
    let i;
    const getSelectedItem = () => dom(selectivityWidget.root).querySelector('.selectivity-single-selected-item');
    const resetValue = () =>
      dom(selectivityWidget.root)
        .querySelector('a.selectivity-single-selected-item-remove')
        .click();
    for (i = 0; i < data.length; i++) {
      selectivityWidget.value = data[i];
      const item = getSelectedItem();
      expect(item).not.to.be.equal(null);
      expect(item.textContent).to.be.equal(data[i]);
      resetValue();
      expect(getSelectedItem()).to.be.equal(null);
    }
  });
});
