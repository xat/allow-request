## allow-request

With allow-request you can build a whitelist of routes which you want to allow. This
can be handy if your building an HTTP proxy and only want to allow certain routes
on the target machine to get called.

### Installation

```
npm install allow-request
```

### Sample

```javascript

var allowRequest = require('allow-request'),
    http = require('http'),
    whitelist = allowRequest();

// Allow GET requests to /blog
whitelist.get('/blog');

// Allow POST requests to /blob/comment
whitelist.post('/blog/comment');

// Allow GET requests to the Users 3, 7 and 8
// Notice that you are able to use any routes that you would
// also be able to use in express (including RegEX) since
// we are using the same route-to-regex converter.
whitelist.get('/user/:id', function(id, pathname, req, pass) {
    // Handing 'true' in as first parameter to 'pass' says
    // that the route is allow.
    pass([3, 7, 8].indexOf(id) !== -1);
});

var proxy = http.createServer(function (req, res) {

    // This will check if the request is permitted.
    whitelist.check(req, function(allowed) {

        if (allowed) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('you are allowed to pass');
        } else {
            res.writeHead(403, {'Content-Type': 'text/plain'});
            res.end('you do not have permissions to access this resource');
        }

    });

});

proxy.listen(5000);

```