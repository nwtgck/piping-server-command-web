import * as React from "react";
import {FormControl, FormControlLabel, FormLabel, Radio, RadioGroup} from "@material-ui/core";

export function RadioInput<T extends string>(props: { value: T, onChange: (v: T) => void, label: string, style?: React.CSSProperties, selections: readonly {value: T, label: string}[]}) {
  return (
    <FormControl style={props.style}>
      <FormLabel>{props.label}</FormLabel>
      <RadioGroup row aria-label="position" name="position" value={props.value} onChange={(e) => props.onChange(e.target.value as T)}>
        {
          props.selections.map((selection, i) =>
            <FormControlLabel value={selection.value} control={<Radio color="primary" />} label={selection.label} key={i} />
          )
        }
      </RadioGroup>
    </FormControl>
  )
}
