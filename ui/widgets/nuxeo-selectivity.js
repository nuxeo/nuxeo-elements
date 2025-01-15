/**
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
*/
import { IronFormElementBehavior } from '@polymer/iron-form-element-behavior/iron-form-element-behavior.js';
import { IronValidatableBehavior } from '@polymer/iron-validatable-behavior/iron-validatable-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-operation.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import {I18nBehavior} from "../nuxeo-i18n-behavior";
import '@polymer/iron-icon/iron-icon.js';

/**
 * @license
 * Selectivity.js 3.0.5 <https://arendjr.github.io/selectivity/>
 * Copyright (c) 2014-2016 Arend van Beelen jr.
 *           (c) 2016 Speakap BV
 * Available under MIT license <https://github.com/arendjr/selectivity/blob/master/LICENSE>
 */
(function (f) { if (typeof exports === 'object' && typeof module !== 'undefined') { module.exports = f(); } else if (typeof define === 'function' && define.amd) { define([], f); } else { let g; if (typeof window !== 'undefined') { g = window; } else if (typeof global !== 'undefined') { g = global; } else if (typeof self !== 'undefined') { g = self; } else { g = this; }g.selectivity = f(); } }(() => {
  let define,
    module,
    exports; return (function e(t, n, r) { function s(o, u) { if (!n[o]) { if (!t[o]) { const a = typeof require === 'function' && require; if (!u && a) return a(o, !0); if (i) return i(o, !0); const f = new Error(`Cannot find module '${o}'`); throw (f.code = 'MODULE_NOT_FOUND', f); } const l = n[o] = {exports: {}}; t[o][0].call(l.exports, (e) => { const n = t[o][1][e]; return s(n || e); }, l, l.exports, e, t, n, r); } return n[o].exports; } var i = typeof require === 'function' && require; for (let o = 0; o < r.length; o++)s(r[o]); return s; }({
    1: [function (_dereq_, module, exports) {
      const root = _dereq_(36);

      /** Built-in value references. */
      const Symbol = root.Symbol;

      module.exports = Symbol;

    }, {36: 36}],
    2: [function (_dereq_, module, exports) {
      /**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
      function apply(func, thisArg, args) {
        switch (args.length) {
          case 0: return func.call(thisArg);
          case 1: return func.call(thisArg, args[0]);
          case 2: return func.call(thisArg, args[0], args[1]);
          case 3: return func.call(thisArg, args[0], args[1], args[2]);
        }
        return func.apply(thisArg, args);
      }

      module.exports = apply;

    }, {}],
    3: [function (_dereq_, module, exports) {
      let baseTimes = _dereq_(15),
        isArguments = _dereq_(46),
        isArray = _dereq_(47),
        isBuffer = _dereq_(49),
        isIndex = _dereq_(27),
        isTypedArray = _dereq_(56);

      /** Used for built-in method references. */
      const objectProto = Object.prototype;

      /** Used to check objects for own properties. */
      const hasOwnProperty = objectProto.hasOwnProperty;

      /**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
      function arrayLikeKeys(value, inherited) {
        let isArr = isArray(value),
          isArg = !isArr && isArguments(value),
          isBuff = !isArr && !isArg && isBuffer(value),
          isType = !isArr && !isArg && !isBuff && isTypedArray(value),
          skipIndexes = isArr || isArg || isBuff || isType,
          result = skipIndexes ? baseTimes(value.length, String) : [],
          length = result.length;

        for (const key in value) {
          if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
        // Safari 9 has enumerable `arguments.length` in strict mode.
          (key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) || // Skip index properties.
           isIndex(key, length))
        ))) {
            result.push(key);
          }
        }
        return result;
      }

      module.exports = arrayLikeKeys;

    }, {
      15: 15, 27: 27, 46: 46, 47: 47, 49: 49, 56: 56,
    }],
    4: [function (_dereq_, module, exports) {
      /**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
      function arrayMap(array, iteratee) {
        let index = -1,
          length = array == null ? 0 : array.length,
          result = Array(length);

        while (++index < length) {
          result[index] = iteratee(array[index], index, array);
        }
        return result;
      }

      module.exports = arrayMap;

    }, {}],
    5: [function (_dereq_, module, exports) {
      let baseAssignValue = _dereq_(6),
        eq = _dereq_(43);

      /** Used for built-in method references. */
      const objectProto = Object.prototype;

      /** Used to check objects for own properties. */
      const hasOwnProperty = objectProto.hasOwnProperty;

      /**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
      function assignValue(object, key, value) {
        const objValue = object[key];
        if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
          baseAssignValue(object, key, value);
        }
      }

      module.exports = assignValue;

    }, {43: 43, 6: 6}],
    6: [function (_dereq_, module, exports) {
      const defineProperty = _dereq_(21);

      /**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
      function baseAssignValue(object, key, value) {
        if (key == '__proto__' && defineProperty) {
          defineProperty(object, key, {
            configurable: true,
            enumerable: true,
            value,
            writable: true,
          });
        } else {
          object[key] = value;
        }
      }

      module.exports = baseAssignValue;

    }, {21: 21}],
    7: [function (_dereq_, module, exports) {
      let Symbol = _dereq_(1),
        getRawTag = _dereq_(25),
        objectToString = _dereq_(33);

      /** `Object#toString` result references. */
      let nullTag = '[object Null]',
        undefinedTag = '[object Undefined]';

      /** Built-in value references. */
      const symToStringTag = Symbol ? Symbol.toStringTag : undefined;

      /**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
      function baseGetTag(value) {
        if (value == null) {
          return value === undefined ? undefinedTag : nullTag;
        }
        return (symToStringTag && symToStringTag in Object(value))
          ? getRawTag(value)
          : objectToString(value);
      }

      module.exports = baseGetTag;

    }, {1: 1, 25: 25, 33: 33}],
    8: [function (_dereq_, module, exports) {
      let baseGetTag = _dereq_(7),
        isObjectLike = _dereq_(53);

      /** `Object#toString` result references. */
      const argsTag = '[object Arguments]';

      /**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
      function baseIsArguments(value) {
        return isObjectLike(value) && baseGetTag(value) == argsTag;
      }

      module.exports = baseIsArguments;

    }, {53: 53, 7: 7}],
    9: [function (_dereq_, module, exports) {
      let isFunction = _dereq_(50),
        isMasked = _dereq_(29),
        isObject = _dereq_(52),
        toSource = _dereq_(39);

      /**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
      const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

      /** Used to detect host constructors (Safari). */
      const reIsHostCtor = /^\[object .+?Constructor\]$/;

      /** Used for built-in method references. */
      let funcProto = Function.prototype,
        objectProto = Object.prototype;

      /** Used to resolve the decompiled source of functions. */
      const funcToString = funcProto.toString;

      /** Used to check objects for own properties. */
      const hasOwnProperty = objectProto.hasOwnProperty;

      /** Used to detect if a method is native. */
      const reIsNative = RegExp(`^${
        funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
          .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?')}$`);

      /**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
      function baseIsNative(value) {
        if (!isObject(value) || isMasked(value)) {
          return false;
        }
        const pattern = isFunction(value) ? reIsNative : reIsHostCtor;
        return pattern.test(toSource(value));
      }

      module.exports = baseIsNative;

    }, {
      29: 29, 39: 39, 50: 50, 52: 52,
    }],
    10: [function (_dereq_, module, exports) {
      let baseGetTag = _dereq_(7),
        isLength = _dereq_(51),
        isObjectLike = _dereq_(53);

      /** `Object#toString` result references. */
      let argsTag = '[object Arguments]',
        arrayTag = '[object Array]',
        boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag = '[object Error]',
        funcTag = '[object Function]',
        mapTag = '[object Map]',
        numberTag = '[object Number]',
        objectTag = '[object Object]',
        regexpTag = '[object RegExp]',
        setTag = '[object Set]',
        stringTag = '[object String]',
        weakMapTag = '[object WeakMap]';

      let arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag = '[object DataView]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';

      /** Used to identify `toStringTag` values of typed arrays. */
      const typedArrayTags = {};
      typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
      typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

      /**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
      function baseIsTypedArray(value) {
        return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
      }

      module.exports = baseIsTypedArray;

    }, {51: 51, 53: 53, 7: 7}],
    11: [function (_dereq_, module, exports) {
      let isPrototype = _dereq_(30),
        nativeKeys = _dereq_(31);

      /** Used for built-in method references. */
      const objectProto = Object.prototype;

      /** Used to check objects for own properties. */
      const hasOwnProperty = objectProto.hasOwnProperty;

      /**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
      function baseKeys(object) {
        if (!isPrototype(object)) {
          return nativeKeys(object);
        }
        const result = [];
        for (const key in Object(object)) {
          if (hasOwnProperty.call(object, key) && key != 'constructor') {
            result.push(key);
          }
        }
        return result;
      }

      module.exports = baseKeys;

    }, {30: 30, 31: 31}],
    12: [function (_dereq_, module, exports) {
      /**
 * The base implementation of `_.propertyOf` without support for deep paths.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Function} Returns the new accessor function.
 */
      function basePropertyOf(object) {
        return function (key) {
          return object == null ? undefined : object[key];
        };
      }

      module.exports = basePropertyOf;

    }, {}],
    13: [function (_dereq_, module, exports) {
      let identity = _dereq_(45),
        overRest = _dereq_(35),
        setToString = _dereq_(37);

      /**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
      function baseRest(func, start) {
        return setToString(overRest(func, start, identity), `${func}`);
      }

      module.exports = baseRest;

    }, {35: 35, 37: 37, 45: 45}],
    14: [function (_dereq_, module, exports) {
      let constant = _dereq_(41),
        defineProperty = _dereq_(21),
        identity = _dereq_(45);

      /**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
      const baseSetToString = !defineProperty ? identity : function (func, string) {
        return defineProperty(func, 'toString', {
          configurable: true,
          enumerable: false,
          value: constant(string),
          writable: true,
        });
      };

      module.exports = baseSetToString;

    }, {21: 21, 41: 41, 45: 45}],
    15: [function (_dereq_, module, exports) {
      /**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
      function baseTimes(n, iteratee) {
        let index = -1,
          result = Array(n);

        while (++index < n) {
          result[index] = iteratee(index);
        }
        return result;
      }

      module.exports = baseTimes;

    }, {}],
    16: [function (_dereq_, module, exports) {
      let Symbol = _dereq_(1),
        arrayMap = _dereq_(4),
        isArray = _dereq_(47),
        isSymbol = _dereq_(55);

      /** Used as references for various `Number` constants. */
      const INFINITY = 1 / 0;

      /** Used to convert symbols to primitives and strings. */
      let symbolProto = Symbol ? Symbol.prototype : undefined,
        symbolToString = symbolProto ? symbolProto.toString : undefined;

      /**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
      function baseToString(value) {
        // Exit early for strings to avoid a performance hit in some environments.
        if (typeof value === 'string') {
          return value;
        }
        if (isArray(value)) {
          // Recursively convert values (susceptible to call stack limits).
          return `${arrayMap(value, baseToString)}`;
        }
        if (isSymbol(value)) {
          return symbolToString ? symbolToString.call(value) : '';
        }
        const result = (`${value}`);
        return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
      }

      module.exports = baseToString;

    }, {
      1: 1, 4: 4, 47: 47, 55: 55,
    }],
    17: [function (_dereq_, module, exports) {
      /**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
      function baseUnary(func) {
        return function (value) {
          return func(value);
        };
      }

      module.exports = baseUnary;

    }, {}],
    18: [function (_dereq_, module, exports) {
      let assignValue = _dereq_(5),
        baseAssignValue = _dereq_(6);

      /**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
      function copyObject(source, props, object, customizer) {
        const isNew = !object;
        object || (object = {});

        let index = -1,
          length = props.length;

        while (++index < length) {
          const key = props[index];

          let newValue = customizer
            ? customizer(object[key], source[key], key, object, source)
            : undefined;

          if (newValue === undefined) {
            newValue = source[key];
          }
          if (isNew) {
            baseAssignValue(object, key, newValue);
          } else {
            assignValue(object, key, newValue);
          }
        }
        return object;
      }

      module.exports = copyObject;

    }, {5: 5, 6: 6}],
    19: [function (_dereq_, module, exports) {
      const root = _dereq_(36);

      /** Used to detect overreaching core-js shims. */
      const coreJsData = root['__core-js_shared__'];

      module.exports = coreJsData;

    }, {36: 36}],
    20: [function (_dereq_, module, exports) {
      let baseRest = _dereq_(13),
        isIterateeCall = _dereq_(28);

      /**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
      function createAssigner(assigner) {
        return baseRest((object, sources) => {
          let index = -1,
            length = sources.length,
            customizer = length > 1 ? sources[length - 1] : undefined,
            guard = length > 2 ? sources[2] : undefined;

          customizer = (assigner.length > 3 && typeof customizer === 'function')
            ? (length--, customizer)
            : undefined;

          if (guard && isIterateeCall(sources[0], sources[1], guard)) {
            customizer = length < 3 ? undefined : customizer;
            length = 1;
          }
          object = Object(object);
          while (++index < length) {
            const source = sources[index];
            if (source) {
              assigner(object, source, index, customizer);
            }
          }
          return object;
        });
      }

      module.exports = createAssigner;

    }, {13: 13, 28: 28}],
    21: [function (_dereq_, module, exports) {
      const getNative = _dereq_(24);

      const defineProperty = (function () {
        try {
          const func = getNative(Object, 'defineProperty');
          func({}, '', {});
          return func;
        } catch (e) {}
      }());

      module.exports = defineProperty;

    }, {24: 24}],
    22: [function (_dereq_, module, exports) {
      const basePropertyOf = _dereq_(12);

      /** Used to map characters to HTML entities. */
      const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };

      /**
 * Used by `_.escape` to convert characters to HTML entities.
 *
 * @private
 * @param {string} chr The matched character to escape.
 * @returns {string} Returns the escaped character.
 */
      const escapeHtmlChar = basePropertyOf(htmlEscapes);

      module.exports = escapeHtmlChar;

    }, {12: 12}],
    23: [function (_dereq_, module, exports) {
      (function (global) {
        /** Detect free variable `global` from Node.js. */
        const freeGlobal = typeof global === 'object' && global && global.Object === Object && global;

        module.exports = freeGlobal;

      }).call(this, typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {});
    }, {}],
    24: [function (_dereq_, module, exports) {
      let baseIsNative = _dereq_(9),
        getValue = _dereq_(26);

      /**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
      function getNative(object, key) {
        const value = getValue(object, key);
        return baseIsNative(value) ? value : undefined;
      }

      module.exports = getNative;

    }, {26: 26, 9: 9}],
    25: [function (_dereq_, module, exports) {
      const Symbol = _dereq_(1);

      /** Used for built-in method references. */
      const objectProto = Object.prototype;

      /** Used to check objects for own properties. */
      const hasOwnProperty = objectProto.hasOwnProperty;

      /**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
      const nativeObjectToString = objectProto.toString;

      /** Built-in value references. */
      const symToStringTag = Symbol ? Symbol.toStringTag : undefined;

      /**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
      function getRawTag(value) {
        let isOwn = hasOwnProperty.call(value, symToStringTag),
          tag = value[symToStringTag];

        try {
          value[symToStringTag] = undefined;
          var unmasked = true;
        } catch (e) {}

        const result = nativeObjectToString.call(value);
        if (unmasked) {
          if (isOwn) {
            value[symToStringTag] = tag;
          } else {
            delete value[symToStringTag];
          }
        }
        return result;
      }

      module.exports = getRawTag;

    }, {1: 1}],
    26: [function (_dereq_, module, exports) {
      /**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
      function getValue(object, key) {
        return object == null ? undefined : object[key];
      }

      module.exports = getValue;

    }, {}],
    27: [function (_dereq_, module, exports) {
      /** Used as references for various `Number` constants. */
      const MAX_SAFE_INTEGER = 9007199254740991;

      /** Used to detect unsigned integer values. */
      const reIsUint = /^(?:0|[1-9]\d*)$/;

      /**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
      function isIndex(value, length) {
        length = length == null ? MAX_SAFE_INTEGER : length;
        return !!length &&
    (typeof value === 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
      }

      module.exports = isIndex;

    }, {}],
    28: [function (_dereq_, module, exports) {
      let eq = _dereq_(43),
        isArrayLike = _dereq_(48),
        isIndex = _dereq_(27),
        isObject = _dereq_(52);

      /**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
      function isIterateeCall(value, index, object) {
        if (!isObject(object)) {
          return false;
        }
        const type = typeof index;
        if (type == 'number'
          ? (isArrayLike(object) && isIndex(index, object.length))
          : (type == 'string' && index in object)
        ) {
          return eq(object[index], value);
        }
        return false;
      }

      module.exports = isIterateeCall;

    }, {
      27: 27, 43: 43, 48: 48, 52: 52,
    }],
    29: [function (_dereq_, module, exports) {
      const coreJsData = _dereq_(19);

      /** Used to detect methods masquerading as native. */
      const maskSrcKey = (function () {
        const uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
        return uid ? (`Symbol(src)_1.${uid}`) : '';
      }());

      /**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
      function isMasked(func) {
        return !!maskSrcKey && (maskSrcKey in func);
      }

      module.exports = isMasked;

    }, {19: 19}],
    30: [function (_dereq_, module, exports) {
      /** Used for built-in method references. */
      const objectProto = Object.prototype;

      /**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
      function isPrototype(value) {
        let Ctor = value && value.constructor,
          proto = (typeof Ctor === 'function' && Ctor.prototype) || objectProto;

        return value === proto;
      }

      module.exports = isPrototype;

    }, {}],
    31: [function (_dereq_, module, exports) {
      const overArg = _dereq_(34);

      /* Built-in method references for those with the same name as other `lodash` methods. */
      const nativeKeys = overArg(Object.keys, Object);

      module.exports = nativeKeys;

    }, {34: 34}],
    32: [function (_dereq_, module, exports) {
      const freeGlobal = _dereq_(23);

      /** Detect free variable `exports`. */
      const freeExports = typeof exports === 'object' && exports && !exports.nodeType && exports;

      /** Detect free variable `module`. */
      const freeModule = freeExports && typeof module === 'object' && module && !module.nodeType && module;

      /** Detect the popular CommonJS extension `module.exports`. */
      const moduleExports = freeModule && freeModule.exports === freeExports;

      /** Detect free variable `process` from Node.js. */
      const freeProcess = moduleExports && freeGlobal.process;

      /** Used to access faster Node.js helpers. */
      const nodeUtil = (function () {
        try {
          return freeProcess && freeProcess.binding && freeProcess.binding('util');
        } catch (e) {}
      }());

      module.exports = nodeUtil;

    }, {23: 23}],
    33: [function (_dereq_, module, exports) {
      /** Used for built-in method references. */
      const objectProto = Object.prototype;

      /**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
      const nativeObjectToString = objectProto.toString;

      /**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
      function objectToString(value) {
        return nativeObjectToString.call(value);
      }

      module.exports = objectToString;

    }, {}],
    34: [function (_dereq_, module, exports) {
      /**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
      function overArg(func, transform) {
        return function (arg) {
          return func(transform(arg));
        };
      }

      module.exports = overArg;

    }, {}],
    35: [function (_dereq_, module, exports) {
      const apply = _dereq_(2);

      /* Built-in method references for those with the same name as other `lodash` methods. */
      const nativeMax = Math.max;

      /**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
      function overRest(func, start, transform) {
        start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
        return function () {
          let args = arguments,
            index = -1,
            length = nativeMax(args.length - start, 0),
            array = Array(length);

          while (++index < length) {
            array[index] = args[start + index];
          }
          index = -1;
          const otherArgs = Array(start + 1);
          while (++index < start) {
            otherArgs[index] = args[index];
          }
          otherArgs[start] = transform(array);
          return apply(func, this, otherArgs);
        };
      }

      module.exports = overRest;

    }, {2: 2}],
    36: [function (_dereq_, module, exports) {
      const freeGlobal = _dereq_(23);

      /** Detect free variable `self`. */
      const freeSelf = typeof self === 'object' && self && self.Object === Object && self;

      /** Used as a reference to the global object. */
      const root = freeGlobal || freeSelf || Function('return this')();

      module.exports = root;

    }, {23: 23}],
    37: [function (_dereq_, module, exports) {
      let baseSetToString = _dereq_(14),
        shortOut = _dereq_(38);

      /**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
      const setToString = shortOut(baseSetToString);

      module.exports = setToString;

    }, {14: 14, 38: 38}],
    38: [function (_dereq_, module, exports) {
      /** Used to detect hot functions by number of calls within a span of milliseconds. */
      let HOT_COUNT = 800,
        HOT_SPAN = 16;

      /* Built-in method references for those with the same name as other `lodash` methods. */
      const nativeNow = Date.now;

      /**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
      function shortOut(func) {
        let count = 0,
          lastCalled = 0;

        return function () {
          let stamp = nativeNow(),
            remaining = HOT_SPAN - (stamp - lastCalled);

          lastCalled = stamp;
          if (remaining > 0) {
            if (++count >= HOT_COUNT) {
              return arguments[0];
            }
          } else {
            count = 0;
          }
          return func(...arguments);
        };
      }

      module.exports = shortOut;

    }, {}],
    39: [function (_dereq_, module, exports) {
      /** Used for built-in method references. */
      const funcProto = Function.prototype;

      /** Used to resolve the decompiled source of functions. */
      const funcToString = funcProto.toString;

      /**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
      function toSource(func) {
        if (func != null) {
          try {
            return funcToString.call(func);
          } catch (e) {}
          try {
            return (`${func}`);
          } catch (e) {}
        }
        return '';
      }

      module.exports = toSource;

    }, {}],
    40: [function (_dereq_, module, exports) {
      let assignValue = _dereq_(5),
        copyObject = _dereq_(18),
        createAssigner = _dereq_(20),
        isArrayLike = _dereq_(48),
        isPrototype = _dereq_(30),
        keys = _dereq_(57);

      /** Used for built-in method references. */
      const objectProto = Object.prototype;

      /** Used to check objects for own properties. */
      const hasOwnProperty = objectProto.hasOwnProperty;

      /**
 * Assigns own enumerable string keyed properties of source objects to the
 * destination object. Source objects are applied from left to right.
 * Subsequent sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object` and is loosely based on
 * [`Object.assign`](https://mdn.io/Object/assign).
 *
 * @static
 * @memberOf _
 * @since 0.10.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.assignIn
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * function Bar() {
 *   this.c = 3;
 * }
 *
 * Foo.prototype.b = 2;
 * Bar.prototype.d = 4;
 *
 * _.assign({ 'a': 0 }, new Foo, new Bar);
 * // => { 'a': 1, 'c': 3 }
 */
      const assign = createAssigner((object, source) => {
        if (isPrototype(source) || isArrayLike(source)) {
          copyObject(source, keys(source), object);
          return;
        }
        for (const key in source) {
          if (hasOwnProperty.call(source, key)) {
            assignValue(object, key, source[key]);
          }
        }
      });

      module.exports = assign;

    }, {
      18: 18, 20: 20, 30: 30, 48: 48, 5: 5, 57: 57,
    }],
    41: [function (_dereq_, module, exports) {
      /**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
      function constant(value) {
        return function () {
          return value;
        };
      }

      module.exports = constant;

    }, {}],
    42: [function (_dereq_, module, exports) {
      let isObject = _dereq_(52),
        now = _dereq_(58),
        toNumber = _dereq_(60);

      /** Error message constants. */
      const FUNC_ERROR_TEXT = 'Expected a function';

      /* Built-in method references for those with the same name as other `lodash` methods. */
      let nativeMax = Math.max,
        nativeMin = Math.min;

      /**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
      function debounce(func, wait, options) {
        let lastArgs,
          lastThis,
          maxWait,
          result,
          timerId,
          lastCallTime,
          lastInvokeTime = 0,
          leading = false,
          maxing = false,
          trailing = true;

        if (typeof func !== 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        wait = toNumber(wait) || 0;
        if (isObject(options)) {
          leading = !!options.leading;
          maxing = 'maxWait' in options;
          maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
          trailing = 'trailing' in options ? !!options.trailing : trailing;
        }

        function invokeFunc(time) {
          let args = lastArgs,
            thisArg = lastThis;

          lastArgs = lastThis = undefined;
          lastInvokeTime = time;
          result = func.apply(thisArg, args);
          return result;
        }

        function leadingEdge(time) {
          // Reset any `maxWait` timer.
          lastInvokeTime = time;
          // Start the timer for the trailing edge.
          timerId = setTimeout(timerExpired, wait);
          // Invoke the leading edge.
          return leading ? invokeFunc(time) : result;
        }

        function remainingWait(time) {
          let timeSinceLastCall = time - lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime,
            result = wait - timeSinceLastCall;

          return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
        }

        function shouldInvoke(time) {
          let timeSinceLastCall = time - lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime;

          // Either this is the first call, activity has stopped and we're at the
          // trailing edge, the system time has gone backwards and we're treating
          // it as the trailing edge, or we've hit the `maxWait` limit.
          return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
        }

        function timerExpired() {
          const time = now();
          if (shouldInvoke(time)) {
            return trailingEdge(time);
          }
          // Restart the timer.
          timerId = setTimeout(timerExpired, remainingWait(time));
        }

        function trailingEdge(time) {
          timerId = undefined;

          // Only invoke if we have `lastArgs` which means `func` has been
          // debounced at least once.
          if (trailing && lastArgs) {
            return invokeFunc(time);
          }
          lastArgs = lastThis = undefined;
          return result;
        }

        function cancel() {
          if (timerId !== undefined) {
            clearTimeout(timerId);
          }
          lastInvokeTime = 0;
          lastArgs = lastCallTime = lastThis = timerId = undefined;
        }

        function flush() {
          return timerId === undefined ? result : trailingEdge(now());
        }

        function debounced() {
          let time = now(),
            isInvoking = shouldInvoke(time);

          lastArgs = arguments;
          lastThis = this;
          lastCallTime = time;

          if (isInvoking) {
            if (timerId === undefined) {
              return leadingEdge(lastCallTime);
            }
            if (maxing) {
              // Handle invocations in a tight loop.
              timerId = setTimeout(timerExpired, wait);
              return invokeFunc(lastCallTime);
            }
          }
          if (timerId === undefined) {
            timerId = setTimeout(timerExpired, wait);
          }
          return result;
        }
        debounced.cancel = cancel;
        debounced.flush = flush;
        return debounced;
      }

      module.exports = debounce;

    }, {52: 52, 58: 58, 60: 60}],
    43: [function (_dereq_, module, exports) {
      /**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
      function eq(value, other) {
        return value === other || (value !== value && other !== other);
      }

      module.exports = eq;

    }, {}],
    44: [function (_dereq_, module, exports) {
      let escapeHtmlChar = _dereq_(22),
        toString = _dereq_(61);

      /** Used to match HTML entities and HTML characters. */
      let reUnescapedHtml = /[&<>"']/g,
        reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

      /**
 * Converts the characters "&", "<", ">", '"', and "'" in `string` to their
 * corresponding HTML entities.
 *
 * **Note:** No other characters are escaped. To escape additional
 * characters use a third-party library like [_he_](https://mths.be/he).
 *
 * Though the ">" character is escaped for symmetry, characters like
 * ">" and "/" don't need escaping in HTML and have no special meaning
 * unless they're part of a tag or unquoted attribute value. See
 * [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
 * (under "semi-related fun fact") for more details.
 *
 * When working with HTML you should always
 * [quote attribute values](http://wonko.com/post/html-escaping) to reduce
 * XSS vectors.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escape('fred, barney, & pebbles');
 * // => 'fred, barney, &amp; pebbles'
 */
      function escape(string) {
        string = toString(string);
        return (string && reHasUnescapedHtml.test(string))
          ? string.replace(reUnescapedHtml, escapeHtmlChar)
          : string;
      }

      module.exports = escape;

    }, {22: 22, 61: 61}],
    45: [function (_dereq_, module, exports) {
      /**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
      function identity(value) {
        return value;
      }

      module.exports = identity;

    }, {}],
    46: [function (_dereq_, module, exports) {
      let baseIsArguments = _dereq_(8),
        isObjectLike = _dereq_(53);

      /** Used for built-in method references. */
      const objectProto = Object.prototype;

      /** Used to check objects for own properties. */
      const hasOwnProperty = objectProto.hasOwnProperty;

      /** Built-in value references. */
      const propertyIsEnumerable = objectProto.propertyIsEnumerable;

      /**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
      const isArguments = baseIsArguments(function () { return arguments; }()) ? baseIsArguments : function (value) {
        return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
      };

      module.exports = isArguments;

    }, {53: 53, 8: 8}],
    47: [function (_dereq_, module, exports) {
      /**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
      const isArray = Array.isArray;

      module.exports = isArray;

    }, {}],
    48: [function (_dereq_, module, exports) {
      let isFunction = _dereq_(50),
        isLength = _dereq_(51);

      /**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
      function isArrayLike(value) {
        return value != null && isLength(value.length) && !isFunction(value);
      }

      module.exports = isArrayLike;

    }, {50: 50, 51: 51}],
    49: [function (_dereq_, module, exports) {
      let root = _dereq_(36),
        stubFalse = _dereq_(59);

      /** Detect free variable `exports`. */
      const freeExports = typeof exports === 'object' && exports && !exports.nodeType && exports;

      /** Detect free variable `module`. */
      const freeModule = freeExports && typeof module === 'object' && module && !module.nodeType && module;

      /** Detect the popular CommonJS extension `module.exports`. */
      const moduleExports = freeModule && freeModule.exports === freeExports;

      /** Built-in value references. */
      const Buffer = moduleExports ? root.Buffer : undefined;

      /* Built-in method references for those with the same name as other `lodash` methods. */
      const nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

      /**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
      const isBuffer = nativeIsBuffer || stubFalse;

      module.exports = isBuffer;

    }, {36: 36, 59: 59}],
    50: [function (_dereq_, module, exports) {
      let baseGetTag = _dereq_(7),
        isObject = _dereq_(52);

      /** `Object#toString` result references. */
      let asyncTag = '[object AsyncFunction]',
        funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        proxyTag = '[object Proxy]';

      /**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
      function isFunction(value) {
        if (!isObject(value)) {
          return false;
        }
        // The use of `Object#toString` avoids issues with the `typeof` operator
        // in Safari 9 which returns 'object' for typed arrays and other constructors.
        const tag = baseGetTag(value);
        return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
      }

      module.exports = isFunction;

    }, {52: 52, 7: 7}],
    51: [function (_dereq_, module, exports) {
      /** Used as references for various `Number` constants. */
      const MAX_SAFE_INTEGER = 9007199254740991;

      /**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
      function isLength(value) {
        return typeof value === 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
      }

      module.exports = isLength;

    }, {}],
    52: [function (_dereq_, module, exports) {
      /**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
      function isObject(value) {
        const type = typeof value;
        return value != null && (type == 'object' || type == 'function');
      }

      module.exports = isObject;

    }, {}],
    53: [function (_dereq_, module, exports) {
      /**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
      function isObjectLike(value) {
        return value != null && typeof value === 'object';
      }

      module.exports = isObjectLike;

    }, {}],
    54: [function (_dereq_, module, exports) {
      let baseGetTag = _dereq_(7),
        isArray = _dereq_(47),
        isObjectLike = _dereq_(53);

      /** `Object#toString` result references. */
      const stringTag = '[object String]';

      /**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
      function isString(value) {
        return typeof value === 'string' ||
    (!isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
      }

      module.exports = isString;

    }, {47: 47, 53: 53, 7: 7}],
    55: [function (_dereq_, module, exports) {
      let baseGetTag = _dereq_(7),
        isObjectLike = _dereq_(53);

      /** `Object#toString` result references. */
      const symbolTag = '[object Symbol]';

      /**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
      function isSymbol(value) {
        return typeof value === 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
      }

      module.exports = isSymbol;

    }, {53: 53, 7: 7}],
    56: [function (_dereq_, module, exports) {
      let baseIsTypedArray = _dereq_(10),
        baseUnary = _dereq_(17),
        nodeUtil = _dereq_(32);

      /* Node.js helper references. */
      const nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

      /**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
      const isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

      module.exports = isTypedArray;

    }, {10: 10, 17: 17, 32: 32}],
    57: [function (_dereq_, module, exports) {
      let arrayLikeKeys = _dereq_(3),
        baseKeys = _dereq_(11),
        isArrayLike = _dereq_(48);

      /**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
      function keys(object) {
        return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
      }

      module.exports = keys;

    }, {11: 11, 3: 3, 48: 48}],
    58: [function (_dereq_, module, exports) {
      const root = _dereq_(36);

      /**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
      const now = function () {
        return root.Date.now();
      };

      module.exports = now;

    }, {36: 36}],
    59: [function (_dereq_, module, exports) {
      /**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
      function stubFalse() {
        return false;
      }

      module.exports = stubFalse;

    }, {}],
    60: [function (_dereq_, module, exports) {
      let isObject = _dereq_(52),
        isSymbol = _dereq_(55);

      /** Used as references for various `Number` constants. */
      const NAN = 0 / 0;

      /** Used to match leading and trailing whitespace. */
      const reTrim = /^\s+|\s+$/g;

      /** Used to detect bad signed hexadecimal string values. */
      const reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

      /** Used to detect binary string values. */
      const reIsBinary = /^0b[01]+$/i;

      /** Used to detect octal string values. */
      const reIsOctal = /^0o[0-7]+$/i;

      /** Built-in method references without a dependency on `root`. */
      const freeParseInt = parseInt;

      /**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
      function toNumber(value) {
        if (typeof value === 'number') {
          return value;
        }
        if (isSymbol(value)) {
          return NAN;
        }
        if (isObject(value)) {
          const other = typeof value.valueOf === 'function' ? value.valueOf() : value;
          value = isObject(other) ? (`${other}`) : other;
        }
        if (typeof value !== 'string') {
          return value === 0 ? value : +value;
        }
        value = value.replace(reTrim, '');
        const isBinary = reIsBinary.test(value);
        return (isBinary || reIsOctal.test(value))
          ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
          : (reIsBadHex.test(value) ? NAN : +value);
      }

      module.exports = toNumber;

    }, {52: 52, 55: 55}],
    61: [function (_dereq_, module, exports) {
      const baseToString = _dereq_(16);

      /**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
      function toString(value) {
        return value == null ? '' : baseToString(value);
      }

      module.exports = toString;

    }, {16: 16}],
    62: [function (_dereq_, module, exports) {


      const assign = _dereq_(40);

      const EventListener = _dereq_(63);
      const getItemSelector = _dereq_(79);
      const matchesSelector = _dereq_(81);
      const parseElement = _dereq_(82);
      const removeElement = _dereq_(83);
      const stopPropagation = _dereq_(84);
      const toggleClass = _dereq_(85);

      const Selectivity = _dereq_(76);

      const HIGHLIGHT_CLASS = 'highlight';
      const HIGHLIGHT_SELECTOR = `.${HIGHLIGHT_CLASS}`;
      const LOAD_MORE_SELECTOR = '.selectivity-load-more';
      const RESULT_ITEM_SELECTOR = '.selectivity-result-item';

      const SCROLL_EVENTS = ['scroll', 'touchend', 'touchmove'];

      function findClosestElementMatchingSelector(el, selector) {
        while (el && !matchesSelector(el, selector)) {
          el = el.parentElement;
        }
        return el || null;
      }

      /**
 * Selectivity Dropdown Constructor.
 *
 * @param selectivity Selectivity instance to which the dropdown belongs.
 * @param options Options object. Should have the following properties:
 *                highlightFirstItem - Set to false if you don't want the first item to be
 *                                     automatically highlighted (optional).
 *                items - Array of items to display.
 *                position - Callback for positioning the dropdown.
 *                query - Callback to fetch the items to display.
 *                showSearchInput - Boolean whether a search input should be shown.
 */
      function SelectivityDropdown(selectivity, options) {
        this.el = parseElement(selectivity.template('dropdown', {
          dropdownCssClass: selectivity.options.dropdownCssClass,
          searchInputPlaceholder: selectivity.options.searchInputPlaceholder,
          showSearchInput: options.showSearchInput,
        }));

        /**
     * DOM element to add the results to.
     */
        this.resultsContainer = this.$('.selectivity-results-container');

        /**
     * Boolean indicating whether more results are available than currently displayed in the
     * dropdown.
     */
        this.hasMore = false;

        /**
     * The currently highlighted result item.
     */
        this.highlightedResult = null;

        /**
     * Boolean whether the load more link is currently highlighted.
     */
        this.loadMoreHighlighted = false;

        /**
     * Options passed to the dropdown constructor.
     */
        this.options = options;

        /**
     * The results displayed in the dropdown.
     */
        this.results = [];

        /**
     * Selectivity instance.
     */
        this.selectivity = selectivity;

        this._closed = false;
        this._lastMousePosition = {};

        this.close = this.close.bind(this);
        this.position = this.position.bind(this);

        if (selectivity.options.closeOnSelect !== false) {
          selectivity.events.on('selectivity-selecting', this.close);
        }

        this.addToDom();
        this.showLoading();

        if (options.showSearchInput) {
          selectivity.initInput(this.$('.selectivity-search-input'));
          selectivity.focus();
        }

        const events = {};
        events[`click ${LOAD_MORE_SELECTOR}`] = this._loadMoreClicked;
        events[`click ${RESULT_ITEM_SELECTOR}`] = this._resultClicked;
        events[`mouseenter ${LOAD_MORE_SELECTOR}`] = this._loadMoreHovered;
        events[`mouseenter ${RESULT_ITEM_SELECTOR}`] = this._resultHovered;

        this.events = new EventListener(this.el, this);
        this.events.on(events);

        this._attachScrollListeners();
        this._suppressWheel();

        setTimeout(this.triggerOpen.bind(this), 1);
      }

      /**
 * Methods.
 */
      assign(SelectivityDropdown.prototype, {
        /**
     * Convenience shortcut for this.el.querySelector(selector).
     */
        $(selector) {
          return this.el.querySelector(selector);
        },

        /**
     * Adds the dropdown to the DOM.
     */
        addToDom() {
          this.selectivity.el.appendChild(this.el);
        },

        /**
     * Closes the dropdown.
     */
        close() {
          if (!this._closed) {
            this._closed = true;

            removeElement(this.el);

            this.selectivity.events.off('selectivity-selecting', this.close);

            this.triggerClose();

            this._removeScrollListeners();
          }
        },

        /**
     * Highlights a result item.
     *
     * @param item The item to highlight.
     * @param options Optional options object that may contain the following property:
     *                reason - The reason why the result item is being highlighted. Possible
     *                         values: 'current_value', 'first_result', 'hovered'.
     */
        highlight(item, options) {
          toggleClass(this.$(HIGHLIGHT_SELECTOR), HIGHLIGHT_CLASS, false);
          toggleClass(this.$(getItemSelector(RESULT_ITEM_SELECTOR, item.id)), HIGHLIGHT_CLASS, true);

          this.highlightedResult = item;
          this.loadMoreHighlighted = false;

          this.selectivity.triggerEvent('selectivity-highlight', {
            item,
            id: item.id,
            reason: (options && options.reason) || 'unspecified',
          });
        },

        /**
     * Highlights the load more link.
     *
     * @param item The item to highlight.
     */
        highlightLoadMore() {
          toggleClass(this.$(HIGHLIGHT_SELECTOR), HIGHLIGHT_CLASS, false);
          toggleClass(this.$(LOAD_MORE_SELECTOR), HIGHLIGHT_CLASS, true);

          this.highlightedResult = null;
          this.loadMoreHighlighted = true;
        },

        /**
     * Loads a follow-up page with results after a search.
     *
     * This method should only be called after a call to search() when the callback has indicated
     * more results are available.
     */
        loadMore() {
          removeElement(this.$(LOAD_MORE_SELECTOR));
          this.resultsContainer.innerHTML += this.selectivity.template('loading');

          this.options.query({
            callback: function (response) {
              if (response && response.results) {
                this._showResults(Selectivity.processItems(response.results), {
                  add: true,
                  hasMore: !!response.more,
                });
              } else {
                throw new Error('callback must be passed a response object');
              }
            }.bind(this),
            error: this._showResults.bind(this, [], { add: true }),
            offset: this.results.length,
            selectivity: this.selectivity,
            term: this.term,
          });
        },

        /**
     * Positions the dropdown inside the DOM.
     */
        position() {
          const position = this.options.position;
          if (position) {
            position(this.el, this.selectivity.el);
          }

          this._scrolled();
        },

        /**
     * Renders an array of result items.
     *
     * @param items Array of result items.
     *
     * @return HTML-formatted string to display the result items.
     */
        renderItems(items) {
          const selectivity = this.selectivity;
          return items
            .map(function (item) {
              let result = selectivity.template(item.id ? 'resultItem' : 'resultLabel', item);
              if (item.children) {
                result += selectivity.template('resultChildren', {
                  childrenHtml: this.renderItems(item.children),
                });
              }
              return result;
            }, this)
            .join('');
        },

        /**
     * Searches for results based on the term given.
     *
     * If an items array has been passed with the options to the Selectivity instance, a local
     * search will be performed among those items. Otherwise, the query function specified in the
     * options will be used to perform the search. If neither is defined, nothing happens.
     *
     * @param term Term to search for.
     */
        search(term) {
          this.term = term;

          this.options.query({
            callback: function (response) {
              if (response && response.results) {
                if (this.options.items) {
                  term = Selectivity.transformText(term);
                  const matcher = this.selectivity.options.matcher || Selectivity.matcher;
                  this._showResults(
                    this.options.items
                      .map((item) => matcher(item, term))
                      .filter((item) => !!item),
                    { term },
                  );
                } else {
                  this._showResults(Selectivity.processItems(response.results), {
                    hasMore: !!response.more,
                    term,
                  });
                }
              } else {
                throw new Error('callback must be passed a response object');
              }
            }.bind(this),
            error: this.showError.bind(this),
            offset: 0,
            selectivity: this.selectivity,
            term,
          });
        },

        /**
     * Selects the highlighted item.
     */
        selectHighlight() {
          if (this.highlightedResult) {
            this.selectItem(this.highlightedResult.id);
          } else if (this.loadMoreHighlighted) {
            this.loadMore();
          }
        },

        /**
     * Selects the item with the given ID.
     *
     * @param id ID of the item to select.
     */
        selectItem(id) {
          const item = Selectivity.findNestedById(this.results, id);
          if (item && !item.disabled && item.selectable !== false) {
            const options = { id, item };
            if (this.selectivity.triggerEvent('selectivity-selecting', options)) {
              this.selectivity.triggerEvent('selectivity-selected', options);
            }
          }
        },

        /**
     * Shows an error message.
     *
     * @param message Error message to display.
     * @param options Options object. May contain the following property:
     *                escape - Set to false to disable HTML-escaping of the message. Useful if you
     *                         want to set raw HTML as the message, but may open you up to XSS
     *                         attacks if you're not careful with escaping user input.
     */
        showError(message, options) {
          this.resultsContainer.innerHTML = this.selectivity.template('error', {
            escape: !options || options.escape !== false,
            message,
          });

          this.hasMore = false;
          this.results = [];

          this.highlightedResult = null;
          this.loadMoreHighlighted = false;

          this.position();
        },

        /**
     * Shows a loading indicator in the dropdown.
     */
        showLoading() {
          this.resultsContainer.innerHTML = this.selectivity.template('loading');

          this.hasMore = false;
          this.results = [];

          this.highlightedResult = null;
          this.loadMoreHighlighted = false;

          this.position();
        },

        /**
     * Shows the results from a search query.
     *
     * @param results Array of result items.
     * @param options Options object. May contain the following properties:
     *                add - True if the results should be added to any already shown results.
     *                dropdown - The dropdown instance for which the results are meant.
     *                hasMore - Boolean whether more results can be fetched using the query()
     *                          function.
     *                term - The search term for which the results are displayed.
     */
         showResults(results, options) {
          const searchText = options && options.term && options.term.trim();
          if (options.add) {
            removeElement(this.$('.selectivity-loading'));
          } else if(searchText && searchText !== '') {
            this.resultsContainer.innerHTML = '';
          }

          const filteredResults = this.selectivity.filterResults(results);
          const value = this.selectivity.getValue();
          const isFilteredResultNotEmpty = filteredResults.some((item) => item.text.trim() !== '');
          let resultsHtml = isFilteredResultNotEmpty ? this.renderItems(filteredResults) : '';
          if (options.hasMore) {
            resultsHtml += this.selectivity.template('loadMore');
          } else if (
            value &&
            Array.isArray(value) &&
            value.includes(options && options.term ? options.term.toLowerCase() : null)
          ) {
            resultsHtml = this.selectivity.template('tagExists');
          } else if (!resultsHtml && !options.add) {
            resultsHtml = this.selectivity.template('noResults', { term: options.term });
          }
          
          if (resultsHtml) {
            this.resultsContainer.innerHTML = '';
            removeElement(this.$('.selectivity-loading'));
            this.resultsContainer.innerHTML += resultsHtml;
          }
          this.results = options.add ? this.results.concat(results) : results;

          this.hasMore = options.hasMore;
          if (value && !Array.isArray(value)) {
            const item = Selectivity.findNestedById(results, value);
            if (item) {
              this.highlight(item, { reason: 'current_value' });
            }
          } else if (
            this.options.highlightFirstItem !== false &&
            (!options.add || this.loadMoreHighlighted)
          ) {
            this._highlightFirstItem(filteredResults);
          }

          this.position();
        },
        /**
     * Triggers the 'selectivity-close' event.
     */
        triggerClose() {
          this.selectivity.triggerEvent('selectivity-close');
        },

        /**
     * Triggers the 'selectivity-open' event.
     */
        triggerOpen() {
          this.selectivity.triggerEvent('selectivity-open');
        },

        /**
     * @private
     */
        _attachScrollListeners() {
          for (let i = 0; i < SCROLL_EVENTS.length; i++) {
            window.addEventListener(SCROLL_EVENTS[i], this.position, true);
          }
          window.addEventListener('resize', this.position);
        },

        /**
     * @private
     */
        _highlightFirstItem(results) {
          function findFirstItem(results) {
            for (let i = 0, length = results.length; i < length; i++) {
              const result = results[i];
              if (result.id) {
                return result;
              } else if (result.children) {
                const item = findFirstItem(result.children);
                if (item) {
                  return item;
                }
              }
            }
          }

          const firstItem = findFirstItem(results);
          if (firstItem) {
            this.highlight(firstItem, { reason: 'first_result' });
          } else {
            this.highlightedResult = null;
            this.loadMoreHighlighted = false;
          }
        },

        /**
     * @private
     */
        _loadMoreClicked(event) {
          this.loadMore();

          stopPropagation(event);
        },

        /**
     * @private
     */
        _loadMoreHovered(event) {
          if (
            event.screenX === undefined ||
            event.screenX !== this._lastMousePosition.x ||
            event.screenY === undefined ||
            event.screenY !== this._lastMousePosition.y
          ) {
            this.highlightLoadMore();

            this._recordMousePosition(event);
          }
        },

        /**
     * @private
     */
        _recordMousePosition(event) {
          this._lastMousePosition = { x: event.screenX, y: event.screenY };
        },

        /**
     * @private
     */
        _removeScrollListeners() {
          for (let i = 0; i < SCROLL_EVENTS.length; i++) {
            window.removeEventListener(SCROLL_EVENTS[i], this.position, true);
          }
          window.removeEventListener('resize', this.position);
        },

        /**
     * @private
     */
        _resultClicked(event) {
          this.selectItem(this.selectivity.getRelatedItemId(event));

          stopPropagation(event);
        },

        /**
     * @private
     */
        _resultHovered(event) {
          if (
            !event.screenX ||
            event.screenX !== this._lastMousePosition.x ||
            !event.screenY ||
            event.screenY !== this._lastMousePosition.y
          ) {
            const id = this.selectivity.getRelatedItemId(event);
            const item = Selectivity.findNestedById(this.results, id);
            if (item && !item.disabled) {
              this.highlight(item, { reason: 'hovered' });
            }

            this._recordMousePosition(event);
          }
        },

        /**
     * @private
     */
        _scrolled() {
          const el = this.$(LOAD_MORE_SELECTOR);
          if (el && el.offsetTop - this.resultsContainer.scrollTop < this.el.clientHeight) {
            this.loadMore();
          }
        },

        /**
     * @private
     */
        _showResults(results, options) {
          this.showResults(results, assign({ dropdown: this }, options));
        },

        /**
     * @private
     */
        _suppressWheel() {
          const suppressWheelSelector = this.selectivity.options.suppressWheelSelector;
          if (suppressWheelSelector === null) {
            return;
          }

          const selector = suppressWheelSelector || '.selectivity-results-container';
          this.events.on('wheel', selector, (event) => {
            // Thanks to Troy Alford:
            // http://stackoverflow.com/questions/5802467/prevent-scrolling-of-parent-element

            const delta = event.deltaMode === 0 ? event.deltaY : event.deltaY * 40;
            const el = findClosestElementMatchingSelector(event.target, selector);
            const height = el.clientHeight;
            const scrollHeight = el.scrollHeight;
            const scrollTop = el.scrollTop;

            function prevent() {
              stopPropagation(event);
              event.preventDefault();
            }

            if (scrollHeight > height) {
              if (delta < -scrollTop) {
                // Scrolling up, but this will take us past the top.
                el.scrollTop = 0;
                prevent();
              } else if (delta > scrollHeight - height - scrollTop) {
                // Scrolling down, but this will take us past the bottom.
                el.scrollTop = scrollHeight;
                prevent();
              }
            }
          });
        },
      });

      module.exports = Selectivity.Dropdown = SelectivityDropdown;

    }, {
      40: 40, 63: 63, 76: 76, 79: 79, 81: 81, 82: 82, 83: 83, 84: 84, 85: 85,
    }],
    63: [function (_dereq_, module, exports) {


      const assign = _dereq_(40);
      const isString = _dereq_(54);

      const matchesSelector = _dereq_(81);

      const CAPTURED_EVENTS = ['blur', 'focus', 'mouseenter', 'mouseleave', 'scroll'];

      /**
 * Listens to events dispatched to an element or its children.
 *
 * @param el The element to listen to.
 * @param context Optional context in which to execute the callbacks.
 */
      function EventListener(el, context) {
        this.context = context || null;

        this.el = el;

        this.events = {};

        this._onEvent = this._onEvent.bind(this);
      }

      assign(EventListener.prototype, {
        /**
     * Destructor.
     *
     * Removes all event listeners and cleans up all references.
     */
        destruct() {
          Object.keys(this.events).forEach(function (eventName) {
            const useCapture = CAPTURED_EVENTS.indexOf(eventName) > -1;
            this.el.removeEventListener(eventName, this._onEvent, useCapture);
          }, this);

          this.context = null;
          this.el = null;
          this.events = null;
        },

        /**
     * Stops listening to an event.
     *
     * The arguments are the same as for on(), but when no callback is given, all callbacks for the
     * given event and class are discarded.
     */
        off(eventName, selector, callback) {
          if (!this.events) {
            // this means that destruction might be in progress
            return;
          }
          if (!isString(selector)) {
            callback = selector;
            selector = '';
          }

          if (callback) {
            let events = this.events[eventName];
            if (events) {
              events = events[selector];
              if (events) {
                for (let i = 0; i < events.length; i++) {
                  if (events[i] === callback) {
                    events.splice(i, 1);
                    i--;
                  }
                }
              }
            }
          } else {
            this.events[eventName][selector] = [];
          }
        },

        /**
     * Starts listening to an event.
     *
     * @param eventName Name of the event to listen to, in lower-case.
     * @param selector Optional CSS selector. If given, only events inside a child element matching
     *                 the selector are caught.
     * @param callback Callback to invoke when the event is caught.
     *
     * Alternatively, the arguments may be provided using a map to start listening to multiple
     * events at once. Here, the keys of the map are eventNames and the values are callbacks.
     * Selectors may be specified by separating them from the event name with a space. For example:
     *
     *     .on({
     *         'blur': this._blurred,
     *         'click .some-input': this._inputClicked,
     *     })
     */
        on(eventName, selector, callback) {
          if (!isString(eventName)) {
            const eventsMap = eventName;
            for (const key in eventsMap) {
              if (eventsMap.hasOwnProperty(key)) {
                const split = key.split(' ');
                if (split.length > 1) {
                  this.on(split[0], split[1], eventsMap[key]);
                } else {
                  this.on(split[0], eventsMap[key]);
                }
              }
            }
            return;
          }

          if (!isString(selector)) {
            callback = selector;
            selector = '';
          }

          if (!this.events.hasOwnProperty(eventName)) {
            const useCapture = CAPTURED_EVENTS.indexOf(eventName) > -1;
            this.el.addEventListener(eventName, this._onEvent, useCapture);

            this.events[eventName] = {};
          }

          if (!this.events[eventName].hasOwnProperty(selector)) {
            this.events[eventName][selector] = [];
          }

          if (this.events[eventName][selector].indexOf(callback) < 0) {
            this.events[eventName][selector].push(callback);
          }
        },

        _onEvent(event) {
          let isPropagationStopped = false;
          const stopPropagation = event.stopPropagation;
          event.stopPropagation = function () {
            stopPropagation.call(event);
            isPropagationStopped = true;
          };

          const context = this.context;
          function callAll(callbacks) {
            for (let i = 0; i < callbacks.length; i++) {
              callbacks[i].call(context, event);
            }
          }

          let target = event.target;
          const events = this.events[event.type.toLowerCase()];
          while (target && target !== this.el && !isPropagationStopped) {
            for (const selector in events) {
              if (
                selector &&
                    events.hasOwnProperty(selector) &&
                    matchesSelector(target, selector)
              ) {
                callAll(events[selector]);
              }
            }
            target = target.parentElement;
          }

          if (!isPropagationStopped && events.hasOwnProperty('')) {
            callAll(events['']);
          }
        },
      });

      module.exports = EventListener;

    }, {40: 40, 54: 54, 81: 81}],
    64: [function (_dereq_, module, exports) {


      const assign = _dereq_(40);

      const MultipleInput = _dereq_(65);
      const Selectivity = _dereq_(76);

      function isValidEmail(email) {
        const atIndex = email.indexOf('@');
        if (atIndex === -1 || email.indexOf(' ') > -1) {
          return false; // email needs to have an '@', and may not contain any spaces
        }

        const dotIndex = email.lastIndexOf('.');
        if (dotIndex === -1) {
          // no dot is fine, as long as the '@' is followed by at least two more characters
          return atIndex < email.length - 2;
        }

        // but if there is a dot after the '@', it must be followed by at least two more characters
        return dotIndex > atIndex ? dotIndex < email.length - 2 : true;
      }

      function lastWord(token, length) {
        length = length === undefined ? token.length : length;
        for (let i = length - 1; i >= 0; i--) {
          if (/\s/.test(token[i])) {
            return token.slice(i + 1, length);
          }
        }
        return token.slice(0, length);
      }

      function stripEnclosure(token, enclosure) {
        if (token.charAt(0) === enclosure[0] && token.slice(-1) === enclosure[1]) {
          return token.slice(1, -1).trim();
        } else {
          return token.trim();
        }
      }

      function createEmailItem(token) {
        let email = lastWord(token);
        let name = token.slice(0, -email.length).trim();
        if (isValidEmail(email)) {
          email = stripEnclosure(stripEnclosure(email, '()'), '<>');
          name = stripEnclosure(name, '""').trim() || email;
          return { id: email, text: name };
        } else {
          return token.trim() ? { id: token, text: token } : null;
        }
      }

      function emailTokenizer(input, selection, createToken) {
        function hasToken(input) {
          if (input) {
            for (let i = 0, length = input.length; i < length; i++) {
              switch (input[i]) {
                case ';':
                case ',':
                case '\n':
                  return true;
                case ' ':
                case '\t':
                  if (isValidEmail(lastWord(input, i))) {
                    return true;
                  }
                  break;
                case '"':
                  do {
                    i++;
                  } while (i < length && input[i] !== '"');
                  break;
                default:
                  continue;
              }
            }
          }
          return false;
        }

        function takeToken(input) {
          for (let i = 0, length = input.length; i < length; i++) {
            switch (input[i]) {
              case ';':
              case ',':
              case '\n':
                return { term: input.slice(0, i), input: input.slice(i + 1) };
              case ' ':
              case '\t':
                if (isValidEmail(lastWord(input, i))) {
                  return { term: input.slice(0, i), input: input.slice(i + 1) };
                }
                break;
              case '"':
                do {
                  i++;
                } while (i < length && input[i] !== '"');
                break;
              default:
                continue;
            }
          }
          return {};
        }

        while (hasToken(input)) {
          const token = takeToken(input);
          if (token.term) {
            const item = createEmailItem(token.term);
            if (item && !(item.id && Selectivity.findById(selection, item.id))) {
              createToken(item);
            }
          }
          input = token.input;
        }

        return input;
      }

      /**
 * EmailInput Constructor.
 *
 * @param options Options object. Accepts all options from the MultipleInput Constructor.
 */
      function EmailInput(options) {
        MultipleInput.call(
          this,
          assign(
            {
              createTokenItem: createEmailItem,
              showDropdown: false,
              tokenizer: emailTokenizer,
            },
            options,
          ),
        );

        this.events.on('blur', function () {
          const input = this.input;
          if (input && isValidEmail(lastWord(input.value))) {
            this.add(createEmailItem(input.value));
          }
        });
      }

      Selectivity.inherits(EmailInput, MultipleInput);

      module.exports = Selectivity.Inputs.Email = EmailInput;

    }, {40: 40, 65: 65, 76: 76}],
    65: [function (_dereq_, module, exports) {


      const assign = _dereq_(40);
      const isString = _dereq_(54);

      const Selectivity = _dereq_(76);
      const getItemSelector = _dereq_(79);
      const getKeyCode = _dereq_(80);
      const parseElement = _dereq_(82);
      const removeElement = _dereq_(83);
      const stopPropagation = _dereq_(84);
      const toggleClass = _dereq_(85);

      const KEY_BACKSPACE = 8;
      const KEY_DELETE = 46;
      const KEY_ENTER = 13;

      const INPUT_SELECTOR = '.selectivity-multiple-input';
      const SELECTED_ITEM_SELECTOR = '.selectivity-multiple-selected-item';

      const hasTouch = 'ontouchstart' in window;

      /**
 * MultipleInput Constructor.
 */
      function MultipleInput(options) {
        Selectivity.call(
          this,
          assign(
            {
              // dropdowns for multiple-value inputs should open below the select box,
              // unless there is not enough space below, but there is space enough above, then it should
              // open upwards
              positionDropdown(el, selectEl) {
                const rect = selectEl.getBoundingClientRect();
                const dropdownHeight = el.clientHeight;
                const openUpwards =
                        rect.bottom + dropdownHeight > window.innerHeight &&
                        rect.top - dropdownHeight > 0;

                assign(el.style, {
                  left: `${rect.left}px`,
                  top: `${openUpwards ? rect.top - dropdownHeight : rect.bottom}px`,
                  width: `${rect.width}px`,
                });
              },

              showSearchInputInDropdown: false,
            },
            options,
          ),
        );

        this._reset();

        const events = {
          change: this.rerenderSelection,
          click: this._clicked,
          'selectivity-selected': this._resultSelected,
        };
        events[`change ${INPUT_SELECTOR}`] = stopPropagation;
        events[`click ${SELECTED_ITEM_SELECTOR}`] = this._itemClicked;
        events[`click ${SELECTED_ITEM_SELECTOR}-remove`] = this._itemRemoveClicked;
        events[`keydown ${INPUT_SELECTOR}`] = this._keyHeld;
        events[`keyup ${INPUT_SELECTOR}`] = this._keyReleased;
        events[`paste ${INPUT_SELECTOR}`] = this._onPaste;

        this.events.on(events);
      }

      /**
 * Methods.
 */
      var callSuper = Selectivity.inherits(MultipleInput, Selectivity, {
        /**
     * Adds an item to the selection, if it's not selected yet.
     *
     * @param item The item to add. May be an item with 'id' and 'text' properties or just an ID.
     */
        add(item) {
          const itemIsId = Selectivity.isValidId(item);
          const id = itemIsId ? item : this.validateItem(item) && item.id;

          if (this._value.indexOf(id) === -1) {
            this._value.push(id);

            if (itemIsId && this.options.initSelection) {
              this.options.initSelection(
                [id],
                (data) => {
                  if (this._value.indexOf(id) > -1) {
                    item = this.validateItem(data[0]);
                    this._data.push(item);

                    this.triggerChange({ added: item });
                  }
                },
              );
            } else {
              if (itemIsId) {
                item = this.getItemForId(id);
              }
              this._data.push(item);

              this.triggerChange({ added: item });
            }
          }

          this.input.value = '';
          this._updateInputWidth();
        },

        /**
     * Clears the data and value.
     */
        clear() {
          this.setData([]);
        },

        /**
     * @inherit
     */
        filterResults(results) {
          results = results.map(function (item) {
            const result = {
              id: item.id,
              text: item.text,
              item: item.item,
            };
            if (item.children) {
              result.children = this.filterResults(item.children);
            }
            return result;
          }, this);

          return results.filter(function (item) {
            return !Selectivity.findById(this._data, item.id);
          }, this);
        },

        /**
     * Returns the correct data for a given value.
     *
     * @param value The value to get the data for. Should be an array of IDs.
     *
     * @return The corresponding data. Will be an array of objects with 'id' and 'text' properties.
     *         Note that if no items are defined, this method assumes the text labels will be equal
     *         to the IDs.
     */
        getDataForValue(value) {
          return value.map(this.getItemForId, this).filter((item) => !!item);
        },

        /**
     * Returns the correct value for the given data.
     *
     * @param data The data to get the value for. Should be an array of objects with 'id' and 'text'
     *             properties.
     *
     * @return The corresponding value. Will be an array of IDs.
     */
        getValueForData(data) {
          return data.map((item) => item.id);
        },

        /**
     * Removes an item from the selection, if it is selected.
     *
     * @param item The item to remove. May be an item with 'id' and 'text' properties or just an ID.
     */
        remove(item) {
          const id = item.id || item;

          let removedItem;
          let index = Selectivity.findIndexById(this._data, id);
          if (index > -1) {
            removedItem = this._data[index];
            this._data.splice(index, 1);
          }

          if (this._value[index] !== id) {
            index = this._value.indexOf(id);
          }
          if (index > -1) {
            this._value.splice(index, 1);
          }

          if (removedItem) {
            this.triggerChange({ removed: removedItem });
          }

          if (id === this._highlightedItemId) {
            this._highlightedItemId = null;
          }

          this._updateInputWidth();
        },

        /**
     * Re-renders the selection.
     *
     * Normally the UI is automatically updated whenever the selection changes, but you may want to
     * call this method explicitly if you've updated the selection with the triggerChange option set
     * to false.
     */
        rerenderSelection(event) {
          event = event || {};

          if (event.added) {
            this._renderSelectedItem(event.added);

            this._scrollToBottom();
          } else if (event.removed) {
            removeElement(this.$(getItemSelector(SELECTED_ITEM_SELECTOR, event.removed.id)));
          } else {
            this._forEachSelectedItem(removeElement);

            this._data.forEach(this._renderSelectedItem, this);

            this._updateInputWidth();
          }

          if (event.added || event.removed) {
            if (this.dropdown) {
              this.dropdown.showResults(this.filterResults(this.dropdown.results), {
                hasMore: this.dropdown.hasMore,
              });
            }

            if (!hasTouch) {
              this.focus();
            }
          }

          this.positionDropdown();

          this._updatePlaceholder();
        },

        /**
     * @inherit
     */
        search(term) {
          if (this.options.tokenizer) {
            term = this.options.tokenizer(term, this._data, this.add.bind(this), this.options);

            if (isString(term) && term !== this.input.value) {
              this.input.value = term;
            }
          }

          this._updateInputWidth();

          if (this.dropdown) {
            callSuper(this, 'search', term);
          }
        },

        /**
     * @inherit
     */
        setOptions(options) {
          const wasEnabled = this.enabled;

          callSuper(this, 'setOptions', options);

          if (wasEnabled !== this.enabled) {
            this._reset();
          }
        },

        /**
     * Validates data to set. Throws an exception if the data is invalid.
     *
     * @param data The data to validate. Should be an array of objects with 'id' and 'text'
     *             properties.
     *
     * @return The validated data. This may differ from the input data.
     */
        validateData(data) {
          if (data === null) {
            return [];
          } else if (Array.isArray(data)) {
            return data.map(this.validateItem, this);
          } else {
            throw new Error('Data for MultiSelectivity instance should be an array');
          }
        },

        /**
     * Validates a value to set. Throws an exception if the value is invalid.
     *
     * @param value The value to validate. Should be an array of IDs.
     *
     * @return The validated value. This may differ from the input value.
     */
        validateValue(value) {
          if (value === null) {
            return [];
          } else if (Array.isArray(value)) {
            if (value.every(Selectivity.isValidId)) {
              return value;
            } else {
              throw new Error('Value contains invalid IDs');
            }
          } else {
            throw new Error('Value for MultiSelectivity instance should be an array');
          }
        },

        /**
     * @private
     */
        _backspacePressed() {
          if (this.options.backspaceHighlightsBeforeDelete) {
            if (this._highlightedItemId) {
              this._deletePressed();
            } else if (this._value.length) {
              this._highlightItem(this._value.slice(-1)[0]);
            }
          } else if (this._value.length) {
            this.remove(this._value.slice(-1)[0]);
          }
        },

        /**
     * @private
     */
        _clicked(event) {
          if (this.enabled) {
            if (this.options.showDropdown !== false) {
              this.open();
            } else {
              this.focus();
            }

            stopPropagation(event);
          }
        },

        /**
     * @private
     */
        _createToken() {
          const term = this.input.value;
          const createTokenItem = this.options.createTokenItem;

          if (term && createTokenItem) {
            const item = createTokenItem(term);
            if (item) {
              this.add(item);
            }
          }
        },

        /**
     * @private
     */
        _deletePressed() {
          if (this._highlightedItemId) {
            this.remove(this._highlightedItemId);
          }
        },

        /**
     * @private
     */
        _forEachSelectedItem(callback) {
          Array.prototype.forEach.call(this.el.querySelectorAll(SELECTED_ITEM_SELECTOR), callback);
        },

        /**
     * @private
     */
        _highlightItem(id) {
          this._highlightedItemId = id;

          this._forEachSelectedItem((el) => {
            toggleClass(el, 'highlighted', el.getAttribute('data-item-id') === id);
          });

          if (!hasTouch) {
            this.focus();
          }
        },

        /**
     * @private
     */
        _itemClicked(event) {
          if (this.enabled) {
            this._highlightItem(this.getRelatedItemId(event));
          }
        },

        /**
     * @private
     */
        _itemRemoveClicked(event) {
          this.remove(this.getRelatedItemId(event));

          stopPropagation(event);
        },

        /**
     * @private
     */
        _keyHeld(event) {
          this._originalValue = this.input.value;

          if (getKeyCode(event) === KEY_ENTER && !event.ctrlKey) {
            event.preventDefault();
          }
        },

        /**
     * @private
     */
        _keyReleased(event) {
          const inputHadText = !!this._originalValue;
          const keyCode = getKeyCode(event);

          if (keyCode === KEY_ENTER && !event.ctrlKey) {
            this._createToken();
          } else if (keyCode === KEY_BACKSPACE && !inputHadText) {
            this._backspacePressed();
          } else if (keyCode === KEY_DELETE && !inputHadText) {
            this._deletePressed();
          }
        },

        /**
     * @private
     */
        _onPaste() {
          setTimeout(
            () => {
              this.search(this.input.value);

              this._createToken();
            },
            10,
          );
        },

        /**
     * @private
     */
        _renderSelectedItem(item) {
          const el = parseElement(this.template(
            'multipleSelectedItem',
            assign(
              {
                highlighted: item.id === this._highlightedItemId,
                removable: !this.options.readOnly,
              },
              item,
            ),
          ));

          this.input.parentNode.insertBefore(el, this.input);
        },

        /**
     * @private
     */
        _reset() {
          this.el.innerHTML = this.template('multipleSelectInput', { enabled: this.enabled });

          this._highlightedItemId = null;

          this.initInput(this.$(INPUT_SELECTOR));

          this.rerenderSelection();
        },

        /**
     * @private
     */
        _resultSelected(event) {
          if (this._value.indexOf(event.id) === -1) {
            this.add(event.item);
          } else {
            this.remove(event.item);
          }
        },

        /**
     * @private
     */
        _scrollToBottom() {
          const inputContainer = this.$(`${INPUT_SELECTOR}-container`);
          inputContainer.scrollTop = inputContainer.clientHeight;
        },

        /**
     * @private
     */
        _updateInputWidth() {
          const inputContent =
            this.input.value || (!this._data.length && this.options.placeholder) || '';
            const placeholderLength = this.options.placeholder != null && this.options.placeholder.length;
            if (this.enabled && !this._data.length && inputContent.length <= placeholderLength) {
              this.input.setAttribute('size', placeholderLength);
            } else {
              this.input.setAttribute('size', inputContent.length + 2);
            }
          this.positionDropdown();
        },

        /**
     * @private
     */
        _updatePlaceholder() {
          const placeholder = (!this._data.length && this.options.placeholder) || '';
          if (this.enabled) {
            this.input.setAttribute('placeholder', placeholder);
          } else {
            this.$('.selectivity-placeholder').textContent = placeholder;
          }
        },
      });

      module.exports = Selectivity.Inputs.Multiple = MultipleInput;

    }, {
      40: 40, 54: 54, 76: 76, 79: 79, 80: 80, 82: 82, 83: 83, 84: 84, 85: 85,
    }],
    66: [function (_dereq_, module, exports) {


      const assign = _dereq_(40);

      const Selectivity = _dereq_(76);
      const stopPropagation = _dereq_(84);

      /**
 * SingleInput Constructor.
 */
      function SingleInput(options) {
        Selectivity.call(
          this,
          assign(
            {
              // Dropdowns for single-value inputs should open below the select box, unless there
              // is not enough space below, in which case the dropdown should be moved up just
              // enough so it fits in the window, but never so much that it reaches above the top.
              positionDropdown(el, selectEl) {
                const rect = selectEl.getBoundingClientRect();
                const dropdownTop = rect.bottom;

                const deltaUp = Math.min(
                  Math.max(dropdownTop + el.clientHeight - window.innerHeight, 0),
                  rect.top + rect.height,
                );

                assign(el.style, {
                  left: `${rect.left}px`,
                  top: `${dropdownTop - deltaUp}px`,
                  width: `${rect.width}px`,
                });
              },
            },
            options,
          ),
        );

        this.el.innerHTML = this.template('singleSelectInput', this.options);

        this.rerenderSelection();

        if (options.showSearchInputInDropdown === false) {
          this.initInput(this.$('.selectivity-single-select-input'), { search: false });
        }

        this.events.on({
          change: this.rerenderSelection,
          click: this._clicked,
          'click .selectivity-search-input': stopPropagation,
          'click .selectivity-single-selected-item-remove': this._itemRemoveClicked,
          'focus .selectivity-single-select-input': this._focused,
          'selectivity-selected': this._resultSelected,
        });
      }

      /**
 * Methods.
 */
      var callSuper = Selectivity.inherits(SingleInput, Selectivity, {
        /**
     * Clears the data and value.
     */
        clear() {
          this.setData(null);
        },

        /**
     * @inherit
     *
     * @param options Optional options object. May contain the following property:
     *                keepFocus - If true, the focus will remain on the input.
     */
        close(options) {
          this._closing = true;

          callSuper(this, 'close');

          if (options && options.keepFocus && this.input) {
            this.input.focus();
          }

          this._closing = false;
        },

        /**
     * Returns the correct data for a given value.
     *
     * @param value The value to get the data for. Should be an ID.
     *
     * @return The corresponding data. Will be an object with 'id' and 'text' properties. Note that
     *         if no items are defined, this method assumes the text label will be equal to the ID.
     */
        getDataForValue(value) {
          return this.getItemForId(value);
        },

        /**
     * Returns the correct value for the given data.
     *
     * @param data The data to get the value for. Should be an object with 'id' and 'text'
     *             properties or null.
     *
     * @return The corresponding value. Will be an ID or null.
     */
        getValueForData(data) {
          return data ? data.id : null;
        },

        /**
     * Re-renders the selection.
     *
     * Normally the UI is automatically updated whenever the selection changes, but you may want to
     * call this method explicitly if you've updated the selection with the triggerChange option set
     * to false.
     */
        rerenderSelection() {
          const template = this._data ? 'singleSelectedItem' : 'singleSelectPlaceholder';
          const options = this._data
            ? assign(
              {
                removable: this.options.allowClear && !this.options.readOnly,
              },
              this._data,
            )
            : { placeholder: this.options.placeholder };

          this.el.querySelector('input').value = this._value;
          this.$('.selectivity-single-result-container').innerHTML = this.template(template, options);
        },

        /**
     * Validates data to set. Throws an exception if the data is invalid.
     *
     * @param data The data to validate. Should be an object with 'id' and 'text' properties or null
     *             to indicate no item is selected.
     *
     * @return The validated data. This may differ from the input data.
     */
        validateData(data) {
          return data === null ? data : this.validateItem(data);
        },

        /**
     * Validates a value to set. Throws an exception if the value is invalid.
     *
     * @param value The value to validate. Should be null or a valid ID.
     *
     * @return The validated value. This may differ from the input value.
     */
        validateValue(value) {
          if (value == null || Selectivity.isValidId(value)) {
            return value;
          } else {
            throw new Error('Value for SingleSelectivity instance should be a valid ID or null');
          }
        },

        /**
     * @private
     */
        _clicked() {
          if (this.enabled) {
            if (this.dropdown) {
              this.close({ keepFocus: true });
            } else if (this.options.showDropdown !== false) {
              this.open();
            }
          }
        },

        /**
     * @private
     */
        _focused() {
          if (
            this.enabled &&
            !this._closing &&
            !this._opening &&
            this.options.showDropdown !== false
          ) {
            this.open();
          }
        },

        /**
     * @private
     */
        _itemRemoveClicked(event) {
          this.setData(null);

          stopPropagation(event);
        },

        /**
     * @private
     */
        _resultSelected(event) {
          this.setData(event.item);

          this.close({ keepFocus: true });
        },
      });

      module.exports = Selectivity.Inputs.Single = SingleInput;

    }, {40: 40, 76: 76, 84: 84}],
    67: [function (_dereq_, module, exports) {


      const escape = _dereq_(44);

      const Selectivity = _dereq_(76);

      /**
 * Localizable elements of the Selectivity Templates.
 *
 * Be aware that these strings are added straight to the HTML output of the templates, so any
 * non-safe strings should be escaped.
 */
      module.exports = Selectivity.Locale = {
        loading: 'Loading...',
        loadMore: 'Load more...',
        noResults: 'No results found',
        tagExists: 'Tag already exists',

        ajaxError(term) {
          if (term) {
            return `Failed to fetch results for <b>${escape(term)}</b>`;
          } else {
            return 'Failed to fetch results';
          }
        },

        needMoreCharacters(numCharacters) {
          return `Enter ${numCharacters} more characters to search`;
        },

        noResultsForTerm(term) {
          return `No results for <b>${escape(term)}</b>`;
        },
      };

    }, {44: 44, 76: 76}],
    68: [function (_dereq_, module, exports) {


      const debounce = _dereq_(42);

      const Selectivity = _dereq_(76);
      const Locale = _dereq_(67);

      function addUrlParam(url, key, value) {
        return `${url + (url.indexOf('?') > -1 ? '&' : '?') + key}=${encodeURIComponent(value)}`;
      }

      function pick(object, keys) {
        const result = {};
        keys.forEach((key) => {
          if (object[key] !== undefined) {
            result[key] = object[key];
          }
        });
        return result;
      }

      function doFetch(ajax, queryOptions) {
        const fetch = ajax.fetch || window.fetch;
        const term = queryOptions.term;

        let url = typeof ajax.url === 'function' ? ajax.url(queryOptions) : ajax.url;
        if (ajax.params) {
          const params = ajax.params(term, queryOptions.offset || 0);
          for (const key in params) {
            if (params.hasOwnProperty(key)) {
              url = addUrlParam(url, key, params[key]);
            }
          }
        }

        const init = pick(ajax, [
          'body',
          'cache',
          'credentials',
          'headers',
          'integrity',
          'method',
          'mode',
          'redirect',
          'referrer',
          'referrerPolicy',
        ]);

        fetch(url, init, queryOptions)
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else if (Array.isArray(response) || response.results) {
              return response;
            } else {
              throw new Error('Unexpected AJAX response');
            }
          })
          .then((response) => {
            if (Array.isArray(response)) {
              queryOptions.callback({ results: response, more: false });
            } else {
              queryOptions.callback({ results: response.results, more: !!response.more });
            }
          })
          .catch((error) => {
            const formatError = ajax.formatError || Selectivity.Locale.ajaxError;
            queryOptions.error(formatError(term, error), { escape: false });
          });
      }

      /**
 * Option listener that implements a convenience query function for performing AJAX requests.
 */
      Selectivity.OptionListeners.unshift((selectivity, options) => {
        const ajax = options.ajax;
        if (ajax && ajax.url) {
          const fetch = ajax.quietMillis ? debounce(doFetch, ajax.quietMillis) : doFetch;

          options.query = function (queryOptions) {
            const numCharsNeeded = ajax.minimumInputLength - queryOptions.term.length;
            if (numCharsNeeded > 0) {
              queryOptions.error(Selectivity.Locale.needMoreCharacters(numCharsNeeded));
              return;
            }

            fetch(ajax, queryOptions);
          };
        }
      });

    }, {42: 42, 67: 67, 76: 76}],
    69: [function (_dereq_, module, exports) {


      const Selectivity = _dereq_(76);

      let latestQueryNum = 0;

      /**
 * Option listener that will discard any callbacks from the query function if another query has
 * been called afterwards. This prevents responses from remote sources arriving out-of-order.
 */
      Selectivity.OptionListeners.push((selectivity, options) => {
        const query = options.query;
        if (query && !query._async) {
          options.query = function (queryOptions) {
            latestQueryNum++;
            const queryNum = latestQueryNum;

            const callback = queryOptions.callback;
            const error = queryOptions.error;
            queryOptions.callback = function () {
              if (queryNum === latestQueryNum) {
                callback(...arguments);
              }
            };
            queryOptions.error = function () {
              if (queryNum === latestQueryNum) {
                error(...arguments);
              }
            };
            query(queryOptions);
          };
          options.query._async = true;
        }
      });

    }, {76: 76}],
    70: [function (_dereq_, module, exports) {


      const DIACRITICS = {
        '\u24B6': 'A',
        Ａ: 'A',
        À: 'A',
        Á: 'A',
        Â: 'A',
        Ầ: 'A',
        Ấ: 'A',
        Ẫ: 'A',
        Ẩ: 'A',
        Ã: 'A',
        Ā: 'A',
        Ă: 'A',
        Ằ: 'A',
        Ắ: 'A',
        Ẵ: 'A',
        Ẳ: 'A',
        Ȧ: 'A',
        Ǡ: 'A',
        Ä: 'A',
        Ǟ: 'A',
        Ả: 'A',
        Å: 'A',
        Ǻ: 'A',
        Ǎ: 'A',
        Ȁ: 'A',
        Ȃ: 'A',
        Ạ: 'A',
        Ậ: 'A',
        Ặ: 'A',
        Ḁ: 'A',
        Ą: 'A',
        Ⱥ: 'A',
        Ɐ: 'A',
        Ꜳ: 'AA',
        Æ: 'AE',
        Ǽ: 'AE',
        Ǣ: 'AE',
        Ꜵ: 'AO',
        Ꜷ: 'AU',
        Ꜹ: 'AV',
        Ꜻ: 'AV',
        Ꜽ: 'AY',
        '\u24B7': 'B',
        Ｂ: 'B',
        Ḃ: 'B',
        Ḅ: 'B',
        Ḇ: 'B',
        Ƀ: 'B',
        Ƃ: 'B',
        Ɓ: 'B',
        '\u24B8': 'C',
        Ｃ: 'C',
        Ć: 'C',
        Ĉ: 'C',
        Ċ: 'C',
        Č: 'C',
        Ç: 'C',
        Ḉ: 'C',
        Ƈ: 'C',
        Ȼ: 'C',
        Ꜿ: 'C',
        '\u24B9': 'D',
        Ｄ: 'D',
        Ḋ: 'D',
        Ď: 'D',
        Ḍ: 'D',
        Ḑ: 'D',
        Ḓ: 'D',
        Ḏ: 'D',
        Đ: 'D',
        Ƌ: 'D',
        Ɗ: 'D',
        Ɖ: 'D',
        Ꝺ: 'D',
        Ǳ: 'DZ',
        Ǆ: 'DZ',
        ǲ: 'Dz',
        ǅ: 'Dz',
        '\u24BA': 'E',
        Ｅ: 'E',
        È: 'E',
        É: 'E',
        Ê: 'E',
        Ề: 'E',
        Ế: 'E',
        Ễ: 'E',
        Ể: 'E',
        Ẽ: 'E',
        Ē: 'E',
        Ḕ: 'E',
        Ḗ: 'E',
        Ĕ: 'E',
        Ė: 'E',
        Ë: 'E',
        Ẻ: 'E',
        Ě: 'E',
        Ȅ: 'E',
        Ȇ: 'E',
        Ẹ: 'E',
        Ệ: 'E',
        Ȩ: 'E',
        Ḝ: 'E',
        Ę: 'E',
        Ḙ: 'E',
        Ḛ: 'E',
        Ɛ: 'E',
        Ǝ: 'E',
        '\u24BB': 'F',
        Ｆ: 'F',
        Ḟ: 'F',
        Ƒ: 'F',
        Ꝼ: 'F',
        '\u24BC': 'G',
        Ｇ: 'G',
        Ǵ: 'G',
        Ĝ: 'G',
        Ḡ: 'G',
        Ğ: 'G',
        Ġ: 'G',
        Ǧ: 'G',
        Ģ: 'G',
        Ǥ: 'G',
        Ɠ: 'G',
        Ꞡ: 'G',
        Ᵹ: 'G',
        Ꝿ: 'G',
        '\u24BD': 'H',
        Ｈ: 'H',
        Ĥ: 'H',
        Ḣ: 'H',
        Ḧ: 'H',
        Ȟ: 'H',
        Ḥ: 'H',
        Ḩ: 'H',
        Ḫ: 'H',
        Ħ: 'H',
        Ⱨ: 'H',
        Ⱶ: 'H',
        Ɥ: 'H',
        '\u24BE': 'I',
        Ｉ: 'I',
        Ì: 'I',
        Í: 'I',
        Î: 'I',
        Ĩ: 'I',
        Ī: 'I',
        Ĭ: 'I',
        İ: 'I',
        Ï: 'I',
        Ḯ: 'I',
        Ỉ: 'I',
        Ǐ: 'I',
        Ȉ: 'I',
        Ȋ: 'I',
        Ị: 'I',
        Į: 'I',
        Ḭ: 'I',
        Ɨ: 'I',
        '\u24BF': 'J',
        Ｊ: 'J',
        Ĵ: 'J',
        Ɉ: 'J',
        '\u24C0': 'K',
        Ｋ: 'K',
        Ḱ: 'K',
        Ǩ: 'K',
        Ḳ: 'K',
        Ķ: 'K',
        Ḵ: 'K',
        Ƙ: 'K',
        Ⱪ: 'K',
        Ꝁ: 'K',
        Ꝃ: 'K',
        Ꝅ: 'K',
        Ꞣ: 'K',
        '\u24C1': 'L',
        Ｌ: 'L',
        Ŀ: 'L',
        Ĺ: 'L',
        Ľ: 'L',
        Ḷ: 'L',
        Ḹ: 'L',
        Ļ: 'L',
        Ḽ: 'L',
        Ḻ: 'L',
        Ł: 'L',
        Ƚ: 'L',
        Ɫ: 'L',
        Ⱡ: 'L',
        Ꝉ: 'L',
        Ꝇ: 'L',
        Ꞁ: 'L',
        Ǉ: 'LJ',
        ǈ: 'Lj',
        '\u24C2': 'M',
        Ｍ: 'M',
        Ḿ: 'M',
        Ṁ: 'M',
        Ṃ: 'M',
        Ɱ: 'M',
        Ɯ: 'M',
        '\u24C3': 'N',
        Ｎ: 'N',
        Ǹ: 'N',
        Ń: 'N',
        Ñ: 'N',
        Ṅ: 'N',
        Ň: 'N',
        Ṇ: 'N',
        Ņ: 'N',
        Ṋ: 'N',
        Ṉ: 'N',
        Ƞ: 'N',
        Ɲ: 'N',
        Ꞑ: 'N',
        Ꞥ: 'N',
        Ǌ: 'NJ',
        ǋ: 'Nj',
        '\u24C4': 'O',
        Ｏ: 'O',
        Ò: 'O',
        Ó: 'O',
        Ô: 'O',
        Ồ: 'O',
        Ố: 'O',
        Ỗ: 'O',
        Ổ: 'O',
        Õ: 'O',
        Ṍ: 'O',
        Ȭ: 'O',
        Ṏ: 'O',
        Ō: 'O',
        Ṑ: 'O',
        Ṓ: 'O',
        Ŏ: 'O',
        Ȯ: 'O',
        Ȱ: 'O',
        Ö: 'O',
        Ȫ: 'O',
        Ỏ: 'O',
        Ő: 'O',
        Ǒ: 'O',
        Ȍ: 'O',
        Ȏ: 'O',
        Ơ: 'O',
        Ờ: 'O',
        Ớ: 'O',
        Ỡ: 'O',
        Ở: 'O',
        Ợ: 'O',
        Ọ: 'O',
        Ộ: 'O',
        Ǫ: 'O',
        Ǭ: 'O',
        Ø: 'O',
        Ǿ: 'O',
        Ɔ: 'O',
        Ɵ: 'O',
        Ꝋ: 'O',
        Ꝍ: 'O',
        Ƣ: 'OI',
        Ꝏ: 'OO',
        Ȣ: 'OU',
        '\u24C5': 'P',
        Ｐ: 'P',
        Ṕ: 'P',
        Ṗ: 'P',
        Ƥ: 'P',
        Ᵽ: 'P',
        Ꝑ: 'P',
        Ꝓ: 'P',
        Ꝕ: 'P',
        '\u24C6': 'Q',
        Ｑ: 'Q',
        Ꝗ: 'Q',
        Ꝙ: 'Q',
        Ɋ: 'Q',
        '\u24C7': 'R',
        Ｒ: 'R',
        Ŕ: 'R',
        Ṙ: 'R',
        Ř: 'R',
        Ȑ: 'R',
        Ȓ: 'R',
        Ṛ: 'R',
        Ṝ: 'R',
        Ŗ: 'R',
        Ṟ: 'R',
        Ɍ: 'R',
        Ɽ: 'R',
        Ꝛ: 'R',
        Ꞧ: 'R',
        Ꞃ: 'R',
        '\u24C8': 'S',
        Ｓ: 'S',
        ẞ: 'S',
        Ś: 'S',
        Ṥ: 'S',
        Ŝ: 'S',
        Ṡ: 'S',
        Š: 'S',
        Ṧ: 'S',
        Ṣ: 'S',
        Ṩ: 'S',
        Ș: 'S',
        Ş: 'S',
        Ȿ: 'S',
        Ꞩ: 'S',
        Ꞅ: 'S',
        '\u24C9': 'T',
        Ｔ: 'T',
        Ṫ: 'T',
        Ť: 'T',
        Ṭ: 'T',
        Ț: 'T',
        Ţ: 'T',
        Ṱ: 'T',
        Ṯ: 'T',
        Ŧ: 'T',
        Ƭ: 'T',
        Ʈ: 'T',
        Ⱦ: 'T',
        Ꞇ: 'T',
        Ꜩ: 'TZ',
        '\u24CA': 'U',
        Ｕ: 'U',
        Ù: 'U',
        Ú: 'U',
        Û: 'U',
        Ũ: 'U',
        Ṹ: 'U',
        Ū: 'U',
        Ṻ: 'U',
        Ŭ: 'U',
        Ü: 'U',
        Ǜ: 'U',
        Ǘ: 'U',
        Ǖ: 'U',
        Ǚ: 'U',
        Ủ: 'U',
        Ů: 'U',
        Ű: 'U',
        Ǔ: 'U',
        Ȕ: 'U',
        Ȗ: 'U',
        Ư: 'U',
        Ừ: 'U',
        Ứ: 'U',
        Ữ: 'U',
        Ử: 'U',
        Ự: 'U',
        Ụ: 'U',
        Ṳ: 'U',
        Ų: 'U',
        Ṷ: 'U',
        Ṵ: 'U',
        Ʉ: 'U',
        '\u24CB': 'V',
        Ｖ: 'V',
        Ṽ: 'V',
        Ṿ: 'V',
        Ʋ: 'V',
        Ꝟ: 'V',
        Ʌ: 'V',
        Ꝡ: 'VY',
        '\u24CC': 'W',
        Ｗ: 'W',
        Ẁ: 'W',
        Ẃ: 'W',
        Ŵ: 'W',
        Ẇ: 'W',
        Ẅ: 'W',
        Ẉ: 'W',
        Ⱳ: 'W',
        '\u24CD': 'X',
        Ｘ: 'X',
        Ẋ: 'X',
        Ẍ: 'X',
        '\u24CE': 'Y',
        Ｙ: 'Y',
        Ỳ: 'Y',
        Ý: 'Y',
        Ŷ: 'Y',
        Ỹ: 'Y',
        Ȳ: 'Y',
        Ẏ: 'Y',
        Ÿ: 'Y',
        Ỷ: 'Y',
        Ỵ: 'Y',
        Ƴ: 'Y',
        Ɏ: 'Y',
        Ỿ: 'Y',
        '\u24CF': 'Z',
        Ｚ: 'Z',
        Ź: 'Z',
        Ẑ: 'Z',
        Ż: 'Z',
        Ž: 'Z',
        Ẓ: 'Z',
        Ẕ: 'Z',
        Ƶ: 'Z',
        Ȥ: 'Z',
        Ɀ: 'Z',
        Ⱬ: 'Z',
        Ꝣ: 'Z',
        '\u24D0': 'a',
        ａ: 'a',
        ẚ: 'a',
        à: 'a',
        á: 'a',
        â: 'a',
        ầ: 'a',
        ấ: 'a',
        ẫ: 'a',
        ẩ: 'a',
        ã: 'a',
        ā: 'a',
        ă: 'a',
        ằ: 'a',
        ắ: 'a',
        ẵ: 'a',
        ẳ: 'a',
        ȧ: 'a',
        ǡ: 'a',
        ä: 'a',
        ǟ: 'a',
        ả: 'a',
        å: 'a',
        ǻ: 'a',
        ǎ: 'a',
        ȁ: 'a',
        ȃ: 'a',
        ạ: 'a',
        ậ: 'a',
        ặ: 'a',
        ḁ: 'a',
        ą: 'a',
        ⱥ: 'a',
        ɐ: 'a',
        ꜳ: 'aa',
        æ: 'ae',
        ǽ: 'ae',
        ǣ: 'ae',
        ꜵ: 'ao',
        ꜷ: 'au',
        ꜹ: 'av',
        ꜻ: 'av',
        ꜽ: 'ay',
        '\u24D1': 'b',
        ｂ: 'b',
        ḃ: 'b',
        ḅ: 'b',
        ḇ: 'b',
        ƀ: 'b',
        ƃ: 'b',
        ɓ: 'b',
        '\u24D2': 'c',
        ｃ: 'c',
        ć: 'c',
        ĉ: 'c',
        ċ: 'c',
        č: 'c',
        ç: 'c',
        ḉ: 'c',
        ƈ: 'c',
        ȼ: 'c',
        ꜿ: 'c',
        ↄ: 'c',
        '\u24D3': 'd',
        ｄ: 'd',
        ḋ: 'd',
        ď: 'd',
        ḍ: 'd',
        ḑ: 'd',
        ḓ: 'd',
        ḏ: 'd',
        đ: 'd',
        ƌ: 'd',
        ɖ: 'd',
        ɗ: 'd',
        ꝺ: 'd',
        ǳ: 'dz',
        ǆ: 'dz',
        '\u24D4': 'e',
        ｅ: 'e',
        è: 'e',
        é: 'e',
        ê: 'e',
        ề: 'e',
        ế: 'e',
        ễ: 'e',
        ể: 'e',
        ẽ: 'e',
        ē: 'e',
        ḕ: 'e',
        ḗ: 'e',
        ĕ: 'e',
        ė: 'e',
        ë: 'e',
        ẻ: 'e',
        ě: 'e',
        ȅ: 'e',
        ȇ: 'e',
        ẹ: 'e',
        ệ: 'e',
        ȩ: 'e',
        ḝ: 'e',
        ę: 'e',
        ḙ: 'e',
        ḛ: 'e',
        ɇ: 'e',
        ɛ: 'e',
        ǝ: 'e',
        '\u24D5': 'f',
        ｆ: 'f',
        ḟ: 'f',
        ƒ: 'f',
        ꝼ: 'f',
        '\u24D6': 'g',
        ｇ: 'g',
        ǵ: 'g',
        ĝ: 'g',
        ḡ: 'g',
        ğ: 'g',
        ġ: 'g',
        ǧ: 'g',
        ģ: 'g',
        ǥ: 'g',
        ɠ: 'g',
        ꞡ: 'g',
        ᵹ: 'g',
        ꝿ: 'g',
        '\u24D7': 'h',
        ｈ: 'h',
        ĥ: 'h',
        ḣ: 'h',
        ḧ: 'h',
        ȟ: 'h',
        ḥ: 'h',
        ḩ: 'h',
        ḫ: 'h',
        ẖ: 'h',
        ħ: 'h',
        ⱨ: 'h',
        ⱶ: 'h',
        ɥ: 'h',
        ƕ: 'hv',
        '\u24D8': 'i',
        ｉ: 'i',
        ì: 'i',
        í: 'i',
        î: 'i',
        ĩ: 'i',
        ī: 'i',
        ĭ: 'i',
        ï: 'i',
        ḯ: 'i',
        ỉ: 'i',
        ǐ: 'i',
        ȉ: 'i',
        ȋ: 'i',
        ị: 'i',
        į: 'i',
        ḭ: 'i',
        ɨ: 'i',
        ı: 'i',
        '\u24D9': 'j',
        ｊ: 'j',
        ĵ: 'j',
        ǰ: 'j',
        ɉ: 'j',
        '\u24DA': 'k',
        ｋ: 'k',
        ḱ: 'k',
        ǩ: 'k',
        ḳ: 'k',
        ķ: 'k',
        ḵ: 'k',
        ƙ: 'k',
        ⱪ: 'k',
        ꝁ: 'k',
        ꝃ: 'k',
        ꝅ: 'k',
        ꞣ: 'k',
        '\u24DB': 'l',
        ｌ: 'l',
        ŀ: 'l',
        ĺ: 'l',
        ľ: 'l',
        ḷ: 'l',
        ḹ: 'l',
        ļ: 'l',
        ḽ: 'l',
        ḻ: 'l',
        ſ: 'l',
        ł: 'l',
        ƚ: 'l',
        ɫ: 'l',
        ⱡ: 'l',
        ꝉ: 'l',
        ꞁ: 'l',
        ꝇ: 'l',
        ǉ: 'lj',
        '\u24DC': 'm',
        ｍ: 'm',
        ḿ: 'm',
        ṁ: 'm',
        ṃ: 'm',
        ɱ: 'm',
        ɯ: 'm',
        '\u24DD': 'n',
        ｎ: 'n',
        ǹ: 'n',
        ń: 'n',
        ñ: 'n',
        ṅ: 'n',
        ň: 'n',
        ṇ: 'n',
        ņ: 'n',
        ṋ: 'n',
        ṉ: 'n',
        ƞ: 'n',
        ɲ: 'n',
        ŉ: 'n',
        ꞑ: 'n',
        ꞥ: 'n',
        ǌ: 'nj',
        '\u24DE': 'o',
        ｏ: 'o',
        ò: 'o',
        ó: 'o',
        ô: 'o',
        ồ: 'o',
        ố: 'o',
        ỗ: 'o',
        ổ: 'o',
        õ: 'o',
        ṍ: 'o',
        ȭ: 'o',
        ṏ: 'o',
        ō: 'o',
        ṑ: 'o',
        ṓ: 'o',
        ŏ: 'o',
        ȯ: 'o',
        ȱ: 'o',
        ö: 'o',
        ȫ: 'o',
        ỏ: 'o',
        ő: 'o',
        ǒ: 'o',
        ȍ: 'o',
        ȏ: 'o',
        ơ: 'o',
        ờ: 'o',
        ớ: 'o',
        ỡ: 'o',
        ở: 'o',
        ợ: 'o',
        ọ: 'o',
        ộ: 'o',
        ǫ: 'o',
        ǭ: 'o',
        ø: 'o',
        ǿ: 'o',
        ɔ: 'o',
        ꝋ: 'o',
        ꝍ: 'o',
        ɵ: 'o',
        ƣ: 'oi',
        ȣ: 'ou',
        ꝏ: 'oo',
        '\u24DF': 'p',
        ｐ: 'p',
        ṕ: 'p',
        ṗ: 'p',
        ƥ: 'p',
        ᵽ: 'p',
        ꝑ: 'p',
        ꝓ: 'p',
        ꝕ: 'p',
        '\u24E0': 'q',
        ｑ: 'q',
        ɋ: 'q',
        ꝗ: 'q',
        ꝙ: 'q',
        '\u24E1': 'r',
        ｒ: 'r',
        ŕ: 'r',
        ṙ: 'r',
        ř: 'r',
        ȑ: 'r',
        ȓ: 'r',
        ṛ: 'r',
        ṝ: 'r',
        ŗ: 'r',
        ṟ: 'r',
        ɍ: 'r',
        ɽ: 'r',
        ꝛ: 'r',
        ꞧ: 'r',
        ꞃ: 'r',
        '\u24E2': 's',
        ｓ: 's',
        ß: 's',
        ś: 's',
        ṥ: 's',
        ŝ: 's',
        ṡ: 's',
        š: 's',
        ṧ: 's',
        ṣ: 's',
        ṩ: 's',
        ș: 's',
        ş: 's',
        ȿ: 's',
        ꞩ: 's',
        ꞅ: 's',
        ẛ: 's',
        '\u24E3': 't',
        ｔ: 't',
        ṫ: 't',
        ẗ: 't',
        ť: 't',
        ṭ: 't',
        ț: 't',
        ţ: 't',
        ṱ: 't',
        ṯ: 't',
        ŧ: 't',
        ƭ: 't',
        ʈ: 't',
        ⱦ: 't',
        ꞇ: 't',
        ꜩ: 'tz',
        '\u24E4': 'u',
        ｕ: 'u',
        ù: 'u',
        ú: 'u',
        û: 'u',
        ũ: 'u',
        ṹ: 'u',
        ū: 'u',
        ṻ: 'u',
        ŭ: 'u',
        ü: 'u',
        ǜ: 'u',
        ǘ: 'u',
        ǖ: 'u',
        ǚ: 'u',
        ủ: 'u',
        ů: 'u',
        ű: 'u',
        ǔ: 'u',
        ȕ: 'u',
        ȗ: 'u',
        ư: 'u',
        ừ: 'u',
        ứ: 'u',
        ữ: 'u',
        ử: 'u',
        ự: 'u',
        ụ: 'u',
        ṳ: 'u',
        ų: 'u',
        ṷ: 'u',
        ṵ: 'u',
        ʉ: 'u',
        '\u24E5': 'v',
        ｖ: 'v',
        ṽ: 'v',
        ṿ: 'v',
        ʋ: 'v',
        ꝟ: 'v',
        ʌ: 'v',
        ꝡ: 'vy',
        '\u24E6': 'w',
        ｗ: 'w',
        ẁ: 'w',
        ẃ: 'w',
        ŵ: 'w',
        ẇ: 'w',
        ẅ: 'w',
        ẘ: 'w',
        ẉ: 'w',
        ⱳ: 'w',
        '\u24E7': 'x',
        ｘ: 'x',
        ẋ: 'x',
        ẍ: 'x',
        '\u24E8': 'y',
        ｙ: 'y',
        ỳ: 'y',
        ý: 'y',
        ŷ: 'y',
        ỹ: 'y',
        ȳ: 'y',
        ẏ: 'y',
        ÿ: 'y',
        ỷ: 'y',
        ẙ: 'y',
        ỵ: 'y',
        ƴ: 'y',
        ɏ: 'y',
        ỿ: 'y',
        '\u24E9': 'z',
        ｚ: 'z',
        ź: 'z',
        ẑ: 'z',
        ż: 'z',
        ž: 'z',
        ẓ: 'z',
        ẕ: 'z',
        ƶ: 'z',
        ȥ: 'z',
        ɀ: 'z',
        ⱬ: 'z',
        ꝣ: 'z',
        Ά: '\u0391',
        Έ: '\u0395',
        Ή: '\u0397',
        Ί: '\u0399',
        Ϊ: '\u0399',
        Ό: '\u039F',
        Ύ: '\u03A5',
        Ϋ: '\u03A5',
        Ώ: '\u03A9',
        ά: '\u03B1',
        έ: '\u03B5',
        ή: '\u03B7',
        ί: '\u03B9',
        ϊ: '\u03B9',
        ΐ: '\u03B9',
        ό: '\u03BF',
        ύ: '\u03C5',
        ϋ: '\u03C5',
        ΰ: '\u03C5',
        ω: '\u03C9',
        ς: '\u03C3',
      };

      const Selectivity = _dereq_(76);
      const previousTransform = Selectivity.transformText;

      /**
 * Extended version of the transformText() function that simplifies diacritics to their latin1
 * counterparts.
 *
 * Note that if all query functions fetch their results from a remote server, you may not need this
 * function, because it makes sense to remove diacritics server-side in such cases.
 */
      Selectivity.transformText = function (string) {
        let result = '';
        for (let i = 0, length = string.length; i < length; i++) {
          const character = string[i];
          result += DIACRITICS[character] || character;
        }
        return previousTransform(result);
      };

    }, {76: 76}],
    71: [function (_dereq_, module, exports) {


      const Selectivity = _dereq_(76);
      const findResultItem = _dereq_(78);
      const getKeyCode = _dereq_(80);

      const KEY_BACKSPACE = 8;
      const KEY_DOWN_ARROW = 40;
      const KEY_ENTER = 13;
      const KEY_ESCAPE = 27;
      const KEY_TAB = 9;
      const KEY_UP_ARROW = 38;

      /**
 * Search input listener providing keyboard support for navigating the dropdown.
 */
      function listener(selectivity, input) {
        let keydownCanceled = false;
        let closeSubmenu = null;

        /**
     * Moves a dropdown's highlight to the next or previous result item.
     *
     * @param delta Either 1 to move to the next item, or -1 to move to the previous item.
     */
        function moveHighlight(dropdown, delta) {
          const results = dropdown.results;
          if (!results.length) {
            return;
          }

          const resultItems = [].slice.call(dropdown.el.querySelectorAll('.selectivity-result-item'));

          function scrollToHighlight() {
            let el;
            if (dropdown.highlightedResult) {
              el = findResultItem(resultItems, dropdown.highlightedResult.id);
            } else if (dropdown.loadMoreHighlighted) {
              el = dropdown.$('.selectivity-load-more');
            }

            if (el && el.scrollIntoView) {
              el.scrollIntoView(delta < 0);
            }
          }

          if (dropdown.submenu) {
            moveHighlight(dropdown.submenu, delta);
            return;
          }

          const defaultIndex = delta > 0 ? 0 : resultItems.length - 1;
          let index = defaultIndex;
          const highlightedResult = dropdown.highlightedResult;
          if (highlightedResult) {
            const highlightedResultItem = findResultItem(resultItems, highlightedResult.id);
            index = resultItems.indexOf(highlightedResultItem) + delta;
            if (delta > 0 ? index >= resultItems.length : index < 0) {
              if (dropdown.hasMore) {
                dropdown.highlightLoadMore();
                scrollToHighlight();
                return;
              } else {
                index = defaultIndex;
              }
            }
          }

          const resultItem = resultItems[index];
          const result = Selectivity.findNestedById(results, selectivity.getRelatedItemId(resultItem));
          if (result) {
            dropdown.highlight(result, { delay: !!result.submenu });
            scrollToHighlight();
          }
        }

        function keyHeld(event) {
          const dropdown = selectivity.dropdown;
          if (dropdown) {
            const keyCode = getKeyCode(event);
            if (keyCode === KEY_BACKSPACE) {
              if (!input.value) {
                if (dropdown.submenu) {
                  let submenu = dropdown.submenu;
                  while (submenu.submenu) {
                    submenu = submenu.submenu;
                  }
                  closeSubmenu = submenu;
                }

                event.preventDefault();
                keydownCanceled = true;
              }
            } else if (keyCode === KEY_DOWN_ARROW) {
              moveHighlight(dropdown, 1);
            } else if (keyCode === KEY_UP_ARROW) {
              moveHighlight(dropdown, -1);
            } else if (keyCode === KEY_TAB) {
              setTimeout(() => {
                selectivity.close();
              }, 1);
            } else if (keyCode === KEY_ENTER) {
              event.preventDefault(); // don't submit forms on keydown
            }
          }
        }

        function keyReleased(event) {
          function open() {
            if (selectivity.options.showDropdown !== false) {
              selectivity.open();
            }
          }

          const dropdown = selectivity.dropdown;
          const keyCode = getKeyCode(event);
          if (keydownCanceled) {
            event.preventDefault();
            keydownCanceled = false;

            if (closeSubmenu) {
              closeSubmenu.close();
              selectivity.focus();
              closeSubmenu = null;
            }
          } else if (keyCode === KEY_BACKSPACE) {
            if (!dropdown && selectivity.options.allowClear) {
              selectivity.clear();
            }
          } else if (keyCode === KEY_ENTER && !event.ctrlKey) {
            if (dropdown) {
              dropdown.selectHighlight();
            } else if (selectivity.options.showDropdown !== false) {
              open();
            }

            event.preventDefault();
          } else if (keyCode === KEY_ESCAPE) {
            selectivity.close();

            event.preventDefault();
          } else if (keyCode === KEY_DOWN_ARROW || keyCode === KEY_UP_ARROW) {
            // handled in keyHeld() because the response feels faster and it works with repeated
            // events if the user holds the key for a longer period
            // still, we issue an open() call here in case the dropdown was not yet open...
            open();

            event.preventDefault();
          } else {
            open();
          }
        }

        input.addEventListener('keydown', keyHeld);
        input.addEventListener('keyup', keyReleased);
      }

      Selectivity.InputListeners.push(listener);

    }, {76: 76, 78: 78, 80: 80}],
    72: [function (_dereq_, module, exports) {


      const Selectivity = _dereq_(76);

      const allowedOptions = {
        allowClear: 'boolean',
        backspaceHighlightsBeforeDelete: 'boolean',
        closeOnSelect: 'boolean',
        createTokenItem: 'function',
        dropdown: 'function|null',
        initSelection: 'function|null',
        inputListeners: 'array',
        items: 'array|null',
        matcher: 'function|null',
        placeholder: 'string',
        positionDropdown: 'function|null',
        query: 'function|null',
        readOnly: 'boolean',
        removeOnly: 'boolean',
        shouldOpenSubmenu: 'function',
        showSearchInputInDropdown: 'boolean',
        suppressWheelSelector: 'string|null',
        tabIndex: 'number',
        templates: 'object',
        tokenizer: 'function',
      };

      /**
 * Option listener that validates the options being set. This is useful during debugging to quickly
 * get notified if you're passing invalid options.
 */
      Selectivity.OptionListeners.unshift((selectivity, options) => {
        for (const key in options) {
          if (!options.hasOwnProperty(key)) {
            continue;
          }

          var value = options[key];
          const type = allowedOptions[key];
          if (
            type &&
            !type.split('|').some((type) => {
              if (type === 'null') {
                return value === null;
              } else if (type === 'array') {
                return Array.isArray(value);
              } else {
                return value !== null && value !== undefined && typeof value === type;
              }
            })
          ) {
            throw new Error(`${key} must be of type ${type}`);
          }
        }
      });

    }, {76: 76}],
    73: [function (_dereq_, module, exports) {


      const Dropdown = _dereq_(62);
      const Selectivity = _dereq_(76);

      const findResultItem = _dereq_(78);

      /**
 * Extended dropdown that supports submenus.
 */
      function SubmenuPlugin(selectivity, options) {
        /**
     * Optional parent dropdown menu from which this dropdown was opened.
     */
        this.parentMenu = options.parentMenu;

        Dropdown.call(this, selectivity, options);

        this._closeSubmenuTimeout = 0;

        this._openSubmenuTimeout = 0;
      }

      var callSuper = Selectivity.inherits(SubmenuPlugin, Dropdown, {
        /**
     * @inherit
     */
        close() {
          if (this.submenu) {
            this.submenu.close();
          }

          callSuper(this, 'close');

          if (this.parentMenu) {
            this.parentMenu.submenu = null;
            this.parentMenu = null;
          }

          clearTimeout(this._closeSubmenuTimeout);
          clearTimeout(this._openSubmenuTimeout);
        },

        /**
     * @inherit
     *
     * @param options Optional options object. May contain the following properties:
     *                delay - If true, indicates any submenu should not be opened until after some
     *                        delay.
     *                openSubmenu - If false, no submenu will be automatically opened for the
     *                              highlighted item.
     *                reason - The reason why the result item is being highlighted. See
     *                         Dropdown#highlight().
     */
        highlight(item, options) {
          options = options || {};
          const reason = options.reason || 'unspecified';

          if (options.delay) {
            callSuper(this, 'highlight', item);

            clearTimeout(this._openSubmenuTimeout);
            this._openSubmenuTimeout = setTimeout(this._doHighlight.bind(this, item, reason), 300);
          } else if (this.submenu) {
            if (this.highlightedResult && this.highlightedResult.id === item.id) {
              this._doHighlight(item, reason);
            } else {
              clearTimeout(this._closeSubmenuTimeout);
              this._closeSubmenuTimeout = setTimeout(
                this._closeSubmenuAndHighlight.bind(this, item, reason),
                100,
              );
            }
          } else {
            if (this.parentMenu && this.parentMenu._closeSubmenuTimeout) {
              clearTimeout(this.parentMenu._closeSubmenuTimeout);
              this.parentMenu._closeSubmenuTimeout = 0;
            }

            if (options.openSubmenu === false) {
              callSuper(this, 'highlight', item);
            } else {
              this._doHighlight(item, reason);
            }
          }
        },

        /**
     * @inherit
     */
        search(term) {
          if (this.submenu) {
            const searchInput = this.$('.selectivity-search-input');
            if (searchInput && searchInput === document.activeElement) {
              this.submenu.close();
            } else {
              this.submenu.search(term);
              return;
            }
          }

          callSuper(this, 'search', term);
        },

        /**
     * @inherit
     */
        selectHighlight() {
          if (this.submenu) {
            this.submenu.selectHighlight();
          } else {
            callSuper(this, 'selectHighlight');
          }
        },

        /**
     * @inherit
     */
        showResults(results, options) {
        // makes sure any result item with a submenu that's not explicitly
        // set as selectable becomes unselectable
          function setSelectable(item) {
            if (item.children) {
              item.children.forEach(setSelectable);
            }
            if (item.submenu) {
              item.selectable = !!item.selectable;
            }
          }

          if (this.submenu && options.dropdown !== this) {
            this.submenu.showResults(results, options);
          } else {
            results.forEach(setSelectable);
            callSuper(this, 'showResults', results, options);
          }
        },

        /**
     * @inherit
     */
        triggerClose() {
          if (this.parentMenu) {
            this.selectivity.triggerEvent('selectivity-close-submenu');
          } else {
            callSuper(this, 'triggerClose');
          }
        },

        /**
     * @inherit
     */
        triggerOpen() {
          if (this.parentMenu) {
            this.selectivity.triggerEvent('selectivity-open-submenu');
          } else {
            callSuper(this, 'triggerOpen');
          }
        },

        /**
     * @private
     */
        _closeSubmenuAndHighlight(item, reason) {
          if (this.submenu) {
            this.submenu.close();
          }

          this._doHighlight(item, reason);
        },

        /**
     * @private
     */
        _doHighlight(item, reason) {
          callSuper(this, 'highlight', item);

          const options = this.selectivity.options;
          if (
            !item.submenu ||
            this.submenu ||
            (options.shouldOpenSubmenu && options.shouldOpenSubmenu(item, reason) === false)
          ) {
            return;
          }

          const Dropdown = options.dropdown || Selectivity.Dropdown;
          if (Dropdown) {
            const resultItems = this.el.querySelectorAll('.selectivity-result-item');
            const resultItem = findResultItem(resultItems, item.id);
            const dropdownEl = this.el;

            this.submenu = new Dropdown(this.selectivity, {
              highlightFirstItem: !item.selectable,
              items: item.submenu.items || null,
              parentMenu: this,
              position(el, selectEl) {
                if (item.submenu.positionDropdown) {
                  item.submenu.positionDropdown(el, selectEl, resultItem, dropdownEl);
                } else {
                  const rect = dropdownEl.getBoundingClientRect();
                  let left = rect.right;
                  const width = rect.width;
                  if (left + width > document.body.clientWidth && rect.left - width > 0) {
                    // Open the submenu on the left-hand side if there's no sufficient
                    // space on the right side.
                    // Use a little margin to prevent awkward-looking overlaps.
                    left = rect.left - width + 10;
                  }

                  // Move the submenu up so it fits in the window, if necessary and possible.
                  const submenuTop = resultItem.getBoundingClientRect().top;
                  const deltaUp = Math.min(
                    Math.max(submenuTop + el.clientHeight - window.innerHeight, 0),
                    rect.top + rect.height,
                  );

                  el.style.left = `${left}px`;
                  el.style.top = `${submenuTop - deltaUp}px`;
                  el.style.width = `${width}px`;
                }
              },
              query: item.submenu.query || null,
              showSearchInput: item.submenu.showSearchInput,
            });

            this.submenu.search('');
          }
        },
      });

      Selectivity.Dropdown = SubmenuPlugin;

      module.exports = SubmenuPlugin;

    }, {62: 62, 76: 76, 78: 78}],
    74: [function (_dereq_, module, exports) {


      const assign = _dereq_(40);

      const Selectivity = _dereq_(76);

      function defaultTokenizer(input, selection, createToken, options) {
        const createTokenItem =
        options.createTokenItem ||
        function (token) {
          return token ? { id: token, text: token } : null;
        };

        const separators = options.tokenSeparators;

        function hasToken(input) {
          return input
            ? separators.some((separator) => input.indexOf(separator) > -1)
            : false;
        }

        function takeToken(input) {
          for (let i = 0, length = input.length; i < length; i++) {
            if (separators.indexOf(input[i]) > -1) {
              return { term: input.slice(0, i), input: input.slice(i + 1) };
            }
          }
          return {};
        }

        while (hasToken(input)) {
          const token = takeToken(input);
          if (token.term) {
            const item = createTokenItem(token.term);
            if (item && !Selectivity.findById(selection, item.id)) {
              createToken(item);
            }
          }
          input = token.input;
        }

        return input;
      }

      /**
 * Option listener that provides a default tokenizer which is used when the tokenSeparators option
 * is specified.
 *
 * @param options Options object. In addition to the options supported in the multi-input
 *                implementation, this may contain the following property:
 *                tokenSeparators - Array of string separators which are used to separate the search
 *                                  string into tokens. If specified and the tokenizer property is
 *                                  not set, the tokenizer property will be set to a function which
 *                                  splits the search term into tokens separated by any of the given
 *                                  separators. The tokens will be converted into selectable items
 *                                  using the 'createTokenItem' function. The default tokenizer also
 *                                  filters out already selected items.
 */
      Selectivity.OptionListeners.push((selectivity, options) => {
        if (options.tokenSeparators) {
          options.allowedTypes = assign({ tokenSeparators: 'array' }, options.allowedTypes);

          options.tokenizer = options.tokenizer || defaultTokenizer;
        }
      });

    }, {40: 40, 76: 76}],
    75: [function (_dereq_, module, exports) {
      _dereq_(62); _dereq_(64); _dereq_(65); _dereq_(66); _dereq_(67); _dereq_(68); _dereq_(69); _dereq_(70); _dereq_(71); _dereq_(72); _dereq_(73); _dereq_(74); _dereq_(77); window.Selectivity = _dereq_(76);
    }, {
      62: 62, 64: 64, 65: 65, 66: 66, 67: 67, 68: 68, 69: 69, 70: 70, 71: 71, 72: 72, 73: 73, 74: 74, 76: 76, 77: 77,
    }],
    76: [function (_dereq_, module, exports) {


      const assign = _dereq_(40);
      const isString = _dereq_(54);

      const EventListener = _dereq_(63);
      const toggleClass = _dereq_(85);

      /**
 * Selectivity Base Constructor.
 *
 * You will never use this constructor directly. Instead, you use $(selector).selectivity(options)
 * to create an instance of either MultipleSelectivity or SingleSelectivity. This class defines all
 * functionality that is common between both.
 *
 * @param options Options object. Accepts the same options as the setOptions method(), in addition
 *                to the following ones:
 *                data - Initial selection data to set. This should be an array of objects with 'id'
 *                       and 'text' properties. This option is mutually exclusive with 'value'.
 *                element - The DOM element to which to attach the Selectivity instance. This
 *                          property is set by the API wrapper.
 *                value - Initial value to set. This should be an array of IDs. This property is
 *                        mutually exclusive with 'data'.
 */
      function Selectivity(options) {
        /**
     * Reference to the currently open dropdown.
     */
        this.dropdown = null;

        /**
     * DOM element to which this instance is attached.
     */
        this.el = options.element;

        /**
     * Whether the input is enabled.
     *
     * This is false when the option readOnly is false or the option removeOnly is false.
     */
        this.enabled = !options.readOnly && !options.removeOnly;

        /**
     * DOM element for the input.
     *
     * May be null as long as there is no visible input. It is set by initInput().
     */
        this.input = null;

        /**
     * Array of items from which to select. If set, this will be an array of objects with 'id' and
     * 'text' properties.
     *
     * If given, all items are expected to be available locally and all selection operations operate
     * on this local array only. If null, items are not available locally, and a query function
     * should be provided to fetch remote data.
     */
        this.items = null;

        /**
     * Options passed to the Selectivity instance or set through setOptions().
     */
        this.options = {};

        /**
     * Mapping of templates.
     *
     * Custom templates can be specified in the options object.
     */
        this.templates = assign({}, Selectivity.Templates);

        /**
     * The last used search term.
     */
        this.term = '';

        this.setOptions(options);

        if (options.value) {
          this.setValue(options.value, { triggerChange: false });
        } else {
          this.setData(options.data || null, { triggerChange: false });
        }

        this.el.setAttribute('tabindex', options.tabIndex || 0);

        this.events = new EventListener(this.el, this);
        this.events.on({
          blur: this._blur,
          mouseenter: this._mouseenter,
          mouseleave: this._mouseleave,
          'selectivity-close': this._closed,
        });
      }

      /**
 * Methods.
 */
      assign(Selectivity.prototype, {
        /**
     * Convenience shortcut for this.el.querySelector(selector).
     */
        $(selector) {
          return this.el.querySelector(selector);
        },

        /**
     * Closes the dropdown.
     */
        close() {
          this._clearCloseTimeout();

          if (this.dropdown) {
            this.dropdown.close();
            this.dropdown = null;
          }
        },

        /**
     * Destroys the Selectivity instance.
     */
        destroy() {
          this.events.destruct();

          const el = this.el;
          while (el.firstChild) {
            el.removeChild(el.firstChild);
          }
          el.selectivity = null;
        },

        /**
     * Filters the results to be displayed in the dropdown.
     *
     * The default implementation simply returns the results unfiltered, but the MultipleSelectivity
     * class overrides this method to filter out any items that have already been selected.
     *
     * @param results Array of items with 'id' and 'text' properties.
     *
     * @return The filtered array.
     */
        filterResults(results) {
          return results;
        },

        /**
     * Applies focus to the input.
     */
        focus() {
          this._clearCloseTimeout();

          this._focusing = true;

          if (this.input) {
            this.input.focus();
          }

          this._focusing = false;
        },

        /**
     * Returns the selection data.
     */
        getData() {
          return this._data;
        },

        /**
     * Returns the correct item for a given ID.
     *
     * @param id The ID to get the item for.
     *
     * @return The corresponding item. Will be an object with 'id' and 'text' properties or null if
     *         the item cannot be found. Note that if no items are defined, this method assumes the
     *         text labels will be equal to the IDs.
     */
        getItemForId(id) {
          const items = this.items;
          if (items) {
            return Selectivity.findNestedById(items, id);
          } else if (id === null) {
            return null;
          } else {
            return { id, text: `${id}` };
          }
        },

        /**
     * Returns the item ID related to an element or event target.
     *
     * @param elementOrEvent The DOM element or event to get the item ID for.
     *
     * @return Item ID or null if no ID could be found.
     */
        getRelatedItemId(elementOrEvent) {
          let el = elementOrEvent.target || elementOrEvent;
          while (el) {
            if (el.hasAttribute('data-item-id')) {
              break;
            }
            el = el.parentNode;
          }

          if (!el) {
            return null;
          }

          const id = el.getAttribute('data-item-id');

          // IDs can be either numbers or strings, but attribute values are always strings, so we
          // will have to find out whether the item ID ought to be a number or string ourselves.
          if (Selectivity.findById(this._data || [], id)) {
            return id;
          } else {
            let dropdown = this.dropdown;
            while (dropdown) {
              if (Selectivity.findNestedById(dropdown.results, id)) {
                return id;
              }
              // FIXME: reference to submenu plugin doesn't belong in base
              dropdown = dropdown.submenu;
            }
            const number = parseInt(id, 10);
            return `${number}` === id ? number : id;
          }
        },

        /**
     * Returns the value of the selection.
     */
        getValue() {
          return this._value;
        },

        /**
     * Initializes the input element.
     *
     * Sets the input property, invokes all input listeners and (by default) attaches the action of
     * searching when something is typed.
     *
     * @param input Input element.
     * @param options Optional options object. May contain the following property:
     *                search - If false, no event handlers are setup to initiate searching when the
     *                         user types in the input field. This is useful if you want to use the
     *                         input only to handle keyboard support.
     */
        initInput(input, options) {
          this.input = input;

          const selectivity = this;
          const inputListeners = this.options.inputListeners || Selectivity.InputListeners;
          inputListeners.forEach((listener) => {
            listener(selectivity, input, options);
          });

          if (!options || options.search !== false) {
            input.addEventListener('keyup', (event) => {
              if (!event.defaultPrevented) {
                selectivity.search(event.target.value);
              }
            });
          }
        },

        /**
     * Opens the dropdown.
     */
        open() {
          if (this._opening || this.dropdown || !this.triggerEvent('selectivity-opening')) {
            return;
          }

          this._opening = true;

          const Dropdown = this.options.dropdown || Selectivity.Dropdown;
          if (Dropdown) {
            this.dropdown = new Dropdown(this, {
              items: this.items,
              position: this.options.positionDropdown,
              query: this.options.query,
              showSearchInput: this.options.showSearchInputInDropdown !== false,
            });
          }

          this.search(this.input.value);

          this.focus();

          toggleClass(this.el, 'open', true);

          this._opening = false;
        },

        /**
     * (Re-)positions the dropdown.
     */
        positionDropdown() {
          if (this.dropdown) {
            this.dropdown.position();
          }
        },

        /**
     * Searches for results based on the term given.
     *
     * If an items array has been passed with the options to the Selectivity instance, a local
     * search will be performed among those items. Otherwise, the query function specified in the
     * options will be used to perform the search. If neither is defined, nothing happens.
     *
     * @param term Term to search for.
     */
        search(term) {
          this.open();

          if (this.dropdown) {
            this.dropdown.search(term);
          }
        },

        /**
     * Sets the selection data.
     *
     * The selection data contains both IDs and text labels. If you only want to set or get the IDs,
     * you should use the value() method.
     *
     * @param newData New data to set. For a MultipleSelectivity instance the data must be an array
     *                of objects with 'id' and 'text' properties, for a SingleSelectivity instance
     *                the data must be a single such object or null to indicate no item is selected.
     * @param options Optional options object. May contain the following property:
     *                triggerChange - Set to false to suppress the "change" event being triggered.
     *                                Note this will also cause the UI to not update automatically;
     *                                so you may want to call rerenderSelection() manually when
     *                                using this option.
     */
        setData(newData, options) {
          options = options || {};

          newData = this.validateData(newData);

          this._data = newData;
          this._value = this.getValueForData(newData);

          if (options.triggerChange !== false) {
            if(Array.isArray(this._value)){
              this.rerenderSelection(); 
            }else{
              this.triggerChange();
            }
          }
        },

        /**
     * Sets one or more options on this Selectivity instance.
     *
     * @param options Options object. May contain one or more of the following properties:
     *                closeOnSelect - Set to false to keep the dropdown open after the user has
     *                                selected an item. This is useful if you want to allow the user
     *                                to quickly select multiple items. The default value is true.
     *                dropdown - Custom dropdown implementation to use for this instance.
     *                initSelection - Function to map values by ID to selection data. This function
     *                                receives two arguments, 'value' and 'callback'. The value is
     *                                the current value of the selection, which is an ID or an array
     *                                of IDs depending on the input type. The callback should be
     *                                invoked with an object or array of objects, respectively,
     *                                containing 'id' and 'text' properties.
     *                inputListeners - Array of search input listeners. By default, the global
     *                                 array Selectivity.InputListeners is used.
     *                items - Array of items from which to select. Should be an array of objects
     *                        with 'id' and 'text' properties. As convenience, you may also pass an
     *                        array of strings, in which case the same string is used for both the
     *                        'id' and 'text' properties. If items are given, all items are expected
     *                        to be available locally and all selection operations operate on this
     *                        local array only. If null, items are not available locally, and a
     *                        query function should be provided to fetch remote data.
     *                matcher - Function to determine whether text matches a given search term. Note
     *                          this function is only used if you have specified an array of items.
     *                          Receives two arguments:
     *                          item - The item that should match the search term.
     *                          term - The search term. Note that for performance reasons, the term
     *                                 has always been already processed using
     *                                 Selectivity.transformText().
     *                          The method should return the item if it matches, and null otherwise.
     *                          If the item has a children array, the matcher is expected to filter
     *                          those itself (be sure to only return the filtered array of children
     *                          in the returned item and not to modify the children of the item
     *                          argument).
     *                placeholder - Placeholder text to display when the element has no focus and
     *                              no selected items.
     *                positionDropdown - Function to position the dropdown. Receives two arguments:
     *                                   dropdownEl - The element to be positioned.
     *                                   selectEl - The element of the Selectivity instance, that
     *                                              you can position the dropdown to.
     *                                   The default implementation positions the dropdown element
     *                                   under the Selectivity's element and gives it the same
     *                                   width.
     *                query - Function to use for querying items. Receives a single object as
     *                        argument with the following properties:
     *                        callback - Callback to invoke when the results are available. This
     *                                   callback should be passed a single object as argument with
     *                                   the following properties:
     *                                   more - Boolean that can be set to true to indicate there
     *                                          are more results available. Additional results may
     *                                          be fetched by the user through pagination.
     *                                   results - Array of result items. The format for the result
     *                                             items is the same as for passing local items.
     *                        offset - This property is only used for pagination and indicates how
     *                                 many results should be skipped when returning more results.
     *                        selectivity - The Selectivity instance the query function is used on.
     *                        term - The search term the user is searching for. Unlike with the
     *                               matcher function, the term has not been processed using
     *                               Selectivity.transformText().
     *                readOnly - If true, disables any modification of the input.
     *                removeOnly - If true, disables any modification of the input except removing
     *                             of selected items.
     *                shouldOpenSubmenu - Function to call that will decide whether a submenu should
     *                                    be opened. Receives two parameters:
     *                                    item - The currently highlighted result item.
     *                                    reason - The reason why the item is being highlighted.
     *                                             See Dropdown#highlight() for possible values.
     *                showDropdown - Set to false if you don't want to use any dropdown (you can
     *                               still open it programmatically using open()).
     *                showSearchInputInDropdown - Set to false to remove the search input used in
     *                                            dropdowns. The default is true for single-value
     *                                            inputs.
     *                templates - Object with instance-specific templates to override the global
     *                            templates assigned to Selectivity.Templates.
     */
        setOptions(options) {
          options = options || {};

          const selectivity = this;
          Selectivity.OptionListeners.forEach((listener) => {
            listener(selectivity, options);
          });

          if ('items' in options) {
            this.items = options.items ? Selectivity.processItems(options.items) : null;
          }
          if ('templates' in options) {
            assign(this.templates, options.templates);
          }

          assign(this.options, options);

          this.enabled = !this.options.readOnly && !this.options.removeOnly;
        },

        /**
     * Sets the value of the selection.
     *
     * The value of the selection only concerns the IDs of the selection items. If you are
     * interested in the IDs and the text labels, you should use the data() method.
     *
     * Note that if neither the items option nor the initSelection option have been set, Selectivity
     * will have no way to determine what text labels should be used with the given IDs in which
     * case it will assume the text is equal to the ID. This is useful if you're working with tags,
     * or selecting e-mail addresses for instance, but may not always be what you want.
     *
     * @param newValue New value to set. For a MultipleSelectivity instance the value must be an
     *                 array of IDs, for a SingleSelectivity instance the value must be a single ID
     *                 (a string or a number) or null to indicate no item is selected.
     * @param options Optional options object. May contain the following property:
     *                triggerChange - Set to false to suppress the "change" event being triggered.
     *                                Note this will also cause the UI to not update automatically;
     *                                so you may want to call rerenderSelection() manually when
     *                                using this option.
     */
        setValue(newValue, options) {
          options = options || {};
          const fn = function (item) {
            if (item && typeof item !== 'string') {
              if (!this.options.idFunction) {
                throw new Error('missing id function');
              }
              return this.options.idFunction(item);
            } else {
              return item;
            }
          }.bind(this);
          let ids = Array.isArray(newValue) ? newValue.map(fn) : fn(newValue);
          ids = this.validateValue(ids);

          this._value = ids;

          if (this._value && this.options.initSelection) {
            this.options.initSelection(
              newValue,
              (data) => {
                this._data = this.validateData(data);

                if (options.triggerChange !== false) {
                  this.triggerChange();
                }
                this.rerenderSelection();
              },
            );
          } else {
            this._data = this.getDataForValue(ids);

            if (options.triggerChange !== false) {
              this.triggerChange();
            }
          }
        },

        /**
     * Returns the result of the given template.
     *
     * @param templateName Name of the template to process.
     * @param options Options to pass to the template.
     *
     * @return String containing HTML.
     */
        template(templateName, options) {
          const template = this.templates[templateName];
          if (!template) {
            throw new Error(`Unknown template: ${templateName}`);
          }

          if (typeof template === 'function') {
            return template(options);
          } else if (template.render) {
            return template.render(options);
          } else {
            return template.toString();
          }
        },

        /**
     * Triggers the change event.
     *
     * The event object at least contains the following property:
     * value - The new value of the Selectivity instance.
     *
     * @param Optional additional options added to the event object.
     */
        triggerChange(options) {
          const data = assign({ value: this._value, items: this._data}, options);
          this.triggerEvent('change', data);
          this.triggerEvent('selectivity-change', data);
        },

        /**
     * Triggers an event on the instance's element.
     *
     * @param eventName Name of the event to trigger.
     * @param data Optional event data to be added to the event object.
     *
     * @return Whether the default action of the event may be executed, ie. returns false if
     *         preventDefault() has been called.
     */
        triggerEvent(eventName, data) {
          const event = document.createEvent('Event');
          event.initEvent(eventName, /* bubbles: */ false, /* cancelable: */ true);
          assign(event, data);
          this.el.dispatchEvent(event);
          return !event.defaultPrevented;
        },

        /**
     * Validates a single item. Throws an exception if the item is invalid.
     *
     * @param item The item to validate.
     *
     * @return The validated item. May differ from the input item.
     */
        validateItem(item) {
          if (item && Selectivity.isValidId(item.id) && isString(item.text)) {
            return item;
          } else {
            throw new Error('Item should have id (number or string) and text (string) properties');
          }
        },

        /**
     * @private
     */
        _blur() {
          if (!this._focusing && !this.el.classList.contains('hover')) {
            // Without the timeout it appears clicks on result items are not always properly
            // handled, especially when the user doesn't click exactly on the text of the result
            // item. I don't understand really why that happens, or why the timeout has to be so
            // large, but after trial and error, this now seems to work reliably...
            this._clearCloseTimeout();
            this._closeTimeout = setTimeout(this.close.bind(this), 166);
            this.input.value = '';
          }
        },

        /**
     * @private
     */
        _clearCloseTimeout() {
          if (this._closeTimeout) {
            clearTimeout(this._closeTimeout);
            this._closeTimeout = 0;
          }
        },

        /**
     * @private
     */
        _closed() {
          this.dropdown = null;

          toggleClass(this.el, 'open', false);
        },

        /**
     * @private
     */
        _mouseleave(event) {
        // If mouseleave happens on any selectivity related element, remove hover class
          if (!this.el.contains(event.relatedTarget)) {
            toggleClass(this.el, 'hover', false);
          }
        },

        /**
     * @private
     */
        _mouseenter() {
          toggleClass(this.el, 'hover', true);
        },
      });

      /**
 * Dropdown class to use for displaying dropdowns.
 *
 * The default implementation of a dropdown is defined in the selectivity-dropdown module.
 */
      Selectivity.Dropdown = null;

      /**
 * Array of input listeners.
 *
 * Input listeners are invoked when initInput() is called (typically right after the input is
 * created). Every listener receives three arguments:
 *
 * selectivity - The Selectivity instance.
 * input - DOM element of the input.
 * options - Options that were passed to initInput().
 *
 * An example of a search input listener is the selectivity-keyboard module.
 */
      Selectivity.InputListeners = [];

      /**
 * Mapping of input types.
 */
      Selectivity.Inputs = {};

      /**
 * Array of option listeners.
 *
 * Option listeners are invoked when setOptions() is called. Every listener receives two arguments:
 *
 * selectivity - The Selectivity instance.
 * options - The options that are about to be set. The listener may modify this options object.
 *
 * An example of an option listener is the selectivity-traditional module.
 */
      Selectivity.OptionListeners = [];

      /**
 * Mapping with templates to use for rendering select boxes and dropdowns. See
 * selectivity-templates.js for a useful set of default templates, as well as for documentation of
 * the individual templates.
 */
      Selectivity.Templates = {};

      /**
 * Finds an item in the given array with the specified ID.
 *
 * @param array Array to search in.
 * @param id ID to search for.
 *
 * @return The item in the array with the given ID, or null if the item was not found.
 */
      Selectivity.findById = function (array, id) {
        const index = Selectivity.findIndexById(array, id);
        return index > -1 ? array[index] : null;
      };

      /**
 * Finds the index of an item in the given array with the specified ID.
 *
 * @param array Array to search in.
 * @param id ID to search for.
 *
 * @return The index of the item in the array with the given ID, or -1 if the item was not found.
 */
      Selectivity.findIndexById = function (array, id) {
        for (let i = 0, length = array.length; i < length; i++) {
          if (array[i].id === id) {
            return i;
          }
        }
        return -1;
      };

      /**
 * Finds an item in the given array with the specified ID. Items in the array may contain 'children'
 * properties which in turn will be searched for the item.
 *
 * @param array Array to search in.
 * @param id ID to search for.
 *
 * @return The item in the array with the given ID, or null if the item was not found.
 */
      Selectivity.findNestedById = function (array, id) {
        for (let i = 0, length = array.length; i < length; i++) {
          var item = array[i],
            result;
          if (item.id === id) {
            result = item;
          } else if (item.children) {
            result = Selectivity.findNestedById(item.children, id);
          } else if (item.submenu && item.submenu.items) {
            // FIXME: reference to submenu plugin doesn't belong in base
            result = Selectivity.findNestedById(item.submenu.items, id);
          }
          if (result) {
            return result;
          }
        }
        return null;
      };

      /**
 * Utility method for inheriting another class.
 *
 * @param SubClass Constructor function of the subclass.
 * @param SuperClass Constructor function of the superclass.
 * @param prototype Object with methods you want to add to the subclass prototype.
 *
 * @return A utility function for calling the methods of the superclass. This function receives two
 *         arguments: The this object on which you want to execute the method and the name of the
 *         method. Any arguments past those are passed to the superclass method.
 */
      Selectivity.inherits = function (SubClass, SuperClass, prototype) {
        SubClass.prototype = assign(
          Object.create(SuperClass.prototype),
          { constructor: SubClass },
          prototype,
        );

        return function (self, methodName) {
          SuperClass.prototype[methodName].apply(self, Array.prototype.slice.call(arguments, 2));
        };
      };

      /**
 * Checks whether a value can be used as a valid ID for selection items. Only numbers and strings
 * are accepted to be used as IDs.
 *
 * @param id The value to check whether it is a valid ID.
 *
 * @return true if the value is a valid ID, false otherwise.
 */
      Selectivity.isValidId = function (id) {
        return typeof id === 'number' || isString(id);
      };

      /**
 * Decides whether a given item matches a search term. The default implementation simply
 * checks whether the term is contained within the item's text, after transforming them using
 * transformText().
 *
 * @param item The item that should match the search term.
 * @param term The search term. Note that for performance reasons, the term has always been already
 *             processed using transformText().
 *
 * @return true if the text matches the term, false otherwise.
 */
      Selectivity.matcher = function (item, term) {
        let result = null;
        if (Selectivity.transformText(item.text).indexOf(term) > -1) {
          result = item;
        } else if (item.children) {
          const matchingChildren = item.children
            .map((child) => Selectivity.matcher(child, term))
            .filter((child) => !!child);
          if (matchingChildren.length) {
            result = { id: item.id, text: item.text, children: matchingChildren };
          }
        }
        return result;
      };

      /**
 * Helper function for processing items.
 *
 * @param item The item to process, either as object containing 'id' and 'text' properties or just
 *             as ID. The 'id' property of an item is optional if it has a 'children' property
 *             containing an array of items.
 *
 * @return Object containing 'id' and 'text' properties.
 */
      Selectivity.processItem = function (item) {
        if (Selectivity.isValidId(item)) {
          return { id: item, text: `${item}` };
        } else if (item && (Selectivity.isValidId(item.id) || item.children) && isString(item.text)) {
          if (item.children) {
            item.children = Selectivity.processItems(item.children);
          }

          return item;
        } else {
          throw new Error('invalid item');
        }
      };

      /**
 * Helper function for processing an array of items.
 *
 * @param items Array of items to process. See processItem() for details about a single item.
 *
 * @return Array with items.
 */
      Selectivity.processItems = function (items) {
        if (Array.isArray(items)) {
          return items.map(Selectivity.processItem);
        } else {
          throw new Error('invalid items');
        }
      };

      /**
 * Transforms text in order to find matches. The default implementation casts all strings to
 * lower-case so that any matches found will be case-insensitive.
 *
 * @param string The string to transform.
 *
 * @return The transformed string.
 */
      Selectivity.transformText = function (string) {
        return string.toLowerCase();
      };

      module.exports = Selectivity;

    }, {
      40: 40, 54: 54, 63: 63, 85: 85,
    }],
    77: [function (_dereq_, module, exports) {


      const escape = _dereq_(44);

      const Selectivity = _dereq_(76);
      const Locale = _dereq_(67);

      /**
 * Default set of templates to use with Selectivity.js.
 *
 * Template can be defined as either a string, a function returning a string (like Handlebars
 * templates, for instance), an object containing a render function (like Hogan.js templates, fo
 * instance) or as a function returning a DOM element.
 *
 * Every template must return a single root element.
 */
      Selectivity.Templates = {
        /**
     * Renders the dropdown.
     *
     * The template is expected to have at least one element with the class
     * 'selectivity-results-container', which is where all results will be added to.
     *
     * @param options Options object containing the following properties:
     *                dropdownCssClass - Optional CSS class to add to the top-level element.
     *                searchInputPlaceholder - Optional placeholder text to display in the search
     *                                         input in the dropdown.
     *                showSearchInput - Boolean whether a search input should be shown. If true,
     *                                  an input element with the 'selectivity-search-input' is
     *                                  expected.
     */
        dropdown(options) {
          let extraClass = options.dropdownCssClass ? ` ${options.dropdownCssClass}` : '',
            searchInput = '';
          if (options.showSearchInput) {
            extraClass += ' has-search-input';

            const placeholder = options.searchInputPlaceholder;
            searchInput =
                `${'<div class="selectivity-search-input-container">' +
                '<input type="text" class="selectivity-search-input"'}${
                  placeholder ? ` placeholder="${escape(placeholder)}"` : ''
                }>` +
                '</div>';
          }
          return (
            `<div class="selectivity-dropdown${
              extraClass
            }">${
              searchInput
            }<div class="selectivity-results-container"></div>` +
            '</div>'
          );
        },

        /**
     * Renders an error message in the dropdown.
     *
     * @param options Options object containing the following properties:
     *                escape - Boolean whether the message should be HTML-escaped.
     *                message - The message to display.
     */
        error(options) {
          return (
            `<div class="selectivity-error">${
              options.escape ? escape(options.message) : options.message
            }</div>`
          );
        },

        /**
     * Renders a loading indicator in the dropdown.
     *
     * This template is expected to have an element with a 'selectivity-loading' class which may be
     * replaced with actual results.
     */
        loading() {
          return `<div class="selectivity-loading" aria-live="polite">${Selectivity.Locale.loading}</div>`;
        },

        /**
     * Load more indicator.
     *
     * This template is expected to have an element with a 'selectivity-load-more' class which, when
     * clicked, will load more results.
     */
        loadMore() {
          return `<div class="selectivity-load-more">${Selectivity.Locale.loadMore}</div>`;
        },

        /**
     * Renders multi-selection input boxes.
     *
     * The template is expected to have at least have elements with the following classes:
     * 'selectivity-multiple-input-container' - The element containing all the selected items and
     *                                          the input for selecting additional items.
     * 'selectivity-multiple-input' - The actual input element that allows the user to type to
     *                                search for more items. When selected items are added, they are
     *                                inserted right before this element.
     *
     * @param options Options object containing the following property:
     *                enabled - Boolean whether the input is enabled.
     */
        multipleSelectInput(options) {
          const enabledTemplate = '<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" ' +
            'class="selectivity-multiple-input">';
          const disabledTemplate = '<div class="selectivity-multiple-input selectivity-placeholder"/>';
          return `
            <div class="selectivity-multiple-input-container">
              ${options.enabled ? enabledTemplate : disabledTemplate}
              <div class="selectivity-clearfix"></div>
              <iron-icon icon="icons:arrow-drop-down" class="selectivity-caret"></iron-icon>
              <span class="underline"></span>
            </div>
          `;
        },

        /**
     * Renders a selected item in multi-selection input boxes.
     *
     * The template is expected to have a top-level element with the class
     * 'selectivity-multiple-selected-item'. This element is also required to have a 'data-item-id'
     * attribute with the ID set to that passed through the options object.
     *
     * An element with the class 'selectivity-multiple-selected-item-remove' should be present
     * which, when clicked, will cause the element to be removed.
     *
     * @param options Options object containing the following properties:
     *                highlighted - Boolean whether this item is currently highlighted.
     *                id - Identifier for the item.
     *                removable - Boolean whether a remove icon should be displayed.
     *                text - Text label which the user sees.
     */
        multipleSelectedItem(options) {
          const extraClass = options.highlighted ? ' highlighted' : '';
          return (
            `<span class="selectivity-multiple-selected-item${
              extraClass
            }" ` +
            `data-item-id="${
              escape(options.id)
            }">${
              options.removable
                ? '<a class="selectivity-multiple-selected-item-remove">' +
                  '<span class="fa fa-remove"></span>' +
                  '</a>'
                : ''
            }${escape(options.text)
            }</span>`
          );
        },

        /**
     * Renders a message there are no results for the given query.
     *
     * @param options Options object containing the following property:
     *                term - Search term the user is searching for.
     */
        noResults(options) {
          return (
            `<div class="selectivity-error" aria-live="polite">${
              options.term ? Selectivity.Locale.noResultsForTerm(options.term) : Selectivity.Locale.noResults
            }</div>`
          );
        },


      /**
     * Renders a message that tag entered already added
     *
     */

       tagExists() {
        return (
          `<div class="selectivity-error" aria-live="polite">${Selectivity.Locale.tagExists}</div>`
        );
      },


        /**
     * Renders a container for item children.
     *
     * The template is expected to have an element with the class 'selectivity-result-children'.
     *
     * @param options Options object containing the following property:
     *                childrenHtml - Rendered HTML for the children.
     */
        resultChildren(options) {
          return `<div class="selectivity-result-children">${options.childrenHtml}</div>`;
        },

        /**
     * Render a result item in the dropdown.
     *
     * The template is expected to have a top-level element with the class
     * 'selectivity-result-item'. This element is also required to have a 'data-item-id' attribute
     * with the ID set to that passed through the options object.
     *
     * @param options Options object containing the following properties:
     *                id - Identifier for the item.
     *                text - Text label which the user sees.
     *                disabled - Truthy if the item should be disabled.
     *                submenu - Truthy if the result item has a menu with subresults.
     */
        resultItem(options) {
          return (
            `<div class="selectivity-result-item${
              options.disabled ? ' disabled' : ''
            }"` +
            ` data-item-id="${
              escape(options.id)
            }">${
              escape(options.text)
            }${options.submenu
              ? '<span class="selectivity-submenu-icon fa fa-chevron-right"></span>'
              : ''
            }</div>`
          );
        },

        /**
     * Render a result label in the dropdown.
     *
     * The template is expected to have a top-level element with the class
     * 'selectivity-result-label'.
     *
     * @param options Options object containing the following properties:
     *                text - Text label.
     */
        resultLabel(options) {
          return `<div class="selectivity-result-label">${escape(options.text)}</div>`;
        },

        /**
     * Renders single-select input boxes.
     *
     * The template is expected to have at least one element with the class
     * 'selectivity-single-result-container' which is the element containing the selected item or
     * the placeholder.
     */
        singleSelectInput(options) {
          return `
            <div class="selectivity-single-select">
              <input type="text" class="selectivity-single-select-input" ${options.required ? ' required' : ''}>
              <div class="selectivity-single-result-container"></div>
              <iron-icon icon="icons:arrow-drop-down" class="selectivity-caret"></iron-icon>
              <span class="underline"></span>
            </div>
          `;
        },

        /**
     * Renders the placeholder for single-select input boxes.
     *
     * The template is expected to have a top-level element with the class
     * 'selectivity-placeholder'.
     *
     * @param options Options object containing the following property:
     *                placeholder - The placeholder text.
     */
        singleSelectPlaceholder(options) {
          return `<div class="selectivity-placeholder">${escape(options.placeholder)}</div>`;
        },

        /**
     * Renders the selected item in single-select input boxes.
     *
     * The template is expected to have a top-level element with the class
     * 'selectivity-single-selected-item'. This element is also required to have a 'data-item-id'
     * attribute with the ID set to that passed through the options object.
     *
     * @param options Options object containing the following properties:
     *                id - Identifier for the item.
     *                removable - Boolean whether a remove icon should be displayed.
     *                text - Text label which the user sees.
     */
        singleSelectedItem(options) {
          return (
            `${'<span class="selectivity-single-selected-item" ' +
            'data-item-id="'}${
              escape(options.id)
            }">${
              options.removable
                ? '<a class="selectivity-single-selected-item-remove">' +
                  '<i class="fa fa-remove"></i>' +
                  '</a>'
                : ''
            }${escape(options.text)
            }</span>`
          );
        },

        /**
     * Renders select-box inside single-select input that was initialized on
     * traditional <select> element.
     *
     * @param options Options object containing the following properties:
     *                name - Name of the <select> element.
     *                mode - Mode in which select exists, single or multiple.
     */
        selectCompliance(options) {
          const mode = options.mode;
          let name = options.name;
          if (mode === 'multiple' && name.slice(-2) !== '[]') {
            name += '[]';
          }
          return (
            `<select name="${name}"${mode === 'multiple' ? ' multiple' : ''}></select>`
          );
        },

        /**
     * Renders the selected item in compliance <select> element as <option>.
     *
     * @param options Options object containing the following properties
     *                id - Identifier for the item.
     *                text - Text label which the user sees.
     */
        selectOptionCompliance(options) {
          return (
            `<option value="${
              escape(options.id)
            }" selected>${
              escape(options.text)
            }</option>`
          );
        },
      };

    }, {44: 44, 67: 67, 76: 76}],
    78: [function (_dereq_, module, exports) {


      /**
 * Returns a result item with a given item ID.
 *
 * @param resultItems Array of DOM elements representing result items.
 * @param itemId ID of the item to return.
 *
 * @param DOM element of the result item with the given item ID, or null if not found.
 */
      module.exports = function (resultItems, itemId) {
        for (let i = 0, length = resultItems.length; i < length; i++) {
          const resultItem = resultItems[i];
          const resultId = resultItem.getAttribute('data-item-id');
          if ((typeof itemId === 'number' ? parseInt(resultId, 10) : resultId) === itemId) {
            return resultItem;
          }
        }
        return null;
      };

    }, {}],
    79: [function (_dereq_, module, exports) {


      /**
 * Returns the CSS selector for selecting a specific item by ID.
 *
 * @param selector Generic CSS selector to identify items.
 * @param id ID of the item to select.
 */
      module.exports = function (selector, id) {
        const quotedId = `"${(`${id}`).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
        return `${selector}[data-item-id=${quotedId}]`;
      };

    }, {}],
    80: [function (_dereq_, module, exports) {


      /**
 * Returns the keyCode value of the given event.
 */
      module.exports = function (event) {
        return event.which || event.keyCode || 0;
      };

    }, {}],
    81: [function (_dereq_, module, exports) {


      /**
 * Returns whether the given element matches the given selector.
 */
      module.exports = function (el, selector) {
        const method =
        el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
        return method.call(el, selector);
      };

    }, {}],
    82: [function (_dereq_, module, exports) {


      /**
 * Parses an HTML string and returns the resulting DOM element.
 *
 * @param html HTML representation of the element to parse.
 */
      module.exports = function (html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.firstChild;
      };

    }, {}],
    83: [function (_dereq_, module, exports) {


      /**
 * Removes a DOM element.
 *
 * @param el The element to remove.
 */
      module.exports = function (el) {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      };

    }, {}],
    84: [function (_dereq_, module, exports) {


      /**
 * Stops event propagation.
 *
 * @param event The event to stop from propagating.
 */
      module.exports = function (event) {
        event.stopPropagation();
      };

    }, {}],
    85: [function (_dereq_, module, exports) {


      /**
 * Toggles a CSS class on an element.
 *
 * @param el The element on which to toggle the CSS class.
 * @param className The CSS class to toggle.
 * @param force If true, the class is added. If false, the class is removed.
 */
      module.exports = function (el, className, force) {
        if (el) {
          el.classList[force ? 'add' : 'remove'](className);
        }
      };

    }, {}],
  }, {}, [75]))(75);
}));
{
  /**
   * An element wrapping selectivity.js and relying on an operation for suggestions
   *
   *    <nuxeo-selectivity operation="Directory.SuggestEntries"
   *                   multiple
   *                   params='{"directoryName": "subject"}'
   *                   value="{{value}}">
   *
   * @appliesMixin Polymer.IronFormElementBehavior
   * @appliesMixin Polymer.IronValidatableBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-selectivity/index.html
   */
  class SelectivityElement
    extends mixinBehaviors([I18nBehavior, IronFormElementBehavior, IronValidatableBehavior], Nuxeo.Element) {

    static get is() {
      return 'nuxeo-selectivity';
    }

    static get properties() {
      return {
        /**
         * Label.
         */
        label: String,

        /**
         * Selected value(s).
         */
        value: {
          notify: true,
          observer: '_valueChanged',
        },

        /**
         * Set to `true` to allow multiple selection.
         */
        multiple: {
          type: Boolean,
          value: false,
        },

        /**
         * If true, the dropdown stays open after a selection is made.
         */
        stayOpenOnSelect: {
          type: Boolean,
          value: false,
        },

        /**
         * Set to `true` for read only mode.
         */
        readonly: {
          type: Boolean,
          value: false,
          observer: '_readonlyChanged',
        },

        /**
         * Minimum number of chars to trigger the suggestions.
         */
        minChars: {
          type: Number,
          value: 3,
        },

        /**
         * Time in ms used to debounce requests.
         */
        frequency: {
          type: Number,
          value: 300,
        },

        /**
         * Placeholder.
         */
        placeholder: {
          type: String,
          value: ' ',
          observer: '_placeholderChanged',
        },

        /**
         * Separator to use with multiple selection.
         */
        separator: {
          type: String,
          value: ',',
        },

        tagging: {
          type: Boolean,
          value: false,
        },

        /**
         * Function used to get the id from the choice object.
         */
        idFunction: {
          type: Function,
          value() {
            return this._idFunction.bind(this);
          },
        },

        /**
         * Formatter for selected entries.
         */
        selectionFormatter: {
          type: Function,
          value() {
            return this._selectionFormatter.bind(this);
          },
        },

        /**
         * Formatter for suggested entries.
         */
        resultFormatter: {
          type: Function,
          value() {
            return this._resultFormatter.bind(this);
          },
        },

        /**
         * Formatter for new entries.
         */
        newEntryFormatter: {
          type: Function,
          value() {
            return this._newEntryFormatter.bind(this);
          },
        },


        /**
         * Function that transforms the entries added using the value property into object
         */
        resolveEntry: {
          type: Function,
          value() {
            return this._resolveEntry.bind(this);
          },
        },

        /**
         * Function called when an entry is selected.
         */
        addedEntryHandler: {
          type: Function,
        },

        /**
         * Function called when an entry is unselected.
         */
        removedEntryHandler: {
          type: Function,
        },

        /**
         * Formatter for initial selection.
         */
        initSelection: {
          type: Function,
          value() {
            return this._initSelection.bind(this);
          },
        },

        maximumSelectionSize: {
          type: Number,
          value: -1,
        },

        data: {
          type: Array,
          observer: '_dataChanged',
        },

        /**
         * Selected items.
         */
        selectedItems: {
          type: Array,
          notify: true,
          observer: '_valueChanged',
        },

        /**
         * Selected item.
         */
        selectedItem: {
          type: Object,
          notify: true,
          observer: '_valueChanged',
        },

        /**
         * Operation to call for suggestions.
         */
        operation: String,

        /**
         * Parameters to use in the operation call (will include `searchTerm`).
         */
        params: {
          type: Object,
        },

        /**
         * Results filtering function (optional).
         */
        queryResultsFilter: Function,

        /**
         * Error message to show when `invalid` is true.
         */
        errorMessage: String,

        /**
         * The `content enricher` of the operation.
         */
        enrichers: {
          type: String,
          value: '',
        },

        /**
         *  The headers of the request.
         */
        headers: {
          type: Object,
          value: null,
        },
      };
    }

    static get template() {
      return html`
        <style>
          .selectivity-clearfix {
            clear: both;
          }

          .selectivity-input {
            display: inline-block;
            width: 250px;
          }

          .selectivity-input select {
            display: none;
          }

          .selectivity-input:focus {
            outline: none;
          }

          .selectivity-placeholder {
            color: #999;
          }

          /**
          * Dropdown
          */
          .selectivity-dropdown {
            background: var(--nuxeo-dropdown-list-background, #fff);
            border-radius: 4px;
            -webkit-box-shadow: 0 1px 5px 1px rgba(0, 0, 0, 0.15), 0 10px 16px 0 rgba(0, 0, 0, 0.2);
            box-shadow: 0 1px 5px 1px rgba(0, 0, 0, 0.15), 0 10px 16px 0 rgba(0, 0, 0, 0.2);
            position: fixed;
            z-index: 9999;
            word-break: break-all;
          }

          .selectivity-search-input-container {
            border-bottom: 1px solid #eee;
          }

          .selectivity-search-input {
            background: transparent;
            border: 0;
            outline: 0;
            width: 100%;
            color: var(--nuxeo-text-default, #3a3a54);
          }

          .selectivity-results-container {
            max-height: 28em;
            overflow: auto;
            position: relative;
          }

          .selectivity-load-more,
          .selectivity-result-item {
            cursor: pointer;
            padding: 7px;
          }

          .selectivity-result-children .selectivity-result-item {
            padding-left: 17px;
          }

          .selectivity-load-more.highlight,
          .selectivity-result-item.highlight {
            background: var(--nuxeo-primary-color);
            color: #fff;
          }

          .selectivity-result-item.disabled {
            cursor: default;
            color: #999;
          }

          .selectivity-result-item:first-child {
            border-radius: 4px 4px 0 0;
          }

          .selectivity-dropdown.has-search-input .selectivity-result-item:first-child {
            border-radius: 0;
          }

          .selectivity-result-label {
            font-weight: bold;
          }

          .selectivity-load-more,
          .selectivity-result-item:last-child,
          .selectivity-result-children:last-child .selectivity-result-item:last-child {
            border-radius: 0 0 4px 4px;
          }

          .selectivity-result-children .selectivity-result-item:last-child {
            border-radius: 0;
          }

          .selectivity-error,
          .selectivity-loading,
          .selectivity-search-input-container,
          .selectivity-result-label {
            padding: 7px;
          }

          /**
          * Multi-selection input
          */
          .selectivity-multiple-input-container {
            cursor: text;
            min-height: 26px;
            position: relative;
            padding-top: 5px;
          }

          .selectivity-multiple-input,
          input[type='text'].selectivity-multiple-input {
            height: 100%;
            background-color: transparent;
            border: none;
            float: left;
            font: inherit;
            width: 100%;
            outline: 0;
            padding: 0;
            padding-top: 1px;
            color: var(--nuxeo-text-default, #3a3a54);
          }

          .selectivity-multiple-input:focus,
          input[type='text'].selectivity-multiple-input:focus {
            background-color: transparent;
            -webkit-box-shadow: none;
            box-shadow: none;
            outline: none;
          }

          .selectivity-multiple-input::placeholder {
            color: #999;
          }

          .selectivity-multiple-selected-item {
            background: none var(--nuxeo-tag-background, #fff);
            border-radius: 3px;
            cursor: default;
            float: left;
            line-height: 2em;
            margin: 2px;
            padding: 0 5px;
            position: relative;
            -moz-user-select: none;
            -ms-user-select: none;
            -webkit-user-select: none;
            user-select: none;
            white-space: nowrap;
            @apply --nuxeo-tag;
          }

          .selectivity-multiple-selected-item.highlighted {
            background-color: #ccc;
          }

          .selectivity-multiple-selected-item-remove, .selectivity-single-selected-item-remove {
            color: #000;
            cursor: pointer;
            margin-left: -5px;
            padding: 5px;
          }

          /**
          * Single-selection input
          */
          #input[readonly] .selectivity-caret {
            display: none;
          }

          .selectivity-single-select {
            display: flex;
            cursor: pointer;
            min-height: 31px;
            position: relative;
          }

          #input:focus {
            outline: 0;
          }

          /**
          * XXX - This ensures the input is reachable through tab navigation
          */
          .selectivity-single-select-input {
            position: absolute;
            opacity: 0;
            pointer-events: none;
          }

          .selectivity-single-result-container {
            display: flex;
            align-items: center;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .selectivity-single-selected-item {
            color: #000;
            margin: 2px 2px 0px 2px;
            @apply --nuxeo-tag;
          }

          .selectivity-caret {
            position: absolute;
            top: 12px;
            right: 0;
          }

          @media only screen and (max-device-width: 480px) {
            .selectivity-single-result-container {
              right: 5px;
            }

            .selectivity-caret {
              display: none;
            }
          }

          /**
          * Submenu
          */
          .selectivity-submenu-icon {
            position: absolute;
            right: 4px;
          }

          .selectivity-remove:before,
          .fa-close:before,
          .fa-times:before {
            content: "\\00d7";
            color: var(--nuxeo-text-default, #3a3a54);
          }

          /* We need to hide overflow-x explicitly here in order to have auto overflow on Y axis */
          :host {
              height: 100%;
              min-height: 100%;
              display: block;
              position: relative;
              padding-bottom: 8px;
              overflow-x: hidden;
              overflow-y: auto;
          }

          :host([hidden]) {
              display: none;
          }

          :host([invalid]) .label,
          .error {
              color: var(--paper-input-container-invalid-color, #de350b);
          }

          :host([invalid]) .error {
              opacity: 1;
              font-size: .923rem;
          }

          .label {
              @apply --nuxeo-label;
          }

          .label[required]::after {
              display: inline-block;
              content: '*';
              margin-left: 4px;
              color: var(--paper-input-container-invalid-color, #de350b);
          }

          .preserve-white-space {
              white-space: pre;
          }

          .underline {
            height: 1px;
            width: 100%;
            position: absolute;
            bottom: 0;
            background-color: #3a3a54;
          }

          #input[readonly] .underline {
            background-color: transparent;
          }

          #input.open .underline,
          #input:focus .underline {
            height: 2px;
            background-color: var(--nuxeo-primary-color, #0066ff);
          }
        </style>

        <nuxeo-operation id="op" op="[[operation]]" enrichers="[[enrichers]]" headers="[[headers]]"></nuxeo-operation>

        <label class="label" hidden$="[[!label]]" required$="[[required]]">[[label]]</label>

        <div id="input" readonly$="[[readonly]]"></div>

        <label class="error" hidden$="[[!invalid]]">[[errorMessage]]</label>
      `;
    }

    connectedCallback() {
      super.connectedCallback();
      const options = {
        searchFloor: this.minChars, // minimum length a search value should be before choices are searched
        tokenSeparators: [this.separator],
        width: '100%',
        readOnly: this.readonly,
        backspaceHighlightsBeforeDelete: true,

        // initialize selection and create entries
        initSelection: (value, callback) => {
          if (!value) return;

          const prep = (item) => {
            const id = this.idFunction(item);
            return {
              id,
              text: id,
              item,
            };
          };

          this.initSelection(value, (selection) => {
            callback(this.multiple ? selection.map(prep) : prep(selection));
          });
        },

        idFunction: (value) => this.idFunction(value),

        // override templates since formatter should already escape text
        templates: {
          resultItem: (opts) => (
            `<div class="selectivity-result-item${opts.disabled ? ' disabled' : ''}"
                  style="padding-left: ${7 + (10 * opts.depth)}px"
                  data-item-id="${escapeHTML(opts.id)}">${this.resultFormatter(opts.item)}</div>`
          ),

          resultLabel: (opts) => (
            `<div class="preserve-white-space selectivity-result-label"
                  style="padding-left: ${7 + (10 * opts.depth)}px">${escapeHTML(opts.text)}</div>`
          ),

          singleSelectedItem: (opts) => (
            `<span class="selectivity-single-selected-item"
            data-item-id="${escapeHTML(opts.id)}">${opts.removable ? 
              `<a class="preserve-white-space selectivity-single-selected-item-remove"><span class="selectivity-remove" role="button" aria-label="${this.i18n('command.remove')}"></span></a>` 
              : ``}${this.selectionFormatter(opts.item || opts)}</span>`
          ),

          multipleSelectedItem: (opts) => {
            const extraClass = opts.highlighted ? ' highlighted' : '';
            return `<span class="selectivity-multiple-selected-item${extraClass}"
              data-item-id="${escapeHTML(opts.id)}">${opts.removable ? 
                `<a class="preserve-white-space selectivity-multiple-selected-item-remove"><span class="selectivity-remove" role="button" aria-label="${this.i18n('command.remove')}"></span></a>` 
                : ``}${this.selectionFormatter(opts.item || opts)}</span>`
          },
        },
      };

      const InputType = Selectivity.Inputs[this.multiple ? 'Multiple' : 'Single'];
      options.element = this.$.input;

      options.closeOnSelect = !this.stayOpenOnSelect;

      if (!this.readonly) {
        options.placeholder = this.placeholder;
        options.allowClear = !this.required && !this.multiple; // allowClear only works on single-value mode
      }

      if (this.data) {
        options.items = this._wrap(this.data);
      }

      options.query = (query) => {
        if (query.term.length < this.minChars) {
          query.error(this.i18n('selectivity.minChars', this.minChars));
          return;
        }
        // debounce requests
        this._debouncer = Debouncer.debounce(
          this._debouncer,
          timeOut.after(this.frequency), () => {
            this._query(query);
          },
        );
      };

      // createTokenItem is not supported in single inputs in selectivity
      if (this.multiple && this.tagging) {
        options.createTokenItem = (term) => this._wrap(this.newEntryFormatter(term));
      }

      this._updateSelectionHandler = this._updateSelection.bind(this);
      this.$.input.addEventListener('selectivity-change', this._updateSelectionHandler);

      this._selectivity = new InputType(options);

      const self = this;
      Selectivity.Locale = {
        get loading() { return self.i18n('selectivity.loading'); },
        get loadMore() { return self.i18n('selectivity.loadMore'); },
        get noResults() { return self.i18n('selectivity.noResults'); },
        get tagExists() { return self.i18n('selectivity.tagExists'); },

        ajaxError: (term) => {
          if (term) {
            return this.i18n('selectivity.failedFetchResultsForTerm', `<b>${escapeHTML(term)}</b>`);
          } else {
            return this.i18n('selectivity.failedFetchResults');
          }
        },

        needMoreCharacters: (numCharacters) => this.i18n('selectivity.minChars', numCharacters),

        noResultsForTerm: (term) => this.i18n('selectivity.noResultsForTerm',`<b>${escapeHTML(term)}</b>`),
      };

      if (this.value || this.selectedItem || this.selectedItems) {
        setTimeout(() => {
          this._valueChanged(this.value || this.selectedItem || this.selectedItems);
        }, 100);
      }

      // scope styles
      this.scopeSubtree(this.$.input, true);

      // listen to scroll events in parent node to update selectivity dropdown position
      this._scrollParent = this._getScrollParent();
      this._scrollParent.addEventListener('scroll', this._updateDropdownPosition.bind(this));

      // use IntersectionObserver to close the dropdown if selectivity is not visible in the viewport
      this._visibilityObserver = new IntersectionObserver((entries) => {
        if (entries && entries.length > 0) {
          const entry = entries[0];  // there should be only one entry here
          if (entry.intersectionRatio === 0) { // if the ratio is equal to 0, then the widget is outside the viewport
            this._selectivity.close();
          }
        }
      }, {
        root: this._scrollParent,
        rootMargin: '0px',
        threshold: 0
      });
      this._visibilityObserver.observe(this);
      this._readonlyChanged();
    }

    disconnectedCallback() {
      this.$.input.removeEventListener('selectivity-change', this._updateSelectionHandler);
      this._updateSelectionHandler = null;
      this._selectivity.destroy();
      this._selectivity = null;
      this._visibilityObserver.unobserve(this);
      this._scrollParent.removeEventListener('scroll', this._updateDropdownPosition.bind(this));
      super.disconnectedCallback();
    }

    _updateDropdownPosition() {
      if (this._selectivity) {
        this._selectivity.positionDropdown();
      }
    }

    escapeHTML(...args) {
      return escapeHTML(...args);
    }

    _getValidity() {
      if (!this.required) {
        return true;
      }
      return this.multiple ? !!this.value && this.value.length > 0 : !!this.value;
    }

    _initSelection(value, callback) {
      if (!this.multiple) {
        return callback(this.resolveEntry(value));
      }
      return callback(value.map(this.resolveEntry.bind(this)));
    }

    _resolveEntry(entry) {
      if (this.data) {
        for (let i = 0; i < this.data.length; i++) {
          if (this.idFunction(this.data[i]) === entry) {
            return this.data[i];
          }
        }
      } else {
        return { id: this.idFunction(entry), displayLabel: this.resultFormatter(entry) };
      }
    }

    _updateSelection(e) {
      this._inUpdateSelection = true;
      this.value = this.multiple ? e.value.slice(0) : e.value;
      if (this.multiple) {
        const items = [];
        const valS = e.items.slice(0);
        if (valS) {
          valS.forEach((el) => {
            items.push(el.item ? el.item : el);
          });
        }
        this.selectedItems = items;
      } else {
        this.set('selectedItem', e.items ? e.items.item : null);
      }
      this._inUpdateSelection = false;
      if (e.added) {
        if (this.addedEntryHandler) {
          this.addedEntryHandler(e.added);
        }
      } else if (e.removed) {
        if (this.removedEntryHandler) {
          this.removedEntryHandler(e.removed);
        }
      }
    }

    _valueChanged(newValue) {
      if (this._selectivity && !this._inUpdateSelection) {
        if (newValue) {
          this._selectivity.setValue(newValue, { triggerChange: false });
        } else {
          const cv = this._selectivity.getValue();
          if ((this.multiple && cv.length > 0) || (!this.multiple && cv)) {
            // in cases where newValue is either undefined or null, clear the value
            this._selectivity.clear();
          }
        }
      }
    }

    _dataChanged() {
      if (this._selectivity) {
        this._selectivity.setOptions({ items: this._wrap(this.data) });
        const selectivityData = this._selectivity.getData();
          if(selectivityData){
            const wrapData = this._wrap(this.data);
            const newData = wrapData.filter(obj => selectivityData.some(item => item.id === obj.id));
            if (newData.length !== 0 && JSON.stringify(newData) !== JSON.stringify(selectivityData)) {
              this._selectivity.setData(newData);
            }
        }
      }
    }

    _placeholderChanged() {
      this.$.input.setAttribute('placeholder', this.placeholder);
      const multipleInput = this.shadowRoot.querySelector('.selectivity-multiple-input');
      if (this.multiple && multipleInput) {
        multipleInput.setAttribute('placeholder', this.placeholder);
      } else {
        const singleInputPlaceholder = this.shadowRoot.querySelector('.selectivity-placeholder');
        if (!this.multiple && singleInputPlaceholder) {
          singleInputPlaceholder.innerText = this.placeholder;
        }
      }
    }

    _readonlyChanged() {
      if (this._selectivity) {
        this._selectivity.setOptions({
          readOnly: this.readonly,
          placeholder: this.placeholder,
        });
      }
    }

    _idFunction(item) {
      const id = ['computeId', 'uid', 'id'].find((key) => item.hasOwnProperty(key));
      return id ? item[id] : item;
    }

    _newEntryFormatter(term) {
      return { id: term, displayLabel: term };
    }

    _selectionFormatter(item) {
      return escapeHTML(item.displayLabel || item.title || item.text || item);
    }

    _resultFormatter(item) {
      return escapeHTML(item.displayLabel || item.title || item.text || item);
    }

    _wrap(value) {
      const fn = (item, level) => {
        const depth = level || 0;
        const id = this.idFunction(item);
        const entry = {
          id,
          text: item.displayLabel || item.text || id || '',
          item,
          depth,
        };
        if (item.children) {
          entry.children = item.children.map((child) => fn(child, depth + 1));
        }
        return entry;
      };
      return Array.isArray(value) ? value.map((item) => fn(item)) : fn(value);
    }

    _triggerQueryCallback(query, results) {
      if (this.queryResultsFilter) {
        results = results.filter(this.queryResultsFilter);
      }
      if (this.tagging && query.term) {
        const exists = results.some((item) => item.id === query.term);
        if (!exists) {
          results.push(this.newEntryFormatter(query.term));
        }
      }
      query.callback({
        results: this._wrap(results),
      });
    }

    // Implements abstract Nuxeo.Select2 methods
    _query(query) {
      if (this.data) {
        return this._triggerQueryCallback(query, this.data);
      }
      if (!this.operation) {
        return this._triggerQueryCallback(query, []);
      }
      const params = this.params || {};
      params.searchTerm = query.term;
      this.$.op.params = params;
      this.$.op.execute().then((response) => {
        let results = Array.isArray(response.entries) ? response.entries : response;
        this._triggerQueryCallback(query, results);
      });
    }

    _getScrollParent() {
      let scrollParent = document.body;  // use the document.body as the default scrollable parent
      let style = getComputedStyle(this);
      const excludeStaticParent = style.position === 'absolute';
      const overflowRegex = /(auto|scroll)/;

      if (style.position !== 'fixed') {
        let parent = this;
        while (parent) {
          if (parent.parentElement) {
            parent = parent.parentElement;
          } else if (parent.getRootNode()) {
            parent = parent.getRootNode().host;
          } else {
            break;  // break the loop if no scrollable parent was found
          }
          if (parent) {
            style = getComputedStyle(parent);
            if ((!excludeStaticParent || style.position !== 'static') &&
              overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) {
              scrollParent = parent;
              break;
            }
          }
        }
      }
      return scrollParent;
    }
  }

  customElements.define(SelectivityElement.is, SelectivityElement);
  Nuxeo.Selectivity = SelectivityElement;
}

export function escapeHTML(markup) {
  const replaceMap = {
    '\\': '&#92;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
    '/': '&#47;',
  };

  // Do not try to escape the markup if it's not a string
  if (typeof markup !== 'string') {
    return markup;
  }

  return String(markup).replace(/[&<>"'/\\]/g, (match) => replaceMap[match]);
};
