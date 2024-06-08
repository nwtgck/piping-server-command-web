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
import {generateShellSafePassword, type ReactState} from "@/utils";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";

export const sshfs = {
  title: "SSHFS",
  searchTags: ["sshfs", "sftp", "e2ee", "end-to-end", "encryption"],
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
    const [e2ee, setE2ee] = useState<'none' | 'openssl'>('none');
    const [opensslPass, setOpensslPass] = useState(generateShellSafePassword(20));
    const [opensslPassIsVisible, setOpensslPassIsVisible] = useState(true);

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

    // TODO: duplicate
    const encryptIfNeed: [] | [string] = (() => {
      switch (e2ee) {
        case "none":
          return [];
        case "openssl":
          return [ `stdbuf -i0 -o0 openssl aes-256-ctr -pass "pass:${opensslPass}" -bufsize 1 -pbkdf2` ];
      }
    })();

    // TODO: duplicate
    const decryptIfNeed: [] | [string] = (() => {
      switch (e2ee) {
        case "none":
          return [];
        case "openssl":
          return [ `stdbuf -i0 -o0 openssl aes-256-ctr -d -pass "pass:${opensslPass}" -bufsize 1 -pbkdf2` ];
      }
    })();

    const sharerCommand = [
      `curl -sSN ${urlJoin(pipingServerUrl, path1)}`,
      ...decryptIfNeed,
      [sftpServerCommand, ...(sftpReadonly ? ["-R"] : [])].join(" "),
      ...encryptIfNeed,
      `curl -sSNT - ${urlJoin(pipingServerUrl, path2)}`,
    ].join(' | ');

    const accessorCommand = [
      `curl -sSN ${urlJoin(pipingServerUrl, path2)}`,
      ...decryptIfNeed,
      `sshfs -o ${[...(sftpReadonly ? ["ro"] : []), "slave"].join(",")} :${sharedDirectoryPath} ${mountDirectoryPath}`,
      ...encryptIfNeed,
      `curl -sSNT - ${urlJoin(pipingServerUrl, path1)}`,
    ].join(' | ');

    return (
      <Grid container spacing={textFieldContainerGridSpacing}>
        <Grid item xs={12}>
          <TextFieldWithCopy
            label="Sharer"
            value={sharerCommand}
            isVisible={opensslPassIsVisible}
            rows={sharerCommand.split("\n").length + (e2ee === 'openssl' ? 2 : 0)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextFieldWithCopy
            label="Accessor"
            value={accessorCommand}
            isVisible={opensslPassIsVisible}
            rows={1 + (e2ee === 'openssl' ? 2 : 0)}
          />
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
          <span style={{marginRight: '1rem'}}/>
          <RadioInput
            label="E2E encryption"
            value={e2ee}
            onChange={(v) => {
              setOpensslPassIsVisible(v !== 'openssl');
              setE2ee(v);
            }}
            selections={
              [
                {label: 'none', value: 'none'},
                {label: 'openssl', value: 'openssl'},
              ]
            }
          />
          {e2ee === "openssl" ?
            <>
              <TextField label="openssl pass" value={opensslPass} type={opensslPassIsVisible ? 'text' : 'password'}
                         onChange={(e) => setOpensslPass(e.target.value)}/>
              <IconButton
                style={{marginTop: '0.5rem'}}
                aria-label="mask or unmask openssl pass"
                onClick={() => setOpensslPassIsVisible(!opensslPassIsVisible)}
                edge="end">
                {opensslPassIsVisible ? <VisibilityIcon/> : <VisibilityOffIcon/>}
              </IconButton>
            </>
            : undefined
          }
        </Grid>
      </Grid>
    )
  }
};
