import { knob } from '@storybook/addon-knobs';

import ui from '@nuxeo/nuxeo-ui-elements/analysis.json';

const ELEMENTS = {};
ui.elements.forEach((el) => {
  ELEMENTS[el.tagname] = el;
});

const knobFor = (prop, overrides = {}) => {
  const { name, metadata, defaultValue, privacy } = prop;

  // hide private and read only properties
  if (privacy !== 'public' || metadata.polymer.readOnly) {
    return;
  }

  const type = metadata.polymer.attributeType;
  const value = defaultValue && JSON.parse(defaultValue);
  const groupId = 'Properties';

  let params =
    {
      String: { type: 'text' },
      Number: { type: 'number' },
      Array: { type: 'array' },
      Boolean: { type: 'boolean' },
      Object: { type: 'object' },
      Date: { type: 'date' },
    }[type] || {};

  Object.assign(params, { name, value, groupId });

  if (params.type == 'select') {
    params.selectV2 = true;
  }

  Object.assign(params, overrides);

  if (!params.type) {
    return;
  }
  return knob(prop.name, params);
};

export const analyse = (tag) => {
  const { properties, events, description } = ELEMENTS[tag];
  return {
    knob: (prop) => knobFor(properties.find((p) => p.name == prop)),
    knobs: (overrides = {}) => {
      const knobs = {};
      properties.forEach((p) => {
        const k = knobFor(p, overrides[p.name]);
        if (k) {
          knobs[p.name] = k;
        }
      });
      return knobs;
    },
    events: events.map((e) => e.name),
    notes: description,
  };
};
