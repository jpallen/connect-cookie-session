var connect       = require("connect"),
    cookieSession = require("connect-cookie-session");

connect(
    connect.cookieParser(), // cookieSession needs cookieParser
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
