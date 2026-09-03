import"./iframe-T5hUCbnt.js";/**
@license
©2023 Hyland Software, Inc. and its affiliates. All rights reserved. 
All Hyland product names are registered or unregistered trademarks of Hyland Software, Inc. or its affiliates.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*//*
 * @license
 * ©2023 Hyland Software, Inc. and its affiliates. All rights reserved. 
All Hyland product names are registered or unregistered trademarks of Hyland Software, Inc. or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */window.nuxeo=window.nuxeo||{};window.nuxeo.I18n=window.nuxeo.I18n||{};window.nuxeo.I18n.translate=window.nuxeo.I18n.translate||function(...o){const t=window.nuxeo.I18n.language||"en",a=o[0];let e=window.nuxeo.I18n[t]&&window.nuxeo.I18n[t][a]||a;const l=Array.prototype.slice.call(o,1);for(let n=0;n<l.length;n++)e=e.replace(`{${n}}`,l[n]);return e};window.nuxeo.I18n.loadLocale=function(){return window.nuxeo.I18n.localeResolver?window.nuxeo.I18n.localeResolver().then(()=>{window.nuxeo.I18n.translate=window.nuxeo.I18n.translate.bind(null),document.dispatchEvent(new Event("i18n-locale-loaded"))}):new Promise(()=>{})};const i={properties:{i18n:{type:Function,notify:!0,value(){return window.nuxeo.I18n.translate}}},created(){this.localeLoadedHandler=this.refreshI18n.bind(this),document.addEventListener("i18n-locale-loaded",this.localeLoadedHandler)},detached(){document.removeEventListener("i18n-locale-loaded",this.localeLoadedHandler),this.localeLoadedHandler=null},refreshI18n(){this.set("i18n",window.nuxeo.I18n.translate)}};export{i as I};
