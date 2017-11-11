const {createServer} = require('http');
const bodyParser = require('body-parser');
const {EventEmitter} = require('events');
const express = require('express');
const sse = require('sse-express');
const gpio = require('rpi-gpio');

module.exports = server;

function server(options = {}) {
  return new Promise((resolve) => {
    const game = new Game();
    const server = createServer();

    const app = express()
      .disable('x-powered-by')
      .use(express.static(options.public))
      .use(bodyParser.json())
      .get('/events', sse, events(game))
      .get('/game', getGame(game))
      .post('/game', setGame(game));

    server.on('request', app);

    server.listen(options.port, () => resolve({app, port: options.port}));
  });
}

function events(game) {
  return (req, res) => {
    const send = res.sse;
    game.on('progress', (e) => send('progress', e));
    game.on('start', (e) => send('start', e));
    game.on('stop', (e) => send('stop', e));
  };
}

function getGame(game) {
  return (req, res) => {
    return res.json(game);
  };
}

function setGame(game) {
  return (req, res) => {
    if (typeof req.body.running !== 'boolean') {
      return res.sendStatus(422);
    }

    if (req.body.running === true && !game.running) {
      game.start();
    }

    if (req.body.running === false && game.running) {
      game.stop();
    }

    return res.json(game);
  };
}

class Game extends EventEmitter {
  constructor() {
    super();
    this.startTime = null;
    this.endTime = null;
    this.running = false;
  }

  start() {
    this.endTime = null;
    this.startTime = Date.now();
    this.running = true;
    this.emit('start', this);
  }

  stop() {
    this.endTime = Date.now();
    this.running = false;
    this.emit('stop', this);
  }

  toJSON() {
    return {
      running: this.running,
      endTime: this.endTime,
      startTime: this.startTime
    };
  }
}

let teamBlackPin = 3;
let teamWhitePin = 5;

let teamBlackScore = 0;
let teamWhiteScore = 0;

gpio.setup(teamBlackPin, gpio.DIR_IN, gpio.EDGE_FALLING);
gpio.setup(teamWhitePin, gpio.DIR_IN, gpio.EDGE_FALLING);

gpio.on('change', function(channel, value) {
  if(teamWhitePin === 5) { teamWhiteScore++;}
  else if(teamBlackPin === 3) { teamBlackScore++;}
   console.log('Black = ' + teamWhiteScore + ' : White = ' + teamBlackScore);
});
