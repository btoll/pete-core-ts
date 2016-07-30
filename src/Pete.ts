/*
 * pete-core
 *
 * Copyright (c) 2009 - 2016 Benjamin Toll (benjamintoll.com)
 * Licensed under the MIT license.
 *
 */

import { Proto } from './interface';

const Pete = <any>{};
const reTrim: RegExp = /^\s+|\s+$/g;

/**
 * @function Pete.mixin
 * @param {Object} child
 * @param {Object} parent
 * @return {Object}
 * @describe Mixes in all properties of `parent` to `child`. Doesn't check for pre-existing properties.
 */
Pete.mixin = (child: Proto, parent: Proto): Proto => {
    for (let i in parent) {
        if (parent.hasOwnProperty(i)) {
            child[i] = parent[i];
        }
    }

    return child;
};

Pete.mixin(Pete, {
    /**
     * @function Pete.mixinIf
     * @param {Object} child
     * @param {Object} parent
     * @return {Object}
     * @describe Copies all properties of `parent` to `child` that don't exist in `child`.
     */
    mixinIf: (child: Proto, parent: Proto): Proto => {
        for (let i in parent) {
            if (parent.hasOwnProperty(i)) {
                if (!child[i]) {
                    child[i] = parent[i];
                }
            }
        }

        return child;
    },

    /**
     * @function Pete.compose
     * @param {Function} subClass
     * @param {Mixed} superClass Pass either a constructor or an object
     * @param {Object} overrides optional Any object properties will be added to the subclass' prototype
     * @return {Function} subClass
     * @describe
    Pete.compose(Person, Pete.Observer); //prototype chaining;

    -- or --

    Car = Pete.compose(Pete.Observer, {
      init: function () {
        //code here...;
      }
    });
     */
    compose: (proto: Proto, ...args: Proto[]): Proto => {
        // TODO: Spread operator.
//        const args = Pete.makeArray(arguments, 1);
        const obj = Object.create ?
            Object.create(proto) :
            Pete.extend(proto);

        if (args.length) {
            for (let i = 0, len = args.length; i < len; i++) {
                Pete.mixin(obj, args[i]);
            }
        }

        // Do any post-processing on the newly-minted object.
        if (proto.$compose) {
            proto.$compose.apply(obj, args);
        }

        return obj;
    },

    /**
     * @function Pete.copy
     * @param {Object} varargs
     * @return {Object}
     * @describe Copies all properties of all passed objects to a new object and returns it. It doesn't modify any object passed to it in the method signature. Note this method performs a shallow copy.
     */
    copy: (...args: any[]): Proto => {
        const o: Proto = <any>{};

        args.forEach(obj => {
            // TODO: Object.keys
            for (let n in obj) {
                if (obj.hasOwnProperty(n)) {
                    o[n] = obj[n];
                }
            }
        });

        return o;
    },

    /**
     * @function Pete.counter
     * @param {None}
     * @return {Number}
     * @describe The closure provides for a secure and reliable counter.
     * @example
     return Pete.globalSymbol + Pete.counter();
     */
    counter: ((): Function => {
        let n: number = 0;
        return (): number => n++;
    })(),

    /**
     * @function Pete.deepCopy
     * @param {orig}
     * @return {Object}
     * @describe Makes a deep copy of the object that's passed as its sole argument and returns the copied object. Every copied object and array property of the original object will be separate and distinct from the original object. In other words, after the deep copy occurs, any new expando property added to either object won't be replicated to the other.
     */
    deepCopy: (orig: Object[]|Object): Object => {
        let o;

        // Arrays are handled differently than objects.
        if (Array.isArray(orig)) {
            o = [];

            for (let i = 0, len = orig.length; i < len; i++) {
                let v = orig[i];

                // Could be an array or an object.
                if (v instanceof Object) {
                    o.push(Pete.deepCopy(v));
                } else {
                    o.push(v);
                }
            }
        } else {
            o = {};

            for (let prop in orig) {
                if (orig.hasOwnProperty(prop)) {
                    let v = orig[prop];

                    // Could be an array or an object.
                    if (v instanceof Object) {
                        o[prop] = Pete.deepCopy(v);
                    } else {
                        o[prop] = v;
                    }
                }
            }
        }

        return o;
    },

    /**
     * @function Pete.emptyFn
     * @param None
     * @return {Function}
     */
    emptyFn: (): void => {},

    // @private
    // Note that this is only here for legacy browsers that don't support Object.create.
    // This should not be called directly.
    extend: function (proto: Proto) {
        const F = Pete.emptyFn;
        F.prototype = proto;

        return new F();
    },

    /**
     * @function Pete.flush
     * @param {Array/String} action Function argument(s) can be an `Array` or one or more `Strings`
     * @return {None}
     * @describe Values are:
      `cache` - clear the cache of any `Pete.Elements`
      `disabled` - re-enable any disabled elements
      `flyweight` - clear the flyweight object
      `garbage` - clear the garbage cache of any `HTMLElements` that were removed from the DOM
     */
    flush: (...actions: string[]) => {
        if (!actions.length) {
            return;
        }

        for (let i = 0, len = actions.length; i < len; i++) {
            switch (actions[i]) {
                case 'cache':
                    Pete.cache = {};
                    break;

                case 'disabled':
                    if (!Pete.isEmpty(Pete.disabled)) {
                        Pete.disabled = {};
                    }
                    break;

                /*
                case 'flyweight':
                    flyweight = {};
                    break;
                */

                case 'garbage':
                    Pete.garbage = {};
            }
        }
    },

    /**
     * @function Pete.id
     * @param {None}
     * @return {String}
     * @describe Gives an `Pete.Element` a unique ID if it doesn't already have one.
     */
    id: (): string => Pete.globalSymbol + Pete.counter(),

    /**
     * @function Pete.isArray
     * @param {Mixed} v
     * @return {Boolean}
     * @describe Tests if the passed data is an array.
     */
    isArray: (v: any): boolean => Object.prototype.toString.apply(v) === '[object Array]',

    /**
     * @function Pete.isEmpty
     * @param {Mixed} v
     * @return {Boolean}
     * @describe Tests if the variable is empty. `null`, `undefined` and `NaN` are considered to be empty values.
     */
    isEmpty: function (v: string|Object): boolean {
        let empty = true;

        if (
            typeof v === 'string' && v.length > 0 ||
            typeof v === 'number' && !isNaN(v) ||
            // We need a type assertion here b/c TypeScript cannot determine the type passed to `this.isArray`.
            this.isArray(v) && (v as any[]).length > 0 ||
            v instanceof Date
        ) {
            empty = false;
        } else if (v instanceof Object) {
            // TODO: Object.keys
            for (let prop in v) {
                if (v.hasOwnProperty(prop)) {
                    empty = false;
                    break;
                }
            }
        }

        /*
        //jsLint suggested changing SWITCH to an IF;
            switch (true) { //undefined, null and NaN values aren't represented;
              case typeof v === "string" && v.length > 0:
              case typeof v === "number" && !isNaN(v): //remember typeof NaN === "number";
              case v instanceof Array && v.length > 0:
              case v instanceof Date:
                empty = false;
                break;

              case v instanceof Object:
                for (var prop in v) {
                  if (v.hasOwnProperty(prop)) {
                    empty = false;
                    break;
                }
              }
            }
        */

        return empty;
    },

    /**
     * @function Pete.makeArray
     * @param {Object} o
     * @param {Number} start (Optional) The index at which to begin slicing
     * @return {Array}
     * @describe Converts a collection of nodes or the `arguments` object into a true array.
    A tip of the hat to the Prototype library.
    Note: Nicholas Zakas <a href="http://www.nczonline.net/blog/2007/12/13/ie-com-reers-its-ugly-head/" rel="external">has a good blog post</a> about why IE doesn't respect `Array.prototype.slice`.
    This is to transfrom a collection into an array. If you want to cast an object to an array, please see `<a href="#jsdoc">Pete.toArray</a>`.
     */
    makeArray: (o, start?: number): any[] => {
        if (!Pete.isIE) {
            return Array.prototype.slice.call(o, start);
        }

        // TODO: Type of `o`?
        let len = o.length || 0;
        const arr = new Array(len);

        if (o && o.length) {
            while (len--) {
                arr[len] = o[len];

                if (len === start) {
                    break;
                }
            }
        }

        return arr;
    },

    /**
     * @function Pete.toArray
     * @param {Object} o
     * @return {Array}
     * @describe Transforms the passed object into an array. Employs `Object.hasOwnProperty` so as to not push inherited properties onto the array.
This is to cast an object to an array. If you want to transform a collection into an array, please see `<a href="#jsdoc">Pete.makeArray</a>`.
     */
    toArray: function (o: Object): any[] {
        const arr = [];

        for (let prop in o) {
            if (o.hasOwnProperty(prop)) {
                arr.push(o[prop]);
            }
        }

        return arr;
    },

    /**
     * @function Pete.trim
     * @param {String} str
     * @return {String}
     * @describe Trims whitespace from the beginning and end of a `String`.
     */
    trim: (str: string): string => str.replace(reTrim, ''),

    wrap: (proto: Proto, method: string): void => {
        if (!proto[method]) {
            proto[method] = function (...args) {
                return this.invoke(method, ...args);
            };
        }
    }
});

/**
* @property Pete.globalSymbol
* @type String
* @describe Constant. The global symbol that is used in everything from the creation of unique `<a href="#jsdoc">Pete.Element</a>` ids to class names.
*/
Pete.globalSymbol = 'Pete';

// For internal use only, can be modified via Pete#flush.
// TODO: make these private, only accessible via a closure?
Pete.mixin(Pete, {
    cache: {},
    disabled: {},
    events: {},
    garbage: {}
});

export default Pete;

