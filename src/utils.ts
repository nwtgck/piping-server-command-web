import type {Dispatch, SetStateAction} from "react";

export type ReactState<S> = [S, Dispatch<SetStateAction<S>>]
