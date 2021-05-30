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
import ClearIcon from '@material-ui/icons/Clear';
import {useState} from "react";
import urlJoin from "url-join";
import {TextFieldWithCopy} from "./TextFieldWithCopy";
import {RadioInput} from "./RadioInput";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";

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
    const senderCommand = `zip -r - . | curl -T - ${urlJoin(pipingServerUrl, "mydir.zip")}`;
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

const tarDirTransfer = {
  title: 'Directory transfer (tar)',
  searchTags: ['folder', 'tar.gz', 'gzip'],
  component: ({pipingServerUrl}: {pipingServerUrl: string}) => {
    const [tarOrTargz, setTarOrTargz] = useState<'tar' | "tar.gz">('tar');

    const senderCommand = `tar ${tarOrTargz === 'tar' ? 'c' : 'cz'} . | curl -T - ${urlJoin(pipingServerUrl, `mydir.${tarOrTargz}`)}`;
    const receiverCommand = `curl ${urlJoin(pipingServerUrl, `mydir.${tarOrTargz}`)} | tar x`;

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

        <RadioInput
          style={{marginTop: '1rem'}}
          label="tar/tar.gz"
          value={tarOrTargz}
          onChange={setTarOrTargz}
          selections={
            [
              { label: 'tar', value: 'tar' },
              { label: 'tar.gz', value: 'tar.gz' },
            ]
          }
        />
      </>
    )
  }
}

function generatePassword(passwordLen: number): string {
  const alphas  = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
  const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const chars   = [...alphas, ...numbers, ];
  const randomArr = window.crypto.getRandomValues(new Uint32Array(passwordLen));
  return Array.from(randomArr).map(n => chars[n % chars.length]).join('');
}

const portForwarding = {
  title: 'Port forwarding',
  searchTags: ['tunnel'],
  component: ({pipingServerUrl}: {pipingServerUrl: string}) => {
    // NOTE: ports are string because number does not allow empty input
    const [serverHostPort, setServerHostPort] = useState('22');
    const [clientHostPort, setClientHostPort] = useState('1022');
    // NOTE: nc -lp should be default because BSD nc emits an error when using `nc -lp`, but GNU nc has no error when using `nc -l` for noticing users proper command.
    const [clientHostServe, setClientHostServe] = useState<'nc -l' | 'nc -lp' | 'socat'>('nc -lp');
    const [e2ee, setE2ee] = useState<'none' | 'openssl'>('none');
    const [opensslPass, setOpensslPass] = useState(generatePassword(20));
    const [opensslPassIsVisible, setOpensslPassIsVisible] = useState(true);

    const encryptIfNeed = (() => {
      switch (e2ee) {
        case "none":
          return [];
        case "openssl":
          return [ `stdbuf -i0 -o0 openssl aes-256-ctr -pass "pass:${opensslPass}" -bufsize 1 -pbkdf2` ];
      }
    })();

    const decryptIfNeed = (() => {
      switch (e2ee) {
        case "none":
          return [];
        case "openssl":
          return [ `stdbuf -i0 -o0 openssl aes-256-ctr -d -pass "pass:${opensslPass}" -bufsize 1 -pbkdf2` ];
      }
    })();

    const serverHostCommand = [
      `curl -sSN ${urlJoin(pipingServerUrl, "aaa")}`,
      ...decryptIfNeed,
      `nc localhost ${serverHostPort}`,
      ...encryptIfNeed,
      `curl -sSNT - ${urlJoin(pipingServerUrl, "bbb")}`
    ].join(' | ');

    const clientHostServeCommand = (() => {
      switch (clientHostServe) {
        case 'nc -l':
        case 'nc -lp':
          return `${clientHostServe} ${clientHostPort}`;
        case 'socat':
          return `socat TCP-LISTEN:${clientHostPort} -`;
      }
    })();
    const clientHostCommand = [
      `curl -NsS ${urlJoin(pipingServerUrl, "bbb")}`,
      ...decryptIfNeed,
      clientHostServeCommand,
      ...encryptIfNeed,
      `curl -NsST - ${urlJoin(pipingServerUrl, "aaa")}`
    ].join(' | ');

    const textFieldRows = e2ee === 'openssl' ? 3 : 1;

    return (
      <>
        <TextFieldWithCopy
          label="Server host"
          value={serverHostCommand}
          isVisible={opensslPassIsVisible}
          rows={textFieldRows}
          style={textFieldStyle}
        />

        <TextFieldWithCopy
          label="Client host"
          value={clientHostCommand}
          isVisible={opensslPassIsVisible}
          rows={textFieldRows}
        />

        <div style={{marginTop: '1rem', marginBottom: '1rem'}}>
          <TextField label="server host port" type="number" value={serverHostPort} onChange={(e) => setServerHostPort(e.target.value)}/>
          <TextField label="client host port" type="number" value={clientHostPort} onChange={(e) => setClientHostPort(e.target.value)}/>
        </div>

        <div>
          <RadioInput
            style={{marginRight: '1rem'}}
            label="client host serving"
            value={clientHostServe}
            onChange={setClientHostServe}
            selections={
              [
                { label: 'GNU: nc -lp', value: 'nc -lp' },
                { label: 'BSD: nc -l', value: 'nc -l' },
                { label: 'socat', value: 'socat' },
              ]
            }
          />

          <RadioInput
            label="E2E encryption"
            value={e2ee}
            onChange={(v) => {
              setOpensslPassIsVisible(v !== 'openssl');
              setE2ee(v);
            }}
            selections={
              [
                { label: 'none', value: 'none' },
                { label: 'openssl', value: 'openssl' },
              ]
            }
          />

          { e2ee === "openssl" ?
            <>
              <TextField label="openssl pass" value={opensslPass} type={opensslPassIsVisible ? 'text' : 'password'} onChange={(e) => setOpensslPass(e.target.value)}/>
              <IconButton
                style={{marginTop: '0.5rem'}}
                aria-label="mask or unmask openssl pass"
                onClick={() => setOpensslPassIsVisible(!opensslPassIsVisible)}
                edge="end">
                { opensslPassIsVisible ? <VisibilityIcon /> : <VisibilityOffIcon /> }
              </IconButton>
            </>
            : undefined
          }
        </div>
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

  // NOTE: currently all props need the same props, but in the future, they may need different ones
  const titleComponents: TitleComponent[] = [
    toTitledComponent(simpleFileTransfer, {pipingServerUrl}),
    toTitledComponent(clipboardTransfer, {pipingServerUrl}),
    toTitledComponent(tarDirTransfer, {pipingServerUrl}),
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