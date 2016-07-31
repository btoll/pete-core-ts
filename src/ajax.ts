/**
 * pete-core
 *
 * Copyright (c) 2009 - 2016 Benjamin Toll (benjamintoll.com)
 * Licensed under the MIT license.
 *
 */

import core from './core';
import util from './util';
import { Ajax, HttpOptions } from '../lib/interface';

const emptyFn = core.emptyFn;
const requests = <any>{};

/**
 * @function getDefaults
 * @type Object
 * @describe Private. Contains the default configuration options which can be changed
 * within the object literal passed as the parameter to `Pete.ajax.load`.
 */
const getDefaults = (): HttpOptions => {
    return {
        async: true,
        data: '',
        // The headers that will be returned (for HEAD requests only).
        headers: '',
        id: -1,
        postvars: '',
        timeout: 30000,
        type: 'GET',
        url: '',
        abort: emptyFn,
        complete: emptyFn,
        error: emptyFn,
        success: emptyFn
    };
};

const getHttpData = (response: XMLHttpRequest, options: HttpOptions): string => {
    // Extract the correct data from the HTTP response.
    //
    // If a HEAD request was made, determine which header name/value pair to return
    // (or all of them) and exit function.
    if (options.type.toUpperCase() === 'HEAD') {
        return !options.headers ? response.getAllResponseHeaders() : response.getResponseHeader(options.headers);
    }

    // If the specified type is 'script', execute the returned text response as if it were javascript.
    if (options.data.toLowerCase() === 'json') {
        return JSON.parse(response.responseText);
    }

    return isXml(response, options) ?
        response.responseXML :
        response.responseText;
};

const getOptions = (options: HttpOptions): HttpOptions =>
    <HttpOptions>core.mixin(getDefaults(), options);

const getXhr = (): XMLHttpRequest => new XMLHttpRequest();

const isXml = (response: XMLHttpRequest, options: HttpOptions): boolean =>
    options.data.toLowerCase() === 'xml' || response.getResponseHeader('Content-Type').indexOf('xml') > -1;

const sendRequest = function (xhr: XMLHttpRequest, options: HttpOptions): void {
    const requestId = util.increment();
    const type = options.type.toUpperCase();

    requests[requestId] = xhr;
    options.id = requestId;

    // Initialize a callback which will fire x seconds from now, canceling the request
    // if it has not already occurred.
    setTimeout((): void => {
        if (xhr) {
            xhr.abort();
            options.abort();
        }
    }, options.timeout);

    xhr.onreadystatechange = ():void => {
        if (xhr.readyState === 4) {
            let result = getHttpData(xhr, options);
            ajax.onComplete(result, options, wasSuccessful(xhr), xhr);

            // Clean up after ourselves to avoid memory leaks.
            xhr = null;
        }
    };

    if (type === 'HEAD') {
        xhr.open(type, options.url);
    } else {
        xhr.open(type, options.url, options.async);
    }

    // Establish the connection to the server.
    if (type === 'POST') {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(options.postvars);
    } else {
        xhr.send(null);
    }
};

const onComplete = (response: string, request: HttpOptions, success: boolean, xhr: XMLHttpRequest): void => {
    const methodName = success ? 'success' : 'error';

    request[methodName](response, request, success, xhr);
    request.complete();

    delete requests[request.id];
};

const wasSuccessful = (xhr: XMLHttpRequest): boolean =>
    // If no server status is provided and we're actually requesting a local file then it was successful.
    !xhr.status && location.protocol === 'file:' ||

        // Any status in the 200 range is good.
        (xhr.status >= 200 && xhr.status < 300) ||

        // Successful if the document has not been modified.
        xhr.status === 304;// ||

//            // Safari returns an empty status if the file has not been modified.
//            Pete.isSafari && typeof r.status === 'undefined';

const ajax: Ajax = {
    getRequests: (): Object => requests,

    /**
     * @function Pete.ajax.load
     * @param {Object} options
     * @return {String/XML/JSON} Optional. Will only return if configured as synchronous.
     * @describe Used for general-purpose Ajax request. Define callbacks and other customizable
     * features within `options`.
     * @example
        Pete.ajax.load({
            url: 'http://www.benjamintoll.com/',
            type: 'GET',
            success: resp => {
                // ...
            }
        });
     */
    load: (options: HttpOptions): void|string => {
        const opts: HttpOptions = getOptions(options);
        const xhr: XMLHttpRequest = getXhr();

        // TODO: Make all private methods public?
        sendRequest(xhr, options);

        if (!opts.async) {
            if (wasSuccessful(xhr)) {
                return getHttpData(xhr, options);
            }
        }
    },

    // This has to be exposed in case a prototype defines its own API.
    onComplete: onComplete
};

export default ajax;

