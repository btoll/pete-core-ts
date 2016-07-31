/*
 * pete-core
 *
 * Copyright (c) 2009 - 2016 Benjamin Toll (benjamintoll.com)
 * Licensed under the MIT license.
 *
 */

import Pete from './Pete';
import util from './util';
import { Observer } from './interface';

//interface Event {
//    [propName: string]: Function|Function[];
//}

let events: Event = <any>{};

/**
 * @function Observer
 * @param {None}
 * @return {None}
 * @describe Abstract class, useful for custom events. This reference type is composable, i.e., `Pete.compose(Pete.Observer);`
*/
const observer: Observer = {
    /**
     * @function Pete.Observer.subscriberEvents
     * @param {Array/String} v
     * @return {None}
     * @describe Define the custom events that the type will expose. Pass either an array where the
     * property of custom events or a comma-delimited list of strings in the constructor. If the
     * object then subscribes to one of the exposed events, the function will be mapped to the event
     * name in `events`.
     */
    subscriberEvents: function (v: string|string[]): void {
        if (typeof v === 'string') {
            // TODO: Rest parameter.
            for (let i = 0, args = arguments; args[i]; i++) {
                if (!events[args[i]]) {
                    events[args[i]] = [];
                }
            }
        } else if (util.isArray(v)) {
            v.forEach((a: string): string[] => events[a] = []);
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
    fire: (type: string, options: Object): boolean => {
        let bubble = true;
        let customEvent;

        if (!events) {
            return false;
        }

        if (events[type]) {
            customEvent = {
                target: observer,
                type: type
            };

            if (options && !util.isEmpty(options)) {
                Pete.mixin(customEvent, options);
            }

            events[type].forEach((fn: Function): void =>
                // Will return false if bubbling is canceled.
                // NOTE a callback returning undefined will not prevent the event from bubbling.
                bubble = fn.call(observer, customEvent)
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
    isObserved: (type: string): boolean => !!events[type],

    /**
     * @function Pete.Observer.purgeSubscribers
     * @param {None}
     * @return {None}
     * @describe Removes all of an object's event handlers.
     */
    purgeSubscribers: () => events = <Event>{},

    /**
     * @function Pete.Observer.subscribe
     * @param {String} type Event to listen for
     * @param {Function} fn Callback
     * @return {None}
     * @describe Listen to a pre-defined event by passing the name of the event to and the callback to be invoked when that event occurs.
     */
    subscribe: (type: string, fn: Function): void => {
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
    unsubscribe: (type: string, fn: Function): void => {
        if (events && events[type]) {
            events[type].remove(fn);
        }
    }
};

export default observer;

