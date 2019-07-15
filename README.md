# get-request-url
Function to extract the request URL from a Node.js HTTP response (http.IncomingMessage).

    npm install get-request-url

Compatible with Node.js version 6.13.0 and higher.

Example:

    const https = require('https');
    const getRequestUrl = require('get-request-url');
    
    https.get('https://www.github.com/', res => {
        const requestUrl = getRequestUrl(res);
        
        console.log(requestUrl.toString());
        // Output: https://www.github.com/
    });

By default, `getRequestUrl()` does not add username and password to the request url. this
can be changed by providing `true` as second parameter:

    const http = require('http');
    const getRequestUrl = require('get-request-url');
    
    https.get('http://user:pass@localhost:3000/path/to/abc.xyz', res => {
        const requestUrl = getRequestUrl(res);
        const requestUrlWithAuth = getRequestUrl(res, true);
        
        console.log(requestUrl.toString());
        // Output: http://localhost:3000/path/to/abc.xyz
        
        console.log(requestUrlWithAuth.toString());
        // Output: http://user:pass@localhost:3000/path/to/abc.xyz
    });