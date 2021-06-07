import type {ReactState} from "@/utils";
import {RadioInput} from "@/RadioInput";
import * as React from "react";

export function generalE2eeCommandsAndElement(params: {e2eeState: ReactState<'openssl' | 'gpg'>, opensslCipherAlgorithmState: ReactState<'aes-256-cbc'>}): { e2eePrepend: string, e2eeEncryptCommand: string, e2eeDecryptCommand: string, e2eeSelectionElement: JSX.Element } {
  const [e2ee, setE2ee] = params.e2eeState;
  const [opensslCipherAlgorithm, setOpensslCipherAlgorithm] = params.opensslCipherAlgorithmState;
  const e2eeEncryptCommand = (() => {
    switch (e2ee) {
      case "openssl": return `openssl ${opensslCipherAlgorithm} -pbkdf2`;
      case "gpg": return `gpg -c`;
    }
  })();
  const e2eeDecryptCommand = (() => {
    switch (e2ee) {
      case "openssl": return `openssl ${opensslCipherAlgorithm} -d -pbkdf2`;
      case "gpg": return `gpg -d`;
    }
  })();
  const e2eeSelectionElement = (
    <RadioInput
      label="E2E encryption"
      value={e2ee}
      onChange={setE2ee}
      selections={
        [
          { label: 'openssl', value: 'openssl' },
          { label: 'gpg', value: 'gpg' },
        ]
      }
      style={{marginRight: '1rem'}}
    />
  );
  return {
    e2eePrepend: e2ee === "gpg" ? `export GPG_TTY=$(tty);\n` : "",
    e2eeEncryptCommand,
    e2eeDecryptCommand,
    e2eeSelectionElement,
  };
}
