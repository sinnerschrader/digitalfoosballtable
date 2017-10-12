import {EventEmitter} from 'events';
import * as express from 'express';

export default (game: EventEmitter) => {
  return (req: express.Request, res: express.Response) => {
    const send = (res as any).sse;

    // Demonstrates SSE usage on server (instead of websockets)
    game.on('progress', (e: any) => {
      send('progress', e);
    });
  };
}
