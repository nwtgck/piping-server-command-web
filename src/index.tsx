import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Typography} from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from '@material-ui/core/CssBaseline';
import {Main} from "./Main";

const theme = createMuiTheme({
  palette: {
    type: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : undefined,
  },
});

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <Typography variant="h4" component="h2" style={{textAlign: 'center', marginTop: '1rem'}}>
          Piping Server Command Sheet
        </Typography>
        <Main />
      </ThemeProvider>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
