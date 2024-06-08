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

export function generateShellSafePassword(passwordLen: number): string {
  const alphas  = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
  const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const chars   = [...alphas, ...numbers, ];
  const randomArr = window.crypto.getRandomValues(new Uint32Array(passwordLen));
  return Array.from(randomArr).map(n => chars[n % chars.length]).join('');
}
