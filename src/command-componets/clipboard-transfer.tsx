import * as React from "react";
import urlJoin from "url-join";
import Grid from "@material-ui/core/Grid";
import {TextFieldWithCopy} from "@/TextFieldWithCopy";
import {textFieldContainerGridSpacing} from "./share";

export const clipboardTransfer = {
  title: 'Copy & Paste (macOS)',
  searchTags: ['clipboard'],
  component: ({pipingServerUrl, randomString}: {pipingServerUrl: string, randomString: string}) => {
    const senderCommand = `pbpaste | curl -T - ${urlJoin(pipingServerUrl, `clip${randomString}`)}`;
    const receiverCommand = `curl ${urlJoin(pipingServerUrl, `clip${randomString}`)} | pbcopy`;
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
