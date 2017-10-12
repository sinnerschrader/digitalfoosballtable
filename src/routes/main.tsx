import * as express from 'express';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { ServerStyleSheet } from 'styled-components'

import App from '../app/App';
import Page from '../app/Page';

export default mainRoute;

function mainRoute() {
  return (req: express.Request, res: express.Response) => {
    const sheet = new ServerStyleSheet();
    const content = renderToString(sheet.collectStyles(<App data={{time: 0}}/>));
    const css = sheet.getStyleElement();

    const doc = renderToString((
      <Page
        title="digitalfoosballtable"
        client={{
          js: 'http://localhost:3001/static/js/bundle.js',
          css
        }}>
        {content}
      </Page>
    ));

    res.send(`<!doctype html>${doc}`);
  };
}
