var crypto = require("crypto");

/*
 * JSONCookieEncoder is the default encoder for CookieSessions and stores 
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
    
    this.encode = function(sessionData) {
        var jsonData = JSON.stringify(sessionData);
        var cipher = crypto.createCipher("aes192", this.secret);
        return cipher.update(jsonData, 'utf8', 'hex') + cipher.final('hex');
    };
    
    this.valid = function(cookieData) {
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
        var decipher = crypto.createDecipher("aes192", this.secret);
        return decipher.update(cookieData, 'hex', 'utf8') + decipher.final('utf8');
    };
};

module.exports = JSONCookieEncoder;