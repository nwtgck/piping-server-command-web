import * as React from 'react';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import {Autocomplete} from '@material-ui/lab';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import {useState} from "react";
import {fileTransfer} from "./command-componets/file-transfer";
import {clipboardTransfer} from "./command-componets/clipboard-transfer";
import {zipDirTransfer} from "./command-componets/zip-dir-transfer";
import {tarDirTransfer} from "./command-componets/tar-dir-transfer";
import {ClientHostServe, e2eePortForwarding, portForwarding} from "./command-componets/port-forwarding";

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

function generateRandomPathString(): string {
  const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const randomArr = window.crypto.getRandomValues(new Uint32Array(3));
  return Array.from(randomArr).map(n => numbers[n % numbers.length]).join('');
}

export function Main() {
  const keywordQueryParamName = 'q';
  const pipingServerUrls = [
    "https://ppng.io",
    "https://piping.glitch.me",
    "https://ppng.herokuapp.com",
    "https://piping.nwtgck.repl.co",
    "https://piping-47q675ro2guv.runkit.sh"
  ];
  const [pipingServerUrl, setPipingServerUrl] = useState(pipingServerUrls[0]);
  const [randomString, setRandomString] = useState(generateRandomPathString());
  const [searchKeyword, setSearchKeyword] = useState(parseHashAsQuery().get(keywordQueryParamName) ?? '');
  // NOTE: ports are string because number does not allow empty input
  // NOTE: these states are shared between components
  const serverHostPortState = useState('22');
  const clientHostPortState = useState('1022');
  // NOTE: nc -lp should be default because BSD nc emits an error when using `nc -lp`, but GNU nc has no error when using `nc -l` for noticing users proper command.
  // NOTE: this state is shared between components
  const clientHostServeState = useState<ClientHostServe>('nc -lp');

  const paperStyle = {padding: '1rem', marginBottom: '1.5rem'};

  const titleComponents: TitleComponent[] = [
    toTitledComponent(fileTransfer, {pipingServerUrl, randomString}),
    toTitledComponent(clipboardTransfer, {pipingServerUrl, randomString}),
    toTitledComponent(tarDirTransfer, {pipingServerUrl, randomString}),
    toTitledComponent(zipDirTransfer, {pipingServerUrl, randomString}),
    toTitledComponent(portForwarding, {pipingServerUrl, randomString, clientHostServeState, serverHostPortState, clientHostPortState}),
    toTitledComponent(e2eePortForwarding, {pipingServerUrl, randomString, clientHostServeState, serverHostPortState, clientHostPortState}),
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
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {/* (base: https://material-ui.com/components/autocomplete/#free-solo) */}
            <Autocomplete
              freeSolo
              inputValue={pipingServerUrl}
              defaultValue={pipingServerUrl}
              // TODO: better way
              onChange={(e) => setPipingServerUrl((e.target as any).textContent)}
              options={pipingServerUrls}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Piping Server"
                  onChange={(e) => setPipingServerUrl(e.target.value)}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="random fragment"
              value={randomString}
              onChange={(e) => setRandomString(e.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>
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
