/*
 * pete-core
 *
 * Copyright (c) 2009 - 2016 Benjamin Toll (benjamintoll.com)
 * Licensed under the MIT license.
 *
 */

import { Util } from '../lib/interface';

const reAddCommas: RegExp = /(\d+)(\d{3})/;
const reCamelCase: RegExp = /([a-zA-Z0-9])([a-zA-Z0-9]*)[_|\-|\.|\s]([a-zA-Z0-9])/g;
// Replace all . or _ or - with a space and then capitalize the first letter of each word.
const reCapFirstLetter: RegExp = /[\s|_|\-|\.](\w)/g;
const reRange: RegExp = /(\-?\w+)(\.{2,3})(\-?\w+)/;
const reTrim: RegExp = /^\s+|\s+$/g;

// For internal use only, can be modified via Pete#flush.
let cache = {};
let disabled = {};
let events = {};
let garbage = {};

const util: Util = {
    /**
    * @property Pete.core.util.globalSymbol
    * @type String
    * @describe Constant. The global symbol that is used in everything from the creation of unique `<a href="#jsdoc">Pete.Element</a>` ids to class names.
    */
    globalSymbol: 'Pete',

    /**
     * @function Pete.core.util.addCommas
     * @param {Number/String} format The number to be formatted with commas.
     * @return {String}
     * @describe <p>Accepts a <code>Number</code> or a <code>String</code> and formats it with commas, i.e. <code>3,456,678</code>.</p><p>Note that it's returned as a <code>String</code> because it may contain a comma and <code>parseInt()</code> gives up when it sees a character that doesn't evaluate to a number.</p>
     */
    addCommas: (format: number|string): string => {
        let str = format + '';

        while (reAddCommas.test(str)) {
            str = str.replace(reAddCommas, '$1,$2');
        }

        // Can't return as a number b/c it could contain commas and parseInt() gives up when it sees a comma.
        return str;
    },

    /**
     * @function Pete.core.util.camelCase
     * @param {String} str
     * @return {String}
     * @describe <p>Searches the <code>String</code> for an instance of a period (.), underscore (_), whitespace ( ) or hyphen (-) in a word and removes it, capitalizing the first letter of the joined text.</p>
     * @example
document.write('This old Farm.land Boy-oh_boy'.camelCase());

writes:

This old farmLand boyOhBoy
     */
    camelCase: (str: string): string =>
        str.replace(reCamelCase, (a, b, c, d) => b.toLocaleLowerCase() + c + d.toLocaleUpperCase()),

    /**
     * @function Pete.core.util.capFirstLetter
     * @param {String} str
     * @return {String}
     * @describe <p>Replaces every period (.), underscore (_) and hyphen (-) with a space ( ) and then capitalizes the first letter of each word.</p>
     */
    capFirstLetter: (str: string): string => {
        str = str.replace(reCapFirstLetter, (a, b) => ` ${b.toLocaleUpperCase()}`);
        return str.charAt(0).toLocaleUpperCase() + str.slice(1);
    },

    /**
     * @function Pete.core.util.copy
     * @param {Object} varargs
     * @return {Object}
     * @describe Copies all properties of all passed objects to a new object and returns it. It doesn't modify any object passed to it in the method signature. Note this method performs a shallow copy.
     */
    copy: (...args: any[]): Object => {
        const o: Object = <any>{};

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
     * @function Pete.core.util.deepCopy
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
                    o.push(util.deepCopy(v));
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
                        o[prop] = util.deepCopy(v);
                    } else {
                        o[prop] = v;
                    }
                }
            }
        }

        return o;
    },

    /**
     * @function Pete.core.util.flush
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
                    if (!util.isEmpty(disabled)) {
                        disabled = {};
                    }
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
     * @function Pete.core.util.howMany
     * @param {String} haystack The string to search
     * @param {String} needle The part to search for
     * @return {Number}  * @describe <p>Returns how many times <code>needle</code> occurs in the given <code>haystack</code>.</p>
     */
    howMany: (haystack: string, needle: string): number => {
        let i = 0;
        let pos = haystack.indexOf(needle);

        while (pos > -1) {
            pos = haystack.indexOf(needle, pos + 1);
            i++;
        }

        return i;
    },

    /**
     * @function Pete.core.util.increment
     * @param {None}
     * @return {Number}
     * @describe The closure provides for a secure and reliable counter.
     * @example
     return Pete.globalSymbol + Pete.increment();
     */
    increment: (() => {
        let n: number = 0;
        return (): number => n++;
    })(),

    /**
     * @function Pete.util.isArray
     * @param {Mixed} v
     * @return {Boolean}
     * @describe Tests if the passed data is an array.
     */
    isArray: (v: any): boolean => Object.prototype.toString.apply(v) === '[object Array]',

    /**
     * @function Pete.core.util.isEmpty
     * @param {Mixed} v
     * @return {Boolean}
     * @describe Tests if the variable is empty. `null`, `undefined` and `NaN` are considered to be empty values.
     */
    isEmpty: (v: string|Object): boolean => {
        let empty = true;

        if (
            typeof v === 'string' && v.length > 0 ||
            typeof v === 'number' && !isNaN(v) ||
            // We need a type assertion here b/c TypeScript cannot determine the type passed to `this.isArray`.
            util.isArray(v) && (v as any[]).length > 0 ||
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
     * @function Pete.core.util.makeArray
     * @param {Object} o
     * @param {Number} start (Optional) The index at which to begin slicing
     * @return {Array}
     * @describe Converts a collection of nodes or the `arguments` object into a true array.
    A tip of the hat to the Prototype library.
    Note: Nicholas Zakas <a href="http://www.nczonline.net/blog/2007/12/13/ie-com-reers-its-ugly-head/" rel="external">has a good blog post</a> about why IE doesn't respect `Array.prototype.slice`.
    This is to transfrom a collection into an array. If you want to cast an object to an array, please see `<a href="#jsdoc">Pete.toArray</a>`.
     */
    makeArray: (o, start?: number): any[] => {
//        if (!Pete.isIE) {
//            return Array.prototype.slice.call(o, start);
//        }

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
     * @function Pete.core.util.makeId
     * @param {None}
     * @return {String}
     * @describe Creates an `Pete.Element` a unique ID if it doesn't already have one.
     */
    makeId: (): string => util.globalSymbol + util.increment(),

    /**
     * @function Pete.core.util.range
     * @param {String} range
     * @return {Array}
     * @describe <p>Inspired by Ruby's <code>range</code> method. Since this method is based on Ruby's implementation, the syntax and functionality is very similar.</p>
<p>This method will return both numeric and alphabetical arrays. The beginning range element must always be smaller than the ending range element. Note that even though numeric ranges are passed to the method as a string data type, i.e., "1..100", the array returned will contain numeric elements. Alphabetical ranges will of course return an array of strings.</p><p>Just as in Ruby, the ".." range is inclusive, while the "..." range is exclusive.</p>
<ul>
  <li>Pete.range('-52..-5') //returns an array containing elements -52 through -5, <em>including</em> -5;</li>
  <li>Pete.range('-52...-5') //returns an array containing elements -52 through -5, <em>excluding</em> -5;</li>
  <li>Pete.range('-5..-52') //throws an exception;</li>
  <li>Pete.range('a..z') //returns an array containing elements 'a' through 'z', <em>including</em> 'z';</li>
  <li>Pete.range('A...Z') //returns an array containing elements 'A' through 'Z', <em>excluding</em> 'Z';</li>
  <li>Pete.range('E..A') //throws an exception;</li>
</ul>
     * @example
var iTemp = 72;
switch (true) {
  case Pete.range('-30..-1').contains(iTemp):
    console.log('Sub-freezing');
    break;

  case Pete.range('0..32').contains(iTemp):
    console.log('Freezing');
    break;

  case Pete.range('33..65').contains(iTemp):
    console.log('Cool');
    break;

  case Pete.range('66..95').contains(iTemp):
    console.log('Balmy');
    break;

  case Pete.range('96..120').contains(iTemp):
    console.log('Hot, hot, hot!');
    break;

  default:
    console.log('You must be very uncomfortable, wherever you are!');
}

//logs 'Balmy';

-----------------------------------------------------------------------------

//create and return the alphabet as a string;
Pete.range("A..Z").join("");
     */
    range: (range: string): number[]|string[] => {
        const chunks: Array<any> = reRange.exec(range);
        const isNumeric = chunks[1] === '0' || !!Number(chunks[1]);

        if (reRange.test(range)) {
            const arr = [];
            let begin, end;

            // NOTE !!(Number("0") evaluates to falsy for numeric ranges so specifically
            // check for this condition.
            // Re-assign the value of range to the actual range, i.e., ".." or "...".
            range = chunks[2];

            // If it's a numeric range cast the string into a number else get the Unicode
            // value of the letter for alpha ranges.
            begin = isNumeric ? Number(chunks[1]) : chunks[1].charCodeAt();
            end = isNumeric ? Number(chunks[3]) : chunks[3].charCodeAt();

            // Establish some exceptions.
            if (begin > end) {
                throw new Error('The end range cannot be smaller than the start range.');
            }

            if (isNumeric && (end - begin) > 1000) {
                throw new Error('The range is too large, please narrow it.');
            }

            for (let i = 0; begin <= end; i++, begin++) {
                // If it's an alphabetical range then turn the Unicode value into a string
                // (number to a string).
                arr[i] = isNumeric ? begin : String.fromCharCode(begin);
            }

            if (range === '...') {
                // If the range is exclusive, lop off the last index.
                arr.splice(-1);
            }

            return arr;
        }
    },

    /**
     * @function Pete.core.util.toArray
     * @param {Object} o
     * @return {Array}
     * @describe Transforms the passed object into an array. Employs `Object.hasOwnProperty` so as to not push inherited properties onto the array.
This is to cast an object to an array. If you want to transform a collection into an array, please see `<a href="#jsdoc">Pete.makeArray</a>`.
     */
    toArray: (o: Object): any[] => {
        const arr = [];

        // TODO: Object.keys
        for (let prop in o) {
            if (o.hasOwnProperty(prop)) {
                arr.push(o[prop]);
            }
        }

        return arr;
    },

    /**
     * @function Pete.core.util.trim
     * @param {String} str
     * @return {String}
     * @describe Trims whitespace from the beginning and end of a `String`.
     */
    trim: (str: string): string => str.replace(reTrim, ''),

    /*
      timestamp: function (oDate) {

        var iHour = oDate.getHours,
          sPeriod = iHour < 12 ? " a.m. EST" : " p.m. EST";

        return "last updated at " + this.getHours(iHour) +
          ":" + this.getMinutes(oDate.getMinutes()) + sPeriod;

      }
    */
};

export default util;

