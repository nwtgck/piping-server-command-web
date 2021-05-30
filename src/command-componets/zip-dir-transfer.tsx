import * as React from "react";
import urlJoin from "url-join";
import {Grid} from "@material-ui/core";
import {TextFieldWithCopy} from "../TextFieldWithCopy";
import {textFieldContainerGridSpacing} from "./share";

export const zipDirTransfer = {
  title: 'Directory transfer (zip)',
  searchTags: ['folder'],
  component: ({pipingServerUrl}: {pipingServerUrl: string}) => {
    const senderCommand = `zip -r - . | curl -T - ${urlJoin(pipingServerUrl, "mydir.zip")}`;
    const receiverCommand = `curl ${urlJoin(pipingServerUrl, "mydir.zip")} > mydir.zip`; // TODO: extract
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
