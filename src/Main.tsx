import * as React from 'react';
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Paper,
  TextField,
  Typography
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import {useState} from "react";
import urlJoin from "url-join";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import clipboardCopy from 'clipboard-copy';

const paperStyle = {padding: '1rem', marginBottom: '1.5rem'};
const textFieldStyle = {marginBottom: '1.5rem'};

function TextFieldWithCopy(props: {label: string, value: string, rows: number, style?: React.CSSProperties}) {
  // (base: https://material-ui.com/components/text-fields/#input-adornments)
  return (
    <FormControl variant="outlined" style={props.style} fullWidth>
      <InputLabel>{props.label}</InputLabel>
      <OutlinedInput
        type="text"
        value={props.value}
        multiline
        rows={props.rows}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="copy text to the clipboard"
              onClick={() => clipboardCopy(props.value)}
              edge="end">
              <FileCopyIcon />
            </IconButton>
          </InputAdornment>
        }
        labelWidth={70}
      />
    </FormControl>
  )
}

const simpleFileTransfer = {
  title: 'File transfer',
  searchTags: [],
  component: ({pipingServerUrl}: {pipingServerUrl: string}) => {
    const senderCommand = `curl -T myfile ${urlJoin(pipingServerUrl, "myfile")}`;
    const receiverCommand = `curl ${urlJoin(pipingServerUrl, "myfile")} > myfile`;
    return (
      <>
        <TextFieldWithCopy
          label="Sender"
          value={senderCommand}
          rows={1}
          style={textFieldStyle}
        />

        <TextFieldWithCopy
          label="Receiver"
          value={receiverCommand}
          rows={1}
        />
      </>
    )
  }
}

const zipDirTransfer = {
  title: 'Directory transfer (zip)',
  searchTags: ['folder'],
  component: ({pipingServerUrl}: {pipingServerUrl: string}) => {
    const senderCommand = `zip -q -r - ./mydir | curl -T - ${urlJoin(pipingServerUrl, "mydir.zip")}`;
    const receiverCommand = `curl ${urlJoin(pipingServerUrl, "mydir.zip")} > mydir.zip`; // TODO: extract
    return (
      <>
        <TextFieldWithCopy
          label="Sender"
          value={senderCommand}
          rows={1}
          style={textFieldStyle}
        />

        <TextFieldWithCopy
          label="Receiver"
          value={receiverCommand}
          rows={1}
        />
      </>
    )
  }
}

type TitleComponent = { title: string, searchTags: string[], element: JSX.Element };

function toTitledComponent<Props>({title, searchTags, component}: { title: string, searchTags: string[], component: (props: Props) => JSX.Element }, props: Props): TitleComponent {
  return {
    title,
    searchTags,
    element: component(props),
  };
}

export function Main() {
  const [pipingServerUrl, setPipingServerUrl] = useState('https://ppng.io');
  const [searchKeyword, setSearchKeyword] = useState('');

  const titleComponents: TitleComponent[] = [
    toTitledComponent(simpleFileTransfer, {pipingServerUrl}),
    toTitledComponent(zipDirTransfer, {pipingServerUrl}),
  ];

  const searches = ({title, searchTags}: TitleComponent): boolean => {
    if (searchKeyword === '') {
      return true;
    }
    const lowerKeyword = searchKeyword.toLocaleLowerCase();
    return lowerKeyword.split(/\s+/).filter(s => s !== "").some(keyword =>
      title.toLocaleLowerCase().search(keyword) !== -1 || searchTags.some(t => t.search(keyword) !== -1)
    );
  };

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

      {/* TODO: improve UI */}
      <>
        <TextField
          placeholder="Search"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          inputProps={{ 'aria-label': 'search' }}
          autoFocus
        />
        <IconButton type="submit" aria-label="search">
          <SearchIcon />
        </IconButton>
      </>

      { titleComponents.filter(searches).map((paper, idx) =>
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