import * as React from 'react';
import styled, { ThemeProvider, injectGlobal } from 'styled-components';
import {getTheme, Shade} from "./theme";

export interface AppProps {
  data: any;
}

export type AppComponent = React.SFC<AppProps>;

export interface TeamProps {
  name: string;
  shade: Shade;
  goals: number;
}

export type TeamComponent = React.SFC<TeamProps>;

const GLOBAL_STYLES = `
  html, body {
    margin: 0;
    padding: 0;
  }
`;

const App: AppComponent = props => {
  injectGlobal`
    ${GLOBAL_STYLES}
  `;

  return (
    <ThemeProvider theme={getTheme(Shade.Light)}>
      <StyledApp>
        <Banderole>
          Digital foosball table
        </Banderole>
        {typeof props.data.timestamp === 'number'
          ? <StyledPlayTime>{format(props.data.timestamp)}</StyledPlayTime>
          : null
        }
        <StyledTeams>
          <Team shade={Shade.Dark} name="Black" goals={0}/>
          <Team shade={Shade.Light} name="White" goals={0}/>
        </StyledTeams>
      </StyledApp>
    </ThemeProvider>
  );
};

const format = (delta: number) => {
  const date = new Date(delta);
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return [minutes, seconds].join(':');
};

const StyledApp = styled.div`
  height: 100vh;
  width: 100vw;
  background: ${props => props.theme.background};
`;

const Banderole: React.SFC<{}> = (props) => {
  return (
    <StyledBanderole>
      {props.children}
    </StyledBanderole>
  )
};

const StyledBanderole = styled.h1`
  margin: 0;
  padding: 0;
  font-family: ${props => props.theme.fontFamily}
`;

const StyledPlayTime = styled.span`
  position: absolute;
  bottom: 0;
  left: 0;
  color: #fff;
  padding: ${props => props.theme.fontSize}px;
  font-size: ${props => props.theme.fontSize * 2}px;
  font-family: ${props => props.theme.fontFamily}
`;

const StyledTeams = styled.div`
  flex: 1 0 100%;
  display: flex;
  min-height: 100%;
`;

const Team: TeamComponent = (props) => {
  const theme = getTheme(props.shade);

  return (
    <ThemeProvider theme={theme}>
      <StyledTeamComponent>
        <StyledTeamName>Team {props.name}</StyledTeamName>
        <StyledTeamGoal>{props.goals}</StyledTeamGoal>
      </StyledTeamComponent>
    </ThemeProvider>
  )
};

const StyledTeamComponent = styled.div`
  flex: 1 0 50%;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  box-sizing: border-box;
  color: ${(props) => props.theme.foreground};
  background-color: ${(props) => props.theme.background};
  padding: ${(props) => props.theme.fontSize * 4}px 0;
  font-family: ${props => props.theme.fontFamily};
  text-align: center;
`;

const StyledTeamName = styled.h2`
  flex: 0 0 auto;
`;

const StyledTeamGoal = styled.h3`
  flex: 0 0 auto;
`;

export default App;
