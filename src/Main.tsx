import * as React from 'react';
import {
  FormControl, FormControlLabel, FormLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Paper, Radio, RadioGroup,
  TextField,
  Typography
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import {useState} from "react";
import urlJoin from "url-join";
import {TextFieldWithCopy} from "./TextFieldWithCopy";

const paperStyle = {padding: '1rem', marginBottom: '1.5rem'};
const textFieldStyle = {marginBottom: '1.5rem'};

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

const clipboardTransfer = {
  title: 'Copy & Paste (macOS)',
  searchTags: ['clipboard'],
  component: ({pipingServerUrl}: {pipingServerUrl: string}) => {
    const senderCommand = `pbpaste | curl -T - ${urlJoin(pipingServerUrl, "clip")}`;
    const receiverCommand = `curl ${urlJoin(pipingServerUrl, "clip")} | pbcopy`;
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

const portForwarding = {
  title: 'Port forwarding',
  searchTags: ['tunnel'],
  component: ({pipingServerUrl}: {pipingServerUrl: string}) => {
    // NOTE: port as string because number does not allow empty input
    const [serverHostPort, setServerHostPort] = useState('22');
    const [clientHostPort, setClientHostPort] = useState('1022');
    const [clientHostServe, setClientHostServe] = useState<'nc -l' | 'nc -lp' | 'socat'>('nc -l');

    function onChangeClientHostServe(s: string) {
      switch (s) {
        case 'nc -l':
        case 'nc -lp':
        case 'socat':
          setClientHostServe(s);
          break;
        default:
          throw new Error(`unexpected client host serve: ${s}`);
      }
    }

    const serverHostCommand = `curl -sSN ${urlJoin(pipingServerUrl, "aaa")} | nc localhost ${serverHostPort} | curl -sSNT - ${urlJoin(pipingServerUrl, "bbb")}`;
    const clientHostServeCommand = (() => {
      switch (clientHostServe) {
        case 'nc -l':
        case 'nc -lp':
          return `${clientHostServe} ${clientHostPort}`;
        case 'socat':
          return `socat TCP-LISTEN:${clientHostPort} -`;
      }
    })();
    const clientHostCommand = `curl -NsS ${urlJoin(pipingServerUrl, "bbb")} | ${clientHostServeCommand} | curl -NsST - ${urlJoin(pipingServerUrl, "aaa")}`;
    return (
      <>
        <TextFieldWithCopy
          label="Server host"
          value={serverHostCommand}
          rows={1}
          style={textFieldStyle}
        />

        <TextFieldWithCopy
          label="Client host"
          value={clientHostCommand}
          rows={1}
        />

        <div style={{marginTop: '1rem', marginBottom: '1rem'}}>
          <TextField label="server host port" type="number" value={serverHostPort} onChange={(e) => setServerHostPort(e.target.value)}/>
          <TextField label="client host port" type="number" value={clientHostPort} onChange={(e) => setClientHostPort(e.target.value)}/>
        </div>

        <FormControl>
          <FormLabel>client host serving</FormLabel>
          <RadioGroup row aria-label="position" name="position" defaultValue="nc -l" value={clientHostServe} onChange={(e) => onChangeClientHostServe(e.target.value)}>
            <FormControlLabel value="nc -l" control={<Radio color="primary" />} label="nc -l" />
            <FormControlLabel value="nc -lp" control={<Radio color="primary" />} label="nc -lp" />
            <FormControlLabel value="socat" control={<Radio color="primary" />} label="socat" />
          </RadioGroup>
        </FormControl>
      </>
    )
  }
};

type TitleComponent = { title: string, searchTags: string[], element: JSX.Element };

function toTitledComponent<Props>({title, searchTags, component}: { title: string, searchTags: string[], component: (props: Props) => JSX.Element }, props: Props): TitleComponent {
  return {
    title,
    searchTags,
    element: component(props),
  };
}

function CommandSearch({searchKeyword, setSearchKeyword}: {searchKeyword: string, setSearchKeyword: (s: string) => void}) {
  return (
    // (base: https://material-ui.com/components/text-fields/#input-adornments)
    <FormControl variant="outlined" fullWidth style={{marginBottom: '1.5rem'}}>
      <InputLabel>search</InputLabel>
      <OutlinedInput
        type="text"
        value={searchKeyword}
        placeholder={'e.g. folder'}
        onChange={(e) => setSearchKeyword(e.target.value)}
        startAdornment={<SearchIcon/>}
        autoFocus
        endAdornment={
          searchKeyword === '' ? undefined :
            <InputAdornment position="end">
              <IconButton
                aria-label="clear search keyword"
                onClick={() => setSearchKeyword('')}
                edge="end">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
        }
        labelWidth={70}
      />
    </FormControl>
  )
}

function parseHashAsQuery(): URLSearchParams {
  const url = new URL(`a://a${location.hash.substring(1)}`);
  return url.searchParams;
}

export function Main() {
  const keywordQueryParamName = 'q';
  const [pipingServerUrl, setPipingServerUrl] = useState('https://ppng.io');
  const [searchKeyword, setSearchKeyword] = useState(parseHashAsQuery().get(keywordQueryParamName) ?? '');

  const titleComponents: TitleComponent[] = [
    toTitledComponent(simpleFileTransfer, {pipingServerUrl}),
    toTitledComponent(clipboardTransfer, {pipingServerUrl}),
    toTitledComponent(zipDirTransfer, {pipingServerUrl}),
    toTitledComponent(portForwarding, {pipingServerUrl}),
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

  function onSearchKeywordChanged(keyword: string) {
    setSearchKeyword(keyword);
    location.hash = (keyword === '') ? '' : `?${keywordQueryParamName}=${encodeURIComponent(keyword)}`
  }

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

      <CommandSearch
        searchKeyword={searchKeyword}
        setSearchKeyword={onSearchKeywordChanged}
      />

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