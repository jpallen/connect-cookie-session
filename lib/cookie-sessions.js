var Cookie = require("connect/lib/middleware/session/cookie"),
    JSONCookieEncoder = require("./encoders/json");
    
var CookieSessions = function(options) {
    options = (options || {});
    var key     = options.key || 'connect.sid',
        cookie  = new Cookie(options.cookie),
        cookieEncoder = options.cookieEncoder || new JSONCookieEncoder({
            secret : options.secret
        });

    return function(req, res, next) {
        if (req.session) return next();
    
        // Proxy writeHead so that we can set the cookie header
        var writeHead = res.writeHead;
        res.writeHead = function(status, headers){
            if (req.session) {
                // only send secure session cookies when there is a secure connection.
                // proxySecure is a custom attribute to allow for a reverse proxy
                // to handle SSL connections and to communicate to connect over HTTP that
                // the incoming connection is secure.
                var secured = cookie.secure && (req.connection.encrypted || req.connection.proxySecure);
                if (secured || !cookie.secure) {
                    var sessionID = cookieEncoder.encode(req.session);
                    res.setHeader('Set-Cookie', cookie.serialize(key, sessionID));
                }
            }
    
            res.writeHead = writeHead;
            return res.writeHead(status, headers);
        };
        
        // get the sessionID from the cookie
        req.sessionID = req.cookies[key];
        
        function newSession(data) {
            data = (data || {});
            req.session = data;
        }
        
        // The session information is encoded in the cookie data which is now
        // req.sessionID
        if (!req.sessionID || !cookieEncoder.valid(req.sessionID)) {
            newSession();
            next();
            return;
        }
        
        newSession(cookieEncoder.decode(req.sessionID));
        
        next();
    };
};

module.exports = CookieSessions;
module.exports.JSONCookieEncoder = JSONCookieEncoder;