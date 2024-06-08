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
import type {ReactState} from "@/utils";
import TextField from "@material-ui/core/TextField";

export const sshfs = {
  title: "SSHFS",
  searchTags: ["sshfs", "sftp"],
  component: ({pipingServerUrl, path1State, path2State}: {
    pipingServerUrl: string,
    path1State: ReactState<string>,
    path2State: ReactState<string>,
  }) => {
    const [path1, setPath1] = path1State;
    const [path2, setPath2] = path2State;
    const [sftpReadonly, setSftpReadonly] = useState(false);
    const [sharedDirectoryPath, setSharedDirectoryPath] = useState("/");
    const [mountDirectoryPath, setMountDirectoryPath] = useState("~/my_mount");
    const [sharerOs, setSharerOs] = useState<"linux" | "macos">("linux");
    const [usesMacSandbox, setUsesMacSandbox] = useState(false);

    const macOsSftpServer = "/usr/libexec/sftp-server";
    const sftpServerCommand = (() => {
      switch (sharerOs) {
        case "linux":
          return "/usr/lib/openssh/sftp-server";
        case "macos":
          if (!usesMacSandbox) {
            return macOsSftpServer;
          }
          return `\
sandbox-exec -p '
  (version 1)
  (deny default)
  (allow process-exec (literal "${macOsSftpServer}"))
  (allow file-read-data (literal "/") (literal "/dev/null"))
  (allow file-write-data (literal "/dev/null"))
  (allow mach-lookup (global-name "com.apple.system.opendirectoryd.libinfo"))
  
  ; user settings
  (allow file-read* (subpath "${sharedDirectoryPath}"))${sftpReadonly ? "" : `
  (allow file-write* (subpath "${sharedDirectoryPath}"))`}
 ' ${macOsSftpServer}`;
      }
    })();

    const sharerCommand = [
      `curl -sSN ${urlJoin(pipingServerUrl, path1)}`,
      [sftpServerCommand, ...(sftpReadonly ? ["-R"] : [])].join(" "),
      `curl -sSNT - ${urlJoin(pipingServerUrl, path2)}`,
    ].join(' | ');

    const accessorCommand = [
      `curl -sSN ${urlJoin(pipingServerUrl, path2)}`,
      `sshfs -o ${[...(sftpReadonly ? ["ro"] : []), "slave"].join(",")} :${sharedDirectoryPath} ${mountDirectoryPath}`,
      `curl -sSNT - ${urlJoin(pipingServerUrl, path1)}`,
    ].join(' | ');

    return (
      <Grid container spacing={textFieldContainerGridSpacing}>
        <Grid item xs={12}>
          <TextFieldWithCopy label="Sharer" value={sharerCommand} rows={sharerCommand.split("\n").length}/>
        </Grid>
        <Grid item xs={12}>
          <TextFieldWithCopy label="Accessor" value={accessorCommand} rows={1}/>
        </Grid>
        <Grid item xs={12}>
          <TextField label="path1" value={path1} onChange={(e) => setPath1(e.target.value)}
                     style={{marginRight: '0.5rem'}}/>
          <TextField label="path2" value={path2} onChange={(e) => setPath2(e.target.value)}/>
          <span style={{marginRight: '1rem'}}/>
          <TextField label="shared directory" value={sharedDirectoryPath}
                     onChange={(e) => setSharedDirectoryPath(e.target.value)} style={{marginRight: '0.5rem'}}/>
          <TextField label="mount point" value={mountDirectoryPath}
                     onChange={(e) => setMountDirectoryPath(e.target.value)}/>
        </Grid>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">read-only</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sftpReadonly}
                    onChange={(e) => setSftpReadonly(e.target.checked)}
                    color="primary"
                  />}
                label="enable"/>
            </FormGroup>
          </FormControl>
          <span style={{marginRight: '1rem'}}/>
          <RadioInput
            label="sharer OS"
            value={sharerOs}
            onChange={setSharerOs}
            selections={
              [
                {label: 'Linux', value: 'linux'},
                {label: 'macOS', value: 'macos'},
              ]
            }
            style={{marginRight: '1rem'}}
          />
          <FormControl component="fieldset">
            <FormLabel component="legend">macOS sandbox</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={usesMacSandbox}
                    onChange={(e) => setUsesMacSandbox(e.target.checked)}
                    color="primary"
                    disabled={sharerOs !== "macos"}
                  />}
                label="enable"/>
            </FormGroup>
          </FormControl>
        </Grid>
      </Grid>
    )
  }
};
