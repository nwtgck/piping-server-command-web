import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from '@material-ui/core/CssBaseline';
import {Main} from "./Main";
import {indigo, pink} from "@material-ui/core/colors";
import GitHubIcon from '@material-ui/icons/GitHub';
import Link from '@material-ui/core/Link';

function App() {
  // (base: https://github.com/mui-org/material-ui/blob/25acfab1471080223e308cb0d337dae3832f740f/docs/src/pages/customization/palette/palette.md#system-preference)
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = React.useMemo(() => {
    const primary = indigo;
    const secondary = pink;
    // (from: https://github.com/mui-org/material-ui/issues/18776#issuecomment-564570288)
    const darkPrimary = {
      light: primary[100],
      main: primary[200],
      dark: primary[300],
    };
    const darkSecondary = {
      light: secondary[100],
      main: secondary[200],
      dark: secondary[300],
    };
    return createTheme({
      palette: {
        type: prefersDarkMode ? 'dark' : undefined,
        primary: prefersDarkMode ? darkPrimary : undefined,
        secondary: prefersDarkMode ? darkSecondary : undefined,
      },
    })
  }, [prefersDarkMode]);

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <Typography variant="h4" component="h2" style={{textAlign: 'center', marginTop: '1rem'}}>
          Piping Server Command Sheet
          {" "}
          <Link href="https://github.com/nwtgck/piping-server-command-web" color="inherit"><GitHubIcon fontSize="inherit" style={{paddingTop: '0.3rem'}}/></Link>
        </Typography>
        <Main />
      </ThemeProvider>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
