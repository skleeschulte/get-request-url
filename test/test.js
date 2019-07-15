const http = require('http');
const https = require('https');
const fs = require('fs');
const assert = require('assert');
const URL = global.URL || require('url').URL;
const getRequestUrl = require('../index');

const HTTP_PORT = 3080;
const HTTPS_PORT = 3443;

/**
 * Make HTTP request.
 *
 * @param {string}  url  Request URL.
 * @returns {Promise<http.IncomingMessage>} HTTP response.
 */
function request(url) {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';

    return new Promise(resolve => {
        if (isHttps) {
            const options = {
                auth: parsedUrl.username + (parsedUrl.password ? ':' + parsedUrl.password : ''),
                hostname: parsedUrl.hostname,
                port: parsedUrl.port,
                path: parsedUrl.pathname + parsedUrl.search,
                ca: fs.readFileSync('test/fixtures/localhost.cert')
            };
            https.get(options, resolve);
        } else {
            http.get(url, resolve);
        }
    });
}

describe('getRequestUrl', function() {
    let httpServer,
        httpsServer;

    before('Start HTTP server', function(done) {
        httpServer = http.createServer((req, res) => res.end());
        httpServer.on('listening', done);
        httpServer.listen(HTTP_PORT);
    });

    before('Start HTTPS server', function(done) {
        const options = {
            key: fs.readFileSync('test/fixtures/localhost.key'),
            cert: fs.readFileSync('test/fixtures/localhost.cert')
        };
        httpsServer = https.createServer(options, (req, res) => res.end());
        httpsServer.on('listening', done);
        httpsServer.listen(HTTPS_PORT);
    });

    const testUrls = [
        `http://localhost:${HTTP_PORT}/`,
        `https://localhost:${HTTPS_PORT}/`,
        `http://localhost:${HTTP_PORT}/path/to/something.ext`,
        `https://localhost:${HTTPS_PORT}/path/to/something.ext`,
        `http://localhost:${HTTP_PORT}/path/to/something.ext?param1=abc&param2=def`,
        `https://localhost:${HTTPS_PORT}/path/to/something.ext?param1=abc&param2=def`,
        `http://username@localhost:${HTTP_PORT}/path/to/something.ext?param1=abc&param2=def`,
        `https://username@localhost:${HTTPS_PORT}/path/to/something.ext?param1=abc&param2=def`,
        `http://username:password@localhost:${HTTP_PORT}/path/to/something.ext?param1=abc&param2=def`,
        `https://username:password@localhost:${HTTPS_PORT}/path/to/something.ext?param1=abc&param2=def`,
    ];

    testUrls.forEach(testUrl => {
        [false, true].forEach(includeAuth => {
            const expectedUrl = new URL(testUrl);

            if (!includeAuth) {
                expectedUrl.username = '';
                expectedUrl.password = '';
            }

            const expectedUrlString = expectedUrl.toString();
            const description = `should return ${expectedUrlString} when requesting ${testUrl}`
                + ` (includeAuth=${includeAuth})`;

            it(description, function(done) {
                request(testUrl).then(res => {
                    const requestUrl = getRequestUrl(res, includeAuth);
                    assert.strictEqual(requestUrl.toString(), expectedUrlString);
                    done();
                });
            });
        });
    });

    after('Stop HTTP server', function(done) {
        httpServer.on('close', done);
        httpServer.close();
    });

    after('Stop HTTPS server', function(done) {
        httpsServer.on('close', done);
        httpsServer.close();
    });
});
