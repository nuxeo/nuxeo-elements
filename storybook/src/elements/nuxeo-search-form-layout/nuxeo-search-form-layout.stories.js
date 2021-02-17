import { storiesOf } from '@storybook/polymer';
import { html } from 'lit-html';
import { LayoutBehavior } from '@nuxeo/nuxeo-ui-elements/nuxeo-layout-behavior.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import '@nuxeo/nuxeo-ui-elements/search/nuxeo-search-form-layout.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-input.js';
import '@nuxeo/nuxeo-ui-elements/nuxeo-aggregation/nuxeo-checkbox-aggregation.js';
import { codePanelTemplate } from '../code-panel-template.js';

window.Polymer = Polymer;
window.Nuxeo.LayoutBehavior = LayoutBehavior;
window.nuxeo.I18n.en['defaultSearch.fullText'] = 'Full Text';
window.nuxeo.I18n.en['defaultSearch.fullText.placeholder'] = 'Search for something...';
window.nuxeo.I18n.en['defaultSearch.modifiedDate'] = 'Modification Date';

storiesOf('UI/nuxeo-search-form-layout', module)
  .add(
    'Default',
    () => html`
      <div style="margin: 8px; padding: 8px; border-radius: 8px; border: 2px solid gray;">
        <nuxeo-search-form-layout
          provider="pp_test"
          search-name="test"
          href-base="layouts/search/"
        ></nuxeo-search-form-layout>
      </div>
      ${codePanelTemplate('search/test/nuxeo-test-search-form.html')}
    `,
  )
  .add(
    'Missing layout',
    () => html`
      <nuxeo-search-form-layout
        provider="pp_other"
        search-name="other"
        href-base="layouts/search/"
      ></nuxeo-search-form-layout>
    `,
  );
