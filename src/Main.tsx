import * as React from 'react';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import {Autocomplete} from '@material-ui/lab';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import {useState} from "react";
import {fileTransfer} from "./command-componets/file-transfer";
import {clipboardTransfer} from "./command-componets/clipboard-transfer";
import {zipDirTransfer} from "./command-componets/zip-dir-transfer";
import {tarDirTransfer} from "./command-componets/tar-dir-transfer";
import {e2eePortForwarding, portForwarding} from "./command-componets/port-forwarding";

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
  const pipingServerUrls = [
    "https://ppng.io",
    "https://piping.glitch.me",
    "https://ppng.herokuapp.com",
    "https://piping.nwtgck.repl.co",
    "https://piping-47q675ro2guv.runkit.sh"
  ];
  const [pipingServerUrl, setPipingServerUrl] = useState(pipingServerUrls[0]);
  const [searchKeyword, setSearchKeyword] = useState(parseHashAsQuery().get(keywordQueryParamName) ?? '');
  const paperStyle = {padding: '1rem', marginBottom: '1.5rem'};

  // NOTE: currently all props need the same props, but in the future, they may need different ones
  const titleComponents: TitleComponent[] = [
    toTitledComponent(fileTransfer, {pipingServerUrl}),
    toTitledComponent(clipboardTransfer, {pipingServerUrl}),
    toTitledComponent(tarDirTransfer, {pipingServerUrl}),
    toTitledComponent(zipDirTransfer, {pipingServerUrl}),
    toTitledComponent(portForwarding, {pipingServerUrl}),
    toTitledComponent(e2eePortForwarding, {pipingServerUrl}),
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
