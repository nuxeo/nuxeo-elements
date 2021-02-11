import { storiesOf } from '@storybook/polymer';
import { html } from 'lit-html';
import { until } from 'lit-html/directives/until.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { LayoutBehavior } from '@nuxeo/nuxeo-ui-elements/nuxeo-layout-behavior.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import '@nuxeo/nuxeo-ui-elements/search/nuxeo-search-form-layout.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-input.js';
import '@nuxeo/nuxeo-ui-elements/nuxeo-aggregation/nuxeo-checkbox-aggregation.js';
import hljs from 'highlight.js';

window.Polymer = Polymer;
window.Nuxeo.LayoutBehavior = LayoutBehavior;
window.nuxeo.I18n.en['defaultSearch.fullText'] = 'Full Text';
window.nuxeo.I18n.en['defaultSearch.fullText.placeholder'] = 'Search for something...';
window.nuxeo.I18n.en['defaultSearch.modifiedDate'] = 'Modification Date';

const codePanel = (searchName) => html`
  <style>
    .hljs {
      display: block;
      overflow-x: auto;
      padding: 0.5em;
      color: #abb2bf;
      background: #282c34;
      margin: 0;
    }

    .hljs-comment,
    .hljs-quote {
      color: #5c6370;
      font-style: italic;
    }

    .hljs-doctag,
    .hljs-keyword,
    .hljs-formula {
      color: #c678dd;
    }

    .hljs-section,
    .hljs-name,
    .hljs-selector-tag,
    .hljs-deletion,
    .hljs-subst {
      color: #e06c75;
    }

    .hljs-literal {
      color: #56b6c2;
    }

    .hljs-string,
    .hljs-regexp,
    .hljs-addition,
    .hljs-attribute,
    .hljs-meta-string {
      color: #98c379;
    }

    .hljs-built_in,
    .hljs-class .hljs-title {
      color: #e6c07b;
    }

    .hljs-attr,
    .hljs-variable,
    .hljs-template-variable,
    .hljs-type,
    .hljs-selector-class,
    .hljs-selector-attr,
    .hljs-selector-pseudo,
    .hljs-number {
      color: #d19a66;
    }

    .hljs-symbol,
    .hljs-bullet,
    .hljs-link,
    .hljs-meta,
    .hljs-selector-id,
    .hljs-title {
      color: #61aeee;
    }

    .hljs-emphasis {
      font-style: italic;
    }

    .hljs-strong {
      font-weight: bold;
    }

    .hljs-link {
      text-decoration: underline;
    }
  </style>
  <div style="margin-top: 32px">
    <span style="margin-left: 4px; color: #ddd">layout source</span>
    <span class="hljs">
      ${until(
        import(`!!raw-loader!../../../public/layouts/search/${searchName}/nuxeo-${searchName}-search-form.html`).then(
          (module) => {
            const val = hljs.highlight('html', module.default).value;
            return unsafeHTML(`<pre>${val}</pre>`);
          },
        ),
        html`
          <span>Loading layout source...</span>
        `,
      )}
    </span>
  </div>
`;

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
      ${codePanel('test')}
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
