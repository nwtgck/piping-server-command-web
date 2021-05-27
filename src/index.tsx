import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {IconButton, InputBase, Paper, TextField, Typography} from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import SearchIcon from '@material-ui/icons/Search';
import CssBaseline from '@material-ui/core/CssBaseline';
import {useState} from "react";
import urlJoin from "url-join";

const theme = createMuiTheme({
  palette: {
    type: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : undefined,
  },
});

const paperStyle = {padding: '1rem', marginBottom: '1.5rem'};
const textFieldStyle = {marginBottom: '1.5rem'};

const simpleFileTransfer = {
  title: 'File transfer',
  component: ({pipingServerUrl}: {pipingServerUrl: string}) => {
    const senderCommand = `curl -T myfile ${urlJoin(pipingServerUrl, "myfile")}`;
    const receiverCommand = `curl ${urlJoin(pipingServerUrl, "myfile")} > myfile`;
    return (
      <>
        <TextField
          label="Sender"
          value={senderCommand}
          rows={1}
          style={textFieldStyle}
          multiline
          fullWidth={true}
          variant="outlined"
        />

        <TextField
          label="Receiver"
          value={receiverCommand}
          rows={1}
          multiline
          fullWidth={true}
          variant="outlined"
        />
      </>
    )
  }
}

const zipDirTransfer = {
  title: 'Directory transfer (zip)',
  component: ({pipingServerUrl}: {pipingServerUrl: string}) => {
    const senderCommand = `zip -q -r - ./mydir | curl -T - ${urlJoin(pipingServerUrl, "mydir.zip")}`;
    const receiverCommand = `curl ${urlJoin(pipingServerUrl, "mydir.zip")} > mydir.zip`; // TODO: extract
    return (
      <>
        <TextField
          label="Sender"
          value={senderCommand}
          rows={1}
          style={textFieldStyle}
          multiline
          fullWidth={true}
          variant="outlined"
        />

        <TextField
          label="Receiver"
          value={receiverCommand}
          rows={1}
          multiline
          fullWidth={true}
          variant="outlined"
        />
      </>
    )
  }
}

function Main() {
  const [pipingServerUrl, setPipingServerUrl] = useState('https://ppng.io');

  // NOTE: fill props here
  const titleComponents: Array<{ title: string, element: JSX.Element }> = [
    {
      title: simpleFileTransfer.title,
      element: simpleFileTransfer.component({pipingServerUrl})
    },
    {
      title: zipDirTransfer.title,
      element: zipDirTransfer.component({pipingServerUrl})
    }
  ];

  return (
    <div style={{padding: '2rem'}}>
      <Paper elevation={4} style={paperStyle}>
        <TextField
          label={"Piping Server"}
          value={pipingServerUrl}
          onChange={(e) => setPipingServerUrl(e.target.value)}
          style={{width: '20rem'}}
        />
      </Paper>

      {/* TODO: implement search */}
      <>
        <TextField
          placeholder="Search"
          inputProps={{ 'aria-label': 'search' }}
        />
        <IconButton type="submit" aria-label="search">
          <SearchIcon />
        </IconButton>
      </>

      { titleComponents.map((paper, idx) =>
        <Paper elevation={4} style={paperStyle} key={idx}>
          <Typography variant="h6" component="h4" style={{marginBottom: '1rem'}}>
            {paper.title}
          </Typography>
          { paper.element }
        </Paper>
      ) }
    </div>
  )
}

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
