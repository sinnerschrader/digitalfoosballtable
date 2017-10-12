import * as express from 'express';
import {EventEmitter} from 'events';
import { mainRoute, gameRoute } from './routes';
import { getEnv } from './util/get-env';

const sseExpress = require('sse-express');
const PUBLIC_DIR = getEnv('RAZZLE_PUBLIC_DIR');

const server = express();
const start = Date.now();
const game = new EventEmitter();

setInterval(() => {
  game.emit('progress', Date.now() - start);
}, 1000);

server
  .disable('x-powered-by')
  .use(express.static(PUBLIC_DIR))
  .get('/', mainRoute())
  .get('/game', sseExpress, gameRoute(game));

export default server;
