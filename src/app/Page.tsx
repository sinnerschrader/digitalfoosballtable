import * as React from "react";

export interface PageProps {
  title: string;
  children: string;
  client: {
    css?: React.ReactNode;
    js: string;
  };
}

export type PageComponent = React.StatelessComponent<PageProps>;

const Page: PageComponent = props => {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta charSet="utf-8" />
        <title>{props.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {props.client.css}
      </head>
      <body>
        <div id="root" dangerouslySetInnerHTML={{__html: props.children}}/>
        <script src={props.client.js} />
      </body>
    </html>
  );
};

export default Page;
