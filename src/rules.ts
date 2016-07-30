/*
 * pete-core
 *
 * Copyright (c) 2009 - 2016 Benjamin Toll (benjamintoll.com)
 * Licensed under the MIT license.
 *
 */

import { Rule, RuleBag } from './interface';

/**
 * @function Rules
 * @param {None}
 * @return {None}
 * @describe Singleton.
 * @example
Pete.Rules.setRule("alpha", {re: "^[a-zA-Z]+$", message: "Can only contain letters."});
Pete.Rules.setRule("phone", {re: "^[a-zA-Z0-9]+$", message: "This is a bogus phone rule."});
oContactForm.validate(callback);

NOTE that any rule you set will only bind to the form element if it has its class set properly.
For instance, to set an "alpha" rule, the form element should look like the following in the markup:

<input type="text" id="firstName" name="firstName" class="required-alpha" />
 */
export default (() => {
    let rules: RuleBag = {
        email: {
            re: '^[_a-z0-9-]+(\\.[_a-z0-9-]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,3})$',
            // re: "^[\w-]+(\\.[\w-]+)*@[a-z0-9-]+(\\.[\w-]+)*(\\.[a-z]{2,3})$",
            message: 'Must be a valid email address.'
        },

        phone: {
            re: '^1?\\(?(\\d{3})\\)?\\s?(\\d{3})-?(\\d{4})$',
            mask: '({1}) {2}-{3}',
            message: 'Can only contain numbers, parenthesis, spaces and a dash.'
        },

        ssn: {
            re: '^(\\d{3})(?:[-\\s]?)(\\d{2})(?:[-\\s]?)(\\d{4})$',
            mask: '{1}-{2}-{3}',
            message: 'Can only contain numbers separated by a dash or a space.'
        },

        zip: {
            re: '^([0-9]{5})(?:[-\\s]?)([0-9]{4})?$',
            mask: '{1}-{2}',
            message: 'Can only contain numbers and a dash.'
        }
    };

    return {
        getRule: (name: string): Rule => rules[name],

        setRule: (name: string, rule: Rule): RuleBag => {
            rules[name] = rule;
            return rules;
        },

        removeRule: (name: string): RuleBag => {
            delete rules[name];
            return rules;
        },

        rules: (): RuleBag => rules
    };
})();

