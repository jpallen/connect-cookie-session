Cookie Sessions
===============

A [Connect](http://github.com/senchalabs/connect) middleware to allow you to store 
your sessions directly in the client's cookie.

Session data is made available through the request.session property.

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

Configuration
-------------

cookieSession accepts the following options:

* _secret_ - The secret key used to protect the session from tampering. 
* _key_    - The key to store the cookie under. Defaults to 'connect.sid'.
* _cookie_ - Options for the cookie, which can include _maxAge_, _httpOnly_, 
  _path_, _domain_ and _secure_.
* _cookieEncoder_ - A custom encoder to converting the session data to a cookie
  string and back again. If a custom encoder is used, _secret_ will be ignored.
  It is up to you to configure the secret key for your encoder if you want one
  (and you should!)

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

Session Storage
---------------

All session data is encoded in the cookie and passed back to the client at the
end of a request. On the next request from the client, the cookie is returned 
and is decoded to restore the session state.

By deafult, Cookie Sessions encodes the sessions data as JSON and encrypts it 
using AES-192 using the secret key that you supply. This should prevent the
end user from being able to modify their cookie.

Cookies can only store 4k of data so the amount of data you can store in your
session is limited by this.

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
