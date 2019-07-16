const URL = global.URL || require('url').URL;

/**
 * RFC3986 compliant encodeURIComponent function.
 * Source: https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
 *
 * @param {string}  string  String to encode.
 * @returns {string} Encoded string.
 */
function encodeURIComponentRFC3986(string) {
    return encodeURIComponent(string).replace(/[!'()*]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16);
    });
}

/**
 * Get request URL from HTTP response. The hash portion of a request URL is not sent to the server and will not be
 * included in the result of this function.
 *
 * @param {http.IncomingMessage}  res            HTTP response.
 * @param {boolean}               [includeAuth]  Whether to include authorization information in the URL.
 * @returns {URL} The request URL.
 */
function getRequestUrl(res, includeAuth) {
    let url = '';

    // protocol (res.req.agent.protocol is an undocumented feature)
    url += res.req.agent.protocol + '//';

    // authorization data
    const authorizationHeader = res.req.getHeader('Authorization');
    if (includeAuth && authorizationHeader) {
        const [scheme, param] = authorizationHeader.split(/\s+/);

        if (scheme.toLowerCase() === 'basic') {
            const decoded = Buffer.from(param, 'base64').toString();
            const colonPos = decoded.indexOf(':');

            username = (colonPos !== -1) ? decoded.substr(0, colonPos) : decoded;
            password = (colonPos !== -1) ? decoded.substr(colonPos + 1) : false;

            url += encodeURIComponentRFC3986(username);
            url += password ? ':' + encodeURIComponentRFC3986(password) : '';
            url += '@';
        }
    }

    // hostname and port
    url += res.req.getHeader('Host');

    // path
    url += res.req.path;

    return new URL(url);
}

module.exports = getRequestUrl;
