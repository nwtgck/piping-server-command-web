import * as React from "react";
import {useState} from "react";
import urlJoin from "url-join";
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import {TextFieldWithCopy} from "@/TextFieldWithCopy";
import {RadioInput} from "@/RadioInput";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import {textFieldContainerGridSpacing} from "./share";
import {ReactState, useWatchingUpdate} from "@/utils";

export type ClientHostServe = 'nc -l' | 'nc -lp' | 'socat';

function getClientHostServeCommand(clientHostServe: ClientHostServe, clientHostPort: string): string {
  switch (clientHostServe) {
    case 'nc -l':
    case 'nc -lp':
      return `${clientHostServe} ${clientHostPort}`;
    case 'socat':
      return `socat TCP-LISTEN:${clientHostPort} -`;
  }
}

function generatePassword(passwordLen: number): string {
  const alphas  = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
  const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const chars   = [...alphas, ...numbers, ];
  const randomArr = window.crypto.getRandomValues(new Uint32Array(passwordLen));
  return Array.from(randomArr).map(n => chars[n % chars.length]).join('');
}

export const portForwarding = {
  title: 'Port forwarding',
  searchTags: ['tunnel'],
  component: ({pipingServerUrl, path1State, path2State, clientHostServeState, serverHostPortState, clientHostPortState}: {
    pipingServerUrl: string,
    path1State: ReactState<string>,
    path2State: ReactState<string>,
    clientHostServeState: ReactState<ClientHostServe>,
    serverHostPortState: ReactState<string>,
    clientHostPortState: ReactState<string>
  }) => {
    const [path1, setPath1] = path1State;
    const [path2, setPath2] = path2State;
    const [serverHostPort, setServerHostPort] = serverHostPortState;
    const [clientHostPort, setClientHostPort] = clientHostPortState;
    const [clientHostServe, setClientHostServe] = clientHostServeState;
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
      `curl -sSN ${urlJoin(pipingServerUrl, path1)}`,
      ...decryptIfNeed,
      `nc localhost ${serverHostPort}`,
      ...encryptIfNeed,
      `curl -sSNT - ${urlJoin(pipingServerUrl, path2)}`
    ].join(' | ');
    const clientHostCommand = [
      `curl -sSN ${urlJoin(pipingServerUrl, path2)}`,
      ...decryptIfNeed,
      getClientHostServeCommand(clientHostServe, clientHostPort),
      ...encryptIfNeed,
      `curl -sSNT - ${urlJoin(pipingServerUrl, path1)}`
    ].join(' | ');

    const textFieldRows = e2ee === 'openssl' ? 3 : 1;

    return (
      <Grid container spacing={textFieldContainerGridSpacing}>
        <Grid item xs={12}>
          <TextFieldWithCopy
            label="Server host"
            value={serverHostCommand}
            isVisible={opensslPassIsVisible}
            rows={textFieldRows}
          />
        </Grid>
        <Grid item xs={12}>
          <TextFieldWithCopy
            label="Client host"
            value={clientHostCommand}
            isVisible={opensslPassIsVisible}
            rows={textFieldRows}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField label="server host port" type="number" value={serverHostPort} onChange={(e) => setServerHostPort(e.target.value)} style={{marginRight: '0.5rem'}}/>
          <TextField label="client host port" type="number" value={clientHostPort} onChange={(e) => setClientHostPort(e.target.value)}/>
          <span style={{marginRight: '1rem'}} />
          <TextField label="path1" value={path1} onChange={(e) => setPath1(e.target.value)} style={{marginRight: '0.5rem'}}/>
          <TextField label="path2" value={path2} onChange={(e) => setPath2(e.target.value)}/>
        </Grid>
        <Grid item xs={12}>
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
        </Grid>
      </Grid>
    )
  }
};

// split components and a little duplicate because easy to access to this command sheet
export const e2eePortForwarding = {
  title: 'Port forwarding (E2EE inputting pass)',
  searchTags: ['tunnel', 'e2ee', 'end-to-end', 'encryption'],
  component: ({pipingServerUrl, path1State, path2State, clientHostServeState, serverHostPortState, clientHostPortState}: {
    pipingServerUrl: string,
    path1State: ReactState<string>,
    path2State: ReactState<string>,
    clientHostServeState: ReactState<ClientHostServe>,
    serverHostPortState: ReactState<string>,
    clientHostPortState: ReactState<string>
  }) => {
    const [path1, setPath1] = path1State;
    const [path2, setPath2] = path2State;
    const [serverHostPort, setServerHostPort] = serverHostPortState;
    const [clientHostPort, setClientHostPort] = clientHostPortState;
    const [clientHostServe, setClientHostServe] = clientHostServeState;

    const encryptCommand = `stdbuf -i0 -o0 openssl aes-256-ctr -pass "pass:$pass" -bufsize 1 -pbkdf2`;
    const decryptCommand = `stdbuf -i0 -o0 openssl aes-256-ctr -d -pass "pass:$pass" -bufsize 1 -pbkdf2`;
    const serverHostCommand = [
      `read -p "password: " -s pass && curl -sSN ${urlJoin(pipingServerUrl, path1)}`,
      decryptCommand,
      `nc localhost ${serverHostPort}`,
      encryptCommand,
      `curl -sSNT - ${urlJoin(pipingServerUrl, path2)}`
    ].join(' | ') + "; unset pass";
    const clientHostCommand = [
      `read -p "password: " -s pass && curl -sSN ${urlJoin(pipingServerUrl, path2)}`,
      decryptCommand,
      getClientHostServeCommand(clientHostServe, clientHostPort),
      encryptCommand,
      `curl -sSNT - ${urlJoin(pipingServerUrl, path1)}`
    ].join(' | ') + "; unset pass";

    return (
      <Grid container spacing={textFieldContainerGridSpacing}>
        <Grid item xs={12}>
          <TextFieldWithCopy
            label="Server host"
            value={serverHostCommand}
            rows={3}
          />
        </Grid>
        <Grid item xs={12}>
          <TextFieldWithCopy
            label="Client host"
            value={clientHostCommand}
            rows={3}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField label="server host port" type="number" value={serverHostPort} onChange={(e) => setServerHostPort(e.target.value)} style={{marginRight: '0.5rem'}}/>
          <TextField label="client host port" type="number" value={clientHostPort} onChange={(e) => setClientHostPort(e.target.value)}/>
          <span style={{marginRight: '1rem'}} />
          <TextField label="path1" value={path1} onChange={(e) => setPath1(e.target.value)} style={{marginRight: '0.5rem'}}/>
          <TextField label="path2" value={path2} onChange={(e) => setPath2(e.target.value)}/>
        </Grid>
        <Grid item xs={12}>
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
        </Grid>
      </Grid>
    )
  }
};
