import * as React from "react";
import {useState} from "react";
import urlJoin from "url-join";
import Grid from '@material-ui/core/Grid';
import {TextFieldWithCopy} from "@/TextFieldWithCopy";
import {RadioInput} from "@/RadioInput";
import {textFieldContainerGridSpacing} from "./share";
import {generalE2eeCommandsAndElement} from "@/command-componets/e2ee";

export const tarDirTransfer = {
  title: 'Directory transfer (tar)',
  searchTags: ['folder', 'tar.gz', 'gzip'],
  component: ({pipingServerUrl, randomString}: {pipingServerUrl: string, randomString: string}) => {
    const [tarOrTargz, setTarOrTargz] = useState<'tar' | "tar.gz">('tar');

    const senderCommand = `tar ${tarOrTargz === 'tar' ? 'c' : 'cz'} . | curl -T - ${urlJoin(pipingServerUrl, `mydir${randomString}.${tarOrTargz}`)}`;
    const receiverCommand = `curl ${urlJoin(pipingServerUrl, `mydir${randomString}.${tarOrTargz}`)} | tar x`;

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
        </Grid>
      </Grid>
    )
  }
};

export const e2eeTarDirTransfer = {
  title: 'Directory transfer (tar) (E2EE)',
  searchTags: ['folder', 'tar.gz', 'gzip', "end-to-end encryption"],
  component: ({pipingServerUrl, randomString}: {pipingServerUrl: string, randomString: string}) => {
    const [tarOrTargz, setTarOrTargz] = useState<'tar' | "tar.gz">('tar');
    const {e2eePrepend, e2eeEncryptCommand, e2eeDecryptCommand, e2eeSelectionElement} = generalE2eeCommandsAndElement({
      e2eeState: useState<'openssl' | 'gpg'>('openssl'),
      opensslCipherAlgorithmState: useState('aes-256-cbc')
    });
    const senderCommand = e2eePrepend + [
      `tar ${tarOrTargz === 'tar' ? 'c' : 'cz'} .`,
      e2eeEncryptCommand,
      `curl -T - ${urlJoin(pipingServerUrl, `mydir${randomString}.${tarOrTargz}`)}`,
    ].join(" | ");
    const receiverCommand = e2eePrepend + [
      `curl ${urlJoin(pipingServerUrl, `mydir${randomString}.${tarOrTargz}`)}`,
      e2eeDecryptCommand,
      `tar x`,
    ].join(" | ");
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
          <RadioInput
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
          { e2eeSelectionElement }
        </Grid>
      </Grid>
    )
  }
};
