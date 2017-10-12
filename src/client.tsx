import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './app/App';

const render = (Comp: any, data?: any) => {
  ReactDOM.hydrate(<Comp data={data}/>, document.getElementById('root'));
};

const update = (Comp: any, data?: any) => {
  console.log(data);
  ReactDOM.render(<Comp data={data}/>, document.getElementById('root'));
};

declare global {
  interface Window {
    EventSource: any;
  }
}

const listen = () => {
  const eventSource = new window.EventSource('/game');

  // Demonstrates SSE usage on client (instead of websockets)
  eventSource.addEventListener('progress', (e: any) => {
    const data = JSON.parse(e.data);
    update(App, {timestamp: data});
  });
}

const main = () => {
  render(App, {timestamp: 0});
  listen();
}

main();

if (module.hot) {
  module.hot.accept();
  module.hot.accept('./app/App', () => {
    const NextApp = require('./app/App').default;
    render(NextApp);
  });
}
