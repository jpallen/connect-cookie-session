var crypto = require("crypto");

/*
 * JSONCookieEncoder is the default encoder for cookieSession and stores 
 * session data as JSON. This obviously limits your sessions to only being
 * able to store data which can be turned into JSON with JSON.stringify.
 *
 * You must provide a secret key. This is used to encrypt the JSON data. E.g.
 *   new JSONCookieEncoder({
 *       // DO NOT copy and paste this. Set your own key and keep it secret!
 *       secret : "KrEi2Ck0EiFmYTDfoIvcGUkKov8AOj3bvZEKEcaC81u55BGbTkZICoxuMRkR6a9"
 *   })
*/
var JSONCookieEncoder = function(options) {
    this.secret = options.secret;
        
    if (!this.secret) {
        throw new Error('Options to cookie encoder must include { secret: "string" } for security');
    }
    
    this.sign = function(data) {
        var hmac = crypto.createHmac('sha1', this.secret);
        hmac.update(data);
        return hmac.digest('hex');
    };
    
    this.encode = function(sessionData) {
        var jsonData = JSON.stringify(sessionData);
        var base64Data = new Buffer(jsonData).toString("base64");
        return base64Data + '--' + this.sign(base64Data);
    };
    
    this.valid = function(cookieData) {
        var data      = cookieData.split('--')[0];
        var signature = cookieData.split('--')[1];
        if (signature != this.sign(data)) {
            return false;
        }
        
        try {
            JSON.parse(this.decodeToJSON(cookieData));
            return true;
        } catch(err) {
            return false;
        }
    };
    
    this.decode = function(cookieData) {
        return JSON.parse(this.decodeToJSON(cookieData));
    };
    
    this.decodeToJSON = function(cookieData) {
        var data = cookieData.split('--')[0];
        return new Buffer(data, "base64").toString();
    };
};

module.exports = JSONCookieEncoder;
