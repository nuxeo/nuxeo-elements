import"./iframe-T5hUCbnt.js";/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/let u=!1,s=[],c=[];function f(){u=!0,requestAnimationFrame(function(){u=!1,i(s),setTimeout(function(){a(c)})})}function i(e){for(;e.length;)l(e.shift())}function a(e){for(let t=0,n=e.length;t<n;t++)l(e.shift())}function l(e){const t=e[0],n=e[1],o=e[2];try{n.apply(t,o)}catch(r){setTimeout(()=>{throw r})}}function d(e,t,n){u||f(),c.push([e,t,n])}export{d as a};
