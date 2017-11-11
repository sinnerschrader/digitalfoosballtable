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

  source.addEventListener('goal', (e) => {
    const data = JSON.parse(e.data);
    showScore(data.blackScore, data.whiteScore);
  })
}

function showScore(blackScore, whiteScore) {
  const team1 = document.querySelector('[data-score="team1"]');
  const team2 = document.querySelector('[data-score="team2"]');

  console.log('score ' + blackScore + ' white ' + whiteScore);
}

function startClock(element, stamp) {
  console.log('start');
}

function stopClock(element, stamp) {
  console.log('stop');
}


showScore();

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
  game.blackScore = data.blackScore;
  game.whiteScore = data.whiteScore;
  game.startTime = data.startTime;
  return data;
}

async function getGame() {
  const response = await fetch('/game');
  return response.json();
}

main();
