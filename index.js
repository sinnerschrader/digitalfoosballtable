const {createServer} = require('http');
const bodyParser = require('body-parser');
const {EventEmitter} = require('events');
const browserify = require('browserify');
const express = require('express');
const resolveFrom = require('resolve-from');
const sse = require('sse-express');
const getGpio = require('./get-gpio');

const gpio = getGpio({fallback: true});

const TEAM_ONE_PIN = 5;
const TEAM_TWO_PIN = 3;
const TEAM_ONE = 'team1';
const TEAM_TWO = 'team2';

module.exports = server;

function server(options = {}) {
  return new Promise((resolve) => {
    const game = new Game();
    const server = createServer();

    gpio.setup(TEAM_ONE_PIN, gpio.DIR_IN, gpio.EDGE_FALLING);
    gpio.setup(TEAM_TWO_PIN, gpio.DIR_IN, gpio.EDGE_FALLING);

    gpio.on('change', function(channel, value) {
      if (channel === TEAM_ONE_PIN) {
        game.countScore(TEAM_ONE);
      }
      if (channel === TEAM_TWO_PIN) {
        game.countScore(TEAM_TWO);
      }
    });

    const app = express()
      .disable('x-powered-by')
      .use(express.static(options.public))
      .use(bodyParser.json())
      .get('/events', sse, events(game))
      .get('/game', getGame(game))
      .get('/dat.gui.js', getModule('dat-gui', {standalone: 'dat'}))
      .post('/game', setGame(game));

    if (process.env.NODE_DEBUG === 'digitalfoosballtable') {
      app.post('/score', (req, res) => {
        res.sendStatus(200);
        game.countScore(req.body.team);
      });
    }

    server.on('request', app);

    server.listen(options.port, () => resolve({app, port: options.port}));
  });
}

function bundle(id, options) {
  return new Promise((resolve, reject) => {
    const b = browserify(id, options);
    b.bundle((err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
}

function events(game) {
  return (req, res) => {
    const send = res.sse;
    const onStart = (e) => send('start', e);
    const onStop = (e) => send('stop', e);
    const onGoal = (e) => send('goal', e);
    const onWin = (e) => send('win', e);

    game.on('start', onStart);
    game.on('stop', onStop);
    game.on('goal', onGoal);
    game.on('win', onWin);

    const beating = setInterval(() => {
      send('heartbeat', {running: game.running, startTime: game.startTime});
    }, 1000);

    req.on('close', function() {
      game.removeListener('start', onStart);
      game.removeListener('stop', onStop);
      game.removeListener('goal', onGoal);
      game.removeListener('win', onWin);
      clearInterval(beating);
    });

    req.on('end', function() {
      game.removeListener('start', onStart);
      game.removeListener('stop', onStop);
      game.removeListener('goal', onGoal);
      game.removeListener('win', onWin);
      clearInterval(beating);
    });
  };
}

function getGame(game) {
  return (req, res) => {
    return res.json(game);
  };
}

function getModule(id, options) {
  const bundling = bundle(resolveFrom(process.cwd(), id), options);
  return async (req, res, next) => {
    try {
      const bundle = await bundling;
      res.type('js');
      res.send(bundle);
    } catch (err) {
      next(err);
    }
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
    this.team1Score = 0;
    this.team2Score = 0;
    this.teamWin = '';
  }

  countScore(team) {
    if (!this.running) {
      return;
    }

    if (typeof this.lastScoreTime === 'number' && Date.now() - this.lastScoreTime < 2000) {
      return;
    }

    this.lastScoreTime = Date.now();

    if (team === TEAM_ONE) {
      this.team1Score = Math.min(this.team1Score + 1, 6);
    }

    if (team === TEAM_TWO) {
      this.team2Score = Math.min(this.team2Score + 1, 6);
    }

    if (this.team1Score === 6){
      this.teamWin = TEAM_ONE;
    }

    if (this.team2Score === 6) {
      this.teamWin = TEAM_TWO;
    }

    if (this.teamWin) {
      this.running = false;
      this.emit('win', this);
    }

    this.emit('goal', this);
  }

  start() {
    this.endTime = null;
    this.startTime = Date.now();
    this.running = true;
    this.emit('start', this);
    this.team1Score = 0;
    this.team2Score = 0;
    this.teamWin = '';
    this.lastScoreTime = null;
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
      team1Score: this.team1Score,
      team2Score: this.team2Score,
      teamWin: this.teamWin
    };
  }
}
