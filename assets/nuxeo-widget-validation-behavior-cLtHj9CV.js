import"./iframe-DfANLok6.js";/**
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
*/let r=0;const a={observers:["_ariaValidationStateChanged(invalid, required, errorMessage)"],detached(){this._disconnectAriaValidationObserver()},_applyDefaultRequiredError(){this._isWidgetRequired()&&this._isEmptyWidgetValue()?(!this.errorMessage||this._defaultRequiredError)&&(this.errorMessage=this.i18n("widget.required"),this._defaultRequiredError=!0):this._clearDefaultRequiredError()},_clearDefaultRequiredError(){this._defaultRequiredError&&(this.errorMessage="",this._defaultRequiredError=!1)},_isWidgetRequired(){return!!this.required},_isEmptyWidgetValue(){const{value:i}=this;return i==null||i===""||Array.isArray(i)&&i.length===0},_ariaValidationControl(){return null},_ariaValidationMessageElement(){return this.shadowRoot?this.shadowRoot.querySelector(".error"):null},_ariaValidationStateChanged(){this._syncAriaValidationState()},_syncAriaValidationState(){this._ariaValidationSyncPending||(this._ariaValidationSyncPending=!0,setTimeout(()=>{this._ariaValidationSyncPending=!1,this._applyAriaValidationState()},0))},_applyAriaValidationState(){const i=this._ariaValidationControl();if(!i)return;i.setAttribute("aria-invalid",this.invalid?"true":"false"),this._isWidgetRequired()?i.setAttribute("aria-required","true"):i.removeAttribute("aria-required");const e=this._ariaValidationMessageElement();e&&(e.id||(r+=1,e.id=`nuxeo-widget-error-${r}`),this.invalid&&this.errorMessage?i.setAttribute("aria-describedby",e.id):i.removeAttribute("aria-describedby"))},_observeAriaValidationControl(i){!i||this._ariaValidationObserver||(this._ariaValidationObserver=new MutationObserver(()=>this._syncAriaValidationState()),this._ariaValidationObserver.observe(i,{childList:!0,subtree:!0}))},_disconnectAriaValidationObserver(){this._ariaValidationObserver&&(this._ariaValidationObserver.disconnect(),this._ariaValidationObserver=null)}};export{a as W};
