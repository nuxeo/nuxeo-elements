import ui from '@nuxeo/nuxeo-ui-elements/analysis.json';

const ELEMENTS = {};
ui.elements.forEach((el) => {
  ELEMENTS[el.tagname] = el;
});

export const analyse = (tag) => {
  const element = ELEMENTS[tag];
  if (!element) return { events: [], notes: '' };
  const { events, description } = element;
  return {
    events: events ? events.map((e) => e.name) : [],
    notes: description || '',
  };
};
