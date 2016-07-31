/*
 * pete-core
 *
 * Copyright (c) 2009 - 2016 Benjamin Toll (benjamintoll.com)
 * Licensed under the MIT license.
 *
 */

import { RuleDef, RuleBag, Rules } from './interface';

let defaultRules: RuleBag = {
    email: <RuleDef>{
        re: '^[_a-z0-9-]+(\\.[_a-z0-9-]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,3})$',
        // re: "^[\w-]+(\\.[\w-]+)*@[a-z0-9-]+(\\.[\w-]+)*(\\.[a-z]{2,3})$",
        message: 'Must be a valid email address.'
    },

    phone: <RuleDef>{
        re: '^1?\\(?(\\d{3})\\)?\\s?(\\d{3})-?(\\d{4})$',
        mask: '({1}) {2}-{3}',
        message: 'Can only contain numbers, parenthesis, spaces and a dash.'
    },

    ssn: <RuleDef>{
        re: '^(\\d{3})(?:[-\\s]?)(\\d{2})(?:[-\\s]?)(\\d{4})$',
        mask: '{1}-{2}-{3}',
        message: 'Can only contain numbers separated by a dash or a space.'
    },

    zip: <RuleDef>{
        re: '^([0-9]{5})(?:[-\\s]?)([0-9]{4})?$',
        mask: '{1}-{2}',
        message: 'Can only contain numbers and a dash.'
    }
};

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
const rules: Rules = {
    getRule: (name: string): RuleDef => defaultRules[name],

    setRule: (name: string, rule: RuleDef): RuleBag => {
        defaultRules[name] = rule;
        return defaultRules;
    },

    removeRule: (name: string): RuleBag => {
        delete defaultRules[name];
        return defaultRules;
    },

    rules: (): RuleBag => defaultRules
};

export default rules;

