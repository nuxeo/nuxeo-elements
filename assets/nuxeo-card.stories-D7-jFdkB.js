import{b as c}from"./iframe-DfANLok6.js";import"./nuxeo-card-DYvUIT8L.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-collapse-B1KRLpU1.js";import"./iron-resizable-behavior-AZ17E4LT.js";import"./iron-flex-layout-Cy57WvA0.js";import"./iron-icon-Bt9a3Rhq.js";import"./iron-iconset-svg-5-aE6F5a.js";const o={attachment:"nuxeo:attachment",dashboard:"nuxeo:dashboard",edit:"nuxeo:edit",none:""},h={title:"UI/nuxeo-card"},n={args:{heading:"About Nuxeo",icon:o.attachment,collapsible:!1,opened:!1,content:"Nuxeo makes it easy to build smart content applications that enhance customer experiences, improve decision making, and accelerate products to market."},argTypes:{icon:{control:"select",options:Object.values(o)}},render:e=>c`
    <nuxeo-card
      heading="${e.heading}"
      icon="${e.icon}"
      ?collapsible="${e.collapsible}"
      ?opened="${e.opened}"
    >
      ${e.content}
    </nuxeo-card>
  `};var t,a,r;n.parameters={...n.parameters,docs:{...(t=n.parameters)==null?void 0:t.docs,source:{originalSource:`{
  args: {
    heading: 'About Nuxeo',
    icon: ICONS.attachment,
    collapsible: false,
    opened: false,
    content: 'Nuxeo makes it easy to build smart content applications that enhance customer experiences, improve decision making, and accelerate products to market.'
  },
  argTypes: {
    icon: {
      control: 'select',
      options: Object.values(ICONS)
    }
  },
  render: args => html\`
    <nuxeo-card
      heading="\${args.heading}"
      icon="\${args.icon}"
      ?collapsible="\${args.collapsible}"
      ?opened="\${args.opened}"
    >
      \${args.content}
    </nuxeo-card>
  \`
}`,...(r=(a=n.parameters)==null?void 0:a.docs)==null?void 0:r.source}}};const b=["NuxeoCard"];export{n as NuxeoCard,b as __namedExportsOrder,h as default};
