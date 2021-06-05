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
import {ReactState} from "@/utils";
import {generalE2eeCommandsAndElement} from "@/command-componets/e2ee";

export const fileTransfer = {
  title: 'File transfer',
  searchTags: [],
  component: ({pipingServerUrl, randomString, integrityState, usesPvState}: {pipingServerUrl: string, randomString: string, integrityState: ReactState<'none' | 'shasum'>, usesPvState: ReactState<boolean>}) => {
    const [integrity, setIntegrity] = integrityState;
    const [usesPv, setUsesPv] = usesPvState;
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
  title: 'File transfer with end-to-end encryption',
  searchTags: ['e2ee', 'e2e encryption'],
  component: ({pipingServerUrl, randomString, integrityState, usesPvState}: {pipingServerUrl: string, randomString: string, integrityState: ReactState<'none' | 'shasum'>, usesPvState: ReactState<boolean>}) => {
    const {e2eePrepend, e2eeEncryptCommand, e2eeDecryptCommand, e2eeSelectionElement} = generalE2eeCommandsAndElement({
      e2eeState: useState<'openssl' | 'gpg'>('openssl'),
      opensslCipherAlgorithmState: useState('aes-256-cbc')
    });
    const [integrity, setIntegrity] = integrityState;
    const [usesPv, setUsesPv] = usesPvState;
    const url = urlJoin(pipingServerUrl, `myfile${randomString}`);
    const filePath = `myfile`;
    const integrityCommand = integrity === "none" ? [] : ["tee >(shasum >&2)"];
    const senderCommand = (() => {
      const catOrPv = usesPv ? "pv" : "cat";
      return e2eePrepend + [
        `${catOrPv} ${filePath}`,
        e2eeEncryptCommand,
        ...integrityCommand,
        `curl -T - ${url}`,
      ].join(" | ");
    })();
    const receiverCommand = (() => {
      return e2eePrepend + [
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
            rows={senderCommand.split("\n").length}
          />
        </Grid>
        <Grid item xs={12}>
          <TextFieldWithCopy
            label="Receiver"
            value={receiverCommand}
            rows={receiverCommand.split("\n").length}
          />
        </Grid>
        <Grid item xs={12}>
          { e2eeSelectionElement }
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
