import{m as s}from"./moment-with-locales-v-Wg38Ha.js";import{c as o}from"./iframe-T5hUCbnt.js";import{I as u}from"./nuxeo-i18n-behavior-DzdsuNZu.js";/**
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
*/const l=[u,{formatSize(t){return!t||t<0?"":t>1048576?`${parseFloat(t/1048576).toFixed(2)} MB`:t>1024?`${parseFloat(t/1024).toFixed(2)} KB`:`${t.toString()} Bytes`},_formatDate(t,r,e){if(!t)return;s.locale(this._languageCode());const i=e==="Etc/UTC"?s.utc:s;return r&&r==="relative"?i().to(t):i(t).format(r)},formatDate(t,r,e){return this._formatDate(t,r||o.get("dateFormat","LL"),e||o.get("timezone"))},formatDateTime(t,r,e){return this._formatDate(t,r||o.get("dateTimeFormat","LLL"),e||o.get("timezone"))},formatMimeType(t){if(t)return this.i18n(`mimetype.${t}`)},formatRendition(t){if(t)return this.i18n(`exportButton.${t}`)},formatVersion(t){return t&&t.properties&&t.properties["uid:major_version"]!=null&&t.properties["uid:minor_version"]!=null?`${t.properties["uid:major_version"]}.${t.properties["uid:minor_version"]}`:""},formatDirectory(t,r){if(t&&t["entity-type"]&&t["entity-type"]==="directoryEntry"){if(t.properties&&t.properties.label)return this._absoluteDirectoryPath(t,"label",r||"/");const e=`label_${this._languageCode()}`;return this._absoluteDirectoryPath(t,e||"label_en",r||"/")}return t},_absoluteDirectoryPath(t,r,e,i){const{parent:n}=t.properties;let a=t.properties[r];return i&&(a+=e+i),n&&n["entity-type"]&&n["entity-type"]==="directoryEntry"?this._absoluteDirectoryPath(n,r,e,a):a},formatDocType(t){if(t)return this._getI18nWithPrefix("label.document.type",t.toLowerCase())},formatPermission(t){if(!t)return;const r=t.substring(0,1).toLowerCase()+t.substring(1);return this._getI18nWithPrefix("label.security.permission",r)},formatLifecycleState(t){return this._getI18nWithPrefix("label.ui.state",t)},_getI18nWithPrefix(t,r,...e){const i=`${t}.${r}`,n=this.i18n(i,...e);return n===i?r:n},formatFulltext(t){return t.replace(/-/g," ")},_languageCode(){return window.nuxeo.I18n.language?window.nuxeo.I18n.language.split("-")[0]:"en"},formatPropertyXpath(t,r){return t.replace(r||/\//g,".")},escapeRegExp(t){return t&&t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")},escapeNxqlStringLiteral(t){const r={"'":"\\'","\\":"\\\\",'"':'\\"'};return t&&t.replace(/["'\\]/g,e=>r[e])}}];export{l as F};
