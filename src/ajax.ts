/**
 * pete-core
 *
 * Copyright (c) 2009 - 2015 Benjamin Toll (benjamintoll.com)
 * Licensed under the MIT license.
 *
 */

import Pete from './Pete';
import Observer from './observer';
import { HttpOptions } from './interface';

export default Pete.compose(Observer, ((): Object => {
    /**
     * @property defaults
     * @type Object
     * @describe Private. Contains the default configuration options which can be changed
     * within the object literal passed as the parameter to `Pete.ajax.load`.
     */
    const defaults: HttpOptions = {
        type: 'get',
        // The data type that'll be returned from the server.
        data: 'html',
        url: '',
        postvars: '',
        // The headers that will be returned (for HEAD requests only).
        headers: '',
        timeout: 60000,
        complete: Pete.emptyFn,
        error: Pete.emptyFn,
        success: Pete.emptyFn,
        abort: Pete.emptyFn,
        async: true
    };

    let getXHR = (): XMLHttpRequest => new XMLHttpRequest();

    // Determine the success of the HTTP response.
    const wasSuccessful: Function = (r: XMLHttpRequest): boolean => {
        try {
            // If no server status is provided and we're actually requesting a local file then it was successful.
            return !r.status && location.protocol === 'file:' ||

                // Any status in the 200 range is good.
                (r.status >= 200 && r.status < 300) ||

                // Successful if the document has not been modified.
                r.status === 304 ||

                // Safari returns an empty status if the file has not been modified.
                Pete.isSafari && typeof r.status === 'undefined';

        } catch (e) {
            throw e;
        }

        // If checking the status failed then assume that the request failed.  return false;
    };

    // Extract the correct data from the HTTP response.
    const httpData: Function = (r: XMLHttpRequest, options: HttpOptions): string => {
        const ct = r.getResponseHeader('content-type');
        let data;

        // If a HEAD request was made, determine which header name/value pair to return
        // (or all of them) and exit function.
        if (options.type === 'HEAD') {
            return !options.headers ? r.getAllResponseHeaders() : r.getResponseHeader(options.headers);
        }

        // If the specified type is 'script', execute the returned text response as if it were javascript.
        if (options.data === 'json') {
            return JSON.parse(r.responseText);
        }

        // Determine if some form of xml was returned from the server.
        data = ct && ct.indexOf('xml') > -1;

        // Get the xml document object if xml was returned from the server, otherwise return the text contents.
        data = options.data === 'xml' || data ? r.responseXML : r.responseText;

        return data;
    };

    const sendRequest = function (xhr: XMLHttpRequest, options: HttpOptions): void {
        // We're going to wait for a request for x seconds before giving up.
        const timeoutLength = options.timeout;
        const requestId = Pete.counter();

        requests[requestId] = xhr;
        options.id = requestId;

        // Initialize a callback which will fire x seconds from now, canceling the request
        // if it has not already occurred.
        setTimeout((): void => {
            if (xhr) {
                xhr.abort();
                options.abort();
            }
        }, timeoutLength);

        xhr.onreadystatechange = () => {
            let result;

            if (xhr.readyState === 4) {
                result = httpData(xhr, options);
                this.onComplete(result, options, wasSuccessful(xhr), xhr);

                // Clean up after ourselves to avoid memory leaks.
                xhr = null;
            }
        };

        if (options.type === 'HEAD') {
            xhr.open(options.type, options.url);
        } else {
            xhr.open(options.type, options.url, options.async);
        }

        // Establish the connection to the server.
        if (options.type === 'post') {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send(options.postvars);
        } else {
            xhr.send(null);
        }
    };

    const onComplete = (response: string, request: HttpOptions, success: boolean, xhr: XMLHttpRequest): void => {
        if (success) {
            request.success(response, request, success, xhr);
        } else {
            request.error(response, request, success, xhr);
        }

        request.complete();
        delete requests[request.id];
    };

    const requests = <any>{};

    return {
        /**
         * @function Pete.ajax.get
         * @param {String} url The destination from where to fetch the data.
         * @return {String/XML/JSON}
         * @describe Always performs a GET request and is synchronous. `Pete.Element.ajax` is an alias
         * of this method and should be used when dealing with an `Pete.Element` or `Pete.Composite` object.
         * @example
var oLink = Pete.Element.get('theLink');

var sResponse = oLink.ajax('http://localhost-jslite/sandbox/assert.html');
or
var sResponse = Pete.ajax.get('http://localhost-jslite/sandbox/assert.html');

oLink.tooltip(sResponse);
or
oLink.tooltip(Pete.ajax.get('http://localhost-jslite/sandbox/assert.html'));
         */
        get: (url: string): string => {
            const options = Pete.mixin(Pete.compose(defaults), {
                url: url,
                async: false
            });

            const xhr: XMLHttpRequest = getXHR();

            sendRequest(xhr, options);

            return xhr.responseText;
        },

        getRequests: (): Object => requests,

        /**
         * @function Pete.ajax.load
         * @param {Object} opts An object literal.
         * @return {String/XML/JSON}
         * @describe Used for general-purpose Ajax request. Define callbacks and other customizable
         * features within `opts.
<a href="http://jslite.benjamintoll.com/examples/ajaxFormSubmission.php" rel="external">See an example of an Ajax form submission</a>
         * @example
var x = Pete.ajax.load({
  url: url,
  data: 'html',
  type: 'POST',
  success: function (sResponse) {
    Pete.getDom('myDiv').innerHTML = sResponse.HTMLify();
  }
});
         */
        load: function (opts: HttpOptions): void {
            // Make a clone of defaults so each closure gets its own copy.
            const options = Pete.mixin(Pete.compose(defaults), opts);
            const xhr: XMLHttpRequest = getXHR();

            // TODO: Make all private methods public?
            sendRequest.call(this, xhr, options);

            if (!opts.async) {
                if (wasSuccessful(xhr)) {
                    return httpData(xhr, options);
                }
            }
        },

        // This has to be exposed in case a prototype defines its own API.
        onComplete: onComplete
    };
})());

