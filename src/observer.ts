/*
 * pete-core
 *
 * Copyright (c) 2009 - 2016 Benjamin Toll (benjamintoll.com)
 * Licensed under the MIT license.
 *
 */

import Pete from './Pete';

interface Event {
    [propName: string]: Function;
}

/**
 * @function Observer
 * @param {None}
 * @return {None}
 * @describe Abstract class, useful for custom events. This reference type is composable, i.e., `Pete.compose(Pete.Observer);`
*/
export default {
    /**
     * @function Pete.Observer.subscriberEvents
     * @param {Array/String} v
     * @return {None}
     * @describe Define the custom events that the type will expose. Pass either an array where the property of custom events or a comma-delimited list of strings in the constructor. If the object then subscribes to one of the exposed events, the function will be mapped to the event name in `this.events`.
     * @example
const Person = function (name) {
  this.name = name;
  this.subscriberEvents("say", "walk");
};

--or--

var Person = function (name) {
  this.name = name;
  this.subscriberEvents(["say", "walk"]);
};
     */
    subscriberEvents: function (v: string|string[]) {
        const me = this;

        if (!me.events) {
            me.events = <Event>{};
        }

        if (typeof v === 'string') {
            // TODO: Spread operator.
            for (let i = 0, args = arguments; args[i]; i++) {
                if (!this.events[args[i]]) {
                    this.events[args[i]] = [];
                }
            }
        } else if (Pete.isArray(v)) {
            v.forEach((a: string): string[] => me.events[a] = []);
        }
    },

    /**
     * @function Pete.Observer.fire
     * @param {String} type
     * @param {Object} options Optional
     * @return {Boolean}
     * @describe Publishes a custom event. The first argument passed to the observer is an object with the following defined properties:
  `target` A reference to observed object.
  `type` The name of the event.
The second argument is an optional `options` object that contains other data to pass to the subscribing event listener(s).
Note that custom events bubble, so returning `false` in the callback will prevent this behavior.
     */
    fire: function (type: string, options: Object): boolean {
        const me = this;
        const events: Event[] = me.events;
        let bubble = true;
        let customEvent;

        if (!events) {
            return false;
        }

        if (events[type]) {
            customEvent = {
                target: me,
                type: type
            };

            if (options && !Pete.isEmpty(options)) {
                Pete.mixin(customEvent, options);
            }

            events[type].forEach((fn: Function): void =>
                // Will return false if bubbling is canceled.
                // NOTE a callback returning undefined will not prevent the event from bubbling.
                bubble = fn.call(me, customEvent)
            );
        } else {
            bubble = false;
        }

        return bubble;
    },

    /**
     * @function Pete.Observer.isObserved
     * @param {String} type
     * @return {Boolean}
     * @describe Returns `true` if the event has one or more subscribers (`false` otherwise). Note it doesn't query for a specific handler.
     */
    isObserved: function (type: string): boolean {
        return !!this.events[type];
    },

    /**
     * @function Pete.Observer.purgeSubscribers
     * @param {None}
     * @return {None}
     * @describe Removes all of an object's event handlers.
     */
    purgeSubscribers: function () {
        this.events = <Event>{};
    },

    /**
     * @function Pete.Observer.subscribe
     * @param {String} type Event to listen for
     * @param {Function} fn Callback
     * @return {None}
     * @describe Listen to a pre-defined event by passing the name of the event to and the callback to be invoked when that event occurs.
     */
    subscribe: function (type: string, fn: Function) {
        const events: Event[] = this.events;

        if (!events || !events[type]) {
            // If there are no events then we know that the subscriberEvents api wasn't used, so exit.
            // Also, caan't subscribe to an event that wasn't established within the constructor!
            return;
        }

        if (events[type]) {
            events[type].push(fn);
        } else {
            events[type] = fn;
        }
    },

    /**
     * @function Pete.Observer.unsubscribe
     * @param {String} type
     * @param {Function} fn
     * @return {None}
     * @describe Remove the event listener that was previously subscribed.
     */
    unsubscribe: function (type: string, fn: Function): void {
        const events: Event[] = this.events;

        if (events && events[type]) {
            events[type].remove(fn);
        }
    }
};

