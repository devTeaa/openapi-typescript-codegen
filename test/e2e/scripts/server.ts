import express, { Express } from 'express';
import { Server } from 'http';

let _app: Express;
let _server: Server;

const start = async (dir: string) => {
    return new Promise<void>(resolve => {
        _app = express();

        // Serve the JavaScript files from the specific folder, since we are using browser
        // based ES6 modules, this also means that we can just request the js/index.js file
        // and all other relative paths are resolved from that file.
        _app.use(
            '/js',
            express.static(`./test/e2e/generated/${dir}/`, {
                extensions: ['', 'js'],
                index: 'index.js',
            })
        );

        // When we request the index then we can just return the script loader.
        // This file is copied from test/e2e/assets/script.js to the output directory
        // of the specific version and client.
        _app.get('/', (req, res) => {
            res.send('<script src="js/script.js"></script>');
        });

        // Register an 'echo' server for testing error codes. This will just grab the
        // status code from the query and return the default response (and text) from Express.
        // See the spec files for more information.
        _app.all('/base/api/v1.0/error', (req, res) => {
            const status = parseInt(String(req.query.status));
            res.sendStatus(status);
        });

        // Register an 'echo' server that just returns all data from the API calls.
        // Although this might not be a 'correct' response, we can use this to test
        // the majority of API calls.
        _app.all('/base/api/v1.0/*', (req, res) => {
            setTimeout(() => {
                res.json({
                    method: req.method,
                    protocol: req.protocol,
                    hostname: req.hostname,
                    path: req.path,
                    url: req.url,
                    query: req.query,
                    body: req.body,
                    headers: req.headers,
                });
            }, 100);
        });
        _server = _app.listen(3000, resolve);
    });
};

const stop = async () => {
    return new Promise<void>((resolve, reject) => {
        _server.close(err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

export default {
    start,
    stop,
};
