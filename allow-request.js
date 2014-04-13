var methods = require('methods'),
    parse = require('url').parse,
    pathToRegexp = require('path-to-regexp');

var AllowRequest = function() {
    if (!(this instanceof AllowRequest)) {
        return new AllowRequest;
    }

    var register,
        run,
        execFilter,
        filters = [],
        obj = {};

    // Register a new filter
    register = function(method, route, fn) {
        method = method.toLowerCase();
        filters.push({
            method: method,
            route: pathToRegexp(route),
            fn: fn
        });

        return obj;
    };

    // Execute a single filter
    execFilter = function(filter, req, pathname, done) {
        var args;

        if (filter.method && filter.method !== req.method) return done(false);
        if (!(args = filter.route.exec(pathname))) return done(false);
        if (typeof filter.fn !== 'function') return done(true);

        args = args.slice(1);
        args.push(pathname, req, done);
        filter.fn.apply(filter.fn, args);
    };

    // Take an request and perform
    // all filters on it. As soon one
    // of those filters accept the input
    // invoke 'fn' with 'true', otherwise with 'false'
    run = function(req, fn) {
        var done,
            pathname = parse(req.url).pathname,
            len = filters.length,
            c = 0;

        fn = fn || noop;

        done = function(passed) {
            if (passed) return fn(true);
            if (++c < len) {
                return execFilter(filters[c], req, pathname, done);
            }
            fn(false);
        };

        execFilter(filters[c], req, pathname, done);
    };

    // build methods with the HTTP verbs.
    for (var i = 0, len = methods.length; i < len; i++) {
        (function(method) {
            obj[method] = function(route, fn) {
                return register(method, route, fn);
            };
        })(methods[i]);
    }

    // perform on any route
    obj.any = function(route, fn) {
        return register(null, route, fn);
    };

    obj.route = register;
    obj.del = obj['delete'];
    obj.check = run;

    return obj;
};

var noop = function() {};

module.exports = AllowRequest;