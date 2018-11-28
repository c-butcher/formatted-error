const FormattedError = (function(){
    /**
     * Removes the brackets around placeholders, and then separates the placeholders
     * so they become breadcrumbs leading to the value in a multi-dimensional array.
     *
     * @example
     *      When placeholder is   {user.address.street}
     *      Remove the brackets:  user.address.street
     *      Split by periods:     ['user', 'address', 'street']
     *
     * @param value
     * @returns {string[]}
     */
    function stripBracketsAndSeparateByPeriods(value) {
        return value.substr(1, value.length - 2).split('.');
    }

    /**
     * Searches through the parameters using the breadcrumbs as a path to the
     * value that we're looking for. So a breadcrumb of ['user', 'name'] would
     * look for a value at params['user']['name'].
     *
     * @example
     *      When breadcrumbs is ['user', 'name']
     *      Then find value at params['user']['name']
     *
     * @param {string[]} breadcrumbs
     * @param {object} params
     *
     * @returns {*}
     */
    function searchForParam(breadcrumbs, params) {
        if (!Array.isArray(breadcrumbs) || breadcrumbs.length < 1)
            return;

        let result = null;
        let crumbs = breadcrumbs.slice();
        let crumb  = crumbs.shift();

        // When the crumbs value is an array
        if (Array.isArray(params[crumb]))

        // Then we'll want to check to see if it's join-able (all primitives)
        // This will convert arrays of primitives into a string
            if (params[crumb].isJoinable())
                result = params[crumb].join(', ');

            // Otherwise, if the value is an actual array of key-value pairs,
            // then we can use it as another layer of data that we can search.
            else
                result = searchForParam(crumbs, params[crumb]);

        // When the crumbs value is an object, then we know that we can use it
        // as another layer of data that we can search.
        else if (typeof params[crumb] === 'object')
            result = searchForParam(crumbs, params[crumb]);

        else if (typeof params[crumb] === 'function')
            result = null;

        // We've finally whittled our object down to a primitive value!
        else result = params[crumb];

        return result;
    }

    /**
     * An array function that helps us tell whether an array can be joined together.
     * This is only possible if the values contain primitives.
     */
    if (!Array.prototype.isJoinable) {
        Array.prototype.isJoinable = function(){
            let primitives = this.filter(val => {
                return typeof val !== 'object'
            });

            return primitives.length === this.length;
        };
    }

    return class extends Error {
        /**
         * Formatted errors looks for placeholders in the error message, and then attempts to replace them
         * with the values supplied in the parameters.
         *
         * @param {string} message
         * @param {object} params
         */
        constructor(message, params = {}) {
            super();

            this.params = params;
            this.original = message;
            this.message = this.format(message, params);
        }

        /**
         * Format a message by replacing its placeholders with the values supplied in parameters.
         *
         * @param {string} message
         * @param {object} params
         *
         * @returns {string}
         */
        format(message, params) {
            if (typeof message !== 'string') {
                throw new Error("Argument 'message' must be an string.");
            }

            if (typeof params !== 'object') {
                throw new Error("Argument 'params' must be an object.");
            }

            let breadcrumbs = message
                .match(/\{(.*?)\}/g)
                .map(stripBracketsAndSeparateByPeriods);

            for (let crumb in breadcrumbs) {
                let param = searchForParam(breadcrumbs[crumb], params);
                if (param)
                    message = message.replace(`{${breadcrumbs[crumb].join('.')}}`, param);
            }

            return message;
        }
    }
})();

module.exports = FormattedError;