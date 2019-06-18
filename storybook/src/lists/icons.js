import { IronMeta } from '@polymer/iron-meta/iron-meta.js';
import '@polymer/iron-icon/iron-icon.js';

const { value } = new IronMeta({ type: 'iconset', key: 'nuxeo' });
export const listOfIcons = value.getIconNames();
