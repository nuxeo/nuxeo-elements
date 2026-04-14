import { LIST } from '../../data/lists.data';
import { tableTemplate } from './nuxeo-data-table-structure.js';

export default {
  title: 'UI/nuxeo-data-table',
};

export const Empty = {
  render: () => tableTemplate(LIST(0)),
};

export const Basic = {
  args: { numberOfItems: 50 },
  render: (args) => tableTemplate(LIST(args.numberOfItems)),
};

export const EditableAndOrderable = {
  args: { orderable: true, editable: true, numberOfItems: 50 },
  render: (args) =>
    tableTemplate(Object.assign({}, LIST(args.numberOfItems), { orderable: args.orderable, editable: args.editable })),
};

export const Settings = {
  args: { settingsEnabled: true, numberOfItems: 50 },
  render: (args) =>
    tableTemplate(Object.assign({}, LIST(args.numberOfItems), { settingsEnabled: args.settingsEnabled })),
};

export const Selectable = {
  args: { selectionEnabled: true, selectAllEnabled: true, multiSelection: true, numberOfItems: 50 },
  render: (args) =>
    tableTemplate(
      Object.assign({}, LIST(args.numberOfItems), {
        selectionEnabled: args.selectionEnabled,
        selectAllEnabled: args.selectAllEnabled,
        multiSelection: args.multiSelection,
      }),
    ),
};

export const Complex = {
  args: {
    orderable: true,
    editable: true,
    settingsEnabled: true,
    selectionEnabled: true,
    selectAllEnabled: false,
    multiSelection: true,
    selectOnTap: false,
    label: 'Label',
    required: false,
    hidden: false,
    alignRight: false,
    orderColumn: 0,
    numberOfItems: 50,
  },
  argTypes: {
    orderColumn: { control: { type: 'number', min: 0, max: 1, step: 1 } },
  },
  render: (args) =>
    tableTemplate(
      Object.assign({}, LIST(args.numberOfItems), {
        orderable: args.orderable,
        editable: args.editable,
        settingsEnabled: args.settingsEnabled,
        selectionEnabled: args.selectionEnabled,
        selectAllEnabled: args.selectAllEnabled,
        multiSelection: args.multiSelection,
        selectOnTap: args.selectOnTap,
        label: args.label,
        required: args.required,
        hidden: args.hidden,
        alignRight: args.alignRight,
        orderColumn: args.orderColumn,
      }),
    ),
};
