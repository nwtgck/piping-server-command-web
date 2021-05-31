import type {Dispatch, SetStateAction, DependencyList} from "react";
import {useEffect, useState} from "react";

export type ReactState<S> = [S, Dispatch<SetStateAction<S>>]

// Initial state: getValue()
// Update state when deps changed
// NOTE: Does this exist in standard?
export function useWatchingUpdate<T>(getValue: () => T, deps: DependencyList): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(getValue());
  useEffect(() => {
    setValue(getValue())
  }, deps);
  return [value, setValue];
}
