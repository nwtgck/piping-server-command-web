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
    const [textFieldRows, setTextFieldRows] = useState(1);
    const [e2ee, setE2ee] = useState<'none' | 'openssl' | 'gpg'>('none');
    const [opensslCipherAlgorithm, setOpensslCipherAlgorithm] = useState('aes-256-cbc');
    const url = urlJoin(pipingServerUrl, `myfile${randomString}`);
    const filePath = `myfile`;
    const senderCommand = (() => {
      switch (e2ee) {
        case "none":
          return `curl -T ${filePath} ${url}`;
        case "openssl":
          return `cat ${filePath} | openssl ${opensslCipherAlgorithm} -pbkdf2 | curl -T - ${url}`;
        case "gpg":
          return `export GPG_TTY=$(tty);\ncat ${filePath} | gpg -c | curl -T - ${url}`;
      }
    })();
    const receiverCommand = (() => {
      switch (e2ee) {
        case "none":
          return `curl ${url} > ${filePath}`;
        case "openssl":
          return `curl -sS ${url} | openssl ${opensslCipherAlgorithm} -d -pbkdf2`;
        case "gpg":
          return `export GPG_TTY=$(tty);\ncurl -sS ${url} | gpg -d`;
      }
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
                { label: 'none', value: 'none' },
                { label: 'openssl', value: 'openssl' },
                { label: 'gpg', value: 'gpg' },
              ]
            }
          />
        </Grid>
      </Grid>
    )
  }
};
