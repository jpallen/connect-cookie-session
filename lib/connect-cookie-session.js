var Cookie = require("connect").middleware.session.Cookie,
    JSONCookieEncoder = require("./encoders/json");
    
var cookieSession = function(options) {
    options = (options || {});
    var key     = options.key || 'connect.sid',
        cookieEncoder = options.cookieEncoder || new JSONCookieEncoder({
            secret : options.secret
        });

    return function(req, res, next) {
        // Allocate the cookie object here, because at allocation time
        // maxAge will be set.  Allocate in the outer scope and you'll
        // maxAge will be stuck at middleware allocation time.
        var cookie  = new Cookie(options.cookie);

        if (req.session) return next();
    
        // Proxy writeHead so that we can set the cookie header
        // (copied from connect/middleware/session)
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
        
        // We set req.sessionID to the raw contents of the cookie.
        // This is to be compatible with the normal connect middleware where
        // the raw contents of the cookie would be the id to look up in the
        // session store. Some libraries assume req.sessionID is present.
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

module.exports = cookieSession;
module.exports.JSONCookieEncoder = JSONCookieEncoder;
