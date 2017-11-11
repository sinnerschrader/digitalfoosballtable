const {createServer} = require('http');
const bodyParser = require('body-parser');
const {EventEmitter} = require('events');
const express = require('express');
const sse = require('sse-express');
const getGpio = require('./get-gpio');

const gpio = getGpio({fallback: true});

const team1Pin = 3; // GPIO03 3 from raspberry
const team2Pin = 5; // GPIO02 5 from raspberry
const team1 = 'black';
const team2 = 'white';

module.exports = server;

function server(options = {}) {
  return new Promise((resolve) => {
    const game = new Game();
    const server = createServer();

    let black = 0;
    let white = 0;

    gpio.setup(team1Pin, gpio.DIR_IN, gpio.EDGE_FALLING);
    gpio.setup(team2Pin, gpio.DIR_IN, gpio.EDGE_FALLING);

    gpio.on('change', function(channel, value) {
      if(channel === team1Pin) { white++; game.countGoal(team1);}
      else if(channel === team2Pin) { black++; game.countGoal(team2);}
      console.log('black ' + black + ' : white ' + white);
    });

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
    game.on('goal', (e) => send('goal', e));
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
    this.blackScore = 0;
    this.whiteScore = 0;
  }

  countGoal(team) {
    if (team === 'black') {
      this.blackScore += 1;
    }
    if (team === 'white') {
      this.whiteScore += 1;
    }
    this.emit('goal', this);
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
      startTime: this.startTime,
      blackScore: this.blackScore,
      whiteScore: this.whiteScore
    };
  }
}
