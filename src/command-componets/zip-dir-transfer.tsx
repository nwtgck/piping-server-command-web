import * as React from "react";
import {useState} from "react";
import urlJoin from "url-join";
import Grid from '@material-ui/core/Grid';
import {TextFieldWithCopy} from "@/TextFieldWithCopy";
import {textFieldContainerGridSpacing} from "./share";
import {generalE2eeCommandsAndElement} from "@/command-componets/e2ee";

export const zipDirTransfer = {
  title: 'Directory transfer (zip)',
  searchTags: ['folder'],
  component: ({pipingServerUrl, randomString}: {pipingServerUrl: string, randomString: string}) => {
    const senderCommand = `zip -r - . | curl -T - ${urlJoin(pipingServerUrl, `mydir${randomString}.zip`)}`;
    const receiverCommand = `curl ${urlJoin(pipingServerUrl, `mydir${randomString}.zip`)} > mydir.zip`; // TODO: extract
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
      </Grid>
    )
  }
};

export const e2eeZipDirTransfer = {
  title: 'Directory transfer (zip) (E2EE)',
  searchTags: ['folder', 'end-to-end', 'encryption'],
  component: ({pipingServerUrl, randomString}: {pipingServerUrl: string, randomString: string}) => {
    const {e2eePrepend, e2eeEncryptCommand, e2eeDecryptCommand, e2eeSelectionElement} = generalE2eeCommandsAndElement({
      e2eeState: useState<'openssl' | 'gpg'>('openssl'),
      opensslCipherAlgorithmState: useState('aes-256-cbc')
    });
    const senderCommand = e2eePrepend + [
      `zip -r - .`,
      e2eeEncryptCommand,
      `curl -T - ${urlJoin(pipingServerUrl, `mydir${randomString}.zip`)}`
    ].join(" | ");
    const receiverCommand = `curl -sS ${urlJoin(pipingServerUrl, `mydir${randomString}.zip`)} | ${e2eeDecryptCommand} > mydir.zip`; // TODO: extract
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
        </Grid>
      </Grid>
    )
  }
};
