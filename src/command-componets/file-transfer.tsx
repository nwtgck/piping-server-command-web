import * as React from "react";
import {useState} from "react";
import urlJoin from "url-join";
import Grid from "@material-ui/core/Grid";
import {TextFieldWithCopy} from "@/TextFieldWithCopy";
import {textFieldContainerGridSpacing} from "./share";
import {RadioInput} from "@/RadioInput";

export const fileTransfer = {
  title: 'File transfer',
  searchTags: [],
  component: ({pipingServerUrl, randomString}: {pipingServerUrl: string, randomString: string}) => {
    const [e2ee, setE2ee] = useState<'none' | 'openssl'>('none');
    const [opensslCipherAlgorithm, setOpensslCipherAlgorithm] = useState('aes-256-cbc');
    const url = urlJoin(pipingServerUrl, `myfile${randomString}`);
    const filePath = `myfile`;
    const senderCommand = (() => {
      switch (e2ee) {
        case "none":
          return `curl -T ${filePath} ${url}`;
        case "openssl":
          return `cat ${filePath} | openssl ${opensslCipherAlgorithm} -pbkdf2 | curl -T - ${url}`;
      }
    })();
    const receiverCommand = (() => {
      switch (e2ee) {
        case "none":
          return `curl ${url} > ${filePath}`;
        case "openssl":
          return `curl -sS ${url} | openssl ${opensslCipherAlgorithm} -d -pbkdf2`;
      }
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
            label="E2E encryption"
            value={e2ee}
            onChange={setE2ee}
            selections={
              [
                { label: 'none', value: 'none' },
                { label: 'openssl', value: 'openssl' },
              ]
            }
          />
        </Grid>
      </Grid>
    )
  }
};
