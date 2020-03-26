import { html } from 'lit-html';
import { storiesOf } from '@storybook/polymer';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@nuxeo/nuxeo-ui-elements/nuxeo-icons.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-card.js';
import { IronMeta } from '@polymer/iron-meta/iron-meta.js';

const items = new IronMeta({ type: 'iconset' }).list.map((item) => {
  return { name: item.name, icons: item.getIconNames() };
});

storiesOf('UI/nuxeo-icons', module).add(
  'Icon catalogue',
  () => html`
    <style>
      .set {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        max-width: 100%;
        justify-content: space-between;
      }
      .icon {
        margin: 10px;
        width: 120px;
        text-align: center;
      }
    </style>
    <dom-repeat .items="${items}">
      <template>
        <nuxeo-card collapsible="true" opened="true" heading="{{item.name}}">
          <div class="set">
            <dom-repeat items="{{item.icons}}">
              <template>
                <div class="icon">
                  <iron-icon icon="{{item}}"></iron-icon>
                  <label title="{{item}}">{{item}}</label>
                </div>
              </template>
            </dom-repeat>
          </div>
        </template>
      </nuxeo-card>
    </dom-repeat>
  `,
);
