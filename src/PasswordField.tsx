import * as React from "react";
import {useState} from "react";
import {FormControl, IconButton, InputAdornment, InputLabel, Input} from "@material-ui/core";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";

export function PasswordField(props: {label: string, value: string, onChange: (s: string) => void, style?: React.CSSProperties}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    // (base: https://material-ui.com/components/text-fields/#input-adornments)
    <FormControl style={props.style}>
      <InputLabel>{props.label}</InputLabel>
      <Input
        type={isVisible ? 'text' : 'password'}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="mask or unmask password"
              onClick={() => setIsVisible(!isVisible)}
              edge="end">
              { isVisible ? <VisibilityIcon /> : <VisibilityOffIcon /> }
            </IconButton>
          </InputAdornment>
        }
      />
    </FormControl>
  )
}
