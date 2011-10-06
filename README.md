Cookie Sessions
===============

A [Connect](http://github.com/senchalabs/connect) middleware to allow you to store 
your sessions directly in the client's cookie.

Installation
------------

To install the latest released version:

    npm install connect-cookie-session

Usage
-----

Once you have put cookieSession in your list of middleware, you can access the session
data via request.session. Any data stored here will be available to all future requests.

    var connect       = require("connect"),
        cookieSession = require("connect-cookie-session");
    
    connect(
        connect.cookieParser(), // cookieSessions needs cookieParser
        cookieSession({
            // You should use your own secret key (and keep it secret!)
            secret : "d3b07384d113edec49eaa6238ad5ff00"
        }),
        function(req, res) {
            var accessCount = (req.session.accessCount || 0);
            req.session.accessCount = accessCount + 1;
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('You have accessed this site ' + accessCount + ' times');
        }
    ).listen(8080);

How it works
------------

A cookie is a small piece of data that can be stored on the client's machine and
passed back to the server with each request. Any data stored there on one request
is available to subsequent requests. 

The session middleware which comes bundled with Connect stores an id in the cookie
which is then used by the server to lookup the session data from memory or some 
other server backend. This library instead allows you to store the session data 
directly in the cookie without the need for storing session on the server.

Configuration
-------------

cookieSession accepts the following options:

* _secret_ - The secret key used to protect the session from tampering. 
* _key_    - The key to store the cookie under. Defaults to 'connect.sid'.
* _cookie_ - Options for the cookie, which can include _maxAge_, _httpOnly_, 
  _path_, _domain_ and _secure_.
* _cookieEncoder_ - A custom encoder for converting the session data to a cookie
  and back again. If a custom encoder is used, _secret_ will be ignored.
  It is up to you how to handle security for your custom encoder.

Example:

    cookieSession({
        secret : "d3b07384d113edec49eaa6238ad5ff00",
        key    : "wonder_app_key",
        // cookie maxAge defaults to 14400000, path defaults to '/' and
        // httpOnly defaults to true.
        cookie : {
            secure : true,
            domain : 'blog.example.com'
        }
    })

Default Cookie Encoder
----------------------

The default encoder stores the session data in the cookie as JSON encoded in Base64.
This is then encrypted and hashed using the secret key. The hash is appended
to the cookie and used to check that the cookie has not been tampered with.

Keep in mind that cookies can only store 4k of data.

*Security*: Note that the contents of the cookie are stored plainly in Base64
and can be accessed by the user. You should not store secret information in the 
session when using the default cookie encoder. I implemented it this way as it
is the same way Rails does things. If there is demand or I need it, I may implement
an additional cookie encoder where all the cookie data is encrypted. A patch
that does this is welcome.

Custom Cookie Encoder
---------------------

You can easily implement you own way of encoding the session data in the cookie
by providing a custom encoder. Your encoder must supply the following methods:

    encode(sessionData) - turn a javascript object into a string which can be
                          stored in the cookie.
    decode(cookieData)  - turn the cookie string back into a javascript object.
                          This is then set as the session.
    valid(cookieData)   - Test whether the cookie string can be decoded. If the 
                          cookie is corrupt or has been tampered with this
                          should return false. If it returns true then 
                          decode() must be able to return a valid session.

See lib/encoders/json.js for the default implemention.

Version History
---------------

**0.0.2**
Bugfix: maxAge was not being updated correctly. https://github.com/jpallen/connect-cookie-session/pull/2

**0.0.1**
Initial Release
