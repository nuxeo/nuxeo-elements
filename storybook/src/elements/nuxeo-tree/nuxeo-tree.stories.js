import { html } from 'lit';
import { storiesOf } from '@storybook/polymer';
import '@nuxeo/nuxeo-ui-elements/nuxeo-tree/nuxeo-tree.js';

const data = {
  title: 'Home',
  children: [
    {
      title: 'Kitchen',
      children: [],
    },
    {
      title: 'Bedroom',
      children: [
        { title: 'Bed Frames', children: [] },
        { title: 'Mattress', children: [] },
      ],
    },
  ],
};

const controller = {
  // How to get children of a node. Returns a promise.
  getChildren(node) {
    return Promise.resolve(node.children);
  },
  isLeaf(node) {
    return node.children.length === 0;
  },
};

storiesOf('UI/nuxeo-tree', module).add(
  'Default',
  () => html`
    <nuxeo-tree .data="${data}" .controller="${controller}">
      <template>
        <template class="flex" is="dom-if" if="[[!isLeaf]]">
          <iron-icon icon="icons:chevron-right" toggle></iron-icon>
        </template>
        <span>[[item.title]]</span>
      </template>
    </nuxeo-tree>
  `,
);
