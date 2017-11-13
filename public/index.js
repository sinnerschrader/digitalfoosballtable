main();

async function main() {
  const body = document.body;
  const game = await getGame();
  const source = new EventSource('/events');
  const button = document.querySelector('[data-game-button]');
  const input = document.querySelector('[data-game-running]');

  button.addEventListener('click', (e) => {
    e.preventDefault();
    setGame(game, input.value === 'true');
  });

  window.addEventListener('keydown', async (e) => {
    if (!e.ctrlKey) {
      return;
    }

    switch(e.key) {
      case 'n':
        return setGame(game, true);
      case 's':
        return setGame(game, false);
      case 'r': {
        await setGame(game, false)
        setGame(game, true);
      }
    }
  });

  source.addEventListener('start', async (e) => {
    render(await getGame());
  });

  source.addEventListener('stop', async (e) => {
    render(await getGame());
  });

  source.addEventListener('heartbeat', (e) => {
    const beat = JSON.parse(e.data);
    renderClock(beat);
  });

  source.addEventListener('goal', async (e) => {
    render(await getGame());
  });

  source.addEventListener('win', async (e) => {
    render(await getGame());
  });

  render(game);

  const params = new URLSearchParams(window.location.search);

  if (params.get('debug') === 'digitalfoosballtable') {
    debug(game);
  }
}

function render(game) {
  const team1 = document.querySelector('[data-score="team1"]');
  const team2 = document.querySelector('[data-score="team2"]');
  const button = document.querySelector('[data-game-button]');
  const input = document.querySelector('[data-game-running]');

  team1.textContent = game.team1Score;
  team2.textContent = game.team2Score;

  if (game.teamWin) {
    document.body.classList.add(`${game.teamWin}-won`);
  } else {
    document.body.classList.remove(`team1-won`, `team2-won`);
  }

  if (game.running) {
    button.textContent = 'Stop [ctrl+s]';
  } else {
    button.textContent = 'Start [ctrl+n]';
  }

  input.value = !game.running;

  renderClock({
    startTime: game.startTime,
    running: game.running
  });
}

function renderClock(data) {
  const clock = document.querySelector('[data-game-clock]');

  if (data.running) {
    clock.textContent = time((Date.now() - data.startTime) / 1000);
  } else {
    clock.textContent = '00:00:00';
  }
}

function score(team) {
  fetch('/score', {
    method: 'POST',
    body: JSON.stringify({team}),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

async function setGame(game, running) {
  const response = await fetch('/game', {
    method: 'POST',
    body: JSON.stringify({running}),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  game.running = data.running;
  game.endTime = data.endTime;
  game.team1Score = data.team1Score;
  game.team2Score = data.team2Score;
  game.teamWin = data.teamWin;
  game.startTime = data.startTime;
  return data;
}

async function getGame() {
  const response = await fetch('/game');
  return response.json();
}

function debug(game) {
  const script = document.createElement('script');
  script.src = 'dat.gui.js';

  script.addEventListener('load', () => {
    const ctrl = {
      startGame() {
        setGame(game, true);
      },
      stopGame() {
        setGame(game, false);
      },
      scoreOne() {
        score('team1');
      },
      scoreTwo() {
        score('team2');
      },
      scoreBounce() {
        score('team1');
        setTimeout(() => {
          score('team1');
        }, 500);
      }
    };

    const gui = new dat.GUI();
    gui.add(ctrl, 'startGame');
    gui.add(ctrl, 'stopGame');
    gui.add(ctrl, 'scoreOne');
    gui.add(ctrl, 'scoreTwo');
    gui.add(ctrl, 'scoreBounce');
  });

  document.body.appendChild(script);
}

function time(sec) {
  const hours   = Math.floor(sec / 3600);
  const minutes = Math.floor((sec - (hours * 3600)) / 60);
  const seconds = sec - (hours * 3600) - (minutes * 60);

  return [hours, minutes, seconds]
    .map(u => Math.round(u))
    .map(u => u < 10 ? `0${u}` : String(u))
    .join(':')
}
