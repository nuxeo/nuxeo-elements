const _customElementsDefine = window.customElements.define;
window.customElements.define = (...args) => {
  if (args.length && !customElements.get(args[0])) {
    _customElementsDefine.call(window.customElements, ...args);
  }
};
