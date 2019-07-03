import { configure, addDecorator, addParameters, setAddon } from '@storybook/polymer';
import { withActions } from '@storybook/addon-actions';
import { withKnobs } from '@storybook/addon-knobs';
import { analyse } from './analysis';
import theme from './theme';

addDecorator(withKnobs);

setAddon({
  addElement(tag, fn) {
    const analysis = analyse(tag);
    const { events, notes } = analysis;
    const storyFn = () => fn(analysis);
    this.add(`<${tag}>`, () => withActions(...events)(storyFn), { notes });
  },
});

addParameters({
  backgrounds: [
    { name: 'Default', value: '#f5f5f5' },
    { name: 'Dark', value: '#060826' },
    { name: 'Kawai', value: '#f8d3e0' },
    { name: 'Light', value: '#f7f7f7' },
  ],
  options: { theme },
});

// automatically import all files ending in *.stories.js
const req = require.context('../src/elements', true, /.stories.js$/);
function loadStories() {
  req.keys().forEach((filename) => req(filename));
}

configure(loadStories, module);
