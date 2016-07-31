/*
 * pete-core
 *
 * Copyright (c) 2009 - 2016 Benjamin Toll (benjamintoll.com)
 * Licensed under the MIT license.
 *
 */

import { Core } from '../lib/interface';

const supportsObjectKeys: boolean = !!Object.keys;

const create = (() => {
    const createFn: Function = Object.create ?
        Object.create :
        createPolyfill;

    return (obj: Object): Object => createFn(obj);
})();

// Note that this is only here for legacy browsers that don't support Object.create.
const createPolyfill = (proto: Object): Object => {
    const F = core.emptyFn;
    F.prototype = proto;

    return new F();
};

const extend = (proto: Object, ...args: Object[]): Object => {
    const obj: any = core.create(proto);

    if (args.length) {
        for (let i = 0, len = args.length; i < len; i++) {
            core.mixin(obj, args[i]);
        }
    }

    // Do any post-processing on the newly-minted object.
    if (obj.$extend) {
        obj.$extend.apply(obj, args);
    }

    return obj;
};

const mixin = (child: Object, parent: Object): Object => {
    if (!supportsObjectKeys) {
        for (let prop in parent) {
            if (parent.hasOwnProperty(prop)) {
                child[prop] = parent[prop];
            }
        }
    } else {
        for (let prop of Object.keys(parent)) {
            child[prop] = parent[prop];
        }
    }

    return child;
};

const mixinIf = (child: Object, parent: Object): Object => {
    if (!supportsObjectKeys) {
        for (let prop in parent) {
            if (!child[prop] && parent.hasOwnProperty(prop)) {
                child[prop] = parent[prop];
            }
        }
    } else {
        for (let prop of Object.keys(parent)) {
            if (!child[prop]) {
                child[prop] = parent[prop];
            }
        }
    }

    return child;
};

const core: Core = {
    create: create,

    /**
     * @function Pete.core.emptyFn
     * @param None
     * @return {Function}
     */
    emptyFn: (): void => {},

    /**
     * @function Pete.core.extend
     * @param {Object} The base prototype.
     * @param {...Object[]} Optional. Any number of additional objects to be mixed into the new object.
     * @return {Object} The new, extended object.
     *
     * Note that when mixing in Object.keys is used. This means that only own, enumerable keys are
     * copied over into the new object.
     */
    extend: extend,

    /**
     * @function Pete.mixin
     * @param {Object} child
     * @param {Object} parent
     * @return {Object}
     * @describe Mixes in all properties of `parent` to `child`. Doesn't check for pre-existing properties.
     */
    mixin: mixin,

    /**
     * @function Pete.mixinIf
     * @param {Object} child
     * @param {Object} parent
     * @return {Object}
     * @describe Copies all properties of `parent` to `child` that don't exist in `child`.
     */
    mixinIf: mixinIf
};

export default core;

