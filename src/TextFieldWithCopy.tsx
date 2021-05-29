import * as React from "react";
import {useState} from "react";
import clipboardCopy from "clipboard-copy";
import {FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Tooltip} from "@material-ui/core";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";

export function TextFieldWithCopy(props: {label: string, value: string, type?: string, rows: number, style?: React.CSSProperties}) {
  const [copyTooltipOpen, setCopyTooltipOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const copyButtonClicked = async () => {
    setCopyTooltipOpen(true);
    await clipboardCopy(props.value);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCopyTooltipOpen(false);
  };

  return (
    // (base: https://material-ui.com/components/text-fields/#input-adornments)
    <FormControl variant="outlined" style={props.style} fullWidth>
      <InputLabel>{props.label}</InputLabel>
      <OutlinedInput
        type={isVisible ? 'text' : props.type ?? 'text'}
        value={props.value}
        multiline={isVisible || props.type !== 'password'}
        rows={props.rows}
        endAdornment={
          <InputAdornment position="end">
            { props.type === 'password' ?
              <IconButton
                aria-label="mask or unmask"
                onClick={() => setIsVisible(!isVisible)}
                edge="end">
                { isVisible ? <VisibilityIcon /> : <VisibilityOffIcon /> }
              </IconButton>
            : undefined }

            {/* base: https://material-ui.com/components/tooltips/#triggers */}
            <Tooltip
              PopperProps={{disablePortal: true}}
              open={copyTooltipOpen}
              disableFocusListener
              disableHoverListener
              disableTouchListener
              title="Copied">
              <IconButton
                aria-label="copy text to the clipboard"
                onClick={copyButtonClicked}
                edge="end">
                <FileCopyIcon />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        }
        labelWidth={70}
      />
    </FormControl>
  )
}
