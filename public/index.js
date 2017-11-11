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
    showScore(data.team1Score, data.team2Score, data.teamWin);
  })
}

function showScore(team1Score, team2Score, teamWin) {
  const team1 = document.querySelector('[data-score="team1"]');
  const team2 = document.querySelector('[data-score="team2"]');

  if(team1Score !== undefined || team2Score !== undefined){
    team1.textContent = team1Score;
    team2.textContent = team2Score;
  }

  if(teamWin.length){
    document.body.classList.add(teamWin);
  }

  console.log('score ' + team1Score + ' white ' + team2Score);
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

main();
