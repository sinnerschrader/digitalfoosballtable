async function main() {
  const body = document.body;
  const game = await getGame();
  const source = new EventSource('/events');

  const clockElement = document.querySelector('[data-clock]')

  body.addEventListener('click', () => {
    setGame(game, !game.running);
  });

  source.addEventListener('start', (e) => {
    const data = JSON.parse(e.data);
    startClock(clockElement, data.startTime);
  });

  source.addEventListener('stop', (e) => {
    const data = JSON.parse(e.data);
    stopClock(clockElement, data.endTime);
  });
}

function startClock(element, stamp) {
  console.log('start');
}

function stopClock(element, stamp) {
  console.log('stop');
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
  game.startTime = data.startTime;
  return data;
}

async function getGame() {
  const response = await fetch('/game');
  return response.json();
}

main();
