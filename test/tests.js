var expect = require('expect.js');
var allowRequest = require('../allow-request');


var expecter = function(expectedVal) {
    return function(passed) {
        expect(passed).to.equal(expectedVal);
    }
};

describe('allow-request', function() {

   it('should allow or deny the request based on the path', function() {

       var checker = allowRequest()
           .get('/user/:id')
           .put('/:ns/*', function(pass, req, pathname, ns) {
              pass(true);
           })
           .post('/')
           .route('put', '/posts')
           .get('/backend/:id', function(pass, req, pathname, id) {
               pass(true);
           });

       checker.check({ url: '/user/1', method: 'get' }, expecter(true));
       checker.check({ url: '/user/1?x=y', method: 'get' }, expecter(true));
       checker.check({ url: '/user/1/whatever', method: 'get' }, expecter(false));
       checker.check({ url: '/user', method: 'get' }, expecter(false));
       checker.check({ url: '/', method: 'post' }, expecter(true));
       checker.check({ url: '/posts', method: 'put' }, expecter(true));
       checker.check({ url: '/backend/2', method: 'get' }, expecter(true));
       checker.check({ url: '/cto/blubb', method: 'put' }, expecter(true));

   });

});