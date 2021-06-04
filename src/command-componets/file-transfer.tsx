import * as React from "react";
import {useState} from "react";
import urlJoin from "url-join";
import Grid from "@material-ui/core/Grid";
import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import {TextFieldWithCopy} from "@/TextFieldWithCopy";
import {textFieldContainerGridSpacing} from "./share";
import {RadioInput} from "@/RadioInput";

export const fileTransfer = {
  title: 'File transfer',
  searchTags: [],
  component: ({pipingServerUrl, randomString}: {pipingServerUrl: string, randomString: string}) => {
    const [integrity, setIntegrity] = useState<'none' | 'shasum'>('none');
    const [usesPv, setUsesPv] = useState(false);
    const url = urlJoin(pipingServerUrl, `myfile${randomString}`);
    const filePath = `myfile`;
    const integrityCommand = integrity === "none" ? [] : ["tee >(shasum >&2)"];
    const senderCommand = (() => {
      if (integrity === "none" && !usesPv) {
        return `curl -T ${filePath} ${url}`;
      }
      const catOrPv = usesPv ? "pv" : "cat";
      return [
        `${catOrPv} ${filePath}`,
        ...integrityCommand,
        `curl -T - ${url}`,
      ].join(" | ");
    })();
    const receiverCommand = (() => {
      if (integrity === "none") {
        // NOTE: curl shows progress by default without "-sS"
        return `curl ${url} > ${filePath}`;
      }
      return [
        `curl -sS ${url}`,
        ...integrityCommand,
      ].join(" | ") + ` > ${filePath}`;
    })();

    return (
      <Grid container spacing={textFieldContainerGridSpacing}>
        <Grid item xs={12}>
          <TextFieldWithCopy
            label="Sender"
            value={senderCommand}
            rows={1}
          />
        </Grid>
        <Grid item xs={12}>
          <TextFieldWithCopy
            label="Receiver"
            value={receiverCommand}
            rows={1}
          />
        </Grid>
        <Grid item xs={12}>
          <RadioInput
            label="Integrity"
            value={integrity}
            onChange={setIntegrity}
            selections={
              [
                { label: 'none', value: 'none' },
                { label: 'shasum', value: 'shasum' },
              ]
            }
            style={{marginRight: '1rem'}}
          />

          <FormControl component="fieldset" >
            <FormLabel component="legend">Progress</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={usesPv}
                    onChange={(e) => setUsesPv(e.target.checked)}
                    color="primary"
                  />}
               label="progress with pv"/>
            </FormGroup>
          </FormControl>
        </Grid>
      </Grid>
    )
  }
};


export const e2eeFileTransfer = {
  title: 'File transfer (end-to-end encryption)',
  searchTags: ['e2ee', 'e2e encryption'],
  component: ({pipingServerUrl, randomString}: {pipingServerUrl: string, randomString: string}) => {
    const [textFieldRows, setTextFieldRows] = useState(1);
    const [e2ee, setE2ee] = useState<'openssl' | 'gpg'>('openssl');
    const [opensslCipherAlgorithm, setOpensslCipherAlgorithm] = useState('aes-256-cbc');
    const [integrity, setIntegrity] = useState<'none' | 'shasum'>('none');
    const [usesPv, setUsesPv] = useState(false);
    const url = urlJoin(pipingServerUrl, `myfile${randomString}`);
    const filePath = `myfile`;
    const integrityCommand = integrity === "none" ? [] : ["tee >(shasum >&2)"];
    const senderCommand = (() => {
      const e2eeEncryptCommand = (() => {
        switch (e2ee) {
          case "openssl": return [`openssl ${opensslCipherAlgorithm} -pbkdf2`];
          case "gpg": return [`gpg -c`];
        }
      })();
      const extra = e2ee === "gpg" ? `export GPG_TTY=$(tty);\n` : "";
      const catOrPv = usesPv ? "pv" : "cat";
      return extra + [
        `${catOrPv} ${filePath}`,
        ...e2eeEncryptCommand,
        ...integrityCommand,
        `curl -T - ${url}`,
      ].join(" | ");
    })();
    const receiverCommand = (() => {
      const e2eeDecryptCommand = (() => {
        switch (e2ee) {
          case "openssl": return `openssl ${opensslCipherAlgorithm} -d -pbkdf2`;
          case "gpg": return `gpg -d`;
        }
      })();
      const extra = e2ee === "gpg" ? `export GPG_TTY=$(tty);\n` : "";
      return extra + [
        `curl -sS ${url}`,
        ...integrityCommand,
        e2eeDecryptCommand,
      ].join(" | ") + ` > ${filePath}`;
    })();

    return (
      <Grid container spacing={textFieldContainerGridSpacing}>
        <Grid item xs={12}>
          <TextFieldWithCopy
            label="Sender"
            value={senderCommand}
            rows={textFieldRows}
          />
        </Grid>
        <Grid item xs={12}>
          <TextFieldWithCopy
            label="Receiver"
            value={receiverCommand}
            rows={textFieldRows}
          />
        </Grid>
        <Grid item xs={12}>
          <RadioInput
            label="E2E encryption"
            value={e2ee}
            onChange={(e2ee) => {
              setTextFieldRows(e2ee === "gpg" ? 2 : 1);
              setE2ee(e2ee);
            }}
            selections={
              [
                { label: 'openssl', value: 'openssl' },
                { label: 'gpg', value: 'gpg' },
              ]
            }
            style={{marginRight: '1rem'}}
          />
          <RadioInput
            label="Integrity"
            value={integrity}
            onChange={setIntegrity}
            selections={
              [
                { label: 'none', value: 'none' },
                { label: 'shasum', value: 'shasum' },
              ]
            }
            style={{marginRight: '1rem'}}
          />

          <FormControl component="fieldset" >
            <FormLabel component="legend">Progress</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={usesPv}
                    onChange={(e) => setUsesPv(e.target.checked)}
                    color="primary"
                  />}
                label="progress with pv"/>
            </FormGroup>
          </FormControl>
        </Grid>
      </Grid>
    )
  }
};
