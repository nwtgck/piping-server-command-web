import * as React from "react";
import {useState} from "react";
import clipboardCopy from "clipboard-copy";
import {FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Tooltip} from "@material-ui/core";
import FileCopyIcon from "@material-ui/icons/FileCopy";

export function TextFieldWithCopy(props: {label: string, value: string, isVisible?: boolean, rows: number, style?: React.CSSProperties}) {
  const [copyTooltipOpen, setCopyTooltipOpen] = useState(false);

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
        type={(props.isVisible ?? true) ? 'text' : 'password'}
        value={props.value}
        multiline={props.isVisible ?? true}
        rows={props.rows}
        endAdornment={
          <InputAdornment position="end">
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
