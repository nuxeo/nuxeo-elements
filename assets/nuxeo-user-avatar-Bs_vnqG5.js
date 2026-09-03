import{h}from"./iframe-T5hUCbnt.js";import"./iron-icon-lX3uy4jx.js";import"./nuxeo-icons-DihWRFWD.js";/**
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
*/{class a extends Nuxeo.Element{static get template(){return h`
        <style>
          :host {
            display: inline-block;
          }

          #container {
            position: relative;
          }

          #character {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }

          iron-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            height: 12px;
            width: 12px;
            fill: white;
          }
        </style>

        <nuxeo-resource id="getUserProfile" enrichers="userprofile" enrichers-entity="user"></nuxeo-resource>

        <div id="container" aria-hidden="true">
          <span id="character" hidden$="[[!_isInTheAlphabet]]">{{_output}}</span>
          <iron-icon hidden$="[[_isInTheAlphabet]]" icon="nuxeo:user"></iron-icon>
        </div>
      `}static get is(){return"nuxeo-user-avatar"}static get properties(){return{user:{type:Object},fetchAvatar:{type:Boolean,value:!1},height:{type:Number,value:48,observer:"__obsHeight"},width:{type:Number,value:48,observer:"__obsWidth"},textColor:{type:String,value:"#FFFFFF",observer:"__obsTextColor"},fontSize:{type:Number,value:20,observer:"__obsFontSize"},fontWeight:{type:Number,value:400,observer:"__obsFontWeight"},borderRadius:{type:Number,value:0,observer:"__obsBorderRadius"},boxShadow:{type:String,value:"0px 0px 0px 0px rgba(33,33,33,0.75)",observer:"__obsBoxShadow"},textShadow:{type:String,value:"0px 0px 0px rgba(33,33,33,0.75)",observer:"__obsTextShadow"},_output:{type:String}}}static get observers(){return["__makeAvatar(user)"]}_username(t){return this._isEntity(t)?t.id:this._id(t)}_isEntity(t){return t&&t["entity-type"]&&(t["entity-type"]==="user"||t["entity-type"]==="document"&&t.type==="user")&&t.properties}_id(t){if(t)return t.properties&&(t.properties.username||t.properties["user:username"])||t.id||t.uid||t.replace("user:","")}_name(t){if(this._isEntity(t)){const e=t.properties.firstName||t.properties["user:firstName"],i=t.properties.lastName||t.properties["user:lastName"],r=t.properties.username||t.properties["user:username"];return[e,i].join(" ").trim()||r||this._id(t)}return this._id(t)}_lastPart(t){if(!t.length)return;let e=t[0];for(let i=1;i<t.length;i++)e=t[i];return e}_initials(t){if(this._isEntity(t)){const r=(t.properties.firstName||t.properties["user:firstName"]||"").trim(),o=(t.properties.lastName||t.properties["user:lastName"]||"").trim();if(r||o){const s=[r,o].join(" ").trim().split(/\s+/).filter(Boolean);if(s.length<=1)return s[0]?s[0].charAt(0):"";const n=this._lastPart(s);return`${s[0].charAt(0)}${n.charAt(0)}`}}const e=(this._name(t)||"").trim().split(/\s+/).filter(Boolean);if(e.length<=1)return e[0]?e[0].charAt(0):"";const i=this._lastPart(e);return`${e[0].charAt(0)}${i.charAt(0)}`}_email(t){if(this._isEntity(t)){const e=t.properties.email||t.properties["user:email"];return e!==this._id(t)?e:""}return""}__obsHeight(){this.$.container.style.height=`${this.height}px`}__obsWidth(){this.$.container.style.width=`${this.width}px`}__obsTextColor(){this.$.character.style.color=this.textColor}__obsFontSize(){this.$.character.style.fontSize=`${this.fontSize}px`}__obsFontWeight(){this.$.character.style.fontWeight=this.fontWeight}__obsBorderRadius(){Number.isFinite(this.borderRadius)||(this.borderRadius=0),this.$.container.style.borderRadius=`${this.borderRadius}%`}__obsBoxShadow(){this.$.container.style.webkitBoxShadow=this.boxShadow,this.$.container.style.mozBoxShadow=this.boxShadow,this.$.container.style.boxShadow=this.boxShadow}__obsTextShadow(){this.$.character.style.webkitTextShadow=this.textShadow,this.$.character.style.mozTextShadow=this.textShadow,this.$.character.style.textShadow=this.textShadow}__generateHue(){let t=0;const e=this._id(this.user);return Object.keys(e).forEach(i=>{t&=t,t=e.charCodeAt(i)+((t<<5)-t)}),Math.abs(t%360)}__makeAvatar(){if(this.user)if(this.user.contextParameters&&this.user.contextParameters.userprofile&&this.user.contextParameters.userprofile.avatar)this._output="",this.$.container.style.background=`url(${this.user.contextParameters.userprofile.avatar.data})`,this.$.container.style.backgroundRepeat="no-repeat",this.$.container.style.backgroundSize=`${this.height}px ${this.height}px`;else{const t=this._name(this.user),i=["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","1","2","3","4","5","6","7","8","9","0"].indexOf(t.charAt(0).toLowerCase());this.$.container.style.backgroundColor=`hsl(${this.__generateHue()}, 70%, 42%)`,this._isInTheAlphabet=i>-1,this._isInTheAlphabet&&(this._output=this._initials(this.user)),this.fetchAvatar&&(this.$.getUserProfile.path=`user/${this._username(this.user)}`,this.$.getUserProfile.get().then(r=>{r.contextParameters&&r.contextParameters.userprofile&&r.contextParameters.userprofile.avatar&&(this.user=r)}).catch(()=>{console.warn(`Cannot fetch profile for user ${this._username(this.user)}`)}))}}}customElements.define(a.is,a),Nuxeo.UserAvatar=a}
