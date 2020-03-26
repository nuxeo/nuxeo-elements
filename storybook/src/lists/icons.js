import { IronMeta } from '@polymer/iron-meta/iron-meta.js';

const iconMap = {};

new IronMeta({ type: 'iconset' }).list.forEach((item) => {
  iconMap[item.name] = item.getIconNames();
});

export default iconMap;
