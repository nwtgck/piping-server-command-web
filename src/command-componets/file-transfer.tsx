import * as React from "react";
import urlJoin from "url-join";
import {Grid} from "@material-ui/core";
import {TextFieldWithCopy} from "@/TextFieldWithCopy";
import {textFieldContainerGridSpacing} from "./share";

export const fileTransfer = {
  title: 'File transfer',
  searchTags: [],
  component: ({pipingServerUrl}: {pipingServerUrl: string}) => {
    const senderCommand = `curl -T myfile ${urlJoin(pipingServerUrl, "myfile")}`;
    const receiverCommand = `curl ${urlJoin(pipingServerUrl, "myfile")} > myfile`;
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
