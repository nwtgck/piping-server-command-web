import * as React from "react";
import {useState} from "react";
import urlJoin from "url-join";
import {Grid} from "@material-ui/core";
import {TextFieldWithCopy} from "../TextFieldWithCopy";
import {RadioInput} from "../RadioInput";
import {textFieldContainerGridSpacing} from "./share";

export const tarDirTransfer = {
  title: 'Directory transfer (tar)',
  searchTags: ['folder', 'tar.gz', 'gzip'],
  component: ({pipingServerUrl}: {pipingServerUrl: string}) => {
    const [tarOrTargz, setTarOrTargz] = useState<'tar' | "tar.gz">('tar');

    const senderCommand = `tar ${tarOrTargz === 'tar' ? 'c' : 'cz'} . | curl -T - ${urlJoin(pipingServerUrl, `mydir.${tarOrTargz}`)}`;
    const receiverCommand = `curl ${urlJoin(pipingServerUrl, `mydir.${tarOrTargz}`)} | tar x`;

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
