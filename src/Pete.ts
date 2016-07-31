/*
 * pete-core
 *
 * Copyright (c) 2009 - 2016 Benjamin Toll (benjamintoll.com)
 * Licensed under the MIT license.
 *
 */

import { Core } from './interface';

// For internal use only, can be modified via Pete#flush.
let cache = {};
let disabled = {};
let events = {};
let garbage = {};

const Pete: Core = {
    create: (obj: Object): Object =>
        Object.create ?
            Object.create(obj) :
            Pete.extend(obj),

    /**
     * @function Pete.compose
     * @param {Function} subClass
     * @param {Mixed} superClass Pass either a constructor or an object
     * @param {Object} overrides optional Any object properties will be added to the subclass' prototype
     * @return {Function} subClass
     * @describe
    // Prototype chaining.
    Pete.compose(Person, Pete.Observer);

    -- or --

    Car = Pete.compose(Pete.Observer, {
        init: function () {
            //code here...;
        }
    });
     */
    compose: (proto: Object, ...args: Object[]): Object => {
        const obj: any = Pete.create(proto);

        if (args.length) {
            for (let i = 0, len = args.length; i < len; i++) {
                Pete.mixin(obj, args[i]);
            }
        }

        // Do any post-processing on the newly-minted object.
        if (obj.$compose) {
            obj.$compose.apply(obj, args);
        }

        return obj;
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
    extend: function (proto: Object): Object {
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
    flush: (...actions: string[]): void => {
        if (!actions.length) {
            return;
        }

        for (let i = 0, len = actions.length; i < len; i++) {
            switch (actions[i]) {
                case 'cache':
                    cache = {};
                    break;

                case 'disabled':
                    disabled = {};
                    break;

                /*
                case 'flyweight':
                    flyweight = {};
                    break;
                */

                case 'garbage':
                    garbage = {};
            }
        }
    },

    /**
     * @function Pete.mixin
     * @param {Object} child
     * @param {Object} parent
     * @return {Object}
     * @describe Mixes in all properties of `parent` to `child`. Doesn't check for pre-existing properties.
     */
    mixin: (child: Object, parent: Object): Object => {
        for (let prop in Object.keys(parent)) {
            child[prop] = parent[prop];
        }

        return child;
    },

    /**
     * @function Pete.mixinIf
     * @param {Object} child
     * @param {Object} parent
     * @return {Object}
     * @describe Copies all properties of `parent` to `child` that don't exist in `child`.
     */
    mixinIf: (child: Object, parent: Object): Object => {
        for (let prop in Object.keys(parent)) {
            if (!child[prop]) {
                child[prop] = parent[prop];
            }
        }

        return child;
    },

    wrap: (proto: Object, methodName: string): void => {
        if (!proto[methodName]) {
            proto[methodName] = function (...args: any[]): any {
                return this.invoke(methodName, ...args);
            };
        }
    }
};

export default Pete;

