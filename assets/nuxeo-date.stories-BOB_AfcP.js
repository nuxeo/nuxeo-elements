import{b as m}from"./iframe-DfANLok6.js";import"./nuxeo-date-DdF4XuiH.js";import"./preload-helper-Dp1pzeXC.js";import"./nuxeo-format-behavior-DCZ67kVR.js";import"./moment-with-locales-v-Wg38Ha.js";import"./nuxeo-i18n-behavior-DkDjknqP.js";import"./nuxeo-tooltip-D6ydFGfA.js";const d={title:"UI/nuxeo-date"},t={args:{dateTime:new Date().getTime(),format:"MMM D, YYYY",tooltipFormat:"MMMM D, YYYY HH:mm"},argTypes:{dateTime:{control:"date"},format:{control:"select",options:["MMM D, YYYY","MMMM D, YYYY HH:mm","relative"]},tooltipFormat:{control:"select",options:["MMMM D, YYYY HH:mm","relative"]}},render:e=>m`
    <nuxeo-date datetime=${new Date(e.dateTime)} format="${e.format}" tooltip-format="${e.tooltipFormat}" />
  `};var o,r,a;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    dateTime: new Date().getTime(),
    format: 'MMM D, YYYY',
    tooltipFormat: 'MMMM D, YYYY HH:mm'
  },
  argTypes: {
    dateTime: {
      control: 'date'
    },
    format: {
      control: 'select',
      options: ['MMM D, YYYY', 'MMMM D, YYYY HH:mm', 'relative']
    },
    tooltipFormat: {
      control: 'select',
      options: ['MMMM D, YYYY HH:mm', 'relative']
    }
  },
  render: args => html\`
    <nuxeo-date datetime=\${new Date(args.dateTime)} format="\${args.format}" tooltip-format="\${args.tooltipFormat}" />
  \`
}`,...(a=(r=t.parameters)==null?void 0:r.docs)==null?void 0:a.source}}};const c=["NuxeoDate"];export{t as NuxeoDate,c as __namedExportsOrder,d as default};
