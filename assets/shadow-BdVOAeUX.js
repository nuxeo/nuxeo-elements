import"./roboto-AfkCeElV.js";import{h as e}from"./iframe-T5hUCbnt.js";/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const p=e`
<style>

.paper-font-display4,
.paper-font-display3,
.paper-font-display2,
.paper-font-display1,
.paper-font-headline,
.paper-font-title,
.paper-font-subhead,
.paper-font-body2,
.paper-font-body1,
.paper-font-caption,
.paper-font-menu,
.paper-font-button {
  font-family: 'Roboto', 'Noto', sans-serif;
  -webkit-font-smoothing: antialiased;  /* OS X subpixel AA bleed bug */
}

.paper-font-code2,
.paper-font-code1 {
  font-family: 'Roboto Mono', 'Consolas', 'Menlo', monospace;
  -webkit-font-smoothing: antialiased;  /* OS X subpixel AA bleed bug */
}

/* Opt for better kerning for headers &amp; other short labels. */
.paper-font-display4,
.paper-font-display3,
.paper-font-display2,
.paper-font-display1,
.paper-font-headline,
.paper-font-title,
.paper-font-subhead,
.paper-font-menu,
.paper-font-button {
  text-rendering: optimizeLegibility;
}

/*
"Line wrapping only applies to Body, Subhead, Headline, and the smaller Display
styles. All other styles should exist as single lines."
*/
.paper-font-display4,
.paper-font-display3,
.paper-font-title,
.paper-font-caption,
.paper-font-menu,
.paper-font-button {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.paper-font-display4 {
  font-size: 112px;
  font-weight: 300;
  letter-spacing: -.044em;
  line-height: 120px;
}

.paper-font-display3 {
  font-size: 56px;
  font-weight: 400;
  letter-spacing: -.026em;
  line-height: 60px;
}

.paper-font-display2 {
  font-size: 45px;
  font-weight: 400;
  letter-spacing: -.018em;
  line-height: 48px;
}

.paper-font-display1 {
  font-size: 34px;
  font-weight: 400;
  letter-spacing: -.01em;
  line-height: 40px;
}

.paper-font-headline {
  font-size: 24px;
  font-weight: 400;
  letter-spacing: -.012em;
  line-height: 32px;
}

.paper-font-title {
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}

.paper-font-subhead {
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
}

.paper-font-body2 {
  font-size: 14px;
  font-weight: 500;
  line-height: 24px;
}

.paper-font-body1 {
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.paper-font-caption {
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.011em;
  line-height: 20px;
}

.paper-font-menu {
  font-size: 13px;
  font-weight: 500;
  line-height: 24px;
}

.paper-font-button {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.018em;
  line-height: 24px;
  text-transform: uppercase;
}

.paper-font-code2 {
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
}

.paper-font-code1 {
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}

</style>`;p.setAttribute("style","display: none;");document.head.appendChild(p.content);/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const t=e`
<style>
.shadow-transition {
  transition: box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.shadow-elevation-2dp {
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
              0 1px 5px 0 rgba(0, 0, 0, 0.12),
              0 3px 1px -2px rgba(0, 0, 0, 0.2);
}

.shadow-elevation-3dp {
  box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.14),
              0 1px 8px 0 rgba(0, 0, 0, 0.12),
              0 3px 3px -2px rgba(0, 0, 0, 0.4);
}

.shadow-elevation-4dp {
  box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14),
              0 1px 10px 0 rgba(0, 0, 0, 0.12),
              0 2px 4px -1px rgba(0, 0, 0, 0.4);
}

.shadow-elevation-6dp {
  box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14),
              0 1px 18px 0 rgba(0, 0, 0, 0.12),
              0 3px 5px -1px rgba(0, 0, 0, 0.4);
}

.shadow-elevation-8dp {
  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14),
              0 3px 14px 2px rgba(0, 0, 0, 0.12),
              0 5px 5px -3px rgba(0, 0, 0, 0.4);
}

.shadow-elevation-16dp {
  box-shadow: 0 16px 24px 2px rgba(0, 0, 0, 0.14),
              0  6px 30px 5px rgba(0, 0, 0, 0.12),
              0  8px 10px -5px rgba(0, 0, 0, 0.4);
}

</style>`;t.setAttribute("style","display: none;");document.head.appendChild(t.content);
